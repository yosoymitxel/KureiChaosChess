// Genera los problemas de Mate en 1 y 2: `node tools/mates-gen.mjs > src/data/mates.js`.
// Filtros: el rey carmesí empieza a salvo, la jugada final da jaque (nada de ahogados),
// hay una sola jugada que resuelve y un mate en 2 no se resuelve en 1.
import { fromSpec, moves, capturesKing, mateKeys as keys, SIZE } from '../src/game/mates.js';

const WANT = 15;
const LIGHT = ['rook', 'knight', 'bishop', 'queen', 'camel', 'cannon', 'guard', 'advisor', 'elephant'];
const DARK = ['pawn', 'pawn', 'rook', 'knight', 'bishop'];
let seed = +(process.argv[2] || 11);
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const found = { 1: [], 2: [] };
for (let i = 0; i < 400000 && (found[1].length < WANT || found[2].length < WANT); i++) {
  const used = new Set(), spec = [];
  const put = (t, color, rows) => {
    for (;;) {
      const r = rows[Math.floor(rnd() * rows.length)], c = Math.floor(rnd() * SIZE);
      if (!used.has(r * 9 + c)) { used.add(r * 9 + c); spec.push([t, color, r, c]); return; }
    }
  };
  put('king', 'dark', [0, 1]); put('king', 'light', [5]);
  for (let k = 0; k < 2; k++) put(LIGHT[Math.floor(rnd() * LIGHT.length)], 'light', [2, 3, 4, 5]);
  for (let k = 0; k < 1 + Math.floor(rnd() * 3); k++) { const t = DARK[Math.floor(rnd() * DARK.length)]; put(t, 'dark', t === 'pawn' ? [1, 2] : [0, 1, 2]); }
  if (!spec.some(([t, color]) => color === 'light' && !['rook', 'queen', 'king'].includes(t))) continue;
  const ps = fromSpec(spec);
  if (capturesKing(ps) || moves(ps, 'dark').some(({ m }) => m.hits.some((h) => h.type === 'king'))) continue;
  const one = keys(ps, 1).length;
  if (one === 1 && found[1].length < WANT) found[1].push(spec);
  else if (!one && found[2].length < WANT && keys(ps, 2).length === 1) found[2].push(spec);
}
console.log('// Generado con tools/mates-gen.mjs: [tipo, bando, fila, columna] en 6×6, mueve marfil.');
console.log(`export const MATES = ${JSON.stringify(found)};`);
