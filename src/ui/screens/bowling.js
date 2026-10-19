import { html, useState, useEffect, useLayoutEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniDiff } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, popPiece, reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { LAUNCH_COLS, DIFFS, newBowling, launch, tick } from '../../game/bowling.js';

const TICK_MS = 280;
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function BowlingScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBowling(diff || settings.miniDiff?.bowling));
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const fxRef = useRef(null);
  const before = useRef(null); // posiciones del tick anterior
  const ended = useRef(null); // resultado ya celebrado

  // El juego muta cada pieza en su sitio, así que el objeto mismo sirve de identidad en la instantánea.
  const snap = () => new Map([...s.enemies, ...s.balls].map((o) => [o, { r: o.r, c: o.c, hp: o.hp, dr: o.dr }]));

  // Se lanza desde la casilla tocada si está en la zona; fuera de ella, desde el borde de ese carril.
  const shoot = (row, col = 0) => {
    const was = snap();
    if (!launch(s, row, col < LAUNCH_COLS ? col : 0)) return false;
    before.current = was;
    redraw((n) => n + 1);
    return true;
  };

  useEffect(() => {
    fxRef.current = new Fx(gridRef.current);
    return () => fxRef.current.destroy();
  }, []);

  useEffect(() => {
    const id = setInterval(() => { before.current = snap(); tick(s); redraw((n) => n + 1); if (s.over) clearInterval(id); }, TICK_MS);
    const onKey = (e) => { const n = +e.key; if (n >= 1 && n <= s.rows) shoot(n - 1); };
    addEventListener('keydown', onKey);
    return () => { clearInterval(id); removeEventListener('keydown', onKey); };
  }, []);

  // Cada tick ya jugado se cuenta con el vocabulario del tablero: salto con charco al avanzar, brote al
  // entrar, chispas al aguantar un toque y caída al derribo, que es de lo que va el minijuego.
  // useLayoutEffect: la rodadura arranca antes del pintado; con useEffect la ficha se pintaba un
  // fotograma en la casilla nueva y saltaba atrás, y a un paso por tick eso se veía como temblor.
  useLayoutEffect(() => {
    const was = before.current;
    if (!was) return;
    before.current = null;
    const grid = gridRef.current, fx = fxRef.current;
    if (!grid || !fx) return;
    const still = reduced();

    // Fin de partida: confeti al ganar; al perder la mesa pierde el color, como el tablero.
    if (s.over && ended.current !== s.over) {
      ended.current = s.over;
      if (s.over === 'lose') grid.classList.add('lost');
      else if (!still) fx.confetti([css('--side-light'), css('--accent'), '#ffcf6b', css('--side-wild')]);
    }
    if (still) return;

    const cells = grid.children; // los botones van primero; las capas goo y fx se añaden al final
    const cw = cells[0].offsetWidth, ch = cells[0].offsetHeight;
    const at = (r, c) => cells[r * s.cols + Math.max(0, Math.min(s.cols - 1, c))];
    const pcOf = (r, c) => at(r, c)?.querySelector('.bm-pc');
    const tokOf = (r, c) => at(r, c)?.querySelector('.bm-tok');
    const center = (r, c) => fx.pointOf(at(r, c));
    const shake = (a = 6) => settings.shake && motion(grid, { x: [0, -a, a * 0.8, -a * 0.5, a * 0.3, 0], y: [0, a * 0.4, -a * 0.6, a * 0.3, 0] }, { duration: 0.36, ease: 'easeOut' });
    // Copia de lo que el estado ya quitó: se anima donde estaba, igual que hace el tablero al capturar.
    const ghost = (r, c, cls = 'bm-ghost') => {
      const g = document.createElement('span');
      g.className = cls;
      g.style.cssText = `left:${c * cw}px;top:${r * ch}px;width:${cw}px;height:${ch}px`;
      grid.appendChild(g);
      return g;
    };
    const topple = (r, c, type, dir) => {
      const g = ghost(r, Math.max(0, c), 'bm-ghost side-zombie');
      g.innerHTML = pieceSVG(type);
      const p = center(r, c);
      fx.debris(p.x, p.y, css('--side-zombie'));
      shake();
      motion(g, { rotate: dir * 95, x: dir * cw * 0.5, opacity: [1, 1, 0] }, { duration: 0.55, ease: 'easeIn', onComplete: () => g.remove() });
    };

    for (const e of s.enemies) {
      const p = was.get(e);
      if (!p) { popPiece(grid, pcOf(e.r, e.c)); continue; } // entra: brota
      if (e.c < 0) { topple(e.r, e.c, e.type, -1); continue; } // cruzó tu borde: cae hacia afuera
      if (p.r !== e.r || p.c !== e.c) hopPiece(grid, pcOf(e.r, e.c), { from: { row: p.r, col: p.c }, to: { row: e.r, col: e.c }, side: 'zombie', cols: s.cols, rows: s.rows });
      if (p.hp !== e.hp) {
        const c = center(e.r, e.c);
        fx.burst(c.x, c.y, { count: 10, color: ['#fff', '#ffe2a8'], speed: [200, 400], size: [1.5, 3], life: [0.15, 0.3], shape: 'spark', drag: 0.85 });
        const el = pcOf(e.r, e.c);
        if (el && p.c === e.c) { // si saltó, el golpe de aterrizaje ya la aplasta
          el.classList.add('hit');
          setTimeout(() => el.classList.remove('hit'), TICK_MS);
          motion(el, { scaleY: [0.75, 1.08, 1], scaleX: [1.15, 0.96, 1] }, { duration: 0.38, ease: [0.16, 1, 0.3, 1] });
        }
      }
    }
    for (const b of s.balls) {
      const p = was.get(b);
      if (!p) { // recién lanzada: brota en su carril
        popPiece(grid, tokOf(b.r, b.c));
        const c = center(b.r, b.c);
        fx.ring(c.x, c.y, { radius: cw * 0.7, color: css('--brass'), width: 3, life: 0.3 });
        continue;
      }
      if (p.dr !== b.dr) { const c = center(b.r, b.c); fx.dust(c.x, c.y, 0.5); } // rebote contra una pieza o la banda
      // Rueda en línea recta: el gesto dura un tick exacto, así que cubre una casilla por paso.
      const el = tokOf(b.r, b.c);
      if (el) motion(el, { x: [(p.c - b.c) * cw, 0], y: [(p.r - b.r) * ch, 0] }, { duration: TICK_MS / 1000, ease: 'linear' });
    }
    // Lo que el tick contó aparte: cadenas de rebotes, explosiones y el salto del caballo.
    for (const ev of s.events) {
      if (ev.kind === 'chain') {
        const g = ghost(ev.r, ev.c, 'bw-chain');
        g.textContent = '×' + ev.n;
        motion(g, { y: [0, -ch * 0.9], opacity: [1, 1, 0] }, { duration: 0.8, ease: 'easeOut', onComplete: () => g.remove() });
      } else if (ev.kind === 'boom') {
        const c = center(ev.r, ev.c);
        fx.explosion(c.x, c.y, Math.max(1, cw / 40));
        shake(10);
      } else if (ev.kind === 'horde') {
        // El banderín del original: aviso grande sobre la bolera antes de la última oleada.
        const b = document.createElement('div');
        b.className = 'bw-horde';
        b.textContent = '¡Llega una gran horda!';
        grid.appendChild(b);
        motion(b, { scale: [1.4, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
        motion(b, { opacity: [1, 0] }, { duration: 0.4, delay: 1.6, onComplete: () => b.remove() });
        shake(8);
      } else if (ev.kind === 'vault') {
        const el = pcOf(ev.e.r, ev.e.c);
        if (el) motion(el, { x: [cw, 0], y: [0, -ch * 0.8, 0] }, { duration: 0.32, ease: 'easeOut' });
      }
    }
    for (const [o, p] of was) {
      if (s.enemies.includes(o) || s.balls.includes(o)) continue;
      if (o.type) topple(p.r, p.c, o.type, 1); // derribada: cae hacia donde empuja la ficha
      else { // la ficha sale por la derecha rodando
        const g = ghost(p.r, p.c);
        g.innerHTML = '<i class="bm-tok"></i>';
        motion(g, { x: cw, opacity: [1, 0] }, { duration: 0.24, ease: 'linear', onComplete: () => g.remove() });
      }
    }
  });

  const cell = (r, c) => {
    const e = s.enemies.find((x) => x.r === r && x.c === c);
    const ball = s.balls.find((b) => b.r === r && b.c === c);
    const zone = c < LAUNCH_COLS ? 'lane' + (c === 0 ? ' lane0' : '') + (c === LAUNCH_COLS - 1 ? ' line' : '') + (s.belt.length ? ' drop' : '') : '';
    return { cls: zone + (ball?.kind === 'boom' ? ' boom' : ''), tok: !!ball, piece: e && { type: e.type, side: 'zombie' }, hp: e && e.maxHp > 1 ? { on: e.hp, max: e.maxHp } : null };
  };
  const next = s.belt[0];

  return html`<div class="screen mini">
    <${Topbar} title="Bolos de nuez" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniGrid} rows=${s.rows} cols=${s.cols} cell=${cell} disabled=${!!s.over} label="Bolera" gridRef=${gridRef} boardClass="bm-slab bw"
          onTap=${(r, c) => shoot(r, c)} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="bw-wave" aria-label=${s.horde == null ? `Oleada: ${Math.min(s.spawned, s.diff.goal)} de ${s.diff.goal} antes de la horda` : 'Gran horda en camino'}>
              <span class="bw-wave-bar"><i style=${{ width: (s.horde == null ? (s.spawned / s.diff.goal) * 70 : 70 + (1 - s.horde / s.diff.horde) * 30) + '%' }} /></span>
              <span class="bw-flag" aria-hidden="true">${s.horde == null ? 'Horda' : '¡Horda!'}</span>
            </span>
            <span class="chip">${s.down} derribadas</span>
            ${s.best > 1 && html`<span class="chip">Mejor cadena <b>×${s.best}</b></span>`}
          </div>
          <div class="bw-belt" role="status" aria-label=${s.belt.length ? `En la cinta: ${s.belt.map((k) => (k === 'boom' ? 'explosiva' : 'ficha')).join(', ')}` : 'La cinta está vacía'}>
            <span class="bw-belt-label">${next ? (next === 'boom' ? 'Sigue: explosiva' : 'Sigue: ficha') : 'Cinta vacía'}</span>
            <span class="bw-belt-row">${Array.from({ length: 4 }, (_, i) => html`<i class=${'bw-slot' + (s.belt[i] ? ' on ' + s.belt[i] : '') + (i === 0 ? ' first' : '')} />`)}</span>
          </div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Aguantaste la gran horda: ${s.down} piezas derribadas${s.best > 1 ? `, con una cadena de ×${s.best}` : ''}.` : 'Una pieza llegó a tu borde.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniDiff} mini="bowling" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart} />
          <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Las piezas carmesí cruzan de derecha a izquierda. La cinta te trae fichas: toca una casilla antes de la línea roja (o pulsa el número del carril) para lanzar la primera. Al chocar, la ficha rebota en diagonal y puede encadenar golpes. La explosiva, en bermellón, limpia un 3×3. El peón cae al primer golpe; el caballo aguanta 2 y salta la primera ficha, el alfil aguanta 2, la torre 3 y la reina 4, y se apura al recibir el primero.</p></details>
        </div>
      </div>
    </div>
  </div>`;
}
