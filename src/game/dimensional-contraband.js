import { legalMoves } from './rules.js';
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 9 },
  normal: { name: 'Normal', turns: 7 },
  dificil: { name: 'Difícil', turns: 6 },
};
const key=(r,c)=>r+','+c;
export function newContraband(level='normal'){
 const diff=DIFFS[level]||DIFFS.normal;
 const portals=new Map([[key(4,1),key(2,5)],[key(2,5),key(4,1)]]);
 return {diff,board:{rows:SIZE,cols:SIZE,holes:new Set(),terrain:new Map(),portals},pieces:[{id:'smuggler',type:'knight',color:'light',row:6,col:1}],turns:diff.turns,over:null,events:[]};
}
export const legal=s=>s.over?[]:legalMoves(s.pieces[0],s.pieces,s.board);
export function move(s,row,col){
 if(s.over)return false;
 const p=s.pieces[0],m=legal(s).find(x=>x.row===row&&x.col===col);
 if(!m)return false;
 const from={row:p.row,col:p.col};p.row=row;p.col=col;s.turns--;
 const twin=s.board.portals.get(key(row,col));
 if(twin){const [r,c]=twin.split(',').map(Number);p.row=r;p.col=c;s.events=[{from,to:{row,col}},{from:{row,col},to:{row:r,col:c},portal:true}];}
 else s.events=[{from,to:{row,col}}];
 if(p.row===0&&p.col===5)s.over='win';
 else if(s.turns<=0)s.over='lose';
 return true;
}
