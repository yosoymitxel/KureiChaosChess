import { html, useState, useEffect } from '../lib.js';
import { t } from '../../i18n/index.js';

export function CloudAccount() {
  const [api, setApi] = useState(null);
  const [syncState, setSyncState] = useState({ status: 'loading', message: 'Cargando conexión segura…' });
  const [signupMode, setSignupMode] = useState('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    import('../../cloud/cloud-save.js').then(async (module) => {
      if (!active) return;
      module.startCloudSync();
      setApi(module);
      setSyncState(module.getCloudState());
      unsubscribe = module.subscribeCloudState(setSyncState);
      try {
        const config = await module.getEmailSignupConfig();
        if (!active) return;
        setSignupMode(config.autoConfirm && config.signupEnabled ? 'enabled' : 'disabled');
      } catch {
        if (active) setSignupMode('unknown');
      }
    }).catch(() => {
      if (active) {
        setSignupMode('unknown');
        setMessage(t('cloud.unavailable', 'La cuenta no está disponible ahora. El juego sigue guardando localmente.'));
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const runAuth = async (action) => {
    if (!api || busy) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return setMessage(t('cloud.credentialsRequired', 'Completá el correo y la contraseña.'));
    setBusy(true);
    setMessage('');
    try {
      if (action === 'signin') {
        const { error } = await api.supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        setPassword('');
        setMessage(t('cloud.signedIn', 'Sesión iniciada.'));
      } else {
        if (signupMode !== 'enabled') {
          throw new Error(t('cloud.signupBlocked', 'El registro está bloqueado hasta desactivar Confirm Email en Supabase. No se envió ningún correo.'));
        }
        const { data, error } = await api.supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
        if (!data.session) throw new Error(t('cloud.noSession', 'Supabase no devolvió una sesión inmediata. Revisá que Confirm Email siga desactivado.'));
        setPassword('');
        setMessage(t('cloud.created', 'Cuenta creada y sesión iniciada.'));
      }
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (!api || busy) return;
    setBusy(true);
    try {
      const { error } = await api.supabase.auth.signOut();
      if (error) throw error;
      setMessage(t('cloud.signedOut', 'Sesión cerrada. El progreso local se conserva.'));
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    if (!api || busy) return;
    setBusy(true);
    setMessage('');
    try {
      await api.refreshCloudSave();
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (choice) => {
    if (!api || busy) return;
    setBusy(true);
    setMessage('');
    try {
      await api.resolveCloudConflict(choice);
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  };

  const loggedIn = !!syncState.userId;

  return html`<section class="panel setup-card set-cloud" data-enter>
    <h2>${t('cloud.title', 'Cuenta y sincronización')}</h2>
    <p class="setup-note">${t('cloud.hint', 'Una cuenta sirve para compartir el progreso entre GitHub Pages e itch.io. Sin cuenta, el juego sigue guardando en este dispositivo.')}</p>

    ${!loggedIn ? html`<div class="cloud-fields">
      <label class="cloud-field">${t('cloud.email', 'Correo')}
        <input type="email" autocomplete="email" value=${email} onInput=${(event) => setEmail(event.currentTarget.value)} placeholder="correo@ejemplo.com" />
      </label>
      <label class="cloud-field">${t('cloud.password', 'Contraseña')}
        <input type="password" autocomplete="current-password" value=${password} onInput=${(event) => setPassword(event.currentTarget.value)} placeholder="Mínimo 6 caracteres" />
      </label>
    </div>
    <div class="cloud-actions">
      <button class="btn sm primary" disabled=${busy || !api} onClick=${() => runAuth('signin')}>${t('cloud.signin', 'Iniciar sesión')}</button>
      <button class="btn sm" disabled=${busy || !api || signupMode !== 'enabled'} onClick=${() => runAuth('signup')}>${t('cloud.signup', 'Crear cuenta')}</button>
    </div>
    ${signupMode === 'disabled' && html`<p class="cloud-warning" role="status">${t('cloud.confirmEmailOff', 'El registro sin correo no está habilitado. En Supabase: Auth → Providers → Email → desactivá Confirm Email. El botón de registro queda bloqueado hasta entonces; no se enviará ningún correo.')}</p>`}
    ${signupMode === 'unknown' && html`<p class="cloud-warning" role="status">${t('cloud.checkAuth', 'No se pudo comprobar la configuración de Auth. El inicio de sesión funciona, pero el registro queda bloqueado para evitar enviar correos.')}</p>`}
    ${signupMode === 'checking' && html`<p class="cloud-note">${t('cloud.checking', 'Comprobando que el registro no requiera correo…')}</p>`}` : html`<div class="cloud-profile">
      <div class="cloud-account-email"><strong>${t('cloud.connectedAs', 'Conectado como')}</strong><span>${syncState.email || email}</span></div>
      <div class="cloud-actions">
        <button class="btn sm" disabled=${busy} onClick=${refresh}>${t('cloud.refresh', 'Revisar nube')}</button>
        <button class="btn sm danger" disabled=${busy} onClick=${signOut}>${t('cloud.signout', 'Cerrar sesión')}</button>
      </div>
    </div>`}

    ${syncState.message && html`<p class="cloud-message" data-state=${syncState.status} role="status">${syncState.message}</p>`}
    ${syncState.status === 'conflict' && html`<div class="cloud-conflict">
      <p>${t('cloud.conflict', 'Hay dos versiones distintas. Elegí cuál conservar; la otra será reemplazada.')}</p>
      <div class="cloud-actions">
        <button class="btn sm primary" disabled=${busy} onClick=${() => resolve('cloud')}>${t('cloud.useCloud', 'Usar progreso de la nube')}</button>
        <button class="btn sm" disabled=${busy} onClick=${() => resolve('device')}>${t('cloud.useDevice', 'Subir este dispositivo')}</button>
      </div>
    </div>`}
    ${message && html`<p class="cloud-message" role="status">${message}</p>`}
    <p class="cloud-note">${t('cloud.noEmail', 'El correo identifica la cuenta. No se usan enlaces mágicos ni confirmaciones por correo. No hay recuperación de contraseña por correo en esta modalidad.')}</p>
  </section>`;
}
