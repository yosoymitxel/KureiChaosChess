export const SIZE=7;
export const DIFFS={facil:{name:'Fácil',turns:3},normal:{name:'Normal',turns:2},dificil:{name:'Difícil',turns:1}};
export function newKingImpostor(level='normal'){
 const diff=DIFFS[level]||DIFFS.normal;
 const pieces=[
  {id:'king',type:'king',color:'light',row:6,col:3,royal:true},
  {id:'suspect-a',type:'rook',color:'dark',row:1,col:1},
  {id:'suspect-b',type:'bishop',color:'dark',row:1,col:3},
  {id:'suspect-c',type:'knight',color:'dark',row:1,col:5},
 ];
 const impostor='suspect-c';
 return {diff,pieces,impostor,turns:diff.turns,over:null,chosen:null};
}
export function choose(s,id){
 if(s.over||s.chosen===id||!s.pieces.some(p=>p.id===id&&p.color==='dark'))return false;
 s.chosen=id;if(id===s.impostor){s.over='win';return true;}s.turns--;if(s.turns<=0)s.over='lose';return true;
}
