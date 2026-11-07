// Bosses are multi-cell pieces. `size` is [rows, cols]; the piece's row/col is its top-left anchor.
// A boss lands on every cell of its footprint and crushes every enemy there.
// Attacks against it take 1 HP; the attacker bounces back until the last hit.
// Rule of thumb: the bigger the footprint, the plainer the movement.
import { localize } from '../i18n/index.js';
export const BOSSES = localize('bosses', {
  titan: {
    id: 'titan', name: 'Titán', size: [2, 2], hp: 3, moves: ['king'], power: 'quake', every: 3, powerName: 'Pisotón',
    desc: 'Ocupa 2×2. Avanza 1 casilla y aplasta todo lo que pisa. Pisotón: aparta lo que tenga pegado. 3 vidas.',
  },
  ram: {
    id: 'ram', name: 'Ariete', size: [2, 2], hp: 2, moves: ['rook'], power: 'charge', every: 3, powerName: 'Embestida',
    desc: 'Ocupa 2×2. Embiste en línea recta mientras el pasillo esté libre. Embestida: echa a un lado lo que tenga delante. 2 vidas.',
  },
  hydra: {
    id: 'hydra', name: 'Hidra', size: [2, 2], hp: 4, moves: ['advisor', 'knight'], power: 'heal', every: 4, powerName: 'Regeneración',
    desc: 'Ocupa 2×2. Repta en diagonal o salta en L. Regeneración: recupera una vida si no la golpeas antes. 4 vidas.',
  },
  golem: {
    id: 'golem', name: 'Gólem', size: [3, 3], hp: 5, moves: ['rook2'], power: 'rockfall', every: 5, powerName: 'Derrumbe',
    desc: 'Ocupa 3×3. Lento: solo avanza 1 o 2 en línea recta, pero lo que pisa desaparece. Derrumbe: hunde una cruz sobre tu mejor pieza. 5 vidas.',
  },
  rider: {
    id: 'rider', name: 'Jinete', size: [2, 1], hp: 2, moves: ['knight', 'king'], power: 'summon', every: 5, powerName: 'Escudero',
    desc: 'Ocupa 2×1 en vertical. Salta en L o da un paso. Escudero: llama a un caballo a su lado (dos como mucho). 2 vidas.',
  },
  wall: {
    id: 'wall', name: 'Muralla', size: [1, 2], hp: 3, moves: ['rook2', 'advisor'], power: 'push', every: 3, powerName: 'Empuje',
    desc: 'Ocupa 1×2 en horizontal. Corta pasillos: 2 en línea o 1 en diagonal. Empuje: hace retroceder lo que tenga a los lados y delante. 3 vidas.',
  },
  devourer: {
    id: 'devourer', name: 'Devorador', size: [2, 2], hp: 3, moves: ['king'], absorb: true, power: 'pull', every: 3, powerName: 'Succión',
    desc: 'Ocupa 2×2. Empieza lento, pero aprende el movimiento de cada pieza que aplasta. Succión: acerca lo que esté a dos casillas. 3 vidas.',
  },
});
export const BOSS_IDS = Object.keys(BOSSES);
