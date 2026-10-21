// Colosos del panteón: el rey de los muertos, toro de hueso, hidra de ánimas y ataúdes guardianes.
pal({
  k:"#211a1d",w:"#f2e7d5",W:"#d9cbbb",o:"#b7a89b",O:"#83756c",b:"#493d3a",
  g:"#fff5db",G:"#c9bda8",r:"#bd3348",R:"#711c2b",y:"#e8bc4d",Y:"#9c7021",
  n:"#704334",N:"#422a2e",v:"#f08b32",V:"#a94724",e:"#ff5847",s:"#e6b59b",S:"#a96858",
  m:"#aeb0b7",M:"#666773",X:"#383641",p:"#a77c9b",P:"#65445f",c:"#6f9370",C:"#3c5d49"
});
ramps("bOoWw","Rr","Yy","Gg","Nn","Mm","Pp","Cc");
const boss=(name,opts,...items)=>sprite(name,{...opts,outline:"k"},...items.flat(Infinity));
const skull=(x,y)=>[
  rect(x-4,y-3,8,5,"g"),rect(x-3,y+2,6,2,"G"),rect(x-2,y+4,4,1,"g"),
  rect(x-3,y-2,2,2,"k"),rect(x+2,y-2,2,2,"k"),px(x,y-1,"k"),hline(x-2,y+3,5,"k"),
  px(x-2,y+1,"G"),px(x+2,y+1,"G")
];
const flower=(x,y)=>[px(x,y-2,"v"),px(x-2,y-1,"v"),px(x+2,y-1,"v"),px(x-2,y+1,"v"),px(x+2,y+1,"v"),px(x,y+2,"v"),px(x,y,"y"),px(x-1,y,"Y")];

// Titán: monarca del panteón, coraza de costillas, manto deshilachado y corona con relicario.
boss("boss-titan",{w:44,h:43},
  poly([5,15,12,11,21,15,31,11,39,16,42,37,2,37],"R"),
  poly([9,17,20,15,31,17,34,34,7,34],"O"),poly([13,18,21,18,26,34,11,34],"b"),
  ...([21,25,29].map(y=>[line(12,y,18,y+1,"g",1),line(25,y+1,31,y,"G",1)]).flat()),
  rect(15,32,5,7,"N"),rect(25,32,5,7,"N"),rect(13,38,8,3,"b"),rect(24,38,8,3,"b"),
  circ(10,17,5,"m"),circ(10,17,3,"M"),px(9,16,"y"),px(11,18,"y"),
  rect(31,12,4,19,"m"),vline(33,13,17,"M"),poly([28,13,33,5,38,13,35,17],"g"),px(33,8,"y"),
  poly([10,11,15,5,21,9,27,4,34,10,31,16,13,16],"g"),poly([12,8,16,6,21,9,26,6,31,9,29,13,14,13],"W"),
  ...skull(22,11),poly([9,6,11,1,15,5,21,0,26,5,31,1,35,7],"y"),
  ...([11,16,21,26,31].map(x=>px(x,4,"r"))),rect(14,17,16,2,"y"),px(21,18,"r"),
  line(8,20,1,28,"g",3),poly([0,26,5,26,7,32,3,30,0,33],"g"),
  line(36,20,42,27,"g",3),poly([39,27,44,25,44,31,40,34],"g"),
  flower(4,37),flower(39,37)
);

// Ariete: toro de ultratumba con cuernos curvados, costillas descubiertas y arnés de cadenas.
boss("boss-ram",{w:46,h:34},
  line(38,13,43,18,"N",1),line(43,18,41,22,"N",1),px(40,23,"n"),
  rect(30,22,4,7,"N"),rect(36,21,4,8,"n"),rect(30,29,5,2,"b"),rect(36,29,5,2,"b"),
  ellipse(26,18,14,9,"O"),ellipse(24,15,11,6,"W"),ellipse(27,21,12,4,"b"),
  ...([20,24,28,32].map(x=>[line(x,13,x-1,21,"g",1),px(x-1,22,"G")]).flat()),
  hline(18,12,17,"G"),...[20,24,28,32].map(x=>px(x,11,"g")),
  rect(15,21,4,8,"O"),rect(21,22,4,7,"N"),rect(15,28,5,2,"b"),rect(21,28,5,2,"b"),
  // Cráneo al frente, hocico huesudo y cuernos barridos hacia atrás.
  poly([4,8,14,7,19,12,16,22,7,22,2,16],"g"),poly([5,16,17,16,14,24,8,24],"G"),
  rect(5,11,4,3,"k"),rect(12,11,4,3,"k"),px(6,11,"v"),px(13,11,"v"),
  poly([8,16,10,18,12,16,15,18,13,21,9,21],"k"),...[9,11,13].map(x=>px(x,22,"g")),
  line(5,9,1,5,"g",2),line(1,5,2,1,"g",1),px(3,2,"G"),
  line(16,9,20,5,"G",2),line(20,5,19,1,"g",1),px(18,2,"G"),
  poly([14,9,20,7,24,13,21,19,16,17],"R"),rect(17,13,8,3,"y"),px(20,14,"r"),
  ...([17,20,23,26,29].map(x=>px(x,24,"y"))),line(14,24,29,28,"n",1),
  px(4,19,"r"),px(15,18,"r")
);

// Hidra: tres cráneos tallados que brotan de un collar de vertebras, sobre un nido de flores.
boss("boss-hydra",{w:46,h:43},
  poly([7,30,14,25,22,28,29,25,38,30,43,39,3,39],"b"),
  ellipse(23,32,13,6,"O"),ellipse(23,30,8,4,"W"),
  ...([13,18,23,28,33].map(x=>circ(x,31,2,"g"))),
  line(10,30,7,20,"O",5),line(7,20,5,12,"b",4),line(23,30,23,18,"O",5),line(23,18,23,9,"b",4),line(36,30,40,20,"O",5),line(40,20,42,12,"b",4),
  ...skull(5,11),...skull(23,8),...skull(42,11),
  poly([1,8,3,4,7,8,8,12,4,15],"g"),poly([19,5,22,0,26,5,27,10,23,12],"g"),poly([39,8,42,3,45,8,45,12,41,15],"g"),
  px(4,10,"r"),px(6,10,"r"),px(22,7,"r"),px(24,7,"r"),px(41,10,"r"),px(43,10,"r"),
  ...([10,15,20,25,30,35].map(x=>line(x,32,x+2,36,"r",1))),
  flower(12,38),flower(23,39),flower(34,38),
  rect(18,37,10,2,"N"),px(21,37,"y"),px(24,37,"y")
);

// Gólem: ataúd de piedra con tapa antropomorfa, cierres de hierro, costuras y cadenas.
boss("boss-golem",{w:42,h:43},
  poly([7,8,21,2,35,8,38,34,33,40,9,40,4,34],"N"),
  poly([9,11,21,5,33,11,34,33,30,37,12,37,8,33],"n"),
  line(9,12,21,7,"y",1),line(21,7,33,12,"Y",1),
  rect(10,17,22,2,"M"),rect(9,28,24,3,"M"),hline(10,17,21,"m"),hline(10,28,21,"X"),
  rect(13,13,16,15,"O"),rect(15,15,12,10,"b"),...skull(21,18),
  poly([13,12,16,8,21,10,26,8,29,12,27,15,15,15],"g"),hline(15,13,12,"y"),
  ...([12,17,22,27].map(y=>hline(15,y,12,"W"))),...([15,19,23,27].map(x=>px(x,24,"r"))),
  rect(1,17,8,14,"O"),rect(33,17,8,14,"O"),circ(5,21,3,"m"),circ(37,21,3,"m"),px(5,21,"y"),px(37,21,"y"),
  line(11,31,16,35,"m",2),line(16,35,21,31,"m",2),line(21,31,26,35,"m",2),line(26,35,31,31,"m",2),
  rect(12,37,6,4,"b"),rect(24,37,6,4,"b"),hline(12,39,6,"M"),hline(24,39,6,"M"),
  px(19,3,"r"),px(21,2,"r"),px(23,3,"r")
);

// Jinete: charro esquelético, sombrero ancho con greca dorada, caballo de osamenta y lanza ceremonial.
boss("boss-rider",{w:38,h:44},
  poly([4,29,10,23,26,23,34,29,32,37,7,37],"O"),ellipse(20,31,13,6,"b"),
  rect(9,33,4,8,"N"),rect(25,33,4,8,"N"),rect(8,40,6,2,"b"),rect(24,40,7,2,"b"),
  line(31,27,36,31,"g",2),px(36,32,"g"),poly([10,27,13,22,24,22,28,27,25,31,13,31],"W"),
  ...([15,19,23].map(x=>line(x,25,x,32,"g",1))),rect(16,28,7,2,"y"),px(19,29,"r"),
  line(28,6,31,39,"N",2),line(29,6,32,39,"y",1),poly([27,7,30,0,34,7],"m"),px(31,3,"w"),
  poly([7,17,11,7,18,4,25,8,29,19,25,29,8,29],"R"),poly([11,18,24,18,23,31,12,31],"b"),
  ...skull(18,12),rect(13,13,10,3,"g"),px(15,14,"k"),px(20,14,"k"),
  poly([4,6,8,1,17,0,27,2,33,7,29,9,6,9],"n"),hline(7,6,22,"y"),hline(6,8,24,"Y"),
  ...([8,12,16,20,24,28].map(x=>px(x,6,"y"))),px(17,3,"r"),px(20,3,"r"),
  line(11,19,6,24,"g",2),circ(5,25,2,"m"),px(5,24,"y")
);

// Muralla: un mausoleo de tres ataúdes, rejas forjadas, bisagras y calaveras incrustadas en mármol.
boss("boss-wall",{w:48,h:37},
  rect(2,11,44,24,"N"),poly([2,11,7,3,14,9,22,1,29,9,37,3,46,11],"n"),
  rect(5,13,12,19,"O"),rect(18,13,12,19,"b"),rect(31,13,12,19,"O"),
  poly([5,13,11,9,17,13],"W"),poly([18,13,24,9,30,13],"g"),poly([31,13,37,9,43,13],"W"),
  ...([8,21,34].map(x=>[rect(x,17,6,2,"M"),rect(x,22,6,2,"M"),rect(x,27,6,2,"M"),vline(x+3,16,14,"X")]).flat()),
  ...skull(11,17),...skull(24,17),...skull(37,17),
  ...([4,16,29,42].map(x=>[rect(x,11,2,21,"m"),px(x,10,"y"),px(x+1,10,"Y")]).flat()),
  rect(1,32,46,4,"b"),hline(2,32,44,"M"),px(22,31,"y"),px(24,31,"y"),
  ...([8,14,20,26,32,38].map(x=>px(x,29,"r"))),
  flower(4,35),flower(44,35)
);

// Devorador: cráneo monumental abierto como una boca de pozo, colmillos y llamas rojas en el hueco.
boss("boss-devourer",{w:44,h:43},
  poly([8,10,15,4,28,4,36,10,40,25,34,35,27,40,16,40,8,35,3,25],"O"),
  poly([11,10,17,7,27,7,33,11,36,23,31,32,25,35,18,35,12,31,7,23],"g"),
  rect(11,13,22,12,"k"),poly([12,13,17,16,21,13,25,16,31,13,30,23,25,25,20,23,14,25],"R"),
  ...([14,18,22,26,30].map(x=>poly([x,13,x+2,13,x+1,17],"w"))),
  ...([15,19,23,27].map(x=>poly([x,25,x+2,25,x+1,21],"g"))),
  px(18,18,"y"),px(25,18,"y"),px(22,20,"e"),
  line(9,18,2,24,"O",4),line(35,18,42,24,"O",4),poly([1,23,6,22,8,29,4,31,0,28],"b"),poly([38,22,43,23,43,29,39,31,36,28],"b"),
  rect(14,34,5,6,"N"),rect(25,34,5,6,"N"),rect(12,39,8,3,"b"),rect(24,39,8,3,"b"),
  poly([12,5,14,0,18,5,21,1,24,5,29,0,32,6],"y"),px(21,4,"v"),
  flower(7,34),flower(37,34),...([15,20,25,30].map(x=>px(x,29,"g")))
);
