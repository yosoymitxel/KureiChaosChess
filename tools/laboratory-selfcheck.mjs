import assert from 'node:assert/strict';
import { DIFFS, newLaboratory, legal, move } from '../src/game/laboratory.js';

const expectedSamples = { facil: 1, normal: 2, dificil: 3 };
const mutations = { facil: 'rook2', normal: 'bishop', dificil: 'knight' };

for (const [level, diff] of Object.entries(DIFFS)) {
  assert.equal(diff.samples, expectedSamples[level], level + ' sample count sets the difficulty');
  assert.equal(diff.variants.length, 2, level + ' has two distinct route variants');
  assert.ok(diff.variants[0].solution.join(';') !== diff.variants[1].solution.join(';'), level + ' variants differ');
  for (const [index, variant] of diff.variants.entries()) {
    const s = newLaboratory(level, index);
    assert.ok(s.pieces[0].extraMoveTypes.includes(mutations[level]), level + ' applies its mutation');
    assert.equal(s.samples.size, expectedSamples[level]);
    assert.ok(legal(s).length, level + ' starts with legal moves');
    assert.equal(legal(s).some((m) => m.row === s.exit.row && m.col === s.exit.col), false, 'exit stays locked while samples remain');
    assert.equal(move(s, s.exit.row, s.exit.col), false, 'cannot leave before collecting samples');

    for (const [step, [row, col]] of variant.solution.entries()) {
      const from = { row: s.pieces[0].row, col: s.pieces[0].col };
      assert.ok(legal(s).some((m) => m.row === row && m.col === col), level + ' variant ' + variant.id + ' solution step ' + (step + 1) + ' is legal');
      assert.equal(move(s, row, col), true);
      assert.ok(s.board.holes.has(from.row + ',' + from.col), 'the previous tile collapses');
      if (step < variant.solution.length - 1) assert.notEqual(s.over, 'win', 'samples must precede the exit');
    }
    assert.equal(s.over, 'win', level + ' variant ' + variant.id + ' is completable');
    assert.equal(s.samples.size, 0, 'every sample was collected');
    assert.ok(s.turns >= 0, 'the route fits its turn limit');
  }
}

console.log('El laboratorio: dificultad, variantes y rutas resolubles OK');
