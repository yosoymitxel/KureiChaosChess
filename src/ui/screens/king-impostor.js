import { html, useState, useRef, useEffect, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { popPiece } from '../hop.js';
import { SIZE, DIFFS, newKingImpostor, choose } from '../../game/king-impostor.js';

export function KingImpostorScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newKingImpostor(diff || settings.miniDiff?.kingImpostor));
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const lastChosen = useRef(null);
  // Cuando se elige, la pieza acusada se revela: si es el impostor, se muestra como zombi y brota.
  const tap = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    if (!p || p.color !== 'dark') return;
    if (choose(s, p.id)) {
      lastChosen.current = p.id;
      redraw((n) => n + 1);
      setTimeout(() => {
        const grid = gridRef.current;
        const el = grid?.children?.[p.row * SIZE + p.col]?.querySelector('.bm-pc');
        if (!el) return;
        // Acierto: el impostor enseña la piel zombi y brota. Fallo: la acusada tiembla.
        if (p.id === s.impostor) popPiece(grid, el);
        else motion(el, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.36, ease: 'easeInOut' });
      }, 30);
    }
  };
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    const isImpostor = s.over && p?.id === s.impostor;
    const side = isImpostor ? 'zombie' : (p?.color || 'light');
    return { cls: [p?.color === 'dark' && 'mv', p?.id === s.chosen && 'sel', s.revealed?.has(p?.id) && 'suspect-revealed', isImpostor && 'impostor'].filter(Boolean).join(' '), piece: p && { type: p.type, side } };
  };
  return html`<div class="screen mini"><${Topbar} title="El rey impostor" sub=${sub} onBack=${onBack}/><div class="mini-body">
    <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="target" size=${12}/> Intentos: ${s.turns}</span><span class="chip">${s.pieces.filter(p => p.color === "dark").length} sospechosos · ${s.diff.name}</span></div>
    <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El rey impostor" boardClass="bm-slab" gridRef=${gridRef} onTap=${tap}/>
    <${MiniTools} mini="kingImpostor" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${s.clue} Identifica al sospechoso que coincide con esa pista. Solo tienes un intento en Dif�cil, dos en Normal y tres en F�cil; una elecci�n incorrecta consume un intento.<//>
    ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Impostor identificado.' : 'Acusaste a la pieza equivocada.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
  </div></div>`;
}
