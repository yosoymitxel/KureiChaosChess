// Tablero de micelio: losas de bosque, anillos de setas, musgo y una mesa que repite sin cortes.
pal({
 a:"#c5d99a",A:"#e5edbb",c:"#8eae71",C:"#668b59",
 d:"#52744b",D:"#6c8b57",e:"#34533b",E:"#263f31",
 m:"#8eae71",M:"#456d4c",r:"#d95777",R:"#9d315a",
 y:"#f6d66b",Y:"#c49b3b",t:"#24362c",T:"#304637",k:"#18241f"
});
const slab=(name,base,hi,lo,deep,kind=0)=>sprite(name,{w:16,h:16},
 rect(0,0,16,16,base),hline(0,0,16,hi),vline(0,0,16,hi),
 hline(1,14,14,lo),
 ...(kind===1?[px(4,5,"m"),px(5,4,"M"),px(6,5,"m"),px(3,6,"M")]:[]),
 ...(kind===2?[ellipse(8,8,3,2,"r"),hline(5,8,6,"R"),px(7,6,"y"),px(10,7,"y")]:[]),
 ...(kind===3?[poly([5,4,10,5,8,10,4,8],"M"),px(6,6,"m"),px(7,7,"m")]:[])
);
slab("tile-a","a","A","c","C",0);slab("tile-a2","a","A","c","C",2);slab("tile-a3","a","A","c","C",1);
slab("tile-b","d","D","e","E",0);slab("tile-b2","d","D","e","E",1);slab("tile-b3","d","D","e","E",3);
const bricks=[];
for(let y=0;y<32;y+=8){
 const offset=(y/8%2)*7;
 for(let x=-16+offset;x<32;x+=12){
  bricks.push(rect(x,y,11,7,(y/8+x/12)%2?"T":"t"),hline(x,y,11,"T"),hline(x,y+6,11,"k"),vline(x+10,y,7,"k"));
 }
}
sprite("table",{w:32,h:32},rect(0,0,32,32,"k"),...bricks,
 px(4,5,"m"),px(5,4,"M"),px(6,5,"m"),px(22,21,"r"),px(23,20,"y"));
const H="#ffffff66",L="#00000040";
const frame=(name,accent)=>sprite(name,{w:12,h:12},
 rect(0,0,12,12,"#24362c"),hline(0,0,12,accent),vline(0,0,12,accent),
 hline(0,11,12,"#18241f"),vline(11,0,12,"#18241f"),
 rect(2,2,8,8,"#24362c"),px(1,1,"#f6d66b"),px(10,10,"#18241f"));
frame("panel","#8eae71");frame("boton","#bd83e8");
