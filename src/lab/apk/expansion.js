import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';
import { key, threatenedPieces } from '../../game/rules.js';
import { THEMES, applyTheme } from '../../data/themes.js';
import { animate } from 'animejs';
import { APK_BY_ID, APK_CHAOS_EVENTS, APK_HORDE_UPGRADES } from './catalog.js';
import { createAPKPlayableMatch } from './playable-match.js';
import {
  clearAPKEffects, playAPKDeal, playAPKFall, playAPKDamage, playAPKTeleport,
  playAPKBombBlast, playAPKBeam, playAPKVictory, playAPKScreenShake,
  playAPKTransform, playAPKHotPotatoCrown, playAPKChaosRoulette
} from './effects.js';

const KN = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const DIR8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const shuffle = (items) => items.map(x => [Math.random(), x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const dist = (a,b) => Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
const boardOf = (rows=8,cols=8,holes=[]) => ({ rows, cols, holes:new Set(holes.map(([r,c])=>key(r,c))), protectRows:0 });

export async function mountAPKExpansion(root,id,themeId='walnut') {
  const meta=APK_BY_ID[id];
  if(!meta) throw new Error('No existe la entrada APK: '+id);
  applyTheme(THEMES[themeId]?themeId:'walnut');
  root.innerHTML='<main class="apk-proto"><header class="apk-head"><div><div class="apk-eyebrow">PROTOTIPO AISLADO · APK · NORMAL</div><h1></h1></div><a class="apk-back" href="lab-preview.html">Volver al banco</a></header><div class="apk-main"><section class="apk-board-frame"><div id="apk-board"></div></section><aside class="apk-panel panel"><div class="apk-kind"></div><p class="apk-desc"></p><div class="apk-objective"></div><div class="apk-status" role="status" aria-live="polite"></div><div class="apk-stats"></div><div class="apk-actions"></div><button class="btn sm apk-reset" type="button">Reiniciar prototipo</button><div class="apk-note">Estudio aislado del APK. No usa el motor de partidas, no guarda progreso ni entrega recompensas. Las reglas simplificadas se indican en cada escena.</div></aside></div></main>';
  const $=selector=>root.querySelector(selector);
  $('.apk-head h1').textContent='APK: '+meta.name;
  $('.apk-kind').textContent=meta.family==='mode'?'VARIANTE · ESTUDIO INTERACTIVO':meta.family==='party'?'MODO DE FIESTA · ESTUDIO INTERACTIVO':meta.family==='modifier'?'MODIFICADOR · MUESTRA AISLADA':'RECETA SECRETA · COMBINACIÓN VISUAL';
  $('.apk-desc').textContent=meta.description;
  const boardFrame=$('.apk-board-frame'),actions=$('.apk-actions');
  let host=$('#apk-board'),view=null,board=null,pieces=[],timer=null,state={};
  const say=value=>{$('.apk-status').textContent=value;};
  const stats=value=>{$('.apk-stats').textContent=value;};
  const goal=value=>{$('.apk-objective').textContent=value;};
  function stop(){
    if(timer){clearInterval(timer);timer=null;}
    if(boardFrame)clearAPKEffects(boardFrame);
    if(view)view.destroy();
    view=null;board=null;pieces=[];state={};
    actions.replaceChildren();say('');stats('');goal('');
  }
  function button(label,fn,primary=false){
    const el=document.createElement('button');el.type='button';el.className='btn sm'+(primary?' primary':'');el.textContent=label;
    // A callback may replace the action row and create its next button while the
    // shared busy lock is still held. Keep that new button disabled until the
    // current callback exits, otherwise a fast click is silently ignored.
    if(state.busy){el.disabled=true;el.dataset.busyPending='true';}
    el.addEventListener('click',async()=>{
      if(el.disabled||state.busy||state.over)return;
      el.disabled=true;state.busy=true;
      try{await fn();}catch(error){console.error('[APK expansion]',error);say('Falló la muestra. Reinicia la escena; el motor principal no se modificó.');}
      finally{
        state.busy=false;
        if(!state.over){
          el.disabled=false;
          for(const pending of actions.querySelectorAll('button[data-busy-pending]')){
            pending.disabled=false;delete pending.dataset.busyPending;
          }
        }
      }
    });
    actions.append(el);return el;
  }
  function labels(items){view?.setLabels(new Map(items.map(([r,c,label])=>[key(r,c),label])));}
  function doom(cells){view?.setDoom(cells||[]);}
  function pieceAt(r,c){return pieces.find(p=>p.row===r&&p.col===c);}
  function free(r,c,ignore=null){return !!board&&r>=0&&c>=0&&r<board.rows&&c<board.cols&&!board.holes.has(key(r,c))&&!pieces.some(p=>p!==ignore&&p.row===r&&p.col===c);}
  function randomFree(predicate=()=>true){
    const cells=[];for(let r=0;r<board.rows;r++)for(let c=0;c<board.cols;c++)if(free(r,c)&&predicate(r,c))cells.push([r,c]);
    return cells.length?pick(cells):null;
  }
  function add(p){pieces.push(p);view.addPiece(p);return p;}
  async function swap(a,b,duration=260){if(!a||!b||!view?.state.has(a)||!view.state.has(b))return;const ar=a.row,ac=a.col,br=b.row,bc=b.col,sa=view.state.get(a),sb=view.state.get(b);await Promise.all([animate(sa,{r:br,c:bc,z:[sa.z,view.sq*.25,0],duration:view.d(duration),ease:'outCubic',onUpdate:()=>view.apply(a)}),animate(sb,{r:ar,c:ac,z:[sb.z,view.sq*.25,0],duration:view.d(duration),ease:'outCubic',onUpdate:()=>view.apply(b)})]);a.row=br;a.col=bc;b.row=ar;b.col=ac;sa.r=br;sa.c=bc;sb.r=ar;sb.c=ac;sa.z=0;sb.z=0;view.apply(a);view.apply(b);}
  async function move(p,r,c,duration=220){
    if(!p||!view?.state.has(p)||!free(r,c,p))return false;
    const st=view.state.get(p);await animate(st,{r,c,z:[st.z,view.sq*.22,0],duration:view.d(duration),ease:'outCubic',onUpdate:()=>view.apply(p)});
    p.row=r;p.col=c;st.r=r;st.c=c;st.z=0;view.apply(p);return true;
  }
  async function remove(p,fx=true){
    if(!p||!view?.els.has(p))return;
    if(fx)await playAPKFall(boardFrame,view,{row:p.row,col:p.col});
    view.els.get(p)?.remove();view.els.delete(p);view.state.delete(p);pieces=pieces.filter(q=>q!==p);
  }
  async function build(nextBoard,nextPieces,onTap=()=>{}){
    if(view)view.destroy();
    host=document.createElement('div');host.id='apk-board';boardFrame.replaceChildren(host);
    board=nextBoard;pieces=nextPieces;
    view=new BoardView(host,{camera:'flat',vfx:false,shake:false,onTap});
    view.setBoard(board);view.setPieces(pieces);
    await playAPKDeal(view,pieces,boardFrame);
  }
  function kingsAndArmy(){
    return [
      makePiece('king','light',7,4,{royal:true}),makePiece('queen','light',7,3),makePiece('rook','light',7,0),makePiece('knight','light',6,1),makePiece('pawn','light',6,3),
      makePiece('king','dark',0,4,{royal:true}),makePiece('queen','dark',0,3),makePiece('rook','dark',0,7),makePiece('knight','dark',1,6),makePiece('pawn','dark',1,3)
    ];
  }

  async function startPotato(){
    const b=boardOf(),ps=kingsAndArmy(),crown={
      light:ps.find(p=>p.color==='light'&&p.type==='king'),
      dark:ps.find(p=>p.color==='dark'&&p.type==='king'),
    };
    for(const p of Object.values(crown))p.crown=true;
    state={mode:'potato',round:0,crown,pending:{light:null,dark:null},over:false};
    const paint=()=>view.setLabels(new Map(['light','dark'].flatMap(side=>{
      const now=state.crown[side],next=state.pending[side];
      return [[now?.row,now?.col,'♛'],[next?.row,next?.col,'✦']]
        .filter(([row,col])=>row!=null&&col!=null)
        .map(([row,col,label])=>[key(row,col),label]);
    })));
    let playable=null;
    await build(b,ps,hit=>playable?.tap(hit));
    playable=createAPKPlayableMatch({
      board:b,pieces:ps,view,boardFrame,say,stats,
      tick:match=>{
        const changes=[];
        if(match.turn>0&&match.turn%5===4){
          for(const side of ['light','dark']){
            const current=state.crown[side],own=match.pieces.filter(p=>p.color===side&&p!==current&&!p.big);
            const threatened=threatenedPieces(match.pieces,side,b);
            const safe=own.filter(p=>!threatened.has(p));
            state.pending[side]=pick(safe.length?safe:own)||null;
          }
          changes.push({type:'warning'});
        }else if(match.turn>0&&match.turn%5===0){
          for(const side of ['light','dark']){
            let next=state.pending[side];state.pending[side]=null;
            if(!next||!match.pieces.includes(next))next=pick(match.pieces.filter(p=>p.color===side&&p!==state.crown[side]&&!p.big));
            const old=state.crown[side];
            if(next&&old){
              old.crown=false;old.royal=false;
              next.crown=true;next.royal=true;
              state.crown[side]=next;
              changes.push({from:{row:old.row,col:old.col},to:{row:next.row,col:next.col}});
            }
          }
          state.round++;
        }
        return changes.length?{crownChanges:changes,warning:changes.some(x=>x.type==='warning'),round:state.round}:null;
      },
      onTransition:async(match,transition)=>{
        const tick=transition.tick;
        if(!tick)return;
        if(tick.warning){
          view.setDoom(['light','dark'].map(side=>state.pending[side]).filter(Boolean).map(p=>[p.row,p.col]));
          say('LA CORONA SE IMPACIENTA: los nuevos portadores están marcados. El cambio ocurre al siguiente turno.');
        }
        for(const change of tick.crownChanges||[]){
          if(change.from&&change.to)await playAPKHotPotatoCrown(boardFrame,view,change.from,change.to);
        }
        if((tick.crownChanges||[]).length){view.setDoom([]);paint();say('¡NUEVOS REYES! Las piezas coronadas conservan su propio movimiento, pero ahora son el objetivo real.');}
        stats('Turno '+(match.turn+1)+' · Cambio de corona cada cinco turnos');
      },
      onGameOver:()=>{state.over=true;},
    });
    goal('Rey Patata Caliente: partida contra IA. Cada cinco turnos la corona pasa a otra pieza segura de cada bando; capturar al portador elimina ese bando.');
    paint();
    await playable.start();
  }

  function pickEventTarget(event){
    const own=side=>pieces.filter(p=>p.color===side);
    if(['giant'].includes(event.id)){const p=pick(pieces.filter(p=>!['king','pawn'].includes(p.type)&&!p.crown));return p?{pids:[p.id]}:null;}
    if(['hop','promote'].includes(event.id)){const a=pick(own('light').filter(p=>p.type==='pawn')),b=pick(own('dark').filter(p=>p.type==='pawn'));return a&&b?{pids:[a.id,b.id]}:null;}
    if(event.id==='freeze'){const a=pick(own('light').filter(p=>p.type!=='king')),b=pick(own('dark').filter(p=>p.type!=='king'));return a&&b?{pids:[a.id,b.id]}:null;}
    if(event.id==='swap'){
      for(const type of ['pawn','knight','bishop','rook','queen']){const a=pick(own('light').filter(p=>p.type===type)),b=pick(own('dark').filter(p=>p.type===type));if(a&&b)return{pids:[a.id,b.id]};}
      return null;
    }
    const count=event.id==='bombs'?3:['portals','lava'].includes(event.id)?2:1;
    const cells=[];
    if(event.id==='bombs'){
      const empty=[];for(let r=0;r<board.rows;r++)for(let c=0;c<board.cols;c++)if(free(r,c)&&r>1&&c>1&&r<board.rows-2&&c<board.cols-2)empty.push([r,c]);
      const occupied=pieces.filter(p=>p.type!=='king'&&!p.crown&&!p.big&&!p.neutral).map(p=>[p.row,p.col]);
      for(const q of shuffle([...empty,...occupied]))if(!cells.some(([r,c])=>r===q[0]&&c===q[1])){cells.push(q);if(cells.length===count)break;}
    }else for(let i=0;i<count;i++){const q=randomFree((r,c)=>r>1&&c>1&&r<board.rows-2&&c<board.cols-2);if(q)cells.push(q);}
    return cells.length===count?{cells}:null;
  }
  async function spinRoulette(){
    if(state.pending){say('Resuelve primero el evento anunciado.');return;}
    if(!state.bag?.length)state.bag=shuffle(APK_CHAOS_EVENTS.map(e=>e.id));
    let event=null,target=null,tries=0;
    while(state.bag.length&&tries++<APK_CHAOS_EVENTS.length&&!target){
      event=APK_CHAOS_EVENTS.find(e=>e.id===state.bag.pop());target=pickEventTarget(event);
    }
    if(!event||!target){say('No hay objetivo disponible para la ruleta. Reinicia la muestra.');return;}
    state.pending={event,...target};state.ply=(state.ply||0)+1;
    const marks=[...(target.cells||[])];
    for(const id of target.pids||[]){const p=pieces.find(q=>q.id===id);if(p)marks.push([p.row,p.col]);}
    doom(marks);
    await playAPKChaosRoulette(boardFrame,view,event.name,'EN 1 TURNO · '+event.description,event.color);
    say('LA RULETA HA HABLADO: '+event.name+'. Objetivo marcado; avanza un turno para resolverlo.');
    stats('Eventos: '+(state.events||0)+' · Bolsa sin repetición: '+state.bag.length+'/12');
  }
  async function resolveRoulette(){
    const n=state.pending;if(!n){say('Gira la ruleta para anunciar un evento primero.');return;}
    state.pending=null;doom([]);const event=n.event;
    if(event.id==='wall'||event.id==='hole'){
      for(const [r,c] of n.cells){const p=pieceAt(r,c);if(p&&p.type!=='king'&&!p.crown&&!p.big)await remove(p,true);if(event.id==='hole'){board.holes.add(key(r,c));view.tiles.get(key(r,c))?.classList.add('icehole');}else view.tiles.get(key(r,c))?.classList.add('block');}
    }else if(event.id==='giant'){
      const p=pieces.find(q=>q.id===n.pids[0]);if(p){p.big=true;view.els.get(p)?.classList.add('apk-bighead');labels([[p.row,p.col,'✦']]);}
    }else if(event.id==='swap'){
      const [a,b]=n.pids.map(id=>pieces.find(p=>p.id===id));if(a&&b){const ar=a.row,ac=a.col,br=b.row,bc=b.col;await swap(a,b);await playAPKTeleport(boardFrame,view,{row:ar,col:ac},{row:br,col:bc});}
    }else if(event.id==='hop'){
      for(const id of n.pids){const p=pieces.find(q=>q.id===id);if(p){p.hop=1;view.els.get(p)?.classList.add('apk-floating');}}
    }else if(event.id==='neutral'||event.id==='duck'){
      const [r,c]=n.cells[0];const p=makePiece('pawn','dark',r,c,{neutral:true,duck:event.id==='duck'});add(p);view.els.get(p)?.classList.add('apk-chicken');labels([[r,c,event.id==='duck'?'🦆':'◌']]);
    }else if(event.id==='bombs'){
      for(const [r,c] of n.cells){await playAPKBombBlast(boardFrame,view,{row:r,col:c},[[r,c]].map(([row,col])=>({row,col})));const p=pieceAt(r,c);if(p&&p.type!=='king'&&!p.crown&&!p.big&&!p.neutral)await remove(p,false);}
    }else if(event.id==='portals'){
      state.portals=n.cells;labels(n.cells.map(([r,c],i)=>[r,c,i?'↗':'↙']));
    }else if(event.id==='freeze'){
      for(const id of n.pids){const p=pieces.find(q=>q.id===id);if(p){p.frozen=2;view.els.get(p)?.classList.add('fogged');}}
    }else if(event.id==='lava'){
      for(const [r,c] of n.cells){const p=pieceAt(r,c);if(p&&p.type!=='king'&&!p.crown&&!p.big&&!p.neutral)await remove(p,true);view.tiles.get(key(r,c))?.classList.add('hot');}
    }else if(event.id==='promote'){
      for(const id of n.pids){const p=pieces.find(q=>q.id===id);if(p){p.type='queen';view.remake(p);await playAPKTransform(boardFrame,view,{row:p.row,col:p.col});}}
    }
    state.events=(state.events||0)+1;say('Evento resuelto: '+event.name+'. La bolsa evita repetirlo hasta agotar las doce entradas.');stats('Eventos resueltos: '+state.events+' · Restantes en la bolsa: '+state.bag.length);
  }
  async function startChaos(){
    const b=boardOf(),ps=kingsAndArmy();
    const powers=['knight','rook2','bishop2','king'];
    for(const p of ps.filter(p=>p.type!=='king'))p.extraMoveTypes=[pick(powers)];
    state={mode:'chaos',events:0,over:false};
    let playable=null;
    await build(b,ps,hit=>playable?.tap(hit));
    playable=createAPKPlayableMatch({
      board:b,pieces:ps,view,boardFrame,say,stats,modifier:'chaos',
      tick:match=>{
        if(match.turn===0||match.turn%3!==0)return null;
        const empty=[];
        for(let row=2;row<b.rows-2;row++)for(let col=1;col<b.cols-1;col++){
          if(!b.holes.has(key(row,col))&&!match.pieces.some(p=>p.row===row&&p.col===col))empty.push([row,col]);
        }
        if(!empty.length)return null;
        const [row,col]=pick(empty);b.holes.add(key(row,col));state.events++;
        return{newHole:{row,col},events:state.events};
      },
      onTransition:(match,transition)=>{
        if(transition.collapse)for(const [row,col] of transition.collapse)view.tiles.get(key(row,col))?.classList.add('icehole');
        if(transition.tick?.newHole){
          const {row,col}=transition.tick.newHole;view.tiles.get(key(row,col))?.classList.add('icehole');
          say('EVENTO CHAOS '+transition.tick.events+': apareció un nuevo vacío. Evita perder piezas en los huecos.');
        }
        stats('Turno '+(match.turn+1)+' · Eventos: '+state.events+' · Huecos: '+b.holes.size);
      },
      onGameOver:()=>{state.over=true;},
    });
    for(const p of ps.filter(p=>p.extraMoveTypes?.length))view.els.get(p)?.classList.add('mutated');
    goal('Chaos Chess: todas las piezas tienen un movimiento prestado; el borde cae y aparecen huecos durante la partida. Captura el rey rival.');
    await playable.start();
  }

  async function startBoss2(){
    const b=boardOf(),ps=kingsAndArmy().filter(p=>p.color==='light');
    const boss=makePiece('boss-titan','dark',0,3,{
      boss:'titan',h:2,w:2,hp:18,maxHp:18,name:'Jefe',royal:true,moves:['queen']
    });
    ps.push(boss);
    ps.push(makePiece('rook','dark',0,0),makePiece('knight','dark',1,0),makePiece('pawn','dark',2,2),makePiece('pawn','dark',2,5));
    state={mode:'boss2',boss,pending:null,attackCount:0,over:false};
    let playable=null;
    await build(b,ps,hit=>playable?.tap(hit));
    playable=createAPKPlayableMatch({
      board:b,pieces:ps,view,boardFrame,say,stats,
      tick:match=>{
        if(state.pending){
          const attack=state.pending;state.pending=null;
          const lost=match.pieces.filter(p=>p!==boss&&attack.cells.some(([row,col])=>row===p.row&&col===p.col));
          for(const p of lost)match.pieces.splice(match.pieces.indexOf(p),1);
          state.attackCount++;
          return{attackResolved:attack,lost,attackCount:state.attackCount};
        }
        if(match.turn>0&&match.turn%4===0){
          const type=pick(['row','col','cross','box']),row=1+Math.floor(Math.random()*6),col=1+Math.floor(Math.random()*6),cells=[];
          if(type==='row'||type==='cross')for(let x=0;x<8;x++)cells.push([row,x]);
          if(type==='col'||type==='cross')for(let y=0;y<8;y++)if(!cells.some(([rr,cc])=>rr===y&&cc===col))cells.push([y,col]);
          if(type==='box')for(let y=row-1;y<=row+1;y++)for(let x=col-1;x<=col+1;x++)if(y>=0&&x>=0&&y<8&&x<8)cells.push([y,x]);
          state.pending={type,cells};
          return{attackWarning:state.pending};
        }
        return null;
      },
      onTransition:async(match,transition)=>{
        if(transition.tick?.attackWarning){
          view.setDoom(transition.tick.attackWarning.cells);
          say('EL JEFE TELEGRAFÍA '+transition.tick.attackWarning.type.toUpperCase()+'. Mueve tus piezas antes de la siguiente detonación.');
        }
        if(transition.tick?.attackResolved){
          view.setDoom([]);
          for(const p of transition.tick.lost){
            await playAPKDamage(boardFrame,view,{row:p.row,col:p.col},'red');
            view.els.get(p)?.remove();view.els.delete(p);view.state.delete(p);
          }
          say('Ataque del jefe resuelto: '+transition.tick.lost.length+' piezas alcanzadas.');
        }
        stats('Jefe: '+boss.hp+'/'+boss.maxHp+' HP · Turno '+(match.turn+1)+' · Ataques: '+state.attackCount);
      },
      onGameOver:result=>{state.over=true;say(result?.victory?'¡Jefe derrotado!':'Tu rey cayó ante el jefe.');},
    });
    goal('Boss Chess 2.0: combate real contra jefe de 2×2 con 18 HP. El jefe anuncia fila, columna, cruz o área 3×3 que golpea tras un turno; captura al jefe para ganar.');
    labels([[0,3,'✦'],[0,4,'✦'],[1,3,'✦'],[1,4,'✦']]);
    await playable.start();
    stats('Jefe: '+boss.hp+'/'+boss.maxHp+' HP · Turno 1');
  }

  function rollArmy(){
    const cost={queen:9,rook:5,bishop:3,knight:3,pawn:1},weight={queen:1.1,rook:2,bishop:2.2,knight:2.2,pawn:3.4};
    for(let attempt=0;attempt<200;attempt++){
      let budget=39,queens=0,list=[];
      while(budget>0&&list.length<15){
        const options=Object.keys(cost).filter(type=>cost[type]<=budget&&!(type==='queen'&&queens>=2));
        let value=Math.random()*options.reduce((sum,type)=>sum+weight[type],0),chosen=options[0];
        for(const type of options){value-=weight[type];if(value<=0){chosen=type;break;}}
        list.push(chosen);budget-=cost[chosen];if(chosen==='queen')queens++;
      }
      if(budget===0)return list;
    }
    return 'rook knight bishop queen bishop knight rook pawn pawn pawn pawn pawn pawn pawn pawn'.split(' ');
  }
  function placeArmy(types,color,backRow,pawnRow){
    const cost={queen:9,rook:5,bishop:3,knight:3,pawn:1},pieces=[],kingCol=3+Math.floor(Math.random()*2);
    pieces.push(makePiece('king',color,backRow,kingCol,{royal:true}));
    const back=shuffle(Array.from({length:8},(_,i)=>i).filter(c=>c!==kingCol)),front=shuffle(Array.from({length:8},(_,i)=>i));
    for(const type of types.filter(t=>t==='pawn')){const c=front.length?front.pop():back.pop();if(c!==undefined)pieces.push(makePiece(type,color,pawnRow,c));}
    for(const type of types.filter(t=>t!=='pawn')){const c=back.length?back.pop():front.pop();if(c!==undefined)pieces.push(makePiece(type,color,backRow,c));}
    return pieces;
  }
  async function startRandomArmy(){
    let same=true,playable=null;
    const draw=async()=>{
      state.over=false;
      playable?.destroy();
      const a=rollArmy(),armyB=same?a:rollArmy(),ps=[...placeArmy(a,'light',7,6),...placeArmy(armyB,'dark',0,1)],gameBoard=boardOf();
      await build(gameBoard,ps,hit=>playable?.tap(hit));
      playable=createAPKPlayableMatch({board:gameBoard,pieces:ps,view,boardFrame,say,stats,onGameOver:()=>{state.over=true;}});
      await playable.start();
      const value=arr=>arr.reduce((sum,t)=>sum+({queen:9,rook:5,bishop:3,knight:3,pawn:1})[t],0);
      stats('Claras: '+value(a)+' puntos · Carmesí: '+value(armyB)+' puntos · '+(same?'Mismo caos':'Cada uno el suyo')+' · Toca piezas para jugar');
    };
    state={mode:'randarmy',over:false};await draw();
    button('Mismo caos: volver a sortear',async()=>{same=true;await draw();},true);
    button('Cada uno el suyo: sortear dos',async()=>{same=false;await draw();});
    goal('La tirada reparte ejércitos de exactamente 39 puntos más el rey. El APK permite compartir la misma composición o sortear una distinta para cada bando.');
  }

  async function startGiant(){
    const b=boardOf(12,12),ps=[],back=['rook','cannon','knight','bishop','queen','king','rook','bishop','knight','rook','cannon','rook'];
    for(let c=0;c<12;c++){
      for(const [color,row,pawnRow] of [['dark',0,1],['light',11,10]]){
        const type=back[c],p=makePiece(type,color,row,c,{royal:type==='king'});
        if(c===3){p.apkHybrid='archbishop';p.type='bishop';p.extraMoveTypes=['knight'];}
        if(c===4){p.apkHybrid='chancellor';p.type='rook';p.extraMoveTypes=['knight'];}
        ps.push(p);
        ps.push(makePiece(c===0||c===11?'camel':'pawn',color,pawnRow,c));
        ps.push(makePiece('pawn',color,color==='dark'?2:9,c));
      }
    }
    state={mode:'giant',over:false};
    let playable=null;
    await build(b,ps,hit=>playable?.tap(hit));
    for(const p of pieces)if(p.apkHybrid)view.els.get(p)?.classList.add('apk-hybrid-'+p.apkHybrid);
    playable=createAPKPlayableMatch({board:b,pieces:ps,view,boardFrame,say,stats,onGameOver:()=>{state.over=true;}});
    goal('Tablero 12×12 jugable contra IA. Arzobispo = alfil + caballo; canciller = torre + caballo; camello salta 3+1; cañón captura saltando una pantalla.');
    stats('144 casillas · 4 piezas especiales · Tu turno');
    await playable.start();
  }

  function partyArmies(type){
    const back=Array(8).fill(type);back[4]='king';const front=Array(8).fill(type),ps=[];
    for(let c=0;c<8;c++){ps.push(makePiece(back[c],'dark',0,c,{royal:back[c]==='king'}),makePiece(front[c],'dark',1,c),makePiece(back[c],'light',7,c,{royal:back[c]==='king'}),makePiece(front[c],'light',6,c));}
    return ps;
  }
  async function startParty(){
    const id=meta.id;
    state={mode:'party',id,over:false};
    let playable=null;
    const launch=async(b,ps,opts={})=>{
      await build(b,ps,hit=>playable?.tap(hit));
      playable=createAPKPlayableMatch({
        board:b,pieces:ps,view,boardFrame,say,stats,
        onGameOver:()=>{state.over=true;if(timer){clearInterval(timer);timer=null;}},
        ...opts,
      });
      await playable.start();
      return playable;
    };
    if(['pqueen','ppawn','horse'].includes(id)){
      const type={pqueen:'queen',ppawn:'pawn',horse:'knight'}[id],b=boardOf(),ps=partyArmies(type);
      await launch(b,ps);
      goal(meta.description+' Partida contra IA: mueve, captura y gana al capturar su rey.');
      stats('15 '+type+'s + 1 rey por bando · Tu turno');
      return;
    }
    if(id==='speed'){
      let seconds=3;
      const startClock=()=>{
        if(timer)clearInterval(timer);
        seconds=3;
        say('Tu turno · '+seconds+' s para mover.');
        timer=setInterval(()=>{
          seconds--;
          say('Tu turno · '+Math.max(0,seconds)+' s.');
          if(seconds<=0){
            clearInterval(timer);timer=null;
            say('Tiempo agotado: pierdes el turno. La IA juega ahora.');
            playable?.pass();
          }
        },1000);
      };
      const b=boardOf(),ps=kingsAndArmy();
      await launch(b,ps,{onTransition:match=>{
        if(match.player.color==='light'&&!match.over)startClock();
        else if(timer){clearInterval(timer);timer=null;}
      }});
      startClock();
      goal('Tres segundos por jugada. Selecciona una pieza y un destino legal; si se agota el reloj, pierdes el turno y responde la IA.');
      return;
    }
    if(id==='invis'){
      const b=boardOf(),ps=kingsAndArmy();
      await launch(b,ps,{
        onMove:(match,result)=>{
          const p=result.piece,el=view.els.get(p);
          if(result.victims?.length){el?.style.setProperty('opacity','1');return;}
          el?.style.setProperty('opacity','.06');
          p.apkInvisible=true;
        },
      });
      goal('Las piezas se vuelven casi invisibles después de moverse. Siguen ocupando su casilla y pueden ser capturadas si descubres su posición.');
      return;
    }
    if(id==='drunk'){
      const b=boardOf(),ps=kingsAndArmy();
      await launch(b,ps,{
        beforeMove:(match,p,target)=>{
          const move=match.legal(p).find(m=>m.row===target.row&&m.col===target.col);
          if(!move||move.hits.length||Math.random()>=.15)return target;
          const drift=match.legal(p).filter(m=>!m.hits.length&&Math.max(Math.abs(m.row-target.row),Math.abs(m.col-target.col))===1);
          if(!drift.length)return target;
          const chosen=pick(drift);
          say('¡Desvío! El movimiento terminó en una casilla vecina.');
          return{row:chosen.row,col:chosen.col};
        },
      });
      goal('Partida contra IA. El 15 % de los movimientos sin captura se desvía a un destino legal vecino; las capturas no se desvían.');
      return;
    }
    if(id==='chicken'){
      const b=boardOf(),ps=kingsAndArmy();
      await launch(b,ps,{
        configureMatch:match=>{
          const legal=match.legal.bind(match);
          match.legal=piece=>legal(piece).filter(move=>!move.hits.some(v=>v.neutral));
        },
        onMove:(match,result)=>{
          for(const victim of result.victims||[]){
            if(!victim.killed)continue;
            const at={row:victim.piece.row,col:victim.piece.col};
            const cells=DIR8.map(([dr,dc])=>[at.row+dr,at.col+dc]).filter(([rr,cc])=>rr>=0&&cc>=0&&rr<b.rows&&cc<b.cols&&!match.pieces.some(p=>p.row===rr&&p.col===cc));
            const q=pick(cells);
            if(!q)continue;
            const hen=makePiece('pawn',victim.piece.color,q[0],q[1],{neutral:true,chicken:true});
            match.pieces.push(hen);view.addPiece(hen);view.els.get(hen)?.classList.add('apk-chicken');
          }
        },
        tick:match=>{
          const moves=[];
          for(const hen of match.pieces.filter(p=>p.neutral)){
            const options=DIR8.map(([dr,dc])=>[hen.row+dr,hen.col+dc]).filter(([rr,cc])=>rr>=0&&cc>=0&&rr<b.rows&&cc<b.cols&&!match.pieces.some(p=>p!==hen&&p.row===rr&&p.col===cc));
            const q=pick(options);
            if(q){moves.push({piece:hen,from:{row:hen.row,col:hen.col},to:{row:q[0],col:q[1]}});hen.row=q[0];hen.col=q[1];}
          }
          return moves.length?{chickens:moves}:null;
        },
        onTransition:async(match,transition)=>{
          for(const move of transition.tick?.chickens||[]){
            const st=view.state.get(move.piece);if(!st)continue;
            await animate(st,{r:move.to.row,c:move.to.col,duration:view.d(150),ease:'outCubic',onUpdate:()=>view.apply(move.piece)});
            st.r=move.to.row;st.c=move.to.col;st.z=0;view.apply(move.piece);
          }
        },
      });
      goal('Capturar una pieza hace aparecer una gallina neutral cerca de donde cayó. No se puede capturar; se mueve al terminar cada turno y bloquea casillas.');
      return;
    }
    if(id==='bullet'){
      const b=boardOf(),ps=kingsAndArmy();
      await launch(b,ps,{
        onMove:async(match,result)=>{
          if(result.bounced)return;
          const piece=result.piece,dr=Math.sign(result.to.row-result.from.row),dc=Math.sign(result.to.col-result.from.col);
          if(!dr&&!dc)return;
          let r=piece.row+dr,c=piece.col+dc,target=null;
          while(r>=0&&c>=0&&r<b.rows&&c<b.cols){
            target=match.pieces.find(p=>p!==piece&&p.row===r&&p.col===c)||null;
            if(target)break;
            r+=dr;c+=dc;
          }
          if(!target)return;
          await playAPKBeam(boardFrame,view,{row:piece.row,col:piece.col},{row:target.row,col:target.col},'#fff36b');
          match.pieces.splice(match.pieces.indexOf(target),1);
          view.els.get(target)?.remove();view.els.delete(target);view.state.delete(target);
          say('¡BANG! El proyectil alcanzó a '+(target.color===piece.color?'una pieza propia':'una pieza rival')+'.');
        },
      });
      goal('Después de moverse, cada pieza dispara en la dirección del movimiento. La bala destruye la primera pieza que encuentre, incluso del mismo bando.');
      return;
    }
    if(id==='anti'){
      const b=boardOf(),ps=kingsAndArmy();
      await launch(b,ps,{
        configureMatch:match=>{
          for(const p of match.pieces)p.royal=false;
          const legal=match.legal.bind(match);
          match.legal=piece=>{
            const moves=legal(piece),captures=moves.filter(move=>move.hits.length);
            return captures.length?captures:moves;
          };
        },
        objective:match=>{
          const light=match.pieces.some(p=>p.color==='light'),dark=match.pieces.some(p=>p.color==='dark');
          if(!light&&!dark)return{tie:true};
          if(!light)return{victory:false};
          if(!dark)return{victory:true};
          return null;
        },
      });
      goal('Antiajedrez contra IA: las capturas son obligatorias. No existe rey ni jaque; gana quien se queda primero sin piezas.');
      return;
    }
    if(id==='p4'){
      const holes=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++)holes.push([r,c],[r,13-c],[13-r,c],[13-r,13-c]);
      const b=boardOf(14,14,holes),ps=[],sides=[
        {team:1,color:'light',cells:Array.from({length:8},(_,i)=>[13,3+i])},
        {team:2,color:'dark',cells:Array.from({length:8},(_,i)=>[3+i,0])},
        {team:3,color:'dark',cells:Array.from({length:8},(_,i)=>[0,3+i])},
        {team:4,color:'light',cells:Array.from({length:8},(_,i)=>[3+i,13])}
      ];
      const ranksA=['rook','knight','bishop','queen','king','bishop','knight','rook'],ranksB=['rook','knight','bishop','king','queen','bishop','knight','rook'];
      sides.forEach(side=>side.cells.forEach(([r,c],i)=>{const ranks=side.team<=2?ranksA:ranksB,type=ranks[i],p=makePiece(type,side.color,r,c,{royal:type==='king',apkTeam:side.team});ps.push(p);const pawnCell=side.team===1?[r-1,c]:side.team===2?[r,c+1]:side.team===3?[r+1,c]:[r,c-1];if(pawnCell[0]>=0&&pawnCell[1]>=0&&pawnCell[0]<14&&pawnCell[1]<14&&!b.holes.has(key(...pawnCell)))ps.push(makePiece('pawn',side.color,pawnCell[0],pawnCell[1],{apkTeam:side.team}));}));
      await build(b,ps,hit=>{const p=pieceAt(hit.row,hit.col);if(p)say('Bando '+p.apkTeam+'. Direcciones originales: rojo arriba, azul derecha, amarillo abajo, verde izquierda. Turnos en ese orden.');});
      for(const p of pieces)view.els.get(p)?.classList.add('apk-team-'+p.apkTeam);
      goal('Tablero en cruz 14×14. Conserva la geometría y los cuatro bandos; el turno rotativo de cuatro jugadores y la eliminación por rey todavía no están conectados.');
      stats('14×14 · 4 ejércitos · 4 reyes');
      return;
    }
  }

  async function startHorde(){
    const gameBoard=boardOf(),king=makePiece('king','light',7,4,{royal:true});
    state={mode:'horde',draft:[],wave:0,kills:0,crowns:0,upgrades:{},upgradePending:false,complete:false,over:false};
    let playable=null;
    await build(gameBoard,[king],hit=>playable?.tap(hit));
    goal('Elige tres piezas. Después juega una partida por turnos contra oleadas controladas por IA. Limpia cinco oleadas y conserva tu rey para ganar.');
    stats('Rey + 3 piezas · Meta: 5 oleadas');
    const draft=['knight','bishop','rook','pawn','camel','cannon'];
    actions.replaceChildren();
    for(const type of draft)button('Elegir '+type,async()=>{
      if(state.draft.length>=3||state.draft.includes(type))return;
      const q=randomFree((r,c)=>r>=5);
      if(!q)return;
      add(makePiece(type,'light',q[0],q[1]));
      state.draft.push(type);
      say('Selección: '+state.draft.join(', ')+' ('+state.draft.length+'/3).');
      stats('Piezas elegidas: '+state.draft.length+'/3');
      if(state.draft.length===3){
        actions.replaceChildren();
        button('Comenzar oleada 1',async()=>{
          playable=createAPKPlayableMatch({
            board:gameBoard,pieces,view,boardFrame,say,stats,
            objective:match=>{
              if(!match.pieces.some(p=>p.color==='light'&&p.type==='king'&&p.royal))return{victory:false};
              return state.complete?{victory:true}:null;
            },
            tick:match=>{
              if(state.upgradePending||match.turn<2||match.turn%2!==0)return null;
              if(match.pieces.some(p=>p.color==='dark'))return null;
              if(state.wave>=5){state.complete=true;return{complete:true};}
              state.upgradePending=true;
              return{upgrade:true,cleared:state.wave};
            },
            onMove:(match,result)=>{
              for(const v of result.victims||[])if(v.killed&&v.piece.color==='dark'){
                state.kills++;state.crowns++;
              }
              stats('Oleada '+state.wave+' · Bajas: '+state.kills+' · Coronas: '+state.crowns+' · Enemigos: '+match.pieces.filter(p=>p.color==='dark').length);
            },
            onTransition:(match,transition)=>{
              if(transition.tick?.complete)say('¡Cinco oleadas superadas! El rey sigue en pie.');
              if(transition.tick?.upgrade)offerUpgrades(match);
            },
            onGameOver:()=>{state.over=true;actions.replaceChildren();}
          });
          spawnWave(playable.match);
          actions.replaceChildren();
          await playable.start();
          say('Oleada 1. Mueve tus piezas y captura a los invasores; el rival responde con jugadas legales.');
          stats('Oleada 1 · Enemigos: '+pieces.filter(p=>p.color==='dark').length+' · Coronas: 0');
        },true);
      }
    });
    function spawnWave(match){
      state.wave++;
      const n=Math.min(8,2+state.wave);
      const types=state.wave<3?['pawn','pawn','knight']:['pawn','knight','bishop','rook'];
      const spawned=[];
      if(state.wave===5){
        const q=randomFree((r,c)=>r<=1&&c>=2&&c<=5);
        if(q)spawned.push(makePiece('queen','dark',q[0],q[1],{boss:'titan',hp:8,maxHp:8}));
      }
      for(let i=0;i<n;i++){
        const q=randomFree((r,c)=>r<=2);
        if(q)spawned.push(makePiece(pick(types),'dark',q[0],q[1]));
      }
      for(const p of spawned){match.pieces.push(p);view.addPiece(p);}
      say('OLEADA '+state.wave+' · '+spawned.length+' enemigos'+(state.wave===5?' · MINIBOSS':'')+'. La IA controla las piezas carmesí.');
      stats('Oleada '+state.wave+' · Enemigos: '+match.pieces.filter(p=>p.color==='dark').length+' · Coronas: '+state.crowns);
    }
    function rollOffers(){
      const pool=APK_HORDE_UPGRADES.filter(up=>!up.once||!state.upgrades[up.id]);
      const offers=[];
      while(pool.length&&offers.length<3){
        const total=pool.reduce((sum,up)=>sum+up.weight,0);
        let roll=Math.random()*total,index=0;
        for(;index<pool.length-1;index++){roll-=pool[index].weight;if(roll<=0)break;}
        offers.push(pool.splice(index,1)[0]);
      }
      return offers;
    }
    function applyUpgrade(match,up){
      state.upgrades[up.id]=true;
      if(up.piece){
        for(let i=0;i<(up.count||1);i++){
          const q=randomFree((r,c)=>r>=5);
          if(!q)continue;
          const extra=up.hybrid==='archbishop'?{extraMoveTypes:['knight'],apkHybrid:'archbishop'}:{};
          const p=makePiece(up.piece,'light',q[0],q[1],extra);
          match.pieces.push(p);view.addPiece(p);
          if(up.hybrid)view.els.get(p)?.classList.add('apk-hybrid-'+up.hybrid);
        }
      }
      if(up.id==='queen2')for(const p of match.pieces.filter(p=>p.color==='light'&&p.type==='queen')){p.hp=2;p.maxHp=2;view.remake(p);}
      if(up.id==='shieldwall')for(const p of match.pieces.filter(p=>p.color==='light'&&p.type==='pawn')){p.hp=2;p.maxHp=2;view.remake(p);}
      if(up.id==='rage')for(const p of match.pieces.filter(p=>p.color==='light'&&p.type==='queen'))p.extraMoveTypes=[...(p.extraMoveTypes||[]),'knight'];
      if(up.id==='archer')for(const p of match.pieces.filter(p=>p.color==='light'&&p.type==='bishop'))p.extraMoveTypes=[...(p.extraMoveTypes||[]),'knight'];
      if(up.id==='fwdcap')for(const p of match.pieces.filter(p=>p.color==='light'&&p.type==='pawn'))p.extraMoveTypes=[...(p.extraMoveTypes||[]),'pawnBack'];
      if(['bighead','lowgrav','cold','ghost','zap'].includes(up.id))for(const p of match.pieces.filter(p=>p.color==='light'))view.els.get(p)?.classList.add('apk-upgraded');
      state.upgradePending=false;
      actions.replaceChildren();
      if(state.wave>=5){state.complete=true;match.checkOver();if(match.over){say('¡Cinco oleadas superadas!');return;}}
      spawnWave(match);
      say('Mejora elegida: '+up.name+'. La siguiente oleada ya ha entrado.');
    }
    function offerUpgrades(match){
      actions.replaceChildren();
      const offers=rollOffers();
      say('OLEADA '+state.wave+' SUPERADA · Elige una mejora antes de la siguiente.');
      for(const up of offers)button(up.name,async()=>applyUpgrade(match,up),true);
      button('Cambiar cartas (1 corona)',async()=>{
        if(state.crowns<1){say('No tienes Coronas de Horda suficientes.');return;}
        state.crowns--;
        actions.replaceChildren();
        for(const up of rollOffers())button(up.name,async()=>applyUpgrade(match,up),true);
        stats('Coronas: '+state.crowns+' · Nuevas mejoras disponibles');
      });
      stats('Oleada '+state.wave+' limpia · Bajas: '+state.kills+' · Coronas: '+state.crowns);
    }
  }

  async function startModifier(){
    const ps=kingsAndArmy();state={mode:'modifier',id,over:false};await build(boardOf(),ps);
    const pawn=()=>pieces.find(p=>p.color==='light'&&p.type==='pawn'),knight=()=>pieces.find(p=>p.color==='light'&&p.type==='knight');
    button('Aplicar muestra',async()=>{
      if(id==='ktele'&&knight()){const p=knight(),q=randomFree((r,c)=>dist(p,{row:r,col:c})<=3&&dist(p,{row:r,col:c})>1);if(q){const from={row:p.row,col:p.col};await move(p,q[0],q[1]);await playAPKTeleport(boardFrame,view,from,{row:q[0],col:q[1]});}}
      else if(id==='boom'){const center={row:3,col:3};await playAPKBombBlast(boardFrame,view,center,[[2,3],[3,2],[3,3],[3,4],[4,3]].map(([row,col])=>({row,col})));}
      else if(id==='php'&&pawn()){pawn().hp=3;pawn().maxHp=3;view.remake(pawn());labels([[pawn().row,pawn().col,'3♥']]);}
      else if(id==='enr'){const q=pieces.find(p=>p.color==='light'&&p.type==='queen');view.showMoves(new Set(KN.map(([dr,dc])=>key(q.row+dr,q.col+dc))),new Set());}
      else if(id==='grav'){for(const p of pieces.slice().sort((a,b)=>b.row-a.row)){if(free(p.row+1,p.col,p))await move(p,p.row+1,p.col,100);}}
      else if(id==='fast'&&pawn()){const p=pawn();if(free(p.row-2,p.col,p))await move(p,p.row-2,p.col);}
      else if(id==='dk'&&knight()){const p=knight();for(const [dr,dc] of KN){const r=p.row+dr,c=p.col+dc;if(free(r,c,p)){await move(p,r,c,130);break;}}const q=KN.map(([dr,dc])=>[p.row+dr,p.col+dc]).find(([r,c])=>free(r,c,p));if(q)await move(p,q[0],q[1],130);}
      else if(id==='abil'||id==='ev')await playAPKChaosRoulette(boardFrame,view,id==='abil'?'PODER PARA TODOS':'EVENTO GLOBAL','MUESTRA DEL MODIFICADOR',id==='abil'?'#9b4dff':'#ffc83d');
      else if(id==='zc'){const target=pieces.find(p=>p.color==='dark'&&p.type==='pawn');if(target){const at={row:target.row,col:target.col};target.zombie=true;view.els.get(target)?.classList.add('zombie');await playAPKTransform(boardFrame,view,at);}}
      else if(id==='sudden'){const target=pieces.find(p=>p.color==='dark'&&p.type==='pawn');if(target)await remove(target,true);state.over=true;}
      else if(id==='fog'){for(const p of pieces.filter(p=>p.color==='dark'&&dist(p,{row:7,col:4})>2))view.els.get(p)?.style.setProperty('opacity','.05');}
      else if(id==='randpromo'&&pawn()){const p=pawn(),at={row:p.row,col:p.col};p.type=pick(['queen','rook','bishop','knight','camel']);view.remake(p);await playAPKTransform(boardFrame,view,at);}
      else if(id==='extrapawns'){for(let c=0;c<8;c++){if(free(2,c))add(makePiece('pawn','dark',2,c));if(free(5,c))add(makePiece('pawn','light',5,c));}}
      else if(id==='ice'){const p=pieces.find(p=>p.color==='light'&&p.type==='rook');let c=p.col;while(c<7&&free(p.row,c+1,p))c++;if(c!==p.col)await move(p,p.row,c,240);}
      else if(id==='hotfloor'){const hot=[];for(let i=0;i<4;i++){const q=randomFree((r,c)=>r>1&&r<7);if(q)hot.push(q);}doom(hot);labels(hot.map(([r,c])=>[r,c,'🔥']));}
      else if(id==='royalswap'){const k=pieces.find(p=>p.color==='light'&&p.type==='king'),q=pieces.find(p=>p.color==='light'&&p.type==='queen');if(k&&q){const a={row:k.row,col:k.col},b={row:q.row,col:q.col};await swap(k,q);}}
      else if(id==='ducks'){const q=randomFree();if(q){const duck=makePiece('pawn','dark',q[0],q[1],{duck:true,neutral:true});add(duck);view.els.get(duck)?.classList.add('apk-chicken');labels([[q[0],q[1],'🦆']]);}}
      else if(id==='lowgrav'&&knight()){const p=knight(),st=view.state.get(p);st.z=view.sq*.8;view.apply(p);view.els.get(p)?.classList.add('apk-floating');}
      else if(id==='bighead'){for(const p of pieces)view.els.get(p)?.classList.add('apk-bighead');}
      else if(id==='narrator'){say(pick(['Una jugada audaz. O un error de dedo.','El público se emociona un poco.','De manual. Si el manual está en llamas.','Yo no habría hecho eso.']));return;}
      else if(id==='disco'){for(const p of pieces)view.els.get(p)?.classList.add('apk-disco');}
      if(!state.over)say(meta.name+': muestra aislada aplicada. La partida real del APK conserva las reglas y temporizadores propios.');
      stats('Modificador: '+meta.name);
    },true);
    goal(meta.description+' · Esta entrada enseña su efecto; no conecta el modificador a partidas principales.');
  }

  async function startRecipe(){
    state={mode:'recipe',over:false};await build(boardOf(),kingsAndArmy());
    button('Activar combinación visual',async()=>{
      if(id==='moon'){await playAPKScreenShake(boardFrame,180,8);await playAPKBombBlast(boardFrame,view,{row:3,col:3},[[2,3],[3,2],[3,3],[3,4],[4,3]].map(([row,col])=>({row,col})));for(const p of pieces)view.els.get(p)?.classList.add('apk-bighead','apk-floating');}
      else if(id==='iceage'){for(const p of pieces.filter(p=>p.color==='dark'))view.els.get(p)?.style.setProperty('opacity','.12');for(const tile of view.tiles.values())tile.classList.add('fogged');}
      else if(id==='duckapoc'){const p=pieces.find(p=>p.color==='light'&&p.type==='pawn');if(p){p.type='queen';view.remake(p);await playAPKTransform(boardFrame,view,{row:p.row,col:p.col});}const q=randomFree();if(q){const duck=makePiece('pawn','dark',q[0],q[1],{duck:true,neutral:true});add(duck);view.els.get(duck)?.classList.add('apk-chicken');}}
      else if(id==='lava'){const cells=[];for(let i=0;i<4;i++){const q=randomFree();if(q)cells.push(q);}doom(cells);labels(cells.map(([r,c])=>[r,c,'🔥']));}
      else if(id==='corporate'){await playAPKChaosRoulette(boardFrame,view,'PER MY LAST EMAIL','TODO ES MÁS RÁPIDO','#9b4dff');}
      else if(id==='overdrive'){for(const p of pieces)view.els.get(p)?.classList.add('apk-bighead','apk-disco');await playAPKChaosRoulette(boardFrame,view,'7+ MODIFICADORES','MÁXIMA POTENCIA','#ff2d55');}
      say('Receta demostrada: '+meta.name+'. Recompensa original: '+meta.reward+'. No se importan compras ni economía.');
    },true);
    goal(meta.description+(meta.extra?' · También requiere '+meta.extra+'.':'')+' · Requisitos: '+(meta.anySeven?'7 o más modificadores':meta.requirements.join(' + '))+'.');
    stats('Receta: '+meta.name+' · Recompensa original: '+meta.reward);
  }

  async function load(){
    stop();
    if(id==='potato')return startPotato();
    if(id==='chaos')return startChaos();
    if(id==='boss2')return startBoss2();
    if(id==='horde')return startHorde();
    if(id==='randarmy')return startRandomArmy();
    if(id==='giant')return startGiant();
    if(id==='p4'||meta.family==='party')return startParty();
    if(meta.family==='modifier')return startModifier();
    if(meta.family==='recipe')return startRecipe();
    throw new Error('Familia de prototipo no implementada: '+meta.family);
  }
  $('.apk-reset').addEventListener('click',load);
  await load();
  return {destroy:stop};
}
