import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { R, ARCS, ARC_R, PULL_MAX, PER_SIDE, TABLES, newCarrom, place, shoot, step } from '../../game/carrom.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { award } from '../../game/achievements.js';
import { tableKit, slingshot, corners } from '../table-kit.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const ROWS = 10, COLS = 6;
// Arco de saque de cada bando, en el SVG de la mesa (mismas unidades).
const arcPath = (side) => {
  const [a0, a1] = ARCS[side].map((a) => (a * Math.PI) / 180), p = (a) => `${R + Math.cos(a) * ARC_R} ${R + Math.sin(a) * ARC_R}`;
  return `M${p(a0)}A${ARC_R} ${ARC_R} 0 0 1 ${p(a1)}`;
};

// Billar redondo: el lanzador se arrastra por tu arco; arrastrar en cualquier otro punto es el tirachinas.
export const CarromScreen = (props) => CueScreen({ ...props, mini: 'carrom' });
// Billar de troneras: la blanca se queda donde para; arrastrar en cualquier punto es el tirachinas.
export const PoolScreen = (props) => CueScreen({ ...props, mini: 'pool' });

function CueScreen({ mini, sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const round = mini === 'carrom', T = TABLES[round ? 'round' : 'rect'], { W, H } = T;
  const [s] = useState(() => newCarrom(diff || settings.miniDiff?.[mini], Math.random, { table: round ? 'round' : 'rect' }));
  const [hud, setHud] = useState({ me: 0, bot: 0, turn: 'me' });
  const [over, setOver] = useState(null);
  const tableRef = useRef(null), wrapRef = useRef(null), screenRef = useRef(null), strikerRef = useRef(null), aimRef = useRef(null);
  const discRefs = useRef({});
  const [sl] = useState(() => slingshot({
    table: () => tableRef.current, w: W, h: H, pullMax: PULL_MAX, origin: () => s.striker,
    ready: () => !s.over && s.phase === 'aim' && s.turn === 'me',
    shoot: (ang, pow) => shoot(s, ang, pow),
    near: round ? ([x, y]) => Math.hypot(x - s.striker.x, y - s.striker.y) < T.cueR * 2.4 : null,
    slide: ([x, y]) => {
      const [a0, a1] = ARCS.me;
      let a = (Math.atan2(y - R, x - R) * 180) / Math.PI;
      if (a < -90) a += 360;
      place(s, Math.max(0, Math.min(1, (a - a0) / (a1 - a0))));
    },
    nudge: round ? (d) => place(s, Math.max(0, Math.min(1, s.u + d * 0.05))) : null,
  }));

  useEffect(() => {
    const table = tableRef.current, fx = new Fx(table);
    const kit = tableKit(table, wrapRef.current, settings, W, sl.reset);
    const { still, place: put, at, shake, squash, banner } = kit;
    const color = { me: css('--side-light'), bot: css('--side-dark'), brass: css('--brass'), accent: css('--accent'), paper: css('--paper') };
    const pop = (el, keys) => el && !still && motion(el.firstElementChild, keys, { duration: 0.3 });
    let run = 0; // fichas propias metidas en este turno (logro)

    const juice = () => {
      for (const e of s.events) {
        const p = e.x != null && at(e);
        if (e.kind === 'shot') { playSfx('tap', 0.7 + 0.5 * e.power); squash(strikerRef.current, 1 - 0.25 * e.power); }
        else if (e.kind === 'hit' || e.kind === 'clack') {
          const f = Math.min(1, e.power / T.shotMax);
          playSfx(e.kind === 'hit' && f > 0.35 ? 'hit' : 'tap', 0.9 + 0.6 * f);
          if (!still && f > 0.2) fx.burst(p.x, p.y, { count: Math.round(3 + 10 * f), color: ['#fff', color.brass], speed: [60, 100 + 220 * f], size: [1.5, 2.5], life: [0.1, 0.25], shape: 'spark', drag: 0.85 });
          if (f > 0.75) shake(3);
        } else if (e.kind === 'rim' && e.power > 60) playSfx('tap', 0.55);
        else if (e.kind === 'pocket') {
          const el = discRefs.current[e.id], mine = e.owner === 'me';
          playSfx(mine ? 'coin' : 'pop');
          if (el && !still) motion(el.firstElementChild, { scale: [1, 0.2], opacity: [1, 0] }, { duration: 0.25 });
          else el?.classList.add('gone');
          if (!still) fx.ring(p.x, p.y, { radius: kit.k() * 12, color: e.side === 'queen' ? color.accent : mine ? color.me : color.bot, width: 3, life: 0.35 });
          if (e.side === 'queen') banner(mine ? t('carrom.queenYou', '¡La dama es tuya!') : t('carrom.queenBot', 'La dama, para el bot'));
          if (round && mine && s.turn === 'me' && ++run >= PER_SIDE) award('carrom_clear');
        } else if (e.kind === 'foul') {
          playSfx('invalid');
          banner(round ? t('carrom.foul', 'Falta: el lanzador cayó') : t('pool.foul', 'Falta: la blanca cayó'));
          pop(strikerRef.current, { scale: [1, 0.2] });
        } else if (e.kind === 'cue') pop(strikerRef.current, { scale: [0.2, 1.1, 1] });
        else if (e.kind === 'back') {
          const el = discRefs.current[e.id];
          if (el) { el.classList.remove('gone'); el.firstElementChild.style.opacity = ''; pop(el, { scale: [0.2, 1.1, 1], opacity: [0, 1] }); }
        } else if (e.kind === 'again') banner(e.side === 'me' ? t('carrom.again', 'Repites') : t('carrom.botAgain', 'Repite el bot'));
        else if (e.kind === 'turn') {
          if (e.side === 'me') run = 0;
          pop(strikerRef.current, { scale: [0.3, 1.1, 1], opacity: [0, 1] });
        }
      }
      if (s.events.some((e) => /pocket|turn|back/.test(e.kind))) setHud({ me: s.got.me, bot: s.got.bot, turn: s.turn });
    };

    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      put(strikerRef.current, s.striker);
      strikerRef.current.classList.toggle('foe', s.turn === 'bot');
      for (const d of s.discs) if (!d.in) put(discRefs.current[d.id], d);
      sl.draw(aimRef.current, kit.k());
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

  const pct = (v, of) => (v / of) * 100 + '%';
  const dots = (n) => html`<span class="dots">${Array.from({ length: PER_SIDE }, (_, i) => html`<i class=${i < n ? '' : 'off'}></i>`)}</span>`;
  const felt = round
    ? html`<svg class="cr-lines" viewBox=${`0 0 ${W} ${H}`} aria-hidden="true"><circle cx=${R} cy=${R} r=${R * 0.3} /><path class="me" d=${arcPath('me')} /><path class="bot" d=${arcPath('bot')} /></svg>`
    : Array.from({ length: ROWS * COLS }, (_, i) => html`<i class=${'ah-cell ' + ((Math.floor(i / COLS) + i) % 2 ? 'b' : 'a')}></i>`);
  const won = round ? t('carrom.won', 'Metiste tus {n} fichas antes que el bot.', { n: PER_SIDE }) : t('pool.won', 'Metiste tus {n} bolas antes que el bot.', { n: PER_SIDE });
  const lost = round ? t('carrom.lost', 'El bot metió sus fichas antes: {a} a {b}.', { a: hud.me, b: hud.bot }) : t('pool.lost', 'El bot metió sus bolas antes: {a} a {b}.', { a: hud.me, b: hud.bot });
  return html`<div class="screen mini" ref=${screenRef}>
    <${Topbar} title=${MODIFIERS[mini].name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="ah-wrap" ref=${wrapRef}>
            <div class=${round ? 'cr' : 'ah pl'} ref=${tableRef} role="application"
              aria-label=${round ? t('carrom.aria', 'Mesa redonda: mueve el lanzador por tu arco y tira hacia atrás para golpear') : t('pool.aria', 'Mesa de billar: tira hacia atrás y suelta para golpear la blanca')}
              onPointerDown=${sl.down} onPointerMove=${sl.move} onPointerUp=${sl.up} onPointerCancel=${sl.up}>
              ${felt}
              ${corners}
              ${T.pockets.map((p) => html`<i class="cr-pocket" style=${`left:${pct(p.x, W)};top:${pct(p.y, H)}`}></i>`)}
              ${s.discs.map((d) => html`<span class=${'ah-puck cr-disc ' + d.side} ref=${(el) => (discRefs.current[d.id] = el)}><b class="bm-tok"></b></span>`)}
              <span class="tk-aim" ref=${aimRef}></span>
              <span class="ah-puck cr-striker" ref=${strikerRef}><b class="bm-tok"></b></span>
            </div>
          </div>
        </div>
        <div class="mini-side">
          ${!over && html`<div class="mini-stats" aria-live="polite">
            <span class=${'chip' + (hud.turn === 'me' ? ' on' : '')}><i class="ah-dot me"></i>${t('seat.you', 'Tú')} ${dots(hud.me)}</span>
            <span class=${'chip' + (hud.turn === 'bot' ? ' on' : '')}><i class="ah-dot foe"></i>Bot ${dots(hud.bot)}</span>
          </div>`}
          ${over && html`<${MiniEnd} win=${over === 'win'} note=${over === 'win' ? won : lost} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
          ${round
            ? html`<${MiniTools} mini="carrom" diffs=${T.diffs} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('carrom.help', 'Arrastra el lanzador (el disco de latón) por tu arco, el de abajo, para elegir desde dónde tiras. Luego arrastra hacia atrás desde cualquier punto y suelta: sale al revés, más fuerte cuanto más tiras (con teclado, Z y X lo mueven, flechas apuntan y dosifican, espacio tira). Mete tus cuatro fichas claras en los agujeros antes que el bot las suyas. La dama roja cuenta como una tuya si la metes tú. Si metes una ficha tuya, repites; si el lanzador cae, es falta y una de tus fichas vuelve al centro.')}<//>`
            : html`<${MiniTools} mini="pool" diffs=${T.diffs} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('pool.help', 'Arrastra hacia atrás desde cualquier punto y suelta: la blanca sale al revés, más fuerte cuanto más tiras (con teclado, flechas apuntan y dosifican, espacio tira). Mete tus cuatro bolas claras por las troneras antes que el bot las suyas. La blanca se queda donde para. Si metes una tuya, repites; si cae la blanca, es falta: vuelve a su sitio y una de tus bolas vuelve a la mesa.')}<//>`}
        </div>
      </div>
    </div>
  </div>`;
}
