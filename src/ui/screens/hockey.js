import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniTools } from '../components.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { W, H, COLS, ROWS, GOALS, PUCK_MAX, PLAYER_MAX, HOLD_T, DIFFS, newHockey, step, aim } from '../../game/hockey.js';

// Flechas o WASD empujan tu torre; el puntero (dedo o ratón) la lleva directa.
const KEYS = { arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0], arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1] };
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function HockeyScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newHockey(diff || settings.miniDiff?.hockey));
  const [score, setScore] = useState({ me: 0, bot: 0 });
  const [over, setOver] = useState(null);
  const tableRef = useRef(null), wrapRef = useRef(null), screenRef = useRef(null);
  const meRef = useRef(null), botRef = useRef(null), puckRef = useRef(null);
  const rect = useRef(null); // caja de la mesa: se mide al tocar y al cambiar de tamaño, nunca por fotograma
  const drag = useRef(null);
  const keys = useRef(new Set());

  const toTable = (e) => {
    const r = rect.current || (rect.current = tableRef.current.getBoundingClientRect());
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  const down = (e) => {
    if (s.over) return;
    e.preventDefault();
    rect.current = tableRef.current.getBoundingClientRect();
    tableRef.current.setPointerCapture?.(e.pointerId);
    drag.current = e.pointerId;
    aim(s, ...toTable(e));
  };
  // Con ratón la torre sigue al cursor aunque no haya botón pulsado; con el dedo, mientras arrastra.
  const move = (e) => { if (!s.over && (drag.current === e.pointerId || e.pointerType === 'mouse')) aim(s, ...toTable(e)); };
  const up = (e) => { if (drag.current === e.pointerId) drag.current = null; };

  useEffect(() => {
    const table = tableRef.current, wrap = wrapRef.current;
    const fx = new Fx(table);
    const still = reduced();
    const color = { me: css('--side-light'), bot: css('--side-dark'), brass: css('--brass'), accent: css('--accent') };
    let k = table.clientWidth / W; // px por unidad de mesa
    const ro = new ResizeObserver(() => { k = table.clientWidth / W; rect.current = null; });
    ro.observe(table);
    const place = (el, o) => { el.style.transform = `translate3d(${o.x * k}px, ${o.y * k}px, 0) translate(-50%, -50%)`; };
    const at = (e) => ({ x: e.x * k, y: e.y * k });
    const shake = (a) => settings.shake && !still && motion(wrap, { x: [0, -a, a * 0.8, -a * 0.5, a * 0.3, 0], y: [0, a * 0.4, -a * 0.6, a * 0.3, 0] }, { duration: 0.3, ease: 'easeOut' });
    const banner = (text) => {
      const b = document.createElement('div');
      b.className = 'mini-banner';
      b.textContent = text;
      table.appendChild(b);
      if (still) return setTimeout(() => b.remove(), 1200);
      motion(b, { scale: [1.4, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
      motion(b, { opacity: [1, 0] }, { duration: 0.3, delay: 0.9, onComplete: () => b.remove() });
    };
    const squash = (el, a = 0.86) => !still && motion(el.firstElementChild, { scaleX: [1, 1 / a, 1], scaleY: [1, a, 1] }, { duration: 0.22, ease: [0.16, 1, 0.3, 1] });
    let order = '', warned = false;

    const juice = () => {
      for (const e of s.events) {
        const p = e.x != null && at(e);
        if (e.kind === 'hit') {
          const f = Math.min(1, e.power / PUCK_MAX);
          playSfx(f > 0.55 ? 'hit' : 'tap', 0.75 + 0.6 * (e.speed / PUCK_MAX));
          squash(e.side === 'me' ? meRef.current : botRef.current, 1 - 0.18 * f);
          if (!still && f > 0.25) fx.burst(p.x, p.y, { count: Math.round(4 + 14 * f), color: ['#fff', color.brass], speed: [120, 140 + 300 * f], size: [1.5, 3], life: [0.12, 0.3], shape: 'spark', drag: 0.85 });
          if (f > 0.8) shake(4);
        } else if (e.kind === 'wall' && e.speed > 50) {
          playSfx('tap', 0.6 + 0.5 * (e.speed / PUCK_MAX));
          squash(puckRef.current, 0.8);
        } else if (e.kind === 'goal') {
          const mine = e.by === 'me';
          playSfx(mine ? 'coin' : 'stomp');
          if (!still) {
            fx.burst(p.x, p.y, { count: 34, color: [mine ? color.me : color.bot, color.brass, '#fff'], speed: [140, 420], size: [3, 6], life: [0.5, 1], gravity: 260, shape: 'chunk', spread: Math.PI, angle: mine ? Math.PI / 2 : -Math.PI / 2, drag: 0.94 });
            fx.ring(p.x, p.y, { radius: k * 26, color: mine ? color.brass : color.accent, width: 4, life: 0.45 });
          }
          shake(10);
          puckRef.current.classList.add('gone');
          setScore({ ...s.score });
          if (!s.over) banner(mine ? '¡Gol!' : 'Gol del bot');
        } else if (e.kind === 'serve') {
          // El disco reaparece en el saque con un brote, cuando ya se vio el gol.
          setTimeout(() => {
            const el = puckRef.current;
            if (!el) return;
            el.classList.remove('gone');
            if (!still) motion(el.firstElementChild, { scale: [0.2, 1.15, 1] }, { duration: 0.32, ease: [0.16, 1, 0.3, 1] });
            playSfx('pop');
          }, 420);
        } else if (e.kind === 'hold') {
          playSfx('invalid');
          puckRef.current.classList.add('gone');
          banner(e.side === 'me' ? 'Siete segundos: saca el bot' : 'Siete segundos: sacas tú');
        }
      }
    };

    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (keys.current.size && !s.over) {
        let dx = 0, dy = 0;
        for (const key of keys.current) { dx += KEYS[key][0]; dy += KEYS[key][1]; }
        const reach = PLAYER_MAX * 0.12;
        aim(s, s.me.x + dx * reach, s.me.y + dy * reach);
      }
      // Con la hoja de ayuda abierta la mesa espera: ni corre el reloj de los siete segundos.
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      place(meRef.current, s.me);
      place(botRef.current, s.bot);
      place(puckRef.current, s.puck);
      // Quien está más abajo tapa a quien está detrás: se reordena solo si cambia el orden.
      const o = [['me', meRef], ['bot', botRef], ['puck', puckRef]].sort((a, b) => s[a[0]].y - s[b[0]].y);
      const key = o.map((x) => x[0]).join();
      if (key !== order) { order = key; o.forEach(([, r], i) => (r.current.style.zIndex = 2 + i)); }
      // Aviso de la regla de los siete segundos: el disco parpadea los tres últimos.
      const warn = s.half === 'me' && s.hold > HOLD_T - 3 && !s.pause;
      if (warn !== warned) { warned = warn; puckRef.current.classList.toggle('warn', warn); }
      juice();
      if (s.over) {
        setOver(s.over);
        if (s.over === 'win' && !still) fx.confetti([color.me, color.accent, color.brass, css('--side-wild')]);
        if (s.over === 'lose') table.classList.add('lost');
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if (!KEYS[key] || e.target.closest?.('input, select, textarea, .overlay')) return;
      e.preventDefault();
      if (e.type === 'keydown') keys.current.add(key);
      else keys.current.delete(key);
    };
    const blur = () => keys.current.clear();
    const scrolled = () => (rect.current = null);
    addEventListener('keydown', onKey);
    addEventListener('scroll', scrolled, true);
    addEventListener('keyup', onKey);
    addEventListener('blur', blur);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      fx.destroy();
      removeEventListener('keydown', onKey);
      removeEventListener('keyup', onKey);
      removeEventListener('blur', blur);
      removeEventListener('scroll', scrolled, true);
    };
  }, []);

  // En el teléfono el cierre cae bajo la mesa: se trae a la vista.
  useEffect(() => { if (over) screenRef.current?.querySelector('.mini-end')?.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }, [over]);

  const pc = (side, ref) => html`<span class=${'ah-pc ' + (side === 'me' ? 'me side-light' : 'foe side-dark')} ref=${ref}>
    <span class="ah-body"><i class="ah-base"></i><span class="ah-fig" dangerouslySetInnerHTML=${{ __html: pieceSVG('rook') }} /></span>
  </span>`;

  return html`<div class="screen mini" ref=${screenRef}>
    <${Topbar} title="Hockey de mesa" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="ah-wrap" ref=${wrapRef}>
            <div class="ah" ref=${tableRef} role="application" aria-label="Mesa de hockey: arrastra tu torre por tu mitad"
              onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up} onLostPointerCapture=${up}>
              ${Array.from({ length: ROWS * COLS }, (_, i) => html`<i class=${'ah-cell ' + ((Math.floor(i / COLS) + i) % 2 ? 'b' : 'a')}></i>`)}
              <i class="ah-mid"></i><i class="ah-ring"></i>
              <i class="ah-crease top"></i><i class="ah-crease bottom"></i>
              <i class="ah-goal top"></i><i class="ah-goal bottom"></i>
              ${pc('bot', botRef)}
              <span class="ah-puck" ref=${puckRef}><i></i></span>
              ${pc('me', meRef)}
            </div>
          </div>
        </div>
        <div class="mini-side">
          ${!over && html`<div class="mini-stats ah-score" aria-live="polite">
            <span class="chip"><i class="ah-dot me"></i>Tú <b>${score.me}</b></span>
            <span class="chip">A ${GOALS} goles</span>
            <span class="chip"><i class="ah-dot foe"></i>Bot <b>${score.bot}</b></span>
          </div>`}
          ${over && html`<div class=${"mini-end " + (over === 'win' ? 'win' : 'lose')} role="status"><p class="mini-end-title">${over === 'win' ? '¡Victoria!' : 'Derrota'}</p><button class="btn primary" onClick=${() => onEnd(over === 'win')}>${endLabel}</button></div>`}
          <${MiniTools} mini="hockey" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Arrastra tu torre, la de abajo, con el dedo o el ratón (o muévela con las flechas) por tu mitad de la mesa y golpea el disco hacia la portería de arriba. Cuanto más rápido lo golpeas, más fuerte sale, y las bandas sirven para tiros al rebote. Gana quien meta cinco goles; tras cada gol saca quien lo encajó. No retengas el disco en tu mitad más de siete segundos o el saque pasa al rival.<//>
        </div>
      </div>
    </div>
  </div>`;
}
