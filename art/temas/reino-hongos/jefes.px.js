const cap = (cx,cy,rx,ry,top="r",mid="R",shine="p") => [
  ellipse(cx,cy,rx,ry,top), ellipse(cx,cy+2,Math.max(1,rx-2),Math.max(1,ry-2),mid),
  hline(cx-rx+3,cy-1,Math.max(1,rx-3),shine), px(cx-rx+2,cy,shine)
];
pal({
 k:"#18231d",
 w:"#f7efce", W:"#e2d59d", o:"#c1b878", O:"#8d9c5c", b:"#526b45",
 r:"#d95777", R:"#9d315a", p:"#f6b7c9", P:"#b65b89",
 g:"#8ee6c0", G:"#3f9f7d", v:"#bd83e8", V:"#75469c",
 y:"#f6d66b", Y:"#c49b3b", z:"#b5d8ef", Z:"#6599b8",
 m:"#4a6d4c", M:"#2a4535", t:"#24362c", T:"#304637"
});
ramps("bOoWw","RrPp","Vv","Gg","Yy","Zz");

// Jefe titán: coloso-seta con sombrero ancho y raíces.
sprite("boss-titan", { w: 46, h: 44, outline: "k" },
  // sombrero ancho
  ellipse(23,10,20,8,"r"), ellipse(23,12,18,6,"R"), hline(6,9,34,"p"), px(8,8,"y"), px(38,8,"y"),
  px(12,7,"w"), px(34,7,"w"), px(23,5,"z"),
  // tallo ancho
  rect(15,17,16,16,"w"), vline(30,18,15,"O"), hline(16,32,14,"O"),
  px(18,20,"k"), px(27,20,"k"), px(19,19,"y"), px(28,19,"y"), hline(19,24,8,"R"),
  // raíces
  ...[16,20,24,28,32].flatMap(x=>[line(x,33,x-2,42,"g",2), px(x-3,41,"G")]),
  // manchas
  px(19,26,"g"), px(26,28,"g"), px(21,30,"y"), px(25,30,"y"),
  hline(14,33,18,"k")
);

// Jefe carnero: seta con cuernos de rama y caparazón.
sprite("boss-ram", { w: 42, h: 40, outline: "k" },
  poly([4,12,0,7,2,2,6,0,9,4,10,11],"g"), poly([32,11,33,4,36,0,40,2,42,7,38,12],"g"),
  ...cap2(21,8,12,6,"r","R","p"),
  rect(11,14,20,13,"w"), vline(30,15,12,"O"), hline(12,26,18,"O"),
  px(15,17,"k"), px(26,17,"k"), px(16,16,"y"), px(27,16,"y"), hline(16,21,10,"R"),
  rect(9,27,24,8,"b"), ...[29,31,33].map(y=>hline(10,y,22,"O")),
  rect(8,35,10,4,"b"), rect(24,35,10,4,"b"), hline(7,38,12,"k"), hline(23,38,12,"k"),
  rect(19,27,4,7,"r"), px(20,29,"y")
);

// helper local
function cap2(cx,cy,rx,ry,top,mid,shine){ return [
  ellipse(cx,cy,rx,ry,top), ellipse(cx,cy+2,Math.max(1,rx-2),Math.max(1,ry-2),mid),
  hline(cx-rx+3,cy-1,Math.max(1,rx-3),shine), px(cx-rx+2,cy,shine)
]; }

// Jefe hidra: tres setas conectadas por un micelio.
sprite("boss-hydra", { w: 46, h: 42, outline: "k" },
  line(13,30,9,20,"w",5), line(9,20,7,12,"O",5),
  line(23,31,23,19,"w",5), line(23,19,23,11,"O",5),
  line(33,30,37,20,"w",5), line(37,20,39,12,"O",5),
  ...cap(7,10,5,4,"r","R","p"), ...cap(23,9,5,4,"v","V","z"), ...cap(39,10,5,4,"r","R","p"),
  px(5,9,"y"), px(9,9,"y"), px(21,8,"y"), px(25,8,"y"), px(37,9,"y"), px(41,9,"y"),
  poly([8,30,38,30,43,40,3,40],"b"), ellipse(23,32,12,6,"O"),
  rect(19,30,8,7,"r"), px(21,31,"y"), px(23,33,"y"), px(25,31,"y")
);

// Jefe gólem: bloque de micelio con runas.
sprite("boss-golem", { w: 40, h: 44, outline: "k" },
  rect(8,14,24,24,"O"), rect(11,17,18,18,"b"),
  ...[21,26,31].map(y=>hline(11,y,18,"o")),
  rect(6,6,28,10,"g"), rect(10,9,8,3,"k"), rect(22,9,8,3,"k"),
  px(12,10,"r"), px(24,10,"r"), poly([16,13,20,11,23,13,20,15],"k"),
  rect(1,17,7,17,"b"), rect(32,17,7,17,"b"),
  px(4,21,"z"), px(35,21,"z"), rect(13,38,5,5,"b"), rect(22,38,5,5,"b"),
  rect(17,20,7,9,"r"), px(19,22,"y"), px(21,25,"y")
);

// Jefe jinete: seta jinete sobre un tallo largo.
sprite("boss-rider", { w: 36, h: 44, outline: "k" },
  // tallo largo (piernas)
  rect(14,26,8,16,"w"), vline(21,27,15,"O"), hline(15,41,6,"k"),
  // sombrero
  ...cap(18,8,10,5,"r","R","p"),
  px(11,7,"w"), px(25,7,"w"), px(18,5,"z"),
  // cuerpo
  poly([10,13,26,13,28,26,8,26],"b"), rect(12,15,12,8,"O"),
  px(14,17,"k"), px(22,17,"k"), px(15,16,"y"), px(23,16,"y"), hline(14,21,8,"R"),
  // brazos
  rect(6,16,5,10,"b"), rect(25,16,5,10,"b"),
  px(7,19,"r"), px(26,19,"r"),
  // capa
  poly([8,26,28,26,32,40,4,40],"g"), ...[30,33,36].map(y=>hline(6,y,24,"G")),
  rect(16,27,4,10,"r"), px(17,29,"y"), px(19,32,"y")
);

// Jefe muro: muro de setas apiladas.
sprite("boss-wall", { w: 44, h: 34, outline: "k" },
  rect(2,8,40,24,"O"), ...[13,20,27].map(y=>hline(3,y,38,"b")),
  ...[6,16,26,36].map(x=>vline(x,9,23,"g")),
  ...[4,14,24,34].flatMap(x=>cap(x,5,4,3,"r","R","p")),
  px(3,4,"y"), px(13,4,"y"), px(23,4,"y"), px(33,4,"y"),
  rect(16,14,12,12,"b"), rect(18,16,8,8,"k"), px(19,18,"r"), px(24,18,"r"), px(20,21,"y"),
  rect(0,32,44,2,"k")
);

// Jefe devorador: boca de seta gigante.
sprite("boss-devourer", { w: 44, h: 44, outline: "k" },
  poly([8,12,16,5,28,5,36,12,39,28,32,36,12,36,5,28],"b"),
  rect(12,9,20,13,"g"), rect(14,11,16,9,"k"),
  ...[16,20,24,28].map(x=>px(x,11,"w")), ...[16,20,24,28].map(x=>px(x,19,"w")),
  rect(19,13,6,4,"r"), px(21,14,"y"),
  rect(1,15,10,20,"O"), rect(33,15,10,20,"O"),
  line(4,31,1,41,"b",3), line(40,31,43,41,"b",3),
  poly([12,31,32,31,28,42,16,42],"b"), rect(18,33,8,7,"r"),
  px(20,34,"y"), px(24,36,"y")
);

