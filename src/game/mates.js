// Validador de jaque mate real en el tablero 6×6 con las reglas de movimiento de Zug.
// No confunde capturar al rey con dar mate: el rey nunca se captura; el jaque se detecta
// cuando una pieza rival puede atacarlo y el mate cuando no existe ninguna respuesta legal.
import { legalMoves } from './rules.js';
import { makePiece } from './generate.js';

export const SIZE = 6;
export const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });

// Secuencia de problemas por nivel: Normal conserva la de siempre (mate en 1 y luego mate en 2).
export const DIFFS = {
  facil: { name: 'Fácil', steps: [1, 1] },
  normal: { name: 'Normal', steps: [1, 2] },
  dificil: { name: 'Difícil', steps: [2, 2] },
};

export const fromSpec = (spec) => spec.map(([t, color, r, c]) => makePiece(t, color, r, c));

export function play(pieces, p, m) {
  const next = pieces.filter((x) => !m.hits.some((h) => h.id === x.id)).map((x) => (x.id === p.id ? { ...x, row: m.row, col: m.col } : x));
  if (p.type === 'pawn' && (m.row === 0 || m.row === SIZE - 1)) {
    const moved = next.find((x) => x.id === p.id);
    if (moved) moved.type = 'queen';
  }
  return next;
}

// pseudoMoves conserva los movimientos geométricos de las piezas; se usa para detectar ataques.
const pseudoMoves = (pieces, color, b = board()) =>
  pieces.filter((p) => p.color === color).flatMap((p) => legalMoves(p, pieces, b).map((m) => ({ p, m })));

export const moves = pseudoMoves;
const kingOf = (pieces, color) => pieces.find((p) => p.color === color && p.type === 'king');
const kingDead = (pieces, color) => !kingOf(pieces, color);
const hitsKing = (m) => m.hits.some((h) => h.type === 'king');

export function inCheck(pieces, color, b = board()) {
  const king = kingOf(pieces, color);
  if (!king) return true;
  return pseudoMoves(pieces, color === 'light' ? 'dark' : 'light', b).some(({ m }) =>
    m.hits.some((h) => h.id === king.id));
}

// Un movimiento legal de ajedrez no captura al rey rival y no deja expuesto al rey propio.
export function legalChessMoves(pieces, color, b = board()) {
  if (kingDead(pieces, color)) return [];
  return pseudoMoves(pieces, color, b).filter(({ p, m }) => {
    if (hitsKing(m)) return false;
    const next = play(pieces, p, m);
    return !kingDead(next, color) && !inCheck(next, color, b);
  });
}

export function isCheckmate(pieces, color, b = board()) {
  return inCheck(pieces, color, b) && legalChessMoves(pieces, color, b).length === 0;
}

// Compatibilidad con la UI antigua de «Captura al rey». No se usa para validar jaque mate.
export const capturesKing = (pieces) => pseudoMoves(pieces, 'light').some(({ m }) => hitsKing(m));
export const captureMove = (pieces, prefer) => {
  const caps = pseudoMoves(pieces, 'light').filter(({ m }) => hitsKing(m));
  return caps.find(({ p }) => prefer && p.id === prefer.id) || caps[0] || null;
};

// Devuelve primeras jugadas que fuerzan un mate REAL en exactamente n jugadas de marfil.
// Para mate en 2, cada defensa legal de carmesí debe permitir un mate en la jugada siguiente.
export function mateKeys(pieces, n, b = board()) {
  if (!Number.isInteger(n) || n < 1 || kingDead(pieces, 'light') || kingDead(pieces, 'dark')) return [];
  return legalChessMoves(pieces, 'light', b).filter(({ p, m }) => {
    const afterWhite = play(pieces, p, m);
    if (isCheckmate(afterWhite, 'dark', b)) return n === 1;
    if (n === 1 || inCheck(afterWhite, 'light', b)) return false;

    const replies = legalChessMoves(afterWhite, 'dark', b);
    if (!replies.length) return false; // si no hay respuesta, pero no hay jaque, es ahogado.
    return replies.every(({ p: q, m: k }) => {
      const afterDark = play(afterWhite, q, k);
      if (kingDead(afterDark, 'light') || kingDead(afterDark, 'dark')) return false;
      return mateKeys(afterDark, n - 1, b).length > 0;
    });
  });
}
export const solve = (pieces, n) => mateKeys(pieces, n)[0] || null;

// Defensa óptima: solo responde con movimientos legales; prioriza cualquier defensa que evite
// el mate anunciado. Si el problema está bien validado, no debería existir una defensa salvadora.
export function defend(pieces, n) {
  const all = legalChessMoves(pieces, 'dark');
  const safe = all.filter(({ p, m }) => {
    const next = play(pieces, p, m);
    return !mateKeys(next, n - 1).length;
  });
  return (safe.length ? safe : all)[0] || null;
}
