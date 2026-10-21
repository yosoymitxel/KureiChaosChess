import { legalMoves } from './rules.js';
export const SIZE=7;
export const DIFFS={
 facil:{name:'Fácil',turns:8,holes:['4,0','4,6']},
 normal:{name:'Normal',turns:7,holes:['4,0','4,6','3,0','3,6']},
 dificil:{name:'Difícil',turns:6,holes:['4,0','4,6','3,0','3,6','2,0','2,6','1,0','1,6']},
};
const key=(r,c)=>r+','+c;
export function newCollapsingFloor(level='normal'){
 const diff=DIFFS[level]||DIFFS.normal;
 return {diff,board:{rows:SIZE,cols:SIZE,holes:new Set(diff.holes),terrain:new Map(),portals:new Map()},pieces:[{id:'runner',type:'knight',color:'light',row:6,col:3}],turns:diff.turns,over:null};
}
export const legal=s=>s.over?[]:legalMoves(s.pieces[0],s.pieces,s.board);
export function move(s,row,col){
 if(s.over)return false;
 const p=s.pieces[0],m=legal(s).find(x=>x.row===row&&x.col===col);
 if(!m)return false;
 const old=key(p.row,p.col);p.row=row;p.col=col;s.board.holes.add(old);s.turns--;
 if(row===0)s.over='win';else if(s.turns<=0||!legal(s).length)s.over='lose';
 return true;
}
