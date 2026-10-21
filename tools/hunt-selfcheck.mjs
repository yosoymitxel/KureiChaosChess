import assert from 'node:assert/strict';
import { newHunt, legal, move } from '../src/game/hunt.js';

const s = newHunt('normal');
const invalid = move(s, 0, 0);
assert.equal(invalid, false, 'rejects illegal moves');
assert.equal(s.turns, 6, 'illegal moves do not consume a turn');
assert.ok(legal(s).some((m) => m.row === 4 && m.col === 4), 'queen can move along a legal diagonal');
assert.equal(move(s, 4, 4), true);
assert.equal(s.pieces.find((p) => p.id === 'runner').row, 3, 'runner waits until its escape beat');
assert.equal(move(s, 3, 4), true, 'queen captures runner on a legal square');
assert.equal(s.over, 'win', 'capture wins');
assert.equal(legal(s).length, 0, 'terminal state has no moves');

const hard = newHunt('dificil');
assert.equal(move(hard, 4, 4), true);
assert.equal(hard.pieces.find((p) => p.id === 'runner').row, 2, 'hard runner escapes every turn');
assert.equal(hard.turns, 4);
console.log('La cacería: reglas básicas OK');
