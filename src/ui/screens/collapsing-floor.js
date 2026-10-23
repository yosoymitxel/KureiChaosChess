import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece } from '../hop.js';
import { SIZE, DIFFS, newCollapsingFloor, legal, move } from '../../game/collapsing-floor.js';
export function CollapsingFloorScreen({sub,onBack,onEnd,endLabel='Continuar',settings,setSettings,onRestart,diff}){
 const [s]=useState(()=>newCollapsingFloor(diff||settings.miniDiff?.collapsingFloor));const [,redraw]=useState(0);const targets=legal(s);const gridRef=useRef(null);const last=useRef(null);
 const tap=(r,c)=>{if(s.over||!targets.some(m=>m.row===r&&m.col===c))return;if(move(s,r,c))redraw(n=>n+1);};
 useEffect(()=>{const was=last.current;last.current={r:s.pieces[0].row,c:s.pieces[0].col};const grid=gridRef.current;if(!grid||!was)return;const now=last.current;if(now.r===was.r&&now.c===was.c)return;hopPiece(grid,grid.children[now.r*SIZE+now.c]?.querySelector('.bm-pc'),{from:was,to:{row:now.r,col:now.c},side:s.pieces[0].color,cols:SIZE,rows:SIZE});});
 const cell=(r,c)=>{const p=s.pieces[0],k=r+','+c,valid=targets.some(m=>m.row===r&&m.col===c);return {cls:[valid&&'mv',s.board.holes.has(k)&&'hole',s.lastCollapsed.includes(k)&&'falling',r===0&&'target'].filter(Boolean).join(' '),piece:p.row===r&&p.col===c?{type:p.type,side:p.color}:null};};
 return html`<div class="screen mini"><${Topbar} title="El suelo se acaba" sub=${sub} onBack=${onBack}/><div class="mini-body">
 <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="collapse" size=${12}/> Saltos: ${s.turns}</span><span class="chip">El suelo se hunde en cada turno</span></div>
 <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El suelo se acaba" boardClass="bm-slab" gridRef=${gridRef} onTap=${tap}/>
 <${MiniTools} mini="collapsingFloor" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Lleva el caballo a cualquier casilla de la fila superior. Cada turno se hunde la casilla que abandonas y también otras zonas del tablero. En difícil caen dos casillas adicionales; los huecos son permanentes. Busca una ruta antes de que el suelo te cierre el paso.<//>
 ${s.over&&html`<div class=${"mini-end " + (s.over==='win' ? 'win' : 'lose')} role="status"><p class="mini-end-title">${s.over==='win' ? '¡Victoria!' : 'Derrota'}</p><button class="btn primary" onClick=${()=>onEnd(s.over==='win')}>${endLabel}</button></div>`}
 </div></div>`;
}
