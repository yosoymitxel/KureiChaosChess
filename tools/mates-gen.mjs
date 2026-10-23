// Genera problemas de mate real: node tools/mates-gen.mjs > src/data/mates.js
// Cada posición debe empezar con ambos reyes a salvo y tener una única primera jugada
// que fuerce jaque mate legal en exactamente el número anunciado de jugadas.
import { fromSpec, inCheck, mateKeys as keys, SIZE } from '../src/game/mates.js';

const WANT = 15;
const LIGHT = ['rook', 'knight', 'bishop', 'queen', 'camel', 'cannon', 'guard', 'advisor', 'elephant'];
const DARK = ['pawn', 'pawn', 'rook', 'knight', 'bishop'];
let seed = +(process.argv[2] || 11);
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const found = { 1: [], 2: [] };
for (let i = 0; i < 4000000 && (found[1].length < WANT || found[2].length < WANT); i++) {
  const used = new Set(), spec = [];
  const put = (t, color, rows) => {
    for (;;) {
      const r = rows[Math.floor(rnd() * rows.length)], c = Math.floor(rnd() * SIZE);
      if (!used.has(r * 9 + c)) { used.add(r * 9 + c); spec.push([t, color, r, c]); return; }
    }
  };
  put('king', 'dark', [0, 1]); put('king', 'light', [5]);
  for (let k = 0; k < 2; k++) put(LIGHT[Math.floor(rnd() * LIGHT.length)], 'light', [2, 3, 4, 5]);
  for (let k = 0; k < 1 + Math.floor(rnd() * 3); k++) {
    const t = DARK[Math.floor(rnd() * DARK.length)];
    put(t, 'dark', t === 'pawn' ? [1, 2] : [0, 1, 2]);
  }
  if (!spec.some(([t, color]) => color === 'light' && !['rook', 'queen', 'king'].includes(t))) continue;
  const ps = fromSpec(spec);
  if (inCheck(ps, 'light') || inCheck(ps, 'dark')) continue;
  const one = keys(ps, 1).length;
  if (one === 1 && found[1].length < WANT) found[1].push(spec);
  else if (!one && found[2].length < WANT && keys(ps, 2).length === 1) found[2].push(spec);
}
if (found[1].length < WANT || found[2].length < WANT) {
  throw new Error(`No se encontraron suficientes problemas válidos: mate en 1=${found[1].length}/${WANT}, mate en 2=${found[2].length}/${WANT}`);
}
console.log('// Generado con tools/mates-gen.mjs: [tipo, bando, fila, columna] en 6×6; mate legal forzado.');
console.log(`export const MATES = ${JSON.stringify(found)};`);
