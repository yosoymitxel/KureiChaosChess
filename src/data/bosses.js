// Bosses are multi-cell pieces. `size` is [rows, cols]; the piece's row/col is its top-left anchor.
// A boss lands on every cell of its footprint and crushes every enemy there.
// Attacks against it take 1 HP; the attacker bounces back until the last hit.
// Rule of thumb: the bigger the footprint, the plainer the movement.
import { localize } from '../i18n/index.js';
export const BOSSES = localize('bosses', {
  titan: {
    id: 'titan', name: 'Titán', size: [2, 2], hp: 3, moves: ['king'],
    desc: 'Ocupa 2×2. Avanza 1 casilla y aplasta todo lo que pisa. 3 vidas.',
  },
  ram: {
    id: 'ram', name: 'Ariete', size: [2, 2], hp: 2, moves: ['rook'],
    desc: 'Ocupa 2×2. Embiste en línea recta mientras el pasillo esté libre. 2 vidas.',
  },
  hydra: {
    id: 'hydra', name: 'Hidra', size: [2, 2], hp: 4, moves: ['advisor', 'knight'],
    desc: 'Ocupa 2×2. Repta en diagonal o salta en L. 4 vidas.',
  },
  golem: {
    id: 'golem', name: 'Gólem', size: [3, 3], hp: 5, moves: ['rook2'],
    desc: 'Ocupa 3×3. Lento: solo avanza 1 o 2 en línea recta, pero lo que pisa desaparece. 5 vidas.',
  },
  rider: {
    id: 'rider', name: 'Jinete', size: [2, 1], hp: 2, moves: ['knight', 'king'],
    desc: 'Ocupa 2×1 en vertical. Salta en L o da un paso. 2 vidas.',
  },
  wall: {
    id: 'wall', name: 'Muralla', size: [1, 2], hp: 3, moves: ['rook2', 'advisor'],
    desc: 'Ocupa 1×2 en horizontal. Corta pasillos: 2 en línea o 1 en diagonal. 3 vidas.',
  },
  devourer: {
    id: 'devourer', name: 'Devorador', size: [2, 2], hp: 3, moves: ['king'], absorb: true,
    desc: 'Ocupa 2×2. Empieza lento, pero aprende el movimiento de cada pieza que aplasta. 3 vidas.',
  },
});
export const BOSS_IDS = Object.keys(BOSSES);
