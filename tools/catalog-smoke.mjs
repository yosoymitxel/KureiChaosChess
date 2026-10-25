import { chromium } from 'playwright';

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:8123';
const games = ['caceria','escape','bodyguard','giantHunt','minefield','contraband','laboratory','collapsingFloor','kingImpostor','connect4','bomber','barrier','izombie','bowling','laststand','mates','knight','queens','marcianos','checkers','fusion','duel','hockey'];
const viewports = [{name:'mobile',width:360,height:800},{name:'desktop',width:1366,height:768}];
const browser = await chromium.launch({headless:true});
const failures = [];
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.name==='mobile',hasTouch:viewport.name==='mobile'});
    await page.addInitScript(() => {
      window.__zugCinematicTitles = [];
      new MutationObserver(() => {
        for (const h of document.querySelectorAll('.moment.cine .cine-text h2')) {
          const title = h.textContent?.trim();
          if (title && !window.__zugCinematicTitles.includes(title)) window.__zugCinematicTitles.push(title);
        }
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    for (const game of games) {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      try {
        await page.goto(`${base}/tests/visual.html?mini=${game}&theme=walnut&diff=normal`, {waitUntil:'domcontentloaded',timeout:45000});
        await page.locator('.screen').waitFor({timeout:12000});
        await page.locator('.moment.cine').waitFor({state:'attached', timeout:12000});
        const result = await page.evaluate(() => ({
          screen: !!document.querySelector('.screen'),
          title: document.querySelector('.topbar .title')?.textContent || document.querySelector('.game-top .title')?.textContent || document.querySelector('h1')?.textContent || '',
          cinematicTitle: document.querySelector('.moment.cine .cine-text h2')?.textContent || '',
          cinematicTitles: window.__zugCinematicTitles || [],
          width: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        if (!result.screen) throw new Error('No se montó la pantalla');
        if (!result.cinematicTitles.includes(result.title)) throw new Error(`Intro title not seen: ${result.title} (seen: ${result.cinematicTitles.join(', ')})`);
        if (errors.length) throw new Error(errors.join(' | '));
        console.log(JSON.stringify({game,viewport:viewport.name,...result}));
      } catch (error) {
        failures.push({game,viewport:viewport.name,error:String(error)});
        console.error(JSON.stringify({game,viewport:viewport.name,error:String(error)}));
      } finally {
        page.off('pageerror', onError);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (failures.length) {
  console.error('CATALOG_SMOKE_FAILED ' + JSON.stringify(failures));
  process.exitCode = 1;
} else console.log('CATALOG_SMOKE_OK: 23 minijuegos · escritorio y móvil');
