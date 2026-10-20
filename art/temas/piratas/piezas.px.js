// El set del tema "Piratas": las once piezas de Zug como la tripulación de un barco. Grumete con
// lampazo, barril-cofa con bandera, caballito de mar con jinete, navegante con catalejo, capitana
// con sable, capitán de sombrero enorme y pata de palo, bucanero con alfanje y parche, loro en su
// percha, morsa de colmillos, cangrejo gigante y cañón de cubierta. Solo se dibuja el bando claro
// (lona y marfil: w W o O b); el importador lo pasa a carmesí y turquesa. Piel, madera, latón,
// hierro, sombrero negro, hueso y fuego son fijos para los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/piratas/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1e1a26", // tinta: contorno e interiores
  w: "#f6efdc", W: "#e2d3ae", o: "#c3a878", O: "#94784c", b: "#665032", // lona y marfil (claro)
  s: "#f0c49c", S: "#c2875e", // piel
  n: "#9a5f36", N: "#5c381f", // madera
  y: "#ecc456", Y: "#a97b28", // latón
  m: "#dce2ea", M: "#8c97a8", X: "#555e72", // hierro y acero
  h: "#33303f", H: "#4d4a5c", // sombrero y paño negro
  g: "#efe9da", G: "#aca392", // hueso, barba cana, fregona
  e: "#ffb347", E: "#d9452b", // mecha y llama
});
ramps("bOoWw", "SsS", "NnN", "Yy", "XMm", "hH", "Gg");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Peón: grumete descalzo con pañuelo a la cabeza, camiseta a rayas y el lampazo de fregar la
// cubierta. El más bajito.
piece("pawn", { w: 22, h: 26 },
  // lampazo: palo y mechas en el suelo
  rect(17, 3, 2, 19, "n"), vline(18, 3, 19, "N"),
  rect(15, 21, 6, 2, "g"), hline(15, 22, 6, "G"), ...[15, 17, 19].map((x) => vline(x, 23, 3, "g")), ...[16, 18, 20].map((x) => vline(x, 23, 2, "G")),
  // piernas: calzón remangado, espinillas y pies descalzos
  rect(5, 19, 3, 3, "O"), rect(10, 19, 3, 3, "O"), vline(7, 19, 3, "b"), vline(12, 19, 3, "b"),
  rect(5, 22, 3, 2, "s"), rect(10, 22, 3, 2, "s"), rect(4, 24, 4, 2, "s"), rect(10, 24, 4, 2, "s"), hline(4, 25, 4, "S"), hline(10, 25, 4, "S"),
  // camiseta a rayas y faja
  rect(4, 13, 10, 6, "w"), rect(12, 13, 2, 6, "W"), ...[14, 16].map((y) => hline(4, y, 10, "o")), px(12, 14, "O"), px(13, 14, "O"), px(12, 16, "O"), px(13, 16, "O"),
  rect(4, 18, 10, 1, "b"), px(9, 18, "y"),
  // brazo que sujeta el lampazo y brazo suelto
  rect(14, 14, 3, 2, "w"), hline(14, 15, 3, "o"), rect(16, 13, 2, 3, "s"),
  rect(2, 14, 2, 4, "w"), hline(2, 15, 2, "o"), hline(2, 17, 2, "o"), rect(2, 18, 2, 1, "s"),
  // cara
  rect(4, 6, 10, 7, "s"), rect(12, 7, 2, 6, "S"), rect(6, 8, 1, 2, "k"), rect(11, 8, 1, 2, "k"), px(5, 10, "S"), hline(8, 11, 2, "S"),
  px(4, 6, "N"), px(4, 7, "N"), px(13, 6, "N"),
  // pañuelo con lunares y el nudo con las puntas al viento
  rect(4, 3, 10, 3, "o"), hline(5, 2, 8, "o"), hline(5, 3, 5, "W"), hline(4, 5, 10, "O"), px(7, 4, "w"), px(11, 3, "w"), px(10, 5, "w"),
  rect(14, 3, 2, 2, "O"), px(16, 4, "o"), px(17, 5, "o"), px(15, 5, "O"), px(16, 6, "O"),
);

// Torre: un barril enorme convertido en cofa, con la baranda almenada arriba, aros de hierro,
// la tronera oscura y la bandera negra en el mástil.
sprite("_rook0", { w: 26, h: 30, mx: true },
  // duelas del barril, panzudo en el centro
  poly([4, 11, 13, 11, 13, 30, 4, 30, 2, 26, 2, 15], "w"),
  ...[6, 10].map((x) => vline(x, 11, 19, "W")),
  // aros de hierro que siguen la panza
  clip([4, 11, 13, 11, 13, 30, 4, 30, 2, 26, 2, 15], rect(0, 13, 13, 1, "M"), rect(0, 14, 13, 1, "X"), rect(0, 25, 13, 1, "M"), rect(0, 26, 13, 1, "X")),
  // tronera
  rect(11, 17, 2, 5, "k"), rect(11, 22, 2, 1, "O"),
  // baranda de la cofa con sus almenas
  rect(1, 7, 12, 4, "o"), hline(1, 7, 12, "W"), hline(1, 10, 12, "O"),
  rect(1, 3, 3, 4, "o"), rect(6, 3, 3, 4, "o"), rect(11, 3, 2, 4, "o"), hline(1, 3, 3, "W"), hline(6, 3, 3, "W"), hline(11, 3, 2, "W"),
);
piece("rook", { base: "_rook0" },
  // sombra del lado derecho del barril
  ...[[19, 12, 3, 18], [22, 15, 2, 11]].map(([x, y, w, h]) => recolor({ w: "W", W: "o" }, [x, y, w, h])),
  recolor({ o: "O", W: "o" }, [17, 3, 8, 8]),
  // mástil y bandera negra con la calavera
  vline(13, 0, 3, "N"), rect(14, 0, 5, 3, "h"), px(16, 1, "g"), px(18, 0, "H"),
);

// Caballo: caballito de mar de perfil, mirando a la izquierda, con la cola enroscada y la aleta
// del lomo; encima un jinete de pañuelo con el arpón en alto.
piece("knight", { w: 28, h: 31 },
  // arpón detrás
  vline(24, 2, 20, "n"), rect(23, 2, 3, 1, "M"), px(24, 0, "m"), px(24, 1, "m"), px(23, 1, "M"), px(25, 1, "M"),
  // cola que baja y se enrosca
  line(12, 21, 10, 26, "w", 3), ring(13, 27, 3, "w"), ring(13, 27, 2, "W"), px(13, 27, "W"), rect(14, 24, 3, 2, "_"), px(16, 26, "_"),
  // cuerpo panzudo con los anillos del vientre
  ellipse(12, 16, 6, 6, "w"), ellipse(14, 17, 4, 5, "W"),
  ...[12, 14, 16, 18, 20].map((y) => hline(7, y, 3, "o")),
  // aleta del lomo
  poly([18, 12, 22, 14, 21, 20, 18, 20], "o"), vline(20, 14, 6, "O"),
  // cuello, cabeza de caballo y hocico de tubo
  line(10, 11, 12, 6, "w", 4), ellipse(9, 6, 4, 3, "w"), rect(0, 6, 6, 3, "w"), hline(0, 8, 6, "W"), px(0, 6, "W"),
  px(8, 5, "k"), px(9, 5, "k"), px(8, 4, "g"),
  // corona de púas en la cabeza
  px(9, 2, "o"), px(11, 2, "o"), px(12, 3, "o"), px(10, 1, "o"),
  // jinete: pierna, casaca, brazo con el arpón, cara y pañuelo
  rect(16, 13, 2, 4, "b"), rect(14, 8, 6, 6, "O"), rect(18, 8, 2, 6, "b"), hline(14, 12, 6, "N"),
  rect(20, 9, 4, 2, "O"), rect(23, 8, 2, 3, "s"),
  rect(15, 4, 5, 4, "s"), px(16, 5, "k"), px(19, 6, "S"),
  rect(15, 2, 5, 2, "o"), hline(16, 2, 3, "W"), px(20, 3, "o"), px(21, 4, "O"),
);

// Alfil: navegante de casaca larga y tricornio, mirando por el catalejo de latón.
piece("bishop", { w: 25, h: 30 },
  // casaca larga abierta, con faldones y botones
  poly([4, 14, 15, 14, 18, 28, 1, 28], "w"), poly([13, 15, 15, 14, 18, 28, 15, 28], "W"),
  poly([8, 15, 11, 15, 11, 28, 8, 28], "O"), vline(7, 15, 13, "y"), ...[17, 20, 23].map((y) => px(7, y, "Y")),
  hline(1, 27, 17, "o"),
  // botas
  rect(4, 28, 4, 2, "b"), rect(11, 28, 4, 2, "b"),
  // brazo que sostiene el catalejo
  rect(13, 12, 4, 3, "w"), rect(15, 11, 3, 3, "s"),
  // cara de perfil al ojo, con bigote cano
  rect(5, 7, 8, 6, "s"), rect(11, 8, 2, 5, "S"), px(7, 9, "k"), hline(6, 12, 4, "g"), px(5, 13, "g"),
  rect(2, 9, 3, 6, "G"), px(3, 15, "N"),
  // catalejo en tres tramos, apuntando arriba a la derecha
  line(11, 10, 15, 9, "Y", 2), line(15, 9, 19, 7, "y", 2), rect(19, 5, 3, 4, "y"), vline(19, 5, 4, "Y"), px(21, 5, "g"),
  // tricornio negro: dos picos arriba a los lados, el tercero delante, ribete de latón
  grid(1, 1, `
    hh......h......hh
    hhh...hhhhh...hhh
    .hhhHhhhhhhhhhhh.
    .hhHhhhhhhhhhhhh.
    ..hhhhhhhhhhhhh..
    ..yyyyyyyyyyyyy..
    .......yhy.......
    ........y........`),
);

// Reina: capitana de melena roja, sombrero de ala ancha con pluma del bando, casaca de faldones y
// el sable en alto.
piece("queen", { w: 26, h: 31 },
  // melena detrás
  rect(3, 7, 12, 11, "E"), rect(2, 10, 2, 9, "E"), px(14, 18, "E"),
  // casaca con faldones abiertos y faja
  poly([5, 15, 14, 15, 18, 29, 1, 29], "w"), poly([12, 16, 14, 15, 18, 29, 15, 29], "W"),
  poly([8, 18, 11, 18, 12, 29, 7, 29], "O"), rect(5, 15, 9, 3, "W"), hline(5, 18, 9, "o"), px(9, 18, "y"),
  vline(6, 19, 9, "y"),
  // botas altas
  rect(5, 29, 4, 2, "b"), rect(10, 29, 4, 2, "b"),
  // brazo y sable en alto: guarda de latón y hoja curva
  rect(14, 14, 3, 3, "w"), rect(16, 12, 3, 3, "s"),
  rect(16, 11, 4, 1, "y"), px(19, 12, "y"), line(18, 10, 22, 3, "m"), line(19, 10, 23, 3, "M"), px(23, 2, "m"), px(24, 1, "m"),
  // cara
  rect(5, 8, 9, 7, "s"), rect(12, 9, 2, 6, "S"), px(7, 10, "k"), px(11, 10, "k"), hline(8, 13, 2, "E"), px(6, 12, "S"),
  // sombrero de ala ancha, ladeado, con pluma
  rect(1, 6, 16, 2, "h"), rect(4, 3, 10, 3, "h"), hline(5, 2, 8, "h"), hline(4, 6, 10, "y"), px(6, 3, "H"), px(7, 2, "H"),
  line(6, 2, 1, 3, "w", 2), px(0, 4, "w"), px(0, 5, "w"), px(0, 6, "o"), px(3, 4, "o"), px(2, 2, "W"),
);

// Rey: capitán de casaca grande, sombrero enorme con la calavera y la pluma, barba negra
// trenzada, charreteras de latón y la pata de palo.
piece("king", { w: 28, h: 32 },
  // casaca con faldones, solapas y botones
  poly([4, 16, 20, 16, 24, 30, 0, 30], "w"), poly([18, 17, 20, 16, 24, 30, 20, 30], "W"),
  poly([9, 17, 15, 17, 16, 30, 8, 30], "o"), vline(12, 17, 13, "O"), ...[19, 22, 25].flatMap((y) => [px(10, y, "y"), px(14, y, "y")]),
  hline(4, 23, 16, "b"), rect(11, 23, 3, 1, "y"), px(12, 23, "Y"),
  // charreteras con flecos
  rect(2, 15, 5, 2, "y"), rect(17, 15, 5, 2, "y"), ...[2, 4, 6, 17, 19, 21].map((x) => px(x, 17, "Y")),
  // bota y pata de palo
  rect(7, 30, 4, 2, "b"), rect(14, 30, 2, 2, "n"), px(15, 30, "N"),
  // mano con el garfio
  rect(21, 18, 3, 3, "w"), rect(23, 21, 1, 2, "M"), px(24, 23, "m"), px(25, 22, "m"), px(25, 21, "M"),
  // cara y barba negra trenzada
  rect(7, 10, 10, 5, "s"), rect(15, 11, 2, 4, "S"), px(9, 12, "k"), px(14, 12, "k"),
  poly([6, 14, 18, 14, 16, 19, 13, 21, 11, 21, 8, 19], "h"), vline(10, 15, 4, "H"), vline(14, 15, 4, "H"), px(12, 21, "y"), hline(10, 14, 4, "E"),
  // sombrero enorme con ribete y la calavera
  rect(1, 8, 22, 2, "h"), rect(3, 3, 18, 5, "h"), hline(5, 2, 14, "h"), hline(8, 1, 8, "h"), hline(1, 9, 22, "y"),
  px(5, 3, "H"), px(4, 4, "H"), hline(9, 1, 4, "H"),
  rect(11, 4, 3, 2, "g"), px(11, 6, "g"), px(13, 6, "g"), px(11, 5, "k"), px(13, 5, "k"), px(9, 7, "g"), px(15, 7, "g"), px(10, 6, "G"), px(14, 6, "G"),
  // pluma del bando
  line(18, 3, 24, 1, "w", 2), px(25, 1, "w"), px(26, 2, "w"), px(26, 3, "w"), px(27, 4, "o"), px(22, 3, "o"), px(24, 3, "o"),
);

// Guardia: bucanero calvo de parche y pendiente, chaleco del bando, alfanje curvo delante y
// pistola al cinto.
piece("guard", { w: 24, h: 28 },
  // piernas y botas
  rect(6, 21, 4, 4, "O"), rect(12, 21, 4, 4, "O"), vline(9, 21, 4, "b"), vline(15, 21, 4, "b"), rect(5, 25, 5, 3, "b"), rect(12, 25, 5, 3, "b"),
  // torso desnudo y chaleco abierto del bando
  rect(5, 12, 12, 9, "s"), rect(14, 12, 3, 9, "S"),
  rect(5, 12, 4, 9, "w"), rect(13, 12, 4, 9, "W"), vline(8, 12, 9, "o"), vline(13, 12, 9, "o"),
  rect(5, 19, 12, 2, "N"), rect(10, 19, 2, 2, "y"), rect(12, 18, 3, 1, "X"), px(14, 17, "X"),
  // brazos: el izquierdo cruzado, el derecho con el alfanje
  rect(2, 13, 3, 6, "s"), rect(2, 13, 3, 2, "w"), rect(17, 13, 3, 4, "s"), rect(17, 13, 3, 2, "W"),
  rect(17, 17, 3, 2, "s"), rect(18, 16, 4, 1, "y"),
  poly([19, 16, 20, 16, 22, 10, 23, 4, 21, 1, 21, 6, 19, 12], "m"), line(20, 15, 22, 7, "M"),
  // cabeza calva con parche, cicatriz, bigote y pendiente
  rect(6, 3, 10, 9, "s"), rect(14, 4, 2, 8, "S"), hline(7, 2, 8, "s"), px(8, 3, "g"),
  line(6, 5, 15, 8, "h"), rect(7, 6, 3, 2, "h"), px(13, 7, "k"), hline(8, 10, 6, "N"), px(11, 11, "S"),
  px(16, 8, "y"), px(16, 9, "Y"),
);

// Consejero: el loro del capitán sobre su percha, mirando a la izquierda: pico ganchudo de
// hueso, ala recogida, cola larga colgando y la percha de madera con pie de latón. El plumaje
// es del bando: cacatúa, guacamayo rojo o guacamayo turquesa.
piece("advisor", { w: 22, h: 28 },
  // percha: barra, poste y pie
  rect(2, 17, 18, 2, "n"), hline(2, 18, 18, "N"), rect(10, 19, 2, 7, "n"), vline(11, 19, 7, "N"), rect(5, 26, 12, 2, "y"), hline(5, 27, 12, "Y"),
  // cola larga que cuelga por detrás de la barra
  poly([12, 14, 16, 14, 18, 25, 15, 26], "O"), line(14, 16, 16, 24, "b"),
  // cuerpo
  ellipse(10, 11, 5, 6, "w"), ellipse(12, 12, 3, 5, "W"),
  // ala recogida con las plumas del borde
  poly([11, 8, 15, 9, 16, 15, 13, 18, 10, 14], "o"), line(12, 10, 14, 16, "O"), px(15, 15, "O"), px(14, 17, "O"),
  // cabeza, ojo con su anillo y pico ganchudo
  circ(7, 5, 4, "w"), circ(8, 4, 2, "w"), px(7, 4, "g"), px(6, 4, "k"), px(5, 4, "g"),
  rect(1, 4, 3, 3, "G"), px(0, 5, "G"), px(0, 6, "G"), px(1, 7, "G"), px(2, 6, "k"), hline(2, 7, 2, "h"),
  // cresta de plumas
  px(7, 0, "o"), px(8, 1, "o"), px(5, 1, "o"), px(10, 1, "W"),
  // patas agarradas a la barra
  rect(8, 16, 1, 2, "G"), rect(11, 16, 1, 2, "G"), px(7, 17, "G"), px(10, 17, "G"),
);

// Elefante: morsa enorme recostada, con la cabeza en alto mirando a la izquierda, colmillos
// largos que cuelgan delante del pecho, bigote de cerdas, aletas y un tricornio diminuto.
piece("elephant", { w: 32, h: 27 },
  // aletas traseras
  poly([25, 21, 32, 19, 32, 27, 24, 27], "O"), line(28, 22, 31, 25, "b"),
  // cuerpo con los pliegues de grasa
  ellipse(20, 18, 11, 8, "w"), ellipse(21, 22, 10, 4, "W"), ...[[17, 12], [22, 11], [26, 13]].map(([x, y]) => line(x, y, x - 1, y + 6, "o")),
  // aleta delantera apoyada
  poly([10, 19, 15, 20, 17, 27, 9, 27], "O"), line(11, 22, 14, 26, "b"),
  // cuello y cabeza
  ellipse(11, 12, 5, 6, "w"), circ(8, 8, 5, "w"), ellipse(10, 10, 3, 4, "W"), px(6, 6, "k"), px(9, 6, "k"), px(6, 5, "g"),
  // hocico de cerdas
  ellipse(7, 12, 4, 2, "o"), ...[[5, 12], [7, 12], [9, 12], [4, 13], [6, 13], [8, 13], [10, 13]].map(([x, y]) => px(x, y, "O")), px(7, 10, "b"),
  // colmillos de hueso, fuera del cuerpo
  rect(4, 14, 2, 10, "g"), rect(8, 14, 2, 10, "g"), vline(5, 16, 7, "G"), vline(9, 16, 7, "G"),
  // tricornio diminuto
  rect(5, 2, 7, 2, "h"), hline(4, 3, 9, "h"), hline(4, 4, 9, "y"), px(5, 1, "h"), px(11, 1, "h"), px(8, 1, "h"), px(6, 2, "H"),
);

// Camello: cangrejo gigante de frente, con las pinzas en alto, los ojos en sus pedúnculos y
// las seis patas abiertas. El caparazón es del bando.
piece("camel", { w: 32, h: 26, mx: true },
  // patas abiertas, de tres tramos
  ...[[9, 18, 4, 22, 3, 25], [10, 20, 6, 24, 6, 25], [12, 21, 9, 24, 10, 25]].flatMap(([x0, y0, x1, y1, x2, y2]) => [line(x0, y0, x1, y1, "O", 2), line(x1, y1, x2, y2, "b")]),
  // brazos y pinzas en alto
  line(10, 15, 5, 11, "o", 3),
  grid(0, 0, `
    .ww...w..
    wwww..ww.
    wgww..wW.
    wwwW.wwW.
    wwwwwwwW.
    WwwwwwWW.
    .WwwwWWW.
    ..WWWWO..
    ...OOO...`),
  // caparazón con el reborde y las manchas
  ellipse(16, 16, 9, 6, "w"), ellipse(16, 19, 8, 3, "W"), hline(8, 18, 9, "o"), px(10, 14, "o"), px(13, 12, "o"),
  // ojos en los pedúnculos y boca
  vline(13, 7, 5, "O"), rect(12, 5, 3, 3, "g"), px(13, 6, "k"), px(12, 5, "w"),
  hline(14, 15, 2, "b"),
);

// Cañón: cañón de cubierta sobre su cureña de ruedas, apuntando a la izquierda, con la mecha
// encendida, el escobillón y una pila de balas al lado. La cureña va pintada del bando.
piece("cannon", { w: 31, h: 24 },
  // pila de balas
  ...[[24, 21], [28, 21], [26, 18]].map(([x, y]) => grid(x, y, ".M.\nMmX\n.X.")),
  // cureña escalonada del bando
  rect(6, 12, 17, 6, "w"), rect(14, 9, 9, 3, "w"), rect(18, 6, 5, 3, "w"),
  hline(6, 12, 8, "W"), hline(14, 9, 4, "W"), hline(18, 6, 5, "W"), rect(6, 16, 17, 2, "o"), vline(22, 6, 12, "o"),
  px(8, 14, "y"), px(20, 14, "y"), px(16, 11, "y"),
  // ruedas macizas de madera con el eje de hierro
  circ(9, 20, 3, "n"), ring(9, 20, 3, "N"), px(9, 20, "X"), circ(19, 20, 3, "n"), ring(19, 20, 3, "N"), px(19, 20, "X"),
  // tubo de hierro con zunchos, boca de latón y culata
  rect(2, 5, 19, 6, "M"), rect(2, 5, 19, 2, "m"), rect(2, 9, 19, 2, "X"),
  rect(0, 4, 3, 8, "y"), vline(2, 4, 8, "Y"), rect(0, 6, 1, 4, "k"),
  vline(8, 5, 6, "X"), vline(14, 5, 6, "X"), circ(21, 8, 3, "M"), circ(21, 7, 2, "m"), px(24, 8, "X"), px(25, 8, "X"),
  // mecha encendida
  px(17, 4, "N"), px(17, 3, "N"), px(18, 2, "e"), px(18, 1, "y"), px(19, 2, "E"),
);

// La hoja de control: el set entero de una vez.
sheet("piratas", ["pawn", "rook", "knight", "bishop", "queen", "king", "guard", "advisor", "elephant", "camel", "cannon"], { pad: 2 });
