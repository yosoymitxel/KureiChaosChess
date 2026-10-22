import assert from 'node:assert/strict';
import { newHunt, legal, move } from '../src/game/hunt.js';

const s = newHunt('normal');
assert.equal(move(s, 0, 0), false, 'rejects illegal moves');
assert.equal(s.turns, 7, 'illegal moves do not consume a turn');
assert.ok(legal(s).some((m) => m.row === 5 && m.col === 4), 'queen can move along a legal diagonal');
assert.equal(move(s, 5, 4), true);
assert.equal(s.pieces.find((p) => p.id === 'runner').row, 3, 'normal runner waits for its second-turn escape beat');
assert.equal(move(s, 3, 4), true, 'queen captures runner on a legal square');
assert.equal(s.over, 'win', 'capture wins');
assert.equal(legal(s).length, 0, 'terminal state has no moves');

const easy = newHunt('facil');
assert.equal(move(easy, 5, 4), true);
assert.equal(easy.pieces.find((p) => p.id === 'runner').row, 3, 'easy runner does not flee every turn');
assert.equal(move(easy, 4, 4), true);
assert.equal(easy.pieces.find((p) => p.id === 'runner').row, 3, 'easy runner waits for its third-turn escape beat');

const hard = newHunt('dificil');
assert.equal(move(hard, 5, 4), true);
assert.equal(hard.pieces.find((p) => p.id === 'runner').row, 2, 'hard runner advances immediately');
assert.equal(hard.turns, 5);

const escaped = newHunt('dificil');
assert.equal(move(escaped, 6, 0), true, 'hunter can reposition along the back rank');
assert.equal(escaped.pieces.find((p) => p.id === 'runner').row, 2);
assert.equal(move(escaped, 6, 1), true);
assert.equal(escaped.pieces.find((p) => p.id === 'runner').row, 1);
assert.equal(move(escaped, 6, 0), true);
assert.equal(escaped.over, 'lose', 'runner reaching the top row ends the game in defeat');
assert.equal(escaped.escaped, 1, 'escape is recorded');
assert.equal(move(escaped, 6, 1), false, 'terminal games reject further moves');

console.log('La cacería: reglas, dificultad y escape OK');
