import assert from 'node:assert/strict';
import { newMinefield, legal, move, DIFFS } from '../src/game/minefield.js';
const levels=['facil','normal','dificil'];
assert.deepEqual(levels.map(k=>DIFFS[k].mines),[4,7,10]);
assert.deepEqual(levels.map(k=>DIFFS[k].turns),[10,9,8]);
for(const level of levels) for(let run=0;run<30;run++){
 const s=newMinefield(level);assert.ok(legal(s).length>0);
 assert.equal(move(s,0,0),false,'reject illegal move');
 for(const pos of s.diff.route.slice(1)){
  const [row,col]=pos.split(',').map(Number);
  assert.ok(!s.mines.has(pos),level+' guaranteed route stays safe');
  assert.ok(legal(s).some(m=>m.row===row&&m.col===col),level+' route uses legal knight moves');
  assert.equal(move(s,row,col),true);
 }
 assert.equal(s.over,'win',level+' guaranteed route wins');
 assert.equal(s.mines.size,DIFFS[level].mines);
 assert.equal(move(s,0,0),false,'finished games reject moves');
}
console.log('Campo minado: 90 partidas, rutas seguras, mapas variables y dificultad OK');
