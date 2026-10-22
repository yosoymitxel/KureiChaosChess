import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 8, holes: 3 },
  normal: { name: 'Normal', turns: 7, holes: 5 },
  dificil: { name: 'Difícil', turns: 6, holes: 7 },
};
const key = (r, c) => r + ',' + c;
const makeBoard = (holes) => ({ rows: SIZE, cols: SIZE, holes, terrain: new Map(), portals: new Map() });
const make = (id, type, color, row, col) => ({ id, type, color, row, col });

function randomHoles(count, rng, occupied) {
  const candidates = [];
  for (let row = 1; row < SIZE - 1; row++) {
    for (let col = 0; col < SIZE; col++) {
      const k = key(row, col);
      if (!occupied.has(k)) candidates.push(k);
    }
  }
  const holes = new Set();
  while (holes.size < Math.min(count, candidates.length)) {
    const i = Math.floor(rng() * candidates.length);
    holes.add(candidates.splice(i, 1)[0]);
  }
  return holes;
}

export function newHunt(level = 'normal', rng = Math.random) {
  const diff = DIFFS[level] || DIFFS.normal;
  const hunter = make('hunter', 'knight', 'light', 6, 3);
  const runner = make('runner', 'pawn', 'dark', 3, 4);
  const occupied = new Set([key(hunter.row, hunter.col), key(runner.row, runner.col)]);
  const holes = randomHoles(diff.holes, rng, occupied);
  return { diff, board: makeBoard(holes), pieces: [hunter, runner], turns: diff.turns, over: null, last: null, escaped: 0 };
}

export const legal = (s) => s.over ? [] : legalMoves(s.pieces.find((p) => p.id === 'hunter'), s.pieces, s.board);

function runnerChoices(s, hunter, runner) {
  return [-1, 0, 1]
    .map((dc) => ({ row: runner.row - 1, col: runner.col + dc }))
    .filter((p) => p.row >= 0 && p.col >= 0 && p.col < SIZE
      && !s.board.holes.has(key(p.row, p.col))
      && !(p.row === hunter.row && p.col === hunter.col));
}

function advanceRunner(s, hunter, runner) {
  const choices = runnerChoices(s, hunter, runner);
  if (!choices.length) {
    s.pieces = [hunter];
    s.over = 'win';
    return;
  }

  const ranked = choices.map((p) => {
    const candidate = { ...runner, ...p };
    const pieces = [hunter, candidate];
    const threatened = legalMoves(hunter, pieces, s.board).some((m) => m.hits.some((hit) => hit.id === runner.id));
    const distance = Math.abs(p.row - hunter.row) + Math.abs(p.col - hunter.col);
    return { ...p, score: (threatened ? -100 : 0) + distance };
  }).sort((a, b) => b.score - a.score);

  const next = ranked[0];
  runner.row = next.row;
  runner.col = next.col;
  if (runner.row === 0) {
    s.over = 'lose';
    s.escaped = 1;
  }
}

export function move(s, row, col) {
  if (s.over) return false;
  const hunter = s.pieces.find((p) => p.id === 'hunter');
  const runner = s.pieces.find((p) => p.id === 'runner');
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;

  const from = { row: hunter.row, col: hunter.col };
  const caught = m.hits.some((p) => p.id === runner.id);
  hunter.row = row;
  hunter.col = col;
  s.last = { id: hunter.id, from, to: { row, col }, caught: false };
  s.turns--;

  if (caught) {
    s.pieces = [hunter];
    s.over = 'win';
    s.last.caught = true;
    return true;
  }

  advanceRunner(s, hunter, runner);
  if (!s.over && s.turns <= 0) s.over = 'lose';
  return true;
}
