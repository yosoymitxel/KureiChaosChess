// Jardín Zen: especies, objetos de la tienda y reglas que se ajustan. La lógica está en
// src/game/zen.js y el dibujo en src/ui/zen-art.js; agregar una especie pide sus sprites
// (art/zen/) y su entrada aquí.
import { localize } from '../i18n/index.js';

// `weight`: cuánto sale al caer una semilla (ganar nodos, mariposas, el tablero).
// `bloomMin`: minutos hasta la flor. `pays`: monedas por flor cortada.
// `regrow`: rebrota esas veces tras cortarla. `seedBack`: probabilidad de soltar su semilla al cortarla.
export const SEEDS = localize('seeds', {
  romero: { id: 'romero', name: 'Romero', rarity: 'Común', weight: 5, bloomMin: 6, price: 10, pays: 14, desc: 'Rápido: abre en 6 minutos.' },
  salvia: { id: 'salvia', name: 'Salvia', rarity: 'Común', weight: 3, bloomMin: 10, price: 12, pays: 18, regrow: 1, desc: 'Rebrota una vez después de cortarla.' },
  lavanda: { id: 'lavanda', name: 'Lavanda', rarity: 'Rara', weight: 1, bloomMin: 16, price: 22, pays: 36, seedBack: 0.5, desc: 'Lenta y cara; al cortarla, a veces suelta su semilla.' },
});

// Lo que se compra para el jardín. `stack`: se acumula y se coloca con la mano; si no, se tiene o no.
export const GARDEN_ITEMS = localize('gardenItems', {
  shovel: { id: 'shovel', name: 'Pala de acero', price: 60, desc: 'Cava sin esperar a que la pala descanse, y con ella el mazo parte piedras de un golpe.' },
  can: { id: 'can', name: 'Regadera grande', price: 50, desc: 'Al regar, moja también los tiestos de al lado.' },
  lantern: { id: 'lantern', name: 'Farol', price: 45, stack: true, desc: 'Va en tierra virgen o en un tiesto vacío: lo que crece a su lado va un 50 % más rápido.' },
  pot: { id: 'pot', name: 'Maceta', price: 25, stack: true, desc: 'Un tiesto listo sobre tierra sin cavar o sobre una piedra.' },
});

export const DIG_COOLDOWN = 40_000; // la pala de siempre descansa entre cava y cava
// Tierra nueva que sale con estorbo: piedra (mazo, varios golpes), arbusto (tijeras) o losa (mazo).
export const OBSTACLE_CHANCE = { rock: 0.16, bush: 0.1, stone: 0.08 };
export const ROCK_HP = [2, 3];      // golpes de mazo para partirla
export const LANTERN_BOOST = 1.5;   // crecimiento al lado de un farol
// El estanque crece de 2×2 a 4×4, un paso abajo a la derecha y el siguiente arriba a la izquierda.
export const LAKE_MAX = 4;
export const lakeCost = (n) => 80 * 2 ** (n - 2);
