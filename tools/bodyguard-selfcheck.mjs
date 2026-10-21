import assert from 'node:assert/strict';
import { newBodyguard, legal, move } from '../src/game/bodyguard.js';

const s = newBodyguard('normal');
assert.equal(move(s, 'king', 2, 2), false, 'rejects illegal moves');
assert.equal(s.turns, 5, 'illegal moves do not consume a turn');
assert.ok(legal(s, s.pieces.find((p) => p.id === 'king')).some((m) => m.row === 6 && m.col === 2));
assert.equal(move(s, 'king', 6, 2), true);
assert.equal(s.turns, 4);
assert.equal(s.events.length, 2, 'player and enemy moves are recorded');
assert.ok(s.pieces.find((p) => p.id === 'assailant').row >= 0);
console.log('El guardaespaldas: reglas básicas OK');
