// Copias locales KCC1/KCC2. El formato y la persistencia existentes se mantienen.
const MAGIC_V1 = 'KCC1:';
const MAGIC_V2 = 'KCC2:';
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const MAX_COMPRESSED_BYTES = MAX_BACKUP_BYTES + 64 * 1024;
export const MAX_BACKUP_CODE_CHARS = MAGIC_V2.length + Math.ceil(MAX_COMPRESSED_BYTES / 3) * 4;

const KEY_LIMITS = Object.freeze({
  'zugzwang.run.v2': 768 * 1024,
  'zugzwang.settings.v2': 64 * 1024,
  'zugzwang.minis.v1': 64 * 1024,
  'zugzwang.bosses.v1': 64 * 1024,
  'zugzwang.demoed.v1': 64 * 1024,
  'zugzwang.achievements.v1': 64 * 1024,
  'zugzwang.stats.v1': 128 * 1024,
  'zugzwang.seen.v1': 64 * 1024,
  'zugzwang.mutseen.v1': 64 * 1024,
  'zugzwang.zen.v1': 768 * 1024,
  'zugzwang.shop.v1': 128 * 1024,
});

const ROOT_TYPES = Object.freeze({
  'zugzwang.run.v2': 'object',
  'zugzwang.settings.v2': 'object',
  'zugzwang.minis.v1': 'array',
  'zugzwang.bosses.v1': 'array',
  'zugzwang.demoed.v1': 'object',
  'zugzwang.achievements.v1': 'array',
  'zugzwang.stats.v1': 'object',
  'zugzwang.seen.v1': 'array',
  'zugzwang.mutseen.v1': 'array',
  'zugzwang.zen.v1': 'object',
  'zugzwang.shop.v1': 'object',
});

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function toBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value, maxBytes) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.length > Math.ceil(maxBytes / 3) * 4 ||
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
  ) throw new Error('Invalid base64');

  const binary = atob(value);
  if (binary.length > maxBytes) throw new Error('Backup is too large');

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function readStreamLimited(stream, maxBytes) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error('Decompressed backup is too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return decoder.decode(bytes);
}

async function inflate(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('Decompression unavailable');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  return readStreamLimited(stream, MAX_BACKUP_BYTES);
}

function inspectJson(value) {
  const pending = [{ value, depth: 0 }];
  let visited = 0;

  while (pending.length) {
    const current = pending.pop();
    const item = current.value;
    visited++;

    if (visited > 50000 || current.depth > 40) return false;

    if (typeof item === 'string') {
      if (item.length > 100000) return false;
      continue;
    }
    if (typeof item === 'number') {
      if (!Number.isFinite(item) || Math.abs(item) > 1e15) return false;
      continue;
    }
    if (typeof item === 'boolean' || item === null) continue;

    if (Array.isArray(item)) {
      if (item.length > 10000) return false;
      for (const child of item) pending.push({ value: child, depth: current.depth + 1 });
      continue;
    }

    if (typeof item !== 'object' || Object.getPrototypeOf(item) !== Object.prototype) return false;
    const keys = Object.keys(item);
    if (keys.length > 5000) return false;

    for (const key of keys) {
      if (
        key.length > 256 ||
        key === '__proto__' ||
        key === 'prototype' ||
        key === 'constructor'
      ) return false;
      pending.push({ value: item[key], depth: current.depth + 1 });
    }
  }

  return true;
}

function validateSnapshot(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const keys = Object.keys(data);
  if (!keys.length || keys.length > Object.keys(KEY_LIMITS).length) return null;

  for (const key of keys) {
    const byteLimit = KEY_LIMITS[key];
    const serialized = data[key];
    if (byteLimit === undefined || typeof serialized !== 'string') return null;
    if (encoder.encode(serialized).byteLength > byteLimit) return null;

    let parsed;
    try {
      parsed = JSON.parse(serialized);
    } catch {
      return null;
    }

    const expected = ROOT_TYPES[key];
    if (
      expected === 'array'
        ? !Array.isArray(parsed)
        : !parsed || typeof parsed !== 'object' || Array.isArray(parsed)
    ) return null;

    if (!inspectJson(parsed)) return null;
  }

  return keys;
}

function saveData() {
  const data = {};
  for (const key of Object.keys(KEY_LIMITS)) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return JSON.stringify(data);
}

export async function exportSave() {
  const json = saveData();
  const bytes = encoder.encode(json);
  if (bytes.byteLength > MAX_BACKUP_BYTES) throw new Error('Backup is too large');

  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
      const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
      if (compressed.byteLength <= MAX_COMPRESSED_BYTES) return MAGIC_V2 + toBase64(compressed);
    } catch {
      // KCC1 remains the portable fallback.
    }
  }

  return MAGIC_V1 + toBase64(bytes);
}

// Decodifica y valida sin escribir en localStorage; permite comparar antes de restaurar.
export async function inspectSave(code) {
  try {
    if (typeof code !== 'string') return null;
    const text = code.trim();
    if (!text || text.length > MAX_BACKUP_CODE_CHARS) return null;
    let json, format;
    if (text.startsWith(MAGIC_V2)) {
      json = await inflate(fromBase64(text.slice(MAGIC_V2.length), MAX_COMPRESSED_BYTES));
      format = 2;
    } else if (text.startsWith(MAGIC_V1)) {
      json = decoder.decode(fromBase64(text.slice(MAGIC_V1.length), MAX_BACKUP_BYTES));
      format = 1;
    } else return null;
    if (encoder.encode(json).byteLength > MAX_BACKUP_BYTES) return null;
    const raw = JSON.parse(json), keys = validateSnapshot(raw);
    if (!keys) return null;
    const snapshot = {};
    for (const key of keys) snapshot[key] = JSON.parse(raw[key]);
    return { format, keys, snapshot };
  } catch { return null; }
}

// Writes a validated structured snapshot. Cloud restores use this same allowlist and rollback path.
async function restoreValidatedSnapshot(data, { replace = false } = {}) {
  const keys = validateSnapshot(data);
  if (!keys) return 0;
  const touched = replace ? Object.keys(KEY_LIMITS) : keys;
  const previous = new Map(touched.map((key) => [key, localStorage.getItem(key)]));
  try {
    for (const key of touched) {
      if (Object.prototype.hasOwnProperty.call(data, key)) localStorage.setItem(key, data[key]);
      else localStorage.removeItem(key);
    }
  } catch {
    for (const key of touched) {
      try {
        const oldValue = previous.get(key);
        if (oldValue === null) localStorage.removeItem(key);
        else localStorage.setItem(key, oldValue);
      } catch {
        // Best-effort rollback; localStorage has no multi-key transaction.
      }
    }
    return 0;
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('zugzwang:save-changed'));
  return keys.length;
}

export async function restoreSnapshot(snapshot, options = {}) {
  try {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return 0;
    const data = {};
    for (const [key, value] of Object.entries(snapshot)) {
      if (typeof value === 'string') return 0;
      data[key] = JSON.stringify(value);
    }
    return await restoreValidatedSnapshot(data, options);
  } catch {
    return 0;
  }
}

// Returns the number of restored keys, or 0 without changing storage when validation fails.
export async function importSave(code, options = {}) {
  try {
    if (typeof code !== 'string') return 0;
    const text = code.trim();
    if (!text || text.length > MAX_BACKUP_CODE_CHARS) return 0;
    let json;
    if (text.startsWith(MAGIC_V2)) {
      json = await inflate(fromBase64(text.slice(MAGIC_V2.length), MAX_COMPRESSED_BYTES));
    } else if (text.startsWith(MAGIC_V1)) {
      json = decoder.decode(fromBase64(text.slice(MAGIC_V1.length), MAX_BACKUP_BYTES));
    } else return 0;
    if (encoder.encode(json).byteLength > MAX_BACKUP_BYTES) return 0;
    const data = JSON.parse(json);
    return await restoreValidatedSnapshot(data, options);
  } catch {
    return 0;
  }
}
