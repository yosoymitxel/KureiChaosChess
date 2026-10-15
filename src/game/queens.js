// Ocho reinas: coloca N reinas sin que ninguna ataque a otra.
export const N = 8, SECONDS = 120;

const attacks = (a, b) => a.r === b.r || a.c === b.c || Math.abs(a.r - b.r) === Math.abs(a.c - b.c);

export const newQueens = () => ({ queens: [], over: null });

export const clashing = (s) => s.queens.filter((q) => s.queens.some((o) => o !== q && attacks(q, o)));

export function toggle(s, r, c) {
  if (s.over) return false;
  const i = s.queens.findIndex((q) => q.r === r && q.c === c);
  if (i >= 0) s.queens.splice(i, 1);
  else if (s.queens.length < N) s.queens.push({ r, c });
  else return false;
  if (s.queens.length === N && !clashing(s).length) s.over = 'win';
  return true;
}
