import assert from 'node:assert/strict';
import {newCollapsingFloor,legal,move} from '../src/game/collapsing-floor.js';
const s=newCollapsingFloor('normal');assert.ok(legal(s).length);const m=legal(s)[0];const old=s.pieces[0].row+','+s.pieces[0].col;assert.equal(move(s,m.row,m.col),true);assert.ok(s.board.holes.has(old));console.log('El suelo se acaba: checks básicos OK');
