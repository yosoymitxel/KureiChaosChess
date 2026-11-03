// Ranuras de guardado: tres partidas independientes en este navegador. La activa vive en las claves de
// siempre; al cambiar, se guarda en su ranura y se carga la otra (vacía = empezar de cero). Los ajustes no cambian.
import { slotSnapshot, slotRestore } from './backup.js';
import { cloudMarkSynced } from './cloud.js';

export const SLOT_COUNT = 3;
const KEY = 'kurei.slots.v1';

export function loadSlots() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.list)) return { active: s.active | 0, list: Array.from({ length: SLOT_COUNT }, (_, i) => s.list[i] || null) };
  } catch {}
  return { active: 0, list: Array(SLOT_COUNT).fill(null) };
}
const save = (s) => localStorage.setItem(KEY, JSON.stringify(s));

// Devuelve false si no se pudo (sin espacio o ranura dañada); en ese caso nada cambia.
export function switchSlot(i) {
  const s = loadSlots();
  if (i === s.active || i < 0 || i >= SLOT_COUNT) return false;
  const before = slotSnapshot();
  try {
    s.list[s.active] = { data: before, at: Date.now() };
    save(s);
  } catch { return false; }
  if (!slotRestore(s.list[i]?.data || {})) return false;
  s.active = i;
  try { save(s); } catch { slotRestore(before); return false; }
  cloudMarkSynced(null); // otro progreso: que la nube no lo suba sola encima del de la ranura anterior
  return true;
}

export function clearSlot(i) {
  const s = loadSlots();
  if (i === s.active) return false;
  s.list[i] = null;
  save(s);
  return true;
}
