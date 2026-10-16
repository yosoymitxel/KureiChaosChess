import { html, useState } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
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
    return { cls: r === 0 && !p && canBuy(s, pick, c) ? 'drop' : r === ROWS - 1 ? 'goal' + (s.over ? '' : ' aim') : '', piece: p && { type: p.type, side: p.color } };
  };
  const attackers = s.pieces.filter((p) => p.color === 'dark');
  const status = `Monedas: ${s.coins} · piezas en pie: ${attackers.length}.`;
  const step = !attackers.length ? 1 : s.moved ? 3 : 2;
  const STEPS = ['Compra', 'Avanza', 'Cruza'];
  const HINTS = { 1: 'Toca una casilla de la fila de arriba para comprar tu primera pieza.', 2: 'Pulsa Avanzar: las piezas bajan y la defensa captura lo que tenga a tiro.', 3: 'Cruza una pieza hasta la última fila: esa es la salida.' };

  return html`<div class="screen mini">
    <${Topbar} title="Yo, Zombi" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      ${!s.over && html`<p class="mini-steps">${STEPS.map((t, i) => html`<span class=${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}>${i + 1} ${t}</span>`)}</p>`}
      ${!s.over && html`<p class="mini-step-hint">${HINTS[step]}</p>`}
      <p class="mini-help">La defensa marfil no se mueve: tras cada avance captura toda pieza que tenga a tiro.</p>
      <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${!!s.over} label="Tablero de Yo, Zombi"
        onTap=${(r, c) => r === 0 && buy(s, pick, c) && redraw()} />
      ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Una pieza tuya cruzó la defensa.' : 'Te quedaste sin piezas y sin monedas.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
        : html`<div class="bm-actions" role="group" aria-label="Pieza a colocar">
          ${Object.entries(COST).map(([t, cost]) => html`<button class=${'btn sm buy' + (pick === t ? ' on' : ' ghost')} aria-pressed=${pick === t}
            disabled=${cost > s.coins} onClick=${() => setPick(t)}><${PieceIcon} type=${t} side="dark" size=${22} /><span>${PIECE_NAMES[t]}</span><b class="buy-cost">${cost}</b></button>`)}
        </div>
        <button class="btn primary" onClick=${() => { advance(s); redraw(); }}>Avanzar</button>`}
    </div>
  </div>`;
}
