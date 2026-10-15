// Match state: turns, moves, captures, boss HP, collapse, end of game.
// Mutates its own state and returns plain "result" objects that the view animates.
import { legalMoves, landing, buildOccupancy, hasAnyLegalMove, threatenedPieces, key } from './rules.js';
import { countMutations } from '../data/mutations.js';
import { PIECE_VALUE } from '../data/pieces.js';

// Turns per player without a capture before the game is decided on piece count.
export const QUIET_LIMIT = 20;

export class Match {
  constructor({ board, pieces, players, modifier, mutations, bonuses }) {
    Object.assign(this, { board, pieces, players, modifier });
    this.current = 0;
    this.movesThisTurn = 0;
    this.turn = 0;
    this.eliminated = {};
    this.over = null;
    this.quietTurns = 0; // turns without any hit; ends stalled games
    const fury = Math.min(3, countMutations(mutations || []).fury || 0) + (bonuses?.furyNow ? 1 : 0);
    this.bonusMoves = { light: fury };
  }

  get player() { return this.players[this.current]; }
  movesFor(color) { return (this.modifier === 'rush' ? 2 : 1) + (this.bonusMoves[color] || 0); }
  legal(piece) { return legalMoves(piece, this.pieces, this.board); }
  pieceAt(r, c) { return buildOccupancy(this.pieces).get(key(r, c)) || null; }
  threats(color = this.player.color) { return threatenedPieces(this.pieces, color, this.board); }
  inCheck(color) { return !this.eliminated[color] && threatenedPieces(this.pieces, color, this.board, { royal: true }).size > 0; }
  canMove(color = this.player.color) { return hasAnyLegalMove(this.pieces, color, this.board); }

  // Apply a move. Returns null if illegal.
  move(piece, to) {
    if (this.over || piece.color !== this.player.color) return null;
    const ok = this.legal(piece).some((m) => m.row === to.row && m.col === to.col);
    if (!ok) return null;
    const occ = buildOccupancy(this.pieces);
    const hits = landing(piece, to.row, to.col, { board: this.board, occ });
    const from = { row: piece.row, col: piece.col };
    const victims = hits.map((v) => {
      v.hp = (v.hp ?? 1) - 1;
      return { piece: v, killed: v.hp <= 0 };
    });
    const bounced = victims.some((v) => !v.killed);
    for (const v of victims) {
      if (!v.killed) continue;
      this.pieces.splice(this.pieces.indexOf(v.piece), 1);
      if (v.piece.royal) this.eliminated[v.piece.color] = true;
    }
    if (!bounced) { piece.row = to.row; piece.col = to.col; }
    let promoted = false;
    if (!bounced && piece.type === 'pawn' && (this.modifier === 'promote' || piece.canCrown)) {
      const last = piece.color === 'light' ? 0 : this.board.rows - 1;
      if (piece.row === last) { piece.type = 'queen'; promoted = true; }
    }
    this.movesThisTurn++;
    if (victims.length) this.quietTurns = 0;
    return { piece, from, to, victims, bounced, promoted };
  }

  // Called after the view finished animating a move (or when a player must pass).
  // Returns { ended, collapse?, over? }.
  afterMove({ pass = false } = {}) {
    if (this.checkOver()) return { ended: true, over: this.over };
    if (!pass && this.movesThisTurn < this.movesFor(this.player.color) && this.canMove()) return { ended: false };
    this.movesThisTurn = 0;
    this.turn++;
    this.quietTurns++;
    const collapse = this.modifier === 'chaos' && this.turn % 3 === 0 ? this.collapse() : null;
    let next = this.current;
    do next = (next + 1) % this.players.length; while (this.eliminated[this.players[next].color] && next !== this.current);
    this.current = next;
    if (this.checkOver()) return { ended: true, collapse, over: this.over };
    return { ended: true, collapse };
  }

  // Two edge tiles (mirrored when possible) fall into the void.
  collapse() {
    const { rows, cols, holes } = this.board;
    const occ = buildOccupancy(this.pieces);
    const cand = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (Math.min(r, rows - 1 - r) > 1 && Math.min(c, cols - 1 - c) > 1) continue;
      if (!holes.has(key(r, c)) && !occ.has(key(r, c))) cand.push([r, c]);
    }
    if (!cand.length) return null;
    const [r, c] = cand.splice(Math.floor(Math.random() * cand.length), 1)[0];
    const cells = [[r, c]];
    const mirror = cand.findIndex(([a, b]) => a === rows - 1 - r && b === cols - 1 - c);
    if (mirror >= 0) cells.push(cand[mirror]);
    else if (cand.length) cells.push(cand[Math.floor(Math.random() * cand.length)]);
    for (const [a, b] of cells) holes.add(key(a, b));
    return cells;
  }

  checkOver() {
    if (this.over) return true;
    const alive = this.players.filter((p) => !this.eliminated[p.color]);
    const royals = this.pieces.filter((p) => p.royal && !this.eliminated[p.color]);
    const stalled = this.quietTurns >= QUIET_LIMIT * this.players.length;
    if (alive.length <= 1 || royals.length <= 1 || stalled || !alive.some((p) => this.canMove(p.color))) {
      this.over = this.result(alive, royals);
      return true;
    }
    return false;
  }

  result(alive, royals) {
    const humans = this.players.filter((p) => p.kind === 'human').map((p) => p.color);
    const win = (color) => ({ victory: humans.includes(color), winnerName: this.players.find((p) => p.color === color)?.name });
    if (!alive.length) return { tie: true };
    if (alive.length === 1) return win(alive[0].color);
    if (royals.length === 1) return win(royals[0].color);
    if (!royals.length) return { tie: true };
    const count = (c) => this.pieces.filter((p) => p.color === c).length;
    const best = Math.max(...alive.map((p) => count(p.color)));
    const top = alive.filter((p) => count(p.color) === best);
    return top.length > 1 ? { tie: true } : win(top[0].color);
  }
}

// Greedy bot: captures by value, centralisation, pressure on the enemy royal.
export function botChooseMove(match) {
  const { pieces, board } = match;
  const color = match.player.color;
  const mine = pieces.filter((p) => p.color === color);
  const royal = pieces.find((p) => p.royal && p.color !== color);
  let best = null;
  for (const p of mine) {
    if (p.royal && !p.boss && mine.length > 2) continue;
    for (const m of match.legal(p)) {
      let score = Math.random() * 4;
      for (const v of m.hits) score += v.royal ? 1000 : PIECE_VALUE[v.type] || 20;
      score += Math.max(board.rows, board.cols) - (Math.abs(m.row - (board.rows - 1) / 2) + Math.abs(m.col - (board.cols - 1) / 2));
      if (royal) score += Math.max(0, 10 - (Math.abs(m.row - royal.row) + Math.abs(m.col - royal.col)));
      if (p.boss) score += m.hits.length * 15; // bosses love stomping
      if (!best || score > best.score) best = { piece: p, target: { row: m.row, col: m.col }, score };
    }
  }
  return best;
}

