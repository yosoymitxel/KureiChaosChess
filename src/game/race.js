// Carrera de peones: cada uno lleva tres peones por sus calles. En tu turno eliges un peón, se tira
// un dado de 1 a 4 y avanza; las losetas de su calle ayudan (turbo, hielo, portal, estrella) o
// castigan (bomba). Gana el primer peón que llega arriba.
import { grid, key, shuffle, pick, piece } from './turn-kit.js';
import { t } from '../i18n/index.js';

export const DIFFS = {
  facil: { name: 'Fácil', rows: 9, tiles: 3, bombs: 1, bot: 'random' },
  normal: { name: 'Normal', rows: 10, tiles: 3, bombs: 2, bot: 'greedy' },
  dificil: { name: 'Difícil', rows: 11, tiles: 3, bombs: 3, bot: 'greedy' },
};
const GOOD = ['turbo', 'ice', 'portal', 'star'];
const MARK = { turbo: 'icon:rush', ice: 'icon:ice', portal: 'icon:portal', star: 'icon:star', bomb: 'icon:bomb' };

export function create(dk = 'normal', rng = Math.random) {
  const diff = DIFFS[dk] || DIFFS.normal, b = grid(diff.rows, 6);
  const pawns = [0, 1, 2, 3, 4, 5].map((c) => piece('pawn', c % 2 ? 'dark' : 'light', b.rows - 1, c, { shield: false }));
  const tiles = new Map();
  for (let c = 0; c < 6; c++) {
    const rows = shuffle(rng, Array.from({ length: b.rows - 3 }, (_, i) => i + 1)).slice(0, diff.tiles + diff.bombs);
    rows.forEach((r, i) => tiles.set(key(r, c), i < diff.bombs ? 'bomb' : pick(rng, GOOD)));
  }
  return { diff, board: b, pawns, tiles, rng, sel: null, over: null, note: '' };
}

// Avanza `p` `roll` casillas y aplica la loseta donde cae (una sola vez). Devuelve los efectos.
function advance(s, p, roll, dry = false) {
  const q = { ...p }, fx = [{ float: [p.row, p.col, String(roll)] }];
  q.row = Math.max(0, q.row - roll);
  const tile = s.tiles.get(key(q.row, q.col));
  if (q.row > 0 && tile) {
    if (tile === 'turbo') { q.row = Math.max(0, q.row - 2); fx.push({ ring: [q.row, q.col], color: '#ffcf6b' }, { float: [q.row, q.col, '+2'] }); }
    if (tile === 'ice') { q.row = Math.max(0, q.row - 1); fx.push({ sparkle: [q.row, q.col], color: '#9fe3ff' }); }
    if (tile === 'portal') { const to = Math.max(0, q.row - 3); fx.push({ ring: [q.row, q.col], color: '#c58bff' }, { ring: [to, q.col], color: '#c58bff' }, { sfx: 'warp' }); q.row = to; }
    if (tile === 'star') { q.shield = true; fx.push({ shield: [q.row, q.col] }, { power: p.id }); }
    if (tile === 'bomb') {
      fx.push({ blast: [[q.row, q.col]] });
      if (q.shield) { q.shield = false; fx.push({ shield: [q.row, q.col], broken: true }); }
      else { q.row = Math.min(s.board.rows - 1, q.row + 3); fx.push({ float: [q.row, q.col, '-3'] }); }
    }
  }
  if (!dry) Object.assign(p, q);
  return { fx, row: q.row };
}

function turn(s, p) {
  const roll = 1 + Math.floor(s.rng() * 4), { fx } = advance(s, p, roll);
  if (p.row === 0) { s.over = p.color === 'light' ? 'win' : 'lose'; s.note = p.color === 'light' ? t('race.won', 'Tu peón llegó primero.') : t('race.lost', 'Un peón rival llegó antes.'); }
  return { pre: [], post: fx };
}

export function tap(s, r, c) {
  const p = s.pawns.find((x) => x.color === 'light' && x.row === r && x.col === c);
  if (!p) return null;
  return turn(s, p);
}

// El bot tira y, si es listo, mueve el peón que más avanza con esa tirada.
export function enemy(s) {
  const mine = s.pawns.filter((p) => p.color === 'dark');
  const roll = 1 + Math.floor(s.rng() * 4);
  const p = s.diff.bot === 'random' ? pick(s.rng, mine) : mine.reduce((a, b) => (advance(s, b, roll, true).row - b.row < advance(s, a, roll, true).row - a.row ? b : a));
  const { fx } = advance(s, p, roll);
  if (p.row === 0) { s.over = 'lose'; s.note = t('race.lost', 'Un peón rival llegó antes.'); }
  return { pre: [], post: fx };
}

// Para la autocomprobación: el peón que más avanza con una tirada media.
export const auto = (s) => { const p = s.pawns.filter((x) => x.color === 'light').reduce((a, b) => (advance(s, b, 3, true).row < advance(s, a, 3, true).row ? b : a)); return [p.row, p.col]; };

export const pieces = (s) => s.pawns.map((p) => ({ ...p }));
export const marks = (s) => s.pawns.filter((p) => p.color === 'light').map((p) => [key(p.row, p.col), 'mv']);
export const labels = (s) => new Map([...s.tiles].filter(([k]) => !s.pawns.some((p) => key(p.row, p.col) === k)).map(([k, v]) => [k, MARK[v]]));
export const status = (s) => t('race.status', 'Toca uno de tus peones: tira el dado y avanza. Llega arriba antes que el bot.');
