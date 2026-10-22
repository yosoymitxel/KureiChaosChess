import { html, useState, useRef, useEffect, useLayoutEffect, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { popPiece, reduced } from '../hop.js';
import { playSfx } from '../sfx.js';
import { Fx } from '../../view/fx.js';
import { SIZE, DIFFS, NAMES, newKingImpostor, choose, activeClues, reach } from '../../game/king-impostor.js';

const COLS = 'abcdefg';
const squareName = (k) => { const [r, c] = k.split(',').map(Number); return COLS[c] + (SIZE - r); };

export function KingImpostorScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newKingImpostor(diff || settings.miniDiff?.kingImpostor));
  const [, redraw] = useState(0);
  // Alcance de la última acusada, a la vista un momento: así se entiende por qué no era ella.
  const [shownReach, setShownReach] = useState(null);
  const gridRef = useRef(null);
  const fxRef = useRef(null);
  const seen = useRef(null);
  useEffect(() => {
    fxRef.current = new Fx(gridRef.current);
    return () => fxRef.current.destroy();
  }, []);

  const chosen = s.chosen;
  useLayoutEffect(() => {
    if (!chosen || seen.current === s.revealed.size) return;
    seen.current = s.revealed.size;
    const grid = gridRef.current, fx = fxRef.current;
    const p = s.pieces.find((x) => x.id === chosen);
    const el = grid?.children[p.row * SIZE + p.col]?.querySelector('.bm-pc');
    if (!el || reduced()) return;
    if (chosen === s.impostor) {
      popPiece(grid, el);
      const pt = fx.pointOf(el, 0.4);
      fx.burst(pt.x, pt.y, { count: 26, color: ['#8fd16a', '#d6ff9e', '#3b6b2a'], speed: [80, 240], life: [0.4, 0.9], gravity: 260 });
      fx.ring(pt.x, pt.y, { radius: el.offsetWidth * 1.6, color: '#8fd16a', width: 4 });
      playSfx('zombie');
    } else {
      playSfx('invalid');
      motion(el, { x: [0, -7, 7, -5, 5, 0], rotate: [0, -6, 6, -3, 0] }, { duration: 0.42, ease: 'easeInOut' });
    }
  });

  const tap = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    if (!p || p.color !== 'dark' || !choose(s, p.id)) return;
    if (p.id !== s.impostor) {
      setShownReach(new Set(reach(s, p)));
      setTimeout(() => setShownReach(null), 1400);
    }
    if (s.over === 'lose') setShownReach(new Set(reach(s, s.pieces.find((x) => x.id === s.impostor))));
    redraw((n) => n + 1);
  };
  const clues = activeClues(s);
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c);
    const k = r + ',' + c;
    const isImpostor = s.over && p?.id === s.impostor;
    const cleared = p && s.revealed.has(p.id) && p.id !== s.impostor;
    const clue = clues.indexOf(k);
    return {
      cls: [p?.color === 'dark' && !cleared && !s.over && 'mv', cleared && 'cleared', clue >= 0 && 'clue', clue === clues.length - 1 && clue > 0 && 'clue-new',
        shownReach?.has(k) && 'reach', isImpostor && 'impostor'].filter(Boolean).join(' '),
      piece: p && { type: p.type, side: isImpostor ? 'zombie' : p.color },
      label: clue >= 0 ? String(clue + 1) : undefined,
    };
  };
  const left = s.pieces.filter((p) => p.color === 'dark' && !s.revealed.has(p.id)).length;
  const impostor = s.pieces.find((p) => p.id === s.impostor);
  return html`<div class="screen mini king-impostor"><${Topbar} title="El rey impostor" sub=${sub} onBack=${onBack}/><div class="mini-body">
    <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="target" size=${12}/> Intentos: ${s.turns}</span><span class="chip">${left} sospechosos</span></div>
    <p class="mini-status" aria-live="polite">${s.over ? '' : clues.length > 1 ? `El impostor amenaza ${clues.map(squareName).join(' y ')}.` : `El impostor amenaza ${squareName(clues[0])}.`}</p>
    <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El rey impostor" boardClass="bm-slab" gridRef=${gridRef} onTap=${tap}/>
    <${MiniTools} mini="kingImpostor" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Una de las piezas carmesí es un impostor. Las casillas numeradas son pistas: el impostor podría llegar a todas ellas en una jugada (las piezas cortan las líneas y el peón solo amenaza en diagonal hacia abajo). Toca a quien acuses. Cada fallo gasta un intento y destapa otra pista. Fácil: tres intentos. Normal: dos. Difícil: un intento, con dos pistas desde el principio.<//>
    ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Impostor desenmascarado.' : `Era ${NAMES[impostor.type] === 'torre' || NAMES[impostor.type] === 'dama' ? 'la' : 'el'} ${NAMES[impostor.type]} de ${squareName(impostor.row + ',' + impostor.col)}.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
  </div></div>`;
}
