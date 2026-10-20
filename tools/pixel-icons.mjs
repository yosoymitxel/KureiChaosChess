// Iconos píxel: cada PNG 16×16 de art/iconos/out/sprites/ (lo genera pxl desde art/iconos/iconos.px.js,
// o dibújalo a mano en cualquier app) se pasa a un trazado SVG de rectángulos, uno por tramo
// horizontal de tinta. Así el icono escala nítido y toma el color del texto (currentColor).
// Uso:  node tools/pixel-icons.mjs   → src/ui/pixel-icons.js
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodePNG } from './png.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const SRC = root + 'art/iconos/out/sprites/';

const paths = {};
for (const f of readdirSync(SRC).filter((f) => f.endsWith('.png')).sort()) {
  const { w, h, px } = decodePNG(readFileSync(SRC + f));
  if (w !== 16 || h !== 16) throw new Error(`${f}: mide ${w}×${h}, tiene que ser 16×16`);
  let d = '';
  for (let y = 0; y < h; y++) for (let x = 0; x < w;) {
    if (px[(y * w + x) * 4 + 3] < 128) { x++; continue; }
    const x0 = x;
    while (x < w && px[(y * w + x) * 4 + 3] >= 128) x++;
    d += `M${x0} ${y}h${x - x0}v1h${x0 - x}z`;
  }
  paths[f.slice(0, -4)] = d;
}

writeFileSync(root + 'src/ui/pixel-icons.js', `// Generado por tools/pixel-icons.mjs desde art/iconos/: no editar a mano.
// Trazado de cada icono píxel en una rejilla 16×16.
export const PIXEL_ICONS = ${JSON.stringify(paths, null, 2)};
`);
console.log(`iconos píxel: ${Object.keys(paths).length}`);
