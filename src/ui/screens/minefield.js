import { html, useState } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { SIZE, DIFFS, newMinefield, legal, move, nearbyMines } from '../../game/minefield.js';

export function MinefieldScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
 const [s]=useState(()=>newMinefield(diff||settings.miniDiff?.minefield));const [,redraw]=useState(0);const targets=legal(s);
 const tap=(r,c)=>{if(s.over||!targets.some(m=>m.row===r&&m.col===c))return;if(move(s,r,c))redraw(n=>n+1);};
 const cell=(r,c)=>{const p=s.pieces[0],k=r+','+c,valid=targets.some(m=>m.row===r&&m.col===c),shown=s.revealed.has(k);return {cls:[valid&&'mv',s.mines.has(k)&&shown&&'foe',r===0&&'target'].filter(Boolean).join(' '),piece:p.row===r&&p.col===c?{type:p.type,side:p.color}:null, label:shown&&!s.mines.has(k)?String(nearbyMines(s,r,c)||'·'):undefined};};
 return html`<div class="screen mini"><${Topbar} title="Campo minado" sub=${sub} onBack=${onBack}/><div class="mini-body">
 <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="bomb" size=${12}/> Jugadas: ${s.turns}</span><span class="chip">Llega a la fila superior</span></div>
 <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Campo minado" boardClass="bm-slab" onTap=${tap}/>
 <${MiniTools} mini="minefield" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Mueve el caballo hasta la fila superior. Algunas casillas esconden minas: si pisas una, pierdes. Las casillas válidas se iluminan y las ya pisadas muestran cuántas minas hay alrededor.<//>
 ${s.over&&html`<${MiniEnd} win=${s.over==='win'} note=${s.over==='win'?'Cruzaste el campo minado.':'Pisaste una mina o se acabaron las jugadas.'} label=${endLabel} onEnd=${()=>onEnd(s.over==='win')}/>`}
 </div></div>`;
}
