import { legalMoves } from './rules.js';

// Deducción: entre las piezas carmesí se esconde un impostor. La pista es una casilla que el
// impostor amenaza; cada acusación fallida destapa otra. Los tipos se repiten, así que la pista
// hay que leerla en el tablero (alcance, bloqueos), no en el nombre de la pieza.
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 3, upfront: 1, count: 4, pool: ['rook', 'bishop', 'knight', 'queen'], ambiguity: 2 },
  normal: { name: 'Normal', turns: 2, upfront: 1, count: 5, pool: ['rook', 'bishop', 'knight', 'queen', 'king'], ambiguity: 3 },
  // Difícil: un solo intento con dos pistas a la vista; cada una por separado apunta a tres o más.
  dificil: { name: 'Difícil', turns: 1, upfront: 2, count: 6, pool: ['rook', 'bishop', 'knight', 'king', 'pawn'], ambiguity: 3, each: 3 },
};
export const NAMES = { rook: 'torre', bishop: 'alfil', knight: 'caballo', queen: 'dama', king: 'rey', pawn: 'peón' };
const key = (r, c) => r + ',' + c;
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });

// Casillas que amenaza una pieza: sus destinos vacíos o con pieza marfil (el peón solo en diagonal).
export function reach(s, p) {
  if (p.type === 'pawn') {
    return [-1, 1].map((dc) => key(p.row + 1, p.col + dc)).filter((k) => {
      const [r, c] = k.split(',').map(Number);
      return r < SIZE && c >= 0 && c < SIZE && !s.pieces.some((x) => x.color === 'dark' && x.row === r && x.col === c);
    });
  }
  return legalMoves(p, s.pieces, s.board).map((m) => key(m.row, m.col));
}

function build(diff, rng) {
  const pieces = [{ id: 'king', type: 'king', color: 'light', row: SIZE - 1, col: 3, royal: true }];
  const taken = new Set([key(SIZE - 1, 3)]);
  for (let i = 0; i < diff.count; i++) {
    let r, c;
    do { r = Math.floor(rng() * (SIZE - 2)); c = Math.floor(rng() * SIZE); } while (taken.has(key(r, c)));
    taken.add(key(r, c));
    pieces.push({ id: 'suspect-' + (i + 1), type: diff.pool[Math.floor(rng() * diff.pool.length)], color: 'dark', row: r, col: c });
  }
  return { pieces, board: board() };
}

// Pistas: cada una sigue señalando al impostor y la primera apunta a varios sospechosos.
function clues(s, impostor, diff, rng) {
  const suspects = s.pieces.filter((p) => p.color === 'dark');
  const reaches = new Map(suspects.map((p) => [p.id, new Set(reach(s, p))]));
  const own = [...reaches.get(impostor)].filter((k) => !s.pieces.some((p) => key(p.row, p.col) === k));
  const shared = (k) => suspects.filter((p) => reaches.get(p.id).has(k)).length;
  const first = own.filter((k) => shared(k) >= Math.min(diff.ambiguity, suspects.length));
  if (!first.length) return null;
  const list = [first[Math.floor(rng() * first.length)]];
  let alive = suspects.filter((p) => reaches.get(p.id).has(list[0]));
  const total = diff.upfront + diff.turns - 1;
  while (list.length < total && alive.length > 1) {
    // Cada pista descarta a alguno; la última deja a uno solo.
    const opts = own.filter((k) => !list.includes(k) && shared(k) >= (diff.each || 1))
      .map((k) => ({ k, left: alive.filter((p) => reaches.get(p.id).has(k)).length }))
      .filter((o) => o.left < alive.length);
    const last = list.length === total - 1;
    const pool = last ? opts.filter((o) => o.left === 1) : opts.filter((o) => o.left > 1);
    if (!pool.length) return null;
    const pick = pool[Math.floor(rng() * pool.length)];
    list.push(pick.k);
    alive = alive.filter((p) => reaches.get(p.id).has(pick.k));
  }
  return alive.length === 1 ? list : null;
}

export function newKingImpostor(level = 'normal', rng = Math.random) {
  const diff = DIFFS[level] || DIFFS.normal;
  for (let i = 0; i < 500; i++) {
    const g = build(diff, rng);
    const suspects = g.pieces.filter((p) => p.color === 'dark');
    const impostor = suspects[Math.floor(rng() * suspects.length)];
    const s = { diff, pieces: g.pieces, board: g.board, impostor: impostor.id, targetType: impostor.type, turns: diff.turns, over: null, chosen: null, revealed: new Set() };
    const list = clues(s, impostor.id, diff, rng);
    if (!list) continue;
    s.clues = list;
    s.shown = diff.upfront;
    return s;
  }
  throw new Error('No se pudo generar una ronda del rey impostor');
}

export const activeClues = (s) => s.clues.slice(0, s.shown);

export function choose(s, id) {
  if (s.over || s.revealed.has(id) || !s.pieces.some((p) => p.id === id && p.color === 'dark')) return false;
  s.chosen = id;
  s.revealed.add(id);
  if (id === s.impostor) { s.over = 'win'; return true; }
  s.turns--;
  if (s.turns <= 0) s.over = 'lose';
  else s.shown = Math.min(s.clues.length, s.shown + 1);
  return true;
}
