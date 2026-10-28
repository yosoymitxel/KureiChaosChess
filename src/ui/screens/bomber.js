import { html, useState, useEffect, useLayoutEffect, useRef, motion } from '../lib.js';
import { Fx } from '../../view/fx.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { newBomber, step, blastOf, doorOpen, DIFFS, FOES } from '../../game/bomber.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { hopPiece, reduced } from '../hop.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t, tp } from '../../i18n/index.js';

// Arrows and WASD both move; space or B drops a bomb, Enter waits.
const KEYS = { arrowup: [-1, 0], w: [-1, 0], arrowdown: [1, 0], s: [1, 0], arrowleft: [0, -1], a: [0, -1], arrowright: [0, 1], d: [0, 1] };
const PAD = [[-1, 0, 'up', t('dir.up', 'Arriba'), '↑'], [0, -1, 'left', t('marcianos.left2', 'Izquierda'), '←'], [0, 1, 'right', t('marcianos.right', 'Derecha'), '→'], [1, 0, 'down', t('dir.down', 'Abajo'), '↓']];

export function BomberScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s, setS] = useState(() => newBomber(Math.random, diff || settings.miniDiff?.bomber, { tall: innerHeight > innerWidth }));
  const [, tick] = useState(0);
  const gridRef = useRef(null);
  const hops = useRef(null); // saltos del último tic: quién se movió y de dónde a dónde
  const booms = useRef(null), fxRef = useRef(null);

  const snap = () => ({ player: { row: s.player.r, col: s.player.c }, enemies: s.enemies.map((e) => ({ id: e.id, row: e.r, col: e.c })) });
  const act = (a) => {
    const before = snap(), bombsBefore = s.bombs.slice();
    if (!step(s, a)) return;
    // Las bombas que ya no están estallaron este tic: el efecto nace en su casilla.
    booms.current = bombsBefore.filter((b) => !s.bombs.includes(b)).map((b) => ({ r: b.r, c: b.c }));
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
    fxRef.current = new Fx(gridRef.current);
    return () => fxRef.current.destroy();
  }, []);
  useLayoutEffect(() => {
    const grid = gridRef.current, fx = fxRef.current;
    if (booms.current?.length && fx && !reduced()) {
      // Estalla como cae un rey en el tablero (fx.bigBoom) y el fuego corre por la cruz casilla a casilla.
      const cw = grid.children[0].offsetWidth, scale = cw / 40;
      for (const { r, c } of booms.current) {
        const p = fx.pointOf(grid.children[r * s.cols + c]);
        fx.bigBoom(p.x, p.y, { scale: scale * 0.8, radius: cw * 2.5 });
        for (const [br, bc] of s.blast) {
          const d = Math.abs(br - r) + Math.abs(bc - c);
          if (!d) continue;
          const q = fx.pointOf(grid.children[br * s.cols + bc]);
          setTimeout(() => fx.explosion(q.x, q.y, scale * 0.45), d * 45);
        }
      }
      if (settings.shake) motion(grid, { x: [0, -12, 10, -7, 4, 0], y: [0, 6, -7, 3, 0] }, { duration: 0.5 });
    }
    booms.current = null;
    const moved = hops.current;
    if (!moved?.length) return;
    hops.current = null;
    for (const m of moved) hopPiece(grid, grid?.querySelector(m.sel), { ...m, cols: s.cols, rows: s.rows });
  });

  const at = (list, r, c) => list.find((x) => (x.r ?? x[0]) === r && (x.c ?? x[1]) === c);
  // Casillas que estallan en la próxima jugada: la bomba con la mecha a 1 muestra a dónde llega.
  const danger = new Set(s.bombs.filter((b) => b.t <= 1).flatMap((b) => blastOf(s, b)).map((x) => x.r * s.cols + x.c));
  const left = s.enemies.length, open = doorOpen(s);
  const mine = s.bombs.filter((b) => !b.foe).length;
  const status = left
    ? tp('bomber.left', left, 'Queda {n} enemigo', 'Quedan {n} enemigos') + ' · ' + t('bomber.stats', 'bombas {b}/{max} · alcance {r}', { b: mine, max: s.maxBombs, r: s.range }) + (open ? t('bomber.doorSeen', ' · la puerta ya está a la vista') : '') + '.'
    : open ? t('bomber.clearOpen', 'Arena limpia: corre a la puerta.') : t('bomber.clearHidden', 'Arena limpia: la puerta sigue bajo alguna caja.');
  const kinds = [...new Set(s.diff.roster)];

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.bomber.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="bm bm-slab" ref=${gridRef} style=${{ '--rows': s.rows, '--cols': s.cols }} role="grid" aria-label=${t('bomber.board', 'Tablero de Bomberman')}>
            ${s.cells.map((row, r) => row.map((cell, c) => {
              const bomb = at(s.bombs, r, c), foe = at(s.enemies, r, c), item = at(s.items, r, c), me = s.player.r === r && s.player.c === c;
              const door = open && s.door.r === r && s.door.c === c;
              return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (r === 0 ? ' r0' : '') + (cell ? ' ' + cell : '') + (door ? ' door' + (left ? '' : ' live') : '') + (at(s.blast, r, c) ? ' blast' : '') + (danger.has(r * s.cols + c) ? ' danger' : '')}
                disabled=${!!s.over} aria-label=${t('mini.cell', 'Fila {r}, columna {c}', { r: r + 1, c: c + 1 }) + (door ? t('bomber.door', ', puerta de salida') : '') + (item ? (item.kind === 'bomb' ? t('bomber.extraBomb', ', bomba extra') : t('bomber.moreRange', ', más alcance')) : '')} onClick=${() => tap(r, c)}>
                ${door && html`<span class="bm-door" aria-hidden="true"></span>`}
                ${item && html`<span class=${'bm-item bm-item-' + item.kind}><${Icon} name=${item.kind === 'bomb' ? 'bomb' : 'expand'} size=${18} /></span>`}
                ${bomb && html`<span class=${'bm-bomb' + (bomb.t <= 1 ? ' soon' : '') + (bomb.foe ? ' foe' : '')}>${bomb.t}</span>`}
                ${foe && html`<span class="bm-pc foe side-dark" data-id=${foe.id} dangerouslySetInnerHTML=${{ __html: pieceSVG(foe.type) }} />`}
                ${me && html`<span class="bm-pc me side-light" dangerouslySetInnerHTML=${{ __html: pieceSVG('king') }} />`}
              </button>`;
            }))}
          </div>
        </div>
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('bomber.won', 'Arena limpia y por la puerta: nivel superado.') : t('bomber.lost', 'Te alcanzó la explosión o un enemigo.')} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-controls">
              <div class="bm-pad" role="group" aria-label=${t('game.movement', 'Movimiento')}>
                ${PAD.map(([dr, dc, cls, label, glyph]) => html`<button class=${'btn sm pad-' + cls} aria-label=${label}
                  onClick=${() => act({ move: [dr, dc] })}>${glyph}</button>`)}
              </div>
              <div class="bm-actions">
                <button class="btn sm" data-pad="x" onClick=${() => act({ bomb: true })}><${Icon} name="collapse" size=${16} />${t('bomber.bomb', 'Bomba')}</button>
                <button class="btn sm ghost" data-pad="y" onClick=${() => act({ wait: true })}>${t('marcianos.wait', 'Esperar')}</button>
              </div>
            </div>`}
          <${MiniTools} mini="bomber" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('bomber.help', 'Mueve con las flechas, WASD o el mando; espacio o el botón ponen bomba. La mecha da 5 turnos para salir del radio, las casillas con borde rojo estallan en la próxima jugada y algunas cajas sueltan bomba extra o más alcance. Como en el original, la puerta de salida está escondida bajo una caja: derriba a todos los enemigos y entra por ella. Enemigos de este nivel: {foes}.', { foes: kinds.map((k) => `${PIECE_NAMES[k].toLowerCase()} (${FOES[k].replace(/\.$/, '').toLowerCase()})`).join('; ') })}<//>
        </div>
      </div>
    </div>
  </div>`;
}
