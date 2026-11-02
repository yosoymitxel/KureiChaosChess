// Festín del caballo: solo saltos en L. Gemas por el tablero; caer en gemas seguidas sube el combo
// (cada una vale tanto como la racha). La dorada da jugadas; los pinchos las quitan y cortan la racha.
import { grid, key, shuffle, piece, freeCells, movesOf } from './turn-kit.js';
import { t } from '../i18n/index.js';

export const DIFFS = {
  facil: { name: 'Fácil', n: 7, moves: 22, goal: 18, gems: 5, spikes: 3 },
  normal: { name: 'Normal', n: 8, moves: 20, goal: 24, gems: 5, spikes: 5 },
  dificil: { name: 'Difícil', n: 8, moves: 18, goal: 22, gems: 5, spikes: 6 },
};

export function create(dk = 'normal', rng = Math.random) {
  const diff = DIFFS[dk] || DIFFS.normal, b = grid(diff.n);
  const knight = piece('knight', 'light', b.rows - 1, Math.floor(rng() * b.cols));
  const s = { diff, board: b, knight, rng, items: new Map(), left: diff.moves, score: 0, combo: 0, made: 0, over: null, note: '' };
  for (let i = 0; i < diff.spikes; i++) drop(s, 'spike');
  for (let i = 0; i < diff.gems; i++) drop(s, 'gem');
  return s;
}
function drop(s, kind) {
  const cell = shuffle(s.rng, freeCells(s.board, [s.knight], (r, c) => !s.items.has(key(r, c))))[0];
  if (cell) s.items.set(key(...cell), kind);
}

export function tap(s, r, c) {
  if (!movesOf(s.knight, [s.knight], s.board).some(([a, b]) => a === r && b === c)) return null;
  s.knight.row = r; s.knight.col = c;
  s.left--; s.made++;
  const k = key(r, c), item = s.items.get(k), post = [];
  s.items.delete(k);
  if (item === 'gem' || item === 'goldgem') {
    s.combo++; s.score += s.combo;
    post.push({ sparkle: [r, c], color: item === 'gem' ? '#7fe0ff' : '#ffcf6b' }, { sfx: 'coin' }, { float: [r, c, '+' + s.combo] });
    if (s.combo >= 3) post.push({ ring: [r, c], color: '#7fe0ff' });
    if (item === 'goldgem') { s.left += 3; post.push({ power: s.knight.id }, { float: [r, c, t('feast.time', '+3 jugadas')] }); }
    drop(s, 'gem');
  } else if (item === 'spike') {
    s.combo = 0; s.left = Math.max(0, s.left - 3);
    post.push({ hurt: s.knight.id }, { float: [r, c, t('feast.spike', '−3 jugadas')] });
    drop(s, 'spike');
  } else s.combo = 0;
  if (s.made % 5 === 0 && ![...s.items.values()].includes('goldgem')) drop(s, 'goldgem');
  if (s.score >= s.diff.goal) { s.over = 'win'; s.note = t('feast.won', 'Festín completo: {n} puntos.', { n: s.score }); }
  else if (s.left <= 0) { s.over = 'lose'; s.note = t('feast.lost', 'Sin jugadas: {n} de {goal} puntos.', { n: s.score, goal: s.diff.goal }); }
  return { pre: [], post };
}

// Autocomprobación: gema al alcance; si no, el salto que deja más gemas a un salto.
export const auto = (s) => {
  const moves = movesOf(s.knight, [s.knight], s.board).filter(([r, c]) => s.items.get(key(r, c)) !== 'spike');
  const val = ([r, c]) => { const it = s.items.get(key(r, c)); if (it) return 10; const k = { ...s.knight, row: r, col: c }; return movesOf(k, [k], s.board).filter(([a, b]) => /gem/.test(s.items.get(key(a, b)) || '')).length; };
  return moves.reduce((a, b) => (val(b) > val(a) ? b : a), moves[0] || movesOf(s.knight, [s.knight], s.board)[0]);
};

export const pieces = (s) => [{ ...s.knight }];
export const marks = (s) => movesOf(s.knight, [s.knight], s.board).map(([r, c]) => [key(r, c), s.items.get(key(r, c)) === 'spike' ? 'mv danger' : 'mv']);
export const labels = (s) => new Map([...s.items].map(([k, v]) => [k, 'icon:' + v]));
export const status = (s) => t('feast.status', 'Puntos {n}/{goal} · racha ×{combo} · jugadas {left}', { n: s.score, goal: s.diff.goal, combo: s.combo, left: s.left });
