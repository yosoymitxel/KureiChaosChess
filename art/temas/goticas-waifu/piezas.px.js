// Góticas Waifu: siluetas femeninas alternativas, legibles en tamaño de ficha.
// Ropa y accesorios principales usan la rampa del bando para recolorear los tres ejércitos.
pal({
  k:"#17121c", w:"#f5e6ef", W:"#cbbbcf", s:"#dca9b9", S:"#95687f",
  r:"#a52b50", R:"#5e1934", p:"#8d67bd", P:"#513c79",
  z:"#d4b2d1", Z:"#78617e", e:"#e9d4a6", E:"#9d7b4b",
  b:"#3a2b42", B:"#261d2c", c:"#8ed1c1", C:"#3f8070",
  skin:"#e8b9b4", eye:"#e33f68", silver:"#aeb9ca"
});
ramps("wWsz", "kRr");
const piece=(name,opts,...items)=>{sprite("_"+name,opts,...items);sprite(name,{base:"_"+name,outline:"k"});};

// Peón: chica gótica con flequillo, gargantilla y vestido acampanado.
piece("pawn",{w:22,h:28,mx:true},
  ellipse(11,8,5,5,"skin"),rect(6,5,10,4,"B"),px(6,8,"k"),px(15,8,"k"),
  poly([5,12,17,12,21,26,1,26],"b"),poly([8,13,14,13,16,25,6,25],"r"),
  hline(8,14,6,"w"),px(11,17,"e"),px(11,18,"E"),px(9,12,"p"),px(13,12,"p"),
  hline(2,26,18,"k"),px(8,10,"eye"),px(14,10,"eye")
);
// Torre: waifu de pelo largo, botas y corsé estructurado.
piece("rook",{w:26,h:31,mx:true},
  poly([5,4,9,1,18,2,22,7,20,19,24,27,3,27,7,18],"B"),
  ellipse(13,8,5,6,"skin"),rect(7,4,12,4,"k"),rect(7,8,3,8,"B"),rect(17,8,3,9,"B"),
  poly([7,13,19,13,23,26,3,26],"b"),poly([10,14,16,14,18,24,8,24],"r"),
  vline(13,15,8,"w"),hline(10,17,6,"k"),px(13,19,"e"),px(13,20,"E"),
  rect(3,26,7,4,"B"),rect(16,26,7,4,"B"),hline(2,30,9,"k"),hline(15,30,9,"k")
);
// Caballo: chica punk con coleta lateral, cadena y botas gruesas.
piece("knight",{w:30,h:31},
  poly([7,5,11,1,18,2,22,7,20,14,25,18,22,22,17,15,13,12],"B"),
  line(8,7,2,15,"p",3),ellipse(14,8,5,6,"skin"),rect(9,4,10,4,"k"),
  px(12,9,"eye"),px(17,9,"eye"),hline(12,12,5,"r"),
  poly([8,14,19,14,22,25,5,25],"b"),poly([11,15,16,15,17,23,9,23],"r"),
  line(9,16,18,20,"e",1),px(13,18,"e"),rect(5,24,8,5,"B"),rect(17,24,8,5,"B"),
  hline(4,29,10,"k"),hline(16,29,10,"k"),px(19,17,"p")
);
// Alfil: lolita gótica, lazo alto y mangas con encaje.
piece("bishop",{w:25,h:32},
  poly([5,8,7,2,12,5,17,1,21,8,18,13,7,13],"B"),
  rect(8,7,9,8,"skin"),rect(9,9,2,2,"k"),rect(14,9,2,2,"k"),hline(10,12,5,"r"),
  poly([5,14,19,14,23,30,2,30],"b"),poly([9,15,15,15,17,29,7,29],"w"),
  ...[18,21,24,27].map(y=>hline(7,y,10,"p")),px(12,17,"r"),px(12,18,"R"),
  poly([6,5,2,2,1,7,7,9],"r"),poly([17,5,22,2,23,7,17,9],"r"),
  hline(2,30,21,"k")
);
// Reina: vampira de pelo negro, corona y capa carmesí.
piece("queen",{w:28,h:34,mx:true},
  poly([3,8,1,18,5,29,23,29,27,18,25,8,21,14,18,6,14,13,10,5,7,14],"B"),
  poly([7,8,10,3,13,7,16,1,19,7,22,3,23,9],"e"),rect(7,8,14,3,"E"),
  ellipse(14,11,5,5,"skin"),rect(8,7,12,4,"k"),px(11,11,"eye"),px(17,11,"eye"),hline(12,14,5,"r"),
  poly([5,16,23,16,27,31,1,31],"r"),poly([9,17,19,17,17,30,11,30],"b"),
  vline(14,18,11,"w"),px(14,20,"e"),px(14,21,"E"),hline(1,31,26,"k")
);
// Rey: figura principal de silueta alta, sombrero de bruja y bastón.
piece("king",{w:29,h:35,mx:true},
  poly([3,9,11,5,25,8,19,11,23,13,7,13],"B"),line(13,4,18,0,"p",2),
  ellipse(14,12,5,5,"skin"),rect(9,8,10,4,"k"),px(11,12,"eye"),px(17,12,"eye"),
  poly([4,17,23,17,27,32,1,32],"b"),poly([10,18,18,18,20,31,8,31],"r"),
  vline(14,19,11,"w"),px(14,22,"e"),px(14,23,"E"),
  rect(24,13,2,19,"Z"),circ(25,12,2,"p"),px(25,12,"e"),hline(1,32,26,"k")
);
// Guardia: punk con chaqueta corta, falda y cadenas.
piece("guard",{w:27,h:30},
  poly([6,4,10,1,18,2,21,7,18,13,8,13],"B"),ellipse(13,8,5,5,"skin"),
  rect(8,5,11,4,"k"),px(11,9,"eye"),px(16,9,"eye"),
  rect(6,13,14,7,"b"),hline(8,15,10,"r"),line(8,16,18,19,"e",1),
  poly([7,19,20,19,23,25,4,25],"r"),hline(7,21,13,"k"),
  rect(5,25,7,4,"B"),rect(16,25,7,4,"B"),hline(4,29,9,"k"),hline(15,29,9,"k")
);
piece("advisor",{w:24,h:29,mx:true},
  poly([5,5,8,1,17,2,20,7,17,15,7,15],"B"),ellipse(12,9,5,5,"skin"),
  rect(7,5,10,4,"k"),px(9,10,"eye"),px(15,10,"eye"),
  poly([4,15,20,15,22,27,2,27],"b"),poly([9,16,15,16,16,26,8,26],"w"),
  px(12,18,"r"),px(12,19,"R"),hline(2,27,20,"k")
);
piece("elephant",{w:31,h:28},
  poly([4,7,7,2,13,5,19,2,25,7,22,15,9,15],"B"),ellipse(15,10,5,5,"skin"),
  poly([6,15,24,15,28,24,3,24],"b"),poly([11,16,19,16,20,23,10,23],"r"),
  vline(15,17,6,"w"),rect(4,23,8,4,"B"),rect(19,23,8,4,"B"),hline(3,27,10,"k"),hline(18,27,10,"k")
);
piece("camel",{w:30,h:29},
  poly([5,5,8,1,17,2,22,7,20,13,25,17,22,22,17,14,10,13],"B"),
  ellipse(13,8,5,5,"skin"),rect(8,4,11,4,"k"),px(11,9,"eye"),px(16,9,"eye"),
  poly([6,14,21,14,24,24,3,24],"b"),line(8,16,19,21,"e",1),
  rect(5,24,7,4,"B"),rect(17,24,7,4,"B"),hline(4,28,9,"k"),hline(16,28,9,"k")
);
piece("cannon",{w:29,h:27,mx:true},
  poly([5,5,9,1,18,2,22,7,19,14,10,14],"B"),ellipse(14,8,5,5,"skin"),
  rect(9,4,11,4,"k"),px(11,9,"eye"),px(17,9,"eye"),
  poly([5,14,23,14,25,23,3,23],"r"),poly([10,15,18,15,17,22,11,22],"b"),
  circ(7,24,3,"silver"),circ(22,24,3,"silver"),hline(2,27,24,"k")
);
sprite("tile-a",{w:16,h:16},rect(0,0,16,16,"#c8bdc9"),hline(0,7,16,"#b2a4b5"),vline(7,0,7,"#b2a4b5"),px(3,3,"#eadfea"));
sprite("tile-a2",{w:16,h:16},rect(0,0,16,16,"#c8bdc9"),hline(0,7,16,"#b2a4b5"),vline(7,0,7,"#b2a4b5"),px(11,11,"#8d67bd"));
sprite("tile-a3",{w:16,h:16},rect(0,0,16,16,"#c8bdc9"),hline(0,7,16,"#b2a4b5"),vline(7,0,7,"#b2a4b5"),px(3,12,"#8d67bd"));
sprite("tile-b",{w:16,h:16},rect(0,0,16,16,"#514454"),hline(0,7,16,"#302638"),vline(7,0,7,"#302638"),px(11,11,"#78617e"));
sprite("tile-b2",{w:16,h:16},rect(0,0,16,16,"#514454"),hline(0,7,16,"#302638"),vline(7,0,7,"#302638"),px(3,3,"#8d67bd"));
sprite("tile-b3",{w:16,h:16},rect(0,0,16,16,"#514454"),hline(0,7,16,"#302638"),vline(7,0,7,"#302638"),px(3,12,"#8d67bd"));
sprite("table",{w:32,h:32},rect(0,0,32,32,"#100d16"),hline(0,15,32,"#1b1422"),vline(15,0,32,"#1b1422"),...[[4,5],[22,7],[8,25],[27,22],[16,17]].map(([x,y])=>px(x,y,"#302638")));
sprite("panel",{w:12,h:12},rect(0,0,4,4,"#514454"),rect(8,0,4,4,"#514454"),rect(0,8,4,4,"#514454"),rect(8,8,4,4,"#514454"),hline(4,0,4,"#8d67bd"),hline(4,11,4,"#8d67bd"),vline(0,4,4,"#8d67bd"),vline(11,4,4,"#8d67bd"));
sprite("boton",{w:12,h:12},rect(0,0,12,2,"#8d67bd"),rect(0,2,2,8,"#8d67bd"),rect(10,2,2,8,"#8d67bd"),rect(0,10,12,2,"#513c79"));
sheet("goticas-waifu",["pawn","rook","knight","bishop","queen","king","guard","advisor","elephant","camel","cannon"],{pad:2});
