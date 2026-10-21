// Vocaloid · Hatsune Miku: coletas turquesa, auriculares magenta, corbata aqua y uniforme gris/negro.
pal({
  k:"#08282e",w:"#e4fffa",W:"#b8f4e9",o:"#79ded4",O:"#36bcb7",b:"#147f83",
  s:"#f4c7bd",S:"#bf817f",g:"#f5ffff",G:"#a8c6cc",
  c:"#56e9f0",C:"#218caa",p:"#ff79cd",P:"#aa3e91",
  y:"#eaff81",Y:"#9ccc42",m:"#7eaeb8",M:"#355e6b",X:"#1b3548",
  r:"#ffb7e4",R:"#8b3e80",t:"#344f70",T:"#1c304d",e:"#e3a8e9",E:"#734f99"
});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const piece=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const face=(x,y)=>[
  rect(x-4,y-3,8,7,"s"),rect(x+2,y-2,2,5,"S"),
  rect(x-3,y-1,2,2,"k"),rect(x+1,y-1,2,2,"k"),px(x-3,y-1,"c"),px(x+1,y-1,"c"),
  px(x-2,y,"g"),px(x+2,y,"g"),hline(x-2,y+2,5,"P"),px(x,y+2,"p"),
  poly([x-5,y-3,x-5,y-7,x-2,y-5,x,y-8,x+2,y-5,x+5,y-7,x+5,y-2,x+2,y-3,x,y-1,x-2,y-3],"O"),
  line(x-3,y-5,x-2,y-4,"W",1),line(x+2,y-5,x+3,y-4,"W",1),
  rect(x-7,y-3,2,5,"M"),rect(x+5,y-3,2,5,"M"),rect(x-7,y-1,2,2,"p"),rect(x+5,y-1,2,2,"p")
];
const twinTails=(x,y)=>[
  poly([x-4,y,x-8,y+2,x-10,y+9,x-9,y+16,x-6,y+21,x-4,y+17,x-5,y+11,x-3,y+5],"O"),
  poly([x+4,y,x+8,y+2,x+10,y+9,x+9,y+16,x+6,y+21,x+4,y+17,x+5,y+11,x+3,y+5],"o"),
  line(x-8,y+4,x-7,y+11,"W",1),line(x-7,y+12,x-6,y+17,"c",1),
  line(x+8,y+4,x+7,y+11,"W",1),line(x+7,y+12,x+6,y+17,"c",1),
  rect(x-6,y+1,3,2,"M"),rect(x+3,y+1,3,2,"M"),
  px(x-5,y+2,"p"),px(x+4,y+2,"p")
];
const mikuUniform=(x,y)=>[
  // hombros, cuello blanco, chaleco y corbata aqua
  poly([x-6,y,x-4,y-2,x+4,y-2,x+6,y,x+4,y+7,x-4,y+7],"M"),
  rect(x-3,y-2,6,3,"g"),poly([x-2,y,x+2,y,x+1,y+4,x,y+6,x-1,y+4],"c"),
  poly([x-7,y+4,x+7,y+4,x+8,y+12,x-8,y+12],"X"),
  rect(x-7,y+4,3,9,"t"),rect(x+4,y+4,3,9,"t"),rect(x-7,y+6,3,2,"c"),rect(x+4,y+6,3,2,"c"),
  hline(x-5,y+5,10,"M"),hline(x-5,y+10,10,"k"),
  // falda plisada con ribete teal
  poly([x-8,y+12,x+8,y+12,x+10,y+19,x-10,y+19],"k"),
  ...[x-6,x-2,x+2,x+6].map(pxX=>line(pxX,y+13,pxX+1,y+18,"M",1)),
  hline(x-9,y+19,18,"c")
];
const mikuBoots=(x,y)=>[
  rect(x-6,y,4,5,"t"),rect(x+2,y,4,5,"t"),rect(x-7,y+4,6,2,"k"),rect(x+1,y+4,6,2,"k"),
  hline(x-7,y+5,6,"c"),hline(x+1,y+5,6,"c")
];
const mic=(x,y)=>[line(x,y,x+2,y-4,"M",2),circ(x+3,y-5,2,"g"),px(x+3,y-5,"p"),line(x-1,y+1,x+2,y-2,"s",1)];

// Peón: Miku en su uniforme icónico, dos coletas larguísimas, auriculares rojos y corbata turquesa.
piece("pawn",{w:30,h:35},
  ...twinTails(14,8),...mikuUniform(14,16),...face(14,8),...mikuBoots(14,29),
  rect(8,16,3,7,"M"),rect(17,16,3,7,"M"),hline(8,18,3,"c"),hline(17,18,3,"p"),
  ...mic(22,19),px(14,23,"y"),px(14,24,"c"),rect(10,31,3,2,"X"),rect(16,31,3,2,"X")
);

// Torre: stack de amplificadores de gira con la silueta de Miku en la pantalla frontal.
piece("rook",{w:30,h:34},
  rect(3,10,24,20,"X"),rect(5,12,20,16,"t"),rect(6,13,18,14,"k"),
  circ(15,20,7,"M"),circ(15,20,5,"X"),circ(15,20,3,"c"),circ(15,20,1,"p"),
  rect(7,4,16,6,"M"),rect(9,5,12,4,"X"),...[10,13,16,19].map(x=>px(x,6,"c")),
  hline(5,11,20,"c"),hline(5,28,20,"k"),rect(6,30,5,2,"M"),rect(19,30,5,2,"M"),
  // coletas y cara estilizadas dentro del display
  poly([10,16,8,17,7,23,10,22,11,19],"O"),poly([20,16,22,17,23,23,20,22,19,19],"O"),
  rect(11,16,8,5,"s"),rect(11,16,8,2,"O"),rect(12,18,2,1,"c"),rect(16,18,2,1,"c"),
  poly([12,21,18,21,20,25,10,25],"t"),rect(14,21,2,4,"p")
);

// Caballo: Miku en pose de concierto, una coleta al viento y micrófono arriba.
piece("knight",{w:35,h:35},
  ...twinTails(13,8),...face(13,8),
  poly([6,16,11,13,18,14,22,19,17,25,9,22],"O"),
  poly([10,15,18,15,21,22,12,23],"X"),poly([12,16,16,16,18,22,12,22],"M"),
  poly([11,16,14,14,18,16,16,19,12,19],"c"),line(14,17,16,19,"P",1),
  poly([10,23,19,23,23,28,9,28],"k"),...[11,14,17,20].map(x=>line(x,24,x+1,27,"M",1)),
  rect(10,28,4,3,"t"),rect(17,28,4,3,"t"),hline(9,31,6,"c"),hline(16,31,6,"c"),
  line(19,15,25,7,"s",2),circ(26,6,3,"g"),circ(26,6,1,"p"),line(24,7,29,10,"M",1),
  poly([7,14,3,10,2,5,7,9,10,12],"O"),line(6,9,3,6,"W",1)
);

// Alfil: Miku DJ con visor, controladora en el torso y faldón angular.
piece("bishop",{w:30,h:35},
  ...twinTails(13,8),...face(13,8),
  poly([6,16,10,13,18,13,23,16,25,31,3,31],"t"),poly([10,16,17,16,20,30,7,30],"X"),
  rect(7,15,13,2,"M"),rect(8,17,12,8,"X"),rect(9,18,10,6,"k"),
  ...[10,12,14,16,18].map((x,i)=>rect(x,19,1,3,i%2?"p":"c")),
  hline(9,24,10,"M"),px(12,22,"y"),px(16,22,"y"),rect(9,26,4,4,"t"),rect(15,26,4,4,"t"),
  hline(9,30,5,"c"),hline(15,30,5,"c"),poly([12,13,14,12,17,15,14,16],"c")
);

// Reina: Miku estrella pop, vestido de escenario por capas, cinta de cristal y peana de luz.
piece("queen",{w:34,h:36},
  ...twinTails(16,8),...face(16,8),
  poly([5,16,10,13,21,13,27,17,30,31,3,31],"O"),
  poly([7,17,25,17,27,30,5,30],"p"),poly([10,18,22,18,23,29,9,29],"M"),
  ...[10,13,16,19,22].map(x=>line(x,20,x-1,28,"c",1)),hline(8,29,19,"c"),
  rect(11,14,10,3,"g"),poly([13,15,16,14,19,15,17,18,15,18],"c"),px(16,16,"y"),
  poly([9,4,11,0,15,4,18,0,22,4,24,1,26,6],"c"),hline(11,5,13,"M"),
  ...[12,16,20,24].map(x=>px(x,3,"p")),
  line(24,18,28,12,"M",2),circ(29,10,2,"g"),px(29,10,"p"),
  rect(9,31,5,2,"X"),rect(19,31,5,2,"X"),hline(8,34,17,"c")
);

// Rey: Miku de concierto final, corona-ecualizador, hombreras y cetro láser.
piece("king",{w:34,h:38},
  ...twinTails(15,8),...face(15,8),
  poly([4,16,9,13,21,13,28,17,30,32,2,32],"t"),poly([8,17,22,17,24,31,6,31],"X"),
  poly([10,18,15,21,20,18,22,28,9,28],"M"),rect(13,21,5,4,"c"),rect(14,22,3,2,"p"),
  ...[10,13,16,19,22].map((x,i)=>rect(x,26,2,4+(i%2),"M")),
  poly([7,8,9,2,13,5,16,0,19,5,23,2,25,8],"y"),hline(9,7,14,"Y"),
  ...[10,14,18,22].map(x=>px(x,4,"c")),
  line(28,7,29,33,"M",2),line(29,7,30,33,"c",1),circ(29,5,3,"p"),circ(29,5,1,"g"),
  rect(7,32,20,3,"X"),hline(8,32,18,"c")
);

// Guardia: traje de seguridad de escenario, hombreras, visor digital y escudo de luz.
piece("guard",{w:31,h:33},
  ...twinTails(14,8),...face(14,8),
  poly([5,16,9,13,20,13,25,16,23,26,7,26],"t"),
  poly([10,16,18,16,20,24,9,24],"X"),rect(12,17,5,6,"M"),hline(12,18,5,"c"),px(14,20,"p"),
  poly([1,17,6,14,8,22,6,27,2,25],"M"),poly([2,18,5,17,6,22,4,24],"c"),
  line(24,8,26,30,"M",2),poly([23,7,25,2,28,7,26,11],"g"),px(25,6,"p"),
  rect(8,26,5,4,"t"),rect(17,26,5,4,"t"),hline(8,30,5,"c"),hline(17,30,5,"c")
);

// Consejero: mini-Miku con manga suelta, teclado portátil y pequeñas estrellas de interfaz.
piece("advisor",{w:28,h:32},
  ...twinTails(13,8),...face(13,8),
  poly([6,16,10,13,17,13,22,16,24,27,3,27],"O"),poly([10,17,17,17,19,26,8,26],"X"),
  rect(6,17,4,8,"M"),rect(18,17,4,8,"M"),hline(6,18,4,"c"),hline(18,18,4,"p"),
  rect(6,26,16,3,"M"),rect(7,27,14,1,"k"),...[8,10,12,14,16,18].map((x,i)=>px(x,27,i%2?"p":"c")),
  px(4,12,"y"),px(24,11,"y"),px(22,14,"p"),px(4,15,"c"),hline(9,30,8,"c")
);

// Elefante: mascota robótica con antenas gemelas, cara de Miku en pantalla y patas articuladas.
piece("elephant",{w:35,h:31},
  rect(6,20,23,7,"X"),rect(8,18,19,7,"t"),rect(10,19,15,5,"k"),
  rect(11,12,13,9,"M"),rect(12,13,11,7,"g"),rect(13,15,3,2,"k"),rect(19,15,3,2,"k"),px(14,15,"c"),px(20,15,"c"),hline(15,18,5,"p"),
  rect(8,7,3,6,"M"),rect(24,7,3,6,"M"),rect(7,5,5,3,"c"),rect(23,5,5,3,"p"),circ(9,4,2,"g"),circ(25,4,2,"g"),
  poly([10,21,17,23,24,21,23,25,11,25],"O"),hline(12,22,10,"c"),
  rect(9,27,5,3,"X"),rect(21,27,5,3,"X"),hline(9,30,5,"c"),hline(21,30,5,"c"),
  ...[13,17,21].map(x=>px(x,9,"p"))
);

// Camello: Miku con keytar diagonal, cable enrollado y coleta al viento.
piece("camel",{w:35,h:33},
  ...twinTails(13,8),...face(13,8),
  poly([7,16,11,13,18,14,22,18,18,23,9,22],"O"),
  rect(10,16,8,7,"X"),rect(11,17,6,5,"M"),...[12,14,16].map(x=>vline(x,17,4,"g")),
  poly([17,21,28,18,31,21,28,25,18,26],"t"),rect(19,21,8,2,"M"),
  ...[20,22,24,26].map(x=>rect(x,22,1,3,"g")),px(22,22,"p"),px(26,22,"c"),
  line(8,21,5,26,"M",2),line(5,26,8,29,"M",2),circ(8,29,2,"p"),
  rect(9,27,4,3,"t"),rect(16,27,4,3,"t"),hline(9,30,4,"c"),hline(16,30,4,"c")
);

// Cañón: subwoofer de bajos con cono acústico, rejilla LED y pequeña silueta twin-tail en el display.
piece("cannon",{w:34,h:31},
  poly([4,18,8,14,26,14,30,19,27,24,7,24],"X"),rect(8,22,4,4,"M"),rect(22,22,4,4,"M"),
  circ(10,26,4,"X"),circ(10,26,2,"M"),circ(24,26,4,"X"),circ(24,26,2,"M"),
  rect(5,8,24,10,"t"),rect(7,10,20,6,"k"),circ(16,13,5,"M"),circ(16,13,4,"X"),circ(16,13,2,"c"),circ(16,13,1,"p"),
  poly([12,11,10,10,9,14,12,14],"O"),poly([20,11,22,10,23,14,20,14],"O"),rect(14,10,4,4,"g"),px(15,11,"c"),px(17,11,"c"),
  hline(6,17,22,"M"),...[8,12,16,20,24].map(x=>px(x,17,"p")),line(26,8,32,5,"c",1),line(27,12,33,12,"p",1),line(26,16,32,19,"c",1)
);
