// El set del tema "Zombis": las once piezas de Zug como zombis de risa de una ciudad abandonada,
// al estilo de los juegos arcade y no de cementerio. Zombi de oficina, zombi con cubo de basura,
// perro zombi, científico loco, novia, jefe con corona de chapas, obrero con la puerta de un coche,
// cerebro con birrete, gordo de camiseta corta, payaso en zancos y artificiero con su mortero.
// La ropa usa la rampa del bando (w W o O b) y se recolorea; la piel verde, los ojos, el metal, la
// madera, las vendas y los colores de cada cachivache son fijos en los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/zombis/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1d1f1a", // tinta: contorno e interiores
  w: "#efe6cc", W: "#d6c69e", o: "#b3a074", O: "#857550", b: "#5a4e35", // ropa del bando claro
  z: "#b4cf8e", Z: "#88a765", x: "#5e7c48", // piel de zombi
  i: "#f6f3e4", // ojos y dientes
  r: "#c8384a", R: "#6e1f2e", // corbata, lengua, boca
  h: "#3b3330", // pelo
  g: "#e6e0c8", G: "#aaa38a", // vendas, velo y canas
  m: "#c9ced3", M: "#8d949c", X: "#5c626b", // metal
  n: "#9a6a3e", N: "#5e3c22", // madera y zapatos
  y: "#f2cf4a", Y: "#b48a26", // chapas, casco y chispas
  c: "#f08a2e", C: "#b0561c", // cono, pelo de payaso
  p: "#f2a7b8", P: "#c96d86", // cerebro
  v: "#9be04e", V: "#5aa02c", // baba verde
  f: "#bfe6f2", F: "#7fb4c9", // cristal
});
ramps("bOoWw", "xZz", "XMm", "Yy", "Cc", "Pp", "Vv", "Ff", "Gg", "Nn", "Rr");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Cabeza de zombi de frente a la izquierda: un ojo saltón y otro hundido, boca torcida con un
// diente, oreja a la derecha y la sombra en el lado derecho y abajo.
const head = (x, y, w = 9, h = 8) => [
  rect(x + 1, y, w - 2, h, "z"), rect(x, y + 1, w, h - 2, "z"),
  vline(x + w - 1, y + 2, h - 3, "Z"), hline(x + 2, y + h - 1, w - 3, "Z"), px(x + w - 2, y + h - 2, "Z"),
  px(x + w, y + 3, "Z"), px(x + w, y + 4, "x"),
  rect(x + 1, y + 2, 3, 3, "x"), rect(x + 1, y + 2, 2, 2, "i"), px(x + 1, y + 3, "k"),
  px(x + 5, y + 3, "x"), px(x + 5, y + 2, "i"), px(x + 5, y + 3, "k"),
  hline(x + 1, y + h - 2, 4, "R"), px(x + 2, y + h - 2, "i"), px(x + 4, y + h - 3, "R"),
];

// Peón: zombi de oficina de los de siempre, camisa rota, corbata torcida y los brazos al frente.
piece("pawn", { w: 22, h: 26 },
  // brazo de atrás, más bajo y en sombra
  rect(3, 14, 6, 2, "W"), rect(1, 14, 2, 2, "Z"), px(0, 15, "Z"),
  // pantalón, piernas y zapatos (una pierna más corta, arrastra el pie)
  rect(8, 18, 8, 2, "O"), rect(8, 20, 3, 4, "O"), rect(13, 20, 3, 3, "O"), rect(13, 22, 3, 1, "Z"),
  rect(6, 24, 5, 2, "N"), rect(12, 23, 5, 2, "N"), px(7, 24, "n"), px(13, 23, "n"), rect(13, 25, 4, 1, "."),
  // camisa con la corbata y el bajo roto
  rect(8, 10, 8, 8, "w"), rect(14, 10, 2, 8, "W"), px(9, 10, "W"), px(13, 10, "W"),
  vline(11, 11, 4, "r"), px(11, 10, "R"), px(10, 15, "r"), px(12, 12, "R"),
  px(9, 17, "."), px(12, 17, "."), px(15, 17, "."), px(8, 16, "Z"),
  // brazo de delante
  rect(2, 11, 7, 3, "w"), hline(2, 13, 7, "W"), px(2, 13, "."), rect(0, 11, 2, 3, "z"), px(0, 13, "Z"), px(1, 13, "Z"),
  // cabeza con tres pelos
  rect(10, 9, 3, 1, "Z"),
  ...head(7, 1), px(9, 0, "h"), px(10, 0, "h"), px(12, 0, "h"), px(13, 1, "h"),
);

// Torre: zombi fornido con un cubo de basura metido hasta los ojos, de frente. Silueta de torre.
sprite("_rook0", { w: 26, h: 30, mx: true },
  // piernas y zapatos
  rect(5, 24, 4, 4, "O"), rect(4, 28, 6, 2, "N"), px(5, 28, "n"),
  // cuerpo con chaqueta de trabajo y cremallera
  rect(1, 14, 12, 10, "w"), rect(1, 22, 12, 2, "W"), vline(12, 14, 10, "o"), px(3, 23, "."), px(8, 23, "."),
  // brazos colgando con las manos
  rect(0, 15, 3, 8, "W"), rect(0, 23, 3, 2, "z"),
  // cara bajo el cubo
  rect(5, 11, 8, 4, "z"), hline(5, 14, 8, "Z"),
  // cubo: tapa con asa, cuerpo con nervios y el borde de abajo
  rect(2, 1, 11, 2, "m"), rect(10, 0, 3, 1, "M"), rect(3, 3, 10, 8, "M"), vline(5, 3, 8, "m"), vline(8, 3, 8, "m"), vline(11, 3, 8, "m"),
  hline(3, 10, 10, "X"), hline(2, 3, 11, "X"),
);
piece("rook", { base: "_rook0" },
  // sombra en la mitad derecha del cubo
  recolor({ m: "M", M: "X" }, [17, 0, 9, 11]), px(4, 2, "i"),
  // abolladura y una mancha de baba que cae del borde
  px(9, 6, "X"), px(10, 7, "X"), px(9, 7, "m"), px(15, 10, "v"), px(15, 11, "v"),
  // ojos que asoman bajo el borde y boca
  rect(7, 11, 3, 2, "i"), px(7, 12, "k"), px(14, 12, "i"), px(15, 12, "k"), hline(9, 14, 5, "R"), px(10, 14, "i"),
  recolor({ w: "W" }, [20, 14, 5, 10]), recolor({ W: "o" }, [23, 15, 3, 8]),
);

// Caballo: perro zombi sentado con la cabeza alta, las orejas tiesas, la lengua fuera, el
// collar de pinchos y una chaquetilla del bando. Silueta de caballo de ajedrez.
piece("knight", { w: 26, h: 28 },
  // cola con una venda
  line(22, 19, 25, 13, "Z", 2), px(24, 15, "g"), px(23, 16, "g"),
  // anca y pata de atrás
  ellipse(18, 21, 6, 5, "Z"), ellipse(17, 21, 5, 4, "z"), rect(18, 25, 6, 2, "Z"), px(19, 26, "x"),
  // lomo y pecho
  poly([7, 13, 13, 11, 20, 15, 22, 22, 9, 24], "z"),
  // chaquetilla del bando que tapa lomo y anca, con el ribete y un roto
  poly([10, 11, 16, 11, 22, 15, 24, 21, 21, 24, 12, 22], "w"), poly([18, 12, 22, 15, 24, 21, 21, 24, 19, 21], "W"),
  line(10, 11, 12, 22, "o"), hline(12, 22, 9, "O"), px(14, 16, "o"), px(15, 17, "o"),
  // costillas que asoman por el roto
  px(16, 18, "x"), px(17, 19, "z"), px(16, 20, "x"),
  // patas de delante
  rect(8, 20, 3, 6, "z"), rect(12, 21, 3, 5, "Z"), rect(7, 26, 4, 2, "Z"), rect(12, 26, 4, 2, "x"), px(7, 27, "z"),
  // cuello
  line(9, 15, 8, 8, "z", 5), vline(11, 9, 6, "Z"),
  // collar de pinchos con la chapa
  hline(6, 13, 7, "b"), px(7, 12, "m"), px(10, 12, "m"), px(9, 14, "y"),
  // cabeza: cráneo, hocico, nariz y boca con la lengua
  ellipse(8, 5, 4, 4, "z"), rect(0, 4, 6, 4, "z"), hline(1, 7, 6, "Z"), px(0, 4, "k"), px(1, 4, "x"),
  hline(0, 8, 5, "R"), px(1, 8, "i"), px(4, 8, "i"), rect(2, 9, 2, 2, "r"), px(3, 10, "R"),
  // ojo saltón y ojo hundido
  rect(5, 3, 2, 2, "i"), px(5, 4, "k"), px(8, 3, "x"),
  // orejas tiesas, la de atrás mordida
  poly([6, 3, 7, -1, 10, 2], "z"), px(7, 1, "Z"), poly([10, 3, 13, -1, 13, 5], "Z"), px(12, 2, "x"), px(13, 0, "."),
);

// Alfil: científico loco con la bata del bando, gafas de soldar en la frente, pelo canoso de
// punta y un matraz de baba verde que burbujea en la mano.
piece("bishop", { w: 24, h: 30 },
  // pelo de punta, como una mitra despeinada
  poly([5, 7, 6, 2, 8, 4, 10, 0, 12, 3, 15, 1, 15, 5, 17, 7], "g"), px(10, 2, "G"), px(14, 4, "G"), px(7, 5, "G"), vline(15, 4, 3, "G"),
  // bata larga con solapas, bolsillo con bolis
  poly([6, 14, 16, 14, 19, 28, 3, 28], "w"), poly([14, 15, 16, 14, 19, 28, 16, 28], "W"),
  line(9, 14, 11, 20, "W"), line(13, 14, 12, 20, "o"), vline(11, 21, 7, "o"),
  rect(13, 21, 3, 2, "W"), px(13, 20, "r"), px(14, 20, "F"),
  // piernas y zapatos
  rect(6, 28, 4, 2, "N"), rect(12, 28, 4, 2, "N"), px(7, 28, "n"),
  // cabeza y gafas de soldar
  ...head(6, 6), hline(6, 7, 10, "X"), circ(8, 7, 1, "F"), px(8, 7, "f"), circ(12, 7, 1, "F"), px(12, 6, "f"),
  // brazo que levanta el matraz
  rect(3, 16, 5, 3, "w"), hline(3, 18, 5, "W"), rect(1, 15, 2, 3, "z"),
  // matraz con baba y burbujas
  rect(1, 9, 2, 3, "f"), poly([-1, 16, 1, 12, 3, 12, 5, 16], "f"), poly([0, 16, 1, 14, 3, 14, 4, 16], "v"), hline(0, 16, 5, "V"),
  px(1, 7, "v"), px(2, 5, "v"), px(0, 4, "v"), px(1, 12, "i"),
);

// Reina: novia zombi con el velo largo, diadema, vestido del bando con volantes y un ramo
// de flores mustias en las manos.
piece("queen", { w: 26, h: 31 },
  // velo que cae por detrás hasta el suelo
  poly([9, 1, 17, 2, 22, 18, 24, 27, 15, 27, 13, 10], "g"), poly([17, 2, 22, 18, 24, 27, 20, 27, 18, 12], "G"),
  // vestido con falda ancha y volantes
  poly([8, 13, 15, 13, 19, 29, 3, 29], "w"), poly([13, 14, 15, 13, 19, 29, 15, 29], "W"),
  hline(4, 25, 15, "W"), hline(3, 28, 17, "o"), ...[5, 9, 13, 17].map((x) => px(x, 26, "W")), px(7, 20, "W"), px(9, 21, "W"),
  hline(8, 13, 7, "W"), px(11, 16, "o"),
  rect(5, 29, 4, 2, "G"), rect(11, 29, 4, 2, "G"),
  // brazos que sujetan el ramo
  rect(4, 15, 6, 2, "z"), hline(4, 16, 6, "Z"),
  // ramo de flores mustias
  line(3, 16, 5, 19, "V"), line(4, 16, 7, 19, "V"),
  circ(2, 13, 1, "P"), px(2, 13, "p"), circ(5, 12, 1, "P"), px(5, 12, "p"), px(0, 15, "P"), px(7, 14, "P"), px(4, 14, "V"),
  // cara, pelo y labios pintados
  rect(8, 3, 8, 3, "h"), ...head(8, 4, 8, 9), px(9, 11, "r"), hline(9, 11, 4, "r"), px(10, 11, "R"),
  vline(16, 5, 6, "h"),
  // diadema
  hline(9, 3, 7, "y"), px(12, 2, "y"), px(12, 1, "i"), px(10, 2, "Y"), px(14, 2, "Y"),
);

// Rey: jefe zombi grandote con corona de chapas, traje roto con corbata y un desatascador por
// cetro. El más alto.
piece("king", { w: 28, h: 32 },
  // desatascador
  rect(23, 8, 1, 20, "n"), vline(24, 8, 20, "N"), rect(21, 27, 5, 3, "r"), hline(21, 29, 5, "R"), px(22, 27, "i"),
  // traje con faldones rotos
  poly([5, 13, 19, 13, 21, 28, 3, 28], "w"), poly([17, 14, 19, 13, 21, 28, 18, 28], "W"),
  // camisa, corbata y barriga
  poly([9, 13, 15, 13, 13, 22, 11, 22], "g"), vline(12, 14, 7, "r"), px(12, 13, "R"), px(11, 20, "r"), px(13, 18, "R"),
  ellipse(12, 23, 3, 2, "z"), px(12, 23, "Z"),
  line(5, 14, 9, 22, "W"), line(19, 14, 15, 22, "o"), px(4, 27, "."), px(8, 27, "."), px(16, 27, "."), px(20, 27, "."),
  // pantalones y zapatos
  rect(6, 28, 5, 2, "O"), rect(13, 28, 5, 2, "O"), rect(5, 30, 6, 2, "N"), rect(13, 30, 6, 2, "N"), px(6, 30, "n"),
  // brazo con el desatascador
  rect(18, 14, 4, 6, "W"), rect(21, 16, 3, 3, "z"),
  // brazo de delante, al frente
  rect(1, 15, 5, 3, "w"), hline(1, 17, 5, "W"), rect(0, 14, 2, 4, "z"), px(0, 17, "Z"),
  // cabeza grande con papada
  ...head(7, 4, 11, 10), hline(9, 13, 7, "Z"), px(16, 7, "h"), px(8, 4, "h"),
  // corona de chapas
  rect(7, 2, 11, 3, "y"), hline(7, 4, 11, "Y"),
  ...[7, 10, 13, 16].map((x) => rect(x, 0, 2, 2, "y")), ...[8, 11, 14, 17].map((x) => px(x, 0, "Y")),
  px(9, 3, "r"), px(12, 3, "F"), px(15, 3, "V"),
);

// Guardia: obrero zombi con casco amarillo, escondido detrás de la puerta naranja de un coche,
// con la ventanilla rota, el retrovisor, la manilla y la pintura saltada.
piece("guard", { w: 24, h: 28 },
  // piernas y botas
  rect(10, 22, 3, 4, "O"), rect(15, 22, 3, 4, "O"), rect(9, 26, 5, 2, "N"), rect(15, 26, 5, 2, "N"),
  // cuerpo con chaleco del bando y la tira reflectante
  rect(9, 11, 11, 11, "w"), rect(17, 11, 3, 11, "W"), hline(9, 17, 11, "y"), hline(17, 17, 3, "Y"),
  // brazo de atrás
  rect(18, 12, 3, 6, "W"), rect(18, 18, 3, 2, "Z"),
  // cabeza y casco de obra
  ...head(9, 3, 10, 8), rect(9, 1, 10, 3, "y"), rect(8, 3, 12, 1, "Y"), rect(11, 0, 6, 1, "y"), px(11, 1, "i"), vline(14, 0, 3, "Y"),
  // puerta: marco de la ventanilla inclinado delante, chapa con la panza redonda abajo
  poly([7, 8, 12, 8, 12, 25, 2, 25, 0, 23, 0, 16], "c"), vline(11, 9, 16, "C"), hline(2, 24, 9, "C"), px(1, 23, "C"),
  poly([7, 9, 11, 9, 11, 15, 2, 15], "F"), px(7, 10, "f"), px(6, 11, "f"),
  line(8, 10, 10, 14, "M"),
  hline(0, 16, 12, "C"),
  rect(7, 19, 3, 1, "X"), px(7, 18, "m"),
  // pintura saltada que deja ver la chapa
  px(3, 21, "M"), px(4, 21, "M"), px(4, 22, "m"), px(10, 22, "M"),
  // retrovisor
  rect(1, 13, 3, 2, "C"), px(1, 13, "c"), px(2, 13, "c"),
  // mano agarrando el canto de la puerta
  rect(11, 12, 2, 2, "z"),
);

// Consejero: un cerebro con patitas, birrete de graduado y pajarita del bando. El que piensa.
piece("advisor", { w: 22, h: 27 },
  // patitas y zapatillas
  rect(7, 20, 2, 4, "Z"), rect(13, 20, 2, 4, "x"), rect(5, 24, 5, 3, "w"), rect(12, 24, 5, 3, "W"), hline(5, 26, 5, "W"), hline(12, 26, 5, "o"),
  // cerebro: lóbulos, surcos y sombra
  ellipse(10, 13, 9, 7, "p"), ellipse(13, 15, 6, 5, "P"), ellipse(10, 12, 8, 6, "p"),
  line(10, 6, 10, 14, "P"), line(4, 10, 8, 12, "P"), line(13, 9, 17, 11, "P"), line(3, 15, 6, 14, "P"), line(14, 14, 16, 17, "P"),
  px(4, 9, "i"), px(5, 8, "i"), px(13, 7, "i"),
  // ojos y boca
  rect(5, 13, 3, 3, "i"), px(5, 14, "k"), px(6, 14, "k"), rect(10, 14, 2, 2, "i"), px(10, 15, "k"), hline(6, 18, 4, "R"), px(7, 18, "i"),
  // pajarita
  rect(8, 19, 6, 2, "w"), px(10, 19, "o"), px(11, 20, "o"), px(8, 20, "W"), px(13, 19, "W"),
  // birrete: tabla en rombo, gorro y borla colgando
  rect(7, 4, 9, 3, "O"), poly([1, 3, 11, 0, 21, 3, 11, 6], "w"), poly([11, 3, 21, 3, 11, 6], "W"), hline(2, 3, 19, "W"),
  px(11, 2, "y"), line(12, 2, 18, 4, "y"), vline(18, 4, 4, "y"), px(18, 8, "Y"), px(17, 8, "Y"),
);

// Elefante: zombi gordísimo con la camiseta del bando que no le tapa la barriga, venda en la
// tripa, pantalón corto y bracitos. Ancho y bajo.
piece("elephant", { w: 32, h: 27 },
  // piernas cortas y zapatos
  rect(9, 21, 5, 3, "z"), rect(18, 21, 5, 3, "Z"), rect(8, 24, 7, 3, "N"), rect(18, 24, 7, 3, "N"), px(9, 24, "n"), px(19, 24, "n"),
  // pantalón corto
  rect(7, 18, 18, 4, "O"), rect(15, 20, 2, 2, "."), hline(7, 18, 18, "b"),
  // barriga y camiseta corta
  ellipse(16, 13, 13, 8, "z"), ellipse(19, 15, 10, 6, "Z"), ellipse(15, 12, 11, 6, "z"),
  poly([6, 7, 26, 7, 28, 13, 4, 13], "w"), poly([22, 7, 26, 7, 28, 13, 23, 13], "W"), hline(4, 13, 25, "W"), px(9, 13, "."), px(19, 13, "."),
  px(14, 17, "x"), px(13, 16, "x"),
  // venda cruzada en la tripa
  line(17, 14, 24, 17, "g"), line(17, 15, 24, 18, "G"),
  // bracitos
  rect(1, 9, 4, 6, "w"), rect(1, 13, 4, 1, "W"), rect(0, 15, 4, 3, "z"), rect(27, 9, 4, 5, "W"), rect(28, 14, 3, 3, "Z"),
  // cabecita encajada en los hombros, babeando
  ...head(11, 0, 10, 8), px(13, 8, "v"), px(13, 9, "v"),
);

// Camello: payaso zombi en zancos, larguirucho: gorguera, pelos naranjas, narizota y pantalón
// a rayas del bando que tapa los zancos hasta los zapatones.
piece("camel", { w: 22, h: 30 },
  // zancos con pantalón a rayas
  rect(7, 13, 3, 14, "w"), rect(12, 13, 3, 14, "W"), ...[15, 19, 23].flatMap((y) => [hline(7, y, 3, "o"), hline(12, y, 3, "O")]),
  // zapatones
  rect(3, 27, 7, 3, "c"), rect(12, 27, 7, 3, "C"), hline(3, 27, 5, "y"), px(4, 28, "i"),
  // cuerpecito con botones y brazos largos al frente
  rect(6, 8, 10, 6, "w"), rect(14, 8, 2, 6, "W"), px(11, 10, "r"), px(11, 12, "r"),
  rect(1, 9, 6, 2, "w"), hline(1, 10, 6, "W"), rect(0, 8, 2, 3, "z"),
  // gorguera
  hline(5, 7, 12, "g"), ...[5, 8, 11, 14].map((x) => px(x, 8, "g")), ...[6, 9, 12, 15].map((x) => px(x, 7, "G")),
  // cabeza, pelos de payaso y narizota
  ...head(7, 0, 9, 7), rect(5, 1, 2, 3, "c"), rect(16, 1, 2, 3, "C"), px(5, 0, "c"), px(17, 0, "C"), circ(7, 3, 1, "r"), px(6, 2, "i"),
);

// Cañón: zombi artificiero, con la cabeza vendada, que enciende la mecha de un tubo de fuegos
// artificiales del bando tumbado sobre una caja; el cohete ya asoma por la boca.
piece("cannon", { w: 31, h: 25 },
  // caja de madera
  rect(8, 16, 12, 9, "n"), hline(8, 16, 12, "Y"), hline(8, 20, 12, "N"), vline(13, 16, 9, "N"), hline(8, 24, 12, "N"), px(10, 18, "r"), px(17, 22, "r"),
  // tubo con dos aros y una estrella
  rect(6, 8, 15, 8, "w"), hline(6, 8, 15, "W"), hline(6, 9, 15, "w"), rect(6, 13, 15, 2, "W"), hline(6, 15, 15, "o"),
  rect(9, 8, 2, 8, "O"), rect(16, 8, 2, 8, "O"), px(9, 9, "o"), px(16, 9, "o"),
  px(13, 10, "y"), px(12, 11, "y"), px(14, 11, "y"), px(13, 12, "y"), px(13, 11, "Y"),
  // culata y mecha encendida
  rect(20, 8, 2, 8, "O"), line(20, 7, 21, 4, "N"), px(22, 3, "y"), px(21, 2, "c"), px(23, 2, "c"), px(22, 1, "y"),
  // boca del tubo y el cohete con la punta
  rect(4, 7, 2, 10, "o"), vline(4, 7, 10, "W"), rect(4, 16, 2, 1, "O"),
  poly([0, 12, 4, 9, 4, 15], "r"), hline(2, 14, 2, "R"), px(1, 11, "i"), px(2, 10, "i"),
  // zombi: piernas, cuerpo y el brazo con la cerilla
  rect(22, 21, 3, 2, "O"), rect(26, 21, 3, 2, "O"), rect(21, 23, 4, 2, "N"), rect(26, 23, 4, 2, "N"),
  rect(22, 12, 8, 9, "w"), rect(28, 12, 2, 9, "W"), hline(22, 20, 8, "o"),
  rect(21, 12, 2, 4, "w"), rect(22, 5, 2, 3, "z"), rect(21, 8, 2, 4, "w"), px(22, 4, "n"), px(22, 3, "c"),
  // cabeza vendada
  ...head(23, 4, 8, 8), hline(23, 4, 8, "g"), hline(24, 3, 6, "g"), line(25, 5, 30, 5, "G"), px(29, 6, "g"),
);
