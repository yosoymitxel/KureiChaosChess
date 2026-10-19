// Última resistencia: colocas tu defensa con un presupuesto y aguantas las oleadas sin añadir nada.
// Usa el mismo avance que Yo, Zombi con los papeles cambiados.
import { makePiece } from './generate.js';
import { ROWS, COLS, COST, advance, at } from './izombie.js';

export { ROWS, COLS, at };
// Presupuesto y cantidad de oleadas por nivel: Normal es el reto de siempre.
export const DIFFS = {
  facil: { name: 'Fácil', budget: 18, waves: 2, bonus: 4 },
  normal: { name: 'Normal', budget: 15, waves: 3, bonus: 3 },
  dificil: { name: 'Difícil', budget: 11, waves: 4, bonus: 2 },
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

// Como en PvZ: se planta antes del asalto y en la pausa entre banderas, con lo que quede y el premio.
export const building = (s) => s.phase === 'setup' || s.phase === 'between';
export const canPlace = (s, type, r, c) => building(s) && r >= ROWS - 3 && !at(s, r, c) && PRICES[type] <= s.budget;

// Lanza la siguiente oleada; la última es la gran horda, con dos piezas más en la segunda fila.
export function nextWave(s, rng = Math.random) {
  if (s.over || !building(s)) return false;
  const horde = s.wave === s.diff.waves - 1;
  const list = [...WAVE[Math.min(s.wave, WAVE.length - 1)], ...(horde ? ['pawn', 'knight'] : [])];
  const cols = [...Array(COLS).keys()].sort(() => rng() - 0.5);
  list.forEach((t, i) => s.pieces.push(makePiece(t, 'dark', i < COLS ? 0 : 1, cols[i % COLS])));
  s.wave++;
  s.phase = 'fight';
  s.horde = horde;
  return true;
}

export function place(s, type, r, c) {
  if (!canPlace(s, type, r, c)) return false;
  s.pieces.push(makePiece(type, 'light', r, c, { royal: false }));
  s.budget -= PRICES[type];
  return true;
}

// Un paso del asalto. Al limpiar una oleada se abre la pausa (con premio); tras la horda, se gana.
export function step(s) {
  if (s.over || s.phase !== 'fight') return;
  if (!s.pieces.some((p) => p.color === 'dark')) {
    if (s.wave >= s.diff.waves) { s.over = 'win'; return; }
    s.phase = 'between';
    s.budget += s.diff.bonus;
    return;
  }
  const caught = advance(s, 1);
  if (s.over === 'win') s.over = 'lose';
  else if (!s.moved && !caught.length) s.pieces = s.pieces.filter((p) => p.color === 'light');
  else if (!s.pieces.some((p) => p.color === 'light')) s.over = 'lose';
}

export { COST };
