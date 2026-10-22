import assert from 'node:assert/strict';
import {newCollapsingFloor,legal,move} from '../src/game/collapsing-floor.js';
const s=newCollapsingFloor('normal');assert.ok(legal(s).length);const m=legal(s)[0];const old=s.pieces[0].row+','+s.pieces[0].col;const holesBefore=s.board.holes.size;assert.equal(move(s,m.row,m.col),true);assert.ok(s.board.holes.has(old));assert.ok(s.board.holes.size>holesBefore+1,'cada turno hunde casillas extra además de la abandonada');assert.ok(s.lastCollapsed.length>=2,'se registran todas las casillas que caen para animarlas');
for(const level of ['facil','normal','dificil']){
 const game=newCollapsingFloor(level);
 for(const [row,col] of [[4,2],[2,3],[0,2]]){
  assert.ok(legal(game).some(m=>m.row===row&&m.col===col),level+' route must remain reachable');
  const before=game.board.holes.size;
  assert.equal(move(game,row,col),true);
  assert.ok(game.board.holes.size>before+1,'the board also collapses away from the runner');
 }
 assert.equal(game.over,'win',level+' route reaches the exit');
}
const hard=newCollapsingFloor('dificil');assert.equal(hard.diff.collapse,2,'hard mode collapses two extra tiles per turn');
console.log('El suelo se acaba: derrumbes adicionales, animación y rutas por dificultad OK');
