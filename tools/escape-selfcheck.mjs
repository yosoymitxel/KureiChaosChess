import assert from 'node:assert/strict';
import { newEscape, legal, move } from '../src/game/escape.js';

const s = newEscape('normal');
assert.equal(move(s, 0, 0), false, 'rejects illegal moves');
assert.equal(s.turns, 5, 'illegal moves do not consume a turn');
assert.ok(legal(s).some((m) => m.row === 4 && m.col === 2));
assert.equal(move(s, 4, 2), true);
assert.equal(s.pieces.find((p) => p.id === 'guard').row, 3);
assert.equal(move(s, 2, 3), true);
assert.equal(s.pieces.find((p) => p.id === 'guard').row, 4);
assert.equal(move(s, 0, 4), true);
assert.equal(s.over, 'win', 'reaching the exit wins');
assert.equal(legal(s).length, 0);
const routes={facil:[[4,2],[2,1],[0,0]],normal:[[5,1],[3,2],[1,1],[0,3]],dificil:[[5,1],[3,0],[1,1],[0,3]]};
for(const [level,route] of Object.entries(routes)){
 const game=newEscape(level);
 for(const [row,col] of route){
  assert.ok(legal(game).some(m=>m.row===row&&m.col===col),level+' route must use legal moves');
  assert.equal(move(game,row,col),true);
 }
 assert.equal(game.over,'win',level+' route reaches the exit');
}
console.log('Escape del tablero: checks básicos y rutas por dificultad OK');
