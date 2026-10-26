import { html, useState, useRef } from '../lib.js';
import { Icon } from '../icons.js';
import { Topbar, useEnter, Toggle, ThemeLook } from '../components.js';
import { nodeModifier, MODIFIERS } from '../../data/modifiers.js';
import { PREF_LIMITS } from '../../game/run.js';
import { rivalForFloor, DIFFICULTIES } from '../../game/difficulty.js';
import { THEMES } from '../../data/themes.js';
import { MUTATIONS, countMutations } from '../../data/mutations.js';
import { canFullscreen, setFullscreen } from '../fullscreen.js';
import { themeOwned } from '../../game/shop.js';
import { eliteVariants } from '../../game/generate.js';

const SIDES = [
  { color: 'light', label: 'Marfil' },
  { color: 'dark', label: 'Carmesí' },
  { color: 'wild', label: 'Jade' },
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
  const label = { fav: 'favorita', ban: 'vetada', '': 'normal' };
  return html`<section class="panel setup-card prefs" data-enter>
    <h2>Mecánicas de esta run</h2>
    <p class="setup-note">Toca una mecánica: favorita (sale mucho más, hasta ${PREF_LIMITS.fav}), vetada (no sale, ${PREF_LIMITS.ban}) o normal. El mapa se vuelve a sortear.</p>
    <div class="pref-grid">
      ${RUN_MECHANICS.map((id) => html`<button class=${'pref ' + state(id)} aria-label=${`${MODIFIERS[id].name}: ${label[state(id)]}`} title=${MODIFIERS[id].desc} onClick=${() => cycle(id)}>
        <${Icon} name=${MODIFIERS[id].icon} size=${20} /><span>${MODIFIERS[id].name}</span><small>${label[state(id)]}</small></button>`)}
    </div>
  </section>`;
}

// Partida local: la mesa se elige (o sale al azar) y se juega una partida o una serie.
const VERSUS_ROUNDS = [[1, 'Una partida'], [3, 'Serie a 3'], [5, 'Serie a 5']];
const VERSUS_SIZES = [['random', 'Al azar'], [8, '8×8'], [10, '10×10'], [12, '12×12']];
const VERSUS_SHAPES = [['random', 'Con huecos'], ['classic', 'Clásica']];
function VersusCard({ cfg, onCfg }) {
  const set = (k, v) => onCfg({ ...cfg, [k]: v });
  const seg = (k, list) => html`<div class="segmented sm" role="group">${list.map(([v, label]) => html`<button class=${cfg[k] === v ? 'on' : ''} aria-pressed=${cfg[k] === v} onClick=${() => set(k, v)}>${label}</button>`)}</div>`;
  const mods = ['random', 'none', ...RUN_MECHANICS.filter((id) => id !== 'elite')];
  // Dos pestañas: el ajedrez de la run y la lista de minijuegos que ya se juegan a dos (`duo` en modifiers.js).
  const minis = Object.values(MODIFIERS).filter((m) => m.duo), duo = MODIFIERS[cfg.game]?.duo;
  const tabs = html`<div class="segmented" role="tablist" aria-label="Qué jugar">
    <button role="tab" class=${duo ? '' : 'on'} aria-selected=${!duo} onClick=${() => set('game', 'chess')}><${Icon} name="king" size=${16} />Ajedrez</button>
    <button role="tab" class=${duo ? 'on' : ''} aria-selected=${!!duo} onClick=${() => duo || set('game', minis[0].id)}><${Icon} name="hockey" size=${16} />Minijuegos</button>
  </div>`;
  if (duo) return html`<section class="panel setup-card prefs" data-enter>
    ${tabs}
    <ul class="mut-list duo-list" role="listbox" aria-label="Minijuegos a dos">
      ${minis.map((m) => html`<li><button role="option" class=${cfg.game === m.id ? 'on' : ''} aria-selected=${cfg.game === m.id} onClick=${() => set('game', m.id)}>
        <${Icon} name=${m.icon} size=${18} /><div><strong>${m.name}</strong><span>${m.duo.desc}</span></div></button></li>`)}
    </ul>
    ${duo.opt && html`<h2>${duo.label}</h2>${seg(duo.opt, duo.choices)}`}
  </section>`;
  return html`<section class="panel setup-card prefs" data-enter>
    ${tabs}
    <h2>Mesa</h2>
    ${seg('rounds', VERSUS_ROUNDS)}
    <p class="setup-note">${cfg.rounds > 1 ? `${cfg.size === 'random' ? 'Cada ronda es un piso más: el tablero crece.' : 'Cada ronda, mesa nueva.'} Gana quien llegue antes a ${Math.floor(cfg.rounds / 2) + 1}.` : 'Una sola partida con esta mesa.'}</p>
    <h2>Tamaño</h2>
    ${seg('size', VERSUS_SIZES)}
    <h2>Forma</h2>
    ${seg('shape', VERSUS_SHAPES)}
    <h2>Mecánica</h2>
    <div class="pref-grid">
      ${mods.map((id) => { const m = id === 'random' ? { name: 'Al azar', icon: 'refresh', desc: 'Una distinta en cada ronda.' } : MODIFIERS[id];
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
  const mod = versusCfg?.mod === 'random' ? { name: 'Mecánica al azar', icon: 'refresh', desc: 'Sale una distinta en cada ronda.' } : nodeModifier(node);
  // El peldaño del rival lo fija el tramo de la torre, el ajuste de dificultad lo corre entero
  // y el piso de un mini-jefe sube uno.
  const rival = rivalForFloor(node.floor, run?.map?.floors ?? 1, { up: node.isMiniBoss ? 1 : 0, difficulty: run?.tutorial ? 'facil' : settings?.difficulty });
  const hockey = !!MODIFIERS[versusCfg?.game]?.duo; // minijuego a dos: sin mesa de ajedrez
  const seats = SIDES.slice(0, hockey ? 2 : count).map((s, i) => ({ color: s.color, kind: kinds[i], name: kinds[i] === 'bot' ? `Bot ${s.label}` : versus ? `Jugador ${i + 1}` : 'Tú' }));
  return html`<div class="screen setup" ref=${ref}>
    <${Topbar} title="Prepara la mesa" sub=${versus ? 'Partida local' : `Piso ${node.floor + 1}`} onBack=${onBack} />
    <div class="setup-body">
      ${node.lesson && html`<section class="panel setup-card lesson" data-enter>
        <h2><${Icon} name="book" size=${18} />Tutorial · ${node.floor + 1} de ${run.map.floors}</h2>
        <p>${node.lesson}</p>
        ${node.floor === 0 && onHowTo && html`<button class="btn sm" onClick=${onHowTo}>Cómo se mueve cada pieza</button>`}
      </section>`}
      ${!hockey && html`<section class="panel setup-card" data-enter>
        <div class="mod-card"><span class="mod-icon"><${Icon} name=${mod.icon} size=${24} /></span><div><h2>${mod.name}</h2><p>${mod.desc}</p></div></div>
        ${node.modifier === 'elite' && html`<ul class="elite-list">
          ${eliteVariants(node.floor, run?.map?.floors ?? 1).map((v) => html`<li><span class="elite-ico"><${Icon} name=${v.icon} size=${15} /></span><div><strong>${v.name}</strong><span>${v.desc}</span></div></li>`)}
        </ul>`}
        ${(!versus || count === 3) && html`<div class="rival-line"><${Icon} name="bot" size=${17} /><div><strong>Rival: ${rival.name}</strong><small>${rival.desc}</small></div></div>`}
        ${node.isBoss && !run?.mutations?.length ? html`<p class="setup-warn"><${Icon} name="boss" size=${15} />Sin mutaciones, solo una de cada cuatro veces se derriba al coloso. Esta mesa pide tus mejores cartas.</p>` : ''}
      </section>`}
      ${versusCfg && html`<${VersusCard} cfg=${versusCfg} onCfg=${onVersusCfg} />`}
      ${onPrefs && html`<${PrefsCard} prefs=${run.prefs || { fav: [], ban: [] }} onPrefs=${onPrefs} />`}
      ${run?.mutations?.length ? html`<section class="panel setup-card" data-enter>
        <h2>Mutaciones activas</h2>
        <ul class="mut-list">
          ${Object.entries(countMutations(run.mutations)).map(([id, n]) => html`<li><${Icon} name=${MUTATIONS[id]?.icon} size=${18} /><div><strong>${MUTATIONS[id]?.name}${n > 1 ? ' ×' + n : ''}</strong><span>${MUTATIONS[id]?.desc}</span></div></li>`)}
        </ul>
        <p class="setup-note">Se aplican a tu ejército durante toda la run.</p>
      </section>` : ''}
      <section class="panel setup-card" data-enter>
        <h2>Jugadores</h2>
        ${!hockey && html`<div class="segmented" role="group" aria-label="Número de bandos">
          ${[2, 3].map((n) => html`<button class=${count === n ? 'on' : ''} aria-pressed=${count === n} onClick=${() => setCount(n)}>${n === 3 ? '+ Bot extra' : versus ? '1 contra 1' : 'Tú contra el bot'}</button>`)}
        </div>`}
        ${seats.map((s, i) => html`<div class="seat-row">
          <span class=${'token side-' + s.color}></span>
          <div class="grow"><strong>${s.name}</strong><small>${SIDES[i].label}</small></div>
        </div>`)}
        ${setSettings && !hockey && html`<div class="segmented" role="group" aria-label="Quién empieza">
          ${[[false, `Empieza ${seats[0].name === 'Tú' ? 'tú' : seats[0].name}`], [true, 'Cara o cruz']].map(([v, label]) => html`<button class=${!!settings.coin === v ? 'on' : ''} aria-pressed=${!!settings.coin === v} onClick=${() => setSettings((st) => ({ ...st, coin: v }))}>${label}</button>`)}
        </div>`}
      </section>
      <button class="btn primary big" data-enter onClick=${() => onStart(seats)}>${hockey ? "Jugar" : "Repartir piezas"}</button>
    </div>
  </div>`;
}

export function SettingsScreen({ settings, setSettings, onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }));
  return html`<div class="screen settings" ref=${ref}>
    <${Topbar} title="Ajustes" onBack=${onBack} />
    <div class="setup-body">
      <section class="panel setup-card" data-enter>
        <h2>Mesa</h2>
        <div class="theme-grid">
          ${Object.values(THEMES).map((t) => {
            const owned = themeOwned(t.id);
            return html`<button class=${'theme' + (settings.theme === t.id ? ' on' : '')} aria-pressed=${settings.theme === t.id} disabled=${!owned}
              title=${owned ? t.name : 'Se compra en la tienda del Jardín Zen'} onClick=${() => set('theme')(t.id)}>
              <${ThemeLook} t=${t} />${owned ? '' : html`<span class="theme-lock"><${Icon} name="lock" size=${12} /></span>`}<span class="theme-name">${t.name}</span></button>`;
          })}
        </div>
      </section>
      <section class="panel setup-card" data-enter>
        <h2>Dificultad</h2>
        <div class="segmented" role="group" aria-label="Dificultad del rival">
          ${Object.values(DIFFICULTIES).map((d) => html`<button class=${settings.difficulty === d.id ? 'on' : ''} aria-pressed=${settings.difficulty === d.id} onClick=${() => set('difficulty')(d.id)}>${d.name}</button>`)}
        </div>
        <p class="setup-note">${(DIFFICULTIES[settings.difficulty] || DIFFICULTIES.normal).desc}</p>
      </section>
      <section class="panel setup-card" data-enter>
        <h2>Efectos y ambiente</h2>
        <${Toggle} on=${settings.sound} onChange=${set('sound')} label="Sonidos" hint="Efectos de la mesa y música de fondo" />
        <h2>Volumen</h2>
        <div class="segmented" role="group" aria-label="Volumen del sonido">
          ${[['suave', 'Suave'], ['normal', 'Normal'], ['fuerte', 'Fuerte']].map(([id, label]) => html`<button class=${settings.volume === id ? 'on' : ''} aria-pressed=${settings.volume === id} onClick=${() => set('volume')(id)}>${label}</button>`)}
        </div>
        <p class="setup-note">La música arranca con tu primer toque.</p>
      </section>
      <section class="panel setup-card" data-enter>
        <h2>Cámara</h2>
        <div class="segmented" role="group" aria-label="Cámara">
          ${[['flat', 'Cenital'], ['tilt', 'Mesa'], ['epic', 'Épica']].map(([id, label]) => html`<button class=${settings.camera === id ? 'on' : ''} aria-pressed=${settings.camera === id} onClick=${() => set('camera')(id)}>${label}</button>`)}
        </div>
        <h2>Velocidad de animación</h2>
        <div class="segmented" role="group" aria-label="Velocidad de animación">
          ${[[0.75, 'Pausada'], [1, 'Normal'], [1.6, 'Rápida']].map(([v, label]) => html`<button class=${settings.speed === v ? 'on' : ''} aria-pressed=${settings.speed === v} onClick=${() => set('speed')(v)}>${label}</button>`)}
        </div>
        <${Toggle} on=${settings.moments} onChange=${set('moments')} label="Momentos destacados" hint="Rótulos y cinemáticas en jugadas clave (se saltan con un toque)" />
        <${Toggle} on=${settings.shake} onChange=${set('shake')} label="Temblor de cámara" hint="Impactos y derrumbes sacuden la mesa" />
        ${canFullscreen && html`<${Toggle} on=${settings.fullscreen} onChange=${(v) => { set('fullscreen')(v); setFullscreen(v); }} label="Pantalla completa" hint="Ahora y cada vez que empiece una partida" />`}
      </section>
    </div>
  </div>`;
}
