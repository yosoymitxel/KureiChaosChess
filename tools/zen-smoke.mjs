// Jardín Zen en el navegador: clima guardado, barrer una hoja (destello de pixelfx), ampliar, cavar y
// mover una maceta con el guante. Móvil y PC, mesa normal y píxel.
// `node tools/zen-smoke.mjs [--pc|--mobile] [--art pixel|normal] [--shots carpeta]` → una línea si va bien.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const args = process.argv.slice(2), opt = (k) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const VIEWPORTS = { mobile: { width: 360, height: 800, hasTouch: true, isMobile: true }, pc: { width: 1920, height: 1080 } };
const views = args.includes('--pc') ? ['pc'] : args.includes('--mobile') ? ['mobile'] : ['mobile', 'pc'];
const themes = opt('art') ? [opt('art') === 'pixel' ? 'pixelada' : 'walnut'] : ['walnut', 'pixelada'];
const shots = opt('shots');
if (shots) await mkdir(shots, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };
const root = resolve('.');
const server = createServer(async (req, res) => {
  let path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (path.endsWith('/')) path = join(path, 'index.html');
  try { const body = await readFile(path); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const VENDOR = [['hooks', 'preact-hooks.module.js'], ['preact', 'preact.module.js'], ['htm', 'htm.module.js'], ['anime', 'anime.esm.min.js'], ['motion', 'motion.esm.js']];

// Píxeles con tinta en la capa de efectos del jardín: así se ve si un efecto llegó a pintarse.
const ink = (page) => page.evaluate(() => {
  const c = document.querySelector('.zn-yard > .fx-layer'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
  return n;
});

const browser = await chromium.launch(), fails = [];
for (const view of views) for (const theme of themes) {
  const tag = `${view}-${theme}`, bad = (m) => fails.push(`[${tag}] ${m}`);
  const ctx = await browser.newContext({ viewport: VIEWPORTS[view], hasTouch: VIEWPORTS[view].hasTouch, isMobile: VIEWPORTS[view].isMobile });
  const page = await ctx.newPage(), errors = [];
  page.setDefaultTimeout(8000);
  await page.route(/cdn\.jsdelivr\.net/, (r) => { const u = r.request().url(); r.fulfill({ path: 'vendor/' + VENDOR.find(([k]) => u.includes(k))[1], contentType: 'text/javascript' }); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '', contentType: 'text/css' }));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/favicon|404/.test(m.text()) && errors.push(m.text()));
  await page.addInitScript((theme) => {
    if (sessionStorage.getItem('zen-smoke')) return;
    sessionStorage.setItem('zen-smoke', '1');
    localStorage.clear();
    localStorage.setItem('zugzwang.settings.v2', JSON.stringify({ theme, tutorialSeen: true, lang: 'es' }));
    localStorage.setItem('zugzwang.achievements.v1', JSON.stringify(['zen_open']));
    localStorage.setItem('zugzwang.shop.v1', JSON.stringify({ coins: 999 }));
    localStorage.setItem('zugzwang.zensky.v1', JSON.stringify({ sky: 'snow', until: Date.now() + 1e7, left: 3 }));
    localStorage.setItem('zugzwang.zen.v1', JSON.stringify({ leafT: Date.now(), leaves: [{ x: 0.5, y: 3.5, r: 40 }] }));
  }, theme);
  await page.goto(base + '/');
  await page.getByText(/Jardín Zen/).first().click({ force: true });
  await page.locator('.zn-yard').waitFor();
  await page.waitForTimeout(1500);
  const shot = (n) => shots && page.locator('.zn-yard').screenshot({ path: join(shots, `${tag}-${n}.png`) });
  const said = (re) => page.locator('.zen-screen').innerText().then((t) => re.test(t));

  let at = 'abrir';
  try {
  // Clima guardado: el cantero y la pantalla lo muestran.
  const sky = await page.evaluate(() => [document.querySelector('.zn-yard').dataset.sky, document.querySelector('.zen-screen').dataset.weather].join());
  if (sky !== 'snow,snow') bad(`clima: esperaba nieve, hay "${sky}"`);
  await shot('nieve');

  // Barrer la hoja: paga y pinta el destello. Con nieve la capa ya tiene copos, así que se mide el aumento.
  const before = await ink(page);
  at = 'barrer';
  await page.locator('.zn-fallen').first().click();
  await page.waitForTimeout(900);
  const after = await ink(page);
  if (after <= before + 50) bad(`destello al cobrar: no se pintó (${before} → ${after} px)`);
  await shot('moneda');

  // Ampliar, cavar y mover una maceta a la tierra cavada.
  at = 'ampliar';
  await page.getByRole('button', { name: /Ampliar a/ }).click();
  await page.getByRole('button', { name: /Confirmar/ }).click();
  await page.waitForTimeout(1200);
  if (await page.locator('.zn-raw:not(.zn-dug)').count() === 0) bad('ampliar: no apareció tierra nueva');
  at = 'cavar';
  await page.getByRole('button', { name: /^Cavar/ }).click();
  await page.locator('.zn-raw:not(.zn-dug)').last().click();
  await page.waitForTimeout(1500);
  if (await page.locator('.zn-dug').count() === 0) bad('cavar: no quedó tierra cavada');
  at = 'coger';
  await page.getByRole('button', { name: /^Guante/ }).click();
  await page.getByRole('button', { name: 'Tiesto vacío' }).first().click();
  await page.waitForTimeout(250);
  if (!(await said(/Toca dónde lo llevas/))) bad('mover: no se levantó la maceta');
  at = 'soltar';
  await page.locator('.zn-dug').first().click();
  await page.waitForTimeout(400);
  if (!(await said(/Movido/))) bad('mover: no se dejó en la tierra cavada');
  await shot('movido');
  } catch (e) { bad(`${at}: ${e.message.split('\n').filter((l) => /intercepts|Timeout|waiting for/.test(l)).slice(0, 3).join(' · ')}`); }

  if (errors.length) bad('errores de página: ' + errors.slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
server.close();
if (fails.length) { console.log('Jardín con fallos:\n' + fails.join('\n')); process.exit(1); }
console.log(`Jardín OK: clima, destello, ampliar, cavar y mover en ${views.length * themes.length} combinaciones`);
