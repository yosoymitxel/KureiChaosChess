// El set del tema "Pixelada": las once piezas de Zug como personajes de fantasía medieval, con el
// doble de píxeles que la primera versión (el juego los muestra a 1 píxel de arte por unidad, así
// ocupan lo mismo en pantalla y se leen mejor). Cada uno con una silueta propia: lanza, gólem
// almenado, jinete, mago con sombrero, hechicera, rey con capa, escudero, monje con farol, elefante
// de guerra, camello con jinete y enano artillero. La ropa usa la rampa del bando (w W o O b) y se
// recolorea; piel, metal, madera, barba y latón son fijos para los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/pixelada/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#2a2233", // tinta: contorno e interiores
  w: "#f8f0dc", W: "#e8d5ac", o: "#c9a468", O: "#9a7440", b: "#6b4d2c", // marfil y roble (claro)
  p: "#a48fce", P: "#7d63b0", q: "#5a4487", Q: "#3a2a5c", // ciruela (oscuro), la del tema Pixelada
  t: "#a8e8cd", T: "#5ec3a4", u: "#338f77", U: "#1f6152", // verdemar (salvaje)
  s: "#f1c5a0", S: "#c98e6c", // piel
  m: "#d6dde6", M: "#8a95a5", X: "#5d6676", // metal
  n: "#9a6a3e", N: "#5e3c22", // madera
  g: "#e9e6df", G: "#a9a49a", // barba y pelo canos
  y: "#f0c85a", Y: "#b08530", // latón
  f: "#9fe3ff", F: "#4aa8d8", // luz de magia
  e: "#ffb347", E: "#e2552b", // fuego del farol y la mecha
});
ramps("bOoWw", "QqPp", "UuTt", "SsS", "XMm", "Yy");

const DARK = { w: "p", W: "P", o: "q", O: "Q", b: "Q" };
const WILD = { w: "t", W: "T", o: "u", O: "U", b: "U" };

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name + "_l", { base: "_" + name, outline: "k" });
  sprite(name + "_d", { base: "_" + name, swap: DARK, outline: "k" });
  sprite(name + "_w", { base: "_" + name, swap: WILD, outline: "k" });
};

// Peón: soldadito de casco redondo con la lanza al hombro. El más bajito.
piece("pawn", { w: 22, h: 30 },
  // lanza
  rect(17, 6, 2, 23, "n"), vline(18, 6, 23, "N"),
  rect(17, 1, 2, 5, "m"), px(18, 0, "g"), px(17, 1, "g"), rect(16, 3, 1, 2, "M"), rect(19, 3, 1, 2, "M"), rect(16, 6, 4, 1, "y"),
  // cuerpo, cinturón y hombreras
  rect(3, 16, 11, 8, "w"), rect(12, 17, 2, 7, "W"), rect(3, 16, 11, 1, "o"), px(3, 17, "o"), px(13, 17, "o"),
  rect(3, 21, 11, 1, "N"), px(8, 21, "y"),
  // brazo que sujeta la lanza
  rect(13, 17, 3, 3, "w"), rect(15, 17, 2, 3, "s"),
  // piernas y botas
  rect(4, 24, 3, 4, "O"), rect(10, 24, 3, 4, "O"), rect(3, 28, 5, 2, "b"), rect(9, 28, 5, 2, "b"),
  // cara
  rect(4, 10, 9, 6, "s"), rect(6, 12, 1, 2, "k"), rect(10, 12, 1, 2, "k"), px(5, 14, "S"), px(11, 14, "S"),
  // casco
  ellipse(8, 7, 6, 4, "m"), rect(2, 9, 13, 2, "M"), px(5, 5, "g"), px(6, 4, "g"), rect(3, 10, 11, 1, "X"),
);

// Torre: gólem de piedra con la cabeza almenada como una torre y puños enormes.
piece("rook", { w: 30, h: 32, mx: true },
  // piernas y pies
  rect(8, 22, 4, 6, "o"), rect(8, 22, 1, 6, "W"), rect(7, 28, 6, 3, "b"),
  // cuerpo de sillares
  rect(5, 12, 10, 10, "w"), rect(5, 19, 10, 3, "W"), hline(5, 15, 10, "W"), vline(10, 12, 3, "W"), vline(7, 15, 4, "W"), vline(13, 15, 4, "W"),
  // brazos y puños
  rect(0, 13, 5, 8, "o"), rect(1, 13, 2, 8, "w"), rect(0, 21, 6, 5, "O"), rect(1, 21, 4, 3, "o"), px(2, 25, "W"),
  // cabeza almenada
  rect(6, 4, 9, 8, "w"), rect(6, 4, 1, 8, "W"), rect(7, 1, 3, 3, "w"), rect(12, 1, 3, 3, "w"),
  rect(9, 7, 2, 2, "k"), px(9, 7, "y"), hline(11, 10, 4, "k"),
);

// Caballo: jinete con lanza sobre un caballo de perfil mirando a la izquierda.
piece("knight", { w: 30, h: 32 },
  // lanza
  rect(22, 2, 1, 15, "n"), rect(21, 1, 3, 1, "y"), px(22, 0, "m"),
  // cola y patas de atrás
  line(27, 15, 29, 23, "b", 2), rect(22, 22, 2, 7, "W"), rect(25, 21, 3, 8, "W"), rect(22, 28, 3, 2, "b"), rect(25, 28, 3, 2, "b"),
  // cuerpo del caballo
  ellipse(18, 18, 10, 5, "w"), ellipse(18, 21, 9, 2, "W"),
  rect(10, 22, 3, 7, "W"), rect(14, 22, 2, 7, "w"), rect(10, 28, 3, 2, "b"), rect(14, 28, 3, 2, "b"),
  // cuello, cabeza y crin
  line(9, 12, 13, 18, "w", 4), poly([1, 10, 6, 7, 10, 9, 10, 15, 5, 16, 1, 14], "w"),
  px(6, 6, "w"), px(7, 5, "W"), px(4, 10, "k"), px(1, 13, "k"), line(8, 8, 12, 15, "b", 2),
  // silla
  rect(14, 13, 8, 3, "o"), rect(14, 15, 8, 1, "y"),
  // jinete: cuerpo, brazo y yelmo con penacho
  rect(15, 9, 7, 5, "w"), rect(20, 9, 2, 5, "W"), rect(20, 10, 2, 3, "m"),
  rect(16, 4, 6, 5, "m"), rect(16, 4, 1, 5, "M"), hline(17, 6, 5, "k"), px(18, 3, "o"), px(19, 2, "o"), px(20, 2, "o"),
);

// Alfil: mago de sombrero puntiagudo, barba larga y bastón con la piedra encendida.
piece("bishop", { w: 26, h: 32 },
  // bastón con la piedra
  rect(21, 5, 2, 25, "n"), vline(22, 5, 25, "N"), circ(22, 3, 2, "F"), circ(22, 3, 1, "f"), px(21, 2, "g"),
  // túnica
  poly([4, 17, 16, 17, 20, 30, 0, 30], "w"), poly([14, 18, 16, 17, 20, 30, 16, 30], "W"), rect(0, 30, 21, 2, "b"),
  // mano en el bastón
  rect(18, 16, 3, 3, "s"),
  // cara y barba
  rect(6, 12, 8, 5, "s"), px(8, 14, "k"), px(11, 14, "k"),
  poly([5, 17, 15, 17, 13, 25, 10, 27, 7, 25], "g"), vline(10, 18, 7, "G"), vline(8, 19, 4, "G"), vline(12, 19, 4, "G"),
  // sombrero de ala ancha con la punta caída
  poly([9, 0, 12, 1, 17, 11, 3, 11], "w"), poly([12, 1, 17, 11, 13, 11], "W"),
  rect(1, 11, 18, 2, "o"), rect(5, 10, 10, 1, "y"), px(10, 6, "y"), px(9, 7, "y"), px(11, 7, "y"), px(10, 8, "y"),
);

// Reina: hechicera con corona de tres puntas, melena y vestido largo; la varita con estrella.
piece("queen", { w: 26, h: 32 },
  // melena detrás
  rect(3, 5, 13, 13, "N"), rect(4, 5, 11, 2, "n"),
  // vestido
  poly([5, 15, 14, 15, 19, 30, 0, 30], "w"), poly([12, 16, 14, 15, 19, 30, 15, 30], "W"),
  vline(6, 21, 9, "W"), vline(10, 21, 9, "W"), hline(6, 15, 8, "y"), px(9, 17, "f"), rect(0, 30, 20, 2, "b"),
  // brazo y varita con estrella
  rect(15, 16, 3, 4, "s"), line(17, 16, 21, 7, "n"), px(22, 5, "y"), px(21, 6, "y"), px(23, 6, "y"), px(22, 7, "y"), px(22, 6, "f"), px(22, 4, "y"),
  // cara
  rect(5, 7, 9, 7, "s"), px(7, 9, "k"), px(11, 9, "k"), px(9, 12, "E"), px(10, 12, "E"),
  // corona
  rect(5, 2, 9, 3, "y"), rect(5, 4, 9, 1, "Y"), px(5, 0, "y"), px(5, 1, "y"), px(9, 0, "y"), px(9, 1, "y"), px(13, 0, "y"), px(13, 1, "y"),
  px(7, 3, "f"), px(11, 3, "f"),
);

// Rey: corona grande con gemas, barba ancha, capa abierta con armiño y cetro de latón.
piece("king", { w: 28, h: 32 },
  // cetro
  rect(23, 6, 1, 21, "y"), vline(24, 7, 19, "Y"), circ(23, 4, 2, "y"), px(23, 4, "f"),
  // capa y túnica con armiño
  poly([3, 11, 20, 11, 24, 30, 0, 30], "o"), poly([18, 12, 20, 11, 24, 30, 20, 30], "O"),
  rect(7, 14, 9, 16, "w"), rect(14, 14, 2, 16, "W"), px(11, 24, "y"),
  vline(6, 11, 19, "g"), vline(17, 11, 19, "g"), ...[14, 18, 22, 26].flatMap((y) => [px(6, y, "k"), px(17, y, "k")]),
  rect(0, 30, 24, 2, "b"),
  // mano en el cetro
  rect(19, 14, 4, 3, "s"),
  // cara y barba
  rect(6, 6, 11, 5, "s"), px(9, 8, "k"), px(14, 8, "k"), px(11, 9, "S"),
  poly([5, 10, 18, 10, 16, 18, 11, 21, 7, 18], "g"), vline(9, 12, 6, "G"), vline(13, 12, 6, "G"),
  // corona
  rect(5, 2, 13, 4, "y"), rect(5, 5, 13, 1, "Y"), ...[5, 9, 13, 17].flatMap((x) => [px(x, 0, "y"), px(x, 1, "y")]),
  px(8, 3, "f"), px(14, 3, "f"), px(11, 3, "E"),
);

// Guardia: escudero de yelmo con penacho, escudo redondo delante con la cruz de latón.
piece("guard", { w: 24, h: 30 },
  // piernas y botas
  rect(6, 22, 3, 5, "O"), rect(13, 22, 3, 5, "O"), rect(5, 27, 5, 2, "b"), rect(12, 27, 5, 2, "b"),
  // cuerpo
  rect(5, 12, 12, 10, "w"), rect(15, 12, 2, 10, "W"),
  // escudo con la cruz
  circ(10, 17, 6, "O"), circ(10, 17, 5, "w"), rect(9, 12, 2, 11, "y"), rect(5, 16, 11, 2, "y"), px(10, 17, "Y"),
  // barbilla y yelmo con visera y penacho
  rect(7, 10, 8, 2, "s"),
  rect(5, 3, 12, 7, "m"), rect(15, 3, 2, 7, "M"), rect(6, 6, 10, 1, "k"), px(7, 4, "g"), rect(5, 9, 12, 1, "X"),
  line(10, 2, 13, 0, "o", 2),
);

// Consejero: monje de capucha honda, ojos en la sombra, cuerda a la cintura y farol encendido.
piece("advisor", { w: 24, h: 30 },
  // hábito
  poly([3, 13, 17, 13, 20, 28, 0, 28], "w"), poly([14, 14, 17, 13, 20, 28, 16, 28], "W"),
  vline(7, 19, 9, "W"), hline(5, 18, 11, "y"), vline(11, 18, 4, "y"), rect(0, 28, 21, 2, "b"),
  // capucha con la cara en sombra
  ellipse(10, 7, 7, 7, "w"), ellipse(13, 8, 4, 6, "W"), ellipse(10, 9, 4, 4, "b"), px(8, 9, "g"), px(12, 9, "g"),
  // mano, cadena y farol
  rect(17, 14, 3, 3, "s"), vline(20, 15, 3, "M"), rect(19, 18, 4, 5, "M"), rect(20, 19, 2, 3, "e"), px(20, 20, "E"), rect(20, 17, 2, 1, "X"),
);

// Elefante: elefante de guerra de perfil con trompa, colmillo y una torrecilla en el lomo.
piece("elephant", { w: 32, h: 28 },
  // cola y patas de atrás
  line(30, 13, 31, 18, "b"), rect(25, 20, 4, 6, "W"), rect(21, 21, 3, 5, "w"),
  // cuerpo
  ellipse(18, 15, 12, 7, "w"), ellipse(18, 18, 11, 4, "W"),
  // patas de delante
  rect(9, 20, 4, 6, "W"), rect(14, 21, 3, 5, "w"),
  ...[[9, 26], [14, 26], [21, 26], [25, 26]].map(([x, y]) => rect(x, y, 4, 2, "b")),
  // manta con flecos y torrecilla
  rect(12, 7, 14, 4, "o"), hline(12, 10, 14, "y"), ...[13, 16, 19, 22, 25].map((x) => px(x, 11, "y")),
  rect(14, 2, 10, 5, "y"), ...[14, 17, 20, 23].flatMap((x) => [px(x, 0, "y"), px(x, 1, "y")]), rect(16, 3, 6, 2, "w"), rect(14, 6, 10, 1, "Y"),
  // cabeza, oreja, trompa y colmillo
  circ(7, 11, 6, "w"), ellipse(10, 12, 3, 5, "W"), px(5, 9, "k"),
  line(3, 13, 1, 22, "w", 3), px(2, 23, "w"), line(5, 16, 2, 19, "g"),
);

// Camello: camello de perfil con jinete de turbante entre las dos jorobas.
piece("camel", { w: 32, h: 30 },
  // cola y patas de atrás
  line(29, 15, 31, 20, "b"), rect(26, 21, 2, 7, "W"), rect(22, 21, 2, 7, "w"),
  // cuerpo y jorobas
  ellipse(18, 17, 11, 5, "w"), circ(13, 12, 4, "w"), circ(23, 12, 4, "w"), ellipse(18, 20, 10, 2, "W"),
  // patas de delante
  rect(10, 21, 2, 7, "W"), rect(14, 21, 2, 7, "w"),
  ...[[10, 28], [14, 28], [22, 28], [26, 28]].map(([x, y]) => rect(x - 1, y, 4, 2, "b")),
  // cuello y cabeza
  line(8, 16, 5, 9, "w", 3), ellipse(3, 8, 3, 2, "w"), rect(0, 8, 3, 3, "w"), px(3, 7, "k"), px(5, 6, "W"), px(0, 10, "k"),
  // manta con flecos
  rect(15, 11, 5, 4, "o"), hline(15, 14, 5, "y"),
  // jinete de turbante
  rect(15, 8, 5, 5, "w"), rect(18, 8, 2, 5, "W"), rect(15, 5, 5, 3, "s"), px(16, 6, "k"),
  circ(17, 3, 3, "y"), hline(14, 4, 7, "Y"), px(17, 0, "e"),
);

// Cañón: enano artillero de barba trenzada junto a su cañón con la mecha encendida.
piece("cannon", { w: 32, h: 26 },
  // rueda y cureña
  rect(14, 10, 10, 4, "N"), circ(20, 18, 5, "n"), ring(20, 18, 5, "N"), line(16, 18, 24, 18, "N"), line(20, 14, 20, 22, "N"), circ(20, 18, 1, "y"),
  // cañón con zunchos
  circ(15, 7, 3, "X"), rect(15, 4, 15, 6, "M"), rect(15, 4, 15, 2, "m"), rect(29, 3, 3, 8, "X"), vline(19, 4, 6, "X"), vline(24, 4, 6, "X"),
  // mecha encendida
  px(14, 3, "n"), px(13, 2, "e"), px(13, 1, "y"),
  // enano: piernas, cuerpo, cinturón
  rect(2, 19, 3, 4, "O"), rect(6, 19, 3, 4, "O"), rect(1, 23, 4, 3, "b"), rect(6, 23, 4, 3, "b"),
  rect(1, 10, 9, 9, "w"), rect(8, 10, 2, 9, "W"), hline(1, 16, 9, "N"), px(5, 16, "y"),
  // brazo con la tea
  rect(9, 11, 3, 2, "s"), line(11, 10, 12, 5, "n"), px(12, 4, "e"),
  // cara, barba trenzada y gorro
  rect(2, 5, 7, 4, "s"), px(4, 6, "k"), px(7, 6, "k"),
  poly([1, 9, 9, 9, 8, 17, 5, 19, 2, 17], "g"), vline(4, 10, 7, "G"), vline(6, 10, 7, "G"), px(5, 19, "y"),
  ellipse(5, 3, 4, 2, "o"), rect(1, 4, 9, 1, "O"),
);

// La hoja de control: una fila por bando para mirar el set entero de una vez.
sheet("pixelada", ["*_l", "*_d", "*_w"], { pad: 2 });
