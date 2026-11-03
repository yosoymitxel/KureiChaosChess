// Tema "Crisis Financiera": sátira de la quiebra de un banco digital paraguayo, sin su marca. Las
// piezas son la gente y las cosas del día de la intervención. Solo se dibuja el bando claro: plata
// (w W o) con verde lima (g G); el importador lo pasa a grafito/rojo y a oro/cian. Piel, papel,
// pantallas, metal y la cinta de clausura son fijos en los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/crisis/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#0d1110",
  w: "#eef3ef", W: "#c5d1c9", o: "#8a9a90", g: "#9be22d", G: "#4f8a1a",
  s: "#e8b48e", S: "#b27a58", h: "#3a2a22", H: "#d9d9d2",
  t: "#2b3038", T: "#1b1f25", y: "#f5cf4a", Y: "#b38a22",
  p: "#f4f1e6", P: "#cfc8b2", n: "#0b1712", c: "#8ef0c8", r: "#ff4256", R: "#a8202f",
  m: "#a3acb1", M: "#646d72", b: "#f7d23a",
});
ramps("oWw", "Gg", "Ss", "Tt", "Yy", "Pp", "Mm", "Rr");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};
// Cara de frente: ojos de 1 px, boca según el humor.
const eyes = (x, y, gap) => [px(x, y, "k"), px(x + gap, y, "k")];

// Peón: el ahorrista en la fila, mirando la app que no anda.
piece("pawn", { w: 16, h: 22 },
  rect(4, 0, 8, 3, "h"), rect(3, 2, 10, 7, "s"), rect(3, 2, 10, 2, "h"), px(3, 4, "h"), px(12, 4, "h"),
  rect(11, 3, 2, 6, "S"), ...eyes(5, 5, 5), hline(6, 7, 4, "S"), px(6, 8, "S"), px(9, 8, "S"),
  rect(2, 9, 12, 7, "w"), rect(10, 9, 4, 7, "W"), vline(7, 9, 5, "g"), vline(8, 9, 5, "g"), px(7, 14, "G"), px(8, 14, "G"),
  rect(1, 10, 2, 5, "w"), rect(1, 15, 2, 1, "s"),
  rect(13, 10, 3, 5, "n"), px(14, 11, "r"), px(14, 13, "r"), px(15, 12, "r"), px(13, 12, "r"), rect(12, 14, 2, 2, "s"),
  rect(3, 16, 4, 4, "t"), rect(9, 16, 4, 4, "t"), vline(6, 16, 4, "T"), vline(12, 16, 4, "T"),
  rect(2, 20, 5, 2, "M"), rect(9, 20, 5, 2, "M"),
);

// Torre: el cajero automático clausurado: "24H" tachado, pantalla con ERR y la cinta amarilla.
piece("rook", { w: 24, h: 31 },
  rect(1, 0, 22, 7, "g"), hline(1, 6, 22, "G"), rect(4, 2, 16, 3, "G"), ...[5, 8, 11, 14, 17].map((x) => rect(x, 3, 2, 1, "n")), px(20, 1, "r"), px(21, 1, "r"),
  rect(0, 7, 24, 22, "w"), rect(19, 7, 5, 22, "W"), vline(0, 7, 22, "W"),
  rect(3, 8, 18, 10, "M"), rect(4, 9, 16, 8, "n"), text(6, 10, "ERR", "r"),
  ...[0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => rect(4 + i * 3, 19 + j * 2, 2, 1, "o"))),
  rect(14, 19, 6, 2, "n"), px(19, 19, "r"), rect(5, 25, 14, 2, "n"), hline(6, 26, 12, "T"),
  line(0, 23, 23, 12, "b", 3), ...[2, 7, 12, 17, 22].map((x) => line(x, 23 - Math.round(x * 11 / 23) , x + 1, 22 - Math.round(x * 11 / 23), "k")),
  rect(0, 29, 24, 2, "o"),
);

// Caballo: el celular con la app caída, con patitas: la ruedita que gira para siempre.
piece("knight", { w: 20, h: 31 },
  rect(2, 0, 16, 26, "w"), rect(15, 0, 3, 26, "W"), hline(8, 1, 4, "o"),
  rect(4, 3, 12, 19, "n"), ring(10, 9, 4, "c"), px(10, 5, "n"), px(11, 5, "n"), px(12, 6, "n"), px(13, 7, "G"),
  text(4, 15, "500", "r"), hline(7, 24, 6, "o"),
  rect(5, 26, 3, 3, "t"), rect(12, 26, 3, 3, "t"), rect(4, 29, 5, 2, "g"), rect(11, 29, 5, 2, "g"),
);

// Alfil: la calificadora de riesgo, sonriente, levantando el cartel "AAA" hasta el último día.
piece("bishop", { w: 20, h: 33 },
  rect(1, 0, 18, 7, "p"), rect(1, 6, 18, 1, "P"), text(4, 1, "AAA", "G"),
  rect(2, 7, 2, 9, "o"), rect(16, 7, 2, 9, "o"), px(2, 6, "s"), px(17, 6, "s"),
  rect(6, 8, 8, 8, "s"), rect(6, 8, 8, 2, "h"), rect(12, 9, 2, 7, "S"),
  rect(6, 11, 3, 2, "c"), rect(11, 11, 3, 2, "c"), hline(9, 11, 2, "k"), hline(7, 14, 6, "p"), px(7, 13, "S"), px(12, 13, "S"),
  rect(4, 16, 12, 12, "o"), rect(13, 16, 3, 12, "W"), poly([8, 16, 10, 19, 12, 16], "w"), vline(10, 18, 7, "g"), px(10, 25, "G"),
  rect(5, 28, 4, 3, "t"), rect(11, 28, 4, 3, "t"), rect(4, 31, 5, 2, "T"), rect(11, 31, 5, 2, "T"),
);

// Reina: la directora que se va con lentes oscuros, collar de perlas y la bolsa de las vinculadas.
piece("queen", { w: 26, h: 35 },
  hline(9, 2, 8, "y"), px(9, 1, "y"), px(12, 0, "y"), px(13, 0, "y"), px(16, 1, "y"), px(12, 1, "g"), px(13, 1, "g"),
  rect(6, 3, 14, 13, "h"), px(6, 3, "_"), px(19, 3, "_"), px(6, 4, "_"), px(19, 4, "_"), px(7, 3, "_"), px(18, 3, "_"), rect(8, 5, 10, 10, "s"), rect(16, 5, 2, 10, "S"),
  rect(8, 8, 10, 3, "k"), px(9, 8, "M"), px(14, 8, "M"), hline(11, 13, 4, "r"),
  poly([7, 16, 19, 16, 22, 33, 4, 33], "w"), poly([15, 16, 19, 16, 22, 33, 17, 33], "W"), poly([10, 16, 13, 22, 16, 16], "o"),
  ...[8, 10, 12, 14, 16].map((x, i) => px(x + (i === 2 ? 1 : 0), 17 + (i === 2 ? 1 : 0), "p")),
  hline(6, 26, 14, "G"), rect(3, 20, 3, 9, "w"), rect(20, 20, 3, 6, "W"),
  circ(21, 28, 4, "P"), circ(21, 28, 3, "p"), rect(19, 23, 4, 2, "Y"), vline(21, 25, 7, "G"), hline(20, 26, 3, "G"), px(20, 27, "G"), hline(20, 28, 3, "G"), px(22, 29, "G"), hline(20, 30, 3, "G"),
  rect(4, 33, 18, 2, "o"),
);

// Rey: la bóveda, con corona y la puerta abierta de par en par: adentro, telarañas y una polilla.
piece("king", { w: 28, h: 35 },
  rect(8, 2, 12, 4, "y"), hline(8, 5, 12, "Y"), px(8, 0, "y"), px(8, 1, "y"), px(13, 0, "y"), px(14, 0, "y"), px(13, 1, "y"), px(14, 1, "y"), px(19, 0, "y"), px(19, 1, "y"),
  px(11, 3, "g"), px(16, 3, "g"),
  rect(0, 6, 28, 27, "w"), rect(0, 6, 28, 3, "g"), hline(0, 8, 28, "G"), vline(0, 9, 24, "W"),
  rect(3, 11, 16, 19, "n"), line(3, 11, 8, 16, "M"), line(3, 15, 7, 11, "M"), line(3, 13, 6, 14, "M"),
  px(10, 19, "p"), px(12, 19, "p"), px(11, 20, "P"), px(11, 19, "o"), rect(6, 28, 10, 1, "M"),
  rect(19, 10, 8, 21, "o"), rect(19, 10, 2, 21, "W"), circ(23, 20, 3, "m"), ring(23, 20, 3, "M"), px(23, 20, "M"),
  rect(0, 33, 28, 2, "o"),
);

// Guardia: el de seguridad, dormido de pie con los brazos cruzados.
piece("guard", { w: 19, h: 26 },
  rect(4, 1, 10, 3, "G"), hline(3, 4, 12, "g"), px(8, 2, "y"), px(9, 2, "y"),
  rect(5, 5, 8, 6, "s"), rect(11, 5, 2, 6, "S"), hline(6, 7, 2, "k"), hline(10, 7, 2, "k"), rect(8, 9, 2, 1, "R"),
  text(15, 0, "Z", "c"), px(16, 6, "c"), px(17, 6, "c"), px(17, 7, "c"), px(16, 8, "c"), px(17, 8, "c"),
  rect(3, 11, 12, 10, "w"), rect(12, 11, 3, 10, "W"), rect(3, 14, 12, 3, "o"), px(5, 12, "y"), px(5, 13, "Y"),
  rect(4, 21, 4, 3, "t"), rect(10, 21, 4, 3, "t"), rect(3, 24, 5, 2, "T"), rect(10, 24, 5, 2, "T"),
);

// Consejero: el asesor de la promo, sonrisa de anuncio, ofreciendo el reintegro con la estrella.
piece("advisor", { w: 24, h: 27 },
  rect(2, 0, 9, 3, "h"), px(10, 0, "h"), rect(2, 2, 9, 8, "s"), rect(9, 3, 2, 7, "S"), ...eyes(4, 5, 4), hline(4, 8, 5, "p"), px(3, 7, "S"),
  rect(1, 10, 11, 11, "w"), rect(9, 10, 3, 11, "W"), vline(6, 10, 6, "g"), rect(0, 11, 2, 7, "w"),
  rect(12, 12, 4, 2, "w"), rect(15, 11, 2, 3, "s"),
  poly([18, 0, 19, 3, 23, 2, 21, 5, 24, 7, 21, 8, 22, 12, 18, 10, 14, 12, 15, 8, 12, 7, 15, 5, 13, 2, 17, 3], "y"),
  px(16, 4, "R"), px(20, 8, "R"), line(20, 4, 16, 8, "R"),
  rect(2, 21, 4, 4, "t"), rect(7, 21, 4, 4, "t"), rect(1, 25, 5, 2, "T"), rect(7, 25, 5, 2, "T"),
);

// Elefante: la alcancía de chanchito, partida y llorando, con las monedas escapándose.
piece("elephant", { w: 30, h: 26 },
  ellipse(14, 12, 13, 9, "w"), ellipse(16, 14, 11, 7, "W"), ellipse(12, 10, 9, 6, "w"),
  hline(9, 3, 7, "n"), poly([19, 4, 23, 0, 24, 6], "o"), px(22, 3, "W"),
  rect(25, 9, 5, 6, "W"), rect(26, 10, 3, 4, "o"), px(26, 11, "k"), px(28, 11, "k"),
  rect(21, 7, 2, 2, "k"), px(21, 7, "p"), px(22, 10, "c"), px(22, 11, "c"), px(22, 12, "c"),
  hline(20, 14, 4, "o"),
  line(13, 3, 11, 7, "k"), line(11, 7, 14, 11, "k"), line(14, 11, 11, 15, "k"), line(11, 15, 13, 19, "k"),
  rect(5, 19, 4, 5, "o"), rect(18, 19, 4, 5, "o"), rect(0, 10, 2, 2, "o"), px(0, 9, "o"),
  circ(8, 23, 2, "y"), px(8, 23, "Y"), circ(14, 24, 1, "y"), circ(26, 23, 2, "y"), px(26, 23, "Y"),
);

// Camello: el jubilado encorvado con su bastón y la carpeta del catastro, haciendo la fila otra vez.
piece("camel", { w: 22, h: 30 },
  rect(3, 2, 8, 8, "s"), rect(3, 2, 8, 2, "H"), rect(3, 2, 2, 5, "H"), rect(9, 3, 2, 7, "S"),
  rect(4, 5, 3, 2, "c"), px(7, 5, "k"), px(4, 6, "k"), hline(4, 8, 3, "H"),
  poly([5, 10, 13, 8, 18, 12, 18, 24, 6, 24], "w"), poly([13, 8, 18, 12, 18, 24, 15, 24], "W"), hline(8, 11, 6, "o"),
  rect(0, 13, 6, 8, "P"), rect(0, 13, 6, 1, "Y"), hline(1, 16, 4, "o"), hline(1, 18, 3, "o"),
  vline(20, 14, 16, "M"), rect(18, 13, 3, 2, "M"), rect(17, 15, 2, 2, "s"),
  rect(7, 24, 4, 4, "t"), rect(13, 24, 4, 4, "t"), rect(6, 28, 5, 2, "T"), rect(13, 28, 5, 2, "T"),
);

// Cañón: la fotocopiadora de comunicados que escupe "TODO OK" sin parar.
piece("cannon", { w: 31, h: 22 },
  rect(6, 4, 22, 15, "w"), rect(23, 4, 5, 15, "W"), rect(6, 2, 22, 3, "o"), hline(6, 2, 22, "W"),
  rect(9, 6, 8, 6, "n"), px(10, 9, "g"), px(11, 10, "g"), px(12, 9, "g"), px(13, 8, "g"), px(14, 7, "g"), rect(20, 7, 5, 2, "g"), px(21, 10, "r"), px(23, 10, "c"),
  rect(8, 13, 18, 4, "W"), hline(8, 13, 18, "o"),
  rect(0, 9, 7, 5, "p"), hline(1, 11, 5, "P"), rect(1, 5, 5, 4, "p"), hline(2, 6, 3, "P"), rect(2, 15, 5, 4, "p"), hline(3, 17, 3, "P"),
  rect(5, 19, 25, 3, "o"), rect(7, 20, 3, 2, "M"), rect(24, 20, 3, 2, "M"),
);
