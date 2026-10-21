// Baldosas de cementerio: mármol agrietado, juntas de latón y madera de ataúd.
pal({k:"#211a1d",a:"#d9d0c2",A:"#f1e6d5",c:"#b9a995",C:"#83756c",d:"#a89a90",D:"#c8b4a1",e:"#6f5c59",E:"#493d3a",r:"#302027",R:"#49313a",z:"#24191f",J:"#1a1117",j:"#110c10",y:"#d2a84a",Y:"#806020"});
const slab=(n,b,h,l,marks=[])=>sprite(n,{w:16,h:16},rect(0,0,16,16,b),hline(0,0,15,h),vline(0,0,15,h),hline(1,14,14,l),vline(14,1,13,l),hline(0,15,16,"k"),vline(15,0,16,"k"),...marks);
slab("tile-a","a","A","c",[line(12,2,9,5,"C",1),px(8,6,"A"),px(4,12,"c"),px(5,12,"A")]);
slab("tile-a2","a","A","c",[poly([12,0,14,0,11,4,12,7,8,10,9,6,7,4],"C"),px(8,5,"A"),px(3,13,"c")]);
slab("tile-a3","a","A","c",[px(0,13,"c"),px(1,14,"C"),px(2,14,"C"),px(11,5,"c"),px(12,5,"A")]);
slab("tile-b","d","D","e",[px(4,4,"E"),px(10,11,"e"),px(11,11,"D")]);
slab("tile-b2","d","D","e",[line(13,1,9,5,"E",1),px(9,6,"e"),px(7,7,"D")]);
slab("tile-b3","d","D","e",[px(0,13,"e"),px(1,14,"E"),px(2,14,"E"),px(12,4,"D")]);
const bricks=[];for(let row=0;row<4;row++){let y=row*8,off=row%2?8:0;for(let i=-1;i<2;i++){let x=i*16+off;bricks.push(rect(x,y,15,7,(row+i)%3===0?"R":"r"),hline(x,y,15,"R"),hline(x,y+6,15,"J"));}bricks.push(hline(0,y+7,32, "j"));}sprite("table",{w:32,h:32},rect(0,0,32,32,"j"),...bricks,...[4,12,20,28].map(x=>px(x,4,"Y")),...[8,24].map(x=>vline(x,0,31,"J")));
const frame=(n,metal)=>sprite(n,{w:12,h:12},hline(2,0,8,"k"),hline(2,11,8,"k"),vline(0,2,8,"k"),vline(11,2,8,"k"),px(1,1,"k"),px(10,1,"k"),px(1,10,"k"),px(10,10,"k"),hline(2,1,8,"A"),vline(1,2,7,"A"),hline(2,10,8,"J"),vline(10,2,8,"J"),px(2,2,metal),px(9,2,metal),px(2,9,metal),px(9,9,metal));
frame("panel","y");frame("boton","C");
