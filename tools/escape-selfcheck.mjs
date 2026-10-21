import assert from 'node:assert/strict';
import { newEscape, legal, move } from '../src/game/escape.js';

const s = newEscape('normal');
assert.equal(move(s, 0, 0), false, 'rejects illegal moves');
assert.equal(s.turns, 4, 'illegal moves do not consume a turn');
assert.ok(legal(s).some((m) => m.row === 4 && m.col === 2));
assert.equal(move(s, 4, 2), true);
assert.equal(s.pieces.find((p) => p.id === 'guard').row, 3);
assert.equal(move(s, 2, 3), true);
assert.equal(s.pieces.find((p) => p.id === 'guard').row, 4);
assert.equal(move(s, 0, 4), true);
assert.equal(s.over, 'win', 'reaching the exit wins');
assert.equal(legal(s).length, 0);
console.log('Escape del tablero: reglas básicas OK');
