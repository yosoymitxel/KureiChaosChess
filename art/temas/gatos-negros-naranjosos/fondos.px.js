// Tablero de noche otoñal: tarima marcada con garras y huellas; el marco parece madera quemada.
pal({k:"#211b1b",a:"#e8d8b9",A:"#fff0d2",c:"#c7a37a",C:"#8b6547",d:"#b68a62",D:"#d9b58a",e:"#684632",E:"#3a2823",r:"#171923",R:"#252a35",z:"#10131a",J:"#0b0d13",j:"#07090d",p:"#e77927",P:"#8a3519",y:"#f7c84e",Y:"#b96a22"});
const slab=(n,b,h,l,marks=[])=>sprite(n,{w:16,h:16},rect(0,0,16,16,b),hline(0,0,15,h),vline(0,0,15,h),hline(1,14,14,l),vline(14,1,13,l),hline(0,15,16,"k"),vline(15,0,16,"k"),...marks);
slab("tile-a","a","A","c",[ellipse(7,7,1,2,"C"),ellipse(10,7,1,2,"C"),ellipse(6,10,1,2,"C"),px(9,11,"C"),px(12,3,"c")]);
slab("tile-a2","a","A","c",[line(12,1,8,5,"C",1),line(8,5,10,8,"C",1),px(4,11,"c"),px(12,11,"A")]);
slab("tile-a3","a","A","c",[ellipse(4,6,1,2,"C"),ellipse(7,6,1,2,"C"),ellipse(3,9,1,2,"C"),px(6,10,"C"),px(12,3,"c")]);
slab("tile-b","d","D","e",[px(4,4,"E"),px(10,11,"e"),hline(2,8,3,"p")]);
slab("tile-b2","d","D","e",[line(13,1,9,5,"E",1),px(9,6,"e"),hline(3,10,4,"p")]);
slab("tile-b3","d","D","e",[px(0,13,"e"),px(1,14,"E"),px(2,14,"E"),ellipse(9,6,1,2,"P")]);
const boards=[];for(let row=0;row<4;row++){const y=row*8;for(let x=0;x<32;x+=8){const c=((row+x/8)%2)?"r":"R";boards.push(rect(x,y,7,7,c),hline(x,y,7,"C"),vline(x,y,7,"C"),hline(x,y+6,7,"J"),vline(x+6,y,7,"J"));}}sprite("table",{w:32,h:32},rect(0,0,32,32,"z"),...boards,...[3,11,19,27].map(x=>line(x,3,x+2,6,"E",1)),...[[7,22],[23,9]].map(([x,y])=>{return px(x,y,"p")}));
const frame=(n,col)=>sprite(n,{w:12,h:12},hline(2,0,8,"k"),hline(2,11,8,"k"),vline(0,2,8,"k"),vline(11,2,8,"k"),hline(2,1,8,"C"),vline(1,2,7,"C"),hline(2,10,8,"J"),vline(10,2,8,"J"),px(1,1,col),px(10,1,col),px(1,10,col),px(10,10,col),px(2,2,"p"),px(9,9,"y"));
frame("panel","y");frame("boton","p");
