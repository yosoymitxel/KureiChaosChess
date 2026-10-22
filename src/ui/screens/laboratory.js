import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece } from '../hop.js';
import { SIZE, DIFFS, newLaboratory, legal, move } from '../../game/laboratory.js';
import { MUTATIONS } from '../../data/mutations.js';
export function LaboratoryScreen({sub,onBack,onEnd,endLabel='Continuar',settings,setSettings,onRestart,diff}){
 const [s]=useState(()=>newLaboratory(diff||settings.miniDiff?.laboratory));const [,redraw]=useState(0);const targets=legal(s);const gridRef=useRef(null);const last=useRef(null);
 const mut=MUTATIONS[s.diff.mutation]||{name:s.diff.mutation,desc:''};
 const tap=(r,c)=>{if(s.over||!targets.some(m=>m.row===r&&m.col===c))return;if(move(s,r,c))redraw(n=>n+1);};
 useEffect(()=>{const was=last.current;last.current={r:s.pieces[0].row,c:s.pieces[0].col};const grid=gridRef.current;if(!grid||!was)return;const now=last.current;if(now.r===was.r&&now.c===was.c)return;hopPiece(grid,grid.children[now.r*SIZE+now.c]?.querySelector('.bm-pc'),{from:was,to:{row:now.r,col:now.c},side:s.pieces[0].color,cols:SIZE,rows:SIZE});});
 const cell=(r,c)=>{const p=s.pieces[0],valid=targets.some(m=>m.row===r&&m.col===c);return {cls:[valid&&'mv',r===0&&'target',s.board.holes.has(r+','+c)&&'hole'].filter(Boolean).join(' '),piece:p.row===r&&p.col===c?{type:p.type,side:p.color}:null};};
 return html`<div class="screen mini"><${Topbar} title="El laboratorio" sub=${sub} onBack=${onBack}/><div class="mini-body">
 <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="flask" size=${12}/> Jugadas: ${s.turns}</span><span class="chip" title=${mut.desc}>Prueba: ${mut.name}</span></div>
 <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El laboratorio" boardClass="bm-slab" gridRef=${gridRef} onTap=${tap}/>
 <${MiniTools} mini="laboratory" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Prueba la mutación <b>${mut.name}</b>: ${mut.desc} Alcanza cualquier casilla de la fila superior. Los huecos cambian según la dificultad y cada casilla que abandonas se convierte en un agujero.<//>
 ${s.over&&html`<${MiniEnd} win=${s.over==='win'} note=${s.over==='win'?'Experimento completado.':'El experimento agotó sus turnos.'} label=${endLabel} onEnd=${()=>onEnd(s.over==='win')}/>`}
 </div></div>`;
}
