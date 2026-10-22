import { legalMoves } from './rules.js';
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', mines: 4, turns: 10, route: ['6,3','4,4','2,5','0,4'] },
  normal: { name: 'Normal', mines: 7, turns: 9, route: ['6,3','4,2','2,1','0,2'] },
  dificil: { name: 'Difícil', mines: 10, turns: 8, route: ['6,3','5,1','3,0','1,1','0,3'] },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const key = (r,c) => r + ',' + c;
export function newMinefield(level = 'normal') {
  const diff = DIFFS[level] || DIFFS.normal, safe = new Set(diff.route), pool = [];
  for (let r=1;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(!safe.has(key(r,c))) pool.push(key(r,c));
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const mines = new Set(pool.slice(0,diff.mines));
  const player = {id:'runner',type:'knight',color:'light',row:6,col:3};
  return {diff,board:board(),pieces:[player],mines,revealed:new Set(),turns:diff.turns,over:null,last:null,round:0};
}
export const legal = s => s.over ? [] : legalMoves(s.pieces[0],s.pieces,s.board);
export function move(s,row,col) {
  if(s.over)return false;
  const m=legal(s).find(x=>x.row===row&&x.col===col);if(!m)return false;
  s.pieces[0].row=row;s.pieces[0].col=col;s.turns--;s.round++;
  const k=key(row,col);s.revealed.add(k);s.last=k;
  if(s.mines.has(k))s.over='lose';
  else {
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=row+dr,cc=col+dc,near=key(rr,cc);if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE&&!s.mines.has(near))s.revealed.add(near);}
    if(row===0)s.over='win';else if(s.turns<=0)s.over='lose';
  }
  return true;
}
export const nearbyMines=(s,r,c)=>{let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(s.mines.has(key(r+dr,c+dc)))n++;return n;};
