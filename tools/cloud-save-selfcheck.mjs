import assert from 'node:assert/strict';

const values = new Map();
globalThis.localStorage = {
  getItem(key) { return values.has(key) ? values.get(key) : null; },
  setItem(key, value) { values.set(String(key), String(value)); },
  removeItem(key) { values.delete(String(key)); },
};

const { SAVE_KEYS, readSaveSnapshot, restoreSaveSnapshot, isValidSaveSnapshot } = await import('../src/game/backup.js');

localStorage.setItem('zugzwang.run.v2', JSON.stringify({ seed: 42, currentFloor: 3, completed: { a: true } }));
localStorage.setItem('zugzwang.achievements.v1', JSON.stringify(['first_win']));
localStorage.setItem('zugzwang.settings.v2', JSON.stringify({ theme: 'walnut' }));
localStorage.setItem('unrelated.session', 'must-not-leave-device');

const snapshot = readSaveSnapshot();
assert.deepEqual(Object.keys(snapshot).sort(), ['zugzwang.achievements.v1', 'zugzwang.run.v2', 'zugzwang.settings.v2']);
assert.equal(SAVE_KEYS.length, 11);
assert.equal(isValidSaveSnapshot(snapshot), true);

localStorage.setItem('zugzwang.run.v2', JSON.stringify({ seed: 99 }));
localStorage.removeItem('zugzwang.achievements.v1');
assert.equal(restoreSaveSnapshot(snapshot), 3);
assert.equal(JSON.parse(localStorage.getItem('zugzwang.run.v2')).seed, 42);
assert.deepEqual(JSON.parse(localStorage.getItem('zugzwang.achievements.v1')), ['first_win']);
assert.equal(localStorage.getItem('unrelated.session'), 'must-not-leave-device');

const invalid = { ...snapshot, 'unexpected.key': '{}' };
assert.equal(isValidSaveSnapshot(invalid), false);
assert.equal(restoreSaveSnapshot(invalid), -1);
assert.equal(restoreSaveSnapshot({}), 0);

console.log('Cloud save snapshot validation: OK');
