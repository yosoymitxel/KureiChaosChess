import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece } from '../hop.js';
import { SIZE, newRoute, jumps, jump, isTarget, isVisited, remaining } from '../../game/knight.js';

export function KnightScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newRoute);
  const [, redraw] = useState(0);
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
    hop.current = { from, to: { row: r, col: c } };
    redraw((n) => n + 1);
  };

  const cell = (r, c) => {
    const here = s.pos.r === r && s.pos.c === c;
    const cls = [
      isTarget(s, r, c) && !isVisited(s, r, c) && 'target',
      isVisited(s, r, c) && !here && 'closed path',
      next.some((p) => p.r === r && p.c === c) && 'mv',
    ].filter(Boolean).join(' ');
    return { cls, piece: here && { type: 'knight', side: 'light' } };
  };
  const status = `Faltan ${remaining(s)} casillas marcadas. Las que pisas se cierran.`;

  return html`<div class="screen mini">
    <${Topbar} title="Ruta del caballo" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">El caballo salta en L. Pisa las casillas con aro dorado; las que ya pisaste quedan oscurecidas con un punto y no se pueden repetir. Pierdes si te quedas sin saltos posibles.</p></details>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Ruta del caballo"
        gridRef=${gridRef} onTap=${go} />
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Completaste la ruta sin repetir casilla.' : 'El caballo se quedó sin saltos posibles.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
