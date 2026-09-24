const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'visual-audit', 'hotfix-verification');
fs.mkdirSync(outputDir, { recursive: true });

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
  console.log('--- INICIANDO AUDITORIA COMPLETA DE REGRESSÃO PÓS-HOTFIX ---');
  
  const server = spawn(process.execPath, ['dist/main.js'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer('http://localhost:3000/health');
    console.log('[OK] Servidor rodando em http://localhost:3000');

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });

    const scenarios = [
      // 1. Dashboard Tests (Dark/Light, 1600x900/1366x768, Expanded/Collapsed)
      { page: 'dashboard.html', name: 'dashboard-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'dashboard.html', name: 'dashboard-light-1600x900', theme: 'light', width: 1600, height: 900, collapsed: false },
      { page: 'dashboard.html', name: 'dashboard-dark-1366x768', theme: 'dark', width: 1366, height: 768, collapsed: false },
      { page: 'dashboard.html', name: 'dashboard-light-1366x768', theme: 'light', width: 1366, height: 768, collapsed: false },
      { page: 'dashboard.html', name: 'dashboard-sidebar-collapsed-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: true },
      
      // 2. Core Functional Pages
      { page: 'solicitacoes.html', name: 'solicitacoes-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'solicitacao-nova.html', name: 'solicitacao-nova-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'viagens.html', name: 'viagens-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'mobilidade.html', name: 'mobilidade-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'correios.html', name: 'correios-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'xerox.html', name: 'xerox-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'aprovacoes.html', name: 'aprovacoes-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'atendimentos.html', name: 'atendimentos-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'financeiro.html', name: 'financeiro-dark-1600x900', role: 'gestor', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'conhecimento.html', name: 'conhecimento-dark-1600x900', role: 'colaborador', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'administracao.html', name: 'administracao-dark-1600x900', role: 'administrador', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'fornecedores.html', name: 'fornecedores-dark-1600x900', role: 'colaborador', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'relatorios.html', name: 'relatorios-dark-1600x900', role: 'gestor', theme: 'dark', width: 1600, height: 900, collapsed: false },

      // 3. New Service Pages
      { page: 'entregas.html', name: 'entregas-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'estacionamento.html', name: 'estacionamento-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'achados-perdidos.html', name: 'achados-perdidos-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'acessos.html', name: 'acessos-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'investigacao-ocorrencia.html', name: 'investigacao-ocorrencia-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false },
      { page: 'transporte.html', name: 'transporte-dark-1600x900', theme: 'dark', width: 1600, height: 900, collapsed: false }
    ];

    const results = [];

    for (const sc of scenarios) {
      const context = await browser.newContext({
        viewport: { width: sc.width, height: sc.height }
      });

      await context.addInitScript(({ theme, collapsed, role }) => {
        const activeRole = role || 'colaborador';
        localStorage.setItem('cs360_active_role', activeRole);
        localStorage.setItem('cs360_active_perspective', activeRole === 'gestor' ? 'gestor' : 'colaborador');
        localStorage.setItem('cs360_theme', theme);
        localStorage.setItem('cs360_sidebar_collapsed', String(collapsed));
        localStorage.setItem('cs360_demo_mode', 'true');
      }, sc);

      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });

      const url = `http://localhost:3000/${sc.page}`;
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(300);

      const check = await page.evaluate(() => {
        const root = document.documentElement;
        const sidebar = document.querySelector('.app-sidebar');
        const topbar = document.querySelector('.app-topbar');
        const main = document.querySelector('.app-main');
        const hasOverflow = root.scrollWidth > root.clientWidth;

        return {
          sidebarPresent: !!sidebar,
          topbarPresent: !!topbar,
          mainPresent: !!main,
          hasOverflow,
          sidebarWidth: sidebar ? window.getComputedStyle(sidebar).width : null,
          topbarHeight: topbar ? window.getComputedStyle(topbar).height : null
        };
      });

      const shotPath = path.join(outputDir, `${sc.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      const status = check.sidebarPresent && check.topbarPresent && check.mainPresent && !check.hasOverflow && consoleErrors.length === 0 ? 'PASS' : 'FAIL';
      console.log(`[${status}] ${sc.name} - Sidebar: ${check.sidebarPresent} (${check.sidebarWidth}) | Topbar: ${check.topbarPresent} (${check.topbarHeight}) | Overflow: ${check.hasOverflow} | Erros: ${consoleErrors.length}`);

      results.push({
        name: sc.name,
        page: sc.page,
        status,
        sidebar: check.sidebarPresent,
        topbar: check.topbarPresent,
        overflowOk: !check.hasOverflow,
        errors: consoleErrors.length,
        file: shotPath
      });

      await context.close();
    }

    await browser.close();

    console.log('\n--- RESUMO DA VERIFICAÇÃO ---');
    console.table(results.map(r => ({
      Cenário: r.name,
      Status: r.status,
      Sidebar: r.sidebar ? 'OK' : 'FAIL',
      Topbar: r.topbar ? 'OK' : 'FAIL',
      'Overflow OK': r.overflowOk ? 'SIM' : 'NÃO',
      Erros: r.errors
    })));

    const allPassed = results.every(r => r.status === 'PASS');
    console.log(`\nResultado Geral: ${allPassed ? 'TODOS OS 24 CENÁRIOS PASSARAM COM SUCESSO!' : 'FALHAS DETECTADAS!'}`);

  } finally {
    server.kill();
  }
})();
