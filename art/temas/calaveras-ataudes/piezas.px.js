// Calaveras y Ataúdes: calacas ornamentadas, terciopelo, madera tallada y flores de cempasúchil.
pal({
  k:"#211a1d",
  w:"#f2e7d5", W:"#d9cbbb", o:"#b7a89b", O:"#83756c", b:"#493d3a",
  g:"#fff5db", G:"#c9bda8",
  r:"#bd3348", R:"#711c2b", y:"#e8bc4d", Y:"#9c7021",
  n:"#704334", N:"#422a2e", v:"#f08b32", V:"#a94724",
  s:"#e6b59b", S:"#a96858", m:"#aeb0b7", M:"#666773", X:"#383641",
  p:"#a77c9b", P:"#65445f", c:"#6f9370", C:"#3c5d49"
});
ramps("bOoWw","Rr","Yy","Gg","Nn","Mm","Pp","Cc");
const piece=(name,opts,...items)=>sprite(name,{...opts,outline:"k"},...items);
const skull=(x,y)=>[
  ellipse(x,y,5,4,"g"),ellipse(x,y+1,4,3,"G"),rect(x-3,y+1,6,3,"g"),
  poly([x-4,y-1,x-3,y-4,x-1,y-2,x,y-4,x+2,y-2,x+4,y-4,x+4,y],"w"),
  rect(x-3,y-1,2,3,"k"),rect(x+2,y-1,2,3,"k"),px(x-2,y-1,"y"),px(x+3,y-1,"y"),
  poly([x-1,y+1,x+1,y+1,x,y+3],"k"),hline(x-2,y+3,5,"k"),
  ...[x-2,x,x+2].map((tx)=>px(tx,y+4,"g")),
  px(x-1,y-4,"r"),px(x,y-5,"y"),px(x+1,y-4,"r")
];
const flower=(x,y)=>[
  px(x,y-2,"v"),px(x-2,y-1,"v"),px(x+2,y-1,"v"),px(x-2,y+1,"v"),px(x+2,y+1,"v"),
  px(x,y+2,"v"),px(x,y,"y"),px(x-1,y,"Y"),px(x+1,y,"Y")
];
const bones=(x,y)=>[line(x,y,x+4,y+4,"g",1),circ(x,y,1,"g"),circ(x+4,y+4,1,"g")];

// Peón: calaca de barro con mandíbula tallada, ojos de carbón y vela encendida en un nicho.
piece("pawn",{w:23,h:29},
  rect(10,1,3,5,"N"),px(9,2,"n"),line(12,3,16,1,"n",1),px(16,2,"n"),
  ellipse(11,11,8,7,"W"),ellipse(9,10,4,5,"w"),ellipse(14,12,3,5,"O"),
  line(6,6,8,4,"g",1),line(8,4,10,5,"g",1),px(6,8,"G"),
  poly([5,10,8,8,9,12],"k"),poly([13,12,15,8,18,10],"k"),px(7,10,"y"),px(15,10,"y"),
  rect(7,14,9,2,"k"),...([8,11,14].map(x=>px(x,14,"g"))),
  rect(6,17,11,6,"O"),poly([7,17,15,17,17,24,5,24],"b"),vline(8,18,5,"W"),vline(14,18,5,"O"),
  rect(8,24,3,3,"n"),rect(13,24,3,3,"n"),rect(7,27,5,2,"N"),rect(13,27,5,2,"N"),
  flower(3,19),flower(20,19),px(10,20,"r"),px(12,20,"r")
);

// Torre: ataúd vertical de nogal, tapa a dos aguas, herrajes, remaches y ventanita de hueso.
piece("rook",{w:27,h:32},
  poly([13,1,24,8,23,27,19,31,7,31,3,27,2,8],"N"),
  poly([13,3,21,9,20,26,17,28,8,28,6,26,5,9],"n"),
  poly([13,3,13,28,8,28,6,26,5,9],"O"),line(5,9,13,4,"y",1),line(13,4,21,9,"Y",1),
  rect(4,11,18,2,"M"),hline(5,11,16,"m"),rect(5,24,17,2,"M"),hline(6,24,15,"m"),
  poly([9,13,17,13,19,21,7,21],"b"),rect(10,14,6,5,"k"),...skull(13,16),
  rect(11,22,4,3,"y"),vline(12,22,3,"Y"),px(13,23,"r"),
  ...([5,21].flatMap(x=>[px(x,15,"y"),px(x,20,"Y")])),
  rect(2,28,23,3,"N"),hline(3,28,21,"n"),px(5,29,"y"),px(21,29,"y")
);

// Caballo: calaca ecuestre de perfil, cuello de esqueleto, crin en llamas y silla de terciopelo.
piece("knight",{w:34,h:31},
  line(27,17,31,23,"b",2),line(31,22,30,26,"b",1),px(29,26,"b"),
  rect(25,21,3,7,"N"),rect(29,20,3,8,"n"),rect(25,27,4,2,"k"),rect(29,27,4,2,"k"),
  ellipse(20,18,10,6,"O"),ellipse(19,16,8,4,"o"),ellipse(21,21,9,3,"b"),
  rect(12,22,3,6,"n"),rect(17,22,3,6,"N"),rect(11,27,4,2,"k"),rect(17,27,4,2,"k"),
  poly([7,16,9,10,14,7,17,10,15,18],"O"),poly([3,10,8,7,12,9,12,15,6,17,2,14],"g"),
  poly([3,9,4,5,7,8,9,5,10,10],"W"),px(5,12,"k"),px(8,12,"k"),px(4,13,"y"),px(9,13,"y"),
  line(11,10,16,18,"g",2),px(12,9,"g"),px(14,11,"G"),
  rect(14,14,10,3,"r"),hline(14,14,10,"y"),rect(15,17,8,2,"R"),circ(18,16,2,"y"),px(18,16,"r"),
  rect(15,7,6,7,"O"),rect(18,7,3,7,"b"),poly([13,8,15,4,19,5,22,3,24,8],"b"),
  rect(16,4,5,3,"g"),rect(17,5,3,2,"k"),px(18,5,"r"),px(20,5,"r"),
  line(22,8,25,4,"g",2),circ(26,3,3,"v"),px(25,2,"y"),px(27,4,"y")
);

// Alfil: monje del osario con mitra tallada, collar de cuentas y relicario de latón.
piece("bishop",{w:27,h:33},
  poly([5,16,9,13,17,13,22,16,25,30,2,30],"b"),poly([8,16,15,15,19,29,6,29],"O"),
  poly([7,7,10,1,17,1,21,7,19,14,8,14],"w"),poly([10,4,14,2,18,5,18,10,10,10],"W"),
  rect(10,6,9,3,"g"),rect(11,7,2,2,"k"),rect(16,7,2,2,"k"),px(12,9,"r"),px(16,9,"r"),
  poly([6,5,11,0,15,3,20,0,23,6,20,8,9,8],"N"),hline(8,7,13,"y"),px(14,4,"r"),
  rect(9,13,10,4,"n"),hline(9,13,10,"y"),...([10,13,16].map(x=>px(x,14,"g"))),
  vline(13,17,10,"W"),vline(16,18,9,"O"),px(14,20,"r"),px(14,21,"y"),
  rect(5,30,18,2,"N"),px(6,28,"y"),px(21,28,"y"),flower(3,18),flower(23,18)
);

// Reina: Catrina de vestido bordado, mantilla de encaje, corona de cempasúchil y abanico de hueso.
piece("queen",{w:31,h:35},
  poly([3,8,7,3,13,6,17,1,22,6,28,4,27,15,24,20,29,31,2,31,7,20,3,15],"P"),
  poly([5,16,24,16,29,31,2,31],"R"),poly([7,17,22,17,24,29,5,29],"w"),poly([15,17,22,17,24,29,17,29],"W"),
  ...([7,11,15,19,23].map(x=>vline(x,21,7,"O"))),...([8,12,16,20,24].map(x=>px(x,25,"y"))),
  rect(10,13,10,4,"s"),rect(17,13,3,4,"S"),px(12,14,"k"),px(17,14,"k"),px(11,16,"r"),hline(12,16,4,"r"),
  rect(8,8,13,5,"w"),poly([7,8,10,4,13,6,16,3,19,6,22,4,23,9],"W"),
  rect(9,10,4,3,"k"),rect(16,10,4,3,"k"),px(10,10,"y"),px(17,10,"y"),
  ...([8,12,16,20].flatMap(x=>[px(x,7,"r"),px(x,8,"y")])),
  poly([7,8,9,5,13,4,16,6,20,4,23,8,22,12,8,12],"P"),
  ...([8,12,16,20,24].map(x=>line(x,12,x-1,15,"w",1))),
  line(7,16,1,13,"g",2),poly([0,12,4,11,7,14,5,18,1,17],"g"),px(2,14,"r"),px(4,15,"y"),
  flower(4,19),flower(27,19),rect(9,31,13,3,"N"),px(11,32,"y"),px(20,32,"y")
);

// Rey: calavera real con corona de plata vieja, capa de terciopelo y cetro rematado en rubí.
piece("king",{w:32,h:37},
  line(26,8,27,32,"y",2),vline(28,9,23,"Y"),circ(27,5,4,"y"),circ(27,5,2,"r"),px(27,5,"g"),
  poly([3,14,9,12,22,12,28,15,30,33,1,33],"R"),poly([7,15,22,15,26,32,5,32],"O"),poly([12,16,20,16,22,31,11,31],"b"),
  ...([17,21,25,29].map(y=>hline(8,y,14,"r"))),...([9,13,17,21].map(x=>px(x,27,"y"))),
  rect(9,7,14,7,"g"),rect(10,10,12,3,"G"),rect(11,8,3,3,"k"),rect(18,8,3,3,"k"),
  px(12,9,"e"),px(19,9,"e"),px(15,10,"k"),hline(12,12,8,"k"),...([12,15,18].map(x=>vline(x,12,2,"k"))),
  poly([7,7,8,2,12,5,16,0,20,5,24,2,25,8],"y"),hline(8,7,16,"Y"),...([9,13,17,21].map(x=>px(x,4,"r"))),
  rect(4,32,24,3,"N"),hline(5,32,22,"y"),px(7,33,"r"),px(25,33,"r")
);

// Guardia: soldado calaca con morrión, hombreras de hueso, lanza y escudo con rosetón.
piece("guard",{w:28,h:32},
  rect(7,23,5,5,"N"),rect(16,23,5,5,"N"),rect(6,27,7,3,"b"),rect(15,27,7,3,"b"),
  poly([5,14,8,11,19,11,23,15,22,24,6,24],"O"),poly([9,14,17,14,18,22,8,22],"b"),
  rect(7,14,4,7,"m"),rect(17,14,4,7,"M"),...([15,18,21].map(y=>hline(7,y,4,"m"))),...([15,18,21].map(y=>hline(17,y,4,"X"))),
  rect(8,4,11,8,"g"),rect(10,6,3,3,"k"),rect(15,6,3,3,"k"),px(11,7,"r"),px(16,7,"r"),hline(11,10,6,"k"),...([12,14,16].map(x=>px(x,10,"G"))),
  poly([6,6,8,2,12,4,15,1,19,4,22,2,22,7],"m"),hline(8,5,13,"M"),px(14,3,"y"),
  line(23,8,24,29,"m",2),poly([21,10,24,6,27,11,24,14],"g"),
  poly([1,14,6,12,7,22,3,25,0,22],"R"),poly([2,15,5,14,5,21,3,23],"r"),flower(3,18),rect(1,24,6,2,"N"),
  hline(8,23,11,"y"),px(13,23,"r")
);

// Consejero: escriba de huesos con pergamino enrollado, pluma y rosario de cuentas rojas.
piece("advisor",{w:25,h:30},
  poly([4,15,8,11,17,11,21,15,23,28,2,28],"O"),poly([9,14,15,14,18,27,7,27],"b"),
  rect(7,4,11,8,"g"),rect(8,5,9,6,"W"),rect(9,6,2,2,"k"),rect(14,6,2,2,"k"),px(10,6,"y"),px(15,6,"y"),hline(10,10,5,"k"),
  poly([5,3,7,0,18,0,20,3,18,5,7,5],"w"),hline(7,1,11,"y"),px(11,2,"r"),px(15,2,"r"),
  rect(3,15,6,9,"w"),rect(4,16,4,7,"W"),hline(5,17,2,"O"),hline(5,20,2,"O"),hline(5,22,2,"O"),
  line(17,16,24,4,"N",2),poly([21,4,24,0,24,7],"r"),px(23,2,"y"),
  line(10,18,13,21,"y",1),px(13,22,"r"),px(14,23,"y"),px(14,25,"r"),
  rect(6,27,5,2,"N"),rect(14,27,5,2,"N"),px(7,26,"y"),px(17,26,"y")
);

// Elefante: elefante óseo de desfile con peto ceremonial, orejas de abanico y colmillos tallados.
piece("elephant",{w:34,h:30},
  rect(7,22,5,5,"N"),rect(21,22,5,5,"N"),rect(6,26,7,2,"b"),rect(20,26,8,2,"b"),
  ellipse(17,16,12,9,"O"),ellipse(15,14,9,6,"w"),ellipse(19,17,8,6,"b"),
  poly([6,8,2,5,3,14,8,17,12,13],"W"),poly([23,9,29,5,29,14,24,17,21,13],"O"),
  ellipse(14,10,7,6,"g"),rect(9,9,11,4,"W"),rect(10,10,3,2,"k"),rect(16,10,3,2,"k"),px(11,10,"y"),px(17,10,"y"),hline(12,13,6,"k"),
  poly([21,14,25,14,27,19,24,23,21,21],"G"),poly([22,17,25,17,25,20],"g"),line(25,18,29,16,"g",2),
  rect(9,16,15,6,"r"),rect(10,17,13,4,"R"),...([11,15,19,23].map(x=>px(x,18,"y"))),px(17,20,"g"),
  rect(11,23,4,2,"y"),rect(17,23,4,2,"y"),flower(17,6)
);

// Camello: guardián del mausoleo de perfil, joroba de placas, vendas y una corona de espinas.
piece("camel",{w:34,h:30},
  poly([5,23,7,15,12,12,17,15,22,13,27,17,30,24],"O"),poly([9,16,13,13,17,16,20,15,25,19,26,24,10,24],"b"),
  ...([12,15,18,21,24].map(x=>line(x,16,x+1,20,"W",1))),
  rect(10,24,4,4,"N"),rect(23,24,4,4,"N"),rect(9,27,6,2,"b"),rect(22,27,6,2,"b"),
  line(11,15,8,8,"O",4),poly([3,8,5,4,9,5,12,9,9,13,4,12],"g"),poly([4,7,7,6,9,9,6,10],"G"),
  rect(5,8,2,2,"k"),px(5,8,"y"),px(9,10,"k"),line(6,12,10,13,"k",1),
  poly([8,5,11,1,15,4,18,1,22,6,19,9,11,9],"r"),hline(10,7,10,"y"),px(16,5,"g"),
  rect(13,10,12,3,"O"),rect(14,11,10,2,"R"),px(17,11,"y"),px(18,11,"y"),
  line(25,17,30,11,"b",2),line(30,11,32,13,"b",1),px(32,14,"b"),px(22,16,"y")
);

// Cañón: cañón funerario de bronce sobre cureña, cargado con una calavera de azúcar.
piece("cannon",{w:33,h:30},
  poly([4,19,9,15,26,15,29,20,26,24,8,24],"N"),rect(9,23,4,4,"n"),rect(20,23,4,4,"n"),circ(8,26,4,"M"),circ(8,26,2,"m"),circ(24,26,4,"M"),circ(24,26,2,"m"),
  poly([4,10,7,7,25,8,28,12,25,20,7,20,3,16],"O"),poly([7,10,24,10,24,18,7,18],"n"),
  rect(5,9,19,2,"y"),rect(8,11,13,2,"r"),rect(10,13,9,3,"R"),rect(7,16,18,2,"N"),
  circ(25,13,5,"M"),circ(25,13,3,"k"),circ(25,13,2,"m"),px(26,12,"g"),
  ...skull(15,13),line(3,11,0,8,"y",2),px(1,7,"y"),px(1,8,"r"),px(13,21,"y"),px(17,21,"y"),px(21,21,"y")
);
