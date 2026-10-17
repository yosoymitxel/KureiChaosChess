// Jardín Zen: macetas que crecen con el reloj y flores que suman a la colección.
const KEY = 'zugzwang.zen.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const ZEN_POTS = 8;
export const ZEN_KINDS = ['romero', 'salvia', 'lavanda'];
const BUD_MS = 60_000;
const BLOOM_MS = 150_000;

export const blankZen = () => ({ pots: Array(ZEN_POTS).fill(null), flores: {}, planted: 0 });

export function loadZen() {
  const z = read(KEY) || {};
  const pots = (Array.isArray(z.pots) ? z.pots : []).slice(0, ZEN_POTS);
  while (pots.length < ZEN_POTS) pots.push(null);
  return { pots, flores: z.flores || {}, planted: z.planted || 0 };
}
export const saveZen = (z) => write(KEY, z);

// Etapa de una maceta a esta hora; msLeft es lo que falta para la flor.
export function zenStage(z, i, now = Date.now()) {
  const pot = z.pots[i];
  if (!pot) return { stage: 'empty' };
  const grown = now - pot.t;
  if (grown >= BLOOM_MS) return { stage: 'bloom', kind: pot.kind };
  return { stage: grown >= BUD_MS ? 'bud' : 'sprout', kind: pot.kind, msLeft: BLOOM_MS - grown };
}

export function zenPlant(z, i, kind, now = Date.now()) {
  if (z.pots[i]) return z;
  const pots = z.pots.slice();
  pots[i] = { kind, t: now };
  return { ...z, pots, planted: z.planted + 1 };
}

export function zenHarvest(z, i, now = Date.now()) {
  const { stage, kind } = zenStage(z, i, now);
  if (stage !== 'bloom') return z;
  const pots = z.pots.slice();
  pots[i] = null;
  return { ...z, pots, flores: { ...z.flores, [kind]: (z.flores[kind] || 0) + 1 } };
}
