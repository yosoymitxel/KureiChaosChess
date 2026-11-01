import { supabase, getEmailSignupConfig } from './supabase.js';
import { SAVE_KEYS, readSaveSnapshot, restoreSaveSnapshot, isValidSaveSnapshot } from '../game/backup.js';

export { supabase, getEmailSignupConfig };

const TABLE = 'game_saves';
const STATE_EVENT = 'kcc:cloud-state';
const watchedKeys = new Set(SAVE_KEYS);

let state = {
  status: 'signed-out',
  userId: null,
  email: null,
  message: 'Iniciá sesión para activar la sincronización.',
  updatedAt: null,
  conflict: null,
};
let started = false;
let currentUserId = null;
let ready = false;
let conflictRow = null;
let lastFingerprint = null;
let uploadTimer = null;
let uploading = false;
let uploadPending = false;

function publish(patch) {
  state = { ...state, ...patch };
  window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: state }));
}

export function getCloudState() {
  return { ...state };
}

export function subscribeCloudState(listener) {
  const handler = (event) => listener(event.detail);
  window.addEventListener(STATE_EVENT, handler);
  listener(getCloudState());
  return () => window.removeEventListener(STATE_EVENT, handler);
}

function fingerprint(snapshot) {
  const ordered = Object.fromEntries(Object.keys(snapshot || {}).sort().map((key) => [key, snapshot[key]]));
  return JSON.stringify(ordered);
}

function hasProgress(snapshot) {
  return Object.keys(snapshot || {}).some((key) => key !== 'zugzwang.settings.v2');
}

async function readRemote(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('save_data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function writeRemote(userId, snapshot) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({
      user_id: userId,
      save_data: snapshot,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('updated_at')
    .single();
  if (error) throw error;
  return data;
}

async function uploadSnapshot(userId, snapshot) {
  const saved = await writeRemote(userId, snapshot);
  if (userId !== currentUserId) return;
  lastFingerprint = fingerprint(snapshot);
  ready = true;
  conflictRow = null;
  publish({
    status: 'synced',
    message: 'Progreso sincronizado con Supabase.',
    updatedAt: saved.updated_at,
    conflict: null,
  });
}

async function initializeUser(userId, email) {
  ready = false;
  conflictRow = null;
  lastFingerprint = null;
  publish({ status: 'loading', userId, email, message: 'Comprobando el progreso local y el de la nube…', conflict: null });

  const remote = await readRemote(userId);
  if (userId !== currentUserId) return;
  const local = readSaveSnapshot();
  const localFingerprint = fingerprint(local);

  if (!remote) {
    if (Object.keys(local).length) {
      await uploadSnapshot(userId, local);
    } else {
      ready = true;
      lastFingerprint = localFingerprint;
      publish({ status: 'ready', message: 'Cuenta conectada. Los próximos cambios se guardarán automáticamente.', updatedAt: null, conflict: null });
    }
    return;
  }

  if (!isValidSaveSnapshot(remote.save_data)) throw new Error('El guardado remoto no tiene un formato válido.');
  const remoteFingerprint = fingerprint(remote.save_data);

  if (localFingerprint === remoteFingerprint) {
    ready = true;
    lastFingerprint = localFingerprint;
    publish({ status: 'synced', message: 'Progreso sincronizado con Supabase.', updatedAt: remote.updated_at, conflict: null });
    return;
  }

  if (!hasProgress(local)) {
    ready = false;
    const restored = restoreSaveSnapshot(remote.save_data);
    if (restored < 0) throw new Error('No se pudo validar el guardado remoto.');
    lastFingerprint = remoteFingerprint;
    ready = true;
    publish({ status: 'restored', message: 'Se recuperó el progreso de tu cuenta. Actualizando el juego…', updatedAt: remote.updated_at, conflict: null });
    window.setTimeout(() => window.location.reload(), 250);
    return;
  }

  if (!hasProgress(remote.save_data)) {
    await uploadSnapshot(userId, local);
    return;
  }

  conflictRow = remote;
  ready = false;
  publish({
    status: 'conflict',
    message: 'Hay progreso distinto en este dispositivo y en la nube. Elegí cuál conservar.',
    updatedAt: remote.updated_at,
    conflict: { updatedAt: remote.updated_at },
  });
}

async function switchSession(session) {
  const userId = session?.user?.id || null;
  if (userId === currentUserId) return;
  currentUserId = userId;
  ready = false;
  conflictRow = null;
  lastFingerprint = null;
  window.clearTimeout(uploadTimer);

  if (!userId) {
    publish({
      status: 'signed-out',
      userId: null,
      email: null,
      message: 'Iniciá sesión para activar la sincronización.',
      updatedAt: null,
      conflict: null,
    });
    return;
  }

  publish({ status: 'loading', userId, email: session.user.email || '', message: 'Conectando la cuenta…', updatedAt: null, conflict: null });
  try {
    await initializeUser(userId, session.user.email || '');
  } catch (error) {
    if (userId === currentUserId) {
      ready = false;
      publish({ status: 'error', message: 'No se pudo sincronizar: ' + (error?.message || String(error)), conflict: null });
    }
  }
}

async function uploadLocalChanges() {
  if (!ready || !currentUserId || conflictRow) return;
  if (uploading) {
    uploadPending = true;
    return;
  }

  uploading = true;
  try {
    const snapshot = readSaveSnapshot();
    if (fingerprint(snapshot) === lastFingerprint) return;
    publish({ status: 'saving', message: 'Guardando el progreso en la nube…' });
    await uploadSnapshot(currentUserId, snapshot);
  } catch (error) {
    publish({ status: 'error', message: 'El progreso sigue guardado en este dispositivo. No se pudo subir: ' + (error?.message || String(error)) });
  } finally {
    uploading = false;
    if (uploadPending) {
      uploadPending = false;
      scheduleLocalSync();
    }
  }
}

function scheduleLocalSync() {
  if (!ready || !currentUserId || conflictRow) return;
  window.clearTimeout(uploadTimer);
  uploadTimer = window.setTimeout(() => uploadLocalChanges(), 1200);
}

export async function refreshCloudSave() {
  if (!currentUserId) return;
  const userId = currentUserId;
  publish({ status: 'checking', message: 'Revisando la versión de la nube…' });
  const remote = await readRemote(userId);
  if (userId !== currentUserId) return;
  const local = readSaveSnapshot();

  if (!remote) {
    if (Object.keys(local).length) await uploadSnapshot(userId, local);
    else {
      ready = true;
      lastFingerprint = fingerprint(local);
      publish({ status: 'ready', message: 'No hay otro guardado en la nube todavía.', updatedAt: null, conflict: null });
    }
    return;
  }
  if (!isValidSaveSnapshot(remote.save_data)) throw new Error('El guardado remoto no tiene un formato válido.');

  const localFingerprint = fingerprint(local);
  const remoteFingerprint = fingerprint(remote.save_data);
  if (localFingerprint === remoteFingerprint) {
    ready = true;
    conflictRow = null;
    lastFingerprint = localFingerprint;
    publish({ status: 'synced', message: 'Este dispositivo ya tiene la última versión.', updatedAt: remote.updated_at, conflict: null });
    return;
  }

  if (!hasProgress(local)) {
    ready = false;
    const restored = restoreSaveSnapshot(remote.save_data);
    if (restored < 0) throw new Error('No se pudo validar el guardado remoto.');
    ready = true;
    conflictRow = null;
    lastFingerprint = remoteFingerprint;
    publish({ status: 'restored', message: 'Se recuperó el progreso de la nube. Actualizando el juego…', updatedAt: remote.updated_at, conflict: null });
    window.setTimeout(() => window.location.reload(), 250);
    return;
  }

  if (!hasProgress(remote.save_data)) {
    await uploadSnapshot(userId, local);
    return;
  }

  conflictRow = remote;
  ready = false;
  publish({
    status: 'conflict',
    message: 'Hay progreso distinto en este dispositivo y en la nube. Elegí cuál conservar.',
    updatedAt: remote.updated_at,
    conflict: { updatedAt: remote.updated_at },
  });
}

export async function resolveCloudConflict(choice) {
  if (!currentUserId || !conflictRow) throw new Error('No hay un conflicto pendiente.');
  if (choice === 'cloud') {
    ready = false;
    const restoredAt = conflictRow.updated_at;
    const restored = restoreSaveSnapshot(conflictRow.save_data);
    if (restored < 0) throw new Error('El guardado de la nube no es válido.');
    lastFingerprint = fingerprint(conflictRow.save_data);
    conflictRow = null;
    ready = true;
    publish({ status: 'restored', message: 'Se recuperó el progreso de la nube. Actualizando el juego…', updatedAt: restoredAt, conflict: null });
    window.setTimeout(() => window.location.reload(), 250);
    return;
  }
  if (choice === 'device') {
    const snapshot = readSaveSnapshot();
    await uploadSnapshot(currentUserId, snapshot);
    return;
  }
  throw new Error('Opción de sincronización desconocida.');
}

function installStorageObserver() {
  const proto = window.Storage?.prototype;
  if (!proto) return;

  if (!proto.__kccCloudSaveHook) {
    const nativeSetItem = proto.setItem;
    const nativeRemoveItem = proto.removeItem;
    try {
      Object.defineProperty(proto, '__kccCloudSaveHook', { value: true });
      proto.setItem = function (key, value) {
        const result = nativeSetItem.call(this, key, value);
        if (this === window.localStorage && watchedKeys.has(String(key))) scheduleLocalSync();
        return result;
      };
      proto.removeItem = function (key) {
        const result = nativeRemoveItem.call(this, key);
        if (this === window.localStorage && watchedKeys.has(String(key))) scheduleLocalSync();
        return result;
      };
    } catch {
      // The periodic snapshot check below remains as a fallback.
    }
  }

  window.addEventListener('storage', (event) => {
    if (event.storageArea === window.localStorage && (!event.key || watchedKeys.has(event.key))) scheduleLocalSync();
  });
}

export function startCloudSync() {
  if (started) return;
  started = true;
  installStorageObserver();

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    Promise.resolve().then(() => switchSession(session));
  });

  window.addEventListener('focus', () => {
    refreshCloudSave().catch((error) => publish({ status: 'error', message: 'No se pudo revisar la nube: ' + (error?.message || String(error)) }));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshCloudSave().catch((error) => publish({ status: 'error', message: 'No se pudo revisar la nube: ' + (error?.message || String(error)) }));
    }
  });

  window.setInterval(() => {
    if (!ready || !currentUserId || conflictRow) return;
    try {
      if (fingerprint(readSaveSnapshot()) !== lastFingerprint) scheduleLocalSync();
    } catch (error) {
      publish({ status: 'error', message: 'No se pudo leer el progreso local: ' + (error?.message || String(error)) });
    }
  }, 10000);

  supabase.auth.getSession().then(({ data: sessionData, error }) => {
    if (error) throw error;
    return switchSession(sessionData.session);
  }).catch((error) => publish({ status: 'error', message: 'No se pudo recuperar la sesión: ' + (error?.message || String(error)) }));

  return data.subscription;
}
