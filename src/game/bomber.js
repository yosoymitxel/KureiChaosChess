// Bomberman por turnos: cada acción del jugador avanza un tic. Reglas puras, sin DOM.
export const SIZE = 9;
const FUSE = 5, MAX_RANGE = 3;// the fuse ticks on the turn you place it: four moves before it blows
const L_JUMP = [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]];
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Enemigos y densidad de cajas: Normal es el tablero de siempre.
export const DIFFS = {
  facil: { name: 'Fácil', enemies: 1, crates: 0.3 },
  normal: { name: 'Normal', enemies: 3, crates: 0.4 },
  dificil: { name: 'Difícil', enemies: 5, crates: 0.5 },
};
// Salidas: las tres esquinas de siempre y, en Difícil, dos casillas intermedias.
const CORNERS = [[0, SIZE - 1], [SIZE - 1, 0], [SIZE - 1, SIZE - 1], [0, 4], [4, 0]];
const TYPES = ['pawn', 'knight', 'bishop', 'knight', 'bishop'];

export function newBomber(rng = Math.random, key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  const wall = (r, c) => r % 2 === 1 && c % 2 === 1;
  // Crates keep out of the player's starting corner: the row and column ahead of it stay clear
  // wide enough to walk out of a radius-2 blast, so the opening bomb is never a forced suicide.
  const safe = (r, c) => r + c < 3 || (r === 0 && c < 4) || (c === 0 && r < 4);
  const cells = Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => (wall(r, c) ? 'wall' : !safe(r, c) && rng() < diff.crates ? 'crate' : null)));
  const spots = CORNERS.slice(0, diff.enemies);
  const enemies = spots.map(([r, c], i) => {
    cells[r][c] = null;
    return { id: i, r, c, type: TYPES[i] };
  });
  // Las cajas no encierran a nadie: cada salida respira por sus cuatro lados.
  for (const [er, ec] of spots)
    for (const [dr, dc] of DIRS) {
      const [r, c] = [er + dr, ec + dc];
      if (cells[r]?.[c] === 'crate') cells[r][c] = null;
    }
  return { cells, player: { r: 0, c: 0 }, enemies, bombs: [], blast: [], items: [], range: 2, maxBombs: 2, over: null };
}

const inside = (r, c) => r >= 0 && c >= 0 && r < SIZE && c < SIZE;
const free = (s, r, c) => inside(r, c) && !s.cells[r][c] && !s.bombs.some((b) => b.r === r && b.c === c);

// Casillas que alumbra una bomba: su propia casilla y, en cada dirección, hasta el alcance,
// cortando en el muro y justo después de la primera caja.
function rays(s, bomb) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    for (let k = 1; k <= s.range; k++) {
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

function explode(s, bomb, out, rng) {
  s.bombs = s.bombs.filter((b) => b !== bomb);
  out.push([bomb.r, bomb.c]);
  for (const { r, c, crate } of rays(s, bomb)) {
    out.push([r, c]);
    const chain = s.bombs.find((b) => b.r === r && b.c === c);
    if (chain) explode(s, chain, out, rng);
    if (crate) {
      s.cells[r][c] = null;
      // Una de cada tres cajas deja mejora: bomba extra o más alcance.
      if (rng() < 0.3) s.items.push({ r, c, kind: rng() < 0.5 ? 'bomb' : 'range' });
    }
  }
}

// IA: primer paso del camino más corto hacia el jugador (BFS por casillas libres).
function huntStep(s, e, p, opts, clear, rng) {
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
      if (prev[id] >= 0 || blocked.has(id) || !clear(nr, nc)) continue;
      prev[id] = cur;
      q.push(id);
    }
  }
  if (prev[goal] < 0) {
    // Sellado por cajas: se arrima lo posible y espera a que le abras paso.
    const gm = ([r, c]) => Math.abs(r - p.r) + Math.abs(c - p.c);
    const closer = opts.filter((o) => gm(o) === Math.min(...opts.map(gm)));
    return closer[Math.floor(rng() * closer.length)];
  }
  let cur = goal;
  while (prev[cur] !== start) cur = prev[cur];
  return [Math.floor(cur / SIZE), cur % SIZE];
}

// Caballo y alfil mutan el paso: salto en L (le da igual lo de en medio) y diagonal, como en el
// tablero. Si no hay casilla que acerque, devuelven null y el rival usa su camino de siempre.
function mutantStep(s, e, p, clear, rng) {
  const d = ([r, c]) => Math.abs(r - p.r) + Math.abs(c - p.c);
  const moves = (e.type === 'knight' ? L_JUMP : DIAG)
    .map(([dr, dc]) => [e.r + dr, e.c + dc])
    .filter(([r, c]) => clear(r, c) && d([r, c]) <= d([e.r, e.c]));
  if (!moves.length) return null;
  const best = Math.min(...moves.map(d));
  const pool = moves.filter((o) => d(o) === best);
  return pool[Math.floor(rng() * pool.length)];
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
    const i = s.items.findIndex((it) => it.r === r && it.c === c);
    if (i >= 0) {
      const [it] = s.items.splice(i, 1);
      // Alcance con tope: con la mecha de 4 jugadas, un pasillo recto de 4 ya no tiene salida.
      if (it.kind === 'bomb') s.maxBombs++; else s.range = Math.min(MAX_RANGE, s.range + 1);
    }
  } else if (action.bomb) {
    if (s.bombs.some((b) => b.r === p.r && b.c === p.c) || s.bombs.length >= s.maxBombs) return false;
    s.bombs.push({ r: p.r, c: p.c, t: FUSE });
  }
  s.blast = [];
  for (const b of s.bombs) b.t--;
  for (const b of [...s.bombs]) if (b.t <= 0 && s.bombs.includes(b)) explode(s, b, s.blast, rng);
  const hit = (r, c) => s.blast.some(([a, b]) => a === r && b === c);
  s.enemies = s.enemies.filter((e) => !hit(e.r, e.c));
  // Los enemigos ven venir las bombas a punto de estallar y no se meten en su cruz.
  const danger = new Set(s.bombs.filter((b) => b.t <= 2).flatMap((b) => blastOf(s, b)).map(({ r, c }) => r * 99 + c));
  const clear = (r, c) => free(s, r, c) && !s.enemies.some((o) => o.r === r && o.c === c) && !s.blast.some(([a, b]) => a === r && b === c) && !danger.has(r * 99 + c);
  for (const e of s.enemies) {
    const opts = DIRS.map(([dr, dc]) => [e.r + dr, e.c + dc]).filter(([r, c]) => clear(r, c));
    // Lejos del rey deambulan; solo cazan cuando lo tienen cerca, así hay tiempo de preparar la bomba.
    const far = Math.abs(e.r - p.r) + Math.abs(e.c - p.c) > 4;
    const pick = far ? (rng() < 0.7 ? opts[Math.floor(rng() * opts.length)] : null)
      : e.type === 'pawn'
      ? huntStep(s, e, p, opts, clear, rng)
      : mutantStep(s, e, p, clear, rng) || huntStep(s, e, p, opts, clear, rng);
    if (pick) [e.r, e.c] = pick;
  }
  if (hit(p.r, p.c) || s.enemies.some((e) => e.r === p.r && e.c === p.c)) s.over = 'lose';
  else if (!s.enemies.length) s.over = 'win';
  return true;
}
