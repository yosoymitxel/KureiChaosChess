import { html, useState, useEffect } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { ROWS, COLS, GOAL, newBowling, launch, tick } from '../../game/bowling.js';

const TICK_MS = 280;

export function BowlingScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newBowling);
  const [, redraw] = useState(0);

  useEffect(() => {
    const id = setInterval(() => { tick(s); redraw((n) => n + 1); if (s.over) clearInterval(id); }, TICK_MS);
    const onKey = (e) => { const n = +e.key; if (n >= 1 && n <= ROWS && launch(s, n - 1)) redraw((x) => x + 1); };
    addEventListener('keydown', onKey);
    return () => { clearInterval(id); removeEventListener('keydown', onKey); };
  }, []);

  const cell = (r, c) => {
    const e = s.enemies.find((x) => x.r === r && x.c === c);
    const ball = s.balls.some((b) => b.r === r && b.c === c);
    return { cls: (c === 0 ? 'lane' + (s.reload ? '' : ' drop') : '') + (ball ? ' ball' : ''), piece: e && { type: e.type, side: 'dark' } };
  };
  const status = `Derribadas ${s.down}/${GOAL}. Toca un carril o pulsa su número para lanzar una ficha.`;

  return html`<div class="screen mini">
    <${Topbar} title="Bolos de nuez" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <p class="mini-help">Las piezas carmesí cruzan de derecha a izquierda por cinco carriles. Lanza fichas desde la izquierda (toque o teclas 1-5): al derribar una, la ficha rebota en diagonal y sigue. No dejes que ninguna llegue a tu borde.</p>
      <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${!!s.over} label="Bolera"
        onTap=${(r) => launch(s, r) && redraw((n) => n + 1)} />
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Derribaste las ${GOAL} piezas que hacían falta.` : 'Una pieza llegó a tu borde.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
