// Bomberman por turnos: cada acción del jugador avanza un tic. Reglas puras, sin DOM.
export const SIZE = 9;
const FUSE = 5, RANGE = 2; // the fuse ticks on the turn you place it: four moves to clear radius 2
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function newBomber(rng = Math.random) {
  const wall = (r, c) => r % 2 === 1 && c % 2 === 1;
  // Crates keep out of the player's starting corner: the row and column ahead of it stay clear
  // wide enough to walk out of a radius-2 blast, so the opening bomb is never a forced suicide.
  const safe = (r, c) => r + c < 3 || (r === 0 && c < 4) || (c === 0 && r < 4);
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

// Casillas que alumbra una bomba: su propia casilla y, en cada dirección, hasta RANGE, cortando
// en el muro y justo después de la primera caja.
function rays(s, bomb) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    for (let k = 1; k <= RANGE; k++) {
      const r = bomb.r + dr * k, c = bomb.c + dc * k;
      if (!inside(r, c) || s.cells[r][c] === 'wall') break;
      const crate = s.cells[r][c] === 'crate';
      out.push({ r, c, crate });
      if (crate) break;
    }
  }
  return out;
}

// Para la interfaz: dónde pegaría una bomba si estallara ahora.
export const blastOf = (s, bomb) => [{ r: bomb.r, c: bomb.c }, ...rays(s, bomb).map(({ r, c }) => ({ r, c }))];

function explode(s, bomb, out) {
  s.bombs = s.bombs.filter((b) => b !== bomb);
  out.push([bomb.r, bomb.c]);
  for (const { r, c, crate } of rays(s, bomb)) {
    out.push([r, c]);
    const chain = s.bombs.find((b) => b.r === r && b.c === c);
    if (chain) explode(s, chain, out);
    if (crate) s.cells[r][c] = null;
  }
}

// IA: primer paso del camino más corto hacia el jugador (BFS por casillas libres). Si no hay
// ruta queda deambulando contra las cajas hasta que las rompas.
function huntStep(s, e, p, opts, rng) {
  if (!opts.length) return null;
  const start = e.r * SIZE + e.c, goal = p.r * SIZE + p.c;
  const prev = new Array(SIZE * SIZE).fill(-1);
  const blocked = new Set(s.enemies.filter((o) => o !== e).map((o) => o.r * SIZE + o.c));
  const q = [start];
  prev[start] = start;
  for (let i = 0; i < q.length && prev[goal] < 0; i++) {
    const cur = q[i], r = (cur / SIZE) | 0, c = cur % SIZE;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (!inside(nr, nc)) continue;
      const id = nr * SIZE + nc;
      if (prev[id] >= 0 || blocked.has(id) || !free(s, nr, nc)) continue;
      prev[id] = cur;
      q.push(id);
    }
  }
  if (prev[goal] < 0) {
    // Sin ruta (cajas sellando el paso): se aprieta hacia vos y espera a que abras.
    const gm = ([r, c]) => Math.abs(r - p.r) + Math.abs(c - p.c);
    const closer = opts.filter((o) => gm(o) === Math.min(...opts.map(gm)));
    return closer[Math.floor(rng() * closer.length)];
  }
  let cur = goal;
  while (prev[cur] !== start) cur = prev[cur];
  return [Math.floor(cur / SIZE), cur % SIZE];
}

// action: { move: [dr, dc] } | { bomb: true } | { wait: true }. Devuelve false si no es válida.
export function step(s, action, rng = Math.random) {
  if (s.over) return false;
  const p = s.player;
  if (action.move) {
    const r = p.r + action.move[0], c = p.c + action.move[1];
    // Walking into an enemy is not a move: dying on the square you asked to step on reads as a bug.
    if (!free(s, r, c) || s.enemies.some((e) => e.r === r && e.c === c)) return false;
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
    const pick = huntStep(s, e, p, opts, rng);
    if (pick) [e.r, e.c] = pick;
  }
  if (hit(p.r, p.c) || s.enemies.some((e) => e.r === p.r && e.c === p.c)) s.over = 'lose';
  else if (!s.enemies.length) s.over = 'win';
  return true;
}
