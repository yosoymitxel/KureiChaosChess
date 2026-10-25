import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece } from '../hop.js';
import { playSfx } from '../sfx.js';
import { SIZE, DIFFS, newContraband, legal, move } from '../../game/dimensional-contraband.js';
import { portalAt } from '../../game/rules.js';

export function ContrabandScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newContraband(diff || settings.miniDiff?.contraband));
  const [, redraw] = useState(0);
  const targets = legal(s);
  const gridRef = useRef(null);
  const events = useRef(null);
  const tap = (r, c) => {
    if (s.over || !targets.some((m) => m.row === r && m.col === c)) return;
    if (move(s, r, c)) { events.current = s.events; redraw((n) => n + 1); }
  };
  // Un solo salto se anima como siempre; cruzar un portal encoge la ficha en la entrada, la
  // devuelve a crecer en el gemelo y marca la casilla de salida con un destello.
  useEffect(() => {
    const ev = events.current;
    events.current = null;
    const grid = gridRef.current;
    if (!grid || !ev?.length) return;
    const p = s.pieces[0];
    const el = grid.children[p.row * SIZE + p.col]?.querySelector('.bm-pc');
    const cellEl = grid.querySelector('.bm-cell');
    if (!el || !cellEl) return;
    const from = ev[0].from;
    if (ev.length === 1) { hopPiece(grid, el, { from, to: { row: p.row, col: p.col }, side: p.color, cols: SIZE, rows: SIZE }); return; }
    const cw = cellEl.offsetWidth, ch = cellEl.offsetHeight;
    const door = ev[0].to;
    const dx = (from.col - p.col) * cw, dy = (from.row - p.row) * ch;
    const ex = (door.col - p.col) * cw, ey = (door.row - p.row) * ch;
    playSfx('warp');
    motion(el, { x: [dx, dx / 2, ex, ex, 0], y: [dy, dy / 2, ey, ey, 0], scale: [1, 1.08, 0.32, 0.32, 1] }, { duration: 0.62, ease: 'easeInOut' });
    const dest = grid.children[p.row * SIZE + p.col];
    dest?.classList.add('portal-flash');
    setTimeout(() => dest?.classList.remove('portal-flash'), 720);
  });
  const cell = (r, c) => {
    const p = s.pieces[0];
    const valid = targets.some((m) => m.row === r && m.col === c);
    return { cls: [valid && 'mv', s.exit.row === r && s.exit.col === c && 'exit'].filter(Boolean).join(' '), piece: p.row === r && p.col === c ? { type: p.type, side: p.color } : null };
  };
  const inPortals = targets.some((m) => portalAt(s.board, m.row, m.col));
  return html`<div class="screen mini"><${Topbar} title="Contrabando dimensional" sub=${sub} onBack=${onBack} /><div class="mini-body">
  <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="portal" size=${12} /> Jugadas: ${s.turns}</span><span class="chip">Salida: esquina superior derecha</span>${inPortals && html`<span class="chip">Portal a tiro</span>`}</div>
  <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Contrabando dimensional" boardClass="bm-slab" gridRef=${gridRef} board=${s.board} onTap=${tap} />
  <${MiniTools} mini="contraband" title="Contrabando dimensional" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Lleva el caballo contrabandista a la salida (fila superior, última columna). Los dos portales dorados están enlazados: aterrizar en uno te transporta al otro. Planifica el salto para llegar antes de que se acabe el tiempo.<//>
  ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'La mercancía cruzó la frontera.' : 'Se agotaron las jugadas.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
  </div></div>`;
}
