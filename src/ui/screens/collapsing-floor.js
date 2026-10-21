import { html, useState } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { SIZE, DIFFS, newCollapsingFloor, legal, move } from '../../game/collapsing-floor.js';
export function CollapsingFloorScreen({sub,onBack,onEnd,endLabel='Continuar',settings,setSettings,onRestart,diff}){
 const [s]=useState(()=>newCollapsingFloor(diff||settings.miniDiff?.collapsingFloor));const [,redraw]=useState(0);const targets=legal(s);
 const tap=(r,c)=>{if(s.over||!targets.some(m=>m.row===r&&m.col===c))return;if(move(s,r,c))redraw(n=>n+1);};
 const cell=(r,c)=>{const p=s.pieces[0],valid=targets.some(m=>m.row===r&&m.col===c);return {cls:[valid&&'mv',s.board.holes.has(r+','+c)&&'foe',r===0&&'target'].filter(Boolean).join(' '),piece:p.row===r&&p.col===c?{type:p.type,side:p.color}:null};};
 return html`<div class="screen mini"><${Topbar} title="El suelo se acaba" sub=${sub} onBack=${onBack}/><div class="mini-body">
 <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="collapse" size=${12}/> Saltos: ${s.turns}</span><span class="chip">El suelo desaparece al salir</span></div>
 <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El suelo se acaba" boardClass="bm-slab" onTap=${tap}/>
 <${MiniTools} mini="collapsingFloor" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Lleva el caballo a cualquier casilla de la fila superior. Cada casilla que abandonas se hunde y ya no puede pisarse; los huecos iniciales también están marcados. Planifica la ruta antes de saltar.<//>
 ${s.over&&html`<${MiniEnd} win=${s.over==='win'} note=${s.over==='win'?'Llegaste al otro lado.':'Te quedaste sin saltos o sin movimientos.'} label=${endLabel} onEnd=${()=>onEnd(s.over==='win')}/>`}
 </div></div>`;
}
