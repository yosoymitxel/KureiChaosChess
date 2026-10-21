// Jefes del jardín: colibríes de gran tamaño con pico fino, alas diferenciadas y cola en horquilla.
pal({
  k:"#261b32",w:"#fbf0ff",W:"#e8d8f2",o:"#cbb5e1",O:"#8c70aa",b:"#59446f",
  g:"#fff8ff",G:"#d2c1e4",p:"#d69aff",P:"#8e57bc",y:"#f4ce78",Y:"#a87938",
  t:"#89e0c0",T:"#367f73",e:"#ff9dd8",E:"#b351a0",m:"#96f0ee",M:"#398fa2",
  r:"#c3f0e0",R:"#629e8c",c:"#f4a8d8",C:"#ad6fa8",n:"#536d8a",N:"#30435b"
});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const boss=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const bird=(x,y,s=1,throat="t")=>[
  ellipse(x,y,5*s,3.5*s,"O"),ellipse(x-1*s,y-1*s,3.5*s,2*s,"W"),
  poly([x-3*s,y-1*s,x-7*s,y-6*s,x-2*s,y-4*s,x+2*s,y-2*s],"p"),
  poly([x+1*s,y-1*s,x+5*s,y-5*s,x+5*s,y,x+2*s,y+2*s],"T"),
  poly([x+2*s,y-1*s,x+10*s,y-2*s,x+3*s,y+1*s],"k"),
  ellipse(x-4*s,y-4*s,2.5*s,2.5*s,"g"),px(x-4*s,y-4*s,"k"),
  poly([x-2*s,y,x+1*s,y-1*s,x+2*s,y+2*s,x,y+4*s],"t"),
  px(x,y+1*s,throat),line(x-2*s,y+2*s,x-4*s,y+4*s,"k",1),line(x+1*s,y+2*s,x+3*s,y+4*s,"k",1)
];
const wing=(x,y,s=1)=>[
  poly([x,y,x-4*s,y-6*s,x-1*s,y-13*s,x+2*s,y-8*s,x+6*s,y-14*s,x+6*s,y-6*s,x+10*s,y-10*s,x+8*s,y],"O"),
  line(x,y,x-1*s,y-7*s,"W",1),line(x+2*s,y-2*s,x+4*s,y-9*s,"p",1),line(x+5*s,y-1*s,x+7*s,y-7*s,"t",1)
];
const fork=(x,y)=>[
  poly([x,y,x-4,y+6,x-10,y+13,x-6,y+5,x-3,y+1],"P"),
  poly([x+1,y,x+4,y+7,x+11,y+12,x+7,y+4,x+3,y+1],"O"),
  line(x-3,y+3,x-8,y+10,"p",1),line(x+3,y+3,x+8,y+9,"t",1)
];
const bloom=(x,y)=>[px(x,y-2,"p"),px(x-2,y-1,"P"),px(x,y-1,"p"),px(x+2,y-1,"P"),px(x-2,y+1,"p"),px(x,y+1,"P"),px(x+2,y+1,"p"),px(x,y+2,"p"),px(x,y,"y")];

// Titán: colibrí imperial; pico largo, garganta violeta, cola bifurcada, corona floral.
boss("boss-titan",{w:44,h:42},
  poly([8,25,13,19,26,20,36,26,39,34,30,38,13,36,5,32],"b"),
  poly([14,27,28,25,33,34,15,35],"T"),...fork(21,29),...wing(15,22,1.25),
  ...bird(23,17,1.35,"p"),line(26,16,42,12,"k",2),px(42,12,"M"),px(39,13,"y"),
  poly([14,15,17,7,21,12,25,4,29,11,34,6,34,16],"p"),hline(18,14,13,"W"),
  ...[18,23,28,33].flatMap((x)=>[px(x,9,"y"),px(x+1,10,"Y")]),
  ...[7,14,34,40].flatMap(x=>[px(x,28,"t"),px(x+1,29,"T")]),
  line(10,23,4,18,"T",3),poly([2,18,7,16,10,21,6,24,2,22],"O"),...bloom(8,21)
);

// Ariete: colibrí con el pecho adelantado en embestida, alas plegadas como lanzas.
boss("boss-ram",{w:46,h:34},
  ...fork(32,19),ellipse(25,20,12,7,"O"),ellipse(22,18,9,4,"W"),
  ...wing(20,17,.8),poly([8,20,15,13,22,17,20,23,12,26],"t"),
  ...bird(13,14,1.05,"p"),line(15,13,44,8,"k",2),px(44,8,"M"),
  poly([7,10,5,5,11,7,16,10],"p"),line(8,9,5,6,"W",1),
  line(14,22,10,27,"T",3),line(19,22,18,28,"T",3),px(9,28,"k"),px(18,29,"k"),
  ...[20,24,28,32].map(x=>px(x,24,"y")),px(16,17,"g")
);

// Hidra: tres aves de distintas especies/color de garganta, unidas por raíces y hojas.
boss("boss-hydra",{w:46,h:42},
  poly([4,31,12,25,20,29,27,25,36,29,43,32,45,39,2,39],"b"),
  line(10,31,7,19,"T",5),line(23,31,23,17,"T",5),line(36,31,39,19,"T",5),
  ...bird(7,14,.9,"p"),...bird(23,10,1.0,"m"),...bird(40,14,.9,"e"),
  ...wing(5,14,.65),...wing(22,12,.7),...wing(37,14,.65),
  line(9,13,18,10,"k",1),px(18,10,"M"),line(25,9,35,12,"k",1),px(35,12,"M"),
  poly([5,8,7,3,10,7,13,3,15,9],"p"),poly([19,5,22,0,25,5,28,1,30,7],"t"),poly([34,8,37,3,40,7,43,4,43,10],"P"),
  ...[11,16,21,26,31,36].map(x=>[line(x,33,x-2,37,"T",1),px(x-2,37,"t")]),
  ...[11,23,35].flatMap(x=>[px(x,31,"y"),px(x+1,32,"Y")])
);

// Gólem: espíritu del néctar, cuerpo de raíces y caparazón floral; cara de ave en el centro.
boss("boss-golem",{w:42,h:42},
  poly([7,8,13,4,29,4,35,8,38,30,32,38,10,38,4,30],"b"),
  poly([10,13,21,7,32,13,30,29,12,29],"O"),poly([13,15,21,11,29,15,27,27,15,27],"T"),
  ...bird(21,17,1.1,"p"),line(23,16,38,13,"k",2),px(38,13,"M"),
  ...[15,19,23,27].map(y=>hline(13,y,16,y%2?"t":"O")),
  poly([9,12,6,7,13,9,16,12],"p"),poly([32,12,36,7,34,13,29,16],"P"),
  rect(1,17,8,13,"T"),rect(33,17,8,13,"T"),...bloom(5,20),...bloom(37,20),
  rect(12,31,6,7,"b"),rect(24,31,6,7,"b"),hline(12,37,6,"T"),hline(24,37,6,"T"),
  ...fork(18,27),...bloom(21,6)
);

// Jinete: colibrí peregrino de silueta fina, montado sobre una hoja-loto.
boss("boss-rider",{w:38,h:42},
  poly([3,31,10,25,19,23,28,26,35,32,31,38,7,38],"T"),
  poly([9,31,18,27,27,30,24,35,12,35],"t"),line(12,32,8,37,"T",2),line(26,32,30,37,"T",2),
  ...fork(19,26),...wing(14,19,1),...bird(19,12,1.05,"e"),line(22,11,35,8,"k",2),px(35,8,"M"),
  poly([10,12,12,5,16,9,20,3,24,9,28,5,29,13],"p"),hline(13,11,13,"W"),...bloom(20,6),
  line(28,5,31,36,"n",2),line(29,5,32,36,"y",1),poly([27,6,29,0,33,6],"m"),px(30,3,"W"),
  ...[12,16,20,24,28].flatMap(x=>[px(x,34,"p"),px(x+1,35,"P")])
);

// Muralla: jardín vertical de flores y cinco tallos, con pájaros posados en diferentes alturas.
boss("boss-wall",{w:46,h:37},
  rect(2,11,44,24,"b"),rect(4,13,40,20,"O"),
  ...[7,15,23,31,39].map(x=>[vline(x,14,17,"T"),line(x,18,x-3,14,"t",1),line(x,22,x+3,18,"T",1)]),
  ...[7,23,39].flatMap((x,i)=>[...bloom(x,18+i%2*4),...bloom(x+2,25)]),
  ...bird(12,12,.6,"p"),...bird(28,10,.6,"m"),...bird(42,14,.55,"e"),
  line(14,11,22,9,"k",1),px(22,9,"M"),line(30,9,39,11,"k",1),px(39,11,"M"),
  rect(1,32,46,4,"b"),hline(2,32,44,"T"),...[4,10,16,22,28,34,40,46].map(x=>px(x,34,"y"))
);

// Devorador: colibrí gigante con pico curvo, garganta rubí y alas abiertas como una flor carnívora.
boss("boss-devourer",{w:44,h:42},
  ellipse(22,24,11,9,"O"),ellipse(21,24,8,7,"W"),...fork(20,29),
  ...wing(13,21,1.15),...wing(25,20,1.0),...bird(22,15,1.25,"e"),
  line(25,14,43,9,"k",2),px(43,9,"M"),px(39,10,"y"),
  poly([13,15,9,10,12,6,16,12],"p"),poly([27,14,31,8,34,5,32,13],"T"),
  poly([16,23,20,20,25,22,28,28,20,32],"P"),px(22,24,"y"),px(22,26,"W"),
  line(10,25,3,31,"T",4),line(34,25,41,31,"T",4),poly([1,30,6,28,9,34,5,37,1,35],"O"),poly([35,34,38,28,43,30,43,35,39,37],"O"),
  ...[14,18,22,26,30].map(x=>px(x,36,"p")), ...bloom(8,35),...bloom(36,35)
);
