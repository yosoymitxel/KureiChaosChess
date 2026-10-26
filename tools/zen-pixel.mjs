// Sprites píxel del Jardín Zen: copia art/zen/out/sprites/*.png (los genera pxl desde art/zen/zen.px.js,
// o dibújalos a mano) a assets/zen/, comprobando que cada uno tenga el tamaño que espera el juego.
// En las mesas píxel el jardín los pinta en lugar del dibujo vectorial (src/ui/zen-art.js).
// Uso:  node tools/zen-pixel.mjs
import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodePNG } from './png.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const SRC = root + 'art/zen/out/sprites/', OUT = root + 'assets/zen/';
const PLANTS = ['romero', 'salvia', 'lavanda'].flatMap((k) => ['sprout', 'bud', 'bloom'].map((s) => [`${k}-${s}`, 24, 24]));
export const ZEN_SPRITES = [
  ['pot', 24, 24], ...PLANTS, ['moss', 24, 24], ['step', 24, 24], ['stone', 24, 24], ['lantern', 24, 32], ['pond', 48, 48], ['koi', 8, 5],
  ['sand', 24, 24], ['raw', 24, 24], ['leaf', 7, 7], ['branch', 40, 26], ['can', 16, 12], ['shears', 16, 16], ['shovel', 8, 18], ['pouch', 11, 12],
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
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`jardín píxel: ${ZEN_SPRITES.length} sprites en assets/zen/`);
