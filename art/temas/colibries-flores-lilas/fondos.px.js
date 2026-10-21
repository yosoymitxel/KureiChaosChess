// Mosaico botánico: pétalos agrupados, nervaduras y piedra violeta. Motivos con espacio negativo, sin ruido.
pal({
 a:"#e8d8f2",A:"#fbf0ff",c:"#cbb5e1",C:"#a58ac4",
 d:"#bca4d7",D:"#d8c3eb",e:"#78628f",E:"#4e3a61",
 r:"#211a31",R:"#302543",z:"#181225",J:"#110d1c",j:"#0c0813",
 p:"#a66bd0",P:"#70488e",y:"#e0bd68",Y:"#8f6a37",t:"#65c5a1",T:"#367f69",
 v:"#96f0ee",V:"#398fa2"
});
const slab=(name,[base,hi,lo,deep],...marks)=>sprite(name,{w:16,h:16},
 rect(0,0,16,16,base),hline(0,0,15,hi),vline(0,0,15,hi),
 hline(1,14,14,lo),vline(14,1,13,lo),hline(0,15,16,deep),vline(15,0,16,deep),...marks
);
const bloom=(x,y)=>[
 px(x,y-2,"p"),px(x-2,y-1,"P"),px(x,y-1,"p"),px(x+2,y-1,"P"),
 px(x-2,y+1,"p"),px(x,y+1,"P"),px(x+2,y+1,"p"),px(x,y+2,"p"),px(x,y,"y")
];
const vine=(x,y)=>[line(x,y,x+2,y+3,"t",1),line(x+2,y+3,x+6,y+4,"T",1),px(x+2,y+2,"v"),px(x+5,y+4,"v")];
slab("tile-a",["a","A","c","C"],...bloom(5,5),...vine(9,8),px(12,12,"c"));
slab("tile-a2",["a","A","c","C"],...bloom(12,4),...vine(3,8),px(5,12,"T"));
slab("tile-a3",["a","A","c","C"],...bloom(4,12),...vine(9,2),px(12,5,"T"));
slab("tile-b",["d","D","e","E"],...bloom(7,6),...vine(9,8),px(12,12,"e"));
slab("tile-b2",["d","D","e","E"],...bloom(12,11),...vine(3,4),px(5,8,"T"));
slab("tile-b3",["d","D","e","E"],...bloom(4,5),...vine(9,9),px(12,12,"e"));
const rows=[[12,10,10],[8,12,12],[10,12,10],[13,9,10]],offsets=[0,5,9,3],stones=[];
rows.forEach((widths,row)=>{
 const y=row*8;let x=offsets[row];
 widths.forEach((wd,i)=>{
  const base=(row+i)%3===1?"R":"r";
  for(const dx of [0,-32]){const sx=x+dx;stones.push(rect(sx,y,wd-1,7,base),hline(sx,y,wd-1,"C"),hline(sx,y+6,wd-1,"J"));}
  x+=wd;
 });
 stones.push(hline(0,y+7,32,"j"));
});
sprite("table",{w:32,h:32},rect(0,0,32,32,"j"),...stones,
 ...[2,10,18,26].flatMap(x=>[line(x,2,x+3,7,"T",1),px(x+1,3,"t"),px(x+2,7,"t")]),
 ...[[7,21],[23,9],[8,5],[24,27]].flatMap(([x,y])=>bloom(x,y))
);
const H="#ffffff66",L="#00000040";
const frame=(name,col)=>sprite(name,{w:12,h:12},
 hline(2,0,8,"j"),hline(2,11,8,"j"),vline(0,2,8,"j"),vline(11,2,8,"j"),
 px(1,1,"j"),px(10,1,"j"),px(1,10,"j"),px(10,10,"j"),
 hline(2,1,8,H),vline(1,2,7,H),hline(2,10,8,L),vline(10,2,8,L),
 ...bloom(2,2),px(9,2,col),px(2,9,"t"),px(9,9,"p")
);
frame("panel","p");frame("boton","y");
