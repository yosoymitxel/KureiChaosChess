import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 4 },
  normal: { name: 'Normal', turns: 5 },
  dificil: { name: 'Difícil', turns: 6 },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const piece = (id, type, color, row, col) => ({ id, type, color, row, col });
export function newBodyguard(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  return { diff, board: board(), pieces: [piece('king', 'king', 'light', 6, 3), piece('guard', 'rook', 'light', 5, 3), piece('assailant', 'king', 'dark', 0, 3)], turns: diff.turns, over: null, events: [] };
}
export const legal = (s, p) => s.over || !p || p.color !== 'light' ? [] : legalMoves(p, s.pieces, s.board);
const distance = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
function enemyTurn(s) {
  const enemy = s.pieces.find((p) => p.id === 'assailant');
  const king = s.pieces.find((p) => p.id === 'king');
  const moves = legalMoves(enemy, s.pieces, s.board);
  if (!moves.length) return;
  moves.sort((a, b) => distance({ row: a.row, col: a.col }, king) - distance({ row: b.row, col: b.col }, king));
  const m = moves[0], from = { row: enemy.row, col: enemy.col };
  const victims = m.hits || [];
  enemy.row = m.row; enemy.col = m.col;
  s.pieces = s.pieces.filter((p) => !victims.includes(p));
  s.events.push({ id: enemy.id, from, to: { row: m.row, col: m.col }, victims: victims.map((p) => p.id) });
  if (victims.some((p) => p.id === 'king')) s.over = 'lose';
}
export function move(s, id, row, col) {
  if (s.over) return false;
  const p = s.pieces.find((x) => x.id === id && x.color === 'light');
  const m = legal(s, p).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: p.row, col: p.col }, victims = m.hits || [];
  p.row = row; p.col = col;
  s.pieces = s.pieces.filter((x) => !victims.includes(x));
  s.events = [{ id, from, to: { row, col }, victims: victims.map((x) => x.id) }];
  if (victims.some((x) => x.id === 'assailant')) { s.over = 'win'; return true; }
  s.turns--;
  enemyTurn(s);
  if (!s.over && s.turns <= 0) s.over = 'win';
  return true;
}
