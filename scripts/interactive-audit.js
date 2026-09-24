const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pages = [
  'dashboard.html', 'solicitacoes.html', 'solicitacao-nova.html', 'viagens.html',
  'mobilidade.html', 'correios.html', 'xerox.html', 'aprovacoes.html',
  'atendimentos.html', 'financeiro.html', 'fornecedores.html', 'relatorios.html',
  'conhecimento.html', 'administracao.html', 'solicitacao-detalhe.html',
  'viagem-detalhe.html'
];
const configurations = [
  { name: 'light-expanded-1920', width: 1920, height: 1080, theme: 'light', collapsed: false },
  { name: 'light-compact-1600', width: 1600, height: 900, theme: 'light', collapsed: true },
  { name: 'dark-expanded-1366', width: 1366, height: 768, theme: 'dark', collapsed: false },
  { name: 'dark-compact-mobile', width: 390, height: 844, theme: 'dark', collapsed: true }
];

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch('http://localhost:3000/health');
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Servidor local não respondeu');
}

(async () => {
  const server = spawn(process.execPath, ['dist/main.js'], { cwd: root, stdio: 'ignore' });
  try {
    await waitForServer();
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
    const results = [];
    const checkedLinks = new Map();

    for (const config of configurations) {
      const context = await browser.newContext({ viewport: { width: config.width, height: config.height } });
      await context.addInitScript(({ theme, collapsed }) => {
        localStorage.setItem('cs360_theme', theme);
        localStorage.setItem('cs360_sidebar_collapsed', String(collapsed));
        localStorage.setItem('cs360_active_role', 'administrador');
      }, config);

      for (const pageName of pages) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        const response = await page.goto(`http://localhost:3000/${pageName}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);

        const audit = await page.evaluate(() => {
          const surfaces = [...document.querySelectorAll('.interactive-card')];
          const invalid = surfaces.filter(element => {
            if (element.matches('a[href],button')) return false;
            return element.getAttribute('role') !== 'button' || element.getAttribute('tabindex') !== '0';
          });
          const overflow = [...document.querySelectorAll('.interactive-card')].filter(element => {
            const rect = element.getBoundingClientRect();
            return rect.right > document.documentElement.clientWidth + 2 || rect.left < -2;
          }).filter(element => {
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
              const overflowX = getComputedStyle(parent).overflowX;
              if (['auto', 'scroll', 'hidden'].includes(overflowX)) return false;
              parent = parent.parentElement;
            }
            return true;
          });
          return {
            theme: document.documentElement.dataset.theme,
            collapsed: document.getElementById('app-layout-root')?.classList.contains('sidebar-collapsed') || false,
            interactive: surfaces.length,
            existingInteractive: document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea').length,
            invalidSemantics: invalid.length,
            overflow: overflow.length,
            links: [...new Set([...document.querySelectorAll('a[href]')].map(link => link.getAttribute('href')).filter(href => href && !href.startsWith('#') && !href.startsWith('javascript:')))]
          };
        });

        for (const href of audit.links) {
          const absolute = new URL(href, `http://localhost:3000/${pageName}`).href;
          if (!checkedLinks.has(absolute)) {
            const linkResponse = await context.request.get(absolute);
            checkedLinks.set(absolute, linkResponse.status());
          }
        }

        const keyboardSurface = page.locator('.interactive-card[role="button"]').first();
        let keyboardActivated = null;
        if (await keyboardSurface.count()) {
          await keyboardSurface.focus();
          await page.keyboard.press('Enter');
          await page.waitForTimeout(80);
          keyboardActivated = errors.length === 0;
        }

        results.push({ page: pageName, configuration: config.name, status: response?.status(), errors, keyboardActivated, ...audit });
        await page.close();
      }
      await context.close();
    }

    await browser.close();
    const brokenLinks = [...checkedLinks.entries()].filter(([, status]) => status >= 400);
    const failures = results.filter(result => result.status !== 200 || result.errors.length || result.invalidSemantics || result.overflow || result.theme !== result.configuration.split('-')[0]);
    const report = {
      pages: pages.length,
      scenarios: results.length,
      interactiveSurfaces: Math.max(...results.map(result => result.interactive)),
      totalSurfaceChecks: results.reduce((sum, result) => sum + result.interactive, 0),
      linksChecked: checkedLinks.size,
      brokenLinks,
      failures,
      results
    };
    const output = path.join(root, 'visual-audit', 'interactive-report.json');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({
      pages: report.pages,
      scenarios: report.scenarios,
      totalSurfaceChecks: report.totalSurfaceChecks,
      linksChecked: report.linksChecked,
      brokenLinks: report.brokenLinks,
      failures: report.failures
    }, null, 2));
    if (brokenLinks.length || failures.length) process.exitCode = 1;
  } finally {
    server.kill();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
