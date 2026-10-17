// Run map drawn as a board-game track: tokens connected by dashed trails, a pawn marks you.
import { html, useRef, useEffect, motion } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { Topbar } from '../components.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { isAvailable } from '../../game/run.js';
import { loadShop } from '../../game/shop.js';

const ROW = 110, PAD = 70;

export function MapScreen({ run, onBack, onSelect, onShop }) {
  const { nodes, floors, connections } = run.map;
  const wrap = useRef(null), pawn = useRef(null);
  const H = PAD * 2 + (floors - 1) * ROW;
  const pos = (n) => ({ x: n.totalCols === 1 ? 50 : 18 + (n.column / (n.totalCols - 1)) * 64, y: H - PAD - n.floor * ROW });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const here = run.lastNode ? byId[run.lastNode] : null;
  const pawnAt = here ? pos(here) : { x: 50, y: H - PAD + 62 };

  useEffect(() => {
    // Scroll so the current floor is in view, then drop the pawn in.
    const el = wrap.current;
    el.scrollTop = Math.max(0, pawnAt.y - el.clientHeight * 0.65);
    motion(pawn.current, { y: [-60, 0], opacity: [0, 1] }, { duration: 0.45, delay: 0.2, ease: [0.7, 0, 0.84, 0] });
    motion(el.querySelectorAll('.node.open'), { scale: [0.7, 1] }, { duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] });
  }, []);

  const pick = async (n) => {
    const p = pos(n);
    await motion(pawn.current, { left: [pawnAt.x + '%', p.x + '%'], top: [pawnAt.y + 'px', p.y + 'px'], y: [0, -40, 0] }, { duration: 0.55, ease: 'easeInOut' });
    onSelect(n);
  };

  return html`<div class="screen map">
    <${Topbar} title="Elige tu ruta" sub=${`Piso ${run.currentFloor + 1} de ${floors}`} onBack=${onBack} backLabel="Menú">
      <button class="btn ghost sm" onClick=${onShop} title="Tienda del jardín"><${Icon} name="coin" size=${16} />${loadShop().coins}</button>
    </${Topbar}>
    <div class="map-scroll" ref=${wrap}>
      <div class="map-sheet" style=${{ height: H + 'px' }}>
        <svg class="trails" viewBox=${`0 0 100 ${H}`} preserveAspectRatio="none">
          ${connections.map((cn, i) => {
            const a = pos(byId[cn.from]), b = pos(byId[cn.to]);
            const done = run.completed[cn.from] && run.completed[cn.to];
            const live = run.completed[cn.from] && isAvailable(run, byId[cn.to]);
            const my = (a.y + b.y) / 2;
            return html`<path key=${i} class=${'trail' + (done ? ' done' : live ? ' live' : '')} vector-effect="non-scaling-stroke"
              d=${`M${a.x} ${a.y} C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`} />`;
          })}
        </svg>
        ${Array.from({ length: floors }, (_, f) => html`<div class="floor-tag" style=${{ top: H - PAD - f * ROW + 'px' }}>${f + 1}</div>`)}
        ${nodes.map((n) => {
          const open = isAvailable(run, n), done = !!run.completed[n.id];
          const mod = MODIFIERS[n.modifier];
          const kind = mod.mini ? 'mini' : mod.kind; // familia visual: cada troquel dice qué es el nodo
          const p = pos(n);
          return html`<button key=${n.id} disabled=${!open}
            class=${`node mod-${n.modifier}${kind ? ' k-' + kind : ''}${open ? ' open' : ''}${done ? ' done' : ''}${n.isBoss || n.isMiniBoss ? ' boss' : ''}`}
            style=${{ left: p.x + '%', top: p.y + 'px' }} onClick=${() => open && pick(n)} title=${mod.name}>
            <span class="coin"><${Icon} name=${done ? 'check' : mod.icon} size=${n.isBoss || n.isMiniBoss ? 36 : 26} /></span>
            ${open && html`<span class="label">${mod.name}</span>`}
          </button>`;
        })}
        <div class="map-pawn" ref=${pawn} style=${{ left: pawnAt.x + '%', top: pawnAt.y + 'px' }}><${PieceIcon} type="pawn" side="light" size=${40} /></div>
      </div>
    </div>
  </div>`;
}
