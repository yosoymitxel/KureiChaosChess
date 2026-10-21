import assert from 'node:assert/strict';
import { newMinefield, legal, move } from '../src/game/minefield.js';
const s=newMinefield('normal');
assert.ok(legal(s).length>0);
assert.equal(move(s,0,0),false,'rejects illegal knight move');
const target=legal(s)[0];
assert.equal(move(s,target.row,target.col),true);
assert.equal(s.turns,8);
assert.ok(s.revealed.has(target.row+','+target.col));
for(const level of ['facil','normal','dificil']){
 const game=newMinefield(level);
 for(const pos of game.diff.route.slice(1)){
  const [row,col]=pos.split(',').map(Number);
  assert.ok(!game.mines.has(pos),level+' route must not contain a mine');
  assert.ok(legal(game).some(m=>m.row===row&&m.col===col),level+' route must use legal knight moves');
  assert.equal(move(game,row,col),true);
 }
 assert.equal(game.over,'win',level+' route reaches the exit');
}
console.log('Campo minado: checks básicos y rutas por dificultad OK');
