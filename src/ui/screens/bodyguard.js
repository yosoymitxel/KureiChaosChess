import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, reduced } from '../hop.js';
import { SIZE, DIFFS, newBodyguard, legal, move } from '../../game/bodyguard.js';

export function BodyguardScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBodyguard(diff || settings.miniDiff?.bodyguard));
  const [, redraw] = useState(0);
  const [sel, setSel] = useState('king');
  const gridRef = useRef(null);
  const events = useRef([]);
  useEffect(() => {
    if (!events.current.length) return;
    const pending = events.current.splice(0);
    const grid = gridRef.current;
    if (!grid || reduced()) return;
    for (const ev of pending) {
      const cell = grid.children[ev.to.row * SIZE + ev.to.col];
      const token = cell?.querySelector('.bm-pc');
      if (token) hopPiece(grid, token, { from: ev.from, to: ev.to, side: ev.id === 'assailant' ? 'dark' : 'light', cols: SIZE, rows: SIZE });
    }
  });
  const tap = (r, c) => {
    if (s.over) return;
    const own = s.pieces.find((p) => p.color === 'light' && p.row === r && p.col === c);
    if (own) { setSel(own.id); return; }
    const m = legal(s, s.pieces.find((p) => p.id === sel)).find((x) => x.row === r && x.col === c);
    if (!m || !move(s, sel, r, c)) return;
    events.current = s.events.slice();
    setSel(s.pieces.some((p) => p.id === sel) ? sel : 'king');
    redraw((n) => n + 1);
  };
  const targets = legal(s, s.pieces.find((p) => p.id === sel));
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    const valid = targets.some((m) => m.row === r && m.col === c);
    return { cls: [valid && 'mv', p?.color === 'dark' && 'foe', p?.id === sel && 'sel'].filter(Boolean).join(' '), piece: p && { type: p.type, side: p.color } };
  };
  return html`<div class="screen mini">
    <${Topbar} title="El guardaespaldas" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <div class="mini-stats" aria-live="polite">
        <span class="chip"><${Icon} name="guard" size=${12} /> Aguanta ${s.turns} turnos</span>
        <span class="chip">Protege al rey marfil</span>
      </div>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El guardaespaldas" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap} />
      <p class="mini-status">Seleccionada: ${sel === 'king' ? 'rey' : 'escolta'}. Toca una pieza y después su destino.</p>
      <${MiniTools} mini="bodyguard" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Mueve el rey o su torre escolta. El rey carmesí avanza una casilla hacia tu rey después de cada jugada. Sobrevive el número de turnos indicado o captura al atacante; si cae tu rey, pierdes.<//>
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'El rey sobrevivió o capturaste al atacante.' : 'El atacante alcanzó al rey.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
