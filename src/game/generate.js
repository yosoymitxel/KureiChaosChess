// Procedural generation: run map, board shapes and starting armies.
import { mulberry32, pickFrom } from '../core/rng.js';
import { key } from './rules.js';
import { BOSSES, BOSS_IDS } from '../data/bosses.js';
import { applyMutations } from '../data/mutations.js';


const MOD_POOL = ['none', 'promote', 'promote', 'chaos', 'chaos', 'rush', 'rush', 'fog', 'ice', 'portal', 'rest', 'bag', 'elite', 'elite', 'connect4', 'bomber'];

export function generateMap(seed) {
  const rng = mulberry32(seed);
  const floors = 5 + Math.floor(rng() * 11);
  const layouts = Array.from({ length: floors }, (_, f) => (f === 0 || f === floors - 1 ? 1 : 1 + Math.floor(rng() * 3)));
  const nodes = [], connections = [];
  layouts.forEach((nc, f) => {
    const isBoss = f === floors - 1, isFirst = f === 0;
    for (let c = 0; c < nc; c++) {
      const nodeSeed = Math.floor(rng() * 1e6);
      let modifier = isFirst ? 'none' : isBoss ? 'boss' : pickFrom(rng, MOD_POOL);
      if (modifier === 'elite' && f < 2) modifier = 'promote'; // elites only once the player has a few cards
      nodes.push({ id: `f${f}c${c}`, floor: f, column: c, totalCols: nc, modifier, seed: nodeSeed, isBoss, isFirst });
    }
  });
  const nodeAt = (f, c) => nodes.find((n) => n.floor === f && n.column === c);
  for (let f = 0; f < floors - 1; f++) {
    const cc = layouts[f], nc = layouts[f + 1];
    for (let c = 0; c < cc; c++) {
      const ti = Math.round((cc > 1 ? c / (cc - 1) : 0.5) * (nc - 1));
      const targets = new Set([ti]);
      if (nc > 1) {
        if (rng() < 0.5) targets.add(Math.max(0, ti - 1));
        if (rng() < 0.5) targets.add(Math.min(nc - 1, ti + 1));
      }
      for (const t of targets) connections.push({ from: nodeAt(f, c).id, to: nodeAt(f + 1, t).id });
    }
    for (let c = 0; c < nc; c++) {
      const to = nodeAt(f + 1, c);
      if (!connections.some((cn) => cn.to === to.id)) {
        const si = Math.round((nc > 1 ? c / (nc - 1) : 0.5) * (cc - 1));
        connections.push({ from: nodeAt(f, si).id, to: to.id });
      }
    }
  }
  return { nodes, floors, connections, layouts };
}


const SHAPES = ['diamond', 'hourglass', 'cross', 'fortress', 'random', 'stripes', 'scatter', 'lake', 'canyon', 'islands', 'ring', 'bridges', 'checker'];

export function generateBoard(seed, floor, totalFloors, modifier) {
  const rng = mulberry32(seed);
  const t = totalFloors > 1 ? floor / (totalFloors - 1) : 0;
  const base = 8 + Math.round(t * 4);
  const rows = Math.max(9, Math.min(12, base + (rng() < 0.5 ? 1 : 0)));
  const cols = Math.max(9, Math.min(12, base + (rng() < 0.5 ? 1 : 0)));
  const safe = rows <= 9 ? 2 : rows <= 10 ? 3 : 4;
  const shape = pickFrom(rng, SHAPES);
  const holes = new Set();
  const addSym = (r, c) => {
    for (const [rr, cc] of [[r, c], [rows - 1 - r, c], [r, cols - 1 - c], [rows - 1 - r, cols - 1 - c]])
      if (rr >= safe && rr < rows - safe && cc >= 0 && cc < cols) holes.add(key(rr, cc));
  };
  const cR = (rows - 1) / 2, cC = (cols - 1) / 2, maxDist = cR + cC;
  for (let r = safe; r < rows - safe; r++) {
    for (let c = 0; c < Math.ceil(cols / 2); c++) {
      const dr = Math.abs(r - cR), dc = Math.abs(c - cC), dist = dr + dc;
      const edgeR = Math.min(r, rows - 1 - r), edgeC = Math.min(c, cols - 1 - c);
      let out = false;
      switch (shape) {
        case 'diamond': out = dist > maxDist * 0.75 && rng() < 0.85; break;
        case 'hourglass': out = Math.abs(dr - dc) > Math.min(rows, cols) * 0.34; break;
        case 'cross': out = dr > rows * 0.35 && dc > cols * 0.35; break;
        case 'fortress': out = dr > rows * 0.4 && dc > cols * 0.4; break;
        case 'random': out = dist > maxDist * 0.5 && rng() < 0.6; break;
        case 'stripes': out = dc > cols * 0.3 && (r + c) % 3 === 0 && rng() < 0.7; break;
        case 'scatter': out = dist > maxDist * 0.4 && rng() < 0.5; break;
        case 'lake': out = (dist < maxDist * 0.35 && rng() < 0.8) || (dist > maxDist * 0.65 && rng() < 0.5); break;
        case 'canyon': out = Math.abs(c - cC) < 1.6 && edgeR > 1 && rng() < 0.7; break;
        case 'islands': out = (edgeR > 1 && edgeC > 1 && rng() < 0.22) || (dist > maxDist * 0.7 && rng() < 0.6); break;
        case 'ring': out = dr <= rows * 0.16 && dc <= cols * 0.16; break; // a pit in the middle to walk around
        case 'bridges': out = dr < 0.8 && c % 3 !== 1; break; // a river across the middle with bridges
        case 'checker': out = (r + c) % 4 === 0 && edgeC > 0; break;
      }
      if (out) addSym(r, c);
    }
  }
  const maxHoles = Math.floor(rows * cols * 0.35);
  if (holes.size > maxHoles) {
    const arr = [...holes];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    holes.clear();
    arr.slice(0, maxHoles).forEach((k) => holes.add(k));
  }
  const board = { rows, cols, holes, shape, protectRows: safe, terrain: new Map(), portals: new Map() };
  if (modifier === 'ice' || modifier === 'portal') addTerrain(board, rng, modifier);
  return board;
}

// Terrain lives in the middle rows, mirrored so neither side gets the better half.
function addTerrain(board, rng, kind) {
  const { rows, cols, holes, protectRows: safe, terrain, portals } = board;
  const mid = [];
  for (let r = safe; r < rows - safe; r++) for (let c = 0; c < cols; c++) if (!holes.has(key(r, c))) mid.push([r, c]);
  const mirror = ([r, c]) => [rows - 1 - r, cols - 1 - c];
  if (kind === 'ice') {
    for (const cell of mid) {
      if (rng() > 0.2) continue;
      for (const [r, c] of [cell, mirror(cell)]) if (!holes.has(key(r, c))) terrain.set(key(r, c), 'ice');
    }
  } else {
    // Two portal pairs, each linking a tile with its mirror across the board.
    for (let i = 0; i < 2 && mid.length; i++) {
      const a = mid.splice(Math.floor(rng() * mid.length), 1)[0], b = mirror(a);
      if (key(...a) === key(...b) || terrain.has(key(...a)) || holes.has(key(...b))) continue;
      terrain.set(key(...a), 'portal'); terrain.set(key(...b), 'portal');
      portals.set(key(...a), key(...b)); portals.set(key(...b), key(...a));
    }
  }
}


const BACK_RANK = {
  1: ['king'], 2: ['king', 'rook'], 3: ['rook', 'king', 'rook'], 4: ['rook', 'king', 'knight', 'rook'],
  5: ['rook', 'knight', 'king', 'knight', 'rook'], 6: ['rook', 'knight', 'bishop', 'king', 'bishop', 'knight'],
  7: ['rook', 'knight', 'bishop', 'king', 'bishop', 'knight', 'rook'],
  8: ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
  9: ['rook', 'knight', 'bishop', 'queen', 'king', 'queen', 'bishop', 'knight', 'rook'],
};
const SECOND_RANK = {
  1: ['guard'], 2: ['guard', 'guard'], 3: ['guard', 'cannon', 'guard'], 4: ['guard', 'camel', 'camel', 'guard'],
  5: ['guard', 'camel', 'cannon', 'camel', 'guard'], 6: ['guard', 'advisor', 'camel', 'camel', 'advisor', 'guard'],
  7: ['guard', 'advisor', 'camel', 'cannon', 'camel', 'advisor', 'guard'],
  8: ['guard', 'advisor', 'camel', 'cannon', 'cannon', 'camel', 'advisor', 'guard'],
  9: ['guard', 'advisor', 'advisor', 'camel', 'cannon', 'camel', 'advisor', 'advisor', 'guard'],
};
const pawnRank = (n) => Array.from({ length: n }, (_, i) => (n >= 4 && (i === 0 || i === n - 1) ? 'elephant' : 'pawn'));
const centered = (cols, n) => (n >= cols.length ? cols.slice() : cols.slice(Math.floor((cols.length - n) / 2), Math.floor((cols.length - n) / 2) + n));

let nextId = 1;
export function makePiece(type, color, row, col, extra = {}) {
  const p = { id: 'p' + nextId++, type, color, row, col, royal: type === 'king', ...extra };
  if (type === 'pawn' && p.startRow == null) p.startRow = row;
  return p;
}

// Elite floors: the enemy queen holds out until she is the last piece standing,
// and up to two heavy pieces are escorted (immune while their escort lives).
function protectElites(pieces) {
  const dark = pieces.filter((p) => p.color === 'dark' && !p.royal);
  const last = dark.find((p) => p.type === 'queen') || dark.find((p) => p.type === 'rook');
  if (last) last.trait = 'last';
  const escorts = dark.filter((p) => p.type === 'guard' || p.type === 'advisor');
  const dist = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  for (const p of dark.filter((p) => p !== last && (p.type === 'rook' || p.type === 'cannon')).slice(0, 2)) {
    const g = escorts.filter((e) => !pieces.some((o) => o.escort === e.id)).sort((a, b) => dist(a, p) - dist(b, p))[0];
    if (g) p.escort = g.id;
  }
}

export function placePieces(board, { playerCount, isBoss, elite, seed, mutations, bonuses }) {
  const rng = mulberry32(seed + 7);
  const { rows, cols } = board;
  const pieces = [];
  const valid = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && !board.holes.has(key(r, c));
  const occupied = (r, c) => pieces.some((p) => p.row === r && p.col === c);

  function side(color, backRow, dir, layersWanted) {
    const backCols = [...Array(cols).keys()].filter((c) => valid(backRow, c));
    if (backCols.length < 2) return;
    let back = Math.min(backCols.length, 9);
    if ((backCols.length - back) % 2) back -= 1;
    back = Math.max(back, 3);
    const counts = [back];
    if (layersWanted >= 2 && back - 2 >= 3) counts.push(back - 2);
    if (layersWanted >= 3 && back - 4 >= 3) counts.push(back - 4);
    if (layersWanted >= 4 && back - 6 >= 2) counts.push(back - 6);
    counts.forEach((n, l) => {
      const r = backRow + dir * l;
      const free = [...Array(cols).keys()].filter((c) => valid(r, c));
      const sel = centered(free, Math.min(n, free.length));
      const types = l === 0 ? BACK_RANK[sel.length] || BACK_RANK[8] : l === 1 ? SECOND_RANK[sel.length] : pawnRank(sel.length);
      sel.forEach((c, i) => pieces.push(makePiece(types[i] || 'pawn', color, r, c)));
    });
  }
  side('dark', 0, 1, 2 + Math.floor(rng() * 3));
  side('light', rows - 1, -1, 2 + Math.floor(rng() * 3));

  if (playerCount === 3) {
    const cr = Math.floor(rows / 2), cc = Math.floor(cols / 2);
    for (const [r, c, t] of [[cr - 1, cc - 1, 'guard'], [cr - 1, cc, 'pawn'], [cr - 1, cc + 1, 'guard'], [cr, cc - 1, 'camel'], [cr, cc, 'king'], [cr, cc + 1, 'queen']])
      if (valid(r, c)) pieces.push(makePiece(t, 'wild', r, c));
  }

  if (isBoss) {
    // Enemy officers learn borrowed moves…
    const extras = ['knight', 'bishop', 'rook', 'queen', 'king', 'camel', 'elephant'];
    for (const p of pieces) {
      if (p.color === 'light' || !(p.row < board.protectRows || p.type === 'guard' || p.type === 'advisor')) continue;
      const set = new Set();
      while (set.size < (rng() < 0.35 ? 2 : 1)) { const t = pickFrom(rng, extras); if (t !== p.type) set.add(t); }
      p.extraMoveTypes = [...set];
    }
    // …and the dark king is replaced by a multi-cell boss.
    placeBoss(pieces, board, BOSS_IDS[Math.floor(rng() * BOSS_IDS.length)]);
  }

  if (elite) protectElites(pieces);
  applyMutations(pieces, mutations, 'light');

  if (bonuses?.promoteOne) { const p = pieces.find((p) => p.type === 'pawn' && p.color === 'light'); if (p) p.type = 'queen'; }
  for (const [flag, type, row] of [['extraRook', 'rook', rows - 1], ['extraPawn', 'pawn', rows - 2]]) {
    if (!bonuses?.[flag]) continue;
    const c = [...Array(cols).keys()].find((c) => valid(row, c) && !occupied(row, c));
    if (c != null) pieces.push(makePiece(type, 'light', row, c));
  }
  return pieces;
}

export function placeBoss(pieces, board, bossId) {
  const def = BOSSES[bossId];
  const [h, w] = def.size;
  const col = Math.max(0, Math.floor((board.cols - w) / 2));
  const cells = [];
  for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) cells.push(key(i, col + j));
  // Clear the footprint (a 3×3 may reach past the safe rows) and the old king: the boss is the new royal piece.
  cells.forEach((k) => board.holes.delete(k));
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    if (p.color === 'dark' && (p.type === 'king' || cells.includes(key(p.row, p.col)))) pieces.splice(i, 1);
  }
  const boss = makePiece(def.art, 'dark', 0, col, {
    boss: def.id, h, w, hp: def.hp, maxHp: def.hp, moves: [...def.moves], royal: true, name: def.name, absorb: !!def.absorb,
  });
  pieces.push(boss);
  return boss;
}
