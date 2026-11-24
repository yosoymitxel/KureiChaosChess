// Antídoto (Brote): node tools/outbreak-selfcheck.mjs
// Cada mesa tiene solución con su cola de vacunas, la cadena solo cura lo que la forma ataca, deshacer
// deja la mesa como estaba, y ni al azar ni con "la cadena más larga cada vez" se gana casi siempre.
import { newOutbreak, chain, vaccinate, undo, play, clone, greedy, blind, preview, empties, DIFFS } from '../src/game/outbreak.js';
import { mulberry32 } from '../src/core/rng.js';

const errors = [], stats = [], N = 40;
// Pulso humano: mira la vacuna de turno y la siguiente (lo que enseña la cola) y elige la mejor pareja.
const ahead = (s, r, c) => {
  const t = clone(s);
  vaccinate(t, r, c);
  if (t.over || t.used >= t.queue.length) return t.pieces.filter((p) => !p.sick).length * 100;
  return t.pieces.filter((p) => !p.sick).length * 100 + Math.max(...empties(t).map(([a, b]) => preview(t, a, b).flat().length));
};
// …y si se queda sin vacunas, deshace la última y prueba la siguiente mejor (lo que dejan los deshacer del nivel).
const human = (s0, rng) => {
  const s = { ...clone(s0), undos: s0.diff.undos }, tried = [];
  while (!s.over) {
    if (s.stuck) { while (undo(s)); continue; } // vuelve tan atrás como le dejen y cambia esa vacuna
    tried.length = s.used + 1;
    const seen = (tried[s.used] ||= new Set()), cells = empties(s).filter(([r, c]) => !seen.has(r * 99 + c));
    const vals = cells.map(([r, c]) => ahead(s, r, c)), best = Math.max(...vals), top = cells.filter((_, i) => vals[i] === best);
    const [r, c] = top[Math.floor(rng() * top.length)];
    seen.add(r * 99 + c);
    vaccinate(s, r, c);
  }
  return s.over === 'win';
};
for (const k of Object.keys(DIFFS)) {
  let solved = 0, humanWins = 0, rand = 0, greed = 0;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) {
    const rng = mulberry32(i * 7 + k.length), s = newOutbreak(k, rng);
    const sol = clone(s);
    for (const [r, c] of s.solution) vaccinate(sol, r, c);
    if (sol.over === 'win') solved++;
    else errors.push(`${k}: la solución guardada no cura todo`);
    const w = chain(s, { id: 'x', type: 'rook', row: -9, col: -9, sick: false });
    if (w.length) errors.push(`${k}: una vacuna fuera del tablero cura algo`);
    // Deshacer devuelve la mesa exacta.
    const u = { ...clone(s), undos: 1 }, before = JSON.stringify(u.pieces);
    const [r0, c0] = s.solution[0];
    vaccinate(u, r0, c0);
    undo(u);
    if (JSON.stringify(u.pieces) !== before || u.used !== 0) errors.push(`${k}: deshacer no deja la mesa igual`);
    if (human(s, rng)) humanWins++;
    if (play(clone(s), greedy, rng)) greed++;
    for (let j = 0; j < 5; j++) if (play(clone(s), blind, rng)) rand += 1 / 5;
  }
  const pct = (n) => Math.round((100 * n) / N);
  stats.push(`${k}: solución ${pct(solved)}% · pulso humano ${pct(humanWins)}% · cadena más larga ${pct(greed)}% · al azar ${pct(rand)}% · ${Math.round((performance.now() - t0) / N)} ms/mesa`);
  if (pct(rand) > 12) errors.push(`${k}: al azar gana demasiado (${pct(rand)}%)`);
  if (k !== 'facil' && pct(greed) > 60) errors.push(`${k}: la cadena más larga gana casi siempre (${pct(greed)}%)`);
  if (pct(humanWins) < 40) errors.push(`${k}: el pulso humano casi nunca gana (${pct(humanWins)}%)`);
}
if (errors.length) { console.error([...new Set(errors)].join('\n') + '\n' + stats.join('\n')); process.exit(1); }
console.log('antídoto OK: ' + stats.join(' · '));
