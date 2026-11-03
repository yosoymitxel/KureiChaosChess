import { html, useState, useRef, useEffect } from '../lib.js';
import { Icon } from '../icons.js';
import { Topbar, useEnter, Toggle, ThemeLook, ConfirmButton } from '../components.js';
import { loadSlots, switchSlot, clearSlot } from '../../game/slots.js';
import { nodeModifier, MODIFIERS, BOARD_MECHANICS, FEATURED_MECHANICS, DUO_MECHANICS } from '../../data/modifiers.js';
import { PREF_LIMITS, saveSettings } from '../../game/run.js';
import { rivalForFloor, DIFFICULTIES } from '../../game/difficulty.js';
import { THEMES, vfxOn } from '../../data/themes.js';
import { MUTATIONS, countMutations } from '../../data/mutations.js';
import { canFullscreen, setFullscreen } from '../fullscreen.js';
import { exportSave, importSave, MAX_BACKUP_CODE_CHARS, decodeSave, localSaveData, summarizeSave, sameProgress } from '../../game/backup.js';
import { cloudUser, signIn, signUp, signOut, cloudUpload, cloudPeek, cloudMarkSynced, cloudStopped } from '../../game/cloud.js';
import { themeOwned } from '../../game/shop.js';
import { eliteVariants, lessonText } from '../../game/generate.js';
import { t, LANG, LANGS } from '../../i18n/index.js';

const SIDES = [
  { color: 'light', label: t('side.light', 'Marfil') },
  { color: 'dark', label: t('side.dark', 'Carmesí') },
  { color: 'wild', label: t('side.wild', 'Jade') },
];

// Selector de mecánicas común (run y partida local): las vistosas en grande y el resto en «Ver todo».
// `cls(id)` da la clase del botón ('fav', 'ban'…), `small(id)` la etiqueta de estado y `extra` botones previos.
function MechPicker({ ids, cls, small, onPick, extra = [] }) {
  const [open, setOpen] = useState(false);
  const info = (id) => extra.find((e) => e.id === id) || MODIFIERS[id];
  const btn = (id, size, withSmall) => { const m = info(id), s = small?.(id);
    return html`<button class=${'pref ' + (cls(id) || '')} aria-pressed=${!!cls(id)} aria-label=${s ? `${m.name}: ${s}` : m.name} title=${m.desc} onClick=${() => onPick(id)}>
      <${Icon} name=${m.icon} size=${size} /><span>${m.name}</span>${withSmall && s && html`<small>${s}</small>`}</button>`; };
  const big = [...extra.map((e) => e.id), ...FEATURED_MECHANICS.filter((id) => ids.includes(id))];
  const rest = ids.filter((id) => !big.includes(id));
  return html`<div class="pref-grid">${[...big, ...(open ? [] : rest.filter((id) => cls(id)))].map((id) => btn(id, 20, true))}</div>
    <button class="btn sm pref-more" aria-expanded=${open} onClick=${() => setOpen(!open)}>${open ? t('prefs.less', 'Ver menos') : t('prefs.all', 'Ver todo')}</button>
    ${open && html`<div class="pref-grid mini">${rest.map((id) => btn(id, 18, false))}</div>`}`;
}

// Mecánicas de la run (los gambitos de Gambonanza): cada toque pasa normal → favorita → vetada.
function PrefsCard({ prefs, onPrefs }) {
  const state = (id) => (prefs.fav.includes(id) ? 'fav' : prefs.ban.includes(id) ? 'ban' : '');
  const cycle = (id) => {
    const fav = prefs.fav.filter((x) => x !== id), ban = prefs.ban.filter((x) => x !== id);
    const now = state(id);
    if (!now && fav.length < PREF_LIMITS.fav) fav.push(id);
    else if ((!now || now === 'fav') && ban.length < PREF_LIMITS.ban) ban.push(id);
    onPrefs({ fav, ban });
  };
  const label = { fav: t('prefs.fav', 'favorita'), ban: t('prefs.ban', 'vetada'), '': t('prefs.normal', 'normal') };
  return html`<section class="panel setup-card prefs" data-enter>
    <h2>${t('prefs.title', 'Mecánicas de esta run')}</h2>
    <p class="setup-note">${t('prefs.note', 'Toca una mecánica: favorita (sale mucho más, hasta {fav}), vetada (no sale, {ban}) o normal. El mapa se vuelve a sortear.', { fav: PREF_LIMITS.fav, ban: PREF_LIMITS.ban })}</p>
    <${MechPicker} ids=${BOARD_MECHANICS} cls=${state} small=${(id) => label[state(id)]} onPick=${cycle} />
  </section>`;
}

// Partida local: la mesa se elige (o sale al azar) y se juega una partida o una serie.
const VERSUS_ROUNDS = [[1, t('versus.one', 'Una partida')], [3, t('versus.bo3', 'Serie a 3')], [5, t('versus.bo5', 'Serie a 5')]];
const VERSUS_SIZES = [['random', t('versus.random', 'Al azar')], [8, '8×8'], [10, '10×10'], [12, '12×12']];
const VERSUS_SHAPES = [['random', t('versus.holes', 'Con huecos')], ['classic', t('versus.classic', 'Clásica')]];
function VersusCard({ cfg, onCfg }) {
  const set = (k, v) => onCfg({ ...cfg, [k]: v });
  const seg = (k, list) => html`<div class="segmented sm" role="group">${list.map(([v, label]) => html`<button class=${cfg[k] === v ? 'on' : ''} aria-pressed=${cfg[k] === v} onClick=${() => set(k, v)}>${label}</button>`)}</div>`;
  // Dos pestañas: el ajedrez de la run y la lista de minijuegos que ya se juegan a dos (`duo` en modifiers.js).
  const minis = Object.values(MODIFIERS).filter((m) => m.duo), duo = MODIFIERS[cfg.game]?.duo;
  const tabs = html`<div class="segmented" data-pad="l1 r1" role="tablist" aria-label=${t('versus.what', 'Qué jugar')}>
    <button role="tab" class=${duo ? '' : 'on'} aria-selected=${!duo} onClick=${() => set('game', 'chess')}><${Icon} name="king" size=${16} />${t('versus.chess', 'Ajedrez')}</button>
    <button role="tab" class=${duo ? 'on' : ''} aria-selected=${!!duo} onClick=${() => duo || set('game', minis[0].id)}><${Icon} name="hockey" size=${16} />${t('menu.minis', 'Minijuegos')}</button>
  </div>`;
  if (duo) return html`<section class="panel setup-card prefs" data-enter>
    ${tabs}
    <ul class="mut-list duo-list" role="listbox" aria-label=${t('versus.duoMinis', 'Minijuegos a dos')}>
      ${minis.map((m) => html`<li><button role="option" class=${cfg.game === m.id ? 'on' : ''} aria-selected=${cfg.game === m.id} onClick=${() => set('game', m.id)}>
        <${Icon} name=${m.icon} size=${18} /><div><strong>${m.name}</strong><span>${m.duo.desc}</span></div></button></li>`)}
    </ul>
    ${duo.opt && html`<h2>${duo.label}</h2>${seg(duo.opt, duo.choices)}`}
  </section>`;
  return html`<section class="panel setup-card prefs" data-enter>
    ${tabs}
    <h2>${t('settings.table', 'Mesa')}</h2>
    ${seg('rounds', VERSUS_ROUNDS)}
    <p class="setup-note">${cfg.rounds > 1 ? `${cfg.size === 'random' ? t('versus.grows', 'Cada ronda es un piso más: el tablero crece.') : t('versus.fresh', 'Cada ronda, mesa nueva.')} ${t('versus.firstTo', 'Gana quien llegue antes a {n}.', { n: Math.floor(cfg.rounds / 2) + 1 })}` : t('versus.single', 'Una sola partida con esta mesa.')}</p>
    <h2>${t('versus.size', 'Tamaño')}</h2>
    ${seg('size', VERSUS_SIZES)}
    <h2>${t('versus.shape', 'Forma')}</h2>
    ${seg('shape', VERSUS_SHAPES)}
    <h2>${t('versus.mechanic', 'Mecánica')}</h2>
    <${MechPicker} ids=${DUO_MECHANICS} cls=${(id) => (cfg.mod === id ? 'fav' : '')} onPick=${(id) => set('mod', id)}
      extra=${[{ id: 'random', name: t('versus.random', 'Al azar'), icon: 'refresh', desc: t('versus.randomDesc', 'Una distinta en cada ronda.') }, { ...MODIFIERS.none, id: 'none' }]} />
  </section>`;
}

// Bandos fijos: en la run tú contra el bot (o contra dos); en la partida local (`versus`, aparte
// de la run) dos personas, con un bot opcional de tercero.
export function SetupScreen({ node, defaultCount, onBack, onStart, run, settings, setSettings, onPrefs, onHowTo, versus, versusCfg, onVersusCfg }) {
  const ref = useRef(null);
  useEnter(ref);
  const [count, setCount] = useState(defaultCount || 2);
  const kinds = versus ? ['human', 'human', 'bot'] : ['human', 'bot', 'bot'];
  const mod = versusCfg?.mod === 'random' ? { name: t('versus.randomMod', 'Mecánica al azar'), icon: 'refresh', desc: t('versus.randomModDesc', 'Sale una distinta en cada ronda.') } : nodeModifier(node);
  // El peldaño del rival lo fija el tramo de la torre, el ajuste de dificultad lo corre entero
  // y el piso de un mini-jefe sube uno.
  const rival = rivalForFloor(node.floor, run?.map?.floors ?? 1, { up: node.isMiniBoss ? 1 : 0, difficulty: run?.tutorial ? 'facil' : settings?.difficulty });
  const hockey = !!MODIFIERS[versusCfg?.game]?.duo; // minijuego a dos: sin mesa de ajedrez
  const seats = SIDES.slice(0, hockey ? 2 : count).map((s, i) => ({ color: s.color, kind: kinds[i], name: kinds[i] === 'bot' ? t('seat.bot', 'Bot {side}', { side: s.label }) : versus ? t('seat.player', 'Jugador {n}', { n: i + 1 }) : t('seat.you', 'Tú') }));
  return html`<div class="screen setup" ref=${ref}>
    <${Topbar} title=${t('setup.title', 'Prepara la mesa')} sub=${versus ? t('menu.versus', 'Partida local') : t('setup.floor', 'Piso {n}', { n: node.floor + 1 })} onBack=${onBack} />
    <div class="setup-body">
      ${node.lesson && html`<section class="panel setup-card lesson" data-enter>
        <h2><${Icon} name="book" size=${18} />${t('setup.tutorial', 'Tutorial · {n} de {total}', { n: node.floor + 1, total: run.map.floors })}</h2>
        <p>${lessonText(node)}</p>
        ${node.floor === 0 && onHowTo && html`<button class="btn sm" onClick=${onHowTo}>${t('setup.howPieces', 'Cómo se mueve cada pieza')}</button>`}
      </section>`}
      ${!hockey && html`<section class="panel setup-card" data-enter>
        <div class="mod-card"><span class="mod-icon"><${Icon} name=${mod.icon} size=${24} /></span><div><h2>${mod.name}</h2><p>${mod.desc}</p></div></div>
        ${node.modifier === 'elite' && html`<ul class="elite-list">
          ${eliteVariants(node.floor, run?.map?.floors ?? 1).map((v) => html`<li><span class="elite-ico"><${Icon} name=${v.icon} size=${15} /></span><div><strong>${v.name}</strong><span>${v.desc}</span></div></li>`)}
        </ul>`}
        ${(!versus || count === 3) && html`<div class="rival-line"><${Icon} name="bot" size=${17} /><div><strong>${t('setup.rival', 'Rival:')} ${rival.name}</strong><small>${rival.desc}</small></div></div>`}
        ${node.isBoss && !run?.mutations?.length ? html`<p class="setup-warn"><${Icon} name="boss" size=${15} />${t('setup.bossWarn', 'Sin mutaciones, solo una de cada cuatro veces se derriba al coloso. Esta mesa pide tus mejores cartas.')}</p>` : ''}
      </section>`}
      ${versusCfg && html`<${VersusCard} cfg=${versusCfg} onCfg=${onVersusCfg} />`}
      ${onPrefs && html`<${PrefsCard} prefs=${run.prefs || { fav: [], ban: [] }} onPrefs=${onPrefs} />`}
      ${run?.mutations?.length ? html`<section class="panel setup-card" data-enter>
        <h2>${t('setup.mutations', 'Mutaciones activas')}</h2>
        <ul class="mut-list">
          ${Object.entries(countMutations(run.mutations)).map(([id, n]) => html`<li><${Icon} name=${MUTATIONS[id]?.icon} size=${18} /><div><strong>${MUTATIONS[id]?.name}${n > 1 ? ' ×' + n : ''}</strong><span>${MUTATIONS[id]?.desc}</span></div></li>`)}
        </ul>
        <p class="setup-note">${t('setup.mutationsNote', 'Se aplican a tu ejército durante toda la run.')}</p>
      </section>` : ''}
      <section class="panel setup-card" data-enter>
        <h2>${t('setup.players', 'Jugadores')}</h2>
        ${!hockey && html`<div class="segmented" role="group" aria-label=${t('setup.sides', 'Número de bandos')}>
          ${[2, 3].map((n) => html`<button class=${count === n ? 'on' : ''} aria-pressed=${count === n} onClick=${() => setCount(n)}>${n === 3 ? t('setup.extraBot', '+ Bot extra') : versus ? t('setup.oneVsOne', '1 contra 1') : t('setup.youVsBot', 'Tú contra el bot')}</button>`)}
        </div>`}
        ${seats.map((s, i) => html`<div class="seat-row">
          <span class=${'token side-' + s.color}></span>
          <div class="grow"><strong>${s.name}</strong><small>${SIDES[i].label}</small></div>
        </div>`)}
        ${setSettings && !hockey && html`<div class="segmented" role="group" aria-label=${t('setup.whoStarts', 'Quién empieza')}>
          ${[[false, versus ? t('setup.starts', 'Empieza {name}', { name: seats[0].name }) : t('setup.youStart', 'Empieza tú')], [true, t('setup.coin', 'Cara o cruz')]].map(([v, label]) => html`<button class=${!!settings.coin === v ? 'on' : ''} aria-pressed=${!!settings.coin === v} onClick=${() => setSettings((st) => ({ ...st, coin: v }))}>${label}</button>`)}
        </div>`}
      </section>
      <button class="btn primary big" data-enter onClick=${() => onStart(seats)}>${hockey ? t('mini.play', 'Jugar') : t('setup.deal', 'Repartir piezas')}</button>
    </div>
  </div>`;
}

export function SettingsScreen({ settings, setSettings, onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }));
  // Los registros se traducen al cargar: cambiar de idioma guarda y recarga.
  const setLang = (lang) => { if (lang === LANG) return; saveSettings({ ...settings, lang }); location.reload(); };
  return html`<div class="screen settings" ref=${ref}>
    <${Topbar} title=${t('settings.title', 'Ajustes')} onBack=${onBack} />
    <div class="setup-body">
      <${Cloud} />
      <${Slots} />
      <section class="panel setup-card set-lang" data-enter>
        <h2>${t('settings.language', 'Idioma')}</h2>
        <div class="segmented" role="group" aria-label=${t('settings.language', 'Idioma')}>
          ${Object.entries(LANGS).map(([id, name]) => html`<button class=${LANG === id ? 'on' : ''} aria-pressed=${LANG === id} lang=${id} onClick=${() => setLang(id)}>${name}</button>`)}
        </div>
      </section>
      <section class="panel setup-card set-table" data-enter>
        <h2>${t('settings.table', 'Mesa')}</h2>
        <div class="theme-grid">
          ${Object.values(THEMES).map((th) => {
            const owned = themeOwned(th.id);
            return html`<button class=${'theme' + (settings.theme === th.id ? ' on' : '')} aria-pressed=${settings.theme === th.id} disabled=${!owned}
              title=${owned ? th.name : t('settings.tableLocked', 'Se compra en la tienda del Jardín Zen')} onClick=${() => set('theme')(th.id)}>
              <${ThemeLook} t=${th} />${owned ? '' : html`<span class="theme-lock"><${Icon} name="lock" size=${12} /></span>`}<span class="theme-name">${th.name}</span></button>`;
          })}
        </div>
      </section>
      <section class="panel setup-card set-diff" data-enter>
        <h2>${t('settings.difficulty', 'Dificultad')}</h2>
        <div class="segmented" role="group" aria-label=${t('settings.difficultyAria', 'Dificultad del rival')}>
          ${Object.values(DIFFICULTIES).map((d) => html`<button class=${settings.difficulty === d.id ? 'on' : ''} aria-pressed=${settings.difficulty === d.id} onClick=${() => set('difficulty')(d.id)}>${d.name}</button>`)}
        </div>
        <p class="setup-note">${(DIFFICULTIES[settings.difficulty] || DIFFICULTIES.normal).desc}</p>
      </section>
      <section class="panel setup-card set-fx" data-enter>
        <h2>${t('settings.fx', 'Efectos y ambiente')}</h2>
        <${Toggle} on=${settings.sound} onChange=${set('sound')} label=${t('settings.sound', 'Sonidos')} hint=${t('settings.soundHint', 'Efectos de la mesa y de los minijuegos')} />
        <${Toggle} on=${settings.music !== false} onChange=${set('music')} label=${t('settings.music', 'Música')} hint=${t('settings.musicHint', 'Un tema por ambiente: mesa, jefe, minijuego y jardín')} />
        <h2>${t('settings.volume', 'Volumen')}</h2>
        <div class="segmented" role="group" aria-label=${t('settings.volumeAria', 'Volumen del sonido')}>
          ${[['suave', t('settings.volSoft', 'Suave')], ['normal', t('settings.volNormal', 'Normal')], ['fuerte', t('settings.volLoud', 'Fuerte')]].map(([id, label]) => html`<button class=${settings.volume === id ? 'on' : ''} aria-pressed=${settings.volume === id} onClick=${() => set('volume')(id)}>${label}</button>`)}
        </div>
        <p class="setup-note">${t('settings.musicNote', 'La música arranca con tu primer toque.')}</p>
      </section>
      <section class="panel setup-card set-camera" data-enter>
        <div class="set-group">
          <h2>${t('settings.camera', 'Cámara')}</h2>
          <div class="segmented" role="group" aria-label=${t('settings.camera', 'Cámara')}>
            ${[['flat', t('settings.camFlat', 'Cenital')], ['tilt', t('settings.camTilt', 'Mesa')], ['epic', t('settings.camEpic', 'Épica')]].map(([id, label]) => html`<button class=${settings.camera === id ? 'on' : ''} aria-pressed=${settings.camera === id} onClick=${() => set('camera')(id)}>${label}</button>`)}
          </div>
        </div>
        <div class="set-group">
          <h2>${t('settings.speed', 'Velocidad de animación')}</h2>
          <div class="segmented" role="group" aria-label=${t('settings.speed', 'Velocidad de animación')}>
            ${[[0.75, t('settings.speedSlow', 'Pausada')], [1, t('settings.speedNormal', 'Normal')], [1.6, t('settings.speedFast', 'Rápida')]].map(([v, label]) => html`<button class=${settings.speed === v ? 'on' : ''} aria-pressed=${settings.speed === v} onClick=${() => set('speed')(v)}>${label}</button>`)}
          </div>
        </div>
        <div class="set-toggles">
          <${Toggle} on=${settings.moments} onChange=${set('moments')} label=${t('settings.moments', 'Momentos destacados')} hint=${t('settings.momentsHint', 'Rótulos y cinemáticas en jugadas clave (se saltan con un toque)')} />
          <${Toggle} on=${settings.shake} onChange=${set('shake')} label=${t('settings.shake', 'Temblor de cámara')} hint=${t('settings.shakeHint', 'Impactos y derrumbes sacuden la mesa')} />
          <${Toggle} on=${vfxOn(settings)} onChange=${set('fx')} label=${t('settings.vfx', 'Efectos extra (clima, auras…)')} hint=${t('settings.vfxHint', 'Lluvia, nieve, escudos y estelas sobre el tablero')} />
          ${canFullscreen && html`<${Toggle} on=${settings.fullscreen} onChange=${(v) => { set('fullscreen')(v); setFullscreen(v); }} label=${t('settings.fullscreen', 'Pantalla completa')} hint=${t('settings.fullscreenHint', 'Ahora y cada vez que empiece una partida')} />`}
        </div>
      </section>
      <${Backup} />
    </div>
  </div>`;
}

// Copia de seguridad local: conserva KCC1/KCC2 y rechaza archivos fuera de límite.
function Backup() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const tooLarge = () => setMsg(t('backup.tooLarge', 'La copia supera el tamaño máximo permitido.'));

  const copy = async () => {
    try {
      const backup = await exportSave();
      try {
        await navigator.clipboard.writeText(backup);
        setMsg(t('backup.copied', 'Código copiado: guárdalo en una nota o un mensaje.'));
      } catch {
        setCode(backup);
        setMsg(t('backup.shown', 'Cópialo del recuadro y guárdalo.'));
      }
    } catch {
      tooLarge();
    }
  };

  const download = async () => {
    try {
      const blob = new Blob([await exportSave()], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kurei-chaos-chess-partida.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      tooLarge();
    }
  };

  const [pending, setPending] = useState(null); // código que trae otro progreso: antes de aplicarlo se compara
  useEffect(() => { if (pending) document.querySelector('.set-backup .cloud-clash')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [pending]);
  const restore = async (value = code, sure = false) => {
    if (typeof value !== 'string' || value.length > MAX_BACKUP_CODE_CHARS) return tooLarge();
    const data = await decodeSave(value);
    if (!data) return setMsg(t('backup.bad', 'Ese código no es una copia válida.'));
    if (!sure && sameProgress(localSaveData(), data)) return setMsg(t('backup.same', 'Ese código tiene el mismo progreso que ya tienes: no hay nada que cambiar.'));
    if (!sure) return setPending({ value, here: summarizeSave(localSaveData()), there: summarizeSave(data) });
    setPending(null);
    if (!await importSave(value)) return setMsg(t('backup.bad', 'Ese código no es una copia válida.'));
    cloudMarkSynced(null);
    setMsg(t('backup.done', 'Partida restaurada.'));
    setTimeout(() => location.reload(), 600);
  };

  const upload = async (e) => {
    const file = e.currentTarget.files[0];
    e.currentTarget.value = '';
    if (!file) return;
    if (file.size > MAX_BACKUP_CODE_CHARS) return tooLarge();
    restore(await file.text());
  };

  return html`<section class="panel setup-card set-backup" data-enter>
    <h2>${t('backup.title', 'Copia de seguridad')}</h2>
    <p class="shop-note">${t('backup.hint', 'Guarda tu progreso (run, jardín, logros, mesas) como un código. Si el navegador lo borra, pégalo aquí y vuelve.')}</p>
    <div class="menu-row set-actions">
      <button class="btn sm" onClick=${copy}><${Icon} name="scroll" size=${16} />${t('backup.copy', 'Copiar código')}</button>
      <button class="btn sm" onClick=${download}><${Icon} name="bag" size=${16} />${t('backup.download', 'Descargar')}</button>
      <label class="btn sm"><${Icon} name="scroll" size=${16} />${t('backup.upload', 'Subir archivo')}<input type="file" accept=".txt,text/plain" hidden onChange=${upload} /></label>
    </div>
    <textarea class="backup-code" rows="3" value=${code} placeholder=${t('backup.paste', 'Pega aquí tu código para restaurar')} onInput=${(e) => setCode(e.currentTarget.value)}></textarea>
    <button class="btn sm primary" disabled=${!code.trim()} onClick=${() => restore()}>${t('backup.restore', 'Restaurar')}</button>
    ${pending && html`<${ProgressChoice} here=${pending.here} there=${pending.there} thereTitle=${t('backup.codeSide', 'El código')} onKeepHere=${() => setPending(null)} onKeepThere=${() => restore(pending.value, true)} />`}
    ${msg && html`<p class="shop-note" aria-live="polite">${msg}</p>`}
  </section>`;
}

// Dos progresos distintos (este aparato y la nube, o un código de copia): se elige cuál se queda, con un resumen de cada uno.
function ProgressChoice({ here, there, thereTitle, onKeepHere, onKeepThere }) {
  return html`<div class="cloud-clash" role="alertdialog" aria-label=${t('cloud.clash', 'Dos progresos distintos')}>
    <h3>${t('cloud.clash', 'Dos progresos distintos')}</h3>
    <p class="shop-note">${t('cloud.clashHint', 'No tienen el mismo progreso. Elige cuál se queda: el otro se sobrescribe.')}</p>
    <div class="clash-cols">
      ${[[here, t('cloud.here', 'Este aparato'), onKeepHere], [there, thereTitle, onKeepThere]].map(([s, title, keep]) => html`<div class="clash-col"><strong>${title}</strong>
        <dl class="clash-stats">
          <dt>${t('cloud.sumFloor', 'Run')}</dt><dd>${s.floor ? t('cloud.sumFloorN', '{n}/{total}', { n: s.floor, total: s.floors }) : '—'}</dd>
          <dt>${t('game.mutation', 'Mutación')}</dt><dd>${s.mutations}</dd>
          <dt>${t('cloud.sumCoins', 'Monedas')}</dt><dd>${s.coins}</dd>
          <dt>${t('cloud.sumAch', 'Logros')}</dt><dd>${s.achievements}</dd>
        </dl>
        <${ConfirmButton} class="btn sm" onConfirm=${keep} confirmLabel=${t('cloud.sure', '¿Seguro?')}>${t('cloud.keep', 'Usar este')}<//></div>`)}
    </div>
  </div>`;
}

// Ranuras: tres partidas en este navegador (src/game/slots.js). Cambiar guarda la actual y recarga con la otra.
function Slots() {
  const [s, setS] = useState(loadSlots);
  const [msg, setMsg] = useState('');
  const date = (ms) => new Date(ms).toLocaleString(LANG, { dateStyle: 'short', timeStyle: 'short' });
  const use = (i) => { if (switchSlot(i)) location.reload(); else setMsg(t('slots.fail', 'No se pudo cambiar de ranura (¿sin espacio?). No se tocó nada.')); };
  return html`<section class="panel setup-card set-slots" data-enter>
    <h2>${t('slots.title', 'Ranuras de guardado')}</h2>
    <p class="shop-note">${t('slots.hint', 'Tres partidas distintas en este aparato: run, jardín, logros y mesas. Al cambiar, la actual se guarda sola.')}</p>
    <ul class="slot-list">
      ${s.list.map((slot, i) => html`<li class=${'slot' + (i === s.active ? ' on' : '')}>
        <span class="slot-name"><b>${t('slots.n', 'Ranura {n}', { n: i + 1 })}</b>
          <small>${i === s.active ? t('slots.active', 'En uso') : slot ? date(slot.at) : t('slots.empty', 'Vacía: empieza de cero')}</small></span>
        ${i !== s.active && html`<${ConfirmButton} class="btn sm primary" onConfirm=${() => use(i)} confirmLabel=${t('slots.sure', '¿Cambiar?')}>${t('slots.use', 'Usar')}<//>`}
        ${i !== s.active && slot && html`<${ConfirmButton} class="btn sm" onConfirm=${() => { clearSlot(i); setS(loadSlots()); }} confirmLabel=${t('slots.sureClear', '¿Borrar?')}>${t('slots.clear', 'Vaciar')}<//>`}
      </li>`)}
    </ul>
    ${msg && html`<p class="shop-note" aria-live="polite">${msg}</p>`}
  </section>`;
}

// Partida en la nube: entrar con correo, subir y bajar la misma copia KCC (src/game/cloud.js).
function Cloud() {
  const [user, setUser] = useState(cloudUser);
  const [email, setEmail] = useState(''), [pass, setPass] = useState('');
  const [when, setWhen] = useState(undefined), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
  const date = (iso) => new Date(iso).toLocaleString(LANG);
  const fail = (e) => {
    if (e?.message === 'auth') setUser(null);
    setMsg(e?.message === 'auth' ? t('cloud.expired', 'La sesión caducó: vuelve a entrar.')
    : e?.code === 'invalid_credentials' ? t('cloud.badLogin', 'Correo o contraseña incorrectos (o falta confirmar el correo).')
    : e?.code === 'user_already_exists' ? t('cloud.exists', 'Ese correo ya tiene cuenta: entra con él.')
    : e?.code === 'weak_password' ? t('cloud.weak', 'La contraseña es débil: usa al menos 8 caracteres.')
    : t('cloud.offline', 'No hay conexión con la nube. Prueba más tarde.'));
  };
  const run = (fn) => async () => { setBusy(true); setMsg(''); try { await fn(); } catch (e) { fail(e); } setBusy(false); };
  // Si el progreso de este aparato y el de la nube no coinciden, se pregunta cuál se queda (nada se pisa solo).
  const [clash, setClash] = useState(null);
  const check = async () => {
    const peek = await cloudPeek();
    setWhen(peek?.at || null);
    const remote = peek && await decodeSave(peek.code);
    // Una copia que esta versión no sabe leer (hecha con una más nueva) no se pisa.
    if (peek && !remote) { setMsg(t('cloud.newer', 'La nube tiene una partida de una versión más nueva del juego: actualiza antes de guardar.')); return true; }
    const differ = !!(remote && !sameProgress(localSaveData(), remote));
    setClash(differ ? { here: summarizeSave(localSaveData()), there: summarizeSave(remote), at: peek.at, code: peek.code } : null);
    if (remote && !differ) cloudMarkSynced(peek.at);
    return differ ? true : peek ? 'same' : false;
  };
  useEffect(() => { if (user) run(check)(); }, [user]);

  const enter = (mode) => run(async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMsg(t('cloud.badEmail', 'Escribe un correo válido.'));
    if (pass.length < 8) return setMsg(t('cloud.short', 'La contraseña necesita al menos 8 caracteres.'));
    let r;
    try { r = await (mode === 'up' ? signUp : signIn)(email.trim(), pass); } catch (e) { if (e?.status === 400) return setMsg(t('cloud.badLogin', 'Correo o contraseña incorrectos (o falta confirmar el correo).')); throw e; }
    if (r === 'confirm') return setMsg(t('cloud.confirm', 'Cuenta creada: confirma el enlace que te llegó al correo y luego entra.'));
    setPass(''); setUser(cloudUser());
  });
  const keepHere = run(async () => { setWhen(await cloudUpload()); setClash(null); setMsg(t('cloud.uploaded', 'Partida guardada en la nube.')); });
  // Se aplica la copia que se mostró, no una que haya podido subir otro aparato mientras tanto.
  const keepThere = run(async () => {
    if (!clash || !await importSave(clash.code)) return setMsg(t('backup.bad', 'Ese código no es una copia válida.'));
    cloudMarkSynced(clash.at);
    setMsg(t('backup.done', 'Partida restaurada.'));
    setTimeout(() => location.reload(), 600);
  });
  const up = run(async () => { if (await check() === true) return; setWhen(await cloudUpload()); setMsg(t('cloud.uploaded', 'Partida guardada en la nube.')); });
  const down = run(async () => {
    const r = await check();
    if (r === 'same') setMsg(t('cloud.same', 'La nube tiene el mismo progreso que este aparato.'));
    else if (!r) setMsg(t('cloud.empty', 'No hay ninguna partida en la nube todavía.'));
  });

  // Perfil: arriba del todo en Ajustes; la copia local (código y archivo) queda al final, aparte.
  return html`<section class="panel setup-card set-profile cloud" data-enter>
    <h2>${t('cloud.profile', 'Perfil')}</h2>
    ${user ? html`
      <p class="shop-note">${t('cloud.as', 'Conectado como {email}.', { email: user })} ${cloudStopped === 'clash' ? t('cloud.stoppedClash', 'El guardado automático está parado: otro aparato subió otra partida. Elige cuál se queda.') : cloudStopped === 'auth' ? t('cloud.stoppedAuth', 'El guardado automático está parado: vuelve a entrar.') : t('cloud.auto', 'Se guarda sola al avanzar.')} ${when ? t('cloud.when', 'Última copia: {date}.', { date: date(when) }) : when === null ? t('cloud.none', 'Aún no has subido ninguna.') : ''}</p>
      <div class="menu-row set-actions">
        <button class="btn sm primary" disabled=${busy} onClick=${up}><${Icon} name="scroll" size=${16} />${t('cloud.upload', 'Guardar en la nube')}</button>
        <button class="btn sm" disabled=${busy || !when} onClick=${down}><${Icon} name="bag" size=${16} />${t('cloud.download', 'Traer de la nube')}</button>
        <button class="btn sm" disabled=${busy} onClick=${() => { signOut(); setUser(null); setWhen(undefined); }}>${t('cloud.out', 'Salir')}</button>
      </div>` : html`
      <p class="shop-note">${t('cloud.hint', 'Con una cuenta, tu progreso pasa de un dispositivo a otro.')}</p>
      <form class="cloud-form" novalidate onSubmit=${(e) => { e.preventDefault(); enter('in')(); }}>
        <input class="cloud-field" type="email" autocomplete="email" required placeholder=${t('cloud.email', 'Correo')} value=${email} onInput=${(e) => setEmail(e.currentTarget.value)} />
        <input class="cloud-field" type="password" autocomplete="current-password" required minlength="8" placeholder=${t('cloud.pass', 'Contraseña')} value=${pass} onInput=${(e) => setPass(e.currentTarget.value)} />
        <div class="menu-row set-actions">
          <button class="btn sm primary" type="submit" disabled=${busy}>${t('cloud.in', 'Entrar')}</button>
          <button class="btn sm" type="button" disabled=${busy} onClick=${enter('up')}>${t('cloud.signup', 'Crear cuenta')}</button>
        </div>
      </form>`}
    ${clash && html`<${ProgressChoice} here=${clash.here} there=${clash.there} thereTitle=${t('cloud.there', 'La nube · {date}', { date: date(clash.at) })} onKeepHere=${keepHere} onKeepThere=${keepThere} />`}
    ${msg && html`<p class="shop-note" aria-live="polite">${msg}</p>`}
  </section>`;
}
