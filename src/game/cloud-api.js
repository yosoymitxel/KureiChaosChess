const SUPABASE_URL = 'https://fxjhuodttsbcyncpkcxb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LWVoByppthU1ihW1LvqdNA_CfSA2chx'; // gitleaks:allow -- public browser key; RLS protects every row.
const SAVE_FIELDS = 'id,slot,name,save_version,state,summary,revision,created_at,updated_at';

export class CloudApiError extends Error {
  constructor(message, status = 0, code = 'supabase', detail = null) {
    super(message); this.name = 'CloudApiError'; this.status = status; this.code = code; this.detail = detail;
  }
}

const createClient = globalThis.supabase?.createClient;
const client = typeof createClient === 'function'
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'kcc.supabase.auth.v1' },
    })
  : null;

function getClient() {
  if (!client) throw new CloudApiError('No se pudo cargar el cliente de Supabase. Revisá la conexión y recargá el juego.', 0, 'client_unavailable');
  return client;
}

function raise(error, fallback, operation = 'supabase') {
  if (!error) return;
  const duplicate = error.code === '23505';
  const status = duplicate ? 409 : Number(error.status) || 0;
  const code = duplicate ? 'save_conflict' : (error.code || operation);
  const message = duplicate
    ? 'La ranura ya contiene una copia. Actualizá la lista antes de sobrescribir.'
    : (typeof error.message === 'string' && error.message.length < 300 ? error.message : fallback);
  throw new CloudApiError(message || fallback, status, code, { details: error.details || null, hint: error.hint || null });
}

export async function getSession() {
  const { data, error } = await getClient().auth.getSession();
  raise(error, 'No se pudo consultar la sesión.', 'auth_session');
  return { user: data.session?.user || null };
}

export async function requestCode(email, mode) {
  const { error } = await getClient().auth.signInWithOtp({ email, options: { shouldCreateUser: mode === 'signup' } });
  raise(error, 'No se pudo enviar el código de acceso.', 'auth_otp');
  return { accepted: true };
}

export async function verifyCode(email, code) {
  const { data, error } = await getClient().auth.verifyOtp({ email, token: code, type: 'email' });
  raise(error, 'El código es incorrecto o venció.', 'auth_verify');
  if (!data.session || !data.user) throw new CloudApiError('Supabase no devolvió una sesión válida.', 0, 'auth_session');
  return { user: data.user };
}

export async function logout() {
  const { error } = await getClient().auth.signOut();
  raise(error, 'No se pudo cerrar la sesión.', 'auth_logout');
  return { ok: true };
}

export async function listSaves() {
  const { data, error } = await getClient().from('game_saves').select(SAVE_FIELDS).order('slot', { ascending: true });
  raise(error, 'No se pudieron cargar los avances de la cuenta.', 'cloud_read');
  return { saves: data || [] };
}

export async function saveSlot(slot, payload) {
  if (![1, 2, 3].includes(Number(slot))) throw new CloudApiError('Ranura de guardado inválida.', 400, 'slot');
  const record = {
    name: String(payload?.name || 'Avance').trim().slice(0, 60) || 'Avance',
    save_version: payload?.saveVersion, state: payload?.state, summary: payload?.summary,
  };
  const db = getClient().from('game_saves');
  if (payload?.expectedRevision == null) {
    const { data, error } = await db.insert({ slot: Number(slot), ...record }).select(SAVE_FIELDS).single();
    raise(error, 'No se pudo crear la copia en la nube.', 'cloud_write');
    return { save: data };
  }
  const expectedRevision = Number(payload.expectedRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) throw new CloudApiError('Revisión de guardado inválida.', 400, 'revision');
  const { data, error } = await db.update(record).eq('slot', Number(slot)).eq('revision', expectedRevision).select(SAVE_FIELDS).maybeSingle();
  raise(error, 'No se pudo actualizar la copia en la nube.', 'cloud_write');
  if (!data) {
    const { data: latest } = await getClient().from('game_saves').select('revision').eq('slot', Number(slot)).maybeSingle();
    throw new CloudApiError('La copia cambió desde la última sincronización. Actualizá la lista antes de continuar.', 409, 'save_conflict', { revision: latest?.revision ?? null });
  }
  return { save: data };
}

export async function deleteSlot(slot, revision) {
  const { data, error } = await getClient().rpc('delete_game_save', { p_slot: Number(slot), p_expected_revision: Number(revision) });
  raise(error, 'No se pudo borrar la copia de la nube.', 'cloud_delete');
  if (data !== true) throw new CloudApiError('La copia cambió o ya fue eliminada. Actualizá la lista antes de continuar.', 409, 'save_conflict');
  return { ok: true };
}