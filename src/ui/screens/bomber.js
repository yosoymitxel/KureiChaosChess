import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { SIZE, newBomber, step, blastOf } from '../../game/bomber.js';
import { hopPiece } from '../hop.js';

// Arrows and WASD both move; space or B drops a bomb, Enter waits.
const KEYS = { arrowup: [-1, 0], w: [-1, 0], arrowdown: [1, 0], s: [1, 0], arrowleft: [0, -1], a: [0, -1], arrowright: [0, 1], d: [0, 1] };
const PAD = [[-1, 0, 'up', 'Arriba', '↑'], [0, -1, 'left', 'Izquierda', '←'], [0, 1, 'right', 'Derecha', '→'], [1, 0, 'down', 'Abajo', '↓']];

export function BomberScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s, setS] = useState(newBomber);
  const [, tick] = useState(0);
  const gridRef = useRef(null);
  const hops = useRef(null); // saltos del último tic: quién se movió y de dónde a dónde

  const snap = () => ({ player: { row: s.player.r, col: s.player.c }, enemies: s.enemies.map((e) => ({ id: e.id, row: e.r, col: e.c })) });
  const act = (a) => {
    const before = snap();
    if (!step(s, a)) return;
    const after = snap(), moved = [];
    if (after.player.row !== before.player.row || after.player.col !== before.player.col) moved.push({ sel: '.bm-pc.me', from: before.player, to: after.player, side: 'light' });
    for (const e of after.enemies) {
      const was = before.enemies.find((b) => b.id === e.id);
      if (was && (was.row !== e.row || was.col !== e.col)) moved.push({ sel: `.bm-pc.foe[data-id="${e.id}"]`, from: was, to: e, side: 'dark' });
    }
    hops.current = moved;
    tick((n) => n + 1);
  };
  const tap = (r, c) => {
    const dr = r - s.player.r, dc = c - s.player.c;
    if (!dr && !dc) act({ bomb: true });
    else if (Math.abs(dr) + Math.abs(dc) === 1) act({ move: [dr, dc] });
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (KEYS[k]) { e.preventDefault(); act({ move: KEYS[k] }); }
      else if (k === ' ' || k === 'b') { e.preventDefault(); act({ bomb: true }); }
      else if (e.key === 'Enter') act({ wait: true });
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
    for (const m of moved) hopPiece(grid, grid?.querySelector(m.sel), { ...m, cols: SIZE, rows: SIZE });
  });

  const at = (list, r, c) => list.find((x) => (x.r ?? x[0]) === r && (x.c ?? x[1]) === c);
  // Casillas que estallan en la próxima jugada: la bomba con la mecha a 1 muestra a dónde llega.
  const danger = new Set(s.bombs.filter((b) => b.t <= 1).flatMap((b) => blastOf(s, b)).map((x) => x.r * SIZE + x.c));
  const status = `Quedan ${s.enemies.length} enemigos · bombas ${s.bombs.length}/${s.maxBombs} · alcance ${s.range}.`;

  return html`<div class="screen mini">
    <${Topbar} title="Bomberman" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Mueve con las flechas, WASD o el mando; espacio o el botón ponen bomba. La mecha da 5 turnos para salir del radio, las casillas con borde rojo estallan en la próxima jugada y algunas cajas sueltan bomba extra o más alcance.</p></details>
      <div class="mini-stage">
        <div class="bm bm-slab" ref=${gridRef} style=${{ '--n': SIZE }} role="grid" aria-label="Tablero de Bomberman">
          ${s.cells.map((row, r) => row.map((cell, c) => {
            const bomb = at(s.bombs, r, c), foe = at(s.enemies, r, c), item = at(s.items, r, c), me = s.player.r === r && s.player.c === c;
            return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (cell ? ' ' + cell : '') + (at(s.blast, r, c) ? ' blast' : '') + (danger.has(r * SIZE + c) ? ' danger' : '')}
              disabled=${!!s.over} aria-label=${`Fila ${r + 1}, columna ${c + 1}` + (item ? (item.kind === 'bomb' ? ', bomba extra' : ', más alcance') : '')} onClick=${() => tap(r, c)}>
              ${item && html`<span class=${'bm-item bm-item-' + item.kind}><${Icon} name=${item.kind === 'bomb' ? 'collapse' : 'expand'} size=${18} /></span>`}
              ${bomb && html`<span class=${'bm-bomb' + (bomb.t <= 1 ? ' soon' : '')}>${bomb.t}</span>`}
              ${foe && html`<span class="bm-pc foe side-dark" data-id=${foe.id} dangerouslySetInnerHTML=${{ __html: pieceSVG(foe.type) }} />`}
              ${me && html`<span class="bm-pc me side-light" dangerouslySetInnerHTML=${{ __html: pieceSVG('king') }} />`}
            </button>`;
          }))}
        </div>
      </div>
      ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Tablero limpio: no queda ningún carmesí.' : 'Te alcanzó la explosión o un enemigo.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
        : html`<div class="bm-controls">
          <div class="bm-pad" role="group" aria-label="Movimiento">
            ${PAD.map(([dr, dc, cls, label, glyph]) => html`<button class=${'btn sm pad-' + cls} aria-label=${label}
              onClick=${() => act({ move: [dr, dc] })}>${glyph}</button>`)}
          </div>
          <div class="bm-actions">
            <button class="btn sm" onClick=${() => act({ bomb: true })}><${Icon} name="collapse" size=${16} />Bomba</button>
            <button class="btn sm ghost" onClick=${() => act({ wait: true })}>Esperar</button>
          </div>
        </div>`}
    </div>
  </div>`;
}
