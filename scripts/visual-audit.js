const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'visual-audit');
const availablePages = fs.readdirSync(path.join(root, 'prototype'))
  .filter(name => name.endsWith('.html'))
  .sort();
const pages = process.env.AUDIT_PAGES
  ? process.env.AUDIT_PAGES.split(',').map(name => name.trim()).filter(Boolean)
  : availablePages;

const availableViewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];
const viewports = process.env.AUDIT_VIEWPORTS
  ? availableViewports.filter(viewport => process.env.AUDIT_VIEWPORTS.split(',').includes(viewport.name))
  : availableViewports;

function waitForServer(url, timeout = 15000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      fetch(url).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        resolve();
      }).catch(error => {
        if (Date.now() - started >= timeout) reject(error);
        else setTimeout(probe, 250);
      });
    };
    probe();
  });
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const server = spawn(process.execPath, ['dist/main.js'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer('http://localhost:3000/health');
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
    const results = [];

    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(() => {
        localStorage.setItem('cs360_active_role', 'administrador');
        localStorage.setItem('cs360_theme', 'light');
      });

      for (const pageName of pages) {
        const page = await context.newPage();
        const consoleErrors = [];
        const requestErrors = [];
        page.on('console', message => {
          if (message.type() === 'error') consoleErrors.push(message.text());
        });
        page.on('pageerror', error => consoleErrors.push(error.message));
        page.on('requestfailed', request => requestErrors.push(`${request.url()}: ${request.failure()?.errorText}`));

        const response = await page.goto(`http://localhost:3000/${pageName}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(350);
        const metrics = await page.evaluate(() => ({
          title: document.title,
          bodyTextLength: document.body.innerText.trim().length,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          overflowX: [...document.querySelectorAll('body *')].some(element => {
            const rect = element.getBoundingClientRect();
            if (rect.right <= document.documentElement.clientWidth + 2) return false;
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
              const overflow = getComputedStyle(parent).overflowX;
              if (overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden') return false;
              parent = parent.parentElement;
            }
            return true;
          }),
          visibleModals: [...document.querySelectorAll('.modal-overlay')].filter(el => {
            const style = getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          }).length,
          layoutPresent: Boolean(document.querySelector('.app-sidebar, .app-layout, #app-layout-root')),
          mainBounds: (() => {
            const main = document.querySelector('main');
            if (!main) return null;
            const rect = main.getBoundingClientRect();
            return { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
          })(),
          overflowingElements: [...document.querySelectorAll('body *')].map(element => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id,
              classes: element.className && typeof element.className === 'string' ? element.className : '',
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            };
          }).filter(item => item.right > document.documentElement.clientWidth + 2).slice(0, 20)
        }));

        await page.screenshot({
          path: path.join(outputDir, `${pageName.replace('.html', '')}-${viewport.name}.png`),
          fullPage: true
        });
        results.push({ page: pageName, viewport: viewport.name, status: response?.status(), ...metrics, consoleErrors, requestErrors });
        await page.close();
      }
      await context.close();
    }

    await browser.close();
    fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(results, null, 2));
    const failures = results.filter(item => item.status !== 200 || item.overflowX || item.consoleErrors.length || item.requestErrors.length || item.bodyTextLength < 20);
    console.log(JSON.stringify({ pages: results.length, failures }, null, 2));
  } finally {
    server.kill();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
