import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { W, H, GUTTER, LINE, BALL_R, SHOT_MAX, PULL_MAX, FRAMES, DIFFS, newTenpin, place, shoot, step, total } from '../../game/tenpin.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { tableKit, toTable as tableAt, corners } from '../table-kit.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const pct = (v, of) => (v / of) * 100 + '%';
const ROWS = 10, COLS = 6;

// Arrastrar la bola la mueve por la línea de tiro; arrastrar en cualquier otro punto es el tirachinas
// (hacia atrás y soltar). Teclado: Z/X mueven la bola, flechas apuntan y dosifican, espacio tira.
export function TenpinScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newTenpin(diff || settings.miniDiff?.tenpin));
  const [hud, setHud] = useState({ me: 0, bot: 0, turn: 'me', frame: 1 });
  const [over, setOver] = useState(null);
  const tableRef = useRef(null), wrapRef = useRef(null), screenRef = useRef(null), ballRef = useRef(null), aimRef = useRef(null), pinRefs = useRef({});
  const aim = useRef({ on: false, ang: -Math.PI / 2, pow: 0.7, from: null, slide: false });
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
    const at = toTable(e), near = Math.hypot(at[0] - s.x, at[1] - LINE) < BALL_R * 2.5;
    Object.assign(aim.current, { on: !near, slide: near, from: at, pow: 0 });
  };
  const move = (e) => {
    const a = aim.current;
    if (a.slide) place(s, toTable(e)[0]);
    else if (a.on && a.from) pull(toTable(e));
  };
  const up = (e) => {
    const a = aim.current;
    if (a.on && a.from) { pull(toTable(e)); if (a.pow > 0.06) shoot(s, a.ang, a.pow); }
    Object.assign(a, { on: false, slide: false, from: null });
  };

  useEffect(() => {
    const table = tableRef.current, fx = new Fx(table);
    const kit = tableKit(table, wrapRef.current, settings, W, () => (rect.current = null));
    const { still, place: put, at, shake, squash, banner } = kit;
    const color = { me: css('--side-light'), brass: css('--brass'), accent: css('--accent'), paper: css('--paper') };

    const juice = () => {
      for (const e of s.events) {
        const p = e.x != null && at(e);
        if (e.kind === 'shot') { playSfx('whoosh', 0.7 + 0.5 * e.power); squash(ballRef.current, 1 - 0.25 * e.power); }
        else if (e.kind === 'hit' || e.kind === 'clack') {
          const f = Math.min(1, e.power / SHOT_MAX);
          playSfx(e.kind === 'hit' ? 'hit' : 'tap', 0.9 + 0.6 * f);
          if (!still && f > 0.2) fx.burst(p.x, p.y, { count: Math.round(3 + 8 * f), color: ['#fff', color.brass], speed: [60, 100 + 200 * f], size: [1.5, 2.5], life: [0.1, 0.25], shape: 'spark', drag: 0.85 });
          if (f > 0.6) shake(3);
        } else if (e.kind === 'gutter') playSfx('invalid');
        else if (e.kind === 'down') {
          const el = pinRefs.current[e.id];
          el?.classList.add('down');
          if (el && !still) motion(el.querySelector('.ah-body'), { rotate: [0, (e.vx >= 0 ? 1 : -1) * 80] }, { duration: 0.35, ease: [0.5, 0, 0.75, 0] });
        } else if (e.kind === 'result') {
          if (e.strike) { banner(t('tenpin.strike', '¡Pleno!')); if (!still) fx.confetti([color.me, color.accent, color.brass, color.paper]); playSfx('win'); }
          else if (e.spare) banner(t('tenpin.spare', '¡Semipleno!'));
          else banner(t('tenpin.pins', '{n} bolos', { n: e.n }));
          for (const pin of s.pins) if (pin.gone) pinRefs.current[pin.id]?.classList.add('gone');
        } else if (e.kind === 'rack') {
          for (const el of Object.values(pinRefs.current)) {
            el?.classList.remove('down', 'gone');
            const body = el?.querySelector('.ah-body');
            if (body) body.style.transform = '';
          }
        } else if (e.kind === 'turn' && !still) motion(ballRef.current.firstElementChild, { scale: [0.3, 1.1, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
      }
      if (s.events.some((e) => /result|turn/.test(e.kind))) setHud({ me: total(s, 'me'), bot: total(s, 'bot'), turn: s.turn, frame: Math.min(s.frame + 1, s.frames) });
    };

    const drawAim = () => {
      const el = aimRef.current, a = aim.current, show = ready() && (a.on || a.keys);
      el.style.opacity = show ? 1 : 0;
      if (!show) return;
      const k = kit.k();
      el.style.width = (10 + a.pow * 50) * k + 'px';
      el.style.transform = `translate3d(${s.x * k}px, ${LINE * k}px, 0) rotate(${a.ang}rad)`;
      el.style.setProperty('--pow', a.pow);
    };

    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      put(ballRef.current, s.ball || { x: s.x, y: LINE });
      ballRef.current.classList.toggle('foe', s.turn === 'bot');
      for (const p of s.pins) if (!p.gone) put(pinRefs.current[p.id], p);
      drawAim();
      juice();
      if (s.over) {
        setOver(s.over);
        setHud({ me: total(s, 'me'), bot: total(s, 'bot'), turn: s.turn, frame: s.frames });
        if (s.over === 'lose') table.classList.add('lost');
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e) => {
      if (e.type !== 'keydown' || e.target.closest?.('input, select, textarea, .overlay') || !ready()) return;
      const a = aim.current, key = e.key.toLowerCase();
      const turn = { arrowleft: -1, a: -1, arrowright: 1, d: 1 }[key], dose = { arrowup: 1, w: 1, arrowdown: -1, s: -1 }[key], slide = { z: -1, x: 1 }[key];
      if (turn) a.ang += turn * (e.shiftKey ? 0.1 : 0.02);
      else if (dose) a.pow = Math.max(0.05, Math.min(1, a.pow + dose * 0.05));
      else if (slide) place(s, s.x + slide * 3);
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

  return html`<div class="screen mini" ref=${screenRef}>
    <${Topbar} title=${MODIFIERS.tenpin.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="ah-wrap" ref=${wrapRef}>
            <div class="ah pl tp" ref=${tableRef} role="application" aria-label=${t('tenpin.aria', 'Pista de bolos: arrastra la bola por la línea y tira hacia atrás para lanzar')}
              onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}>
              ${Array.from({ length: ROWS * COLS }, (_, i) => html`<i class=${'ah-cell ' + ((Math.floor(i / COLS) + i) % 2 ? 'b' : 'a')}></i>`)}
              ${corners}
              <i class="tp-gutter" style=${{ left: 0, width: pct(GUTTER, W) }}></i><i class="tp-gutter" style=${{ right: 0, width: pct(GUTTER, W) }}></i>
              <i class="tp-line" style=${{ top: pct(LINE + BALL_R + 2, H) }}></i>
              ${s.pins.map((p) => html`<span class="ah-pc side-light tp-pin" ref=${(el) => (pinRefs.current[p.id] = el)}>
                <span class="ah-body"><i class="ah-base"></i><span class="ah-fig" dangerouslySetInnerHTML=${{ __html: pieceSVG(p.type) }} /></span>
              </span>`)}
              <span class="tk-aim" ref=${aimRef}></span>
              <span class="ah-puck cr-striker tp-ball" ref=${ballRef}><b class="bm-tok"></b></span>
            </div>
          </div>
        </div>
        <div class="mini-side">
          ${!over && html`<div class="mini-stats" aria-live="polite">
            <span class=${'chip' + (hud.turn === 'me' ? ' on' : '')}><i class="ah-dot me"></i>${t('seat.you', 'Tú')} ${hud.me}</span>
            <span class=${'chip' + (hud.turn === 'bot' ? ' on' : '')}><i class="ah-dot foe"></i>Bot ${hud.bot}</span>
            <span class="chip">${t('tenpin.frame', 'Entrada {a} de {b}', { a: hud.frame, b: Math.max(FRAMES, hud.frame) })}</span>
          </div>`}
          ${over && html`<${MiniEnd} win=${over === 'win'} note=${over === 'win' ? t('tenpin.won', 'Derribaste más que el bot: {a} a {b}.', { a: hud.me, b: hud.bot }) : t('tenpin.lost', 'El bot derribó más: {b} a {a}.', { a: hud.me, b: hud.bot })} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
          <${MiniTools} mini="tenpin" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('tenpin.help', 'Arrastra la bola por la línea de abajo para elegir desde dónde tiras. Luego arrastra hacia atrás desde cualquier punto y suelta: sale al revés, más fuerte cuanto más tiras (con teclado, Z y X la mueven, flechas apuntan y dosifican, espacio tira). Cada entrada tienes dos tiros para derribar los diez bolos: alfiles, guardias y consejeros. Si la bola cae a la canaleta, ya no toca nada. Tras {n} entradas gana quien haya derribado más; si empatáis, se juega otra.', { n: FRAMES })}<//>
        </div>
      </div>
    </div>
  </div>`;
}
