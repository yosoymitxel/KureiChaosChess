import assert from 'node:assert/strict';
import {newLaboratory,legal,move} from '../src/game/laboratory.js';
const s=newLaboratory('normal');assert.ok(legal(s).length);assert.ok(s.pieces[0].extraMoveTypes.includes('rook2'));
const m=legal(s)[0];assert.equal(move(s,m.row,m.col),true);assert.ok(s.board.holes.has('6,3'));console.log('El laboratorio: checks básicos OK');
