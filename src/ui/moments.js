// Foreground moments over the board.
// Cinematics (floor intro, boss entrance, boss down) block briefly and skip on any tap or key.
// Callouts (check, big capture, crush, promotion, collapse) never block and queue one after another.
import { html, render, motion } from './lib.js';
import { Icon, PieceIcon } from './icons.js';

const OUT = [0.16, 1, 0.3, 1];
const IN = [0.7, 0, 0.84, 0];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Moments {
  constructor(host, { speed = 1, enabled = true } = {}) {
    Object.assign(this, { host, speed, enabled });
    this.queue = Promise.resolve();
  }

  t(s) { return reduced() ? Math.min(s, 0.12) : s / this.speed; }

  mount(cls, vnode) {
    const el = document.createElement('div');
    el.className = 'moment ' + cls;
    this.host.appendChild(el);
    render(vnode, el);
    return el;
  }

  async cinematic({ title, sub, piece, icon, hp, tone = 'paper' }) {
    if (!this.enabled) return;
    const el = this.mount(`cine tone-${tone}`, html`
      <i class="bar top"></i><i class="bar bottom"></i>
      <div class="cine-body">
        <div class="cine-art">${piece ? html`<${PieceIcon} type=${piece.type} side=${piece.side} size=${220} />` : html`<span class="cine-icon"><${Icon} name=${icon} size=${88} /></span>`}</div>
        <div class="cine-text">
          <h2>${title}</h2>
          ${sub && html`<p>${sub}</p>`}
          ${hp && html`<div class="cine-hp" aria-label=${hp.hp + ' vidas'}>${Array.from({ length: hp.max }, (_, i) => html`<b class=${i < hp.hp ? 'on' : ''}></b>`)}</div>`}
        </div>
      </div>
      <span class="cine-skip">Toca o pulsa una tecla para seguir</span>`);
    const q = (s) => el.querySelector(s);
    let skip;
    const skipped = new Promise((r) => (skip = r));
    const onKey = (e) => { e.stopPropagation(); e.preventDefault(); skip(); };
    el.addEventListener('pointerdown', skip);
    addEventListener('keydown', onKey, true);
    const hold = (s) => Promise.race([new Promise((r) => setTimeout(r, s * 1000)), skipped]);

    motion(el.querySelectorAll('.bar'), { scaleY: [0, 1] }, { duration: this.t(0.35), ease: OUT });
    motion(q('.cine-art'), { x: [120, 0], opacity: [0, 1] }, { duration: this.t(0.55), ease: OUT });
    motion(q('.cine-text h2'), { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: this.t(0.5), delay: this.t(0.12), ease: OUT });
    motion(el.querySelectorAll('.cine-text p, .cine-hp, .cine-skip'), { opacity: [0, 1], y: [10, 0] }, { duration: this.t(0.4), delay: this.t(0.3), ease: OUT });
    await hold(this.t(1.7));
    removeEventListener('keydown', onKey, true);
    await motion(el, { opacity: [1, 0] }, { duration: this.t(0.28), ease: IN });
    el.remove();
  }

  // Short punch-in label; returns immediately, plays in order with earlier callouts.
  callout({ text, sub, tone = 'paper', piece, icon }) {
    if (!this.enabled) return;
    this.queue = this.queue.then(async () => {
      if (!this.enabled) return;
      const el = this.mount(`callout tone-${tone}`, html`
        <span class="band"></span>
        ${(piece || icon) && html`<span class="callout-art">${piece ? html`<${PieceIcon} type=${piece.type} side=${piece.side} size=${64} />` : html`<${Icon} name=${icon} size=${44} />`}</span>`}
        <span class="callout-text"><strong>${text}</strong>${sub && html`<small>${sub}</small>`}</span>`);
      motion(el.querySelector('.band'), { scaleX: [0, 1] }, { duration: this.t(0.22), ease: OUT });
      await motion(el.querySelectorAll('strong, small, .callout-art'), { scale: [1.5, 1], opacity: [0, 1] }, { duration: this.t(0.3), ease: OUT });
      await new Promise((r) => setTimeout(r, this.t(0.55) * 1000));
      await motion(el, { opacity: [1, 0], y: [0, -24] }, { duration: this.t(0.25), ease: IN });
      el.remove();
    });
  }

  destroy() { this.enabled = false; this.host.querySelectorAll('.moment').forEach((m) => m.remove()); }
}
