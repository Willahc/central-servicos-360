const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outputDir = path.join(__dirname, '../visual-audit/login');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
  } catch (e) {
    console.log('Tentando launch alternativo...');
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  console.log('--- 1. Navegando para login.html em 1600x900 (Dark) ---');
  await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle' });

  // 1. Validar Colaborador inicial
  const ctaTextColab = await page.locator('#login-btn-text').textContent();
  console.log('CTA inicial (Colaborador):', ctaTextColab);
  if (ctaTextColab !== 'Entrar como Colaborador') throw new Error('CTA Colaborador incorreto');

  const isScenarioVisibleColab = await page.locator('#agent-scenario-section').isVisible();
  console.log('Cenário visível com Colaborador?', isScenarioVisibleColab);
  if (isScenarioVisibleColab) throw new Error('Cenário operacional não deveria estar visível');

  // Screenshot 1: login-dark-1600x900
  await page.screenshot({ path: path.join(outputDir, 'login-dark-1600x900.png') });
  console.log('✓ Screenshot salvo: visual-audit/login/login-dark-1600x900.png');

  // 2. Alternar para Light Mode
  console.log('--- 2. Testando Tema Claro (Light) ---');
  await page.click('#theme-toggle');
  await page.waitForTimeout(300);
  const themeAfterToggle = await page.evaluate(() => document.documentElement.dataset.theme);
  console.log('Tema atual:', themeAfterToggle);
  if (themeAfterToggle !== 'light') throw new Error('Tema não alternou para light');

  // Screenshot 2: login-light-1600x900
  await page.screenshot({ path: path.join(outputDir, 'login-light-1600x900.png') });
  console.log('✓ Screenshot salvo: visual-audit/login/login-light-1600x900.png');

  // Voltar para Dark Mode
  await page.click('#theme-toggle');
  await page.waitForTimeout(300);

  // 3. Testar Perfil: Gestor Aprovador
  console.log('--- 3. Testando Gestor Aprovador ---');
  await page.click('label[for="profile-manager"]');
  await page.waitForTimeout(200);
  const ctaTextManager = await page.locator('#login-btn-text').textContent();
  console.log('CTA Gestor:', ctaTextManager);
  if (ctaTextManager !== 'Entrar como Gestor Aprovador') throw new Error('CTA Gestor incorreto');
  if (await page.locator('#agent-scenario-section').isVisible()) throw new Error('Cenário não deveria aparecer no Gestor');

  // 4. Testar Perfil: Administrador
  console.log('--- 4. Testando Administrador ---');
  await page.click('label[for="profile-admin"]');
  await page.waitForTimeout(200);
  const ctaTextAdmin = await page.locator('#login-btn-text').textContent();
  console.log('CTA Administrador:', ctaTextAdmin);
  if (ctaTextAdmin !== 'Entrar como Administrador') throw new Error('CTA Administrador incorreto');
  if (await page.locator('#agent-scenario-section').isVisible()) throw new Error('Cenário não deveria aparecer no Admin');

  // 5. Testar Perfil: Agente de Serviço (SEM CENÁRIO PADRÃO)
  console.log('--- 5. Testando Agente de Serviço (Sem cenário padrão selecionado) ---');
  await page.click('label[for="profile-agent"]');
  await page.waitForTimeout(200);
  const isScenarioVisibleAgent = await page.locator('#agent-scenario-section').isVisible();
  console.log('Cenário visível com Agente?', isScenarioVisibleAgent);
  if (!isScenarioVisibleAgent) throw new Error('Cenário operacional deveria estar visível');

  // Verificar que nenhum cenário está selecionado por padrão
  const anyScenarioChecked = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[name="agentScenario"]')).some(r => r.checked);
  });
  console.log('Existe cenário selecionado por padrão?', anyScenarioChecked);
  if (anyScenarioChecked) throw new Error('Agente não deve vir com cenário selecionado por padrão');

  const isBtnDisabledInitial = await page.locator('#login-btn').isDisabled();
  const ctaDisabledTextInitial = await page.locator('#login-btn-text').textContent();
  console.log('Botão desabilitado inicialmente?', isBtnDisabledInitial, '| Texto:', ctaDisabledTextInitial);
  if (!isBtnDisabledInitial || !ctaDisabledTextInitial.includes('Selecione o cenário operacional para continuar')) {
    throw new Error('CTA deveria estar desabilitado com texto de orientação');
  }

  // Screenshot 3: login-agente-dark-1600x900 (mostra Agente com opções disponíveis para escolha)
  await page.screenshot({ path: path.join(outputDir, 'login-agente-dark-1600x900.png') });
  console.log('✓ Screenshot salvo: visual-audit/login/login-agente-dark-1600x900.png');

  // Testar seleção do Cenário A: Viagens + Mobilidade
  console.log('--- 5.1 Selecionando Cenário A: Viagens + Mobilidade ---');
  await page.click('label[for="scenario-travel"]');
  await page.waitForTimeout(200);
  const isBtnEnabledA = !(await page.locator('#login-btn').isDisabled());
  const ctaTextA = await page.locator('#login-btn-text').textContent();
  console.log('Cenário A - Botão habilitado?', isBtnEnabledA, '| CTA:', ctaTextA);
  if (!isBtnEnabledA || ctaTextA !== 'Entrar como Agente de Serviço') throw new Error('Falha ao habilitar CTA no Cenário A');

  // Testar seleção do Cenário B: Transportes
  console.log('--- 5.2 Selecionando Cenário B: Transportes ---');
  await page.click('label[for="scenario-transport"]');
  await page.waitForTimeout(200);
  const isBtnEnabledB = !(await page.locator('#login-btn').isDisabled());
  const ctaTextB = await page.locator('#login-btn-text').textContent();
  console.log('Cenário B - Botão habilitado?', isBtnEnabledB, '| CTA:', ctaTextB);
  if (!isBtnEnabledB || ctaTextB !== 'Entrar como Agente de Serviço') throw new Error('Falha ao habilitar CTA no Cenário B');

  // Testar seleção do Cenário C: Serviços Gerais
  console.log('--- 5.3 Selecionando Cenário C: Serviços Gerais ---');
  await page.click('label[for="scenario-general"]');
  await page.waitForTimeout(200);
  const isBtnEnabledC = !(await page.locator('#login-btn').isDisabled());
  const ctaTextC = await page.locator('#login-btn-text').textContent();
  console.log('Cenário C - Botão habilitado?', isBtnEnabledC, '| CTA:', ctaTextC);
  if (!isBtnEnabledC || ctaTextC !== 'Entrar como Agente de Serviço') throw new Error('Falha ao habilitar CTA no Cenário C');

  // 6. Testar 1366x768
  console.log('--- 6. Testando Resolução 1366x768 ---');
  await page.click('label[for="profile-collaborator"]');
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, 'login-dark-1366x768.png') });
  console.log('✓ Screenshot salvo: visual-audit/login/login-dark-1366x768.png');

  // 7. Testar Mobile 390x844 (Colaborador)
  console.log('--- 7. Testando Mobile 390x844 (Colaborador) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, 'login-mobile-dark.png') });
  console.log('✓ Screenshot salvo: visual-audit/login/login-mobile-dark.png');

  // 8. Testar Mobile com Agente
  console.log('--- 8. Testando Mobile 390x844 (Agente) ---');
  await page.click('label[for="profile-agent"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, 'login-mobile-agente-dark.png') });
  console.log('✓ Screenshot salvo: visual-audit/login/login-mobile-agente-dark.png');

  // 9. Verificar console errors
  console.log('--- 9. Verificação de Erros de Console ---');
  console.log('Total de erros de console:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Erros encontrados:', consoleErrors);
    throw new Error('Erros de console detectados');
  }

  await browser.close();
  console.log('=== TODOS OS TESTES E SCREENSHOTS CONCLUÍDOS COM SUCESSO! ===');
})();
