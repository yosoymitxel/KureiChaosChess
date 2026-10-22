import { legalMoves } from './rules.js';
export const SIZE=7;
export const DIFFS={
 facil:{name:'Fácil',turns:8,holes:['4,0','4,6'],collapse:1},
 normal:{name:'Normal',turns:7,holes:['4,0','4,6','3,0','3,6'],collapse:1},
 dificil:{name:'Difícil',turns:6,holes:['4,0','4,6','3,0','3,6','2,0','2,6','1,0','1,6'],collapse:2},
};
const key=(r,c)=>r+','+c;
// Esta ruta de referencia se conserva libre para que cada dificultad siga teniendo una solución comprobable.
const safeRoute=new Set(['6,3','4,2','2,3','0,2']);
const randIndex=n=>Math.floor(Math.random()*n);
export function newCollapsingFloor(level='normal'){
 const diff=DIFFS[level]||DIFFS.normal;
 return {diff,board:{rows:SIZE,cols:SIZE,holes:new Set(diff.holes),terrain:new Map(),portals:new Map()},pieces:[{id:'runner',type:'knight',color:'light',row:6,col:3}],turns:diff.turns,over:null,lastCollapsed:[]};
}
export const legal=s=>s.over?[]:legalMoves(s.pieces[0],s.pieces,s.board);
export function move(s,row,col){
 if(s.over)return false;
 const p=s.pieces[0],m=legal(s).find(x=>x.row===row&&x.col===col);
 if(!m)return false;
 const old=key(p.row,p.col);p.row=row;p.col=col;s.turns--;
 const collapsed=[old];
 // El tablero también se desmorona lejos del caballo: más casillas por turno en difícil.
 const candidates=[];
 for(let r=1;r<SIZE;r++)for(let c=0;c<SIZE;c++){
  const k=key(r,c);
  if(k===key(row,col)||s.board.holes.has(k)||safeRoute.has(k))continue;
  candidates.push(k);
 }
 for(let i=0;i<Math.min(s.diff.collapse,candidates.length);i++){
  const k=candidates.splice(randIndex(candidates.length),1)[0];
  s.board.holes.add(k);collapsed.push(k);
 }
 s.board.holes.add(old);s.lastCollapsed=collapsed;
 if(row===0)s.over='win';else if(s.turns<=0||!legal(s).length)s.over='lose';
 return true;
}
