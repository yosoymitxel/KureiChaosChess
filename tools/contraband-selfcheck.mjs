import assert from 'node:assert/strict';
import { newContraband, legal, move } from '../src/game/dimensional-contraband.js';
const s=newContraband('normal');
assert.ok(legal(s).length>0);
assert.equal(move(s,0,0),false,'rejects illegal knight move');
assert.equal(move(s,4,2),true,'knight reaches the normal portal');
assert.deepEqual([s.pieces[0].row,s.pieces[0].col],[1,4],'portal transports to its twin');
assert.equal(s.turns,6);
for(const level of ['facil','normal','dificil']){
 const game=newContraband(level);
 const [r,c]=game.diff.entry.split(',').map(Number);
 assert.ok(legal(game).some(m=>m.row===r&&m.col===c),level+' entry must be a legal knight move');
 assert.equal(move(game,r,c),true);
 assert.deepEqual([game.pieces[0].row+','+game.pieces[0].col],[game.diff.twin]);
 assert.ok(legal(game).some(m=>m.row===0&&m.col===6),level+' portal must provide a legal exit jump');
 assert.equal(move(game,0,6),true);
 assert.equal(game.over,'win',level+' route reaches the exit');
}
console.log('Contrabando dimensional: checks básicos y rutas por dificultad OK');
