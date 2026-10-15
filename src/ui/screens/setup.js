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
  const setKind = (i, kind) => setKinds((k) => k.map((v, j) => (j === i ? kind : v)));
  return html`<div class="screen setup" ref=${ref}>
    <${Topbar} title="Prepara la mesa" sub=${`Piso ${node.floor + 1}`} onBack=${onBack} />
    <div class="setup-body">
      <section class="panel setup-card" data-enter>
        <div class="mod-card"><span class="mod-icon"><${Icon} name=${mod.icon} size=${24} /></span><div><h2>${mod.name}</h2><p>${mod.desc}</p></div></div>
      </section>
      <section class="panel setup-card" data-enter>
        <h2>Jugadores</h2>
        <div class="segmented" role="group" aria-label="Número de bandos">
          ${[2, 3].map((n) => html`<button class=${count === n ? 'on' : ''} aria-pressed=${count === n} onClick=${() => setCount(n)}>${n} bandos</button>`)}
        </div>
        ${seats.map((s, i) => html`<div class="seat-row">
          <span class=${'token side-' + s.color}></span>
          <div class="grow"><strong>${s.name}</strong><small>${SIDES[i].label}</small></div>
          <div class="segmented sm" role="group" aria-label=${'Control de ' + SIDES[i].label}>
            <button class=${s.kind === 'human' ? 'on' : ''} aria-pressed=${s.kind === 'human'} onClick=${() => setKind(i, 'human')}><${Icon} name="human" size=${14} />Humano</button>
            <button class=${s.kind === 'bot' ? 'on' : ''} aria-pressed=${s.kind === 'bot'} onClick=${() => setKind(i, 'bot')}><${Icon} name="bot" size=${14} />Bot</button>
          </div>
        </div>`)}
      </section>
      <button class="btn primary big" data-enter onClick=${() => onStart(seats)}>Repartir piezas</button>
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
          ${Object.values(THEMES).map((t) => html`<button class=${'theme' + (settings.theme === t.id ? ' on' : '')} aria-pressed=${settings.theme === t.id} onClick=${() => set('theme')(t.id)}>
            <span class="swatch">${t.swatch.map((c) => html`<i style=${{ background: c }}></i>`)}</span>${t.name}</button>`)}
        </div>
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
        <${Toggle} on=${settings.fullscreen} onChange=${set('fullscreen')} label="Pantalla completa" hint="Al empezar una partida" />
      </section>
    </div>
  </div>`;
}
