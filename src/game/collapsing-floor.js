import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 7, holes: ['4,0', '4,6'], collapse: 1 },
  normal: { name: 'Normal', turns: 5, holes: ['4,0', '4,6', '3,0', '3,6'], collapse: 1 },
  dificil: { name: 'Difícil', turns: 4, holes: ['4,0', '4,6', '3,0', '3,6', '2,0', '2,6', '1,0', '1,6'], collapse: 2 },
};
const key = (r, c) => r + ',' + c;
const randIndex = (n, rng) => Math.max(0, Math.min(n - 1, Math.floor(rng() * n)));

export function newCollapsingFloor(level = 'normal') {
  const diff = DIFFS[level] || DIFFS.normal;
  return {
    diff,
    board: { rows: SIZE, cols: SIZE, holes: new Set(diff.holes), terrain: new Map(), portals: new Map() },
    pieces: [{ id: 'runner', type: 'knight', color: 'light', row: 6, col: 3 }],
    turns: diff.turns,
    over: null,
    lastCollapsed: [],
  };
}

// Shortest legal route from a position to any tile on the top edge.
export function routeToTop(s, start = s.pieces[0], holes = s.board.holes) {
  const board = holes === s.board.holes ? s.board : { ...s.board, holes };
  const queue = [{ row: start.row, col: start.col, path: [] }];
  const seen = new Set([key(start.row, start.col)]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current.row === 0) return current.path;
    const piece = { ...s.pieces[0], row: current.row, col: current.col };
    for (const next of legalMoves(piece, [piece], board)) {
      const k = key(next.row, next.col);
      if (seen.has(k)) continue;
      seen.add(k);
      queue.push({ row: next.row, col: next.col, path: [...current.path, { row: next.row, col: next.col }] });
    }
  }
  return null;
}

function threateningMoves(s) {
  const runner = s.pieces[0];
  return legalMoves(runner, s.pieces, s.board).filter((next) => {
    if (next.row === 0) return false;
    // The runner's current tile falls if it takes this move on its next turn.
    const afterStepHoles = new Set(s.board.holes);
    afterStepHoles.add(key(runner.row, runner.col));
    const tail = routeToTop(s, next, afterStepHoles);
    if (!tail || tail.length + 1 > s.turns) return false;

    // Only collapse a currently usable route tile if another route still fits the clock.
    const blocked = new Set(s.board.holes);
    blocked.add(key(next.row, next.col));
    const alternate = routeToTop(s, runner, blocked);
    return !!alternate && alternate.length <= s.turns;
  });
}

export const legal = (s) => s.over ? [] : legalMoves(s.pieces[0], s.pieces, s.board);

export function move(s, row, col, rng = Math.random) {
  if (s.over) return false;
  const runner = s.pieces[0], m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;

  const old = key(runner.row, runner.col);
  runner.row = row; runner.col = col;
  s.turns--;
  s.board.holes.add(old);
  const collapsed = [old];

  if (row !== 0 && s.turns > 0) {
    for (let i = 0; i < s.diff.collapse; i++) {
      const candidates = threateningMoves(s);
      if (!candidates.length) break;
      const next = candidates[randIndex(candidates.length, rng)];
      const k = key(next.row, next.col);
      s.board.holes.add(k);
      collapsed.push(k);
    }
  }

  s.lastCollapsed = collapsed;
  if (row === 0) s.over = 'win';
  else {
    const route = routeToTop(s);
    if (s.turns <= 0 || !legal(s).length || !route || route.length > s.turns) s.over = 'lose';
  }
  return true;
}
