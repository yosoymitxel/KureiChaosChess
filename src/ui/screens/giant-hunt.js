import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, reduced } from '../hop.js';
import { SIZE, DIFFS, newGiantHunt, legal, move } from '../../game/giant-hunt.js';
import { BOSSES } from '../../data/bosses.js';

export function GiantHuntScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
 const [s] = useState(() => newGiantHunt(diff || settings.miniDiff?.giantHunt));
 const [, redraw] = useState(0);
 const gridRef = useRef(null);
 const lastEvents = useRef('');
 const targets = legal(s);
 const giant = s.pieces.find(p => p.id === 'giant');
 const boss = BOSSES[s.diff.boss];

 useEffect(() => {
   const eventKey = s.turns + ':' + s.round + ':' + s.events.map(e => e.type + ':' + e.from?.row + ',' + e.from?.col + '>' + e.to?.row + ',' + e.to?.col).join('|');
   if (!s.events.length || eventKey === lastEvents.current) return;
   lastEvents.current = eventKey;
   if (reduced()) return;
   const grid = gridRef.current;
   if (!grid) return;
   const hunterMove = s.events.find(e => e.type === 'hunter-move');
   const bossMove = s.events.find(e => e.type === 'boss-move');
   if (hunterMove) {
     const el = grid.querySelector('.bm-pc.side-light');
     if (el) hopPiece(grid, el, { from: hunterMove.from, to: hunterMove.to, side: 'light', cols: SIZE, rows: SIZE });
   }
   if (bossMove) {
     const el = grid.querySelector('.bm-pc.boss-footprint');
     if (el) hopPiece(grid, el, { from: bossMove.from, to: bossMove.to, side: 'dark', cols: SIZE, rows: SIZE });
   }
   if (s.lastEvent === 'hit') {
     const el = grid.querySelector('.bm-pc.boss-footprint');
     if (el) {
       el.classList.remove('giant-impact');
       void el.offsetWidth;
       el.classList.add('giant-impact');
     }
   }
 }, [s.events, s.lastEvent]);

 const tap = (r,c) => {
   if (s.over || !targets.some(m => m.row === r && m.col === c)) return;
   if (move(s,r,c)) redraw(n => n+1);
 };
 const cell = (r,c) => {
   const p = s.pieces.find(x => x.row === r && x.col === c);
   const covered = giant && r >= giant.row && r < giant.row + giant.h && c >= giant.col && c < giant.col + giant.w;
   const valid = targets.some(m => m.row === r && m.col === c);
   const hitTarget = valid && targets.some(m => m.row === r && m.col === c && m.hits.some(x => x.id === 'giant'));
   return {
     cls: [valid && 'mv', covered && 'foe', hitTarget && 'giant-target'].filter(Boolean).join(' '),
     piece: p && (p.id === 'giant'
       ? { type: p.type, side: p.color, w: p.w, h: p.h }
       : { type: p.type, side: p.color }),
   };
 };
 return html`<div class="screen mini giant-hunt"><${Topbar} title="Caza de gigantes" sub=${sub} onBack=${onBack}/><div class="mini-body">
   <div class="mini-stats" aria-live="polite">
     <span class="chip"><${Icon} name="boss" size=${12}/> ${boss.name}: ${giant?.hp ?? 0}/${s.hp} vidas</span>
     <span class="chip">Turnos: ${s.turns}</span>
     <span class="chip">Amenaza: ${s.diff.name}</span>
   </div>
   <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Caza de gigantes" gridRef=${gridRef} boardClass="bm-slab"/>
   <p class="giant-hint">${giant ? boss.name + ' ocupa ' + giant.h + '×' + giant.w + ' casillas. Sus movimientos: ' + boss.moves.join(', ') + '.' : 'El jefe cayó.'} Atacá con la reina y reposicionate antes de que el jefe responda.</p>
   <${MiniTools} mini="giantHunt" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Cada jefe tiene tamaño, vida y movimiento propios. La reina golpea al entrar en su cuerpo, rebota y pierde un turno; el jefe responde después de cada jugada e intenta alcanzarte. Fácil: Titán (3 vidas, movimientos cortos). Normal: Hidra (4 vidas, se desplaza en diagonal o salta). Difícil: Gólem (5 vidas, ocupa 3×3 y avanza en línea). Derribalo antes de agotar los turnos o de que te aplaste.<//>
   ${s.over && html`<${MiniEnd} win=${s.over==='win'} note=${s.over==='win' ? boss.name + ' cayó tras ' + s.round + ' respuestas.' : s.turns <= 0 ? 'Se agotaron los turnos: el gigante sigue en pie.' : 'El gigante te alcanzó y te aplastó.'} label=${endLabel} onEnd=${()=>onEnd(s.over==='win')}/>`}
 </div></div>`;
}
