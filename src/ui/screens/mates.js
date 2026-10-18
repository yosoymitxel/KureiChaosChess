import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniDiff } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, popPiece, snapPieces, pieceDiffs, fallPiece } from '../hop.js';
import { legalMoves } from '../../game/rules.js';
import { SIZE, DIFFS, board, fromSpec, play, defend, capturesKing, captureMove } from '../../game/mates.js';
import { MATES } from '../../data/mates.js';

const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
// avoid salta el problema anterior cuando la secuencia usa el mismo largo dos veces.
const load = (n, avoid) => {
  const spec = pickOne(MATES[n].filter((sp) => sp !== avoid));
  return { n, left: n, spec, pieces: fromSpec(spec) };
};

export function MatesScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const seq = (DIFFS[diff || settings.miniDiff?.mates] || DIFFS.normal).steps;
  const [at, setAt] = useState(0);
  const [st, setSt] = useState(() => load(seq[0]));
  const [sel, setSel] = useState(null);
  const [over, setOver] = useState(null);
  const [note, setNote] = useState('');
  const b = board();
  const gridRef = useRef(null);
  const before = useRef(null);
  const fall = useRef(null);
  // Jugada y réplica se miden contra la instantánea: cada ficha que cambió de casilla salta.
  useEffect(() => {
    const was = before.current;
    if (!was) return;
    before.current = null;
    const grid = gridRef.current;
    const { hops, born } = pieceDiffs(grid, was, st.pieces, SIZE);
    for (const h of hops) hopPiece(grid, h.el, { from: h.from, to: h.to, side: h.side, cols: SIZE, rows: SIZE });
    for (const el of born) popPiece(grid, el);
    // El rey capturado cae donde estaba, como en el resto de los minijuegos.
    const f = fall.current;
    if (f) {
      fall.current = null;
      fallPiece(grid, { ...f, type: 'king', cols: SIZE });
    }
  });

  const targets = sel ? legalMoves(sel, st.pieces, b) : [];
  const tap = (r, c) => {
    if (over) return;
    const m = targets.find((t) => t.row === r && t.col === c);
    const own = st.pieces.find((p) => p.row === r && p.col === c && p.color === 'light');
    if (!m) return setSel(own || null);
    const was = snapPieces(st.pieces);
    let pieces = play(st.pieces, sel, m);
    const left = st.left - 1;
    before.current = was;
    setSel(null);
    const kingTaken = !pieces.some((p) => p.type === 'king' && p.color === 'dark');
    const reply = !kingTaken && defend(pieces, left);
    if (reply) pieces = play(pieces, reply.p, reply.m);
    const mate = kingTaken || capturesKing(pieces);
    if (!pieces.some((p) => p.type === 'king' && p.color === 'light')) {
      const king = st.pieces.find((p) => p.type === 'king' && p.color === 'light');
      if (king) fall.current = { row: king.row, col: king.col, side: 'light' };
      setSt({ ...st, pieces, left }); setOver('lose'); return setNote('El carmesí capturó a tu rey.');
    }
    if (!left && !mate) {
      setSt({ ...st, pieces, left }); setOver('lose'); return setNote('Se acabaron tus jugadas y el rey carmesí sigue libre.');
    }
    if (mate && (!left || st.n === 1 || kingTaken)) {
      const next = at + 1;
      if (next >= seq.length) {
        // Se cobra el mate: la estocada final captura al rey, que cae en su casilla.
        const king = pieces.find((p) => p.type === 'king' && p.color === 'dark') || st.pieces.find((p) => p.type === 'king' && p.color === 'dark');
        if (!kingTaken) {
          const hit = captureMove(pieces, sel);
          if (hit) pieces = play(pieces, hit.p, hit.m);
        }
        if (king) fall.current = { row: king.row, col: king.col, side: 'dark' };
        setSt({ ...st, pieces, left }); setOver('win'); return setNote(`¡Mate en ${st.n}! Problema resuelto.`);
      }
      setNote(`¡Mate en ${st.n}! Ahora el mate en ${seq[next]}.`);
      setAt(next);
      return setSt(load(seq[next], st.spec));
    }
    setSt({ ...st, pieces, left });
  };

  const cell = (r, c) => {
    const p = st.pieces.find((x) => x.row === r && x.col === c);
    const t = targets.some((m) => m.row === r && m.col === c);
    const foe = p && p.type === 'king' && p.color === 'dark';
    return { cls: (t ? 'mv ' : '') + (foe ? 'foe ' : '') + (sel && p === sel ? 'sel' : ''), piece: p && { type: p.type, side: p.color } };
  };
  return html`<div class="screen mini">
    <${Topbar} title="Mate en 1 y 2" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!over} label="Problema de mate" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap} />
        <div class="mini-side">
          ${!over && html`<p class="mini-steps">${seq.map((n2, k) => html`<span class=${at === k ? 'on' : at > k ? 'done' : ''}>${k + 1} Mate en ${n2}</span>`)}</p>`}
          ${!over && (note && !sel
            ? html`<p class="mini-status" aria-live="polite">${note}</p>`
            : html`<div class="mini-stats" aria-live="polite">
              <span class="chip" aria-label=${`Te queda${st.left === 1 ? '' : 'n'} ${st.left} jugada${st.left === 1 ? '' : 's'}`}><span class="dots">${Array.from({ length: st.n }, (_, i) => html`<i class=${i < st.left ? '' : 'off'} />`)}</span></span>
            </div>`)}
          ${over && html`<${MiniEnd} win=${over === 'win'} note=${note} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
          <${MiniDiff} mini="mates" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart} />
          <details class="mini-helpbox"><summary>Cómo se juega</summary><p class="mini-help">Juegas con marfil y mueves primero: el rey carmesí marcado en rojo debe caer en ${st.n} jugada${st.n > 1 ? 's' : ''}, responda lo que responda. El carmesí juega siempre su mejor defensa.</p></details>
        </div>
      </div>
    </div>
  </div>`;
}
