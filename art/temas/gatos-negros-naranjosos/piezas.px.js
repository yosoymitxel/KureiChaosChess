// Gatos negros y naranjosos: cada figura debe leerse como felino antes que como accesorio.
pal({
  k:"#171923",w:"#fff0d2",W:"#e8d8b9",o:"#c7a37a",O:"#8b6547",b:"#4d392e",
  h:"#171923",H:"#323440",X:"#4b4d5d",r:"#e77927",R:"#a64218",c:"#f8d8a4",C:"#b48b5e",
  p:"#e7a0a0",P:"#a95664",y:"#f7c84e",Y:"#b96a22",e:"#c8f365",E:"#56872b",
  m:"#bfc6d0",M:"#747e8d",n:"#775039",N:"#432c24",g:"#fff9eb",G:"#cdb793",
  t:"#8b6eb2",T:"#50406c",q:"#c4d1c4",Q:"#758b7e"
});
ramps("bOoWw","Rr","Yy","Gg","Mm","Ee","Tt","Cc","Pp");
const piece=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const catHead=(x,y,coat="h",shade="H",eye="e",muzzle="g")=>[
  poly([x-5,y-1,x-6,y-7,x-2,y-4,x,y-5,x+4,y-4,x+6,y-7,x+5,y-1],coat),
  poly([x-5,y-3,x-5,y-6,x-3,y-4], "p"),poly([x+4,y-4,x+5,y-6,x+5,y-2],"p"),
  ellipse(x,y,5,4,coat),ellipse(x-2,y+2,3,2,muzzle),ellipse(x+2,y+2,3,2,muzzle),
  rect(x-3,y-1,2,2,eye),rect(x+2,y-1,2,2,eye),px(x-2,y-1,"k"),px(x+3,y-1,"k"),
  poly([x-1,y+1,x+1,y+1,x,y+3],"p"),line(x,y+3,x-2,y+4,"k",1),line(x,y+3,x+2,y+4,"k",1),
  line(x-3,y+2,x-7,y+1,"g",1),line(x-3,y+3,x-7,y+4,"g",1),
  line(x+3,y+2,x+7,y+1,"g",1),line(x+3,y+3,x+7,y+4,"g",1)
];
const tail=(x,y,coat="h")=>[
  line(x,y,x+3,y-3,coat,2),line(x+3,y-3,x+3,y-7,coat,2),
  line(x+3,y-7,x+6,y-10,coat,2),px(x+6,y-10,"g")
];
const paws=(x,y,col="h")=>[rect(x,y,4,3,col),hline(x,y+2,4,"k"),px(x+1,y+1,"g"),px(x+3,y+1,"g")];
const tabby=(x,y)=>[line(x,y,x-2,y+3,"R",1),line(x+3,y-1,x+1,y+3,"R",1),line(x+6,y,x+4,y+3,"R",1)];

// Peón: cachorro sentado; pecho claro, patas recogidas, cola erguida y ojos verdes.
piece("pawn",{w:24,h:30},
  ...tail(15,24,"h"),ellipse(11,21,6,6,"h"),ellipse(10,20,3,4,"g"),
  ...paws(6,24,"H"),...paws(13,24,"H"),...catHead(11,10,"h","H","e","g"),
  rect(6,16,10,2,"g"),line(7,17,9,21,"W",1),line(16,17,14,21,"W",1),
  line(8,19,15,19,"r",1),circ(12,20,2,"y"),px(12,20,"Y"),px(8,12,"c"),px(14,12,"c"),
  rect(8,26,3,2,"h"),rect(13,26,3,2,"h")
);

// Torre: rascador alto con poste de sisal, plataforma acolchada y gato vigilando desde arriba.
piece("rook",{w:30,h:34},
  rect(3,26,24,5,"n"),rect(5,27,20,3,"N"),hline(4,26,22,"c"),hline(6,29,18,"Y"),
  rect(10,12,9,14,"t"),rect(11,13,7,12,"O"),...[14,17,20,23].map(y=>hline(10,y,9,"C")),
  ...[14,17,20,23].map(y=>px(12,y,"y")),
  rect(5,8,20,4,"H"),rect(7,6,16,3,"h"),hline(7,6,16,"M"),
  ...catHead(15,5,"h","H","e","g"),rect(7,12,3,2,"h"),rect(21,12,3,2,"h"),
  line(9,15,6,19,"g",1),line(21,15,24,19,"g",1),px(5,19,"g"),px(25,19,"g"),
  rect(4,22,5,4,"M"),rect(21,22,5,4,"M"),circ(6,24,1,"y"),circ(23,24,1,"y")
);

// Caballo: atigrado naranja en salto, lomo largo, patas recogidas y cola curvada.
piece("knight",{w:35,h:33},
  ...tail(26,17,"r"),ellipse(20,19,9,5,"r"),ellipse(18,17,7,3,"c"),ellipse(21,21,7,2,"R"),...tabby(14,15),
  line(15,20,11,25,"r",3),line(11,25,7,25,"R",2),line(25,21,24,27,"r",3),line(24,27,28,28,"R",2),
  line(12,15,9,10,"r",3),...catHead(7,10,"r","R","e","c"),
  rect(13,14,8,3,"M"),rect(14,15,6,1,"y"),px(16,14,"p"),
  rect(16,8,7,6,"H"),poly([15,8,16,4,20,6,23,4,25,9],"h"),
  px(18,7,"e"),px(21,7,"e"),line(22,9,27,4,"r",2),px(27,3,"y")
);

// Alfil: gato bibliotecario de orejas puntiagudas, gafas, manto violeta y llave antigua.
piece("bishop",{w:28,h:35},
  poly([5,15,8,11,19,11,23,15,25,32,2,32],"t"),poly([9,16,17,16,20,31,6,31],"H"),poly([15,16,17,16,20,31,15,31],"h"),
  ...catHead(13,8,"h","H","e","g"),circ(10,9,3,"m"),circ(17,9,3,"m"),circ(10,9,2,"k"),circ(17,9,2,"k"),
  px(10,9,"e"),px(17,9,"e"),line(13,9,14,9,"y",1),
  poly([6,14,13,12,21,15,18,18,9,18],"r"),px(13,15,"y"),px(15,15,"y"),
  rect(9,19,3,9,"O"),rect(15,19,3,9,"b"),...[20,23,26].map(y=>px(11,y,"y")),
  line(18,18,23,23,"y",1),circ(24,24,2,"y"),px(24,23,"r"),rect(5,32,18,2,"N")
);

// Reina: gata persa de manto largo, collar de perlas, mechones laterales y tiara de cempasúchil.
piece("queen",{w:33,h:36},
  poly([4,12,7,5,11,7,16,2,21,7,26,5,29,12,27,18,30,32,3,32],"h"),
  poly([6,17,24,17,30,32,2,32],"r"),poly([9,18,21,18,24,30,6,30],"c"),poly([16,19,21,18,24,30,18,30],"R"),
  ...[8,12,16,20,24].map(x=>line(x,20,x-1,29,"W",1)),...[8,12,16,20,24].map(x=>px(x,26,"y")),
  ...catHead(16,10,"r","R","e","c"),poly([8,8,9,4,13,7,17,4,21,7,24,4,25,9],"h"),hline(10,8,13,"r"),
  poly([8,5,10,1,13,5,16,0,19,5,22,1,25,6],"y"),hline(10,6,13,"Y"),px(16,3,"p"),
  line(7,18,4,22,"H",2),line(25,18,28,22,"h",2),circ(16,19,2,"y"),px(16,19,"p"),
  rect(7,32,5,2,"N"),rect(20,32,5,2,"N"),px(11,31,"y"),px(21,31,"y")
);

// Rey: gato naranja robusto, con melena tabby, corona y pechera heráldica.
piece("king",{w:33,h:38},
  poly([4,12,5,7,9,4,13,6,17,2,21,6,26,4,29,10,27,18,30,34,2,34],"O"),
  ellipse(16,14,11,9,"r"),ellipse(15,12,8,6,"c"),...tabby(10,8),...catHead(16,11,"r","R","e","c"),
  poly([7,7,10,1,14,5,17,0,20,5,24,1,26,7],"y"),rect(8,6,17,2,"Y"),...[10,14,18,22].map(x=>px(x,4,"r")),
  poly([5,18,27,18,30,33,3,33],"H"),poly([10,19,22,19,24,32,8,32],"r"),
  rect(12,21,8,7,"M"),rect(13,22,6,5,"X"),poly([13,22,16,20,19,22,18,26,14,26],"y"),px(16,23,"p"),
  hline(10,28,12,"Y"),rect(7,34,19,2,"N"),hline(8,34,17,"y")
);

// Guardia: gato tuxedo con peto articulado, escudo y lanza.
piece("guard",{w:30,h:33},
  rect(7,24,5,5,"h"),rect(17,24,5,5,"h"),...paws(6,28,"N"),...paws(16,28,"N"),
  poly([5,14,8,11,20,11,24,15,22,24,7,24],"M"),poly([10,15,17,15,18,22,9,22],"H"),
  ...catHead(14,8,"h","H","e","g"),poly([6,12,9,9,12,12,11,16,7,16],"m"),poly([17,12,20,9,23,12,22,16,18,16],"m"),
  px(9,12,"y"),px(20,12,"y"),poly([1,16,5,13,7,20,6,25,2,23],"t"),poly([2,17,4,16,5,21,3,22],"O"),
  ...[18,21].map(y=>hline(2,y,3,"y")),line(24,8,25,30,"M",2),poly([22,8,24,3,27,8,25,11],"m"),
  rect(9,18,11,2,"y"),circ(14,19,2,"p"),px(14,18,"Y")
);

// Consejero: siamés de hocico oscuro, patas finas y capa de erudito.
piece("advisor",{w:26,h:31},
  poly([5,14,9,11,17,11,21,15,23,25,19,29,6,29,2,25],"O"),
  poly([8,15,17,15,19,26,7,26],"w"),poly([14,15,17,15,19,26,14,26],"W"),
  ...catHead(13,8,"c","C","y","w"),poly([8,7,9,2,12,6],"c"),poly([15,6,18,2,19,8],"c"),rect(10,11,6,2,"C"),
  poly([6,4,8,0,17,0,20,4,18,5,8,5],"t"),hline(8,3,10,"p"),px(12,1,"y"),px(15,2,"y"),
  rect(2,17,4,7,"c"),rect(3,18,2,5,"k"),...[18,20,22].map(y=>hline(3,y,2,"p")),
  poly([15,17,20,15,24,18,22,21,17,21],"W"),line(21,17,24,11,"M",1),circ(24,10,2,"g"),px(24,10,"p"),
  rect(5,25,15,3,"X"),rect(6,26,13,1,"M"),...[7,9,11,13,15,17].map((x,i)=>rect(x,25,1,2,i%2?"p":"c"))
);

// Elefante: maine coon robusto, orejas con pinceles, melena y cola frondosa.
piece("elephant",{w:35,h:31},
  line(25,21,30,17,"H",3),line(30,17,32,11,"H",3),line(32,11,29,8,"h",2),px(28,7,"g"),
  ellipse(18,19,11,7,"h"),ellipse(17,17,9,5,"H"),poly([11,16,14,13,17,17,20,13,24,17,23,22,13,22],"g"),
  ...paws(9,23,"H"),...paws(21,23,"H"),
  ...catHead(10,11,"h","H","y","g"),poly([4,8,5,1,9,6],"h"),poly([11,6,15,1,16,8],"H"),
  px(6,4,"p"),px(13,4,"p"),line(7,15,4,18,"g",1),line(13,15,16,18,"g",1),
  rect(7,18,12,2,"r"),hline(8,18,10,"y"),circ(13,19,2,"y"),px(13,19,"p")
);

// Camello: gato oriental estilizado, lomo largo, patas largas y cola en arco.
piece("camel",{w:35,h:31},
  line(28,18,31,12,"h",2),line(31,12,29,7,"h",2),line(29,7,32,4,"h",2),
  ellipse(20,20,9,4,"c"),ellipse(19,18,7,3,"w"),line(14,20,12,27,"c",2),line(23,20,24,27,"c",2),
  line(12,27,9,28,"h",2),line(24,27,27,28,"h",2),line(14,17,12,10,"c",3),
  ...catHead(10,8,"c","C","y","w"),poly([5,6,6,1,10,5],"c"),poly([12,5,16,1,16,7],"c"),
  px(7,4,"p"),px(14,4,"p"),rect(7,16,8,2,"r"),hline(8,16,6,"y"),px(10,17,"p"),
  line(16,16,21,13,"s",2),line(21,13,25,15,"s",2),px(25,15,"g"),px(23,14,"y")
);

// Cañón: gatito metido en un barril; orejas y cara sobresalen claramente de la boca.
piece("cannon",{w:34,h:31},
  poly([4,16,9,13,26,14,30,20,27,25,7,25,3,21],"N"),poly([7,16,11,15,25,16,27,20,24,23,8,23],"n"),
  rect(9,22,4,4,"M"),rect(22,22,4,4,"M"),circ(10,26,4,"X"),circ(10,26,2,"M"),circ(24,26,4,"X"),circ(24,26,2,"M"),
  rect(5,13,23,3,"y"),hline(6,14,21,"Y"),rect(7,17,19,2,"M"),hline(8,17,17,"m"),
  ...catHead(16,10,"h","H","e","g"),poly([10,7,11,2,15,6],"h"),poly([17,6,21,2,22,8],"H"),
  px(12,5,"p"),px(20,5,"p"),line(24,9,29,6,"M",2),circ(30,5,2,"y"),px(30,5,"r")
);
