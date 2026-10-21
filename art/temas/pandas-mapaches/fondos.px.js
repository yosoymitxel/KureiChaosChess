// Bosque de bambú: losas de piedra clara y tierra húmeda, con hojas y huellas grandes bien espaciadas.
pal({
 a:"#e6e0cf",A:"#f5f0e2",c:"#b2b5a5",C:"#858d7d",
 d:"#a6aa96",D:"#c8cbb9",e:"#606f5e",E:"#435348",
 r:"#182622",R:"#25372f",z:"#101b17",J:"#0a1410",j:"#07100d",
 p:"#c76a3b",P:"#74391f",y:"#d8b56a",Y:"#997736",t:"#76b8a0",T:"#387765",
 h:"#39433a",H:"#586352"
});
const slab=(name,[base,hi,lo,deep],...marks)=>sprite(name,{w:16,h:16},
 rect(0,0,16,16,base),hline(0,0,15,hi),vline(0,0,15,hi),
 hline(1,14,14,lo),vline(14,1,13,lo),...marks
);
const paw=(x,y,c)=>[ellipse(x,y,2,2,c),px(x-3,y-2,c),px(x,y-3,c),px(x+3,y-2,c),px(x-2,y+2,c),px(x+2,y+2,c)];
const leaf=(x,y)=>[poly([x,y,x+2,y-4,x+5,y-3,x+3,y+1],"t"),line(x+1,y,x+4,y-3,"c",1)];
const grain=t=>[hline(3,3,5,t.lo),hline(7,4,3,t.hi),hline(5,10,7,t.lo),px(12,9,t.hi)];
const crack=t=>[px(12,1,t.deep),px(11,2,t.deep),px(11,3,t.deep),px(9,4,t.deep),px(8,5,t.lo),px(7,6,t.deep),px(8,7,t.hi)];
slab("tile-a",["a","A","c","C"],...paw(7,7,"C"),...leaf(10,10));
slab("tile-a2",["a","A","c","C"],...crack({deep:"C",lo:"c",hi:"A"}),...leaf(3,10));
slab("tile-a3",["a","A","c","C"],...grain({lo:"c",hi:"A",deep:"C"}),...paw(12,12,"C"));
slab("tile-b",["d","D","e","E"],...paw(7,7,"E"),...leaf(10,10));
slab("tile-b2",["d","D","e","E"],...crack({deep:"E",lo:"e",hi:"D"}),...leaf(3,10));
slab("tile-b3",["d","D","e","E"],...grain({lo:"e",hi:"D",deep:"E"}),...paw(12,12,"E"));
const planks=[];
for(let y=0;y<32;y+=8){
 const row=y/8,off=row%2?8:0;
 for(let i=-1;i<2;i++){
  const x=i*16+off,base=(row+i)%2?"R":"r";
  planks.push(rect(x,y,15,7,base),hline(x,y,15,"C"),hline(x,y+6,15,"J"));
 }
 planks.push(hline(0,y+7,32,"j"));
}
sprite("table",{w:32,h:32},rect(0,0,32,32,"z"),...planks,
 ...[2,10,18,26].flatMap(x=>[vline(x,0,31,"T"),px(x,4,"c"),px(x+1,12,"c"),px(x-1,20,"t"),px(x,28,"c")]),
 ...[[6,5],[22,21]].flatMap(([x,y])=>paw(x,y,"H"))
);
const H="#ffffff66",L="#00000040";
const frame=(name,col)=>sprite(name,{w:12,h:12},
 hline(2,0,8,"j"),hline(2,11,8,"j"),vline(0,2,8,"j"),vline(11,2,8,"j"),
 px(1,1,"j"),px(10,1,"j"),px(1,10,"j"),px(10,10,"j"),
 hline(2,1,8,H),vline(1,2,7,H),hline(2,10,8,L),vline(10,2,8,L),
 px(2,2,col),px(9,2,"t"),px(2,9,"y"),px(9,9,"p"),
 px(5,1,"c"),px(6,10,"C")
);
frame("panel","y");frame("boton","p");
