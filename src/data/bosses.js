// Bosses are multi-cell pieces. `size` is [rows, cols]; the piece's row/col is its top-left anchor.
// A boss lands on every cell of its footprint and crushes every enemy there.
// Attacks against it take 1 HP; the attacker bounces back until the last hit.
export const BOSSES = {
  titan: {
    id: 'titan', name: 'Titán', size: [2, 2], hp: 3, moves: ['king'], art: 'king',
    desc: 'Ocupa 2×2. Avanza 1 casilla y aplasta todo lo que pisa. 3 vidas.',
  },
  ram: {
    id: 'ram', name: 'Ariete', size: [2, 2], hp: 2, moves: ['rook'], art: 'rook',
    desc: 'Ocupa 2×2. Embiste en línea recta mientras el pasillo esté libre. 2 vidas.',
  },
  hydra: {
    id: 'hydra', name: 'Hidra', size: [2, 2], hp: 4, moves: ['advisor', 'knight'], art: 'queen',
    desc: 'Ocupa 2×2. Repta en diagonal o salta en L. 4 vidas.',
  },
};
export const BOSS_IDS = Object.keys(BOSSES);
