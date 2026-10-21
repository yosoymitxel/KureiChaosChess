import { html, useState } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { SIZE, DIFFS, newContraband, legal, move } from '../../game/dimensional-contraband.js';

export function ContrabandScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
 const [s]=useState(()=>newContraband(diff||settings.miniDiff?.contraband));const [,redraw]=useState(0);const targets=legal(s);
 const tap=(r,c)=>{if(s.over||!targets.some(m=>m.row===r&&m.col===c))return;if(move(s,r,c))redraw(n=>n+1);};
 const cell=(r,c)=>{const p=s.pieces[0],k=r+','+c,valid=targets.some(m=>m.row===r&&m.col===c),portal=s.board.portals.has(k);return {cls:[valid&&'mv',portal&&'target'].filter(Boolean).join(' '),piece:p.row===r&&p.col===c?{type:p.type,side:p.color}:null};};
 return html`<div class="screen mini"><${Topbar} title="Contrabando dimensional" sub=${sub} onBack=${onBack}/><div class="mini-body">
 <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="portal" size=${12}/> Jugadas: ${s.turns}</span><span class="chip">Salida: esquina superior derecha</span></div>
 <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Contrabando dimensional" boardClass="bm-slab" onTap=${tap}/>
 <${MiniTools} mini="contraband" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Lleva el caballo contrabandista a la salida (fila superior, última columna). Los dos portales dorados están enlazados: aterrizar en uno te transporta al otro. Planifica el salto para llegar antes de que se acabe el tiempo.<//>
 ${s.over&&html`<${MiniEnd} win=${s.over==='win'} note=${s.over==='win'?'La mercancía cruzó la frontera.':'Se agotaron las jugadas.'} label=${endLabel} onEnd=${()=>onEnd(s.over==='win')}/>`}
 </div></div>`;
}
