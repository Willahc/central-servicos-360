const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'visual-audit', 'portais-conectados');
fs.mkdirSync(out, { recursive: true });
const cases = [
  ['portal-colaborador','portal-colaborador.html','dark',1600,900], ['portal-colaborador','portal-colaborador.html','light',1366,768], ['portal-colaborador-mobile','portal-colaborador.html','dark',390,844],
  ['portal-aprovador','portal-aprovador.html','dark',1600,900], ['portal-aprovador','portal-aprovador.html','light',1366,768], ['portal-aprovador-mobile','portal-aprovador.html','dark',390,844],
  ['central-operacional','atendimentos.html','dark',1600,900]
];
async function wait(){ for(let i=0;i<60;i++){ try{if((await fetch('http://localhost:3000/health')).ok)return}catch{} await new Promise(r=>setTimeout(r,250)); } throw Error('Servidor indisponível'); }
(async()=>{const server=spawn(process.execPath,['node_modules/ts-node/dist/bin.js','src/main.ts'],{cwd:root,stdio:'ignore'});try{
  await wait(); const browser=await chromium.launch({headless:true}),report=[];
  for(const[name,file,theme,width,height]of cases){const context=await browser.newContext({viewport:{width,height}});
    await context.addInitScript(({theme})=>{localStorage.setItem('cs360_theme',theme);localStorage.setItem('cs360_active_role','agente_viagens_mobilidade');localStorage.removeItem('cs360_api_token')},{theme});
    const page=await context.newPage(),errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://localhost:3000/${file}`,{waitUntil:'networkidle'});await page.waitForTimeout(500);if(file.includes('portal-'))await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    const metrics=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent.trim(),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,assistant:Boolean(document.querySelector('.assistant-fab,#role-context-assistant')),demo:document.body.innerText.includes('MODO DEMONSTRAÇÃO')}));
    const shot=`${name}-${theme}-${width}x${height}.png`;await page.screenshot({path:path.join(out,shot),fullPage:false});report.push({shot,...metrics,errors});await context.close();
  }
  await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.some(x=>x.overflow||x.errors.length||!x.assistant||!x.demo))process.exitCode=1;
}finally{server.kill()}})().catch(e=>{console.error(e);process.exit(1)});
