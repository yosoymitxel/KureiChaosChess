// Vesper: terciopelo oscuro, encaje y luz de velas. Losas de piedra negra con vetas de plata.
pal({
 a:"#1a1420",A:"#2a2230",c:"#3a2d40",C:"#504058",
 d:"#0a0810",D:"#15101c",e:"#2d1f2a",E:"#1a1018",
 r:"#b33b61",R:"#81304f",z:"#c9a36a",Z:"#80613d",
 p:"#e8d8e0",P:"#c9b8c4",t:"#726174",T:"#4a3d4a",j:"#0a0810",J:"#15101c",
 h:"#f5e6ef",H:"#dfbfd4",y:"#fff0f5",Y:"#f4d3de",
 s:"#8ed1c1",S:"#3e806e",m:"#4a3d4a",M:"#2a2230",
 u:"#7a6680",U:"#8c7892",x:"#6a5870",X:"#5a4a60",
 f:"#4e4056",F:"#5c4c64",g:"#42364a",G:"#342a3c"
});
const tile=(name,[base,hi,lo,deep],...marks)=>sprite(name,{w:16,h:16},
 rect(0,0,16,16,base),hline(0,0,15,hi),vline(0,0,15,hi),
 hline(1,14,14,lo),vline(14,1,13,lo),
 ...marks.flat(Infinity)
);
const lace=t=>[hline(2,2,4,t.hi),hline(6,2,4,t.hi),hline(10,2,4,t.hi),hline(14,2,4,t.hi),
  px(1,3,t.lo),px(5,3,t.lo),px(9,3,t.lo),px(13,3,t.lo)];
const vein=t=>[line(3,1,6,6,t.deep,1),line(10,8,13,13,t.deep,1),px(7,5,t.hi),px(12,3,t.hi)];
tile("tile-a",["u","U","x","X"],lace({hi:"U",lo:"x"}),vein({deep:"X",hi:"U"}));
tile("tile-a2",["u","U","x","X"],lace({hi:"U",lo:"x"}),px(4,10,"r"),px(11,6,"r"),px(7,13,"r"));
tile("tile-a3",["u","U","x","X"],lace({hi:"U",lo:"x"}),px(2,5,"s"),px(8,11,"s"),px(13,3,"s"));
tile("tile-b",["f","F","g","G"],lace({hi:"F",lo:"g"}),vein({deep:"G",hi:"F"}));
tile("tile-b2",["f","F","g","G"],lace({hi:"F",lo:"g"}),px(4,10,"r"),px(11,6,"r"),px(7,13,"r"));
tile("tile-b3",["f","F","g","G"],lace({hi:"F",lo:"g"}),px(2,5,"s"),px(8,11,"s"),px(13,3,"s"));
const planks=[];
for(let y=0;y<32;y+=8){
 const row=y/8,off=row%2?8:0;
 for(let i=-1;i<2;i++){
  const x=i*16+off,base=(row+i)%2?"E":"e";
  planks.push(rect(x,y,15,7,base),hline(x,y,15,"c"),hline(x,y+6,15,"J"));
 }
 planks.push(hline(0,y+7,32,"j"));
}
sprite("table",{w:32,h:32},rect(0,0,32,32,"d"),...planks,
 ...[2,10,18,26].flatMap(x=>[vline(x,0,31,"T"),px(x,4,"c"),px(x+1,12,"c"),px(x-1,20,"t"),px(x,28,"c")]),
 ...[[6,5],[22,21]].flatMap(([x,y])=>[ellipse(x,y,2,2,"p"),px(x-1,y,"r"),px(x+1,y,"r")])
);
const H="#ffffff55",L="#00000055";
const frame=(name,col)=>sprite(name,{w:12,h:12},
 hline(2,0,8,"j"),hline(2,11,8,"j"),vline(0,2,8,"j"),vline(11,2,8,"j"),
 px(1,1,"j"),px(10,1,"j"),px(1,10,"j"),px(10,10,"j"),
 hline(2,1,8,H),vline(1,2,7,H),hline(2,10,8,L),vline(10,2,8,L),
 px(2,2,col),px(9,2,"t"),px(2,9,"y"),px(9,9,"p"),
 px(5,1,"c"),px(6,10,"C")
);
frame("panel","r");frame("boton","p");
