// Golf: cada hoyo tiene par válido (el golfista codicioso lo emboca), un jugador con pulso humano
// (error de dirección y de fuerza) gana a menudo en cada nivel y tirar siempre a tope al hoyo no gana.
// `node tools/golf-selfcheck.mjs` → una línea si va bien; la lista y código 1 si no.
import { mulberry32 } from '../src/core/rng.js';
import { newGolf, plan, shoot, step, makeHole, DIFFS, HOLES } from '../src/game/golf.js';

const fails = [], rows = [];
const play = (level, seed, pick) => {
  const rng = mulberry32(seed), s = newGolf(level, rng);
  for (let i = 0; i < 4000 && !s.over; i++) {
    if (!s.moving && !s.wait) { const [a, p] = pick(s, rng); shoot(s, a, p); }
    step(s, 1 / 20);
  }
  if (!s.over) fails.push(`${level} semilla ${seed}: la partida no termina`);
  return s.over === 'win';
};
const human = (err) => (s, rng) => { const p = plan(s.course, s.ball, s.t); return [p.ang + (rng() * 2 - 1) * err, p.pow * (1 + (rng() * 2 - 1) * err * 2)]; };
const blast = (s) => [Math.atan2(s.course.cup.y - s.ball.y, s.course.cup.x - s.ball.x), 1];
const rate = (n, f) => { let w = 0; for (let k = 1; k <= n; k++) w += f(k) ? 1 : 0; return w / n; };

for (const level of Object.keys(DIFFS)) {
  for (let k = 1; k <= 10; k++) { const h = makeHole(DIFFS[level], mulberry32(1000 + k)); if (!h.par || h.par > 6) fails.push(`${level}: hoyo ${k} sin par válido`); }
  const want = { facil: 0.75, normal: 0.45, dificil: 0.25 }[level];
  const w = rate(12, (seed) => play(level, seed, human(0.05)));
  rows.push(`${level} pulso humano ${Math.round(w * 100)}%`);
  if (w < want) fails.push(`${level}: con pulso humano gana ${Math.round(w * 100)} % (mínimo ${want * 100} %)`);
  const b = rate(12, (seed) => play(level, seed, blast));
  rows.push(`${level} a tope al hoyo ${Math.round(b * 100)}%`);
  if (b > 0.3) fails.push(`${level}: tirar a tope al hoyo gana ${Math.round(b * 100)} %`);
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (fails.length) { console.log('Golf:\n' + fails.join('\n')); process.exit(1); }
console.log(`golf ok: ${HOLES} hoyos con par válido, ${rows.join(' · ')}`);
