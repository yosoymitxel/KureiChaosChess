import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, reduced } from '../hop.js';
import { SIZE, DIFFS, newHunt, legal, move } from '../../game/hunt.js';

export function CaceriaScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newHunt(diff || settings.miniDiff?.caceria));
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const hop = useRef(null);
  const targets = legal(s);
  useEffect(() => {
    const h = hop.current;
    if (!h) return;
    hop.current = null;
    const grid = gridRef.current;
    const el = grid?.querySelector('.bm-pc.side-light');
    if (el && !reduced()) hopPiece(grid, el, { from: h.from, to: h.to, side: 'light', cols: SIZE, rows: SIZE });
  });
  const tap = (r, c) => {
    if (s.over || !targets.some((m) => m.row === r && m.col === c)) return;
    const hunter = s.pieces.find((p) => p.id === 'hunter');
    hop.current = { from: { row: hunter.row, col: hunter.col }, to: { row: r, col: c } };
    if (move(s, r, c)) redraw((n) => n + 1);
  };
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    const valid = targets.some((m) => m.row === r && m.col === c);
    const fallen = s.board.holes.has(r + ',' + c);
    return { cls: [valid && 'mv', p?.id === 'runner' && 'foe', fallen && 'hole'].filter(Boolean).join(' '), piece: p && { type: p.type, side: p.color } };
  };
  return html`<div class="screen mini">
    <${Topbar} title="La cacería" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <div class="mini-stats" aria-live="polite">
        <span class="chip"><${Icon} name="hunt" size=${12} /> Quedan ${s.turns} jugadas</span>
        <span class="chip">El fugitivo avanza cada turno</span>
        <span class="chip">${s.board.holes.size} casillas caídas</span>
      </div>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="La cacería" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap} />
      <${MiniTools} mini="caceria" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Persigue al peón fugitivo con el caballo marfil. El peón avanza una fila después de cada jugada; las casillas caídas cambian aleatoriamente al iniciar cada partida. Captúralo antes de que llegue arriba.<//>
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Alcanzaste al fugitivo.' : 'El fugitivo llegó a la salida o se agotaron las jugadas.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
