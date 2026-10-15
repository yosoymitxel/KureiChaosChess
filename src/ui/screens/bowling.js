import { html, useState, useEffect } from '../lib.js';
import { Topbar } from '../components.js';
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
  const status = s.over === 'win' ? '¡Bolera limpia! Ganas.' : s.over === 'lose' ? 'Una pieza llegó a tu borde.'
    : `Derribadas ${s.down}/${GOAL}. Toca un carril (o teclas 1-5) para lanzar una ficha.`;

  return html`<div class="screen mini">
    <${Topbar} title="Bolos de nuez" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${!!s.over} label="Bolera"
        onTap=${(r) => launch(s, r) && redraw((n) => n + 1)} />
      ${s.over && html`<button class="btn primary" onClick=${() => onEnd(s.over === 'win')}>${endLabel}</button>`}
    </div>
  </div>`;
}
