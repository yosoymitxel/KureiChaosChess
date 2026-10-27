// Foreground moments over the board.
// Cinematics (floor intro, boss entrance, boss down) and piece demos (new mutation, new boss)
// block briefly and skip on any tap or key.
// Callouts (check, big capture, crush, promotion, collapse) never block and queue one after another.
// Each moment animates its piece too (the old animation gallery: spawn, fall, explode, promote,
// tremble, stomp, crumble), with particles drawn on a layer above the board.
import { html, render, motion, motionStagger } from './lib.js';
import { Icon, PieceIcon } from './icons.js';
import { Fx } from '../view/fx.js';
import { t, tp } from '../i18n/index.js';

const OUT = [0.16, 1, 0.3, 1];
const IN = [0.7, 0, 0.84, 0];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
// Any tap or key ends a blocking moment early; `release` removes the key listener afterwards.
function skippable(el) {
  let skip;
  const skipped = new Promise((r) => (skip = r));
  const onKey = (e) => { e.stopPropagation(); e.preventDefault(); skip(); };
  el.addEventListener('pointerdown', skip);
  addEventListener('keydown', onKey, true);
  return { skipped, release: () => removeEventListener('keydown', onKey, true) };
}
// Las dos caras de la moneda de cara o cruz: la ficha de damas (vector) y su versión píxel 16×16
// (disco escalonado con canto y estría); encima, la corona (cara) o la cruz (cruz).
const discPx = (() => {
  const run = (test) => {
    let d = '';
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (test(Math.hypot(x - 7.5, y - 7.5))) d += `M${x} ${y}h1v1h-1z`;
    return d;
  };
  return { ink: run((r) => r <= 8 && r > 6.9), fill: run((r) => r <= 6.9), groove: run((r) => r <= 5.4 && r > 4.5) };
})();
const TOSS_CROSS = html`<svg class="toss-cross" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M6 2h4v4h4v4h-4v4H6v-4H2V6h4z"/></svg>`;
const tossFace = (side, mark) => html`<div class=${'toss-face side-' + side}>
  <svg class="toss-px" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path class="ink" d=${discPx.ink}/><path class="fill" d=${discPx.fill}/><path class="groove" d=${discPx.groove}/></svg>
  <span class="toss-mark">${mark}</span>
</div>`;
const color = (side) => getComputedStyle(document.documentElement).getPropertyValue('--side-' + side).trim() || '#fff';

export class Moments {
  constructor(host, { speed = 1, enabled = true } = {}) {
    Object.assign(this, { host, speed, enabled });
    this.waiting = [];
    this.idle = [];
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
  fx2(el, draw) { if (!reduced()) draw(this.fx, this.fx.pointOf(el)); }
  dust(el) { if (!reduced()) { const p = this.fx.pointOf(el, 0.95); this.fx.dust(p.x, p.y, 1.6); } }

  // Piece choreography, shared by cinematics and callouts. `el` is the art wrapper.
  async animate(kind, el, piece, hold) {
    const ts = (s) => this.t(s);
    const side = color(piece?.side || 'light');
    switch (kind) {
      case 'spawn': // pieces rise one after another (floor intro)
        await motion(el.querySelectorAll('.piece-icon'), { y: [40, 0], scale: [0.2, 1], opacity: [0, 1] }, { duration: ts(0.45), delay: motionStagger(ts(0.08)), ease: OUT });
        return sleep(hold);
      case 'stomp': // drops from above and slams (boss entrance, boss crush)
        await motion(el, { y: [-220, 0], opacity: [0, 1] }, { duration: ts(0.42), ease: IN });
        this.dust(el);
        this.burst(el, { count: 26, color: [side, '#fff'], speed: [80, 300], gravity: 400, shape: 'chunk', size: [3, 7] });
        motion(this.host, { x: [0, -10, 8, -5, 0] }, { duration: ts(0.35) });
        await motion(el, { scaleY: [0.82, 1.06, 1], scaleX: [1.12, 0.97, 1] }, { duration: ts(0.35), ease: OUT });
        return sleep(hold);
      case 'fall': // captured: tips over, breaks apart, fades (old "capture")
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: ts(0.22), ease: OUT });
        await sleep(ts(0.15));
        this.fx2(el, (fx, p) => fx.debris(p.x, p.y, side, 1.6));
        await motion(el, { rotate: [0, -85], y: [0, 26], opacity: [1, 0] }, { duration: ts(0.5), ease: IN });
        return sleep(Math.max(0, hold - 0.4));
      case 'explode': // royal falls: trembles, then bursts (old "king capture" / "explosion")
        await motion(el, { scale: [1.4, 1], opacity: [0, 1] }, { duration: ts(0.22), ease: OUT });
        await motion(el, { x: [0, -6, 6, -5, 5, -3, 3, 0] }, { duration: ts(0.4) });
        this.fx2(el, (fx, p) => { fx.explosion(p.x, p.y, 2.2); fx.debris(p.x, p.y, side, 2); });
        motion(this.host, { x: [0, -14, 12, -8, 6, 0] }, { duration: ts(0.5) });
        await motion(el, { scale: [1, 1.5], opacity: [1, 0] }, { duration: ts(0.28), ease: OUT });
        return sleep(Math.max(0, hold - 0.4));
      case 'promote': { // pawn spins and comes out a queen (old "mutation")
        const from = el.querySelector('.piece-icon'), to = el.querySelector('.swap-to');
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: ts(0.22), ease: OUT });
        await motion(from, { rotateY: [0, 90] }, { duration: ts(0.22), ease: IN });
        from.style.display = 'none'; to.style.display = 'grid';
        this.fx2(el, (fx, p) => fx.sparkle(p.x, p.y, '#ffcf6b', 22));
        await motion(to, { rotateY: [-90, 0], scale: [1.25, 1] }, { duration: ts(0.4), ease: OUT });
        return sleep(Math.max(0, hold - 0.3));
      }
      case 'tremble': // royal under threat shakes in place (check)
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: ts(0.22), ease: OUT });
        await motion(el, { x: [0, -5, 5, -4, 4, -3, 3, -2, 2, 0], rotate: [0, -4, 4, -3, 3, 0, 0, 0, 0, 0] }, { duration: ts(0.7) });
        return sleep(Math.max(0, hold - 0.5));
      case 'hit': // boss takes a blow: flash, recoil, splinters
        await motion(el, { opacity: [0, 1] }, { duration: ts(0.12) });
        el.classList.add('flash');
        this.burst(el, { count: 18, color: ['#fff', '#ffe2a8'], speed: [260, 560], size: [2, 4], life: [0.18, 0.35], shape: 'spark', drag: 0.85 });
        this.fx2(el, (fx, p) => fx.debris(p.x, p.y, side, 0.8));
        await motion(el, { x: [0, 18, -10, 5, 0], scale: [1, 0.9, 1.04, 1] }, { duration: ts(0.45), ease: OUT });
        el.classList.remove('flash');
        return sleep(Math.max(0, hold - 0.3));
      case 'crumble': // tile icon cracks and falls (collapse)
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: ts(0.2), ease: OUT });
        await motion(el, { x: [0, -3, 3, -3, 3, 0] }, { duration: ts(0.3) });
        this.burst(el, { count: 34, color: [color('light'), '#000', '#b08560'], speed: [60, 260], gravity: 600, shape: 'chunk', size: [3, 8] });
        await motion(el, { y: [0, 40], rotate: [0, 12], opacity: [1, 0] }, { duration: ts(0.45), ease: IN });
        return sleep(Math.max(0, hold - 0.4));
      case 'down': // boss defeated: cracks, topples, rains debris
        await motion(el, { x: [0, -8, 8, -6, 6, 0] }, { duration: ts(0.5) });
        this.fx2(el, (fx, p) => { fx.explosion(p.x, p.y, 2.6); fx.debris(p.x, p.y, side, 2.4); setTimeout(() => fx.smoke(p.x, p.y + 30, 2), 250); });
        await motion(el, { rotate: [0, -24], y: [0, 14], scale: [1, 0.9], opacity: [1, 0.2] }, { duration: ts(0.7), ease: IN });
        return sleep(hold);
      case 'resign': // the classic gesture: the king is laid down on the board
        await motion(el, { opacity: [0, 1] }, { duration: ts(0.25) });
        await sleep(ts(0.35));
        await motion(el, { rotate: [0, -90], scale: [1, 0.72], x: [0, 30] }, { duration: ts(0.9), ease: [0.45, 0, 0.55, 1] });
        this.dust(el);
        return sleep(hold);
      default:
        await motion(el, { scale: [1.3, 1], opacity: [0, 1] }, { duration: ts(0.25), ease: OUT });
        return sleep(hold);
    }
  }

  async cinematic({ title, sub, piece, icon, wave, hp, tone = 'paper', anim }) {
    if (!this.enabled) return;
    await this.whenIdle(); // pending callouts play first, so nothing overlaps
    const el = this.mount(`cine tone-${tone}`, html`
      <i class="bar top"></i><i class="bar bottom"></i>
      <div class="cine-body">
        <div class="cine-art">${piece ? html`<${PieceIcon} type=${piece.type} side=${piece.side} size=${220} paper=${false} />` : html`<span class="cine-icon"><${Icon} name=${icon} size=${88} /></span>`}</div>
        <div class="cine-text">
          <h2>${title}</h2>
          ${sub && html`<p>${sub}</p>`}
          ${hp && html`<div class="cine-hp" aria-label=${tp('log.lives', hp.hp, '{n} vida', '{n} vidas')}>${Array.from({ length: hp.max }, (_, i) => html`<b class=${i < hp.hp ? 'on' : ''}></b>`)}</div>`}
          ${wave && html`<div class="cine-wave">${wave.map(([type, side]) => html`<${PieceIcon} type=${type} side=${side} size=${40} paper=${false} />`)}</div>`}
        </div>
      </div>
      <span class="cine-skip">${t('cine.skip', 'Toca o pulsa una tecla para seguir')}</span>`);
    const q = (s) => el.querySelector(s);
    const { skipped, release } = skippable(el);

    motion(el.querySelectorAll('.bar'), { scaleY: [0, 1] }, { duration: this.t(0.35), ease: OUT });
    motion(q('.cine-text h2'), { clipPath: ['inset(-0.3em 100% -0.3em -0.1em)', 'inset(-0.3em -0.1em -0.3em -0.1em)'] }, { duration: this.t(0.5), delay: this.t(0.12), ease: OUT });
    motion(el.querySelectorAll('.cine-text p, .cine-hp, .cine-skip'), { opacity: [0, 1], y: [10, 0] }, { duration: this.t(0.4), delay: this.t(0.3), ease: OUT });
    // La figura entra por la derecha, la izquierda o desde arriba, para que no se repita siempre igual.
    const from = [{ x: [120, 0] }, { x: [-120, 0] }, { y: [-140, 0] }][Math.floor(Math.random() * 3)];
    if (!anim) motion(q('.cine-art'), { ...from, opacity: [0, 1] }, { duration: this.t(0.55), ease: OUT });
    const art = anim ? this.animate(anim, q('.cine-art'), piece, this.t(1.2)) : sleep(this.t(1.7));
    const waveDone = wave ? this.animate('spawn', q('.cine-wave'), null, 0) : null;
    await Promise.race([Promise.all([art, waveDone]), skipped]);
    release();
    await motion(el, { opacity: [1, 0] }, { duration: this.t(0.28), ease: IN });
    el.remove();
  }

  // Cara o cruz: la ficha de damas sube girando y cae enseñando el bando que empieza (cara, marfil).
  async coin({ heads, title, sub }) {
    if (!this.enabled) return;
    await this.whenIdle();
    const el = this.mount('cine tone-brass', html`
      <i class="bar top"></i><i class="bar bottom"></i>
      <div class="cine-body">
        <div class="cine-art toss-stage"><div class="toss">${tossFace('light', html`<${Icon} name="crown" size=${48} />`)}${tossFace('dark', TOSS_CROSS)}</div></div>
        <div class="cine-text"><h2>${title}</h2>${sub && html`<p>${sub}</p>`}</div>
      </div>
      <span class="cine-skip">${t('cine.skip', 'Toca o pulsa una tecla para seguir')}</span>`);
    const q = (s) => el.querySelector(s), ts = (s) => this.t(s);
    const { skipped, release } = skippable(el);
    const play = (async () => {
      motion(el.querySelectorAll('.bar'), { scaleY: [0, 1] }, { duration: ts(0.35), ease: OUT });
      q('.cine-text').style.opacity = 0;
      const spin = 360 * 5 + (heads ? 0 : 180);
      motion(q('.toss'), { rotateX: [0, spin] }, { duration: ts(1.4), ease: (x) => 1 - (1 - x) ** 2.4 });
      await motion(q('.toss-stage'), { y: [0, -150, 0], scale: [0.7, 1.15, 1] }, { duration: ts(1.4), ease: (x) => x });
      this.dust(q('.toss-stage'));
      await motion(q('.toss-stage'), { y: [0, -14, 0] }, { duration: ts(0.25), ease: OUT });
      await motion(q('.cine-text'), { opacity: [0, 1], y: [10, 0] }, { duration: ts(0.35), ease: OUT });
      await sleep(ts(1.1));
    })();
    await Promise.race([play, skipped]);
    release();
    await motion(el, { opacity: [1, 0] }, { duration: ts(0.28), ease: IN });
    el.remove();
  }

  // Demo breve de una pieza (mutación nueva o jefe): tablerito con su alcance de siempre y, en azul,
  // lo que se añade; la pieza salta a una casilla nueva. Se salta con un toque, como las cinemáticas.
  async demo({ title, sub, piece, base, extra = [], n = 7, at, size = [1, 1], anchors, tone = 'paper' }) {
    if (!this.enabled) return;
    await this.whenIdle();
    const mid = (n - 1) / 2;
    const [h, w] = size, [ar, ac] = at || [mid, mid];
    const cells = Array.from({ length: n * n }, (_, i) => {
      const r = Math.floor(i / n), c = i % n, k = r + ',' + c;
      const kind = base.includes(k) ? ' base' : extra.includes(k) ? ' extra' : '';
      return html`<i class=${'dm-cell' + ((r + c) % 2 ? ' dark' : '') + kind}>${kind && html`<b></b>`}</i>`;
    });
    const el = this.mount(`cine demo tone-${tone}`, html`
      <i class="bar top"></i><i class="bar bottom"></i>
      <div class="cine-body">
        <div class="dm-board" style=${{ '--n': n }}>${cells}
          <span class="dm-piece" style=${{ '--r': ar, '--c': ac, '--h': h, '--w': w }}><${PieceIcon} type=${piece.type} side=${piece.side} size=${64} paper=${false} /></span>
        </div>
        <div class="cine-text">
          <h2>${title}</h2>
          ${sub && html`<p>${sub}</p>`}
          ${extra.length > 0 && html`<p class="dm-legend"><i></i>${t('demo.usual', 'de siempre')} <i class="extra"></i>${t('demo.new', 'nuevo')}</p>`}
        </div>
      </div>
      <span class="cine-skip">${t('cine.skip', 'Toca o pulsa una tecla para seguir')}</span>`);
    const q = (s) => el.querySelector(s);
    const { skipped, release } = skippable(el);
    const ts = (s) => this.t(s);
    const play = (async () => {
      motion(el.querySelectorAll('.bar'), { scaleY: [0, 1] }, { duration: ts(0.35), ease: OUT });
      motion(q('.cine-text h2'), { clipPath: ['inset(-0.3em 100% -0.3em -0.1em)', 'inset(-0.3em -0.1em -0.3em -0.1em)'] }, { duration: ts(0.5), delay: ts(0.12), ease: OUT });
      motion(el.querySelectorAll('.cine-text p, .cine-skip'), { opacity: [0, 1], y: [10, 0] }, { duration: ts(0.4), delay: ts(0.3), ease: OUT });
      await motion(q('.dm-board'), { scale: [0.85, 1], opacity: [0, 1] }, { duration: ts(0.35), ease: OUT });
      await motion(el.querySelectorAll('.dm-cell.base b'), { scale: [0, 1] }, { duration: ts(0.25), delay: motionStagger(ts(0.03)), ease: OUT });
      if (extra.length) await motion(el.querySelectorAll('.dm-cell.extra b'), { scale: [0, 1.4, 1] }, { duration: ts(0.35), delay: motionStagger(ts(0.05)), ease: OUT });
      // La pieza prueba una casilla: la nueva más lejana si la hay (un jefe, su destino más lejano).
      const pool = anchors || (extra.length ? extra : base).map((k) => k.split(',').map(Number));
      const far = [...pool].sort((a, b) => Math.hypot(b[0] - ar, b[1] - ac) - Math.hypot(a[0] - ar, a[1] - ac))[0];
      if (far) {
        const to = { x: ((far[1] - ac) * 100) / w + '%', y: ((far[0] - ar) * 100) / h + '%' };
        await motion(q('.dm-piece'), { x: ['0%', to.x], y: ['0%', to.y], scale: [1, 1.15, 1] }, { duration: ts(0.5), ease: [0.45, 0, 0.55, 1] });
        await sleep(ts(0.35));
        await motion(q('.dm-piece'), { x: [to.x, '0%'], y: [to.y, '0%'] }, { duration: ts(0.4), ease: OUT });
      }
      await sleep(ts(0.9));
    })();
    await Promise.race([play, skipped]);
    release();
    await motion(el, { opacity: [1, 0] }, { duration: ts(0.28), ease: IN });
    el.remove();
  }

  // Short punch-in label with its piece animation; returns immediately and plays by importance.
  // `tier`: 'major' (king, boss, check, collapse) lands bigger and holds longer and goes first;
  // 'info' reads small and quick and is dropped when something bigger is waiting. At most 3 wait.
  callout(opts) {
    if (!this.enabled) return;
    const prio = opts.tier === 'major' ? 2 : opts.tier === 'info' ? 0 : 1;
    if (prio > 0) this.waiting = this.waiting.filter((it) => it.prio > 0);
    this.waiting.push({ opts, prio });
    this.waiting.sort((a, b) => b.prio - a.prio);
    this.waiting.length = Math.min(this.waiting.length, 3);
    if (!this.playing) this.pump();
  }

  async pump() {
    this.playing = true;
    while (this.waiting.length && this.enabled) await this.play(this.waiting.shift().opts);
    this.playing = false;
    const done = this.idle;
    this.idle = [];
    done.forEach((r) => r());
  }

  // A move was made: labels still waiting describe a board that no longer exists.
  dropWaiting() { this.waiting = []; }

  async play({ text, sub, tone = 'paper', piece, pieceTo, icon, anim, tier }) {
    const hold = tier === 'major' ? 1 : tier === 'info' ? 0.4 : 0.7;
    const el = this.mount(`callout tone-${tone}${tier ? ' tier-' + tier : ''}`, html`
      <span class="band"></span>
      ${(piece || icon) && html`<span class="callout-art">
        ${piece ? html`<${PieceIcon} type=${piece.type} side=${piece.side} size=${72} paper=${false} />` : html`<${Icon} name=${icon} size=${52} />`}
        ${pieceTo && html`<span class="swap-to"><${PieceIcon} type=${pieceTo.type} side=${pieceTo.side} size=${72} paper=${false} /></span>`}
      </span>`}
      <span class="callout-text"><strong>${text}</strong>${sub && html`<small>${sub}</small>`}</span>`);
    // Entra por la izquierda o la derecha (la banda se despliega desde ese lado) o cae entera
    // desde arriba, y se va por el lado contrario. La banda nunca se encoge en alto: se leía como rota.
    const dir = ['left', 'right', 'top'][Math.floor(Math.random() * 3)];
    const band = el.querySelector('.band');
    if (dir === 'top') motion(el, { y: [-this.host.clientHeight * 0.4, 0] }, { duration: this.t(0.3), ease: OUT });
    // clip-path y no scaleX: mover transform-origin a un lado también movía el eje del giro de la banda.
    else motion(band, { clipPath: [dir === 'left' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', 'inset(0 0% 0 0%)'] }, { duration: this.t(0.22), ease: OUT });
    motion(el.querySelectorAll('strong, small'), { scale: [1.5, 1], opacity: [0, 1] }, { duration: this.t(0.3), ease: OUT });
    const art = el.querySelector('.callout-art');
    await (art ? this.animate(anim, art, piece, this.t(hold)) : sleep(this.t(hold + 0.15)));
    const out = { left: { x: [0, 60] }, right: { x: [0, -60] }, top: { y: [0, 30] } }[dir];
    await motion(el, { opacity: [1, 0], ...out }, { duration: this.t(0.25), ease: IN });
    el.remove();
  }

  // Resolves when no callout is playing or waiting.
  whenIdle() { return this.playing ? new Promise((r) => this.idle.push(r)) : Promise.resolve(); }

  destroy() { this.enabled = false; this.fx.destroy(); this.host.querySelectorAll('.moment').forEach((m) => m.remove()); }
}
