// Piso de escenario digital: paneles LED con señal, circuitos y un marco de monitor de concierto.
pal({
 a:"#80dfe0",A:"#d1fffa",c:"#56b9c0",C:"#297f91",
 d:"#344d70",D:"#4a6688",e:"#24334d",E:"#152438",
 r:"#10232e",R:"#183442",z:"#0b1c27",J:"#06131c",j:"#030b12",
 p:"#ff79cd",P:"#aa3e91",y:"#eaff81",Y:"#9ccc42",t:"#56e9f0",T:"#218caa"
});
const tile=(name,[base,hi,lo,deep],...marks)=>sprite(name,{w:16,h:16},
 rect(0,0,16,16,base),hline(0,0,15,hi),vline(0,0,15,hi),
 hline(1,14,14,lo),vline(14,1,13,lo),hline(0,15,16,deep),vline(15,0,16,deep),
 ...marks
);
const led=t=>[hline(2,3,5,t.lo),hline(2,4,5,t.hi),vline(10,2,5,t.deep),px(10,2,"p"),px(11,6,"t"),hline(3,10,7,t.deep)];
const signal=t=>[poly([11,1,14,1,10,6,13,6,6,14,8,8,5,8],"P"),px(12,2,"p"),px(7,12,"t")];
const circuit=t=>[vline(4,3,8,t.deep),hline(4,4,6,t.lo),vline(9,4,5,t.deep),hline(8,9,5,t.hi),px(4,12,"p"),px(9,9,"t")];
tile("tile-a",["a","A","c","C"],led({lo:"c",hi:"A",deep:"C"}));
tile("tile-a2",["a","A","c","C"],signal({deep:"C"}));
tile("tile-a3",["a","A","c","C"],circuit({deep:"C",lo:"c",hi:"A"}));
tile("tile-b",["d","D","e","E"],led({lo:"e",hi:"D",deep:"E"}));
tile("tile-b2",["d","D","e","E"],signal({deep:"E"}));
tile("tile-b3",["d","D","e","E"],circuit({deep:"E",lo:"e",hi:"D"}));
// Mesa led: seams of eight pixels, alternating rows, scanlines and sparse magenta/cyan pulses.
const panels=[];
for(let y=0;y<32;y+=8) for(let x=0;x<32;x+=8){
 const base=(x/8+y/8)%2?"r":"R";
 panels.push(rect(x,y,7,7,base),hline(x,y,7,"C"),vline(x,y,7,"C"),hline(x,y+6,7,"J"),vline(x+6,y,7,"J"));
 panels.push(hline(x+1,y+2,5,"E"),hline(x+1,y+3,4,"e"));
}
sprite("table",{w:32,h:32},rect(0,0,32,32,"z"),...panels,
 ...[[3,1],[11,9],[19,17],[27,25],[27,1],[3,25]].flatMap(([x,y])=>[hline(x,y,3,"p"),px(x+1,y+1,"t")]),
 ...[7,23].map(x=>vline(x,0,31,"J"))
);
const H="#ffffff66",L="#00000040";
const frame=(name,col)=>sprite(name,{w:12,h:12},
 hline(2,0,8,"j"),hline(2,11,8,"j"),vline(0,2,8,"j"),vline(11,2,8,"j"),
 px(1,1,"j"),px(10,1,"j"),px(1,10,"j"),px(10,10,"j"),
 hline(2,1,8,H),vline(1,2,7,H),hline(2,10,8,L),vline(10,2,8,L),
 px(2,2,col),px(9,2,"p"),px(2,9,"t"),px(9,9,col),px(5,1,"p"),px(6,10,"t")
);
frame("panel","p");frame("boton","t");
