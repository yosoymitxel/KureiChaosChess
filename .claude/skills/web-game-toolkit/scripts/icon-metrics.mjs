// Mide un set de iconos para igualarlo con números y no a ojo: por icono, caja (fracción del
// lienzo), tinta (peso visual), centro de masa y asimetría respecto a su eje vertical.
// Acepta una carpeta con .svg y/o .png (silueta oscura sobre transparente).
// Uso:  node icon-metrics.mjs <carpeta> [--json]
// Metas que funcionaron (Zugzwang, 48 iconos): tinta 0.22–0.36 en vector y 0.30–0.48 en píxel,
// lado mayor ≈ 0.80 del lienzo, centro dentro de ±0.03 y asimetría 0 en lo que es simétrico.
import { readdirSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
// Playwright del proyecto o, si no lo tiene, el instalado globalmente.
const { chromium } = await import('playwright').catch(() => import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs'));

const [dir, flag] = process.argv.slice(2);
if (!dir) { console.error('uso: node icon-metrics.mjs <carpeta> [--json]'); process.exit(1); }
const files = readdirSync(dir).filter((f) => /\.(svg|png)$/.test(f)).sort().map((f) => ({
  name: f.replace(/\.\w+$/, ''),
  src: `data:${f.endsWith('.svg') ? 'image/svg+xml' : 'image/png'};base64,` + readFileSync(`${dir}/${f}`).toString('base64'),
}));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage();
const rows = await page.evaluate(async (files) => {
  const S = 96, out = [];
  for (const { name, src } of files) {
    const img = new Image(); img.src = src; await img.decode();
    const c = new OffscreenCanvas(S, S), g = c.getContext('2d');
    g.imageSmoothingEnabled = false; g.drawImage(img, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S).data, on = (x, y) => d[(y * S + x) * 4 + 3] > 127;
    let ink = 0, x0 = S, x1 = -1, y0 = S, y1 = -1, sx = 0, sy = 0, asym = 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (on(x, y)) { ink++; sx += x; sy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (on(x, y) && !on(x0 + x1 - x, y)) asym++;
    const f = (v) => +v.toFixed(3);
    out.push({ name, w: f((x1 - x0 + 1) / S), h: f((y1 - y0 + 1) / S), ink: f(ink / (S * S)), cx: f(sx / ink / S - 0.5), cy: f(sy / ink / S - 0.5), asym: f(asym / ink) });
  }
  return out;
}, files);
await browser.close();
if (flag === '--json') { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }
const inks = rows.map((r) => r.ink).sort((a, b) => a - b);
console.log(`${rows.length} iconos · tinta mediana ${inks[inks.length >> 1]} · rango ${inks[0]}–${inks.at(-1)}`);
for (const r of rows.sort((a, b) => a.ink - b.ink)) console.log(`${r.name.padEnd(14)} tinta ${r.ink}  caja ${r.w}×${r.h}  centro (${r.cx}, ${r.cy})  asim ${r.asym}`);
