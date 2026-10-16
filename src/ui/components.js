import { html, useState, useEffect, useRef, motion, motionStagger } from './lib.js';
import { Icon } from './icons.js';

export function Topbar({ title, sub, onBack, backLabel = 'Volver', children }) {
  return html`<header class="topbar">
    ${onBack && html`<button class="btn ghost sm" onClick=${onBack}><${Icon} name="back" size=${16} />${backLabel}</button>`}
    <div>
      <h1 class="title">${title}</h1>
      ${sub && html`<p class="sub">${sub}</p>`}
    </div>
    <div class="spacer"></div>
    ${children}
  </header>`;
}

// Cierre común de los minijuegos: resultado, motivo y botón en un solo bloque, en cada pantalla.
export function MiniEnd({ win, title, note, label = 'Continuar', onEnd }) {
  return html`<div class=${'mini-end ' + (win ? 'win' : 'lose')} role="status">
    <p class="mini-end-title">${title ?? (win ? '¡Victoria!' : 'Derrota')}</p>
    ${note && html`<p class="mini-end-note">${note}</p>`}
    <button class="btn primary" onClick=${() => onEnd()}>${label}</button>
  </div>`;
}

// Destructive actions ask for a second press instead of a browser dialog.
export function ConfirmButton({ class: cls = 'btn', onConfirm, confirmLabel = 'Pulsa otra vez para confirmar', children }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return html`<button class=${cls + (armed ? ' armed' : '')} onClick=${() => (armed ? onConfirm() : setArmed(true))}>${armed ? confirmLabel : children}</button>`;
}

// Screen entrance: content rises in with a soft spring.
export function useEnter(ref, selector = '[data-enter]') {
  useEffect(() => {
    const els = ref.current?.querySelectorAll(selector);
    if (els?.length) motion(els, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5, delay: motionStagger(0.06), ease: [0.22, 1, 0.36, 1] });
  }, []);
}

// Card tilts toward the pointer like a card held in hand (Magic UI / Kokonut tilt-card pattern).
function Card({ card, chosen, onPick }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty('--ry', (x - 0.5) * 18 + 'deg');
    ref.current.style.setProperty('--rx', (0.5 - y) * 14 + 'deg');
  };
  const onLeave = () => { ref.current.style.setProperty('--rx', '0deg'); ref.current.style.setProperty('--ry', '0deg'); };
  return html`<div ref=${ref} class=${'card' + (chosen ? ' chosen' : '')} data-deal
      onPointerMove=${onMove} onPointerLeave=${onLeave} onClick=${() => onPick(card)} role="button" tabindex="0"
      onKeyDown=${(e) => (e.key === 'Enter' || e.key === ' ') && onPick(card)}>
    <${CardFace} card=${card} />
    <div class="back"></div>
  </div>`;
}

const KIND_LABEL = { tactic: 'Táctica', mutation: 'Mutación', boon: 'Objeto' };
const RARITY_LABEL = { common: 'común', rare: 'rara', epic: 'épica' };

// One card anatomy for every card in the game (rewards, hand, previews):
// frame colour = kind, gem = rarity, title plate, art window, type line, rules box.
export function CardFace({ card, mini = false }) {
  const kind = card.kind || 'boon', rarity = card.rarity || 'common';
  return html`<div class=${`face kind-${kind}`}>
    <span class=${'gem ' + rarity} title=${RARITY_LABEL[rarity]}></span>
    <div class="plate">${card.name}</div>
    <div class="art"><${Icon} name=${card.icon} size=${mini ? 34 : 72} /></div>
    <div class="type">${KIND_LABEL[kind]} · ${RARITY_LABEL[rarity]}${card.stack > 1 ? ` · ×${card.stack}` : ''}</div>
    ${!mini && html`<p class="desc">${card.desc}</p>`}
  </div>`;
}

// Deck-builder style pick: cards are dealt face down and flip over.
export function CardPick({ title, subtitle, cards, onConfirm, confirmLabel = 'Quedármela' }) {
  const [chosen, setChosen] = useState(null);
  const row = useRef(null);
  useEffect(() => {
    const els = row.current.querySelectorAll('[data-deal]');
    motion(els, { opacity: [0, 1], y: [260, 0], rotateY: [180, 0], rotateZ: [-12, 0] },
      { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: motionStagger(0.12, { startDelay: 0.15 }) });
  }, []);
  return html`<div class="screen pick">
    <${Topbar} title=${title} />
    <div class="pick-body">
      <p class="pick-sub">${subtitle}</p>
      <div class="card-row" ref=${row}>
        ${cards.map((c) => html`<${Card} key=${c.id} card=${c} chosen=${chosen?.id === c.id} onPick=${setChosen} />`)}
      </div>
      <button class="btn primary" disabled=${!chosen} onClick=${() => chosen && onConfirm(chosen)}>${confirmLabel}</button>
    </div>
  </div>`;
}

// Banner that sweeps across the board when a human turn starts.
export function TurnBanner({ text, side }) {
  const ref = useRef(null);
  useEffect(() => {
    const a = motion(ref.current, { x: ['-110%', '0%', '0%', '110%'], opacity: [0, 1, 1, 0] }, { duration: 1.25, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' });
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
