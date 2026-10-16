import { html, useState, useEffect } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { pieceSVG } from '../../view/piece-art.js';
import { N, newBarrier, act, steps, canWall, botAction } from '../../game/barrier.js';

const KEYS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
const anchor = (o, r, c) => ({ o, r: Math.min(r, N - 2), c: Math.min(c, N - 2) });

export function BarrierScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s] = useState(newBarrier);
  const [mode, setMode] = useState('move');
  const [ghost, setGhost] = useState(null);
  const [, tick] = useState(0);

  const play = (action) => {
    if (s.turn !== 'light' || !act(s, action)) return;
    setGhost(null); setMode('move'); tick((n) => n + 1);
    setTimeout(() => {
      while (!s.over && s.turn === 'dark') { const a = botAction(s); if (!a || !act(s, a)) break; }
      tick((n) => n + 1);
    }, 420);
  };
  const tap = (r, c) => (mode === 'move' ? play({ move: { r, c } }) : play({ wall: anchor(mode, r, c) }));

  useEffect(() => {
    const onKey = (e) => {
      if (!KEYS[e.key]) return;
      e.preventDefault();
      const p = s.pos.light;
      play({ move: { r: p.r + KEYS[e.key][0], c: p.c + KEYS[e.key][1] } });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const reach = new Set(s.turn === 'light' && mode === 'move' && !s.over ? steps(s, 'light').map((m) => m.r * N + m.c) : []);
  const wallEl = (w, cls) => html`<i class=${'br-wall ' + w.o + ' ' + cls} style=${{ '--r': w.r, '--c': w.c }}></i>`;
  const status = s.turn === 'light' ? (mode === 'move' ? 'Mueve tu peón a la fila de arriba o pon una valla.' : 'Toca una casilla: la valla se pone en su borde.') : 'Piensa el bot…';

  return html`<div class="screen mini">
    <${Topbar} title="Barrera" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <p class="mini-help">Cruza a la fila de arriba antes que el peón carmesí, que baja hacia la suya. Muévete con las flechas o tocando una casilla, o gasta una valla para cerrar un borde.</p>
      <div class="br" style=${{ '--n': N }}>
        ${Array.from({ length: N * N }, (_, i) => {
          const r = Math.floor(i / N), c = i % N;
          const who = ['light', 'dark'].find((k) => s.pos[k].r === r && s.pos[k].c === c);
          return html`<button class=${'br-cell' + (reach.has(i) ? ' mv' : '') + (r === 0 ? ' goal-light' : r === N - 1 ? ' goal-dark' : '')}
            disabled=${!!s.over || s.turn !== 'light'} aria-label=${`Fila ${r + 1}, columna ${c + 1}`}
            onPointerEnter=${() => mode !== 'move' && setGhost(anchor(mode, r, c))} onClick=${() => tap(r, c)}>
            ${who && html`<span class=${'bm-pc side-' + who} dangerouslySetInnerHTML=${{ __html: pieceSVG('pawn') }} />`}
          </button>`;
        })}
        ${s.walls.map((w) => wallEl(w, ''))}
        ${ghost && wallEl(ghost, canWall(s, ghost) ? 'ghost' : 'ghost bad')}
      </div>
      ${s.over ? html`<${MiniEnd} win=${s.over === 'light'} note=${s.over === 'light' ? 'Tu peón cruzó antes que el carmesí.' : 'El peón carmesí cruzó primero.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'light')} />`
        : html`<div class="bm-actions" role="group" aria-label="Acción">
          <button class=${'btn sm' + (mode === 'move' ? ' on' : ' ghost')} aria-pressed=${mode === 'move'} onClick=${() => { setMode('move'); setGhost(null); }}>Mover</button>
          <button class=${'btn sm' + (mode === 'h' ? ' on' : ' ghost')} aria-pressed=${mode === 'h'} disabled=${!s.left.light} onClick=${() => setMode('h')}>Valla ─</button>
          <button class=${'btn sm' + (mode === 'v' ? ' on' : ' ghost')} aria-pressed=${mode === 'v'} disabled=${!s.left.light} onClick=${() => setMode('v')}>Valla │</button>
        </div>
        <p class="br-left">Vallas: tú ${s.left.light} · bot ${s.left.dark}</p>`}
    </div>
  </div>`;
}
