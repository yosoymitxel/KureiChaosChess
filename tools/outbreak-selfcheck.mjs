// Brote: node tools/outbreak-selfcheck.mjs
// Cada mesa se puede limpiar con las dosis que da, y la cadena solo contagia lo que la pieza ataca.
import { newOutbreak, fewest, chain, dose, DIFFS } from '../src/game/outbreak.js';

const errors = [];
for (const k of Object.keys(DIFFS)) for (let i = 0; i < 12; i++) {
  const s = newOutbreak(k);
  if (fewest(s) > s.doses) errors.push(`${k}: no alcanza con ${s.doses} dosis`);
  const w = chain(s, s.pieces[0]);
  if (w[0][0] !== s.pieces[0] || new Set(w.flat()).size !== w.flat().length) errors.push(`${k}: la cadena repite piezas`);
  const p = s.pieces.find((x) => x.type === 'rook');
  if (p) dose(s, p);
  if (p && !p.sick) errors.push(`${k}: la dosis no contagia a la pieza tocada`);
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exit(1); }
console.log('brote OK');
