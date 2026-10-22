import assert from 'node:assert/strict';
import { newBodyguard, legal, move, DIFFS, kingAttacked, dangerSquares } from '../src/game/bodyguard.js';

// mulberry32: semillas seguidas dan partidas distintas.
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
};
const lights = (g) => g.pieces.filter((p) => p.color === 'light').flatMap((p) => legal(g, p).map((m) => ({ id: p.id, ...m })));

const s = newBodyguard('normal', seeded(1));
const king = s.pieces.find((p) => p.id === 'king');
assert.equal(move(s, 'king', 0, 0), false, 'rejects illegal moves');
assert.equal(s.turns, DIFFS.normal.turns, 'illegal moves do not consume a turn');
assert.ok(!kingAttacked(s.pieces, s.board), 'king never starts in check');
const first = legal(s, king)[0];
assert.equal(move(s, 'king', first.row, first.col), true);
assert.equal(s.turns, DIFFS.normal.turns - 1);
assert.ok(s.events.length >= 2, 'player and enemy moves are recorded');

const layouts = new Set(), squads = new Set();
for (const level of Object.keys(DIFFS)) {
  const diff = DIFFS[level];
  let randomWins = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const game = newBodyguard(level, seeded(seed));
    const foes = game.pieces.filter((p) => p.color === 'dark');
    assert.equal(foes.length, diff.foes, level + ' squad size');
    assert.ok(foes.every((f) => diff.pool.includes(f.type)), level + ' squad from its pool');
    assert.ok(foes.filter((f) => f.type === 'queen').length <= 1, 'at most one queen');
    assert.equal(game.pieces.filter((p) => p.color === 'light').length, 1 + diff.escorts, level + ' escorts');
    assert.equal(game.board.holes.size, diff.holes);
    layouts.add([...game.board.holes].sort().join());
    squads.add(foes.map((f) => f.type).sort().join());
    const rng = seeded(seed * 13);
    let steps = 0;
    while (!game.over && steps < 30) {
      const all = lights(game);
      const pick = all[Math.floor(rng() * all.length)];
      assert.equal(move(game, pick.id, pick.row, pick.col), true, 'selected legal move is accepted');
      steps++;
    }
    assert.ok(game.over, `game must terminate: ${level}/${seed}`);
    if (game.over === 'win') randomWins++;
    assert.ok(game.turns >= 0, 'turn counter never becomes negative');
  }
  assert.ok(randomWins <= (level === 'facil' ? 20 : 8), level + ' careless play mostly loses: ' + randomWins);
}
assert.ok(layouts.size > 20 && squads.size > 4, 'boards and squads vary between games');

// Refuerzo en difícil.
const hard = newBodyguard('dificil', seeded(5));
const before = hard.nextFoe;
while (!hard.over && hard.turns > DIFFS.dificil.reinforce) {
  const safe = lights(hard).find((m) => {
    const t = { ...hard, pieces: hard.pieces.map((p) => ({ ...p })) };
    return !dangerSquares(t).has(m.row + ',' + m.col);
  }) || lights(hard)[0];
  move(hard, safe.id, safe.row, safe.col);
}
if (!hard.over) assert.equal(hard.nextFoe, before + 1, 'a reinforcement knight enters in hard mode');
console.log('El guardaespaldas: escuadras y tableros variables, IA de asedio y 90 partidas OK');
