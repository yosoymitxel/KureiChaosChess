import { html } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { PIECE_RULES, PIECE_NAMES } from '../../data/pieces.js';
import { BOSSES } from '../../data/bosses.js';
import { THEMES } from '../../data/themes.js';

const closeOnBackdrop = (fn) => (e) => e.target === e.currentTarget && fn();

export function PauseOverlay({ onResume, onRestart, onExit, onAbandon, onHowTo, settings, setSettings }) {
  return html`<div class="overlay" onClick=${closeOnBackdrop(onResume)}>
    <div class="panel pause">
      <div class="eyebrow">Partida en pausa</div>
      <h1>Pausa</h1>
      <button class="btn primary" onClick=${onResume}>Seguir jugando</button>
      <div class="theme-row">
        ${Object.values(THEMES).map((t) => html`<button class=${'swatch' + (settings.theme === t.id ? ' on' : '')} title=${t.name}
          onClick=${() => setSettings((s) => ({ ...s, theme: t.id }))}>${t.swatch.map((c) => html`<i style=${{ background: c }}></i>`)}</button>`)}
      </div>
      <div class="pause-grid">
        <button class="btn sm" onClick=${onHowTo}><${Icon} name="book" size=${15} />Reglas</button>
        <button class="btn sm" onClick=${onRestart}><${Icon} name="refresh" size=${15} />Reiniciar</button>
        <button class="btn sm" onClick=${onExit}><${Icon} name="home" size=${15} />Al mapa</button>
        <button class="btn sm danger" onClick=${() => confirm('¿Abandonar la run? Se pierde el progreso.') && onAbandon()}><${Icon} name="skull" size=${15} />Abandonar</button>
      </div>
    </div>
  </div>`;
}

export function HowToOverlay({ onClose }) {
  return html`<div class="overlay" onClick=${closeOnBackdrop(onClose)}>
    <div class="panel howto">
      <div class="eyebrow">Manual</div>
      <h1>Cómo se juega</h1>
      <p>Captura el rey enemigo. Si nadie puede moverse, gana quien tenga más piezas. Toca una pieza enemiga para ver su alcance en rojo.</p>
      <div class="rules">
        ${PIECE_RULES.map(([t, txt]) => html`<div class="rule"><${PieceIcon} type=${t} side="light" size=${38} /><div><strong>${PIECE_NAMES[t]}</strong><span>${txt}</span></div></div>`)}
      </div>
      <h2>Jefes</h2>
      <p>Ocupan varias casillas. Cuando se mueven aplastan todo lo que pisan. Cada golpe les quita una vida y tu pieza rebota; el último golpe los derriba.</p>
      <div class="rules">
        ${Object.values(BOSSES).map((b) => html`<div class="rule"><${PieceIcon} type=${b.art} side="dark" size=${38} /><div><strong>${b.name}</strong><span>${b.desc}</span></div></div>`)}
      </div>
      <button class="btn primary" onClick=${onClose}>Entendido</button>
    </div>
  </div>`;
}
