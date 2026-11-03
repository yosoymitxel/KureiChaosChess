// Partida en la nube (Supabase): cuenta con correo y una fila por jugador en game_saves (RLS: cada
// uno solo ve la suya). Guarda el mismo código KCC de la copia local, así la validación es una sola.
// Sin SDK: fetch a Auth y a la REST, para que funcione igual en la web y en el zip de itch.io.
import { exportSave, decodeSave, importSave, localSaveData, sameProgress } from './backup.js';

const URL_ = 'https://fxjhuodttsbcyncpkcxb.supabase.co';
const KEY = 'sb_publishable_LWVoByppthU1ihW1LvqdNA_CfSA2chx';
const SESSION = 'kurei.cloud.session';
// El enlace del correo vuelve siempre a la web (desde el zip de itch.io no hay URL estable); luego se entra con la contraseña.
const BACK = 'https://yosoymitxel.github.io/KureiChaosChess/';

const load = () => { try { return JSON.parse(localStorage.getItem(SESSION)); } catch { return null; } };
// Fecha de la última copia de la nube que este aparato subió o aplicó: si la nube sigue en esa fecha,
// el guardado automático puede subir sin pisar lo de otro aparato.
const SYNCED = 'kurei.cloud.synced';
const synced = () => { try { return localStorage.getItem(SYNCED) || null; } catch { return null; } };
// BASE: la copia de esa fecha, para saber si este aparato avanzó desde entonces.
const BASE = 'kurei.cloud.base';
export const cloudMarkSynced = (at, code) => {
  try {
    at ? localStorage.setItem(SYNCED, at) : localStorage.removeItem(SYNCED);
    code && at ? localStorage.setItem(BASE, code) : !at && localStorage.removeItem(BASE);
  } catch {}
  return at;
};
const keep = (s) => { try { s ? localStorage.setItem(SESSION, JSON.stringify(s)) : localStorage.removeItem(SESSION); } catch {} return s; };

async function call(path, { method = 'GET', body, token, prefer } = {}) {
  const headers = { apikey: KEY, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(URL_ + path, { method, headers, body: body && JSON.stringify(body), signal: AbortSignal.timeout?.(10000) });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw Object.assign(new Error(data?.msg || data?.message || data?.error_description || 'HTTP ' + res.status), { code: data?.error_code || data?.code, status: res.status });
  return data;
}

const toSession = (d) => d?.access_token && keep({ token: d.access_token, refresh: d.refresh_token, until: Date.now() + (d.expires_in - 60) * 1000, id: d.user.id, email: d.user.email });

export const cloudUser = () => load()?.email || null;

// Token vigente; lo renueva si caducó. Sin sesión válida, la borra y devuelve null.
async function session() {
  const s = load();
  if (!s) return null;
  if (Date.now() < s.until) return s;
  try { return toSession(await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh } })); }
  catch (e) { if (e.status === 400 || e.status === 401) keep(null); throw e; }
}

// 'in' = sesión abierta · 'confirm' = cuenta creada, falta confirmar el correo.
export async function signIn(email, password) {
  toSession(await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }));
  return 'in';
}
export async function signUp(email, password) {
  const d = await call('/auth/v1/signup?redirect_to=' + encodeURIComponent(BACK), { method: 'POST', body: { email, password } });
  return toSession(d) ? 'in' : 'confirm';
}
export async function signOut() {
  const s = load();
  keep(null);
  cloudMarkSynced(null);
  if (s) call('/auth/v1/logout', { method: 'POST', token: s.token }).catch(() => {});
}

let lastCode = null;
// Por qué se paró el guardado automático: 'clash' (otro aparato subió antes) o 'auth' (sesión caducada).
export let cloudStopped = null;
const saved = (code, rows) => { lastCode = code; cloudStopped = null; return cloudMarkSynced(rows?.[0]?.updated_at || new Date().toISOString(), code); };

export async function cloudUpload(code) {
  const s = await session();
  if (!s) throw new Error('auth');
  code ||= await exportSave();
  const rows = await call('/rest/v1/game_saves?on_conflict=user_id', { method: 'POST', token: s.token, prefer: 'resolution=merge-duplicates,return=representation', body: { user_id: s.id, save_data: { code }, updated_at: new Date().toISOString() } });
  return saved(code, rows);
}

// Guardado automático con sesión abierta: sube solo si la nube sigue en la última copia de este aparato.
// PATCH condicionado a esa fecha (sin hueco entre leer y escribir): 0 filas = otro aparato subió antes.
let timer;
export function cloudAutoSave(delay = 3000) {
  if (!load()) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const code = await exportSave();
      if (code === lastCode) return;
      const s = await session();
      if (!s) { cloudStopped = 'auth'; return; }
      const mine = synced(), body = { save_data: { code }, updated_at: new Date().toISOString() };
      const rows = mine
        ? await call(`/rest/v1/game_saves?user_id=eq.${s.id}&updated_at=eq.${encodeURIComponent(mine)}`, { method: 'PATCH', token: s.token, prefer: 'return=representation', body })
        : await call('/rest/v1/game_saves', { method: 'POST', token: s.token, prefer: 'return=representation', body: { user_id: s.id, ...body } }).catch((e) => { if (e.status === 409) return []; throw e; });
      if (rows?.length) saved(code, rows);
      else cloudStopped = 'clash';
    } catch (e) { if (e.status === 400 || e.status === 401) cloudStopped = 'auth'; }
  }, delay);
}

// Lo que hay en la nube sin aplicarlo: { code, at } o null.
export async function cloudPeek() {
  const s = await session();
  if (!s) throw new Error('auth');
  const rows = await call(`/rest/v1/game_saves?select=save_data,updated_at&user_id=eq.${s.id}`, { token: s.token });
  return rows[0]?.save_data?.code ? { code: rows[0].save_data.code, at: rows[0].updated_at } : null;
}

// Al abrir el juego o volver a la pestaña: si otro aparato subió algo nuevo y este no avanzó desde
// su última copia, se trae solo y recarga. Si los dos avanzaron, se para y Ajustes pregunta.
export async function cloudAutoPull() {
  if (!load()) return false;
  try {
    const peek = await cloudPeek();
    if (!peek || peek.at === synced()) return false;
    const remote = await decodeSave(peek.code);
    if (!remote) return false;
    const local = localSaveData();
    if (sameProgress(local, remote)) { cloudMarkSynced(peek.at, peek.code); return false; }
    let base = null;
    try { base = await decodeSave(localStorage.getItem(BASE)); } catch {}
    if (!base || !sameProgress(local, base)) { cloudStopped = 'clash'; return false; }
    if (!await importSave(peek.code)) return false;
    cloudMarkSynced(peek.at, peek.code);
    lastCode = null;
    return true;
  } catch (e) { if (e.status === 400 || e.status === 401 || e.message === 'auth') cloudStopped = 'auth'; return false; }
}

// Vuelta desde el enlace del correo: la sesión llega en el hash; se guarda y se limpia la URL.
try {
  const h = new URLSearchParams(location.hash.slice(1));
  // Solo la confirmación de una cuenta nueva y sin otra sesión abierta: un enlace ajeno no cambia de cuenta.
  if (h.get('access_token') && h.get('type') === 'signup' && !load()) {
    const p = JSON.parse(atob(h.get('access_token').split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    toSession({ access_token: h.get('access_token'), refresh_token: h.get('refresh_token'), expires_in: +h.get('expires_in') || 3600, user: { id: p.sub, email: p.email } });
    history.replaceState(null, '', location.pathname + location.search);
  }
} catch {}
