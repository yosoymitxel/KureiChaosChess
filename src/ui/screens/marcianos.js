import { html, useState, useEffect, useLayoutEffect, useRef, motion } from '../lib.js';
import { playSfx } from '../sfx.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { WAVES, DIFFS, newMarcianos, step } from '../../game/marcianos.js';
import { hopPiece } from '../hop.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { Fx } from '../../view/fx.js';
import { t, tp } from '../../i18n/index.js';

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Flechas o A/D mueven el cañón; espacio dispara y S o flecha abajo esperan.
const KEYS = { arrowleft: -1, a: -1, arrowright: 1, d: 1 };
const WAIT = new Set(['s', 'arrowdown']);

export function MarcianosScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s, setS] = useState(() => newMarcianos(Math.random, diff || settings.miniDiff?.marcianos));
  const [, tick] = useState(0);
  const gridRef = useRef(null);
  const hops = useRef(null); // saltos del último tic: quién se movió y de dónde a dónde
  const shots = useRef(null); // disparo de este tic: { col, hit } para el rayo del cañón
  const fx = useRef(null);
  useEffect(() => () => fx.current?.destroy(), []);

  const snap = () => ({ player: s.player.col, enemies: s.enemies.map((e) => ({ id: e.id, row: e.row, col: e.col })) });
  const act = (a) => {
    const before = snap(), lives = s.lives;
    if (!step(s, a)) return;
    if (a.shoot) {
      playSfx('laser');
      // El rayo sube del cañón hasta lo que derriba en su columna, o hasta donde llega el proyectil.
      const zap = s.zaps.find((z) => z.col === before.player && z.row < s.playerRow);
      const ball = s.shots.find((x) => x.col === before.player);
      shots.current = { col: before.player, row: zap ? zap.row : ball ? ball.row : 0, hit: !!zap };
    }
    if (s.zaps.length) shots.current = { ...(shots.current || {}), zaps: s.zaps.slice() };
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
    b.textContent = t('mini.hordeComes', '¡Llega una gran horda!');
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
  useLayoutEffect(() => {
    const shot = shots.current, grid = gridRef.current;
    if (shot && grid) {
      shots.current = null;
      const f = (fx.current ||= new Fx(grid)), cell = (r, c) => grid.querySelector(`.bm-cell:nth-child(${r * s.cols + c + 1})`);
      if (shot.col != null) {
        const a = f.pointOf(cell(s.playerRow, shot.col), 0.3), b = f.pointOf(cell(shot.row, shot.col), 0.5);
        f.beam(a.x, a.y, b.x, b.y, { color: css('--brass'), width: 5 });
      }
      for (const z of shot.zaps || []) { const p = f.pointOf(cell(z.row, z.col)); setTimeout(() => f.debris(p.x, p.y, css(z.row === s.playerRow ? '--side-light' : '--side-dark')), 120); }
    }
    const moved = hops.current;
    if (!moved?.length) return;
    hops.current = null;
    for (const m of moved) hopPiece(grid, grid?.querySelector(m.sel), { ...m, cols: s.cols, rows: s.rows });
  });

  const at = (list, r, c) => list.find((x) => x.row === r && x.col === c);
  const zapped = (r, c) => s.zaps.some((z) => z.row === r && z.col === c);

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.marcianos.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="bm bm-slab mm" ref=${gridRef} style=${{ '--cols': s.cols, '--rows': s.rows }} role="grid" aria-label=${t('marcianos.field', 'Campo de Matamarcianos')}>
            ${Array.from({ length: s.rows }, (_, r) => Array.from({ length: s.cols }, (_, c) => {
              const foe = at(s.enemies, r, c), shot = at(s.shots, r, c), bolt = at(s.bolts, r, c), me = r === s.playerRow && s.player.col === c;
              return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (r === 0 ? ' r0' : '') + (r === s.playerRow ? ' home' : '') + (zapped(r, c) ? ' blast' : '')}
                disabled=${!!s.over} aria-label=${t('mini.cell', 'Fila {r}, columna {c}', { r: r + 1, c: c + 1 })} onClick=${() => tap(r, c)}>
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
            <span class="chip"><${Icon} name="invader" size=${13} />${WAVES[s.wave].horde ? t('mini.greatHorde', 'Gran horda') : t('marcianos.wave', 'Oleada {n}/{total}', { n: s.wave + 1, total: WAVES.length - 1 })}</span>
            <span class="chip" title=${t('marcianos.size', 'Tamaño del tablero')}>${s.cols}×${s.rows}</span>
            <span class="chip"><${Icon} name="skull" size=${13} />${tp('marcianos.left', s.enemies.length, 'Queda {n}', 'Quedan {n}')}</span>
            <span class="chip" aria-label=${t('marcianos.livesAria', 'Vidas {n} de {max}', { n: s.lives, max: s.diff.lives })}>${t('marcianos.lives', 'Vidas')} <span class="mm-lives">${Array.from({ length: s.diff.lives }, (_, i) => html`<i class=${i < s.lives ? 'on' : ''}></i>`)}</span></span>
          </div>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('marcianos.won', 'Cayó la gran horda y ni un carmesí en pie.') : t('marcianos.lost', 'Los carmesíes pisaron tu fila.')} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-controls">
              <div class="bm-actions mm-move" role="group" aria-label=${t('game.movement', 'Movimiento')}>
                <button class="btn sm" aria-label=${t('marcianos.left2', 'Izquierda')} onClick=${() => act({ move: -1 })}>←</button>
                <button class="btn sm" aria-label=${t('marcianos.right', 'Derecha')} onClick=${() => act({ move: 1 })}>→</button>
              </div>
              <div class="bm-actions">
                <button class="btn sm" data-pad="y" onClick=${() => act({ wait: true })}>${t('marcianos.wait', 'Esperar')}</button>
                <button class="btn sm primary" data-pad="x" onClick=${() => act({ shoot: true })}><${Icon} name="cannon" size=${16} />${t('marcianos.shoot', 'Disparar')}</button>
              </div>
            </div>`}
          <${MiniTools} mini="marcianos" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('marcianos.help', 'Mueve con las flechas o A/D, dispara con espacio y espera con S. Cada pieza baja a su manera: el peón recto, el caballo cambiando de columna, el alfil en diagonal y el elefante a veces de dos en dos. Desde la segunda oleada disparan proyectiles: apártate de su columna. Tras tres oleadas llega la gran horda; si un carmesí pisa tu fila, pierdes una vida.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
