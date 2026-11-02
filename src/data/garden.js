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
  lantern: { id: 'lantern', name: 'Farol', price: 90, stack: true, desc: 'Va en tierra libre: lo que crece a su lado va un 25 % más rápido.' },
  pot: { id: 'pot', name: 'Maceta', price: 12, stack: true, desc: 'Va en tierra cavada con la pala; después se siembra.' },
});

// Cualquier flor cortada suelta a veces su semilla.
export const SEED_BACK = 0.3;
export const DIG_COOLDOWN = 40_000; // la pala de siempre descansa entre cava y cava
export const MOVE_COOLDOWN = 30_000; // el guante de siempre, entre mudanza y mudanza
// Tierra nueva que sale con estorbo: piedra (mazo, varios golpes), arbusto (tijeras) o losa (mazo).
export const OBSTACLE_CHANCE = { rock: 0.16, bush: 0.1, stone: 0.08 };
export const ROCK_HP = [2, 3];      // golpes de mazo para partirla
export const LANTERN_BOOST = 1.25;  // crecimiento al lado de un farol
// Cada planta pide agua WATER_STEPS veces: con agua crece hasta el siguiente tramo y ahí se para hasta
// que la vuelvas a regar (como en el jardín de PvZ). Un jardín grande da más por visita.
export const WATER_STEPS = 3;
// Los koi tienen hambre cada tanto; darles de comer entonces deja monedas.
export const KOI_HUNGER_MS = 15 * 60_000;
export const KOI_COINS = 4;
// El estanque crece de 2×2 a 4×4, un paso abajo a la derecha y el siguiente arriba a la izquierda.
export const LAKE_MAX = 4;
export const lakeCost = (n) => 80 * 2 ** (n - 2);
