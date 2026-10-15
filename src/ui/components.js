import { html, useState, useEffect, useRef, motion, motionStagger } from './lib.js';
import { Icon } from './icons.js';

export function Topbar({ title, eyebrow, onBack, backLabel = 'Volver', backIcon = 'back', children }) {
  return html`<header class="topbar">
    ${onBack && html`<button class="btn ghost sm" onClick=${onBack}><${Icon} name=${backIcon} size=${16} />${backLabel}</button>`}
    <div>
      ${eyebrow && html`<div class="eyebrow">${eyebrow}</div>`}
      <div class="title">${title}</div>
    </div>
    <div class="spacer"></div>
    ${children}
  </header>`;
}

// Screen entrance: content rises in with a soft spring.
export function useEnter(ref, selector = '[data-enter]') {
  useEffect(() => {
    const els = ref.current?.querySelectorAll(selector);
    if (els?.length) motion(els, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5, delay: motionStagger(0.06), ease: [0.22, 1, 0.36, 1] });
  }, []);
}

// Card with pointer tilt + glare (pattern borrowed from Magic UI / Kokonut "tilt card").
function Card({ card, chosen, onPick }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty('--ry', (x - 0.5) * 18 + 'deg');
    ref.current.style.setProperty('--rx', (0.5 - y) * 14 + 'deg');
    ref.current.style.setProperty('--gx', x * 100 + '%');
    ref.current.style.setProperty('--gy', y * 100 + '%');
  };
  const onLeave = () => { ref.current.style.setProperty('--rx', '0deg'); ref.current.style.setProperty('--ry', '0deg'); };
  return html`<div ref=${ref} class=${'card' + (chosen ? ' chosen' : '')} data-deal
      onPointerMove=${onMove} onPointerLeave=${onLeave} onClick=${() => onPick(card)} role="button" tabindex="0"
      onKeyDown=${(e) => (e.key === 'Enter' || e.key === ' ') && onPick(card)}>
    <div class="face">
      ${card.rarity && html`<span class=${'rarity ' + card.rarity}>${card.rarity === 'epic' ? 'épica' : card.rarity === 'rare' ? 'rara' : 'común'}</span>`}
      ${card.stack > 1 && html`<span class="stack">×${card.stack}</span>`}
      <div class="art"><${Icon} name=${card.icon} size=${64} /></div>
      <div class="name">${card.name}</div>
      <div class="desc">${card.desc}</div>
    </div>
    <div class="back"></div>
    <div class="glare"></div>
  </div>`;
}

// Deck-builder style pick: cards are dealt face down and flip over.
export function CardPick({ eyebrow, title, subtitle, cards, onConfirm, confirmLabel = 'Quedármela' }) {
  const [chosen, setChosen] = useState(null);
  const row = useRef(null);
  useEffect(() => {
    const els = row.current.querySelectorAll('[data-deal]');
    motion(els, { opacity: [0, 1], y: [260, 0], rotateY: [180, 0], rotateZ: [-12, 0] },
      { type: 'spring', stiffness: 140, damping: 16, delay: motionStagger(0.12, { startDelay: 0.15 }) });
  }, []);
  return html`<div class="screen pick">
    <${Topbar} eyebrow=${eyebrow} title=${title} />
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
