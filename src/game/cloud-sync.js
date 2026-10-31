import { exportSave, inspectSave } from './backup.js';
import { summarizeSave } from './save-preview.js';
import { getSession, listSaves, saveSlot } from './cloud-api.js';

const META_KEY = 'kcc.cloud.sync.v1';
let timer = 0;
let running = false;

function readMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY) || 'null'); } catch { return null; }
}
function writeMeta(value) {
  try {
    value ? localStorage.setItem(META_KEY, JSON.stringify(value)) : localStorage.removeItem(META_KEY);
  } catch {}
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

export async function hashSnapshot(snapshot) {
  const text = JSON.stringify(canonical(snapshot));
  if (!globalThis.crypto?.subtle) return text;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function activateCloudSync({ ownerId, slot, revision, hash }) {
  writeMeta({ ownerId, slot, revision, hash, conflicted: false });
}

export function clearCloudSync() {
  clearTimeout(timer);
  writeMeta(null);
}

function conflict(detail) {
  const meta = readMeta();
  if (meta) writeMeta({ ...meta, conflicted: true, remoteRevision: detail?.revision ?? null });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zugzwang:cloud-conflict', { detail }));
  }
}

async function syncNow() {
  if (running) return;
  const meta = readMeta();
  if (!meta || meta.conflicted) return;
  running = true;
  try {
    const session = await getSession();
    if (!session.user || session.user.id !== meta.ownerId) return;

    const code = await exportSave();
    const parsed = await inspectSave(code);
    if (!parsed) return;
    const hash = await hashSnapshot(parsed.snapshot);
    if (hash === meta.hash) return;

    const result = await listSaves();
    const cloud = (result.saves || []).find((item) => item.slot === meta.slot);
    if (!cloud || cloud.revision !== meta.revision) {
      if (cloud && await hashSnapshot(cloud.state) === hash) {
        activateCloudSync({ ownerId: meta.ownerId, slot: meta.slot, revision: cloud.revision, hash });
        return;
      }
      conflict({ slot: meta.slot, revision: cloud?.revision ?? null, reason: cloud ? 'revision' : 'deleted' });
      return;
    }

    const updated = await saveSlot(meta.slot, {
      name: cloud.name || 'Avance',
      saveVersion: parsed.format,
      state: parsed.snapshot,
      summary: summarizeSave(parsed.snapshot),
      expectedRevision: meta.revision,
    });
    activateCloudSync({ ownerId: meta.ownerId, slot: meta.slot, revision: updated.save.revision, hash });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zugzwang:cloud-synced', { detail: { slot: meta.slot, revision: updated.save.revision } }));
    }
  } catch (error) {
    if (error?.status === 409) conflict({ slot: meta.slot, revision: error?.detail?.revision ?? null, reason: 'revision' });
    // Network errors are retried when the device comes online or the tab becomes visible.
  } finally {
    running = false;
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(syncNow, 1600);
}

export function startCloudSync() {
  // itch.io ejecuta el juego dentro de un iframe: allí la cuenta permanece desactivada.
  // Cualquier alojamiento estático abierto como página normal (GitHub Pages, Netlify, etc.) funciona.
  if (window.self !== window.top) return () => {};
  const changed = () => schedule();
  const online = () => schedule();
  const visible = () => { if (document.visibilityState === 'visible') schedule(); };
  window.addEventListener('zugzwang:save-changed', changed);
  window.addEventListener('online', online);
  document.addEventListener('visibilitychange', visible);
  schedule();
  return () => {
    clearTimeout(timer);
    window.removeEventListener('zugzwang:save-changed', changed);
    window.removeEventListener('online', online);
    document.removeEventListener('visibilitychange', visible);
  };
}
