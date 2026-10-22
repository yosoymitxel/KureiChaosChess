import assert from 'node:assert/strict';
import { newMinefield, legal, move, probe, nearbyMines, DIFFS, SIZE } from '../src/game/minefield.js';

const levels = ['facil', 'normal', 'dificil'];
assert.deepEqual(levels.map((k) => DIFFS[k].mines), [7, 10, 13]);
const routes = new Set();
for (const level of levels) for (let run = 0; run < 30; run++) {
  const s = newMinefield(level);
  routes.add(s.route.join('|'));
  assert.ok(legal(s).length > 0);
  assert.equal(s.mines.size, DIFFS[level].mines);
  assert.equal(s.turns, s.route.length - 1 + DIFFS[level].slack, 'turns = safe route + slack');
  assert.equal(move(s, 0, 0), false, 'reject illegal move');
  for (const pos of s.route.slice(1)) {
    const [row, col] = pos.split(',').map(Number);
    assert.ok(!s.mines.has(pos), level + ' guaranteed route stays safe');
    assert.ok(legal(s).some((m) => m.row === row && m.col === col), level + ' route uses legal knight moves');
    assert.equal(move(s, row, col), true);
  }
  assert.equal(s.over, 'win', level + ' guaranteed route wins');
  assert.equal(move(s, 0, 0), false, 'finished games reject moves');
}
assert.ok(routes.size > 60, 'safe routes vary between games: ' + routes.size);

// Revelado según dificultad: Difícil solo enseña la casilla pisada.
const hard = newMinefield('dificil');
assert.equal(hard.revealed.size, 1);
const easy = newMinefield('facil');
assert.ok(easy.revealed.size > 1, 'easy uncovers the surroundings');

// Sonda: no gasta jugada, marca minas y enseña números.
const s = newMinefield('normal');
const turns = s.turns;
const mine = [...s.mines][0];
const [mr, mc] = mine.split(',').map(Number);
assert.equal(probe(s, mr, mc), true);
assert.ok(s.flags.has(mine) && !s.revealed.has(mine), 'probing a mine flags it');
assert.equal(s.turns, turns, 'probe costs no turn');
assert.equal(probe(s, mr, mc), false, 'no probes left');

// Pisar una mina pierde y destapa todas.
const boom = newMinefield('normal');
let target = null;
for (const m of legal(boom)) if (boom.mines.has(m.row + ',' + m.col)) target = m;
if (target) {
  move(boom, target.row, target.col);
  assert.equal(boom.over, 'lose');
  assert.ok([...boom.mines].every((k) => boom.revealed.has(k)), 'all mines shown after a blast');
}
assert.ok(nearbyMines(boom, SIZE - 1, 0) >= 0);
console.log('Campo minado: rutas al azar, revelado por dificultad, sonda y 90 partidas OK');
