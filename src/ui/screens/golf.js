import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { W, H, COLS, ROWS, HOLES, SHOT_MAX, PULL_MAX, DIFFS, newGolf, shoot, step, moverAt } from '../../game/golf.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { award } from '../../game/achievements.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
// Nombre del resultado de un hoyo según los golpes sobre el par.
const NAMES = () => ({ '-3': t('golf.albatross', '¡Albatros!'), '-2': t('golf.eagle', '¡Águila!'), '-1': t('golf.birdie', '¡Birdie!'), 0: t('golf.par', 'Par'), 1: t('golf.bogey', 'Bogey') });
const result = (strokes, par) => strokes === 1 ? t('golf.ace', '¡Hoyo en uno!') : NAMES()[strokes - par] || t('golf.over', '+{n}', { n: strokes - par });

// Tirachinas: se arrastra hacia atrás desde cualquier punto de la mesa y se suelta; la bola sale al revés.
// Teclado: flechas giran y dosifican, espacio o Intro golpea.
export function GolfScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newGolf(diff || settings.miniDiff?.golf));
  const [hud, setHud] = useState({ hole: 0, strokes: 0, total: 0, par: s.holes[0].par });
  const [course, setCourse] = useState(s.course);
  const [over, setOver] = useState(null);
  const tableRef = useRef(null), wrapRef = useRef(null), screenRef = useRef(null);
  const ballRef = useRef(null), moverRef = useRef(null), aimRef = useRef(null);
  const aim = useRef({ on: false, ang: -Math.PI / 2, pow: 0.5, from: null });
  const rect = useRef(null);

  const toTable = (e) => {
    const r = rect.current || (rect.current = tableRef.current.getBoundingClientRect());
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  const pull = (at) => {
    const a = aim.current, dx = a.from[0] - at[0], dy = a.from[1] - at[1], d = Math.hypot(dx, dy);
    if (d > 2) a.ang = Math.atan2(dy, dx);
    a.pow = Math.min(1, d / PULL_MAX);
  };
  const down = (e) => {
    if (s.over || s.moving || s.wait > 0) return;
    e.preventDefault();
    rect.current = tableRef.current.getBoundingClientRect();
    tableRef.current.setPointerCapture?.(e.pointerId);
    Object.assign(aim.current, { on: true, from: toTable(e), pow: 0 });
  };
  const move = (e) => { if (aim.current.on && aim.current.from) pull(toTable(e)); };
  const up = (e) => {
    const a = aim.current;
    if (!a.on || !a.from) return;
    pull(toTable(e));
    a.on = false; a.from = null;
    if (a.pow > 0.06) shoot(s, a.ang, a.pow);
  };

  useEffect(() => {
    const table = tableRef.current, wrap = wrapRef.current;
    const fx = new Fx(table);
    const still = reduced();
    const color = { brass: css('--brass'), accent: css('--accent'), paper: css('--paper'), sand: css('--tile-b') };
    let k = table.clientWidth / W;
    const ro = new ResizeObserver(() => { k = table.clientWidth / W; rect.current = null; });
    ro.observe(table);
    const place = (el, o) => { if (el) el.style.transform = `translate3d(${o.x * k}px, ${o.y * k}px, 0) translate(-50%, -50%)`; };
    const at = (e) => ({ x: e.x * k, y: e.y * k });
    const shake = (a) => settings.shake && !still && motion(wrap, { x: [0, -a, a * 0.8, -a * 0.5, 0], y: [0, a * 0.4, -a * 0.6, 0] }, { duration: 0.28, ease: 'easeOut' });
    const squash = (el, a = 0.8) => el && !still && motion(el.firstElementChild, { scaleX: [1, 1 / a, 1], scaleY: [1, a, 1] }, { duration: 0.2, ease: [0.16, 1, 0.3, 1] });
    const banner = (text) => {
      const b = document.createElement('div');
      b.className = 'mini-banner';
      b.textContent = text;
      table.appendChild(b);
      if (still) return setTimeout(() => b.remove(), 1200);
      motion(b, { scale: [1.4, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
      motion(b, { opacity: [1, 0] }, { duration: 0.3, delay: 0.9, onComplete: () => b.remove() });
    };
    const pieceEl = (e) => table.querySelector(`.ah-pc[data-at="${e.px},${e.py}"]`) || moverRef.current;

    const juice = () => {
      for (const e of s.events) {
        const p = e.x != null && at(e);
        if (e.kind === 'shot') {
          playSfx('tap', 0.7 + 0.6 * e.power);
          squash(ballRef.current, 1 - 0.3 * e.power);
          if (!still) fx.burst(p.x, p.y, { count: Math.round(3 + 8 * e.power), color: [color.paper, color.brass], speed: [40, 80 + 160 * e.power], size: [1.5, 2.5], life: [0.15, 0.3], shape: 'spark', drag: 0.85 });
        } else if (e.kind === 'bump') {
          const f = Math.min(1, e.power / SHOT_MAX);
          playSfx(f > 0.4 ? 'hit' : 'tap', 0.8 + 0.5 * f);
          squash(pieceEl(e), 1 - 0.2 * f);
          squash(ballRef.current, 0.75);
          if (!still && f > 0.2) fx.burst(p.x, p.y, { count: Math.round(4 + 10 * f), color: ['#fff', color.brass], speed: [80, 120 + 220 * f], size: [1.5, 3], life: [0.12, 0.28], shape: 'spark', drag: 0.85 });
          if (f > 0.7) shake(3);
        } else if (e.kind === 'wall' && e.speed > 45) {
          playSfx('tap', 0.6 + 0.4 * (e.speed / SHOT_MAX));
          squash(ballRef.current, 0.8);
        } else if (e.kind === 'sand') {
          playSfx('dig', 0.9);
          if (!still) fx.burst(p.x, p.y, { count: 10, color: [color.sand, color.brass], speed: [30, 90], size: [2, 3.5], life: [0.25, 0.5], gravity: 160, shape: 'chunk', drag: 0.9 });
        } else if (e.kind === 'lip') {
          playSfx('tap', 1.4);
          banner(t('golf.lip', '¡Por poco!'));
        } else if (e.kind === 'fall') {
          playSfx('splash');
          if (!still) fx.ring(p.x, p.y, { radius: k * 10, color: color.accent, width: 3, life: 0.4 });
          banner(t('golf.fall', 'Al hueco: vuelve donde estaba'));
        } else if (e.kind === 'sink') {
          playSfx(e.strokes <= e.par ? 'coin' : 'pop');
          if (!still) {
            fx.burst(p.x, p.y, { count: 28, color: [color.brass, color.paper, color.accent], speed: [120, 340], size: [2.5, 5], life: [0.5, 0.9], gravity: 240, shape: 'chunk', spread: Math.PI, angle: -Math.PI / 2, drag: 0.94 });
            fx.ring(p.x, p.y, { radius: k * 20, color: color.brass, width: 4, life: 0.45 });
            motion(ballRef.current.firstElementChild, { scale: [1, 0.3] }, { duration: 0.25 });
          }
          shake(e.strokes === 1 ? 8 : 4);
          if (e.strokes === 1) award('golf_ace');
          banner(result(e.strokes, e.par));
        } else if (e.kind === 'pickup') {
          playSfx('invalid');
          banner(t('golf.pickup', 'Ocho golpes: al siguiente hoyo'));
        } else if (e.kind === 'hole') {
          setCourse(s.course);
          if (!still) requestAnimationFrame(() => ballRef.current && motion(ballRef.current.firstElementChild, { scale: [0.2, 1.15, 1] }, { duration: 0.32, ease: [0.16, 1, 0.3, 1] }));
          playSfx('pop');
        }
      }
      if (s.events.some((e) => /shot|sink|fall|hole|pickup/.test(e.kind))) setHud({ hole: s.hole, strokes: s.strokes, total: s.total, par: s.course.par });
    };

    // Guía de tiro: puntos en la dirección del golpe, más largos cuanto más fuerte.
    const drawAim = () => {
      const el = aimRef.current, a = aim.current, show = !s.moving && !s.wait && !s.over && (a.on || a.keys);
      el.style.opacity = show ? 1 : 0;
      if (!show) return;
      const len = (8 + a.pow * 46) * k;
      el.style.width = len + 'px';
      el.style.transform = `translate3d(${s.ball.x * k}px, ${s.ball.y * k}px, 0) rotate(${a.ang}rad)`;
      el.style.setProperty('--pow', a.pow);
    };

    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      place(ballRef.current, s.ball);
      if (s.course.mover) place(moverRef.current, moverAt(s.course.mover, s.t));
      drawAim();
      juice();
      if (s.over) {
        setOver(s.over);
        setHud({ hole: s.hole, strokes: s.strokes, total: s.total, par: s.course.par });
        if (s.over === 'win' && !still) fx.confetti([color.brass, color.accent, color.paper, css('--side-wild')]);
        if (s.over === 'lose') table.classList.add('lost');
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e) => {
      if (e.type !== 'keydown' || e.target.closest?.('input, select, textarea, .overlay') || s.over) return;
      const a = aim.current, key = e.key.toLowerCase();
      const turn = { arrowleft: -1, a: -1, arrowright: 1, d: 1 }[key], dose = { arrowup: 1, w: 1, arrowdown: -1, s: -1 }[key];
      if (turn) a.ang += turn * (e.shiftKey ? 0.15 : 0.04);
      else if (dose) a.pow = Math.max(0.05, Math.min(1, a.pow + dose * 0.05));
      else if ((key === ' ' || key === 'enter') && a.keys) { if (shoot(s, a.ang, a.pow)) a.keys = false; }
      else return;
      e.preventDefault();
      a.keys = true;
    };
    const scrolled = () => (rect.current = null);
    addEventListener('keydown', onKey);
    addEventListener('scroll', scrolled, true);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      fx.destroy();
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', scrolled, true);
    };
  }, []);

  useEffect(() => { if (over) screenRef.current?.querySelector('.mini-end')?.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }, [over]);

  const pc = (type, x, y, ref) => html`<span class="ah-pc foe side-dark" ref=${ref} data-at=${x + ',' + y} style=${ref ? '' : `left:${x / W * 100}%;top:${y / H * 100}%;transform:translate(-50%,-50%)`}>
    <span class="ah-body"><i class="ah-base"></i><span class="ah-fig" dangerouslySetInnerHTML=${{ __html: pieceSVG(type) }} /></span>
  </span>`;
  const left = s.target - hud.total - hud.strokes;

  return html`<div class="screen mini" ref=${screenRef}>
    <${Topbar} title=${MODIFIERS.golf.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="ah-wrap" ref=${wrapRef}>
            <div class="ah gf" ref=${tableRef} role="application" aria-label=${t('golf.aria', 'Campo de golf: arrastra hacia atrás y suelta para golpear la bola')}
              onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}>
              ${course.tiles.map((k, i) => html`<i class=${'ah-cell ' + ((Math.floor(i / COLS) + i) % 2 ? 'b' : 'a') + (k === 'g' ? '' : ' gf-' + k)}></i>`)}
              <i class="gf-cup" style=${`left:${course.cup.x / W * 100}%;top:${course.cup.y / H * 100}%`}><b></b></i>
              ${course.pieces.map((p) => pc(p.type, p.x, p.y))}
              ${course.mover && pc(course.mover.type, 0, 0, moverRef)}
              <span class="gf-aim" ref=${aimRef}></span>
              <span class="ah-puck gf-ball" ref=${ballRef}><i></i></span>
            </div>
          </div>
        </div>
        <div class="mini-side">
          ${!over && html`<div class="mini-stats" aria-live="polite">
            <span class="chip">${t('golf.hole', 'Hoyo {n}/{of}', { n: hud.hole + 1, of: HOLES })}</span>
            <span class="chip">${t('golf.parN', 'Par {n}', { n: hud.par })}</span>
            <span class="chip">${t('golf.strokes', 'Golpes {n}', { n: hud.strokes })}</span>
            <span class=${'chip' + (left <= 1 ? ' warn' : '')}>${t('golf.left', 'Te quedan {n}', { n: Math.max(0, left) })}</span>
          </div>`}
          ${over && html`<${MiniEnd} win=${over === 'win'} note=${over === 'win' ? t('golf.won', '{n} golpes: dentro de los {max}.', { n: s.total, max: s.target }) : t('golf.lost', 'Te pasaste de los {max} golpes.', { max: s.target })} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
          <${MiniTools} mini="golf" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('golf.help', 'Arrastra hacia atrás desde cualquier punto del campo y suelta: la bola sale al revés, más fuerte cuanto más tiras (con teclado, flechas para apuntar y dosificar y espacio para golpear). La arena frena, el hielo resbala, las piezas rebotan y en los huecos la bola vuelve donde estaba. Si llega muy rápida salta el hoyo. Mete los tres hoyos sin pasarte de los golpes que te quedan.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
