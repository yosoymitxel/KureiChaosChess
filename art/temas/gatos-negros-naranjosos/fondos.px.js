// Tapiz nocturno: damero de carbón y cuero, huellas pequeñas, rasguños y costura de cuero en la mesa.
pal({
 a:"#e8d8b9",A:"#fff0d2",c:"#c7a37a",C:"#8b6547",
 d:"#b68a62",D:"#d9b58a",e:"#684632",E:"#3a2823",
 r:"#171923",R:"#252a35",z:"#10131a",J:"#0b0d13",j:"#07090d",
 p:"#e77927",P:"#8a3519",y:"#f7c84e",Y:"#b96a22",
 h:"#23222c",H:"#4a4654",g:"#cdb793",G:"#8b745b"
});
const slab=(name,[base,hi,lo,deep],...marks)=>sprite(name,{w:16,h:16},
 rect(0,0,16,16,base),hline(0,0,15,hi),vline(0,0,15,hi),
 hline(1,14,14,lo),vline(14,1,13,lo),hline(0,15,16,deep),vline(15,0,16,deep),
 ...marks.flatMap(f=>f())
);
const paw=(x,y,c)=>[ellipse(x,y,1,1,c),px(x-3,y-2,c),px(x,y-3,c),px(x+3,y-2,c),px(x-2,y+1,c),px(x+2,y+1,c)];
slab("tile-a",["a","A","c","C"],()=>[...paw(7,7,"C"),hline(2,11,4,"c"),hline(10,4,3,"c")]);
slab("tile-a2",["a","A","c","C"],()=>[...paw(11,10,"C"),line(3,3,5,5,"C",1),line(5,5,4,8,"c",1)]);
slab("tile-a3",["a","A","c","C"],()=>[hline(3,5,5,"c"),hline(7,6,4,"c"),px(4,6,"A"),px(10,8,"C"),...paw(12,12,"C")]);
slab("tile-b",["d","D","e","E"],()=>[...paw(7,7,"E"),hline(2,11,4,"e"),hline(10,4,3,"e")]);
slab("tile-b2",["d","D","e","E"],()=>[...paw(11,10,"E"),line(3,3,5,5,"E",1),line(5,5,4,8,"e",1)]);
slab("tile-b3",["d","D","e","E"],()=>[hline(3,5,5,"e"),hline(7,6,4,"e"),px(4,6,"D"),px(10,8,"E"),...paw(12,12,"E")]);
const panels=[];
for(let y=0;y<32;y+=8) for(let x=0;x<32;x+=8){
 const base=(x/8+y/8)%2?"r":"R";
 panels.push(rect(x,y,7,7,base),hline(x,y,7,"H"),vline(x,y,7,"H"),hline(x,y+6,7,"J"),vline(x+6,y,7,"J"));
}
sprite("table",{w:32,h:32},rect(0,0,32,32,"z"),...panels,
 ...[[4,4],[20,12],[12,28]].flatMap(([x,y])=>[...paw(x,y,"H"),px(x+4,y+3,"p")]),
 line(1,18,5,15,"H",1),line(5,15,8,18,"H",1),line(8,18,6,21,"H",1),
 line(24,2,28,5,"H",1),line(28,5,27,8,"H",1)
);
const H="#ffffff66",L="#00000040";
const frame=(name,col)=>sprite(name,{w:12,h:12},
 hline(2,0,8,"j"),hline(2,11,8,"j"),vline(0,2,8,"j"),vline(11,2,8,"j"),
 px(1,1,"j"),px(10,1,"j"),px(1,10,"j"),px(10,10,"j"),
 hline(2,1,8,H),vline(1,2,7,H),hline(2,10,8,L),vline(10,2,8,L),
 px(2,2,col),px(9,2,"p"),px(2,9,"Y"),px(9,9,"C"),px(5,1,"c"),px(6,10,"C")
);
frame("panel","y");frame("boton","p");
