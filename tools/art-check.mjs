// Comprobación del arte importado: node tools/art-check.mjs
// Que el lector de PNG lea lo que escribe, que cada figura y fondo de cada tema píxel exista en
// assets/pixel/, que cada toma de sonido exista en assets/sfx/ y que haya cuerpo vectorial para
// cada figura. Sale con código 1 si falta algo (un importador sin correr, un archivo sin subir).
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodePNG, encodePNG } from './png.mjs';

globalThis.document = { documentElement: { dataset: {} } };
const { PIXEL_PACKS } = await import('../src/data/pixel-packs.js');
const { SFX_SAMPLES } = await import('../src/data/sfx-samples.js');
const { MUSIC_TRACKS } = await import('../src/ui/sfx.js');
const { BODIES } = await import('../src/view/piece-bodies.js');
const { PIECE_TYPES } = await import('../src/data/pieces.js');
const { BOSS_IDS } = await import('../src/data/bosses.js');

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];

const img = { w: 3, h: 2, px: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 0, 9, 9, 9, 255, 200, 100, 50, 255, 0, 0, 0, 0]) };
const back = decodePNG(encodePNG(img));
if (back.w !== 3 || back.h !== 2 || back.px.some((v, i) => v !== img.px[i])) errors.push('png.mjs: lo que escribe no se lee igual');

for (const [id, pack] of Object.entries(PIXEL_PACKS)) {
  for (const name of Object.keys(pack.sprites)) for (const s of 'ldw') if (!existsSync(`${root}assets/pixel/${id}/${name}_${s}.png`)) errors.push(`${id}: falta ${name}_${s}.png (node tools/pixel-art.mjs)`);
  for (const name of [...pack.bg, ...pack.ui]) if (!existsSync(`${root}assets/pixel/${id}/${name}.png`)) errors.push(`${id}: falta ${name}.png`);
}
for (const urls of Object.values(SFX_SAMPLES)) for (const u of urls) if (!existsSync(root + u)) errors.push(`falta ${u} (node tools/sfx-import.mjs)`);
for (const t of MUSIC_TRACKS) if (!existsSync(`${root}assets/musica/${t}.mp3`)) errors.push(`falta la música assets/musica/${t}.mp3`);
for (const t of [...PIECE_TYPES, ...BOSS_IDS.map((b) => 'boss-' + b)]) if (!BODIES[t]) errors.push(`${t}: sin cuerpo vectorial (node tools/vector-art.mjs)`);

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`arte ok: ${Object.keys(PIXEL_PACKS).length} temas píxel, ${Object.values(SFX_SAMPLES).flat().length} tomas de sonido, ${Object.keys(BODIES).length} figuras vectoriales`);
