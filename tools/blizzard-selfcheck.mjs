// Ventisca: node tools/blizzard-selfcheck.mjs
// Cada mesa al azar tiene solución dentro de las jugadas y resbalar respeta bloques, agujeros y borde.
import { newBlizzard, slide, shortest, DIFFS } from '../src/game/blizzard.js';

const errors = [];
for (const k of Object.keys(DIFFS)) for (let i = 0; i < 60; i++) {
  const s = newBlizzard(k);
  if (!(s.best <= s.limit) || shortest(s) !== s.best) errors.push(`${k}: mesa sin solución dentro del límite`);
  for (let dir = 0; dir < 4; dir++) {
    const res = slide(s, s.at[0], s.at[1], dir);
    if (res.path.some(([r, c]) => s.blocks.has(`${r},${c}`))) errors.push(`${k}: atravesó un bloque`);
    if (res.path.some(([r, c], j) => s.holes.has(`${r},${c}`) && j < res.path.length - 1)) errors.push(`${k}: siguió tras un agujero`);
  }
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exit(1); }
console.log('ventisca OK');
