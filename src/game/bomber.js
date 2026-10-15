// Bomberman por turnos: cada acción del jugador avanza un tic. Reglas puras, sin DOM.
export const SIZE = 9;
const FUSE = 3, RANGE = 2;
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function newBomber(rng = Math.random) {
  const wall = (r, c) => r % 2 === 1 && c % 2 === 1;
  const safe = (r, c) => r + c < 3;
  const cells = Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => (wall(r, c) ? 'wall' : !safe(r, c) && rng() < 0.4 ? 'crate' : null)));
  const enemies = [[0, SIZE - 1], [SIZE - 1, 0], [SIZE - 1, SIZE - 1]].map(([r, c], i) => {
    cells[r][c] = null;
    return { id: i, r, c, type: ['pawn', 'knight', 'bishop'][i] };
  });
  for (const [r, c] of [[0, SIZE - 2], [1, SIZE - 1], [SIZE - 2, 0], [SIZE - 1, 1], [SIZE - 1, SIZE - 2], [SIZE - 2, SIZE - 1]]) if (cells[r][c] === 'crate') cells[r][c] = null;
  return { cells, player: { r: 0, c: 0 }, enemies, bombs: [], blast: [], over: null };
}

const inside = (r, c) => r >= 0 && c >= 0 && r < SIZE && c < SIZE;
const free = (s, r, c) => inside(r, c) && !s.cells[r][c] && !s.bombs.some((b) => b.r === r && b.c === c);

function explode(s, bomb, out) {
  s.bombs = s.bombs.filter((b) => b !== bomb);
  out.push([bomb.r, bomb.c]);
  for (const [dr, dc] of DIRS) for (let k = 1; k <= RANGE; k++) {
    const r = bomb.r + dr * k, c = bomb.c + dc * k;
    if (!inside(r, c) || s.cells[r][c] === 'wall') break;
    out.push([r, c]);
    const chain = s.bombs.find((b) => b.r === r && b.c === c);
    if (chain) explode(s, chain, out);
    if (s.cells[r][c] === 'crate') { s.cells[r][c] = null; break; }
  }
}

// action: { move: [dr, dc] } | { bomb: true } | { wait: true }. Devuelve false si no es válida.
export function step(s, action, rng = Math.random) {
  if (s.over) return false;
  const p = s.player;
  if (action.move) {
    const r = p.r + action.move[0], c = p.c + action.move[1];
    if (!free(s, r, c)) return false;
    Object.assign(p, { r, c });
  } else if (action.bomb) {
    if (s.bombs.some((b) => b.r === p.r && b.c === p.c) || s.bombs.length >= 2) return false;
    s.bombs.push({ r: p.r, c: p.c, t: FUSE });
  }
  s.blast = [];
  for (const b of s.bombs) b.t--;
  for (const b of [...s.bombs]) if (b.t <= 0 && s.bombs.includes(b)) explode(s, b, s.blast);
  const hit = (r, c) => s.blast.some(([a, b]) => a === r && b === c);
  s.enemies = s.enemies.filter((e) => !hit(e.r, e.c));
  for (const e of s.enemies) {
    const opts = DIRS.map(([dr, dc]) => [e.r + dr, e.c + dc]).filter(([r, c]) => free(s, r, c) && !s.enemies.some((o) => o.r === r && o.c === c));
    const chase = opts.find(([r, c]) => r === p.r && c === p.c);
    const pick = chase || (rng() < 0.75 && opts[Math.floor(rng() * opts.length)]);
    if (pick) [e.r, e.c] = pick;
  }
  if (hit(p.r, p.c) || s.enemies.some((e) => e.r === p.r && e.c === p.c)) s.over = 'lose';
  else if (!s.enemies.length) s.over = 'win';
  return true;
}
