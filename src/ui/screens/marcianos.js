import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniDiff } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { COLS, ROWS, PLAYER_ROW, WAVES, DIFFS, newMarcianos, step } from '../../game/marcianos.js';
import { hopPiece } from '../hop.js';

// Flechas o A/D mueven el cañón; espacio o el botón disparan.
const KEYS = { arrowleft: -1, a: -1, arrowright: 1, d: 1 };

export function MarcianosScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s, setS] = useState(() => newMarcianos(Math.random, diff || settings.miniDiff?.marcianos));
  const [, tick] = useState(0);
  const gridRef = useRef(null);
  const hops = useRef(null); // saltos del último tic: quién se movió y de dónde a dónde

  const snap = () => ({ player: s.player.col, enemies: s.enemies.map((e) => ({ id: e.id, row: e.row, col: e.col })) });
  const act = (a) => {
    const before = snap();
    if (!step(s, a)) return;
    const after = snap(), moved = [];
    if (after.player !== before.player) moved.push({ sel: '.bm-pc.me', from: { row: PLAYER_ROW, col: before.player }, to: { row: PLAYER_ROW, col: after.player }, side: 'light' });
    for (const e of after.enemies) {
      const was = before.enemies.find((b) => b.id === e.id);
      if (was && (was.row !== e.row || was.col !== e.col)) moved.push({ sel: `.bm-pc.foe[data-id="${e.id}"]`, from: was, to: e, side: 'dark' });
    }
    hops.current = moved;
    tick((n) => n + 1);
  };
  const tap = (row, col) => {
    if (row !== PLAYER_ROW) return;
    if (col === s.player.col) act({ shoot: true });
    else act({ move: Math.sign(col - s.player.col) });
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (KEYS[k]) { e.preventDefault(); act({ move: KEYS[k] }); }
      else if (k === ' ') { e.preventDefault(); act({ shoot: true }); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  // Después de repintar, las fichas que se movieron saltan con su charco (criterio del tablero).
  useEffect(() => {
    const moved = hops.current;
    if (!moved?.length) return;
    hops.current = null;
    const grid = gridRef.current;
    for (const m of moved) hopPiece(grid, grid?.querySelector(m.sel), { ...m, cols: COLS, rows: ROWS });
  });

  const at = (list, r, c) => list.find((x) => x.row === r && x.col === c);
  const zapped = (r, c) => s.zaps.some((z) => z.row === r && z.col === c);

  return html`<div class="screen mini">
    <${Topbar} title="Matamarcianos" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="bm bm-slab mm" ref=${gridRef} style=${{ '--cols': COLS, '--rows': ROWS }} role="grid" aria-label="Campo de Matamarcianos">
            ${Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => {
              const foe = at(s.enemies, r, c), shot = at(s.shots, r, c), me = r === PLAYER_ROW && s.player.col === c;
              return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (r === PLAYER_ROW ? ' home' : '') + (zapped(r, c) ? ' blast' : '')}
                disabled=${!!s.over} aria-label=${`Fila ${r + 1}, columna ${c + 1}`} onClick=${() => tap(r, c)}>
                ${foe && html`<span class="bm-pc foe side-dark" data-id=${foe.id} dangerouslySetInnerHTML=${{ __html: pieceSVG(foe.type) }} />`}
                ${shot && html`<span class="mm-shot"></span>`}
                ${me && html`<span class="bm-pc me side-light" dangerouslySetInnerHTML=${{ __html: pieceSVG('cannon') }} />`}
              </button>`;
            }))}
          </div>
        </div>
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="chip"><${Icon} name="invader" size=${13} />Oleada ${s.wave + 1}/${WAVES.length}</span>
            <span class="chip"><${Icon} name="skull" size=${13} />${s.enemies.length === 1 ? 'Queda 1' : `Quedan ${s.enemies.length}`}</span>
            <span class="chip" aria-label=${`Vidas ${s.lives} de ${s.diff.lives}`}>Vidas <span class="mm-lives">${Array.from({ length: s.diff.lives }, (_, i) => html`<i class=${i < s.lives ? 'on' : ''}></i>`)}</span></span>
          </div>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Tres oleadas y ni un carmesí en pie.' : 'Los carmesíes pisaron tu fila.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-controls">
              <div class="bm-actions mm-move" role="group" aria-label="Movimiento">
                <button class="btn sm" aria-label="Izquierda" onClick=${() => act({ move: -1 })}>←</button>
                <button class="btn sm" aria-label="Derecha" onClick=${() => act({ move: 1 })}>→</button>
              </div>
              <div class="bm-actions">
                <button class="btn sm primary" onClick=${() => act({ shoot: true })}><${Icon} name="cannon" size=${16} />Disparar</button>
              </div>
            </div>`}
          <${MiniDiff} mini="marcianos" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart} />
          <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Mueve con las flechas, A/D o el mando; espacio o el botón disparan hacia arriba. Los carmesíes bajan en tres oleadas: si pisan tu fila, pierdes una vida.</p></details>
        </div>
      </div>
    </div>
  </div>`;
}
