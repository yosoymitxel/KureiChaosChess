import { html, useEffect, useRef, useState } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { exportSave, inspectSave, restoreSnapshot } from '../../game/backup.js';
import { summarizeSave } from '../../game/save-preview.js';
import { activateCloudSync, clearCloudSync, hashSnapshot } from '../../game/cloud-sync.js';
import { getSession, requestCode, verifyCode, logout, listSaves, saveSlot, deleteSlot } from '../../game/cloud-api.js';

const metric = (value, label) => html`<div class="account-metric"><b>${value}</b><small>${label}</small></div>`;
const dateLabel = (value) => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toLocaleString() : '—';
};
const metrics = (summary) => [
  ['Piso', summary.run ? `${summary.run.floor}${summary.run.floors ? ' / ' + summary.run.floors : ''}` : 'Sin run'],
  ['Nodos superados', summary.run?.completedNodes ?? 0],
  ['Logros', `${summary.achievements.unlocked}/${summary.achievements.total} · ${summary.achievements.percent}%`],
  ['Monedas', summary.economy.coins],
  ['Jardín', `${summary.garden.size}×${summary.garden.size} · ${summary.garden.harvested} flores`],
  ['Mutaciones en la run', summary.run?.mutations ?? 0],
  ['Cartas en mano', summary.run?.cards ?? 0],
  ['Contenido', summary.unlocks.minigames + summary.unlocks.bosses + summary.unlocks.pieces],
];

function SummaryPanel({ title, subtitle, summary }) {
  if (!summary) return html`<section class="panel account-panel"><h3>${title}</h3><p class="account-muted">${subtitle || 'No hay un avance válido disponible en este origen.'}</p></section>`;
  return html`<section class="panel account-panel">
    <div class="account-panel-head"><div><h3>${title}</h3><p class="account-muted">${subtitle || 'Resumen del estado completo'}</p></div></div>
    <div class="account-metrics">${metrics(summary).map(([label, value]) => metric(value, label))}</div>
    <div class="account-groups">
      <strong>Logros por categoría</strong>
      ${summary.achievements.groups.map((group) => html`<div class="account-group"><span>${group.name}</span><b>${group.unlocked}/${group.total}</b></div>`)}
    </div>
    <div class="account-achievements">
      <strong>Desbloqueados (${summary.achievements.items.length})</strong>
      <div>${summary.achievements.items.length
        ? summary.achievements.items.map((item) => html`<span class="account-chip" title=${item.group}>${item.name}</span>`)
        : html`<span class="account-muted">Todavía no hay logros desbloqueados.</span>`}</div>
    </div>
    <div class="account-stats"><strong>Estadísticas registradas</strong><div>${summary.statistics.length
      ? summary.statistics.map((item) => html`<span>${item.key.replace(/([A-Z])/g, ' $1')}: <b>${item.value}</b></span>`)
      : html`<span class="account-muted">Sin estadísticas adicionales.</span>`}</div></div>
  </section>`;
}

export function AccountScreen({ onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('signin');
  const [code, setCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [local, setLocal] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [saveName, setSaveName] = useState('Avance');
  const [confirmAction, setConfirmAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [syncConflict, setSyncConflict] = useState(false);

  const refresh = async () => {
    const session = await getSession();
    setUser(session.user || null);
    const code = await exportSave();
    const parsed = await inspectSave(code);
    setLocal(parsed ? { snapshot: parsed.snapshot, summary: summarizeSave(parsed.snapshot), format: parsed.format } : null);
    if (session.user) {
      const result = await listSaves();
      setSlots(result.saves || []);
      const active = (() => {
        try { return JSON.parse(localStorage.getItem('kcc.cloud.sync.v1') || 'null'); } catch { return null; }
      })();
      setSyncConflict(!!active?.conflicted);
    } else {
      setSlots([]);
      setSyncConflict(false);
    }
    return session.user || null;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try { await refresh(); }
      catch (cause) { if (alive) setError(cause.message || 'No se pudo cargar la cuenta.'); }
      finally { if (alive) setLoading(false); }
    })();
    const onConflict = () => { if (alive) setSyncConflict(true); };
    window.addEventListener('zugzwang:cloud-conflict', onConflict);
    return () => {
      alive = false;
      window.removeEventListener('zugzwang:cloud-conflict', onConflict);
    };
  }, []);

  const selected = slots.find((item) => item.slot === selectedSlot) || null;

  const sendCode = async () => {
    setError(''); setMessage('');
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Ingresá un correo válido.');
      return;
    }
    setBusy(true);
    try {
      await requestCode(normalized, mode);
      setEmail(normalized);
      setCodeRequested(true);
      setMessage('Si el correo puede registrarse o iniciar sesión, recibirá un código de seis dígitos.');
    } catch (cause) {
      setError(cause.message || 'No se pudo solicitar el código.');
    } finally { setBusy(false); }
  };

  const confirmCode = async () => {
    setError(''); setMessage('');
    if (!/^\d{6}$/.test(code.trim())) {
      setError('El código debe tener seis dígitos.');
      return;
    }
    setBusy(true);
    try {
      await verifyCode(email.trim().toLowerCase(), code.trim());
      setCodeRequested(false);
      setCode('');
      await refresh();
      setMessage('Sesión iniciada. Tus avances en la nube están disponibles abajo.');
    } catch (cause) {
      setError(cause.message || 'No se pudo verificar el código.');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      await logout();
      clearCloudSync();
      setUser(null); setSlots([]); setSyncConflict(false);
      setMessage('Sesión cerrada. El avance de este dispositivo permanece intacto.');
    } catch (cause) { setError(cause.message || 'No se pudo cerrar la sesión.'); }
    finally { setBusy(false); }
  };

  const runAction = async (action) => {
    setBusy(true); setError(''); setMessage('');
    try {
      if (action === 'upload') {
        if (!local) throw new Error('No hay un avance local válido para subir.');
        const saved = await saveSlot(selectedSlot, {
          name: saveName.trim() || 'Avance',
          saveVersion: local.format,
          state: local.snapshot,
          summary: local.summary,
          expectedRevision: selected?.revision ?? null,
        });
        const snapshotHash = await hashSnapshot(local.snapshot);
        activateCloudSync({ ownerId: user.id, slot: selectedSlot, revision: saved.save.revision, hash: snapshotHash });
        await refresh();
        setSyncConflict(false);
        setMessage(`Avance enviado a la nube. Ranura ${selectedSlot}, revisión ${saved.save.revision}. La sincronización automática queda activa.`);
      } else if (action === 'download') {
        if (!selected) throw new Error('La ranura ya no existe.');
        const restored = await restoreSnapshot(selected.state, { replace: true });
        if (!restored) throw new Error('El estado remoto no pasó la validación local; no se modificó el dispositivo.');
        const snapshotHash = await hashSnapshot(selected.state);
        activateCloudSync({ ownerId: user.id, slot: selectedSlot, revision: selected.revision, hash: snapshotHash });
        setMessage('Avance descargado. Se recargará el juego con el estado de esta ranura.');
        setTimeout(() => location.reload(), 600);
      } else if (action === 'delete') {
        if (!selected) throw new Error('La ranura ya no existe.');
        await deleteSlot(selectedSlot, selected.revision);
        const active = (() => { try { return JSON.parse(localStorage.getItem('kcc.cloud.sync.v1') || 'null'); } catch { return null; } })();
        if (active?.slot === selectedSlot && active?.ownerId === user.id) clearCloudSync();
        await refresh();
        setMessage('Copia eliminada de la nube. El avance local no se modificó.');
      }
      setConfirmAction('');
    } catch (cause) {
      if (cause.code === 'save_conflict' || cause.status === 409) {
        setError('La ranura cambió desde la última lectura. Actualicé la lista; compará otra vez antes de sobrescribir.');
        try { await refresh(); } catch {}
        setConfirmAction('');
      } else setError(cause.message || 'La operación no se pudo completar.');
    } finally { setBusy(false); }
  };

  const activateExisting = async () => {
    if (!selected || !local) return;
    setError(''); setMessage('');
    try {
      const currentHash = await hashSnapshot(local.snapshot);
      const remoteHash = await hashSnapshot(selected.state);
      if (currentHash !== remoteHash) {
        setError('Los avances son distintos. Primero elegí subir el dispositivo o descargar la copia de la nube.');
        return;
      }
      activateCloudSync({ ownerId: user.id, slot: selectedSlot, revision: selected.revision, hash: currentHash });
      setSyncConflict(false);
      setMessage('Sincronización automática activada para esta ranura.');
    } catch (cause) { setError(cause.message || 'No se pudo activar la sincronización.'); }
  };

  return html`<div class="screen account" ref=${ref}>
    <${Topbar} title="Cuenta y nube" sub="Identidad, copias sincronizadas y recuperación de partidas" onBack=${onBack} />
    <div class="account-body">
      ${loading && html`<p class="account-muted">Cargando cuenta y avances…</p>`}
      ${!user && !loading && html`
        <section class="panel account-panel">
          <div class="account-title-row"><div><h2>Cuenta de jugador</h2><p class="account-muted">Registrate o iniciá sesión para guardar tus partidas entre dispositivos.</p></div><${Icon} name="cloud" size=${24} /></div>
          <div class="account-mode" role="group" aria-label="Tipo de acceso">
            <button class=${mode === 'signin' ? 'on' : ''} aria-pressed=${mode === 'signin'} disabled=${busy || codeRequested} onClick=${() => setMode('signin')}>Iniciar sesión</button>
            <button class=${mode === 'signup' ? 'on' : ''} aria-pressed=${mode === 'signup'} disabled=${busy || codeRequested} onClick=${() => setMode('signup')}>Crear cuenta</button>
          </div>
          <label class="account-label">Correo electrónico</label>
          <input class="account-input" type="email" autocomplete="email" maxlength="254" value=${email} disabled=${busy || codeRequested} placeholder="tu@correo.com" onInput=${(event) => setEmail(event.currentTarget.value)} />
          ${codeRequested ? html`
            <label class="account-label">Código de seis dígitos</label>
            <input class="account-input account-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value=${code} disabled=${busy} placeholder="000000" onInput=${(event) => setCode(event.currentTarget.value.replace(/\D/g, '').slice(0, 6))} />
            <div class="account-actions">
              <button class="btn primary" disabled=${busy || code.length !== 6} onClick=${confirmCode}>${busy ? 'Verificando…' : 'Verificar e iniciar sesión'}</button>
              <button class="btn ghost" disabled=${busy} onClick=${sendCode}>Reenviar código</button>
              <button class="btn ghost" disabled=${busy} onClick=${() => { setCodeRequested(false); setCode(''); setMessage(''); }} >Cambiar correo</button>
            </div>
          ` : html`
            <button class="btn primary" disabled=${busy || !email.trim()} onClick=${sendCode}>${busy ? 'Enviando…' : mode === 'signup' ? 'Enviar código de registro' : 'Enviar código de acceso'}</button>
          `}
          <p class="account-help">La cuenta usa un código temporal por correo. El juego mantiene la copia local; la nube guarda snapshots completos, no mezcla logros ni monedas.</p>
        </section>
      `}
      ${user && html`
        <section class="panel account-panel account-user">
          <div><small>Sesión activa</small><strong>${user.email}</strong><span>Identificador: ${user.id}</span></div>
          <button class="btn sm ghost" disabled=${busy} onClick=${signOut}>Cerrar sesión</button>
        </section>
        ${syncConflict && html`<p class="account-warning" role="alert">Conflicto detectado: este dispositivo y la nube cambiaron por separado. La sincronización automática está pausada. Elegí qué snapshot conservar abajo.</p>`}
        <section class="account-section">
          <div class="account-section-head"><div><h2>Copias de seguridad en la nube</h2><p class="account-muted">Tres ranuras independientes. Cada una conserva una partida completa.</p></div><button class="btn sm ghost" disabled=${busy} onClick=${async () => { setBusy(true); try { await refresh(); setError(''); } catch (cause) { setError(cause.message); } finally { setBusy(false); } }}><${Icon} name="refresh" size=${15} />Actualizar</button></div>
          <div class="account-slots">
            ${[1, 2, 3].map((slot) => {
              const item = slots.find((entry) => entry.slot === slot);
              return html`<button class=${'account-slot' + (selectedSlot === slot ? ' selected' : '')} aria-pressed=${selectedSlot === slot} onClick=${() => { setSelectedSlot(slot); setSaveName(item?.name || 'Avance'); setConfirmAction(''); setError(''); }}>
                <b>Ranura ${slot}</b><strong>${item?.name || 'Vacía'}</strong><small>${item ? 'Actualizada ' + dateLabel(item.updated_at) : 'Sin copia en la nube'}</small><span>${item ? `Revisión ${item.revision}` : 'Disponible'}</span>
              </button>`;
            })}
          </div>
          <div class="account-comparison">
            <div><h3>Este dispositivo</h3><p class="account-muted">${local ? 'Snapshot local actual' : 'No hay copia local válida'}</p></div>
            <div><h3>Nube · ranura ${selectedSlot}</h3><p class="account-muted">${selected ? `Guardado ${dateLabel(selected.updated_at)} · revisión ${selected.revision}` : 'Ranura sin guardar'}</p></div>
          </div>
          <div class="account-summary-grid">
            <${SummaryPanel} title="Avance local" subtitle="Estado actual de este navegador" summary=${local?.summary} />
            <${SummaryPanel} title=${selected ? selected.name : 'Ranura vacía'} subtitle=${selected ? 'Copia vinculada a tu cuenta' : 'Todavía no contiene un snapshot'} summary=${selected ? summarizeSave(selected.state) : null} />
          </div>
          <div class="account-slot-controls">
            <label class="account-label">Nombre de la copia</label>
            <input class="account-input" maxlength="60" value=${saveName} disabled=${busy} onInput=${(event) => setSaveName(event.currentTarget.value)} />
            <div class="account-actions">
              <button class="btn primary" disabled=${busy || !local} onClick=${() => selected ? setConfirmAction('upload') : runAction('upload')}>Subir dispositivo a la nube</button>
              <button class="btn" disabled=${busy || !selected} onClick=${() => setConfirmAction('download')}>Descargar nube a este dispositivo</button>
              <button class="btn ghost" disabled=${busy || !selected} onClick=${activateExisting}>Activar sincronización</button>
              <button class="btn ghost danger" disabled=${busy || !selected} onClick=${() => setConfirmAction('delete')}>Eliminar copia</button>
            </div>
            ${confirmAction && html`
              <div class="account-confirm" role="alert">
                <strong>${confirmAction === 'upload' ? 'Reemplazar la copia en la nube' : confirmAction === 'download' ? 'Reemplazar el avance local' : 'Eliminar la copia remota'}</strong>
                <p>${confirmAction === 'upload'
                  ? 'Se guardará el estado completo de este dispositivo en la ranura elegida. La versión anterior dejará de ser la versión actual.'
                  : confirmAction === 'download'
                    ? 'Se reemplazarán los datos locales del navegador por el snapshot remoto, incluidos run, jardín, monedas, desbloqueos y logros.'
                    : 'Se eliminará esta ranura de tu cuenta. El avance local no se toca.'}</p>
                <div class="account-actions">
                  <button class="btn primary" disabled=${busy} onClick=${() => runAction(confirmAction)}>${busy ? 'Procesando…' : 'Confirmar'}</button>
                  <button class="btn ghost" disabled=${busy} onClick=${() => setConfirmAction('')}>Cancelar</button>
                </div>
              </div>
            `}
          </div>
          <p class="account-help">La sincronización automática solo se activa después de subir, descargar o comprobar que ambos snapshots son idénticos. Si otro dispositivo actualiza la misma ranura, se pausa y se solicita resolver el conflicto.</p>
        </section>
      `}
      ${error && html`<p class="account-error" role="alert">${error}</p>`}
      ${message && html`<p class="account-message" role="status">${message}</p>`}
      ${!loading && !user && html`<section class="panel account-panel"><h3>Qué se sincroniza</h3><p class="account-muted">Run en curso, mapa y progreso, jardín Zen, monedas y tienda, minijuegos, jefes, descubrimientos, ajustes, estadísticas y logros desbloqueados. Los logros se conservan dentro del mismo snapshot; no se suman automáticamente entre dispositivos.</p></section>`}
    </div>
  </div>`;
}
