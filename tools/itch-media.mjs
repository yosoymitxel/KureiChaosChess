// Imágenes de la página de itch.io sacadas del propio juego empaquetado (dist/itch, sin CDN): portada,
// imagen social, portada 21:9, capturas 1280×720 y móvil, y los GIF del menú (< 3 MB, límite de itch).
// Uso: node tools/build-itch.mjs && node tools/itch-media.mjs [--lang es] [--out artifacts/itch-media]
// Lo corre también el workflow «itch.io» de GitHub (artefacto descargable).
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { extname, join, resolve } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const lang = opt('lang', 'en'), out = resolve(opt('out', 'artifacts/itch-media'));
const root = resolve('dist/itch');
await stat(join(root, 'index.html')).catch(() => { console.log('Falta dist/itch: corre antes node tools/build-itch.mjs'); process.exit(2); });
await mkdir(out, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  let path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (path.endsWith('/')) path = join(path, 'index.html');
  try { const body = await readFile(path); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const errors = [];
async function page({ w, h, dpr = 1, theme = 'walnut', mobile = false, video }) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: mobile, isMobile: mobile, ...(video && { recordVideo: { dir: video, size: { width: w, height: h } } }) });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  await p.addInitScript(([t, l]) => localStorage.setItem('zugzwang.settings.v2', JSON.stringify({ theme: t, lang: l, sound: false, music: false, tutorialSeen: true })), [theme, lang]);
  await p.addInitScript(() => addEventListener('DOMContentLoaded', () => document.head.append(Object.assign(document.createElement('style'), { textContent: '.ach-toast{display:none!important}' }))));
  await p.goto(base);
  return { ctx, p };
}
// Fotos del menú cuando ya cayó el Titán y se repartieron las piezas.
const SHOTS = [
  ['cover.png', { w: 1260, h: 1000 }],
  ['social-1200x630.png', { w: 1200, h: 630 }],
  ['social-1200x630-pixel.png', { w: 1200, h: 630, theme: 'pixelada' }],
  ['wide-cover-21x9.png', { w: 1260, h: 540, dpr: 2 }],
  ['embed-bg-1280x720.png', { w: 1280, h: 720 }],
  ['menu-walnut.png', { w: 1280, h: 720 }],
  ['menu-pixelada.png', { w: 1280, h: 720, theme: 'pixelada' }],
  ['movil.png', { w: 360, h: 800, dpr: 2, mobile: true }],
];
for (const [name, cfg] of SHOTS) {
  const { ctx, p } = await page(cfg);
  await p.waitForTimeout(5000);
  await p.screenshot({ path: join(out, name) });
  await ctx.close();
}
// GIF del menú: 4,5 s desde que carga, 600 px, 12 fps, 96 colores.
const tmp = join(out, '_video');
for (const theme of ['walnut', 'pixelada']) {
  await rm(tmp, { recursive: true, force: true });
  const { ctx, p } = await page({ w: 1280, h: 720, theme, video: tmp });
  await p.waitForTimeout(5500);
  await ctx.close();
  const webm = join(tmp, (await readdir(tmp))[0]), gif = join(out, `menu-${theme}.gif`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '0.6', '-t', '4.5', '-i', webm, '-vf', 'fps=12,scale=600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4', gif]);
  if ((await stat(gif)).size > 3e6) errors.push(`${gif} pasa de 3 MB`);
}
await rm(tmp, { recursive: true, force: true });
await browser.close(); server.close();
if (errors.length) { console.log('Medios de itch con errores:\n' + [...new Set(errors)].join('\n')); process.exit(1); }
console.log(`Medios de itch OK: ${SHOTS.length} imágenes y 2 GIF en ${out}`);
