import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece } from '../hop.js';
import { SIZE, DIFFS, newRoute, jumps, jump, isTarget, isVisited, remaining } from '../../game/knight.js';

export function KnightScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newRoute(Math.random, DIFFS[diff || settings.miniDiff?.knight] || DIFFS.normal));
  const [, redraw] = useState(0);
  const [order, setOrder] = useState(() => [{ r: s.pos.r, c: s.pos.c }]); // orden de la ruta, para numerar las casillas pisadas
  const gridRef = useRef(null);
  const hop = useRef(null); // el salto que acaba de hacer, animado una vez tras repintar
  const next = s.over ? [] : jumps(s);

  // El caballo salta desde la casilla que deja hasta la que acaba de pisar, con su charco.
  useEffect(() => {
    const h = hop.current;
    if (!h) return;
    hop.current = null;
    const grid = gridRef.current;
    hopPiece(grid, grid?.querySelector('.bm-pc'), { ...h, side: 'light', cols: SIZE, rows: SIZE });
  });

  const go = (r, c) => {
    const from = { row: s.pos.r, col: s.pos.c };
    if (!jump(s, r, c)) return;
    setOrder((o) => [...o, { r, c }]);
    hop.current = { from, to: { row: r, col: c } };
    redraw((n) => n + 1);
  };

  const cell = (r, c) => {
    const here = s.pos.r === r && s.pos.c === c;
    const step = order.findIndex((p) => p.r === r && p.c === c);
    const cls = [
      isTarget(s, r, c) && !isVisited(s, r, c) && 'target',
      isVisited(s, r, c) && !here && 'closed',
      next.some((p) => p.r === r && p.c === c) && 'mv',
    ].filter(Boolean).join(' ');
    return { cls, piece: here && { type: 'knight', side: 'light' }, label: step >= 0 && !here ? step + 1 : null };
  };

  return html`<div class="screen mini">
    <${Topbar} title="Ruta del caballo" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<div class="mini-stats" aria-live="polite">
        <span class="chip" aria-label=${`Faltan ${remaining(s)} casillas marcadas`}><${Icon} name="target" size=${12} />Falta${remaining(s) === 1 ? '' : 'n'} ${remaining(s)}</span>
      </div>`}
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Ruta del caballo"
        gridRef=${gridRef} boardClass="bm-slab" onTap=${go} />
      <${MiniTools} mini="knight" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>El caballo salta en L. Pisa las casillas con aro dorado; las que ya pisaste quedan numeradas por orden y no se pueden repetir. Pierdes si te quedas sin saltos posibles.<//>
      ${s.over && html`<div class=${"mini-end " + (s.over === 'win' ? 'win' : 'lose')} role="status"><p class="mini-end-title">${s.over === 'win' ? '¡Victoria!' : 'Derrota'}</p><button class="btn primary" onClick=${() => onEnd(s.over === 'win')}>${endLabel}</button></div>`}
    </div>
  </div>`;
}
