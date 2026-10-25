import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece } from '../hop.js';
import { SIZE, DIFFS, newLaboratory, legal, move } from '../../game/laboratory.js';
import { MUTATIONS } from '../../data/mutations.js';

export function LaboratoryScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newLaboratory(diff || settings.miniDiff?.laboratory));
  const [, redraw] = useState(0);
  const targets = legal(s);
  const gridRef = useRef(null);
  const hop = useRef(null);
  const mut = MUTATIONS[s.diff.mutation] || { name: s.diff.mutation, desc: '' };

  const tap = (r, c) => {
    const from = { row: s.pieces[0].row, col: s.pieces[0].col };
    if (s.over || !targets.some((m) => m.row === r && m.col === c)) return;
    if (move(s, r, c)) {
      hop.current = { from, to: { row: r, col: c } };
      redraw((n) => n + 1);
    }
  };

  useEffect(() => {
    const h = hop.current;
    if (!h) return;
    hop.current = null;
    const grid = gridRef.current;
    const piece = grid?.children[h.to.row * SIZE + h.to.col]?.querySelector('.bm-pc');
    hopPiece(grid, piece, { ...h, side: 'light', cols: SIZE, rows: SIZE });
  });

  const cell = (r, c) => {
    const p = s.pieces[0], k = r + ',' + c;
    const atExit = s.exit.row === r && s.exit.col === c;
    const valid = targets.some((m) => m.row === r && m.col === c);
    const sample = s.samples.has(k);
    return {
      cls: [
        valid && 'mv',
        atExit && 'exit',
        atExit && (s.samples.size ? 'locked' : 'target'),
        sample && 'sample',
        s.board.holes.has(k) && 'hole',
      ].filter(Boolean).join(' '),
      piece: p.row === r && p.col === c ? { type: p.type, side: p.color } : null,
      tok: sample,
      ariaLabel: `Fila ${r + 1}, columna ${c + 1}${sample ? ', muestra' : ''}${atExit ? (s.samples.size ? ', salida bloqueada' : ', salida') : ''}${valid ? ', jugada disponible' : ''}`,
    };
  };

  const collected = s.sampleTotal - s.samples.size;
  return html`<div class="screen mini">
    <${Topbar} title="El laboratorio" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <div class="mini-stats" aria-live="polite">
        <span class="chip"><${Icon} name="target" size=${12} /> Muestras: ${collected}/${s.sampleTotal}</span>
        <span class="chip">Jugadas: ${s.turns}</span>
        <span class="chip">Ruta ${s.variant.id}</span>
      </div>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El laboratorio" boardClass="bm-slab" gridRef=${gridRef} onTap=${tap} />
      <${MiniTools} mini="laboratory" title="El laboratorio" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>
        Prueba <b>${mut.name}</b>: recoge ${s.sampleTotal} ${s.sampleTotal === 1 ? 'muestra' : 'muestras'} y llega a la salida dorada. Cada casilla que abandonas se convierte en un agujero.
      <//>
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Muestras recuperadas. Experimento completado.' : 'Sin jugadas o turnos: la muestra quedó fuera de alcance.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
