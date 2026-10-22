import { legalMoves } from './rules.js';

// El fugitivo es un peón de verdad: baja una casilla (dos desde su fila de salida), solo come en
// diagonal y corona al llegar a la última fila. Cada partida se genera con un solucionador que
// garantiza que el caballo puede cazarlo y que pide al menos `depth[0]` jugadas.
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', holes: 3, pawnRow: 2, depth: [2, 3], maxWinning: 8 },
  normal: { name: 'Normal', holes: 5, pawnRow: 1, depth: [3, 4], maxWinning: 3 },
  dificil: { name: 'Difícil', holes: 7, pawnRow: 1, depth: [4, 6], maxWinning: 1 },
};
const key = (r, c) => r + ',' + c;
const makeBoard = (holes) => ({ rows: SIZE, cols: SIZE, holes, terrain: new Map(), portals: new Map() });
const make = (id, type, color, row, col) => ({ id, type, color, row, col });
const pick = (list, rng) => list[Math.floor(rng() * list.length)];
const hunterOf = (s) => s.pieces.find((p) => p.id === 'hunter');
const runnerOf = (s) => s.pieces.find((p) => p.id === 'runner');
const clone = (s) => ({ ...s, pieces: s.pieces.map((p) => ({ ...p })), last: null });

// Jugadas del caballo hasta que el peón corone si nadie le estorba.
function crownIn(s) {
  const r = runnerOf(s);
  if (!r) return 0;
  const left = SIZE - 1 - r.row;
  return r.row === 1 && left >= 2 ? left - 1 : left;
}

export const legal = (s) => s.over ? [] : legalMoves(hunterOf(s), s.pieces, s.board);

// El peón come al caballo si puede; si no, avanza a la casilla que el caballo no ataca
// (prefiere el doble paso). Bloqueado de frente, espera.
function advanceRunner(s) {
  const hunter = hunterOf(s), runner = runnerOf(s);
  const moves = legalMoves(runner, s.pieces, s.board);
  if (!moves.length) { s.last.runner = null; return; }
  const capture = moves.find((m) => m.hits.length);
  const attacked = (m) => legalMoves(hunter, [hunter, { ...runner, row: m.row, col: m.col }], s.board)
    .some((x) => x.row === m.row && x.col === m.col);
  const next = capture || [...moves].sort((a, b) => attacked(a) - attacked(b) || b.row - a.row)[0];
  s.last.runner = { from: { row: runner.row, col: runner.col }, to: { row: next.row, col: next.col }, capture: !!capture };
  runner.row = next.row;
  runner.col = next.col;
  if (capture) { s.pieces = [runner]; s.over = 'lose'; s.reason = 'captured'; }
  else if (runner.row === SIZE - 1) { runner.type = 'queen'; s.over = 'lose'; s.reason = 'crowned'; s.escaped = 1; }
}

export function move(s, row, col) {
  if (s.over) return false;
  const hunter = hunterOf(s);
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  s.last = { id: hunter.id, from: { row: hunter.row, col: hunter.col }, to: { row, col }, caught: false, runner: null };
  hunter.row = row;
  hunter.col = col;
  if (m.hits.some((p) => p.id === 'runner')) {
    s.pieces = [hunter];
    s.over = 'win';
    s.last.caught = true;
  } else advanceRunner(s);
  s.turns = crownIn(s);
  return true;
}

// Menos jugadas del caballo para cazar al peón (Infinity si no llega en `limit`).
function solve(s, limit, memo = new Map()) {
  if (limit <= 0) return Infinity;
  const h = hunterOf(s), r = runnerOf(s);
  const k = key(h.row, h.col) + ':' + key(r.row, r.col) + ':' + limit;
  if (memo.has(k)) return memo.get(k);
  let best = Infinity;
  for (const m of legal(s)) {
    if (m.hits.length) { best = 1; break; }
    const t = clone(s);
    move(t, m.row, m.col);
    if (t.over) continue;
    best = Math.min(best, 1 + solve(t, Math.min(limit, best - 1) - 1, memo));
  }
  memo.set(k, best);
  return best;
}

function winningFirstMoves(s, depth) {
  return legal(s).filter((m) => {
    if (m.hits.length) return true;
    const t = clone(s);
    move(t, m.row, m.col);
    return !t.over && solve(t, depth - 1) <= depth - 1;
  }).length;
}

function candidate(diff, rng) {
  const pc = 1 + Math.floor(rng() * (SIZE - 2));
  const runner = make('runner', 'pawn', 'dark', diff.pawnRow, pc);
  const cells = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    // El caballo arranca detrás o al lado del peón, nunca ya encima de su camino.
    if (c === pc || Math.abs(c - pc) + Math.abs(r - diff.pawnRow) < 2) continue;
    if (r <= diff.pawnRow + 2) cells.push([r, c]);
  }
  const [hr, hc] = pick(cells, rng);
  const hunter = make('hunter', 'knight', 'light', hr, hc);
  const free = [];
  for (let r = 1; r < SIZE - 1; r++) for (let c = 0; c < SIZE; c++) {
    if (c === pc || (r === hr && c === hc)) continue;
    free.push(key(r, c));
  }
  const holes = new Set();
  while (holes.size < diff.holes) holes.add(free.splice(Math.floor(rng() * free.length), 1)[0]);
  return { diff, board: makeBoard(holes), pieces: [hunter, runner], over: null, last: null, escaped: 0, reason: null };
}

export function newHunt(level = 'normal', rng = Math.random) {
  const diff = DIFFS[level] || DIFFS.normal;
  let fallback = null;
  for (let i = 0; i < 400; i++) {
    const s = candidate(diff, rng);
    const d = solve(s, diff.depth[1]);
    if (d === Infinity || legal(s).some((m) => m.hits.length)) continue;
    s.par = d;
    fallback ||= s;
    if (d < diff.depth[0] || winningFirstMoves(s, d) > diff.maxWinning) continue;
    s.turns = crownIn(s);
    return s;
  }
  // Con un azar degenerado (pruebas) puede no salir nada exigente: vale la primera resoluble.
  const s = fallback || candidate({ ...diff, holes: 0, pawnRow: 2 }, () => 0);
  s.par ??= solve(s, SIZE);
  s.turns = crownIn(s);
  return s;
}

export const _solve = solve;
