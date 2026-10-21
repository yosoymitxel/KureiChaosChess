// Genera art/temas/_plantilla/: el punto de partida para dibujar un tema píxel a mano en cualquier
// app (Aseprite, Piskel, LibreSprite, Pixel Studio…). Lienzos PNG vacíos con el nombre y el tamaño
// que el importador espera, un calco del tema base para cada uno, la paleta y un tema.json.
// Uso:  node tools/pixel-template.mjs   (después de node tools/pixel-art.mjs; vuelve a correrlo si
//       cambian las piezas o los jefes)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodePNG, encodePNG, hex, rgb } from './png.mjs';

globalThis.document = { documentElement: { dataset: {} } };
const { PIECE_TYPES } = await import('../src/data/pieces.js');
const { BOSS_IDS } = await import('../src/data/bosses.js');
const { PIXEL_BASE } = await import('../src/data/pixel-packs.js');

const root = fileURLToPath(new URL('../', import.meta.url));
const SRC = `${root}assets/pixel/${PIXEL_BASE}/`;
const OUT = root + 'art/temas/_plantilla/';
const base = JSON.parse(readFileSync(`${root}art/temas/${PIXEL_BASE}/tema.json`, 'utf8'));

// Lienzo de cada cosa: holgado para figuras (el importador recorta lo vacío), exacto para el resto.
const CANVAS = [
  ...PIECE_TYPES.map((n) => [n, 36, 36, 'piezas']),
  ...BOSS_IDS.map((b) => ['boss-' + b, 48, 44, 'jefes']),
  ...['tile-a', 'tile-a2', 'tile-a3', 'tile-b', 'tile-b2', 'tile-b3'].map((n) => [n, 16, 16, 'fondos']),
  ['table', 32, 32, 'fondos'], ['panel', 12, 12, 'marcos'], ['boton', 12, 12, 'marcos'],
];
const blank = (w, h) => ({ w, h, px: new Uint8Array(w * h * 4) });
const figure = (n) => !['fondos', 'marcos'].includes(n);

rmSync(OUT, { recursive: true, force: true });
const colors = new Map();
for (const [name, w, h, group] of CANVAS) {
  mkdirSync(`${OUT}dibujos/${group}`, { recursive: true });
  mkdirSync(`${OUT}calcos/${group}`, { recursive: true });
  writeFileSync(`${OUT}dibujos/${group}/${name}.png`, encodePNG(blank(w, h)));
  // Calco: la versión del tema base en el mismo sitio del lienzo (figuras abajo y centradas, a
  // un tercio de opacidad, para ponerla como capa de referencia debajo del dibujo).
  const src = decodePNG(readFileSync(SRC + name + (figure(group) ? '_l' : '') + '.png'));
  const out = blank(w, h), dx = Math.floor((w - src.w) / 2), dy = h - src.h;
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const i = (y * src.w + x) * 4, o = ((y + (figure(group) ? dy : 0)) * w + x + (figure(group) ? dx : 0)) * 4;
    if (!src.px[i + 3]) continue;
    out.px.set(src.px.subarray(i, i + 4), o);
    if (figure(group)) out.px[o + 3] = 85;
    if (src.px[i + 3] === 255) colors.set(hex(src.px, i), (colors.get(hex(src.px, i)) || 0) + 1);
  }
  writeFileSync(`${OUT}calcos/${group}/${name}.png`, encodePNG(out));
}

// Paleta: primero el bando claro (lo único que cambia de color con el bando), después los colores
// fijos del tema base, de más a menos usados. .gpl para Aseprite/LibreSprite/GIMP/Krita y .png de
// un píxel por color para las apps que cargan la paleta desde una imagen.
const side = base.bandos.claro.map((c) => c.toLowerCase());
const fixed = [...colors.entries()].filter(([c]) => !side.includes(c)).sort((a, b) => b[1] - a[1]).map(([c]) => c);
const all = [...new Set(side), ...fixed];
writeFileSync(OUT + 'paleta.gpl', ['GIMP Palette', 'Name: Zugzwang (bando claro + fijos)', 'Columns: 8', '#',
  ...all.map((c, i) => `${rgb(c).map((v) => String(v).padStart(3)).join(' ')}\t${i < side.length ? 'bando claro ' + (i + 1) : 'fijo'}`)].join('\n') + '\n');
const pal = blank(all.length, 1);
all.forEach((c, i) => pal.px.set([...rgb(c), 255], i * 4));
writeFileSync(OUT + 'paleta.png', encodePNG(pal));

writeFileSync(OUT + 'tema.json', JSON.stringify({
  ...base, nombre: 'Mi tema', precio: 0, descripcion: 'Una frase que cuente de qué va el tema.',
}, null, 2) + '\n');
console.log(`plantilla: ${CANVAS.length} lienzos, ${all.length} colores en la paleta`);
