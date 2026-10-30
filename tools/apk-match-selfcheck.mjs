import assert from 'node:assert/strict';
import { Match, botChooseMove } from '../src/game/match.js';
import { makePiece } from '../src/game/generate.js';

const board = (rows = 8, cols = 8) => ({ rows, cols, holes: new Set(), protectRows: 0 });
const players = [
  { color: 'light', kind: 'human', name: 'Tú' },
  { color: 'dark', kind: 'bot', name: 'Rival' },
];

{
  const pieces = [
    makePiece('king', 'light', 7, 4, { royal: true }),
    makePiece('rook', 'light', 7, 0),
    makePiece('king', 'dark', 0, 4, { royal: true }),
    makePiece('rook', 'dark', 0, 7),
  ];
  const match = new Match({ board: board(), pieces, players });
  const rook = pieces[1];
  assert.ok(match.legal(rook).some(move => move.row === 6 && move.col === 0), 'human piece exposes legal moves');
  assert.equal(match.move(rook, { row: 6, col: 0 })?.piece, rook, 'legal move is applied');
  match.afterMove();
  assert.equal(match.player.color, 'dark', 'turn passes to bot');
  const choice = botChooseMove(match);
  assert.ok(choice, 'bot finds a legal reply');
  assert.ok(match.legal(choice.piece).some(move => move.row === choice.target.row && move.col === choice.target.col), 'bot reply is legal');
  assert.ok(match.move(choice.piece, choice.target), 'bot reply is applied');
  match.afterMove();
  assert.equal(match.player.color, 'light', 'turn returns to human');
}

{
  const pieces = [
    makePiece('king', 'light', 3, 3, { royal: true }),
    makePiece('queen', 'light', 2, 2),
    makePiece('king', 'dark', 0, 0, { royal: true }),
  ];
  const darkKing = pieces[2];
  const match = new Match({ board: board(4, 4), pieces, players });
  assert.ok(match.legal(pieces[1]).some(move => move.row === 0 && move.col === 0), 'king capture is a legal queen move');
  const result = match.move(pieces[1], { row: 0, col: 0 });
  assert.ok(result?.victims.some(victim => victim.piece === darkKing && victim.killed), 'royal capture is recorded');
  match.afterMove();
  assert.equal(match.over?.winner, 'light', 'capturing the rival king ends the game');
  assert.equal(match.over?.victory, true, 'human win is reported');
}

{
  const b = board(12, 12);
  const bishopHybrid = makePiece('bishop', 'light', 8, 2, { extraMoveTypes: ['knight'] });
  const camel = makePiece('camel', 'light', 8, 8);
  const cannon = makePiece('cannon', 'light', 4, 0);
  const screen = makePiece('pawn', 'light', 4, 2);
  const target = makePiece('pawn', 'dark', 4, 4);
  const match = new Match({
    board: b,
    pieces: [makePiece('king', 'light', 11, 11, { royal: true }), bishopHybrid, camel, cannon, screen, target,
      makePiece('king', 'dark', 0, 11, { royal: true })],
    players,
  });
  assert.ok(match.legal(bishopHybrid).some(move => move.row === 6 && move.col === 3), 'archbishop inherits knight movement');
  assert.ok(match.legal(camel).some(move => move.row === 5 && move.col === 7), 'camel uses 3+1 leap');
  assert.ok(match.legal(cannon).some(move => move.row === 4 && move.col === 4 && move.hits.includes(target)), 'cannon captures over exactly one screen');
}

{
  const pieces = [
    makePiece('king', 'light', 4, 2, { royal: true }),
    makePiece('rook', 'light', 4, 0),
    makePiece('pawn', 'light', 3, 1),
    makePiece('king', 'dark', 0, 2, { royal: true }),
    makePiece('rook', 'dark', 0, 4),
    makePiece('pawn', 'dark', 1, 3),
  ];
  const match = new Match({ board: board(5, 5), pieces, players });
  const movable = pieces.filter(piece => piece.color === 'light' && match.legal(piece).length);
  assert.ok(movable.length, 'Micro Chess initial position must contain at least one legal human move');
}

console.log('APK playable match OK: legal moves, bot turn, return turn, royal capture and Giant Board special moves.');
