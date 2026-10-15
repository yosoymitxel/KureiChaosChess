import { html, useState } from '../lib.js';
import { Topbar } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { SIZE, newRoute, jumps, jump, isTarget, isVisited, remaining } from '../../game/knight.js';

export function KnightScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newRoute);
  const [, redraw] = useState(0);
  const next = s.over ? [] : jumps(s);

  const cell = (r, c) => {
    const here = s.pos.r === r && s.pos.c === c;
    const cls = [isTarget(s, r, c) && !isVisited(s, r, c) && 'target', isVisited(s, r, c) && !here && 'closed', next.some((p) => p.r === r && p.c === c) && 'mv'].filter(Boolean).join(' ');
    return { cls, piece: here && { type: 'knight', side: 'light' } };
  };
  const status = s.over === 'win' ? '¡Ruta completa! Ganas.' : s.over === 'lose' ? 'El caballo se quedó sin salida.'
    : `Faltan ${remaining(s)} casillas marcadas. Las que pisas se cierran.`;

  return html`<div class="screen mini">
    <${Topbar} title="Ruta del caballo" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Ruta del caballo"
        onTap=${(r, c) => jump(s, r, c) && redraw((n) => n + 1)} />
      ${s.over && html`<button class="btn primary" onClick=${() => onEnd(s.over === 'win')}>${endLabel}</button>`}
    </div>
  </div>`;
}
