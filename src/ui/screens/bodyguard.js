import { html, useState, useLayoutEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, hopLater, popPiece, fallPiece, reduced } from '../hop.js';
import { SIZE, DIFFS, newBodyguard, legal, move, kingAttacked, dangerSquares } from '../../game/bodyguard.js';

const NAMES = { king: 'rey', rook: 'torre', bishop: 'alfil', knight: 'caballo', queen: 'dama' };
const pcAt = (grid, { row, col }) => grid?.children[row * SIZE + col]?.querySelector('.bm-pc');

export function BodyguardScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBodyguard(diff || settings.miniDiff?.bodyguard));
  const [, redraw] = useState(0);
  const [sel, setSel] = useState('king');
  const gridRef = useRef(null);
  const seen = useRef(null);
  const types = useRef(new Map(s.pieces.map((p) => [p.id, p])));
  const events = s.events;
  // Primero salta tu pieza; la respuesta rival espera a que aterrice.
  useLayoutEffect(() => {
    if (!events.length || seen.current === events) return;
    seen.current = events;
    const grid = gridRef.current;
    if (!grid || reduced()) return;
    events.forEach((ev, i) => {
      const el = pcAt(grid, ev.to);
      const p = types.current.get(ev.id) || s.pieces.find((x) => x.id === ev.id);
      const wait = i ? 420 : 0;
      if (ev.type === 'enter') {
        if (el) { el.style.opacity = '0'; setTimeout(() => { el.style.opacity = ''; popPiece(grid, el); }, 640); }
      } else if (i) hopLater(grid, el, { from: ev.from, to: ev.to, side: p.color, cols: SIZE, rows: SIZE }, wait);
      else hopPiece(grid, el, { from: ev.from, to: ev.to, side: p.color, cols: SIZE, rows: SIZE });
      for (const v of ev.victims) {
        const victim = types.current.get(v);
        setTimeout(() => fallPiece(grid, { ...ev.to, type: victim.type, side: victim.color, cols: SIZE }), wait + 360);
      }
    });
  });
  const tap = (r, c) => {
    if (s.over) return;
    const own = s.pieces.find((p) => p.color === 'light' && p.row === r && p.col === c);
    if (own) { setSel(own.id); return; }
    const m = legal(s, s.pieces.find((p) => p.id === sel)).find((x) => x.row === r && x.col === c);
    if (!m || !move(s, sel, r, c)) return;
    s.pieces.forEach((p) => types.current.set(p.id, p));
    setSel(s.pieces.some((p) => p.id === sel) ? sel : 'king');
    redraw((n) => n + 1);
  };
  const selected = s.pieces.find((p) => p.id === sel);
  const targets = legal(s, selected);
  const danger = s.diff.hints && sel === 'king' ? dangerSquares(s) : new Set();
  const check = !s.over && kingAttacked(s.pieces, s.board);
  const foes = s.pieces.filter((p) => p.color === 'dark').length;
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    const valid = targets.some((m) => m.row === r && m.col === c);
    return {
      cls: [valid && 'mv', p?.color === 'dark' && 'foe', p?.id === sel && 'sel', danger.has(r + ',' + c) && 'danger',
        s.board.holes.has(r + ',' + c) && 'hole', check && p?.id === 'king' && 'check'].filter(Boolean).join(' '),
      piece: p && { type: p.type, side: p.color },
    };
  };
  return html`<div class="screen mini bodyguard">
    <${Topbar} title="El guardaespaldas" sub=${sub} onBack=${onBack} />
    <div class="mini-body">
      <div class="mini-stats" aria-live="polite">
        <span class="chip"><${Icon} name="guard" size=${12} /> Aguanta ${s.turns} turnos</span>
        <span class="chip">${foes} atacantes${s.diff.reinforce && s.turns > s.diff.reinforce ? ' · refuerzo en ' + (s.turns - s.diff.reinforce) : ''}</span>
        ${check && html`<span class="chip danger">¡Jaque!</span>`}
      </div>
      <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El guardaespaldas" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap} />
      <p class="mini-status">Mueves: ${NAMES[selected?.type] || 'rey'}. Toca una pieza marfil y después su destino.</p>
      <${MiniTools} mini="bodyguard" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Protege al rey marfil con su escolta. Cada partida sortea la escolta, la escuadra rival y las casillas caídas. El rival mueve una pieza por turno y busca dejar a tu rey sin salida; en Difícil llega un caballo de refuerzo. Sobrevive los turnos o captura a todos los atacantes; si cae tu rey, pierdes. En Fácil y Normal se marcan las casillas donde tu rey quedaría a tiro.<//>
      ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? (foes ? 'El rey resistió el asedio.' : 'Desarmaste a toda la escuadra.') : 'El atacante alcanzó al rey.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
    </div>
  </div>`;
}
