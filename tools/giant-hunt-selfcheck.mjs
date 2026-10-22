import assert from 'node:assert/strict';
import { newGiantHunt, legal, move, DIFFS, chargePath } from '../src/game/giant-hunt.js';
import { BOSSES } from '../src/data/bosses.js';

// mulberry32: semillas seguidas dan partidas distintas.
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
};
const giantOf = (g) => g.pieces.find((p) => p.id === 'giant');
assert.deepEqual(Object.keys(DIFFS), ['facil', 'normal', 'dificil']);

const seenBosses = new Set();
for (const level of Object.keys(DIFFS)) {
  const diff = DIFFS[level];
  let randomWins = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const game = newGiantHunt(level, seeded(seed));
    const giant = giantOf(game);
    assert.ok(diff.bosses.includes(giant.bossId), level + ' boss from its roster');
    seenBosses.add(level + giant.bossId);
    assert.deepEqual([giant.h, giant.w], BOSSES[giant.bossId].size, 'uses the boss footprint');
    assert.equal(giant.hp, BOSSES[giant.bossId].hp + diff.hp, 'uses boss HP plus difficulty bonus');
    assert.equal(game.board.holes.size, diff.rubble, 'rubble count');
    assert.ok(legal(game).length > 0, 'hunter has moves');
    assert.equal(move(game, -1, -1), false, 'illegal moves do not consume turns');
    assert.equal(game.turns, diff.turns);
    const rng = seeded(seed * 31);
    while (!game.over) {
      const ms = legal(game);
      const m = ms[Math.floor(rng() * ms.length)];
      assert.equal(move(game, m.row, m.col), true);
    }
    if (game.over === 'win') randomWins++;
    assert.ok(game.turns >= 0);
  }
  assert.ok(randomWins <= 6, level + ' random play rarely wins: ' + randomWins);
}
assert.ok(seenBosses.size >= 8, 'bosses vary between games');

// Golpe: quita una vida, la reina rebota y el jefe embiste hacia ella.
const hitGame = newGiantHunt('normal', seeded(2));
const hit = legal(hitGame).find((m) => m.hits.some((p) => p.id === 'giant'));
if (hit) {
  const hunter = hitGame.pieces.find((p) => p.id === 'hunter');
  const from = { row: hunter.row, col: hunter.col };
  const lane = chargePath(hitGame, from);
  const hp = giantOf(hitGame).hp;
  assert.equal(move(hitGame, hit.row, hit.col), true);
  assert.equal(giantOf(hitGame).hp, hp - 1, 'hit removes one HP');
  assert.ok(hitGame.events.some((e) => e.type === 'hunter-hit'), 'hit event');
  assert.ok(hitGame.events.some((e) => e.type === 'boss-charge' || e.type === 'boss-stagger'), 'boss charges after a hit');
  if (lane.length && hitGame.over !== 'lose') assert.deepEqual([giantOf(hitGame).row, giantOf(hitGame).col], [lane.at(-1).row, lane.at(-1).col], 'charge follows its lane');
}

// Último golpe gana antes de que el jefe responda.
for (let seed = 1; seed < 40; seed++) {
  const won = newGiantHunt('facil', seeded(seed));
  giantOf(won).hp = 1;
  const fatal = legal(won).find((m) => m.hits.some((p) => p.id === 'giant'));
  if (!fatal) continue;
  assert.equal(move(won, fatal.row, fatal.col), true);
  assert.equal(won.over, 'win', 'last hit wins');
  assert.equal(won.pieces.some((p) => p.id === 'giant'), false, 'defeated boss is removed');
  assert.equal(move(won, 0, 0), false, 'finished games reject moves');
  break;
}
console.log('Caza de gigantes: jefes al azar, escombros, embestida, furia y 90 partidas OK');
