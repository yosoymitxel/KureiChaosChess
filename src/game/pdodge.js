// Lluvia de piezas: caen piezas desde arriba, cada una a su manera (el peón de a una, la torre de a
// dos, el caballo en L, el alfil en diagonal rebotando en los bordes). Tu rey esquiva; lo rojo es donde
// caerán. Rozarlas suma puntos; la estrella aguanta un golpe. Aguanta las rondas.
import { grid, key, inside, shuffle, pick, at, piece, freeCells } from './turn-kit.js';
import { t } from '../i18n/index.js';

export const DIFFS = {
  facil: { name: 'Fácil', rows: 9, cols: 7, rounds: 14, rate: 1, types: ['pawn', 'pawn', 'rook'] },
  normal: { name: 'Normal', rows: 9, cols: 7, rounds: 16, rate: 2, types: ['pawn', 'rook', 'knight', 'bishop'] },
  dificil: { name: 'Difícil', rows: 9, cols: 7, rounds: 18, rate: 2, types: ['rook', 'knight', 'bishop', 'bishop'] },
};

export function create(dk = 'normal', rng = Math.random) {
  const diff = DIFFS[dk] || DIFFS.normal, b = grid(diff.rows, diff.cols);
  const king = piece('king', 'light', b.rows - 2, 1 + Math.floor(rng() * (b.cols - 2)), { shield: false });
  const s = { diff, board: b, king, rng, falling: [], star: null, round: 0, score: 0, over: null, note: '' };
  spawn(s);
  return s;
}

// Dónde cae `p` en la siguiente ronda (o null si se sale por abajo).
export function next(s, p) {
  let dc = p.dir || 0;
  if (p.type === 'bishop' && !inside(s.board, p.row + 1, p.col + dc)) dc = -dc;
  const step = { pawn: [1, 0], rook: [2, 0], knight: [2, dc], bishop: [1, dc] }[p.type];
  const r = p.row + step[0], c = Math.min(s.board.cols - 1, Math.max(0, p.col + step[1]));
  return r >= s.board.rows ? null : [r, c, dc];
}
const danger = (s) => s.falling.map((p) => next(s, p)).filter(Boolean).map(([r, c]) => [r, c]);
const options = (s) => [[0, 0], ...[-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [dr, dc]))].map(([dr, dc]) => [s.king.row + dr, s.king.col + dc])
  // La fila de arriba no es refugio: ahí no cae nada (antes, subir y quedarse ganaba siempre).
  .filter(([r, c]) => r > 0 && inside(s.board, r, c) && (!at(s.falling, r, c) || (r === s.king.row && c === s.king.col)));

// Piezas nuevas arriba, sin dejar al rey sin escapatoria; de vez en cuando, una estrella.
function spawn(s) {
  for (let i = 0; i < s.diff.rate; i++) {
    for (const c of shuffle(s.rng, [...Array(s.board.cols).keys()])) {
      if (at(s.falling, 0, c)) continue;
      const p = piece(pick(s.rng, s.diff.types), 'dark', 0, c, { dir: s.rng() < 0.5 ? -1 : 1 });
      s.falling.push(p);
      const bad = new Set(danger(s).map(([r, c]) => key(r, c)));
      if (options(s).some(([r, c]) => !bad.has(key(r, c)))) break;
      s.falling.pop();
    }
  }
  if (!s.star && s.round % 6 === 3) { const cell = shuffle(s.rng, freeCells(s.board, [s.king, ...s.falling], (r) => r >= 4))[0]; if (cell) s.star = cell; }
}

export function tap(s, r, c) {
  if (!options(s).some(([a, b]) => a === r && b === c)) return null;
  s.king.row = r; s.king.col = c;
  const post = [];
  if (s.star && s.star[0] === r && s.star[1] === c) { s.star = null; s.king.shield = true; post.push({ shield: [r, c] }, { power: s.king.id }); }
  return { pre: [], post, ms: 320 };
}

export function enemy(s) {
  const post = [];
  s.round++;
  for (const p of [...s.falling]) {
    const n = next(s, p);
    if (!n) { s.falling.splice(s.falling.indexOf(p), 1); continue; }
    [p.row, p.col, p.dir] = n;
    if (p.row === s.king.row && p.col === s.king.col) {
      s.falling.splice(s.falling.indexOf(p), 1);
      if (s.king.shield) { s.king.shield = false; post.push({ shield: [p.row, p.col], broken: true }, { shake: 10 }); }
      else { s.over = 'lose'; s.note = t('pdodge.lost', 'Una pieza cayó sobre tu rey.'); post.push({ blast: [[p.row, p.col]] }); }
    } else if (Math.max(Math.abs(p.row - s.king.row), Math.abs(p.col - s.king.col)) === 1) { s.score++; post.push({ float: [p.row, p.col, '+1'] }); }
  }
  if (!s.over && s.round >= s.diff.rounds) { s.over = 'win'; s.note = t('pdodge.won', 'Aguantaste la lluvia con {n} roces.', { n: s.score }); }
  if (!s.over) spawn(s);
  post.push({ doom: s.over ? [] : danger(s) });
  return { pre: [], post, ms: 420 };
}

export const start = (s) => [{ doom: danger(s) }];
export const auto = (s) => { const bad = new Set(danger(s).map(([r, c]) => key(r, c))); const ok = options(s).filter(([r, c]) => !bad.has(key(r, c))); return ok.find(([r, c]) => s.star && r === s.star[0] && c === s.star[1]) || pick(Math.random, ok.length ? ok : options(s)); };
export const pieces = (s) => [s.king, ...s.falling].map((p) => ({ ...p }));
export const marks = (s) => options(s).map(([r, c]) => [key(r, c), 'mv']);
export const labels = (s) => new Map(s.star ? [[key(...s.star), 'icon:star']] : []);
export const status = (s) => t('pdodge.status', 'Ronda {n}/{total} · roces {score}{shield}', { n: s.round, total: s.diff.rounds, score: s.score, shield: s.king.shield ? ' · ' + t('pdodge.shield', 'con escudo') : '' });
