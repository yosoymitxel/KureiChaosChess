// Billar: las partidas terminan, un jugador con buen pulso le gana a la máquina según el nivel y tirar
// siempre recto arriba a tope no gana. `node tools/pool-selfcheck.mjs [--all]`.
import { mulberry32 } from '../src/core/rng.js';
import { newCarrom, plan, shoot, step, TABLES } from '../src/game/carrom.js';

const DIFFS = TABLES.rect.diffs;

const fails = [], rows = [];
const play = (level, seed, pick) => {
  const rng = mulberry32(seed), s = newCarrom(level, rng, { table: 'rect' });
  for (let i = 0; i < 40000 && !s.over; i++) {
    if (s.turn === 'me' && s.phase === 'aim') { const [a, p] = pick(s, rng); shoot(s, a, p); }
    step(s, 1 / 20);
  }
  if (!s.over) fails.push(`${level} semilla ${seed}: la partida no termina`);
  return s;
};
const you = (err, d) => (s, rng) => { const p = plan(s, 'me', d); return [p.ang + (rng() * 2 - 1) * err, p.pow * (1 + (rng() * 2 - 1) * err * 2)]; };
const straight = () => [-Math.PI / 2, 1];
const rate = (n, f) => { let w = 0, turns = 0; for (let k = 1; k <= n; k++) { const s = f(k); w += s.over === 'win' ? 1 : 0; turns += s.turns; } return [w / n, turns / n]; };

const goal = { facil: [0.6, 1], normal: [0.2, 0.85], dificil: [0.05, 0.7] };
for (const level of Object.keys(DIFFS)) {
  const [w, t] = rate(24, (seed) => play(level, seed, you(0.04, DIFFS.normal)));
  rows.push(`${level}: buen pulso ${Math.round(w * 100)}% (${Math.round(t)} turnos)`);
  if (w < goal[level][0] || w > goal[level][1]) fails.push(`${level}: el buen pulso gana ${Math.round(w * 100)} % (esperado ${goal[level].map((x) => x * 100).join('–')} %)`);
  const [b] = rate(12, (seed) => play(level, seed, straight));
  rows.push(`${level}: recto a tope ${Math.round(b * 100)}%`);
  if (level !== 'facil' && b > 0.25) fails.push(`${level}: tirar recto a tope gana ${Math.round(b * 100)} %`);
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (fails.length) { console.log('Billar:\n' + fails.join('\n') + '\n' + rows.join(' · ')); process.exit(1); }
console.log('billar ok: ' + rows.join(' · '));
