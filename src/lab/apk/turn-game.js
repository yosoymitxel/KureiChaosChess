// Shared input and turn loop for isolated APK chess prototypes.
import { key, legalMoves } from '../../game/rules.js';
import { playAPKVictory } from './effects.js';

export function createAPKTurnGame({
  board, view, getPieces, movePiece, removePiece, say, stat,
  onCapture = null, beforeMove = null, afterMove = null, beforeSelect = null,
  mandatoryCaptures = false, winOnRoyalCapture = true, loseOnRoyalCapture = true,
  elimination = false, winOnNoMoves = true, playerSide = 'light', botSide = 'dark',
  label = 'partida',
} = {}) {
  let turn=playerSide, selected=null, available=[], busy=false, over=false, disposed=false, plies=0;
  const pieces=()=>getPieces().filter(Boolean);
  const sidePieces=side=>pieces().filter(p=>p.color===side);
  const royalAlive=side=>sidePieces(side).some(p=>p.royal);
  const rawMovesFor=side=>sidePieces(side).filter(p=>!p.neutral).flatMap(piece=>legalMoves(piece,pieces(),board).map(move=>({piece,...move})));
  const movesFor=side=>{
    const list=rawMovesFor(side);
    return mandatoryCaptures&&list.some(item=>item.hits?.length)?list.filter(item=>item.hits?.length):list;
  };
  const finish=async(winner,message)=>{
    if(over||disposed)return;
    over=true;selected=null;available=[];view.clearMarks();view.select(null);say(message);
    stat((winner===playerSide?'VICTORIA':'DERROTA')+' · '+label+' · '+Math.ceil(plies/2)+' turnos');
    if(winner===playerSide)await playAPKVictory(view.host?.parentElement||view.host,view,['#ffc83d','#fff2bd','#3dff8e']);
  };
  const checkTerminal=async()=>{
    if(over)return true;
    if(loseOnRoyalCapture&&!royalAlive(playerSide)){await finish(botSide,'Derrota: tu rey fue capturado. Reinicia para intentarlo de nuevo.');return true;}
    if(winOnRoyalCapture&&!royalAlive(botSide)){await finish(playerSide,'¡Victoria! Capturaste el rey rival.');return true;}
    if(elimination&&!sidePieces(playerSide).length){await finish(botSide,'Derrota: tu ejército fue eliminado.');return true;}
    if(elimination&&!sidePieces(botSide).length){await finish(playerSide,'¡Victoria! Eliminaste al ejército rival.');return true;}
    if(winOnNoMoves&&!movesFor(botSide).length){await finish(playerSide,'¡Victoria! El rival se quedó sin movimientos legales.');return true;}
    if(winOnNoMoves&&!movesFor(playerSide).length){await finish(botSide,'Derrota: no quedan movimientos legales para tu ejército.');return true;}
    return false;
  };
  const showSelection=piece=>{
    selected=piece;available=legalMoves(piece,pieces(),board);
    if(mandatoryCaptures&&movesFor(playerSide).some(item=>item.hits?.length))available=available.filter(move=>move.hits?.length);
    view.select(piece);
    const cells=new Set(available.map(move=>key(move.row,move.col)));
    const captures=new Set(available.filter(move=>move.hits?.length).map(move=>key(move.row,move.col)));
    view.showMoves(cells,captures);
    say(available.length?'Tu turno: elige una casilla resaltada. Las capturas aparecen en rojo.':'Esa pieza no tiene movimientos legales. Elige otra.');
  };
  const execute=async(piece,move,side,internal=false)=>{
    if(over||disposed||(busy&&!internal))return;
    const ownsLock=!busy;if(ownsLock)busy=true;
    selected=null;available=[];view.clearMarks();view.select(null);
    const from={row:piece.row,col:piece.col};
    try{
      let destination={row:move.row,col:move.col};
      if(beforeMove)destination=await beforeMove({piece,move,side,from,pieces:pieces()})||destination;
      const hits=[...(move.hits||[])];let blocked=false;
      for(const victim of hits){
        let shouldRemove=true;
        if(onCapture)shouldRemove=(await onCapture({attacker:piece,victim,move,side,pieces:pieces()}))!==false;
        if(shouldRemove&&pieces().includes(victim))await removePiece(victim,true);
        else if(!shouldRemove)blocked=true;
      }
      const attackerAlive=pieces().includes(piece);
      if(attackerAlive&&!blocked)await movePiece(piece,destination.row,destination.col,false,180);
      // A blast or bullet may destroy the attacker too. Losing an ordinary piece
      // consumes the move; only losing the royal piece ends the match.
      plies++;view.setTurn?.(side);
      if(attackerAlive&&afterMove)await afterMove({piece,from,move:{...move,...destination},hits,side,plies,pieces:pieces(),end:finish});
      if(await checkTerminal())return;
      if(side===playerSide){
        turn=botSide;say('Turno del rival…');
        await new Promise(resolve=>setTimeout(resolve,180));
        const options=movesFor(botSide);
        if(!options.length){if(winOnNoMoves)await finish(playerSide,'¡Victoria! El rival no tiene movimientos legales.');else turn=playerSide;return;}
        options.sort((a,b)=>{
          const score=item=>(item.hits||[]).reduce((sum,target)=>sum+(target.royal?1000:target.type==='queen'?10:1),0);
          return score(b)-score(a)+(Math.random()-.5)*.25;
        });
        const choice=options[0];await execute(choice.piece,choice,botSide,true);return;
      }
      turn=playerSide;say('Tu turno. Toca una pieza de tu ejército.');
      stat('Turnos: '+Math.ceil(plies/2)+' · Piezas propias: '+sidePieces(playerSide).length+' · Rivales: '+sidePieces(botSide).length);
    }finally{
      if(ownsLock)busy=false;
      if(!over&&!disposed&&!busy&&turn===playerSide){view.clearMarks();if(selected)showSelection(selected);}
    }
  };
  const tap=async hit=>{
    if(!hit||busy||over||disposed||turn!==playerSide)return;
    const piece=pieces().find(candidate=>candidate.row===hit.row&&candidate.col===hit.col);
    if(piece&&beforeSelect){const result=await beforeSelect(piece);if(result==='handled')return;}
    if(selected){
      const target=available.find(move=>move.row===hit.row&&move.col===hit.col);
      if(target){await execute(selected,target,playerSide);return;}
    }
    if(piece?.color===playerSide&&!piece.neutral){
      const playerMoves=movesFor(playerSide);
      if(mandatoryCaptures&&playerMoves.some(item=>item.hits?.length)&&!legalMoves(piece,pieces(),board).some(item=>item.hits?.length)){
        say('Hay una captura obligatoria: selecciona una pieza que pueda capturar.');return;
      }
      showSelection(piece);return;
    }
    selected=null;available=[];view.clearMarks();view.select(null);say('Selecciona una pieza de tu ejército para ver sus movimientos.');
  };
  view.onTap=tap;
  view.host?.addEventListener('keydown',event=>{
    if(event.key==='Escape'){selected=null;available=[];view.clearMarks();view.select(null);}
  });
  say('Partida lista. Toca una pieza marfil para ver sus movimientos legales.');
  stat('Tu ejército: '+sidePieces(playerSide).length+' · Rival: '+sidePieces(botSide).length);
  return {tap,end:finish,get over(){return over;},get turn(){return turn;},destroy(){disposed=true;selected=null;available=[];}};
}
