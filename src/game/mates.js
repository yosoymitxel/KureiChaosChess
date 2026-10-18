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
export const capturesKing = (pieces) => moves(pieces, 'light').some(({ m }) => m.hits.some((h) => h.type === 'king' && h.color === 'dark'));

// Jugada marfil que fuerza la captura del rey en n jugadas, o null.
export function solve(pieces, n) {
  for (const { p, m } of moves(pieces, 'light')) {
    const a = play(pieces, p, m);
    if (kingDead(a, 'dark')) continue;
    const replies = moves(a, 'dark');
    const holds = replies.every(({ p: q, m: k }) => {
      const b = play(a, q, k);
      if (kingDead(b, 'light')) return false;
      return n === 1 ? capturesKing(b) : !!solve(b, n - 1);
    });
    if (replies.length && holds) return { p, m };
  }
  return null;
}

// La defensa carmesí: una respuesta que no deje capturable al rey si existe; si no, cualquiera.
export function defend(pieces, n) {
  const all = moves(pieces, 'dark');
  const ok = all.filter(({ p, m }) => { const b = play(pieces, p, m); return !(n <= 1 ? capturesKing(b) : solve(b, n - 1)); });
  return (ok.length ? ok : all)[0] || null;
}
