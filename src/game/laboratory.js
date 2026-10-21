import { legalMoves } from './rules.js';
import { applyMutations } from '../data/mutations.js';
export const SIZE=7;
export const DIFFS={
 facil:{name:'Fácil',turns:8,piece:'king',mutation:'kingRook',holes:['4,2','4,4','2,2','2,4']},
 normal:{name:'Normal',turns:7,piece:'knight',mutation:'knightBishop',holes:['4,1','4,5','2,1','2,5']},
 dificil:{name:'Difícil',turns:6,piece:'guard',mutation:'guardKnight',holes:['4,0','4,6','2,0','2,6','1,0','1,6']},
};
const key=(r,c)=>r+','+c;
export function newLaboratory(level='normal'){
 const diff=DIFFS[level]||DIFFS.normal;
 const piece={id:'subject',type:diff.piece,color:'light',row:6,col:3};
 applyMutations([piece],[diff.mutation],'light');
 return {diff,board:{rows:SIZE,cols:SIZE,holes:new Set(diff.holes),terrain:new Map(),portals:new Map()},pieces:[piece],turns:diff.turns,over:null,steps:0};
}
export const legal=s=>s.over?[]:legalMoves(s.pieces[0],s.pieces,s.board);
export function move(s,row,col){
 if(s.over)return false;
 const p=s.pieces[0],m=legal(s).find(x=>x.row===row&&x.col===col);
 if(!m)return false;
 const old=key(p.row,p.col);p.row=row;p.col=col;s.board.holes.add(old);s.turns--;s.steps++;
 if(row===0)s.over='win';else if(s.turns<=0||!legal(s).length)s.over='lose';
 return true;
}
