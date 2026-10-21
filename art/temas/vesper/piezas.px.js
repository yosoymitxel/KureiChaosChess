// Vesper: gótico nocturno y sensual. Figuras curvas, encaje negro, piel cálida y vino tinto.
pal({
  k: "#0a0810", w: "#e8d8e0", W: "#c9b8c4", o: "#726174", O: "#4a3d4a", b: "#2a2230",
  g: "#f5e6ef", G: "#dfbfd4", r: "#b33b61", R: "#81304f", z: "#c9a36a", Z: "#80613d",
  p: "#f4d3de", P: "#d88ca6", t: "#8ed1c1", T: "#3e806e", y: "#fff0f5", Y: "#f5e6ef",
  s: "#c9b8c4", S: "#726174", m: "#4a3d4a", M: "#2a2230", n: "#3a2d40", N: "#1a1420", j: "#0a0810", J: "#15101c",
  c: "#b33b61", C: "#81304f", q: "#e8d8e0", Q: "#c9b8c4"
});
ramps("bOoWw", "kRr", "Pp", "Yy", "Gg", "Tt", "Cc");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Peón: dama curva en vestido ceñido, caderas anchas y tacones.
piece("pawn", { w: 22, h: 30, mx: true },
  // cabeza
  ellipse(11, 6, 4, 5, "g"), rect(8, 5, 6, 2, "k"),
  px(9, 6, "k"), px(13, 6, "k"), px(10, 8, "r"), px(12, 8, "r"),
  hline(9, 9, 4, "r"),
  // cuello
  rect(10, 11, 2, 2, "p"),
  // vestido ceñido con caderas anchas
  poly([7, 13, 15, 13, 17, 20, 19, 28, 3, 28, 5, 20], "b"),
  poly([9, 14, 13, 14, 14, 19, 16, 27, 6, 27, 8, 19], "O"),
  vline(11, 14, 14, "w"),
  // encaje en el borde
  hline(4, 27, 14, "r"), px(6, 26, "r"), px(10, 26, "r"), px(14, 26, "r"),
  // tacones
  rect(7, 28, 3, 2, "k"), rect(12, 28, 3, 2, "k"),
  px(8, 29, "z"), px(13, 29, "z"),
  // collar
  hline(9, 12, 4, "z"), px(11, 12, "r"),
);

// Torre: trono de terciopelo con respaldo alto y brazos curvos.
piece("rook", { w: 26, h: 32, mx: true },
  rect(3, 26, 20, 5, "b"), rect(5, 27, 16, 3, "O"),
  rect(5, 8, 16, 18, "O"), rect(7, 10, 12, 14, "b"),
  ...[14, 18, 22].map(y => hline(8, y, 10, "o")),
  rect(3, 4, 20, 6, "b"), hline(4, 4, 18, "w"),
  rect(9, 1, 8, 4, "O"), px(11, 2, "r"), px(14, 2, "r"),
  // brazos curvos
  poly([3, 8, 0, 12, 1, 22, 4, 24], "b"), poly([23, 8, 26, 12, 25, 22, 22, 24], "b"),
  px(1, 14, "r"), px(24, 14, "r"), px(10, 6, "g"),
  hline(2, 30, 22, "k"),
);

// Caballo: amazona sobre corcel, falda corta y botas altas.
piece("knight", { w: 30, h: 32 },
  // corcel
  poly([18, 8, 25, 10, 28, 15, 24, 14, 22, 18, 19, 13], "b"),
  line(26, 17, 28, 24, "b", 2), rect(22, 22, 3, 8, "O"), rect(25, 23, 2, 7, "b"),
  ellipse(17, 19, 9, 5, "O"), ellipse(16, 17, 7, 4, "o"),
  rect(10, 22, 3, 7, "O"), rect(14, 22, 3, 7, "b"), rect(9, 29, 5, 2, "b"), rect(14, 29, 4, 2, "b"),
  // amazona
  poly([4, 10, 8, 7, 12, 9, 13, 16, 8, 18, 4, 15], "g"),
  rect(6, 14, 6, 4, "r"), px(8, 15, "R"),
  // falda corta y curva
  poly([6, 18, 12, 18, 14, 24, 4, 24], "b"), hline(7, 20, 5, "O"),
  rect(8, 10, 3, 3, "k"), rect(12, 10, 3, 3, "k"), px(9, 11, "r"), px(13, 11, "r"),
  hline(9, 14, 3, "r"),
);

// Alfil: sacerdotisa con velo y silueta curva.
piece("bishop", { w: 24, h: 32, mx: true },
  poly([6, 14, 18, 14, 20, 30, 4, 30], "b"), poly([9, 15, 15, 15, 16, 29, 8, 29], "O"),
  vline(12, 17, 11, "W"), ...[20, 23, 26].map(y => px(12, y, "z")),
  rect(8, 7, 8, 8, "g"), rect(9, 9, 6, 5, "k"), px(10, 10, "r"), px(13, 10, "r"),
  hline(10, 13, 4, "r"),
  poly([5, 7, 9, 1, 15, 1, 19, 7, 16, 9, 8, 9], "b"),
  hline(7, 8, 10, "w"), px(12, 3, "r"), px(12, 4, "R"),
  rect(1, 29, 22, 2, "k"),
);

// Reina: soberana curva con corona y vestido de gala.
piece("queen", { w: 26, h: 34, mx: true },
  // corona
  poly([4, 6, 8, 2, 13, 6, 18, 2, 22, 6, 19, 9, 7, 9], "z"),
  hline(7, 6, 12, "r"), px(13, 4, "r"), px(13, 5, "R"),
  rect(8, 6, 10, 3, "g"),
  // rostro
  rect(9, 9, 8, 7, "g"), rect(10, 11, 2, 2, "k"), rect(14, 11, 2, 2, "k"),
  hline(11, 14, 4, "r"),
  // cuerpo curvo
  poly([6, 16, 20, 16, 24, 32, 2, 32], "b"),
  poly([9, 17, 17, 17, 19, 31, 7, 31], "O"),
  vline(13, 18, 13, "W"),
  // encaje y detalles
  hline(7, 31, 12, "r"), px(9, 30, "r"), px(13, 30, "r"), px(17, 30, "r"),
  rect(11, 19, 4, 5, "r"), px(12, 20, "y"), px(14, 22, "y"),
  hline(5, 33, 16, "k"),
);

// Rey: soberano con capa y cetro.
piece("king", { w: 28, h: 36, mx: true },
  // cetro
  rect(23, 6, 2, 24, "z"), circ(24, 4, 2, "z"), px(24, 4, "r"), px(24, 3, "R"),
  // corona
  poly([4, 8, 7, 4, 11, 8, 14, 1, 17, 8, 21, 4, 24, 8, 21, 11, 7, 11], "z"),
  hline(7, 8, 14, "r"), px(14, 6, "r"),
  rect(8, 8, 12, 3, "g"),
  // rostro
  rect(9, 11, 10, 8, "g"), rect(10, 13, 3, 3, "k"), rect(15, 13, 3, 3, "k"),
  hline(11, 17, 6, "r"),
  // cuerpo
  poly([6, 19, 22, 19, 26, 34, 2, 34], "b"),
  poly([9, 20, 19, 20, 22, 33, 6, 33], "O"),
  vline(14, 21, 12, "W"),
  hline(6, 34, 16, "k"),
);

// Guardia: guardián curvo con armadura ceñida.
piece("guard", { w: 26, h: 32 },
  rect(6, 24, 5, 6, "b"), rect(15, 24, 5, 6, "b"), rect(4, 29, 8, 2, "k"), rect(13, 29, 8, 2, "k"),
  poly([4, 12, 22, 12, 24, 22, 2, 22], "O"), rect(5, 14, 16, 7, "b"),
  hline(6, 16, 14, "w"), hline(6, 20, 14, "o"), vline(13, 15, 6, "W"),
  // casco
  rect(7, 4, 12, 9, "g"), rect(8, 6, 10, 6, "O"), hline(9, 8, 8, "k"),
  px(10, 8, "r"), px(14, 8, "r"),
  // arma
  rect(21, 4, 2, 20, "z"), px(22, 2, "r"), rect(20, 0, 4, 3, "m"),
  poly([18, 2, 22, -1, 26, 3, 23, 9, 20, 7], "m"),
  hline(2, 31, 22, "k"),
);

// Consejero: figura velada con curvas suaves.
piece("advisor", { w: 24, h: 30, mx: true },
  circ(12, 7, 6, "g"), rect(6, 7, 12, 12, "b"),
  poly([6, 18, 12, 18, 13, 26, 5, 26], "O"), poly([7, 19, 11, 19, 12, 25, 6, 25], "b"),
  rect(8, 8, 8, 6, "k"), px(10, 10, "r"), px(14, 10, "r"),
  vline(8, 15, 5, "o"), vline(16, 15, 5, "o"),
  poly([4, 14, 1, 19, 6, 22, 8, 19], "b"),
  rect(16, 16, 5, 5, "m"), rect(17, 17, 3, 3, "y"), vline(18, 13, 4, "z"),
  px(18, 16, "r"), hline(5, 27, 14, "k"),
);

// Elefante: gólem con silueta curva.
piece("elephant", { w: 32, h: 30 },
  rect(6, 22, 5, 6, "b"), rect(21, 22, 5, 6, "b"), rect(4, 27, 8, 2, "k"), rect(20, 27, 8, 2, "k"),
  ellipse(16, 16, 11, 8, "O"), rect(8, 12, 16, 8, "b"),
  ...[16, 20].map(y => hline(8, y, 16, "o")),
  rect(7, 6, 18, 7, "g"), rect(9, 8, 14, 4, "W"), rect(11, 9, 3, 2, "k"), rect(18, 9, 3, 2, "k"),
  px(12, 9, "r"), px(19, 9, "r"), hline(14, 13, 4, "k"),
  rect(4, 14, 5, 7, "O"), rect(23, 14, 5, 7, "O"),
  line(9, 16, 23, 19, "z", 1), px(16, 18, "z"),
  rect(14, 2, 4, 5, "m"), rect(13, 1, 6, 2, "b"), px(16, 5, "r"),
);

// Camello: araña de osario con silueta curva.
piece("camel", { w: 32, h: 30, mx: true },
  line(11, 13, 5, 6, "b", 2), line(5, 6, 1, 18, "O", 2), line(12, 16, 7, 13, "O", 2), line(7, 13, 4, 27, "b", 2),
  line(14, 19, 9, 19, "b", 2), line(9, 19, 8, 27, "O", 2), line(16, 21, 13, 24, "O", 2), line(13, 24, 14, 28, "b", 2),
  line(21, 13, 27, 6, "b", 2), line(27, 6, 31, 18, "O", 2), line(20, 16, 25, 13, "O", 2), line(25, 13, 28, 27, "b", 2),
  line(18, 19, 23, 19, "b", 2), line(23, 19, 24, 27, "O", 2),
  ellipse(16, 14, 7, 7, "O"), poly([10, 11, 16, 7, 22, 11, 20, 18, 12, 18], "b"),
  line(12, 10, 19, 17, "o", 1), line(19, 10, 12, 17, "o", 1),
  ellipse(16, 20, 4, 4, "g"), px(14, 19, "r"), px(17, 19, "r"), px(15, 22, "y"), px(17, 22, "y"),
);

// Cañón: relicario con fuego espectral.
piece("cannon", { w: 30, h: 28, mx: true },
  rect(4, 23, 5, 4, "b"), rect(20, 23, 5, 4, "b"), circ(6, 24, 3, "m"), circ(22, 24, 3, "m"),
  circ(6, 24, 1, "k"), circ(22, 24, 1, "k"), rect(5, 11, 19, 12, "O"), rect(7, 13, 15, 8, "b"),
  hline(6, 11, 18, "w"), hline(7, 22, 16, "o"), rect(10, 14, 9, 6, "g"),
  px(12, 15, "k"), px(16, 15, "k"), hline(12, 18, 5, "k"), px(14, 17, "r"),
  poly([10, 11, 12, 6, 14, 10, 16, 4, 18, 10, 21, 6, 22, 11], "r"),
  poly([13, 11, 14, 8, 16, 11, 18, 8, 19, 11], "y"), rect(12, 2, 6, 3, "m"),
  px(14, 1, "g"), px(15, 1, "g"),
);

// Variantes de piedra y mesa de terciopelo. La mesa es un mosaico 32×32.
sprite("tile-a", { w: 16, h: 16 }, rect(0, 0, 16, 16, "b"), hline(0, 0, 16, "o"), vline(0, 0, 16, "o"), px(4, 4, "r"), px(11, 9, "r"), px(7, 12, "r"));
sprite("tile-a2", { w: 16, h: 16 }, rect(0, 0, 16, 16, "b"), hline(0, 0, 16, "o"), vline(0, 0, 16, "o"), px(2, 2, "p"), px(9, 5, "p"), px(13, 11, "p"));
sprite("tile-a3", { w: 16, h: 16 }, rect(0, 0, 16, 16, "b"), hline(0, 0, 16, "o"), vline(0, 0, 16, "o"), px(6, 3, "s"), px(3, 10, "s"), px(12, 13, "s"));
sprite("tile-b", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 0, 16, "b"), vline(0, 0, 16, "b"), px(4, 4, "r"), px(11, 9, "r"), px(7, 12, "r"));
sprite("tile-b2", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 0, 16, "b"), vline(0, 0, 16, "b"), px(2, 2, "p"), px(9, 5, "p"), px(13, 11, "p"));
sprite("tile-b3", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 0, 16, "b"), vline(0, 0, 16, "b"), px(6, 3, "s"), px(3, 10, "s"), px(12, 13, "s"));
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "d"),
 ...[0,8,16,24].flatMap(y => [hline(0, y, 32, "m"), vline(0, y, 32, "m")]),
 ...[[4,4],[12,10],[20,6],[28,14],[6,20],[14,26],[22,22],[30,28]].flatMap(([x,y]) => [ellipse(x,y,2,2,"r"), px(x-1,y,"p"), px(x+1,y,"p")])
);
const H="#ffffff55",L="#00000055";
const frame=(name,col)=>sprite(name,{w:12,h:12},
 hline(2,0,8,"j"),hline(2,11,8,"j"),vline(0,2,8,"j"),vline(11,2,8,"j"),
 px(1,1,"j"),px(10,1,"j"),px(1,10,"j"),px(10,10,"j"),
 hline(2,1,8,H),vline(1,2,7,H),hline(2,10,8,L),vline(10,2,8,L),
 px(2,2,col),px(9,2,"t"),px(2,9,"y"),px(9,9,"p"),
 px(5,1,"c"),px(6,10,"C")
);
frame("panel","r");frame("boton","p");

sheet("vesper", ["pawn", "rook", "knight", "bishop", "queen", "king", "guard", "advisor", "elephant", "camel", "cannon"], { pad: 2 });
