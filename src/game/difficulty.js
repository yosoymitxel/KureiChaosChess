// La guía de dificultad: una escalera de tres tramos por tercios de la torre que manda en tres
// frentes: cómo juega el rival, qué mecánicas aparecen y con qué ejército se arma la mesa.
// Generación y juego leen estas tablas; la preparación muestra al rival. Los criterios se
// verifican en tools/ladder.mjs.

// Tramo de la torre: fácil, normal o difícil. La misma partición que usan los minijuegos.
export const floorTier = (floor, floors) => {
  const t = floors > 1 ? floor / (floors - 1) : 0;
  return t < 1 / 3 ? 'facil' : t < 2 / 3 ? 'normal' : 'dificil';
};
const BAND = { facil: 0, normal: 1, dificil: 2 };
export const bandOf = (floor, floors) => BAND[floorTier(floor, floors)];

// Perfiles del rival, de menor a mayor peldaño. `noise` es el error esperado por jugada;
// `capture` cuánto ve el valor de una captura; `pressure` cuánto presiona al rey enemigo;
// `care` cuánto evita dejar piezas colgadas; `blunder` la chance de mover al azar.
export const RIVALS = {
  aprendiz: {
    id: 'aprendiz', name: 'Aprendiz', desc: 'Juega suelto: pierde capturas y se descuida del rey.',
    noise: 25, capture: 0.65, pressure: 0.2, care: 0, blunder: 0.15,
  },
  oficial: {
    id: 'oficial', name: 'Oficial', desc: 'Captura por valor y presiona a tu rey.',
    noise: 4, capture: 1, pressure: 1, care: 0, blunder: 0,
  },
  maestro: {
    id: 'maestro', name: 'Maestro', desc: 'No cuelga piezas y castiga cualquier descuido.',
    noise: 0.5, capture: 1, pressure: 1.8, care: 1, blunder: 0,
  },
};
export const RIVAL_STEPS = ['aprendiz', 'oficial', 'maestro'];
const TIER_STEP = { facil: 'aprendiz', normal: 'oficial', dificil: 'maestro' };

// Ajuste del jugador (Ajustes): corre la escalera entera un peldaño, con topes en los extremos.
// La escalera de fábrica queda como la rúbrica "Normal": la dificultad se elige, no se sufre.
export const DIFFICULTIES = {
  facil: { id: 'facil', name: 'Fácil', shift: -1, desc: 'La escalera baja un peldaño: la torre no pasa del Oficial.' },
  normal: { id: 'normal', name: 'Normal', shift: 0, desc: 'La escalera tal cual: Aprendiz, Oficial y Maestro en los tercios de la torre.' },
  dificil: { id: 'dificil', name: 'Difícil', shift: 1, desc: 'La escalera sube un peldaño: arranca en el Oficial y el Maestro llega antes.' },
};

// El rival de un piso: el tramo lo fija; `up` sube un peldaño (el piso de un mini-jefe) y el
// ajuste de dificultad corre toda la escalera.
export function rivalForFloor(floor, floors, { up = 0, difficulty = 'normal' } = {}) {
  const shift = (DIFFICULTIES[difficulty] || DIFFICULTIES.normal).shift;
  const i = Math.max(0, Math.min(RIVAL_STEPS.length - 1, RIVAL_STEPS.indexOf(TIER_STEP[floorTier(floor, floors)]) + up + shift));
  return RIVALS[RIVAL_STEPS[i]];
}

// Ritmo de mecánicas: peso de cada una por tramo (temprano, medio, tardío). El piso 1 va llano
// aparte, la Élite espera a que haya cartas y cada minijuego estrena en su tramo.
export const MOD_WEIGHTS = {
  promote: [3, 2, 1],
  rest: [3, 3, 2],
  bag: [3, 2, 2],
  ice: [2, 2, 1],
  portal: [0, 2, 2],
  rush: [1, 2, 2],
  fog: [0, 1, 2],
  chaos: [0, 1, 2],
  zombie: [0, 1.5, 2],
  elite: [0, 2, 3],
};
export const MINI_WEIGHTS = {
  connect4: [0.7, 1, 1], knight: [0.7, 1, 1], bowling: [0.7, 1, 1],
  mates: [0, 1, 1], queens: [0, 1, 1], marcianos: [0, 1, 1], bomber: [0, 1, 1],
  checkers: [0.7, 1, 1],
  barrier: [0, 0.5, 1.5], izombie: [0, 0.5, 1.5], laststand: [0, 0.5, 1.5],
};
export const isMiniModifier = (id) => id in MINI_WEIGHTS;

const draw = (rng, entries) => {
  let x = rng() * entries.reduce((s, e) => s + e[1], 0);
  for (const [id, w] of entries) if ((x -= w) <= 0) return id;
  return entries[entries.length - 1][0];
};

// Sorteo de la mecánica de un nodo: pesos del tramo, sin repetir lo del piso anterior ni del
// propio piso, sin Élite antes de tiempo y sin repetir un minijuego dentro de la run. Con
// `mini` solo se sortean minijuegos (lo usa la garantía de ritmo de generateMap). Devuelve
// null si no queda nada que sortear.
// prefs (selector de la run, como los gambitos de Gambonanza): las favoritas pesan ×FAV_WEIGHT y la vetada no sale.
export const FAV_WEIGHT = 4;
export function pickModifier(rng, { floor, floors, skip = [], usedMinis = [], mini = false, prefs } = {}) {
  const band = bandOf(floor, floors);
  const table = mini ? MINI_WEIGHTS : { ...MOD_WEIGHTS, ...MINI_WEIGHTS };
  const fav = prefs?.fav || [], ban = prefs?.ban || [];
  const build = (memoriaMinis) => Object.entries(table).filter(([id, w]) =>
    (w[band] > 0 || fav.includes(id)) && !skip.includes(id) && !ban.includes(id) && (memoriaMinis || !usedMinis.includes(id)) && !(id === 'elite' && floor < 2));
  // Una favorita sale aunque su tramo la tenga apagada (portal y niebla no aparecen al principio).
  const weigh = ([id, w]) => [id, fav.includes(id) ? Math.max(w[band], 1) * FAV_WEIGHT : w[band]];
  let entries = build(false).map(weigh);
  if (!entries.length && !mini) entries = build(true).map(weigh);
  return entries.length ? draw(rng, entries) : null;
}

// Mini-jefes de control: uno en el tercio medio y otro en el tardío en runs de 8 pisos o más;
// en runs cortas, uno. El sorteo mueve la posición un piso como mucho y nunca pisa al jefe.
export function miniBossFloors(floors, rng) {
  const targets = floors >= 8 ? [0.4, 0.72] : floors >= 5 ? [0.55] : [];
  const lo = 2, hi = Math.max(lo, floors - 3);
  const out = [];
  for (const t of targets) {
    let f = Math.round((floors - 1) * t) + (rng() < 0.5 ? 0 : rng() < 0.5 ? -1 : 1);
    f = Math.max(lo, Math.min(hi, f));
    while (out.includes(f)) f = f < hi ? f + 1 : f - 1;
    out.push(f);
  }
  out.sort((a, b) => a - b);
  // Dos mini-jefes no se pegan: entre uno y otro queda al menos un piso de respiro.
  if (out.length === 2 && out[1] - out[0] < 2) out[0] = Math.max(lo, out[1] - 2);
  return out;
}

// Los colosos menores custodian el camino; los mayores cierran la torre.
export const MINI_BOSSES = ['ram', 'rider', 'wall', 'titan'];
export const FINAL_BOSSES = ['devourer', 'hydra', 'golem'];

// Ejército por tramo: la rareza no espera (camello, cañón y elefante entran desde el piso 1) y
// cada bando lleva al menos una pieza de las de casa; lo que crece con la torre es el tablero
// y el número de líneas.
export const RARE_TYPES = ['camel', 'cannon', 'elephant'];
export const ARMY_STEPS = [
  { layers: [2, 3] },
  { layers: [2, 3, 4] },
  { layers: [2, 3, 4] },
];
export const armyForFloor = (floor, floors) => ARMY_STEPS[bandOf(floor, floors)];
