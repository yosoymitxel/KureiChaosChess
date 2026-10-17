// Conecta 4 minigame screen: ivory (you) against crimson (bot), tokens drop with a bounce of weight.
// Keyboard: arrows pick a column, Enter or Space drops.
import { html, useState, useRef, useEffect, motion } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { ROWS, COLS, emptyGrid, dropRow, lineAt, isFull, botColumn } from '../../game/connect4.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function Connect4Screen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [grid, setGrid] = useState(emptyGrid);
  const [col, setCol] = useState(3);
  const [turn, setTurn] = useState('light');
  const [result, setResult] = useState(null); // { winner: 'light' | 'dark' | null, line }
  const busy = useRef(false);
  const boardRef = useRef(null);

  // Drop a token: update the grid, then let it fall from above the board into its cell.
  const drop = async (c, who) => {
    const r = dropRow(grid, c);
    if (r < 0) return null;
    grid[r][c] = who;
    setGrid(grid.map((row) => row.slice()));
    await wait(0);
    const el = boardRef.current?.querySelector(`[data-cell="${r}-${c}"] .c4-token`);
    if (el) await motion(el, { y: [-(r + 1) * el.offsetHeight * 1.15, 0] }, { duration: 0.25 + r * 0.05, ease: [0.55, 0, 1, 0.45] });
    if (el) motion(el, { scaleY: [0.82, 1], scaleX: [1.12, 1] }, { duration: 0.18, ease: [0.16, 1, 0.3, 1] });
    const line = lineAt(grid, r, c, who);
    if (line || isFull(grid)) { setResult({ winner: line ? who : null, line }); return 'over'; }
    return 'ok';
  };

  const play = async (c) => {
    if (busy.current || result || turn !== 'light' || dropRow(grid, c) < 0) return;
    busy.current = true;
    if ((await drop(c, 'light')) === 'ok') {
      setTurn('dark');
      await wait(380);
      if ((await drop(botColumn(grid), 'dark')) === 'ok') setTurn('light');
    }
    busy.current = false;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setCol((c) => Math.max(0, c - 1));
      else if (e.key === 'ArrowRight') setCol((c) => Math.min(COLS - 1, c + 1));
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(col); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const won = (r, c) => result?.line?.some(([a, b]) => a === r && b === c);
  const status = turn === 'light' ? 'Tu turno: elige columna' : 'Piensa el bot…';

  return html`<div class="screen mini">
    <${Topbar} title="Conecta 4" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!result && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Elige columna con las flechas o pasando el ratón, y suelta la ficha con Enter o un toque. Ganas al conectar cuatro en línea antes que el carmesí.</p></details>
      <div class="mini-stage">
        <div class="c4" ref=${boardRef} style=${{ '--cols': COLS, '--rows': ROWS }} role="grid" aria-label="Tablero de Conecta 4">
          ${Array.from({ length: COLS }, (_, c) => {
            const land = dropRow(grid, c); // casilla donde caería la próxima ficha de esta columna
            return html`<button class=${'c4-col' + (c === col && !result ? ' on' : '')} aria-label=${'Columna ' + (c + 1)}
              disabled=${!!result || turn !== 'light' || land < 0} onPointerEnter=${() => setCol(c)} onClick=${() => play(c)}>
              ${Array.from({ length: ROWS }, (_, r) => html`<span class="c4-cell" data-cell=${r + '-' + c}>
                ${grid[r][c] && html`<i class=${'c4-token side-' + grid[r][c] + (won(r, c) ? ' won' : '')}></i>`}
                ${!grid[r][c] && r === land && c === col && turn === 'light' && !result && html`<i class="c4-ghost side-light"></i>`}</span>`)}
            </button>`;
          })}
        </div>
      </div>
      ${result && html`<${MiniEnd} win=${result.winner === 'light'} title=${result.winner ? undefined : 'Empate'}
        note=${result.winner === 'light' ? 'Cuatro en línea antes que el bot.' : result.winner === 'dark' ? 'El bot conectó cuatro antes que tú.' : 'Tablero lleno: nadie conectó cuatro.'}
        label=${endLabel} onEnd=${() => onEnd(result.winner === 'light')} />`}
    </div>
  </div>`;
}
