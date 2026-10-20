// Piezas vectoriales editables a mano: cada pieza y cada jefe es un .svg en art/vector/ que se
// abre en Inkscape, Illustrator, Figma o cualquier editor. Este script lo pasa al juego
// (src/view/piece-bodies.js): toma lo que hay dentro del grupo id="pieza", cambia los cuatro
// colores de trabajo por las variables del tema (para que cada bando y cada mesa la recoloreen)
// y limpia lo que añaden los editores. El juego mide el dibujo y lo escala y centra solo.
// Uso:  node tools/vector-art.mjs              importar art/vector/ → juego
//       node tools/vector-art.mjs --exportar   escribir art/vector/ desde el juego (solo los que falten;
//                                              --forzar los rehace todos, pisando lo editado)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

globalThis.document = { documentElement: { dataset: {} } };
const { PIECE_TYPES, PIECES } = await import('../src/data/pieces.js');
const { BOSSES, BOSS_IDS } = await import('../src/data/bosses.js');

const root = new URL('../', import.meta.url).pathname;
const DIR = root + 'art/vector/';
const OUT = root + 'src/view/piece-bodies.js';
// Colores de trabajo ↔ variables del juego.
const COLORS = [['#f3ead8', 'var(--pc)'], ['#8a7a66', 'var(--pc-2)'], ['#2a2233', 'var(--ink)'], ['#d9a441', 'var(--brass)']];
const FIGURES = [...PIECE_TYPES.map((t) => ['piezas', t, PIECES[t].name]), ...BOSS_IDS.map((b) => ['jefes', 'boss-' + b, BOSSES[b].name])];
const STROKE = 1.6;

const toFile = (s) => COLORS.reduce((a, [hex, v]) => a.replaceAll(v, hex), s);
const toGame = (s) => COLORS.reduce((a, [hex, v]) => a.replace(new RegExp(hex, 'gi'), v), s);

if (process.argv.includes('--exportar')) {
  const { RAW_BODIES } = await import('../src/view/piece-art.js');
  const force = process.argv.includes('--forzar');
  let n = 0;
  for (const [group, id, name] of FIGURES) {
    const file = `${DIR}${group}/${id}.svg`;
    if (existsSync(file) && !force) continue;
    mkdirSync(DIR + group, { recursive: true });
    writeFileSync(file, `<?xml version="1.0" encoding="UTF-8"?>
<!-- Zugzwang · ${name} (${id}). Dibuja solo dentro del grupo "pieza"; la capa "guia" no entra al juego.
     Colores: cuerpo #f3ead8, detalle #8a7a66, contorno #2a2233, ojos y luces #d9a441 (ver art/vector/LEEME.md). -->
<svg xmlns="http://www.w3.org/2000/svg" width="450" height="410" viewBox="0 0 45 41">
  <g id="guia" opacity="0.4"><rect width="45" height="41" fill="none" stroke="#9fb7d8" stroke-width="0.1"/></g>
  <g id="pieza" fill="#f3ead8" stroke="#2a2233" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">${toFile(RAW_BODIES[id])}</g>
</svg>
`);
    n++;
  }
  console.log(`exportadas ${n} figuras a art/vector/`);
  process.exit(0);
}

// Lo de dentro de <g id="pieza">…</g>, contando los <g> anidados para cerrar en el que toca.
function groupBody(svg, file) {
  const open = svg.match(/<g\b[^>]*\bid="pieza"[^>]*>/);
  if (!open) throw new Error(`${file}: no tiene el grupo id="pieza"`);
  let depth = 1, i = open.index + open[0].length;
  const re = /<g\b[^>]*?(\/?)>|<\/g>/g;
  re.lastIndex = i;
  for (let m; (m = re.exec(svg));) {
    if (m[0] === '</g>') depth--;
    else if (!m[1]) depth++;
    if (!depth) return svg.slice(i, m.index);
  }
  throw new Error(`${file}: el grupo "pieza" no cierra`);
}
// Lo que añaden los editores y el juego no necesita (ids que chocarían entre piezas, metadatos).
const clean = (s) => s
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\s(?:inkscape|sodipodi|xml|data-name|serif):[\w-]+="[^"]*"/g, '')
  .replace(/\s(?:id|class|data-name)="[^"]*"/g, '')
  .replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

const bodies = {};
for (const [group, id] of FIGURES) {
  const file = `${DIR}${group}/${id}.svg`;
  if (!existsSync(file)) throw new Error(`falta ${file} (node tools/vector-art.mjs --exportar lo crea)`);
  bodies[id] = toGame(clean(groupBody(readFileSync(file, 'utf8'), file)));
}
for (const group of ['piezas', 'jefes']) for (const f of existsSync(DIR + group) ? readdirSync(DIR + group) : []) {
  if (f.endsWith('.svg') && !FIGURES.some(([g, id]) => g === group && id + '.svg' === f)) console.warn(`  aviso: ${group}/${f}: el juego no tiene esa figura, se ignora`);
}
writeFileSync(OUT, `// Generado por tools/vector-art.mjs desde art/vector/: no editar a mano.
// Cuerpo de cada pieza y jefe en sus coordenadas de dibujo; piece-art.js lo mide, lo escala y lo centra.
export const BODIES = ${JSON.stringify(bodies, null, 2)};
`);
console.log(`piece-bodies.js: ${Object.keys(bodies).length} figuras`);
