import assert from 'node:assert/strict';
import { Match, botChooseMove } from '../src/game/match.js';
import { RIVALS } from '../src/game/difficulty.js';
import { makePiece } from '../src/game/generate.js';
import {
  DIAMOND_DIFFICULTIES,
  DIAMOND_RADIUS,
  DIAMOND_SIZE,
  DIAMOND_TILE_COUNT,
  createDiamondBoard,
  createDiamondMatch,
  createDiamondPieces,
} from '../src/lab/proto/diamond-game.js';

const board = createDiamondBoard();
assert.equal(DIAMOND_RADIUS, 6);
assert.equal(DIAMOND_SIZE, 13);
assert.equal(board.rows, 13);
assert.equal(board.cols, 13);
assert.equal(board.holes.size, 84);
assert.equal(DIAMOND_TILE_COUNT, 85);
assert.equal(board.rows * board.cols - board.holes.size, DIAMOND_TILE_COUNT);
assert.ok(!board.holes.has('6,0') && !board.holes.has('6,12'), 'both vertex tips are playable');
assert.ok(board.holes.has('0,0') && board.holes.has('0,5'), 'outside cells stay empty while the top vertex remains playable');
assert.ok(!board.holes.has('0,6') && !board.holes.has('12,6'), 'north and south tips remain playable');
for (let row = 0; row < board.rows; row++) {
  for (let col = 0; col < board.cols; col++) {
    assert.equal(board.holes.has(row + ',' + col), board.holes.has((12 - row) + ',' + (12 - col)), 'diamond is mirrored');
  }
}

const pieces = createDiamondPieces();
assert.equal(pieces.length, 8);
assert.equal(pieces.filter(piece => piece.color === 'light').length, 4);
assert.equal(pieces.filter(piece => piece.color === 'dark').length, 4);
assert.deepEqual(pieces.filter(piece => piece.royal && piece.color === 'light').map(piece => [piece.row, piece.col]), [[6, 0]]);
assert.deepEqual(pieces.filter(piece => piece.royal && piece.color === 'dark').map(piece => [piece.row, piece.col]), [[6, 12]]);
assert.ok(pieces.every(piece => !board.holes.has(piece.row + ',' + piece.col)), 'all starting pieces are on valid tiles');

const match = createDiamondMatch('normal');
const rook = match.pieces.find(piece => piece.color === 'light' && piece.type === 'rook');
const rookMoves = match.legal(rook);
assert.ok(rookMoves.length > 0, 'player has a legal move at the start');
assert.ok(rookMoves.every(move => !board.holes.has(move.row + ',' + move.col)), 'movement cannot enter the cut-off corners');
const humanMove = rookMoves[0];
assert.ok(match.move(rook, humanMove), 'human move is applied');
match.afterMove();
assert.equal(match.player.color, 'dark', 'turn passes to the rival');
const botMove = botChooseMove(match);
assert.ok(botMove, 'the rival finds a legal move');
assert.ok(match.legal(botMove.piece).some(move => move.row === botMove.target.row && move.col === botMove.target.col), 'bot move is legal');
assert.ok(match.move(botMove.piece, botMove.target), 'bot reply is applied');
match.afterMove();
assert.equal(match.player.color, 'light', 'turn returns to the human');

assert.equal(createDiamondMatch('facil').rival, RIVALS.aprendiz);
assert.equal(createDiamondMatch('normal').rival, RIVALS.oficial);
assert.equal(createDiamondMatch('dificil').rival, RIVALS.maestro);
assert.notEqual(DIAMOND_DIFFICULTIES.facil.rival, DIAMOND_DIFFICULTIES.dificil.rival);

{
  const game = new Match({
    board: createDiamondBoard(),
    pieces: [
      makePiece('king', 'light', 6, 0, { royal: true }),
      makePiece('queen', 'light', 6, 10),
      makePiece('king', 'dark', 6, 12, { royal: true }),
    ],
    players: [{ color: 'light', kind: 'human', name: 'Tú' }, { color: 'dark', kind: 'bot', name: 'Rival' }],
    rival: RIVALS.oficial,
  });
  const queen = game.pieces.find(piece => piece.color === 'light' && piece.type === 'queen');
  assert.ok(game.legal(queen).some(move => move.row === 6 && move.col === 12), 'queen can attack the opposite vertex king');
  assert.ok(game.move(queen, { row: 6, col: 12 }));
  game.afterMove();
  assert.equal(game.over?.winner, 'light');
  assert.equal(game.over?.victory, true, 'capturing the opponent king is a win');
}

{
  const game = new Match({
    board: createDiamondBoard(),
    pieces: [
      makePiece('king', 'light', 6, 0, { royal: true }),
      makePiece('king', 'dark', 6, 12, { royal: true }),
      makePiece('queen', 'dark', 6, 1),
    ],
    players: [{ color: 'light', kind: 'human', name: 'Tú' }, { color: 'dark', kind: 'bot', name: 'Rival' }],
    rival: RIVALS.oficial,
  });
  game.current = 1;
  const queen = game.pieces.find(piece => piece.color === 'dark' && piece.type === 'queen');
  assert.ok(game.legal(queen).some(move => move.row === 6 && move.col === 0), 'rival can attack the player vertex king');
  assert.ok(game.move(queen, { row: 6, col: 0 }));
  game.afterMove();
  assert.equal(game.over?.winner, 'dark');
  assert.equal(game.over?.victory, false, 'losing the player king is a defeat');
}

for (const difficulty of Object.keys(DIAMOND_DIFFICULTIES)) {
  const game = new Match({
    board: createDiamondBoard(),
    pieces: createDiamondPieces(),
    players: [{ color: 'light', kind: 'bot', name: 'Bot Marfil' }, { color: 'dark', kind: 'bot', name: 'Bot Carmesí' }],
    rival: RIVALS[DIAMOND_DIFFICULTIES[difficulty].rival],
  });
  let plies = 0;
  while (!game.over && plies < 24) {
    if (!game.canMove()) {
      game.afterMove({ pass: true });
      plies++;
      continue;
    }
    const choice = botChooseMove(game);
    assert.ok(choice, difficulty + ': bot should produce a move when a move exists');
    assert.ok(game.move(choice.piece, choice.target), difficulty + ': bot move is legal');
    game.afterMove();
    plies++;
  }
  assert.ok(plies > 0, difficulty + ': simulated match advances');
}

console.log('Proto Diamond OK: 13x13, 85 tiles, vertex kings, legal movement, AI replies, 3 difficulties, win/loss and bot self-play.');
