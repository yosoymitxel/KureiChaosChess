import { legalMoves, cellsOf } from './rules.js';
import { BOSSES } from '../data/bosses.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 8, boss: 'titan' },
  normal: { name: 'Normal', turns: 7, boss: 'hydra' },
  dificil: { name: 'Difícil', turns: 8, boss: 'golem' },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });

export function newGiantHunt(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  const data = BOSSES[diff.boss];
  const [h, w] = data.size;
  const giant = {
    id: 'giant', type: 'boss-' + data.id, color: 'dark',
    row: Math.min(2, SIZE - h), col: Math.floor((SIZE - w) / 2),
    h, w, hp: data.hp, boss: true, moves: data.moves, bossId: data.id,
  };
  const hunter = { id: 'hunter', type: 'queen', color: 'light', row: 6, col: 3 };
  return { diff, board: board(), pieces: [hunter, giant], turns: diff.turns, over: null, events: [], hp: data.hp, round: 0, lastEvent: null };
}

export const legal = (s) => s.over ? [] : legalMoves(s.pieces.find((p) => p.id === 'hunter'), s.pieces, s.board);

const distance = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
const footprintDistance = (boss, hunter, row = boss.row, col = boss.col) => {
  const rs = Math.max(row - hunter.row, 0, hunter.row - (row + boss.h - 1));
  const cs = Math.max(col - hunter.col, 0, hunter.col - (col + boss.w - 1));
  return rs + cs;
};

function bossTurn(s) {
  const hunter = s.pieces.find((p) => p.id === 'hunter');
  const giant = s.pieces.find((p) => p.id === 'giant');
  if (!hunter || !giant) return;
  const options = legalMoves(giant, s.pieces, s.board);
  if (!options.length) {
    s.events.push({ type: 'boss-stagger', id: giant.id, from: { row: giant.row, col: giant.col }, to: { row: giant.row, col: giant.col } });
    return;
  }
  const ranked = options.map((m, i) => ({
    ...m,
    score: (m.hits.some((p) => p.id === 'hunter') ? 10000 : 0)
      - footprintDistance(giant, hunter, m.row, m.col) * 10
      - distance({ row: m.row, col: m.col }, { row: giant.row, col: giant.col }) * 0.1
      + ((s.round + i) % 3) * 0.01,
  })).sort((a, b) => b.score - a.score || a.row - b.row || a.col - b.col);
  const next = ranked[0];
  const from = { row: giant.row, col: giant.col };
  giant.row = next.row;
  giant.col = next.col;
  s.round++;
  const caught = next.hits.some((p) => p.id === 'hunter');
  s.events.push({ type: 'boss-move', id: giant.id, from, to: { row: giant.row, col: giant.col }, hit: caught });
  if (caught) s.over = 'lose';
}

export function move(s, row, col) {
  if (s.over) return false;
  const hunter = s.pieces.find((p) => p.id === 'hunter');
  const giant = s.pieces.find((p) => p.id === 'giant');
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m || !hunter || !giant) return false;

  const from = { row: hunter.row, col: hunter.col };
  s.turns--;
  if (m.hits.some((p) => p.id === 'giant')) {
    giant.hp--;
    s.lastEvent = 'hit';
    s.events = [{ type: 'hunter-hit', id: hunter.id, from, to: { row, col }, target: giant.id, hp: giant.hp, bounce: giant.hp > 0 }];
    if (giant.hp <= 0) {
      s.pieces = [hunter];
      hunter.row = row;
      hunter.col = col;
      s.over = 'win';
      return true;
    }
  } else {
    hunter.row = row;
    hunter.col = col;
    s.lastEvent = 'move';
    s.events = [{ type: 'hunter-move', id: hunter.id, from, to: { row, col } }];
  }

  if (!s.over) bossTurn(s);
  if (!s.over && s.turns <= 0) s.over = 'lose';
  return true;
}
