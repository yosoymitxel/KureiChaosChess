import { legalMoves } from './rules.js';

// Escolta al rey marfil mientras una escuadra rival lo acosa. Cada partida sortea escolta,
// atacantes, casillas caídas y posiciones; el rival mueve una pieza por turno, como en el ajedrez.
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 6, ai: 'simple', escorts: 2, foes: 2, pool: ['knight', 'bishop', 'king'], holes: 2, hints: true },
  normal: { name: 'Normal', turns: 8, ai: 'hunter', escorts: 1, foes: 3, pool: ['knight', 'bishop', 'rook'], holes: 3, hints: true },
  dificil: { name: 'Difícil', turns: 9, ai: 'hunter', escorts: 1, foes: 3, pool: ['knight', 'bishop', 'rook', 'queen'], holes: 3, reinforce: 5 },
};
const ESCORTS = ['rook', 'bishop', 'knight'];
const key = (r, c) => r + ',' + c;
const board = (holes) => ({ rows: SIZE, cols: SIZE, holes, terrain: new Map(), portals: new Map() });
const piece = (id, type, color, row, col) => ({ id, type, color, row, col });
const pick = (list, rng) => list[Math.floor(rng() * list.length)];
const kingOf = (pieces) => pieces.find((p) => p.id === 'king');
const foesOf = (pieces) => pieces.filter((p) => p.color === 'dark');

export const legal = (s, p) => s.over || !p || p.color !== 'light' ? [] : legalMoves(p, s.pieces, s.board);

// Piezas tras jugar `m` con `p` (copias: no toca el estado).
function after(pieces, p, m) {
  const gone = new Set((m.hits || []).map((x) => x.id));
  return pieces.filter((x) => !gone.has(x.id)).map((x) => (x.id === p.id ? { ...x, row: m.row, col: m.col } : x));
}

// ¿Puede algún atacante comerse al rey en `pieces`?
export function kingAttacked(pieces, b) {
  const king = kingOf(pieces);
  return !!king && foesOf(pieces).some((f) => legalMoves(f, pieces, b).some((m) => m.hits.some((h) => h.id === 'king')));
}

// Casillas a las que el rey no debería ir (las ataca el rival): ayuda visual en fácil y normal.
export function dangerSquares(s) {
  const king = kingOf(s.pieces);
  if (!king || s.over) return new Set();
  return new Set(legal(s, king).filter((m) => kingAttacked(after(s.pieces, king, m), s.board)).map((m) => key(m.row, m.col)));
}

// Respuestas del jugador que dejan al rey a salvo.
function safeReplies(pieces, b) {
  let n = 0;
  for (const p of pieces) {
    if (p.color !== 'light') continue;
    for (const m of legalMoves(p, pieces, b)) {
      const next = after(pieces, p, m);
      if (!foesOf(next).length || !kingAttacked(next, b)) n++;
    }
  }
  return n;
}

function generate(diff, rng) {
  const kc = 1 + Math.floor(rng() * (SIZE - 2));
  const king = { ...piece('king', 'king', 'light', SIZE - 1, kc), royal: true };
  const pieces = [king];
  const spots = [[SIZE - 2, kc], [SIZE - 2, kc - 1], [SIZE - 2, kc + 1], [SIZE - 1, kc - 1], [SIZE - 1, kc + 1]];
  const types = [...ESCORTS];
  for (let i = 0; i < diff.escorts; i++) {
    const t = types.splice(Math.floor(rng() * types.length), 1)[0];
    const [r, c] = spots.splice(Math.floor(rng() * spots.length), 1)[0];
    pieces.push(piece('guard' + (i ? i + 1 : ''), t, 'light', r, c));
  }
  const taken = new Set(pieces.map((p) => key(p.row, p.col)));
  let queens = 0;
  for (let i = 0; i < diff.foes; i++) {
    let t = pick(diff.pool, rng);
    if (t === 'queen' && queens++) t = 'knight';
    let r, c;
    do { r = Math.floor(rng() * 2); c = Math.floor(rng() * SIZE); } while (taken.has(key(r, c)));
    taken.add(key(r, c));
    pieces.push(piece('foe' + (i + 1), t, 'dark', r, c));
  }
  const free = [];
  for (let r = 2; r < SIZE - 2; r++) for (let c = 0; c < SIZE; c++) if (!taken.has(key(r, c))) free.push(key(r, c));
  const holes = new Set();
  while (holes.size < diff.holes) holes.add(free.splice(Math.floor(rng() * free.length), 1)[0]);
  return { pieces, board: board(holes) };
}

export function newBodyguard(level = 'normal', rng = Math.random) {
  const diff = DIFFS[level] || DIFFS.normal;
  let g;
  // El rey no puede empezar ya perdido: tiene que haber al menos una respuesta segura tras la primera amenaza.
  for (let i = 0; i < 60; i++) {
    g = generate(diff, rng);
    if (!kingAttacked(g.pieces, g.board) && safeReplies(g.pieces, g.board) > 3) break;
  }
  return { diff, board: g.board, pieces: g.pieces, turns: diff.turns, over: null, events: [], enemyMoves: 0, nextFoe: diff.foes + 1, rng };
}

const distance = (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));

function score(s, foe, m, i) {
  if (m.hits.some((p) => p.id === 'king')) return 1e6;
  const next = after(s.pieces, foe, m);
  const king = kingOf(next);
  const moved = next.find((p) => p.id === foe.id);
  const takes = m.hits.length ? 1 : 0;
  const near = distance(moved, king);
  const exposed = next.some((p) => p.color === 'light' && legalMoves(p, next, s.board).some((x) => x.hits.some((h) => h.id === foe.id)));
  const jitter = ((i + s.enemyMoves) % 3) * 0.3;
  if (s.diff.ai === 'simple') return -near * 10 + takes * 5 + jitter;
  const check = kingAttacked(next, s.board);
  // Difícil: busca el mate (ninguna respuesta salva al rey) y encierra al rey quitándole salidas.
  const safe = safeReplies(next, s.board);
  if (check && safe === 0) return 1e5;
  return -safe * 6 - near * 3 + takes * 60 + (check ? 25 : 0) - (exposed ? 45 : 0) + jitter;
}

function reinforce(s) {
  const cols = [...Array(SIZE).keys()].filter((c) => !s.pieces.some((p) => p.row === 0 && p.col === c) && !s.board.holes.has(key(0, c)));
  if (!cols.length) return;
  const p = piece('foe' + s.nextFoe++, 'knight', 'dark', 0, pick(cols, s.rng));
  s.pieces.push(p);
  s.events.push({ id: p.id, type: 'enter', to: { row: p.row, col: p.col }, victims: [] });
}

function enemyTurn(s) {
  const foes = foesOf(s.pieces);
  let best = null;
  foes.forEach((f) => legalMoves(f, s.pieces, s.board).forEach((m, i) => {
    const v = score(s, f, m, i);
    if (!best || v > best.v) best = { f, m, v };
  }));
  if (!best) return;
  const { f, m } = best;
  const from = { row: f.row, col: f.col };
  const victims = m.hits.map((p) => p.id);
  f.row = m.row;
  f.col = m.col;
  s.pieces = s.pieces.filter((p) => !victims.includes(p.id));
  s.events.push({ id: f.id, from, to: { row: m.row, col: m.col }, victims });
  s.enemyMoves++;
  if (victims.includes('king')) s.over = 'lose';
}

export function move(s, id, row, col) {
  if (s.over) return false;
  const p = s.pieces.find((x) => x.id === id && x.color === 'light');
  const m = legal(s, p).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: p.row, col: p.col }, victims = m.hits.map((x) => x.id);
  p.row = row;
  p.col = col;
  s.pieces = s.pieces.filter((x) => !victims.includes(x.id));
  s.events = [{ id, from, to: { row, col }, victims }];
  s.turns--;
  if (!foesOf(s.pieces).length) { s.over = 'win'; return true; }
  enemyTurn(s);
  if (!s.over && s.diff.reinforce && s.turns === s.diff.reinforce) reinforce(s);
  if (!s.over && s.turns <= 0) s.over = 'win';
  return true;
}
