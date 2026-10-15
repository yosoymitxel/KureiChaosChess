import { html, useEffect } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { ConfirmButton } from '../components.js';
import { PIECE_RULES, PIECE_NAMES } from '../../data/pieces.js';
import { BOSSES } from '../../data/bosses.js';
import { THEMES } from '../../data/themes.js';

const closeOnBackdrop = (fn) => (e) => e.target === e.currentTarget && fn();
const useEscape = (fn) => useEffect(() => {
  const onKey = (e) => e.key === 'Escape' && (e.stopPropagation(), fn());
  addEventListener('keydown', onKey, true);
  return () => removeEventListener('keydown', onKey, true);
}, []);

export function PauseOverlay({ onResume, onRestart, onExit, onAbandon, onHowTo, settings, setSettings }) {
  useEscape(onResume);
  return html`<div class="overlay" onClick=${closeOnBackdrop(onResume)}>
    <div class="panel pause" role="dialog" aria-modal="true" aria-label="Pausa">
      <h1>Pausa</h1>
      <button class="btn primary" autofocus onClick=${onResume}>Seguir jugando</button>
      <div class="theme-row" role="group" aria-label="Mesa">
        ${Object.values(THEMES).map((t) => html`<button class=${'swatch' + (settings.theme === t.id ? ' on' : '')} title=${t.name} aria-label=${'Mesa ' + t.name} aria-pressed=${settings.theme === t.id}
          onClick=${() => setSettings((s) => ({ ...s, theme: t.id }))}>${t.swatch.map((c) => html`<i style=${{ background: c }}></i>`)}</button>`)}
      </div>
      <div class="pause-grid">
        <button class="btn sm" onClick=${onHowTo}><${Icon} name="book" size=${16} />Reglas</button>
        <button class="btn sm" onClick=${onRestart}><${Icon} name="refresh" size=${16} />Reiniciar</button>
        <button class="btn sm" onClick=${onExit}><${Icon} name="map" size=${16} />Al mapa</button>
        <${ConfirmButton} class="btn sm danger" onConfirm=${onAbandon} confirmLabel="¿Seguro?"><${Icon} name="skull" size=${16} />Abandonar run<//>
      </div>
    </div>
  </div>`;
}

export function HowToOverlay({ onClose }) {
  useEscape(onClose);
  return html`<div class="overlay" onClick=${closeOnBackdrop(onClose)}>
    <div class="panel howto" role="dialog" aria-modal="true" aria-label="Cómo se juega">
      <h1>Cómo se juega</h1>
      <p>Captura el rey enemigo. Si la partida se estanca, gana quien tenga más piezas. Toca una pieza enemiga para ver su alcance en rojo. Con teclado: flechas para moverte por el tablero, Enter para elegir, Escape para pausar.</p>
      <div class="rules">
        ${PIECE_RULES.map(([t, txt]) => html`<div class="rule"><${PieceIcon} type=${t} side="light" size=${40} /><div><strong>${PIECE_NAMES[t]}</strong><span>${txt}</span></div></div>`)}
      </div>
      <h2>Jefes</h2>
      <p>Ocupan varias casillas. Al moverse aplastan todo lo que pisan. Cada golpe les quita una vida y tu pieza rebota; el último golpe los derriba.</p>
      <div class="rules">
        ${Object.values(BOSSES).map((b) => html`<div class="rule"><${PieceIcon} type=${b.art} side="dark" size=${40} /><div><strong>${b.name}</strong><span>${b.desc}</span></div></div>`)}
      </div>
      <button class="btn primary" autofocus onClick=${onClose}>Entendido</button>
    </div>
  </div>`;
}
