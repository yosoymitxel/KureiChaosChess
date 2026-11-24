import { html, useEffect, useRef, useState } from '../lib.js';
import { Fx } from '../../view/fx.js';
import { Icon, PieceIcon } from '../icons.js';
import { ConfirmButton, BossCard, Toggle, FilterMenu, ThemeLook } from '../components.js';
import { PIECE_RULES, PIECE_NAMES } from '../../data/pieces.js';
import { BOSSES, BOSS_IDS } from '../../data/bosses.js';
import { THEMES, vfxOn } from '../../data/themes.js';
import { loadBosses } from '../../game/run.js';
import { themeOwned } from '../../game/shop.js';
import { canFullscreen, setFullscreen, useFullscreen } from '../fullscreen.js';
import { t } from '../../i18n/index.js';
import { DAILY } from '../../data/daily.js';
import { WATER_PLANTS } from '../../data/garden.js';
import { CARDS } from '../../game/cards.js';
import { loadDaily, dailyReady, dailySlot, claimDaily } from '../../game/daily.js';
import { ZEN_NAMES } from '../../game/zen.js';
import { chipArt } from '../zen-art.js';
import { playSfx } from '../sfx.js';

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
        <${Toggle} on=${vfxOn(settings)} onChange=${set('fx')} label=${t('settings.vfx', 'Efectos extra (clima, auras…)')} />
      </div>
      <${FilterMenu} value=${settings.filter} onChange=${set('filter')} />
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

// Regalo del día: la tira del ciclo (el 7.º es un cofre) y, al abrirlo, lo que trajo.
// Abrirlo es el premio: la bolsa tiembla, revienta y suelta lo que trae de uno en uno, cada cosa con su sonido.
const DL_SOUND = { coin: 'coin', seed: 'pop', water: 'splash', card: 'card' };
function CountUp({ to, run }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now(), dur = 600;
    let raf = requestAnimationFrame(function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      setN(Math.round(to * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return html`${n}`;
}
export function DailyOverlay({ onClose, onClaim }) {
  useEscape(onClose);
  const [d] = useState(loadDaily), [got, setGot] = useState(null), [phase, setPhase] = useState('idle'), [shown, setShown] = useState(0);
  const root = useRef(null), gift = useRef(null);
  const ready = !got && dailyReady(d), slot = got ? got.slot : dailySlot(d), chest = slot === DAILY.cycle - 1;
  const items = got ? [
    got.coins && { kind: 'coin', node: (on) => html`<span class="dl-ic"><${Icon} name="coin" size=${22} /></span><b>+<${CountUp} to=${got.coins} run=${on} /></b> ${t('daily.coins', 'monedas')}` },
    ...Object.entries(got.zen).map(([k, n]) => ({ kind: 'seed', node: () => html`<span class="dl-ic dl-seed">${chipArt(k)}</span><b>×${n}</b> ${t('daily.zenSeed', 'semilla de {name}', { name: ZEN_NAMES[k] })}` })),
    ...Object.entries(got.water).map(([k, n]) => ({ kind: 'water', node: () => html`<span class="dl-ic"><${Icon} name="drop" size=${22} /></span><b>×${n}</b> ${WATER_PLANTS[k].name}` })),
    ...got.cards.map((id) => ({ kind: 'card', node: () => html`<span class="dl-ic dl-card"><${Icon} name=${CARDS[id].icon} size=${22} /></span><span><b>${CARDS[id].name}</b><small>${t('daily.cardNote', 'Al sobre: entra en tu próxima run')}</small></span>` })),
  ].filter(Boolean) : [];
  useEffect(() => {
    if (!got) return;
    const fx = new Fx(root.current), timers = [];
    const p = gift.current ? fx.pointOf(gift.current) : { x: fx.w / 2, y: fx.h / 2 };
    const gold = ['#ffcf6b', '#fff3c4', '#e0a53a'];
    fx.ring(p.x, p.y, { color: '#ffe7a0', radius: chest ? 150 : 110, life: 0.55, width: 4 });
    fx.burst(p.x, p.y, { count: chest ? 60 : 36, color: gold, speed: [120, 420], life: [0.5, 1.1], size: [3, 7], gravity: 320, shape: 'rect', drag: 0.94 });
    fx.sparkle(p.x, p.y, '#ffcf6b', chest ? 16 : 10);
    if (chest) fx.confetti([...gold, '#7dffb0', '#29e3ff', '#ff7aa8']);
    items.forEach((it, i) => timers.push(setTimeout(() => { setShown(i + 1); playSfx(DL_SOUND[it.kind], 1 + i * 0.06); }, 420 + i * 380)));
    if (got.coins) timers.push(setTimeout(() => playSfx('coin', 1.25), 420 + 260));
    return () => { timers.forEach(clearTimeout); setTimeout(() => fx.destroy(), 2500); };
  }, [got]);
  const open = () => {
    if (phase !== 'idle') return;
    const r = claimDaily();
    if (!r) return;
    setPhase('shake');
    [0, 170, 300, 400, 480].forEach((ms, i) => setTimeout(() => playSfx('tick', 0.8 + i * 0.12), ms));
    setTimeout(() => { setPhase('open'); setGot(r); onClaim?.(r); playSfx('gift'); if (chest) setTimeout(() => playSfx('achievement'), 200); }, 620);
  };
  const hours = Math.max(1, Math.ceil((d.lastTs + DAILY.gapH * 3_600_000 - Date.now()) / 3_600_000));
  const bag = chest ? 'gem' : 'bag';
  return html`<div class="overlay" ref=${root} onClick=${closeOnBackdrop(onClose)}>
    <div class="panel daily" role="dialog" aria-modal="true" aria-label=${t('daily.title', 'Regalo del día')}>
      <h1>${t('daily.title', 'Regalo del día')}</h1>
      <ol class="dl-strip" aria-label=${t('daily.cycle', 'Regalos de la semana')}>
        ${Array.from({ length: DAILY.cycle }, (_, i) => html`<li class=${(i < slot || (got && i === slot) ? 'done' : '') + (i === slot ? ' now' : '') + (got && i === slot ? ' dl-hit' : '') + (i === DAILY.cycle - 1 ? ' chest' : '')}>
          <${Icon} name=${i < slot || (got && i === slot) ? 'check' : i === DAILY.cycle - 1 ? 'gem' : 'bag'} size=${18} /><small>${i + 1}</small></li>`)}
      </ol>
      ${got ? html`<div class="dl-burst" ref=${gift}><${Icon} name=${bag} size=${44} /></div>
        <ul class="dl-got">${items.map((it, i) => html`<li class=${'dl-' + it.kind + (i < shown ? ' in' : '')}>${it.node(i < shown)}</li>`)}</ul>
        <button class="btn primary" autofocus onClick=${onClose}>${t('common.continue', 'Continuar')}</button>`
      : ready ? html`<button class=${'dl-gift' + (chest ? ' chest' : '') + (phase === 'shake' ? ' shake' : '')} ref=${gift} autofocus onClick=${open} aria-label=${t('daily.open', 'Abrir regalo')}>
          <${Icon} name=${bag} size=${64} /></button>
        <p class="dl-note">${chest ? t('daily.chestNote', 'Hoy toca el cofre: siempre trae una carta.') : t('daily.note', 'Monedas, semillas o una carta: sale al azar.')}</p>
        <button class="btn primary dl-open" onClick=${open} disabled=${phase !== 'idle'}><${Icon} name=${bag} size=${18} />${t('daily.open', 'Abrir regalo')}</button>`
      : html`<p class="dl-note">${t('daily.later', 'Ya lo abriste. El próximo, en unas {n} h.', { n: hours })}</p>
        <button class="btn" autofocus onClick=${onClose}>${t('common.close', 'Cerrar')}</button>`}
    </div>
  </div>`;
}
