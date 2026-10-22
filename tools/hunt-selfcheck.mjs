import assert from 'node:assert/strict';
import { newHunt, legal, move, DIFFS, SIZE, _solve } from '../src/game/hunt.js';

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const pieceOf = (s, id) => s.pieces.find((p) => p.id === id);

for (const level of Object.keys(DIFFS)) {
  const diff = DIFFS[level];
  let randomWins = 0;
  for (let seed = 1; seed <= 25; seed++) {
    const s = newHunt(level, seeded(seed));
    const runner = pieceOf(s, 'runner');
    assert.equal(pieceOf(s, 'hunter').type, 'knight', 'hunter is a knight');
    assert.equal(runner.type, 'pawn');
    assert.equal(s.board.holes.size, diff.holes, level + ' has its fallen squares');
    for (let r = runner.row + 1; r < SIZE; r++) assert.ok(!s.board.holes.has(r + ',' + runner.col), 'pawn file stays open');
    assert.ok(s.par >= diff.depth[0] && s.par <= diff.depth[1], level + ' par within range: ' + s.par);
    assert.equal(_solve(s, s.par), s.par, 'generated hunt is solvable in par');
    assert.equal(move(s, -1, -1), false, 'rejects illegal moves');
    // Jugador al azar: debe perder casi siempre.
    const rng = seeded(seed * 7);
    while (!s.over) {
      const ms = legal(s);
      const m = ms[Math.floor(rng() * ms.length)];
      assert.equal(move(s, m.row, m.col), true);
      const r = pieceOf(s, 'runner');
      if (r && !s.over) assert.ok(r.row < SIZE - 1, 'pawn crowns only by ending the game');
    }
    if (s.over === 'win') randomWins++;
    assert.equal(legal(s).length, 0, 'terminal state has no moves');
  }
  assert.ok(randomWins <= 8, level + ' random play rarely wins: ' + randomWins);
}

// Reglas del peón: avanza recto hacia abajo, doble paso desde su fila y come en diagonal.
const fresh = () => {
  const s = newHunt('normal', seeded(3));
  s.board.holes.clear();
  s.over = null;
  return s;
};
const a = fresh();
Object.assign(pieceOf(a, 'runner'), { row: 1, col: 3 });
Object.assign(pieceOf(a, 'hunter'), { row: 5, col: 6 });
move(a, 3, 5);
assert.deepEqual([pieceOf(a, 'runner').row, pieceOf(a, 'runner').col], [3, 3], 'pawn double-steps from its start row, straight down');

const b = fresh();
Object.assign(pieceOf(b, 'runner'), { row: 3, col: 3 });
Object.assign(pieceOf(b, 'hunter'), { row: 6, col: 3 });
move(b, 4, 4);
assert.equal(b.over, 'lose', 'pawn eats a knight on its forward diagonal');
assert.equal(b.reason, 'captured');

const c = fresh();
Object.assign(pieceOf(c, 'runner'), { row: 3, col: 3 });
Object.assign(pieceOf(c, 'hunter'), { row: 6, col: 4 });
move(c, 4, 3);
assert.deepEqual([pieceOf(c, 'runner').row, pieceOf(c, 'runner').col], [3, 3], 'a knight in front blocks the pawn');
assert.equal(c.over, null);

const d = fresh();
Object.assign(pieceOf(d, 'runner'), { row: 5, col: 3 });
Object.assign(pieceOf(d, 'hunter'), { row: 0, col: 0 });
move(d, 2, 1);
assert.equal(d.over, 'lose', 'pawn reaching the last row crowns');
assert.equal(d.reason, 'crowned');
assert.equal(pieceOf(d, 'runner').type, 'queen');

const e = fresh();
Object.assign(pieceOf(e, 'runner'), { row: 3, col: 3 });
Object.assign(pieceOf(e, 'hunter'), { row: 5, col: 2 });
move(e, 3, 3);
assert.equal(e.over, 'win', 'knight captures the pawn');
console.log('La cacería: peón con reglas de ajedrez, partidas resolubles con par y dificultad OK');
