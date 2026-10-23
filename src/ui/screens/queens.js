import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniTools } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { popPiece } from '../hop.js';
import { DIFFS, newQueens, toggle, clashing } from '../../game/queens.js';

export function QueensScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newQueens(diff || settings.miniDiff?.queens));
  const [time, setTime] = useState(() => s.seconds);
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const born = useRef(null);
  // La reina que entra brota; la que sale se va sin animación.
  useEffect(() => {
    const q = born.current;
    born.current = null;
    if (q) popPiece(gridRef.current, gridRef.current?.children[q.r * s.n + q.c]?.querySelector('.bm-pc'));
  });
  const tap = (r, c) => {
    const had = s.queens.some((q) => q.r === r && q.c === c);
    if (!toggle(s, r, c)) return;
    born.current = had ? null : { r, c };
    redraw((n) => n + 1);
  };

  useEffect(() => {
    const id = setInterval(() => setTime((t) => {
      if (s.over) { clearInterval(id); return t; }
      if (t <= 1) { s.over = 'lose'; clearInterval(id); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []);

  const bad = clashing(s);
  const cell = (r, c) => {
    const q = s.queens.find((x) => x.r === r && x.c === c);
    return { cls: q && bad.includes(q) ? 'clash' : '', piece: q && { type: 'queen', side: 'light' } };
  };
  return html`<div class="screen mini">
    <${Topbar} title="Ocho reinas" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniGrid} rows=${s.n} cols=${s.n} cell=${cell} disabled=${!!s.over} label=${`Tablero de ${s.n} reinas`} gridRef=${gridRef} boardClass="bm-slab"
          onTap=${tap} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="chip" aria-label=${`Reinas colocadas: ${s.queens.length} de ${s.n}`}><span class="dots">${Array.from({ length: s.n }, (_, i) => html`<i class=${i < s.queens.length ? '' : 'off'} />`)}</span></span>
            <span class=${'chip' + (time <= 30 ? ' danger' : '')} aria-label=${`Quedan ${time} segundos`}><b>${time}</b> s</span>
          </div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `${s.n} reinas conviviendo sin atacarse.` : `Se acabó el tiempo con ${s.queens.length} de ${s.n} reinas.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="queens" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Toca casillas para colocar reinas: ninguna puede compartir fila, columna ni diagonal, y las que chocan se marcan en rojo. Completa las ${s.n} antes de que se acabe el tiempo.<//>
        </div>
      </div>
    </div>
  </div>`;
}
