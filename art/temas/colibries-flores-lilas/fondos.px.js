// Baldosas de pétalos y mosaico botánico; mesa oscura con enredaderas repetibles.
pal({k:"#261b32",a:"#e8d8f2",A:"#fbf0ff",c:"#cbb5e1",C:"#a58ac4",d:"#bca4d7",D:"#d8c3eb",e:"#78628f",E:"#4e3a61",r:"#211a31",R:"#302543",z:"#181225",J:"#110d1c",j:"#0c0813",p:"#a66bd0",P:"#70488e",y:"#e0bd68",Y:"#8f6a37",t:"#65c5a1",T:"#367f69"});
const slab=(n,b,h,l,marks=[])=>sprite(n,{w:16,h:16},rect(0,0,16,16,b),hline(0,0,15,h),vline(0,0,15,h),hline(1,14,14,l),vline(14,1,13,l),hline(0,15,16,"k"),vline(15,0,16,"k"),...marks);
const bloom=(x,y)=>[ellipse(x,y-2,2,2,"p"),ellipse(x+2,y,2,2,"p"),ellipse(x,y+2,2,2,"p"),ellipse(x-2,y,2,2,"p"),px(x,y,"y")];
slab("tile-a","a","A","c",[...bloom(5,5),px(10,10,"T"),line(10,10,13,13,"T",1)]);
slab("tile-a2","a","A","c",[...bloom(12,4),line(3,9,5,12,"T",1),line(5,12,8,13,"T",1),px(4,10,"t")]);
slab("tile-a3","a","A","c",[...bloom(4,12),line(10,3,12,7,"T",1),px(12,7,"t"),px(13,8,"T")]);
slab("tile-b","d","D","e",[...bloom(7,6),px(11,11,"T"),line(11,11,14,13,"T",1)]);
slab("tile-b2","d","D","e",[...bloom(12,11),line(2,3,5,6,"T",1),px(5,6,"t")]);
slab("tile-b3","d","D","e",[...bloom(4,5),line(9,10,12,13,"T",1),px(12,13,"t")]);
const tiles=[];for(let row=0;row<4;row++){const y=row*8,off=row%2?8:0;for(let i=-1;i<2;i++){const x=i*16+off;tiles.push(rect(x,y,15,7,(row+i)%2?"R":"r"),hline(x,y,15,"C"),hline(x,y+6,15,"J"));}tiles.push(hline(0,y+7,32,"j"));}sprite("table",{w:32,h:32},rect(0,0,32,32,"z"),...tiles,...[4,20].map(x=>line(x,3,x+4,10,"T",1)),...[[8,5],[24,21],[8,29]].flatMap(([x,y])=>[...bloom(x,y)]));
const frame=(n,col)=>sprite(n,{w:12,h:12},hline(2,0,8,"k"),hline(2,11,8,"k"),vline(0,2,8,"k"),vline(11,2,8,"k"),hline(2,1,8,"C"),vline(1,2,7,"C"),hline(2,10,8,"J"),vline(10,2,8,"J"),px(1,1,col),px(10,1,col),px(1,10,col),px(10,10,col),...bloom(2,2),px(9,9,"T"));
frame("panel","p");frame("boton","y");
