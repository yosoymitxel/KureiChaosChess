// Movement rules. Pure functions, no DOM.
// Every piece has an anchor (row, col = top-left) and a footprint of h×w cells (1×1 by default).
// Multi-cell pieces (bosses) move their anchor; the destination footprint must be free of
// holes and allies, and every enemy inside it is hit.

export const key = (r, c) => r + ',' + c;
export const sizeOf = (p) => [p.h || 1, p.w || 1];

export function cellsOf(p, r = p.row, c = p.col) {
  const [h, w] = sizeOf(p);
  const out = [];
  for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) out.push([r + i, c + j]);
  return out;
}

export function buildOccupancy(pieces) {
  const occ = new Map();
  for (const p of pieces) for (const [r, c] of cellsOf(p)) occ.set(key(r, c), p);
  return occ;
}

export const ctxOf = (pieces, board) => ({ pieces, board, occ: buildOccupancy(pieces) });
const inBounds = (b, r, c) => r >= 0 && r < b.rows && c >= 0 && c < b.cols;
export const walkable = (b, r, c) => inBounds(b, r, c) && !b.holes.has(key(r, c));

// Protected pieces cannot be hit yet:
//  trait 'last'  -> only once it is the last non-royal piece of its side;
//  escort: id    -> only after the escorting piece has fallen.
export function immune(p, pieces) {
  if (p.trait === 'last') return pieces.some((o) => o !== p && o.color === p.color && !o.royal);
  if (p.escort) return pieces.some((o) => o.id === p.escort);
  return false;
}

// Enemies hit if `piece` lands with its anchor at (r, c); null if it cannot land there.
export function landing(piece, r, c, ctx) {
  const hits = [];
  for (const [rr, cc] of cellsOf(piece, r, c)) {
    if (!walkable(ctx.board, rr, cc)) return null;
    const o = ctx.occ.get(key(rr, cc));
    if (!o || o === piece) continue;
    if (o.color === piece.color || immune(o, ctx.pieces)) return null;
    if (!hits.includes(o)) hits.push(o);
  }
  return hits;
}

// Footprint at (r, c) is walkable and empty (ignoring the piece itself).
function free(piece, r, c, ctx) {
  for (const [rr, cc] of cellsOf(piece, r, c)) {
    if (!walkable(ctx.board, rr, cc)) return false;
    const o = ctx.occ.get(key(rr, cc));
    if (o && o !== piece) return false;
  }
  return true;
}

function pathClear(piece, tr, tc, ctx) {
  const sr = Math.sign(tr - piece.row), sc = Math.sign(tc - piece.col);
  let r = piece.row + sr, c = piece.col + sc;
  while (r !== tr || c !== tc) {
    if (!free(piece, r, c, ctx)) return false;
    r += sr; c += sc;
  }
  return true;
}

const forward = (p) => (p.color === 'light' ? -1 : 1);

function canMoveAs(piece, type, tr, tc, ctx) {
  const hits = landing(piece, tr, tc, ctx);
  if (!hits) return false;
  const hit = hits.length > 0;
  const dr = tr - piece.row, dc = tc - piece.col;
  const adr = Math.abs(dr), adc = Math.abs(dc);
  if (!adr && !adc) return false;
  switch (type) {
    case 'pawn': {
      const dir = forward(piece);
      const start = piece.startRow ?? (piece.color === 'light' ? ctx.board.rows - 2 : 1);
      if (dc === 0 && dr === dir) return !hit;
      if (dc === 0 && dr === 2 * dir && piece.row === start) return !hit && free(piece, piece.row + dir, piece.col, ctx);
      return adc === 1 && dr === dir && hit;
    }
    case 'pawnBack': return dc === 0 && dr === -forward(piece) && !hit;
    case 'guard': return adr <= 1 && adc <= 1 && !(dr === -forward(piece) && dc === 0);
    case 'advisor': return adr === 1 && adc === 1;
    case 'elephant': return adr === 2 && adc === 2;
    case 'camel': return (adr === 3 && adc === 1) || (adr === 1 && adc === 3);
    case 'knight': return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);
    case 'king': return adr <= 1 && adc <= 1;
    case 'bishop': return adr === adc && pathClear(piece, tr, tc, ctx);
    case 'rook': return (!dr || !dc) && pathClear(piece, tr, tc, ctx);
    case 'rook2': return (!dr || !dc) && adr + adc <= 2 && pathClear(piece, tr, tc, ctx);
    case 'queen': return (!dr || !dc || adr === adc) && pathClear(piece, tr, tc, ctx);
    case 'cannon': {
      if (dr && dc) return false;
      if (adr + adc > 4 + (piece.cannonRangeBonus || 0)) return false;
      let screens = 0;
      const sr = Math.sign(dr), sc = Math.sign(dc);
      for (let r = piece.row + sr, c = piece.col + sc; r !== tr || c !== tc; r += sr, c += sc) {
        if (!walkable(ctx.board, r, c)) return false;
        if (ctx.occ.get(key(r, c))) screens++;
      }
      return screens === 0 ? !hit : screens === 1 && hit;
    }
  }
  return false;
}

export function moveTypesOf(p) {
  return [...(p.moves || [p.type]), ...(p.extraMoveTypes || [])];
}

function canMove(piece, r, c, ctx) {
  return moveTypesOf(piece).some((t) => canMoveAs(piece, t, r, c, ctx));
}

export function pieceCanMove(piece, r, c, pieces, board) {
  return canMove(piece, r, c, ctxOf(pieces, board));
}

export function legalMoves(piece, pieces, board, ctx = ctxOf(pieces, board)) {
  const [h, w] = sizeOf(piece);
  const moves = [];
  for (let r = 0; r <= board.rows - h; r++)
    for (let c = 0; c <= board.cols - w; c++)
      if (canMove(piece, r, c, ctx)) moves.push({ row: r, col: c, hits: landing(piece, r, c, ctx) });
  return moves;
}

export function hasAnyLegalMove(pieces, color, board) {
  const ctx = ctxOf(pieces, board);
  return pieces.some((p) => p.color === color && legalMoves(p, pieces, board, ctx).length > 0);
}

// Own pieces that some enemy could hit next move: the non-royal ones, or only the royal (check).
export function threatenedPieces(pieces, color, board, { royal = false } = {}) {
  const ctx = ctxOf(pieces, board);
  const out = new Set();
  for (const e of pieces) {
    if (e.color === color) continue;
    for (const m of legalMoves(e, pieces, board, ctx))
      for (const v of m.hits) if (v.color === color && !!v.royal === royal) out.add(v);
  }
  return out;
}

// Cells covered by a set of anchor moves (what to highlight for a multi-cell piece).
export function moveCells(piece, moves) {
  const s = new Set();
  for (const m of moves) for (const [r, c] of cellsOf(piece, m.row, m.col)) s.add(key(r, c));
  return s;
}

// Which anchor to use when the player taps cell (r, c) for a multi-cell piece:
// the legal anchor whose footprint covers the cell, closest to the current anchor.
export function anchorForCell(piece, r, c, moves) {
  const [h, w] = sizeOf(piece);
  let best = null, bestD = Infinity;
  for (const m of moves) {
    if (r < m.row || r >= m.row + h || c < m.col || c >= m.col + w) continue;
    const d = Math.abs(m.row - piece.row) + Math.abs(m.col - piece.col);
    if (d < bestD) { best = m; bestD = d; }
  }
  return best;
}
