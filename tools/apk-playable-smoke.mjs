import { chromium } from 'playwright';

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:8123';
const games = ['micro', 'randarmy', 'giant', 'pqueen', 'ppawn', 'horse', 'battle', 'boss', 'zombie', 'bomb', 'gravity', 'chaos', 'arena', 'cards', 'infinite', 'mayhem', 'potato', 'boss2', 'speed', 'invis', 'drunk', 'chicken', 'bullet', 'anti', 'horde', 'pdodge', 'parkour', 'blaster', 'rampage', 'panic', 'queen'];
const viewports = [
  { name: 'mobile', width: 360, height: 800, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1366, height: 768, isMobile: false, hasTouch: false },
];
const browser = await chromium.launch({ headless: true });
const failures = [];

async function tap(page, locator, mobile) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Objetivo sin caja visible');
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  if (mobile) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch,
    });
    const page = await context.newPage();
    for (const game of games) {
      const errors = [];
      const onError = error => errors.push(error.message);
      const onConsole = message => { if (message.type() === 'error') errors.push(message.text()); };
      page.on('pageerror', onError);
      page.on('console', onConsole);
      try {
        await page.goto(base + '/tests/apk-lab.html?game=' + game + '&theme=walnut', {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        });
        await page.locator('.apk-board-frame .tile').first().waitFor({ timeout: 15000 });
        await page.waitForFunction(() => {
          const status = document.querySelector('.apk-status')?.textContent?.trim();
          const pieces = [...document.querySelectorAll('.apk-board-frame .pc')];
          return !!status && pieces.length > 0 && pieces.every(el => {
            const match = el.style.transform.match(/,\s*(-?[0-9.]+)px\)$/);
            return match && Math.abs(Number(match[1]) - 1) < 0.5;
          });
        }, null, { timeout: 15000 });

        if (game === 'horde') {
          for (const type of ['knight', 'bishop', 'rook']) {
            await page.getByRole('button', { name: 'Elegir ' + type }).click();
          }
          await page.getByRole('button', { name: 'Comenzar oleada 1' }).click();
          // Horde despliega las piezas de cada oleada sin la animación inicial
          // de reparto. La condición estable es que haya enemigos reales en el DOM.
          await page.waitForFunction(() =>
            document.querySelectorAll('.apk-board-frame .pc.side-dark').length >= 3,
            null, { timeout: 15000 });
          const hordeStatus = await page.locator('.apk-status').innerText();
          if (hordeStatus.startsWith('Falló esta acción')) {
            throw new Error('Horde no pudo iniciar la oleada: ' + hordeStatus);
          }
        }

        const initialTiles = await page.locator('.apk-board-frame .tile').count();
        if (!initialTiles) throw new Error('Tablero vacío');
        const pieces = page.locator('.apk-board-frame .pc.side-light');
        const pieceCount = await pieces.count();
        if (!pieceCount) throw new Error('No hay piezas del jugador');

        let selected = null;
        let legalTargets = 0;
        for (let i = 0; i < pieceCount; i++) {
          const piece = pieces.nth(i);
          const pid = await piece.getAttribute('data-pid');
          const transform = await piece.evaluate(el => el.style.transform);
          await tap(page, piece, viewport.isMobile);
          await page.waitForTimeout(90);
          legalTargets = await page.locator('.apk-board-frame .tile.mv').count();
          if (legalTargets) {
            selected = { pid, transform };
            break;
          }
        }
        if (!selected) throw new Error('Ninguna pieza propia expone movimientos legales');

        const initialStats = await page.locator('.apk-stats').innerText();
        const initialPositions = await page.locator('.apk-board-frame .pc').evaluateAll(nodes =>
          nodes.map(el => ({ pid: el.dataset.pid, transform: el.style.transform }))
        );
        const target = page.locator('.apk-board-frame .tile.mv:not(.cap)').first();
        if (await target.count()) {
          await tap(page, target, viewport.isMobile);
        } else {
          await tap(page, page.locator('.apk-board-frame .tile.mv').first(), viewport.isMobile);
        }

        await page.waitForFunction(({ previousPositions, previousStats }) => {
          const current = new Map([...document.querySelectorAll('.apk-board-frame .pc')]
            .map(el => [el.dataset.pid, el.style.transform]));
          const movedOrCaptured = previousPositions.some(p => !current.has(p.pid) || current.get(p.pid) !== p.transform);
          const stats = document.querySelector('.apk-stats')?.textContent || '';
          return movedOrCaptured && stats !== previousStats;
        }, { previousPositions: initialPositions, previousStats: initialStats }, { timeout: 15000 });

        const finalStats = await page.locator('.apk-stats').innerText();
        if (errors.length) throw new Error(errors.join(' | '));
        console.log(JSON.stringify({
          game,
          viewport: viewport.name,
          cells: initialTiles,
          playerPieces: pieceCount,
          legalTargets,
          before: initialStats,
          after: finalStats,
          humanMoveAndBotReply: true,
        }));
      } catch (error) {
        failures.push({ game, viewport: viewport.name, error: String(error) });
        console.error(JSON.stringify({ game, viewport: viewport.name, error: String(error) }));
        await page.screenshot({ path: 'artifacts-apk-failed-' + game + '-' + viewport.name + '.png', fullPage: true }).catch(() => {});
      } finally {
        page.off('pageerror', onError);
        page.off('console', onConsole);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
if (failures.length) {
  console.error('APK_PLAYABLE_QA_FAILED ' + JSON.stringify(failures));
  process.exitCode = 1;
} else {
  console.log('APK_PLAYABLE_QA_OK: 6 modalidades · escritorio y táctil');
}
