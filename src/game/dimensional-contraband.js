import { legalMoves, linkPortalPair, portalAt } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 9, entry: '4,0', twin: '2,5' },
  normal: { name: 'Normal', turns: 7, entry: '4,2', twin: '1,4' },
  dificil: { name: 'Difícil', turns: 5, entry: '5,3', twin: '2,5' },
};

export function newContraband(level = 'normal') {
  const diff = DIFFS[level] || DIFFS.normal;
  const board = { rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() };
  const entry = diff.entry.split(',').map(Number), twin = diff.twin.split(',').map(Number);
  linkPortalPair(board, entry, twin);
  return {
    diff,
    board,
    pieces: [{ id: 'smuggler', type: 'knight', color: 'light', row: 6, col: 1 }],
    turns: diff.turns,
    over: null,
    events: [],
    exit: { row: 0, col: 6 },
  };
}

export const legal = (s) => s.over ? [] : legalMoves(s.pieces[0], s.pieces, s.board);

export function move(s, row, col) {
  if (s.over) return false;
  const p = s.pieces[0], m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: p.row, col: p.col };
  p.row = row; p.col = col;
  s.turns--;
  const portal = portalAt(s.board, row, col);
  if (portal) {
    const [r, c] = portal.to.split(',').map(Number);
    p.row = r; p.col = c;
    s.events = [{ from, to: { row, col } }, { from: { row, col }, to: { row: r, col: c }, portal: true }];
  } else s.events = [{ from, to: { row, col } }];
  if (p.row === s.exit.row && p.col === s.exit.col) s.over = 'win';
  else if (s.turns <= 0) s.over = 'lose';
  return true;
}
