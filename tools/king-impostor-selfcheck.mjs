import assert from 'node:assert/strict';
import { newKingImpostor, choose, activeClues, reach, DIFFS } from '../src/game/king-impostor.js';

const fits = (s, p, clues) => { const r = new Set(reach(s, p)); return clues.every((k) => r.has(k)); };
for (const level of Object.keys(DIFFS)) for (let run = 0; run < 40; run++) {
  const d = DIFFS[level], s = newKingImpostor(level);
  const suspects = s.pieces.filter((p) => p.color === 'dark');
  assert.equal(suspects.length, d.count);
  assert.equal(s.turns, d.turns);
  const impostor = suspects.find((p) => p.id === s.impostor);
  assert.ok(fits(s, impostor, s.clues), 'every clue points at the impostor');
  assert.equal(suspects.filter((p) => fits(s, p, s.clues)).length, 1, 'all clues together single it out');
  assert.equal(activeClues(s).length, d.upfront);
  assert.ok(suspects.filter((p) => fits(s, p, [s.clues[0]])).length >= Math.min(d.ambiguity, d.count), 'first clue is ambiguous');
  if (d.each) for (const k of s.clues) assert.ok(suspects.filter((p) => fits(s, p, [k])).length >= d.each, 'each hard clue alone is ambiguous');
  assert.equal(choose(s, 'king'), false, 'the ivory king is not a suspect');
  const wrong = suspects.find((p) => p.id !== s.impostor);
  assert.equal(choose(s, wrong.id), true);
  assert.equal(choose(s, wrong.id), false, 'cannot accuse twice');
  assert.equal(s.turns, d.turns - 1);
  if (d.turns === 1) { assert.equal(s.over, 'lose'); assert.equal(choose(s, s.impostor), false); }
  else {
    assert.equal(activeClues(s).length, d.upfront + 1, 'a miss reveals a new clue');
    assert.equal(choose(s, s.impostor), true);
    assert.equal(s.over, 'win');
  }
}
const answers = new Set(Array.from({ length: 60 }, () => newKingImpostor('normal').targetType));
assert.ok(answers.size >= 3, 'identity varies between rounds');
console.log('El rey impostor: pistas de amenaza, ambigüedad por dificultad y 120 rondas OK');
