// Yo, Zombi: tú atacas. Compras piezas carmesí en la fila de arriba; cada avance mueven hacia abajo
// según su movimiento de ajedrez y luego la defensa marfil, quieta, captura lo que ataca.
import { legalMoves } from './rules.js';
import { makePiece } from './generate.js';

export const ROWS = 7, COLS = 5;
// Presupuesto de compra: más monedas compran más ataque y la defensa fija se queda corta.
export const DIFFS = {
  facil: { name: 'Fácil', budget: 20 },
  normal: { name: 'Normal', budget: 14 },
  dificil: { name: 'Difícil', budget: 10 },
};
export const COST = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 8 };
const DEFENSE = [
  ['rook', 6, 0], ['knight', 6, 1], ['king', 6, 2], ['bishop', 6, 3], ['rook', 6, 4],
  ['pawn', 5, 0], ['pawn', 5, 2], ['pawn', 5, 4], ['knight', 4, 3], ['bishop', 4, 1],
];

export function newZombie(key = 'normal') {
  return {
    board: { rows: ROWS, cols: COLS, holes: new Set(), terrain: new Map(), portals: new Map() },
    pieces: DEFENSE.map(([t, r, c]) => makePiece(t, 'light', r, c, { royal: false })),
    coins: (DIFFS[key] || DIFFS.normal).budget, over: null, falls: [],
  };
}

export const at = (s, r, c) => s.pieces.find((p) => p.row === r && p.col === c);
export const canBuy = (s, type, c) => !s.over && COST[type] <= s.coins && !at(s, 0, c);

export function buy(s, type, c) {
  if (!canBuy(s, type, c)) return false;
  s.pieces.push(makePiece(type, 'dark', 0, c));
  s.coins -= COST[type];
  return true;
}

// Un avance: cada atacante (de abajo arriba) da su paso más profundo; después cada defensor captura uno.
// `s.falls` guarda dónde cae cada víctima: la pantalla levanta ahí la copia que se derrumba.
export function advance(s, maxStep = Infinity) {
  if (s.over) return null;
  s.falls = [];
  const caught = [];
  let moved = false;
  for (const p of s.pieces.filter((x) => x.color === 'dark').sort((a, b) => b.row - a.row)) {
    if (!s.pieces.includes(p)) continue;
    const best = legalMoves(p, s.pieces, s.board).filter((m) => m.row > p.row && m.row - p.row <= maxStep + (p.type === 'knight'))
      .sort((a, b) => b.row - a.row || b.hits.length - a.hits.length)[0];
    if (!best) continue;
    moved = true;
    for (const v of best.hits) s.falls.push({ row: v.row, col: v.col, type: v.type, color: v.color });
    s.pieces = s.pieces.filter((x) => !best.hits.includes(x));
    p.row = best.row; p.col = best.col;
    if (p.row === ROWS - 1) { s.over = 'win'; return caught; }
  }
  for (const d of s.pieces.filter((x) => x.color === 'light')) {
    const prey = legalMoves(d, s.pieces, s.board).flatMap((m) => m.hits).sort((a, b) => b.row - a.row)[0];
    if (prey && s.pieces.includes(prey)) {
      s.falls.push({ row: prey.row, col: prey.col, type: prey.type, color: prey.color });
      s.pieces = s.pieces.filter((x) => x !== prey);
      caught.push(prey);
    }
  }
  s.moved = moved;
  const attackers = s.pieces.some((x) => x.color === 'dark');
  if ((!attackers || !moved) && s.coins < COST.pawn) s.over = 'lose';
  return caught;
}
