import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, reduced } from '../hop.js';
import { collapseTiles } from '../../view/board-view.js';
import { SIZE, DIFFS, newCollapsingFloor, legal, move } from '../../game/collapsing-floor.js';

const d = (ms) => reduced() ? Math.min(ms, 120) : ms;

export function CollapsingFloorScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newCollapsingFloor(diff || settings.miniDiff?.collapsingFloor));
  const [, redraw] = useState(0);
  const [animating, setAnimating] = useState(false);
  const targets = legal(s);
  const gridRef = useRef(null);
  const hop = useRef(null);
  const collapse = useRef(null);
  const lastCollapsed = s.lastCollapsed;

  const tap = (r, c) => {
    const from = { row: s.pieces[0].row, col: s.pieces[0].col };
    if (s.over || animating || !targets.some((m) => m.row === r && m.col === c)) return;
    if (move(s, r, c)) {
      hop.current = { from, to: { row: r, col: c } };
      collapse.current = s.lastCollapsed;
      setAnimating(true);
      redraw((n) => n + 1);
    }
  };

  useEffect(() => {
    const h = hop.current;
    if (!h) return;
    hop.current = null;
    const grid = gridRef.current;
    const piece = grid?.children[h.to.row * SIZE + h.to.col]?.querySelector('.bm-pc');
    hopPiece(grid, piece, { ...h, side: 'light', cols: SIZE, rows: SIZE });
  });

  useEffect(() => {
    const cells = collapse.current;
    if (!cells) return;
    collapse.current = null;
    const grid = gridRef.current;
    const tiles = cells.map((cell) => {
      const [row, col] = cell.split(',').map(Number);
      return grid?.children[row * SIZE + col];
    }).filter(Boolean);
    if (!tiles.length) { setAnimating(false); return; }

    tiles.forEach((tile) => tile.classList.add('cracking'));
    let cancelled = false;
    const timer = setTimeout(async () => {
      const cellSize = grid.querySelector('.bm-cell')?.offsetWidth || 32;
      await collapseTiles(tiles, { depth: cellSize * 6, duration: d(900), delay: d(90) });
      if (cancelled) return;
      tiles.forEach((tile) => tile.classList.remove('cracking'));
      setAnimating(false);
    }, d(420));

    return () => { cancelled = true; clearTimeout(timer); };
  }, [lastCollapsed]);

  const cell = (r, c) => {
    const p = s.pieces[0], k = r + ',' + c, valid = targets.some((m) => m.row === r && m.col === c);
    return {
      cls: [
        valid && 'mv',
        s.board.holes.has(k) && 'hole',
        s.lastCollapsed.includes(k) && 'falling',
        r === 0 && 'target',
      ].filter(Boolean).join(' '),
      piece: p.row === r && p.col === c ? { type: p.type, side: p.color } : null,
    };
  };

  return html`<div class="screen mini">
    <${Topbar} title="El suelo se acaba" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <div class="mini-stats" aria-live="polite">
        <span class="chip"><${Icon} name="collapse" size=${12} /> Saltos: ${s.turns}</span>
        <span class="chip">Riesgo: hasta ${s.diff.collapse} ${s.diff.collapse === 1 ? 'casilla' : 'casillas'} por turno</span>
      </div>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over || animating} label="El suelo se acaba" boardClass="bm-slab floor-game" gridRef=${gridRef} onTap=${tap} />
      <${MiniTools} mini="collapsingFloor" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>
        Lleva el caballo a cualquier casilla de la fila superior. Al saltar, cae la casilla que abandonas; el suelo también intenta hundir casillas alcanzables de rutas que usarías para llegar. En difícil intenta derrumbar dos. Si solo queda una ruta viable dentro del tiempo, el suelo la conserva.
      <//>
      ${s.over && !animating && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Llegaste al otro lado.' : 'Te quedaste sin saltos o sin una ruta viable.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
