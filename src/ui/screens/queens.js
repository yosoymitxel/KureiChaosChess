import { html, useState, useEffect } from '../lib.js';
import { Topbar } from '../components.js';
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
  const status = s.over === 'win' ? '¡Ocho reinas en paz! Ganas.' : s.over === 'lose' ? 'Se acabó el tiempo.'
    : `Reinas: ${s.queens.length}/${N} · ${time} s. Ninguna puede atacar a otra.`;

  return html`<div class="screen mini">
    <${Topbar} title="Ocho reinas" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <${MiniGrid} rows=${N} cols=${N} cell=${cell} disabled=${!!s.over} label="Tablero de ocho reinas"
        onTap=${(r, c) => toggle(s, r, c) && redraw((n) => n + 1)} />
      ${s.over && html`<button class="btn primary" onClick=${() => onEnd(s.over === 'win')}>${endLabel}</button>`}
    </div>
  </div>`;
}
