import { legalMoves } from './rules.js';
export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', mines: 4, turns: 10, route: ['6,3','4,4','2,5','0,4'] },
  normal: { name: 'Normal', mines: 6, turns: 9, route: ['6,3','4,2','2,1','0,2'] },
  dificil: { name: 'Difícil', mines: 8, turns: 8, route: ['6,3','5,1','3,0','1,1','0,3'] },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const key = (r,c) => r + ',' + c;
export function newMinefield(level = 'normal') {
  const diff = DIFFS[level] || DIFFS.normal;
  const safe = new Set(diff.route);
  const pool = [];
  for (let r=1;r<7;r++) for(let c=0;c<SIZE;c++) if(!safe.has(key(r,c))) pool.push(key(r,c));
  const mines = new Set();
  while(mines.size < diff.mines && pool.length) {
    const i = (diff.mines * 7 + mines.size * 11 + (level === 'dificil' ? 5 : level === 'facil' ? 2 : 0)) % pool.length;
    mines.add(pool.splice(i,1)[0]);
  }
  const player = {id:'runner',type:'knight',color:'light',row:6,col:3};
  return {diff,board:board(),pieces:[player],mines,revealed:new Set(),turns:diff.turns,over:null,last:null};
}
export const legal = s => s.over ? [] : legalMoves(s.pieces[0],s.pieces,s.board);
export function move(s,row,col) {
  if(s.over) return false;
  const m=legal(s).find(x=>x.row===row&&x.col===col);
  if(!m) return false;
  s.pieces[0].row=row;s.pieces[0].col=col;s.turns--;
  const k=key(row,col);s.revealed.add(k);s.last=k;
  if(s.mines.has(k)) s.over='lose';
  else if(row===0) s.over='win';
  else if(s.turns<=0) s.over='lose';
  return true;
}
export const nearbyMines = (s,r,c) => {
  let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(s.mines.has(key(r+dr,c+dc)))n++;
  return n;
};
