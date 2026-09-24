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

    const pages = [
      'dashboard.html',
      'financeiro.html',
      'relatorios.html',
      'entregas.html',
      'estacionamento.html',
      'achados-perdidos.html',
      'acessos.html',
      'investigacao-ocorrencia.html',
      'transporte.html'
    ];

    for (const p of pages) {
      const context = await browser.newContext();
      await context.addInitScript(() => {
        localStorage.setItem('cs360_active_role', 'colaborador');
      });
      const page = await context.newPage();
      const errs = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errs.push(`[CONSOLE.ERROR] ${msg.text()}`);
      });
      page.on('pageerror', err => {
        errs.push(`[PAGE ERROR] ${err.message}\n${err.stack}`);
      });
      await page.goto(`http://localhost:3000/${p}`, { waitUntil: 'load' });
      await page.waitForTimeout(400);

      console.log(`\n=== ERROS EM ${p} ===`);
      if (errs.length === 0) console.log('Zero erros.');
      else errs.forEach(e => console.log(e));
      await context.close();
    }

    await browser.close();
  } finally {
    server.kill();
  }
})();
