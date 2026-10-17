// Última resistencia: colocas tu defensa con un presupuesto y aguantas las oleadas sin añadir nada.
// Usa el mismo avance que Yo, Zombi con los papeles cambiados.
import { makePiece } from './generate.js';
import { ROWS, COLS, COST, advance, at } from './izombie.js';

export { ROWS, COLS, at };
// Presupuesto y cantidad de oleadas por nivel: Normal es el reto de siempre.
export const DIFFS = {
  facil: { name: 'Fácil', budget: 18, waves: 2 },
  normal: { name: 'Normal', budget: 15, waves: 3 },
  dificil: { name: 'Difícil', budget: 12, waves: 4 },
};
export const PRICES = { pawn: 1, knight: 3, bishop: 3, rook: 5 };
const WAVE = [['pawn', 'pawn', 'knight'], ['pawn', 'pawn', 'bishop', 'knight'], ['pawn', 'rook', 'knight', 'bishop', 'pawn'], ['pawn', 'rook', 'knight', 'bishop', 'pawn', 'rook']];

export const newStand = (key = 'normal') => {
  const diff = DIFFS[key] || DIFFS.normal;
  return {
    board: { rows: ROWS, cols: COLS, holes: new Set(), terrain: new Map(), portals: new Map() },
    pieces: [], budget: diff.budget, diff, coins: Infinity, wave: 0, phase: 'setup', over: null, falls: [],
  };
};

export const canPlace = (s, type, r, c) => s.phase === 'setup' && r >= ROWS - 3 && !at(s, r, c) && PRICES[type] <= s.budget;

export function place(s, type, r, c) {
  if (!canPlace(s, type, r, c)) return false;
  s.pieces.push(makePiece(type, 'light', r, c, { royal: false }));
  s.budget -= PRICES[type];
  return true;
}

export function step(s, rng = Math.random) {
  if (s.over) return;
  s.phase = 'fight';
  if (!s.pieces.some((p) => p.color === 'dark')) {
    if (s.wave >= s.diff.waves) { s.over = 'win'; return; }
    const cols = [...Array(COLS).keys()].sort(() => rng() - 0.5);
    WAVE[s.wave].forEach((t, i) => s.pieces.push(makePiece(t, 'dark', i < COLS ? 0 : 1, cols[i % COLS])));
    s.wave++;
    return;
  }
  const caught = advance(s, 1);
  if (s.over === 'win') s.over = 'lose';
  else if (!s.moved && !caught.length) s.pieces = s.pieces.filter((p) => p.color === 'light');
  else if (!s.pieces.some((p) => p.color === 'light')) s.over = 'lose';
}

export { COST };
