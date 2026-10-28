// Tactic cards: single-use abilities played from the hand during a match (one per turn, free action).
// Each card says what it can target (`can`) so the rules never break: e.g. only rooks and guards
// can become a Colossus, and only if the tile behind them is free.
import { mulberry32 } from '../core/rng.js';
import { cellsOf, key, walkable, legalMoves, moveCells } from './rules.js';
import { makePiece } from './generate.js';
import { localize } from '../i18n/index.js';

const behind = (p) => (p.color === 'light' ? 1 : -1);
const occupiedBy = (m, r, c) => m.pieces.find((p) => cellsOf(p).some(([a, b]) => a === r && b === c));
const freeTile = (m, r, c) => walkable(m.board, r, c) && !occupiedBy(m, r, c);
// A colossus grows backwards when there is room, otherwise forwards; undefined if neither tile is free.
const growDir = (m, p) => [behind(p), -behind(p)].find((d) => freeTile(m, p.row + d, p.col));

export const CARDS = localize('cards', {
  colossus: {
    id: 'colossus', aim: 'Elige una torre o guardia con una casilla libre detrás o delante.', name: 'Coloso', rarity: 'rare', icon: 'rook', target: 'piece',
    desc: 'Una torre o guardia crece a 2×1 (hacia atrás si cabe): conserva su movimiento y suma el del rey, aplasta lo que pisa y aguanta 3 golpes.',
    can: (m, p) => !p.royal && !p.boss && (p.type === 'rook' || p.type === 'guard') && (p.h || 1) === 1 && growDir(m, p) != null,
    apply: (m, p) => {
      if (growDir(m, p) < 0) p.row -= 1; // the anchor is the top cell of the footprint
      // Suma el paso de rey a lo que ya hacía: la torre sigue siendo torre.
      const moves = [...new Set([...(p.moves || [p.type]), 'king'])];
      Object.assign(p, { h: 2, w: 1, moves, hp: 3, maxHp: 3, name: 'Coloso', colossus: true });
    },
  },
  ascend: {
    id: 'ascend', aim: 'Elige un peón que ya esté en campo rival.', name: 'Ascenso', rarity: 'common', icon: 'queen', target: 'piece',
    desc: 'Un peón que ya cruzó a campo rival se convierte en reina.',
    // Only past the middle: a queen on turn one shortened matches by a sixth (tools/balance.mjs).
    can: (m, p) => p.type === 'pawn' && (p.color === 'light' ? p.row < m.board.rows / 2 : p.row >= m.board.rows / 2),
    apply: (m, p) => { p.type = 'queen'; p.ascended = true; },
  },
  mount: {
    id: 'mount', aim: 'Elige una pieza que no sea rey, reina ni caballo.', name: 'Montura', rarity: 'common', icon: 'knight', target: 'piece',
    desc: 'Una pieza (no rey ni reina) aprende a saltar en L durante esta partida.',
    // No queens: queen + L jump covers almost the whole board (tools/balance.mjs).
    can: (m, p) => !p.royal && !p.boss && !['knight', 'queen'].includes(p.type) && !(p.extraMoveTypes || []).includes('knight') && !p.moves,
    apply: (m, p) => { p.extraMoveTypes = [...(p.extraMoveTypes || []), 'knight']; },
  },
  fortify: {
    id: 'fortify', aim: 'Elige una pieza sin escudo.', name: 'Fortificar', rarity: 'common', icon: 'shield', target: 'piece',
    desc: 'Una pieza aguanta un golpe más: el atacante rebota la primera vez.',
    can: (m, p) => !p.royal && !p.boss && (p.maxHp || 1) < 2,
    apply: (m, p) => { p.hp = 2; p.maxHp = 2; },
  },
  quake: {
    id: 'quake', aim: 'Elige una casilla vacía para hundirla.', name: 'Terremoto', rarity: 'rare', icon: 'collapse', target: 'tile',
    desc: 'Una casilla vacía se hunde para siempre. Corta rutas o encierra al rival.',
    can: (m, r, c) => freeTile(m, r, c),
    apply: (m, r, c) => { m.board.holes.add(key(r, c)); },
  },
  reinforce: {
    id: 'reinforce', aim: 'Elige una casilla vacía de tus dos últimas filas.', name: 'Refuerzo', rarity: 'common', icon: 'pawn', target: 'tile',
    desc: 'Un peón nuevo entra en una casilla vacía de tus dos últimas filas.',
    can: (m, r, c) => {
      const rows = m.board.rows, me = m.player.color;
      const back = me === 'light' ? r >= rows - 2 : r <= 1;
      return back && freeTile(m, r, c);
    },
    apply: (m, r, c) => { const p = makePiece('pawn', m.player.color, r, c); m.pieces.push(p); return p; },
  },
  haste: {
    id: 'haste', name: 'Paso doble', rarity: 'rare', icon: 'boot', target: 'none',
    desc: 'Este turno haces un movimiento más, pero ese no puede capturar.',
    apply: (m) => { m.turnBonus = (m.turnBonus || 0) + 1; },
  },
  organize: {
    id: 'organize', name: 'Organizar', rarity: 'common', icon: 'swap', target: 'none', preMatch: true,
    desc: 'Se juega sola al empezar la próxima partida: intercambia de casilla de 2 a 8 parejas de tus piezas (más cuanto más grande el tablero).',
    apply: () => {},
  },
});
export const CARD_IDS = Object.keys(CARDS);
export const HAND_LIMIT = 5;
export const STARTER_CARDS = ['ascend', 'fortify', 'haste'];

export function pickCardChoices(seed, n = 3) {
  const rng = mulberry32(seed);
  const pool = CARD_IDS.flatMap((id) => (CARDS[id].rarity === 'rare' ? [id] : [id, id]));
  const out = [];
  while (out.length < n) { const id = pool[Math.floor(rng() * pool.length)]; if (!out.includes(id)) out.push(id); }
  return out;
}

// Pieces or tiles a card can be played on right now.
export function cardTargets(m, card) {
  const me = m.player.color;
  if (card.target === 'piece') return m.pieces.filter((p) => p.color === me && card.can(m, p));
  if (card.target === 'tile') {
    const out = [];
    for (let r = 0; r < m.board.rows; r++) for (let c = 0; c < m.board.cols; c++) if (card.can(m, r, c)) out.push({ row: r, col: c });
    return out;
  }
  return [];
}

// What the piece could do after the card: legal-move cells of a hypothetical copy.
export function previewMoves(m, card, piece) {
  const copy = { ...piece, extraMoveTypes: [...(piece.extraMoveTypes || [])], moves: piece.moves && [...piece.moves] };
  card.apply({ ...m, pieces: m.pieces }, copy);
  const pieces = m.pieces.map((p) => (p === piece ? copy : p));
  return {
    cells: moveCells(copy, legalMoves(copy, pieces, m.board)),
    before: moveCells(piece, legalMoves(piece, m.pieces, m.board)),
    footprint: cellsOf(copy).map(([r, c]) => key(r, c)),
  };
}

// Plays a card for the current player. Returns a result for the view, or null if not allowed.
export function playCard(m, id, target) {
  const card = CARDS[id];
  if (!card || card.preMatch || m.cardUsed || m.over) return null;
  const res = { card };
  if (card.target === 'piece') {
    if (!target?.piece || target.piece.color !== m.player.color || !card.can(m, target.piece)) return null;
    card.apply(m, target.piece);
    res.piece = target.piece;
  } else if (card.target === 'tile') {
    if (!target || !card.can(m, target.row, target.col)) return null;
    res.cell = { row: target.row, col: target.col };
    res.spawned = card.apply(m, target.row, target.col);
  } else card.apply(m);
  m.cardUsed = true;
  return res;
}
