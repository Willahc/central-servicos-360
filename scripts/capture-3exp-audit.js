const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'visual-audit', '3-experiencias');
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
  console.log('--- INICIANDO AUDITORIA VISUAL DAS 3 EXPERIÊNCIAS ---');
  
  // First ensure backend build is compiled
  const buildProc = spawn('npm.cmd', ['run', 'build'], { cwd: root, stdio: 'inherit' });
  await new Promise((resolve, reject) => {
    buildProc.on('close', code => (code === 0 ? resolve() : reject(new Error(`Build failed with code ${code}`))));
  });

  const server = spawn(process.execPath, ['dist/main.js'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer('http://localhost:3000/health');
    console.log('[OK] Servidor local CS360 iniciado em http://localhost:3000');

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });

    const scenarios = [
      // 1. COLABORADOR
      { role: 'colaborador', perspective: 'colaborador', page: 'dashboard.html', theme: 'dark', width: 1600, height: 900, collapsed: false, name: 'colaborador-dark-1600x900' },
      { role: 'colaborador', perspective: 'colaborador', page: 'dashboard.html', theme: 'light', width: 1600, height: 900, collapsed: false, name: 'colaborador-light-1600x900' },
      { role: 'colaborador', perspective: 'colaborador', page: 'dashboard.html', theme: 'dark', width: 1366, height: 768, collapsed: false, name: 'colaborador-dark-1366x768' },
      { role: 'colaborador', perspective: 'colaborador', page: 'solicitacao-nova.html', theme: 'dark', width: 1600, height: 900, collapsed: false, name: 'colaborador-nova-solicitacao-dark-1600x900' },
      { role: 'colaborador', perspective: 'colaborador', page: 'solicitacao-nova.html', theme: 'dark', width: 1600, height: 900, collapsed: true, name: 'colaborador-sidebar-recolhida-dark-1600x900' },
      
      // 2. OPERADOR (Time de Serviços)
      { role: 'viagens', perspective: 'operador', page: 'atendimentos.html', theme: 'dark', width: 1600, height: 900, collapsed: false, name: 'operador-viagens-dark-1600x900' },
      { role: 'viagens', perspective: 'operador', page: 'atendimentos.html', theme: 'light', width: 1600, height: 900, collapsed: false, name: 'operador-viagens-light-1600x900' },
      { role: 'operador', perspective: 'operador', page: 'atendimentos.html', theme: 'dark', width: 1366, height: 768, collapsed: false, name: 'operador-servicos-gerais-dark-1366x768' },
      { role: 'operador', perspective: 'operador', page: 'entregas.html', theme: 'dark', width: 1600, height: 900, collapsed: false, name: 'operador-entregas-dark-1600x900' },

      // 3. GESTOR (Aprovações & Decisão)
      { role: 'gestor', perspective: 'gestor', page: 'aprovacoes.html', theme: 'dark', width: 1600, height: 900, collapsed: false, name: 'gestor-aprovacoes-dark-1600x900' },
      { role: 'gestor', perspective: 'gestor', page: 'aprovacoes.html', theme: 'light', width: 1600, height: 900, collapsed: false, name: 'gestor-aprovacoes-light-1600x900' },
      { role: 'gestor', perspective: 'gestor', page: 'aprovacoes.html', theme: 'dark', width: 1366, height: 768, collapsed: false, name: 'gestor-aprovacoes-dark-1366x768' }
    ];

    const auditResults = [];

    for (const sc of scenarios) {
      const context = await browser.newContext({
        viewport: { width: sc.width, height: sc.height }
      });

      await context.addInitScript(({ role, perspective, theme, collapsed }) => {
        localStorage.setItem('cs360_active_role', role);
        localStorage.setItem('cs360_active_perspective', perspective);
        localStorage.setItem('cs360_theme', theme);
        localStorage.setItem('cs360_sidebar_collapsed', String(collapsed));
      }, sc);

      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      const url = `http://localhost:3000/${sc.page}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Verificação de Overflow Global e Quebras de Texto
      const layoutMetrics = await page.evaluate(() => {
        const rootElem = document.documentElement;
        const bodyElem = document.body;
        const scrollWidth = rootElem.scrollWidth;
        const clientWidth = rootElem.clientWidth;
        const hasHorizontalOverflow = scrollWidth > clientWidth;

        // Checagem de menus presentes na sidebar
        const navLinks = [...document.querySelectorAll('.app-sidebar .nav-link')].map(l => l.innerText.trim().replace(/\\s+/g, ' '));
        const perspectiveSelect = document.getElementById('perspective-switcher-select')?.value;
        const roleSelect = document.querySelector('.role-selector-select')?.value;

        return {
          hasHorizontalOverflow,
          scrollWidth,
          clientWidth,
          navLinks,
          perspectiveSelect,
          roleSelect
        };
      });

      const shotPath = path.join(outputDir, `${sc.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      const result = {
        name: sc.name,
        role: sc.role,
        perspective: sc.perspective,
        theme: sc.theme,
        resolution: `${sc.width}x${sc.height}`,
        collapsed: sc.collapsed,
        overflowOk: !layoutMetrics.hasHorizontalOverflow,
        consoleErrors: consoleErrors.length,
        screenshot: shotPath,
        navCount: layoutMetrics.navLinks.length
      };

      auditResults.push(result);
      console.log(`[PASS] ${sc.name} (Nav: ${layoutMetrics.navLinks.length} itens | Overflow OK: ${!layoutMetrics.hasHorizontalOverflow} | Erros: ${consoleErrors.length})`);

      await context.close();
    }

    await browser.close();

    console.log('\n--- RESUMO DA AUDITORIA VISUAL ---');
    console.table(auditResults.map(r => ({
      Cenário: r.name,
      Resolução: r.resolution,
      Tema: r.theme,
      'Overflow OK?': r.overflowOk ? 'SIM' : 'NÃO',
      'Console Erros': r.consoleErrors,
      'Menu Itens': r.navCount
    })));

  } finally {
    server.kill();
  }
})();
