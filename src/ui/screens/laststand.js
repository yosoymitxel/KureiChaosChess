import { html, useState, useEffect } from '../lib.js';
import { Topbar } from '../components.js';
import { PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { MiniGrid } from './mini-grid.js';
import { ROWS, COLS, WAVES, PRICES, newStand, at, place, canPlace, step } from '../../game/laststand.js';

export function LastStandScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newStand);
  const [pick, setPick] = useState('pawn');
  const [, redraw] = useState(0);

  useEffect(() => {
    if (s.phase !== 'fight' || s.over) return;
    const id = setInterval(() => { step(s); redraw((n) => n + 1); if (s.over) clearInterval(id); }, 650);
    return () => clearInterval(id);
  }, [s.phase]);

  const cell = (r, c) => {
    const p = at(s, r, c);
    return { cls: canPlace(s, pick, r, c) ? 'drop' : '', piece: p && { type: p.type, side: p.color } };
  };
  const status = s.over === 'win' ? '¡Aguantaste las tres oleadas! Ganas.' : s.over === 'lose' ? 'Rompieron tu defensa.'
    : s.phase === 'setup' ? `Presupuesto: ${s.budget}. Coloca tu defensa en las tres filas de abajo.` : `Oleada ${s.wave} de ${WAVES}`;

  return html`<div class="screen mini">
    <${Topbar} title="Última resistencia" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${s.phase !== 'setup'} label="Tablero de Última resistencia"
        onTap=${(r, c) => place(s, pick, r, c) && redraw((n) => n + 1)} />
      ${s.over ? html`<button class="btn primary" onClick=${() => onEnd(s.over === 'win')}>${endLabel}</button>`
        : s.phase === 'setup' && html`<div class="bm-actions" role="group" aria-label="Pieza a colocar">
          ${Object.entries(PRICES).map(([t, cost]) => html`<button class=${'btn sm' + (pick === t ? ' on' : ' ghost')} aria-pressed=${pick === t}
            disabled=${cost > s.budget} title=${PIECE_NAMES[t]} onClick=${() => setPick(t)}><${PieceIcon} type=${t} side="light" size=${22} />${cost}</button>`)}
        </div>
        <button class="btn primary" disabled=${!s.pieces.length} onClick=${() => { step(s); redraw((n) => n + 1); }}>Empezar oleadas</button>`}
    </div>
  </div>`;
}
