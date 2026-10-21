// Suelo de bambú y piedra musgosa con huellas pequeñas; interfaz en madera de bosque.
pal({k:"#202923",a:"#e6e0cf",A:"#f5f0e2",c:"#b2b5a5",C:"#858d7d",d:"#a6aa96",D:"#c8cbb9",e:"#606f5e",E:"#435348",r:"#182622",R:"#25372f",z:"#101b17",J:"#0a1410",j:"#07100d",p:"#c76a3b",P:"#74391f",y:"#d8b56a",Y:"#997736",t:"#76b8a0",T:"#387765"});
const slab=(n,b,h,l,marks=[])=>sprite(n,{w:16,h:16},rect(0,0,16,16,b),hline(0,0,15,h),vline(0,0,15,h),hline(1,14,14,l),vline(14,1,13,l),hline(0,15,16,"k"),vline(15,0,16,"k"),...marks);
const paw=(x,y,c)=>[ellipse(x,y,2,2,c),ellipse(x-3,y-2,1,2,c),ellipse(x,y-3,1,2,c),ellipse(x+3,y-2,1,2,c)];
slab("tile-a","a","A","c",[...paw(7,8,"C"),px(12,3,"t"),px(12,4,"T"),px(11,5,"t")]);
slab("tile-a2","a","A","c",[line(3,2,3,8,"t",2),line(4,5,7,3,"t",1),line(3,8,6,10,"t",1),...paw(11,12,"C")]);
slab("tile-a3","a","A","c",[...paw(5,5,"C"),line(11,8,11,13,"t",2),px(12,11,"t"),px(10,9,"T")]);
slab("tile-b","d","D","e",[...paw(7,8,"E"),px(12,3,"t"),px(12,4,"T")]);
slab("tile-b2","d","D","e",[line(3,2,3,8,"t",2),line(4,5,7,3,"t",1),...paw(11,12,"E")]);
slab("tile-b3","d","D","e",[...paw(5,5,"E"),line(11,8,11,13,"t",2),px(12,11,"t")]);
const boards=[];for(let row=0;row<4;row++){const y=row*8,off=row%2?8:0;for(let i=-1;i<2;i++){const x=i*16+off;boards.push(rect(x,y,15,7,(row+i)%2?"R":"r"),hline(x,y,15,"C"),hline(x,y+6,15,"J"));}boards.push(hline(0,y+7,32,"j"));}sprite("table",{w:32,h:32},rect(0,0,32,32,"z"),...boards,...[3,11,19,27].map(x=>{return line(x,1,x,30,"T",2)}),...[5,13,21,29].map(x=>px(x,7,"y")));
const frame=(n,col)=>sprite(n,{w:12,h:12},hline(2,0,8,"k"),hline(2,11,8,"k"),vline(0,2,8,"k"),vline(11,2,8,"k"),hline(2,1,8,"C"),vline(1,2,7,"C"),hline(2,10,8,"J"),vline(10,2,8,"J"),px(1,1,col),px(10,1,col),px(1,10,col),px(10,10,col),px(2,2,"t"),px(9,9,"p"));
frame("panel","y");frame("boton","p");
