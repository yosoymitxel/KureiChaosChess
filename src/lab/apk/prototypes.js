import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';
import { key } from '../../game/rules.js';
import { THEMES, applyTheme } from '../../data/themes.js';
import { animate } from 'animejs';
import { APK_BY_ID } from './catalog.js';
import { createAPKPlayableMatch } from './playable-match.js';
import { mountAPKExpansion } from './expansion.js';
import { clearAPKEffects, playAPKPixelTrail, playAPKZombieAttack, playAPKTransform, playAPKBombBlast, playAPKMeteorImpact, playAPKDamage, playAPKTeleport, playAPKFall, playAPKParticleBurst, playAPKBombField, playAPKShield, playAPKBeam, playAPKVictory, playAPKScreenShake, playAPKShockwave, playAPKDeal } from './effects.js';

const KN = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const DIR8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
const randInt = (n) => Math.floor(Math.random() * n);
const dist = (a,b) => Math.max(Math.abs(a.row-b.row), Math.abs(a.col-b.col));
const cloneBoard = (rows=8,cols=8,holes=[]) => ({ rows, cols, holes:new Set(holes.map(([r,c])=>key(r,c))), protectRows:0 });

export async function mountAPKPrototype(root, id, themeId='walnut') {
  const meta = APK_BY_ID[id] || APK_BY_ID.race;
  if (id === 'chaos' || ['boss2','horde','randarmy','giant','potato','p4'].includes(id) || ['party','modifier','recipe'].includes(meta.family)) return mountAPKExpansion(root, id, themeId);
  applyTheme(THEMES[themeId] ? themeId : 'walnut');
  root.innerHTML = '<main class="apk-proto"><header class="apk-head"><div><div class="apk-eyebrow">PROTOTIPO AISLADO · APK · NORMAL</div><h1></h1></div><a class="apk-back" href="lab-preview.html">Volver al banco</a></header><div class="apk-main"><section class="apk-board-frame"><div id="apk-board"></div></section><aside class="apk-panel panel"><div class="apk-kind"></div><p class="apk-desc"></p><div class="apk-objective"></div><div class="apk-status" role="status" aria-live="polite"></div><div class="apk-stats"></div><div class="apk-actions"></div><button class="btn sm apk-reset" type="button">Reiniciar prototipo</button><div class="apk-note">Dificultad Normal. Sin progreso ni recompensas. Los efectos APK tienen renderer propio; no son alias de BoardView.Fx.</div></aside></div></main>';
  const $ = (s) => root.querySelector(s);
  $('.apk-head h1').textContent = 'APK: ' + meta.name;
  $('.apk-kind').textContent = meta.family === 'mini' ? 'MINIJUEGO JUGABLE · DIFICULTAD NORMAL' : meta.family === 'mode' ? 'VARIANTE DE AJEDREZ · MUESTRA DE MECÁNICA' : 'ARCADE · ESTUDIO INTERACTIVO';
  $('.apk-desc').textContent = meta.description;
  const boardFrame = $('.apk-board-frame'), actionsEl = $('.apk-actions');
  let boardHost = $('#apk-board');
  const statusEl = $('.apk-status'), statsEl = $('.apk-stats'), objectiveEl = $('.apk-objective');
  let view=null, board=null, pieces=[], tapHandler=()=>{}, timer=null, state={};

  const say = (text) => { statusEl.textContent=text; };
  const stat = (text) => { statsEl.textContent=text; };
  const goal = (text) => { objectiveEl.textContent=text; };
  function button(label,fn,primary=false) {
    const b=document.createElement('button'); b.type='button'; b.className='btn sm'+(primary?' primary':''); b.textContent=label;
    b.addEventListener('click',async()=>{
      if(b.disabled||state.busy||state.over)return;
      b.disabled=true; state.busy=true;
      try { await fn(); }
      catch(e) { console.error('[APK lab]',e); say('Falló esta acción. Reinicia la escena; el motor principal no se ha modificado.'); }
      finally { state.busy=false; if(!b.dataset.lock && !state.over) b.disabled=false; }
    });
    actionsEl.append(b); return b;
  }
  function lock(b,on) { if(on){b.dataset.lock='true';b.disabled=true;} else {delete b.dataset.lock;b.disabled=false;} }
  function stopScene() {
    if(timer) clearInterval(timer);
    timer=null;
    if(boardFrame) clearAPKEffects(boardFrame);
    if(view) view.destroy();
    view=null; board=null; pieces=[]; tapHandler=()=>{}; state={};
    actionsEl.replaceChildren(); stat(''); say(''); goal('');
  }
  async function build(b,ps,onTap=()=>{}) {
    if(view) view.destroy();
    // BoardView deja un listener pointerdown en el host; sustituir el nodo evita acumular listeners
    // al reiniciar una escena en el laboratorio.
    boardHost=document.createElement('div'); boardHost.id='apk-board';
    boardFrame.replaceChildren(boardHost);
    board=b; pieces=ps; tapHandler=onTap;
    view=new BoardView(boardHost,{camera:'flat',vfx:false,shake:false,onTap:(hit)=>tapHandler(hit)});
    view.setBoard(board); view.setPieces(pieces);
    await playAPKDeal(view,pieces,boardFrame);
  }
  function labels(items) { if(view) view.setLabels(new Map(items.map(([r,c,t])=>[key(r,c),t]))); }
  function clearMarks() {
    if(!view)return;
    view.clearMarks();
    view.setDoom([]);
    for(const t of view.tiles.values()) t.classList.remove('doom','block','hot');
  }
  function free(r,c,ignore=null) {
    return !!board && r>=0&&c>=0&&r<board.rows&&c<board.cols&&!board.holes.has(key(r,c))
      && !pieces.some(p=>p!==ignore&&p.row===r&&p.col===c);
  }
  function addPiece(p) { pieces.push(p); view.addPiece(p); return p; }
  async function movePiece(p,r,c,arc=true,ms=260) {
    return movePieceAPK(p,r,c,ms,arc);
  }
  // Movimiento de la referencia APK: misma pieza/tablero, sin el polvo genérico de BoardView.Fx.
  async function movePieceAPK(p,r,c,ms=300,arc=true) {
    if(!p||!view||!view.state.has(p))return;
    const st=view.state.get(p),lift=arc?view.sq*.32:view.sq*.08;
    await animate(st,{r,c,z:[st.z,lift,0],duration:view.d(ms),ease:'outCubic',onUpdate:()=>view.apply(p)});
    p.row=r;p.col=c;st.r=r;st.c=c;st.z=0;view.apply(p);
  }
  async function removePiece(p) {
    return removePieceAPK(p,true);
  }
  // Desaparición directa para las coreografías APK: evita el VFX de muerte de Kure'i.
  async function removePieceAPK(p,effect=true) {
    if(!p||!view||!view.els.has(p))return;
    const at={row:p.row,col:p.col};
    if(effect)await playAPKFall(boardFrame,view,at);
    view.els.get(p)?.remove();view.els.delete(p);view.state.delete(p);
    pieces=pieces.filter(q=>q!==p);
  }
  function randomFree(predicate=()=>true) {
    const cells=[];
    for(let r=0;r<board.rows;r++)for(let c=0;c<board.cols;c++)if(free(r,c)&&predicate(r,c))cells.push([r,c]);
    return cells.length?pick(cells):null;
  }
  function basePieces() {
    return [
      makePiece('king','light',7,4,{royal:true}),makePiece('queen','light',7,3),makePiece('rook','light',7,0),makePiece('knight','light',6,1),makePiece('pawn','light',6,3),
      makePiece('king','dark',0,4,{royal:true}),makePiece('queen','dark',0,3),makePiece('rook','dark',0,7),makePiece('knight','dark',1,6),makePiece('pawn','dark',1,3),
    ];
  }
  function currentPiece(type,color) { return pieces.find(p=>p.type===type&&(!color||p.color===color)); }
  function pieceAt(r,c) { return pieces.find(p=>p.row===r&&p.col===c); }
  function nearbyCells(r,c,rad=1) {
    const out=[];for(let rr=Math.max(0,r-rad);rr<=Math.min(board.rows-1,r+rad);rr++)for(let cc=Math.max(0,c-rad);cc<=Math.min(board.cols-1,c+rad);cc++)out.push([rr,cc]);
    return out;
  }

  // 1) Pawn Race: select one pawn, roll 1-4, route to the opposite edge.
  async function startRace() {
    const b=cloneBoard(),white=[],black=[],specials=new Map();
    state={phase:'pick',turn:'light',chosen:{},frozen:{light:0,dark:0},routes:new Map(),rolls:0,coins:0,over:false,specials};
    const addSpecial=(type,n)=>{let tries=0,count=0;while(count<n&&tries++<300){const r=1+randInt(6),c=randInt(8),k=key(r,c);if(!specials.has(k)){specials.set(k,{type,row:r,col:c});count++;}}};
    addSpecial('wall',5);addSpecial('boost',3);addSpecial('ice',2);addSpecial('bomb',3);addSpecial('star',2);addSpecial('coin',4);
    const portalCells=[];
    for(let r=2;r<6;r++)for(let c=0;c<8;c++)if(!specials.has(key(r,c)))portalCells.push([r,c]);
    const pairA=pick(portalCells),pairB=pairA&&pick(portalCells.filter(([r,c])=>r!==pairA[0]||c!==pairA[1]));
    if(pairA&&pairB){specials.set(key(...pairA),{type:'portal',row:pairA[0],col:pairA[1],to:pairB});specials.set(key(...pairB),{type:'portal',row:pairB[0],col:pairB[1],to:pairA});}
    for(let c=0;c<8;c++){white.push(makePiece('pawn','light',7,c));black.push(makePiece('pawn','dark',0,c));}
    await build(b,[...white,...black],raceTap);
    const glyph={wall:'■',boost:'+2',ice:'❄',bomb:'!',star:'✦',coin:'$',portal:'↔'};
    function refresh() {
      clearMarks();
      labels([...specials.values()].map(s=>[s.row,s.col,glyph[s.type]]));
      for(const s of specials.values()){if(s.type==='wall')view.tiles.get(key(s.row,s.col))?.classList.add('block');if(s.type==='bomb')view.tiles.get(key(s.row,s.col))?.classList.add('doom');if(s.type==='ice')view.tiles.get(key(s.row,s.col))?.classList.add('hot');}
      stat('Tiradas: '+state.rolls+' · Monedas: '+state.coins);
    }
    function freeFor(r,c,p) {
      if(r<0||c<0||r>=8||c>=8||specials.get(key(r,c))?.type==='wall')return false;
      return !pieces.some(q=>q!==p&&q.row===r&&q.col===c);
    }
    function routes(p,steps) {
      const start=key(p.row,p.col),queue=[[p.row,p.col]],d=new Map([[start,0]]),parent=new Map([[start,null]]);
      while(queue.length){const [r,c]=queue.shift(),n=d.get(key(r,c));if(n>=steps)continue;const fw=p.color==='light'?-1:1;
        for(const [rr,cc] of [[r+fw,c],[r,c-1],[r,c+1]]){const k=key(rr,cc);if(d.has(k)||!freeFor(rr,cc,p))continue;d.set(k,n+1);parent.set(k,key(r,c));if(rr!==(p.color==='light'?0:7))queue.push([rr,cc]);}
      }
      const out=new Map();for(const [k,n] of d){if(k===start)continue;let cursor=k,path=[];while(cursor){const [r,c]=cursor.split(',').map(Number);path.unshift([r,c]);cursor=parent.get(cursor);}out.set(k,{row:+k.split(',')[0],col:+k.split(',')[1],path,dist:n});}return out;
    }
    async function choosePawn(side,c) {
      const row=side==='light'?7:0,p=pieces.find(q=>q.color===side&&q.row===row&&q.col===c);
      if(!p)return;
      pieces.slice().filter(q=>q.color===side&&q!==p).forEach(q=>{view.els.get(q)?.remove();view.els.delete(q);view.state.delete(q);pieces=pieces.filter(x=>x!==q);});
      state.chosen[side]=p;
      if(side==='light'&&!state.chosen.dark){let botCol=randInt(8);if(botCol===c)botCol=(botCol+3)%8;await choosePawn('dark',botCol);}
      if(state.chosen.light&&state.chosen.dark){state.phase='play';say('Tira el dado. Elige una casilla resaltada dentro del alcance.');lock(rollButton,false);}
      refresh();
    }
    async function raceTap(hit) {
      if(!hit||state.over)return;
      if(state.phase==='pick'){if(hit.row===7&&hit.piece?.color==='light')await choosePawn('light',hit.col);else if(pieces.some(p=>p.color==='light'&&p.row===7&&p.col===hit.col))await choosePawn('light',hit.col);return;}
      if(state.phase!=='play'||state.turn!=='light')return;
      const route=state.routes.get(key(hit.row,hit.col));if(!route)return;
      state.routes.clear();view.clearMarks();await runRaceRoute(state.chosen.light,route);
      if(await checkRaceWin(state.chosen.light,'light'))return;
      state.turn='dark';await botRace();if(!state.over){state.turn='light';say('Tu turno. Tira el dado.');lock(rollButton,false);}
    }
    async function runRaceRoute(p,route) {
      for(const [r,c] of route.path.slice(1)){if(state.over)return;await movePiece(p,r,c,true,125);const sp=specials.get(key(r,c));if(!sp)continue;
        if(sp.type==='boost'){for(let i=0;i<2;i++){const rr=p.row+(p.color==='light'?-1:1);if(!freeFor(rr,p.col,p))break;await movePiece(p,rr,p.col,true,100);}}
        else if(sp.type==='ice'){state.frozen[p.color]=1;specials.delete(key(r,c));await playAPKParticleBurst(boardFrame,view,{row:p.row,col:p.col},['#d3f9ff','#29e3ff','#ffffff'],18);}
        else if(sp.type==='bomb'){specials.delete(key(r,c));const at={row:p.row,col:p.col};await playAPKBombBlast(boardFrame,view,at,nearbyCells(at.row,at.col).map(([row,col])=>({row,col})));await playAPKScreenShake(boardFrame,180,6);for(let i=0;i<2;i++){const rr=p.row+(p.color==='light'?1:-1);if(!freeFor(rr,p.col,p))break;await movePiece(p,rr,p.col,true,90);}}
        else if(sp.type==='portal'&&sp.to){const [rr,cc]=sp.to;if(freeFor(rr,cc,p)){const from={row:p.row,col:p.col};await movePiece(p,rr,cc,true,160);await playAPKTeleport(boardFrame,view,from,{row:rr,col:cc});}}
        else if(sp.type==='star'){state.frozen[p.color==='light'?'dark':'light']=1;await playAPKParticleBurst(boardFrame,view,{row:p.row,col:p.col},['#ffcf6b','#ff2d55','#ffffff'],22);specials.delete(key(r,c));}
        else if(sp.type==='coin'){state.coins+=5;specials.delete(key(r,c));await playAPKParticleBurst(boardFrame,view,{row:p.row,col:p.col},['#ffc83d','#fff2bd','#ff9f1c'],16);}
        if(p.row===(p.color==='light'?0:7)){await checkRaceWin(p,p.color);return;}
      }
      refresh();
    }
    async function checkRaceWin(p,side){if(p.row!==(side==='light'?0:7))return false;state.over=true;lock(rollButton,true);say(side==='light'?'¡Victoria! Llegaste al borde.':'El bot llegó primero.');await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#3dff8e']);return true;}
    async function rollRace() {
      if(state.phase!=='play'||state.turn!=='light'||state.over)return;
      if(state.frozen.light){state.frozen.light--;say('Hielo: pierdes esta tirada.');state.turn='dark';await botRace();if(!state.over){state.turn='light';lock(rollButton,false);}return;}
      const n=1+randInt(4);state.rolls++;state.routes=routes(state.chosen.light,n);rollButton.textContent='Dado: '+n+' · elige casilla';lock(rollButton,true);
      for(const k of state.routes.keys())view.tiles.get(k)?.classList.add('mv');
      say(state.routes.size?'Salió '+n+'. Toca una casilla resaltada.':'No hay ruta con esa tirada; turno perdido.');
      stat('Tiradas: '+state.rolls+' · Monedas: '+state.coins+' · Dado: '+n);
      if(!state.routes.size){state.turn='dark';await botRace();if(!state.over){state.turn='light';lock(rollButton,false);}}
    }
    async function botRace() {
      if(state.over)return;
      state.turn='dark';say(state.frozen.dark?'El bot pierde el turno por el hielo.':'Turno del bot…');
      if(state.frozen.dark){state.frozen.dark--;return;}
      await wait(280);const p=state.chosen.dark;if(!p)return;
      const n=1+randInt(4),opts=routes(p,n);let best=null,bv=-1e9;
      for(const [k,r] of opts){const sp=specials.get(k),advance=r.row;const bonus={boost:12,star:10,coin:3,portal:5,bomb:-20,ice:-10,wall:-99}[sp?.type]||0;const score=advance*10+bonus+Math.random()*2;if(score>bv){bv=score;best=r;}}
      if(best)await runRaceRoute(p,best);if(!state.over)await checkRaceWin(p,'dark');refresh();
    }
    objective('Elige un peón marfil para correr. Cada tirada permite hasta cuatro pasos hacia delante o a los lados; gana quien llegue al otro extremo.');
    say('Toca un peón marfil en la fila inferior para elegir corredor.');
    const rollButton=button('Tirar dado (1–4)',rollRace,true);lock(rollButton,true);
    refresh();
  }

  // 2) Bomb Dodge: warned tiles explode after each king has moved once.
  async function startDodge() {
    state={round:0,waiting:true,over:false,warn:new Set(),craters:new Map(),pickups:new Set(),shielded:new Set()};
    const kings=[makePiece('king','light',4,3,{royal:true}),makePiece('king','dark',0,0,{royal:true}),makePiece('king','dark',0,7,{royal:true}),makePiece('king','dark',7,7,{royal:true})];
    await build(cloneBoard(),kings,dodgeTap);
    function occupied(r,c,p=null){return pieces.some(q=>q!==p&&q.row===r&&q.col===c);}
    function freeDodge(r,c,p=null){return r>=0&&c>=0&&r<8&&c<8&&!state.craters.has(key(r,c))&&!occupied(r,c,p);}
    function startRound() {
      if(state.over)return;
      state.round++;state.waiting=true;state.warn=new Set();
      for(const [k,n] of [...state.craters]){if(n<=1)state.craters.delete(k);else state.craters.set(k,n-1);}
      for(const t of view.tiles.values())t.classList.remove('block','doom');
      const cells=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(!state.craters.has(key(r,c)))cells.push([r,c]);
      const n=Math.min(32,5+Math.floor(state.round*1.8));for(const [r,c] of cells.sort(()=>Math.random()-.5).slice(0,n))state.warn.add(key(r,c));
      if(state.round%3===0){const q=cells.find(([r,c])=>!state.warn.has(key(r,c)));if(q)state.pickups.add(key(q[0],q[1]));}
      view.setDoom([...state.warn].map(k=>k.split(',').map(Number)));
      for(const k of state.craters.keys())view.tiles.get(k)?.classList.add('block');
      labels([...state.pickups].map(k=>[...k.split(',').map(Number),'S']));
      const me=currentPiece('king','light');
      if(me){const opts=DIR8.map(([dr,dc])=>[me.row+dr,me.col+dc]).filter(([r,c])=>freeDodge(r,c,me));view.showMoves(new Set(opts.map(([r,c])=>key(r,c))),new Set());}
      say('Ronda '+state.round+': rojo = bomba. Toca una casilla vecina o usa Quedarse.');
      stat('Reyes en pie: '+pieces.filter(p=>p.type==='king').length+' · Ronda: '+state.round);
    }
    async function dodgeTap(hit) {
      if(!state.waiting||state.over||!hit)return;
      const me=currentPiece('king','light');if(!me||dist(me,{row:hit.row,col:hit.col})>1||!freeDodge(hit.row,hit.col,me))return;
      await resolveRound([hit.row,hit.col]);
    }
    async function resolveRound(playerCell) {
      if(!state.waiting||state.over)return;state.waiting=false;view.clearMarks();
      const me=currentPiece('king','light'),targets=new Map(),taken=new Set();
      if(me){targets.set(me,playerCell);taken.add(key(...playerCell));}
      for(const p of pieces.filter(q=>q!==me&&q.type==='king')){
        const opts=DIR8.map(([dr,dc])=>[p.row+dr,p.col+dc]).filter(([r,c])=>freeDodge(r,c,p)&&!taken.has(key(r,c)));
        const safe=opts.filter(([r,c])=>!state.warn.has(key(r,c)));
        const dest=pick(safe.length?safe:opts.length?opts:[[p.row,p.col]]);
        targets.set(p,dest);taken.add(key(...dest));
      }
      for(const [p,[r,c]] of targets)await movePiece(p,r,c,true,150);
      for(const p of pieces.slice()){const k=key(p.row,p.col);if(state.pickups.has(k)){state.pickups.delete(k);state.shielded.add(p);await playAPKShield(boardFrame,view,{row:p.row,col:p.col});}}
      const detonations=[...state.warn].map(k=>{const [row,col]=k.split(',').map(Number);return {row,col};});
      await playAPKBombField(boardFrame,view,detonations);
      for(const k of state.warn){
        const [r,c]=k.split(',').map(Number),tile=view.tiles.get(k),p=pieceAt(r,c);
        state.craters.set(k,2);tile?.classList.add('block');
        if(p&&p.type==='king'){if(state.shielded.has(p)){state.shielded.delete(p);await playAPKShield(boardFrame,view,{row:r,col:c},true);continue;}await removePiece(p);}
      }
      view.setDoom([]);
      if(!currentPiece('king','light')){state.over=true;say('El rey marfil fue alcanzado. Reinicia para volver a jugar.');stat('Rondas sobrevividas: '+(state.round-1));return;}
      if(!pieces.some(p=>p.type==='king'&&p.color==='dark')){state.over=true;say('¡Último rey en pie! Ganaste la supervivencia.');await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#29e3ff']);return;}
      startRound();
    }
    goal('Las casillas rojas explotan al resolver la ronda. Mueve una casilla por ronda; los escudos bloquean un impacto y los cráteres permanecen un tiempo.');
    button('Quedarse en la casilla',async()=>{const me=currentPiece('king','light');if(me)await resolveRound([me.row,me.col]);},true);
    startRound();
  }

  // 3) Knight's Feast: 45 second timer, knight jumps, gems, combos and spikes.
  async function startFeast() {
    const knight=makePiece('knight','light',4,3);
    state={knight,time:45,score:0,moves:0,combo:0,lastGem:-9,started:false,over:false,gems:[],spikes:new Map(),spikeTimer:5};
    await build(cloneBoard(),[knight],feastTap);
    function busy(r,c){return (knight.row===r&&knight.col===c)||state.gems.some(g=>g.row===r&&g.col===c)||state.spikes.has(key(r,c));}
    function spawnGem(){for(let i=0;i<100;i++){const r=randInt(8),c=randInt(8);if(!busy(r,c)){state.gems.push({row:r,col:c,gold:Math.random()<.13});return;}}}
    function refreshFeast(){
      view.clearMarks();
      for(const [r,c] of KN.map(([dr,dc])=>[knight.row+dr,knight.col+dc]).filter(([r,c])=>r>=0&&c>=0&&r<8&&c<8))view.tiles.get(key(r,c))?.classList.add('mv');
      view.setDoom([...state.spikes.keys()].map(k=>k.split(',').map(Number)));
      const items=state.gems.map(g=>[g.row,g.col,g.gold?'★':'◆']);
      for(const k of state.spikes.keys()){const [r,c]=k.split(',').map(Number);items.push([r,c,'!']);}
      labels(items);
    }
    async function feastTap(hit){
      if(state.over||!hit)return;
      const r=hit.row,c=hit.col;if(!KN.some(([dr,dc])=>knight.row+dr===r&&knight.col+dc===c))return;
      if(!state.started)state.started=true;
      await movePiece(knight,r,c,true,150);state.moves++;
      const k=key(r,c);
      if(state.spikes.has(k)){state.spikes.delete(k);state.time=Math.max(0,state.time-5);state.combo=0;await playAPKDamage(boardFrame,view,{row:r,col:c},'red');await playAPKScreenShake(boardFrame,180,6);say('¡Pincho! Pierdes cinco segundos y se corta el combo.');}
      const idx=state.gems.findIndex(g=>g.row===r&&g.col===c);
      if(idx>=0){const g=state.gems.splice(idx,1)[0];state.combo=state.moves-state.lastGem<=2?state.combo+1:1;state.lastGem=state.moves;const points=(g.gold?3:1)*Math.min(5,state.combo);state.score+=points;if(g.gold)state.time+=3;await playAPKParticleBurst(boardFrame,view,{row:r,col:c},g.gold?['#ffc83d','#fff2bd','#ff9f1c']:['#29e3ff','#d3f9ff','#ffffff'],g.gold?22:14);say(g.gold?'¡Gema dorada! +3 segundos.':'Gema recogida: busca otra para mantener el combo.');spawnGem();}
      stat('Puntos: '+state.score+' / 20 · Tiempo: '+state.time.toFixed(1)+' s · Combo ×'+Math.max(1,Math.min(5,state.combo)));
      refreshFeast();
      if(state.score>=20&&!state.over){
        state.over=true;clearInterval(timer);timer=null;start.disabled=true;
        say('¡Festín completado! Alcanzaste 20 puntos.');
        await playAPKVictory(boardFrame,view,['#ffc83d','#fff2bd','#3dff8e']);
      }
    }
    for(let i=0;i<3;i++)spawnGem();
    const start=button('Iniciar reloj',async()=>{if(state.started)return;state.started=true;say('¡A por las gemas!');},true);
    timer=setInterval(()=>{
      if(!state.started||state.over)return;
      state.time=Math.max(0,state.time-.1);state.spikeTimer-=.1;
      if(state.spikeTimer<=0){state.spikeTimer=Math.max(2,5-state.score/20);for(let i=0;i<50;i++){const r=randInt(8),c=randInt(8);if(!busy(r,c)){state.spikes.set(key(r,c),8);break;}}}
      for(const [k,v] of [...state.spikes]){if(v<=.1)state.spikes.delete(k);else state.spikes.set(k,v-.1);}
      stat('Puntos: '+state.score+' · Tiempo: '+state.time.toFixed(1)+' s · Combo ×'+Math.max(1,Math.min(5,state.combo)));
      refreshFeast();
      if(state.time<=0){state.over=true;clearInterval(timer);timer=null;start.disabled=true;say('Derrota: se agotó el tiempo con '+state.score+' puntos.');}
    },100);
    goal('Solo saltos en L. Recoge gemas hasta llegar a 20 puntos antes de que se agoten los 45 segundos. Los pinchos restan tiempo y las gemas doradas añaden tres segundos.');
    say('Pulsa Iniciar reloj o haz el primer salto.');
    stat('Puntos: 0 · Tiempo: 45 s');refreshFeast();
  }

  function setModePieces(id) {
    if(id==='micro')return {board:cloneBoard(5,5),pieces:[
      makePiece('king','light',4,2,{royal:true}),makePiece('rook','light',4,0),makePiece('pawn','light',3,1),
      makePiece('king','dark',0,2,{royal:true}),makePiece('rook','dark',0,4),makePiece('pawn','dark',1,3),
    ]};
    if(id==='boss')return {board:cloneBoard(),pieces:[
      makePiece('king','light',7,4,{royal:true}),makePiece('queen','light',6,2),makePiece('rook','light',7,0),makePiece('knight','light',6,1),
      makePiece('boss-titan','dark',0,3,{boss:'titan',h:2,w:2,hp:8,maxHp:8,name:'Titán',royal:true,moves:['queen']}),
    ]};
    if(id==='infinite')return {board:cloneBoard(),pieces:[
      makePiece('king','light',7,4,{royal:true}),makePiece('queen','light',6,3),makePiece('rook','light',7,0),
      makePiece('pawn','dark',0,1),makePiece('pawn','dark',0,6),
    ]};
    if(id==='zombie')return {board:cloneBoard(),pieces:[
      makePiece('pawn','dark',5,2,{zombie:true,infected:true}),makePiece('pawn','light',3,3),
      makePiece('king','light',7,6,{royal:true}),makePiece('king','dark',0,0,{royal:true}),
    ]};
    const board=id==='gravity'?cloneBoard(8,8,[[3,2],[3,5],[4,2],[4,5]]):cloneBoard();
    const pieces=basePieces();
    const target=pieces.find(p=>p.color==='dark'&&p.type==='pawn');
    if(id==='battle'&&target){target.hp=3;target.maxHp=3;}
    if(id==='bomb'&&target)target.bomb=true;
    return {board,pieces};
  }

  async function runMeteor() {
    const cells=[];for(let i=0;i<3;i++){const q=randomFree((r,c)=>r>1&&r<board.rows-1);if(q&&!cells.some(([r,c])=>r===q[0]&&c===q[1]))cells.push(q);}
    if(!cells.length)return;
    const lost=pieces.filter(p=>cells.some(([r,c])=>r===p.row&&c===p.col));
    for(const [r,c] of cells){board.holes.add(key(r,c));view.tiles.get(key(r,c))?.classList.add('icehole');}
    view.setDoom(cells);say('¡Impacto anunciado!');await playAPKMeteorImpact(boardFrame,view,cells.map(([row,col])=>({row,col})));
    for(const p of lost)await removePieceAPK(p,false);
    view.setDoom([]);
    say('Meteorito resuelto: aviso circular, caída pixelada e impacto rojo. Las piezas alcanzadas desaparecieron.');
  }
  async function runBomb() {
    const center=pieces.find(p=>p.bomb)||pieces.find(p=>p.color==='dark'&&p.type==='pawn')||pieces[0];if(!center)return;
    const r=center.row,c=center.col;
    const victims=pieces.filter(p=>dist(p,{row:r,col:c})<=1),area=nearbyCells(r,c);
    view.setDoom(area);say('¡Mecha consumida! Explosión por bloques 3×3 y escombros.');
    await playAPKBombBlast(boardFrame,view,{row:r,col:c},area.map(([row,col])=>({row,col})));
    for(const p of victims)await removePieceAPK(p,false);
    view.setDoom([]);stat('Piezas restantes: '+pieces.length);
  }
  async function runZombie() {
    const zombie=pieces.find(q=>q.zombie)||pieces.find(q=>q.color==='dark'&&q.type==='pawn');
    if(!zombie){say('No queda zombi activo. Reinicia el prototipo.');return;}
    const targets=pieces.filter(q=>q!==zombie&&!q.zombie&&q.type!=='king');
    const target=(targets.length?targets:pieces.filter(q=>q!==zombie&&!q.zombie))
      .sort((a,b)=>dist(zombie,a)-dist(zombie,b))[0];
    if(!target){say('No quedan piezas vivas que perseguir.');return;}
    zombie.zombie=true;zombie.infected=true;view.remake(zombie);
    let guard=0;
    while(dist(zombie,target)>1&&guard++<6){
      const from={row:zombie.row,col:zombie.col};
      const options=DIR8.map(([dr,dc])=>[zombie.row+dr,zombie.col+dc])
        .filter(([r,c])=>free(r,c,zombie)&&dist({row:r,col:c},target)<dist(zombie,target));
      options.sort((a,b)=>dist({row:a[0],col:a[1]},target)-dist({row:b[0],col:b[1]},target));
      if(!options.length)break;
      const to={row:options[0][0],col:options[0][1]};
      await movePieceAPK(zombie,to.row,to.col,300);
      await playAPKPixelTrail(boardFrame,view,from,to);
    }
    const from={row:zombie.row,col:zombie.col},to={row:target.row,col:target.col};
    await playAPKZombieAttack(boardFrame,view,from,to);
    target.color=zombie.color;target.zombie=true;target.infected=true;view.remake(target);
    await playAPKTransform(boardFrame,view,to);
    say('APK Zombie Chess: el zombi persigue la pieza viva, la muerde y la convierte. secuencia visual propia sin depender del renderer original.');
    stat('Zombis activos: '+pieces.filter(p=>p.zombie).length+' · Piezas infectadas: '+pieces.filter(p=>p.infected).length);
  }
  async function runGravity() {
    const dirs=[[1,0],[0,1],[-1,0],[0,-1]];
    const d=dirs[(state.gravity=(state.gravity||0)+1)%dirs.length];
    const projection=p=>p.row*d[0]+p.col*d[1];
    let changed=0,lastShift=null;
    for(let pass=0;pass<Math.max(board.rows,board.cols);pass++){
      const order=pieces.slice().sort((a,b)=>projection(b)-projection(a));
      let moved=false;
      for(const p of order){
        const r=p.row+d[0],c=p.col+d[1];
        if(r<0||c<0||r>=board.rows||c>=board.cols)continue;
        if(board.holes.has(key(r,c))){await removePieceAPK(p,true);moved=true;changed++;continue;}
        if(free(r,c,p)){const from={row:p.row,col:p.col};await movePieceAPK(p,r,c,115);lastShift={from,to:{row:r,col:c}};moved=true;changed++;}
      }
      if(!moved)break;
    }
    if(lastShift)await playAPKPixelTrail(boardFrame,view,lastShift.from,lastShift.to);
    say('Gravedad APK: deslizamiento por pasos sin polvo genérico; piezas desplazadas o absorbidas: '+changed+'. Al volver a pulsar cambia la dirección.');
  }
  async function runBoss() {
    const p=pieces.find(q=>q.boss);if(!p)return;
    p.hp=Math.max(0,(p.hp||6)-1);await playAPKDamage(boardFrame,view,{row:p.row,col:p.col},'red');stat('Titán: '+p.hp+' / '+p.maxHp+' HP');
    if(p.hp<=0){await removePieceAPK(p,true);state.over=true;say('¡Jefe derribado! La muestra de jefe termina aquí.');}
    else say('Golpe APK: flash y fragmentos rectangulares propios. La IA completa del jefe no se trae al laboratorio.');
  }
  async function runArena() {
    const event=pick(['meteor','quake','freeze','mirror']);
    if(event==='meteor')return runMeteor();
    if(event==='quake'){for(const p of pieces.slice()){if(p.type==='king'||Math.random()>.35)continue;const q=randomFree((r,c)=>r>0&&r<board.rows-1);if(q){const from={row:p.row,col:p.col},to={row:q[0],col:q[1]};await movePieceAPK(p,to.row,to.col,120);await playAPKPixelTrail(boardFrame,view,from,to);}}say('Chaos Arena: terremoto por bloques; las piezas desplazadas dejan una estela propia.');return;}
    if(event==='freeze'){const p=pieces.find(q=>q.color==='dark'&&q.type!=='king');if(p){view.els.get(p)?.classList.add('fogged');await playAPKFall(boardFrame,view,{row:p.row,col:p.col});say('Chaos Arena: el rival se congela con caída pixelada.');}return;}
    for(const p of pieces.slice()){const from={row:p.row,col:p.col},to={row:p.row,col:board.cols-1-p.col};await movePieceAPK(p,to.row,to.col,140);await playAPKPixelTrail(boardFrame,view,from,to);}
    say('Chaos Arena: espejo del tablero con trayectoria pixelada.');
  }
  async function runBattle() {
    const p=pieces.find(q=>q.color==='dark'&&q.type!=='king'&&q.maxHp>1)||pieces.find(q=>q.color==='dark'&&q.type==='pawn');if(!p)return;
    if(!p.maxHp){p.maxHp=3;p.hp=3;view.remake(p);}
    p.hp=Math.max(0,p.hp-1);await playAPKDamage(boardFrame,view,{row:p.row,col:p.col},'gold');
    if(p.hp<=0){await removePieceAPK(p,true);say('La pieza cayó tras el duelo.');}else say('Duelo APK: destello por bloques y astillas doradas. Queda en '+p.hp+' HP.');
  }
  async function runChaos() {
    const king=currentPiece('king','light'),q=king&&randomFree((r,c)=>r>1&&r<board.rows-1&&c>1&&c<board.cols-1);
    if(king&&q){const from={row:king.row,col:king.col},to={row:q[0],col:q[1]};await movePieceAPK(king,to.row,to.col,190);await playAPKTeleport(boardFrame,view,from,to);say('Poder de caos: teletransporte con remolino pixelado cian/violeta. La demo muestra un poder; no reemplaza reglas legales.');}
    else say('No hay destino libre para teleportar.');
  }
  async function runCard(kind) {
    if(kind==='freeze'){const p=pieces.find(q=>q.color==='dark'&&q.type!=='king');if(p){view.els.get(p)?.classList.add('fogged');await playAPKFall(boardFrame,view,{row:p.row,col:p.col});say('Carta APK: congelar rival con caída pixelada.');}return;}
    if(kind==='teleport'){const p=currentPiece('knight','light'),q=randomFree((r,c)=>r>1&&r<board.rows-1);if(p&&q){const from={row:p.row,col:p.col},to={row:q[0],col:q[1]};await movePieceAPK(p,to.row,to.col,190);await playAPKTeleport(boardFrame,view,from,to);say('Carta APK: teletransporte de caballo con remolino propio.');}return;}
    const q=randomFree((r,c)=>r<2);if(q){const p=makePiece('pawn','dark',q[0],q[1],{zombie:true});pieces.push(p);view.addPiece(p);await playAPKTransform(boardFrame,view,{row:p.row,col:p.col});say('Carta APK: revivir un peón con sello INFECTED!');}
  }
  async function runMayhem() {
    const picks=['bomb','zombie','gravity','arena','boss','chaos'];
    const a=pick(picks),b=pick(picks.filter(x=>x!==a));
    say('Mayhem: dos reglas elegidas al azar para mostrar su combinación ('+a+' + '+b+').');
    for(const id of [a,b]){if(state.over)break;await runModeAction(id);}
  }
  async function runModeAction(id) {
    if(id==='chaos')return runChaos();
    if(id==='battle')return runBattle();
    if(id==='zombie')return runZombie();
    if(id==='bomb')return runBomb();
    if(id==='gravity')return runGravity();
    if(id==='boss')return runBoss();
    if(id==='arena')return runArena();
    if(id==='cards')return runCard('freeze');
    if(id==='infinite'){
      let count=0;for(let i=0;i<2;i++){const q=randomFree((r,c)=>r<2);if(q){addPiece(makePiece('pawn','dark',q[0],q[1]));count++;}}
      state.wave=(state.wave||0)+1;stat('Oleada: '+state.wave+' · Enemigos: '+pieces.filter(p=>p.color==='dark').length);say('Oleada invocada ('+count+' peones). El rival no tiene rey; la demo estudia supervivencia.');return;
    }
    if(id==='micro'){const k=currentPiece('king','light');if(k){const opts=DIR8.map(([dr,dc])=>[k.row+dr,k.col+dc]).filter(([r,c])=>free(r,c,k));view.showMoves(new Set(opts.map(([r,c])=>key(r,c))),new Set());say('Tablero 5×5: casillas adyacentes resaltadas para mostrar el formato compacto.');}return;}
    if(id==='mayhem')return runMayhem();
  }
  async function startMode(id) {
    let {board:b,pieces:ps}=setModePieces(id);
    state={mode:id,over:false,gravity:0,wave:0,turns:0};
    if(id==='micro'){
      let playable=null;
      await build(b,ps,hit=>playable?.tap(hit));
      playable=createAPKPlayableMatch({board:b,pieces:ps,view,boardFrame,say,stats:stat,onGameOver:()=>{state.over=true;}});
      goal('Micro Chess 5×5: partida contra IA con movimientos legales, capturas y victoria al capturar el rey.');
      await playable.start();
      return;
    }
    let modifier=null,objective=null,tick=null,onMove=null,onTransition=null,configureMatch=null;
    if(id==='battle'){
      for(const p of ps)if(p.type!=='king'){p.hp=3;p.maxHp=3;}
      goal('Battle Chess: todas las piezas resisten hasta tres golpes. Captura el rey rival para ganar; el daño se conserva entre turnos.');
    }else if(id==='boss'){
      goal('Derrota al Titán 2×2 de ocho puntos de vida. El jefe se mueve y captura como una dama; captura al rey para perder.');
    }else if(id==='zombie'){
      modifier='zombie';
      goal('Zombie Chess: las piezas menores capturadas se levantan para el bando vencedor como zombis. Gana quien capture el rey rival.');
    }else if(id==='chaos'){
      modifier='chaos';
      const king=ps.find(p=>p.color==='light'&&p.type==='king');
      const queen=ps.find(p=>p.color==='light'&&p.type==='queen');
      const rook=ps.find(p=>p.color==='light'&&p.type==='rook');
      if(king)king.extraMoveTypes=['knight'];
      if(queen)queen.extraMoveTypes=['king'];
      if(rook)rook.extraMoveTypes=['rook2'];
      goal('Chaos Chess: piezas marfil con movimientos prestados y derrumbe de bordes cada tres turnos. Captura el rey rival.');
    }else if(id==='bomb'){
      ps.filter(p=>p.color==='dark'&&p.type!=='king').slice(0,2).forEach(p=>p.bomb=true);
      onMove=async(match,result)=>{
        const queue=(result.victims||[]).filter(v=>v.killed&&v.piece.bomb).map(v=>({row:v.piece.row,col:v.piece.col}));
        const exploded=new Set();
        while(queue.length){
          const center=queue.shift(),ck=key(center.row,center.col);
          if(exploded.has(ck))continue;
          exploded.add(ck);
          const cells=nearbyCells(center.row,center.col);
          await playAPKBombBlast(boardFrame,view,center,cells.map(([row,col])=>({row,col})));
          const victims=match.pieces.filter(p=>dist(p,center)<=1);
          for(const victim of victims){
            match.pieces.splice(match.pieces.indexOf(victim),1);
            if(victim.bomb)queue.push({row:victim.row,col:victim.col});
            await playAPKFall(boardFrame,view,{row:victim.row,col:victim.col});
            view.els.get(victim)?.remove();view.els.delete(victim);view.state.delete(victim);
          }
        }
      };
      tick=match=>{
        if(match.turn>0&&match.turn%8===0){
          const p=pick(match.pieces.filter(p=>p.color==='dark'&&p.type!=='king'&&!p.bomb));
          if(p){p.bomb=true;view.remake(p);return{armed:p};}
        }
        return null;
      };
      goal('Bomb Chess: ciertas piezas llevan mecha. Al capturarlas explotan en 3×3 y encadenan otras bombas. Captura el rey rival.');
    }else if(id==='gravity'){
      const dirs=[[1,0],[0,1],[-1,0],[0,-1]];
      onMove=async(match)=>{
        const d=dirs[(state.gravity++)%dirs.length];
        const projection=p=>p.row*d[0]+p.col*d[1];
        for(let pass=0;pass<Math.max(b.rows,b.cols);pass++){
          const order=match.pieces.slice().sort((a,z)=>projection(z)-projection(a));
          let shifted=false;
          for(const p of order){
            const row=p.row+d[0],col=p.col+d[1];
            if(row<0||col<0||row>=b.rows||col>=b.cols)continue;
            if(b.holes.has(key(row,col))){
              match.pieces.splice(match.pieces.indexOf(p),1);
              if(p.royal)match.eliminated[p.color]=true;
              await playAPKFall(boardFrame,view,{row:p.row,col:p.col});
              view.els.get(p)?.remove();view.els.delete(p);view.state.delete(p);shifted=true;continue;
            }
            if(match.pieces.some(q=>q!==p&&q.row===row&&q.col===col))continue;
            const st=view.state.get(p);if(!st)continue;
            p.row=row;p.col=col;
            await animate(st,{r:row,c:col,z:[st.z,view.sq*.12,0],duration:view.d(95),ease:'outCubic',onUpdate:()=>view.apply(p)});
            st.r=row;st.c=col;st.z=0;view.apply(p);shifted=true;
          }
          if(!shifted)break;
        }
      };
      goal('Gravity Chess: después de cada jugada, todas las piezas se deslizan un paso en la dirección actual. Los agujeros absorben piezas y reyes.');
    }else if(id==='arena'){
      modifier=pick(['chaos','meteor','zombie']);
      goal('Chaos Arena: '+({chaos:'el borde se derrumba',meteor:'caen meteoritos anunciados',zombie:'las piezas menores capturadas vuelven como zombis'}[modifier])+'. La partida sigue las reglas elegidas hasta capturar un rey.');
      onTransition=async(match,transition)=>{
        if(transition.collapse){
          for(const [row,col] of transition.collapse)view.tiles.get(key(row,col))?.classList.add('icehole');
        }
        if(transition.meteor?.warn){
          view.setDoom(transition.meteor.warn);
          say('¡Meteorito anunciado! Sal de las casillas rojas antes de la siguiente jugada.');
        }
        if(transition.meteor?.lost){
          view.setDoom([]);
          for(const p of transition.meteor.lost){
            await playAPKMeteorImpact(boardFrame,view,[{row:p.row,col:p.col}]);
            view.els.get(p)?.remove();view.els.delete(p);view.state.delete(p);
          }
        }
      };
    }else if(id==='cards'){
      configureMatch=match=>{
        const legal=match.legal.bind(match);
        match.legal=piece=>piece.apkFrozen>0?[]:legal(piece);
      };
      tick=match=>{
        for(const p of match.pieces)if(p.apkFrozen>0)p.apkFrozen--;
        return null;
      };
      goal('Card Chess: juega cartas tácticas antes o después de mover. Una carta congela una pieza rival durante su próximo turno; gana por captura de rey.');
    }else if(id==='infinite'){
      modifier='zombie';
      const darkKing=ps.find(p=>p.color==='dark'&&p.type==='king');
      if(darkKing){darkKing.royal=false;ps.splice(ps.indexOf(darkKing),1);}
      objective=match=>{
        if(!match.pieces.some(p=>p.color==='light'&&p.type==='king'&&p.royal))return{victory:false};
        return state.turns>=16?{victory:true}:null;
      };
      tick=match=>{
        if(match.player.color==='light'){
          state.turns++;
          if(state.turns%2===0){
            for(let i=0;i<2;i++){
              const q=[];
              for(let row=0;row<3;row++)for(let col=0;col<b.cols;col++){
                if(!b.holes.has(key(row,col))&&!match.pieces.some(p=>p.row===row&&p.col===col))q.push([row,col]);
              }
              if(!q.length)break;
              const [row,col]=pick(q),enemy=makePiece(pick(['pawn','knight','bishop']),'dark',row,col);
              match.pieces.push(enemy);view.addPiece(enemy);
            }
          }
        }
        return null;
      };
      goal('Infinite Chess: sobrevive 16 turnos a las oleadas que entran por arriba. Conserva tu rey; las piezas menores enemigas capturadas pueden regresar como zombis.');
    }else if(id==='mayhem'){
      modifier=pick(['chaos','zombie','meteor','contagion']);
      for(const p of ps)if(p.color==='dark'&&p.type!=='king'&&Math.random()<.25){p.hp=2;p.maxHp=2;}
      goal('Mayhem Mode: combinación aleatoria activa ('+modifier+'). Las reglas cambian el tablero durante la partida; captura el rey rival.');
    }
    let playable=null;
    await build(b,ps,hit=>playable?.tap(hit));
    for(const p of ps)if(p.extraMoveTypes?.length)view.els.get(p)?.classList.add('mutated');
    playable=createAPKPlayableMatch({
      board:b,pieces:ps,view,boardFrame,say,stats:stat,modifier,objective,tick,configureMatch,onMove,onTransition,
      onGameOver:()=>{state.over=true;actionsEl.replaceChildren();},
    });
    if(id==='cards'){
      button('Carta: congelar',async()=>{
        const p=playable.match.pieces.find(p=>p.color==='dark'&&p.type!=='king'&&!p.apkFrozen);
        if(!p){say('No hay una pieza rival disponible para congelar.');return;}
        p.apkFrozen=2;view.els.get(p)?.classList.add('fogged');
        say('Carta jugada: '+p.type+' congelado durante el siguiente turno rival.');
      },true);
      button('Carta: teletransportar caballo',async()=>{
        const p=playable.match.pieces.find(p=>p.color==='light'&&p.type==='knight');
        const options=[];
        for(let row=0;row<b.rows;row++)for(let col=0;col<b.cols;col++)if(!playable.match.pieceAt(row,col)&&!b.holes.has(key(row,col)))options.push([row,col]);
        if(!p||!options.length){say('No hay caballo o destino libre.');return;}
        const [row,col]=pick(options),from={row:p.row,col:p.col};
        p.row=row;p.col=col;const st=view.state.get(p);
        await animate(st,{r:row,c:col,duration:view.d(220),ease:'outCubic',onUpdate:()=>view.apply(p)});
        st.r=row;st.c=col;st.z=0;view.apply(p);await playAPKTeleport(boardFrame,view,from,{row,col});
        say('Carta jugada: caballo teletransportado.');
      });
    }
    await playable.start();
    stat(id==='boss'?'Titán 2×2 · 8 HP · partida contra IA':id==='micro'?'Tablero 5×5 · partida contra IA':'Partida contra IA · '+(modifier||'reglas clásicas'));
  }

  async function startPawnDodge() {
    const king=makePiece('king','light',7,3,{royal:true}),hazards=[makePiece('rook','dark',0,1),makePiece('bishop','dark',1,4),makePiece('knight','dark',2,6)];
    state={king,hazards,score:0,step:0,over:false};
    await build(cloneBoard(),[king,...hazards],async hit=>{
      if(state.over||!hit||dist(king,{row:hit.row,col:hit.col})!==1||!free(hit.row,hit.col,king))return;
      await movePiece(king,hit.row,hit.col);state.score++;
      refreshDodge();
      if(hazards.some(p=>p.row===king.row&&p.col===king.col)){state.over=true;say('Una pieza te alcanzó. Reinicia para volver a intentarlo.');}
      else {if(hazards.some(p=>dist(p,king)===1))state.score+=5;stat('Puntos: '+state.score+' · Lluvias: '+state.step);say('Buen esquive. Evita las piezas que caen en la siguiente lluvia.');}
    });
    function refreshDodge(){
      const cells=DIR8.map(([dr,dc])=>[king.row+dr,king.col+dc]).filter(([r,c])=>r>=0&&c>=0&&r<8&&c<8&&free(r,c,king));
      view.showMoves(new Set(cells.map(([r,c])=>key(r,c))),new Set());
    }
    refreshDodge();
    goal('Mueve el rey una casilla para apartarte de las piezas que caen. Gana sobreviviendo diez lluvias; los casi-accidentes suman puntos.');
    button('Siguiente lluvia',async()=>{
      state.step++;
      for(const p of hazards){if(!pieces.includes(p))continue;const nr=p.row+1;if(nr>=8){const q=randomFree((r,c)=>r===0);if(q)await movePiece(p,q[0],q[1],false,120);}else await movePiece(p,nr,p.col,false,160);
        if(p.row===king.row&&p.col===king.col){state.over=true;await playAPKScreenShake(boardFrame,350,12);await playAPKDamage(boardFrame,view,{row:king.row,col:king.col});await removePiece(king);say('Impacto. El rey no sobrevivió; reinicia la demo.');return;}}
      if(state.step>=10){
        state.over=true;await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#29e3ff']);
        say('¡Victoria! Sobreviviste diez lluvias.');
        stat('Puntuación: '+state.score+' · Diez lluvias superadas');
        return;
      }
      const q=randomFree((r,c)=>r===0);if(q){const p=makePiece(pick(['pawn','knight','bishop','rook']),'dark',q[0],q[1]);hazards.push(p);addPiece(p);}
      stat('Puntos: '+state.score+' · Lluvias: '+state.step+' / 10');say('¡Nueva lluvia! Esquiva una casilla vecina.');refreshDodge();
    },true);
    stat('Puntos: 0 · Lluvias: 0');
  }
  async function startParkour() {
    const knight=makePiece('knight','light',7,3);
    state={knight,lava:8,coins:0,jumps:0,over:false,spikes:new Set([key(6,5),key(4,4),key(2,2)]),coinsAt:new Set([key(5,1),key(3,6),key(1,3)])};
    function refreshParkour(){
      const cells=KN.map(([dr,dc])=>[knight.row+dr,knight.col+dc]).filter(([r,c])=>r>=0&&c>=0&&r<8&&c<8&&r<state.lava&&!state.spikes.has(key(r,c))&&free(r,c,knight));
      view.showMoves(new Set(cells.map(([r,c])=>key(r,c))),new Set());
      view.setDoom([...state.spikes].map(k=>k.split(',').map(Number)));
      labels([...state.coinsAt].map(k=>[+k.split(',')[0],+k.split(',')[1],'$']));
    }
    await build(cloneBoard(),[knight],async hit=>{
      if(state.over||!hit||!KN.some(([dr,dc])=>knight.row+dr===hit.row&&knight.col+dc===hit.col))return;
      const k=key(hit.row,hit.col);if(state.spikes.has(k)||hit.row>=state.lava){state.over=true;await playAPKDamage(boardFrame,view,{row:knight.row,col:knight.col});await playAPKScreenShake(boardFrame,320,10);say('Caíste en los pinchos o la lava. Reinicia para escalar de nuevo.');return;}
      await movePiece(knight,hit.row,hit.col);state.jumps++;if(state.coinsAt.has(k)){state.coinsAt.delete(k);state.coins++;await playAPKParticleBurst(boardFrame,view,{row:knight.row,col:knight.col},['#ffc83d','#fff2bd','#ff9f1c'],14);}
      state.lava=Math.max(0,state.lava-.2);labels([...state.coinsAt].map(k=>[+k.split(',')[0],+k.split(',')[1],'$']));view.setDoom([...state.spikes].map(k=>k.split(',').map(Number)));
      stat('Saltos: '+state.jumps+' · Monedas: '+state.coins+' · Lava: '+state.lava.toFixed(1));
      if(knight.row===0){state.over=true;await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#29e3ff']);say('¡Llegaste arriba!');}
      else if(knight.row>=state.lava){state.over=true;say('La lava te alcanzó.');}
      else refreshParkour();
    });
    goal('Solo saltos de caballo. Llega arriba, recoge monedas y evita los pinchos y la lava que sube.');
    labels([[5,1,'$'],[3,6,'$'],[1,3,'$'],[6,5,'!'],[4,4,'!'],[2,2,'!']]);view.setDoom([...state.spikes].map(k=>k.split(',').map(Number)));stat('Saltos: 0 · Monedas: 0 · Lava: 8');refreshParkour();
  }
  async function startBlaster() {
    const bishop=makePiece('bishop','light',6,1),enemies=[makePiece('pawn','dark',4,3),makePiece('knight','dark',2,5),makePiece('pawn','dark',5,5)];
    state={bishop,enemies,score:0,wave:1,lives:3,over:false};
    const b=cloneBoard();
    await build(b,[bishop,...enemies],async hit=>{
      if(!hit||state.over||(hit.piece&&hit.piece!==bishop))return;
      if(Math.abs(hit.row-bishop.row)!==Math.abs(hit.col-bishop.col)||!free(hit.row,hit.col,bishop))return;
      await movePiece(bishop,hit.row,hit.col);
      await advanceEnemies();
      if(!state.over)refreshBlaster();
    });
    function refreshBlaster(){
      const cells=[];
      for(const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]){
        for(let r=bishop.row+dr,c=bishop.col+dc;r>=0&&c>=0&&r<8&&c<8;r+=dr,c+=dc){
          if(pieceAt(r,c))break;
          cells.push(key(r,c));
        }
      }
      view.showMoves(new Set(cells),new Set());
    }
    async function advanceEnemies(){
      for(const enemy of state.enemies.slice()){
        if(state.over||!pieces.includes(enemy))continue;
        const row=enemy.row+1,col=enemy.col+Math.sign(bishop.col-enemy.col);
        if(row>=bishop.row||dist({row,col},bishop)<=1){
          state.lives--;await playAPKDamage(boardFrame,view,{row:bishop.row,col:bishop.col},'red');
          await removePiece(enemy,false);state.enemies=state.enemies.filter(p=>p!==enemy);
          if(state.lives<=0){
            state.over=true;await playAPKScreenShake(boardFrame,250,9);
            say('Derrota: la horda alcanzó al alfil.');stat('Bajas: '+state.score+' · Vidas: 0');return;
          }
        }else if(free(row,col,enemy))await movePiece(enemy,row,col,false,120);
      }
      stat('Oleada: '+state.wave+'/5 · Bajas: '+state.score+' · Vidas: '+state.lives);
    }
    function spawnWave(){
      state.wave++;
      state.enemies=[];
      for(let i=0;i<3;i++){const q=randomFree((r,c)=>r<4);if(q){const p=makePiece(pick(['pawn','knight','rook']),'dark',q[0],q[1]);addPiece(p);state.enemies.push(p);}}
    }
    goal('Mueve el alfil en diagonal y dispara al enemigo alineado más cercano. Sobrevive cinco oleadas; pierdes si la horda agota tus tres vidas.');
    button('Lanzar hechizo',async()=>{
      const enemy=state.enemies.filter(p=>pieces.includes(p)&&Math.abs(p.row-bishop.row)===Math.abs(p.col-bishop.col))
        .sort((a,b)=>dist(a,bishop)-dist(b,bishop))[0];
      if(!enemy){say('No hay enemigo en diagonal. Mueve el alfil o pasa turno.');return;}
      await playAPKBeam(boardFrame,view,{row:bishop.row,col:bishop.col},{row:enemy.row,col:enemy.col},'#b06bff');
      await removePiece(enemy);state.enemies=state.enemies.filter(p=>p!==enemy);state.score++;
      if(!state.enemies.length){
        if(state.wave>=5){state.over=true;await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#29e3ff']);say('¡Victoria! Las cinco oleadas fueron derrotadas.');stat('Bajas: '+state.score+' · Cinco oleadas superadas');return;}
        spawnWave();say('¡Oleada despejada! Entran tres enemigos más.');
      }else say('Hechizo lanzado. La horda avanza.');
      if(!state.over){await advanceEnemies();if(!state.over)refreshBlaster();}
    },true);
    button('Pasar turno enemigo',async()=>{await advanceEnemies();if(!state.over)refreshBlaster();});
    stat('Oleada: 1/5 · Bajas: 0 · Vidas: 3');
    refreshBlaster();
  }

  async function startRampage() {
    const rook=makePiece('rook','light',4,0),enemies=[[4,2],[4,5],[2,0],[2,4],[6,4]].map(([r,c])=>makePiece('pawn','dark',r,c));
    const b=cloneBoard(8,8,[]);state={rook,score:0,combo:0,time:45,over:false,steel:new Set([key(4,7),key(1,4)])};
    function refreshRampage(){
      const cells=[],captures=new Set();
      for(const [dr,dc] of DIR8.filter(([dr,dc])=>(dr===0)!==(dc===0))){
        for(let r=rook.row+dr,c=rook.col+dc;r>=0&&c>=0&&r<8&&c<8;r+=dr,c+=dc){
          const k=key(r,c);if(state.steel.has(k))break;cells.push(k);
          if(pieceAt(r,c)?.color==='dark')captures.add(k);
        }
      }
      view.showMoves(new Set(cells),captures);
    }
    await build(b,[rook,...enemies],async hit=>{
      if(!hit)return;const r=hit.row,c=hit.col;if(!(r===rook.row||c===rook.col))return;
      const dr=Math.sign(r-rook.row),dc=Math.sign(c-rook.col);if(dr&&dc)return;
      let rr=rook.row+dr,cc=rook.col+dc,victims=[],safety=0;
      while((rr!==r||cc!==c)&&safety++<12){if(state.steel.has(key(rr,cc)))return;const p=pieceAt(rr,cc);if(p&&p!==rook)victims.push(p);rr+=dr;cc+=dc;}
      if(state.steel.has(key(r,c)))return;
      const dest=pieceAt(r,c);if(dest&&!victims.includes(dest))victims.push(dest);
      for(const p of victims)await removePiece(p);
      await movePiece(rook,r,c,false,160);state.score+=victims.length;state.combo=victims.length?state.combo+1:0;
      if(victims.length)await playAPKBombBlast(boardFrame,view,{row:rook.row,col:rook.col},nearbyCells(rook.row,rook.col).map(([row,col])=>({row,col})));
      stat('Bajas: '+state.score+' · Combo: '+state.combo+' · Tiempo: '+state.time+' s');say(victims.length?'¡Carga con combo!':'La torre avanzó. Busca una línea con objetivos.');
      if(!pieces.some(p=>p.color==='dark')){
        state.over=true;clearInterval(timer);timer=null;
        await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#29e3ff']);
        say('¡Victoria! Limpiaste la arena.');
      }
      if(!state.over)refreshRampage();else view.clearMarks();
    });
    labels([[4,7,'▣'],[1,4,'▣']]);for(const k of state.steel)view.tiles.get(k)?.classList.add('block');
    timer=setInterval(()=>{
      if(state.over)return;
      state.time--;
      stat('Bajas: '+state.score+' · Combo: '+state.combo+' · Tiempo: '+state.time+' s');
      if(state.time<=0){
        state.over=true;clearInterval(timer);timer=null;
        say('Derrota: se agotaron los 45 segundos antes de limpiar la arena.');
      }
    },1000);
    goal('La torre carga por fila o columna y aplasta las piezas que atraviesa. Limpia todos los peones en 45 segundos; el acero bloquea la carga.');
    stat('Bajas: 0 · Combo: 0 · Tiempo: 45 s');refreshRampage();
  }
  async function startPanic() {
    const king=makePiece('king','light',4,4,{royal:true});state={king,round:0,score:0,over:false,warn:new Set()};
    await build(cloneBoard(),[king],async hit=>{if(state.over||!hit||dist(king,{row:hit.row,col:hit.col})!==1||!free(hit.row,hit.col,king))return;await movePiece(king,hit.row,hit.col);refreshPanic();say('Movido. Ahora resuelve el ataque anunciado.');});
    function refreshPanic(){
      const cells=DIR8.map(([dr,dc])=>[king.row+dr,king.col+dc]).filter(([r,c])=>r>=0&&c>=0&&r<8&&c<8&&free(r,c,king));
      view.showMoves(new Set(cells.map(([r,c])=>key(r,c))),new Set());
      view.setDoom([...state.warn].map(k=>k.split(',').map(Number)));
    }
    function newThreat(){
      state.round++;state.warn=new Set();const type=pick(['rook','bishop','knight','queen']);
      if(type==='rook'){for(let i=0;i<8;i++){state.warn.add(key(king.row,i));state.warn.add(key(i,king.col));}}
      else if(type==='knight'){for(const [dr,dc] of KN){const r=king.row+dr,c=king.col+dc;if(r>=0&&c>=0&&r<8&&c<8)state.warn.add(key(r,c));}}
      else {for(let i=0;i<8;i++)for(const [r,c] of [[king.row+i,king.col+i],[king.row-i,king.col-i],[king.row+i,king.col-i],[king.row-i,king.col+i]])if(r>=0&&c>=0&&r<8&&c<8)state.warn.add(key(r,c));if(type==='queen'){for(let i=0;i<8;i++){state.warn.add(key(king.row,i));state.warn.add(key(i,king.col));}}}
      refreshPanic();say('Amenaza de '+type+'. Rojo indica peligro: mueve el rey antes de resolver.');stat('Amenazas esquivadas: '+state.score+' · Ronda: '+state.round);
    }
    button('Nueva amenaza',async()=>newThreat(),true);
    button('Resolver ataque',async()=>{
      if(state.warn.has(key(king.row,king.col))){
        state.over=true;await playAPKDamage(boardFrame,view,{row:king.row,col:king.col});await removePiece(king);
        say('Derrota: el rey fue alcanzado.');return;
      }
      state.score++;await playAPKScreenShake(boardFrame,160,4);
      if(state.score>=10){
        state.over=true;await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#29e3ff']);
        say('¡Victoria! Esquivaste diez amenazas.');stat('Amenazas esquivadas: 10');return;
      }
      newThreat();
    });
    goal('Mueve el rey una casilla para escapar de la línea de ataque anunciada. Gana al esquivar diez amenazas; un impacto termina la partida.');
    newThreat();
  }
  async function startQueen() {
    const queen=makePiece('queen','light',8,3),b=cloneBoard(10,8,[]);
    const enemies=[[0,1],[0,4],[0,6],[3,0],[3,7]].map(([r,c])=>makePiece('pawn','dark',r,c));
    state={queen,lives:3,kills:0,wave:0,over:false};
    function refreshQueen(){
      const cells=[],captures=new Set();
      for(const [dr,dc] of DIR8){
        for(let r=queen.row+dr,c=queen.col+dc;r>=0&&c>=0&&r<b.rows&&c<b.cols;r+=dr,c+=dc){
          const k=key(r,c);cells.push(k);if(pieceAt(r,c)?.color==='dark')captures.add(k);
        }
      }
      view.showMoves(new Set(cells),captures);
    }
    await build(b,[queen,...enemies],async hit=>{
      if(state.over||!hit)return;const r=hit.row,c=hit.col,dr=Math.sign(r-queen.row),dc=Math.sign(c-queen.col);
      if((r!==queen.row&&c!==queen.col&&Math.abs(r-queen.row)!==Math.abs(c-queen.col))||(!dr&&!dc))return;
      const victims=[];let rr=queen.row+dr,cc=queen.col+dc,safety=0;
      while((rr!==r||cc!==c)&&safety++<12){const p=pieceAt(rr,cc);if(p&&p!==queen)victims.push(p);rr+=dr;cc+=dc;}
      const dest=pieceAt(r,c);if(dest&&dest!==queen&&!victims.includes(dest))victims.push(dest);
      for(const p of victims){await removePiece(p);state.kills++;}
      if(!free(r,c,queen)&&!dest)return;await movePiece(queen,r,c,false,130);
      await playAPKShockwave(boardFrame,view,{row:queen.row,col:queen.col});
      refreshQueen();
      stat('Bajas: '+state.kills+' · Vidas: '+state.lives+' · Oleada: '+state.wave);say('Carga de reina: busca otra línea de peones.');
    });
    button('Avanzar horda',async()=>{
      state.wave++;
      for(const p of pieces.filter(p=>p.color==='dark').slice()){
        const dr=Math.sign(queen.row-p.row),dc=Math.sign(queen.col-p.col);
        const opts=[[p.row+dr,p.col+dc],[p.row+dr,p.col],[p.row,p.col+dc]].filter(([r,c])=>r>=0&&c>=0&&r<10&&c<8&&free(r,c,p));
        const q=pick(opts);if(q)await movePiece(p,q[0],q[1],false,100);
        if(dist(p,queen)<=1){await removePiece(p);state.lives--;await playAPKScreenShake(boardFrame,180,6);if(state.lives<=0){state.over=true;say('La horda agotó las vidas de la reina.');return;}}
      }
      if(state.lives<=0){state.over=true;say('Derrota: la horda agotó las vidas de la reina.');return;}
      if(state.wave>=10){
        state.over=true;await playAPKVictory(boardFrame,view,['#ffc83d','#fff','#29e3ff']);
        say('¡Victoria! Sobreviviste diez oleadas.');return;
      }
      for(let i=0;i<2;i++){const q=randomFree((r,c)=>r<2);if(q)addPiece(makePiece('pawn','dark',q[0],q[1]));}
      stat('Bajas: '+state.kills+' · Vidas: '+state.lives+' · Oleada: '+state.wave+'/10');
      refreshQueen();
    },true);
    goal('La dama carga por líneas y diagonales. Elimina peones y sobrevive diez oleadas; tienes tres vidas.');
    labels([[0,1,'P'],[0,4,'P'],[0,6,'P'],[3,0,'P'],[3,7,'P']]);stat('Bajas: 0 · Vidas: 3 · Oleada: 0/10');refreshQueen();
  }
  async function startArcade(id) {
    if(id==='pdodge')return startPawnDodge();
    if(id==='parkour')return startParkour();
    if(id==='blaster')return startBlaster();
    if(id==='rampage')return startRampage();
    if(id==='panic')return startPanic();
    if(id==='queen')return startQueen();
  }
  async function loadScene() {
    stopScene();
    if(meta.family==='mini'){if(id==='race')await startRace();else if(id==='dodge')await startDodge();else await startFeast();}
    else if(meta.family==='mode')await startMode(id);
    else await startArcade(id);
  }
  $('.apk-reset').addEventListener('click',loadScene);
  await loadScene();
  return {destroy:stopScene};
}

const params=new URLSearchParams(location.search);
const root=document.getElementById('apk-app');
if(root)mountAPKPrototype(root,params.get('game')||'race',params.get('theme')||'walnut');
