import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { playSfx } from '../sfx.js';
import { Topbar, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { WAVES, DIFFS, newMarcianos, step } from '../../game/marcianos.js';
import { hopPiece } from '../hop.js';

// Flechas o A/D mueven el cañón; espacio dispara y S o flecha abajo esperan.
const KEYS = { arrowleft: -1, a: -1, arrowright: 1, d: 1 };
const WAIT = new Set(['s', 'arrowdown']);

export function MarcianosScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s, setS] = useState(() => newMarcianos(Math.random, diff || settings.miniDiff?.marcianos));
  const [, tick] = useState(0);
  const gridRef = useRef(null);
  const hops = useRef(null); // saltos del último tic: quién se movió y de dónde a dónde

  const snap = () => ({ player: s.player.col, enemies: s.enemies.map((e) => ({ id: e.id, row: e.row, col: e.col })) });
  const act = (a) => {
    const before = snap(), lives = s.lives;
    if (!step(s, a)) return;
    if (a.shoot) playSfx('laser');
    if (s.zaps.length) playSfx(s.lives < lives ? 'hit' : 'crunch');
    const after = snap(), moved = [];
    if (after.player !== before.player) moved.push({ sel: '.bm-pc.me', from: { row: s.playerRow, col: before.player }, to: { row: s.playerRow, col: after.player }, side: 'light' });
    for (const e of after.enemies) {
      const was = before.enemies.find((b) => b.id === e.id);
      if (was && (was.row !== e.row || was.col !== e.col)) moved.push({ sel: `.bm-pc.foe[data-id="${e.id}"]`, from: was, to: e, side: 'dark' });
    }
    hops.current = moved;
    if (s.events.some((e) => e.kind === 'horde')) banner();
    tick((n) => n + 1);
  };
  const banner = () => {
    if (!gridRef.current) return;
    const b = document.createElement('div');
    b.className = 'mini-banner';
    b.textContent = '¡Llega una gran horda!';
    gridRef.current.appendChild(b);
    motion(b, { scale: [1.4, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
    motion(b, { opacity: [1, 0] }, { duration: 0.4, delay: 1.6, onComplete: () => b.remove() });
  };
  const tap = (row, col) => {
    if (row !== s.playerRow) return;
    if (col === s.player.col) act({ shoot: true });
    else act({ move: Math.sign(col - s.player.col) });
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (KEYS[k]) { e.preventDefault(); act({ move: KEYS[k] }); }
      else if (k === ' ') { e.preventDefault(); act({ shoot: true }); }
      else if (WAIT.has(k)) { e.preventDefault(); act({ wait: true }); }
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
    for (const m of moved) hopPiece(grid, grid?.querySelector(m.sel), { ...m, cols: s.cols, rows: s.rows });
  });

  const at = (list, r, c) => list.find((x) => x.row === r && x.col === c);
  const zapped = (r, c) => s.zaps.some((z) => z.row === r && z.col === c);

  return html`<div class="screen mini">
    <${Topbar} title="Matamarcianos" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="bm bm-slab mm" ref=${gridRef} style=${{ '--cols': s.cols, '--rows': s.rows }} role="grid" aria-label="Campo de Matamarcianos">
            ${Array.from({ length: s.rows }, (_, r) => Array.from({ length: s.cols }, (_, c) => {
              const foe = at(s.enemies, r, c), shot = at(s.shots, r, c), bolt = at(s.bolts, r, c), me = r === s.playerRow && s.player.col === c;
              return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (r === 0 ? ' r0' : '') + (r === s.playerRow ? ' home' : '') + (zapped(r, c) ? ' blast' : '')}
                disabled=${!!s.over} aria-label=${`Fila ${r + 1}, columna ${c + 1}`} onClick=${() => tap(r, c)}>
                ${foe && html`<span class="bm-pc foe side-dark" data-id=${foe.id} dangerouslySetInnerHTML=${{ __html: pieceSVG(foe.type) }} />`}
                ${shot && html`<span class="mm-shot"></span>`}
                ${bolt && html`<span class="mm-bolt"></span>`}
                ${me && html`<span class="bm-pc me side-light" dangerouslySetInnerHTML=${{ __html: pieceSVG('cannon') }} />`}
              </button>`;
            }))}
          </div>
        </div>
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="chip"><${Icon} name="invader" size=${13} />${WAVES[s.wave].horde ? 'Gran horda' : `Oleada ${s.wave + 1}/${WAVES.length - 1}`}</span>
            <span class="chip" title="Tamaño del tablero">${s.cols}×${s.rows}</span>
            <span class="chip"><${Icon} name="skull" size=${13} />${s.enemies.length === 1 ? 'Queda 1' : `Quedan ${s.enemies.length}`}</span>
            <span class="chip" aria-label=${`Vidas ${s.lives} de ${s.diff.lives}`}>Vidas <span class="mm-lives">${Array.from({ length: s.diff.lives }, (_, i) => html`<i class=${i < s.lives ? 'on' : ''}></i>`)}</span></span>
          </div>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Cayó la gran horda y ni un carmesí en pie.' : 'Los carmesíes pisaron tu fila.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-controls">
              <div class="bm-actions mm-move" role="group" aria-label="Movimiento">
                <button class="btn sm" aria-label="Izquierda" onClick=${() => act({ move: -1 })}>←</button>
                <button class="btn sm" aria-label="Derecha" onClick=${() => act({ move: 1 })}>→</button>
              </div>
              <div class="bm-actions">
                <button class="btn sm" onClick=${() => act({ wait: true })}>Esperar</button>
                <button class="btn sm primary" onClick=${() => act({ shoot: true })}><${Icon} name="cannon" size=${16} />Disparar</button>
              </div>
            </div>`}
          <${MiniTools} mini="marcianos" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Mueve con las flechas o A/D, dispara con espacio y espera con S. Cada pieza baja a su manera: el peón recto, el caballo cambiando de columna, el alfil en diagonal y el elefante a veces de dos en dos. Desde la segunda oleada disparan proyectiles: apártate de su columna. Tras tres oleadas llega la gran horda; si un carmesí pisa tu fila, pierdes una vida.<//>
        </div>
      </div>
    </div>
  </div>`;
}
