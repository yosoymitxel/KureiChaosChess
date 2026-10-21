import assert from 'node:assert/strict';
import {newKingImpostor,choose} from '../src/game/king-impostor.js';
const s=newKingImpostor('normal');assert.equal(choose(s,'king'),false);assert.equal(choose(s,s.impostor),true);assert.equal(s.over,'win');console.log('El rey impostor: checks básicos OK');
