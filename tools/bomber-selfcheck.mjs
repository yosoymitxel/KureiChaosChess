// Bomberman: los enemigos presionan (quedarse quieto en la esquina acaba mal en Normal y Difícil),
// los cañones vuelan cajas para llegar a ti y casi nunca se matan con su propia bomba.
// `node tools/bomber-selfcheck.mjs [--all]` → una línea si va bien; la lista y código 1 si no.
import { newBomber, tick } from '../src/game/bomber.js';
import { mulberry32 } from '../src/core/rng.js';

const fails = [], rows = [];
const want = { facil: [0.3, 0], normal: [0.7, 1], dificil: [0.85, 2] }; // muerte mínima quieto, cajas voladas mínimas
for (const [lv, [die, crates]] of Object.entries(want)) {
  let dead = 0, blown = 0, self = 0;
  for (let k = 1; k <= 40; k++) {
    const s = newBomber(mulberry32(k), lv), c0 = s.cells.flat().filter((x) => x === 'crate').length;
    for (let i = 0; i < 400 && !s.over; i++) {
      const n = s.enemies.filter((e) => e.type === 'cannon').length;
      tick(s, mulberry32(k * 99 + i));
      self += n - s.enemies.filter((e) => e.type === 'cannon').length;
    }
    dead += s.over === 'lose' ? 1 : 0;
    blown += c0 - s.cells.flat().filter((x) => x === 'crate').length;
  }
  rows.push(`${lv}: quieto muere ${Math.round((dead / 40) * 100)}% · cajas voladas ${(blown / 40).toFixed(1)} · cañones caídos ${self}`);
  if (dead / 40 < die) fails.push(`${lv}: quedarse quieto solo muere el ${Math.round((dead / 40) * 100)} % (mínimo ${die * 100} %)`);
  if (blown / 40 < crates) fails.push(`${lv}: los enemigos apenas vuelan cajas (${(blown / 40).toFixed(1)})`);
  if (self > 8) fails.push(`${lv}: ${self} cañones se mataron con su bomba`);
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (fails.length) { console.log('Bomberman:\n' + fails.join('\n')); process.exit(1); }
console.log('bomberman ok: ' + rows.join(' · '));
