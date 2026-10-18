// Logros: hitos armados con lo que el juego ya hace. Se otorgan en caliente y se guardan.
import { HAND_LIMIT } from './cards.js';

const KEY = 'zugzwang.achievements.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Los grupos se muestran en este orden en la pantalla de Logros.
export const ACHIEVEMENT_GROUPS = ['Partida', 'Travesía', 'Jardín Zen', 'Tienda'];

export const ACHIEVEMENTS = [
  { id: 'first_win', group: 'Partida', name: 'Primera victoria', desc: 'Gana tu primera partida.', icon: 'check' },
  { id: 'crowned', group: 'Partida', name: 'Coronación', desc: 'Corona un peón durante una partida.', icon: 'crown' },
  { id: 'queen_win', group: 'Partida', name: 'Sin dama', desc: 'Gana una partida después de perder tu reina.', icon: 'shield' },
  { id: 'flawless', group: 'Partida', name: 'Sin una baja', desc: 'Gana una partida sin perder ninguna pieza.', icon: 'target' },
  { id: 'no_cards', group: 'Partida', name: 'A mano limpia', desc: 'Gana una partida con cartas en la mano sin jugar ninguna.', icon: 'hand' },
  { id: 'fog_win', group: 'Partida', name: 'Ver a través', desc: 'Gana un piso de Niebla densa.', icon: 'fog' },
  { id: 'elite_slain', group: 'Partida', name: 'Mesa de élite', desc: 'Supera un piso de Élite.', icon: 'swords' },
  { id: 'mini_won', group: 'Travesía', name: 'Minijuego superado', desc: 'Gana un minijuego dentro de una run.', icon: 'connect4' },
  { id: 'mini_boss_slain', group: 'Travesía', name: 'Guardián caído', desc: 'Derriba a un mini-jefe.', icon: 'boss' },
  { id: 'boss_slain', group: 'Travesía', name: 'Coloso caído', desc: 'Derriba al jefe final y completa una run.', icon: 'trophy' },
  { id: 'deep_run', group: 'Travesía', name: 'Piso diez', desc: 'Completa diez pisos en una run.', icon: 'map' },
  { id: 'full_hand', group: 'Travesía', name: 'Mano llena', desc: `Junta ${HAND_LIMIT} cartas a la vez.`, icon: 'scroll' },
  { id: 'flower_1', group: 'Jardín Zen', name: 'Primera flor', desc: 'Cosecha tu primera flor en el Jardín Zen.', icon: 'rest' },
  { id: 'flower_3', group: 'Jardín Zen', name: 'Jardín en flor', desc: 'Cosecha tres flores en el Jardín Zen.', icon: 'rest' },
  { id: 'zen_ring', group: 'Jardín Zen', name: 'Cantero nuevo', desc: 'Amplía el jardín con un anillo nuevo.', icon: 'expand' },
  { id: 'zen_all', group: 'Jardín Zen', name: 'Todo florece', desc: 'Cosecha una flor de cada especie.', icon: 'seed' },
  { id: 'rich', group: 'Tienda', name: 'Bolsillo lleno', desc: 'Ten 100 monedas a la vez.', icon: 'coin' },
];

export const loadAchievements = () => read(KEY) || [];
export const saveAchievements = (a) => write(KEY, a);

// Otorga un logro si todavía no está; devuelve true si era nuevo. El aviso flotante escucha
// el evento, así cualquier módulo puede otorgar sin conocer la interfaz.
export function award(id) {
  const logro = ACHIEVEMENTS.find((x) => x.id === id);
  if (!logro) return false;
  const a = loadAchievements();
  if (a.includes(id)) return false;
  saveAchievements([...a, id]);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('zugzwang:achievement', { detail: logro }));
  return true;
}
