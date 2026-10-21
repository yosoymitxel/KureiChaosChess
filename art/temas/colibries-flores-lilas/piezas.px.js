// Colibríes y flores lilas: pico largo, alas iridiscentes, pétalos y néctar dorado.
pal({k:"#261b32",w:"#fbf0ff",W:"#e8d8f2",o:"#cbb5e1",O:"#a58ac4",b:"#705a8a",g:"#fff8ff",G:"#d2c1e4",p:"#d69aff",P:"#8e57bc",y:"#f4ce78",Y:"#a87938",t:"#89e0c0",T:"#367f73",e:"#ff9dd8",E:"#b351a0",m:"#96f0ee",M:"#398fa2",r:"#c3f0e0",R:"#629e8c",c:"#f4a8d8",C:"#ad6fa8"});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const piece=(n,o,...d)=>sprite(n,{...o,outline:"k"},...d);
const bird=(x,y,s=1)=>[ellipse(x,y,4*s,3*s,"O"),ellipse(x-1*s,y-1*s,3*s,2*s,"W"),poly([x+2*s,y-1*s,x+9*s,y-2*s,x+3*s,y+1*s],"k"),ellipse(x-3*s,y-4*s,3*s,3*s,"w"),px(x-4*s,y-4*s,"p"),line(x-3*s,y-1*s,x-6*s,y+3*s,"T",2),px(x-3*s,y-5*s,"k")];
const bloom=(x,y,s=1)=>[...Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5;return ellipse(x+Math.round(Math.cos(a)*3*s),y+Math.round(Math.sin(a)*3*s),2*s,2*s,"p")}),circ(x,y,2*s,"y"),px(x,y,"Y")];
const wing=(x,y)=>[poly([x,y,x-3,y-6,x+1,y-10,x+3,y-4,x+7,y-6,x+6,y+1],"t"),line(x,y,x+2,y-6,"w",1),line(x+2,y,x+4,y-4,"M",1)];
piece("pawn",{w:24,h:28},...bloom(11,5,.7),...bird(10,15,.8),poly([5,17,10,17,16,23,8,24],"O"),line(7,24,5,27,"T",2),line(13,24,16,27,"T",2),...wing(10,15),px(16,14,"y"));
piece("rook",{w:29,h:32,mx:true},rect(5,12,19,16,"O"),poly([5,12,8,5,12,10,16,4,20,10,24,5,25,12],"P"),...bloom(15,15,.8),...bird(15,19,.55),rect(7,27,15,2,"T"),hline(5,12,19,"y"),vline(15,20,7,"w"),px(15,23,"Y"));
piece("knight",{w:34,h:31},poly([3,22,7,13,14,9,17,4,25,6,30,13,26,18,21,15,20,22,28,25,10,27],"O"),...bird(20,11,.7),...wing(14,16),...bloom(9,10,.6),line(5,22,2,26,"T",2),rect(11,27,5,2,"T"),rect(23,27,5,2,"T"),px(19,11,"e"));
piece("bishop",{w:26,h:32},poly([4,29,7,12,6,7,11,2,14,7,19,7,18,13,22,29],"b"),...bird(13,12,.65),...wing(13,15),line(13,19,13,28,"T",2),...bloom(13,22,.55),rect(4,29,18,2,"T"));
piece("queen",{w:30,h:34,mx:true},...bloom(15,4,.8),poly([4,13,8,7,12,10,15,4,18,10,22,7,26,13],"p"),poly([7,15,23,15,27,30,3,30],"O"),poly([10,17,20,17,21,28,9,28],"b"),...bird(15,13,.75),...wing(14,17),rect(9,29,12,2,"T"),px(15,23,"y"),hline(8,19,14,"p"));
piece("king",{w:30,h:36,mx:true},...bloom(15,3,.9),poly([5,14,25,14,27,31,3,31],"O"),poly([10,15,20,15,21,29,9,29],"b"),...bird(15,10,.9),...wing(14,17),rect(7,31,16,3,"T"),line(25,9,28,3,"y",2),circ(28,2,2,"p"),vline(15,22,6,"w"));
piece("guard",{w:26,h:30},rect(6,20,5,7,"b"),rect(15,20,5,7,"b"),poly([4,12,8,8,18,8,22,12,21,22,5,22],"O"),...bird(13,11,.6),...wing(12,15),rect(6,14,14,2,"w"),line(22,8,24,22,"T",2),...bloom(23,6,.45),rect(5,27,16,2,"T"));
piece("advisor",{w:24,h:30},poly([3,29,5,10,10,3,17,3,22,10,21,29],"b"),poly([7,10,12,6,17,10,18,18,6,18],"O"),...bird(12,12,.6),...bloom(12,22,.6),rect(4,28,16,2,"T"),line(17,19,22,16,"p",1));
piece("elephant",{w:34,h:30},ellipse(17,18,11,8,"O"),ellipse(17,18,8,6,"b"),...bird(10,12,.65),...wing(17,14),poly([21,17,28,11,31,17,26,23],"p"),...bloom(27,12,.6),rect(8,24,5,3,"T"),rect(20,24,5,3,"T"),line(27,20,30,24,"T",2));
piece("camel",{w:34,h:29},poly([8,24,9,12,13,7,16,13,19,13,22,5,27,7,26,15,30,24],"O"),poly([12,15,19,15,23,24,10,24],"b"),...bird(23,8,.65),...wing(15,13),poly([3,8,8,4,12,10,9,17],"p"),line(26,19,32,23,"T",2),rect(11,24,4,3,"T"),rect(24,24,4,3,"T"));
piece("cannon",{w:32,h:29},rect(5,16,22,8,"T"),rect(8,13,16,8,"O"),rect(10,15,12,4,"b"),ellipse(22,17,6,6,"W"),ellipse(22,17,4,4,"k"),...bird(12,11,.5),...bloom(27,7,.7),rect(7,24,4,3,"T"),rect(22,24,4,3,"T"),line(27,10,30,12,"p",1));
