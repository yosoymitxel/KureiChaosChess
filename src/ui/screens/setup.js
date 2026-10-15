import { html, useState, useRef } from '../lib.js';
import { Icon } from '../icons.js';
import { Topbar, useEnter, Toggle } from '../components.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { THEMES } from '../../data/themes.js';

const SIDES = [
  { color: 'light', label: 'Marfil' },
  { color: 'dark', label: 'Carmesí' },
  { color: 'wild', label: 'Jade' },
];

export function SetupScreen({ node, defaultCount, onBack, onStart }) {
  const ref = useRef(null);
  useEnter(ref);
  const [count, setCount] = useState(defaultCount || 2);
  const [kinds, setKinds] = useState(['human', 'bot', 'bot']);
  const mod = MODIFIERS[node.modifier];
  const seats = SIDES.slice(0, count).map((s, i) => ({ color: s.color, kind: kinds[i], name: kinds[i] === 'bot' ? `Bot ${s.label}` : `Jugador ${i + 1}` }));
  const flip = (i) => setKinds((k) => k.map((v, j) => (j === i ? (v === 'bot' ? 'human' : 'bot') : v)));
  return html`<div class="screen setup" ref=${ref}>
    <${Topbar} eyebrow=${`Piso ${node.floor + 1}`} title="Prepara la mesa" onBack=${onBack} />
    <div class="setup-body">
      <section class="panel setup-card" data-enter>
        <div class="eyebrow">Modificador</div>
        <div class="mod-card"><span class="mod-icon"><${Icon} name=${mod.icon} size=${22} /></span><div><strong>${mod.name}</strong><p>${mod.desc}</p></div></div>
      </section>
      <section class="panel setup-card" data-enter>
        <div class="eyebrow">Jugadores</div>
        <div class="segmented">
          ${[2, 3].map((n) => html`<button class=${count === n ? 'on' : ''} onClick=${() => setCount(n)}>${n} bandos</button>`)}
        </div>
        ${seats.map((s, i) => html`<div class="seat-row">
          <span class=${'token side-' + s.color}></span>
          <div class="grow"><strong>${s.name}</strong><small>${SIDES[i].label}</small></div>
          <div class="segmented sm">
            <button class=${s.kind === 'human' ? 'on' : ''} onClick=${() => s.kind !== 'human' && flip(i)}><${Icon} name="human" size=${14} />Humano</button>
            <button class=${s.kind === 'bot' ? 'on' : ''} onClick=${() => s.kind !== 'bot' && flip(i)}><${Icon} name="bot" size=${14} />Bot</button>
          </div>
        </div>`)}
      </section>
      <button class="btn primary big" data-enter onClick=${() => onStart(seats)}>Repartir piezas<${Icon} name="arrow" /></button>
    </div>
  </div>`;
}

export function SettingsScreen({ settings, setSettings, onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }));
  return html`<div class="screen settings" ref=${ref}>
    <${Topbar} eyebrow="Preferencias" title="Ajustes" onBack=${onBack} />
    <div class="setup-body">
      <section class="panel setup-card" data-enter>
        <div class="eyebrow">Mesa</div>
        <div class="theme-grid">
          ${Object.values(THEMES).map((t) => html`<button class=${'theme' + (settings.theme === t.id ? ' on' : '')} onClick=${() => set('theme')(t.id)}>
            <span class="swatch">${t.swatch.map((c) => html`<i style=${{ background: c }}></i>`)}</span>${t.name}</button>`)}
        </div>
      </section>
      <section class="panel setup-card" data-enter>
        <div class="eyebrow">Cámara</div>
        <div class="segmented">
          ${[['flat', 'Cenital'], ['tilt', 'Mesa'], ['epic', 'Épica']].map(([id, label]) => html`<button class=${settings.camera === id ? 'on' : ''} onClick=${() => set('camera')(id)}>${label}</button>`)}
        </div>
        <div class="eyebrow" style="margin-top:14px">Velocidad de animación</div>
        <div class="segmented">
          ${[[0.75, 'Pausada'], [1, 'Normal'], [1.6, 'Rápida']].map(([v, label]) => html`<button class=${settings.speed === v ? 'on' : ''} onClick=${() => set('speed')(v)}>${label}</button>`)}
        </div>
        <${Toggle} on=${settings.shake} onChange=${set('shake')} label="Temblor de cámara" hint="Impactos y derrumbes sacuden la mesa" />
        <${Toggle} on=${settings.fullscreen} onChange=${set('fullscreen')} label="Pantalla completa" hint="Al empezar una partida" />
      </section>
    </div>
  </div>`;
}
