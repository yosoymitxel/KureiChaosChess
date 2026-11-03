// Bolos: las partidas terminan, un jugador con buen pulso le gana al bot según el nivel y tirar a ciegas
// no basta en normal ni en difícil. `node tools/tenpin-selfcheck.mjs [--all]`.
import { mulberry32 } from '../src/core/rng.js';
import { newTenpin, plan, place, shoot, step, total, W, DIFFS } from '../src/game/tenpin.js';

const fails = [], rows = [];
const play = (level, seed, pick) => {
  const rng = mulberry32(seed), s = newTenpin(level, rng);
  for (let i = 0; i < 40000 && !s.over; i++) {
    if (s.turn === 'me' && s.phase === 'aim') { const [x, a, p] = pick(s, rng); place(s, x); shoot(s, a, p); }
    step(s, 1 / 20);
  }
  if (!s.over) fails.push(`${level} semilla ${seed}: la partida no termina`);
  return s;
};
const you = (err) => (s, rng) => { const p = plan(s); return [p.x + (rng() * 2 - 1) * 4, p.ang + (rng() * 2 - 1) * err, p.pow]; };
const blind = (s, rng) => [W / 2 + (rng() * 2 - 1) * 20, -Math.PI / 2 + (rng() * 2 - 1) * 0.12, 0.8];
const rate = (n, f) => { let w = 0, pins = 0; for (let k = 1; k <= n; k++) { const s = f(k); w += s.over === 'win' ? 1 : 0; pins += total(s, 'me'); } return [w / n, pins / n]; };

const goal = { facil: [0.6, 1], normal: [0.3, 0.85], dificil: [0.1, 0.7] };
for (const level of Object.keys(DIFFS)) {
  const [w, p] = rate(12, (seed) => play(level, seed, you(0.03)));
  rows.push(`${level}: buen pulso ${Math.round(w * 100)}% (${Math.round(p)} bolos)`);
  if (w < goal[level][0] || w > goal[level][1]) fails.push(`${level}: el buen pulso gana ${Math.round(w * 100)} % (esperado ${goal[level].map((x) => x * 100).join('–')} %)`);
  const [b] = rate(6, (seed) => play(level, seed, blind));
  rows.push(`${level}: a ciegas ${Math.round(b * 100)}%`);
  if (level !== 'facil' && b > 0.3) fails.push(`${level}: tirar a ciegas gana ${Math.round(b * 100)} %`);
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (fails.length) { console.log('Bolos:\n' + fails.join('\n') + '\n' + rows.join(' · ')); process.exit(1); }
console.log('bolos ok: ' + rows.join(' · '));
