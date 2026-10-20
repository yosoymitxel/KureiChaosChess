// El set del tema "Halloween": las once piezas de Zug como criaturas de una noche de cementerio.
// Calabacita, cripta, jinete sin cabeza, bruja, vampiresa, rey esqueleto, momia, fantasma, gato
// negro, araña y caldero. Lo que se recolorea por bando usa la rampa hueso (w W o O b); el resto
// (hueso, piel, hierro, madera, oro, fuego y brebaje) es fijo en los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/halloween/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1c1424", // tinta: contorno e interiores
  w: "#f3ecda", W: "#dccfb2", o: "#b9a684", O: "#8c7a5c", b: "#5e4f3c", // hueso y marfil (claro)
  g: "#e4e0cf", G: "#a39d88", // hueso de esqueleto
  s: "#ecdcea", S: "#bba3c2", // piel pálida de vampiro
  v: "#a4d36a", V: "#5f9a3e", // piel de bruja y brebaje
  m: "#a9b1bf", M: "#6b7383", X: "#454b58", // hierro
  n: "#7a5234", N: "#4a2e1d", // madera
  z: "#ecb73f", Z: "#a8741f", // oro
  r: "#d43d4f", R: "#861c33", // sangre y forro de capa
  h: "#3b2a4a", // pelo negro
  y: "#ffe27a", e: "#ff8f1f", E: "#c4470f", // brasa: ojos que brillan, velas, calabaza
});
ramps("bOoWw", "GgG", "SsS", "Vv", "XMm", "Zz", "Rr", "NnN", "Eey");

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Peón: calabacita de hueso con la cara tallada que brilla, tallo con zarcillo y dos patitas.
piece("pawn", { w: 20, h: 24 },
  // tallo y zarcillo
  rect(9, 3, 2, 5, "n"), px(10, 3, "N"), px(8, 2, "n"), line(11, 4, 14, 2, "V"), px(15, 3, "V"), px(15, 4, "v"),
  // calabaza: gajo de fuera, gajos del medio y nervios
  ellipse(10, 14, 9, 7, "W"), ellipse(10, 14, 5, 7, "w"), ellipse(10, 14, 5, 7, "o", true), ellipse(10, 14, 9, 7, "O", true),
  rect(9, 7, 2, 15, "w"), px(4, 10, "w"), px(5, 9, "w"),
  // sombra del lado derecho y de abajo
  ellipse(15, 15, 3, 5, "o"), hline(5, 21, 10, "O"), hline(3, 20, 3, "o"), hline(14, 20, 3, "O"),
  // cara tallada con la vela dentro
  poly([4, 15, 7, 11, 8, 15], "E"), poly([12, 15, 13, 11, 16, 15], "E"), px(6, 13, "y"), px(13, 13, "y"),
  rect(5, 17, 10, 2, "E"), rect(6, 18, 8, 1, "e"), px(7, 17, "w"), px(12, 17, "w"), px(9, 19, "E"), px(10, 19, "E"), px(8, 18, "y"), px(11, 18, "y"),
  // patitas
  rect(5, 22, 3, 2, "b"), rect(12, 22, 3, 2, "b"),
);

// Torre: cripta de piedra almenada, puerta de reja con la vela dentro, calavera en el dintel.
sprite("_rook0", { w: 24, h: 28, mx: true },
  // zócalo
  rect(0, 24, 12, 4, "O"), hline(0, 24, 12, "o"),
  // cuerpo de sillares
  rect(2, 9, 10, 15, "w"), ...[13, 17, 21].map((y) => hline(2, y, 10, "W")),
  vline(6, 9, 4, "W"), vline(4, 14, 3, "W"), vline(8, 14, 3, "W"), vline(6, 18, 3, "W"), vline(3, 22, 2, "W"),
  // cornisa y almenas
  rect(1, 7, 11, 2, "W"), hline(1, 7, 11, "w"), rect(1, 2, 3, 5, "w"), rect(8, 2, 4, 5, "w"), hline(1, 2, 3, "W"),
  // puerta en arco con reja
  rect(9, 17, 3, 7, "k"), px(10, 16, "k"), px(11, 16, "k"), px(11, 15, "k"), vline(10, 17, 7, "X"), hline(9, 20, 3, "X"),
  px(11, 22, "e"), px(11, 21, "y"),
  // calavera sobre la puerta
  rect(10, 10, 2, 3, "g"), px(11, 13, "g"), px(10, 11, "k"), px(9, 11, "g"),
  // aspillera con luz
  rect(4, 10, 1, 2, "k"), px(4, 11, "e"),
);
piece("rook", { base: "_rook0" },
  recolor({ W: "o" }, [17, 9, 7, 15]), recolor({ w: "W" }, [17, 2, 7, 22]), recolor({ O: "b" }, [17, 24, 7, 4]),
  vline(19, 26, 2, "b"),
);

// Caballo: jinete sin cabeza sobre un corcel negro que mira a la izquierda, con la capa al viento
// y su calabaza encendida en alto.
piece("knight", { w: 30, h: 31 },
  // capa al viento, detrás
  poly([19, 7, 26, 9, 29, 15, 25, 13, 23, 16, 21, 12], "b"),
  // cola y patas de atrás
  line(27, 16, 29, 24, "h", 2), rect(22, 22, 2, 7, "O"), rect(25, 21, 3, 8, "O"), rect(22, 28, 3, 2, "k"), rect(25, 28, 3, 2, "k"),
  // cuerpo del caballo
  ellipse(18, 19, 10, 5, "o"), ellipse(17, 18, 8, 3, "W"), ellipse(18, 22, 9, 2, "O"),
  rect(10, 23, 3, 6, "O"), rect(14, 23, 2, 6, "o"), rect(10, 28, 3, 2, "k"), rect(14, 28, 3, 2, "k"),
  // cuello, cabeza y crin
  line(9, 13, 13, 19, "o", 4), poly([1, 11, 6, 8, 10, 10, 10, 16, 5, 17, 1, 15], "o"), poly([3, 10, 6, 9, 8, 11, 4, 12], "W"),
  px(6, 7, "o"), px(7, 6, "O"), px(4, 11, "e"), px(5, 11, "y"), px(1, 14, "k"), line(8, 9, 12, 16, "h", 2),
  // silla
  rect(14, 14, 8, 3, "R"), rect(14, 16, 8, 1, "z"),
  // jinete: torso, cuello de la capa abierto y sin cabeza
  rect(15, 7, 6, 7, "w"), rect(19, 7, 2, 7, "W"), rect(15, 11, 6, 1, "N"), px(17, 11, "z"),
  poly([14, 7, 15, 4, 18, 6, 21, 4, 22, 7], "b"), rect(16, 5, 4, 2, "k"), hline(17, 6, 2, "R"),
  // pierna en el estribo
  rect(16, 14, 3, 5, "O"), rect(15, 19, 4, 1, "k"),
  // brazo en alto con la calabaza
  line(21, 8, 24, 5, "w", 2), circ(25, 3, 3, "e"), circ(24, 3, 2, "e"), ellipse(26, 4, 2, 2, "E"), px(25, 0, "n"),
  px(23, 3, "y"), px(26, 3, "y"), hline(23, 5, 4, "N"), px(24, 5, "y"), px(26, 5, "y"),
);

// Alfil: bruja de sombrero picudo con la punta doblada, nariz larga, melena de brasa y escoba.
piece("bishop", { w: 26, h: 32 },
  // escoba: palo y paja
  rect(20, 4, 2, 21, "n"), vline(21, 4, 21, "N"), poly([18, 25, 23, 25, 25, 31, 16, 31], "z"), vline(19, 26, 5, "Z"), vline(22, 26, 5, "Z"), hline(18, 25, 6, "N"),
  // vestido con el bajo hecho jirones
  poly([5, 17, 14, 17, 18, 29, 1, 29], "O"), poly([12, 18, 14, 17, 18, 29, 14, 29], "b"),
  ...[1, 5, 9, 13].map((x) => poly([x, 29, x + 4, 29, x + 2, 31], "O")),
  // chal del bando sobre los hombros
  poly([4, 16, 15, 16, 17, 21, 10, 24, 2, 21], "w"), poly([13, 16, 15, 16, 17, 21, 12, 23], "W"), px(10, 21, "e"),
  // mano en la escoba
  rect(17, 15, 3, 3, "v"),
  // melena, cara verde y nariz
  poly([3, 10, 15, 10, 16, 19, 13, 16, 6, 16, 2, 19], "E"), vline(4, 12, 6, "e"), vline(14, 12, 4, "e"),
  rect(6, 10, 7, 6, "v"), px(7, 12, "k"), px(10, 12, "k"), rect(10, 13, 3, 1, "V"), px(13, 13, "V"), px(9, 15, "V"), px(8, 15, "k"),
  // sombrero: copa doblada, cinta y hebilla, ala ancha
  poly([6, 9, 9, 1, 13, 0, 16, 2, 12, 2, 13, 9], "w"), poly([11, 3, 12, 2, 16, 2, 15, 3, 13, 9, 12, 9], "W"), px(16, 3, "W"),
  rect(7, 7, 7, 2, "R"), rect(9, 7, 2, 2, "z"),
  rect(1, 9, 17, 2, "o"), hline(2, 9, 15, "W"),
);

// Reina: vampiresa con el cuello alto de la capa abierto detrás, pelo negro de pico, diadema
// con rubí, labios de sangre y vestido largo.
piece("queen", { w: 26, h: 31 },
  // cuello alto de la capa: abanico detrás de la cabeza
  poly([1, 4, 6, 9, 13, 9, 18, 4, 18, 15, 1, 15], "R"), poly([3, 6, 7, 10, 12, 10, 16, 6, 16, 14, 3, 14], "r"),
  // capa a los lados y vestido
  poly([2, 14, 17, 14, 21, 29, -2, 29], "O"), poly([5, 15, 14, 15, 17, 29, 2, 29], "w"), poly([12, 16, 14, 15, 17, 29, 14, 29], "W"),
  vline(7, 21, 8, "W"), vline(10, 22, 7, "W"), poly([6, 15, 13, 15, 11, 19, 8, 19], "W"), px(9, 16, "r"), rect(-1, 29, 22, 2, "b"),
  // brazo con el cáliz
  rect(17, 16, 3, 4, "s"), rect(19, 13, 3, 2, "z"), px(20, 15, "z"), hline(19, 16, 3, "Z"), px(20, 13, "r"), px(21, 13, "r"),
  // pelo con pico de viuda y cara
  rect(4, 3, 11, 10, "h"), rect(5, 6, 9, 7, "s"), px(9, 6, "h"), rect(5, 5, 4, 1, "h"), rect(10, 5, 4, 1, "h"),
  px(7, 8, "k"), px(11, 8, "k"), px(6, 8, "R"), px(12, 8, "R"), hline(8, 11, 3, "r"), px(13, 10, "S"),
  rect(3, 9, 2, 6, "h"), rect(14, 9, 2, 6, "h"),
  // diadema
  hline(5, 3, 9, "z"), px(9, 1, "z"), px(9, 2, "r"), px(7, 2, "z"), px(11, 2, "z"),
);

// Rey: rey esqueleto con corona alta de gemas, ojos de brasa, manto con armiño y cetro con el
// orbe encendido. El más alto.
piece("king", { w: 28, h: 32 },
  // cetro con orbe
  rect(23, 7, 1, 21, "z"), vline(24, 8, 19, "Z"), circ(23, 4, 2, "e"), px(22, 3, "y"), rect(22, 7, 3, 1, "Z"),
  // manto y túnica con armiño
  poly([3, 12, 20, 12, 24, 30, 0, 30], "o"), poly([18, 13, 20, 12, 24, 30, 20, 30], "O"),
  rect(7, 14, 9, 16, "w"), rect(14, 14, 2, 16, "W"), hline(7, 19, 9, "Z"), px(11, 19, "z"),
  ...[16, 22, 25].map((y) => hline(9, y, 5, "G")), vline(11, 15, 13, "G"),
  rect(3, 11, 17, 3, "w"), ...[4, 8, 12, 16].map((x) => px(x, 12, "k")),
  rect(0, 30, 24, 2, "b"),
  // mano de hueso en el cetro
  rect(19, 15, 4, 2, "g"), px(19, 17, "g"), px(21, 17, "g"),
  // calavera
  rect(6, 6, 11, 5, "g"), rect(7, 11, 9, 1, "g"), rect(16, 6, 1, 5, "G"),
  rect(7, 7, 3, 2, "k"), rect(13, 7, 3, 2, "k"), px(8, 7, "e"), px(14, 7, "e"), px(11, 9, "k"),
  ...[8, 10, 12, 14].map((x) => px(x, 11, "G")),
  // corona alta
  rect(5, 2, 13, 4, "z"), rect(5, 5, 13, 1, "Z"), ...[5, 9, 13, 17].flatMap((x) => [px(x, 0, "z"), px(x, 1, "z")]), px(11, 1, "z"),
  px(8, 3, "r"), px(14, 3, "r"), px(11, 3, "e"),
);

// Guardia: momia vendada que avanza con los brazos al frente; una venda suelta y un ojo encendido.
piece("guard", { w: 24, h: 29 },
  // piernas
  rect(7, 21, 4, 6, "W"), rect(12, 21, 4, 6, "o"), rect(6, 26, 5, 2, "o"), rect(12, 26, 5, 2, "O"),
  hline(7, 23, 4, "o"), hline(12, 24, 4, "O"),
  // cuerpo
  rect(6, 11, 11, 11, "w"), rect(14, 11, 3, 11, "W"),
  // vendas cruzadas
  ...[13, 16, 19].map((y) => line(6, y + 1, 16, y - 1, "o")), line(6, 21, 9, 20, "o"),
  // venda suelta colgando
  line(16, 15, 19, 21, "W", 1), px(20, 22, "W"), px(19, 22, "o"),
  // brazos estirados hacia adelante
  rect(0, 12, 8, 3, "w"), hline(0, 14, 8, "W"), vline(3, 12, 3, "o"), vline(6, 12, 3, "o"), rect(0, 12, 1, 3, "g"),
  // cabeza vendada con el ojo
  rect(7, 3, 9, 8, "w"), rect(14, 3, 2, 8, "W"), px(7, 3, "_"), px(15, 3, "_"),
  hline(7, 5, 8, "o"), hline(8, 9, 8, "o"), rect(8, 6, 7, 2, "k"), px(10, 6, "e"), px(10, 7, "y"), px(13, 7, "b"),
);

// Consejero: fantasma de sábana que flota con un farol; ojos huecos y el bajo en ondas.
piece("advisor", { w: 24, h: 28 },
  // sábana: cabeza, cuerpo y bajo ondulado
  circ(10, 9, 8, "w"), rect(2, 9, 17, 15, "w"),
  ...[2, 7, 12].map((x) => poly([x, 23, x + 5, 23, x + 4, 27, x + 2, 25, x, 27], "w")),
  // sombra del lado derecho y de los pliegues
  clip((x, y) => (x - 10) ** 2 + (y - 9) ** 2 > 36 && x > 12, rect(12, 2, 8, 22, "W")),
  rect(15, 10, 4, 14, "W"), vline(7, 17, 7, "W"), vline(12, 18, 6, "W"), ...[6, 11, 16].map((x) => px(x, 26, "W")),
  px(5, 4, "_"), px(4, 5, "_"),
  // brazo que sujeta el farol
  poly([17, 13, 22, 15, 21, 17, 17, 17], "W"),
  // ojos y boca
  ellipse(7, 10, 1, 2, "k"), ellipse(13, 10, 1, 2, "k"), ellipse(10, 15, 1, 1, "k"),
  // farol
  vline(21, 17, 2, "M"), rect(19, 19, 5, 6, "X"), rect(20, 20, 3, 4, "e"), px(21, 21, "y"), rect(19, 19, 5, 1, "M"),
);

// Elefante: gato negro enorme de perfil, mirando a la izquierda, con el lomo arqueado, la cola
// en signo de interrogación, ojos de brasa y collar con cascabel.
piece("elephant", { w: 32, h: 27 },
  // cola
  line(27, 16, 30, 9, "b", 2), line(30, 9, 29, 4, "b", 2), px(27, 3, "b"), px(26, 4, "b"),
  // patas de atrás y de delante
  rect(23, 18, 4, 8, "b"), rect(18, 19, 3, 7, "O"), rect(6, 18, 3, 8, "O"), rect(10, 19, 3, 7, "b"),
  rect(5, 25, 4, 2, "O"), rect(22, 25, 5, 2, "b"), px(10, 25, "b"), px(17, 25, "O"),
  // lomo arqueado
  ellipse(16, 15, 11, 7, "b"), ellipse(15, 13, 9, 5, "O"), ellipse(13, 11, 6, 2, "o"),
  // cabeza y orejas
  circ(7, 11, 5, "O"), poly([2, 8, 3, 2, 6, 6], "O"), poly([8, 6, 11, 2, 12, 8], "O"), px(3, 4, "W"), px(10, 4, "W"),
  ellipse(6, 10, 3, 2, "o"),
  // ojos, hocico y bigotes
  rect(4, 10, 2, 2, "y"), px(5, 11, "k"), rect(8, 10, 2, 2, "y"), px(9, 11, "k"),
  px(6, 13, "r"), hline(5, 14, 3, "b"), line(0, 13, 3, 13, "W"), line(0, 15, 3, 14, "W"),
  // collar con cascabel
  line(4, 16, 11, 15, "R", 1), circ(7, 17, 1, "z"), px(7, 18, "Z"),
);

// Camello: araña gigante de frente, colgada de su hilo, con ocho patas de rodilla alta,
// reloj de arena en el abdomen y un racimo de ojos encendidos.
sprite("_camel0", { w: 32, h: 25, mx: true },
  // hilo
  vline(15, 0, 3, "G"),
  // patas: de la de atrás a la de delante
  line(11, 9, 4, 3, "b", 2), line(4, 3, 1, 12, "b", 2), line(1, 12, 0, 22, "b"),
  line(11, 11, 6, 7, "O", 2), line(6, 7, 3, 16, "O", 2), line(3, 16, 2, 24, "O"),
  line(12, 14, 8, 12, "b", 2), line(8, 12, 5, 19, "b", 2), line(5, 19, 5, 24, "b"),
  line(13, 16, 10, 15, "O", 2), line(10, 15, 8, 20, "O", 2), line(8, 20, 9, 24, "O"),
  // abdomen
  ellipse(16, 9, 6, 6, "O"), ellipse(15, 7, 4, 3, "o"), ellipse(14, 6, 2, 1, "W"),
  // cabeza
  ellipse(16, 17, 4, 4, "b"), ellipse(15, 16, 2, 2, "O"),
  // colmillos
  px(15, 21, "g"), px(15, 22, "G"),
);
piece("camel", { base: "_camel0" },
  // reloj de arena del abdomen
  poly([14, 7, 18, 7, 16, 10], "r"), poly([14, 13, 18, 13, 16, 10], "r"), px(15, 7, "R"),
  // ojos
  px(14, 16, "e"), px(17, 16, "e"), px(15, 17, "y"), px(16, 17, "y"), px(13, 18, "e"), px(18, 18, "e"),
  // sombra a la derecha
  recolor({ O: "b", o: "O" }, [19, 4, 4, 11]),
);

// Cañón: caldero sobre la hoguera que escupe una bola de brebaje hirviendo.
piece("cannon", { w: 30, h: 26 },
  // leña y llamas
  rect(4, 22, 14, 2, "n"), line(3, 25, 18, 23, "N", 2), line(4, 23, 18, 25, "n", 2),
  poly([5, 23, 7, 17, 9, 22, 11, 16, 13, 22, 15, 17, 17, 23], "E"), poly([7, 23, 9, 19, 11, 23, 13, 19, 15, 23], "e"), px(11, 21, "y"), px(9, 22, "y"),
  // caldero: cuerpo, borde y patas
  ellipse(11, 14, 9, 6, "O"), ellipse(9, 12, 6, 3, "o"), ellipse(8, 11, 3, 1, "W"), ellipse(14, 17, 6, 2, "b"),
  rect(1, 6, 21, 3, "w"), hline(1, 8, 21, "o"), rect(19, 6, 3, 3, "W"), px(1, 6, "_"), px(21, 6, "_"),
  // calavera pintada
  rect(9, 12, 4, 3, "g"), px(10, 13, "k"), px(12, 13, "k"), px(10, 15, "g"), px(12, 15, "g"),
  // brebaje que rebosa y burbujas
  rect(3, 4, 17, 2, "v"), ellipse(11, 4, 7, 1, "v"), px(6, 3, "V"), px(15, 3, "V"), vline(4, 8, 3, "v"), px(4, 11, "V"),
  // bola escupida y su estela
  circ(25, 3, 3, "v"), circ(24, 2, 1, "y"), px(27, 5, "V"), px(26, 6, "V"), px(20, 2, "v"), px(18, 1, "V"), px(22, 6, "v"),
);

// La hoja de control: el set entero de una vez.
sheet("halloween", ["pawn", "rook", "knight", "bishop", "queen", "king", "guard", "advisor", "elephant", "camel", "cannon"], { pad: 2 });
