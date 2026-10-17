import { html, useState, useEffect, useLayoutEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, popPiece, reduced } from '../hop.js';
import { Fx } from '../../view/fx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { ROWS, COLS, DIFFS, newBowling, launch, tick } from '../../game/bowling.js';

const TICK_MS = 280;
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function BowlingScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBowling(diff || settings.miniDiff));
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const fxRef = useRef(null);
  const before = useRef(null); // posiciones del tick anterior
  const ended = useRef(null); // resultado ya celebrado

  // El juego muta cada pieza en su sitio, así que el objeto mismo sirve de identidad en la instantánea.
  const snap = () => new Map([...s.enemies, ...s.balls].map((o) => [o, { r: o.r, c: o.c, hp: o.hp, dr: o.dr }]));

  const shoot = (row) => {
    const was = snap();
    if (!launch(s, row)) return false;
    before.current = was;
    redraw((n) => n + 1);
    return true;
  };

  // Elegir dificultad arranca tablero nuevo: lo que se juega es siempre lo que se ve marcado.
  const pick = (id) => {
    if (id === settings.miniDiff) return;
    setSettings((t) => ({ ...t, miniDiff: id }));
    onRestart();
  };

  useEffect(() => {
    fxRef.current = new Fx(gridRef.current);
    return () => fxRef.current.destroy();
  }, []);

  useEffect(() => {
    const id = setInterval(() => { before.current = snap(); tick(s); redraw((n) => n + 1); if (s.over) clearInterval(id); }, TICK_MS);
    const onKey = (e) => { const n = +e.key; if (n >= 1 && n <= ROWS) shoot(n - 1); };
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
    const at = (r, c) => cells[r * COLS + Math.max(0, Math.min(COLS - 1, c))];
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
      const g = ghost(r, Math.max(0, c), 'bm-ghost side-dark');
      g.innerHTML = pieceSVG(type);
      const p = center(r, c);
      fx.burst(p.x, p.y, { count: 22, color: [css('--side-dark'), '#fff', '#ffcf6b'], speed: [70, 260], size: [2, 5], gravity: 320, shape: 'chunk' });
      shake();
      motion(g, { rotate: dir * 95, x: dir * cw * 0.5, opacity: [1, 1, 0] }, { duration: 0.55, ease: 'easeIn', onComplete: () => g.remove() });
    };

    for (const e of s.enemies) {
      const p = was.get(e);
      if (!p) { popPiece(grid, pcOf(e.r, e.c)); continue; } // entra: brota
      if (e.c < 0) { topple(e.r, e.c, e.type, -1); continue; } // cruzó tu borde: cae hacia afuera
      if (p.r !== e.r || p.c !== e.c) hopPiece(grid, pcOf(e.r, e.c), { from: { row: p.r, col: p.c }, to: { row: e.r, col: e.c }, side: 'dark', cols: COLS, rows: ROWS });
      if (p.hp !== e.hp) {
        const c = center(e.r, e.c);
        fx.burst(c.x, c.y, { count: 12, color: ['#fff', css('--side-dark')], speed: [60, 220], size: [2, 4], life: [0.25, 0.5] });
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
    const ball = s.balls.some((b) => b.r === r && b.c === c);
    return { cls: c === 0 ? 'lane' + (s.reload ? '' : ' drop') : '', tok: ball, piece: e && { type: e.type, side: 'dark' }, hp: e && e.maxHp > 1 ? { on: e.hp, max: e.maxHp } : null };
  };
  const status = `Derribadas ${s.down}/${s.diff.goal}. Toca un carril o pulsa su número para lanzar una ficha.`;

  return html`<div class="screen mini">
    <${Topbar} title="Bolos de nuez" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Las piezas carmesí cruzan de derecha a izquierda por cinco carriles. Lanza fichas desde la izquierda (toque o teclas 1-5): la ficha rebota en diagonal al chocar y sigue. Los peones caen al primer toque; caballo y alfil aguantan dos; la torre, tres. No dejes que ninguna llegue a tu borde.</p></details>
      <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${!!s.over} label="Bolera" gridRef=${gridRef} boardClass="bm-slab bw"
        onTap=${(r) => shoot(r)} />
      ${diff
        ? html`<p class="mini-tier">Nivel del piso: <b>${DIFFS[diff].name}</b>.</p>`
        : html`<div class="segmented sm" role="group" aria-label="Dificultad">
            ${Object.entries(DIFFS).map(([id, d]) => html`<button class=${id === settings.miniDiff ? 'on' : ''} aria-pressed=${id === settings.miniDiff} onClick=${() => pick(id)}>${d.name}</button>`)}
          </div>`}
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Derribaste las ${s.diff.goal} piezas que hacían falta.` : 'Una pieza llegó a tu borde.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
