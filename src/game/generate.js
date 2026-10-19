// Procedural generation: run map, board shapes and starting armies.
import { mulberry32, pickFrom } from '../core/rng.js';
import { key, threatenedPieces, legalMoves, ctxOf } from './rules.js';
import { BOSSES } from '../data/bosses.js';
import { applyMutations } from '../data/mutations.js';
import { pickModifier, miniBossFloors, armyForFloor, ARMY_STEPS, isMiniModifier, RARE_TYPES, MINI_BOSSES, FINAL_BOSSES } from './difficulty.js';

export function generateMap(seed, prefs) {
  const rng = mulberry32(seed);
  const floors = 5 + Math.floor(rng() * 11);
  // Mini-jefes de control: un solo nodo, sin hermanos, en los tercios medio y tardío (ver difficulty.js).
  const miniBoss = new Set(miniBossFloors(floors, rng));
  const layouts = Array.from({ length: floors }, (_, f) => (f === 0 || f === floors - 1 || miniBoss.has(f) ? 1 : 2 + Math.floor(rng() * 2)));
  const nodes = [], connections = [];
  const usedMinis = []; // un minijuego no se repite dentro de la run
  let prev = []; // mecánicas del piso anterior: no se repiten al bajar
  // Ritmo: nada de descanso tras la primera pelea, nunca minijuegos en dos pisos seguidos ni un piso
  // que obligue a jugar uno (como mucho uno por piso), y antes de cada jefe se ofrece un descanso.
  const bossNext = (f) => f + 1 === floors - 1 || miniBoss.has(f + 1);
  layouts.forEach((nc, f) => {
    const isBoss = f === floors - 1, isFirst = f === 0, isMiniBoss = miniBoss.has(f);
    const here = [];
    const noMini = () => nc === 1 || prev.some(isMiniModifier) || here.some(isMiniModifier);
    for (let c = 0; c < nc; c++) {
      const nodeSeed = Math.floor(rng() * 1e6);
      const skip = [...prev, ...here, ...(f === 1 ? ['rest', 'bag'] : [])];
      let modifier = isFirst ? 'none' : (isBoss || isMiniBoss) ? 'boss'
        : pickModifier(rng, { floor: f, floors, skip, usedMinis, prefs, noMini: noMini() }) ?? 'rest';
      if (c === nc - 1 && nc > 1 && bossNext(f) && !here.includes('rest') && !prev.includes('rest')) modifier = 'rest';
      if (isMiniModifier(modifier)) usedMinis.push(modifier);
      here.push(modifier);
      nodes.push({ id: `f${f}c${c}`, floor: f, column: c, totalCols: nc, modifier, seed: nodeSeed, isBoss, isMiniBoss, isFirst });
    }
    prev = here;
  });
  // Garantía de ritmo: en runs de 8 pisos o más caen al menos dos minijuegos distintos. Si el
  // sorteo no los trajo, un nodo común del camino se convierte en uno que falte.
  if (floors >= 8) {
    const count = () => nodes.filter((n) => isMiniModifier(n.modifier)).length;
    // Primero lejos de otro minijuego; si no alcanza, vale el piso de al lado. Nunca dos en un piso
    // ni en uno de un solo nodo: siempre queda una partida como alternativa.
    const miniNear = (f, span) => nodes.some((o) => Math.abs(o.floor - f) <= span && isMiniModifier(o.modifier));
    const spare = nodes.filter((n) => n.floor >= 2 && n.totalCols > 1 && !n.isBoss && !n.isMiniBoss && n.modifier !== 'rest');
    spare.sort((a, b) => (Number(['bag', 'elite'].includes(a.modifier)) - Number(['bag', 'elite'].includes(b.modifier))));
    for (const span of [1, 0]) for (const n of spare) {
      if (count() >= 2) break;
      if (isMiniModifier(n.modifier) || miniNear(n.floor, span)) continue;
      const id = pickModifier(rng, { floor: n.floor, floors, usedMinis, mini: true, prefs });
      if (!id) break;
      n.modifier = id;
      usedMinis.push(id);
    }
  }
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

// Run de aprendizaje: cuatro pisos en línea y cada uno enseña una sola cosa.
const LESSONS = [
  ['none', 'Toca una pieza tuya para ver adónde va y una rival para ver su alcance en rojo. Ganas al capturar su rey.'],
  ['ice', 'Las casillas especiales se explican al tocarlas. Sobre el hielo las piezas resbalan hasta chocar.'],
  ['mates', 'Entre partida y partida salen minijuegos. Si ganas, quedan abiertos para jugarlos sueltos desde el menú.'],
  ['boss', 'Arriba de la torre espera un jefe: ocupa varias casillas y aguanta varios golpes. Las cartas de tu mano ayudan.'],
];
export function tutorialMap(seed) {
  const rng = mulberry32(seed);
  const last = LESSONS.length - 1;
  const nodes = LESSONS.map(([modifier, lesson], f) => ({ id: `f${f}c0`, floor: f, column: 0, totalCols: 1, modifier, seed: Math.floor(rng() * 1e6), isBoss: f === last, isMiniBoss: false, isFirst: f === 0, lesson }));
  const connections = nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id }));
  return { nodes, floors: nodes.length, connections, layouts: nodes.map(() => 1) };
}


const SHAPES = ['diamond', 'hourglass', 'cross', 'fortress', 'random', 'stripes', 'scatter', 'lake', 'canyon', 'islands', 'ring', 'bridges', 'checker'];

export function generateBoard(seed, floor, totalFloors, modifier) {
  const rng = mulberry32(seed);
  const t = totalFloors > 1 ? floor / (totalFloors - 1) : 0;
  // Los primeros pisos son un 8×8 de los de siempre para aprender piezas y mutaciones;
  // de ahí el tablero crece hasta 12.
  const small = t < 0.2;
  const base = 8 + Math.round(t * 4);
  const rows = small ? 8 : Math.max(9, Math.min(12, base + (rng() < 0.5 ? 1 : 0)));
  const cols = small ? 8 : Math.max(9, Math.min(12, base + (rng() < 0.5 ? 1 : 0)));
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
  const maxHoles = Math.floor(rows * cols * (small ? 0.12 : 0.35));
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

// Aperturas: sobre la formación clásica, una doctrina intercambia piezas de valor parecido.
// Cae la misma en los dos bandos, así que la variedad no rompe la justicia de la partida.
const FORMATIONS = {
  clasica: {},
  caballeria: { bishop: 'knight' },
  exotica: { knight: 'camel' },
  asedio: { rook: 'cannon' },
  fortaleza: { camel: 'guard' },
};
const FORMATION_POOL = ['clasica', 'caballeria', 'exotica', 'asedio', 'fortaleza'];

// Formas de despliegue: pirámide, inversa (frente ancho), flancos con muro y dos líneas simples.
// La forma y el número de líneas (2 a 4) se sortean una vez por partida y valen para los dos bandos.
const DEPLOYS = {
  piramide: (back, layers) => [back, back - 2, back - 4, back - 6].slice(0, layers),
  inversa: (back, layers) => [Math.max(3, back - 4), back, back - 2, back - 4].slice(0, layers),
  flancos: (back, layers) => [back - 2, back, back - 2, back - 4].slice(0, layers),
  simple: (back) => [back, back - 2],
};
const DEPLOY_POOL = ['piramide', 'inversa', 'flancos', 'simple', 'simple'];
const spread = (cols, n) => {
  if (n >= cols.length) return cols.slice();
  const out = [];
  for (let lo = 0, hi = cols.length - 1; out.length < n;) out.push(out.length % 2 === 0 ? cols[lo++] : cols[hi--]);
  return out.sort((a, b) => a - b);
};

let nextId = 1;
export function makePiece(type, color, row, col, extra = {}) {
  const p = { id: 'p' + nextId++, type, color, row, col, royal: type === 'king', ...extra };
  if (type === 'pawn' && p.startRow == null) p.startRow = row;
  return p;
}

// Las reglas de élite llegan de a una: la reina última desde el primer piso de élite,
// las escoltas solo en la segunda mitad de la torre.
export function eliteVariants(floor, floors) {
  const v = [{ id: 'last', icon: 'flag', name: 'Reina última', desc: 'Su reina (o una torre) no cae hasta que sea la última pieza de su bando.' }];
  if (floors > 1 && floor / (floors - 1) >= 0.5) v.push({ id: 'escort', icon: 'lock', name: 'Escolta', desc: 'Hasta dos torres o cañones no caen mientras viva la guardia atada a ellos con la cuerda.' });
  return v;
}

function protectElites(pieces, variants) {
  const dark = pieces.filter((p) => p.color === 'dark' && !p.royal);
  const last = dark.find((p) => p.type === 'queen') || dark.find((p) => p.type === 'rook');
  if (last) last.trait = 'last';
  if (!variants.some((v) => v.id === 'escort')) return;
  const escorts = dark.filter((p) => p.type === 'guard' || p.type === 'advisor');
  const dist = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  for (const p of dark.filter((p) => p !== last && (p.type === 'rook' || p.type === 'cannon')).slice(0, 2)) {
    const g = escorts.filter((e) => !pieces.some((o) => o.escort === e.id)).sort((a, b) => dist(a, p) - dist(b, p))[0];
    if (g) p.escort = g.id;
  }
}

// La rareza no espera al final de la torre: cada bando lleva al menos una pieza de las de casa
// (camello, cañón o elefante) desde el primer piso. El cambio es espejo en los dos bandos.
function ensureRare(pieces, color, cols) {
  const mine = pieces.filter((p) => p.color === color);
  if (mine.some((p) => RARE_TYPES.includes(p.type))) return;
  const cC = (cols - 1) / 2;
  const cand = mine.filter((p) => p.type === 'guard' || p.type === 'advisor')
    .sort((a, b) => Math.abs(a.col - cC) - Math.abs(b.col - cC))[0];
  if (cand) cand.type = 'camel';
}

// No match starts with a piece hanging: corner rooks on open files used to face each other on move 1.
// Re-roll the deployment (new seed, same board) until no side has a piece under attack.
// A boss's wide reach can make that impossible, so keep the least exposed try.
export function placePieces(board, opts) {
  let best = null, least = Infinity;
  for (let k = 0; k < 30 && least > 0; k++) {
    const pieces = placeOnce(board, { ...opts, seed: opts.seed + k * 101 });
    const colors = [...new Set(pieces.map((p) => p.color))];
    const exposed = colors.reduce((n, c) => n + threatenedPieces(pieces, c, board).size, 0);
    if (exposed < least) { best = pieces; least = exposed; }
  }
  return best;
}

function placeOnce(board, { playerCount, isBoss, isMiniBoss, elite, seed, mutations, bonuses, floor, totalFloors }) {
  const rng = mulberry32(seed + 7);
  const guide = floor == null ? ARMY_STEPS[2] : armyForFloor(floor, totalFloors || 1);
  // La variedad nunca debe anular una mutación del jugador: fuera las doctrinas que le quitan su pieza.
  const clash = (mut, formation) => (mutations?.includes(mut) ? formation : null);
  const blocked = new Set([clash('bishopOrth', 'caballeria'), clash('knightBishop', 'exotica'), clash('towerDiag', 'asedio')].filter(Boolean));
  const pool = FORMATION_POOL.filter((f) => !blocked.has(f));
  const swaps = FORMATIONS[pickFrom(rng, pool.length ? pool : ['clasica'])];
  const deploy = pickFrom(rng, DEPLOY_POOL);
  const layers = pickFrom(rng, guide.layers);
  const { rows, cols } = board;
  const pieces = [];
  const valid = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && !board.holes.has(key(r, c));
  const occupied = (r, c) => pieces.some((p) => p.row === r && p.col === c);

  function side(color, backRow, dir) {
    const backCols = [...Array(cols).keys()].filter((c) => valid(backRow, c));
    if (backCols.length < 2) return;
    let back = Math.min(backCols.length, 9);
    if ((backCols.length - back) % 2) back -= 1;
    back = Math.max(back, 3);
    DEPLOYS[deploy](back, layers).forEach((n, l) => {
      const r = backRow + dir * l;
      const free = [...Array(cols).keys()].filter((c) => valid(r, c));
      const take = Math.min(n, free.length);
      const sel = deploy === 'flancos' && l === 0 ? spread(free, take) : centered(free, take);
      const types = (l === 0 ? BACK_RANK[sel.length] || BACK_RANK[8] : l === 1 ? SECOND_RANK[sel.length] : pawnRank(sel.length)).map((t) => swaps[t] || t);
      sel.forEach((c, i) => pieces.push(makePiece(types[i] || 'pawn', color, r, c)));
    });
    // La segunda capa es más estrecha: sin esto, las torres de las esquinas miran una columna
    // abierta y la partida empieza cambiando torre por torre.
    for (const p of pieces.filter((x) => x.color === color && x.row === backRow && x.type === 'rook')) {
      const r = backRow + dir;
      if (valid(r, p.col) && !occupied(r, p.col)) pieces.push(makePiece('pawn', color, r, p.col));
    }
    // En los pisos altos el cañón no se queda delante del rey: un paso al costado, si se puede.
    const king = pieces.find((x) => x.color === color && x.type === 'king');
    const front = king && pieces.find((x) => x.color === color && x.type === 'cannon' && x.col === king.col && x.row === king.row + dir);
    if (front && floor >= 3) {
      const side = pieces.find((x) => x.color === color && x.row === front.row && Math.abs(x.col - front.col) === 1 && x.type !== 'cannon');
      if (side) [side.type, front.type] = [front.type, side.type];
    }
  }
  side('dark', 0, 1);
  side('light', rows - 1, -1);
  ensureRare(pieces, 'dark', cols);
  ensureRare(pieces, 'light', cols);
  // Con huecos, un elefante o un camello puede no tener ni una casilla a la que saltar en todo el
  // nivel (se mira el tablero vacío): pasa a ser la primera pieza que sí pueda moverse.
  for (const p of pieces) {
    if (p.type !== 'elephant' && p.type !== 'camel') continue;
    const alone = (t) => { const q = { ...p, type: t }; return legalMoves(q, [q], board).length; };
    if (!alone(p.type)) p.type = ['knight', 'bishop', 'guard', 'pawn'].find((t) => alone(t)) || p.type;
  }

  if (playerCount === 3) {
    const cr = Math.floor(rows / 2), cc = Math.floor(cols / 2);
    for (const [r, c, t] of [[cr - 1, cc - 1, 'guard'], [cr - 1, cc, 'pawn'], [cr - 1, cc + 1, 'guard'], [cr, cc - 1, 'camel'], [cr, cc, 'king'], [cr, cc + 1, 'queen']])
      if (valid(r, c)) pieces.push(makePiece(t, 'wild', r, c));
  }

  if (isBoss || isMiniBoss) {
    // El rey oscuro deja su sitio al jefe multi-casilla: menores custodian, mayores cierran.
    placeBoss(pieces, board, pickFrom(rng, isMiniBoss ? MINI_BOSSES : FINAL_BOSSES));
    // Los oficiales que sobreviven aprenden movimientos prestados: el minijefe enseña la mecánica
    // con dos de ellos, el jefe final la reparte entre todos.
    const extras = ['knight', 'bishop', 'rook', 'queen', 'king', 'camel', 'elephant'];
    const candidates = pieces.filter((p) => p.color === 'dark' && !p.boss && (p.row < board.protectRows || p.type === 'guard' || p.type === 'advisor'));
    const targets = isMiniBoss ? [...candidates].sort(() => rng() - 0.5).slice(0, 2) : candidates;
    // Un préstamo que ya ataca en la jugada 1 se vuelve a sortear; si ninguno sirve, la pieza se queda sin él.
    const ctx = ctxOf(pieces, board);
    for (const p of targets) {
      for (let k = 0; k < 6; k++) {
        const set = new Set(), n = rng() < 0.35 ? 2 : 1;
        while (set.size < n) { const t = pickFrom(rng, extras); if (t !== p.type) set.add(t); }
        p.extraMoveTypes = [...set];
        if (!legalMoves(p, pieces, board, ctx).some((m) => m.hits.some((v) => v.color === 'light'))) { p.lent = true; break; }
        delete p.extraMoveTypes;
      }
    }
  }

  if (elite) protectElites(pieces, eliteVariants(floor ?? 0, totalFloors || 1));
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
  const boss = makePiece('boss-' + def.id, 'dark', 0, col, {
    boss: def.id, h, w, hp: def.hp, maxHp: def.hp, moves: [...def.moves], royal: true, name: def.name, absorb: !!def.absorb,
  });
  pieces.push(boss);
  return boss;
}
