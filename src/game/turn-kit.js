// Piezas comunes de los minis por turnos de una sola pieza (carrera, torre, festín, esquiva, escalada,
// alfil, dama): tablero, azar y movimientos con las reglas de siempre (rules.js).
import { legalMoves, key } from './rules.js';

export { key };
export const grid = (rows, cols = rows) => ({ rows, cols, holes: new Set(), terrain: new Map(), portals: new Map() });
export const inside = (b, r, c) => r >= 0 && c >= 0 && r < b.rows && c < b.cols && !b.holes.has(key(r, c));
export const shuffle = (rng, list) => list.map((x) => [rng(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
export const pick = (rng, list) => list[Math.floor(rng() * list.length)];
export const cheb = (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
export const at = (pieces, r, c) => pieces.find((p) => p.row === r && p.col === c);
// Casillas libres (sin hueco ni pieza) que cumplen `ok`.
export function freeCells(b, pieces, ok = () => true) {
  const out = [];
  for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) if (inside(b, r, c) && !at(pieces, r, c) && ok(r, c)) out.push([r, c]);
  return out;
}
// Destinos de `p` con sus reglas de ajedrez (las demás piezas cuentan como rivales si son de otro color).
export const movesOf = (p, pieces, b) => legalMoves(p, pieces, b).map((m) => [m.row, m.col]);
let n = 0;
export const piece = (type, color, row, col, extra = {}) => ({ id: type + ++n, type, color, row, col, ...extra });
