import { legalMoves, cellsOf } from './rules.js';
import { BOSSES } from '../data/bosses.js';

// La reina golpea al entrar en el cuerpo del jefe y rebota. Cada golpe tiene precio: el jefe
// embiste en línea hacia donde vino el golpe. Escombros cortan líneas y frenan embestidas.
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 12, bosses: ['titan', 'golem', 'devourer'], charge: 2, rubble: 2, enrage: false, hp: 0 },
  normal: { name: 'Normal', turns: 9, bosses: ['hydra', 'ram', 'wall', 'rider'], charge: 2, rubble: 3, enrage: true, hp: 0 },
  dificil: { name: 'Difícil', turns: 8, bosses: ['golem', 'hydra', 'rider', 'ram'], charge: 3, rubble: 4, enrage: true, hp: 1 },
};
const key = (r, c) => r + ',' + c;
const board = (holes) => ({ rows: SIZE, cols: SIZE, holes, terrain: new Map(), portals: new Map() });
const pick = (list, rng) => list[Math.floor(rng() * list.length)];
const giantOf = (s) => s.pieces.find((p) => p.id === 'giant');
const hunterOf = (s) => s.pieces.find((p) => p.id === 'hunter');
const covers = (g, r, c, row = g.row, col = g.col) => r >= row && r < row + g.h && c >= col && c < col + g.w;

export function newGiantHunt(level = 'normal', rng = Math.random) {
  const diff = DIFFS[level] || DIFFS.normal;
  const data = BOSSES[pick(diff.bosses, rng)];
  const [h, w] = data.size;
  const hp = data.hp + diff.hp;
  const giant = {
    id: 'giant', type: 'boss-' + data.id, color: 'dark',
    row: Math.floor(rng() * Math.min(2, SIZE - h - 2)), col: Math.floor(rng() * (SIZE - w + 1)),
    h, w, hp, boss: true, moves: data.moves, bossId: data.id,
  };
  const hunter = { id: 'hunter', type: 'queen', color: 'light', row: SIZE - 1, col: Math.floor(rng() * SIZE) };
  const free = [];
  for (let r = 1; r < SIZE - 1; r++) for (let c = 0; c < SIZE; c++) {
    if (!covers(giant, r, c) && Math.abs(r - hunter.row) + Math.abs(c - hunter.col) > 1) free.push(key(r, c));
  }
  const holes = new Set();
  while (holes.size < diff.rubble) holes.add(free.splice(Math.floor(rng() * free.length), 1)[0]);
  return { diff, boss: data, board: board(holes), pieces: [hunter, giant], turns: diff.turns, over: null, events: [], hp, round: 0, lastEvent: null };
}

export const legal = (s) => s.over ? [] : legalMoves(hunterOf(s), s.pieces, s.board);

const footprintDistance = (g, t, row = g.row, col = g.col) =>
  Math.max(row - t.row, 0, t.row - (row + g.h - 1)) + Math.max(col - t.col, 0, t.col - (col + g.w - 1));

// Hacia dónde embiste: el lado del cuerpo por el que entró la reina.
function chargeDir(g, from) {
  const dr = from.row < g.row ? -1 : from.row >= g.row + g.h ? 1 : 0;
  const dc = from.col < g.col ? -1 : from.col >= g.col + g.w ? 1 : 0;
  return [dr, dc];
}

// Casillas que barrería la embestida (para avisar y para resolverla).
export function chargePath(s, from) {
  const g = giantOf(s);
  if (!g) return [];
  const [dr, dc] = chargeDir(g, from);
  const path = [];
  let r = g.row, c = g.col;
  for (let i = 0; i < s.diff.charge; i++) {
    const nr = r + dr, nc = c + dc;
    if (cellsOf(g, nr, nc).some(([a, b]) => a < 0 || b < 0 || a >= SIZE || b >= SIZE || s.board.holes.has(key(a, b)))) break;
    r = nr; c = nc;
    path.push({ row: r, col: c });
  }
  return path;
}

function charge(s, from) {
  const g = giantOf(s), hunter = hunterOf(s);
  const path = chargePath(s, from);
  if (!path.length) {
    s.events.push({ type: 'boss-stagger', id: g.id, from: { row: g.row, col: g.col }, to: { row: g.row, col: g.col } });
    return;
  }
  const start = { row: g.row, col: g.col };
  let end = path[path.length - 1];
  const hitAt = path.find((p) => covers(g, hunter.row, hunter.col, p.row, p.col));
  if (hitAt) end = hitAt;
  g.row = end.row;
  g.col = end.col;
  s.events.push({ type: 'boss-charge', id: g.id, from: start, to: { ...end }, hit: !!hitAt });
  if (hitAt) { s.over = 'lose'; s.pieces = [g]; }
}

// Paso normal: se acerca a la reina y la aplasta si puede.
function step(s) {
  const g = giantOf(s), hunter = hunterOf(s);
  const options = legalMoves(g, s.pieces, s.board);
  if (!options.length) {
    s.events.push({ type: 'boss-stagger', id: g.id, from: { row: g.row, col: g.col }, to: { row: g.row, col: g.col } });
    return;
  }
  const ranked = options.map((m, i) => ({
    ...m,
    score: (m.hits.some((p) => p.id === 'hunter') ? 1e4 : 0)
      - footprintDistance(g, hunter, m.row, m.col) * 10
      + ((s.round + i) % 3) * 0.01,
  })).sort((a, b) => b.score - a.score || a.row - b.row || a.col - b.col);
  const next = ranked[0];
  const from = { row: g.row, col: g.col };
  g.row = next.row;
  g.col = next.col;
  const caught = next.hits.some((p) => p.id === 'hunter');
  s.events.push({ type: 'boss-move', id: g.id, from, to: { row: g.row, col: g.col }, hit: caught });
  if (caught) { s.over = 'lose'; s.pieces = [g]; }
}

export const enraged = (s) => s.diff.enrage && giantOf(s) && giantOf(s).hp * 2 <= s.hp;

export function move(s, row, col) {
  if (s.over) return false;
  const hunter = hunterOf(s), giant = giantOf(s);
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m || !hunter || !giant) return false;
  const from = { row: hunter.row, col: hunter.col };
  s.turns--;
  s.round++;
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
    charge(s, from);
  } else {
    hunter.row = row;
    hunter.col = col;
    s.lastEvent = 'move';
    s.events = [{ type: 'hunter-move', id: hunter.id, from, to: { row, col } }];
    step(s);
    if (!s.over && enraged(s)) step(s);
  }
  if (!s.over && s.turns <= 0) s.over = 'lose';
  return true;
}

// Casillas donde el jefe aplastaría a la reina en su próximo paso.
export function threatCells(s) {
  const g = giantOf(s);
  if (!g || s.over) return new Set();
  const out = new Set();
  for (const m of legalMoves(g, s.pieces.filter((p) => p.id === 'giant'), s.board)) {
    for (const [r, c] of cellsOf(g, m.row, m.col)) if (!covers(g, r, c)) out.add(key(r, c));
  }
  return out;
}
