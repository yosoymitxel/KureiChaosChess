// Escenario de concierto digital: paneles LED, barrido holográfico y mesa de fibra óptica.
pal({k:"#08282e",a:"#b8f4e9",A:"#e4fffa",c:"#79ded4",C:"#36bcb7",d:"#61cfc5",D:"#a2e9dd",e:"#287c80",E:"#14545e",r:"#103943",R:"#174b55",z:"#09252c",J:"#06191e",j:"#041216",p:"#ed78bd",P:"#8f367c",y:"#eaff81",Y:"#9ccc42"});
const slab=(n,b,h,l,marks=[])=>sprite(n,{w:16,h:16},rect(0,0,16,16,b),hline(0,0,15,h),vline(0,0,15,h),hline(1,14,14,l),vline(14,1,13,l),hline(0,15,16,"k"),vline(15,0,16,"k"),...marks);
slab("tile-a","a","A","c",[hline(2,3,5,"p"),hline(3,4,5,"p"),px(11,10,"C"),px(12,10,"A"),vline(2,6,4,"e")]);
slab("tile-a2","a","A","c",[hline(2,3,7,"p"),px(9,4,"p"),hline(4,10,8,"C"),px(11,9,"A"),vline(3,11,2,"e")]);
slab("tile-a3","a","A","c",[hline(2,2,4,"c"),hline(10,11,4,"p"),px(3,3,"A"),px(12,12,"A"),vline(7,5,5,"C")]);
slab("tile-b","d","D","e",[hline(2,4,6,"E"),hline(3,5,4,"c"),px(12,11,"p"),px(11,10,"P")]);
slab("tile-b2","d","D","e",[hline(1,3,8,"P"),vline(8,3,6,"P"),hline(4,11,8,"C"),px(4,10,"D")]);
slab("tile-b3","d","D","e",[hline(3,2,3,"p"),hline(9,11,5,"c"),px(2,3,"D"),px(13,12,"D")]);
const bricks=[];for(let row=0;row<4;row++){const y=row*8,off=row%2?8:0;for(let i=-1;i<2;i++){const x=i*16+off;bricks.push(rect(x,y,15,7,(row+i)%2?"r":"R"),hline(x,y,15,"C"),hline(x,y+6,15,"J"));}bricks.push(hline(0,y+7,32,"j"));}sprite("table",{w:32,h:32},rect(0,0,32,32,"z"),...bricks,...[2,10,18,26].map(x=>vline(x,0,31,"E")),...[3,11,19,27].map(x=>px(x,3,"p")),...[7,15,23,31].map(x=>px(x,27,"c")));
const frame=(n,col)=>sprite(n,{w:12,h:12},hline(2,0,8,"k"),hline(2,11,8,"k"),vline(0,2,8,"k"),vline(11,2,8,"k"),hline(2,1,8,"C"),vline(1,2,7,"C"),hline(2,10,8,"J"),vline(10,2,8,"J"),px(1,1,col),px(10,1,col),px(1,10,col),px(10,10,col),px(2,2,"p"),px(9,9,"c"));
frame("panel","p");frame("boton","y");
