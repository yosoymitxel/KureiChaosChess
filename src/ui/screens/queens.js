import { html, useState, useEffect } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { N, SECONDS, newQueens, toggle, clashing } from '../../game/queens.js';

export function QueensScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newQueens);
  const [time, setTime] = useState(SECONDS);
  const [, redraw] = useState(0);

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
  const status = `Reinas: ${s.queens.length}/${N} · ${time} s. Ninguna puede atacar a otra.`;

  return html`<div class="screen mini">
    <${Topbar} title="Ocho reinas" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <p class="mini-help">Toca casillas para colocar reinas: ninguna puede compartir fila, columna ni diagonal, y las que chocan se marcan en rojo. Completa las ocho antes de que se acabe el tiempo.</p>
      <${MiniGrid} rows=${N} cols=${N} cell=${cell} disabled=${!!s.over} label="Tablero de ocho reinas"
        onTap=${(r, c) => toggle(s, r, c) && redraw((n) => n + 1)} />
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Ocho reinas conviviendo sin atacarse.' : `Se acabó el tiempo con ${s.queens.length} de ${N} reinas.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
