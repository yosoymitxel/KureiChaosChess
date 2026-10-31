// Logros: hitos armados con lo que el juego ya hace. Se otorgan en caliente y se guardan.
import { HAND_LIMIT } from './cards.js';
import { PIECE_TYPES } from '../data/pieces.js';
import { MUTATIONS } from '../data/mutations.js';
import { localize, t } from '../i18n/index.js';

const KEY = 'zugzwang.achievements.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Los grupos se muestran en este orden en la pantalla de Logros.
export const ACHIEVEMENT_GROUPS = ['Partida', 'Travesía', 'Minijuegos', 'Jardín Zen', 'Tienda', 'Largo plazo', 'Secretos'];

// Los logros por grupo, en el orden de la pantalla y con los conseguidos primero: Logros y la
// Galería los muestran igual.
export const achievementGroups = (got) => ACHIEVEMENT_GROUPS
  .map((name) => {
    const items = ACHIEVEMENTS.filter((a) => a.group === name);
    return { name, items: [...items.filter((a) => got.includes(a.id)), ...items.filter((a) => !got.includes(a.id))], n: items.filter((a) => got.includes(a.id)).length };
  })
  .filter((g) => g.items.length);

export const ACHIEVEMENTS = localize('achievements', [
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
  { id: 'meteor_win', group: 'Partida', name: 'Bajo la lluvia', desc: 'Gana un piso con Lluvia de meteoritos.', icon: 'meteor' },
  { id: 'coven_win', group: 'Partida', name: 'Caza de brujas', desc: 'Gana un piso de Aquelarre.', icon: 'target' },
  { id: 'leaf_hand', group: 'Partida', name: 'Mano verde', desc: 'Quita a mano una hoja que cayó en el tablero.', icon: 'hand' },
  { id: 'witch_clean', group: 'Minijuegos', name: 'Sueño profundo', desc: 'En La bruja, recoge todas las monedas sin despertar a ninguna bruja.', icon: 'flask' },
  { id: 'blizzard_best', group: 'Minijuegos', name: 'Patinaje perfecto', desc: 'Sal de la Ventisca en el mínimo de jugadas.', icon: 'ice' },
  { id: 'versus_done', group: 'Minijuegos', name: 'Cara a cara', desc: 'Termina una partida local a dos.', icon: 'human' },
  { id: 'duo_mini', group: 'Minijuegos', name: 'Revancha', desc: 'Juega un minijuego a dos en partida local.', icon: 'hockey' },
  { id: 'humble_mate', group: 'Partida', name: 'Humildad', desc: 'Captura al rey enemigo con un peón.', icon: 'pawn' },
  { id: 'castle', group: 'Partida', name: 'A resguardo', desc: 'Enroca durante una partida.', icon: 'rook' },
  { id: 'en_passant', group: 'Partida', name: 'Al paso', desc: 'Captura un peón al paso.', icon: 'pawn' },
  { id: 'quick_win', group: 'Partida', name: 'Relámpago', desc: 'Gana una partida en 10 rondas o menos.', icon: 'rush' },
  { id: 'last_stand', group: 'Partida', name: 'Con lo justo', desc: 'Gana una partida con tres piezas o menos en pie.', icon: 'shield' },
  { id: 'long_run', group: 'Travesía', name: 'Torre alta', desc: 'Completa una run de 12 pisos o más.', icon: 'map' },
  { id: 'pure_boss', group: 'Travesía', name: 'Ajedrez puro', desc: 'Derriba al jefe final sin ninguna mutación.', icon: 'king' },
  { id: 'hard_run', group: 'Travesía', name: 'Sin red', desc: 'Completa una run en dificultad Difícil.', icon: 'skull' },
  { id: 'tutorial_done', group: 'Travesía', name: 'Lección aprendida', desc: 'Termina el tutorial.', icon: 'book' },
  { id: 'free_mini', group: 'Minijuegos', name: 'Por gusto', desc: 'Gana un minijuego en partida libre, desde el menú.', icon: 'connect4' },
  { id: 'hard_trio', group: 'Minijuegos', name: 'Triple corona', desc: 'Gana tres minijuegos distintos en nivel Difícil.', icon: 'crown' },
  { id: 'hockey_shutout', group: 'Minijuegos', name: 'Portería a cero', desc: 'Gana al hockey de mesa sin encajar ningún gol.', icon: 'hockey' },
  { id: 'outbreak_one', group: 'Minijuegos', name: 'Paciente cero', desc: 'Completa el Brote con una sola dosis.', icon: 'drop' },
  { id: 'queens_fast', group: 'Minijuegos', name: 'Reinas al vuelo', desc: 'Resuelve las reinas con un minuto o más de sobra.', icon: 'queen' },
  { id: 'flowers_25', group: 'Jardín Zen', name: 'Florista', desc: 'Corta 25 flores en el Jardín Zen.', icon: 'shears' },
  { id: 'zen_max', group: 'Jardín Zen', name: 'Cantero completo', desc: 'Amplía el cantero hasta 8×8.', icon: 'expand' },
  { id: 'pond_max', group: 'Jardín Zen', name: 'Lago de koi', desc: 'Amplía el estanque hasta 4×4.', icon: 'drop' },
  { id: 'wins_50', group: 'Largo plazo', name: 'Medio centenar', desc: 'Gana 50 partidas en la torre.', icon: 'swords' },
  { id: 'minis_25', group: 'Largo plazo', name: 'Feriante', desc: 'Gana 25 minijuegos dentro de las runs.', icon: 'connect4' },
  { id: 'runs_25', group: 'Largo plazo', name: 'Señor de la torre', desc: 'Completa 25 runs.', icon: 'trophy' },
  { id: 'all_mutations', group: 'Largo plazo', name: 'Laboratorio andante', desc: 'Consigue alguna vez cada una de las mutaciones.', icon: 'flask' },
  { id: 'ach_all', group: 'Largo plazo', name: 'Completista', desc: 'Consigue todos los demás logros.', icon: 'trophy' },
  { id: 'titan_poke', group: 'Secretos', name: 'No despiertes al Titán', desc: 'Alguien en el menú no quiere que lo molesten.', icon: 'boss', secret: true },
  { id: 'koi', group: 'Secretos', name: 'Hora de comer', desc: 'Da de comer a los koi del estanque.', icon: 'drop', secret: true },
  { id: 'butterfly', group: 'Secretos', name: 'Alas de papel', desc: 'Atrapa una mariposa posada en una flor del jardín.', icon: 'rest', secret: true },
  { id: 'david', group: 'Secretos', name: 'David', desc: 'Da el golpe final a un jefe con un peón.', icon: 'pawn', secret: true },
  { id: 'king_hunt', group: 'Secretos', name: 'El rey sale a cazar', desc: 'Captura a la reina rival con tu rey.', icon: 'king', secret: true },
  { id: 'early_fall', group: 'Secretos', name: 'Despiste', desc: 'Pierde a tu rey en las cinco primeras rondas.', icon: 'skull', secret: true },
  { id: 'rich', group: 'Tienda', name: 'Bolsillo lleno', desc: 'Ten 100 monedas a la vez.', icon: 'coin' },
]);

// Los secretos no dicen qué piden hasta que se consiguen.
export const shown = (a, got) => (!a.secret || got.includes(a.id) ? a : { ...a, name: t('ach.secretName', 'Logro secreto'), desc: t('ach.secretDesc', 'Descúbrelo jugando.') });

// Contadores que cruzan runs (runs completas): los logros de largo plazo los leen.
const STATS_KEY = 'zugzwang.stats.v1';
export const loadStats = () => read(STATS_KEY) || {};
export function bump(stat) { const s = loadStats(); s[stat] = (s[stat] || 0) + 1; write(STATS_KEY, s); return s[stat]; }
// Colección sin repetidos dentro de las estadísticas (p. ej. minijuegos ganados en Difícil); devuelve cuántos hay.
export function collect(stat, id) { const s = loadStats(); const set = new Set(s[stat] || []); set.add(id); s[stat] = [...set]; write(STATS_KEY, s); return set.size; }

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
  if (a.length + 1 >= ACHIEVEMENTS.length - 1) award('ach_all');
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
// Mutaciones que alguna vez tuvo tu ejército: la galería las abre.
const MUT_KEY = 'zugzwang.mutseen.v1';
export const loadMutSeen = () => read(MUT_KEY) || [];
export function seeMutations(ids) {
  const seen = loadMutSeen(), fresh = [...new Set(ids)].filter((id) => !seen.includes(id));
  if (fresh.length) write(MUT_KEY, [...seen, ...fresh]);
  if (Object.keys(MUTATIONS).every((m) => seen.includes(m) || fresh.includes(m))) award('all_mutations');
}
