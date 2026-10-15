import { html, useState } from '../lib.js';
import { Topbar } from '../components.js';
import { MiniGrid } from './mini-grid.js';
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

  const targets = sel ? legalMoves(sel, st.pieces, b) : [];
  const tap = (r, c) => {
    if (over) return;
    const m = targets.find((t) => t.row === r && t.col === c);
    const own = st.pieces.find((p) => p.row === r && p.col === c && p.color === 'light');
    if (!m) return setSel(own || null);
    let pieces = play(st.pieces, sel, m);
    const left = st.left - 1;
    setSel(null);
    const kingTaken = !pieces.some((p) => p.type === 'king' && p.color === 'dark');
    const reply = !kingTaken && defend(pieces, left);
    if (reply) pieces = play(pieces, reply.p, reply.m);
    const mate = kingTaken || capturesKing(pieces);
    if (!pieces.some((p) => p.type === 'king' && p.color === 'light') || (!left && !mate)) {
      setSt({ ...st, pieces, left }); setOver('lose'); return setNote('El rey carmesí se escapa.');
    }
    if (mate && (!left || st.n === 1 || kingTaken)) {
      if (st.n === 2) { setSt({ ...st, pieces, left }); setOver('win'); return setNote('¡Mate en 2! Ganas.'); }
      setNote('¡Mate en 1! Ahora, mate en 2.');
      return setSt(load(2));
    }
    setSt({ ...st, pieces, left });
  };

  const cell = (r, c) => {
    const p = st.pieces.find((x) => x.row === r && x.col === c);
    const t = targets.some((m) => m.row === r && m.col === c);
    return { cls: (t ? 'mv' : '') + (sel && p === sel ? ' sel' : ''), piece: p && { type: p.type, side: p.color } };
  };
  const status = note && (over || !sel) ? note : `Mate en ${st.n}: juegas con marfil. Te quedan ${st.left} jugada${st.left > 1 ? 's' : ''}.`;

  return html`<div class="screen mini">
    <${Topbar} title="Mate en 1 y 2" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!over} label="Problema de mate" onTap=${tap} />
      ${over && html`<button class="btn primary" onClick=${() => onEnd(over === 'win')}>${endLabel}</button>`}
    </div>
  </div>`;
}
