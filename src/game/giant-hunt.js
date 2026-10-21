import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 7, hp: 2 },
  normal: { name: 'Normal', turns: 6, hp: 3 },
  dificil: { name: 'Difícil', turns: 5, hp: 4 },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
export function newGiantHunt(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  const giant = { id: 'giant', type: 'king', color: 'dark', row: 2, col: 2, h: 2, w: 2, hp: diff.hp, boss: true };
  const hunter = { id: 'hunter', type: 'queen', color: 'light', row: 6, col: 3 };
  return { diff, board: board(), pieces: [hunter, giant], turns: diff.turns, over: null, events: [], hp: diff.hp };
}
export const legal = (s) => s.over ? [] : legalMoves(s.pieces.find(p => p.id === 'hunter'), s.pieces, s.board);
export function move(s, row, col) {
  if (s.over) return false;
  const hunter = s.pieces.find(p => p.id === 'hunter'), giant = s.pieces.find(p => p.id === 'giant');
  const m = legal(s).find(x => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: hunter.row, col: hunter.col };
  if (m.hits.includes(giant)) {
    giant.hp--;
    s.events = [{ id: 'hunter', from, to: { row, col }, hit: true }];
    s.turns--;
    if (giant.hp <= 0) { s.pieces = [hunter]; s.over = 'win'; return true; }
    s.turns--;
    if (s.turns <= 0) s.over = 'lose';
    return true;
  }
  hunter.row = row; hunter.col = col;
  s.events = [{ id: 'hunter', from, to: { row, col } }];
  s.turns--;
  if (s.turns <= 0) s.over = 'lose';
  return true;
}
