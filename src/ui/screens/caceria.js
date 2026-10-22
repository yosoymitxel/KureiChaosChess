import { html, useState, useLayoutEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, hopLater, popPiece, fallPiece, reduced } from '../hop.js';
import { SIZE, DIFFS, newHunt, legal, move } from '../../game/hunt.js';

const pcAt = (grid, { row, col }) => grid?.children[row * SIZE + col]?.querySelector('.bm-pc');

export function CaceriaScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newHunt(diff || settings.miniDiff?.caceria));
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const seen = useRef(null);
  const targets = legal(s);
  const last = s.last;
  // Layout: el salto se arma antes de pintar, sobre el DOM de este mismo render.
  useLayoutEffect(() => {
    if (!last || seen.current === last) return;
    seen.current = last;
    const grid = gridRef.current;
    if (!grid || reduced()) return;
    hopPiece(grid, pcAt(grid, last.to), { from: last.from, to: last.to, side: 'light', cols: SIZE, rows: SIZE });
    if (last.caught) setTimeout(() => fallPiece(grid, { ...last.to, type: 'pawn', side: 'dark', cols: SIZE }), 360);
    const run = last.runner;
    if (!run) return;
    const el = pcAt(grid, run.to);
    hopLater(grid, el, { from: run.from, to: run.to, side: 'dark', cols: SIZE, rows: SIZE });
    if (run.capture) setTimeout(() => fallPiece(grid, { ...run.to, type: 'knight', side: 'light', cols: SIZE }), 760);
    if (s.reason === 'crowned') setTimeout(() => popPiece(grid, el), 820);
  });
  const tap = (r, c) => {
    if (s.over || !targets.some((m) => m.row === r && m.col === c)) return;
    if (move(s, r, c)) redraw((n) => n + 1);
  };
  const runner = s.pieces.find((p) => p.id === 'runner');
  // El peón solo come en diagonal hacia abajo: esas casillas son trampa para el caballo.
  const bite = (r, c) => s.diff !== DIFFS.dificil && runner && !s.over && r === runner.row + 1 && Math.abs(c - runner.col) === 1;
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    const valid = targets.some((m) => m.row === r && m.col === c);
    const fallen = s.board.holes.has(r + ',' + c);
    return {
      cls: [valid && 'mv', p?.id === 'runner' && 'foe', fallen && 'hole', bite(r, c) && 'danger', r === SIZE - 1 && 'goal'].filter(Boolean).join(' '),
      piece: p && { type: p.type, side: p.color },
    };
  };
  const note = s.over === 'win' ? 'Cazaste al peón antes de que coronara.'
    : s.reason === 'captured' ? 'Te pusiste en su diagonal y el peón se comió al caballo.'
    : 'El peón llegó al fondo y coronó.';
  return html`<div class="screen mini">
    <${Topbar} title="La cacería" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <div class="mini-stats" aria-live="polite">
        <span class="chip"><${Icon} name="hunt" size=${12} /> Corona en ${s.turns}</span>
        <span class="chip">Par: ${s.par} saltos</span>
        <span class="chip">${s.board.holes.size} casillas caídas</span>
      </div>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="La cacería" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap} />
      <${MiniTools} mini="caceria" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Caza al peón carmesí con el caballo marfil. El peón juega como en el ajedrez: baja una casilla (dos en su primera jugada), no puede avanzar si le tapas el paso y come en diagonal: si dejas el caballo delante en diagonal, te lo come. Si llega a la fila de abajo, corona. El par indica cuántos saltos hacen falta como mínimo.<//>
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${note} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
