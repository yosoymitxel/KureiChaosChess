import { legalMoves } from './rules.js';
import { BOSSES } from '../data/bosses.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 7, boss: 'titan' },
  normal: { name: 'Normal', turns: 6, boss: 'hydra' },
  dificil: { name: 'Difícil', turns: 7, boss: 'golem' },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
export function newGiantHunt(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  const data = BOSSES[diff.boss];
  const giant = { id: 'giant', type: 'boss-' + data.id, color: 'dark', row: 2, col: 2, h: data.size[0], w: data.size[1], hp: data.hp, boss: true, moves: data.moves };
  const hunter = { id: 'hunter', type: 'queen', color: 'light', row: 6, col: 3 };
  return { diff, board: board(), pieces: [hunter, giant], turns: diff.turns, over: null, events: [], hp: data.hp };
}
export const legal = (s) => s.over ? [] : legalMoves(s.pieces.find(p => p.id === 'hunter'), s.pieces, s.board);
export function move(s, row, col) {
  if (s.over) return false;
  const hunter = s.pieces.find(p => p.id === 'hunter'), giant = s.pieces.find(p => p.id === 'giant');
  const m = legal(s).find(x => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: hunter.row, col: hunter.col };
  s.turns--;
  if (m.hits.includes(giant)) {
    giant.hp--;
    s.events = [{ id: 'hunter', from, to: { row, col }, hit: true, bounce: giant.hp > 0 }];
    if (giant.hp <= 0) { s.pieces = [hunter]; hunter.row = row; hunter.col = col; s.over = 'win'; return true; }
    if (s.turns <= 0) s.over = 'lose';
    return true;
  }
  hunter.row = row; hunter.col = col;
  s.events = [{ id: 'hunter', from, to: { row, col } }];
  if (s.turns <= 0) s.over = 'lose';
  return true;
}
