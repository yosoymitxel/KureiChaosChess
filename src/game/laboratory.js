import { legalMoves } from './rules.js';
import { applyMutations } from '../data/mutations.js';

export const SIZE = 7;

export const DIFFS = {
  facil: {
    name: 'Fácil', piece: 'king', mutation: 'kingRook', samples: 1,
    variants: [
      { id: 'A', turns: 4, holes: ['4,2', '4,4', '2,2', '2,4'], samplesAt: ['4,3'], exit: '0,3', solution: [[4, 3], [2, 3], [0, 3]] },
      { id: 'B', turns: 5, holes: ['5,2', '5,4', '3,2', '3,4'], samplesAt: ['5,3'], exit: '0,3', solution: [[5, 3], [3, 3], [1, 3], [0, 3]] },
    ],
  },
  normal: {
    name: 'Normal', piece: 'knight', mutation: 'knightBishop', samples: 2,
    variants: [
      { id: 'A', turns: 4, holes: ['4,1', '4,5', '2,1', '2,5'], samplesAt: ['4,2', '2,3'], exit: '0,4', solution: [[4, 2], [2, 3], [0, 4]] },
      { id: 'B', turns: 4, holes: ['4,3', '4,5', '2,2', '2,5'], samplesAt: ['4,4', '3,2'], exit: '0,1', solution: [[4, 4], [3, 2], [1, 3], [0, 1]] },
    ],
  },
  dificil: {
    name: 'Difícil', piece: 'guard', mutation: 'guardKnight', samples: 3,
    variants: [
      { id: 'A', turns: 4, holes: ['4,0', '4,6', '2,0', '2,6', '1,0', '1,6'], samplesAt: ['4,2', '3,4', '2,2'], exit: '0,3', solution: [[4, 2], [3, 4], [2, 2], [0, 3]] },
      { id: 'B', turns: 4, holes: ['4,0', '4,6', '2,0', '2,6', '1,0', '1,6'], samplesAt: ['4,4', '3,2', '2,4'], exit: '0,3', solution: [[4, 4], [3, 2], [2, 4], [0, 3]] },
    ],
  },
};

const key = (r, c) => r + ',' + c;
const coords = (cell) => cell.split(',').map(Number);

export function newLaboratory(level = 'normal', variantIndex) {
  const diff = DIFFS[level] || DIFFS.normal;
  const index = Number.isInteger(variantIndex)
    ? ((variantIndex % diff.variants.length) + diff.variants.length) % diff.variants.length
    : Math.floor(Math.random() * diff.variants.length);
  const variant = diff.variants[index];
  const piece = { id: 'subject', type: diff.piece, color: 'light', row: 6, col: 3 };
  applyMutations([piece], [diff.mutation], 'light');
  const [exitRow, exitCol] = coords(variant.exit);
  return {
    diff,
    variant,
    board: { rows: SIZE, cols: SIZE, holes: new Set(variant.holes), terrain: new Map(), portals: new Map() },
    pieces: [piece],
    turns: variant.turns,
    samples: new Set(variant.samplesAt),
    sampleTotal: diff.samples,
    exit: { row: exitRow, col: exitCol },
    over: null,
    steps: 0,
  };
}

export const legal = (s) => {
  if (s.over) return [];
  const moves = legalMoves(s.pieces[0], s.pieces, s.board);
  return s.samples.size
    ? moves.filter((m) => m.row !== s.exit.row || m.col !== s.exit.col)
    : moves;
};

export function move(s, row, col) {
  if (s.over) return false;
  const p = s.pieces[0], m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const old = key(p.row, p.col);
  p.row = row; p.col = col;
  s.board.holes.add(old);
  s.samples.delete(key(row, col));
  s.turns--;
  s.steps++;
  if (row === s.exit.row && col === s.exit.col) s.over = 'win';
  else if (s.turns <= 0 || !legal(s).length) s.over = 'lose';
  return true;
}
