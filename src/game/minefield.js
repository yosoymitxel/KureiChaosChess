import { legalMoves } from './rules.js';

// Cruza con el caballo hasta la fila de arriba. Cada partida traza una ruta segura al azar (siempre
// hay salida) y siembra minas fuera de ella. Las pistas cuentan minas alrededor; la sonda mira una casilla.
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', mines: 7, slack: 4, probes: 2, reveal: 'area' },
  normal: { name: 'Normal', mines: 10, slack: 3, probes: 1, reveal: 'cross' },
  dificil: { name: 'Difícil', mines: 13, slack: 2, probes: 1, reveal: 'self' },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const key = (r, c) => r + ',' + c;
const inside = (r, c) => r >= 0 && c >= 0 && r < SIZE && c < SIZE;
const JUMPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const AREA = { area: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]], cross: [[-1, 0], [1, 0], [0, -1], [0, 1]], self: [] };

// Ruta del caballo con algún rodeo: sube casi siempre, a veces va de lado.
function route(rng, startCol) {
  for (;;) {
    const path = [[SIZE - 1, startCol]];
    const seen = new Set([key(SIZE - 1, startCol)]);
    while (path.length < 9) {
      const [r, c] = path[path.length - 1];
      if (r === 0) return path.map(([a, b]) => key(a, b));
      const opts = JUMPS.map(([dr, dc]) => [r + dr, c + dc]).filter(([a, b]) => inside(a, b) && !seen.has(key(a, b)) && a <= r + 1);
      const up = opts.filter(([a]) => a < r);
      const pool = up.length && rng() < 0.75 ? up : opts;
      if (!pool.length) break;
      const next = pool[Math.floor(rng() * pool.length)];
      seen.add(key(...next));
      path.push(next);
    }
  }
}

export function newMinefield(level = 'normal', rng = Math.random) {
  const diff = DIFFS[level] || DIFFS.normal;
  const startCol = 1 + Math.floor(rng() * (SIZE - 2));
  const safe = route(rng, startCol);
  const pool = [];
  for (let r = 0; r < SIZE - 1; r++) for (let c = 0; c < SIZE; c++) if (!safe.includes(key(r, c))) pool.push(key(r, c));
  const mines = new Set();
  while (mines.size < diff.mines && pool.length) mines.add(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  const player = { id: 'runner', type: 'knight', color: 'light', row: SIZE - 1, col: startCol };
  const s = { diff, board: board(), pieces: [player], mines, route: safe, revealed: new Set(), flags: new Set(), fresh: [], probes: diff.probes,
    turns: safe.length - 1 + diff.slack, over: null, last: null, round: 0 };
  uncover(s, SIZE - 1, startCol);
  return s;
}

export const nearbyMines = (s, r, c) => {
  let n = 0;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if ((dr || dc) && s.mines.has(key(r + dr, c + dc))) n++;
  return n;
};

// Destapa la casilla pisada y, según dificultad, las de alrededor que no son mina.
function uncover(s, row, col) {
  s.fresh = [key(row, col)];
  s.revealed.add(key(row, col));
  for (const [dr, dc] of AREA[s.diff.reveal]) {
    const r = row + dr, c = col + dc, k = key(r, c);
    if (inside(r, c) && !s.mines.has(k) && !s.revealed.has(k)) { s.revealed.add(k); s.fresh.push(k); }
  }
}

export const legal = (s) => s.over ? [] : legalMoves(s.pieces[0], s.pieces, s.board);

export function move(s, row, col) {
  if (s.over) return false;
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const p = s.pieces[0];
  s.last = { from: { row: p.row, col: p.col }, to: { row, col } };
  p.row = row;
  p.col = col;
  s.turns--;
  s.round++;
  const k = key(row, col);
  if (s.mines.has(k)) {
    s.over = 'lose';
    const far = (x) => { const [r, c] = x.split(',').map(Number); return Math.hypot(r - row, c - col); };
    s.fresh = [k, ...[...s.mines].filter((x) => x !== k).sort((a, b) => far(a) - far(b))];
    s.mines.forEach((x) => s.revealed.add(x));
    return true;
  }
  uncover(s, row, col);
  if (row === 0) s.over = 'win';
  else if (s.turns <= 0) s.over = 'lose';
  return true;
}

// La sonda mira una casilla sin pisarla: si es mina queda marcada; si no, enseña su número.
export function probe(s, row, col) {
  const k = key(row, col);
  if (s.over || s.probes <= 0 || !inside(row, col) || s.revealed.has(k) || s.flags.has(k)) return false;
  s.probes--;
  if (s.mines.has(k)) s.flags.add(k);
  else s.revealed.add(k);
  s.fresh = [k];
  s.last = { probe: { row, col }, mine: s.mines.has(k) };
  return true;
}
