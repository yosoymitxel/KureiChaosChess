import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniDiff } from '../components.js';
import { Icon, PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, popPiece, snapPieces, pieceDiffs, fallPiece } from '../hop.js';
import { ROWS, COLS, COST, DIFFS, newZombie, at, buy, canBuy, advance, danger } from '../../game/izombie.js';

export function IZombieScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newZombie(diff || settings.miniDiff?.izombie));
  const [pick, setPick] = useState('pawn');
  const [, tick] = useState(0);
  const gridRef = useRef(null);
  const before = useRef(null);
  const redraw = () => tick((n) => n + 1);
  // Cada acción guarda una instantánea; tras el repintado, quien se movió salta y quien entra brota.
  const act = (fn) => { const b = snapPieces(s.pieces); if (!fn()) return; before.current = b; redraw(); };
  useEffect(() => {
    const b = before.current;
    if (!b) return;
    before.current = null;
    const grid = gridRef.current;
    const { hops, born } = pieceDiffs(grid, b, s.pieces, COLS);
    for (const h of hops) hopPiece(grid, h.el, { from: h.from, to: h.to, side: h.side, cols: COLS, rows: ROWS });
    for (const el of born) popPiece(grid, el);
    // Las capturadas ya no están en el estado: su copia cae donde las mataron y se apaga.
    for (const f of s.falls) fallPiece(grid, { row: f.row, col: f.col, type: f.type, side: f.color, cols: COLS });
    s.falls = [];
  });

  const hot = s.over ? new Set() : danger(s);
  const cell = (r, c) => {
    const p = at(s, r, c);
    const trophy = r === ROWS - 1 && s.trophies.has(c);
    const cls = [r === 0 && !p && canBuy(s, pick, c) && 'drop', hot.has(r * COLS + c) && 'hot', r === ROWS - 1 && 'goal', trophy && 'trophy'].filter(Boolean).join(' ');
    return { cls, piece: p && { type: p.type, side: p.color } };
  };
  const attackers = s.pieces.filter((p) => p.color === 'dark');
  const step = !attackers.length ? 1 : s.moved ? 3 : 2;
  const STEPS = ['Compra', 'Avanza', 'Trofeos'];
  const HINTS = {
    1: 'Toca una casilla de la fila de arriba para comprar una pieza. Las casillas teñidas de rojo son las que la defensa captura.',
    2: 'Pulsa Avanzar: tus piezas bajan con su movimiento de ajedrez y la defensa captura lo que pare en casillas rojas.',
    3: `Lleva una pieza a cada trofeo de la última fila. Capturar un peón marfil paga 2 monedas; otra pieza, 1.`,
  };

  return html`<div class="screen mini">
    <${Topbar} title="Yo, Zombi" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniGrid} rows=${ROWS} cols=${COLS} cell=${cell} disabled=${!!s.over} label="Tablero de Yo, Zombi" gridRef=${gridRef} boardClass="bm-slab iz"
          onTap=${(r, c) => r === 0 && act(() => buy(s, pick, c))} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="coin-chip" title="Monedas"><${Icon} name="coin" size=${16} /><b>${s.coins}</b></span>
            <span class="chip"><${PieceIcon} type="pawn" side="dark" size=${15} />${attackers.length} en pie</span>
            <span class="chip" aria-label=${`Trofeos tomados: ${s.diff.trophies.length - s.trophies.size} de ${s.diff.trophies.length}`}><${Icon} name="trophy" size=${15} />${s.diff.trophies.length - s.trophies.size}/${s.diff.trophies.length}</span>
          </div>`}
          ${!s.over && html`<p class="mini-steps">${STEPS.map((t, i) => html`<span class=${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}>${i + 1} ${t}</span>`)}</p>`}
          ${!s.over && html`<p class="mini-step-hint">${HINTS[step]}</p>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Tomaste los ${s.diff.trophies.length} trofeos.` : `Te quedaste sin piezas y sin monedas con ${s.diff.trophies.length - s.trophies.size} de ${s.diff.trophies.length} trofeos.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-actions" role="group" aria-label="Pieza a colocar">
              ${Object.entries(COST).map(([t, cost]) => html`<button class=${'btn sm buy' + (pick === t ? ' on' : ' ghost')} aria-pressed=${pick === t} aria-label=${`${PIECE_NAMES[t]}: ${cost} moneda${cost === 1 ? '' : 's'}`}
                disabled=${cost > s.coins} onClick=${() => setPick(t)}><${PieceIcon} type=${t} side="dark" size=${22} /><span>${PIECE_NAMES[t]}</span><b class="buy-cost">${cost}</b></button>`)}
            </div>
            <button class="btn primary" onClick=${() => act(() => advance(s))}>Avanzar</button>`}
          <${MiniDiff} mini="izombie" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart} />
          <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Como Yo, Zombi de Plants vs. Zombies: atacas tú. La defensa marfil no se mueve, pero tras cada avance captura lo que pare en sus casillas (teñidas de rojo). Compra piezas en la fila de arriba; al pulsar Avanzar cada una da su paso de ajedrez más profundo. Lleva una pieza a cada trofeo de la última fila: la que llega lo toma y sale del tablero. Capturar defensas paga monedas. Pierdes si te quedas sin piezas y sin monedas para un peón.</p></details>
        </div>
      </div>
    </div>
  </div>`;
}
