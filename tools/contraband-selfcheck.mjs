import assert from 'node:assert/strict';
import { newContraband, legal, move } from '../src/game/dimensional-contraband.js';
const s=newContraband('normal');
assert.ok(legal(s).length>0);
assert.equal(move(s,0,0),false,'rejects illegal knight move');
assert.equal(move(s,4,1),true,'knight reaches the first portal');
assert.deepEqual([s.pieces[0].row,s.pieces[0].col],[2,5],'portal transports to its twin');
assert.equal(s.turns,6);
console.log('Contrabando dimensional: checks básicos OK');
