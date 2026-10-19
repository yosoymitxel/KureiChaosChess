// Mate en N con las reglas del juego (el rey cae al capturarlo): marfil gana si, haga lo que haga
// carmesí, puede capturar al rey carmesí dentro de N jugadas suyas.
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
  if (p.type === 'pawn' && (m.row === 0 || m.row === SIZE - 1)) next.find((x) => x.id === p.id).type = 'queen';
  return next;
}

export const moves = (pieces, color, b = board()) =>
  pieces.filter((p) => p.color === color).flatMap((p) => legalMoves(p, pieces, b).map((m) => ({ p, m })));

const kingDead = (pieces, color) => !pieces.some((p) => p.color === color && p.type === 'king');
const kingCaps = (pieces) => moves(pieces, 'light').filter(({ m }) => m.hits.some((h) => h.type === 'king' && h.color === 'dark'));
export const capturesKing = (pieces) => kingCaps(pieces).length > 0;

// La captura que cobra el mate: la pieza recién movida si llega al rey; si no, la primera que llegue.
export const captureMove = (pieces, prefer) => {
  const caps = kingCaps(pieces);
  return caps.find(({ p }) => prefer && p.id === prefer.id) || caps[0] || null;
};

// Jugadas marfil que fuerzan la captura del rey en n. La última tiene que dar jaque: obligar al
// carmesí a meterse en la captura sin jaque es un ahogado, no un mate.
export function mateKeys(pieces, n) {
  return moves(pieces, 'light').filter(({ p, m }) => {
    const a = play(pieces, p, m);
    if (kingDead(a, 'dark') || (n === 1 && !capturesKing(a))) return false;
    const replies = moves(a, 'dark');
    return replies.length > 0 && replies.every(({ p: q, m: k }) => {
      const b = play(a, q, k);
      if (kingDead(b, 'light')) return false;
      return n === 1 ? capturesKing(b) : capturesKing(b) || mateKeys(b, n - 1).length > 0;
    });
  });
}
export const solve = (pieces, n) => mateKeys(pieces, n)[0] || null;

// La defensa carmesí: si puede, captura al rey marfil; si no, una respuesta que no pierda.
export function defend(pieces, n) {
  const all = moves(pieces, 'dark');
  const regicide = all.find(({ m }) => m.hits.some((h) => h.type === 'king' && h.color === 'light'));
  if (regicide) return regicide;
  const ok = all.filter(({ p, m }) => { const b = play(pieces, p, m); return !(capturesKing(b) || (n > 1 && solve(b, n - 1))); });
  return (ok.length ? ok : all)[0] || null;
}
