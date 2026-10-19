// Yo, Zombi: tú atacas. Compras piezas carmesí en la fila de arriba; cada avance mueven hacia abajo
// según su movimiento de ajedrez y luego la defensa marfil, quieta, captura lo que ataca.
import { legalMoves } from './rules.js';
import { makePiece } from './generate.js';

export const ROWS = 7, COLS = 5;
// Presupuesto de compra: más monedas compran más ataque y la defensa fija se queda corta.
// Cada nivel fija cuántos trofeos hay que tomar (columnas) y con qué presupuesto.
export const DIFFS = {
  facil: { name: 'Fácil', budget: 30, trophies: [0, 2, 4] },
  normal: { name: 'Normal', budget: 28, trophies: [0, 2, 4] },
  dificil: { name: 'Difícil', budget: 42, trophies: [0, 1, 2, 3, 4] },
};
export const COST = { pawn: 1, knight: 3, bishop: 3, rook: 6, queen: 9 };
// Defensas de cartón: una al azar por partida, para que la solución no sea siempre la misma.
const DEFENSES = [
  [['rook', 6, 0], ['knight', 6, 1], ['king', 6, 2], ['bishop', 6, 3], ['rook', 6, 4], ['pawn', 5, 0], ['pawn', 5, 2], ['pawn', 5, 4], ['knight', 4, 3], ['bishop', 4, 1]],
  [['bishop', 6, 0], ['rook', 6, 1], ['king', 6, 2], ['rook', 6, 3], ['bishop', 6, 4], ['pawn', 5, 1], ['pawn', 5, 3], ['knight', 4, 0], ['knight', 4, 4], ['pawn', 4, 2]],
  [['knight', 6, 0], ['pawn', 6, 1], ['queen', 6, 2], ['pawn', 6, 3], ['knight', 6, 4], ['rook', 5, 0], ['rook', 5, 4], ['pawn', 5, 2], ['bishop', 4, 1], ['bishop', 4, 3]],
];

// Como los cerebros de I, Zombie: un trofeo por columna en la última fila; se gana al tomarlos todos.
// Capturar un peón marfil paga 2 monedas (los girasoles del original); el resto, 1.
export const LOOT = { pawn: 2 };

export function newZombie(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  const defense = DEFENSES[Math.floor(rng() * DEFENSES.length)];
  return {
    board: { rows: ROWS, cols: COLS, holes: new Set(), terrain: new Map(), portals: new Map() },
    pieces: defense.map(([t, r, c]) => makePiece(t, 'light', r, c, { royal: false })),
    coins: diff.budget, over: null, falls: [], diff,
    trophies: new Set(diff.trophies), taken: [],
  };
}

// Casillas que la defensa capturaría si una pieza carmesí parara ahí: el tablero las sombrea.
export function danger(s) {
  const out = new Set();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (at(s, r, c)) continue;
    const probe = makePiece('pawn', 'dark', r, c);
    const pieces = [...s.pieces, probe];
    if (pieces.some((d) => d.color === 'light' && legalMoves(d, pieces, s.board).some((m) => m.hits.includes(probe)))) out.add(r * COLS + c);
  }
  return out;
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
  s.taken = [];
  const caught = [];
  let moved = false;
  for (const p of s.pieces.filter((x) => x.color === 'dark').sort((a, b) => b.row - a.row)) {
    if (!s.pieces.includes(p)) continue;
    const best = legalMoves(p, s.pieces, s.board).filter((m) => m.row > p.row && m.row - p.row <= maxStep + (p.type === 'knight'))
      .sort((a, b) => b.row - a.row || b.hits.length - a.hits.length)[0];
    if (!best) continue;
    moved = true;
    for (const v of best.hits) {
      s.falls.push({ row: v.row, col: v.col, type: v.type, color: v.color });
      if (s.trophies && v.color === 'light') s.coins += LOOT[v.type] || 1;
    }
    s.pieces = s.pieces.filter((x) => !best.hits.includes(x));
    p.row = best.row; p.col = best.col;
    if (p.row !== ROWS - 1) continue;
    // Sin trofeos (Última resistencia) basta con llegar; con trofeos, la pieza toma el de su columna y sale.
    if (!s.trophies) { s.over = 'win'; return caught; }
    if (s.trophies.delete(p.col)) s.taken.push(p.col);
    s.pieces = s.pieces.filter((x) => x !== p);
    if (!s.trophies.size) { s.over = 'win'; return caught; }
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
