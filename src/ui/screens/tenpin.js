import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { W, H, GUTTER, LINE, BALL_R, SHOT_MAX, PULL_MAX, FRAMES, DIFFS, newTenpin, place, shoot, step, total } from '../../game/tenpin.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { tableKit, slingshot, corners } from '../table-kit.js';

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
  const [sl] = useState(() => slingshot({
    table: () => tableRef.current, w: W, h: H, pullMax: PULL_MAX, origin: () => ({ x: s.x, y: LINE }),
    ready: () => !s.over && s.phase === 'aim' && s.turn === 'me',
    shoot: (ang, pow) => shoot(s, ang, pow),
    near: ([x, y]) => Math.hypot(x - s.x, y - LINE) < BALL_R * 2.5,
    slide: ([x]) => place(s, x),
    nudge: (d) => place(s, s.x + d * 3),
  }));

  useEffect(() => {
    const table = tableRef.current, fx = new Fx(table);
    const kit = tableKit(table, wrapRef.current, settings, W, sl.reset);
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

    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      put(ballRef.current, s.ball || { x: s.x, y: LINE });
      ballRef.current.classList.toggle('foe', s.turn === 'bot');
      for (const p of s.pins) if (!p.gone) put(pinRefs.current[p.id], p);
      sl.draw(aimRef.current, kit.k());
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

    addEventListener('keydown', sl.key);
    addEventListener('scroll', sl.reset, true);
    return () => {
      cancelAnimationFrame(raf);
      kit.destroy();
      fx.destroy();
      removeEventListener('keydown', sl.key);
      removeEventListener('scroll', sl.reset, true);
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
              onPointerDown=${sl.down} onPointerMove=${sl.move} onPointerUp=${sl.up} onPointerCancel=${sl.up}>
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
