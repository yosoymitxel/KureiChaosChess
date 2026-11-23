// Jardín Zen: especies, objetos de la tienda y reglas que se ajustan. La lógica está en
// src/game/zen.js y el dibujo en src/ui/zen-art.js; agregar una especie pide sus sprites
// (art/zen/) y su entrada aquí.
import { localize } from '../i18n/index.js';

// `weight`: cuánto sale al caer una semilla (ganar nodos, mariposas, el tablero).
// `bloomMin`: minutos de crecimiento con agua hasta la flor (se riega WATER_STEPS veces). `pays`: monedas por flor cortada.
// `regrow`: rebrota esas veces tras cortarla.
export const SEEDS = localize('seeds', {
  romero: { id: 'romero', name: 'Romero', rarity: 'Común', weight: 5, bloomMin: 15, price: 10, pays: 18, desc: 'Rápido: abre en 15 minutos.' },
  salvia: { id: 'salvia', name: 'Salvia', rarity: 'Común', weight: 3, bloomMin: 24, price: 12, pays: 24, regrow: 1, desc: 'Rebrota una vez después de cortarla.' },
  lavanda: { id: 'lavanda', name: 'Lavanda', rarity: 'Rara', weight: 1, bloomMin: 40, price: 22, pays: 50, desc: 'Lenta y cara, pero paga el doble.' },
});

// Lo que se compra para el jardín. `stack`: se acumula y se coloca con la mano; si no, se tiene o no.
export const GARDEN_ITEMS = localize('gardenItems', {
  shovel: { id: 'shovel', name: 'Pala de acero', price: 160, desc: 'Cava sin esperar a que la pala descanse.' },
  mallet: { id: 'mallet', name: 'Mazo de hierro', price: 140, desc: 'Parte piedras y losas de un solo golpe.' },
  glove: { id: 'glove', name: 'Guantes de jardinero', price: 180, desc: 'Mueven sin esperar y pueden llevar el estanque a otro sitio.' },
  can: { id: 'can', name: 'Regadera grande', price: 220, desc: 'Al regar, moja también los tiestos de al lado.' },
  lantern: { id: 'lantern', name: 'Farol', price: 90, stack: true, desc: 'Va en tierra libre: lo que crece a su lado va un 15 % más rápido.' },
  pot: { id: 'pot', name: 'Maceta', price: 12, stack: true, desc: 'Va en tierra cavada con la pala; después se siembra.' },
});

// Cualquier flor cortada suelta a veces su semilla.
export const SEED_BACK = 0.3;
export const DIG_COOLDOWN = 40_000; // la pala de siempre descansa entre cava y cava
export const MOVE_COOLDOWN = 30_000; // el guante de siempre, entre mudanza y mudanza
// Tierra nueva que sale con estorbo: piedra (mazo, varios golpes), arbusto (tijeras) o losa (mazo).
export const OBSTACLE_CHANCE = { rock: 0.22, bush: 0.18, stone: 0.14 };
// Arbustos que brotan solos en tierra libre (uno cada BUSH_MS, hasta BUSH_MAX a la vez): trabajo para las tijeras.
export const BUSH_MS = 20 * 60_000;
export const BUSH_MAX = 4;
// Una maceta aguanta POT_LIFE flores cortadas y se agrieta: no se siembra hasta arreglarla con el mazo.
export const POT_LIFE = 4;
export const ROCK_HP = [2, 3];      // golpes de mazo para partirla
export const LANTERN_BOOST = 1.15;  // crecimiento al lado de un farol
// Cada planta pide agua WATER_STEPS veces: con agua crece hasta el siguiente tramo y ahí se para hasta
// que la vuelvas a regar (como en el jardín de PvZ). Un jardín grande da más por visita.
export const WATER_STEPS = 3;
// Los koi tienen hambre cada tanto; darles de comer entonces deja monedas.
export const KOI_HUNGER_MS = 15 * 60_000;
export const KOI_COINS = 4;
// El estanque crece de 2×2 a 4×4, un paso abajo a la derecha y el siguiente arriba a la izquierda.
export const LAKE_MAX = 4;
export const lakeCost = (n) => 80 * 2 ** (n - 2);

// Jardines, cada uno con su pantalla y su guardado; el selector de arriba pasa de uno a otro. Comparten monedas.
export const GARDENS = localize('gardens', {
  zen: { id: 'zen', screen: 'zen', name: 'Jardín Zen' },
  agua: { id: 'agua', screen: 'water', name: 'Jardín de Agua' },
});

// Jardín de Agua: todo es estanque. Las plantas acuáticas van en pocas plazas de la orilla (el centro queda
// para los koi y los barquitos) y no piden riego: crecen solas. `regrow`: rebrota esas veces tras cortarla.
export const WATER_PLANTS = localize('waterPlants', {
  lenteja: { id: 'lenteja', name: 'Lenteja de agua', price: 6, bloomMin: 8, pays: 10, desc: 'Rápida y barata.' },
  nenufar: { id: 'nenufar', name: 'Nenúfar', price: 14, bloomMin: 20, pays: 26, regrow: 2, desc: 'Abre su flor y rebrota dos veces.' },
  junco: { id: 'junco', name: 'Junco', price: 18, bloomMin: 30, pays: 40, desc: 'Echa espigas en la orilla.' },
  loto: { id: 'loto', name: 'Loto', price: 30, bloomMin: 45, pays: 75, desc: 'Lento, pero la flor más cara.' },
});
// Plazas de la orilla, en unidades del estanque (60×60): las cuatro esquinas y la mitad de cada lado.
export const WATER_SIZE = 90;
export const WATER_SLOTS = [[10, 10], [45, 9], [80, 10], [81, 45], [80, 80], [45, 81], [10, 80], [9, 45]];

// Barquitos del Jardín de Agua: se compran allí, se manejan como teledirigidos y corren en la carrera.
// top: velocidad punta (unidades del estanque por segundo); accel: cuánto tarda en llegar; turn: giro (rad/s);
// grip: cuánto se pega al rumbo (poco = derrapa). El koi no se compra: siempre puede correr.
export const BOATS = localize('boats', {
  papel: { id: 'papel', name: 'Barquito de papel', price: 150, top: 12, accel: 2.5, turn: 3.4, grip: 3, desc: 'Ligero y ágil, pero lento.' },
  balsa: { id: 'balsa', name: 'Balsa de bambú', price: 400, top: 14, accel: 1.5, turn: 2.9, grip: 5, desc: 'Pesada: tarda en arrancar y no derrapa.' },
  velero: { id: 'velero', name: 'Velero', price: 900, top: 18, accel: 1.1, turn: 2.2, grip: 2, desc: 'Rápido en recta; en las curvas se abre.' },
  lancha: { id: 'lancha', name: 'Lancha', price: 1800, top: 21, accel: 2.8, turn: 2.6, grip: 3.5, desc: 'La más rápida y con buen giro.' },
  koi: { id: 'koi', name: 'Koi', price: 0, top: 15, accel: 3.4, turn: 4.4, grip: 6, fish: true, desc: 'Nada ágil y gira en seco.' },
});
// Monedas por ganar la carrera, según la dificultad.
export const RACE_PRIZE = { facil: 10, normal: 20, dificil: 35 };
