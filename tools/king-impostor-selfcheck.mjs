import assert from 'node:assert/strict';
import {newKingImpostor,choose,DIFFS} from '../src/game/king-impostor.js';
for(const [level,count,turns] of [['facil',3,3],['normal',3,2],['dificil',4,1]]) for(let run=0;run<30;run++){
 const s=newKingImpostor(level),suspects=s.pieces.filter(p=>p.color==='dark');
 assert.equal(suspects.length,count);assert.equal(s.turns,turns);
 assert.ok(suspects.some(p=>p.id===s.impostor));assert.ok(s.clue.length>10);
 assert.equal(choose(s,'king'),false);
 const wrong=suspects.find(p=>p.id!==s.impostor);
 assert.equal(choose(s,wrong.id),true);assert.equal(s.turns,turns-1);
 if(turns===1){assert.equal(s.over,'lose');assert.equal(choose(s,s.impostor),false);}
 else {assert.equal(s.over,null);assert.equal(choose(s,s.impostor),true);assert.equal(s.over,'win');}
 assert.equal(choose(s,s.impostor),false,'terminal game rejects more picks');
}
const answers=new Set(Array.from({length:60},()=>newKingImpostor('normal').targetType));
assert.ok(answers.size>=2,'identity varies between rounds');
console.log('El rey impostor: 90 rondas, dificultad, pistas y respuestas variables OK');
