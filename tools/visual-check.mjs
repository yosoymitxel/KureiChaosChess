import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:8123';
const out = process.env.VISUAL_OUT || 'artifacts/visual';
const games = ['escape','contraband','laboratory','collapsingFloor','knight'];
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
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
        await page.locator('.mini-stage .bm').waitFor({timeout:15000});
        await page.locator('.moment.cine').waitFor({state:'attached',timeout:10000});
        await page.screenshot({path:`${out}/${game}-${theme}-${viewport.name}.png`,fullPage:true});
        await page.locator('.moment.cine').waitFor({state:'detached',timeout:5000});
        const beforeAction = await page.locator('.mini-stats').innerText().catch(() => '');
        const legalCell = page.locator('.bm-cell.mv').first();
        if (await legalCell.count()) {
          if (viewport.name === 'mobile') {
            const rect = await legalCell.boundingBox();
            if (!rect) throw new Error('La casilla legal no tiene caja visible');
            await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
          } else {
            await legalCell.click();
          }
          await page.waitForTimeout(180);
          const afterAction = await page.locator('.mini-stats').innerText().catch(() => '');
          if (beforeAction === afterAction) throw new Error('La primera acción legal no cambió el estado visible');
          await page.screenshot({path:`${out}/${game}-${theme}-${viewport.name}-after-action.png`,fullPage:true});
        } else {
          throw new Error('No se encontraron movimientos o sospechosos interactivos');
        }
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

  // Verify that the live lab selector loads each new theme's own sprites on phone and desktop.
  const previewThemes = ['calaveras-ataudes','vocaloid-miku','gatos-negros-naranjosos','colibries-flores-lilas','pandas-mapaches'];
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.name === 'mobile',
      hasTouch: viewport.name === 'mobile',
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedPixelAssets = [];
    page.on('pageerror', e => consoleErrors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('/assets/pixel/')) {
        failedPixelAssets.push(response.status() + ' ' + response.url());
      }
    });
    try {
      await page.goto(base + '/lab-preview.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('#theme').waitFor({ timeout: 20000 });
      await page.waitForFunction(() => {
        const themes = document.querySelector('#theme');
        const minis = document.querySelector('#mini');
        return themes && themes.options.length > 10 && minis && minis.options.length > 5;
      }, null, { timeout: 20000 });
      const options = await page.locator('#theme option').evaluateAll(nodes => nodes.map(n => n.value));
      const missingOptions = previewThemes.filter(id => !options.includes(id));
      if (missingOptions.length) throw new Error('Missing dynamic theme options: ' + missingOptions.join(', '));
      await page.locator('#mini').selectOption('board:none');
      for (const id of previewThemes) {
        consoleErrors.length = 0;
        await page.locator('#theme').selectOption(id);
        await page.waitForFunction(expected => {
          const frame = document.querySelector('#preview');
          const doc = frame && frame.contentDocument;
          return frame && frame.src.includes('tests/visual-board.html') &&
            doc && doc.readyState === 'complete' && doc.documentElement &&
            doc.documentElement.dataset.pack === expected &&
            doc.documentElement.dataset.art === 'pixel' &&
            !!doc.querySelector('.pc-art image');
        }, id, { timeout: 25000 });
        const rendered = await page.locator('#preview').evaluate(frame => {
          const doc = frame.contentDocument;
          const sprite = doc.querySelector('.pc-art image');
          return {
            pack: doc.documentElement.dataset.pack,
            art: doc.documentElement.dataset.art,
            spriteHref: sprite ? (sprite.getAttribute('href') || sprite.getAttribute('xlink:href') || '') : '',
            spriteCount: doc.querySelectorAll('.pc-art image').length,
            boardTiles: doc.querySelectorAll('.tile').length,
            scrollWidth: doc.documentElement.scrollWidth,
            clientWidth: doc.documentElement.clientWidth,
          };
        });
        if (!rendered.spriteHref.includes('assets/pixel/' + id + '/')) {
          throw new Error(id + ': visible sprite does not use its own PNG: ' + rendered.spriteHref);
        }
        if (!rendered.spriteCount || !rendered.boardTiles) throw new Error(id + ': empty board or pieces');
        if (rendered.scrollWidth > rendered.clientWidth + 1) {
          failures.push({ game: 'lab-preview', theme: id, viewport: viewport.name, error: 'overflow ' + rendered.scrollWidth + '>' + rendered.clientWidth });
        }
        if (failedPixelAssets.length) throw new Error(id + ': missing PNGs: ' + failedPixelAssets.join(' | '));
        if (consoleErrors.length) throw new Error(id + ': console errors: ' + consoleErrors.join(' | '));
        await page.locator('#preview').screenshot({ path: out + '/lab-preview-' + id + '-' + viewport.name + '.png' });
        console.log(JSON.stringify({ game: 'lab-preview', theme: id, viewport: viewport.name, ...rendered }));
      }
    } catch (error) {
      failures.push({ game: 'lab-preview', viewport: viewport.name, error: String(error) });
      console.error(JSON.stringify({ game: 'lab-preview', viewport: viewport.name, error: String(error) }));
    } finally {
      await context.close();
    }
  }


  // The standalone animation lab must reserve most of a phone viewport for its scene.
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.name === 'mobile',
      hasTouch: viewport.name === 'mobile',
    });
    try {
      await page.goto(base + '/lab.html', { waitUntil: 'networkidle', timeout: 45000 });
      await page.locator('#scenes .btn').first().waitFor({ timeout: 15000 });
      await page.locator('#scenes .btn').first().click();
      await page.waitForTimeout(500);
      const layout = await page.evaluate(() => {
        const rect = selector => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, height: r.height, width: r.width };
        };
        return {
          menu: rect('.lab-menu'),
          stage: rect('.lab-stage'),
          board: rect('#board'),
          viewportHeight: document.documentElement.clientHeight,
          viewportWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });
      if (!layout.stage || !layout.board || layout.stage.height < viewport.height * 0.35) {
        throw new Error('La escena del laboratorio queda demasiado pequeña: ' + JSON.stringify(layout));
      }
      if (layout.scrollWidth > layout.viewportWidth + 1) {
        throw new Error('Desbordamiento horizontal del laboratorio: ' + JSON.stringify(layout));
      }
      if (viewport.name === 'mobile' && layout.menu.height > viewport.height * 0.4) {
        throw new Error('El menú ocupa más del 40% de la pantalla móvil: ' + JSON.stringify(layout));
      }
      console.log(JSON.stringify({ game: 'animation-lab', viewport: viewport.name, ...layout }));
    } catch (error) {
      failures.push({ game: 'animation-lab', viewport: viewport.name, error: String(error) });
      console.error(JSON.stringify({ game: 'animation-lab', viewport: viewport.name, error: String(error) }));
    } finally {
      await page.close();
    }
  }

} finally {
  await browser.close();
}
if(failures.length){console.error('VISUAL_QA_FAILED '+JSON.stringify(failures));process.exitCode=1;}
else console.log('VISUAL_QA_OK: 5 grillas custom · 2 temas · 2 tamaños');