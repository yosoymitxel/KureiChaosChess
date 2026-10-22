import assert from 'node:assert/strict';
import { newGiantHunt, legal, move, DIFFS } from '../src/game/giant-hunt.js';
import { BOSSES } from '../src/data/bosses.js';

assert.deepEqual(Object.keys(DIFFS), ['facil', 'normal', 'dificil']);
assert.deepEqual([DIFFS.facil.boss, DIFFS.normal.boss, DIFFS.dificil.boss], ['titan', 'hydra', 'golem']);
assert.deepEqual([DIFFS.facil.turns, DIFFS.normal.turns, DIFFS.dificil.turns], [8, 7, 8]);

for (const level of Object.keys(DIFFS)) {
  const game = newGiantHunt(level);
  const giant = game.pieces.find(p => p.id === 'giant');
  assert.equal(giant.type, 'boss-' + game.diff.boss, level + ' renders its assigned boss type');
  assert.deepEqual([giant.h, giant.w], BOSSES[game.diff.boss].size, level + ' uses actual boss footprint');
  assert.equal(giant.hp, BOSSES[game.diff.boss].hp, level + ' uses boss HP');
  assert.ok(legal(game).length > 0, level + ' gives the hunter legal moves');
  assert.equal(move(game, 0, 0), false, 'illegal moves do not consume turns');
  assert.equal(game.turns, DIFFS[level].turns);
}

const normal = newGiantHunt('normal');
const normalBoss = normal.pieces.find(p => p.id === 'giant');
const before = { row: normalBoss.row, col: normalBoss.col };
const quietMove = legal(normal).find(m => !m.hits.some(p => p.id === 'giant'));
assert.ok(quietMove, 'hunter can reposition without hitting the boss');
assert.equal(move(normal, quietMove.row, quietMove.col), true);
assert.equal(normal.turns, 6, 'each player action consumes exactly one turn');
assert.ok(normal.events.some(e => e.type === 'boss-move'), 'boss answers after a player action');
assert.ok(normal.round >= 1, 'boss response increments the round');

const hitGame = newGiantHunt('normal');
const hit = legal(hitGame).find(m => m.hits.some(p => p.id === 'giant'));
assert.ok(hit, 'queen can hit the multi-cell boss');
const hpBefore = hitGame.pieces.find(p => p.id === 'giant').hp;
assert.equal(move(hitGame, hit.row, hit.col), true);
assert.equal(hitGame.pieces.find(p => p.id === 'giant').hp, hpBefore - 1, 'hit removes one HP');
assert.equal(hitGame.turns, 6, 'a hit costs a turn');
assert.ok(hitGame.events.some(e => e.type === 'hunter-hit'), 'hit event is recorded');
assert.ok(hitGame.events.some(e => e.type === 'boss-move'), 'boss retaliates after surviving a hit');

const won = newGiantHunt('facil');
const target = won.pieces.find(p => p.id === 'giant');
target.hp = 1;
won.hp = 1;
const fatal = legal(won).find(m => m.hits.some(p => p.id === 'giant'));
assert.ok(fatal, 'final hit is reachable');
assert.equal(move(won, fatal.row, fatal.col), true);
assert.equal(won.over, 'win', 'last hit wins before the boss can retaliate');
assert.equal(won.pieces.some(p => p.id === 'giant'), false, 'defeated boss is removed');
assert.equal(move(won, 0, 0), false, 'finished games reject moves');

for (const level of Object.keys(DIFFS)) {
  for (let seed = 0; seed < 30; seed++) {
    const game = newGiantHunt(level);
    let step = 0;
    while (!game.over && step < 20) {
      const moves = legal(game);
      if (!moves.length) break;
      const pick = moves[(seed + step * 5) % moves.length];
      assert.equal(move(game, pick.row, pick.col), true);
      step++;
    }
    assert.ok(game.over, 'game terminates within 20 turns: ' + level + '/' + seed);
    assert.ok(['win', 'lose'].includes(game.over));
    assert.ok(game.turns >= 0);
  }
}
console.log('Caza de gigantes: jefes, huella, IA, dificultad y 90 partidas OK');
