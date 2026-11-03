import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { W, H, POCKETS, SHOT_MAX, PULL_MAX, PER_SIDE, DIFFS, newPool, shoot, step } from '../../game/pool.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { tableKit, toTable as tableAt, corners } from '../table-kit.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const pct = (v, of) => (v / of) * 100 + '%';
const ROWS = 10, COLS = 6;

// Tirachinas desde cualquier punto (hacia atrás y soltar); la blanca sale al revés. Teclado: flechas
// apuntan y dosifican, espacio tira.
export function PoolScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newPool(diff || settings.miniDiff?.pool));
  const [hud, setHud] = useState({ me: 0, bot: 0, turn: 'me' });
  const [over, setOver] = useState(null);
  const tableRef = useRef(null), wrapRef = useRef(null), screenRef = useRef(null), cueRef = useRef(null), aimRef = useRef(null);
  const ballRefs = useRef({});
  const aim = useRef({ on: false, ang: -Math.PI / 2, pow: 0.5, from: null, slide: false });
  const rect = useRef(null);

  const toTable = (e) => tableAt(e, tableRef.current, rect, W, H);
  const ready = () => !s.over && s.phase === 'aim' && s.turn === 'me';
  const pull = (at) => {
    const a = aim.current, dx = a.from[0] - at[0], dy = a.from[1] - at[1], d = Math.hypot(dx, dy);
    if (d > 2) a.ang = Math.atan2(dy, dx);
    a.pow = Math.min(1, d / PULL_MAX);
  };
  const down = (e) => {
    if (!ready()) return;
    e.preventDefault();
    rect.current = null;
    tableRef.current.setPointerCapture?.(e.pointerId);
    Object.assign(aim.current, { on: true, from: toTable(e), pow: 0 });
  };
  const move = (e) => {
    const a = aim.current;
    if (a.on && a.from) pull(toTable(e));
  };
  const up = (e) => {
    const a = aim.current;
    if (a.on && a.from) { pull(toTable(e)); if (a.pow > 0.06) shoot(s, a.ang, a.pow); }
    Object.assign(a, { on: false, from: null });
  };

  useEffect(() => {
    const table = tableRef.current, fx = new Fx(table);
    const kit = tableKit(table, wrapRef.current, settings, W, () => (rect.current = null));
    const { still, place: put, at, shake, squash, banner } = kit;
    const color = { me: css('--side-light'), bot: css('--side-dark'), brass: css('--brass'), accent: css('--accent'), paper: css('--paper') };

    const juice = () => {
      for (const e of s.events) {
        const p = e.x != null && at(e);
        if (e.kind === 'shot') { playSfx('tap', 0.7 + 0.5 * e.power); squash(cueRef.current, 1 - 0.25 * e.power); }
        else if (e.kind === 'hit' || e.kind === 'clack') {
          const f = Math.min(1, e.power / SHOT_MAX);
          playSfx(e.kind === 'hit' && f > 0.35 ? 'hit' : 'tap', 0.9 + 0.6 * f);
          if (!still && f > 0.2) fx.burst(p.x, p.y, { count: Math.round(3 + 10 * f), color: ['#fff', color.brass], speed: [60, 100 + 220 * f], size: [1.5, 2.5], life: [0.1, 0.25], shape: 'spark', drag: 0.85 });
          if (f > 0.75) shake(3);
        } else if (e.kind === 'rim' && e.power > 60) playSfx('tap', 0.55);
        else if (e.kind === 'pocket') {
          const el = ballRefs.current[e.id], mine = e.side === 'me';
          playSfx(mine ? 'coin' : 'pop');
          if (el && !still) motion(el.firstElementChild, { scale: [1, 0.2], opacity: [1, 0] }, { duration: 0.25 });
          else el?.classList.add('gone');
          if (!still) fx.ring(p.x, p.y, { radius: kit.k() * 12, color: mine ? color.me : color.bot, width: 3, life: 0.35 });
        } else if (e.kind === 'foul') {
          playSfx('invalid');
          banner(t('pool.foul', 'Falta: la blanca cayó'));
          if (!still) motion(cueRef.current.firstElementChild, { scale: [1, 0.2] }, { duration: 0.25 });
        } else if (e.kind === 'cue') {
          if (!still) motion(cueRef.current.firstElementChild, { scale: [0.2, 1.1, 1] }, { duration: 0.3 });
        } else if (e.kind === 'back') {
          const el = ballRefs.current[e.id];
          if (el) { el.classList.remove('gone'); el.firstElementChild.style.opacity = ''; if (!still) motion(el.firstElementChild, { scale: [0.2, 1.1, 1], opacity: [0, 1] }, { duration: 0.3 }); }
        } else if (e.kind === 'again') banner(e.side === 'me' ? t('carrom.again', 'Repites') : t('carrom.botAgain', 'Repite el bot'));
        else if (e.kind === 'turn') {
          if (!still) motion(cueRef.current.firstElementChild, { scale: [0.3, 1.1, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
        }
      }
      if (s.events.some((e) => /pocket|turn|back/.test(e.kind))) setHud({ me: s.got.me, bot: s.got.bot, turn: s.turn });
    };

    const drawAim = () => {
      const el = aimRef.current, a = aim.current, show = ready() && (a.on || a.keys);
      el.style.opacity = show ? 1 : 0;
      if (!show) return;
      const k = kit.k();
      el.style.width = (10 + a.pow * 50) * k + 'px';
      el.style.transform = `translate3d(${s.cue.x * k}px, ${s.cue.y * k}px, 0) rotate(${a.ang}rad)`;
      el.style.setProperty('--pow', a.pow);
    };

    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      put(cueRef.current, s.cue);
      cueRef.current.classList.toggle('foe', s.turn === 'bot');
      for (const d of s.balls) if (!d.in) put(ballRefs.current[d.id], d);
      drawAim();
      juice();
      if (s.over) {
        setOver(s.over);
        setHud({ me: s.got.me, bot: s.got.bot, turn: s.turn });
        if (s.over === 'win' && !still) fx.confetti([color.me, color.accent, color.brass, color.paper]);
        if (s.over === 'lose') table.classList.add('lost');
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e) => {
      if (e.type !== 'keydown' || e.target.closest?.('input, select, textarea, .overlay') || !ready()) return;
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
      kit.destroy();
      fx.destroy();
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', scrolled, true);
    };
  }, []);

  useEffect(() => { if (over) screenRef.current?.querySelector('.mini-end')?.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }, [over]);

  const dots = (n) => html`<span class="dots">${Array.from({ length: PER_SIDE }, (_, i) => html`<i class=${i < n ? '' : 'off'}></i>`)}</span>`;
  return html`<div class="screen mini" ref=${screenRef}>
    <${Topbar} title=${MODIFIERS.pool.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="ah-wrap" ref=${wrapRef}>
            <div class="ah pl" ref=${tableRef} role="application" aria-label=${t('pool.aria', 'Mesa de billar: tira hacia atrás y suelta para golpear la blanca')}
              onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}>
              ${Array.from({ length: ROWS * COLS }, (_, i) => html`<i class=${'ah-cell ' + ((Math.floor(i / COLS) + i) % 2 ? 'b' : 'a')}></i>`)}
              ${corners}
              ${POCKETS.map((p) => html`<i class="cr-pocket" style=${`left:${pct(p.x, W)};top:${pct(p.y, H)}`}></i>`)}
              ${s.balls.map((d) => html`<span class=${'ah-puck cr-disc ' + d.side} ref=${(el) => (ballRefs.current[d.id] = el)}><b class="bm-tok"></b></span>`)}
              <span class="tk-aim" ref=${aimRef}></span>
              <span class="ah-puck cr-striker pl-cue" ref=${cueRef}><b class="bm-tok"></b></span>
            </div>
          </div>
        </div>
        <div class="mini-side">
          ${!over && html`<div class="mini-stats" aria-live="polite">
            <span class=${'chip' + (hud.turn === 'me' ? ' on' : '')}><i class="ah-dot me"></i>${t('seat.you', 'Tú')} ${dots(hud.me)}</span>
            <span class=${'chip' + (hud.turn === 'bot' ? ' on' : '')}><i class="ah-dot foe"></i>Bot ${dots(hud.bot)}</span>
          </div>`}
          ${over && html`<${MiniEnd} win=${over === 'win'} note=${over === 'win' ? t('pool.won', 'Metiste tus {n} bolas antes que el bot.', { n: PER_SIDE }) : t('pool.lost', 'El bot metió sus bolas antes: {a} a {b}.', { a: hud.me, b: hud.bot })} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
          <${MiniTools} mini="pool" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('pool.help', 'Arrastra hacia atrás desde cualquier punto y suelta: la blanca sale al revés, más fuerte cuanto más tiras (con teclado, flechas apuntan y dosifican, espacio tira). Mete tus cuatro bolas claras por las troneras antes que el bot las suyas. La blanca se queda donde para. Si metes una tuya, repites; si cae la blanca, es falta: vuelve a su sitio y una de tus bolas vuelve a la mesa.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
