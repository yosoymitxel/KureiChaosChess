import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';
import { key, threatenedPieces } from '../../game/rules.js';
import { THEMES, applyTheme } from '../../data/themes.js';
import { animate } from 'animejs';
import { APK_BY_ID, APK_CHAOS_EVENTS, APK_HORDE_UPGRADES } from './catalog.js';
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
    el.addEventListener('click',async()=>{
      if(el.disabled||state.busy||state.over)return;
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
    const ps=kingsAndArmy(),crown={light:ps.find(p=>p.color==='light'&&p.type==='king'),dark:ps.find(p=>p.color==='dark'&&p.type==='king')};
    crown.light.crown=true;crown.dark.crown=true;
    state={round:0,crown,pending:{light:null,dark:null},over:false};
    await build(boardOf(),ps);
    const paint=()=>labels(['light','dark'].flatMap(side=>{const now=state.crown[side],next=state.pending[side];return [now?[now.row,now.col,'♛']:null,next?[next.row,next.col,'✦']:null].filter(Boolean);}));
    paint();
    button('Avanzar un turno completo',async()=>{
      state.round++;
      if(state.round>0&&state.round%5===4){
        for(const side of ['light','dark']){
          const current=state.crown[side],own=pieces.filter(p=>p.color===side&&!p.crown&&!p.big);
          const threatened=threatenedPieces(pieces,side,board);const safe=own.filter(p=>!threatened.has(p));
          state.pending[side]=pick(safe.length?safe:own)||null;
        }
        doom(['light','dark'].map(side=>state.pending[side]).filter(Boolean).map(p=>[p.row,p.col]));
        say('LA CORONA SE IMPACIENTA: el próximo turno saltará a las piezas marcadas. El APK prefiere candidatos que no estén atacados.');
      }else if(state.round>0&&state.round%5===0){
        for(const side of ['light','dark']){
          let next=state.pending[side];state.pending[side]=null;
          if(!next||!pieces.includes(next))next=pick(pieces.filter(p=>p.color===side&&!p.crown&&!p.big));
          const old=state.crown[side];
          if(next){if(old)old.crown=false;next.crown=true;state.crown[side]=next;await playAPKHotPotatoCrown(boardFrame,view,{row:old?.row??next.row,col:old?.col??next.col},{row:next.row,col:next.col});}
        }
        doom([]);say('¡NUEVO REY! La pieza coronada recibe las condiciones de jaque y mate, pero conserva su propio movimiento.');
      }else{doom([]);say('La corona permanece en su dueño actual. El siguiente cambio es en la ronda '+(Math.floor(state.round/5)+1)*5+'.');}
      paint();stats('Ronda: '+state.round+' · Coronas activas: 2 · Próximo cambio: cada 5 rondas');
    },true);
    goal('Cada bando tiene una corona. El portador es el rey efectivo aunque sea peón, torre o caballo. El cambio se anuncia una ronda antes.');
    stats('Ronda 0 · Dos coronas · Primer aviso en la ronda 4');
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
    state={events:0,bag:[],pending:null,over:false};await build(boardOf(),kingsAndArmy());
    button('Girar Ruleta del Caos',spinRoulette,true);button('Resolver al siguiente turno',resolveRoulette);
    goal('Chaos Chess 2.0 conserva los superpoderes de las piezas y añade una ruleta: cada tres turnos anuncia un evento con un turno de antelación.');
    stats('12 eventos · Bolsa aleatoria sin repetición');
  }

  async function startBoss2(){
    const bosses=[{id:'goat',name:'La Cabra',hp:20,color:'#ff2d55'},{id:'dragon',name:'Dragonfuego',hp:22,color:'#ff6a00'},{id:'mecha',name:'Mecha-Rey',hp:24,color:'#29e3ff'},{id:'sal',name:'Sal Gigante',hp:22,color:'#ffc83d'}];
    const boss=pick(bosses),weak=[];
    state={boss,hp:boss.hp,turn:0,weak,marked:null,over:false};
    const ps=kingsAndArmy();
    await build(boardOf(),ps);
    for(let i=0;i<2;i++){const q=randomFree((r,c)=>r>1&&r<6&&c>1&&c<6);if(q)weak.push(q);}
    labels(weak.map(([r,c])=>[r,c,'✦']));view.setDoom(weak);
    button('Golpear punto débil',async()=>{
      if(!weak.length||state.hp<=0)return;
      const attacker=pick(pieces.filter(p=>p.color==='light'&&!['king'].includes(p.type)));
      const damage=({pawn:1,knight:2,bishop:2,rook:3,queen:3,king:2,camel:2,cannon:3})[attacker?.type]||1;
      state.hp=Math.max(0,state.hp-damage);const point=weak.shift();await playAPKDamage(boardFrame,view,{row:point[0],col:point[1]},'gold');
      if(!weak.length){const q=randomFree((r,c)=>r>1&&r<6&&c>1&&c<6);if(q)weak.push(q);}
      if(state.hp===0){state.over=true;await playAPKVictory(boardFrame,view,['#ffc83d','#fff2bd','#3dff8e']);say('¡Jefe derrotado! En el APK, quien da el golpe final recibe una dama extra.');}
      labels(weak.map(([r,c])=>[r,c,'✦']));view.setDoom(weak);stats(boss.name+': '+state.hp+'/'+boss.hp+' HP · Daño del golpe: '+damage);
    },true);
    button('Avanzar turno del jefe',async()=>{
      state.turn++;
      if(state.marked){const cells=state.marked;state.marked=null;doom([]);await playAPKScreenShake(boardFrame,220,8);for(const [r,c] of cells){const p=pieceAt(r,c);if(p)await remove(p,true);}say('Ataque del jefe resuelto: las piezas de ambos bandos dentro de la zona fueron alcanzadas.');}
      else if(state.turn%4===0){
        const mode=pick(['row','col','cross','box']),r=1+Math.floor(Math.random()*6),c=1+Math.floor(Math.random()*6),cells=[];
        if(mode==='row'||mode==='cross')for(let col=0;col<8;col++)cells.push([r,col]);
        if(mode==='col'||mode==='cross')for(let row=0;row<8;row++)if(!cells.some(([rr,cc])=>rr===row&&cc===c))cells.push([row,c]);
        if(mode==='box')for(let y=r-1;y<=r+1;y++)for(let x=c-1;x<=c+1;x++)if(x>=0&&y>=0&&x<8&&y<8)cells.push([x,y]);
        state.marked=cells;doom(cells);say('El jefe anuncia '+({row:'ATAQUE DE FILA',col:'MIRADA GÉLIDA',cross:'LÁSER EN CRUZ',box:'PISOTÓN 3×3'}[mode])+'. Impactará al siguiente turno.');
      }
      stats(boss.name+': '+state.hp+'/'+boss.hp+' HP · Turno '+state.turn);
    });
    goal('Jefe aleatorio con HP. Pisa puntos débiles dorados para dañarlo; cada cuatro turnos anuncia fila, columna, cruz o área 3×3 que atacará un turno después.');
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
    let same=true;const draw=async()=>{
      const a=rollArmy(),b=same?a:rollArmy(),ps=[...placeArmy(a,'light',7,6),...placeArmy(b,'dark',0,1)];
      await build(boardOf(),ps);const value=arr=>arr.reduce((sum,t)=>sum+({queen:9,rook:5,bishop:3,knight:3,pawn:1})[t],0);
      stats('Claras: '+value(a)+' puntos · Carmesí: '+value(b)+' puntos · '+(same?'Mismo caos':'Cada uno el suyo'));
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
        if(c===3){p.apkHybrid='archbishop';p.type='bishop';}
        if(c===4){p.apkHybrid='chancellor';p.type='rook';}
        ps.push(p);
        ps.push(makePiece(c===0||c===11?'camel':'pawn',color,pawnRow,c));
        ps.push(makePiece('pawn',color,color==='dark'?2:9,c));
      }
    }
    state={mode:'giant',over:false};
    await build(b,ps,hit=>{
      const p=pieceAt(hit.row,hit.col);if(!p)return;
      say(p.apkHybrid==='archbishop'?'Arzobispo: combinación de alfil + caballo.':p.apkHybrid==='chancellor'?'Canciller: combinación de torre + caballo.':p.type==='camel'?'Camello: salto largo 3+1.':p.type==='cannon'?'Cañón: mueve como torre y captura saltando exactamente una pieza.':'Pieza del ejército 12×12.');
    });
    for(const p of pieces)if(p.apkHybrid)view.els.get(p)?.classList.add('apk-hybrid-'+p.apkHybrid);
    goal('Tablero 12×12 con dos filas de peones por bando. Las piezas compuestas usan arte local de alfil/torre con insignia; no se inventan sprites nuevos.');
    stats('144 casillas · Arzobispo · Canciller · Camello · Cañón');
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
      goal(meta.description);stats('15 '+type+'s + 1 rey por bando · Captura el rey para ganar.');return;
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
      stats('Tiempo restante: 3 s');
      timer=setInterval(()=>{if(state.over)return;state.seconds--;stats('Tiempo restante: '+Math.max(0,state.seconds)+' s');if(state.seconds<=0){clearInterval(timer);timer=null;state.seconds=3;say('Tiempo agotado. El APK ejecuta una jugada legal al azar; esta escena comprueba el reloj, no reproduce el motor legal automático.');}},1000);
      button('Reiniciar reloj',async()=>{state.seconds=3;say('Reloj reiniciado.');stats('Tiempo restante: 3 s');});
      goal('Tienes tres segundos por turno. Al agotarse, el APK juega un movimiento legal aleatorio.');
      return;
    }
    if(id==='invis'){
      const ps=kingsAndArmy();state={hidden:new Set(),over:false};
      await build(boardOf(),ps,hit=>{const p=pieceAt(hit.row,hit.col);if(p&&state.hidden.has(p.id)){state.hidden.delete(p.id);view.els.get(p)?.style.setProperty('opacity','1');say('Pieza oculta revelada.');stats('Piezas invisibles: '+state.hidden.size);}});
      button('Mover y ocultar caballo',async()=>{
        const p=pieces.find(p=>p.color==='light'&&p.type==='knight');const q=KN.map(([dr,dc])=>[p.row+dr,p.col+dc]).find(([r,c])=>free(r,c,p));
        if(!q)return;say('El caballo se mueve; después desaparece. Toca su casilla para revelarlo.');await move(p,q[0],q[1]);state.hidden.add(p.id);view.els.get(p)?.style.setProperty('opacity','.04');stats('Piezas invisibles: '+state.hidden.size);
      },true);
      goal('Después de moverse, cualquier pieza desaparece, incluso las propias. La pieza que captura queda visible hasta volver a moverse.');
      return;
    }
    if(id==='drunk'){
      const knight=makePiece('knight','light',6,2);await build(boardOf(),[knight,...kingsAndArmy().filter(p=>p.type==='king')]);
      state={drifts:0,over:false};
      button('Movimiento tranquilo (15 % de desvío)',async()=>{
        const intended=[knight.row-2,knight.col+1];let dest=intended,drift=false;
        if(Math.random()<.15){
          const alternatives=DIR8.map(([dr,dc])=>[intended[0]+dr,intended[1]+dc]).filter(([r,c])=>free(r,c,knight));
          if(alternatives.length){dest=pick(alternatives);drift=true;}
        }
        if(!free(dest[0],dest[1],knight)){say('No hay destino libre para este movimiento de prueba.');return;}
        await move(knight,dest[0],dest[1]);if(drift)state.drifts++;say(drift?'¡Desvío! La jugada acabó una casilla al lado.':'El movimiento llegó a su destino.');stats('Desvíos: '+state.drifts);
      },true);
      goal('Solo los movimientos sin captura tienen 15 % de probabilidad de desviarse a una casilla vecina legal. Las capturas nunca se desvían.');
      stats('Desvíos: 0');return;
    }
    if(id==='chicken'){
      await build(boardOf(),kingsAndArmy());state={hens:[],over:false};
      button('Simular captura: crear gallina',async()=>{
        const victim=pieces.find(p=>p.color==='dark'&&p.type==='pawn');if(!victim)return;
        const at={row:victim.row,col:victim.col};await remove(victim,false);
        const q=randomFree((r,c)=>dist({row:r,col:c},at)<=1);if(!q)return;
        const hen=makePiece('pawn','dark',q[0],q[1],{neutral:true,chicken:true});add(hen);state.hens.push(hen);view.els.get(hen)?.classList.add('apk-chicken');labels([[q[0],q[1],'🐔']]);
        say('La pieza capturada reapareció como gallina neutral; no se puede capturar.');stats('Gallinas: '+state.hens.length);
      },true);
      button('Deambular gallinas',async()=>{for(const h of state.hens){const q=pick(DIR8.map(([dr,dc])=>[h.row+dr,h.col+dc]).filter(([r,c])=>free(r,c,h)));if(q)await move(h,q[0],q[1],120);}});
      goal('Las piezas capturadas se transforman en gallinas neutrales que deambulan y bloquean casillas.');
      stats('Gallinas: 0');return;
    }
    if(id==='bullet'){
      const shooter=makePiece('rook','light',5,1),target=makePiece('pawn','dark',5,5);
      await build(boardOf(),[shooter,target,makePiece('king','light',7,4,{royal:true}),makePiece('king','dark',0,4,{royal:true})]);
      button('Mover y disparar',async()=>{
        await move(shooter,5,2);await playAPKBeam(boardFrame,view,{row:5,col:2},{row:5,col:5},'#fff36b');await remove(target,false);
        say('El proyectil destruyó la primera pieza en su camino. El APK también puede destruir reyes o piezas del mismo bando.');stats('Impactos: 1');
      },true);
      goal('Después de moverse, la pieza dispara en la dirección del movimiento. La bala destruye la primera pieza que encuentra.');
      stats('Impactos: 0');return;
    }
    if(id==='anti'){
      const own=makePiece('pawn','light',4,3),enemy=makePiece('pawn','dark',3,4);
      await build(boardOf(),[own,enemy,makePiece('king','light',7,4,{royal:true}),makePiece('king','dark',0,4,{royal:true})]);
      button('Resolver captura obligatoria',async()=>{await remove(enemy,false);await move(own,3,4);say('Había captura disponible: es obligatoria. El rey es una pieza común, sin jaque.');stats('Piezas claras restantes: '+pieces.filter(p=>p.color==='light').length);},true);
      goal('Antiajedrez: capturar es obligatorio, el rey no tiene privilegios ni jaque. Gana quien se queda sin piezas.');
      stats('Captura disponible: sí');return;
    }
  }

  async function startHorde(){
    const king=makePiece('king','light',7,4,{royal:true});
    state={mode:'horde',draft:[],wave:0,kills:0,crowns:0,upgrades:{},over:false};
    await build(boardOf(),[king],async hit=>{const p=pieceAt(hit.row,hit.col);if(!p||p.color!=='dark')return;if(p.boss){p.hp=Math.max(0,p.hp-1);await playAPKDamage(boardFrame,view,{row:p.row,col:p.col},'gold');if(p.hp===0)await remove(p,true);}else await remove(p,true);state.kills++;state.crowns++;say('Baja registrada. Coronas de Horda: '+state.crowns);stats('Oleada: '+state.wave+' · Enemigos restantes: '+pieces.filter(q=>q.color==='dark').length+' · Coronas: '+state.crowns);await clearWave();});
    goal('Elige tres piezas además del rey. Limpia oleadas que entran por arriba; cada quinta incluye un minijefe. Entre oleadas eliges una de las 24 mejoras.');
    stats('Rey + 3 piezas · Meta: 30 oleadas');
    const draft=['knight','bishop','rook','pawn','camel','cannon'];
    actions.replaceChildren();
    for(const type of draft)button('Elegir '+type,async()=>{
      if(state.draft.length>=3||state.draft.includes(type))return;
      const q=randomFree((r,c)=>r>=5);if(!q)return;
      add(makePiece(type,'light',q[0],q[1]));state.draft.push(type);
      say('Selección: '+state.draft.join(', ')+' ('+state.draft.length+'/3).');
      stats('Piezas elegidas: '+state.draft.length+'/3');
      if(state.draft.length===3){actions.replaceChildren();button('Invocar oleada 1',spawnWave,true);}
    });
    function spawnWave(){
      if(state.over)return;
      state.wave++;const n=Math.min(12,3+Math.floor(state.wave*.8));
      const types=state.wave<3?['pawn','pawn','pawn','pawn']:state.wave<5?['pawn','pawn','knight','bishop']:['pawn','knight','bishop','rook','queen'];
      if(state.wave%5===0){const q=randomFree((r,c)=>r<=1);if(q)add(makePiece('queen','dark',q[0],q[1],{boss:'titan',h:1,w:1,hp:8+state.wave,maxHp:8+state.wave}));}
      for(let i=0;i<n;i++){const q=randomFree((r,c)=>r<=2);if(q)add(makePiece(pick(types),'dark',q[0],q[1]));}
      actions.replaceChildren();
      say('¡OLEADA '+state.wave+'! '+n+' enemigos'+(state.wave%5===0?' · MINIBOSS':'')+'. Toca un enemigo para eliminarlo en este prototipo.');stats('Oleada: '+state.wave+' · Enemigos: '+pieces.filter(p=>p.color==='dark').length+' · Coronas: '+state.crowns);
    }
    async function clearWave(){
      if(pieces.some(p=>p.color==='dark'))return;
      if(state.wave>=30){state.over=true;actions.replaceChildren();await playAPKVictory(boardFrame,view,['#ffc83d','#fff2bd','#3dff8e']);say('¡Treinta oleadas superadas!');return;}
      actions.replaceChildren();
      const pool=APK_HORDE_UPGRADES.filter(up=>!up.once||!state.upgrades[up.id]);
      const offers=[];
      while(pool.length&&offers.length<3){const total=pool.reduce((sum,up)=>sum+up.weight,0);let roll=Math.random()*total,index=0;for(;index<pool.length-1;index++){roll-=pool[index].weight;if(roll<=0)break;}offers.push(pool.splice(index,1)[0]);}
      say('OLEADA SUPERADA · Elige 1 de 3 mejoras. El catálogo original contiene 24.');
      const showOffers=()=>{for(const up of offers)button(up.name,async()=>{
        state.upgrades[up.id]=true;
        if(up.piece){const count=up.count||1;for(let i=0;i<count;i++){const q=randomFree((r,c)=>r>=5);if(q)add(makePiece(up.piece,'light',q[0],q[1],{apkHybrid:up.hybrid||null}));}}
        else{for(const p of pieces.filter(p=>p.color==='light'))view.els.get(p)?.classList.add(up.id==='lowgrav'?'apk-floating':up.id==='bighead'?'apk-bighead':'apk-upgraded');}
        actions.replaceChildren();button('Invocar siguiente oleada',spawnWave,true);
        say('Mejora: '+up.name+'. '+up.description);stats('Mejoras elegidas: '+Object.keys(state.upgrades).length+' · Oleada '+state.wave);
      });};
      const showReroll=()=>button('Cambiar cartas (1 corona)',async()=>{
        if(state.crowns<1){say('No tienes Coronas de Horda suficientes.');return;}
        state.crowns--;actions.replaceChildren();
        const deck=APK_HORDE_UPGRADES.filter(up=>!up.once||!state.upgrades[up.id]);
        offers.splice(0,offers.length);
        while(deck.length&&offers.length<3){const total=deck.reduce((sum,up)=>sum+up.weight,0);let roll=Math.random()*total,index=0;for(;index<deck.length-1;index++){roll-=deck[index].weight;if(roll<=0)break;}offers.push(deck.splice(index,1)[0]);}
        showOffers();showReroll();stats('Coronas restantes: '+state.crowns+' · Cartas nuevas');
      });
      showOffers();showReroll();
      stats('Oleada '+state.wave+' limpia · Elige una mejora · Coronas: '+state.crowns);
    }
    goal('El prototipo visual permite recorrer borrador, oleadas, minijefes cada cinco turnos y selección ponderada de mejoras. Toca las piezas enemigas para eliminarlas; no suplanta el combate ni las jugadas legales del APK.');
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
