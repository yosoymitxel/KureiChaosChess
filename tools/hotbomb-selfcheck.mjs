// Papa caliente: las partidas terminan, quien apunta bien le gana al bot según el nivel y tirar al
// azar no gana en normal y difícil. `node tools/hotbomb-selfcheck.mjs [--all]`.
import { mulberry32 } from '../src/core/rng.js';
import { newHotbomb, hurl, plan, step, holder, alive, DIFFS } from '../src/game/hotbomb.js';

const fails = [], rows = [];
const play = (level, seed, pick) => {
  const rng = mulberry32(seed), s = newHotbomb(level, rng);
  let wait = 0;
  for (let i = 0; i < 40000 && !s.over; i++) {
    const h = holder(s);
    if (s.phase === 'hold' && h?.side === 'me' && (wait += 1 / 30) > 0.8) { const [x, y, e] = pick(s, rng); hurl(s, x, y, 'me', e); wait = 0; }
    step(s, 1 / 30);
  }
  if (!s.over) fails.push(`${level} semilla ${seed}: la partida no termina`);
  return s;
};
const aim = (s) => { const p = plan(s, 'me'); return [p.x, p.y, 0.08]; };
const blind = (s, rng) => { const p = alive(s)[Math.floor(rng() * alive(s).length)]; return [p.x, p.y, 0.08]; };
const rate = (n, f) => { let w = 0; for (let k = 1; k <= n; k++) w += f(k).over === 'win' ? 1 : 0; return w / n; };

const goal = { facil: [0.6, 1], normal: [0.3, 0.9], dificil: [0.1, 0.75] };
for (const level of Object.keys(DIFFS)) {
  const w = rate(40, (seed) => play(level, seed, aim));
  rows.push(`${level}: apuntando ${Math.round(w * 100)}%`);
  if (w < goal[level][0] || w > goal[level][1]) fails.push(`${level}: apuntando gana ${Math.round(w * 100)} % (esperado ${goal[level].map((x) => x * 100).join('–')} %)`);
  const b = rate(30, (seed) => play(level, seed, blind));
  rows.push(`${level}: al azar ${Math.round(b * 100)}%`);
  if (level !== 'facil' && b > 0.35) fails.push(`${level}: tirar al azar gana ${Math.round(b * 100)} %`);
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (fails.length) { console.log('Papa caliente:\n' + fails.join('\n') + '\n' + rows.join(' · ')); process.exit(1); }
console.log('papa caliente ok: ' + rows.join(' · '));
