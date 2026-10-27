import { html, useState, useEffect, useRef, motion, motionStagger } from './lib.js';
import { Icon, PieceIcon } from './icons.js';
import { MOVE_NAMES } from '../data/pieces.js';
import { playSfx } from './sfx.js';
import { pieceSVG } from '../view/piece-art.js';
import { Moments } from './moments.js';
import { MODIFIERS } from '../data/modifiers.js';
import { t } from '../i18n/index.js';

// Muestra de una mesa sin texto: su mesa y sus dos casillas de fondo, y el rey dibujado con el
// arte de esa mesa (píxel o vectorial) y el color de su bando claro. Tienda, ajustes y pausa.
export function ThemeLook({ t }) {
  const v = t.vars;
  const style = { '--lk-t': v.table, '--lk-a': v['tile-a'], '--lk-b': v['tile-b'], '--pc': v['side-light'], '--pc-2': `color-mix(in oklch, ${v['side-light']}, black 28%)` };
  return html`<span class="theme-look" style=${style}>
    <span class="piece-icon" dangerouslySetInnerHTML=${{ __html: pieceSVG('king', { fit: true, pack: t.pack || '' }) }} />
  </span>`;
}

export function Topbar({ title, sub, onBack, backLabel = t('common.back', 'Volver'), children }) {
  return html`<header class="topbar">
    ${onBack && html`<button class="btn ghost sm" data-back onClick=${onBack}><${Icon} name="back" size=${16} />${backLabel}</button>`}
    <div>
      <h1 class="title">${title}</h1>
      ${sub && html`<p class="sub">${sub}</p>`}
    </div>
    <div class="spacer"></div>
    ${children}
  </header>`;
}

// Cierre común de los minijuegos: resultado, motivo y botón en un solo bloque, en cada pantalla.
export function MiniEnd({ win, title, note, label = t('common.continue', 'Continuar'), onEnd }) {
  useEffect(() => { playSfx(win ? 'mini_win' : 'mini_lose'); }, []);
  return html`<div class="overlay"><div class=${'mini-end ' + (win ? 'win' : 'lose')} role="status">
    <p class="mini-end-title">${title ?? (win ? t('common.win', '¡Victoria!') : t('common.lose', 'Derrota'))}</p>
    ${note && html`<p class="mini-end-note">${note}</p>`}
    <button class="btn primary" onClick=${() => onEnd()}>${label}</button>
  </div></div>`;
}

// Los niveles de cada minijuego se llaman igual en todos: se traducen por id.
const diffName = (diffs, id) => t('diff.' + id, (diffs[id] || diffs.normal).name);

// Dificultad del minijuego: en partida libre se elige y cada juego recuerda su nivel; en la run
// el piso la fija y la pieza solo lo anuncia. Cambiar de nivel arranca tablero nuevo, así lo
// que se juega es siempre lo que se ve marcado.
export function MiniDiff({ mini, diffs, fixed, settings, setSettings, onRestart }) {
  const value = settings.miniDiff?.[mini] || 'normal';
  if (fixed) return html`<p class="mini-tier">${t('mini.floorLevel', 'Nivel del piso:')} <b>${diffName(diffs, fixed)}</b>.</p>`;
  const pick = (id) => {
    if (id === value) return;
    setSettings((st) => ({ ...st, miniDiff: { ...st.miniDiff, [mini]: id } }));
    onRestart();
  };
  return html`<div class="segmented sm" role="group" aria-label=${t('settings.difficulty', 'Dificultad')}>
    ${Object.keys(diffs).map((id) => html`<button class=${id === value ? 'on' : ''} aria-pressed=${id === value} onClick=${() => pick(id)}>${diffName(diffs, id)}</button>`)}
  </div>`;
}

// Ayuda y nivel del minijuego en un solo botón: abre una hoja encima del juego con cómo se juega
// y el nivel (elegible en partida libre). La primera vez que se entra a cada minijuego se abre sola,
// así debajo del tablero solo queda lo que se usa para jugar.
export function MiniTools({ mini, cinematic = true, diffs, fixed, settings, setSettings, onRestart, children }) {
  const [open, setOpen] = useState(() => !settings.helpSeen?.[mini]);
  useEffect(() => {
    if (!settings.helpSeen?.[mini]) setSettings((st) => ({ ...st, helpSeen: { ...st.helpSeen, [mini]: true } }));
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && (e.stopPropagation(), e.preventDefault(), setOpen(false));
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  }, [open]);

  useEffect(() => {
    if (!cinematic || settings.moments === false) return;
    const modifier = MODIFIERS[mini];
    const layer = document.createElement('div');
    layer.className = 'mini-cine-host';
    document.body.appendChild(layer);
    const moments = new Moments(layer, { speed: settings.speed || 1, enabled: true });
    const sub = (modifier?.desc || '')
      .replace(/^(?:Minijuego(?: al revés)?|(?:Reverse )?minigame):\s*/i, '')
      .replace(/\s*(?:Premio|Reward):.*$/i, '');
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      moments.destroy();
      layer.remove();
    };
    moments.cinematic({
      title: MODIFIERS[mini]?.name || mini,
      sub: sub || undefined,
      icon: modifier?.icon || 'flag',
    }).then(dispose, dispose);
    return dispose;
  }, []);

  const level = diffName(diffs, fixed || settings.miniDiff?.[mini] || 'normal');
  return html`<button class="btn ghost sm mini-tools" data-pad="select" data-pad-label=${t('pad.help', 'Ayuda')} aria-haspopup="dialog" onClick=${() => setOpen(true)}><${Icon} name="book" size=${16} /><span class="mini-tools-label">${t('common.howTo', 'Cómo se juega')} · ${level}</span></button>
    ${open && html`<div class="overlay" onClick=${(e) => e.target === e.currentTarget && setOpen(false)}>
      <div class="panel mini-sheet" role="dialog" aria-modal="true" aria-label=${t('common.howTo', 'Cómo se juega')}>
        <h2>${t('common.howTo', 'Cómo se juega')}</h2>
        <p>${children}</p>
        <${MiniDiff} mini=${mini} diffs=${diffs} fixed=${fixed} settings=${settings} setSettings=${setSettings} onRestart=${onRestart} />
        <button class="btn primary" autofocus onClick=${() => setOpen(false)}>${t('mini.play', 'Jugar')}</button>
      </div>
    </div>`}`;
}
// Destructive actions ask for a second press instead of a browser dialog.
// `enter`: entra animado con el resto de la pantalla (useEnter), como los botones que lo rodean.
export function ConfirmButton({ class: cls = 'btn', onConfirm, confirmLabel = t('common.confirm', 'Pulsa otra vez para confirmar'), enter, children }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);
  return html`<button class=${cls + (armed ? ' armed' : '')} data-enter=${enter ? '' : undefined} onClick=${() => (armed ? onConfirm() : setArmed(true))}>${armed ? confirmLabel : children}</button>`;
}

// Boss card shared by the rules overlay and the gallery: locked until the boss falls once.
export function BossCard({ boss, unlocked }) {
  return html`<div class=${'rule' + (unlocked ? '' : ' locked')}>
    ${unlocked
      ? html`<${PieceIcon} type=${'boss-' + boss.id} side="dark" size=${44} />`
      : html`<span class="rule-lock"><${Icon} name="lock" size=${22} /></span>`}
    <div>
      <strong>${unlocked ? boss.name : t('boss.unknown', 'Jefe por descubrir')}</strong>
      <span>${unlocked ? boss.desc + ' ' + t('boss.movesAs', 'Se mueve como: {list}.', { list: boss.moves.map((m) => MOVE_NAMES[m]).join(t('common.and', ' y ')) }) : t('boss.studyIt', 'Derriba a este coloso para estudiarlo.')}</span>
    </div>
  </div>`;
}

// Screen entrance: content rises in with a soft spring.
export function useEnter(ref, selector = '[data-enter]') {
  useEffect(() => {
    const els = ref.current?.querySelectorAll(selector);
    if (els?.length) motion(els, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5, delay: motionStagger(0.06), ease: [0.22, 1, 0.36, 1] });
  }, []);
}

// Card tilts toward the pointer like a card held in hand (Magic UI / Kokonut tilt-card pattern).
function Card({ card, chosen, onPick, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty('--ry', (x - 0.5) * 18 + 'deg');
    ref.current.style.setProperty('--rx', (0.5 - y) * 14 + 'deg');
  };
  const onLeave = () => { ref.current.style.setProperty('--rx', '0deg'); ref.current.style.setProperty('--ry', '0deg'); };
  return html`<div ref=${ref} class=${'card' + (chosen ? ' chosen' : '')} data-deal style=${style}
      onPointerMove=${onMove} onPointerLeave=${onLeave} onClick=${() => onPick(card)} role="button" tabindex="0"
      onKeyDown=${(e) => (e.key === 'Enter' || e.key === ' ') && onPick(card)}>
    <${CardFace} card=${card} />
    <div class="back"></div>
  </div>`;
}

const KIND_LABEL = { tactic: t('kind.tactic', 'Táctica'), mutation: t('game.mutation', 'Mutación'), boon: t('kind.boon', 'Objeto') };
export const RARITY_LABEL = { common: t('rarity.common', 'común'), rare: t('rarity.rare', 'rara'), epic: t('rarity.epic', 'épica') };

// One card anatomy for every card in the game (rewards, hand, previews):
// frame colour = kind, gem = rarity, title plate, art window, type line, rules box.
export function CardFace({ card, mini = false, shop = false }) {
  const kind = card.kind || 'boon', rarity = card.rarity || 'common';
  return html`<div class=${`face kind-${kind} ${rarity}${card.preMatch ? " pre" : ""}`}>
    ${card.preMatch && html`<span class="pre-ribbon">${t('card.atStart', 'Al empezar')}</span>`}
    <span class=${'gem ' + rarity} title=${RARITY_LABEL[rarity]}></span>
    <div class="plate">${card.name}</div>
    <div class="art"><${Icon} name=${card.icon} size=${mini ? 34 : 72} /></div>
    <div class="type">${KIND_LABEL[kind]} · ${RARITY_LABEL[rarity]}${card.stack > 1 ? ` · ×${card.stack}` : ''}</div>
    ${!mini && html`<p class="desc">${card.desc}</p>`}
    ${shop && html`<i class="shop-mark" title=${t('card.bought', 'Comprada en la tienda del jardín')}><${Icon} name="coin" size=${mini ? 12 : 18} /></i>`}
  </div>`;
}

// Deck-builder style pick: cards are dealt face down and flip over.
export function CardPick({ title, subtitle, cards, onConfirm, confirmLabel = t('card.keep', 'Quedármela'), onBack }) {
  const [chosen, setChosen] = useState(null);
  const row = useRef(null);
  useEffect(() => {
    const els = row.current.querySelectorAll('[data-deal]');
    motion(els, { opacity: [0, 1], y: [260, 0], rotateY: [180, 0], rotateZ: [-12, 0] },
      { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: motionStagger(0.12, { startDelay: 0.15 }) });
  }, []);
  return html`<div class="screen pick">
    <${Topbar} title=${title} onBack=${onBack} />
    <div class="pick-body">
      <p class="pick-sub">${subtitle}</p>
      <div class=${'card-row' + (chosen ? ' has-sel' : '')} ref=${row}>
        ${cards.map((c, i) => {
          // --k: distancia a la elegida (o al centro): la elegida avanza y las demás se juntan detrás.
          const sel = cards.findIndex((x) => x.id === chosen?.id);
          const k = sel < 0 ? i - (cards.length - 1) / 2 : i - sel;
          return html`<${Card} key=${c.id} card=${c} chosen=${chosen?.id === c.id} onPick=${setChosen} style=${{ '--k': k, zIndex: 10 - Math.round(Math.abs(k) * 2) }} />`;
        })}
      </div>
      <button class="btn primary" disabled=${!chosen} onClick=${() => chosen && onConfirm(chosen)}>${confirmLabel}</button>
    </div>
  </div>`;
}

// Banner that sweeps across the board when a human turn starts.
export function TurnBanner({ text, side }) {
  const ref = useRef(null);
  useEffect(() => {
    // Entra por un lado al azar y sale por el contrario; empieza oculta (CSS) para no asomar antes.
    const s = Math.random() < 0.5 ? 1 : -1;
    const a = motion(ref.current, { x: [`${-110 * s}%`, '0%', '0%', `${110 * s}%`], opacity: [0, 1, 1, 0] }, { duration: 1.25, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' });
    return () => a.stop?.();
  }, [text]);
  return html`<div class=${'turn-banner side-' + side} ref=${ref}><span>${text}</span></div>`;
}

export function Toggle({ on, onChange, label, hint }) {
  return html`<button class="setting-row" onClick=${() => onChange(!on)} role="switch" aria-checked=${on}>
    <span><strong>${label}</strong>${hint && html`<small>${hint}</small>`}</span>
    <span class=${'toggle' + (on ? ' on' : '')}><i></i></span>
  </button>`;
}
