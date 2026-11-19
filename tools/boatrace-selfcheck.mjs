// Carrera de barquitos: termina siempre, un piloto que sigue las boyas con un pulso imperfecto gana
// a menudo con el barco más barato, y quedarse quieto no gana. `node tools/boatrace-selfcheck.mjs`.
import { mulberry32 } from '../src/core/rng.js';
import { newRace, step, aim, DIFFS, TRACKS, makeTrack } from '../src/game/boatrace.js';

const fails = [], rows = [];
const play = (kind, level, seed, pilot) => {
  const rng = mulberry32(seed), s = newRace(kind, level, rng);
  for (let i = 0; i < 60 * 300 && !s.over; i++) step(s, 1 / 60, pilot(s, rng));
  if (!s.over) fails.push(`${level} semilla ${seed}: no termina`);
  return s.over === 'win';
};
const human = (err) => (s, rng) => ({ aim: aim(s, s.racers[0]) + (rng() * 2 - 1) * err, mag: 1 });
const idle = () => null;
// Cada forma, en cada nivel: la salida y todas las boyas en agua.
for (const level of Object.keys(DIFFS)) for (const type of Object.keys(TRACKS)) for (let k = 1; k <= 4; k++) {
  const t = makeTrack(DIFFS[level], mulberry32(k * 7), type);
  const bad = t.gates.filter((g) => !t.inside(g.x, g.y)).length;
  if (bad || !t.inside(t.line[0].x, t.line[0].y)) fails.push(`${level} ${type} ${k}: ${bad} boyas fuera del agua`);
}
const rate = (f) => { let w = 0; for (let k = 1; k <= 20; k++) w += f(k) ? 1 : 0; return w / 20; };
for (const level of Object.keys(DIFFS)) {
  const [lo, hi] = { facil: [0.75, 1], normal: [0.45, 0.95], dificil: [0.2, 0.75] }[level];
  const w = rate((k) => play('papel', level, k, human(0.2)));
  rows.push(`${level} ${Math.round(w * 100)}%`);
  if (w < lo || w > hi) fails.push(`${level}: el piloto gana ${Math.round(w * 100)} % (entre ${lo * 100} y ${hi * 100})`);
  if (rate((k) => play('papel', level, k, idle)) > 0) fails.push(`${level}: quieto gana`);
}
const koi = rate((k) => play('koi', 'normal', k, human(0.2)));
rows.push(`koi normal ${Math.round(koi * 100)}%`);
if (fails.length) { console.log('Carrera:\n' + fails.join('\n')); process.exit(1); }
console.log(`carrera ok: ${rows.join(' · ')}`);
