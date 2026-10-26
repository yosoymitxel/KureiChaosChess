// Brote: un puzle de reacción en cadena (referencia: Dr. Mario, NES: limpiar todos los virus). El
// tablero está lleno de piezas carmesí y tienes unas pocas dosis. Una dosis contagia a la pieza
// tocada; cada contagiada contagia a las que ataca según su forma de moverse (la torre en línea, el
// caballo en L, el peón en diagonal hacia abajo…), y así en cadena. Hay que contagiarlas a todas.
import { canHit, ctxOf } from './rules.js';

const TYPES = ['pawn', 'pawn', 'pawn', 'knight', 'bishop', 'rook', 'guard', 'advisor', 'queen'];
export const DIFFS = {
  facil: { name: 'Fácil', n: 6, pieces: 9, spare: 1 },
  normal: { name: 'Normal', n: 7, pieces: 12, spare: 0 },
  dificil: { name: 'Difícil', n: 8, pieces: 15, spare: 0 },
};

// La cadena que desata contagiar `seed`: oleadas de piezas (la primera es la propia `seed`).
export function chain(s, seed, sick = new Set(s.pieces.filter((p) => p.sick))) {
  const board = { rows: s.n, cols: s.n, holes: new Set(), terrain: new Map(), portals: new Map() };
  const waves = [[seed]], done = new Set([...sick, seed]);
  let front = [seed];
  while (front.length) {
    // Las contagiadas atacan como si fueran de otro bando; las sanas, carmesí.
    const view = s.pieces.map((p) => ({ ...p, color: done.has(p) ? 'light' : 'dark', src: p }));
    const ctx = ctxOf(view, board), next = [];
    for (const f of front) {
      const me = view.find((v) => v.src === f);
      for (const v of view) if (v.color === 'dark' && !next.includes(v.src) && canHit(me, v, ctx)) next.push(v.src);
    }
    for (const p of next) done.add(p);
    if (next.length) waves.push(next);
    front = next;
  }
  return waves;
}

// Menos dosis con las que se contagian todas (prueba combinaciones de 1 a 3).
export function fewest(s) {
  const all = s.pieces.length, healthy = s.pieces;
  const spread = (seeds) => { const sick = new Set(); for (const x of seeds) if (!sick.has(x)) for (const w of chain(s, x, sick)) for (const p of w) sick.add(p); return sick.size; };
  for (let k = 1; k <= 3; k++) {
    const pick = (start, chosen) => {
      if (chosen.length === k) return spread(chosen) === all;
      for (let i = start; i < healthy.length; i++) if (pick(i + 1, [...chosen, healthy[i]])) return true;
      return false;
    };
    if (pick(0, [])) return k;
  }
  return Infinity;
}

export function newOutbreak(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  for (let tries = 0; ; tries++) {
    const cells = [];
    for (let r = 0; r < diff.n; r++) for (let c = 0; c < diff.n; c++) cells.push([r, c]);
    const pieces = Array.from({ length: diff.pieces }, (_, i) => {
      const [row, col] = cells.splice(Math.floor(rng() * cells.length), 1)[0];
      return { id: 'v' + i, type: TYPES[Math.floor(rng() * TYPES.length)], row, col, sick: false };
    });
    const s = { diff, n: diff.n, pieces, used: 0, over: null };
    const best = fewest(s);
    if (best === Infinity || (best < 2 && tries < 300)) continue;
    s.best = best;
    s.doses = best + diff.spare;
    return s;
  }
}

// Una dosis en `p`: devuelve las oleadas para animarlas.
export function dose(s, p) {
  if (s.over || p.sick || s.used >= s.doses) return null;
  const waves = chain(s, p);
  for (const w of waves) for (const x of w) x.sick = true;
  s.used += 1;
  if (s.pieces.every((x) => x.sick)) s.over = 'win';
  else if (s.used >= s.doses) s.over = 'lose';
  return waves;
}
