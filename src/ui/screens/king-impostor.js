import { html, useState } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { SIZE, DIFFS, newKingImpostor, choose } from '../../game/king-impostor.js';
export function KingImpostorScreen({sub,onBack,onEnd,endLabel='Continuar',settings,setSettings,onRestart,diff}){
 const [s]=useState(()=>newKingImpostor(diff||settings.miniDiff?.kingImpostor));const [,redraw]=useState(0);
 const tap=(r,c)=>{const p=s.pieces.find(x=>x.row===r&&x.col===c);if(p&&choose(s,p.id))redraw(n=>n+1);};
 const cell=(r,c)=>{const p=s.pieces.find(x=>x.row===r&&x.col===c);return {cls:[p?.color==='dark'&&'mv',p?.id===s.chosen&&'sel'].filter(Boolean).join(' '),piece:p&&{type:p.type,side:p.color}};};
 return html`<div class="screen mini"><${Topbar} title="El rey impostor" sub=${sub} onBack=${onBack}/><div class="mini-body">
 <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="target" size=${12}/> Intentos: ${s.turns}</span><span class="chip">Encuentra al impostor</span></div>
 <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="El rey impostor" boardClass="bm-slab" onTap=${tap}/>
 <${MiniTools} mini="kingImpostor" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${s.clue} Identifica al sospechoso que coincide con esa pista. Solo tienes un intento en Difícil, dos en Normal y tres en Fácil; una elección incorrecta consume un intento.<//>
 ${s.over&&html`<${MiniEnd} win=${s.over==='win'} note=${s.over==='win'?'Impostor identificado.':'Acusaste a la pieza equivocada.'} label=${endLabel} onEnd=${()=>onEnd(s.over==='win')}/>`}
 </div></div>`;
}
