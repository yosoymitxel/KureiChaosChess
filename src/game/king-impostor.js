export const SIZE=7;
const SUSPECTS=[{type:'rook',row:1,col:1},{type:'bishop',row:1,col:3},{type:'knight',row:1,col:5},{type:'queen',row:2,col:2}];
export const DIFFS={facil:{name:'Fácil',turns:3,count:3},normal:{name:'Normal',turns:2,count:3},dificil:{name:'Difícil',turns:1,count:4}};
const CLUES={rook:'El impostor se mueve en línea recta, por filas o columnas.',bishop:'El impostor se mueve en diagonal.',knight:'El impostor se mueve en L, como un caballo.',queen:'El impostor combina líneas rectas y diagonales.'};
export function newKingImpostor(level='normal'){
 const diff=DIFFS[level]||DIFFS.normal,candidates=SUSPECTS.slice(0,diff.count).map(x=>({...x}));
 for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
 const targetIndex=Math.floor(Math.random()*candidates.length);
 const pieces=[{id:'king',type:'king',color:'light',row:6,col:3,royal:true}];
 candidates.forEach((candidate,i)=>pieces.push({id:'suspect-'+(i+1),type:candidate.type,color:'dark',row:candidate.row,col:candidate.col}));
 const impostor=pieces.find(p=>p.type===candidates[targetIndex].type).id,targetType=pieces.find(p=>p.id===impostor).type;
 return {diff,pieces,impostor,turns:diff.turns,clue:CLUES[targetType],targetType,over:null,chosen:null,revealed:new Set()};
}
export function choose(s,id){
 if(s.over||s.chosen===id||!s.pieces.some(p=>p.id===id&&p.color==='dark'))return false;
 s.chosen=id;s.revealed.add(id);
 if(id===s.impostor){s.over='win';return true;}
 s.turns--;if(s.turns<=0)s.over='lose';return true;
}
