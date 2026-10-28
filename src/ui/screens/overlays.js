import { html, useEffect } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { ConfirmButton, BossCard, Toggle, ThemeLook } from '../components.js';
import { PIECE_RULES, PIECE_NAMES } from '../../data/pieces.js';
import { BOSSES, BOSS_IDS } from '../../data/bosses.js';
import { THEMES } from '../../data/themes.js';
import { loadBosses } from '../../game/run.js';
import { themeOwned } from '../../game/shop.js';
import { canFullscreen, setFullscreen, useFullscreen } from '../fullscreen.js';
import { t } from '../../i18n/index.js';

const closeOnBackdrop = (fn) => (e) => e.target === e.currentTarget && fn();
const useEscape = (fn) => useEffect(() => {
  const onKey = (e) => e.key === 'Escape' && (e.stopPropagation(), e.preventDefault(), fn());
  addEventListener('keydown', onKey, true);
  return () => removeEventListener('keydown', onKey, true);
}, []);

// Volver a un nivel que se dejó a medias: seguir donde quedó o empezarlo de nuevo con la mano de entonces.
export function ResumeOverlay({ onContinue, onRestart, onClose }) {
  useEscape(onClose);
  return html`<div class="overlay" onClick=${closeOnBackdrop(onClose)}>
    <div class="panel pause" role="dialog" aria-modal="true" aria-label=${t('resume.title', 'Partida a medias')}>
      <h1>${t('resume.title', 'Partida a medias')}</h1>
      <button class="btn primary" autofocus onClick=${onContinue}><${Icon} name="swords" size=${16} />${t('common.continue', 'Continuar')}</button>
      <button class="btn" onClick=${onRestart}><${Icon} name="refresh" size=${16} />${t('resume.restart', 'Reiniciar nivel')}</button>
    </div>
  </div>`;
}

export function PauseOverlay({ onResume, onRestart, onExit, onMenu, onAbandon, onHowTo, settings, setSettings }) {
  useEscape(onResume);
  const full = useFullscreen();
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }));
  return html`<div class="overlay" onClick=${closeOnBackdrop(onResume)}>
    <div class="panel pause" role="dialog" aria-modal="true" aria-label=${t('pause.title', 'Pausa')}>
      <h1>${t('pause.title', 'Pausa')}</h1>
      <button class="btn primary" autofocus onClick=${onResume}>${t('pause.resume', 'Seguir jugando')}</button>
      <div class="theme-strip" role="group" aria-label=${t('settings.table', 'Mesa')}>
        ${Object.values(THEMES).filter((th) => themeOwned(th.id)).map((th) => html`<button class=${'theme-pick' + (settings.theme === th.id ? ' on' : '')} title=${th.name} aria-label=${t('settings.table', 'Mesa') + ' ' + th.name} aria-pressed=${settings.theme === th.id}
          onClick=${() => setSettings((s) => ({ ...s, theme: th.id }))}><${ThemeLook} t=${th} /></button>`)}
      </div>
      <div class="pause-toggles">
        <${Toggle} on=${settings.sound} onChange=${set('sound')} label=${t('settings.sound', 'Sonidos')} />
        <${Toggle} on=${settings.moments} onChange=${set('moments')} label=${t('settings.moments', 'Momentos destacados')} />
        <${Toggle} on=${settings.shake} onChange=${set('shake')} label=${t('settings.shake', 'Temblor de cámara')} />
        <${Toggle} on=${settings.vfx} onChange=${set('vfx')} label=${t('settings.vfx', 'Efectos extra (clima, auras…)')} />
      </div>
      <div class="pause-grid">
        <button class="btn sm" onClick=${onHowTo}><${Icon} name="book" size=${16} />${t('pause.rules', 'Reglas')}</button>
        ${onRestart && html`<button class="btn sm" onClick=${onRestart}><${Icon} name="refresh" size=${16} />${t('common.restart', 'Reiniciar')}</button>`}
        <button class="btn sm" onClick=${onExit}><${Icon} name="map" size=${16} />${t('pause.toMap', 'Al mapa')}</button>
        <button class="btn sm" onClick=${onMenu}><${Icon} name="home" size=${16} />${t('pause.toMenu', 'Menú')}</button>
        <${ConfirmButton} class="btn sm danger wide" onConfirm=${onAbandon} confirmLabel=${t('pause.abandonConfirm', '¿Seguro? Se pierde la run')}><${Icon} name="skull" size=${16} />${t('pause.abandon', 'Abandonar run')}<//>
        ${canFullscreen && html`<button class="btn sm wide" aria-pressed=${full} onClick=${() => { setFullscreen(!full); setSettings((s) => ({ ...s, fullscreen: !full })); }}>
          <${Icon} name=${full ? 'shrink' : 'expand'} size=${16} />${full ? t('menu.exitFullscreen', 'Salir de pantalla completa') : t('menu.fullscreen', 'Pantalla completa')}</button>`}
      </div>
    </div>
  </div>`;
}

export function HowToOverlay({ onClose }) {
  useEscape(onClose);
  const beaten = loadBosses();
  return html`<div class="overlay" onClick=${closeOnBackdrop(onClose)}>
    <div class="panel howto" role="dialog" aria-modal="true" aria-label=${t('howto.title', 'Cómo se juega')}>
      <h1>${t('howto.title', 'Cómo se juega')}</h1>
      <p>${t('howto.goal', 'Captura el rey enemigo. Si la partida se estanca, gana quien tenga más piezas. Toca una pieza enemiga para ver su alcance en rojo. Con teclado o mando: flechas para moverte por el tablero, Enter (A) para elegir, Escape (B) para pausar.')}</p>
      <p>${t('howto.special', 'Valen el enroque (rey y torre sin mover, camino libre y sin pasar por casillas atacadas: el rey avanza dos hacia la torre y ella salta a su lado) y la captura al paso (tras el doble paso de un peón, el rival puede comérselo en la jugada siguiente como si hubiera avanzado uno).')}</p>
      <div class="rules">
        ${PIECE_RULES.map(([t, txt]) => html`<div class="rule"><${PieceIcon} type=${t} side="light" size=${40} /><div><strong>${PIECE_NAMES[t]}</strong><span>${txt}</span></div></div>`)}
      </div>
      <h2>${t('howto.bosses', 'Jefes')}</h2>
      <p>${t('howto.bossesText', 'Ocupan varias casillas. Al moverse aplastan todo lo que pisan. Cada golpe les quita una vida y tu pieza rebota; el último golpe los derriba.')}</p>
      <div class="rules">
        ${BOSS_IDS.map((id) => html`<${BossCard} boss=${BOSSES[id]} unlocked=${beaten.includes(id)} />`)}
      </div>
      <p>${t('howto.studied', '{n} de {total} jefes estudiados: cada jefe que derribas queda abierto acá y en la Galería.', { n: beaten.length, total: BOSS_IDS.length })}</p>
      <p>${t('howto.gems', 'La gema de una carta dice su rareza:')} <i class="gem"></i> ${t('rarity.common', 'común')}, <i class="gem rare"></i> ${t('rarity.rare', 'rara')}, <i class="gem epic"></i> ${t('rarity.epic', 'épica')}. ${t('howto.frame', 'El marco dice el tipo: táctica, mutación u objeto.')}</p>
      <button class="btn primary" autofocus onClick=${onClose}>${t('howto.ok', 'Entendido')}</button>
    </div>
  </div>`;
}
