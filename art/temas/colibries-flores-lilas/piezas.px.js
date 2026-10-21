// Colibríes y flores lilas: picos finos y largos, pecho iridiscente, alas en abanico y colas afiladas.
pal({
  k:"#261b32",w:"#fbf0ff",W:"#e8d8f2",o:"#cbb5e1",O:"#8c70aa",b:"#59446f",
  g:"#fff8ff",G:"#d2c1e4",p:"#d69aff",P:"#8e57bc",y:"#f4ce78",Y:"#a87938",
  t:"#89e0c0",T:"#367f73",e:"#ff9dd8",E:"#b351a0",m:"#96f0ee",M:"#398fa2",
  r:"#c3f0e0",R:"#629e8c",c:"#f4a8d8",C:"#ad6fa8",n:"#536d8a",N:"#30435b"
});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const piece=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const birdHead=(x,y)=>[
  circ(x,y,3,"P"),ellipse(x-1,y-1,2,2,"p"),px(x-1,y-1,"W"),
  px(x+1,y-1,"k"),line(x+2,y-1,x+10,y-3,"k",1),px(x+10,y-3,"M")
];
const throat=(x,y)=>[poly([x-3,y,x,y-2,x+2,y,x+1,y+4,x-2,y+3],"t"),poly([x-1,y,x,y-1,x+1,y+1,x,y+3],"m"),px(x,y,"W")];
const wingSpread=(x,y,s=1)=>[
  poly([x,y,x-3*s,y-5*s,x-1*s,y-10*s,x+2*s,y-6*s,x+5*s,y-12*s,x+5*s,y-5*s,x+8*s,y-8*s,x+7*s,y-1*s],"O"),
  line(x,y,x-1*s,y-7*s,"W",1),line(x+2*s,y-2*s,x+4*s,y-8*s,"p",1),
  line(x+4*s,y-1*s,x+6*s,y-5*s,"t",1)
];
const forkTail=(x,y)=>[
  poly([x,y,x-2,y+5,x-8,y+11,x-5,y+4,x-2,y+1],"P"),
  poly([x+1,y,x+3,y+5,x+8,y+10,x+6,y+3,x+3,y+1],"O"),
  line(x-2,y+3,x-6,y+8,"p",1),line(x+3,y+3,x+6,y+8,"t",1)
];
const feet=(x,y)=>[line(x,y,x-1,y+3,"k",1),line(x+2,y,x+3,y+3,"k",1),px(x-2,y+3,"k"),px(x+4,y+3,"k")];

// Peón: colibrí posado, con pico largo, corona violeta y garganta verde metálica.
piece("pawn",{w:27,h:31},
  ...forkTail(10,20),ellipse(14,17,5,4,"O"),ellipse(15,18,3,3,"W"),...throat(16,16),
  ...wingSpread(13,15,.7),...birdHead(18,12),poly([15,10,16,6,19,9,21,6,22,11],"p"),px(19,8,"W"),
  ...feet(13,22),line(18,11,25,9,"k",1),px(25,9,"y"),px(23,10,"M"),px(17,14,"g")
);

// Torre: posadero floral tallado, con hojas en niveles y un colibrí que bebe del centro.
piece("rook",{w:31,h:34},
  rect(4,27,23,4,"b"),hline(5,27,21,"o"),rect(8,12,15,15,"O"),rect(10,14,11,11,"b"),
  ...[16,20,24].map(y=>hline(8,y,15,"P")),...[11,17,21].map(x=>px(x,15,"y")),
  poly([5,13,2,9,7,10,11,13],"t"),poly([22,13,27,9,25,14,21,16],"T"),
  poly([7,10,9,4,13,8,17,3,21,8,25,5,25,11],"p"),hline(9,9,14,"W"),
  ellipse(16,14,5,3,"O"),ellipse(17,15,3,3,"W"),...throat(18,13),...birdHead(19,10),
  line(21,9,29,6,"k",1),px(29,6,"k"),line(14,17,11,21,"W",1),line(19,17,23,21,"t",1),
  rect(9,31,5,2,"b"),rect(18,31,5,2,"b")
);

// Caballo: vuelo en diagonal, alas levantadas y cola bifurcada; el pico define la dirección.
piece("knight",{w:36,h:33},
  ...forkTail(16,19),ellipse(19,17,6,4,"O"),ellipse(20,18,3,3,"W"),...throat(21,16),
  ...wingSpread(17,14,1.1),poly([12,15,6,11,3,6,9,8,14,12],"t"),line(8,9,4,5,"m",1),
  ...birdHead(23,12),line(25,11,35,8,"k",1),px(35,8,"M"),px(29,10,"y"),
  line(15,18,11,22,"T",2),line(17,20,16,24,"T",2),...feet(12,22),px(22,15,"p")
);

// Alfil: pájaro de corona lila en una rama, frente a un lirio que abre sus pétalos.
piece("bishop",{w:30,h:35},
  line(3,27,27,23,"n",2),line(6,26,8,22,"n",1),
  poly([7,23,4,19,10,20,13,23],"t"),poly([22,23,25,18,26,23,22,25],"T"),
  ...forkTail(12,19),ellipse(16,17,5,4,"O"),...throat(17,17),...wingSpread(13,15,.75),
  ...birdHead(20,12),line(22,11,29,10,"k",1),px(29,10,"M"),
  poly([12,12,14,7,17,11,20,6,21,12,18,14],"p"),hline(14,11,6,"W"),
  ...[0,1,2,3,4].map(i=>ellipse(5+i*2,13-Math.abs(2-i),2,3,"p")),circ(9,12,2,"y"),px(9,12,"Y"),
  ...feet(15,21),line(17,21,18,25,"n",1)
);

// Reina: hembra de plumaje joya, largas plumas de cola, diadema de pétalos y pecho turquesa.
piece("queen",{w:34,h:36},
  poly([10,22,8,28,4,34,11,30,15,26],"P"),poly([16,22,18,29,23,35,21,28,19,24],"O"),
  poly([13,21,13,28,14,34,17,29,17,23],"t"),
  ellipse(17,18,6,5,"O"),ellipse(18,19,4,4,"W"),...throat(19,17),
  ...wingSpread(14,16,.95),poly([12,16,7,13,5,8,10,11,14,13],"t"),line(9,11,6,8,"W",1),
  ...birdHead(21,12),line(23,11,33,8,"k",1),px(33,8,"M"),
  poly([13,11,14,5,17,9,20,3,22,9,25,6,25,12],"p"),...([15,19,23].map(x=>px(x,8,"y"))),
  ellipse(19,22,2,2,"p"),px(19,22,"W"),line(13,21,9,25,"T",1),line(21,22,25,25,"t",1),
  ...feet(15,24),px(16,19,"y")
);

// Rey: macho de garganta rubí, penacho puntiagudo y abanico de alas desplegadas.
piece("king",{w:35,h:38},
  poly([14,23,10,30,7,36,14,32,17,27],"P"),poly([19,23,22,31,28,36,25,29,22,24],"O"),
  ellipse(18,18,6,5,"O"),ellipse(19,19,4,4,"W"),poly([15,17,19,14,22,17,21,23,17,23],"E"),poly([17,17,19,15,21,18,19,22],"p"),
  ...wingSpread(14,16,1.1),poly([11,16,5,13,2,8,8,11,13,13],"t"),poly([21,15,27,10,30,5,29,12,24,17],"T"),
  ...birdHead(22,12),line(24,11,34,8,"k",1),px(34,8,"M"),
  poly([12,12,13,6,16,10,18,2,21,9,25,4,25,12],"p"),hline(14,10,9,"W"),px(18,5,"y"),px(22,8,"y"),
  ...feet(15,24),circ(19,22,2,"y"),px(19,22,"p")
);

// Guardia: colibrí centinela que protege el nido bajo un ala-pavés.
piece("guard",{w:30,h:33},
  ellipse(16,20,6,5,"O"),ellipse(17,21,4,4,"W"),...throat(18,19),
  poly([12,17,8,13,8,7,13,12,16,15],"T"),line(12,12,10,8,"m",1),...birdHead(20,14),
  line(22,13,29,10,"k",1),px(29,10,"M"),poly([14,8,16,3,20,7,21,12],"p"),
  poly([8,17,5,13,2,17,4,25,11,26,15,21],"b"),poly([5,17,4,22,9,23,11,20],"O"),
  line(14,24,12,28,"k",1),line(17,24,18,28,"k",1),px(11,29,"k"),px(19,29,"k"),
  ...[18,21,24].map(y=>px(6,y,"y"))
);

// Consejero: colibrí diminuto que extrae néctar de una flor campana, con dos hojas de perfil.
piece("advisor",{w:27,h:31},
  line(3,27,13,20,"t",2),poly([6,25,4,20,9,22,12,23],"T"),poly([10,22,13,17,16,20,14,23],"t"),
  ...forkTail(8,18),ellipse(13,16,4,3,"O"),ellipse(14,17,3,2,"W"),...throat(14,16),...birdHead(17,12),
  line(19,11,26,10,"k",1),px(26,10,"M"),
  poly([12,11,10,7,13,8,15,11],"p"),px(13,9,"W"),
  poly([3,10,4,5,7,7,8,12,6,14],"p"),poly([8,12,5,15,2,13],"P"),circ(6,12,2,"y"),
  ...feet(12,19),px(19,15,"e")
);

// Elefante: colibrí de alas anchas en pleno aleteo, con primarias individuales y vientre de jade.
piece("elephant",{w:36,h:32},
  poly([11,17,7,10,1,4,8,7,14,11],"O"),poly([12,16,8,6,11,2,16,8,17,14],"p"),
  poly([21,15,26,7,32,3,29,10,24,17],"t"),poly([22,16,29,12,35,11,30,17,24,19],"P"),
  ...[0,1,2,3].map(i=>line(9+i,12-i,13+i,16,"W",1)),
  ellipse(18,18,6,5,"O"),ellipse(19,19,4,4,"W"),...throat(19,17),
  ...birdHead(22,12),line(24,11,35,8,"k",1),px(35,8,"M"),
  poly([14,20,17,18,22,20,21,26,17,28,14,24],"T"),line(17,24,16,28,"k",1),line(20,24,21,28,"k",1),
  px(19,15,"y"),px(19,16,"p")
);

// Camello: colibrí de cola larga y lomo arqueado, suspendido ante un botón floral.
piece("camel",{w:35,h:32},
  poly([14,20,11,26,6,31,11,30,16,24],"P"),poly([17,21,17,28,19,32,21,27,20,22],"O"),
  ellipse(18,18,6,4,"O"),ellipse(19,19,4,3,"W"),...throat(19,17),poly([15,16,10,12,9,7,14,11,18,13],"t"),line(12,11,10,8,"W",1),
  ...birdHead(22,12),line(24,11,34,8,"k",1),px(34,8,"M"),
  poly([14,12,16,7,19,10,21,5,24,11,22,14],"p"),px(19,8,"y"),
  line(16,21,14,25,"k",1),line(20,21,21,25,"k",1),px(13,26,"k"),px(22,26,"k"),
  ...[0,1,2,3].map(i=>px(3+i,10+i,"p")),circ(4,10,2,"y"),px(4,10,"W")
);

// Cañón: flor tubular enorme y un colibrí suspendido de lado, con pico dentro del néctar.
piece("cannon",{w:34,h:31},
  line(3,28,13,20,"t",2),poly([5,27,2,22,7,23,11,23],"T"),
  poly([18,20,22,14,29,13,27,20,22,24],"p"),poly([19,20,22,16,26,16,25,20,22,22],"P"),
  ...[0,1,2,3].map(i=>line(21+i,17,24+i,21,"W",1)),circ(23,19,2,"y"),px(23,19,"Y"),
  ellipse(12,19,5,4,"O"),ellipse(13,20,3,3,"W"),...throat(14,18),...wingSpread(10,16,.8),
  ...birdHead(16,14),line(18,13,26,15,"k",1),px(26,15,"M"),
  poly([9,13,7,9,10,10,12,13],"t"),line(8,11,6,10,"W",1),
  ...feet(11,22),px(13,16,"e")
);
