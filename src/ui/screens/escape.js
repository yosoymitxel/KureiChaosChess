import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, reduced } from '../hop.js';
import { SIZE, DIFFS, newEscape, legal, move } from '../../game/escape.js';

export function EscapeScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newEscape(diff || settings.miniDiff?.escape));
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
    const runner = s.pieces.find((p) => p.id === 'runner');
    hop.current = { from: { row: runner.row, col: runner.col }, to: { row: r, col: c } };
    if (move(s, r, c)) redraw((n) => n + 1);
  };
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    const valid = targets.some((m) => m.row === r && m.col === c);
    return { cls: [valid && 'mv', p?.id === 'guard' && 'foe', r === 0 && 'target'].filter(Boolean).join(' '), piece: p && { type: p.type, side: p.color } };
  };
  return html`<div class="screen mini">
    <${Topbar} title="Escape del tablero" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <div class="mini-stats" aria-live="polite">
        <span class="chip"><${Icon} name="flag" size=${12} /> Quedan ${s.turns} saltos</span>
        <span class="chip">Llega a la fila dorada</span>
      </div>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Escape del tablero" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap} />
      <${MiniTools} mini="escape" title="Escape del tablero" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Lleva el caballo marfil hasta la fila superior. El peón carmesí avanza hacia abajo después de tus saltos; no puedes ocupar su casilla ni capturarlo. Las casillas doradas son la salida.<//>
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Escapaste del tablero.' : 'El guardia te cerró el paso o se acabaron los saltos.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
