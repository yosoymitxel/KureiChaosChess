// Conecta 4 minigame screen: ivory (you) against crimson (bot), tokens drop with a bounce of weight.
// Keyboard: arrows pick a column, Enter or Space drops.
import { html, useState, useRef, useEffect, motion } from '../lib.js';
import { playSfx } from '../sfx.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { ROWS, COLS, emptyGrid, dropRow, lineAt, isFull, botColumn, DIFFS } from '../../game/connect4.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// `duo` (partida local): { names: [marfil, carmesí] }; se turnan en la misma pantalla.
export function Connect4Screen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff, duo }) {
  // Profundidad del bot según el nivel: en la run la fija el piso, en libre la elige el jugador.
  const depth = (DIFFS[diff || settings.miniDiff?.connect4] || DIFFS.normal).depth;
  const [grid, setGrid] = useState(emptyGrid);
  const [col, setCol] = useState(3);
  const [turn, setTurn] = useState('light');
  const [result, setResult] = useState(null); // { winner: 'light' | 'dark' | null, line }
  const busy = useRef(false);
  // La fantasma espera a que la ficha aterrice: si no, asoma encima antes de que llegue.
  const [falling, setFalling] = useState(false);
  const boardRef = useRef(null);

  // Drop a token: update the grid, then let it fall from above the board into its cell.
  const drop = async (c, who) => {
    const r = dropRow(grid, c);
    if (r < 0) return null;
    setFalling(true);
    grid[r][c] = who;
    setGrid(grid.map((row) => row.slice()));
    await wait(0);
    const el = boardRef.current?.querySelector(`[data-cell="${r}-${c}"] .c4-token`);
    if (el) await motion(el, { y: [-(r + 1) * el.offsetHeight * 1.15, 0] }, { duration: 0.25 + r * 0.05, ease: [0.55, 0, 1, 0.45] });
    playSfx('land');
    setFalling(false);
    if (el) motion(el, { scaleY: [0.82, 1], scaleX: [1.12, 1] }, { duration: 0.18, ease: [0.16, 1, 0.3, 1] });
    const line = lineAt(grid, r, c, who);
    if (line || isFull(grid)) { setResult({ winner: line ? who : null, line }); return 'over'; }
    return 'ok';
  };

  const play = async (c) => {
    if (busy.current || result || (!duo && turn !== 'light') || dropRow(grid, c) < 0) return;
    busy.current = true;
    if (duo) {
      if ((await drop(c, turn)) === 'ok') setTurn(turn === 'light' ? 'dark' : 'light');
    } else if ((await drop(c, 'light')) === 'ok') {
      setTurn('dark');
      await wait(380);
      if ((await drop(botColumn(grid, 'dark', 'light', depth), 'dark')) === 'ok') setTurn('light');
    }
    busy.current = false;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setCol((c) => Math.max(0, c - 1)); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setCol((c) => Math.min(COLS - 1, c + 1)); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(col); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const won = (r, c) => result?.line?.some(([a, b]) => a === r && b === c);
  const name = (w) => duo?.names[w === 'light' ? 0 : 1];
  const mine = duo || turn === 'light';
  const status = duo ? t('game.turnOf', 'Turno de {name}', { name: name(turn) }) : turn === 'light' ? t('c4.yourTurn', 'Tu turno: elige columna') : t('mini.botThinks', 'Piensa el bot…');

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.connect4.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="c4" ref=${boardRef} style=${{ '--cols': COLS, '--rows': ROWS }} role="grid" aria-label=${t('c4.board', 'Tablero de Conecta 4')}>
            ${Array.from({ length: COLS }, (_, c) => {
              const land = dropRow(grid, c); // casilla donde caería la próxima ficha de esta columna
              return html`<button class=${'c4-col' + (c === col && !result ? ' on' : '')} aria-label=${t('c4.column', 'Columna {n}', { n: c + 1 })}
                disabled=${!!result || !mine || land < 0} onPointerEnter=${() => setCol(c)} onClick=${() => play(c)}>
                ${Array.from({ length: ROWS }, (_, r) => html`<span class="c4-cell" data-cell=${r + '-' + c}>
                  ${grid[r][c] && html`<i class=${'c4-token side-' + grid[r][c] + (won(r, c) ? ' won' : '')}></i>`}
                  ${!grid[r][c] && r === land && c === col && mine && !result && !falling && html`<i class=${'c4-ghost side-' + turn}></i>`}</span>`)}
              </button>`;
            })}
          </div>
        </div>
        <div class="mini-side">
          ${!result && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${result && html`<${MiniEnd} win=${result.winner === 'light'} title=${result.winner ? undefined : t('c4.draw', 'Empate')}
            note=${duo ? (result.winner ? t('c4.duoWin', '{name} conecta cuatro.', { name: name(result.winner) }) : t('c4.full', 'Tablero lleno: nadie conectó cuatro.')) : result.winner === 'light' ? t('c4.won', 'Cuatro en línea antes que el bot.') : result.winner === 'dark' ? t('c4.lost', 'El bot conectó cuatro antes que tú.') : t('c4.full', 'Tablero lleno: nadie conectó cuatro.')}
            label=${endLabel} onEnd=${() => onEnd(result.winner === 'light')} />`}
          ${duo ? html`<p class="mini-help">${t('c4.duoHelp', 'Por turnos en la misma pantalla: {a} marfil, {b} carmesí.', { a: duo.names[0], b: duo.names[1] })}</p>` : html`<${MiniTools} mini="connect4" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('connect4.help', 'Elige columna con las flechas o pasando el ratón, y suelta la ficha con Enter o un toque. Ganas al conectar cuatro en línea antes que el carmesí.')}<//>`}
        </div>
      </div>
    </div>
  </div>`;
}
