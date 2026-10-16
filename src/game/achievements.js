// Logros: hitos armados con lo que el juego ya hace. Se otorgan en caliente y se guardan.
const KEY = 'zugzwang.achievements.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const ACHIEVEMENTS = [
  { id: 'first_win', name: 'Primera victoria', desc: 'Gana tu primera partida.', icon: 'check' },
  { id: 'boss_slain', name: 'Coloso caído', desc: 'Derriba al jefe final y completa una run.', icon: 'trophy' },
  { id: 'mini_won', name: 'Minijuego superado', desc: 'Gana un minijuego dentro de una run.', icon: 'connect4' },
  { id: 'flower_1', name: 'Primera flor', desc: 'Cosecha tu primera flor en el Jardín Zen.', icon: 'rest' },
  { id: 'flower_3', name: 'Jardín en flor', desc: 'Cosecha tres flores en el Jardín Zen.', icon: 'rest' },
];

export const loadAchievements = () => read(KEY) || [];
export const saveAchievements = (a) => write(KEY, a);

// Otorga un logro si todavía no está; devuelve true si era nuevo.
export function award(id) {
  const a = loadAchievements();
  if (a.includes(id)) return false;
  saveAchievements([...a, id]);
  return true;
}
