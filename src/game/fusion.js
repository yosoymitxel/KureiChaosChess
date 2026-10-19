// Fusión: el 2048 con piezas. Todas se deslizan hacia un lado; dos iguales que chocan se funden en la
// siguiente de la escalera (peón, guardia, caballo, alfil, camello, torre, cañón, reina, rey). Tras cada jugada entra un peón
// (a veces un caballo). Se gana al formar la pieza meta; se pierde si no queda jugada. Reglas puras.
export const LADDER = ['pawn', 'guard', 'knight', 'bishop', 'camel', 'rook', 'cannon', 'queen', 'king'];
// Más casillas dan aire; el tablero chico obliga a pensar cada jugada.
export const DIFFS = {
  facil: { name: 'Fácil', n: 5, goal: 5 },
  normal: { name: 'Normal', n: 4, goal: 6 },
  dificil: { name: 'Difícil', n: 4, goal: 7 },
};
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

export function newFusion(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  const s = { n: diff.n, diff, tiles: [], next: 0, moves: 0, over: null, best: 0 };
  spawn(s, rng); spawn(s, rng);
  return s;
}

const at = (s, r, c) => s.tiles.find((t) => t.r === r && t.c === c && !t.gone);

function spawn(s, rng) {
  const free = [];
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) if (!at(s, r, c)) free.push([r, c]);
  if (!free.length) return null;
  const [r, c] = free[Math.floor(rng() * free.length)];
  const t = { id: s.next++, r, c, lv: rng() < 0.1 ? 1 : 0, born: true };
  s.tiles.push(t);
  return t;
}

// Recorre las filas en el sentido del empuje: cada pieza avanza hasta chocar; si choca con una igual
// que aún no se fundió en esta jugada, se funde con ella.
export function slide(s, dir, rng = Math.random) {
  if (s.over) return false;
  const [dr, dc] = DIRS[dir];
  s.tiles = s.tiles.filter((t) => !t.gone);
  for (const t of s.tiles) { t.born = false; t.merged = false; }
  const order = [...s.tiles].sort((a, b) => (dr ? (b.r - a.r) * dr : (b.c - a.c) * dc));
  let moved = false;
  for (const t of order) {
    let r = t.r, c = t.c;
    for (;;) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= s.n || nc >= s.n) break;
      const o = at(s, nr, nc);
      if (!o) { r = nr; c = nc; continue; }
      if (o.lv === t.lv && !o.merged && !t.merged && o.lv < LADDER.length - 1) {
        o.lv++; o.merged = true; t.gone = true; t.into = o.id; r = nr; c = nc;
        s.best = Math.max(s.best, o.lv);
      }
      break;
    }
    if (r !== t.r || c !== t.c) moved = true;
    t.r = r; t.c = c;
  }
  if (!moved) return false;
  s.moves++;
  spawn(s, rng);
  if (s.best >= s.diff.goal) s.over = 'win';
  else if (!canMove(s)) s.over = 'lose';
  return true;
}

function canMove(s) {
  const live = s.tiles.filter((t) => !t.gone);
  if (live.length < s.n * s.n) return true;
  return live.some((t) => [[0, 1], [1, 0]].some(([dr, dc]) => at(s, t.r + dr, t.c + dc)?.lv === t.lv));
}
