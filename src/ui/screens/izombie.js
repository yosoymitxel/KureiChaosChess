import { html, useState } from '../lib.js';
import { Topbar } from '../components.js';
import { PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { MiniGrid } from './mini-grid.js';
import { ROWS, COLS, COST, newZombie, at, buy, canBuy, advance } from '../../game/izombie.js';

export function IZombieScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newZombie);
  const [pick, setPick] = useState('pawn');
  const [, tick] = useState(0);
  const redraw = () => tick((n) => n + 1);

  const cell = (r, c) => {
    const p = at(s, r, c);
    return { cls: r === 0 && !p && canBuy(s, pick, c) ? 'drop' : r === ROWS - 1 ? 'goal' : '', piece: p && { type: p.type, side: p.color } };
  };
  const status = s.over === 'win' ? '¡Una pieza cruzó la defensa! Ganas.' : s.over === 'lose' ? 'La defensa aguantó.'
    : `Monedas: ${s.coins}. Coloca piezas arriba y pulsa Avanzar: llega a la última fila.`;

  return html`<div class="screen mini">
    <${Topbar} title="Yo, Zombi" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${!!s.over} label="Tablero de Yo, Zombi"
        onTap=${(r, c) => r === 0 && buy(s, pick, c) && redraw()} />
      ${s.over ? html`<button class="btn primary" onClick=${() => onEnd(s.over === 'win')}>${endLabel}</button>`
        : html`<div class="bm-actions" role="group" aria-label="Pieza a colocar">
          ${Object.entries(COST).map(([t, cost]) => html`<button class=${'btn sm' + (pick === t ? ' on' : ' ghost')} aria-pressed=${pick === t}
            disabled=${cost > s.coins} title=${PIECE_NAMES[t]} onClick=${() => setPick(t)}><${PieceIcon} type=${t} side="dark" size=${22} />${cost}</button>`)}
        </div>
        <button class="btn primary" onClick=${() => { advance(s); redraw(); }}>Avanzar</button>`}
    </div>
  </div>`;
}
