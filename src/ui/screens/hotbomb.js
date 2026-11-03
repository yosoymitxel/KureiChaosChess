import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { playSfx } from '../sfx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { W, H, BLAST, DIFFS, newHotbomb, hurl, step, holder, alive } from '../../game/hotbomb.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { tableKit, toTable as tableAt, corners } from '../table-kit.js';


export function HotbombScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newHotbomb(diff || settings.miniDiff?.hotbomb));
  const [hud, setHud] = useState({ me: 0, bot: 0, mine: true, fuse: 0 });
  const [over, setOver] = useState(null);
  const tableRef = useRef(null), wrapRef = useRef(null), screenRef = useRef(null), bombRef = useRef(null), aimRef = useRef(null), pcRefs = useRef({});
  const aim = useRef({ on: false, x: 0, y: 0 });
  const rect = useRef(null);

  const toTable = (e) => tableAt(e, tableRef.current, rect, W, H);
  const ready = () => !s.over && s.phase === 'hold' && holder(s)?.side === 'me';
  const down = (e) => {
    if (!ready()) return;
    e.preventDefault();
    rect.current = null;
    tableRef.current.setPointerCapture?.(e.pointerId);
    const [x, y] = toTable(e);
    Object.assign(aim.current, { on: true, x, y });
  };
  const move = (e) => { if (aim.current.on) { const [x, y] = toTable(e); Object.assign(aim.current, { x, y }); } };
  const up = (e) => {
    const a = aim.current;
    if (!a.on) return;
    a.on = false;
    const [x, y] = toTable(e);
    hurl(s, x, y, 'me');
  };

  useEffect(() => {
    const table = tableRef.current, fx = new Fx(table);
    const kit = tableKit(table, wrapRef.current, settings, W, () => (rect.current = null));
    const { still, place: put, at, shake, banner } = kit;
    let raf = 0, last = performance.now(), shown = '';

    const juice = () => {
      for (const e of s.events) {
        const p = e.x != null && at(e);
        if (e.kind === 'hurl') playSfx('whoosh');
        else if (e.kind === 'catch') { playSfx('tap', 0.8); const el = pcRefs.current[e.id]; if (el && !still) motion(el.firstElementChild, { scaleY: [1, 0.82, 1], scaleX: [1, 1.12, 1] }, { duration: 0.22 }); }
        else if (e.kind === 'land') playSfx('land', 0.7);
        else if (e.kind === 'arm') banner(e.side === 'me' ? t('hotbomb.yours', '¡La bomba es tuya!') : t('hotbomb.theirs', 'La bomba, para el bot'));
        else if (e.kind === 'boom') {
          fx.explosion(p.x, p.y, 1.2);
          if (!still) fx.ring(p.x, p.y, { radius: kit.k() * BLAST, color: '#ffcf6b', width: 4, life: 0.4 });
          shake(8);
          for (const id of e.dead) gone(id);
        }
      }
    };
    const gone = (id) => {
      const el = pcRefs.current[id];
      if (!el) return;
      if (still) el.classList.add('gone');
      else motion(el.firstElementChild, { scale: [1, 0.2], opacity: [1, 0] }, { duration: 0.3, onComplete: () => el.classList.add('gone') });
    };

    // El vuelo: la bomba avanza por la mesa, sube en arco y gira dos vueltas; su sombra va por el suelo.
    const drawBomb = () => {
      const el = bombRef.current, k = kit.k(), b = s.bomb;
      put(el, b);
      const ball = el.querySelector('.hb-ball'), f = s.phase === 'fly' && s.fly;
      const lift = f ? Math.sin(Math.PI * f.t) * Math.hypot(f.to.x - f.from.x, f.to.y - f.from.y) * 0.35 * k : s.phase === 'hold' ? 10 * k : 0;
      ball.style.transform = `translateY(${-lift}px) rotate(${f ? f.t * 720 : 0}deg)`;
      ball.classList.toggle('soon', s.fuse < 2.5 && s.phase !== 'wait');
      ball.textContent = s.diff.show ? Math.max(0, Math.ceil(s.fuse)) : '';
      el.classList.toggle('off', s.phase === 'wait');
    };
    const drawAim = () => {
      const el = aimRef.current, a = aim.current, h = holder(s), show = ready() && a.on && h;
      el.style.opacity = show ? 1 : 0;
      if (!show) return;
      const k = kit.k(), dx = a.x - h.x, dy = a.y - h.y;
      el.style.width = Math.hypot(dx, dy) * k + 'px';
      el.style.transform = `translate3d(${h.x * k}px, ${h.y * k}px, 0) rotate(${Math.atan2(dy, dx)}rad)`;
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!screenRef.current?.querySelector('.overlay')) step(s, dt);
      for (const p of s.pcs) { const el = pcRefs.current[p.id]; put(el, p); el?.classList.toggle('hold', s.holder === p.id); }
      drawBomb();
      drawAim();
      juice();
      const h = holder(s), next = [alive(s, 'me').length, alive(s, 'bot').length, h ? h.side === 'me' : s.last !== 'me', Math.ceil(s.fuse)].join();
      if (next !== shown) { shown = next; setHud({ me: alive(s, 'me').length, bot: alive(s, 'bot').length, mine: h?.side === 'me', fuse: Math.max(0, Math.ceil(s.fuse)) }); }
      if (s.over) {
        setOver(s.over);
        if (s.over === 'lose') table.classList.add('lost');
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const scrolled = () => (rect.current = null);
    addEventListener('scroll', scrolled, true);
    return () => { cancelAnimationFrame(raf); kit.destroy(); fx.destroy(); removeEventListener('scroll', scrolled, true); };
  }, []);

  useEffect(() => { if (over) screenRef.current?.querySelector('.mini-end')?.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }, [over]);

  return html`<div class="screen mini" ref=${screenRef}>
    <${Topbar} title=${MODIFIERS.hotbomb.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="ah-wrap" ref=${wrapRef}>
            <div class="cr hb" ref=${tableRef} role="application" aria-label=${t('hotbomb.aria', 'Corro de piezas: toca a qué pieza lanzar la bomba')}
              onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${() => (aim.current.on = false)}>
              ${corners}
              ${s.pcs.map((p) => html`<span class=${'ah-pc ' + (p.side === 'me' ? 'me side-light' : 'foe side-dark')} ref=${(el) => (pcRefs.current[p.id] = el)}>
                <span class="ah-body"><i class="ah-base"></i><span class="ah-fig" dangerouslySetInnerHTML=${{ __html: pieceSVG(p.type) }} /></span>
              </span>`)}
              <span class="tk-aim" ref=${aimRef}></span>
              <span class="hb-bomb" ref=${bombRef}><i class="hb-shadow"></i><span class="hb-ball bm-bomb"></span></span>
            </div>
          </div>
        </div>
        <div class="mini-side">
          ${!over && html`<div class="mini-stats" aria-live="polite">
            <span class=${'chip' + (hud.mine ? ' on' : '')}><i class="ah-dot me"></i>${t('seat.you', 'Tú')} ${hud.me}</span>
            <span class=${'chip' + (!hud.mine ? ' on' : '')}><i class="ah-dot foe"></i>Bot ${hud.bot}</span>
            <span class=${'chip' + (hud.fuse <= 2 ? ' warn' : '')}><${Icon} name="bomb" size=${14} />${s.diff.show ? hud.fuse + ' s' : '?'}</span>
          </div>`}
          ${over && html`<${MiniEnd} win=${over === 'win'} note=${over === 'win' ? t('hotbomb.won', 'El bot se quedó sin piezas.') : t('hotbomb.lost', 'Te quedaste sin piezas.')} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
          <${MiniTools} mini="hotbomb" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('hotbomb.help', 'Las piezas forman un corro y una tiene la bomba encendida. Cuando es tuya, toca o arrastra hasta la pieza a la que quieras lanzarla y suelta: sale girando y la atrapa la más cercana a donde cae, así que cuidado con las tuyas de al lado. Al acabarse la mecha estalla y se lleva a quien la tiene; el corro se cierra y la bomba pasa al otro bando. Gana quien deje al otro sin piezas. En difícil no se ve cuánto le queda.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
