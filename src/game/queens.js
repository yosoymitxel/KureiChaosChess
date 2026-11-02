// Ocho reinas: coloca N reinas sin que ninguna ataque a otra.
// Tablero y reloj juntos: más reinas con menos aire arriba, menos reinas con más tiempo abajo.
export const DIFFS = {
  facil: { name: 'Fácil', n: 6, seconds: 150 },
  normal: { name: 'Normal', n: 8, seconds: 120 },
  dificil: { name: 'Difícil', n: 10, seconds: 90 },
};

const attacks = (a, b) => a.r === b.r || a.c === b.c || Math.abs(a.r - b.r) === Math.abs(a.c - b.c);

// Una solución al azar (vuelta atrás con columnas barajadas).
function solution(n, rng) {
  const cols = [];
  const ok = (r, c) => cols.every((cc, rr) => cc !== c && Math.abs(cc - c) !== r - rr);
  const go = (r) => {
    if (r === n) return true;
    for (const c of [...Array(n).keys()].sort(() => rng() - 0.5)) if (ok(r, c)) { cols.push(c); if (go(r + 1)) return true; cols.pop(); }
    return false;
  };
  go(0);
  return cols.map((c, r) => ({ r, c }));
}

// Dos reinas ya puestas (de una solución al azar): con el tablero vacío bastaba memorizar una respuesta.
export const newQueens = (key = 'normal', rng = Math.random) => {
  const diff = DIFFS[key] || DIFFS.normal;
  const fixed = solution(diff.n, rng).sort(() => rng() - 0.5).slice(0, 2).map((q) => ({ ...q, fixed: true }));
  return { n: diff.n, seconds: diff.seconds, queens: fixed, over: null };
};

export const clashing = (s) => s.queens.filter((q) => s.queens.some((o) => o !== q && attacks(q, o)));

export function toggle(s, r, c) {
  if (s.over) return false;
  const i = s.queens.findIndex((q) => q.r === r && q.c === c);
  if (i >= 0 && s.queens[i].fixed) return false;
  if (i >= 0) s.queens.splice(i, 1);
  else if (s.queens.length < s.n) s.queens.push({ r, c });
  else return false;
  if (s.queens.length === s.n && !clashing(s).length) s.over = 'win';
  return true;
}
