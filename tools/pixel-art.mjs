// Incrusta el set de pxl (art/pixelada.px.js) en un módulo de la app: los PNG como data URI
// y el tamaño en píxeles de arte de cada pieza. El arte se edita en el .px.js; acá solo se copia.
// Reconstruir:  node <pxl>/bin/pxl.js build art/pixelada.px.js  &&  node <pxl>/bin/pxl.js build art/jefes.px.js
//               &&  node tools/pixel-art.mjs   (los dos escriben en art/out/sprites)
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../art/out/sprites/', import.meta.url));
const DEST = fileURLToPath(new URL('../src/view/pixel-pieces.js', import.meta.url));

const files = (await readdir(SRC)).filter((f) => f.endsWith('.png')).sort();
const pieces = {};
for (const file of files) {
  // El nombre puede traer guion (los jefes son boss-titan, boss-ram, ...).
  const m = file.match(/^(.+)_([ldw])\.png$/);
  if (!m) throw new Error(`sprite sin pieza o bando: ${file}`);
  const [, piece, side] = m;
  const buf = await readFile(SRC + file);
  // Cabecera IHDR: el tamaño sale del PNG para no repetirlo a mano.
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  const prev = (pieces[piece] ||= { w, h, sides: {} });
  if (prev.w !== w || prev.h !== h) throw new Error(`${piece}: los bandos no miden igual`);
  prev.sides[side] = 'data:image/png;base64,' + buf.toString('base64');
}

const meta = {}, art = {};
for (const [piece, p] of Object.entries(pieces)) {
  meta[piece] = { w: p.w, h: p.h };
  art[piece] = p.sides;
}

await writeFile(DEST, `// Generado por tools/pixel-art.mjs desde art/pixelada.px.js: no editar a mano.
// Lado y alto en píxeles de arte (ya incluyen el contorno) y el PNG de cada bando.
export const PIXEL_META = ${JSON.stringify(meta, null, 2)};

export const PIXEL_PIECES = ${JSON.stringify(art, null, 2)};
`);
console.log(`pixel-pieces.js: ${Object.keys(art).length} piezas, ${files.length} sprites`);
