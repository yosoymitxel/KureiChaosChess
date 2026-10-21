import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:8123';
const out = process.env.VISUAL_OUT || 'artifacts/visual';
const games = ['caceria','escape','bodyguard','giantHunt','minefield','contraband','laboratory','collapsingFloor','kingImpostor'];
const viewports = [{name:'mobile',width:360,height:800},{name:'desktop',width:1366,height:768}];
const themes = ['normal','pixel'];
await mkdir(out,{recursive:true});
const browser = await chromium.launch({headless:true});
const failures=[];
try {
  for (const theme of themes) for (const viewport of viewports) {
    const context = await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,isMobile:viewport.name==='mobile',hasTouch:viewport.name==='mobile'});
    const page = await context.newPage();
    const consoleErrors=[];
    page.on('pageerror',e=>consoleErrors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
    for (const game of games) {
      consoleErrors.length = 0;
      const url=`${base}/tests/visual.html?mini=${game}&theme=${theme}`;
      try {
        await page.goto(url,{waitUntil:'networkidle',timeout:45000});
        await page.locator('.mini-stage .bm').waitFor({timeout:15000});
        await page.screenshot({path:`${out}/${game}-${theme}-${viewport.name}.png`,fullPage:true});
        const metrics=await page.evaluate(()=>({title:document.title,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,clientHeight:document.documentElement.clientHeight,board:!!document.querySelector('.mini-stage .bm'),cells:document.querySelectorAll('.mini-stage .bm-cell').length}));
        if(!metrics.board||!metrics.cells) throw new Error('No se renderizó el tablero');
        if(metrics.scrollWidth>metrics.clientWidth+1) failures.push({game,theme,viewport:viewport.name,error:`overflow horizontal ${metrics.scrollWidth}>${metrics.clientWidth}`});
        if(consoleErrors.length) failures.push({game,theme,viewport:viewport.name,error:consoleErrors.join(' | ')});
        console.log(JSON.stringify({game,theme,viewport:viewport.name,...metrics,consoleErrors}));
      } catch(error) {
        failures.push({game,theme,viewport:viewport.name,error:String(error)});
        console.error(JSON.stringify({game,theme,viewport:viewport.name,error:String(error)}));
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
if(failures.length){console.error('VISUAL_QA_FAILED '+JSON.stringify(failures));process.exitCode=1;}
else console.log('VISUAL_QA_OK: 9 minijuegos · 2 temas · 2 tamaños');