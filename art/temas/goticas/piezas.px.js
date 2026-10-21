// Góticas: primer corte de arte propio para Zugzwang.
// Los colores de la vestimenta usan la rampa del bando; tinta, hueso y rubí son constantes.
pal({
  k: "#121318",
  w: "#d9d7cc", W: "#b8b7b0", o: "#8b8b94", O: "#5d5e6b", b: "#343541",
  g: "#c0c0bd", G: "#777985",
  r: "#586b55", R: "#303d32",
  z: "#a7a18b", Z: "#696750", y: "#e1d9b8",
  s: "#aaa6b3", S: "#6c6377", m: "#b8c5c4", M: "#727e80", X: "#25282d", n: "#564d43", N: "#30292b", c: "#9cae94", C: "#586c59",
});
ramps("bOoWw", "kRr");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Peón: clon novicio, hábito cerrado y rostro reducido a dos píxeles.
piece("pawn", { w: 20, h: 25, mx: true },
  ellipse(10, 8, 5, 5, "g"),
  rect(6, 7, 8, 3, "w"),
  px(8, 8, "k"), px(12, 8, "k"),
  poly([5, 12, 15, 12, 18, 23, 2, 23], "O"),
  poly([7, 13, 13, 13, 14, 22, 6, 22], "b"),
  vline(10, 14, 8, "w"),
  hline(4, 23, 12, "k"),
  px(10, 17, "r"), px(10, 18, "R"),
);

// Torre: mausoleo portátil, almenas y ventana de vitral.
piece("rook", { w: 24, h: 29, mx: true },
  rect(3, 23, 18, 4, "b"),
  rect(5, 9, 14, 14, "O"),
  hline(5, 9, 14, "w"),
  ...[13, 17, 21].map(y => hline(6, y, 12, "o")),
  rect(3, 3, 4, 6, "w"), rect(9, 1, 6, 8, "w"), rect(17, 3, 4, 6, "w"),
  rect(9, 13, 6, 10, "k"),
  px(10, 15, "r"), px(13, 15, "r"), px(11, 17, "R"), px(12, 19, "r"),
  hline(2, 27, 20, "k"),
);

// Reina: clon superior, velo, corona austera y broche carmesí.
piece("queen", { w: 26, h: 32, mx: true },
  poly([3, 8, 7, 4, 13, 8, 19, 4, 23, 8, 20, 17, 6, 17], "b"),
  rect(8, 8, 10, 8, "g"),
  rect(9, 10, 2, 2, "k"), rect(15, 10, 2, 2, "k"),
  hline(10, 14, 6, "r"),
  poly([6, 16, 20, 16, 24, 29, 2, 29], "O"),
  poly([9, 17, 17, 17, 15, 28, 11, 28], "b"),
  vline(13, 18, 10, "w"),
  hline(6, 29, 14, "k"),
  rect(7, 4, 12, 2, "z"),
  px(13, 2, "r"), px(13, 3, "R"),
  px(10, 5, "z"), px(16, 5, "z"),
  px(13, 19, "r"), px(13, 20, "R"),
);


// Caballo: corcel espectral y jinete sin rostro.
piece("knight", { w: 30, h: 30 },
  poly([19, 7, 26, 9, 29, 14, 25, 13, 23, 17, 20, 12], "b"),
  line(27, 16, 29, 23, "b", 2), rect(23, 21, 3, 7, "O"), rect(26, 22, 2, 6, "b"),
  ellipse(18, 18, 10, 5, "O"), ellipse(17, 16, 8, 4, "o"),
  rect(11, 21, 3, 6, "O"), rect(15, 21, 3, 6, "b"), rect(10, 27, 5, 2, "b"), rect(15, 27, 4, 2, "b"),
  poly([2, 10, 6, 7, 10, 9, 11, 15, 6, 17, 2, 14], "g"), line(8, 9, 13, 17, "b", 2),
  px(4, 12, "r"), px(7, 12, "r"), rect(14, 12, 8, 3, "r"), rect(15, 8, 7, 5, "b"),
  rect(16, 4, 6, 5, "k"), hline(16, 5, 6, "O"), rect(21, 1, 2, 14, "n"), px(22, 0, "g"),
);

// Alfil: hermana de la cripta, hábito alto y velo cosido.
piece("bishop", { w: 25, h: 32 },
  poly([5, 15, 18, 15, 22, 30, 1, 30], "b"), poly([8, 16, 15, 16, 17, 29, 6, 29], "O"),
  vline(11, 18, 10, "W"), ...[20, 23, 26].map(y => px(12, y, "z")),
  rect(7, 7, 10, 9, "g"), rect(8, 9, 8, 5, "k"), px(10, 10, "r"), px(13, 10, "r"),
  hline(10, 13, 4, "W"), poly([4, 7, 8, 1, 15, 1, 20, 8, 17, 10, 7, 10], "b"),
  hline(6, 8, 12, "w"), px(11, 3, "r"), px(11, 4, "R"), rect(2, 29, 20, 2, "k"),
);

// Rey: prior esquelético con corona de hierro y báculo.
piece("king", { w: 28, h: 34, mx: true },
  rect(22, 7, 2, 22, "n"), vline(23, 7, 22, "z"), circ(23, 5, 2, "z"), px(23, 5, "r"),
  poly([3, 13, 21, 13, 25, 31, 0, 31], "O"), poly([9, 14, 17, 14, 19, 30, 7, 30], "b"),
  vline(13, 16, 13, "W"), rect(7, 7, 12, 7, "g"), rect(8, 9, 3, 3, "k"), rect(15, 9, 3, 3, "k"),
  hline(10, 13, 6, "r"), poly([6, 5, 8, 2, 11, 5, 14, 1, 17, 5, 20, 2, 21, 6], "z"),
  rect(7, 5, 13, 2, "y"), px(14, 4, "r"), px(14, 5, "R"), rect(1, 31, 24, 2, "k"),
);

// Guardia: verdugo de máscara lisa y hacha corta.
piece("guard", { w: 26, h: 30 },
  rect(6, 22, 5, 6, "b"), rect(14, 22, 5, 6, "b"), rect(4, 27, 8, 2, "k"), rect(13, 27, 8, 2, "k"),
  rect(4, 12, 17, 11, "O"), rect(2, 13, 4, 8, "b"), rect(19, 13, 4, 8, "b"),
  hline(5, 15, 15, "w"), hline(5, 19, 15, "o"), vline(12, 14, 8, "W"),
  rect(7, 4, 11, 9, "g"), rect(8, 6, 9, 6, "O"), hline(9, 8, 7, "k"),
  px(10, 8, "r"), px(14, 8, "r"), rect(21, 3, 2, 18, "n"),
  poly([18, 3, 22, 0, 26, 4, 23, 10, 20, 8], "m"), px(23, 3, "r"), rect(2, 29, 20, 1, "k"),
);

// Consejero: clon velado, rostro vacío y mangas en jirones.
piece("advisor", { w: 24, h: 29, mx: true },
  circ(11, 8, 7, "g"), rect(4, 8, 15, 13, "b"),
  poly([4, 20, 9, 20, 7, 27, 4, 25, 2, 28], "O"), poly([10, 20, 15, 20, 17, 28, 13, 25, 11, 27], "O"),
  rect(7, 8, 9, 7, "k"), px(9, 10, "r"), px(14, 10, "r"),
  vline(7, 16, 6, "o"), vline(14, 16, 5, "o"), poly([3, 13, 0, 18, 5, 21, 7, 18], "b"),
  rect(17, 15, 5, 6, "X"), rect(18, 16, 3, 4, "y"), vline(19, 12, 4, "n"), px(19, 15, "r"),
);

// Elefante: gólem-campanario con placas de piedra y campana rota.
piece("elephant", { w: 32, h: 28 },
  rect(6, 20, 5, 6, "b"), rect(21, 20, 5, 6, "b"), rect(4, 25, 8, 2, "k"), rect(20, 25, 8, 2, "k"),
  ellipse(16, 15, 12, 8, "O"), rect(7, 11, 18, 9, "b"), ...[13, 17].map(y => hline(7, y, 18, "o")),
  rect(6, 6, 20, 7, "g"), rect(8, 8, 16, 4, "W"), rect(10, 9, 3, 2, "k"), rect(19, 9, 3, 2, "k"),
  px(11, 9, "r"), px(20, 9, "r"), hline(13, 12, 6, "k"), rect(3, 13, 5, 7, "O"), rect(24, 13, 5, 7, "O"),
  line(8, 15, 23, 18, "z", 1), px(15, 17, "z"), px(17, 18, "z"), rect(13, 1, 6, 5, "m"),
  rect(12, 0, 8, 2, "b"), px(16, 4, "r"),
);

// Camello: araña de osario con caparazón agrietado y ojos de brasa.
piece("camel", { w: 32, h: 28, mx: true },
  line(11, 12, 5, 5, "b", 2), line(5, 5, 1, 17, "O", 2), line(12, 15, 7, 12, "O", 2), line(7, 12, 4, 26, "b", 2),
  line(14, 18, 9, 18, "b", 2), line(9, 18, 8, 26, "O", 2), line(16, 20, 13, 23, "O", 2), line(13, 23, 14, 27, "b", 2),
  line(21, 12, 27, 5, "b", 2), line(27, 5, 31, 17, "O", 2), line(20, 15, 25, 12, "O", 2), line(25, 12, 28, 26, "b", 2),
  line(18, 18, 23, 18, "b", 2), line(23, 18, 24, 26, "O", 2),
  ellipse(16, 13, 7, 7, "O"), poly([10, 10, 16, 6, 22, 10, 20, 17, 12, 17], "b"),
  line(12, 9, 19, 16, "o", 1), line(19, 9, 12, 16, "o", 1), ellipse(16, 19, 4, 4, "g"),
  px(14, 18, "r"), px(17, 18, "r"), px(15, 21, "y"), px(17, 21, "y"),
);

// Cañón: relicario con ruedas de hierro y fuego espectral.
piece("cannon", { w: 30, h: 27, mx: true },
  rect(4, 22, 5, 4, "b"), rect(20, 22, 5, 4, "b"), circ(6, 23, 3, "m"), circ(22, 23, 3, "m"),
  circ(6, 23, 1, "k"), circ(22, 23, 1, "k"), rect(5, 10, 19, 12, "O"), rect(7, 12, 15, 8, "b"),
  hline(6, 10, 18, "w"), hline(7, 21, 16, "o"), rect(10, 13, 9, 6, "g"),
  px(12, 14, "k"), px(16, 14, "k"), hline(12, 17, 5, "k"), px(14, 16, "r"),
  poly([10, 10, 12, 5, 14, 9, 16, 3, 18, 9, 21, 5, 22, 10], "r"),
  poly([13, 10, 14, 7, 16, 10, 18, 7, 19, 10], "y"), rect(12, 1, 6, 3, "m"),
  px(14, 0, "g"), px(15, 0, "g"), line(13, 4, 10, 7, "z", 1), line(17, 4, 20, 7, "z", 1),
);

// Variantes de piedra y mesa de cripta. La mesa es un mosaico 32×32.
sprite("tile-a", { w: 16, h: 16 }, rect(0, 0, 16, 16, "g"), hline(0, 7, 16, "G"), vline(5, 0, 7, "G"), vline(12, 8, 8, "G"), px(2, 3, "w"), px(10, 12, "W"), line(7, 9, 9, 11, "O"));
sprite("tile-a2", { w: 16, h: 16 }, rect(0, 0, 16, 16, "g"), hline(0, 7, 16, "G"), vline(5, 0, 7, "G"), vline(12, 8, 8, "G"), line(2, 2, 4, 4, "O"), px(13, 11, "o"));
sprite("tile-a3", { w: 16, h: 16 }, rect(0, 0, 16, 16, "g"), hline(0, 7, 16, "G"), vline(5, 0, 7, "G"), vline(12, 8, 8, "G"), px(2, 12, "o"), line(8, 9, 10, 11, "O"));
sprite("tile-b", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 7, 16, "b"), vline(5, 0, 7, "b"), vline(12, 8, 8, "b"), px(2, 3, "o"), line(7, 9, 9, 11, "b"));
sprite("tile-b2", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 7, 16, "b"), vline(5, 0, 7, "b"), vline(12, 8, 8, "b"), line(2, 2, 4, 4, "b"), px(13, 11, "o"));
sprite("tile-b3", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 7, 16, "b"), vline(5, 0, 7, "b"), vline(12, 8, 8, "b"), px(2, 12, "b"), line(8, 9, 10, 11, "b"));
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "k"), hline(0, 0, 32, "b"), hline(0, 16, 32, "b"), vline(0, 0, 32, "b"), vline(16, 0, 16, "b"), vline(16, 16, 16, "b"), ...[[4,4],[10,11],[23,5],[28,22],[7,26],[20,29],[25,14],[13,20]].map(([x,y]) => px(x,y,"X")));
sprite("panel", { w: 12, h: 12 }, rect(0, 0, 4, 4, "b"), rect(8, 0, 4, 4, "b"), rect(0, 8, 4, 4, "b"), rect(8, 8, 4, 4, "b"), hline(4, 0, 4, "O"), hline(4, 11, 4, "O"), vline(0, 4, 4, "O"), vline(11, 4, 4, "O"));
sprite("boton", { w: 12, h: 12 }, rect(0, 0, 12, 2, "O"), rect(0, 2, 2, 8, "O"), rect(10, 2, 2, 8, "O"), rect(0, 10, 12, 2, "b"), hline(2, 1, 8, "w"));

