// Góticas Clonas: primer corte de arte propio para Zugzwang.
// Los colores de la vestimenta usan la rampa del bando; tinta, hueso y rubí son constantes.
pal({
  k: "#17131b",
  w: "#e8dfd2", W: "#cfc1c4", o: "#ad9ba8", O: "#7d6a7c", b: "#4d4053",
  g: "#c8c0c6", G: "#8f8795",
  r: "#8f2948", R: "#571b32",
  z: "#c9a36a", y: "#f3dca4",
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
