// Dama contra la horda: los peones bajan en filas. La dama se mueve como siempre y, al caer, su onda
// derriba a todo lo que tenga pegado. Un peón que la alcanza o que llega abajo le quita una vida.
import { grid, key, inside, shuffle, at, piece, freeCells, movesOf, cheb } from './turn-kit.js';
import { t } from '../i18n/index.js';

export const DIFFS = {
  facil: { name: 'Fácil', n: 8, start: 5, total: 16, every: 3, lives: 3 },
  normal: { name: 'Normal', n: 8, start: 6, total: 22, every: 2, lives: 3 },
  dificil: { name: 'Difícil', n: 8, start: 8, total: 28, every: 2, lives: 2 },
};

export function create(dk = 'normal', rng = Math.random) {
  const diff = DIFFS[dk] || DIFFS.normal, b = grid(diff.n);
  const queen = piece('queen', 'light', b.rows - 1, Math.floor(rng() * b.cols));
  const s = { diff, board: b, queen, pawns: [], rng, spawned: 0, killed: 0, lives: diff.lives, turn: 0, over: null, note: '' };
  row(s, diff.start);
  return s;
}
function row(s, n) {
  for (const [r, c] of shuffle(s.rng, freeCells(s.board, [s.queen, ...s.pawns], (r) => r <= 1)).slice(0, Math.min(n, s.diff.total - s.spawned))) { s.pawns.push(piece('pawn', 'dark', r, c)); s.spawned++; }
}
const won = (s) => { if (s.killed >= s.diff.total) { s.over = 'win'; s.note = t('horde.won', 'La horda cayó entera; te quedan {n} vidas.', { n: s.lives }); } };
const hit = (s, post, r, c) => {
  s.lives--;
  post.push({ shield: [r, c], broken: true }, { shake: 12 }, { float: [r, c, t('horde.life', '−1 vida')] });
  if (s.lives <= 0) { s.over = 'lose'; s.note = t('horde.lost', 'La horda te alcanzó: {n} de {total}.', { n: s.killed, total: s.diff.total }); }
};

export function tap(s, r, c) {
  if (!movesOf(s.queen, [s.queen, ...s.pawns], s.board).some(([a, b]) => a === r && b === c)) return null;
  const eaten = at(s.pawns, r, c);
  s.queen.row = r; s.queen.col = c;
  const wave = s.pawns.filter((p) => p !== eaten && cheb(p, s.queen) === 1);
  s.pawns = s.pawns.filter((p) => p !== eaten && !wave.includes(p));
  s.killed += wave.length + (eaten ? 1 : 0);
  const post = wave.length ? [{ ring: [r, c], color: '#ffcf6b', size: 1.8 }, { blast: wave.map((p) => [p.row, p.col]) }] : [];
  if (wave.length >= 2) post.push({ float: [r, c, t('rampage.combo', '¡Combo ×{n}!', { n: wave.length + (eaten ? 1 : 0) })] });
  won(s);
  return { pre: [], post, ms: 460 };
}

export function enemy(s) {
  const post = [];
  s.turn++;
  for (const p of [...s.pawns].sort((a, b) => b.row - a.row)) {
    if (p.row + 1 === s.queen.row && Math.abs(p.col - s.queen.col) === 1) { s.pawns.splice(s.pawns.indexOf(p), 1); s.killed++; hit(s, post, s.queen.row, s.queen.col); }
    else if (inside(s.board, p.row + 1, p.col) && !at(s.pawns, p.row + 1, p.col) && !(s.queen.row === p.row + 1 && s.queen.col === p.col)) {
      p.row++;
      if (p.row === s.board.rows - 1) { s.pawns.splice(s.pawns.indexOf(p), 1); s.killed++; hit(s, post, p.row, p.col); }
    }
    if (s.over) return { pre: [], post };
  }
  if (s.turn % s.diff.every === 0) row(s, 3);
  won(s);
  post.push({ doom: s.pawns.flatMap((p) => [[p.row + 1, p.col - 1], [p.row + 1, p.col + 1]]).filter(([r, c]) => inside(s.board, r, c)) });
  return { pre: [], post, ms: 380 };
}

// Autocomprobación: la casilla que más derriba sin quedar al alcance de un peón.
export const auto = (s) => {
  const moves = movesOf(s.queen, [s.queen, ...s.pawns], s.board);
  const score = ([r, c]) => s.pawns.filter((p) => cheb(p, { row: r, col: c }) <= 1).length * 3 - (s.pawns.some((p) => p.row + 1 === r && Math.abs(p.col - c) === 1) ? 4 : 0) + r * 0.1;
  return moves.reduce((a, b) => (score(b) > score(a) ? b : a), moves[0]);
};

export const pieces = (s) => [s.queen, ...s.pawns].map((p) => ({ ...p }));
export const marks = (s) => movesOf(s.queen, [s.queen, ...s.pawns], s.board).map(([r, c]) => [key(r, c), at(s.pawns, r, c) ? 'cap' : 'mv']);
export const status = (s) => t('horde.status', 'Derribados {n}/{total} · vidas {lives}', { n: s.killed, total: s.diff.total, lives: s.lives });
