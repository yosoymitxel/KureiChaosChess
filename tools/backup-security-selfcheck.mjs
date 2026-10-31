import assert from 'node:assert/strict';
import { MAX_BACKUP_CODE_CHARS, exportSave, importSave } from '../src/game/backup.js';

class MemoryStorage {
  values = new Map();
  failWhen = null;
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.get(String(key)) ?? null; }
  setItem(key, value) {
    const k = String(key), v = String(value);
    if (this.failWhen?.(k, v)) throw new Error('Quota exceeded');
    this.values.set(k, v);
  }
  removeItem(key) { this.values.delete(String(key)); }
  clear() { this.values.clear(); }
}

globalThis.localStorage = new MemoryStorage();

const keySettings = 'zugzwang.settings.v2';
const keyShop = 'zugzwang.shop.v1';
const keyMinis = 'zugzwang.minis.v1';

function kcc1(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  return 'KCC1:' + Buffer.from(bytes).toString('base64');
}

async function kcc2(json) {
  const stream = new Blob([new TextEncoder().encode(json)]).stream().pipeThrough(new CompressionStream('deflate'));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  return 'KCC2:' + Buffer.from(bytes).toString('base64');
}

function resetStorage(values = {}) {
  localStorage.clear();
  for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
}

resetStorage();
const legacy = kcc1({
  [keySettings]: JSON.stringify({ theme: 'walnut', sound: true }),
  [keyMinis]: JSON.stringify(['witch', 'bowling']),
});
assert.equal(await importSave(legacy), 2, 'KCC1 backups must remain importable');
assert.equal(localStorage.getItem(keySettings), JSON.stringify({ theme: 'walnut', sound: true }));
assert.equal(localStorage.getItem(keyMinis), JSON.stringify(['witch', 'bowling']));

resetStorage({
  [keySettings]: JSON.stringify({ theme: 'walnut' }),
  [keyShop]: JSON.stringify({ coins: 12, pending: [], themes: [] }),
});
const exported = await exportSave();
assert.ok(exported.startsWith('KCC2:') || exported.startsWith('KCC1:'));
const exportedKeys = await importSave(exported);
assert.equal(exportedKeys, 2, 'Current backups must round-trip');

resetStorage({ [keySettings]: JSON.stringify({ theme: 'keep' }) });
const unknownKey = kcc1({
  [keySettings]: JSON.stringify({ theme: 'overwrite' }),
  'zugzwang.injected.v1': JSON.stringify({ injected: true }),
});
assert.equal(await importSave(unknownKey), 0, 'Unknown storage keys must be rejected');
assert.equal(localStorage.getItem(keySettings), JSON.stringify({ theme: 'keep' }));

const malformed = kcc1({ [keySettings]: '{not-json' });
assert.equal(await importSave(malformed), 0, 'Malformed JSON values must be rejected');
assert.equal(localStorage.getItem(keySettings), JSON.stringify({ theme: 'keep' }));

const prototypePayload = kcc1({ [keySettings]: '{"theme":"walnut","__proto__":{"admin":true}}' });
assert.equal(await importSave(prototypePayload), 0, 'Prototype-sensitive properties must be rejected');

const wrongRoot = kcc1({ [keySettings]: JSON.stringify(['not', 'an', 'object']) });
assert.equal(await importSave(wrongRoot), 0, 'Wrong root types must be rejected');

const tooDeep = { value: true };
let nested = tooDeep;
for (let i = 0; i < 45; i++) { nested.next = {}; nested = nested.next; }
const deepPayload = kcc1({ [keySettings]: JSON.stringify(tooDeep) });
assert.equal(await importSave(deepPayload), 0, 'Excessively nested data must be rejected');

assert.equal(await importSave('KCC1:' + 'A'.repeat(MAX_BACKUP_CODE_CHARS + 1)), 0, 'Oversized input must be rejected before decoding');

const bombJson = JSON.stringify({
  [keySettings]: JSON.stringify({ payload: 'A'.repeat(2 * 1024 * 1024 + 100) }),
});
const bombCode = await kcc2(bombJson);
assert.ok(bombCode.length < MAX_BACKUP_CODE_CHARS, 'Test bomb must pass the compressed-input limit');
resetStorage({ [keySettings]: JSON.stringify({ theme: 'safe' }) });
assert.equal(await importSave(bombCode), 0, 'Oversized decompressed data must be rejected');
assert.equal(localStorage.getItem(keySettings), JSON.stringify({ theme: 'safe' }));

resetStorage({
  [keySettings]: JSON.stringify({ theme: 'before' }),
  [keyShop]: JSON.stringify({ coins: 5, pending: [], themes: [] }),
});
const previousSettings = localStorage.getItem(keySettings);
const previousShop = localStorage.getItem(keyShop);
localStorage.failWhen = (key, value) => key === keyShop && value.includes('99');
const failingRestore = kcc1({
  [keySettings]: JSON.stringify({ theme: 'after' }),
  [keyShop]: JSON.stringify({ coins: 99, pending: [], themes: [] }),
});
assert.equal(await importSave(failingRestore), 0, 'A failed storage write must not report a successful restore');
assert.equal(localStorage.getItem(keySettings), previousSettings, 'Earlier writes must be rolled back');
assert.equal(localStorage.getItem(keyShop), previousShop, 'The failed key must retain its previous value');

resetStorage({
  [keySettings]: JSON.stringify({ theme: 'safe' }),
  'zugzwang.unlisted.v1': JSON.stringify({ ignored: true }),
});
const cleanExport = await exportSave();
resetStorage();
assert.equal(await importSave(cleanExport), 1, 'Export must include only the reviewed allowlist');
assert.equal(localStorage.getItem('zugzwang.unlisted.v1'), null);

console.log('Backup security checks passed: KCC1/KCC2 compatibility, allowlist, validation, decompression limits and rollback.');
