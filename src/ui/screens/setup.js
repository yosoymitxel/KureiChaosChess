import { html, useState, useRef } from '../lib.js';
import { Icon } from '../icons.js';
import { Topbar, useEnter, Toggle, ThemeLook } from '../components.js';
import { nodeModifier, MODIFIERS } from '../../data/modifiers.js';
import { PREF_LIMITS, saveSettings } from '../../game/run.js';
import { rivalForFloor, DIFFICULTIES } from '../../game/difficulty.js';
import { THEMES } from '../../data/themes.js';
import { MUTATIONS, countMutations } from '../../data/mutations.js';
import { canFullscreen, setFullscreen } from '../fullscreen.js';
import { exportSave, importSave, MAX_BACKUP_CODE_CHARS } from '../../game/backup.js';
import { themeOwned } from '../../game/shop.js';
import { eliteVariants, lessonText } from '../../game/generate.js';
import { t, LANG, LANGS } from '../../i18n/index.js';

const SIDES = [
  { color: 'light', label: t('side.light', 'Marfil') },
  { color: 'dark', label: t('side.dark', 'Carmesí') },
  { color: 'wild', label: t('side.wild', 'Jade') },
];

// Selector de mecánicas de la run (los gambitos de Gambonanza): cada toque pasa normal → favorita → vetada.
export const RUN_MECHANICS = ['ice', 'portal', 'fog', 'chaos', 'zombie', 'contagion', 'coven', 'meteor', 'rush', 'promote', 'elite'];
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
    <div class="pref-grid">
      ${RUN_MECHANICS.map((id) => html`<button class=${'pref ' + state(id)} aria-label=${`${MODIFIERS[id].name}: ${label[state(id)]}`} title=${MODIFIERS[id].desc} onClick=${() => cycle(id)}>
        <${Icon} name=${MODIFIERS[id].icon} size=${20} /><span>${MODIFIERS[id].name}</span><small>${label[state(id)]}</small></button>`)}
    </div>
  </section>`;
}

// Partida local: la mesa se elige (o sale al azar) y se juega una partida o una serie.
const VERSUS_ROUNDS = [[1, t('versus.one', 'Una partida')], [3, t('versus.bo3', 'Serie a 3')], [5, t('versus.bo5', 'Serie a 5')]];
const VERSUS_SIZES = [['random', t('versus.random', 'Al azar')], [8, '8×8'], [10, '10×10'], [12, '12×12']];
const VERSUS_SHAPES = [['random', t('versus.holes', 'Con huecos')], ['classic', t('versus.classic', 'Clásica')]];
function VersusCard({ cfg, onCfg }) {
  const set = (k, v) => onCfg({ ...cfg, [k]: v });
  const seg = (k, list) => html`<div class="segmented sm" role="group">${list.map(([v, label]) => html`<button class=${cfg[k] === v ? 'on' : ''} aria-pressed=${cfg[k] === v} onClick=${() => set(k, v)}>${label}</button>`)}</div>`;
  const mods = ['random', 'none', ...RUN_MECHANICS.filter((id) => id !== 'elite')];
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
    <div class="pref-grid">
      ${mods.map((id) => { const m = id === 'random' ? { name: t('versus.random', 'Al azar'), icon: 'refresh', desc: t('versus.randomDesc', 'Una distinta en cada ronda.') } : MODIFIERS[id];
        return html`<button class=${'pref' + (cfg.mod === id ? ' fav' : '')} aria-pressed=${cfg.mod === id} title=${m.desc} onClick=${() => set('mod', id)}><${Icon} name=${m.icon} size=${20} /><span>${m.name}</span></button>`; })}
    </div>
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
          <${Toggle} on=${settings.vfx} onChange=${set('vfx')} label=${t('settings.vfx', 'Efectos extra (clima, auras…)')} hint=${t('settings.vfxHint', 'Lluvia, nieve, escudos y estelas sobre el tablero')} />
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

  const restore = async (value = code) => {
    if (typeof value !== 'string' || value.length > MAX_BACKUP_CODE_CHARS) return tooLarge();
    if (!await importSave(value)) return setMsg(t('backup.bad', 'Ese código no es una copia válida.'));
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
    <div class="menu-row">
      <button class="btn sm" onClick=${copy}><${Icon} name="scroll" size=${16} />${t('backup.copy', 'Copiar código')}</button>
      <button class="btn sm" onClick=${download}><${Icon} name="bag" size=${16} />${t('backup.download', 'Descargar')}</button>
      <label class="btn sm"><${Icon} name="scroll" size=${16} />${t('backup.upload', 'Subir archivo')}<input type="file" accept=".txt,text/plain" hidden onChange=${upload} /></label>
    </div>
    <textarea class="backup-code" rows="3" value=${code} placeholder=${t('backup.paste', 'Pega aquí tu código para restaurar')} onInput=${(e) => setCode(e.currentTarget.value)}></textarea>
    <button class="btn sm primary" disabled=${!code.trim()} onClick=${() => restore()}>${t('backup.restore', 'Restaurar')}</button>
    ${msg && html`<p class="shop-note" aria-live="polite">${msg}</p>`}
  </section>`;
}
