// Genera problemas de mate real: node tools/mates-gen.mjs > src/data/mates.js
// Conserva las posiciones ya válidas y completa mate en dos hasta 20.
// Cada posición debe empezar con ambos reyes a salvo y tener una única primera jugada
// que fuerce jaque mate legal en exactamente el número anunciado de jugadas.
import { MATES as EXISTING } from '../src/data/mates.js';
import { fromSpec, inCheck, mateKeys as keys, SIZE } from '../src/game/mates.js';

const WANT_ONE = 15;
const WANT_TWO = 20;
const LIGHT = ['rook', 'knight', 'bishop', 'queen', 'camel', 'cannon', 'guard', 'advisor', 'elephant'];
const DARK = ['pawn', 'pawn', 'rook', 'knight', 'bishop'];
let seed = +(process.argv[2] || 11);
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const valid = (spec, n) => {
  const ps = fromSpec(spec);
  return !inCheck(ps, 'light') && !inCheck(ps, 'dark') && keys(ps, n).length === 1;
};
const signature = (spec) => JSON.stringify(spec);
const found = {
  1: (EXISTING['1'] || []).filter((spec) => valid(spec, 1)).slice(0, WANT_ONE),
  2: (EXISTING['2'] || []).filter((spec) => valid(spec, 2)).slice(0, WANT_TWO),
};
const seen = new Set([...found[1], ...found[2]].map(signature));
for (let i = 0; i < 8000000 && (found[1].length < WANT_ONE || found[2].length < WANT_TWO); i++) {
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
  const sig = signature(spec);
  if (seen.has(sig)) continue;
  if (!spec.some(([t, color]) => color === 'light' && !['rook', 'queen', 'king'].includes(t))) continue;
  const ps = fromSpec(spec);
  if (inCheck(ps, 'light') || inCheck(ps, 'dark')) continue;
  const one = keys(ps, 1).length;
  if (one === 1 && found[1].length < WANT_ONE) {
    found[1].push(spec); seen.add(sig);
  } else if (!one && found[2].length < WANT_TWO && keys(ps, 2).length === 1) {
    found[2].push(spec); seen.add(sig);
  }
}
if (found[1].length < WANT_ONE || found[2].length < WANT_TWO) {
  throw new Error(`No se encontraron suficientes problemas válidos: mate en 1=${found[1].length}/${WANT_ONE}, mate en 2=${found[2].length}/${WANT_TWO}`);
}
console.log('// Generado con tools/mates-gen.mjs: [tipo, bando, fila, columna] en 6×6; mate legal forzado.');
console.log(`export const MATES = ${JSON.stringify(found)};`);
