// Jardín Zen: cantero que crece con el reloj, semillas que caen o se compran y herramientas
// para trabajarlo: regar, cavar, cortar y ampliar hasta 8×8. El 4×4 de siempre queda en el centro:
// los anillos nuevos se suman alternando abajo a la derecha y arriba a la izquierda, como tierra
// virgen por cavar (a veces con piedras). Las claves de casilla son absolutas: el 4×4 base va de
// r0c0 a r3c3 y los anillos de arriba o de la izquierda tienen coordenadas negativas.
import { SEEDS, GARDEN_ITEMS, DIG_COOLDOWN, ROCK_CHANCE, ROCK_HP, LANTERN_BOOST, LAKE_MAX } from '../data/garden.js';

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

// pots: tiestos plantados o ya cavados (null); ausente en un anillo = tierra virgen.
// rocks: piedras sobre tierra virgen (golpes que faltan). lanterns: faroles puestos.
// items: lo comprado (pala, regadera: true; faroles y macetas: cuántos quedan por poner).
export const blankZen = () => ({
  size: ZEN_BASE, off: 0, lake: 2, pots: {}, rocks: {}, lanterns: [], items: {}, seeds: seedsOf(), flores: {}, planted: 0, v: 2,
});

const seedsOf = (s) => ({ ...Object.fromEntries(ZEN_KINDS.map((k) => [k, 0])), ...(s || {}) });

export function loadZen() {
  const z = read(KEY) || {};
  const flores = z.flores || {}, planted = z.planted || 0;
  if (Array.isArray(z.pots)) { // formato viejo: ocho macetas de un cantero fijo, sin semillas
    const pots = {};
    BASE_KEYS.forEach((k, i) => { if (z.pots[i]) pots[movedPot(k)] = z.pots[i]; });
    return { ...blankZen(), pots, flores, planted };
  }
  const pots = { ...(z.pots || {}) };
  // v1 tenía el estanque a la derecha: las dos macetas que ahora son agua se corren a la orilla este.
  if (!z.v) for (const k of ['r1c1', 'r2c1']) if (k in pots) { pots[movedPot(k)] = pots[k]; delete pots[k]; }
  const size = Math.min(ZEN_MAX, Math.max(ZEN_BASE, z.size || ZEN_BASE));
  return { ...blankZen(), size, off: z.off || 0, lake: z.lake || 2, pots, rocks: z.rocks || {}, lanterns: z.lanterns || [], items: z.items || {},
    seeds: seedsOf(z.seeds), flores, planted, leaves: z.leaves || [], leafT: z.leafT, digT: z.digT };
}
const movedPot = (k) => ({ r1c1: 'r1c3', r2c1: 'r2c3' })[k] || k;
export const saveZen = (z) => write(KEY, z);

// Estanque: 2×2 en el centro del cantero base; crece abajo a la derecha (3×3) y luego arriba a la
// izquierda (4×4, todo el cantero base).
export const lakeBox = (n) => (n >= 4 ? [0, 4] : [1, n + 1]); // [desde, hasta) en filas y columnas
export const inLake = (z, r, c) => { const [a, b] = lakeBox(z.lake || 2); return r >= a && r < b && c >= a && c < b; };
// Qué hay en una casilla base (fuera del agua): 'pot', 'lawn', 'step' o 'pond'.
export const baseCell = (z, r, c) => (r >= 0 && r < ZEN_BASE && c >= 0 && c < ZEN_BASE ? (inLake(z, r, c) ? 'pond' : BASE_GRID[r][c] === 'pond' ? 'lawn' : BASE_GRID[r][c]) : null);

// Qué ocupa una casilla: 'pond', 'lawn', 'step', 'lantern', 'pot', 'rock' o 'raw' (tierra virgen).
export function cellType(z, key) {
  const [r, c] = parseKey(key), base = baseCell(z, r, c);
  if (base && base !== 'pot') return base;
  if ((z.lanterns || []).includes(key)) return 'lantern';
  if (base || z.pots[key] !== undefined) return 'pot';
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

// Cavar convierte la tierra virgen de los anillos en un tiesto vacío (null).
export function zenDig(z, key, now = Date.now()) {
  if (z.pots[key] !== undefined || z.rocks?.[key] || digWait(z, now)) return z;
  return { ...z, pots: { ...z.pots, [key]: null }, digT: now };
}
// Un golpe de pala a una piedra (la de acero la parte de una vez). Devuelve el jardín y si se partió.
export function zenBreak(z, key) {
  const hp = z.rocks?.[key];
  if (!hp) return { z, broke: false };
  const left = z.items?.shovel ? 0 : hp - 1, rocks = { ...z.rocks };
  if (left > 0) rocks[key] = left; else delete rocks[key];
  return { z: { ...z, rocks }, broke: left <= 0 };
}

// Cortar: la flor va a la cuenta. La salvia rebrota; la lavanda a veces suelta su semilla.
export function zenHarvest(z, key, now = Date.now(), rng = Math.random) {
  const { stage, kind } = zenStage(z, key, now);
  if (stage !== 'bloom') return z;
  const pot = z.pots[key], sp = SEEDS[kind], again = (pot.regrown || 0) < (sp.regrow || 0);
  const back = sp.seedBack && rng() < sp.seedBack;
  return {
    ...z,
    pots: { ...z.pots, [key]: again ? { kind, t: now, regrown: (pot.regrown || 0) + 1 } : null },
    flores: { ...z.flores, [kind]: (z.flores[kind] || 0) + 1 },
    seeds: back ? { ...z.seeds, [kind]: (z.seeds[kind] || 0) + 1 } : z.seeds,
    gift: back ? kind : null,
  };
}

// Ampliar suma un anillo: abajo a la derecha o arriba a la izquierda, al lado que tenga menos, para
// que el cantero base quede centrado. La tierra nueva sale virgen y a veces con piedras.
export function zenExpand(z, rng = Math.random) {
  if (z.size >= ZEN_MAX) return z;
  const off = z.off || 0, tl = z.size - ZEN_BASE - off > off;
  const nOff = off + (tl ? 1 : 0), size = z.size + 1, rocks = { ...(z.rocks || {}) };
  const edge = tl ? -nOff : size - 1 - nOff;
  for (let i = -nOff; i < size - nOff; i++) for (const k of [cellKey(edge, i), cellKey(i, edge)])
    if (!(k in z.pots) && !(k in rocks) && rng() < ROCK_CHANCE) rocks[k] = ROCK_HP[0] + Math.floor(rng() * (ROCK_HP[1] - ROCK_HP[0] + 1));
  return { ...z, size, off: nOff, rocks };
}

// El estanque crece un paso; lo que había debajo vuelve: la semilla de la planta, el farol a la bolsa.
export function zenLake(z) {
  const n = z.lake || 2;
  if (n >= LAKE_MAX) return z;
  const next = { ...z, lake: n + 1 }, pots = { ...z.pots }, seeds = { ...z.seeds }, items = { ...z.items };
  for (const k of Object.keys(pots)) {
    const [r, c] = parseKey(k);
    if (!inLake(next, r, c)) continue;
    if (pots[k]?.kind) seeds[pots[k].kind] = (seeds[pots[k].kind] || 0) + 1;
    delete pots[k];
  }
  const lanterns = (z.lanterns || []).filter((k) => { const [r, c] = parseKey(k); const wet = inLake(next, r, c); if (wet) items.lantern = (items.lantern || 0) + 1; return !wet; });
  return { ...next, pots, seeds, items, lanterns };
}

// Poner lo comprado: el farol en un tiesto vacío; la maceta en tierra virgen o sobre una piedra.
export function zenPlace(z, item, key) {
  if (!(z.items?.[item] > 0)) return z;
  const items = { ...z.items, [item]: z.items[item] - 1 };
  const type = cellType(z, key);
  if (item === 'lantern' && type === 'pot' && !z.pots[key]) {
    const pots = { ...z.pots }; delete pots[key];
    return { ...z, items, pots, lanterns: [...(z.lanterns || []), key] };
  }
  if (item === 'pot' && (type === 'raw' || type === 'rock')) {
    const rocks = { ...(z.rocks || {}) }; delete rocks[key];
    return { ...z, items, rocks, pots: { ...z.pots, [key]: null } };
  }
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
