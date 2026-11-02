// Torre arrasadora: la torre no se para al chocar; carga en línea hasta el borde o un hueco y aplasta
// todo lo que encuentra. Los peones bajan cada turno y comen en diagonal como siempre: que no lleguen
// abajo ni alcancen a la torre. Varios de una carga suman combo.
import { grid, key, inside, shuffle, at, piece, freeCells } from './turn-kit.js';
import { t } from '../i18n/index.js';

export const DIFFS = {
  facil: { name: 'Fácil', n: 7, start: 4, total: 9, every: 2, pace: 2, holes: 2, lives: 3 },
  normal: { name: 'Normal', n: 8, start: 5, total: 13, every: 2, pace: 2, holes: 3, lives: 2 },
  dificil: { name: 'Difícil', n: 8, start: 6, total: 16, every: 1, pace: 2, holes: 4, lives: 2 },
};
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function create(dk = 'normal', rng = Math.random) {
  const diff = DIFFS[dk] || DIFFS.normal, b = grid(diff.n);
  const rook = piece('rook', 'light', b.rows - 1, Math.floor(rng() * b.cols));
  for (const [r, c] of shuffle(rng, freeCells(b, [rook], (r) => r >= 2 && r <= b.rows - 3)).slice(0, diff.holes)) b.holes.add(key(r, c));
  const pawns = shuffle(rng, freeCells(b, [rook], (r) => r <= 2)).slice(0, diff.start).map(([r, c]) => piece('pawn', 'dark', r, c));
  return { diff, board: b, rook, pawns, rng, spawned: pawns.length, crushed: 0, lives: diff.lives, turn: 0, best: 0, over: null, note: '' };
}

// Cada dirección: hasta dónde llega y a quién se lleva por delante.
export function charges(s) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    let r = s.rook.row, c = s.rook.col;
    const hit = [];
    while (inside(s.board, r + dr, c + dc)) { r += dr; c += dc; const p = at(s.pawns, r, c); if (p) hit.push(p); }
    if (r !== s.rook.row || c !== s.rook.col) out.push({ to: [r, c], hit });
  }
  return out;
}

export function tap(s, r, c) {
  const ch = charges(s).find((x) => x.to[0] === r && x.to[1] === c);
  if (!ch) return null;
  s.rook.row = r; s.rook.col = c;
  s.pawns = s.pawns.filter((p) => !ch.hit.includes(p));
  s.crushed += ch.hit.length;
  s.best = Math.max(s.best, ch.hit.length);
  const post = ch.hit.length > 1 ? [{ shake: 8 + ch.hit.length * 3 }, { ring: [r, c], color: '#ffcf6b', size: 1 + ch.hit.length * 0.3 }, { float: [r, c, t('rampage.combo', '¡Combo ×{n}!', { n: ch.hit.length })] }] : ch.hit.length ? [{ ring: [r, c] }] : [];
  done(s);
  return { pre: [], post };
}

const done = (s) => { if (!s.over && !s.pawns.length && s.spawned >= s.diff.total) { s.over = 'win'; s.note = t('rampage.won', 'Arrasaste con todos (mejor carga: {n}).', { n: s.best }); } };

// Los peones bajan (cada `pace` turnos; si hay un hueco, caen); si uno puede comer a la torre, se la
// come; el que llega abajo te quita una vida. Llegan peones nuevos por arriba.
export function enemy(s) {
  const { rook, board: b } = s, post = [];
  s.turn++;
  for (const p of [...s.pawns].sort((a, b) => b.row - a.row)) {
    if (p.row + 1 === rook.row && Math.abs(p.col - rook.col) === 1) { p.row = rook.row; p.col = rook.col; s.over = 'lose'; s.note = t('rampage.eaten', 'Un peón se comió a la torre.'); post.push({ hurt: rook.id }); return { pre: [], post }; }
    if (s.turn % s.diff.pace || at(s.pawns, p.row + 1, p.col) || (rook.row === p.row + 1 && rook.col === p.col)) continue;
    p.row++;
    if (b.holes.has(key(p.row, p.col))) { s.pawns.splice(s.pawns.indexOf(p), 1); post.push({ float: [p.row, p.col, t('rampage.fell', '¡Al vacío!')] }); }
    else if (p.row === b.rows - 1) {
      s.pawns.splice(s.pawns.indexOf(p), 1); s.lives--;
      post.push({ shake: 10 }, { float: [p.row, p.col, t('horde.life', '−1 vida')] });
      if (s.lives <= 0) { s.over = 'lose'; s.note = t('rampage.through', 'Los peones se colaron por abajo.'); return { pre: [], post }; }
    }
  }
  if (!s.over && s.spawned < s.diff.total && s.turn % s.diff.every === 0) {
    const cell = shuffle(s.rng, freeCells(b, [...s.pawns, rook], (r) => r === 0))[0];
    if (cell) { s.pawns.push(piece('pawn', 'dark', ...cell)); s.spawned++; }
  }
  done(s);
  const danger = s.pawns.flatMap((p) => [[p.row + 1, p.col - 1], [p.row + 1, p.col + 1]]).filter(([r, c]) => inside(b, r, c));
  return { pre: [], post: [...post, { doom: danger }] };
}

// Autocomprobación: la carga que más aplasta sin quedar al alcance de un peón.
export const auto = (s) => {
  const safe = (r, c) => !s.pawns.some((p) => p.row + 1 === r && Math.abs(p.col - c) === 1);
  const all = charges(s), ok = all.filter((x) => safe(...x.to));
  const val = (x) => x.hit.reduce((n, p) => n + 1 + p.row, 0);
  const best = (ok.length ? ok : all).reduce((a, b) => (val(b) > val(a) ? b : a));
  return best.to;
};

export const start = (s) => [{ doom: s.pawns.flatMap((p) => [[p.row + 1, p.col - 1], [p.row + 1, p.col + 1]]).filter(([r, c]) => inside(s.board, r, c)) }];
export const pieces = (s) => [s.rook, ...s.pawns].map((p) => ({ ...p }));
export const marks = (s) => charges(s).map((x) => [key(...x.to), x.hit.length ? 'cap' : 'mv']);
export const status = (s) => t('rampage.status', 'Aplastados {n}/{total} · vidas {lives} · toca hacia dónde carga la torre', { n: s.crushed, total: s.diff.total, lives: s.lives });
