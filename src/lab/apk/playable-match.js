import { animate } from 'animejs';
import { Match, botChooseMove } from '../../game/match.js';
import { key } from '../../game/rules.js';
import { playAPKFall, playAPKDamage, playAPKVictory } from './effects.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export function createAPKPlayableMatch({
  board, pieces, view, boardFrame, say, stats, onGameOver, botDelay = 180,
  players, modifier, objective, bonus, tick, configureMatch, beforeMove, onMove, onTransition,
}) {
  const match = new Match({
    board,
    pieces,
    players: players || [
      { color: 'light', kind: 'human', name: 'Tú' },
      { color: 'dark', kind: 'bot', name: 'Rival' },
    ],
    modifier, objective, bonus, tick,
  });
  configureMatch?.(match);
  let selected = null;
  let busy = false;
  let destroyed = false;
  let finished = false;

  function clearSelection() {
    selected = null;
    view?.clearMarks();
  }

  function finish(result) {
    if (finished || destroyed) return;
    finished = true;
    clearSelection();
    if (result?.tie) {
      say('Empate. Reinicia para jugar otra partida.');
      stats('Partida terminada · Empate');
    } else if (result?.victory) {
      say('¡Victoria! Capturaste el rey rival.');
      stats('Partida terminada · Victoria');
      void playAPKVictory(boardFrame, view, ['#ffc83d', '#fff2bd', '#3dff8e']);
    } else {
      say('Derrota. El rival capturó tu rey.');
      stats('Partida terminada · Derrota');
    }
    onGameOver?.(result, match);
  }

  function refresh() {
    if (destroyed || finished) return;
    const player = match.player;
    const mine = match.pieces.filter(p => p.color === player.color).length;
    const theirs = match.pieces.filter(p => p.color !== player.color).length;
    if (player.kind === 'human') {
      say(selected ? 'Pieza seleccionada. Toca un destino marcado.' : 'Tu turno: toca una pieza marfil y después un destino marcado.');
    } else {
      say('Turno del rival…');
    }
    stats('Turno ' + (match.turn + 1) + ' · Piezas propias: ' + mine + ' · Rivales: ' + theirs);
  }

  async function animatePiece(piece) {
    const st = view?.state.get(piece);
    if (!st) return;
    await animate(st, {
      r: piece.row,
      c: piece.col,
      z: [st.z || 0, view.sq * .24, 0],
      duration: view.d(230),
      ease: 'outCubic',
      onUpdate: () => view.apply(piece),
    });
    st.r = piece.row;
    st.c = piece.col;
    st.z = 0;
    view.apply(piece);
  }

  async function animateMove(result) {
    for (const victim of result.victims || []) {
      const piece = victim.piece;
      if (victim.killed) {
        await playAPKFall(boardFrame, view, { row: piece.row, col: piece.col });
        view.els.get(piece)?.remove();
        view.els.delete(piece);
        view.state.delete(piece);
      } else {
        view.remake(piece);
        await playAPKDamage(boardFrame, view, { row: piece.row, col: piece.col }, 'gold');
      }
    }
    if (!result.bounced) {
      await animatePiece(result.piece);
      if (result.castle) await animatePiece(result.castle.rook);
      if (result.promoted) view.remake(result.piece);
    }
  }

  async function settleTurn(actor, result) {
    const transition = match.afterMove();
    if (transition.ended) await onTransition?.(match, transition, actor, result);
    if (match.over) finish(match.over);
    return transition;
  }

  async function passTurn() {
    const actor = match.player.color;
    const transition = match.afterMove({ pass: true });
    if (transition.ended) await onTransition?.(match, transition, actor, null);
    if (match.over) finish(match.over);
    return transition;
  }

  async function applyMove(piece, target) {
    const actor = match.player.color;
    const resolved = await beforeMove?.(match, piece, target, actor);
    const destination = resolved === undefined ? target : resolved;
    if (!destination) return false;
    const result = match.move(piece, destination);
    if (!result) return false;
    clearSelection();
    await animateMove(result);
    await onMove?.(match, result, actor);
    await settleTurn(actor, result);
    return true;
  }

  async function continueBotTurns() {
    let guard = 0;
    while (!destroyed && !finished && guard++ < 24) {
      if (!match.canMove(match.player.color)) {
        await passTurn();
        continue;
      }
      if (match.player.kind !== 'bot') break;
      await wait(botDelay);
      const choice = botChooseMove(match);
      if (!choice) {
        await passTurn();
        continue;
      }
      const moved = await applyMove(choice.piece, choice.target);
      if (!moved) break;
    }
    if (!finished && !destroyed) refresh();
  }

  async function tap(hit) {
    if (busy || destroyed || finished || match.over || match.player.kind !== 'human' || !hit) return;
    const piece = match.pieceAt(hit.row, hit.col);
    if (!selected) {
      if (!piece || piece.color !== match.player.color) {
        say('Selecciona una pieza de tu bando.');
        return;
      }
      selected = piece;
    } else if (piece === selected) {
      clearSelection();
      refresh();
      return;
    } else if (piece?.color === match.player.color) {
      selected = piece;
    } else {
      const legal = match.legal(selected).find(move => move.row === hit.row && move.col === hit.col);
      if (!legal) {
        say('Movimiento no legal. Elige una casilla marcada.');
        return;
      }
      busy = true;
      try {
        await applyMove(selected, { row: legal.row, col: legal.col });
        await continueBotTurns();
      } finally {
        busy = false;
      }
      return;
    }
    const moves = match.legal(selected);
    view.showMoves(
      new Set(moves.map(move => key(move.row, move.col))),
      new Set(moves.filter(move => move.hits.length).map(move => key(move.row, move.col))),
    );
    say(moves.length ? 'Pieza seleccionada. Elige uno de sus destinos legales.' : 'Esta pieza no tiene movimientos legales.');
  }

  async function start() {
    if (!match.over) await continueBotTurns();
    refresh();
  }

  async function pass() {
    if (busy || destroyed || finished || match.over || match.player.kind !== 'human') return false;
    busy = true;
    try {
      clearSelection();
      await passTurn();
      await continueBotTurns();
      return true;
    } finally {
      busy = false;
    }
  }

  async function playRandomMove() {
    if (busy || destroyed || finished || match.over || match.player.kind !== 'human') return false;
    const choices = match.pieces
      .filter(piece => piece.color === match.player.color)
      .flatMap(piece => match.legal(piece).map(move => ({ piece, target: { row: move.row, col: move.col } })));
    if (!choices.length) return pass();
    busy = true;
    try {
      const choice = choices[Math.floor(Math.random() * choices.length)];
      await applyMove(choice.piece, choice.target);
      await continueBotTurns();
      return true;
    } finally {
      busy = false;
    }
  }

  function destroy() {
    destroyed = true;
    clearSelection();
  }

  return { match, tap, start, pass, playRandomMove, destroy };
}
