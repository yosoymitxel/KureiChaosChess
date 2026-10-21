// El set del tema "Ñandutí": las once piezas de Zug como gente, bichos y cosas del Paraguay
// campesino. Campesino de sombrero pirí con su azada, óga yvate (casa alta de adobe encalado),
// jinete de poncho para'i sobre un caballo criollo, Jasy Jatere con su bastón de oro, galopera
// con el cántaro en la cabeza, patriarca con la guampa de tereré, Pombero pícaro, abuela yuyera
// con su mortero, mborevi (tapir), ñandú y el mortero de madera que lanza la pelota tata.
// Solo se dibuja el bando claro: marfil (w W o) y el azul de la bandera como acento (a A). El
// importador lo pasa a terracota con ocre y a verde monte con rosa lapacho. Piel, paja, madera,
// barro, oro, pelo cano, metal, hojas y fuego son fijos para los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/paraguay/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1e1612", // tinta: contorno e interiores
  w: "#f4ecda", W: "#ddd0b2", o: "#b8a27a", a: "#2f5fc4", A: "#1b2f7e", // marfil y azul (claro)
  s: "#e3ad84", S: "#b07650", // piel
  h: "#ead08a", H: "#b8964e", // paja de karanda'y
  n: "#9a5e34", N: "#5c381c", // madera
  c: "#c9733f", C: "#8e4626", // barro cocido
  y: "#f2c64e", Y: "#b48a2c", // oro y pelo rubio
  g: "#efe9dc", G: "#aaa292", // pelo cano, guampa, plumas grises
  m: "#d6dde6", M: "#8a95a5", // metal
  r: "#a26a42", R: "#6c4428", // pelaje del caballo
  t: "#6a5e58", T: "#463c38", // pelaje del tapir
  p: "#6e5444", P: "#4a382c", // pelo del Pombero
  v: "#86b552", V: "#4c7c34", // yuyos
  e: "#ffb347", E: "#e2552b", F: "#ffe58a", // fuego
  l: "#e98ab8", // flor de lapacho
});
ramps("oWw", "Aa", "SsS", "Hh", "NnN", "Cc", "Yy", "Gg", "Mm", "Rr", "Tt", "Pp", "Vv");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Peón: campesino de sombrero pirí, camisa del bando, faja y bombacha azul, con la azada al
// hombro. El más bajito.
piece("pawn", { w: 22, h: 26 },
  // azada: cabo y hoja
  rect(18, 3, 2, 22, "n"), vline(19, 3, 22, "N"), rect(14, 2, 4, 3, "m"), hline(14, 4, 4, "M"), px(14, 2, "M"),
  // bombacha y alpargatas
  rect(5, 20, 4, 4, "a"), rect(10, 20, 4, 4, "a"), vline(8, 20, 4, "A"), vline(13, 20, 4, "A"),
  rect(4, 24, 5, 2, "N"), rect(10, 24, 5, 2, "N"),
  // camisa, faja y brazo suelto
  rect(4, 15, 11, 5, "w"), rect(12, 15, 3, 5, "W"), px(9, 15, "o"), px(9, 16, "o"),
  rect(4, 19, 11, 1, "A"), px(10, 19, "a"),
  rect(2, 15, 2, 4, "w"), vline(3, 15, 4, "W"), rect(2, 19, 2, 2, "s"),
  // brazo que sujeta la azada
  rect(15, 15, 2, 3, "w"), rect(16, 14, 3, 3, "s"), px(18, 15, "S"),
  // cara
  rect(5, 9, 9, 6, "s"), rect(12, 9, 2, 6, "S"), px(7, 11, "k"), px(11, 11, "k"), px(7, 12, "k"), px(11, 12, "k"),
  px(6, 13, "S"), hline(8, 14, 3, "S"),
  // sombrero pirí: copa con cinta del bando y ala ancha
  rect(5, 2, 9, 5, "h"), hline(6, 1, 7, "h"), rect(12, 2, 2, 5, "H"), hline(5, 5, 9, "a"), px(7, 3, "w"),
  rect(0, 7, 19, 2, "h"), hline(1, 8, 17, "H"), px(0, 8, "H"), px(18, 8, "H"),
);

// Torre: óga yvate, la casa alta de adobe encalado, con techo de tejas, postigos y puerta
// pintados del color del bando y zócalo azul.
sprite("_rook0", { w: 26, h: 30, mx: true },
  // techo de tejas a cuatro aguas
  poly([10, 0, 13, 0, 13, 9, 0, 9, 1, 7], "c"),
  clip([10, 0, 13, 0, 13, 9, 0, 9, 1, 7], ...[3, 6, 9, 12].map((x) => vline(x, 0, 9, "C"))),
  hline(0, 8, 13, "C"), hline(1, 9, 12, "k"),
  // paredes encaladas
  rect(2, 10, 11, 18, "w"), hline(2, 10, 11, "W"), hline(2, 18, 11, "W"),
  // ventanitas laterales
  rect(4, 12, 2, 4, "A"), rect(4, 20, 2, 4, "A"),
  // balcón de arriba con postigos abiertos y baranda
  rect(9, 11, 4, 6, "a"), rect(11, 12, 2, 5, "k"), vline(9, 11, 6, "A"),
  hline(8, 17, 5, "N"), ...[9, 11].map((x) => vline(x, 15, 2, "N")),
  // puerta de dos hojas
  rect(10, 20, 3, 8, "a"), vline(12, 21, 7, "A"), px(10, 20, "w"), px(11, 24, "y"),
  // zócalo pintado y la vereda
  rect(2, 25, 8, 3, "a"), hline(2, 25, 8, "A"),
  rect(1, 28, 12, 2, "o"), hline(1, 28, 12, "W"),
);
piece("rook", { base: "_rook0" },
  // sombra a la derecha: el sol viene de arriba a la izquierda
  rect(21, 10, 3, 15, "W"), rect(21, 25, 3, 3, "A"), rect(13, 1, 10, 8, "C"),
  clip([13, 0, 16, 0, 25, 7, 26, 9, 13, 9], ...[13, 16, 19, 22].map((x) => vline(x, 0, 9, "c"))),
  hline(13, 8, 13, "C"), vline(15, 21, 7, "A"),
);

// Caballo: jinete de sombrero y poncho para'i de listas finas sobre un caballo criollo de
// perfil, mirando a la izquierda. El pelero de la montura es del color del bando.
piece("knight", { w: 30, h: 30 },
  // cola y patas de atrás
  line(27, 14, 29, 22, "N", 2), rect(22, 21, 2, 7, "R"), rect(25, 20, 3, 8, "r"), rect(22, 28, 2, 2, "N"), rect(25, 28, 3, 2, "N"),
  // cuerpo del caballo
  ellipse(18, 17, 10, 5, "r"), ellipse(18, 20, 9, 2, "R"),
  rect(10, 21, 3, 7, "R"), rect(14, 21, 2, 7, "r"), rect(10, 28, 3, 2, "N"), rect(14, 28, 2, 2, "N"),
  // cuello, cabeza, crin y riendas
  line(9, 11, 13, 17, "r", 4), poly([1, 9, 6, 6, 10, 8, 10, 14, 5, 15, 1, 13], "r"), rect(1, 11, 3, 3, "R"),
  px(6, 5, "r"), px(7, 4, "R"), px(4, 9, "k"), px(1, 12, "k"), line(8, 7, 12, 14, "N", 2),
  line(4, 12, 13, 11, "N"),
  // pelero del bando con sus listas
  rect(12, 13, 11, 4, "a"), hline(12, 13, 11, "A"), ...[13, 16, 19, 22].map((x) => vline(x, 14, 3, "w")),
  // pierna del jinete con la bota
  rect(15, 15, 3, 5, "o"), rect(15, 20, 3, 2, "N"),
  // poncho para'i: blanco con listas finas, guarda azul y flecos
  poly([15, 6, 21, 6, 24, 15, 12, 15], "w"),
  clip([15, 6, 21, 6, 24, 15, 12, 15], ...[13, 16, 19, 22].map((x) => vline(x, 6, 9, "W")), rect(21, 6, 4, 9, "W"), hline(11, 13, 14, "a")),
  ...[12, 14, 16, 18, 20, 22].map((x) => px(x, 15, "o")),
  // mano con las riendas
  rect(12, 10, 2, 2, "s"),
  // cara y sombrero
  rect(16, 2, 5, 4, "s"), rect(19, 2, 2, 4, "S"), px(17, 3, "k"),
  rect(16, 0, 5, 2, "h"), hline(16, 1, 5, "a"), hline(14, 2, 9, "h"), px(22, 2, "H"),
);

// Alfil: Jasy Jatere, el niño rubio de la siesta, de melena revuelta, con su bastón de oro más
// alto que él. Ropa del bando con la faja azul.
piece("bishop", { w: 24, h: 30 },
  // bastón de oro con el pomo
  rect(19, 4, 2, 26, "y"), vline(20, 4, 26, "Y"), circ(20, 2, 2, "y"), px(19, 1, "F"), px(21, 3, "Y"), px(20, 4, "Y"),
  // piernas y pies descalzos
  rect(6, 25, 3, 3, "s"), rect(11, 25, 3, 3, "s"), vline(8, 25, 3, "S"), vline(13, 25, 3, "S"),
  rect(5, 28, 4, 2, "s"), rect(11, 28, 4, 2, "s"), hline(5, 29, 4, "S"), hline(11, 29, 4, "S"),
  // camisola del bando
  poly([5, 16, 15, 16, 17, 25, 3, 25], "w"), poly([13, 16, 15, 16, 17, 25, 14, 25], "W"),
  hline(3, 24, 14, "o"), rect(4, 21, 12, 1, "a"), px(10, 21, "A"), vline(10, 16, 3, "o"),
  // brazo suelto y brazo que sujeta el bastón
  rect(2, 17, 2, 5, "w"), vline(3, 17, 5, "W"), rect(2, 22, 2, 2, "s"),
  rect(15, 17, 3, 2, "w"), rect(17, 16, 3, 3, "s"), px(19, 17, "S"),
  // cara de niño
  rect(5, 9, 10, 7, "s"), rect(13, 10, 2, 6, "S"), rect(7, 11, 1, 2, "k"), rect(12, 11, 1, 2, "k"), px(6, 13, "l"), px(13, 13, "l"),
  hline(9, 14, 2, "S"),
  // melena rubia revuelta
  ellipse(10, 6, 7, 5, "y"), rect(3, 7, 2, 6, "y"), rect(15, 7, 2, 5, "Y"), rect(5, 9, 10, 1, "y"),
  px(7, 10, "y"), px(11, 10, "y"), px(4, 1, "y"), px(9, 0, "y"), px(14, 1, "Y"), px(3, 13, "Y"),
  hline(6, 3, 4, "F"), px(12, 4, "Y"), px(14, 6, "Y"), px(8, 8, "Y"), px(12, 8, "Y"),
);

// Reina: galopera con el cántaro en la cabeza, blusa con encaje de ñandutí y la pollera del
// bando abierta con las dos manos, como en el baile.
piece("queen", { w: 26, h: 31 },
  // cántaro de barro sobre el rodete
  rect(11, 0, 4, 2, "c"), hline(10, 0, 6, "C"), ellipse(12, 4, 4, 2, "c"), px(14, 2, "C"), rect(14, 3, 3, 3, "C"), px(10, 3, "F"),
  hline(9, 7, 8, "w"),
  // pelo negro con la flor de lapacho
  rect(8, 8, 10, 6, "N"), rect(7, 9, 2, 5, "N"), px(17, 9, "l"), px(18, 10, "l"), px(17, 11, "l"),
  // cara
  rect(9, 9, 8, 6, "s"), rect(15, 10, 2, 5, "S"), px(11, 11, "k"), px(14, 11, "k"), hline(12, 13, 2, "E"),
  // blusa con encaje de ñandutí y faja
  rect(9, 15, 8, 4, "w"), rect(15, 15, 2, 4, "W"), hline(9, 15, 8, "W"), ...[10, 12, 14].map((x) => px(x, 16, "o")), hline(9, 19, 8, "a"),
  // pollera del bando, abierta en abanico, con dos cintas azules y el borde de encaje
  poly([9, 20, 17, 20, 25, 22, 24, 30, 2, 30, 1, 22], "w"),
  clip([9, 20, 17, 20, 25, 22, 24, 30, 2, 30, 1, 22], poly([15, 20, 17, 20, 25, 22, 24, 30, 18, 30], "W"),
    rect(0, 24, 26, 1, "a"), rect(0, 27, 26, 1, "a"), line(10, 20, 7, 30, "W"), line(13, 21, 13, 30, "W"), line(16, 20, 19, 30, "o")),
  ...[3, 6, 9, 12, 15, 18, 21].map((x) => px(x + 1, 29, "o")), hline(3, 30, 21, "W"),
  // brazos abiertos con las mangas de encaje y las manos que levantan la pollera
  rect(7, 15, 2, 2, "w"), rect(17, 15, 2, 2, "W"), line(7, 17, 3, 21, "s"), line(18, 17, 22, 21, "s"),
  rect(1, 21, 2, 2, "s"), rect(23, 21, 2, 2, "S"),
);

// Rey: el patriarca de bigote cano bajo un sombrero alto con cinta del bando, poncho con guarda
// y flecos, y la guampa de tereré con su bombilla en la mano.
piece("king", { w: 28, h: 32 },
  // botas
  rect(9, 29, 4, 3, "N"), rect(15, 29, 4, 3, "N"),
  // poncho con listas finas y guarda azul
  poly([8, 13, 20, 13, 27, 29, 1, 29], "w"),
  clip([8, 13, 20, 13, 27, 29, 1, 29], ...[4, 8, 12, 16, 20, 24].map((x) => vline(x, 13, 16, "W")), poly([17, 13, 20, 13, 27, 29, 21, 29], "W"),
    rect(0, 24, 28, 1, "a"), rect(0, 26, 28, 1, "A")),
  ...[2, 5, 8, 11, 14, 17, 20, 23, 26].map((x) => px(x, 29, "o")),
  // cuello del poncho
  rect(11, 13, 6, 2, "o"), rect(12, 13, 4, 1, "W"),
  // mano y guampa de tereré con la bombilla
  rect(19, 18, 3, 3, "s"), rect(22, 16, 4, 6, "G"), vline(22, 17, 4, "g"), px(23, 17, "g"), hline(22, 15, 4, "m"), hline(22, 16, 4, "M"), px(22, 21, "."), px(25, 21, "."),
  line(24, 15, 26, 10, "m"), px(26, 10, "M"),
  // cara y bigote cano
  rect(9, 8, 10, 6, "s"), rect(17, 8, 2, 6, "S"), px(11, 10, "k"), px(16, 10, "k"),
  rect(10, 12, 8, 1, "g"), px(10, 13, "g"), px(17, 13, "g"), px(9, 9, "g"), px(9, 10, "G"), hline(12, 13, 4, "S"),
  // sombrero alto con cinta del bando y ala ancha
  rect(9, 1, 10, 5, "h"), hline(10, 0, 8, "h"), rect(17, 1, 2, 5, "H"), rect(9, 4, 10, 2, "a"), hline(9, 5, 10, "A"), px(11, 2, "w"),
  rect(3, 6, 22, 2, "h"), hline(4, 7, 20, "H"),
);

// Guardia: el Pombero, petiso y peludo, con el sombrero de paja hundido hasta los ojos, una
// sonrisa pícara, un ponchito del bando y su bastón de monte.
piece("guard", { w: 22, h: 26 },
  // bastón de monte
  rect(18, 7, 2, 19, "n"), vline(19, 7, 19, "N"), px(17, 9, "n"), px(16, 8, "n"),
  // piernas peludas y pies
  rect(6, 21, 3, 3, "p"), rect(12, 21, 3, 3, "p"), rect(5, 24, 5, 2, "P"), rect(11, 24, 5, 2, "P"),
  // cuerpo peludo y brazos largos hasta las rodillas
  ellipse(10, 18, 7, 5, "p"), ellipse(12, 20, 5, 2, "P"),
  rect(1, 17, 3, 5, "p"), vline(1, 18, 4, "P"), rect(1, 21, 3, 2, "P"),
  // ponchito del bando que lo cubre hasta las rodillas, con las listas, la guarda y los flecos
  poly([5, 11, 15, 11, 18, 20, 2, 20], "w"),
  clip([5, 11, 15, 11, 18, 20, 2, 20], rect(13, 11, 6, 10, "W"), ...[6, 9, 12].map((x) => vline(x, 12, 4, "W")), rect(0, 16, 22, 1, "a"), rect(0, 18, 22, 1, "A")),
  ...[3, 5, 7, 9, 11, 13, 15, 17].map((x) => px(x, 20, "o")),
  // la mano peluda que agarra el bastón
  rect(16, 13, 3, 3, "P"), px(16, 13, "p"),
  // cara peluda con ojos que brillan y la sonrisa
  rect(4, 6, 12, 6, "p"), rect(5, 7, 10, 4, "P"), rect(6, 7, 3, 2, "y"), rect(11, 7, 3, 2, "y"), px(7, 8, "k"), px(12, 8, "k"),
  hline(7, 10, 6, "k"), px(8, 10, "g"), px(11, 10, "g"), px(6, 9, "k"), px(13, 9, "k"),
  // sombrero de paja hundido, con el ala deshilachada
  rect(6, 0, 9, 4, "h"), rect(13, 0, 2, 4, "H"), hline(6, 3, 9, "a"),
  rect(1, 4, 19, 2, "h"), hline(2, 5, 17, "H"), px(1, 5, "."), px(19, 5, "."), px(4, 6, "h"), px(15, 6, "H"), px(17, 6, "h"),
);

// Consejero: la abuela yuyera, rodete cano, chal del bando con flecos, machacando pohã ñana
// en su mortero de madera.
piece("advisor", { w: 24, h: 28 },
  // pollera larga y pies
  poly([5, 17, 15, 17, 17, 26, 3, 26], "W"), poly([12, 17, 15, 17, 17, 26, 13, 26], "o"), hline(3, 25, 14, "a"),
  rect(5, 26, 4, 2, "N"), rect(11, 26, 4, 2, "N"),
  // chal del bando con guarda y flecos
  poly([5, 10, 15, 10, 18, 18, 2, 18], "w"), clip([5, 10, 15, 10, 18, 18, 2, 18], rect(13, 10, 6, 9, "W"), rect(0, 16, 24, 1, "a")),
  ...[2, 4, 6, 8, 10, 12, 14, 16].map((x) => px(x + 1, 18, "o")),
  // cara arrugada y rodete cano
  rect(6, 4, 8, 6, "s"), rect(12, 5, 2, 5, "S"), px(8, 6, "k"), px(11, 6, "k"), px(7, 8, "S"), hline(9, 8, 2, "S"), px(12, 8, "S"),
  rect(5, 2, 10, 3, "g"), rect(5, 4, 2, 4, "g"), rect(13, 3, 2, 3, "G"), circ(10, 1, 1, "g"), px(11, 0, "G"),
  // mortero de madera con los yuyos
  rect(15, 19, 8, 2, "n"), rect(16, 21, 6, 2, "n"), rect(15, 23, 8, 4, "n"), rect(21, 19, 2, 8, "N"), hline(15, 23, 8, "N"),
  hline(15, 19, 8, "N"), ...[[16, 17], [17, 16], [18, 17], [20, 16], [21, 17], [22, 16]].map(([x, y]) => px(x, y, "v")), px(19, 18, "V"), px(16, 18, "V"), px(22, 18, "v"),
  // mano de mortero y las dos manos de la abuela
  line(16, 7, 19, 18, "n", 2), px(16, 6, "N"),
  rect(14, 11, 3, 2, "s"), rect(15, 14, 3, 2, "s"),
);

// Elefante: el mborevi (tapir) de perfil, mirando a la izquierda, con su trompita y las orejas
// de borde blanco, cargando una manta de ao po'i del bando.
piece("elephant", { w: 32, h: 26 },
  // patas de atrás y rabito
  rect(25, 18, 4, 6, "T"), rect(21, 19, 3, 5, "t"), px(30, 11, "T"),
  // cuerpo
  ellipse(18, 13, 12, 7, "t"), ellipse(18, 16, 11, 4, "T"),
  // patas de delante
  rect(9, 18, 4, 6, "T"), rect(14, 19, 3, 5, "t"),
  ...[[9, 24], [14, 24], [21, 24], [25, 24]].map(([x, y]) => rect(x, y, 4, 2, "k")),
  // manta de ao po'i con guarda azul y flecos
  poly([13, 5, 26, 5, 28, 15, 11, 15], "w"),
  clip([13, 5, 26, 5, 28, 15, 11, 15], rect(23, 5, 6, 11, "W"), rect(0, 12, 32, 2, "a"), ...[[16, 7], [20, 7], [18, 9], [22, 9]].map(([x, y]) => px(x, y, "o"))),
  ...[12, 15, 18, 21, 24, 27].map((x) => px(x, 16, "o")),
  // cabeza baja y trompa
  ellipse(7, 12, 5, 4, "t"), poly([2, 12, 5, 12, 4, 19, 2, 19, 1, 15], "t"), px(1, 19, "T"), px(2, 19, "T"),
  px(6, 11, "k"), hline(5, 15, 3, "T"),
  // oreja redonda con el borde blanco
  circ(10, 7, 2, "t"), px(9, 5, "g"), px(10, 5, "g"), px(8, 6, "g"),
);

// Camello: el ñandú, de cuello largo, plumaje del bando que cae en flecos, collar oscuro en la
// base del cuello y patas largas grises.
piece("camel", { w: 26, h: 31 },
  // patas largas con los dedos
  line(13, 19, 11, 28, "M", 2), line(17, 19, 19, 28, "M", 2), hline(8, 29, 5, "M"), hline(17, 29, 5, "M"), px(8, 30, "M"), px(21, 30, "M"),
  // plumaje del bando
  ellipse(15, 14, 9, 6, "w"), ellipse(17, 16, 8, 4, "W"), poly([19, 10, 25, 12, 24, 21, 20, 18], "W"),
  ...[8, 11, 14, 17, 20, 23].map((x) => line(x, 18, x - 1, 21, "o")), ...[10, 13, 16].map((x) => line(x + 2, 12, x, 16, "W")),
  // cuello con el collar del bando
  line(8, 12, 5, 3, "W"), line(9, 12, 6, 3, "w"), rect(7, 11, 4, 3, "A"), hline(7, 11, 4, "a"),
  // cabecita, ojo y pico chato
  rect(4, 1, 3, 2, "W"), hline(4, 1, 2, "w"), px(5, 1, "k"), hline(1, 2, 3, "H"), px(3, 3, "W"),
);

// Cañón: mortero de madera del San Juan en su carrito, con aros del bando, que escupe la
// pelota tata encendida.
piece("cannon", { w: 31, h: 24 },
  // ruedas y cureña
  ...[7, 19].flatMap((x) => [circ(x, 19, 4, "n"), ring(x, 19, 4, "N"), line(x - 2, 19, x + 2, 19, "N"), line(x, 17, x, 21, "N"), px(x, 19, "y")]),
  rect(3, 14, 20, 2, "n"), hline(3, 15, 20, "N"),
  // tubo de madera pintado del bando, con dos aros azules
  circ(5, 10, 4, "W"), rect(5, 6, 17, 9, "w"), hline(5, 6, 17, "w"), rect(5, 12, 17, 2, "W"), hline(3, 14, 19, "o"), px(3, 8, "w"), px(4, 7, "w"),
  hline(6, 8, 14, "w"), ...[9, 16].map((x) => rect(x, 5, 2, 10, "a")), ...[10, 17].map((x) => vline(x, 5, 10, "A")),
  // boca del mortero
  rect(22, 5, 3, 11, "W"), vline(24, 5, 11, "o"), rect(23, 7, 1, 7, "k"),
  // pelota tata saliendo, con su llama
  circ(27, 6, 3, "E"), circ(27, 6, 2, "e"), px(26, 5, "F"), px(27, 5, "F"), px(26, 6, "F"),
  px(24, 3, "e"), px(25, 2, "E"), px(25, 1, "e"), px(28, 1, "E"), px(29, 2, "e"), px(30, 4, "E"), px(26, 1, "."),
);

// Hoja de control: el set entero de una vez.
sheet("paraguay", ["pawn", "rook", "knight", "bishop", "queen", "king", "guard", "advisor", "elephant", "camel", "cannon"], { pad: 2 });
