import { chromium } from 'playwright';

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:8123';
const viewports = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1366, height: 850, isMobile: false, hasTouch: false },
];
const browser = await chromium.launch({ headless: true });
const failures = [];

async function tap(page, locator, mobile) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Objetivo sin caja visible');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
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
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    try {
      await page.goto(base + '/tests/proto-diamond.html?theme=walnut&diff=normal', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('#proto-board .tile').first().waitFor({ timeout: 15000 });
      await page.waitForFunction(() => document.querySelectorAll('#proto-board .tile').length === 85);
      await page.waitForFunction(() => document.querySelectorAll('#proto-board .pc').length === 8);
      const lightPieces = page.locator('#proto-board .pc.side-light');
      let selected = false;
      let moveTargets = 0;
      for (let i = 0; i < await lightPieces.count(); i++) {
        await tap(page, lightPieces.nth(i), viewport.isMobile);
        await page.waitForTimeout(100);
        moveTargets = await page.locator('#proto-board .tile.mv, #proto-board .tile.cap').count();
        if (moveTargets > 0) { selected = true; break; }
      }
      if (!selected) throw new Error('No aparece ningún destino legal al seleccionar una pieza marfil');
      const beforeLight = await page.locator('#proto-board .pc.side-light').evaluateAll(nodes => nodes.map(el => el.style.transform));
      const beforeDark = await page.locator('#proto-board .pc.side-dark').evaluateAll(nodes => nodes.map(el => el.style.transform));
      const quietTargets = page.locator('#proto-board .tile.mv:not(.cap)');
      const targets = await quietTargets.count() ? quietTargets : page.locator('#proto-board .tile.cap');
      await tap(page, targets.first(), viewport.isMobile);
      await page.waitForFunction(() => document.querySelector('.proto-status')?.dataset.phase === 'bot', null, { timeout: 10000 });
      await page.waitForFunction(() =>
        document.querySelector('#proto-board')?.dataset.turn === 'light' &&
        document.querySelector('.proto-status')?.dataset.phase === 'human',
        null,
        { timeout: 20000 }
      );
      const afterLight = await page.locator('#proto-board .pc.side-light').evaluateAll(nodes => nodes.map(el => el.style.transform));
      const afterDark = await page.locator('#proto-board .pc.side-dark').evaluateAll(nodes => nodes.map(el => el.style.transform));
      if (beforeLight.join('|') === afterLight.join('|')) throw new Error('El movimiento no cambió la posición de las piezas marfil');
      if (beforeDark.join('|') === afterDark.join('|')) throw new Error('La IA no ejecutó una respuesta visible');
      await page.locator('#proto-difficulty').selectOption('dificil');
      await page.waitForFunction(() => document.querySelector('.proto-status')?.dataset.difficulty === 'dificil');
      if ((await page.locator('#proto-board .pc').count()) !== 8) throw new Error('Cambiar dificultad no reinició una partida limpia');
      await page.locator('#proto-restart').click();
      await page.waitForFunction(() => document.querySelector('.proto-status')?.dataset.phase === 'human');
      if (errors.length) throw new Error(errors.join(' | '));
      console.log(JSON.stringify({
        game: 'proto-diamond',
        viewport: viewport.name,
        boardTiles: 85,
        initialPieces: 8,
        selectedLegalTargets: moveTargets,
        playerAndBotMoved: true,
        difficultyReset: true,
        restart: true,
      }));
    } catch (error) {
      failures.push({ viewport: viewport.name, error: String(error) });
      console.error(JSON.stringify({ game: 'proto-diamond', viewport: viewport.name, error: String(error) }));
    }
    await context.close();
  }
} finally {
  await browser.close();
}
if (failures.length) {
  console.error('PROTO_DIAMOND_QA_FAILED ' + JSON.stringify(failures));
  process.exitCode = 1;
}
