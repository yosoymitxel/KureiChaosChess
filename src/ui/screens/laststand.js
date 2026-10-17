import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { Icon, PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, popPiece, snapPieces, pieceDiffs, fallPiece } from '../hop.js';
import { ROWS, COLS, WAVES, PRICES, newStand, at, place, canPlace, step } from '../../game/laststand.js';

export function LastStandScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newStand);
  const [pick, setPick] = useState('pawn');
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const before = useRef(null);
  // Cada paso guarda una instantánea; tras el repintado, quien se movió salta y quien entra brota.
  const act = (fn) => { const b = snapPieces(s.pieces); fn(); before.current = b; redraw((n) => n + 1); };
  useEffect(() => {
    const b = before.current;
    if (!b) return;
    before.current = null;
    const grid = gridRef.current;
    const { hops, born } = pieceDiffs(grid, b, s.pieces, COLS);
    for (const h of hops) hopPiece(grid, h.el, { from: h.from, to: h.to, side: h.side, cols: COLS, rows: ROWS });
    for (const el of born) popPiece(grid, el);
    // Las caídas del choque: cada copia se vuelca donde cayó y la lista se vacía en el mismo pase.
    for (const f of s.falls) fallPiece(grid, { row: f.row, col: f.col, type: f.type, side: f.color, cols: COLS });
    s.falls = [];
  });

  useEffect(() => {
    if (s.phase !== 'fight' || s.over) return;
    const id = setInterval(() => { act(() => step(s)); if (s.over) clearInterval(id); }, 650);
    return () => clearInterval(id);
  }, [s.phase]);

  const cell = (r, c) => {
    const p = at(s, r, c);
    return { cls: canPlace(s, pick, r, c) ? 'drop' : '', piece: p && { type: p.type, side: p.color } };
  };
  return html`<div class="screen mini">
    <${Topbar} title="Última resistencia" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<div class="mini-stats" aria-live="polite">
        ${s.phase === 'setup' && html`<span class="coin-chip" title="Presupuesto"><${Icon} name="coin" size=${16} /><b>${s.budget}</b></span>`}
        <span class="chip" aria-label=${`Oleadas superadas: ${s.wave} de ${WAVES}`}><span class="dots">${Array.from({ length: WAVES }, (_, i) => html`<i class=${i < s.wave ? '' : 'off'} />`)}</span></span>
      </div>`}
      ${!s.over && s.phase === 'setup' && html`<p class="mini-step-hint">Coloca tu defensa en las tres filas de abajo.</p>`}
      <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Compra piezas tocando las tres filas de abajo y pulsa Empezar oleadas. El carmesí ataca en ${WAVES} oleadas y tu defensa ya no se refuerza: aguanta sin ceder la línea.</p></details>
      <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${s.phase !== 'setup'} label="Tablero de Última resistencia" gridRef=${gridRef} boardClass="bm-slab ls"
        onTap=${(r, c) => canPlace(s, pick, r, c) && act(() => place(s, pick, r, c))} />
      ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Aguantaste las ${WAVES} oleadas sin ceder la línea.` : `El carmesí se abrió paso en la oleada ${s.wave}.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
        : s.phase === 'setup' && html`<div class="bm-actions" role="group" aria-label="Pieza a colocar">
          ${Object.entries(PRICES).map(([t, cost]) => html`<button class=${'btn sm' + (pick === t ? ' on' : ' ghost')} aria-pressed=${pick === t} aria-label=${`${PIECE_NAMES[t]}: ${cost} moneda${cost === 1 ? '' : 's'}`}
            disabled=${cost > s.budget} title=${PIECE_NAMES[t]} onClick=${() => setPick(t)}><${PieceIcon} type=${t} side="light" size=${22} />${cost}</button>`)}
        </div>
        <button class="btn primary" disabled=${!s.pieces.length} onClick=${() => act(() => step(s))}>Empezar oleadas</button>`}
    </div>
  </div>`;
}
