import assert from 'node:assert/strict';
import {newCollapsingFloor,legal,move} from '../src/game/collapsing-floor.js';
const s=newCollapsingFloor('normal');assert.ok(legal(s).length);const m=legal(s)[0];const old=s.pieces[0].row+','+s.pieces[0].col;assert.equal(move(s,m.row,m.col),true);assert.ok(s.board.holes.has(old));
for(const level of ['facil','normal','dificil']){
 const game=newCollapsingFloor(level);
 for(const [row,col] of [[4,2],[2,3],[0,2]]){
  assert.ok(legal(game).some(m=>m.row===row&&m.col===col),level+' route must remain reachable');
  assert.equal(move(game,row,col),true);
 }
 assert.equal(game.over,'win',level+' route reaches the exit');
}
console.log('El suelo se acaba: checks básicos y rutas por dificultad OK');
