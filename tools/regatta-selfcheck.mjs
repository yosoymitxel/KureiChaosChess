// Regata: cada partida termina, un jugador con pulso humano gana a menudo en cada nivel y soplar
// siempre a tope hacia la boya no gana. `node tools/regatta-selfcheck.mjs` → una línea si va bien.
import { mulberry32 } from '../src/core/rng.js';
import { plan } from '../src/game/golf.js';
import { newRegatta, shoot, step, DIFFS } from '../src/game/regatta.js';

const fails = [], rows = [];
const play = (level, seed, pick) => {
  const rng = mulberry32(seed), s = newRegatta(level, rng);
  for (let i = 0; i < 8000 && !s.over; i++) {
    if (!s.moving && !s.wait && s.turn === 0) { const [a, p] = pick(s, rng); shoot(s, a, p); }
    step(s, 1 / 20);
  }
  if (!s.over) fails.push(`${level} semilla ${seed}: la regata no termina`);
  return s.over === 'win';
};
const human = (err) => (s, rng) => { const p = plan(s.course, s.boats[0], s.t); return [p.ang + (rng() * 2 - 1) * err, p.pow * (1 + (rng() * 2 - 1) * err * 2)]; };
const blast = (s) => [Math.atan2(s.course.cup.y - s.boats[0].y, s.course.cup.x - s.boats[0].x), 1];
const rate = (n, f) => { let w = 0; for (let k = 1; k <= n; k++) w += f(k) ? 1 : 0; return w / n; };

for (const level of Object.keys(DIFFS)) {
  const want = { facil: 0.6, normal: 0.45, dificil: 0.3 }[level], top = { facil: 1, normal: 0.9, dificil: 0.75 }[level];
  const w = rate(20, (seed) => play(level, seed, human(0.05)));
  rows.push(`${level} pulso humano ${Math.round(w * 100)}%`);
  if (w < want || w > top) fails.push(`${level}: con pulso humano gana ${Math.round(w * 100)} % (entre ${want * 100} y ${top * 100} %)`);
  const b = rate(20, (seed) => play(level, seed, blast));
  rows.push(`${level} a tope ${Math.round(b * 100)}%`);
  if (b > 0.3) fails.push(`${level}: soplar a tope hacia la boya gana ${Math.round(b * 100)} %`);
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (fails.length) { console.log('Regata:\n' + fails.join('\n')); process.exit(1); }
console.log(`regata ok: ${rows.join(' · ')}`);
