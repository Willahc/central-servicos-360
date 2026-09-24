const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'visual-audit', 'portal-colaborador');
fs.mkdirSync(out, { recursive: true });

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch('http://localhost:3000/health')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Servidor indisponível');
}

(async () => {
  const server = spawn(process.execPath, ['node_modules/ts-node/dist/bin.js', 'src/main.ts'], { cwd: root, stdio: 'ignore' });
  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    const cases = [
      ['portal-colaborador-dark-1600x900.png', 'dark', 1600, 900],
      ['portal-colaborador-light-1600x900.png', 'light', 1600, 900],
      ['portal-colaborador-dark-1366x768.png', 'dark', 1366, 768],
      ['portal-colaborador-mobile-dark.png', 'dark', 390, 844]
    ];
    const report = [];
    for (const [file, theme, width, height] of cases) {
      const context = await browser.newContext({ viewport: { width, height } });
      await context.addInitScript(value => localStorage.setItem('cs360_theme', value), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://localhost:3000/portal-colaborador.html', { waitUntil: 'networkidle' });
      await page.waitForFunction(() => !document.querySelector('#request-total').textContent.includes('—'));
      const checks = await page.evaluate(() => {
        const numbers = [...document.querySelectorAll('.stat strong')].map(node => Number(node.textContent));
        return {
          profile: document.querySelector('#profile-name').textContent === 'Colaborador Demo',
          lockedFields: document.querySelectorAll('.profile-item [title="Preenchido automaticamente"]').length === 7,
          kpiTotal: numbers.reduce((sum, value) => sum + value, 0) === Number(document.querySelector('#request-total').textContent.match(/\d+/)?.[0]),
          investigationDisabled: !document.querySelector('[data-catalog-service="investigacao_ocorrencia"] a') && Boolean(document.querySelector('[data-catalog-service="investigacao_ocorrencia"] .disabled-action')),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          theme: document.documentElement.dataset.theme
        };
      });
      await page.fill('#service-search', 'impressão');
      checks.search = await page.locator('[data-catalog-service="xerox"]').isVisible() && await page.locator('.service-card').count() === 1;
      await page.fill('#service-search', '');
      await page.locator('[data-status-group="approval"]').click();
      checks.kpiNavigation = await page.locator('#view-requests').isVisible() && await page.locator('.request-row').count() > 0;
      await page.goto('http://localhost:3000/portal-colaborador.html', { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(out, file), fullPage: false });
      report.push({ file, ...checks, errors });
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('cs360_theme', 'dark'));
    const page = await context.newPage();
    const assistantErrors = [];
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('ERR_FAILED')) assistantErrors.push(message.text()); });
    page.on('pageerror', error => assistantErrors.push(error.message));
    await page.goto('http://localhost:3000/portal-colaborador.html', { waitUntil: 'networkidle' });
    await page.locator('#assistant-inline').click();
    const assistantContext = await page.locator('#assistant').evaluate(node => ({ role: node.dataset.role, currentPage: node.dataset.currentPage, currentService: node.dataset.currentService }));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(out, 'portal-colaborador-assistente-dark.png'), fullPage: false });

    await page.route('**/api/requests', route => route.abort());
    await page.reload({ waitUntil: 'networkidle' });
    const offlineHandled = await page.locator('.error-state').isVisible();
    report.push({ file: 'portal-colaborador-assistente-dark.png', assistantContext, offlineHandled, errors: assistantErrors });
    await context.close();
    await browser.close();
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (report.some(item => item.errors.length || item.overflow || item.profile === false || item.lockedFields === false || item.kpiTotal === false || item.investigationDisabled === false || item.search === false || item.kpiNavigation === false || item.offlineHandled === false)) process.exitCode = 1;
  } finally { server.kill(); }
})().catch(error => { console.error(error); process.exit(1); });
