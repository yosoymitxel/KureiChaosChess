// Damas a ciegas: node tools/blind-selfcheck.mjs
// Reglas básicas y que cada dificultad se pueda ganar jugando sin ver (damas al azar, cada una
// apuntando a su línea más larga): entre el 20 % y el 95 % de victorias.
import { newBlind, place, fire, ray, DIFFS } from '../src/game/blind.js';

const errors = [];
const s0 = newBlind('normal', () => 0.5);
place(s0, 0, 0); place(s0, 0, 0);
if (s0.mine.length !== 1 || s0.mine[0].dir !== 5) errors.push('tocar una dama propia tiene que girarla 45°');
for (const k of Object.keys(DIFFS)) {
  let w = 0;
  const N = 300;
  for (let g = 0; g < N; g++) {
    const s = newBlind(k);
    while (!s.over) {
      const free = [];
      for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) free.push([r, c]);
      const spots = free.sort(() => Math.random() - 0.5);
      if (!s.volley) for (let i = 0; i < s.diff.mine; i++) place(s, ...spots[i]);
      else s.mine.forEach((q, i) => Object.assign(q, { row: spots[i][0], col: spots[i][1] }));
      for (const q of s.mine) q.dir = [...Array(8).keys()].sort((a, b) => ray(s, { ...q, dir: b }, s.mine).length - ray(s, { ...q, dir: a }, s.mine).length)[0];
      const before = s.mine.length + s.foes, res = fire(s);
      if (res.foes.some((f) => s.mine.some((q) => q.row === f.row && q.col === f.col))) errors.push(`${k}: una rival salió encima de una dama`);
      if (s.mine.length + s.foes !== before + res.foes.length - res.foes.length - res.dead.length) errors.push(`${k}: las bajas no cuadran`);
    }
    if (s.over === 'win') w++;
  }
  const pct = Math.round((100 * w) / N);
  if (pct < 20 || pct > 95) errors.push(`${k}: gana el ${pct} % (fuera de 20–95)`);
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exit(1); }
console.log('damas a ciegas OK');
