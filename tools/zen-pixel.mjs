// Sprites píxel del Jardín Zen: copia art/zen/out/sprites/*.png (los genera pxl desde art/zen/zen.px.js,
// o dibújalos a mano) a assets/zen/, comprobando que cada uno tenga el tamaño que espera el juego.
// En las mesas píxel el jardín los pinta en lugar del dibujo vectorial (src/ui/zen-art.js).
// Uso:  node tools/zen-pixel.mjs
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodePNG, encodePNG } from './png.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const SRC = root + 'art/zen/out/sprites/', OUT = root + 'assets/zen/';
const PLANTS = ['romero', 'salvia', 'lavanda'].flatMap((k) => ['sprout', 'bud', 'bloom'].map((s) => [`${k}-${s}`, 24, 24]));
export const ZEN_SPRITES = [
  ['pot', 24, 24], ...PLANTS, ['moss', 24, 24], ['step', 24, 24], ['stone', 24, 24], ['lantern', 24, 32], ['pond', 48, 48], ['koi', 8, 5],
  ['sand', 24, 24], ['raw', 24, 24], ['leaf', 7, 7], ['branch', 40, 26], ['can', 16, 12], ['shears', 16, 16], ['shovel', 8, 18], ['pouch', 11, 12], ['butterfly-wing', 6, 9],
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const errors = [];
for (const [name, w, h] of ZEN_SPRITES) {
  try {
    const img = decodePNG(readFileSync(`${SRC}${name}.png`));
    if (img.w !== w || img.h !== h) errors.push(`${name}.png mide ${img.w}×${img.h}, tiene que ser ${w}×${h}`);
    copyFileSync(`${SRC}${name}.png`, `${OUT}${name}.png`);
  } catch { errors.push(`falta art/zen/out/sprites/${name}.png`); }
}
// Piedras del estanque: Kenney, RTS Medieval y su versión píxel (CC0, kenney.nl), recortadas a lo
// que ocupan. Las `-px` van en las mesas píxel; las otras, en las normales.
const ROCKS = ['s', 'm', 'l'].flatMap((k) => [`rock-${k}`, `rock-${k}-px`]);
for (const name of ROCKS) {
  const img = decodePNG(readFileSync(`${root}art/zen/kenney/${name}.png`)), on = (x, y) => img.px[(y * img.w + x) * 4 + 3] > 0;
  let x0 = img.w, y0 = img.h, x1 = 0, y1 = 0;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (on(x, y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, px = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) px.set(img.px.subarray(((y + y0) * img.w + x0) * 4, ((y + y0) * img.w + x0 + w) * 4), y * w * 4);
  // Las píxel vienen azuladas: sus tonos, de oscuro a claro, pasan al granito del jardín (zen.px.js).
  if (name.endsWith('-px')) {
    const lum = (i) => px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11, tones = [...new Set([...Array(w * h).keys()].filter((i) => px[i * 4 + 3]).map((i) => lum(i * 4)))].sort((a, b) => a - b);
    const GRANITE = [[0x3a, 0x35, 0x30], [0x4d, 0x49, 0x44], [0x77, 0x72, 0x6b], [0xa9, 0xa4, 0x9c], [0xcb, 0xc7, 0xbf]];
    for (let i = 0; i < px.length; i += 4) if (px[i + 3]) px.set(GRANITE[Math.min(GRANITE.length - 1, tones.indexOf(lum(i)))], i);
  }
  writeFileSync(`${OUT}${name}.png`, encodePNG({ w, h, px }));
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`jardín píxel: ${ZEN_SPRITES.length} sprites y ${ROCKS.length} piedras en assets/zen/`);
