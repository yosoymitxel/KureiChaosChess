import assert from 'node:assert/strict';
import { newHunt, legal, move, DIFFS } from '../src/game/hunt.js';

const fixedRandom = () => 0.25;
const s = newHunt('normal', fixedRandom);
assert.equal(s.pieces.find((p) => p.id === 'hunter').type, 'knight', 'hunter is a knight');
assert.equal(s.board.holes.size, 5, 'normal creates five fallen squares');
assert.equal(new Set(s.board.holes).size, s.board.holes.size, 'fallen squares are unique');
assert.equal(s.board.holes.has('6,3'), false, 'hunter spawn is never a hole');
assert.equal(s.board.holes.has('3,4'), false, 'runner spawn is never a hole');

const initialTurns = s.turns;
assert.equal(move(s, 0, 0), false, 'rejects illegal moves');
assert.equal(s.turns, initialTurns, 'illegal moves do not consume a turn');

const first = legal(s)[0];
assert.ok(first, 'knight has a legal move');
assert.equal(move(s, first.row, first.col), true);
assert.equal(s.turns, initialTurns - 1, 'valid move consumes one turn');
if (s.over !== 'win') {
  assert.equal(s.pieces.find((p) => p.id === 'runner').row, 2, 'runner advances after every hunter move');
}

for (const level of Object.keys(DIFFS)) {
  const game = newHunt(level, fixedRandom);
  assert.equal(game.board.holes.size, game.diff.holes, level + ' has its configured fallen squares');
}

const capture = newHunt('normal', () => 0.99);
capture.board.holes.clear();
capture.pieces[0].row = 5;
capture.pieces[0].col = 2;
capture.pieces[1].row = 3;
capture.pieces[1].col = 3;
assert.ok(legal(capture).some((m) => m.hits.some((p) => p.id === 'runner')), 'knight can capture runner by legal chess move');
const winningMove = legal(capture).find((m) => m.hits.some((p) => p.id === 'runner'));
assert.equal(move(capture, winningMove.row, winningMove.col), true);
assert.equal(capture.over, 'win', 'capture wins');
assert.equal(legal(capture).length, 0, 'terminal state has no moves');
console.log('La cacería: caballo, casillas aleatorias y avance por turno OK');
