// Tema "Crisis Financiera": las once piezas como cosas de un banco en quiebra. Solo se dibuja el
// bando claro: plata (w W o) con verde dinero (g G); el importador lo pasa a grafito con rojo de
// error y a oro con cian de pantalla. Oro, metal, pantallas y papel son fijos en los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/crisis/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#101412",
  w: "#e6ede8", W: "#bccac1", o: "#83978a", g: "#3fd47a", G: "#1b8a4a",
  y: "#f2cf5a", Y: "#b08a24",
  m: "#9aa3a8", M: "#5e666b",
  s: "#0e1a16", c: "#7ff0c0", r: "#ff4a5a",
  p: "#f1efe4", P: "#c9c4b0",
});
ramps("oWw", "Gg", "Yy", "Mm", "Pp");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Peón: moneda de pie con el canto verde y un número gastado.
piece("pawn", { w: 18, h: 22 },
  ellipse(9, 11, 8, 10, "W"), ellipse(8, 11, 7, 9, "w"), ellipse(8, 11, 5, 7, "W", true),
  vline(8, 7, 9, "o"), hline(6, 8, 4, "o"), hline(6, 14, 4, "o"),
  vline(17, 6, 10, "G"), vline(16, 3, 16, "g"),
  rect(3, 20, 12, 2, "G"),
);

// Torre: cajero automático con la pantalla rota y la ranura de billetes.
piece("rook", { w: 22, h: 30 },
  rect(1, 2, 20, 26, "w"), rect(15, 2, 6, 26, "W"), hline(1, 2, 20, "g"), rect(1, 3, 20, 2, "G"),
  rect(4, 7, 12, 8, "s"), line(6, 8, 12, 14, "c"), line(12, 8, 9, 12, "c"), px(13, 13, "r"),
  ...[0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => rect(5 + i * 3, 17 + j * 2, 2, 1, "o"))),
  rect(4, 24, 12, 2, "s"), hline(5, 25, 10, "g"),
  rect(0, 28, 22, 2, "o"),
);

// Caballo: tarjeta de crédito de pie, con el chip de oro y la banda.
piece("knight", { w: 20, h: 30 },
  poly([2, 2, 16, 0, 18, 28, 4, 30], "w"), poly([12, 1, 16, 0, 18, 28, 14, 29], "W"),
  rect(5, 6, 5, 4, "y"), hline(5, 8, 5, "Y"), vline(7, 6, 4, "Y"),
  rect(4, 14, 13, 3, "G"), hline(5, 21, 9, "o"), hline(5, 23, 6, "o"),
  rect(11, 25, 5, 3, "g"),
);

// Alfil: contrato enrollado con el sello de cera verde.
piece("bishop", { w: 18, h: 30 },
  rect(4, 4, 10, 22, "p"), rect(11, 4, 3, 22, "P"), ellipse(9, 4, 5, 2, "P"), ellipse(9, 26, 5, 2, "P"),
  ...[8, 11, 14, 17].map((y) => hline(6, y, 6, "o")),
  circ(9, 21, 3, "g"), circ(9, 21, 1, "G"), px(7, 25, "G"), px(11, 25, "G"),
  rect(2, 28, 14, 2, "w"),
);

// Reina: pirámide de lingotes con una tiara de billetes.
piece("queen", { w: 26, h: 32 },
  ...[0, 1, 2, 3].flatMap((row) => Array.from({ length: 4 - row }, (_, i) =>
    [rect(1 + row * 3 + i * 6, 24 - row * 5, 6, 5, "y"), hline(1 + row * 3 + i * 6, 24 - row * 5, 6, "Y"), vline(6 + row * 3 + i * 6, 24 - row * 5, 5, "Y")]).flat()),
  rect(7, 2, 12, 7, "w"), rect(9, 4, 8, 3, "g"), px(13, 5, "G"), poly([7, 2, 10, 0, 13, 2, 16, 0, 19, 2], "W"),
  rect(0, 29, 26, 3, "o"),
);

// Rey: la bóveda, con la rueda de la combinación y las bisagras.
piece("king", { w: 28, h: 34 },
  rect(1, 3, 26, 29, "w"), rect(20, 3, 7, 29, "W"), rect(1, 3, 26, 3, "G"), hline(1, 3, 26, "g"),
  box(4, 8, 20, 21, "o"), circ(14, 18, 6, "m"), ring(14, 18, 6, "M"), circ(14, 18, 2, "M"),
  hline(8, 18, 12, "M"), vline(14, 12, 13, "M"), px(14, 11, "g"),
  rect(1, 10, 2, 3, "M"), rect(1, 23, 2, 3, "M"), rect(22, 16, 3, 5, "y"),
  rect(0, 32, 28, 2, "o"),
);

// Guardia: torre de fichas de crédito.
piece("guard", { w: 18, h: 24 },
  ...[0, 1, 2, 3, 4].flatMap((i) => [ellipse(9, 20 - i * 4, 8, 2, i % 2 ? "g" : "w"), hline(2, 21 - i * 4, 14, i % 2 ? "G" : "W"),
    px(4, 20 - i * 4, "W"), px(13, 20 - i * 4, "W")]),
  ellipse(9, 4, 8, 2, "w"), ellipse(9, 4, 4, 1, "o"),
);

// Consejero: maletín de ejecutivo con el cierre de oro.
piece("advisor", { w: 24, h: 24 },
  box(8, 0, 8, 5, "o"), rect(1, 5, 22, 17, "w"), rect(17, 5, 6, 17, "W"), hline(1, 11, 22, "G"),
  rect(10, 10, 4, 3, "y"), px(11, 11, "Y"), rect(0, 22, 24, 2, "o"),
);

// Elefante: alcancía de chancho, gorda, con la ranura arriba.
piece("elephant", { w: 30, h: 26 },
  ellipse(14, 13, 13, 9, "w"), ellipse(17, 15, 10, 7, "W"), ellipse(10, 11, 7, 5, "w"),
  hline(11, 4, 6, "s"), rect(25, 11, 5, 5, "W"), px(27, 13, "o"), px(28, 13, "o"),
  px(22, 9, "k"), poly([18, 4, 22, 1, 23, 6], "G"),
  rect(5, 20, 4, 5, "G"), rect(19, 20, 4, 5, "G"), rect(2, 11, 2, 2, "o"),
);

// Camello: impresora de recibos con el ticket larguísimo que no para de salir.
piece("camel", { w: 22, h: 32 },
  rect(6, 0, 10, 16, "p"), rect(13, 0, 3, 16, "P"), ...[2, 5, 8, 11].map((y) => hline(8, y, 6, "o")),
  rect(1, 15, 20, 15, "w"), rect(15, 15, 6, 15, "W"), rect(4, 15, 14, 2, "s"),
  rect(4, 20, 7, 4, "s"), text(5, 19, "0", "r"), rect(13, 22, 3, 2, "g"),
  rect(0, 30, 22, 2, "o"),
);

// Cañón: contadora de billetes que escupe dinero.
piece("cannon", { w: 30, h: 22 },
  rect(2, 6, 18, 13, "w"), rect(14, 6, 6, 13, "W"), rect(4, 9, 8, 4, "s"), hline(5, 11, 6, "c"),
  rect(20, 8, 8, 5, "p"), rect(22, 9, 6, 3, "g"), px(26, 10, "G"),
  rect(6, 2, 8, 4, "g"), hline(6, 3, 8, "G"), rect(1, 19, 22, 3, "o"),
);
