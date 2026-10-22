import { html, useState, useEffect, useLayoutEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, fallPiece, reduced } from '../hop.js';
import { playSfx } from '../sfx.js';
import { Fx } from '../../view/fx.js';
import { SIZE, DIFFS, newMinefield, legal, move, probe, nearbyMines } from '../../game/minefield.js';

const cellAt = (grid, k) => { const [r, c] = k.split(',').map(Number); return grid?.children[r * SIZE + c]; };

export function MinefieldScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newMinefield(diff || settings.miniDiff?.minefield));
  const [, redraw] = useState(0);
  const [probing, setProbing] = useState(false);
  const gridRef = useRef(null);
  const fxRef = useRef(null);
  const seen = useRef(null);
  const targets = probing ? [] : legal(s);
  useEffect(() => {
    fxRef.current = new Fx(gridRef.current);
    return () => fxRef.current.destroy();
  }, []);

  const last = s.last;
  useLayoutEffect(() => {
    if (!last || seen.current === last) return;
    seen.current = last;
    const grid = gridRef.current, fx = fxRef.current;
    if (!grid || !fx || reduced()) return;
    const shake = (a) => settings.shake !== false && motion(grid, { x: [0, -a, a * 0.8, -a * 0.5, 0], y: [0, a * 0.4, -a * 0.5, 0] }, { duration: 0.4, ease: 'easeOut' });
    if (last.probe) {
      const el = grid.children[last.probe.row * SIZE + last.probe.col], p = fx.pointOf(el);
      playSfx(last.mine ? 'invalid' : 'pop');
      fx.ring(p.x, p.y, { radius: el.offsetWidth * 0.9, color: last.mine ? '#ff6b5b' : '#9fe0ff', width: 3 });
      fx.ring(p.x, p.y, { radius: el.offsetWidth * 1.5, color: last.mine ? '#ff6b5b' : '#9fe0ff', width: 2, life: 0.7 });
      return;
    }
    const pc = grid.children[last.to.row * SIZE + last.to.col]?.querySelector('.bm-pc');
    hopPiece(grid, pc, { from: last.from, to: last.to, side: 'light', cols: SIZE, rows: SIZE });
    const landed = grid.children[last.to.row * SIZE + last.to.col];
    if (s.over === 'lose' && s.mines.has(last.to.row + ',' + last.to.col)) {
      // La mina pisada estalla y arrastra a las demás en cadena, de cerca a lejos.
      setTimeout(() => {
        const p = fx.pointOf(landed);
        fx.bigBoom(p.x, p.y, { scale: landed.offsetWidth / 42 });
        fallPiece(grid, { ...last.to, type: 'knight', side: 'light', cols: SIZE });
        shake(12);
      }, 380);
      s.fresh.slice(1).forEach((k, i) => setTimeout(() => {
        const el = cellAt(grid, k), p = fx.pointOf(el);
        fx.explosion(p.x, p.y, el.offsetWidth / 60, i % 3 === 0);
        shake(4);
      }, 700 + i * 110));
      return;
    }
    setTimeout(() => {
      const p = fx.pointOf(landed, 0.8);
      fx.dust(p.x, p.y, 0.9);
      if (s.over === 'win') {
        playSfx('win');
        fx.sparkle(p.x, p.y - landed.offsetHeight * 0.4, '#ffcf6b', 24);
        fx.ring(p.x, p.y, { radius: landed.offsetWidth * 2, color: '#ffcf6b', width: 4 });
      }
    }, 380);
  });

  const tap = (r, c) => {
    if (s.over) return;
    if (probing) {
      if (probe(s, r, c)) { setProbing(false); redraw((n) => n + 1); }
      return;
    }
    if (targets.some((m) => m.row === r && m.col === c) && move(s, r, c)) redraw((n) => n + 1);
  };
  const p = s.pieces[0];
  // Las casillas que se destapan a la vez aparecen en ola desde donde aterrizó el caballo.
  const order = new Map(s.fresh.map((k, i) => [k, i]));
  const cell = (r, c) => {
    const k = r + ',' + c;
    const valid = targets.some((m) => m.row === r && m.col === c), shown = s.revealed.has(k);
    const mine = s.mines.has(k) && shown, flag = s.flags.has(k);
    const fresh = order.has(k);
    return {
      cls: [valid && 'mv', mine && 'foe', flag && 'mine-flag', shown && !mine && 'mine-revealed', fresh && 'fresh', r === 0 && 'target',
        probing && !shown && !flag && 'probe-aim'].filter(Boolean).join(' '),
      style: fresh ? { '--d': (s.over === 'lose' && s.mines.has(k) ? (order.get(k) ? 590 + order.get(k) * 110 : 380) : order.get(k) * 45) + 'ms' } : undefined,
      piece: p.row === r && p.col === c ? { type: p.type, side: p.color } : null,
      label: flag ? '✕' : shown && !s.mines.has(k) ? String(nearbyMines(s, r, c) || '·') : undefined,
    };
  };
  const reveal = { area: 'las casillas de alrededor', cross: 'las cuatro casillas pegadas', self: 'solo la casilla pisada' }[s.diff.reveal];
  return html`<div class="screen mini minefield"><${Topbar} title="Campo minado" sub=${sub} onBack=${onBack} /><div class="mini-body">
  <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="bomb" size=${12} /> Jugadas: ${s.turns}</span><span class="chip">Minas: ${s.diff.mines}</span>
    <button class=${'btn sm' + (probing ? ' on' : ' ghost')} aria-pressed=${probing} disabled=${!!s.over || !s.probes} onClick=${() => setProbing(!probing)}>Sonda × ${s.probes}</button></div>
  <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Campo minado" boardClass="bm-slab" gridRef=${gridRef} onTap=${tap} />
  ${probing && html`<p class="mini-status">Toca una casilla tapada para sondearla.</p>`}
  <${MiniTools} mini="minefield" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Lleva el caballo a la fila de arriba. Cada partida esconde las minas en otro sitio, pero siempre hay un camino seguro. Al aterrizar se destapa ${reveal} y cada número cuenta las minas que la rodean. La sonda mira una casilla sin gastar jugada: si es mina, queda marcada.<//>
  ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Cruzaste el campo minado.' : s.turns <= 0 && !s.mines.has(p.row + ',' + p.col) ? 'Se acabaron las jugadas.' : 'Pisaste una mina.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
  </div></div>`;
}
