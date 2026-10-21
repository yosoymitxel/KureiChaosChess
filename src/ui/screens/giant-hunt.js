import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, reduced } from '../hop.js';
import { SIZE, DIFFS, newGiantHunt, legal, move } from '../../game/giant-hunt.js';

export function GiantHuntScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
 const [s]=useState(()=>newGiantHunt(diff||settings.miniDiff?.giantHunt)); const [,redraw]=useState(0); const gridRef=useRef(null); const hop=useRef(null); const targets=legal(s);
 useEffect(()=>{const h=hop.current;if(!h)return;hop.current=null;const el=gridRef.current?.querySelector('.bm-pc.side-light');if(el&&!reduced())hopPiece(gridRef.current,el,{from:h.from,to:h.to,side:'light',cols:SIZE,rows:SIZE});});
 const tap=(r,c)=>{if(s.over||!targets.some(m=>m.row===r&&m.col===c))return;const p=s.pieces[0];hop.current={from:{row:p.row,col:p.col},to:{row:r,col:c}};if(move(s,r,c))redraw(n=>n+1);};
 const cell=(r,c)=>{const p=s.pieces.find(x=>(r>=x.row&&r<x.row+(x.h||1)&&c>=x.col&&c<x.col+(x.w||1)));const valid=targets.some(m=>m.row===r&&m.col===c);return {cls:[valid&&'mv',p?.id==='giant'&&'foe'].filter(Boolean).join(' '),piece:p&&{type:p.type,side:p.color}};};
 const giant=s.pieces.find(p=>p.id==='giant');
 return html`<div class="screen mini"><${Topbar} title="Caza de gigantes" sub=${sub} onBack=${onBack}/><div class="mini-body">
 <div class="mini-stats" aria-live="polite"><span class="chip"><${Icon} name="boss" size=${12}/> Golpes restantes: ${giant?.hp??0}</span><span class="chip">Jugadas: ${s.turns}</span></div>
 <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Caza de gigantes" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap}/>
 <${MiniTools} mini="giantHunt" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Ataca al coloso con la reina. Su cuerpo ocupa cuatro casillas y cada golpe reduce una vida; los golpes consumen más tiempo que un movimiento normal. Derríbalo antes de agotar las jugadas.<//>
 ${s.over&&html`<${MiniEnd} win=${s.over==='win'} note=${s.over==='win'?'El coloso cayó.':'Se agotaron las jugadas.'} label=${endLabel} onEnd=${()=>onEnd(s.over==='win')}/>`}
 </div></div>`;
}
