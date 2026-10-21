// Pandas, mapaches y pandas rojos: manchas oculares de panda, antifaz de mapache y cola anillada de panda rojo.
pal({
  k:"#202923",w:"#f5f0e2",W:"#ddd7c3",o:"#b2b5a5",O:"#858d7d",b:"#555e52",
  g:"#fff9ea",G:"#c3c3b2",p:"#d9754c",P:"#99462b",y:"#eac15b",Y:"#997736",
  t:"#6d9c63",T:"#355a3b",e:"#f6d7bd",E:"#b66e48",m:"#b7c9bd",M:"#687e73",
  r:"#c76a3b",R:"#74391f",c:"#91cdb8",C:"#477e68",q:"#6b5448",Q:"#3d302c",
  h:"#252a2b",H:"#3e4544",n:"#a75b32",N:"#71391e"
});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const piece=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const pandaHead=(x,y,s=1)=>[
  ellipse(x,y,6*s,5*s,"w"),ellipse(x-4*s,y-4*s,2*s,2*s,"h"),ellipse(x+4*s,y-4*s,2*s,2*s,"h"),
  ellipse(x-2.5*s,y,2.1*s,2.8*s,"h"),ellipse(x+2.5*s,y,2.1*s,2.8*s,"h"),
  px(x-3*s,y-1*s,"g"),px(x+2*s,y-1*s,"g"),
  ellipse(x,y+2*s,3*s,2*s,"W"),circ(x,y+1*s,1*s,"k"),
  line(x,y+2*s,x-1*s,y+3*s,"k",1),line(x,y+2*s,x+1*s,y+3*s,"k",1),
  px(x-5*s,y,"G"),px(x+5*s,y,"G")
];
const raccoonHead=(x,y,s=1)=>[
  poly([x-5*s,y-1*s,x-6*s,y-6*s,x-2*s,y-4*s,x,y-5*s,x+4*s,y-4*s,x+6*s,y-6*s,x+5*s,y-1*s],"o"),
  ellipse(x,y,5.5*s,4.5*s,"O"),ellipse(x,y+2*s,4*s,2*s,"W"),
  poly([x-5*s,y-1*s,x-2*s,y-2*s,x,y,x+2*s,y-2*s,x+5*s,y-1*s,x+3*s,y+1*s,x-3*s,y+1*s],"h"),
  rect(x-3*s,y-1*s,2*s,2*s,"g"),rect(x+2*s,y-1*s,2*s,2*s,"g"),
  px(x-2*s,y-1*s,"k"),px(x+3*s,y-1*s,"k"),poly([x-1*s,y+1*s,x+1*s,y+1*s,x,y+3*s],"q"),
  line(x-3*s,y+2*s,x-6*s,y+2*s,"g",1),line(x+3*s,y+2*s,x+6*s,y+2*s,"g",1)
];
const redPandaHead=(x,y,s=1)=>[
  ellipse(x,y,5.5*s,4.5*s,"r"),poly([x-5*s,y-1*s,x-6*s,y-6*s,x-2*s,y-4*s,x,y-5*s,x+4*s,y-4*s,x+6*s,y-6*s,x+5*s,y-1*s],"R"),
  poly([x-5*s,y-3*s,x-3*s,y-5*s,x-1*s,y-2*s],"W"),poly([x+3*s,y-4*s,x+5*s,y-5*s,x+5*s,y-2*s],"W"),
  poly([x-5*s,y,x-3*s,y-2*s,x-1*s,y,x-2*s,y+2*s],"W"),poly([x+1*s,y,x+3*s,y-2*s,x+5*s,y,x+2*s,y+2*s],"W"),
  rect(x-3*s,y-1*s,2*s,2*s,"k"),rect(x+2*s,y-1*s,2*s,2*s,"k"),
  px(x-2*s,y-1*s,"g"),px(x+3*s,y-1*s,"g"),px(x,y+2*s,"k"),hline(x-2*s,y+3*s,4*s,"W"),
];
const ringTail=(x,y,scale=1)=>[
  line(x,y,x+3*scale,y-3*scale,"r",3*scale),line(x+3*scale,y-3*scale,x+7*scale,y-3*scale,"R",3*scale),
  line(x+7*scale,y-3*scale,x+9*scale,y+scale,"r",3*scale),line(x+9*scale,y+scale,x+7*scale,y+5*scale,"R",3*scale),
  line(x+7*scale,y+5*scale,x+3*scale,y+5*scale,"r",3*scale),line(x+3*scale,y+5*scale,x+2*scale,y+2*scale,"R",3*scale),
  line(x+2*scale,y+2*scale,x+4*scale,y,"r",3*scale),line(x+4*scale,y,x+6*scale,y+4*scale,"W",2*scale),
  line(x+7*scale,y-2*scale,x+8*scale,y+1*scale,"W",2*scale)
];
const bearPaws=(x,y)=>[rect(x,y,4,3,"h"),hline(x,y+2,4,"k"),px(x+1,y+1,"W"),px(x+3,y+1,"W")];

// Peón: panda sentado, cuerpo blanco y patas negras; las manchas de los ojos son parte de la silueta.
piece("pawn",{w:26,h:31},
  ellipse(12,21,7,6,"w"),ellipse(8,23,4,4,"h"),ellipse(17,23,4,4,"h"),ellipse(12,20,3,4,"W"),
  ...bearPaws(5,26),...bearPaws(16,26),...pandaHead(12,10,.9),
  rect(5,16,14,2,"h"),rect(8,17,8,2,"w"),poly([8,17,12,20,16,17],"h"),
  rect(9,24,6,2,"w"),px(12,25,"y"),px(9,13,"G"),px(15,13,"G")
);

// Torre: panda guarda-bambú junto a troncos cortados y una plataforma tallada.
piece("rook",{w:31,h:34},
  rect(3,26,25,5,"q"),hline(4,26,23,"o"),rect(6,27,3,3,"Q"),rect(22,27,3,3,"Q"),
  rect(8,12,15,14,"t"),rect(10,13,11,12,"T"),...[15,19,23].map(y=>hline(9,y,13,"c")),
  ...[10,14,18,22].map(x=>[line(x,13,x,25,"T",1),px(x,14,"c")]),
  rect(5,7,21,5,"O"),rect(7,5,17,3,"q"),hline(7,5,17,"o"),
  ...pandaHead(15,6,.8),rect(8,12,3,2,"h"),rect(20,12,3,2,"h"),
  line(8,15,5,19,"g",1),line(22,15,25,19,"g",1),px(4,19,"g"),px(26,19,"g")
);

// Caballo: mapache saltando, máscara oscura, cola anillada y cuerpo largo a rayas.
piece("knight",{w:35,h:33},
  ellipse(20,20,9,5,"O"),ellipse(18,18,6,3,"W"),...[14,18,22,26].map(x=>hline(x,20,2,"q")),
  line(14,20,11,25,"O",3),line(11,25,7,25,"q",2),line(25,21,25,27,"O",3),line(25,27,29,28,"q",2),
  ...ringTail(25,16,.6),line(12,17,9,11,"O",3),...raccoonHead(7,10,.8),
  poly([12,14,18,12,24,16,21,20,15,19],"q"),rect(13,15,9,2,"y"),px(16,16,"p"),
  rect(5,9,2,2,"g"),px(6,9,"k")
);

// Alfil: panda rojo con capucha de hojas, mofletes blancos y cola anillada enrollada.
piece("bishop",{w:30,h:35},
  poly([5,16,9,12,20,12,24,17,26,32,3,32],"T"),poly([9,17,17,17,20,31,6,31],"r"),
  ...ringTail(21,26,.55),...redPandaHead(14,9,.8),
  poly([7,7,9,2,13,5,16,1,20,5,23,3,22,8],"t"),hline(9,7,13,"c"),
  rect(9,18,11,4,"R"),hline(10,18,9,"y"),...([11,14,17].map(x=>px(x,19,"g"))),
  rect(9,23,3,6,"R"),rect(16,23,3,6,"R"),px(10,25,"W"),px(17,25,"W"),
  ...flower(4,19),...flower(26,19)
);

// Reina: panda gigante hembra con collar floral, faldón blanco y corona de brotes de bambú.
piece("queen",{w:34,h:36},
  ellipse(17,21,10,8,"w"),ellipse(10,22,4,5,"h"),ellipse(24,22,4,5,"h"),
  ...bearPaws(7,27),...bearPaws(22,27),...pandaHead(17,10,1),
  poly([5,17,12,15,17,18,22,15,29,17,27,28,7,28],"W"),
  poly([8,18,17,21,26,18,25,28,9,28],"w"),...([10,14,18,22].map(x=>line(x,22,x-1,27,"G",1))),
  poly([8,7,10,2,13,5,17,0,21,5,24,2,26,8],"t"),hline(10,7,14,"y"),
  px(17,4,"c"),px(15,5,"c"),px(19,5,"c"),flower(5,19),flower(29,19),
  rect(9,30,5,2,"h"),rect(20,30,5,2,"h")
);

// Rey: mapache mayor con antifaz marcado, cola a bandas y cetro de madera.
piece("king",{w:34,h:38},
  ...ringTail(22,28,.65),ellipse(17,21,10,8,"O"),ellipse(17,20,7,6,"W"),
  ...bearPaws(8,31),...bearPaws(21,31),...raccoonHead(17,11,1),
  poly([5,19,10,17,24,17,29,20,28,32,6,32],"q"),poly([10,20,17,23,24,20,23,31,11,31],"O"),
  ...([22,25,28].map(y=>hline(11,y,12,"W"))),
  poly([7,8,10,2,14,5,18,0,22,5,26,2,28,8],"y"),hline(10,7,15,"Y"),
  line(29,8,30,31,"q",2),circ(29,6,3,"y"),circ(29,6,1,"p"),px(29,6,"W")
);

// Guardia: panda rojo con peto de bambú, guanteletes y escudo con hoja.
piece("guard",{w:31,h:33},
  rect(8,24,5,5,"R"),rect(18,24,5,5,"R"),...bearPaws(7,28),...bearPaws(18,28),
  poly([5,14,8,11,21,11,25,15,23,24,7,24],"t"),poly([10,15,20,15,19,22,10,22],"T"),
  ...redPandaHead(15,8,.85),poly([6,7,8,2,13,5,17,1,22,5,24,8],"r"),hline(9,7,13,"y"),
  poly([1,16,6,13,8,20,6,26,2,24],"R"),poly([2,17,5,16,6,21,4,23],"r"),
  ...[18,21,24].map(y=>hline(2,y,3,"y")),line(25,7,26,30,"M",2),poly([23,7,25,2,28,7,26,10],"m")
);

// Consejero: mapache explorador con capa gris, bolsa de bayas y antifaz ancho.
piece("advisor",{w:28,h:32},
  poly([5,15,9,11,19,11,23,15,25,28,3,28],"q"),poly([9,16,18,16,20,27,7,27],"O"),
  ...raccoonHead(14,8,.8),poly([7,6,8,1,12,4,16,1,20,6],"O"),hline(8,6,12,"y"),
  rect(2,17,6,8,"q"),rect(3,18,4,6,"Q"),...([19,22,25].map(y=>hline(3,y,4,"o"))),
  line(19,17,24,13,"o",2),rect(22,11,5,5,"R"),...[23,25].map(x=>px(x,12,"p")),
  rect(7,27,5,2,"Q"),rect(16,27,5,2,"Q"),px(10,26,"y"),px(18,26,"y")
);

// Elefante: panda gigante forzudo, espalda ancha, hombros negros y bambú mordido.
piece("elephant",{w:36,h:31},
  ellipse(18,19,13,8,"w"),ellipse(10,22,5,5,"h"),ellipse(26,22,5,5,"h"),
  rect(8,25,5,3,"h"),rect(23,25,5,3,"h"),...pandaHead(10,11,.8),
  poly([15,13,23,13,28,21,24,25,14,23],"w"),rect(17,15,9,5,"h"),rect(18,16,7,3,"w"),
  line(27,21,31,24,"w",2),px(31,24,"g"),rect(14,25,5,3,"h"),rect(20,25,5,3,"h"),
  rect(2,16,3,9,"t"),rect(1,15,5,2,"T"),...([18,21,24].map(y=>px(3,y,"c")))
);

// Camello: panda rojo con cuerpo bajo, patas oscuras y cola esponjosa en anillos claros.
piece("camel",{w:36,h:32},
  ...ringTail(24,20,.8),ellipse(19,21,9,5,"r"),ellipse(17,19,7,3,"R"),
  rect(12,23,4,5,"R"),rect(22,23,4,5,"R"),rect(10,27,6,2,"h"),rect(21,27,6,2,"h"),
  line(13,17,10,11,"r",3),...redPandaHead(9,10,.8),
  poly([6,7,7,2,11,5,14,2,15,8],"r"),poly([6,7,8,4,10,7],"W"),px(9,8,"k"),px(12,8,"k"),
  line(16,18,22,15,"e",2),line(22,15,26,16,"e",2),px(27,16,"k"),
  ...([14,17,20].map(x=>line(x,19,x+1,23,"W",1)))
);

// Cañón: panda asomado en un tronco hueco, con orejas negras, patas delanteras y bambú decorativo.
piece("cannon",{w:34,h:31},
  poly([3,17,8,14,26,14,31,18,29,25,6,25,2,21],"q"),poly([7,17,26,17,27,22,7,22],"Q"),
  rect(9,23,4,4,"M"),rect(22,23,4,4,"M"),circ(10,27,4,"h"),circ(10,27,2,"M"),circ(24,27,4,"h"),circ(24,27,2,"M"),
  rect(4,13,26,4,"t"),hline(5,14,24,"c"),rect(5,17,24,2,"T"),
  ...pandaHead(17,10,1),ellipse(14,17,3,2,"h"),ellipse(20,17,3,2,"h"),rect(14,17,6,2,"w"),
  rect(2,10,3,10,"t"),rect(1,9,5,2,"T"),...([12,15,18].map(y=>px(3,y,"c"))),
  line(25,9,29,5,"t",2),poly([28,5,30,1,32,5,30,8],"c"),px(30,4,"y")
);

// Pequeña flor de bambú: trazos angulares de cinco pétalos, un uso repetible en el set.
function flower(x,y){return [px(x,y-2,"c"),px(x-2,y-1,"c"),px(x+2,y-1,"c"),px(x-1,y+1,"c"),px(x+1,y+1,"c"),px(x,y,"y")];}
