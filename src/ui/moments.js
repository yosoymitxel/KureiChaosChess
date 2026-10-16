// Foreground moments over the board.
// Cinematics (floor intro, boss entrance, boss down) block briefly and skip on any tap or key.
// Callouts (check, big capture, crush, promotion, collapse) never block and queue one after another.
// Each moment animates its piece too (the old animation gallery: spawn, fall, explode, promote,
// tremble, stomp, crumble), with particles drawn on a layer above the board.
import { html, render, motion, motionStagger } from './lib.js';
import { Icon, PieceIcon } from './icons.js';
import { Fx } from '../view/fx.js';

const OUT = [0.16, 1, 0.3, 1];
const IN = [0.7, 0, 0.84, 0];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
const color = (side) => getComputedStyle(document.documentElement).getPropertyValue('--side-' + side).trim() || '#fff';

export class Moments {
  constructor(host, { speed = 1, enabled = true } = {}) {
    Object.assign(this, { host, speed, enabled });
    this.queue = Promise.resolve();
    this.fx = new Fx(host);
    this.fx.canvas.style.zIndex = 9;
  }

  t(s) { return reduced() ? Math.min(s, 0.12) : s / this.speed; }

  mount(cls, vnode) {
    const el = document.createElement('div');
    el.className = 'moment ' + cls;
    this.host.appendChild(el);
    render(vnode, el);
    return el;
  }

  // Particle bursts centred on an element of the moment.
  burst(el, opts) { if (!reduced()) { const p = this.fx.pointOf(el); this.fx.burst(p.x, p.y, opts); } }
  dust(el) { if (!reduced()) { const p = this.fx.pointOf(el, 0.95); this.fx.dust(p.x, p.y, 1.6); } }

  // Piece choreography, shared by cinematics and callouts. `el` is the art wrapper.
  async animate(kind, el, piece, hold) {
    const t = (s) => this.t(s);
    const side = color(piece?.side || 'light');
    switch (kind) {
      case 'spawn': // pieces rise one after another (floor intro)
        await motion(el.querySelectorAll('.piece-icon'), { y: [40, 0], scale: [0.2, 1], opacity: [0, 1] }, { duration: t(0.45), delay: motionStagger(t(0.08)), ease: OUT });
        return sleep(hold);
      case 'stomp': // drops from above and slams (boss entrance, boss crush)
        await motion(el, { y: [-220, 0], opacity: [0, 1] }, { duration: t(0.42), ease: IN });
        this.dust(el);
        this.burst(el, { count: 26, color: [side, '#fff'], speed: [80, 300], gravity: 400, shape: 'chunk', size: [3, 7] });
        motion(this.host, { x: [0, -10, 8, -5, 0] }, { duration: t(0.35) });
        await motion(el, { scaleY: [0.82, 1.06, 1], scaleX: [1.12, 0.97, 1] }, { duration: t(0.35), ease: OUT });
        return sleep(hold);
      case 'fall': // captured: tips over, breaks apart, fades (old "capture")
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: t(0.22), ease: OUT });
        await sleep(t(0.15));
        this.burst(el, { count: 30, color: [side, '#fff', '#ffcf6b'], speed: [80, 320], gravity: 420, shape: 'chunk', size: [3, 7] });
        await motion(el, { rotate: [0, -85], y: [0, 26], opacity: [1, 0] }, { duration: t(0.5), ease: IN });
        return sleep(Math.max(0, hold - 0.4));
      case 'explode': // royal falls: trembles, then bursts (old "king capture" / "explosion")
        await motion(el, { scale: [1.4, 1], opacity: [0, 1] }, { duration: t(0.22), ease: OUT });
        await motion(el, { x: [0, -6, 6, -5, 5, -3, 3, 0] }, { duration: t(0.4) });
        this.burst(el, { count: 70, color: ['#fff', side, '#ffcf6b'], speed: [120, 520], size: [3, 8], gravity: 260, shape: 'chunk', life: [0.6, 1.2] });
        this.burst(el, { count: 40, color: '#fff', speed: [160, 480], size: [2, 4] });
        motion(this.host, { x: [0, -14, 12, -8, 6, 0] }, { duration: t(0.5) });
        await motion(el, { scale: [1, 1.5], opacity: [1, 0] }, { duration: t(0.28), ease: OUT });
        return sleep(Math.max(0, hold - 0.4));
      case 'promote': { // pawn spins and comes out a queen (old "mutation")
        const from = el.querySelector('.piece-icon'), to = el.querySelector('.swap-to');
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: t(0.22), ease: OUT });
        await motion(from, { rotateY: [0, 90] }, { duration: t(0.22), ease: IN });
        from.style.display = 'none'; to.style.display = 'grid';
        this.burst(el, { count: 40, color: ['#ffcf6b', '#fff', side], speed: [80, 320], gravity: 120 });
        await motion(to, { rotateY: [-90, 0], scale: [1.25, 1] }, { duration: t(0.4), ease: OUT });
        return sleep(Math.max(0, hold - 0.3));
      }
      case 'tremble': // royal under threat shakes in place (check)
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: t(0.22), ease: OUT });
        await motion(el, { x: [0, -5, 5, -4, 4, -3, 3, -2, 2, 0], rotate: [0, -4, 4, -3, 3, 0, 0, 0, 0, 0] }, { duration: t(0.7) });
        return sleep(Math.max(0, hold - 0.5));
      case 'hit': // boss takes a blow: flash, recoil, splinters
        await motion(el, { opacity: [0, 1] }, { duration: t(0.12) });
        el.classList.add('flash');
        this.burst(el, { count: 28, color: ['#fff', side], speed: [100, 340], size: [2, 5] });
        await motion(el, { x: [0, 18, -10, 5, 0], scale: [1, 0.9, 1.04, 1] }, { duration: t(0.45), ease: OUT });
        el.classList.remove('flash');
        return sleep(Math.max(0, hold - 0.3));
      case 'crumble': // tile icon cracks and falls (collapse)
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: t(0.2), ease: OUT });
        await motion(el, { x: [0, -3, 3, -3, 3, 0] }, { duration: t(0.3) });
        this.burst(el, { count: 34, color: [color('light'), '#000', '#b08560'], speed: [60, 260], gravity: 600, shape: 'chunk', size: [3, 8] });
        await motion(el, { y: [0, 40], rotate: [0, 12], opacity: [1, 0] }, { duration: t(0.45), ease: IN });
        return sleep(Math.max(0, hold - 0.4));
      case 'down': // boss defeated: cracks, topples, rains debris
        await motion(el, { x: [0, -8, 8, -6, 6, 0] }, { duration: t(0.5) });
        this.burst(el, { count: 90, color: [side, '#fff', '#ffcf6b'], speed: [100, 480], size: [3, 9], gravity: 380, shape: 'chunk', life: [0.7, 1.4] });
        await motion(el, { rotate: [0, -24], y: [0, 14], scale: [1, 0.9], opacity: [1, 0.2] }, { duration: t(0.7), ease: IN });
        return sleep(hold);
      case 'resign': // the classic gesture: the king is laid down on the board
        await motion(el, { opacity: [0, 1] }, { duration: t(0.25) });
        await sleep(t(0.35));
        await motion(el, { rotate: [0, -90], scale: [1, 0.72], x: [0, 30] }, { duration: t(0.9), ease: [0.45, 0, 0.55, 1] });
        this.dust(el);
        return sleep(hold);
      default:
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: t(0.25), ease: OUT });
        return sleep(hold);
    }
  }

  async cinematic({ title, sub, piece, icon, wave, hp, tone = 'paper', anim }) {
    if (!this.enabled) return;
    const el = this.mount(`cine tone-${tone}`, html`
      <i class="bar top"></i><i class="bar bottom"></i>
      <div class="cine-body">
        <div class="cine-art">${piece ? html`<${PieceIcon} type=${piece.type} side=${piece.side} size=${220} />` : html`<span class="cine-icon"><${Icon} name=${icon} size=${88} /></span>`}</div>
        <div class="cine-text">
          <h2>${title}</h2>
          ${sub && html`<p>${sub}</p>`}
          ${hp && html`<div class="cine-hp" aria-label=${hp.hp + ' vidas'}>${Array.from({ length: hp.max }, (_, i) => html`<b class=${i < hp.hp ? 'on' : ''}></b>`)}</div>`}
          ${wave && html`<div class="cine-wave">${wave.map(([type, side]) => html`<${PieceIcon} type=${type} side=${side} size=${40} />`)}</div>`}
        </div>
      </div>
      <span class="cine-skip">Toca o pulsa una tecla para seguir</span>`);
    const q = (s) => el.querySelector(s);
    let skip;
    const skipped = new Promise((r) => (skip = r));
    const onKey = (e) => { e.stopPropagation(); e.preventDefault(); skip(); };
    el.addEventListener('pointerdown', skip);
    addEventListener('keydown', onKey, true);

    motion(el.querySelectorAll('.bar'), { scaleY: [0, 1] }, { duration: this.t(0.35), ease: OUT });
    motion(q('.cine-text h2'), { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: this.t(0.5), delay: this.t(0.12), ease: OUT });
    motion(el.querySelectorAll('.cine-text p, .cine-hp, .cine-skip'), { opacity: [0, 1], y: [10, 0] }, { duration: this.t(0.4), delay: this.t(0.3), ease: OUT });
    if (!anim) motion(q('.cine-art'), { x: [120, 0], opacity: [0, 1] }, { duration: this.t(0.55), ease: OUT });
    const art = anim ? this.animate(anim, q('.cine-art'), piece, this.t(1.2)) : sleep(this.t(1.7));
    const waveDone = wave ? this.animate('spawn', q('.cine-wave'), null, 0) : null;
    await Promise.race([Promise.all([art, waveDone]), skipped]);
    removeEventListener('keydown', onKey, true);
    await motion(el, { opacity: [1, 0] }, { duration: this.t(0.28), ease: IN });
    el.remove();
  }

  // Short punch-in label with its piece animation; returns immediately and plays in order.
  callout({ text, sub, tone = 'paper', piece, pieceTo, icon, anim }) {
    if (!this.enabled) return;
    this.pending = (this.pending || 0) + 1;
    this.queue = this.queue.then(async () => {
      try {
        if (!this.enabled) return;
        const el = this.mount(`callout tone-${tone}`, html`
          <span class="band"></span>
          ${(piece || icon) && html`<span class="callout-art">
            ${piece ? html`<${PieceIcon} type=${piece.type} side=${piece.side} size=${72} />` : html`<${Icon} name=${icon} size=${52} />`}
            ${pieceTo && html`<span class="swap-to"><${PieceIcon} type=${pieceTo.type} side=${pieceTo.side} size=${72} /></span>`}
          </span>`}
          <span class="callout-text"><strong>${text}</strong>${sub && html`<small>${sub}</small>`}</span>`);
        motion(el.querySelector('.band'), { scaleX: [0, 1] }, { duration: this.t(0.22), ease: OUT });
        motion(el.querySelectorAll('strong, small'), { scale: [1.5, 1], opacity: [0, 1] }, { duration: this.t(0.3), ease: OUT });
        const art = el.querySelector('.callout-art');
        await (art ? this.animate(anim, art, piece, this.t(0.7)) : sleep(this.t(0.85)));
        await motion(el, { opacity: [1, 0], y: [0, -24] }, { duration: this.t(0.25), ease: IN });
        el.remove();
      } finally { this.pending--; }
    });
  }

  // Resolves when every callout queued so far has finished playing.
  whenIdle() { return this.queue; }

  destroy() { this.enabled = false; this.fx.destroy(); this.host.querySelectorAll('.moment').forEach((m) => m.remove()); }
}
