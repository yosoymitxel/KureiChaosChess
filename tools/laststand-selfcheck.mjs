// Última resistencia: cada nivel es pasable con buena colocación y ninguna pieza sola gana casi siempre
// colocada al azar (el muro de peones a precio 1 ganaba el 96 %). `node tools/laststand-selfcheck.mjs`
import * as L from '../src/game/laststand.js';
import { mulberry32 } from '../src/core/rng.js';

const R = mulberry32(7);
const pick = (a) => a[Math.floor(R() * a.length)];
const cells = [];
for (let r = L.ROWS - 3; r < L.ROWS; r++) for (let c = 0; c < L.COLS; c++) cells.push([r, c]);
const TYPES = Object.keys(L.PRICES);

const spend = (s, only) => { for (let k = 0; k < 40; k++) { const [r, c] = pick(cells); L.place(s, pick(only), r, c); } };
function play(diff, seed, only, plan) {
  const s = L.newStand(diff), rng = mulberry32(seed);
  for (const [t, r, c] of plan) L.place(s, t, r, c);
  for (let guard = 0; !s.over && guard < 500; guard++) {
    if (!L.building(s)) { L.step(s); continue; }
    if (s.phase === 'between') spend(s, only);
    L.nextWave(s, rng);
  }
  return s.over === 'win';
}
function randomPlan(diff, only) {
  const plan = [], used = new Set();
  let b = L.DIFFS[diff].budget;
  for (let k = 0; k < 40; k++) {
    const t = pick(only), cell = pick(cells);
    if (L.PRICES[t] > b || used.has(cell + '')) continue;
    used.add(cell + ''); plan.push([t, ...cell]); b -= L.PRICES[t];
  }
  return plan;
}
// Media al azar y mejor plan de 40 intentos, 20 asaltos cada uno.
function measure(diff, only) {
  let avg = 0, best = 0;
  for (let i = 0; i < 40; i++) {
    const plan = randomPlan(diff, only);
    let w = 0;
    for (let g = 0; g < 20; g++) w += play(diff, 100 + g, only, plan);
    avg += w / 20 / 40; best = Math.max(best, w / 20);
  }
  return { avg, best };
}

const fails = [];
for (const diff of Object.keys(L.DIFFS)) {
  const mix = measure(diff, TYPES);
  if (mix.best < 0.6) fails.push(`${diff}: el mejor plan solo gana ${(mix.best * 100).toFixed(0)} %`);
}
for (const t of TYPES) {
  const { avg } = measure('normal', [t]);
  if (avg > 0.8) fails.push(`normal: solo ${t} al azar gana ${(avg * 100).toFixed(0)} %`);
}
if (fails.length) { console.log('Última resistencia:\n' + fails.join('\n')); process.exit(1); }
console.log('Última resistencia OK: pasable en cada nivel y sin pieza dominante');
