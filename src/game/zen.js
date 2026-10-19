// Jardín Zen: cantero que crece con el reloj, semillas que caen o se compran y herramientas
// para trabajarlo: regar, cavar, cortar y ampliar hasta 8×8. El 4×4 de siempre queda arriba a la
// izquierda; los anillos nuevos se suman al sur y al este como tierra virgen por cavar.
const KEY = 'zugzwang.zen.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const ZEN_KINDS = ['romero', 'salvia', 'lavanda'];
export const ZEN_NAMES = { romero: 'Romero', salvia: 'Salvia', lavanda: 'Lavanda' };
export const ZEN_BASE = 4; // el cantero de siempre
export const ZEN_MAX = 8;  // casillas por lado al final
// Diez minutos por flor: con 8 tiestos el jardín rinde ~300 monedas por hora, menos que jugar
// (una run de unos 40 minutos paga ~240 más ~6 semillas); antes, a 2,5 minutos, cultivar pagaba el doble.
const BUD_MS = 240_000;
const BLOOM_MS = 600_000;

// El cantero base, en orden de lectura; las cuatro celdas del estanque se dibujan como una pieza 2×2.
export const BASE_GRID = [
  ['pot', 'pot', 'pot', 'lawn'],
  ['pot', 'pot', 'pond', 'pond'],
  ['lawn', 'pot', 'pond', 'pond'],
  ['pot', 'step', 'step', 'pot'],
];
// Las ocho macetas viejas, en el orden con que se guardaban: así migra la partida anterior.
export const BASE_KEYS = ['r0c0', 'r0c1', 'r0c2', 'r1c0', 'r1c1', 'r2c1', 'r3c0', 'r3c3'];

export const cellKey = (r, c) => `r${r}c${c}`;
// Cada anillo extra cuesta el doble que el anterior.
export const expandCost = (size) => 30 * 2 ** (size - ZEN_BASE);

// pots: tiestos plantados o ya cavados (null); ausente en un anillo = tierra virgen.
export const blankZen = () => ({
  size: ZEN_BASE, pots: {}, seeds: { romero: 0, salvia: 0, lavanda: 0 }, flores: {}, planted: 0,
});

const seedsOf = (s) => ({ romero: 0, salvia: 0, lavanda: 0, ...(s || {}) });

export function loadZen() {
  const z = read(KEY) || {};
  const flores = z.flores || {}, planted = z.planted || 0;
  if (Array.isArray(z.pots)) { // formato viejo: ocho macetas de un cantero fijo, sin semillas
    const pots = {};
    BASE_KEYS.forEach((k, i) => { if (z.pots[i]) pots[k] = z.pots[i]; });
    return { size: ZEN_BASE, pots, seeds: seedsOf(), flores, planted };
  }
  const size = Math.min(ZEN_MAX, Math.max(ZEN_BASE, z.size || ZEN_BASE));
  return { size, pots: z.pots || {}, seeds: seedsOf(z.seeds), flores, planted, leaves: z.leaves || [], leafT: z.leafT };
}
export const saveZen = (z) => write(KEY, z);

// Etapa de un tiesto a esta hora; msLeft es lo que falta para la flor. Sin planta: 'empty'.
export function zenStage(z, key, now = Date.now()) {
  const pot = z.pots[key];
  if (!pot) return { stage: 'empty' };
  const grown = now - pot.t;
  if (grown >= BLOOM_MS) return { stage: 'bloom', kind: pot.kind, watered: !!pot.w };
  return { stage: grown >= BUD_MS ? 'bud' : 'sprout', kind: pot.kind, msLeft: BLOOM_MS - grown, watered: !!pot.w };
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
  const grown = now - pot.t;
  if (grown >= BLOOM_MS) return z;
  return { ...z, pots: { ...z.pots, [key]: { ...pot, w: true, t: pot.t - (BLOOM_MS - grown) / 2 } } };
}

// Cavar convierte la tierra virgen de los anillos en un tiesto vacío (null).
export function zenDig(z, key) {
  if (z.pots[key] !== undefined) return z;
  return { ...z, pots: { ...z.pots, [key]: null } };
}

export function zenHarvest(z, key, now = Date.now()) {
  const { stage, kind } = zenStage(z, key, now);
  if (stage !== 'bloom') return z;
  return { ...z, pots: { ...z.pots, [key]: null }, flores: { ...z.flores, [kind]: (z.flores[kind] || 0) + 1 } };
}

// Ampliar suma un anillo a la derecha y abajo; lo ya construido no se mueve.
export function zenExpand(z) {
  if (z.size >= ZEN_MAX) return z;
  return { ...z, size: z.size + 1 };
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
  return rng() < 0.25 ? { seed: ZEN_KINDS[Math.floor(rng() * ZEN_KINDS.length)] } : { coins: 2 };
}

// Semillas que caen al ganar un nodo de la travesía o se compran en la tienda.
export function addZenSeeds(kind, n = 1) {
  const z = loadZen();
  z.seeds[kind] = (z.seeds[kind] || 0) + n;
  saveZen(z);
  return z.seeds;
}
export const pickSeed = () => ZEN_KINDS[Math.floor(Math.random() * ZEN_KINDS.length)];
