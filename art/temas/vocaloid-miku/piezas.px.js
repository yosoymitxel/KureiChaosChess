// Vocaloid · Hatsune Miku: idol digital y maquinaria de escenario; siluetas legibles antes que adornos.
pal({
  k:"#08282e",
  w:"#e4fffa",W:"#b8f4e9",o:"#79ded4",O:"#36bcb7",b:"#147f83",
  s:"#f4c7bd",S:"#bf817f",g:"#f5ffff",G:"#a8c6cc",
  c:"#56e9f0",C:"#218caa",p:"#ff79cd",P:"#aa3e91",
  y:"#eaff81",Y:"#9ccc42",m:"#7eaeb8",M:"#355e6b",X:"#1b3548",
  r:"#ffb7e4",R:"#8b3e80",t:"#344f70",T:"#1c304d",e:"#e3a8e9",E:"#734f99"
});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const piece=(n,o,...d)=>sprite(n,{...o,outline:"k"},...d);
const face=(x,y)=>[
  rect(x-4,y-3,8,7,"s"),rect(x+2,y-2,2,5,"S"),
  rect(x-3,y-1,2,2,"k"),rect(x+1,y-1,2,2,"k"),
  px(x-3,y-1,"c"),px(x+1,y-1,"c"),hline(x-2,y+2,5,"P"),px(x,y+2,"p")
];
const twinTails=(x,y)=>[
  poly([x-4,y,x-8,y+2,x-10,y+9,x-8,y+15,x-5,y+12,x-5,y+6,x-2,y+4],"O"),
  poly([x+4,y,x+8,y+2,x+10,y+9,x+8,y+15,x+5,y+12,x+5,y+6,x+2,y+4],"o"),
  line(x-8,y+4,x-7,y+10,"W",1),line(x+8,y+4,x+7,y+10,"W",1),
  rect(x-6,y+1,3,2,"M"),rect(x+3,y+1,3,2,"M"),px(x-5,y+2,"p"),px(x+4,y+2,"p")
];

// Peón: cantante novata con minifalda plisada, micrófono y las dos coletas largas en movimiento.
piece("pawn",{w:25,h:31},
  ...twinTails(12,8),rect(8,14,9,9,"O"),rect(9,15,7,6,"w"),rect(9,20,7,2,"p"),...([10,13,16].map(x=>vline(x,20,3,"P"))),
  poly([7,14,9,12,16,12,18,15],"c"),rect(9,14,6,2,"W"),...face(12,8),
  rect(8,23,4,4,"M"),rect(14,23,4,4,"M"),rect(7,27,6,2,"X"),rect(14,27,6,2,"X"),
  line(19,14,21,10,"M",2),circ(22,8,2,"g"),px(22,8,"p"),line(19,14,21,12,"s",1),
  rect(7,16,2,5,"p"),px(8,18,"y"),px(16,18,"y"),rect(10,12,5,1,"g")
);

// Torre: cabina de altavoz de gira con rejilla, medidores LED, asa superior y esquinas metálicas.
piece("rook",{w:29,h:32},
  rect(5,9,19,20,"X"),rect(7,11,15,16,"t"),rect(8,12,13,14,"k"),
  rect(10,14,9,6,"M"),rect(11,15,7,4,"X"),circ(14,17,3,"M"),circ(14,17,2,"X"),circ(14,17,1,"c"),
  rect(9,21,11,4,"M"),...[10,13,16,19].map(x=>vline(x,22,2,"c")),hline(9,26,11,"m"),
  rect(8,4,3,5,"m"),rect(18,4,3,5,"m"),rect(8,3,13,2,"W"),hline(9,3,11,"c"),
  rect(3,12,2,13,"M"),rect(24,12,2,13,"M"),...[14,20].map(y=>[px(4,y,"c"),px(25,y,"p")]).flat(),
  rect(9,29,4,2,"M"),rect(17,29,4,2,"M"),hline(8,30,13,"k"),
  ...([10,13,16,19].map(x=>px(x,7,"y"))),px(14,7,"p")
);

// Caballo: bailarina suspendida en un giro, con una pierna elevada y una coleta que dibuja una curva.
piece("knight",{w:35,h:33},
  poly([20,6,27,8,32,13,29,15,26,11,23,12],"O"),poly([20,8,26,9,29,13,27,14,23,11],"W"),
  line(11,17,6,11,"O",3),poly([3,9,5,5,9,7,12,11,9,13,5,12],"O"),line(4,9,7,10,"W",1),
  rect(12,13,7,7,"O"),rect(13,14,5,5,"w"),poly([11,19,19,19,24,24,17,28,10,24],"p"),poly([16,19,19,19,24,24,20,25],"P"),
  ...face(15,9),rect(11,6,8,2,"O"),hline(12,6,6,"c"),rect(10,7,2,3,"M"),rect(18,7,2,3,"M"),
  rect(12,26,4,4,"M"),rect(17,27,6,2,"M"),rect(8,29,7,2,"X"),rect(20,29,7,2,"X"),
  line(19,14,24,10,"s",2),line(24,10,27,7,"M",1),circ(28,6,2,"g"),px(28,6,"c"),
  px(11,18,"y"),px(18,20,"y"),line(10,22,6,24,"c",2)
);

// Alfil: DJ de abrigo largo, audífonos de copa, visor angular y consola portátil con faders.
piece("bishop",{w:28,h:34},
  poly([5,14,8,11,19,11,23,15,25,31,3,31],"t"),poly([8,15,17,15,20,30,6,30],"O"),poly([14,15,19,15,22,30,16,30],"b"),
  ...face(13,8),rect(8,4,11,3,"O"),hline(8,4,11,"W"),rect(7,5,2,6,"M"),rect(18,5,2,6,"M"),px(7,7,"p"),px(19,7,"c"),
  poly([8,2,12,0,17,1,21,4,18,6,10,6],"M"),hline(10,2,8,"c"),px(13,3,"p"),px(16,3,"p"),
  rect(8,17,11,7,"X"),rect(9,18,9,5,"M"),...[10,12,14,16].map(x=>rect(x,19,1,3,x%2?"c":"p")),hline(9,23,9,"k"),
  rect(5,18,3,7,"m"),rect(6,19,1,4,"c"),rect(19,17,3,6,"m"),px(20,19,"y"),
  vline(12,25,4,"W"),vline(15,25,4,"W"),rect(7,31,5,2,"X"),rect(16,31,5,2,"X")
);

// Reina: estrella pop, vestido de capas asimétricas, lazo holográfico y micrófono cromado.
piece("queen",{w:32,h:35},
  poly([3,7,7,2,12,6,16,0,20,5,26,2,29,8,26,17,29,29,22,33,4,31,7,20,3,14],"O"),
  poly([5,17,24,17,29,31,3,31],"p"),poly([8,18,21,18,24,30,6,30],"w"),poly([17,18,24,18,29,31,20,31],"P"),
  ...([9,13,17,21].map(x=>line(x,21,x-1,29,"c",1))),...([10,14,18,22].map(x=>px(x,25,"g"))),
  ...twinTails(16,6),...face(15,9),
  rect(9,2,13,3,"O"),hline(10,2,11,"W"),rect(12,4,7,3,"c"),rect(14,5,3,2,"k"),px(15,5,"p"),
  poly([10,14,15,12,20,14,18,18,12,18],"c"),px(14,15,"y"),px(15,15,"y"),
  rect(7,18,3,7,"M"),rect(21,17,3,7,"M"),line(23,17,26,12,"M",2),circ(27,10,2,"g"),px(27,10,"p"),
  rect(8,31,5,2,"M"),rect(19,32,5,2,"M"),px(15,28,"y"),px(17,28,"y")
);

// Rey: productor virtual con corona de barras de ecualizador, chaqueta blindada y cetro-láser.
piece("king",{w:32,h:37},
  line(27,7,28,33,"M",2),line(28,7,29,33,"c",1),circ(28,5,3,"c"),circ(28,5,1,"p"),
  poly([4,15,9,12,22,12,28,16,30,33,2,33],"t"),poly([8,16,21,16,24,32,6,32],"O"),
  poly([10,15,15,18,19,15,23,19,20,26,12,26],"X"),rect(12,18,7,6,"M"),rect(13,19,5,4,"c"),px(15,20,"p"),
  ...([10,13,16,19,22].map((x,i)=>rect(x,26,2,4+(i%2)*2,i%2?"c":"p"))),
  rect(9,7,13,6,"g"),rect(10,9,11,3,"s"),rect(11,9,2,2,"k"),rect(17,9,2,2,"k"),px(11,9,"c"),px(17,9,"c"),hline(12,11,6,"P"),
  poly([7,7,9,3,12,5,16,1,20,5,23,2,25,7],"y"),...([9,13,17,21].map(x=>rect(x,3,x===17?2:1,x===17?5:3,"c"))),
  rect(5,33,23,2,"X"),hline(6,33,21,"M"),px(9,30,"y"),px(23,30,"y")
);

// Guardia: roadie blindado con hombreras, guantes luminosos y escudo de monitor.
piece("guard",{w:28,h:32},
  rect(7,23,5,5,"X"),rect(16,23,5,5,"X"),rect(6,27,7,3,"M"),rect(15,27,7,3,"M"),
  poly([5,14,8,11,19,11,23,15,21,24,7,24],"t"),poly([10,14,17,14,18,22,9,22],"O"),rect(12,15,5,7,"X"),
  rect(8,5,11,7,"g"),rect(9,6,9,5,"k"),rect(10,7,2,3,"c"),rect(14,7,2,3,"p"),rect(18,7,1,3,"c"),hline(10,10,8,"M"),
  poly([5,12,8,9,11,12,10,16,6,16],"M"),poly([17,12,20,9,23,12,22,16,18,16],"M"),px(8,12,"c"),px(20,12,"p"),
  rect(2,15,5,7,"m"),rect(3,16,3,5,"k"),...[17,19].map(y=>hline(3,y,3,"c")),rect(3,22,4,2,"M"),
  line(22,14,25,10,"M",2),circ(26,9,2,"c"),px(26,9,"y"),rect(8,24,3,3,"X"),rect(18,24,3,3,"X"),px(13,18,"y")
);

// Consejero: holograma de operador con manto transparente y teclado flotante bajo las manos.
piece("advisor",{w:26,h:31},
  poly([5,14,9,11,17,11,21,15,23,25,19,29,6,29,2,25],"O"),
  poly([8,15,17,15,19,26,7,26],"w"),poly([14,15,17,15,19,26,14,26],"W"),
  rect(8,4,10,8,"s"),rect(10,6,2,2,"k"),rect(15,6,2,2,"k"),px(10,6,"c"),px(15,6,"c"),hline(10,9,7,"P"),
  poly([6,4,8,0,17,0,20,4,18,5,8,5],"c"),hline(8,3,10,"W"),px(12,1,"p"),px(15,2,"p"),
  rect(2,17,4,7,"c"),rect(3,18,2,5,"k"),...[18,20,22].map(y=>hline(3,y,2,"p")),
  poly([15,17,20,15,24,18,22,21,17,21],"W"),line(21,17,24,11,"M",1),circ(24,10,2,"g"),px(24,10,"p"),
  rect(5,25,15,3,"X"),rect(6,26,13,1,"M"),...[7,9,11,13,15,17].map((x,i)=>rect(x,25,1,2,i%2?"p":"c")),px(7,29,"y"),px(19,29,"y")
);

// Elefante: mascota mecha de escenario, gato-dron con orejas de antena y cuerpo en placas.
piece("elephant",{w:34,h:30},
  rect(8,21,5,5,"M"),rect(21,21,5,5,"M"),rect(7,25,7,3,"X"),rect(20,25,7,3,"X"),
  ellipse(17,17,12,9,"O"),ellipse(15,15,8,6,"W"),rect(9,15,16,7,"t"),rect(11,16,12,5,"X"),
  poly([7,9,5,3,12,7,14,11],"O"),poly([20,11,22,7,29,3,27,10],"O"),poly([8,7,7,5,11,8],"p"),poly([24,8,27,5,26,8],"p"),
  rect(11,12,5,4,"g"),rect(18,12,5,4,"g"),rect(12,13,3,2,"k"),rect(19,13,3,2,"k"),px(12,13,"c"),px(19,13,"c"),
  rect(14,17,7,3,"k"),hline(15,18,5,"p"),...([15,18,21].map(x=>px(x,20,"g"))),
  rect(13,4,2,4,"M"),rect(19,4,2,4,"M"),circ(14,3,2,"c"),circ(20,3,2,"p"),
  rect(13,22,4,4,"M"),rect(18,22,4,4,"M"),px(15,23,"y"),px(19,23,"y")
);

// Camello: keytarista de cuello largo, antena de fibra y teclas de sintetizador en el lomo.
piece("camel",{w:34,h:31},
  poly([7,24,8,16,13,11,18,14,22,13,27,18,30,25],"O"),poly([10,17,15,13,19,17,24,16,27,22,25,25,11,25],"b"),
  ...([12,15,18,21,24].map(x=>line(x,17,x+1,22,"W",1))),rect(10,25,4,3,"M"),rect(23,25,4,3,"M"),
  line(12,15,9,8,"O",3),ellipse(7,7,4,3,"w"),rect(4,5,7,2,"W"),px(6,6,"k"),px(8,6,"k"),px(5,7,"p"),
  rect(5,2,2,3,"M"),rect(8,2,2,3,"M"),circ(6,1,2,"c"),circ(9,1,2,"p"),
  poly([12,10,16,9,19,12,17,17,12,16],"t"),rect(12,11,6,2,"c"),px(14,12,"p"),
  poly([17,17,27,15,31,20,29,23,19,24],"X"),rect(19,17,9,2,"M"),...[20,22,24,26].map(x=>rect(x,18,1,3,"g")),px(21,18,"p"),px(25,18,"c"),
  line(20,13,24,9,"s",2),circ(25,8,2,"g"),px(25,8,"p")
);

// Cañón: subwoofer de graves con boca acústica, rejilla en capas y válvulas de neón.
piece("cannon",{w:33,h:30},
  poly([4,18,8,14,25,14,29,19,26,24,7,24],"N"),rect(8,22,4,4,"M"),rect(21,22,4,4,"M"),circ(9,26,4,"X"),circ(9,26,2,"M"),circ(23,26,4,"X"),circ(23,26,2,"M"),
  poly([4,9,8,6,25,7,29,12,27,20,7,20],"t"),rect(7,9,18,9,"X"),rect(9,10,14,7,"M"),rect(10,11,12,5,"k"),
  circ(16,13,5,"M"),circ(16,13,4,"X"),circ(16,13,2,"c"),circ(16,13,1,"p"),
  ...([11,14,17,20].map(x=>vline(x,16,1,"g"))),rect(8,7,3,2,"y"),rect(22,7,3,2,"y"),
  line(26,9,31,6,"c",1),line(27,13,32,13,"p",1),line(26,17,31,20,"c",1),px(31,5,"c"),px(32,13,"p"),px(31,21,"c"),
  rect(10,20,12,2,"M"),hline(11,21,10,"c"),px(13,22,"y"),px(18,22,"y")
);
