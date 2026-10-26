// La bruja: node tools/witch-selfcheck.mjs
// Laberinto conexo y que un rey prudente (va a la moneda más cercana sin pegarse a una bruja
// despierta, y a por ellas si están asustadas) gane entre el 20 % y el 95 % en cada dificultad.
import { newWitch, step, kingMoves, DIFFS } from '../src/game/witch.js';

const errors = [];
const near = (s, r, c) => s.witches.some((w) => w.out <= 0 && Math.abs(w.row - r) + Math.abs(w.col - c) <= 1);
function bfs(s, from, goal) {
  const seen = new Set([from.join()]), q = [[from, null]];
  while (q.length) {
    const [[r, c], first] = q.shift();
    if (goal(r, c) && first) return first;
    for (const [a, b] of kingMoves({ ...s, king: { row: r, col: c } })) if (!seen.has(a + ',' + b) && (s.scared || !near(s, a, b))) { seen.add(a + ',' + b); q.push([[a, b], first || [a, b]]); }
  }
  return null;
}
for (const key of Object.keys(DIFFS)) {
  let won = 0;
  const N = 200;
  for (let g = 0; g < N; g++) {
    const s = newWitch(key);
    if (s.coins.size !== s.diff.coins) errors.push(`${key}: faltan monedas`);
    for (let t = 0; t < 400 && !s.over; t++) {
      const at = [s.king.row, s.king.col];
      const target = s.scared ? (r, c) => s.witches.some((w) => w.out <= 0 && w.row === r && w.col === c) || s.coins.has(r + ',' + c) : (r, c) => s.coins.has(r + ',' + c) || s.potions.has(r + ',' + c);
      const mv = bfs(s, at, target) || kingMoves(s).find(([r, c]) => !near(s, r, c)) || kingMoves(s)[0];
      step(s, ...mv);
    }
    if (s.over === 'win') won++;
  }
  const pct = Math.round((100 * won) / N);
  console.log(key, pct + '%');
  if (pct < 20 || pct > 95) errors.push(`${key}: gana el ${pct} %`);
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exit(1); }
console.log('la bruja OK');
