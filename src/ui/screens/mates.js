import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, popPiece, snapPieces, pieceDiffs } from '../hop.js';
import { legalMoves } from '../../game/rules.js';
import { SIZE, board, fromSpec, play, defend, capturesKing } from '../../game/mates.js';
import { MATES } from '../../data/mates.js';

const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
const load = (n) => ({ n, left: n, pieces: fromSpec(pickOne(MATES[n])) });

export function MatesScreen({ sub, onBack, onEnd, endLabel = 'Continuar' }) {
  const [st, setSt] = useState(() => load(1));
  const [sel, setSel] = useState(null);
  const [over, setOver] = useState(null);
  const [note, setNote] = useState('');
  const b = board();
  const gridRef = useRef(null);
  const before = useRef(null);
  // Jugada y réplica se miden contra la instantánea: cada ficha que cambió de casilla salta.
  useEffect(() => {
    const was = before.current;
    if (!was) return;
    before.current = null;
    const grid = gridRef.current;
    const { hops, born } = pieceDiffs(grid, was, st.pieces, SIZE);
    for (const h of hops) hopPiece(grid, h.el, { from: h.from, to: h.to, side: h.side, cols: SIZE, rows: SIZE });
    for (const el of born) popPiece(grid, el);
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
      setSt({ ...st, pieces, left }); setOver('lose'); return setNote('El carmesí capturó a tu rey.');
    }
    if (!left && !mate) {
      setSt({ ...st, pieces, left }); setOver('lose'); return setNote('Se acabaron tus jugadas y el rey carmesí sigue libre.');
    }
    if (mate && (!left || st.n === 1 || kingTaken)) {
      if (st.n === 2) { setSt({ ...st, pieces, left }); setOver('win'); return setNote('¡Mate en 2! Problema resuelto.'); }
      setNote('¡Mate en 1! Ahora el mate en 2.');
      return setSt(load(2));
    }
    setSt({ ...st, pieces, left });
  };

  const cell = (r, c) => {
    const p = st.pieces.find((x) => x.row === r && x.col === c);
    const t = targets.some((m) => m.row === r && m.col === c);
    const foe = p && p.type === 'king' && p.color === 'dark';
    return { cls: (t ? 'mv ' : '') + (foe ? 'foe ' : '') + (sel && p === sel ? 'sel' : ''), piece: p && { type: p.type, side: p.color } };
  };
  const status = note && !over && !sel ? note : `Mate en ${st.n} · te queda${st.left > 1 ? `n ${st.left} jugadas` : ' 1 jugada'}.`;

  return html`<div class="screen mini">
    <${Topbar} title="Mate en 1 y 2" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      ${!over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
      <p class="mini-help">Juegas con marfil y mueves primero: el rey carmesí marcado en rojo debe caer en ${st.n} jugada${st.n > 1 ? 's' : ''}, responda lo que responda. El carmesí juega siempre su mejor defensa.</p>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!over} label="Problema de mate" gridRef=${gridRef} onTap=${tap} />
      ${over && html`<${MiniEnd} win=${over === 'win'} note=${note} label=${endLabel} onEnd=${() => onEnd(over === 'win')} />`}
    </div>
  </div>`;
}
