import { html, useState, useEffect } from '../lib.js';
import { Topbar } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { SIZE, newBomber, step } from '../../game/bomber.js';

const KEYS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

export function BomberScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [s, setS] = useState(newBomber);
  const [, tick] = useState(0);
  const act = (a) => { if (step(s, a)) tick((n) => n + 1); };
  const tap = (r, c) => {
    const dr = r - s.player.r, dc = c - s.player.c;
    if (!dr && !dc) act({ bomb: true });
    else if (Math.abs(dr) + Math.abs(dc) === 1) act({ move: [dr, dc] });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (KEYS[e.key]) { e.preventDefault(); act({ move: KEYS[e.key] }); }
      else if (e.key === ' ' || e.key === 'b') { e.preventDefault(); act({ bomb: true }); }
      else if (e.key === 'Enter') act({ wait: true });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const at = (list, r, c) => list.find((x) => (x.r ?? x[0]) === r && (x.c ?? x[1]) === c);
  const status = s.over === 'win' ? '¡Tablero limpio! Ganas.' : s.over === 'lose' ? 'Te alcanzó la explosión o un enemigo.'
    : `Quedan ${s.enemies.length}. Toca una casilla vecina para moverte, tu casilla para poner bomba.`;

  return html`<div class="screen mini">
    <${Topbar} title="Bomberman" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <div class="bm" style=${{ '--n': SIZE }} role="grid" aria-label="Tablero de Bomberman">
        ${s.cells.map((row, r) => row.map((cell, c) => {
          const bomb = at(s.bombs, r, c), foe = at(s.enemies, r, c), me = s.player.r === r && s.player.c === c;
          return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (cell ? ' ' + cell : '') + (at(s.blast, r, c) ? ' blast' : '')}
            disabled=${!!s.over} aria-label=${`Fila ${r + 1}, columna ${c + 1}`} onClick=${() => tap(r, c)}>
            ${bomb && html`<span class="bm-bomb">${bomb.t}</span>`}
            ${foe && html`<span class="bm-pc side-dark" dangerouslySetInnerHTML=${{ __html: pieceSVG(foe.type) }} />`}
            ${me && html`<span class="bm-pc side-light" dangerouslySetInnerHTML=${{ __html: pieceSVG('king') }} />`}
          </button>`;
        }))}
      </div>
      ${s.over ? html`<button class="btn primary" onClick=${() => onEnd(s.over === 'win')}>${endLabel}</button>`
        : html`<div class="bm-actions">
          <button class="btn sm" onClick=${() => act({ bomb: true })}><${Icon} name="collapse" size=${16} />Bomba</button>
          <button class="btn sm ghost" onClick=${() => act({ wait: true })}>Esperar</button>
        </div>`}
    </div>
  </div>`;
}
