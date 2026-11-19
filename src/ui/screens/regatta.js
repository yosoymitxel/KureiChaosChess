import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { W, H, MAX_TURNS, DIFFS, newRegatta, shoot, step } from '../../game/regatta.js';
import { COLS, moverAt } from '../../game/golf.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { tableKit, toTable as tableAt, corners } from '../table-kit.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const PULL_MAX = 56;

// Mismo tirachinas que el golf: se arrastra hacia atrás y se suelta; el barco sale al revés.
export function RegattaScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newRegatta(diff || settings.miniDiff?.regatta));
  const [hud, setHud] = useState({ turns: 0, turn: 0 });
  const [over, setOver] = useState(null);
  const tableRef = useRef(null), wrapRef = useRef(null), screenRef = useRef(null);
  const boatRefs = [useRef(null), useRef(null)], moverRef = useRef(null), aimRef = useRef(null);
  const aim = useRef({ on: false, ang: -Math.PI / 2, pow: 0.5, from: null });
  const rect = useRef(null);
  const ready = () => !s.over && !s.moving && !s.wait && s.turn === 0;

  const toTable = (e) => tableAt(e, tableRef.current, rect, W, H);
  const pull = (at) => {
    const a = aim.current, dx = a.from[0] - at[0], dy = a.from[1] - at[1], d = Math.hypot(dx, dy);
    if (d > 2) a.ang = Math.atan2(dy, dx);
    a.pow = Math.min(1, d / PULL_MAX);
  };
  const down = (e) => {
    if (!ready()) return;
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
    const kit = tableKit(table, wrap, settings, W, () => (rect.current = null));
    const { still, place, at, shake, squash, banner } = kit;
    const color = { brass: css('--brass'), accent: css('--accent'), paper: css('--paper') };
    const boat = (i) => boatRefs[i].current;

    const juice = () => {
      for (const e of s.events) {
        const p = e.x != null && at(e);
        if (e.kind === 'shot') {
          playSfx('tap', 0.7 + 0.6 * e.power);
          squash(boat(e.who), 1 - 0.3 * e.power);
          if (!still) fx.burst(p.x, p.y, { count: Math.round(3 + 8 * e.power), color: ['#fff', color.paper], speed: [40, 80 + 160 * e.power], size: [1.5, 2.5], life: [0.15, 0.3], shape: 'spark', drag: 0.85 });
        } else if (e.kind === 'bump') {
          playSfx('hit', 1);
          squash(boat(0), 0.75); squash(boat(1), 0.75);
          if (e.power > 120) shake(3);
        } else if (e.kind === 'wall' && e.speed > 45) {
          playSfx('tap', 0.6);
        } else if (e.kind === 'fall') {
          playSfx('splash');
          if (!still) fx.ring(p.x, p.y, { radius: kit.k() * 10, color: color.accent, width: 3, life: 0.4 });
          banner(e.who ? t('regatta.rivalFall', 'Al rival se lo traga el remolino') : t('regatta.fall', 'Remolino: vuelves donde estabas'));
        } else if (e.kind === 'turn') {
          if (e.who === 1) banner(t('regatta.rivalTurn', 'Sopla el rival'));
        } else if (e.kind === 'sink') {
          playSfx(e.who ? 'pop' : 'coin');
          if (!still) fx.ring(p.x, p.y, { radius: kit.k() * 20, color: color.brass, width: 4, life: 0.45 });
          shake(4);
          banner(e.who ? t('regatta.rivalWins', 'El rival llega a la boya') : t('regatta.youWin', '¡Primero en la boya!'));
        }
      }
      if (s.events.some((e) => /shot|turn|sink/.test(e.kind))) setHud({ turns: s.turns, turn: s.turn });
    };

    const drawAim = () => {
      const el = aimRef.current, a = aim.current, show = ready() && (a.on || a.keys);
      el.style.opacity = show ? 1 : 0;
      if (!show) return;
      const k = kit.k(), b = s.boats[0];
      el.style.width = (8 + a.pow * 46) * k + 'px';
      el.style.transform = `translate3d(${b.x * k}px, ${b.y * k}px, 0) rotate(${a.ang}rad)`;
      el.style.setProperty('--pow', a.pow);
    };

    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      s.boats.forEach((b, i) => place(boat(i), b));
      if (s.course.mover) place(moverRef.current, moverAt(s.course.mover, s.t));
      drawAim();
      juice();
      if (s.over) {
        setOver(s.over);
        if (s.over === 'win' && !still) fx.confetti([color.brass, color.accent, color.paper]);
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

  const c = s.course;
  const pc = (type, x, y, ref) => html`<span class="ah-pc foe side-dark" ref=${ref} style=${ref ? '' : `left:${x / W * 100}%;top:${y / H * 100}%;transform:translate(-50%,-50%)`}>
    <span class="ah-body"><i class="ah-base"></i><span class="ah-fig" dangerouslySetInnerHTML=${{ __html: pieceSVG(type) }} /></span>
  </span>`;

  return html`<div class="screen mini" ref=${screenRef}>
    <${Topbar} title=${MODIFIERS.regatta.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="ah-wrap" ref=${wrapRef}>
            <div class="ah gf rg" ref=${tableRef} role="application" aria-label=${t('regatta.aria', 'Estanque: arrastra hacia atrás y suelta para soplar tu barco')}
              onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}>
              ${c.tiles.map((k, i) => html`<i class=${'ah-cell ' + ((Math.floor(i / COLS) + i) % 2 ? 'b' : 'a') + (k === 'g' ? '' : ' gf-' + k)}></i>`)}
              ${corners}<i class="gf-cup rg-buoy" style=${`left:${c.cup.x / W * 100}%;top:${c.cup.y / H * 100}%`}></i>
              ${c.pieces.map((p) => pc(p.type, p.x, p.y))}
              ${c.mover && pc(c.mover.type, 0, 0, moverRef)}
              <span class="tk-aim" ref=${aimRef}></span>
              <span class="ah-puck gf-ball" ref=${boatRefs[0]}><i></i></span>
              <span class="ah-puck gf-ball rg-rival" ref=${boatRefs[1]}><i></i></span>
            </div>
          </div>
        </div>
        <div class="mini-side">
          ${!over && html`<div class="mini-stats" aria-live="polite">
            <span class="chip">${hud.turn ? t('regatta.rival', 'Sopla el rival') : t('regatta.you', 'Tu turno')}</span>
            <span class=${'chip' + (MAX_TURNS - hud.turns <= 2 ? ' warn' : '')}>${t('regatta.left', 'Soplos: {n}', { n: MAX_TURNS - hud.turns })}</span>
          </div>`}
          ${over && html`<${MiniEnd} win=${over === 'win'} note=${over === 'win' ? t('regatta.won', 'Llegaste a la boya en {n} soplos.', { n: s.turns }) : t('regatta.lost', 'El rival llegó antes.')} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
          <${MiniTools} mini="regatta" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('regatta.help', 'Arrastra hacia atrás y suelta: tu barco blanco sale al revés, más rápido cuanto más tiras. Después sopla el rival. Las algas frenan, la corriente resbala, las piezas rebotan y en un remolino vuelves donde estabas. Llega a la boya antes que el rival y en {n} soplos como mucho.', { n: MAX_TURNS })}<//>
        </div>
      </div>
    </div>
  </div>`;
}
