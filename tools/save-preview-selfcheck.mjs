import assert from 'node:assert/strict';
import { summarizeSave } from '../src/game/save-preview.js';
import { ACHIEVEMENTS } from '../src/game/achievements.js';

const sample = {
  'zugzwang.run.v2': {
    seed: 42,
    currentFloor: 2,
    map: { floors: 8, nodes: [{ id: 'a', floor: 0 }, { id: 'b', floor: 1 }, { id: 'c', floor: 2 }] },
    completed: { a: true, b: true },
    mutations: ['fury', 'leap'],
    cards: ['deck', 'mut'],
    suspended: { node: 'c' },
  },
  'zugzwang.settings.v2': { theme: 'walnut', difficulty: 'normal' },
  'zugzwang.minis.v1': ['bowling', 'hockey'],
  'zugzwang.bosses.v1': ['titan'],
  'zugzwang.achievements.v1': ['first_win', 'boss_slain', 'first_win', 'not-a-real-achievement'],
  'zugzwang.stats.v1': { runsCompleted: 4, hardMinis: ['bowling', 'hockey'], zero: 0 },
  'zugzwang.seen.v1': ['pawn', 'rook', 'queen'],
  'zugzwang.mutseen.v1': ['fury', 'leap'],
  'zugzwang.zen.v1': { size: 6, planted: 12, flores: { romero: 3, lavanda: 2 }, seeds: { romero: 1 }, pots: { r0c0: null, r0c1: null }, lake: 3 },
  'zugzwang.shop.v1': { coins: 125, themes: ['pixel', 'halloween'], pending: ['deck'] },
};

const summary = summarizeSave(Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, JSON.stringify(value)])));
assert.equal(summary.run.floor, 3);
assert.equal(summary.run.floors, 8);
assert.equal(summary.run.completedNodes, 2);
assert.equal(summary.run.completedFloors, 2);
assert.equal(summary.run.mutations, 2);
assert.equal(summary.run.cards, 2);
assert.equal(summary.run.suspended, true);
assert.equal(summary.achievements.unlocked, 2);
assert.equal(summary.achievements.total, ACHIEVEMENTS.length);
assert.equal(summary.achievements.percent, Math.round(200 / ACHIEVEMENTS.length));
assert.equal(summary.garden.size, 6);
assert.equal(summary.garden.planted, 12);
assert.equal(summary.garden.harvested, 5);
assert.equal(summary.garden.seeds, 1);
assert.equal(summary.economy.coins, 125);
assert.equal(summary.economy.tables, 2);
assert.equal(summary.unlocks.minigames, 2);
assert.equal(summary.unlocks.bosses, 1);
assert.equal(summary.unlocks.pieces, 3);
assert.equal(summary.unlocks.mutations, 2);
assert.equal(summary.statistics.find((item) => item.key === 'runsCompleted').value, 4);

const empty = summarizeSave({});
assert.equal(empty.run, null);
assert.equal(empty.achievements.unlocked, 0);
assert.equal(empty.garden.size, 4);
console.log('Save preview self-check passed.');
