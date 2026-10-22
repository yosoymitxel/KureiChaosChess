import assert from 'node:assert/strict';
import { newBodyguard, legal, move, DIFFS } from '../src/game/bodyguard.js';

const s = newBodyguard('normal');
assert.equal(move(s, 'king', 2, 2), false, 'rejects illegal moves');
assert.equal(s.turns, 5, 'illegal moves do not consume a turn');
assert.ok(legal(s, s.pieces.find((p) => p.id === 'king')).some((m) => m.row === 6 && m.col === 2));
assert.equal(move(s, 'king', 6, 2), true);
assert.equal(s.turns, 4);
assert.equal(s.events.length, 2, 'player and enemy moves are recorded');
assert.equal(s.pieces.find((p) => p.id === 'assailant').row, 1, 'enemy advances toward the king');
assert.equal(move(s, 'king', 6, 2), false, 'occupied current square is not a move');

const easy = newBodyguard('facil');
const normal = newBodyguard('normal');
const hard = newBodyguard('dificil');
assert.deepEqual(Object.keys(DIFFS), ['facil', 'normal', 'dificil']);
assert.deepEqual([easy.turns, normal.turns, hard.turns], [4, 5, 6], 'survival target scales by difficulty');
assert.deepEqual([easy.pieces.find((p) => p.id === 'assailant').col, normal.pieces.find((p) => p.id === 'assailant').col, hard.pieces.find((p) => p.id === 'assailant').col], [0, 3, 6], 'each difficulty has a different opening');
assert.equal(easy.diff.ai, 'simple');
assert.equal(normal.diff.ai, 'tactical');
assert.equal(hard.diff.ai, 'hunter');

for (const level of Object.keys(DIFFS)) {
  for (let seed = 0; seed < 30; seed++) {
    const game = newBodyguard(level);
    let steps = 0;
    while (!game.over && steps < 20) {
      const available = game.pieces.filter((p) => p.color === 'light').flatMap((p) => legal(game, p).map((m) => ({ id: p.id, ...m })));
      if (!available.length) break;
      // Semilla determinista: recorre destinos distintos sin depender de Math.random.
      const pick = available[(seed + steps * 7) % available.length];
      assert.equal(move(game, pick.id, pick.row, pick.col), true, 'selected legal move is accepted');
      steps++;
    }
    assert.ok(game.over, `game must terminate: level=${level}, seed=${seed}`);
    assert.ok(['win', 'lose'].includes(game.over), 'result is explicit');
    assert.ok(game.events.length >= 1, 'turn events are recorded');
    assert.ok(game.turns >= 0, 'turn counter never becomes negative');
  }
}
console.log('El guardaespaldas: 90 partidas simuladas; dificultad, IA y reglas OK');
