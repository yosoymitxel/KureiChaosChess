// Match state: turns, moves, captures, boss HP, collapse, end of game.
// Mutates its own state and returns plain "result" objects that the view animates.
import { legalMoves, landing, buildOccupancy, hasAnyLegalMove, threatenedPieces, key, cellsOf, walkable, portalAt } from './rules.js';
import { countMutations } from '../data/mutations.js';
import { PIECE_VALUE } from '../data/pieces.js';
import { RIVALS } from './difficulty.js';

// Turns per player without a capture before the game is decided on piece count.
export const QUIET_LIMIT = 20;

export class Match {
  // `objective(match)` (minijuegos de src/data/scenarios.js) reemplaza el fin de partida por rey
  // caído: devuelve { victory, note } cuando la partida termina, o null.
  // `bonus(match)`: jugadas extra sin captura del turno que empieza (El guardaespaldas).
  constructor({ board, pieces, players, modifier, mutations, bonuses, rival, rivals, objective, bonus }) {
    Object.assign(this, { board, pieces, players, modifier, rival, rivals, objective, bonus });
    this.current = 0;
    this.movesThisTurn = 0;
    this.turn = 0;
    this.eliminated = {};
    this.over = null;
    this.quietTurns = 0; // turns without any hit; ends stalled games
    const fury = Math.min(3, countMutations(mutations || []).fury || 0) + (bonuses?.furyNow ? 1 : 0);
    this.bonusMoves = { light: fury };
    this.turnBonus = bonus?.(this) || 0;
  }

  get player() { return this.players[this.current]; }
  movesFor(color) { return (this.modifier === 'rush' ? 2 : 1) + (this.bonusMoves[color] || 0) + (color === this.player.color ? this.turnBonus || 0 : 0); }
  // The extra move from Paso doble cannot capture: a free second capture ended matches too
  // fast (tools/balance.mjs).
  quietOnly() { return this.turnBonus > 0 && this.movesThisTurn >= this.movesFor(this.player.color) - this.turnBonus; }
  legal(piece) {
    const all = [...legalMoves(piece, this.pieces, this.board), ...this.special(piece)];
    return piece.color === this.player.color && this.quietOnly() ? all.filter((m) => !m.hits.length) : all;
  }

  // Ajedrez de siempre: captura al paso y enroque. Van aquí y no en las reglas porque piden
  // historia: el último doble paso de peón y qué rey o torre ya se movió.
  special(piece) {
    const out = [], occ = buildOccupancy(this.pieces);
    const open = (r, c) => walkable(this.board, r, c) && !occ.get(key(r, c));
    const ep = this.ep, dir = piece.color === 'light' ? -1 : 1;
    if (piece.type === 'pawn' && !piece.moves && ep && ep.pawn.color !== piece.color && this.pieces.includes(ep.pawn)
      && ep.row === piece.row + dir && Math.abs(ep.col - piece.col) === 1 && open(ep.row, ep.col))
      out.push({ row: ep.row, col: ep.col, hits: [ep.pawn], ep: true });
    if (piece.type === 'king' && piece.royal && !piece.boss && !piece.moved && !this.inCheck(piece.color)) {
      for (const rook of this.pieces) {
        if (rook.color !== piece.color || rook.type !== 'rook' || rook.moved || rook.row !== piece.row) continue;
        const s = Math.sign(rook.col - piece.col);
        if (Math.abs(rook.col - piece.col) < 3) continue;
        let clear = true;
        for (let c = piece.col + s; c !== rook.col; c += s) if (!open(piece.row, c)) clear = false;
        // El rey no enroca a través de una casilla atacada.
        if (!clear || [1, 2].some((k) => this.attacked(piece, piece.row, piece.col + k * s))) continue;
        out.push({ row: piece.row, col: piece.col + 2 * s, hits: [], castle: { rook, col: piece.col + s } });
      }
    }
    return out;
  }
  attacked(king, row, col) {
    const virtual = this.pieces.filter((p) => p !== king).concat([{ ...king, row, col }]);
    return threatenedPieces(virtual, king.color, this.board, { royal: true }).size > 0;
  }
  pieceAt(r, c) { return buildOccupancy(this.pieces).get(key(r, c)) || null; }
  threats(color = this.player.color) { return threatenedPieces(this.pieces, color, this.board); }
  inCheck(color) { return !this.eliminated[color] && threatenedPieces(this.pieces, color, this.board, { royal: true }).size > 0; }
  canMove(color = this.player.color) {
    if (color === this.player.color && this.quietOnly()) return this.pieces.some((p) => p.color === color && this.legal(p).length);
    return hasAnyLegalMove(this.pieces, color, this.board);
  }

  // Apply a move. Returns null if illegal.
  move(piece, to) {
    if (this.over || piece.color !== this.player.color) return null;
    const m = this.legal(piece).find((x) => x.row === to.row && x.col === to.col);
    if (!m) return null;
    const occ = buildOccupancy(this.pieces);
    const hits = m.ep ? m.hits : landing(piece, to.row, to.col, { board: this.board, occ, pieces: this.pieces });
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
    const res = { piece, from, to, victims, bounced, promoted: false };
    if (!bounced) {
      piece.row = to.row; piece.col = to.col;
      piece.moved = true;
      if (m.castle) {
        const rook = m.castle.rook;
        res.castle = { rook, from: { row: rook.row, col: rook.col }, to: { row: rook.row, col: m.castle.col } };
        rook.col = m.castle.col; rook.moved = true;
      }
      if (m.ep) res.enPassant = true;
      // Disfrazada: un paso de rey no la delata; cualquier otro movimiento sí.
      if (piece.disguise && !piece.unmasked && Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col)) > 1) piece.unmasked = res.unmasked = true;
      // Plaga zombi: el peón derribado se levanta en la casilla que dejó el atacante, para su bando.
      // Un zombi que cae ya no vuelve.
      if (this.modifier === 'zombie') {
        const risen = victims.find((v) => v.killed && v.piece.type === 'pawn' && !v.piece.zombie && !v.piece.royal);
        if (risen) {
          const z = { ...risen.piece, id: risen.piece.id + '-z', color: piece.color, row: from.row, col: from.col, hp: 1, zombie: true, moved: true, startRow: -1, extraMoveTypes: undefined, mutationExtras: undefined, canCrown: false };
          this.pieces.push(z);
          res.zombie = z;
        }
      }
      res.absorbed = this.absorb(piece, victims);
      this.terrainAfterMove(piece, from, res);
    }
    if (!bounced && piece.type === 'pawn' && (this.modifier === 'promote' || piece.canCrown)) {
      const last = piece.color === 'light' ? 0 : this.board.rows - 1;
      if (piece.row === last) { piece.type = 'queen'; res.promoted = true; }
    }
    // El doble paso de un peón deja su casilla de paso abierta a la captura en la jugada siguiente.
    this.ep = !bounced && piece.type === 'pawn' && Math.abs(to.row - from.row) === 2 ? { row: (from.row + to.row) / 2, col: from.col, pawn: piece } : null;
    this.movesThisTurn++;
    if (victims.length) this.quietTurns = 0;
    return res;
  }

  // Devourer-type bosses learn the movement of every piece they crush (up to 4 patterns).
  absorb(piece, victims) {
    if (!piece.absorb) return [];
    const learned = [];
    for (const v of victims) {
      if (!v.killed) continue;
      for (const t of [...(v.piece.moves || [v.piece.type]), ...(v.piece.extraMoveTypes || [])]) {
        if (piece.moves.length >= 4 || piece.moves.includes(t) || t === 'pawn' || t === 'pawnBack') continue;
        piece.moves.push(t); learned.push(t);
      }
    }
    return learned;
  }

  // Ice: a 1×1 piece keeps sliding one tile in its direction. Portal: it reappears at the twin portal.
  terrainAfterMove(piece, from, res) {
    const t = this.board.terrain;
    if (!t || piece.h > 1 || piece.w > 1) return;
    const occupied = (r, c) => this.pieces.some((p) => p !== piece && cellsOf(p).some(([a, b]) => a === r && b === c));
    if (t.get(key(piece.row, piece.col)) === 'ice') {
      const r = piece.row + Math.sign(piece.row - from.row), c = piece.col + Math.sign(piece.col - from.col);
      if (walkable(this.board, r, c) && !occupied(r, c)) { piece.row = r; piece.col = c; res.slide = { row: r, col: c }; }
    }
    const portal = portalAt(this.board, piece.row, piece.col);
    if (portal) {
      const [r, c] = portal.to.split(',').map(Number);
      if (!occupied(r, c)) { res.portal = { from: { row: piece.row, col: piece.col }, to: { row: r, col: c } }; piece.row = r; piece.col = c; }
    }
    // Suelo que se hunde (El laboratorio): la casilla que dejan tus piezas cae.
    if (this.board.sinking === piece.color) { this.board.holes.add(key(from.row, from.col)); res.sunk = [from.row, from.col]; }
    // Mina oculta (Campo minado): estalla, se lleva la pieza y deja un hueco.
    const k = key(piece.row, piece.col);
    if (this.board.mines?.has(k)) {
      this.board.mines.delete(k);
      this.board.holes.add(k);
      this.pieces.splice(this.pieces.indexOf(piece), 1);
      if (piece.royal) this.eliminated[piece.color] = true;
      res.mine = { row: piece.row, col: piece.col };
    }
  }

  // Called after the view finished animating a move (or when a player must pass).
  // Returns { ended, collapse?, over? }.
  afterMove({ pass = false } = {}) {
    if (this.checkOver()) return { ended: true, over: this.over };
    if (!pass && this.movesThisTurn < this.movesFor(this.player.color) && this.canMove()) return { ended: false };
    this.movesThisTurn = 0;
    this.turnBonus = 0;
    this.cardUsed = false;
    this.turn++;
    this.quietTurns++;
    const collapse = this.modifier === 'chaos' && this.turn % 3 === 0 ? this.collapse() : null;
    let next = this.current;
    do next = (next + 1) % this.players.length; while (this.eliminated[this.players[next].color] && next !== this.current);
    this.current = next;
    this.turnBonus = this.bonus?.(this) || 0;
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
    if (this.objective) return !!(this.over = this.objective(this));
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

// La pieza enemiga más barata que podría comer en la casilla si mi pieza queda ahí. Se mira la
// posición ya movida: la pieza que se va no tapa la línea, el hueco que deja una captura tampoco,
// y los peones ven en diagonal aunque la casilla esté vacía. El perfil "maestro" no cuelga piezas.
function cheapestAttacker(match, mover, row, col, hits) {
  const virtual = match.pieces.filter((p) => p !== mover && !hits.includes(p)).concat([{ ...mover, row, col }]);
  const enemies = virtual.filter((p) => p.color !== mover.color);
  enemies.sort((a, b) => (PIECE_VALUE[a.type] || 20) - (PIECE_VALUE[b.type] || 20));
  for (const e of enemies) {
    for (const m of legalMoves(e, virtual, match.board)) {
      if (m.row === row && m.col === col) return PIECE_VALUE[e.type] || 20;
    }
  }
  return null;
}

// Greedy bot: captures by value, centralisation, pressure on the enemy royal. The rival profile
// (difficulty.js) dials what it sees, what it protects and how often it blunders.
export function botChooseMove(match) {
  const { pieces, board } = match;
  const R = match.rivals?.[match.player.color] || match.rival || RIVALS.oficial;
  const color = match.player.color;
  const mine = pieces.filter((p) => p.color === color);
  const royal = pieces.find((p) => p.royal && p.color !== color);
  const options = [];
  for (const p of mine) {
    if (p.royal && !p.boss && mine.length > 2) continue;
    for (const m of match.legal(p)) {
      let score = Math.random() * R.noise;
      for (const v of m.hits) score += v.royal ? 1000 : (PIECE_VALUE[v.type] || 20) * R.capture;
      score += Math.max(board.rows, board.cols) - (Math.abs(m.row - (board.rows - 1) / 2) + Math.abs(m.col - (board.cols - 1) / 2));
      if (royal && R.pressure) score += R.pressure * Math.max(0, 10 - (Math.abs(m.row - royal.row) + Math.abs(m.col - royal.col)));
      if (p.boss) score += m.hits.length * 15; // bosses love stomping
      // Peón que quiere coronar (La cacería): cuanto más cerca del fondo, mejor.
      if (R.advance && p.type === 'pawn') score += R.advance * (p.color === 'light' ? board.rows - 1 - m.row : m.row);
      if (R.care) {
        const attacker = cheapestAttacker(match, p, m.row, m.col, m.hits);
        if (attacker != null) score -= R.care * Math.max(0, (PIECE_VALUE[p.type] || 20) - attacker);
      }
      options.push({ piece: p, target: { row: m.row, col: m.col }, score });
    }
  }
  if (!options.length) return null;
  if (R.blunder && Math.random() < R.blunder) return options[Math.floor(Math.random() * options.length)];
  return options.reduce((best, o) => (o.score > best.score ? o : best));
}

