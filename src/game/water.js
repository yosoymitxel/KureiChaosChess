// Jardín de Agua: plantas acuáticas en las plazas de la orilla (crecen solas, sin riego), koi y
// barquitos en el centro. Guardado aparte del Jardín Zen; las monedas son las de la tienda.
import { WATER_PLANTS, WATER_SLOTS, KOI_HUNGER_MS, KOI_COINS } from '../data/garden.js';

const KEY = 'zugzwang.agua.v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };

export const blankWater = () => ({ slots: WATER_SLOTS.map(() => null), seeds: { lenteja: 2, nenufar: 1 }, flores: {}, boats: [], koiT: 0 });
export function loadWater() {
  const w = read();
  if (!w || typeof w !== 'object') return blankWater();
  const b = blankWater();
  return { ...b, ...w, slots: b.slots.map((_, i) => w.slots?.[i] || null), seeds: { ...(w.seeds || {}) }, boats: Array.isArray(w.boats) ? w.boats : [] };
}
export const saveWater = (w) => { try { localStorage.setItem(KEY, JSON.stringify(w)); } catch {} };

const bloomMs = (kind) => (WATER_PLANTS[kind]?.bloomMin || 10) * 60_000;
// Etapa de una plaza: 'empty', 'sprout' (hasta dos quintos), 'bud' o 'bloom'; `left`: ms para la flor.
export function waterStage(w, i, now = Date.now()) {
  const p = w.slots[i];
  if (!p) return { stage: 'empty' };
  const g = now - p.t, full = bloomMs(p.kind);
  if (g >= full) return { stage: 'bloom', kind: p.kind, grow: 1 };
  return { stage: g >= full * 0.4 ? 'bud' : 'sprout', kind: p.kind, grow: g / full, left: full - g };
}
export function waterSow(w, i, kind, now = Date.now()) {
  if (w.slots[i] || !(w.seeds[kind] > 0)) return w;
  const slots = [...w.slots]; slots[i] = { kind, t: now };
  return { ...w, slots, seeds: { ...w.seeds, [kind]: w.seeds[kind] - 1 } };
}
// Cortar la flor: paga según la especie; el nenúfar rebrota desde brote las veces que diga `regrow`.
export function waterHarvest(w, i, now = Date.now()) {
  const { stage, kind } = waterStage(w, i, now);
  if (stage !== 'bloom') return { w, coins: 0 };
  const sp = WATER_PLANTS[kind], p = w.slots[i], again = (p.regrown || 0) < (sp.regrow || 0);
  const slots = [...w.slots]; slots[i] = again ? { kind, t: now, regrown: (p.regrown || 0) + 1 } : null;
  return { w: { ...w, slots, flores: { ...w.flores, [kind]: (w.flores[kind] || 0) + 1 } }, coins: sp.pays };
}
export const addWaterSeed = (w, kind) => ({ ...w, seeds: { ...w.seeds, [kind]: (w.seeds[kind] || 0) + 1 } });
export const addBoat = (w, kind) => ({ ...w, boats: [...w.boats, kind] });
export const waterKoiHungry = (w, now = Date.now()) => now - (w.koiT || 0) >= KOI_HUNGER_MS;
export const waterFeed = (w, now = Date.now()) => (waterKoiHungry(w, now) ? { w: { ...w, koiT: now }, coins: KOI_COINS } : { w, coins: 0 });
