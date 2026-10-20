import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { hopPiece } from '../hop.js';
import { playSfx } from '../sfx.js';
import { N, DIFFS, newBarrier, act, steps, canWall, botAction } from '../../game/barrier.js';

const KEYS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
const anchor = (o, r, c) => ({ o, r: Math.min(r, N - 2), c: Math.min(c, N - 2) });

export function BarrierScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBarrier(diff || settings.miniDiff?.barrier));
  const [mode, setMode] = useState('move');
  const [ghost, setGhost] = useState(null);
  const [, tick] = useState(0);
  const gridRef = useRef(null);
  const last = useRef(null);
  // Cada peón que cambia de casilla entre repintados salta con su charco, turno tras turno.
  useEffect(() => {
    const was = last.current;
    last.current = { light: { ...s.pos.light }, dark: { ...s.pos.dark } };
    const grid = gridRef.current;
    if (!grid || !was) return;
    for (const side of ['light', 'dark']) {
      const now = last.current[side], b = was[side];
      if (now.r === b.r && now.c === b.c) continue;
      hopPiece(grid, grid.children[now.r * N + now.c]?.querySelector('.bm-pc'), { from: b, to: { row: now.r, col: now.c }, side, cols: N, rows: N });
    }
  });

  const play = (action) => {
    if (s.turn !== 'light' || !act(s, action)) return playSfx('invalid');
    if (action.wall) playSfx('land');
    setGhost(null); setMode('move'); tick((n) => n + 1);
    setTimeout(() => {
      while (!s.over && s.turn === 'dark') { const a = botAction(s); if (!a || !act(s, a)) break; if (a.wall) playSfx('land'); }
      tick((n) => n + 1);
    }, 420);
  };
  const tap = (r, c) => (mode === 'move' ? play({ move: { r, c } }) : play({ wall: anchor(mode, r, c) }));

  // Ratón y dedo por igual: al apretar se muestra la valla (o se levanta el peón), al arrastrar
  // la valla sigue al dedo y al soltar se pone (o el peón va a esa casilla). Un toque corto es lo mismo.
  const [drag, setDrag] = useState(null); // { r, c } bajo el dedo mientras se arrastra
  const cellAt = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.br-cell');
    return el && gridRef.current?.contains(el) ? { r: +el.dataset.r, c: +el.dataset.c } : null;
  };
  const down = (e) => {
    if (s.over || s.turn !== 'light' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const at = cellAt(e);
    if (!at) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(at);
    if (mode !== 'move') setGhost(anchor(mode, at.r, at.c));
  };
  const moveTo = (e) => {
    const at = cellAt(e);
    if (!at) return;
    if (drag) setDrag(at);
    if (mode !== 'move' && (drag || e.pointerType === 'mouse')) setGhost(anchor(mode, at.r, at.c));
  };
  const up = (e) => {
    if (!drag) return;
    const at = cellAt(e) || drag, me = s.pos.light;
    setDrag(null);
    if (mode === 'move' && at.r === me.r && at.c === me.c) return; // tocar el propio peón no es jugada
    tap(at.r, at.c);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!KEYS[e.key]) return;
      e.preventDefault();
      // Hacia el rival pegado, la flecha salta (recto si se puede; si no, la primera diagonal).
      const [dr, dc] = KEYS[e.key], m = steps(s, 'light').find((x) => x.dr === dr && x.dc === dc);
      if (m) play({ move: { r: m.r, c: m.c } });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const reach = new Set(s.turn === 'light' && mode === 'move' && !s.over ? steps(s, 'light').map((m) => m.r * N + m.c) : []);
  const wallEl = (w, cls) => html`<i class=${'br-wall ' + w.o + ' ' + cls} style=${{ '--r': w.r, '--c': w.c }}></i>`;
  const status = s.turn === 'light' ? (mode === 'move' ? 'Mueve tu peón a la fila de arriba o pon una valla.' : 'Toca una casilla: la valla se pone en su borde.') : 'Piensa el bot…';

  return html`<div class="screen mini">
    <${Topbar} title="Barrera" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class=${'br' + (drag && mode === 'move' ? ' lifting' : '')} ref=${gridRef} style=${{ '--n': N }}
            onPointerDown=${down} onPointerMove=${moveTo} onPointerUp=${up} onPointerCancel=${() => setDrag(null)} onPointerLeave=${(e) => e.pointerType === 'mouse' && !drag && setGhost(null)}>
            ${Array.from({ length: N * N }, (_, i) => {
              const r = Math.floor(i / N), c = i % N;
              const who = ['light', 'dark'].find((k) => s.pos[k].r === r && s.pos[k].c === c);
              const aim = drag && mode === 'move' && drag.r === r && drag.c === c && reach.has(i);
              return html`<button class=${'br-cell' + (reach.has(i) ? ' mv' : '') + (aim ? ' aim' : '') + (r === 0 ? ' goal-light' : r === N - 1 ? ' goal-dark' : '')}
                data-r=${r} data-c=${c} disabled=${!!s.over || s.turn !== 'light'} aria-label=${`Fila ${r + 1}, columna ${c + 1}`}
                onClick=${(e) => e.detail === 0 && tap(r, c)}>
                ${who && html`<span class=${'bm-pc side-' + who} dangerouslySetInnerHTML=${{ __html: pieceSVG('pawn') }} />`}
              </button>`;
            })}
            ${s.walls.map((w) => wallEl(w, ''))}
            ${ghost && wallEl(ghost, canWall(s, ghost) ? 'ghost' : 'ghost bad')}
          </div>
        </div>
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'light'} note=${s.over === 'light' ? 'Tu peón cruzó antes que el carmesí.' : 'El peón carmesí cruzó primero.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'light')} />`
            : html`<div class="bm-actions" role="group" aria-label="Acción">
              <button class=${'btn sm' + (mode === 'move' ? ' on' : ' ghost')} aria-pressed=${mode === 'move'} onClick=${() => { setMode('move'); setGhost(null); }}>Mover</button>
              <button class=${'btn sm' + (mode === 'h' ? ' on' : ' ghost')} aria-pressed=${mode === 'h'} disabled=${!s.left.light} onClick=${() => setMode('h')}>Valla ─</button>
              <button class=${'btn sm' + (mode === 'v' ? ' on' : ' ghost')} aria-pressed=${mode === 'v'} disabled=${!s.left.light} onClick=${() => setMode('v')}>Valla │</button>
            </div>
            <div class="mini-stats" aria-live="polite">
              <span class="chip" title="Tus vallas"><${Icon} name="fence" size=${13} />Tú <b>${s.left.light}</b></span>
              <span class="chip" title="Vallas del bot"><${Icon} name="fence" size=${13} />Bot <b>${s.left.dark}</b></span>
            </div>`}
          <${MiniTools} mini="barrier" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Cruza a la fila de arriba antes que el peón carmesí, que baja hacia la suya. Muévete con las flechas o tocando una casilla, o gasta una valla para cerrar un borde.<//>
        </div>
      </div>
    </div>
  </div>`;
}
