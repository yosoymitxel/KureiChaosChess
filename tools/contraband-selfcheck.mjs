import assert from 'node:assert/strict';
import { newContraband, legal, move } from '../src/game/dimensional-contraband.js';
import { generateBoard } from '../src/game/generate.js';
import { portalAt } from '../src/game/rules.js';

const s = newContraband('normal');
assert.ok(legal(s).length > 0);
assert.equal(move(s, 0, 0), false, 'rejects illegal knight move');
assert.equal(move(s, 4, 2), true, 'knight reaches the normal portal');
assert.deepEqual([s.pieces[0].row, s.pieces[0].col], [1, 4], 'portal transports to its twin');
assert.equal(s.turns, 6);

for (const level of ['facil', 'normal', 'dificil']) {
  const game = newContraband(level);
  const [r, c] = game.diff.entry.split(',').map(Number);
  const [tr, tc] = game.diff.twin.split(',').map(Number);
  assert.equal(game.board.terrain.get(game.diff.entry), 'portal', level + ' entry shares normal board terrain');
  assert.equal(game.board.terrain.get(game.diff.twin), 'portal', level + ' twin shares normal board terrain');
  assert.deepEqual(portalAt(game.board, r, c), { from: game.diff.entry, to: game.diff.twin, pair: 'pair-a' });
  assert.equal(game.board.portals.get(game.diff.twin), game.diff.entry, level + ' portal pair is bidirectional');
  assert.ok(legal(game).some((m) => m.row === r && m.col === c), level + ' entry is a legal knight move');
  assert.equal(move(game, r, c), true);
  assert.deepEqual([game.pieces[0].row + ',' + game.pieces[0].col], [game.diff.twin]);
  assert.ok(legal(game).some((m) => m.row === 0 && m.col === 6), level + ' portal gives a legal exit jump');
  assert.equal(move(game, 0, 6), true);
  assert.equal(game.over, 'win', level + ' route reaches the exit');
}

const board = generateBoard(17, 1, 6, 'portal');
const portalCells = [...board.terrain].filter(([, terrain]) => terrain === 'portal').map(([cell]) => cell);
assert.ok(portalCells.length >= 2, 'normal board generator creates paired portals');
for (const cell of portalCells) {
  const [row, col] = cell.split(',').map(Number);
  const portal = portalAt(board, row, col);
  assert.ok(portal, cell + ' has a portal lookup');
  assert.equal(board.terrain.get(portal.to), 'portal', 'normal board twin has portal terrain');
  assert.equal(board.portals.get(portal.to), cell, 'normal board pair is bidirectional');
}
console.log('Contrabando dimensional: portales compartidos y rutas por dificultad OK');
