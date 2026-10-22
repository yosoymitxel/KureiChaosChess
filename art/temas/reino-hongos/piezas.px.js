// Reino de los Hongos: cada pieza tiene silueta propia inspirada en setas y guardianes miceliales.
pal({
 k:"#18231d",
 w:"#f7efce", W:"#e2d59d", o:"#c1b878", O:"#8d9c5c", b:"#526b45", D:"#6c8b57", A:"#e5edbb",
 r:"#d95777", R:"#9d315a", p:"#f6b7c9", P:"#b65b89",
 g:"#8ee6c0", G:"#3f9f7d", v:"#bd83e8", V:"#75469c",
 y:"#f6d66b", Y:"#c49b3b", z:"#b5d8ef", Z:"#6599b8",
 m:"#4a6d4c", M:"#2a4535", t:"#24362c", T:"#304637"
});
ramps("bOoWw","RrPp","Vv","Gg","Yy","Zz");

const cap = (cx,cy,rx,ry,top="r",mid="R",shine="p") => [
  ellipse(cx,cy,rx,ry,top), ellipse(cx,cy+2,Math.max(1,rx-2),Math.max(1,ry-2),mid),
  hline(cx-rx+3,cy-1,Math.max(1,rx-3),shine), px(cx-rx+2,cy,shine),
  px(cx+rx-2,cy+2,"k"), px(cx+rx-3,cy+3,"k")
];
const stem = (cx,y,w,h,fill="w",shade="O") => [
  rect(cx-Math.floor(w/2),y,w,h,fill), vline(cx+Math.floor(w/2),y+1,h-1,shade),
  hline(cx-Math.floor(w/2),y+h-1,w,shade)
];
const eyes = (cx,y) => [px(cx-2,y,"k"),px(cx+1,y,"k"),px(cx-2,y-1,"y"),px(cx+1,y-1,"y")];

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Peón: seta pequeña con sombrero rojo y lunares blancos.
piece("pawn", { w: 20, h: 24 },
  ...cap(10, 6, 8, 5, "r", "R", "p"),
  px(4,5,"w"),px(7,4,"w"),px(13,5,"w"),px(15,4,"w"),
  ...stem(10, 10, 6, 8, "w", "O"),
  px(8,12,"k"),px(11,12,"k"),px(9,14,"R"),px(10,14,"R"),
  hline(7,20,6,"g"), px(6,19,"G"), px(13,19,"G")
);

// Torre: torre de seta con almenas y puerta.
piece("rook", { w: 24, h: 28 },
  rect(2,22,20,5,"b"), rect(4,23,16,3,"O"),
  rect(4,8,16,14,"w"), rect(6,10,12,10,"W"),
  ...[10,14,18].map(y=>hline(6,y,12,"O")),
  rect(2,4,5,5,"r"), rect(9,2,6,7,"r"), rect(17,4,5,5,"r"),
  rect(9,12,6,8,"k"), px(10,14,"r"), px(13,14,"r"), px(11,16,"R"),
  hline(1,27,22,"k"), px(4,6,"p"), px(11,4,"p"), px(18,6,"p")
);

// Caballo: seta saltarina con capuchón inclinado y raíces.
piece("knight", { w: 26, h: 28 },
  poly([13,4,20,6,23,12,19,11,17,15,13,10],"r"),
  ellipse(13,11,6,5,"R"), ...stem(13,15,7,7,"w","O"),
  ellipse(13,17,4,3,"W"), px(11,16,"k"), px(15,16,"k"), px(12,15,"y"), px(16,15,"y"),
  hline(10,18,6,"R"),
  line(6,20,3,24,"g",2), line(3,24,1,26,"O",2),
  line(20,20,23,24,"g",2), line(23,24,25,26,"O",2),
  px(2,25,"G"), px(24,25,"G"), hline(8,25,10,"O")
);

// Alfil: seta alta con sombrero cónico y motas.
piece("bishop", { w: 22, h: 30 },
  poly([11,2,16,8,18,16,14,26,8,26,4,16,6,8],"r"),
  poly([11,4,14,9,16,16,13,25,9,25,6,16,8,9],"R"),
  ...[6,10,14,18].map(y=>hline(8,y,6,"p")),
  ...stem(11,26,6,3,"w","O"),
  ellipse(11,28,5,2,"g"), px(9,27,"G"), px(13,27,"G"), px(11,27,"O"),
  px(10,6,"y"), px(12,10,"y"), px(9,14,"y"), px(13,18,"y"),
  px(11,2,"z")
);

// Reina: seta reina con corona de esporas y falda ancha.
piece("queen", { w: 28, h: 32 },
  ...cap(14,7,11,6,"r","R","p"),
  px(6,6,"z"), px(10,5,"z"), px(14,4,"z"), px(18,5,"z"), px(22,6,"z"),
  px(8,7,"y"), px(12,6,"y"), px(16,5,"y"), px(20,6,"y"), px(24,7,"y"),
  ...stem(14,12,8,6,"w","O"),
  poly([6,18,22,18,26,30,2,30],"G"), poly([8,19,20,19,23,29,5,29],"g"),
  ...[21,24,27].map(y=>hline(7,y,14,"O")),
  px(10,20,"r"), px(14,22,"r"), px(18,20,"r"), px(12,25,"y"), px(16,25,"y"),
  hline(4,31,20,"k")
);

// Rey: seta rey con corona grande y trono micelial.
piece("king", { w: 28, h: 34 },
  ...cap(14,7,12,6,"v","V","z"),
  px(6,6,"y"), px(10,5,"y"), px(14,4,"y"), px(18,5,"y"), px(22,6,"y"),
  px(8,7,"r"), px(12,6,"r"), px(16,5,"r"), px(20,6,"r"), px(24,7,"r"),
  ...stem(14,12,9,7,"w","O"),
  poly([5,19,23,19,27,32,1,32],"G"), poly([7,20,21,20,24,31,4,31],"g"),
  ...[22,25,28].map(y=>hline(6,y,16,"O")),
  px(11,23,"r"), px(14,25,"r"), px(17,23,"r"), px(13,28,"y"), px(15,28,"y"),
  hline(3,33,22,"k"), rect(12,1,4,3,"z")
);

// Guardia: seta con escudo de hoja.
piece("guard", { w: 24, h: 28 },
  ...cap(12,6,9,5,"r","R","p"),
  px(6,5,"w"), px(10,4,"w"), px(15,5,"w"),
  ...stem(12,10,7,8,"w","O"),
  px(10,12,"k"), px(13,12,"k"), px(11,14,"R"),
  // escudo
  poly([2,14,7,12,7,24,2,22],"g"), hline(3,16,4,"G"), px(4,18,"y"), px(5,20,"y"),
  rect(16,12,3,14,"O"), hline(16,26,3,"k"),
  hline(8,26,8,"k")
);

// Consejero: seta alta con bastón de espora.
piece("advisor", { w: 23, h: 29, mx: true },
  ...cap(11,6,8,5,"v","V","z"),
  px(6,5,"z"), px(10,4,"z"), px(14,5,"z"),
  ...stem(11,10,6,9,"w","O"),
  px(9,12,"k"), px(12,12,"k"), px(10,14,"R"),
  vline(11,12,7,"O"),
  // bastón
  line(18,8,21,2,"g",1), circ(21,1,2,"g"), px(20,0,"y"), px(21,1,"Y"),
  hline(4,27,15,"k"), px(8,25,"m"), px(13,25,"m")
);

// Elefante: seta grande y ancha con manchas.
piece("elephant", { w: 28, h: 28 },
  ...cap(14,6,12,5,"r","R","p"),
  px(6,5,"w"), px(11,4,"w"), px(17,4,"w"), px(22,5,"w"),
  ...stem(14,10,10,8,"w","O"),
  px(10,12,"k"), px(17,12,"k"), px(12,14,"R"), px(15,14,"R"),
  // manchas
  px(6,16,"g"), px(21,16,"g"), px(8,20,"g"), px(19,20,"g"),
  px(12,18,"y"), px(16,18,"y"),
  hline(5,26,18,"O"), px(7,25,"G"), px(20,25,"G")
);

// Camello: seta alargada y curvada.
piece("camel", { w: 27, h: 29 },
  poly([13,2,19,5,22,11,18,10,16,14,13,9],"r"),
  poly([13,4,17,6,20,11,17,10,15,14,13,9],"R"),
  ...stem(13,13,7,9,"w","O"),
  px(11,15,"k"), px(15,15,"k"), px(12,17,"R"), px(14,17,"R"),
  // cola curva
  line(20,16,24,12,"g",2), line(24,12,26,16,"g",2), px(25,13,"y"),
  // manchas
  px(8,8,"p"), px(17,7,"p"), px(12,19,"z"),
  hline(7,26,13,"O")
);

// Cañón: seta lanzadora con esporas.
piece("cannon", { w: 26, h: 27, mx: true },
  ...cap(13,6,10,5,"r","R","p"),
  px(6,5,"w"), px(10,4,"w"), px(16,5,"w"),
  ...stem(13,10,8,7,"w","O"),
  px(11,12,"k"), px(14,12,"k"), px(12,14,"R"),
  // cañón de esporas
  rect(5,16,16,6,"O"), hline(6,17,14,"w"), hline(6,20,14,"k"),
  px(7,18,"g"), px(10,18,"g"), px(13,18,"g"), px(16,18,"g"),
  px(8,19,"z"), px(11,19,"z"), px(14,19,"z"), px(17,19,"z"),
  hline(8,24,10,"k"), px(12,23,"y"), px(14,23,"y")
);

// Variantes de piedra y mesa de musgo. La mesa es un mosaico 32×32.
sprite("tile-a", { w: 16, h: 16 }, rect(0,0,16,16,"a"), hline(0,0,16,"A"), vline(0,0,16,"A"), px(4,4,"g"), px(11,9,"g"), px(7,12,"g"));
sprite("tile-a2", { w: 16, h: 16 }, rect(0,0,16,16,"a"), hline(0,0,16,"A"), vline(0,0,16,"A"), px(2,2,"r"), px(9,5,"r"), px(13,11,"r"));
sprite("tile-a3", { w: 16, h: 16 }, rect(0,0,16,16,"a"), hline(0,0,16,"A"), vline(0,0,16,"A"), px(6,3,"m"), px(3,10,"m"), px(12,13,"m"));
sprite("tile-b", { w: 16, h: 16 }, rect(0,0,16,16,"d"), hline(0,0,16,"D"), vline(0,0,16,"D"), px(4,4,"g"), px(11,9,"g"), px(7,12,"g"));
sprite("tile-b2", { w: 16, h: 16 }, rect(0,0,16,16,"d"), hline(0,0,16,"D"), vline(0,0,16,"D"), px(2,2,"r"), px(9,5,"r"), px(13,11,"r"));
sprite("tile-b3", { w: 16, h: 16 }, rect(0,0,16,16,"d"), hline(0,0,16,"D"), vline(0,0,16,"D"), px(6,3,"m"), px(3,10,"m"), px(12,13,"m"));
sprite("table", { w: 32, h: 32 }, rect(0,0,32,32,"t"),
 ...[0,8,16,24].flatMap(y => [hline(0,y,32,"T"), vline(0,y,32,"T")]),
 ...[[4,4],[12,10],[20,6],[28,14],[6,20],[14,26],[22,22],[30,28]].flatMap(([x,y]) => [ellipse(x,y,2,2,"g"), px(x-1,y,"G"), px(x+1,y,"G")])
);
const H="#ffffff66",L="#00000040";
const frame=(name,accent)=>sprite(name,{w:12,h:12},
 rect(0,0,12,12,"#24362c"),hline(0,0,12,accent),vline(0,0,12,accent),
 hline(0,11,12,"#18241f"),vline(11,0,12,"#18241f"),
 rect(2,2,8,8,"#24362c"),px(1,1,"#f6d66b"),px(10,10,"#18241f"));
frame("panel","#8eae71");frame("boton","#bd83e8");

sheet("reino-hongos", ["pawn", "rook", "knight", "bishop", "queen", "king", "guard", "advisor", "elephant", "camel", "cannon"], { pad: 2 });
