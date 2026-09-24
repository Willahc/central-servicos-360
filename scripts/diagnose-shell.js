const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

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
  console.log('--- DIAGNÓSTICO DO DASHBOARD & SHELL ---');
  const server = spawn(process.execPath, ['dist/main.js'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer('http://localhost:3000/health');
    console.log('[OK] Servidor rodando');

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 1600, height: 900 }
    });

    const page = await context.newPage();
    const consoleLogs = [];
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('pageerror', err => {
      consoleErrors.push(`[PAGE ERROR] ${err.message}\n${err.stack}`);
    });

    page.on('requestfailed', req => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    page.on('response', resp => {
      if (resp.status() >= 400) {
        failedRequests.push(`${resp.status()} ${resp.url()}`);
      }
    });

    console.log('Navegando para http://localhost:3000/dashboard.html...');
    await page.goto('http://localhost:3000/dashboard.html', { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const domInspection = await page.evaluate(() => {
      const layoutRoot = document.getElementById('app-layout-root');
      const sidebar = document.querySelector('.app-sidebar') || document.getElementById('app-sidebar');
      const topbar = document.querySelector('.app-topbar');
      const appMain = document.querySelector('.app-main');
      const pageContent = document.querySelector('.app-content') || document.getElementById('page-content-slot');
      const kpis = document.querySelectorAll('.kpi-card, .kpi-mini-card');

      const getStyles = (el) => {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          display: cs.display,
          visibility: cs.visibility,
          opacity: cs.opacity,
          width: cs.width,
          height: cs.height,
          position: cs.position,
          overflow: cs.overflow,
          flexDirection: cs.flexDirection,
          gridTemplateColumns: cs.gridTemplateColumns,
          marginLeft: cs.marginLeft,
          zIndex: cs.zIndex
        };
      };

      return {
        bodyClasses: document.body.className,
        bodyDataPage: document.body.getAttribute('data-page'),
        layoutRootExists: !!layoutRoot,
        layoutRootClasses: layoutRoot?.className,
        layoutRootStyles: getStyles(layoutRoot),
        sidebarExists: !!sidebar,
        sidebarInnerHTMLSnippet: sidebar ? sidebar.innerHTML.substring(0, 150) : null,
        sidebarStyles: getStyles(sidebar),
        topbarExists: !!topbar,
        topbarStyles: getStyles(topbar),
        appMainExists: !!appMain,
        appMainStyles: getStyles(appMain),
        pageContentExists: !!pageContent,
        pageContentStyles: getStyles(pageContent),
        kpiCount: kpis.length,
        documentTitle: document.title,
        bodyChildrenTags: Array.from(document.body.children).map(c => `${c.tagName}#${c.id}.${c.className}`),
        outerHTMLSnapshot: document.body.innerHTML.substring(0, 800)
      };
    });

    console.log('\n--- RESULTADOS DO CONSOLE ---');
    if (consoleLogs.length === 0) console.log('Nenhum log no console.');
    else consoleLogs.forEach(l => console.log(l));

    console.log('\n--- ERROS DE REDE / 404 ---');
    if (failedRequests.length === 0) console.log('Nenhum erro de rede encontrado.');
    else failedRequests.forEach(f => console.log(f));

    console.log('\n--- INSPEÇÃO DO DOM & CSS COMPUTADO ---');
    console.log(JSON.stringify(domInspection, null, 2));

    await page.screenshot({ path: path.join(root, 'visual-audit', 'diagnosis-dashboard.png') });
    console.log('\nScreenshot salvo em visual-audit/diagnosis-dashboard.png');

    await browser.close();
  } finally {
    server.kill();
  }
})();
