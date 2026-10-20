import { html, useEffect } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { ConfirmButton, BossCard, Toggle, ThemeLook } from '../components.js';
import { PIECE_RULES, PIECE_NAMES } from '../../data/pieces.js';
import { BOSSES, BOSS_IDS } from '../../data/bosses.js';
import { THEMES } from '../../data/themes.js';
import { loadBosses } from '../../game/run.js';
import { themeOwned } from '../../game/shop.js';
import { canFullscreen, setFullscreen, useFullscreen } from '../fullscreen.js';

const closeOnBackdrop = (fn) => (e) => e.target === e.currentTarget && fn();
const useEscape = (fn) => useEffect(() => {
  const onKey = (e) => e.key === 'Escape' && (e.stopPropagation(), fn());
  addEventListener('keydown', onKey, true);
  return () => removeEventListener('keydown', onKey, true);
}, []);

export function PauseOverlay({ onResume, onRestart, onExit, onMenu, onAbandon, onHowTo, settings, setSettings }) {
  useEscape(onResume);
  const full = useFullscreen();
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }));
  return html`<div class="overlay" onClick=${closeOnBackdrop(onResume)}>
    <div class="panel pause" role="dialog" aria-modal="true" aria-label="Pausa">
      <h1>Pausa</h1>
      <button class="btn primary" autofocus onClick=${onResume}>Seguir jugando</button>
      <div class="theme-strip" role="group" aria-label="Mesa">
        ${Object.values(THEMES).filter((t) => themeOwned(t.id)).map((t) => html`<button class=${'theme-pick' + (settings.theme === t.id ? ' on' : '')} title=${t.name} aria-label=${'Mesa ' + t.name} aria-pressed=${settings.theme === t.id}
          onClick=${() => setSettings((s) => ({ ...s, theme: t.id }))}><${ThemeLook} t=${t} /></button>`)}
      </div>
      <div class="pause-toggles">
        <${Toggle} on=${settings.sound} onChange=${set('sound')} label="Sonidos" />
        <${Toggle} on=${settings.moments} onChange=${set('moments')} label="Momentos destacados" />
        <${Toggle} on=${settings.shake} onChange=${set('shake')} label="Temblor de cámara" />
      </div>
      <div class="pause-grid">
        <button class="btn sm" onClick=${onHowTo}><${Icon} name="book" size=${16} />Reglas</button>
        <button class="btn sm" onClick=${onRestart}><${Icon} name="refresh" size=${16} />Reiniciar</button>
        <button class="btn sm" onClick=${onExit}><${Icon} name="map" size=${16} />Al mapa</button>
        <button class="btn sm" onClick=${onMenu}><${Icon} name="home" size=${16} />Menú</button>
        <${ConfirmButton} class="btn sm danger wide" onConfirm=${onAbandon} confirmLabel="¿Seguro? Se pierde la run"><${Icon} name="skull" size=${16} />Abandonar run<//>
        ${canFullscreen && html`<button class="btn sm wide" aria-pressed=${full} onClick=${() => { setFullscreen(!full); setSettings((s) => ({ ...s, fullscreen: !full })); }}>
          <${Icon} name=${full ? 'shrink' : 'expand'} size=${16} />${full ? 'Salir de pantalla completa' : 'Pantalla completa'}</button>`}
      </div>
    </div>
  </div>`;
}

export function HowToOverlay({ onClose }) {
  useEscape(onClose);
  const beaten = loadBosses();
  return html`<div class="overlay" onClick=${closeOnBackdrop(onClose)}>
    <div class="panel howto" role="dialog" aria-modal="true" aria-label="Cómo se juega">
      <h1>Cómo se juega</h1>
      <p>Captura el rey enemigo. Si la partida se estanca, gana quien tenga más piezas. Toca una pieza enemiga para ver su alcance en rojo. Con teclado: flechas para moverte por el tablero, Enter para elegir, Escape para pausar.</p>
      <p>Valen el enroque (rey y torre sin mover, camino libre y sin pasar por casillas atacadas: el rey avanza dos hacia la torre y ella salta a su lado) y la captura al paso (tras el doble paso de un peón, el rival puede comérselo en la jugada siguiente como si hubiera avanzado uno).</p>
      <div class="rules">
        ${PIECE_RULES.map(([t, txt]) => html`<div class="rule"><${PieceIcon} type=${t} side="light" size=${40} /><div><strong>${PIECE_NAMES[t]}</strong><span>${txt}</span></div></div>`)}
      </div>
      <h2>Jefes</h2>
      <p>Ocupan varias casillas. Al moverse aplastan todo lo que pisan. Cada golpe les quita una vida y tu pieza rebota; el último golpe los derriba.</p>
      <div class="rules">
        ${BOSS_IDS.map((id) => html`<${BossCard} boss=${BOSSES[id]} unlocked=${beaten.includes(id)} />`)}
      </div>
      <p>${beaten.length} de ${BOSS_IDS.length} jefes estudiados: cada jefe que derribas queda abierto acá y en la Galería.</p>
      <p>La gema de una carta dice su rareza: <i class="gem"></i> común, <i class="gem rare"></i> rara, <i class="gem epic"></i> épica. El marco dice el tipo: táctica, mutación u objeto.</p>
      <button class="btn primary" autofocus onClick=${onClose}>Entendido</button>
    </div>
  </div>`;
}
