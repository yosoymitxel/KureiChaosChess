// Iconos píxel → SVG: cada PNG de una carpeta (16×16 por defecto) se pasa a un trazado de
// rectángulos, uno por tramo horizontal de tinta. Escala nítido y toma currentColor.
// Uso:  node png-icons.mjs <carpeta-png> <salida.js> [tamaño=16]
// Sale un módulo `export const PIXEL_ICONS = { nombre: 'M0 0h3v1h-3z…' }` para pintar con
// <svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="currentColor" d=…>.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { decodePNG } from './png.mjs';

const [src, out, size = 16] = process.argv.slice(2);
if (!src || !out) { console.error('uso: node png-icons.mjs <carpeta-png> <salida.js> [tamaño]'); process.exit(1); }
const N = +size, paths = {};
for (const f of readdirSync(src).filter((f) => f.endsWith('.png')).sort()) {
  const { w, h, px } = decodePNG(readFileSync(`${src}/${f}`));
  if (w !== N || h !== N) throw new Error(`${f}: mide ${w}×${h}, tiene que ser ${N}×${N}`);
  let d = '';
  for (let y = 0; y < h; y++) for (let x = 0; x < w;) {
    if (px[(y * w + x) * 4 + 3] < 128) { x++; continue; }
    const x0 = x;
    while (x < w && px[(y * w + x) * 4 + 3] >= 128) x++;
    d += `M${x0} ${y}h${x - x0}v1h${x0 - x}z`;
  }
  paths[f.slice(0, -4)] = d;
}
writeFileSync(out, `// Generado por png-icons.mjs desde ${src}: no editar a mano.\nexport const PIXEL_ICONS = ${JSON.stringify(paths, null, 2)};\n`);
console.log(`iconos píxel: ${Object.keys(paths).length} → ${out}`);
