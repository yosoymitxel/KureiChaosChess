// Logros: hitos armados con lo que el juego ya hace. Se otorgan en caliente y se guardan.
import { HAND_LIMIT } from './cards.js';
import { PIECE_TYPES } from '../data/pieces.js';

const KEY = 'zugzwang.achievements.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Los grupos se muestran en este orden en la pantalla de Logros.
export const ACHIEVEMENT_GROUPS = ['Partida', 'Travesía', 'Minijuegos', 'Jardín Zen', 'Tienda', 'Largo plazo'];

export const ACHIEVEMENTS = [
  { id: 'first_win', group: 'Partida', name: 'Primera victoria', desc: 'Gana tu primera partida.', icon: 'check' },
  { id: 'crowned', group: 'Partida', name: 'Coronación', desc: 'Corona un peón durante una partida.', icon: 'crown' },
  { id: 'queen_win', group: 'Partida', name: 'Sin dama', desc: 'Gana una partida después de perder tu reina.', icon: 'shield' },
  { id: 'flawless', group: 'Partida', name: 'Sin una baja', desc: 'Gana una partida sin perder ninguna pieza.', icon: 'target' },
  { id: 'no_cards', group: 'Partida', name: 'A mano limpia', desc: 'Gana una partida con cartas en la mano sin jugar ninguna.', icon: 'hand' },
  { id: 'fog_win', group: 'Partida', name: 'Ver a través', desc: 'Gana un piso de Niebla densa.', icon: 'fog' },
  { id: 'elite_slain', group: 'Partida', name: 'Mesa de élite', desc: 'Supera un piso de Élite.', icon: 'swords' },
  { id: 'mini_won', group: 'Minijuegos', name: 'Minijuego superado', desc: 'Gana un minijuego dentro de una run.', icon: 'connect4' },
  { id: 'mini_boss_slain', group: 'Travesía', name: 'Guardián caído', desc: 'Derriba a un mini-jefe.', icon: 'boss' },
  { id: 'boss_slain', group: 'Travesía', name: 'Coloso caído', desc: 'Derriba al jefe final y completa una run.', icon: 'trophy' },
  { id: 'deep_run', group: 'Travesía', name: 'Piso diez', desc: 'Completa diez pisos en una run.', icon: 'map' },
  { id: 'full_hand', group: 'Travesía', name: 'Mano llena', desc: `Junta ${HAND_LIMIT} cartas a la vez.`, icon: 'scroll' },
  { id: 'floor_5', group: 'Travesía', name: 'Medio camino', desc: 'Llega al piso cinco en una run.', icon: 'map' },
  { id: 'mut_5', group: 'Travesía', name: 'Ejército mutante', desc: 'Junta cinco mutaciones en una misma run.', icon: 'flask' },
  { id: 'minis_3', group: 'Minijuegos', name: 'Feria completa', desc: 'Gana tres minijuegos en una misma run.', icon: 'connect4' },
  { id: 'all_pieces', group: 'Partida', name: 'Enciclopedia', desc: 'Encuentra en la torre todas las piezas de la galería.', icon: 'book' },
  { id: 'elite_flawless', group: 'Partida', name: 'Élite intacta', desc: 'Supera un piso de Élite sin perder ninguna pieza.', icon: 'swords' },
  { id: 'runs_3', group: 'Largo plazo', name: 'Veterano', desc: 'Completa tres runs.', icon: 'trophy' },
  { id: 'organize', group: 'Travesía', name: 'Estratega', desc: 'Juega la carta Organizar y acomoda tu formación.', icon: 'swap' },
  { id: 'mut_epic', group: 'Travesía', name: 'Mutación épica', desc: 'Consigue una mutación épica en una run.', icon: 'flask' },
  { id: 'mini_hard', group: 'Minijuegos', name: 'Sin piedad', desc: 'Gana un minijuego en un piso de nivel difícil.', icon: 'skull' },
  { id: 'buy_card', group: 'Tienda', name: 'Primera compra', desc: 'Compra una carta en la tienda del jardín.', icon: 'scroll' },
  { id: 'runs_10', group: 'Largo plazo', name: 'Leyenda', desc: 'Completa diez runs.', icon: 'crown' },
  { id: 'ach_half', group: 'Largo plazo', name: 'Coleccionista de hitos', desc: 'Consigue la mitad de los logros.', icon: 'check' },
  { id: 'all_bosses', group: 'Largo plazo', name: 'Bestiario', desc: 'Derriba a todos los jefes al menos una vez.', icon: 'boss' },
  { id: 'all_minis', group: 'Minijuegos', name: 'Todos los juegos', desc: 'Desbloquea todos los minijuegos.', icon: 'connect4' },
  { id: 'all_tables', group: 'Tienda', name: 'Coleccionista', desc: 'Consigue todas las mesas de la tienda.', icon: 'coin' },
  { id: 'rich_500', group: 'Tienda', name: 'Tesoro', desc: 'Ten 500 monedas a la vez.', icon: 'coin' },
  { id: 'flower_1', group: 'Jardín Zen', name: 'Primera flor', desc: 'Cosecha tu primera flor en el Jardín Zen.', icon: 'rest' },
  { id: 'flower_3', group: 'Jardín Zen', name: 'Jardín en flor', desc: 'Cosecha tres flores en el Jardín Zen.', icon: 'rest' },
  { id: 'zen_ring', group: 'Jardín Zen', name: 'Cantero nuevo', desc: 'Amplía el jardín con un anillo nuevo.', icon: 'expand' },
  { id: 'zen_all', group: 'Jardín Zen', name: 'Todo florece', desc: 'Cosecha una flor de cada especie.', icon: 'seed' },
  { id: 'rich', group: 'Tienda', name: 'Bolsillo lleno', desc: 'Ten 100 monedas a la vez.', icon: 'coin' },
];

// Contadores que cruzan runs (runs completas): los logros de largo plazo los leen.
const STATS_KEY = 'zugzwang.stats.v1';
export const loadStats = () => read(STATS_KEY) || {};
export function bump(stat) { const s = loadStats(); s[stat] = (s[stat] || 0) + 1; write(STATS_KEY, s); return s[stat]; }

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
  if (a.length + 1 >= ACHIEVEMENTS.length / 2) award('ach_half');
  return true;
}

// Piezas vistas en la torre: la galería las abre y, cuando están todas, cae la Enciclopedia.
const SEEN_KEY = 'zugzwang.seen.v1';
export const loadSeen = () => read(SEEN_KEY) || [];
export function seePieces(types) {
  const seen = loadSeen();
  const fresh = [...new Set(types)].filter((t) => PIECE_TYPES.includes(t) && !seen.includes(t));
  if (!fresh.length) return;
  write(SEEN_KEY, [...seen, ...fresh]);
  if (seen.length + fresh.length >= PIECE_TYPES.length) award('all_pieces');
}
