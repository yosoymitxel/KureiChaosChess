// Importador de temas píxel: un tema es una carpeta en art/temas/<id>/ con su tema.json y sus PNG.
// Los PNG salen de dos sitios y el segundo manda: out/sprites/ (lo que construye pxl desde los
// .px.js de la carpeta) y dibujos/ (lo que dibuja el dueño a mano en cualquier app). Para cada
// pieza o jefe basta el bando claro: los otros dos salen de cambiar los colores de "bandos".
// Escribe assets/pixel/<id>/*.png, src/data/pixel-packs.js (tamaños) y src/data/pixel-themes.js.
// Uso:  node <pxl>/bin/pxl.js build art/temas/<id>/<archivo>.px.js   (si el tema tiene .px.js)
//       node tools/pixel-art.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodePNG, encodePNG, hex, rgb } from './png.mjs';
import { PIXEL_THEME_ART_PACKS, PIXEL_THEME_ART_SIZES } from '../src/data/pixel-theme-art.js';

globalThis.document = { documentElement: { dataset: {} } };
const { PIECE_TYPES } = await import('../src/data/pieces.js');
const { BOSS_IDS } = await import('../src/data/bosses.js');

const root = fileURLToPath(new URL('../', import.meta.url));
const TEMAS = root + 'art/temas/';
const BASE = 'pixelada'; // el tema completo: lo que le falte a otro tema se toma de acá
const FIGURES = [...PIECE_TYPES, ...BOSS_IDS.map((b) => 'boss-' + b)];
const BG = ['tile-a', 'tile-a2', 'tile-a3', 'tile-b', 'tile-b2', 'tile-b3', 'table'];
const UI = ['panel', 'boton'];
// El lienzo de una figura en el tablero (45×41, con el suelo en 40.5); los jefes se escalan a su
// tamaño en casillas y aguantan algo más.
const MAX = { piece: [45, 40], boss: [48, 44] };

const warn = (msg) => console.warn('  aviso: ' + msg);
const pngsIn = (dir) => !existsSync(dir) ? [] : readdirSync(dir).flatMap((f) => {
  const p = dir + '/' + f;
  return statSync(p).isDirectory() ? pngsIn(p) : f.toLowerCase().endsWith('.png') ? [p] : [];
});

// Recorta todo lo vacío alrededor: los pies quedan en la última fila, que es el suelo.
function trim(img) {
  const { w, h, px } = img, solid = (x, y) => px[(y * w + x) * 4 + 3] > 0;
  const rowEmpty = (y) => [...Array(w).keys()].every((x) => !solid(x, y));
  const colEmpty = (x) => [...Array(h).keys()].every((y) => !solid(x, y));
  let top = 0, bottom = h, left = 0, right = w;
  while (top < h && rowEmpty(top)) top++;
  if (top === h) return null;
  while (rowEmpty(bottom - 1)) bottom--;
  while (colEmpty(left)) left++;
  while (colEmpty(right - 1)) right--;
  return crop(img, left, top, right - left, bottom - top);
}
// Copia un rectángulo; lo que cae fuera de la imagen queda transparente (sirve para agregar márgenes).
function crop({ w, h, px }, x0, y0, nw, nh) {
  const out = new Uint8Array(nw * nh * 4);
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const sx = x + x0, sy = y + y0;
    if (sx >= 0 && sy >= 0 && sx < w && sy < h) out.set(px.subarray((sy * w + sx) * 4, (sy * w + sx) * 4 + 4), (y * nw + x) * 4);
  }
  return { w: nw, h: nh, px: out };
}
// El juego pone el centro del PNG sobre el centro de la peana. Centrar la caja no basta: un mago
// a la izquierda con su vara a la derecha queda corrido, porque el peso está en el cuerpo. Se
// agregan columnas vacías del lado liviano hasta que el centro de masa (cada píxel opaco pesa
// igual) quede en el medio. Devuelve cuántas columnas van a la izquierda y a la derecha.
function balance({ w, h, px }) {
  let mass = 0, sum = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3]) { mass++; sum += x + 0.5; }
  const shift = Math.round(w - (2 * sum) / mass); // > 0: pesa a la izquierda, sobra a la derecha
  return shift > 0 ? [shift, 0] : [0, -shift];
}
const pad = (img, [left, right]) => crop(img, -left, 0, img.w + left + right, img.h);

// Cambia los colores del bando claro por los de otro bando (coincidencia exacta).
function recolor(img, from, to) {
  const map = new Map(from.map((c, i) => [c.toLowerCase(), rgb(to[i])]));
  const px = img.px.slice();
  for (let o = 0; o < px.length; o += 4) {
    const c = px[o + 3] && map.get(hex(px, o));
    if (c) px.set(c, o);
  }
  return { ...img, px };
}
const usesSide = (img, from) => {
  const set = new Set(from.map((c) => c.toLowerCase()));
  for (let o = 0; o < img.px.length; o += 4) if (img.px[o + 3] && set.has(hex(img.px, o))) return true;
  return false;
};

const packs = {}, themes = {};
const ids = readdirSync(TEMAS).filter((d) => !d.startsWith('_') && d !== 'goticas-clonas' && existsSync(TEMAS + d + '/tema.json'))
  .sort((a, b) => (a === BASE ? -1 : b === BASE ? 1 : a.localeCompare(b)));
const OUT = root + 'assets/pixel/';
rmSync(OUT, { recursive: true, force: true });

for (const id of ids) {
  console.log(`tema ${id}`);
  const dir = TEMAS + id + '/', tema = JSON.parse(readFileSync(dir + 'tema.json', 'utf8'));
  const { claro, oscuro, salvaje } = tema.bandos;
  if (![oscuro, salvaje].every((r) => r.length === claro.length)) throw new Error(`${id}: los tres bandos deben tener los mismos colores`);
  // Los dibujos a mano pisan a los de pxl con el mismo nombre.
  const files = new Map();
  for (const p of [...pngsIn(dir + 'out/sprites'), ...pngsIn(dir + 'dibujos')]) files.set(p.split('/').pop().slice(0, -4).toLowerCase(), p);
  const read = (name) => files.has(name) ? decodePNG(readFileSync(files.get(name))) : null;
  const dest = OUT + id + '/';
  mkdirSync(dest, { recursive: true });
  const save = (name, img) => writeFileSync(dest + name + '.png', encodePNG(img));
  const pack = (packs[id] = { sprites: {}, bg: [], ui: [] });
  if (PIXEL_THEME_ART_PACKS.includes(id)) {
    pack.sprites = Object.fromEntries(FIGURES.map((name) => [name, PIXEL_THEME_ART_SIZES[name]]));
    pack.bg = BG.slice();
    pack.ui = UI.slice();
    const c = tema.colores;
    themes[id] = {
      id, name: tema.nombre, ...(tema.precio ? { price: tema.precio } : {}),
      swatch: [c.table, c['tile-a'], c['side-dark'], c['side-wild']],
      vars: { ...c, ...(tema.interfaz || {}) },
      art: 'pixel', pack: id,
    };
    console.log('  ' + Object.keys(pack.sprites).length + ' figuras, arte SVG temático');
    continue;
  }

  for (const name of FIGURES) {
    const raw = read(name) || read(name + '_l');
    if (!raw) continue;
    const tight = trim(raw);
    if (!tight) continue; // lienzo de la plantilla sin dibujar: va el del tema base
    const margins = balance(tight), light = pad(tight, margins);
    const [mw, mh] = MAX[name.startsWith('boss-') ? 'boss' : 'piece'];
    if (light.w > mw || light.h > mh) warn(`${name}: mide ${light.w}×${light.h}, se sale del lienzo de ${mw}×${mh}`);
    if (!usesSide(light, claro) && !files.has(name + '_d')) warn(`${name}: no usa ningún color del bando claro, los tres bandos se verán iguales`);
    const side = (s, to) => { const own = read(name + '_' + s); return own ? pad(trim(own), margins) : recolor(light, claro, to); };
    const sides = { l: light, d: side('d', oscuro), w: side('w', salvaje) };
    for (const [s, img] of Object.entries(sides)) {
      if (img.w !== light.w || img.h !== light.h) throw new Error(`${id}/${name}: los bandos no miden igual`);
      save(`${name}_${s}`, img);
    }
    pack.sprites[name] = [light.w, light.h];
  }
  for (const name of [...BG, ...UI]) {
    const img = read(name);
    if (!img || !trim(img)) continue;
    // Tamaños fijos que el CSS da por hechos: la mesa va en mosaico de 128 px y los marcos se
    // cortan en nueve partes de 4 píxeles.
    const size = { table: 32, panel: 12, boton: 12 }[name];
    if (size && (img.w !== size || img.h !== size)) warn(`${name}: mide ${img.w}×${img.h} y debe medir ${size}×${size}`);
    save(name, img);
    pack[BG.includes(name) ? 'bg' : 'ui'].push(name);
  }
  for (const name of files.keys()) if (![...FIGURES, ...BG, ...UI].some((n) => name === n || name.startsWith(n + '_'))) warn(`${name}.png: nombre que el juego no conoce, se ignora`);
  const missing = FIGURES.filter((n) => !pack.sprites[n]);
  if (id === BASE && missing.length) throw new Error(`${BASE} es la base y le faltan: ${missing.join(', ')}`);
  if (missing.length) console.log(`  usa los de ${BASE} para: ${missing.join(', ')}`);
  console.log(`  ${Object.keys(pack.sprites).length} figuras, ${pack.bg.length} fondos, ${pack.ui.length} marcos`);

  const c = tema.colores;
  themes[id] = {
    id, name: tema.nombre, ...(tema.precio ? { price: tema.precio } : {}),
    swatch: [c.table, c['tile-a'], c['side-dark'], c['side-wild']],
    vars: { ...c, ...(tema.interfaz || {}) },
    art: 'pixel', pack: id,
  };
}

const head = '// Generado por tools/pixel-art.mjs desde art/temas/*: no editar a mano.\n';
writeFileSync(root + 'src/data/pixel-packs.js', `${head}// Por tema: lado y alto en píxeles de arte de cada figura (los PNG están en assets/pixel/<tema>/),
// y qué fondos y marcos trae. Lo que un tema no trae se toma de "${BASE}".
export const PIXEL_BASE = '${BASE}';
export const PIXEL_PACKS = ${JSON.stringify(packs)};
`);
writeFileSync(root + 'src/data/pixel-themes.js', `${head}// Las mesas píxel: una por carpeta de art/temas, con sus colores sacados de tema.json.
export const PIXEL_THEMES = ${JSON.stringify(themes, null, 2)};
`);
console.log(`listo: ${ids.length} temas`);
