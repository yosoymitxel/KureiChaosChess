// Tactic cards: single-use abilities played from the hand during a match (one per turn, free action).
// Each card says what it can target (`can`) so the rules never break: e.g. only rooks and guards
// can become a Colossus, and only if the tile behind them is free.
import { mulberry32 } from '../core/rng.js';
import { cellsOf, key, walkable, legalMoves, moveCells } from './rules.js';
import { makePiece } from './generate.js';
import { crownable, crown } from './crown.js';
import { t, localize } from '../i18n/index.js';

const behind = (p) => (p.color === 'light' ? 1 : -1);
const occupiedBy = (m, r, c) => m.pieces.find((p) => cellsOf(p).some(([a, b]) => a === r && b === c));
const freeTile = (m, r, c) => walkable(m.board, r, c) && !occupiedBy(m, r, c);
// A colossus grows backwards when there is room, otherwise forwards; undefined if neither tile is free.
const guardBeside = (m, p) => m.pieces.find((g) => g.type === 'guard' && g.color === p.color && !g.royal && Math.abs(g.row - p.row) + Math.abs(g.col - p.col) === 1);
const growDir = (m, p) => [behind(p), -behind(p)].find((d) => freeTile(m, p.row + d, p.col));

export const CARDS = localize('cards', {
  colossus: {
    id: 'colossus', aim: 'Elige una torre o guardia con una casilla libre detrás o delante.', name: 'Coloso', rarity: 'rare', icon: 'rook', target: 'piece',
    desc: 'Una torre o guardia crece a 2×1 (hacia atrás si cabe): conserva su movimiento y suma el del rey, aplasta lo que pisa y aguanta 2 golpes.',
    can: (m, p) => !p.royal && !p.boss && (p.type === 'rook' || p.type === 'guard') && (p.h || 1) === 1 && growDir(m, p) != null,
    apply: (m, p) => {
      if (growDir(m, p) < 0) p.row -= 1; // the anchor is the top cell of the footprint
      // Suma el paso de rey a lo que ya hacía: la torre sigue siendo torre.
      const moves = [...new Set([...(p.moves || [p.type]), 'king'])];
      Object.assign(p, { h: 2, w: 1, moves, hp: 2, maxHp: 2, name: 'Coloso', colossus: true }); // 3 golpes ganaban el 78 % (tools/balance.mjs)
    },
  },
  ascend: {
    id: 'ascend', aim: 'Elige un peón, guardia o consejero en las 3 últimas filas.', name: 'Ascenso', rarity: 'common', icon: 'queen', target: 'piece',
    desc: 'Corona ya a un peón (reina), guardia o consejero que esté a 3 filas o menos del final.',
    // Antes valía desde medio tablero; ahora pide llegar cerca del final, como la coronación.
    can: (m, p) => crownable(p) && (p.color === 'light' ? p.row : m.board.rows - 1 - p.row) < 3,
    apply: (m, p) => { crown(p); p.ascended = true; },
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
  invoke: {
    id: 'invoke', aim: 'Elige una casilla vacía de tus dos últimas filas.', name: 'Invocación', rarity: 'rare', icon: 'scroll', target: 'tile',
    desc: 'Entra una pieza al azar en tus dos últimas filas: peón (lo más común), caballo, alfil o torre (lo más raro).',
    can: (m, r, c) => (m.player.color === 'light' ? r >= m.board.rows - 2 : r <= 1) && freeTile(m, r, c),
    apply: (m, r, c, rng = Math.random) => {
      const roll = rng(), type = roll < 0.45 ? 'pawn' : roll < 0.7 ? 'knight' : roll < 0.9 ? 'bishop' : 'rook';
      const p = makePiece(type, m.player.color, r, c); m.pieces.push(p); return p;
    },
  },
  haste: {
    id: 'haste', name: 'Paso doble', rarity: 'rare', icon: 'boot', target: 'none',
    desc: 'Este turno haces un movimiento más, pero ese no puede capturar.',
    apply: (m) => { m.turnBonus = (m.turnBonus || 0) + 1; },
  },
  wings: {
    id: 'wings', aim: 'Elige una pieza que no sea rey, reina ni alfil.', name: 'Alas', rarity: 'common', icon: 'bishop', target: 'piece',
    desc: 'Una pieza (no rey, reina ni alfil) suma hasta 2 pasos en diagonal esta partida.',
    can: (m, p) => !p.royal && !p.boss && !['bishop', 'queen'].includes(p.type) && !(p.extraMoveTypes || []).includes('bishop2') && !p.moves,
    apply: (m, p) => { p.extraMoveTypes = [...(p.extraMoveTypes || []), 'bishop2']; },
  },
  retreat: {
    id: 'retreat', aim: 'Elige un peón.', name: 'Retirada', rarity: 'common', icon: 'pawn', target: 'piece',
    desc: 'Un peón aprende a retroceder 1 casilla (sin capturar) esta partida.',
    can: (m, p) => p.type === 'pawn' && !(p.extraMoveTypes || []).includes('pawnBack'),
    apply: (m, p) => { p.extraMoveTypes = [...(p.extraMoveTypes || []), 'pawnBack']; },
  },
  bridge: {
    id: 'bridge', aim: 'Elige un hueco del tablero.', name: 'Puente', rarity: 'common', icon: 'plain', target: 'tile',
    desc: 'Un hueco vuelve a ser suelo: abre un paso que estaba cortado.',
    can: (m, r, c) => m.board.holes.has(key(r, c)),
    apply: (m, r, c) => { m.board.holes.delete(key(r, c)); },
  },
  frost: {
    id: 'frost', aim: 'Elige una casilla vacía.', name: 'Escarcha', rarity: 'common', icon: 'ice', target: 'tile',
    desc: 'Una casilla vacía se congela: lo que entra resbala hasta chocar.',
    can: (m, r, c) => freeTile(m, r, c) && !m.board.terrain?.get(key(r, c)),
    apply: (m, r, c) => { (m.board.terrain ||= new Map()).set(key(r, c), 'ice'); },
  },
  // Lilas: guiños sin coste. No ocupan sitio en la mano (hasta 3 aparte) ni gastan la carta del turno.
  organize: {
    id: 'organize', name: 'Organizar', rarity: 'lilac', lilac: true, icon: 'swap', target: 'none', preMatch: true,
    desc: 'Se juega sola al empezar la próxima partida: intercambia de casilla de 2 a 8 parejas de tus piezas (más cuanto más grande el tablero).',
    apply: () => {},
  },
  disco: {
    id: 'disco', name: 'Disco', rarity: 'lilac', lilac: true, icon: 'checkers', target: 'none',
    desc: 'Luces de colores sobre el tablero el resto de la partida. No gasta tu carta del turno.',
    apply: () => ({ visual: 'disco' }),
  },
  skies: {
    id: 'skies', name: 'Cambio de clima', rarity: 'lilac', lilac: true, icon: 'drop', target: 'none',
    desc: 'Cambia el clima de la mesa por otro al azar. No gasta tu carta del turno.',
    apply: () => ({ visual: 'weather' }),
  },
  summon: {
    id: 'summon', aim: 'Elige una casilla vacía del centro.', name: 'Bruja aliada', rarity: 'lilac', lilac: true, icon: 'hunt', target: 'tile',
    desc: 'Una bruja dormida de tu bando: si una pieza rival la apunta, despierta y la caza.',
    can: (m, r, c) => r >= 2 && r < m.board.rows - 2 && freeTile(m, r, c) && !m.pieces.some((p) => p.witch && p.color === m.player.color),
    apply: (m, r, c) => {
      const p = makePiece('queen', m.player.color, r, c, { witch: true, name: t('piece.witch', 'Bruja'), moves: ['rook2', 'bishop2', 'knight'] }); m.pieces.push(p); return p;
    },
  },
  fuse: {
    id: 'fuse', aim: 'Elige una torre con un guardia tuyo al lado.', name: 'Escolta', rarity: 'lilac', lilac: true, icon: 'rook', target: 'piece',
    desc: 'El guardia pegado a una torre se une a ella: la torre suma su movimiento y aguanta un golpe más.',
    can: (m, p) => p.type === 'rook' && !p.boss && (p.h || 1) === 1 && !!guardBeside(m, p),
    apply: (m, p) => {
      const g = guardBeside(m, p);
      m.pieces.splice(m.pieces.indexOf(g), 1);
      p.extraMoveTypes = [...(p.extraMoveTypes || []), 'guard'];
      p.hp = (p.hp ?? 1) + 1; p.maxHp = (p.maxHp ?? 1) + 1;
      return g;
    },
  },
});
export const CARD_IDS = Object.keys(CARDS);
export const HAND_LIMIT = 5;
export const LILAC_LIMIT = 3;
// Las lilas llevan su propio cupo: ¿cabe `id` en la mano?
export const handFull = (cards, id) => {
  const lil = !!CARDS[id]?.lilac;
  return (cards || []).filter((c) => !!CARDS[c]?.lilac === lil).length >= (lil ? LILAC_LIMIT : HAND_LIMIT);
};
export const STARTER_CARDS = ['ascend', 'fortify', 'haste'];

export function pickCardChoices(seed, n = 3) {
  const rng = mulberry32(seed);
  const pool = CARD_IDS.flatMap((id) => (CARDS[id].rarity === 'common' ? [id, id] : [id]));
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
  card.apply({ ...m, pieces: [...m.pieces] }, copy);
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
  if (!card || card.preMatch || (m.cardUsed && !card.lilac) || m.over) return null;
  const res = { card };
  if (card.target === 'piece') {
    if (!target?.piece || target.piece.color !== m.player.color || !card.can(m, target.piece)) return null;
    res.removed = card.apply(m, target.piece) || null;
    res.piece = target.piece;
  } else if (card.target === 'tile') {
    if (!target || !card.can(m, target.row, target.col)) return null;
    res.cell = { row: target.row, col: target.col };
    res.spawned = card.apply(m, target.row, target.col);
  } else Object.assign(res, card.apply(m));
  if (!card.lilac) m.cardUsed = true;
  return res;
}
