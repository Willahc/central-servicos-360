const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'visual-audit', '4-perfis');
fs.mkdirSync(output, { recursive: true });
const scenarios = [
  ['colaborador','dashboard.html',1600,900], ['agente_viagens_mobilidade','atendimentos.html',1600,900],
  ['agente_transportes','atendimentos.html',1600,900], ['gestor','aprovacoes.html',1600,900], ['administrador','administracao.html',1600,900],
  ['colaborador','dashboard.html',1366,768], ['agente_viagens_mobilidade','atendimentos.html',1366,768],
  ['gestor','aprovacoes.html',1366,768], ['administrador','administracao.html',1366,768]
];
const wait = async url => { for(let i=0;i<60;i++){ try{if((await fetch(url)).ok)return;}catch{} await new Promise(r=>setTimeout(r,250)); } throw new Error('Servidor indisponível'); };
(async()=>{
  const server=spawn(process.execPath,['node_modules/ts-node/dist/bin.js','src/main.ts'],{cwd:root,stdio:'ignore'});
  try {
    await wait('http://localhost:3000/health');
    const browser=await chromium.launch({headless:true}); const report=[];
    for(const [profile,pageName,width,height] of scenarios){
      const context=await browser.newContext({viewport:{width,height}});
      await context.addInitScript(profile=>{localStorage.setItem('cs360_active_role',profile);localStorage.setItem('cs360_theme','dark');localStorage.removeItem('cs360_api_token');localStorage.removeItem('cs360_current_user');localStorage.removeItem('cs360_active_perspective');},profile);
      const page=await context.newPage(),errors=[]; page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
      await page.goto(`http://localhost:3000/${pageName}`,{waitUntil:'networkidle'}); await page.waitForTimeout(500);
      const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,nav:[...document.querySelectorAll('.app-sidebar .nav-link')].map(x=>x.textContent.trim().replace(/\s+/g,' ')),title:document.querySelector('h1')?.textContent.trim(),assistant:Boolean(document.querySelector('#role-context-assistant,#assistant-chat,.kb-assistant')),selector:document.querySelector('#demo-profile-selector')?.getAttribute('aria-label')}));
      const name=`${profile}-dark-${width}x${height}`; await page.screenshot({path:path.join(output,`${name}.png`),fullPage:false});
      report.push({name,...metrics,errors}); await context.close();
    }
    await browser.close(); fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2));
    if(report.some(x=>x.overflow||x.errors.length||!x.assistant)) process.exitCode=1;
  } finally { server.kill(); }
})().catch(error=>{console.error(error);process.exit(1)});
