// Escalada del caballo: una torre de plataformas con huecos y pinchos, y la lava que sube una fila
// cada pocos saltos (la fila roja es la siguiente). Sube en L hasta arriba; las monedas son de propina.
import { grid, key, inside, shuffle, piece, freeCells, movesOf } from './turn-kit.js';
import { t } from '../i18n/index.js';

export const DIFFS = {
  facil: { name: 'Fácil', rows: 10, cols: 6, gaps: 0.25, spikes: 2, every: 3 },
  normal: { name: 'Normal', rows: 11, cols: 6, gaps: 0.32, spikes: 3, every: 2 },
  dificil: { name: 'Difícil', rows: 12, cols: 6, gaps: 0.38, spikes: 4, every: 2 },
};

// Lava tras `t` saltos: filas hundidas desde abajo.
const lava = (s, n) => Math.floor(n / s.diff.every);
const ok = (s, r, c, n) => inside(s.board, r, c) && s.items.get(key(r, c)) !== 'spike' && r < s.board.rows - lava(s, n);

// ¿Se puede subir a tiempo? Búsqueda en anchura sobre (casilla, salto).
function climbable(s) {
  let front = [[s.knight.row, s.knight.col]], seen = new Set();
  for (let n = s.jumps; n < s.jumps + 60 && front.length; n++) {
    const next = [];
    for (const [r, c] of front) for (const [a, b] of movesOf({ ...s.knight, row: r, col: c }, [], s.board)) {
      if (!ok(s, a, b, n + 1) || seen.has(key(a, b) + '|' + (n + 1))) continue;
      if (a === 0) return n + 1 - s.jumps;
      seen.add(key(a, b) + '|' + (n + 1)); next.push([a, b]);
    }
    front = next;
  }
  return 0;
}

export function create(dk = 'normal', rng = Math.random) {
  const diff = DIFFS[dk] || DIFFS.normal;
  for (;;) {
    const b = grid(diff.rows, diff.cols), knight = piece('knight', 'light', b.rows - 1, Math.floor(rng() * b.cols));
    for (const [r, c] of freeCells(b, [knight], (r) => r > 0 && r < b.rows - 1)) if (rng() < diff.gaps) b.holes.add(key(r, c));
    const s = { diff, board: b, knight, rng, items: new Map(), jumps: 0, sunk: 0, coins: 0, over: null, note: '' };
    for (const [r, c] of shuffle(rng, freeCells(b, [knight], (r) => r > 0 && r < b.rows - 2)).slice(0, diff.spikes)) s.items.set(key(r, c), 'spike');
    for (const [r, c] of shuffle(rng, freeCells(b, [knight], (r, c) => r > 0 && !s.items.has(key(r, c)))).slice(0, 3)) s.items.set(key(r, c), 'coin');
    if (climbable(s)) return s;
  }
}

const nextRow = (s) => s.board.rows - 1 - s.sunk;
const warn = (s) => ((s.jumps + 1) % s.diff.every === 0 ? freeCells(s.board, [], (r) => r === nextRow(s)) : []);

export function tap(s, r, c) {
  if (!movesOf(s.knight, [s.knight], s.board).some(([a, b]) => a === r && b === c)) return null;
  s.knight.row = r; s.knight.col = c; s.jumps++;
  const post = [], k = key(r, c), item = s.items.get(k);
  if (item === 'coin') { s.items.delete(k); s.coins++; post.push({ sparkle: [r, c] }, { sfx: 'coin' }); }
  if (item === 'spike') { s.over = 'lose'; s.note = t('parkour.spiked', 'El caballo cayó en los pinchos.'); post.push({ hurt: s.knight.id }); return { pre: [], post }; }
  if (r === 0) { s.over = 'win'; s.note = t('parkour.won', 'Llegaste arriba con {n} monedas.', { n: s.coins }); return { pre: [], post: [...post, { power: s.knight.id }] }; }
  if (s.jumps % s.diff.every === 0) {
    const row = nextRow(s), cells = freeCells(s.board, [], (rr) => rr === row);
    s.sunk++;
    for (const [a, b] of cells) { s.board.holes.add(key(a, b)); s.items.delete(key(a, b)); }
    post.push({ doom: [] }, { fire: cells.slice(0, 3) }, { sink: cells });
    if (s.knight.row === row) { s.over = 'lose'; s.note = t('parkour.lava', 'La lava alcanzó al caballo.'); }
  }
  if (!s.over && !movesOf(s.knight, [s.knight], s.board).length) { s.over = 'lose'; s.note = t('parkour.stuck', 'El caballo se quedó sin saltos.'); }
  post.push({ doom: s.over ? [] : warn(s) });
  return { pre: [], post };
}

// Autocomprobación: el salto que deja la subida más corta.
export const auto = (s) => {
  const moves = movesOf(s.knight, [s.knight], s.board).filter(([r, c]) => ok(s, r, c, s.jumps + 1));
  const len = ([r, c]) => (r === 0 ? 0 : climbable({ ...s, jumps: s.jumps + 1, knight: { ...s.knight, row: r, col: c } }) || 99);
  return moves.reduce((a, b) => (len(b) < len(a) ? b : a), moves[0] || [0, 0]);
};

export const start = (s) => [{ doom: warn(s) }];
export const pieces = (s) => [{ ...s.knight }];
export const marks = (s) => [...movesOf(s.knight, [s.knight], s.board).map(([r, c]) => [key(r, c), s.items.get(key(r, c)) === 'spike' ? 'mv danger' : 'mv']), ...freeCells(s.board, [s.knight], (r) => r === 0).map(([r, c]) => [key(r, c), 'goal'])];
export const labels = (s) => new Map([...s.items].map(([k, v]) => [k, 'icon:' + v]));
export const status = (s) => t('parkour.status', 'Sube hasta arriba · la lava sube cada {n} saltos · monedas {coins}', { n: s.diff.every, coins: s.coins });
