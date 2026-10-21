// Arnés de navegador para probar el juego de verdad (Playwright + el Chromium del entorno).
// open() abre la página, junta errores de consola y, si el juego carga librerías por CDN en un
// importmap y la red está cortada, las sirve desde copias locales (VENDOR).
//   import { open, touchDrag, strip } from './browser.mjs';
//   const { browser, page, errors } = await open({ width: 360, height: 800, dpr: 2.5, touch: true });
// Servidor: npx http-server -p 8123 -s -c-1 .   (si curl devuelve 000, reinícialo)
import { execSync } from 'node:child_process';
// Playwright del proyecto o, si no lo tiene, el instalado globalmente.
const { chromium } = await import('playwright').catch(() => import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs'));

// 'trozo de la URL del CDN' → ruta local del archivo. Rellénalo por proyecto si hace falta.
export const VENDOR = {};

export async function open({ url = 'http://127.0.0.1:8123/index.html', width = 1280, height = 800, touch = false, dpr } = {}) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: touch, isMobile: touch, deviceScaleFactor: dpr || (touch ? 2 : 1) });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
  await page.route('**/*', (route) => {
    const u = route.request().url();
    for (const [k, f] of Object.entries(VENDOR)) if (u.includes(k)) return route.fulfill({ path: f, contentType: 'text/javascript' });
    if (u.includes('fonts.g')) return route.fulfill({ body: '', contentType: 'text/css' });
    return route.continue();
  });
  await page.goto(url);
  return { browser, page, errors };
}

// Arrastre táctil real (CDP), punto a punto; `shot` captura a mitad del gesto.
export async function touchDrag(page, pts, { shot, wait = 60 } = {}) {
  const cdp = await page.context().newCDPSession(page);
  const send = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y }] });
  await send('touchStart', pts[0]);
  for (const p of pts.slice(1)) { await send('touchMove', p); await page.waitForTimeout(wait); }
  if (shot) await page.screenshot({ path: shot });
  await send('touchEnd', pts.at(-1));
}

// Varias capturas en una tira reducida: una sola imagen que leer en vez de cuatro (ahorra tokens).
export async function strip(page, paths, out, { scale = 0.5 } = {}) {
  const imgs = await Promise.all(paths.map(async (p) => 'data:image/png;base64,' + (await import('node:fs')).readFileSync(p).toString('base64')));
  const png = await page.evaluate(async ({ imgs, scale }) => {
    const els = await Promise.all(imgs.map((src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; })));
    const w = els.reduce((s, i) => s + i.width * scale, 0), h = Math.max(...els.map((i) => i.height * scale));
    const c = new OffscreenCanvas(w, h), g = c.getContext('2d');
    let x = 0;
    for (const i of els) { g.drawImage(i, x, 0, i.width * scale, i.height * scale); x += i.width * scale; }
    const b = await c.convertToBlob();
    return [...new Uint8Array(await b.arrayBuffer())];
  }, { imgs, scale });
  (await import('node:fs')).writeFileSync(out, Buffer.from(png));
}
