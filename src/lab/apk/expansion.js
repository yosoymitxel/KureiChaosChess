import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';
import { key, threatenedPieces } from '../../game/rules.js';
import { THEMES, applyTheme } from '../../data/themes.js';
import { animate } from 'animejs';
import { APK_BY_ID, APK_CHAOS_EVENTS, APK_HORDE_UPGRADES } from './catalog.js';
import { createAPKTurnGame } from './turn-game.js';
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
  root.innerHTML='<main class="apk-proto"><header class="apk-head"><div><div class="apk-eyebrow">PROTOTIPO AISLADO · APK · NORMAL</div><h1></h1></div><a class="apk-back" href="lab-preview.html">Volver al banco</a></header><div class="apk-main"><section class="apk-board-frame"><div id="apk-board"></div></section><aside class="apk-panel panel"><div class="apk-kind"></div><p class="apk-desc"></p><div class="apk-objective"></div><div class="apk-status" role="status" aria-live="polite"></div><div class="apk-stats"></div><div class="apk-actions"></div><button class="btn sm apk-reset" type="button">Reiniciar prototipo</button><div class="apk-note">Prototipo local simplificado. Las partidas usan el movimiento legal del proyecto cuando aplica, con CPU básica; no son una importación completa del APK. Sin progreso ni recompensas.</div></aside></div></main>';
  const $=selector=>root.querySelector(selector);
  $('.apk-head h1').textContent='APK: '+meta.name;
  $('.apk-kind').textContent=id==='p4'?'MODO DE CUATRO BANDOS · ESTUDIO DE GEOMETRÍA':meta.family==='mode'?'VARIANTE · PARTIDA LOCAL CONTRA CPU':meta.family==='party'?'MODO DE FIESTA · PARTIDA LOCAL':meta.family==='modifier'?'MODIFICADOR · MUESTRA AISLADA':'RECETA SECRETA · COMBINACIÓN VISUAL';
  $('.apk-desc').textContent=meta.description;
  const boardFrame=$('.apk-board-frame'),actions=$('.apk-actions');
  let host=$('#apk-board'),view=null,board=null,pieces=[],timer=null,state={},turnGame=null;
  const say=value=>{$('.apk-status').textContent=value;};
  const stats=value=>{$('.apk-stats').textContent=value;};
  const goal=value=>{$('.apk-objective').textContent=value;};
  function stop(){
    if(turnGame){turnGame.destroy();turnGame=null;}
    if(timer){clearInterval(timer);timer=null;}
    if(boardFrame)clearAPKEffects(boardFrame);
    if(view)view.destroy();
    view=null;board=null;pieces=[];state={};
    actions.replaceChildren();say('');stats('');goal('');
  }
  function button(label,fn,primary=false){
    const el=document.createElement('button');el.type='button';el.className='btn sm'+(primary?' primary':'');el.textContent=label;
    el.addEventListener('click',async()=>{
      if(el.disabled||state.busy||state.over||turnGame?.over)return;
      el.disabled=true;state.busy=true;
      try{await fn();}catch(error){console.error('[APK expansion]',error);say('Falló la muestra. Reinicia la escena; el motor principal no se modificó.');}
      finally{state.busy=false;if(!state.over)el.disabled=false;}
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
    if(turnGame){turnGame.destroy();turnGame=null;}
    if(view)view.destroy();
    host=document.createElement('div');host.id='apk-board';boardFrame.replaceChildren(host);
    board=nextBoard;pieces=nextPieces;
    view=new BoardView(host,{camera:'flat',vfx:false,shake:false,onTap});
    view.setBoard(board);view.setPieces(pieces);
    await playAPKDeal(view,pieces,boardFrame);
  }
  function installMatch(options={}){
    if(turnGame)turnGame.destroy();
    turnGame=createAPKTurnGame({board,view,getPieces:()=>pieces,movePiece:move,removePiece:remove,say,stat:stats,label:meta.name,...options});
    return turnGame;
  }
  function kingsAndArmy(){
    return [
      makePiece('king','light',7,4,{royal:true}),makePiece('queen','light',7,3),makePiece('rook','light',7,0),makePiece('knight','light',6,1),makePiece('pawn','light',6,3),
      makePiece('king','dark',0,4,{royal:true}),makePiece('queen','dark',0,3),makePiece('rook','dark',0,7),makePiece('knight','dark',1,6),makePiece('pawn','dark',1,3)
    ];
  }

  async function startPotato(){
    const ps=kingsAndArmy();
    const crown={light:ps.find(p=>p.color==='light'&&p.type==='king'),dark:ps.find(p=>p.color==='dark'&&p.type==='king')};
    for(const side of ['light','dark']){crown[side].crown=true;crown[side].royal=true;}
    state={round:0,crown,pending:{light:null,dark:null},over:false};
    await build(boardOf(),ps);
    const paint=()=>labels(['light','dark'].flatMap(side=>{const now=state.crown[side],next=state.pending[side];return [now?[now.row,now.col,'♛']:null,next?[next.row,next.col,'✦']:null].filter(Boolean);}));
    turnGame=installMatch({afterMove:async({side})=>{
      if(side!=='dark')return;
      state.round++;
      if(state.round%5===4){
        for(const color of ['light','dark']){
          const current=state.crown[color],own=pieces.filter(p=>p.color===color&&!p.crown&&!p.big&&!p.royal);
          const threatened=threatenedPieces(pieces,color,board),safe=own.filter(p=>!threatened.has(p));
          state.pending[color]=pick(safe.length?safe:own)||null;
        }
        doom(['light','dark'].map(color=>state.pending[color]).filter(Boolean).map(p=>[p.row,p.col]));
        say('Aviso: la corona cambiará en la siguiente ronda. Las casillas marcadas son los nuevos candidatos.');
      }else if(state.round%5===0){
        for(const color of ['light','dark']){
          let next=state.pending[color];state.pending[color]=null;
          if(!next||!pieces.includes(next))next=pick(pieces.filter(p=>p.color===color&&!p.crown&&!p.big&&!p.royal));
          const old=state.crown[color];
          if(next){if(old){old.crown=false;old.royal=false;view.remake(old);}next.crown=true;next.royal=true;state.crown[color]=next;view.remake(next);await playAPKHotPotatoCrown(boardFrame,view,{row:old?.row??next.row,col:old?.col??next.col},{row:next.row,col:next.col});}
        }
        doom([]);say('¡Nueva corona! Captura al portador rival para ganar; protege el tuyo.');
      }else{doom([]);say('Las coronas siguen en juego. Cada cinco rondas cambiarán de portador.');}
      paint();stats('Ronda: '+state.round+' · Coronas activas: 2 · El portador es el rey efectivo.');
    }});
    paint();
    goal('Partida contra CPU. Cada bando tiene una corona móvil: su portador es el rey efectivo aunque sea peón, torre o caballo. Capturar la corona rival gana.');
    stats('Ronda 0 · Dos coronas · Cambian cada cinco rondas');
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
    state={events:0,bag:[],pending:null,over:false,ply:0};
    await build(boardOf(),kingsAndArmy());
    turnGame=installMatch({afterMove:async()=>{
      state.ply++;
      if(state.pending){await resolveRoulette();}
      else if(state.ply%4===0){await spinRoulette();}
    }});
    button('Girar Ruleta del Caos',spinRoulette,true);
    button('Resolver evento anunciado',resolveRoulette);
    goal('Partida contra CPU con movimientos legales. Cada cuatro medios-turnos se anuncia un evento de la ruleta y se resuelve en el siguiente movimiento.');
    stats('12 eventos · Bolsa aleatoria sin repetición · Captura el rey rival');
  }

  async function startBoss2(){
    const bosses=[{id:'goat',name:'La Cabra',hp:20,color:'#ff2d55'},{id:'dragon',name:'Dragonfuego',hp:22,color:'#ff6a00'},{id:'mecha',name:'Mecha-Rey',hp:24,color:'#29e3ff'},{id:'sal',name:'Sal Gigante',hp:22,color:'#ffc83d'}];
    const boss=pick(bosses),weak=[];
    state={boss,hp:boss.hp,turn:0,weak,marked:null,over:false};
    const ps=kingsAndArmy();
    await build(boardOf(),ps);
    for(let i=0;i<2;i++){const q=randomFree((r,c)=>r>1&&r<6&&c>1&&c<6);if(q)weak.push(q);}
    const paintWeak=()=>{labels(weak.map(([r,c])=>[r,c,'✦']));view.setDoom(weak);};
    paintWeak();
    turnGame=installMatch({afterMove:async({piece,side,end})=>{
      if(side==='light'){
        const index=weak.findIndex(([r,c])=>r===piece.row&&c===piece.col);
        if(index>=0){
          weak.splice(index,1);
          const damage=({pawn:1,knight:2,bishop:2,rook:3,queen:3,king:2,camel:2,cannon:3})[piece.type]||1;
          state.hp=Math.max(0,state.hp-damage);
          await playAPKDamage(boardFrame,view,{row:piece.row,col:piece.col},'gold');
          if(state.hp===0){state.over=true;await end('light','¡Victoria! Derrotaste a '+boss.name+'.');return;}
          const q=randomFree((r,c)=>r>1&&r<6&&c>1&&c<6);if(q)weak.push(q);
          paintWeak();say('Punto débil golpeado: -'+damage+' HP. El jefe conserva '+state.hp+' HP.');
        }
      }else{
        state.turn++;
        if(state.marked){
          const cells=state.marked;state.marked=null;doom([]);
          for(const [r,c] of cells){const p=pieceAt(r,c);if(p)await remove(p,true);}
          say('Ataque del jefe resuelto. Las piezas dentro de la zona fueron alcanzadas.');
        }else if(state.turn%2===0){
          const mode=pick(['row','col','cross','box']),r=1+Math.floor(Math.random()*6),c=1+Math.floor(Math.random()*6),cells=[];
          if(mode==='row'||mode==='cross')for(let col=0;col<8;col++)cells.push([r,col]);
          if(mode==='col'||mode==='cross')for(let row=0;row<8;row++)if(!cells.some(([rr,cc])=>rr===row&&cc===c))cells.push([row,c]);
          if(mode==='box')for(let y=r-1;y<=r+1;y++)for(let x=c-1;x<=c+1;x++)if(x>=0&&y>=0&&x<8&&y<8)cells.push([x,y]);
          state.marked=cells;doom(cells);say('El jefe anuncia '+({row:'ataque de fila',col:'mirada gélida',cross:'láser en cruz',box:'pisotón 3×3'}[mode])+'. Evita las casillas rojas antes de su próximo turno.');
        }
      }
      stats(boss.name+': '+state.hp+'/'+boss.hp+' HP · Turno del jefe '+state.turn+' · Puntos débiles dorados');
    }});
    goal('Partida contra CPU. Mueve piezas y pisa los puntos débiles dorados para dañar al jefe; evita las zonas rojas que anuncia periódicamente. Capturar el rey rival también termina la partida.');
    stats(boss.name+': '+boss.hp+'/'+boss.hp+' HP · Dos puntos débiles');
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
    let same=true,game=null;
    const draw=async()=>{
      const a=rollArmy(),b=same?a:rollArmy(),ps=[...placeArmy(a,'light',7,6),...placeArmy(b,'dark',0,1)];
      await build(boardOf(),ps,hit=>game?.tap(hit));
      game=installMatch();
      const value=arr=>arr.reduce((sum,t)=>sum+({queen:9,rook:5,bishop:3,knight:3,pawn:1})[t],0);
      stats('Claras: '+value(a)+' puntos · Carmesí: '+value(b)+' puntos · '+(same?'Mismo caos':'Cada uno el suyo')+' · CPU activa');
      goal('Partida contra CPU con ejército aleatorio de 39 puntos. Selecciona cualquier pieza clara, mueve con reglas legales y captura el rey rival. Usa los botones para volver a sortear las fuerzas.');
    };
    state={mode:'randarmy',over:false};await draw();
    button('Mismo caos: volver a sortear',async()=>{same=true;await draw();},true);
    button('Cada uno el suyo: sortear dos',async()=>{same=false;await draw();});
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
    await build(b,ps);
    for(const p of pieces)if(p.apkHybrid)view.els.get(p)?.classList.add('apk-hybrid-'+p.apkHybrid);
    turnGame=installMatch();
    goal('Partida 12×12 contra CPU. Las piezas usan movimientos legales; el arzobispo combina alfil + caballo y el canciller torre + caballo. Gana quien captura el rey.');
    stats('144 casillas · Arzobispo · Canciller · Camello · Cañón · Jugador vs CPU');
  }

  function partyArmies(type){
    const back=Array(8).fill(type);back[4]='king';const front=Array(8).fill(type),ps=[];
    for(let c=0;c<8;c++){ps.push(makePiece(back[c],'dark',0,c,{royal:back[c]==='king'}),makePiece(front[c],'dark',1,c),makePiece(back[c],'light',7,c,{royal:back[c]==='king'}),makePiece(front[c],'light',6,c));}
    return ps;
  }
  async function startParty(){
    const id=meta.id;
    if(['pqueen','ppawn','horse'].includes(id)){
      const type={pqueen:'queen',ppawn:'pawn',horse:'knight'}[id];await build(boardOf(),partyArmies(type));
      turnGame=installMatch();
      goal(meta.description+' · Selecciona una pieza, mueve con sus reglas y captura el rey rival. La CPU responde cada turno.');
      stats('15 '+type+'s + 1 rey por bando · Jugador vs CPU · Captura el rey para ganar.');return;
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
      goal('Tablero en cruz 14×14. El APK rota turnos rojo → azul → amarillo → verde; jaque, mate o rey capturado eliminan un bando. Esta escena valida geometría, no el motor de cuatro jugadores.');
      stats('14×14 · 4 ejércitos · 4 reyes');
      return;
    }
    if(id==='speed'){
      await build(boardOf(),kingsAndArmy());state={seconds:3,over:false};
      turnGame=installMatch({afterMove:async({side})=>{if(side==='dark')state.seconds=3;}});
      timer=setInterval(()=>{if(turnGame?.over){clearInterval(timer);timer=null;return;}state.seconds--;stats('Reloj del jugador: '+Math.max(0,state.seconds)+' s');if(state.seconds<=0){clearInterval(timer);timer=null;turnGame?.end('dark','Derrota: agotaste los tres segundos de tu turno.');}},1000);
      goal('Partida contra CPU con tres segundos por turno. Mueve antes de que el reloj llegue a cero; la CPU responde automáticamente.');
      stats('Reloj del jugador: 3 s · Captura el rey rival');
      return;
    }
    if(id==='invis'){
      const ps=kingsAndArmy();state={hidden:new Set(),over:false};
      await build(boardOf(),ps);
      turnGame=installMatch({beforeSelect:async(p)=>{if(state.hidden.has(p.id)){state.hidden.delete(p.id);view.els.get(p)?.style.setProperty('opacity','1');stats('Piezas ocultas: '+state.hidden.size);}return false;},afterMove:async({piece})=>{state.hidden.add(piece.id);view.els.get(piece)?.style.setProperty('opacity','.04');stats('Piezas ocultas: '+state.hidden.size);}});
      goal('Partida contra CPU. Después de moverse, una pieza desaparece; tócala cuando vuelva a ser tu turno para revelarla. Captura el rey rival para ganar.');
      return;
    }
    if(id==='drunk'){
      const knight=makePiece('knight','light',6,2);await build(boardOf(),[knight,...kingsAndArmy().filter(p=>p.type==='king')]);
      state={drifts:0,over:false};
      turnGame=installMatch({beforeMove:async({move,side,piece})=>{
        if(side!=='light'||move.hits?.length||Math.random()>=.15)return move;
        const alternatives=DIR8.map(([dr,dc])=>[move.row+dr,move.col+dc]).filter(([r,c])=>free(r,c,piece));
        if(!alternatives.length)return move;
        const dest=pick(alternatives);state.drifts++;stats('Desvíos: '+state.drifts);say('¡Movimiento desviado! La pieza aterriza en una casilla vecina libre.');return{row:dest[0],col:dest[1]};
      }});
      goal('Partida contra CPU. El caballo usa sus saltos legales; el 15 % de movimientos sin captura puede desviarse a una casilla vecina libre. Captura el rey para ganar.');
      stats('Desvíos: 0 · Jugador vs CPU');return;
    }
    if(id==='chicken'){
      await build(boardOf(),kingsAndArmy());state={hens:[],over:false};
      turnGame=installMatch({onCapture:async({victim})=>{
        if(victim.neutral){say('La gallina es neutral y no puede capturarse.');return false;}
        const at={row:victim.row,col:victim.col},q=randomFree((r,c)=>dist({row:r,col:c},at)<=1);
        if(q){const hen=makePiece('pawn',victim.color,q[0],q[1],{neutral:true,chicken:true});add(hen);state.hens.push(hen);view.els.get(hen)?.classList.add('apk-chicken');labels([[q[0],q[1],'🐔']]);}
        return true;
      },afterMove:async()=>{for(const hen of state.hens){if(!pieces.includes(hen))continue;const q=pick(DIR8.map(([dr,dc])=>[hen.row+dr,hen.col+dc]).filter(([r,c])=>free(r,c,hen)));if(q)await move(hen,q[0],q[1],100);}}});
      goal('Partida contra CPU. Al capturar una pieza, reaparece cerca como gallina neutral: bloquea casillas y no puede capturarse. Gana quien capture el rey.');
      stats('Gallinas: 0 · Jugador vs CPU');return;
    }
    if(id==='bullet'){
      const shooter=makePiece('rook','light',5,1),target=makePiece('pawn','dark',5,5);
      await build(boardOf(),[shooter,target,makePiece('king','light',7,4,{royal:true}),makePiece('king','dark',0,4,{royal:true})]);
      state={impacts:0};
      turnGame=installMatch({afterMove:async({piece,from,move})=>{
        const dr=Math.sign(move.row-from.row),dc=Math.sign(move.col-from.col);if(!dr&&!dc)return;
        let r=piece.row+dr,c=piece.col+dc,victim=null;
        while(r>=0&&c>=0&&r<board.rows&&c<board.cols){victim=pieceAt(r,c);if(victim)break;r+=dr;c+=dc;}
        if(victim){await playAPKBeam(boardFrame,view,{row:piece.row,col:piece.col},{row:victim.row,col:victim.col},'#fff36b');await remove(victim,false);state.impacts++;stats('Impactos: '+state.impacts);}
      }});
      goal('Partida contra CPU. Después de cada movimiento, la pieza dispara en la dirección recorrida y destruye la primera pieza de la línea, incluso si es propia.');
      stats('Impactos: 0 · Captura el rey rival');return;
    }
    if(id==='anti'){
      const own=makePiece('pawn','light',4,3),enemy=makePiece('pawn','dark',3,4),lightKing=makePiece('king','light',7,4),darkKing=makePiece('king','dark',0,4);
      lightKing.royal=false;darkKing.royal=false;
      await build(boardOf(),[own,enemy,lightKing,darkKing]);
      turnGame=installMatch({mandatoryCaptures:true,winOnRoyalCapture:false,loseOnRoyalCapture:false,elimination:true,winOnNoMoves:true});
      goal('Antiajedrez contra CPU. Si existe una captura, debes hacerla; el rey es una pieza común, no hay jaque. Gana quien elimina todas las piezas rivales.');
      stats('Captura inicial obligatoria · Jugador vs CPU');return;
    }
  }

  async function startHorde(){
    const king=makePiece('king','light',7,4,{royal:true});
    state={mode:'horde',draft:[],wave:0,kills:0,crowns:0,upgrades:{},over:false};
    await build(boardOf(),[king]);
    goal('Elige tres piezas además del rey. Juega con movimientos legales contra la CPU, limpia cinco oleadas y elige una mejora entre oleadas. Si capturan tu rey, pierdes.');
    stats('Rey + 3 piezas · Objetivo: 5 oleadas');
    const draft=['knight','bishop','rook','pawn','camel','cannon'];
    const startCombat=()=>installMatch({
      winOnRoyalCapture:false,loseOnRoyalCapture:true,winOnNoMoves:false,
      onCapture:async({victim})=>{
        if(victim.boss){
          victim.hp=Math.max(0,(victim.hp||victim.maxHp||5)-1);
          await playAPKDamage(boardFrame,view,{row:victim.row,col:victim.col},'gold');
          if(victim.hp>0){view.remake(victim);return false;}
        }
        return true;
      },
      afterMove:async({side,end})=>{
        if(side==='light'&&!pieces.some(p=>p.color==='dark'))await clearWave(end);
        if(side==='dark'&&!pieces.some(p=>p.color==='light'&&p.royal))state.over=true;
      }
    });
    actions.replaceChildren();
    for(const type of draft)button('Elegir '+type,async()=>{
      if(state.draft.length>=3||state.draft.includes(type))return;
      const q=randomFree((r,c)=>r>=5);if(!q)return;
      add(makePiece(type,'light',q[0],q[1]));state.draft.push(type);
      say('Selección: '+state.draft.join(', ')+' ('+state.draft.length+'/3).');
      stats('Piezas elegidas: '+state.draft.length+'/3');
      if(state.draft.length===3){
        startCombat();actions.replaceChildren();button('Invocar oleada 1',spawnWave,true);
      }
    });
    function spawnWave(){
      if(state.over||turnGame?.over)return;
      state.wave++;
      if(state.wave>5)return;
      const n=Math.min(8,2+state.wave);
      const types=state.wave<3?['pawn','pawn','knight']:['pawn','knight','bishop','rook'];
      if(state.wave%3===0){
        const q=randomFree((r,c)=>r<=1);
        if(q)add(makePiece('queen','dark',q[0],q[1],{boss:'titan',hp:5+state.wave,maxHp:5+state.wave}));
      }
      for(let i=0;i<n;i++){const q=randomFree((r,c)=>r<=2);if(q)add(makePiece(pick(types),'dark',q[0],q[1]));}
      actions.replaceChildren();
      say('Oleada '+state.wave+': mueve y captura con tus reglas. La CPU también mueve sus piezas; las reinas de jefe requieren varios golpes.');
      stats('Oleada: '+state.wave+'/5 · Enemigos: '+pieces.filter(p=>p.color==='dark').length+' · Coronas: '+state.crowns);
    }
    async function clearWave(end){
      if(pieces.some(p=>p.color==='dark'))return;
      state.crowns++;
      if(state.wave>=5){
        actions.replaceChildren();await end('light','¡Victoria! Superaste las cinco oleadas de Horde Mode.');return;
      }
      actions.replaceChildren();
      const pool=APK_HORDE_UPGRADES.filter(up=>!up.once||!state.upgrades[up.id]),offers=[];
      while(pool.length&&offers.length<3){
        const total=pool.reduce((sum,up)=>sum+up.weight,0);
        let roll=Math.random()*total,index=0;
        for(;index<pool.length-1;index++){roll-=pool[index].weight;if(roll<=0)break;}
        offers.push(pool.splice(index,1)[0]);
      }
      say('Oleada superada. Elige una mejora para reforzar tu ejército.');
      for(const up of offers)button(up.name,async()=>{
        state.upgrades[up.id]=true;
        if(up.piece){
          for(let i=0;i<(up.count||1);i++){const q=randomFree((r,c)=>r>=5);if(q)add(makePiece(up.piece,'light',q[0],q[1],{apkHybrid:up.hybrid||null}));}
        }else{
          for(const p of pieces.filter(p=>p.color==='light'))view.els.get(p)?.classList.add(up.id==='lowgrav'?'apk-floating':up.id==='bighead'?'apk-bighead':'apk-upgraded');
        }
        actions.replaceChildren();button('Invocar oleada '+(state.wave+1),spawnWave,true);
        say('Mejora: '+up.name+'. '+up.description);stats('Mejoras: '+Object.keys(state.upgrades).length+' · Próxima oleada '+(state.wave+1)+'/5');
      });
      stats('Oleada '+state.wave+' limpia · Elige una mejora · Coronas: '+state.crowns);
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
