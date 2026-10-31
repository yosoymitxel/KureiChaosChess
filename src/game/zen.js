// Jardín Zen: cantero que crece con el reloj, semillas que caen o se compran y herramientas
// para trabajarlo: regar, cavar, cortar y ampliar hasta 8×8. El 4×4 de siempre queda en el centro:
// los anillos nuevos se suman alternando abajo a la derecha y arriba a la izquierda, como tierra
// virgen por cavar (a veces con piedras). Las claves de casilla son absolutas: el 4×4 base va de
// r0c0 a r3c3 y los anillos de arriba o de la izquierda tienen coordenadas negativas.
import { SEEDS, GARDEN_ITEMS, SEED_BACK, DIG_COOLDOWN, MOVE_COOLDOWN, OBSTACLE_CHANCE, ROCK_HP, LANTERN_BOOST, LAKE_MAX } from '../data/garden.js';

const KEY = 'zugzwang.zen.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const ZEN_KINDS = Object.keys(SEEDS);
export const ZEN_NAMES = Object.fromEntries(ZEN_KINDS.map((k) => [k, SEEDS[k].name]));
export const ZEN_BASE = 4; // el cantero de siempre
export const ZEN_MAX = 8;  // casillas por lado al final
// Unos diez minutos por flor: con 8 tiestos el jardín rinde ~300 monedas por hora, menos que jugar
// (una run de unos 40 minutos paga ~240 más ~6 semillas). Cada especie lleva su tiempo (garden.js);
// el capullo sale a los dos quintos.
const bloomMs = (kind) => (SEEDS[kind]?.bloomMin || 10) * 60_000;

// El cantero base, en orden de lectura; el estanque 2×2 va en el centro y se dibuja como una pieza.
export const BASE_GRID = [
  ['pot', 'pot', 'pot', 'lawn'],
  ['pot', 'pond', 'pond', 'pot'],
  ['lawn', 'pond', 'pond', 'pot'],
  ['pot', 'step', 'step', 'pot'],
];
// Las ocho macetas viejas, en el orden con que se guardaban: así migra la partida anterior.
export const BASE_KEYS = ['r0c0', 'r0c1', 'r0c2', 'r1c0', 'r1c1', 'r2c1', 'r3c0', 'r3c3'];

export const cellKey = (r, c) => `r${r}c${c}`;
export const parseKey = (k) => k.slice(1).split('c').map(Number);
// Cada anillo extra cuesta el doble que el anterior.
export const expandCost = (size) => 30 * 2 ** (size - ZEN_BASE);

// pots: tiestos plantados o ya cavados (null); ausente = tierra virgen.
// rocks: piedras sobre tierra virgen (golpes que faltan). lanterns: faroles puestos.
// tiles: estorbos que se quitan: 'bush' (arbusto, con las tijeras) o 'stone' (losa, con el mazo).
// items: lo comprado o guardado (pala, regadera: true; faroles y macetas: cuántos quedan por poner).
export const blankZen = () => withBase({
  size: ZEN_BASE, off: 0, lake: 2, pots: {}, rocks: {}, tiles: {}, lanterns: [], items: {}, seeds: seedsOf(), flores: {}, planted: 0, v: 3,
});
// Desde v3 el cantero base no es fijo: sus macetas, arbustos, losas y el farol pasan a ser cosas
// del jardín que se quitan, se guardan y se mueven. Aquí se vuelcan una sola vez.
function withBase(z) {
  const pots = { ...z.pots }, tiles = { ...(z.tiles || {}) }, lanterns = [...(z.lanterns || [])];
  for (let r = 0; r < ZEN_BASE; r++) for (let c = 0; c < ZEN_BASE; c++) {
    const k = cellKey(r, c), cell = BASE_GRID[r][c];
    if (inLake(z, r, c) || k in pots || k in tiles || lanterns.includes(k)) continue;
    if (cell === 'pot') pots[k] = null;
    else if (cell === 'lawn') tiles[k] = 'bush';
    else if (cell === 'step') { if (k === 'r3c1') lanterns.push(k); else tiles[k] = 'stone'; }
  }
  return { ...z, pots, tiles, lanterns, v: 3 };
}

const seedsOf = (s) => ({ ...Object.fromEntries(ZEN_KINDS.map((k) => [k, 0])), ...(s || {}) });

export function loadZen() {
  const z = read(KEY) || {};
  const flores = z.flores || {}, planted = z.planted || 0;
  if (Array.isArray(z.pots)) { // formato viejo: ocho macetas de un cantero fijo, sin semillas
    const pots = {};
    BASE_KEYS.forEach((k, i) => { if (z.pots[i]) pots[movedPot(k)] = z.pots[i]; });
    return withBase({ ...blankZen(), pots: { ...blankZen().pots, ...pots }, flores, planted });
  }
  const pots = { ...(z.pots || {}) };
  // v1 tenía el estanque a la derecha: las dos macetas que ahora son agua se corren a la orilla este.
  if (!z.v) for (const k of ['r1c1', 'r2c1']) if (k in pots) { pots[movedPot(k)] = pots[k]; delete pots[k]; }
  const size = Math.min(ZEN_MAX, Math.max(ZEN_BASE, z.size || ZEN_BASE));
  const out = { ...blankZen(), size, off: z.off || 0, lake: z.lake || 2, pots, rocks: z.rocks || {}, tiles: z.tiles || {}, dug: z.dug || {}, lanterns: z.lanterns || [], lakeAt: z.lakeAt, moveT: z.moveT, items: z.items || {},
    seeds: seedsOf(z.seeds), flores, planted, leaves: z.leaves || [], leafT: z.leafT, digT: z.digT };
  return (z.v || 0) < 3 ? withBase(out) : out;
}
const movedPot = (k) => ({ r1c1: 'r1c3', r2c1: 'r2c3' })[k] || k;
export const saveZen = (z) => write(KEY, z);

// Estanque: 2×2 en el centro del cantero base; crece abajo a la derecha (3×3) y luego arriba a la
// izquierda (4×4, todo el cantero base).
export const lakeBox = (n) => (n >= 4 ? [0, 4] : [1, n + 1]); // [desde, hasta) en filas y columnas
// Esquina de arriba a la izquierda y lado del estanque: donde lo dejó el guante (`lakeAt`) o el de serie.
export const lakeRect = (z) => { const n = z.lake || 2, [a] = lakeBox(n), [r, c] = z.lakeAt || [a, a]; return { r, c, n }; };
const inRect = ({ r: r0, c: c0, n }, r, c) => r >= r0 && r < r0 + n && c >= c0 && c < c0 + n;
export const inLake = (z, r, c) => inRect(lakeRect(z), r, c);
// Casillas dentro del cantero (con sus anillos) y libres para el agua: tierra virgen o cavada.
const inYard = (z, r, c) => { const off = z.off || 0; return r >= -off && c >= -off && r < z.size - off && c < z.size - off; };
const fitsWater = (z, rect) => {
  for (let r = rect.r; r < rect.r + rect.n; r++) for (let c = rect.c; c < rect.c + rect.n; c++) {
    if (!inYard(z, r, c)) return false;
    const t = cellType(z, cellKey(r, c));
    if (t !== 'pond' && t !== 'raw' && t !== 'dug') return false;
  }
  return true;
};

// Qué ocupa una casilla: 'pond', 'lantern', 'pot', 'bush', 'stone', 'rock', 'dug' (cavada, lista para
// una maceta) o 'raw' (tierra virgen).
export function cellType(z, key) {
  const [r, c] = parseKey(key);
  if (inLake(z, r, c)) return 'pond';
  if ((z.lanterns || []).includes(key)) return 'lantern';
  if (z.pots[key] !== undefined) return 'pot';
  if (z.tiles?.[key]) return z.tiles[key];
  if (z.dug?.[key]) return 'dug';
  return z.rocks?.[key] ? 'rock' : 'raw';
}

// Al lado de un farol (las ocho vecinas) se crece más deprisa.
const lit = (z, key) => {
  const [r, c] = parseKey(key);
  return (z.lanterns || []).some((l) => { const [lr, lc] = parseKey(l); return Math.max(Math.abs(lr - r), Math.abs(lc - c)) === 1; });
};

// Etapa de un tiesto a esta hora; msLeft es lo que falta para la flor. Sin planta: 'empty'.
export function zenStage(z, key, now = Date.now()) {
  const pot = z.pots[key];
  if (!pot) return { stage: 'empty' };
  const boost = lit(z, key) ? LANTERN_BOOST : 1, full = bloomMs(pot.kind);
  const grown = (now - pot.t) * boost;
  const out = { kind: pot.kind, watered: !!pot.w, lit: boost > 1 };
  if (grown >= full) return { ...out, stage: 'bloom' };
  return { ...out, stage: grown >= full * 0.4 ? 'bud' : 'sprout', msLeft: (full - grown) / boost };
}

// Sembrar gasta una semilla de verdad: sin semillas no hay planta.
export function zenSow(z, key, kind, now = Date.now()) {
  if (z.pots[key] || !(z.seeds[kind] > 0)) return z;
  return {
    ...z,
    pots: { ...z.pots, [key]: { kind, t: now } },
    seeds: { ...z.seeds, [kind]: z.seeds[kind] - 1 },
    planted: z.planted + 1,
  };
}

// Regar acorta a la mitad lo que falta, una sola vez por planta.
export function zenWater(z, key, now = Date.now()) {
  const pot = z.pots[key];
  if (!pot || pot.w) return z;
  const { stage, msLeft } = zenStage(z, key, now);
  if (stage === 'bloom') return z;
  return { ...z, pots: { ...z.pots, [key]: { ...pot, w: true, t: pot.t - msLeft / 2 } } };
}
// La regadera grande moja también las ocho vecinas que lo pidan.
export function zenWaterAround(z, key, now = Date.now()) {
  const [r, c] = parseKey(key);
  let n = z;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) n = zenWater(n, cellKey(r + dr, c + dc), now);
  return n;
}

// La pala de siempre descansa entre cava y cava; la de acero no.
export const digWait = (z, now = Date.now()) => (z.items?.shovel || z.digT == null ? 0 : Math.max(0, z.digT + DIG_COOLDOWN - now));

// Cavar prepara la tierra virgen; la maceta se pone después desde la bolsa.
export function zenDig(z, key, now = Date.now()) {
  if (cellType(z, key) !== 'raw' || digWait(z, now)) return z;
  return { ...z, dug: { ...(z.dug || {}), [key]: true }, digT: now };
}
// Un golpe de mazo a una piedra (el de hierro la parte de una vez). Devuelve el jardín y si se partió.
export function zenBreak(z, key) {
  const hp = z.rocks?.[key];
  if (!hp) return { z, broke: false };
  const left = z.items?.mallet ? 0 : hp - 1, rocks = { ...z.rocks };
  if (left > 0) rocks[key] = left; else delete rocks[key];
  return { z: { ...z, rocks }, broke: left <= 0 };
}

// Cortar: la flor va a la cuenta. La salvia rebrota; cualquiera suelta a veces su semilla.
export function zenHarvest(z, key, now = Date.now(), rng = Math.random) {
  const { stage, kind } = zenStage(z, key, now);
  if (stage !== 'bloom') return z;
  const pot = z.pots[key], sp = SEEDS[kind], again = (pot.regrown || 0) < (sp.regrow || 0);
  const back = rng() < SEED_BACK;
  return {
    ...z,
    pots: { ...z.pots, [key]: again ? { kind, t: now, regrown: (pot.regrown || 0) + 1 } : null },
    flores: { ...z.flores, [kind]: (z.flores[kind] || 0) + 1 },
    seeds: back ? { ...z.seeds, [kind]: (z.seeds[kind] || 0) + 1 } : z.seeds,
    gift: back ? kind : null,
  };
}

// Ampliar suma un anillo: abajo a la derecha o arriba a la izquierda, al lado que tenga menos, para
// que el cantero base quede centrado. La tierra nueva sale virgen y a veces con piedras, arbustos o losas.
export function zenExpand(z, rng = Math.random) {
  if (z.size >= ZEN_MAX) return z;
  const off = z.off || 0, tl = z.size - ZEN_BASE - off > off;
  const nOff = off + (tl ? 1 : 0), size = z.size + 1, rocks = { ...(z.rocks || {}) }, tiles = { ...(z.tiles || {}) };
  const edge = tl ? -nOff : size - 1 - nOff;
  for (let i = -nOff; i < size - nOff; i++) for (const k of [cellKey(edge, i), cellKey(i, edge)]) {
    if (k in z.pots || k in rocks || k in tiles) continue;
    let x = rng();
    const what = Object.keys(OBSTACLE_CHANCE).find((o) => (x -= OBSTACLE_CHANCE[o]) < 0);
    if (what === 'rock') rocks[k] = ROCK_HP[0] + Math.floor(rng() * (ROCK_HP[1] - ROCK_HP[0] + 1));
    else if (what) tiles[k] = what;
  }
  return { ...z, size, off: nOff, rocks, tiles };
}

// Quitar un estorbo: el arbusto con las tijeras, la losa con el mazo. Queda tierra virgen.
export function zenClear(z, key) {
  if (!z.tiles?.[key]) return z;
  const tiles = { ...z.tiles }; delete tiles[key];
  return { ...z, tiles };
}

// Guardar en la bolsa un tiesto vacío o un farol; la casilla queda como tierra virgen.
export function zenStore(z, key) {
  const items = { ...z.items };
  if ((z.lanterns || []).includes(key)) {
    items.lantern = (items.lantern || 0) + 1;
    return { ...z, items, lanterns: z.lanterns.filter((k) => k !== key), dug: { ...(z.dug || {}), [key]: true } };
  }
  if (z.pots[key] === null) {
    const pots = { ...z.pots }; delete pots[key];
    items.pot = (items.pot || 0) + 1;
    return { ...z, items, pots, dug: { ...(z.dug || {}), [key]: true } };
  }
  return z;
}

// El estanque crece un paso (el de serie como siempre; uno movido, hacia abajo a la derecha), solo
// si lo que va a cubrir es tierra libre: nada se pierde bajo el agua.
export function zenLake(z) {
  const n = z.lake || 2;
  if (n >= LAKE_MAX) return z;
  const next = { ...z, lake: n + 1 };
  if (!fitsWater(z, lakeRect(next))) return z;
  return clearDug(next);
}
// La tierra cavada que queda bajo el agua deja de contar como cavada.
const clearDug = (z) => ({ ...z, dug: Object.fromEntries(Object.entries(z.dug || {}).filter(([k]) => !inLake(z, ...parseKey(k)))) });

// Guante: llevar una maceta (con su planta) o un farol a otra casilla. La maceta va a tierra cavada;
// el farol, a tierra libre. Donde estaban queda tierra cavada. El guante de siempre descansa entre
// mudanza y mudanza; el de jardinero no.
export const moveWait = (z, now = Date.now()) => (z.items?.glove || z.moveT == null ? 0 : Math.max(0, z.moveT + MOVE_COOLDOWN - now));
export function zenMove(z, from, to, now = Date.now()) {
  if (from === to || moveWait(z, now)) return z;
  const what = cellType(z, from), dest = cellType(z, to), dug = { ...(z.dug || {}), [from]: true };
  delete dug[to];
  if (what === 'pot' && dest === 'dug') {
    const pots = { ...z.pots, [to]: z.pots[from] }; delete pots[from];
    return { ...z, pots, dug, moveT: now };
  }
  if (what === 'lantern' && (dest === 'raw' || dest === 'dug')) return { ...z, lanterns: z.lanterns.map((k) => (k === from ? to : k)), dug, moveT: now };
  return z;
}
// Con los guantes de jardinero también se mueve el estanque: su esquina de arriba a la izquierda va a
// `to` si el agua cabe entera en tierra libre (o en su propio sitio de antes).
export function zenMovePond(z, to) {
  if (!z.items?.glove) return z;
  const [r, c] = parseKey(to), next = { ...z, lakeAt: [r, c] };
  return fitsWater(z, lakeRect(next)) ? clearDug(next) : z;
}

// Poner lo comprado o guardado: el farol en tierra virgen o cavada; la maceta solo en tierra cavada.
export function zenPlace(z, item, key) {
  if (!(z.items?.[item] > 0)) return z;
  const items = { ...z.items, [item]: z.items[item] - 1 };
  const type = cellType(z, key);
  const dug = { ...(z.dug || {}) }; delete dug[key];
  if (item === 'lantern' && (type === 'raw' || type === 'dug')) return { ...z, items, dug, lanterns: [...(z.lanterns || []), key] };
  if (item === 'pot' && type === 'dug') return { ...z, items, dug, pots: { ...z.pots, [key]: null } };
  return z;
}

// Comprar para el jardín (la tienda cobra antes).
export function addZenItem(id) {
  const z = loadZen(), it = GARDEN_ITEMS[id];
  z.items = { ...z.items, [id]: it.stack ? (z.items[id] || 0) + 1 : true };
  saveZen(z);
  return z.items;
}

// Hojas de arce: caen de la rama mientras no estás (una cada LEAF_MS, hasta LEAF_MAX) y se quedan
// sobre la arena hasta que las barres; cada una paga una moneda. `x`, `y` en casillas, `r` en grados.
export const LEAF_MS = 240_000;
export const LEAF_MAX = 8;
export const LEAF_COINS = 1;
export function zenLeaves(z, now = Date.now(), rng = Math.random) {
  const leaves = z.leaves || [];
  if (z.leafT == null) return { ...z, leaves, leafT: now };
  const due = Math.floor((now - z.leafT) / LEAF_MS);
  if (due <= 0) return z;
  const room = Math.max(0, LEAF_MAX - leaves.length);
  const fresh = Array.from({ length: Math.min(due, room) }, () => ({ x: 0.3 + rng() * (z.size - 0.6), y: 0.3 + rng() * (z.size - 0.6), r: Math.floor(rng() * 360) }));
  return { ...z, leaves: [...leaves, ...fresh], leafT: z.leafT + due * LEAF_MS };
}
export const zenSweep = (z, leaf) => ({ ...z, leaves: (z.leaves || []).filter((l) => l !== leaf) });

// Mariposas: visitan una flor abierta mientras miras el jardín; si la tocas deja un regalo.
export const BUTTERFLY_MS = [70_000, 150_000]; // espera entre visitas
export function butterflyGift(rng = Math.random) {
  return rng() < 0.25 ? { seed: pickSeed(rng) } : { coins: 2 };
}

// Semillas que caen al ganar un nodo de la travesía o se compran en la tienda.
export function addZenSeeds(kind, n = 1) {
  const z = loadZen();
  z.seeds[kind] = (z.seeds[kind] || 0) + n;
  saveZen(z);
  return z.seeds;
}
// La semilla que cae sale según su rareza.
export function pickSeed(rng = Math.random) {
  const total = ZEN_KINDS.reduce((a, k) => a + SEEDS[k].weight, 0);
  let x = rng() * total;
  return ZEN_KINDS.find((k) => (x -= SEEDS[k].weight) < 0) || ZEN_KINDS[0];
}
