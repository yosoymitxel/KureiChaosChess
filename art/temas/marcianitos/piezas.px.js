// El set del tema "Marcianitos": las once piezas de Zug como marcianos de tebeo de los años 50 y de
// las maquinitas de marcianos. Cíclope de una antena, platillo-torre, marciano montado en un bicho
// saltarín, cabezón con el cerebro en la pecera, reina de cuatro brazos, emperador de corona de
// antenas, guardia con pistola de rayos, ojo volador con alitas, bestia trompuda, zancudo de patas
// larguísimas y cañón de rayos en su trípode. La piel marciana usa la rampa del bando (w W o O b) y
// se recolorea (verde lima, morado, naranja); cristal, cromo, latón, ojos y bombillas son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/marcianitos/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1a1030", // tinta: contorno e interiores
  w: "#e8ffa8", W: "#b4ec4c", o: "#80c830", O: "#4c9428", b: "#2a5c1e", // piel marciana (claro)
  g: "#ffffff", // blanco de los ojos y brillos
  c: "#c4f2ff", C: "#6cc4e4", d: "#3a86b0", // cristal de pecera y rayos
  m: "#eef0f6", M: "#a8b0c4", X: "#646c88", // cromo
  r: "#ff5468", R: "#b0203c", // bolitas de antena y pilotos
  y: "#ffe35a", Y: "#d8961e", // latón y luces
  p: "#ffb4cc", P: "#e07898", // cerebro
});
ramps("bOoWw", "XMm", "dCc", "Rr", "Yy", "Pp");

// Cada pieza: el dibujo (opts.post son retoques asimétricos que van después del espejo) y la
// pieza con su contorno.
const piece = (name, { post = [], ...opts }, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" }, ...post);
};
// Bolita de antena: roja con su brillo.
const ball = (x, y) => [circ(x, y, 1, "r"), px(x, y, "r"), px(x - 1, y, "R"), px(x, y + 1, "R"), px(x, y - 1, "g")];

// Peón: marcianito cíclope de una antena, cabeza redonda con un ojo enorme y patitas cortas.
// El más bajito.
piece("pawn", { w: 17, h: 23, mx: "c",
  post: [rect(7, 9, 3, 3, "k"), px(7, 9, "g"), px(4, 6, "g"), px(5, 5, "g"),
    clip([9, 4, 8, 13], ellipse(8, 10, 7, 6, "o")), clip([0, 4, 17, 13], circ(8, 10, 3, "g")), rect(7, 9, 3, 3, "k"), px(7, 9, "g"),
    rect(10, 16, 2, 4, "o"), px(12, 16, "o"), px(12, 17, "o")] },
  // antena con bolita
  vline(8, 2, 3, "O"), ...ball(8, 1),
  // cabeza: luz arriba, sombra abajo
  ellipse(8, 10, 7, 6, "W"), clip([0, 0, 17, 7], ellipse(8, 10, 7, 6, "w")), clip([0, 14, 17, 4], ellipse(8, 10, 7, 6, "o")),
  // el ojo enorme con su párpado
  circ(8, 10, 3, "g"), hline(6, 6, 3, "O"),
  // boca sonriente
  px(6, 14, "b"), hline(7, 15, 2, "b"),
  // cuerpo con cinturón y bracitos
  rect(5, 16, 4, 4, "W"), hline(5, 18, 4, "X"), px(8, 18, "y"),
  rect(3, 16, 2, 2, "W"), px(3, 18, "o"),
  // patitas y pies
  rect(6, 20, 2, 2, "o"), rect(4, 22, 4, 1, "O"),
);

// Torre: platillo volante aterrizado sobre sus patas, como un depósito de agua: cúpula con su
// marcianito dentro, disco con luces, columna con escotilla y tres patas abiertas.
piece("rook", { w: 27, h: 30, mx: "c",
  post: [px(9, 5, "g"), px(8, 6, "g"), px(8, 7, "c"), clip([14, 12, 13, 8], ellipse(13, 16, 13, 3, "W")), hline(14, 16, 13, "O"),
    ...[16, 20, 24].map((x) => px(x, 16, "y")), vline(16, 20, 6, "X")] },
  // antena
  vline(13, 0, 3, "M"), px(13, 0, "r"),
  // cúpula de cristal con el marcianito
  ellipse(13, 9, 7, 6, "c"), clip([13, 0, 14, 20], ellipse(13, 9, 7, 6, "C")),
  circ(13, 11, 3, "W"), clip([0, 0, 27, 10], circ(13, 11, 3, "w")), px(12, 10, "k"), vline(13, 6, 2, "O"),
  // disco con luces
  ellipse(13, 16, 13, 3, "w"), clip([0, 17, 27, 3], ellipse(13, 16, 13, 3, "O")), hline(0, 16, 14, "o"),
  ...[2, 6, 10].map((x) => px(x, 16, "y")), px(13, 16, "y"),
  // columna con escotilla
  rect(10, 20, 4, 6, "M"), vline(10, 20, 6, "m"), rect(12, 21, 2, 4, "X"), px(13, 22, "y"),
  // patas abiertas y pies
  line(10, 19, 4, 27, "M", 2), line(9, 19, 3, 27, "m"), rect(1, 28, 5, 2, "X"), hline(1, 28, 5, "M"),
);

// Caballo: marcianito con su pecera montado en un bicho saltarín de seis patas, con ojos en
// pedúnculos y las patas de atrás de saltamontes. De perfil, mirando a la izquierda.
piece("knight", { w: 30, h: 31 },
  // pata trasera de saltamontes (detrás)
  line(23, 20, 28, 11, "b", 2), line(28, 11, 28, 28, "b", 1), rect(27, 29, 3, 2, "b"),
  // patas del lado de atrás
  line(12, 23, 10, 30, "b"), line(19, 24, 19, 30, "b"),
  // cuerpo del bicho con lunares
  ellipse(17, 20, 10, 5, "W"), clip([0, 21, 30, 6], ellipse(17, 20, 10, 5, "o")), clip([0, 0, 30, 17], ellipse(17, 20, 10, 5, "w")),
  hline(10, 24, 15, "O"), circ(22, 20, 1, "O"), px(26, 18, "O"), px(14, 21, "O"), px(21, 19, "W"),
  // cabeza del bicho, boca y pedúnculos con ojos
  circ(6, 19, 4, "W"), clip([0, 0, 30, 17], circ(6, 19, 4, "w")), clip([0, 21, 30, 3], circ(6, 19, 4, "o")),
  hline(2, 21, 3, "k"), px(5, 20, "k"), px(3, 22, "g"), clip([8, 16, 4, 8], ring(6, 19, 4, "o")),
  line(4, 15, 2, 11, "O"), line(7, 15, 8, 10, "O"),
  rect(0, 9, 3, 3, "g"), px(0, 10, "k"), rect(7, 7, 3, 3, "g"), px(7, 8, "k"),
  // patas del lado de delante, con rodilla
  line(9, 24, 6, 27, "O"), line(6, 27, 6, 29, "O"), line(16, 25, 15, 29, "O"), line(23, 24, 24, 29, "O"),
  rect(5, 30, 3, 1, "b"), rect(14, 30, 3, 1, "b"), rect(23, 30, 3, 1, "b"),
  // silla roja
  rect(13, 14, 9, 2, "R"), hline(13, 14, 9, "r"),
  // jinete: cuerpo, brazo con las riendas y cabeza en la pecera
  rect(15, 9, 5, 5, "W"), rect(15, 9, 2, 5, "w"), rect(19, 9, 1, 5, "o"),
  line(15, 11, 12, 13, "W"), line(12, 13, 8, 16, "Y"),
  circ(17, 4, 4, "c"), clip([18, 0, 10, 9], circ(17, 4, 4, "C")),
  circ(17, 5, 2, "W"), px(16, 4, "w"), px(16, 5, "k"), px(18, 5, "k"), vline(17, 1, 2, "O"), px(17, 1, "r"), px(15, 2, "g"),
);

// Alfil: marciano cabezón con el cerebro a la vista dentro de un casco de pecera, collar de cromo
// y túnica larga; en las manos, una bola de rayos.
piece("bishop", { w: 23, h: 30, mx: "c",
  post: [px(5, 4, "g"), px(4, 6, "g"), px(6, 3, "g"), clip([12, 0, 11, 19], circ(11, 9, 9, "C")),
    clip([12, 0, 11, 19], ellipse(11, 9, 6, 7, "W")), clip([12, 0, 11, 9], ellipse(11, 7, 6, 5, "P")),
    hline(13, 4, 2, "p"), px(15, 6, "p"), px(14, 7, "p"), vline(11, 2, 7, "P"),
    px(14, 12, "k"), px(14, 11, "g"), px(13, 11, "g"), px(13, 12, "g"),
    poly([15, 20, 17, 20, 21, 29, 17, 29], "W"), vline(15, 22, 7, "W")] },
  // pecera: cristal claro con su borde
  circ(11, 9, 9, "c"),
  // cabeza: piel abajo, cerebro arriba con sus pliegues
  ellipse(11, 9, 6, 7, "W"), ellipse(11, 7, 6, 5, "p"),
  hline(7, 4, 2, "P"), px(6, 6, "P"), px(8, 7, "P"), px(9, 5, "P"), px(10, 3, "P"),
  // ojos grandes y boca
  rect(8, 11, 2, 2, "g"), px(9, 12, "k"), px(11, 14, "b"),
  // collar de cromo
  rect(4, 18, 8, 2, "M"), hline(4, 18, 8, "m"), px(6, 19, "X"),
  // túnica
  poly([6, 20, 12, 20, 12, 29, 1, 29], "w"), vline(8, 22, 7, "W"), rect(1, 29, 11, 1, "O"),
  // manos con la bola de rayos
  rect(7, 22, 2, 2, "o"), circ(11, 24, 2, "C"), circ(11, 24, 1, "c"), px(11, 24, "g"),
);

// Reina: reina marciana de cuatro brazos (los de arriba alzados, los de abajo abiertos),
// diadema de latón con dos antenas de bolita, pestañas, collar y vestido de campana con estrellas.
piece("queen", { w: 29, h: 31, mx: "c",
  post: [poly([15, 16, 18, 16, 24, 30, 15, 30], "W"), vline(17, 18, 12, "o"), vline(21, 24, 6, "o"),
    clip([15, 0, 14, 16], circ(14, 9, 5, "W")), clip([0, 12, 29, 3], circ(14, 9, 5, "o")),
    rect(16, 8, 2, 2, "g"), px(16, 9, "k"), px(12, 9, "g"), px(11, 9, "k"), hline(13, 12, 3, "r"), px(14, 13, "R"),
    px(11, 4, "g")] },
  // brazos de arriba alzados
  line(10, 17, 5, 15, "W", 2), line(4, 15, 3, 10, "W", 2), rect(2, 8, 3, 2, "w"), px(2, 7, "w"), px(4, 7, "w"),
  // brazos de abajo abiertos
  line(10, 20, 4, 22, "o", 2), rect(1, 21, 3, 3, "W"),
  // vestido de campana con estrellas y bajo de latón
  poly([10, 16, 14, 16, 14, 30, 5, 30], "w"), vline(11, 19, 11, "W"), vline(8, 24, 6, "W"),
  hline(5, 29, 10, "Y"), px(9, 22, "y"), px(12, 26, "y"), px(14, 20, "y"),
  // collar de latón con gema
  hline(11, 16, 4, "Y"), px(14, 17, "r"),
  // cuello y cabeza
  rect(13, 14, 2, 2, "W"),
  circ(14, 9, 5, "W"), clip([0, 0, 14, 9], circ(14, 9, 5, "w")),
  // ojos con pestañas
  rect(11, 8, 2, 2, "g"), px(10, 7, "k"), px(11, 6, "k"),
  // diadema con gema y antenas de bolita
  rect(10, 4, 5, 2, "y"), hline(10, 5, 5, "Y"), px(12, 3, "y"), px(14, 2, "y"), px(14, 3, "y"), px(14, 4, "r"),
  line(10, 4, 7, 1, "Y"), ...ball(7, 1),
);

// Rey: gran emperador marciano. Corona de latón con tres antenas de bolita, cejas de enfado,
// cuello alto de picos, capa larga del bando y cetro de rayos. El más alto.
piece("king", { w: 31, h: 32, mx: "c",
  post: [poly([16, 17, 20, 17, 24, 31, 16, 31], "o"), clip([16, 7, 15, 10], ellipse(15, 12, 6, 5, "W")),
    rect(17, 11, 2, 2, "g"), px(17, 12, "k"), line(19, 9, 17, 10, "b"),
    vline(25, 9, 22, "Y"), vline(26, 10, 21, "Y"), circ(25, 7, 2, "C"), circ(25, 7, 1, "c"), px(24, 6, "g"),
    rect(23, 18, 3, 3, "W"), px(23, 18, "w")] },
  // antenas de la corona
  vline(15, 2, 4, "Y"), ...ball(15, 1), line(11, 6, 9, 3, "Y"), ...ball(9, 2),
  // cuello alto de picos (detrás de la cabeza)
  poly([2, 7, 10, 15, 10, 18, 4, 18], "O"), poly([3, 9, 9, 15, 9, 17, 5, 17], "o"),
  // capa larga
  poly([5, 17, 15, 17, 15, 31, 0, 31], "O"), vline(4, 21, 10, "b"), vline(1, 29, 2, "b"),
  // túnica con ribete y cinturón de latón
  poly([10, 17, 15, 17, 15, 31, 8, 31], "w"), vline(9, 18, 13, "y"), hline(9, 24, 7, "Y"), px(15, 24, "y"),
  // cabeza grande
  ellipse(15, 12, 6, 5, "W"), clip([0, 7, 15, 4], ellipse(15, 12, 6, 5, "w")), clip([0, 15, 31, 3], ellipse(15, 12, 6, 5, "o")),
  // ojos con cejas de enfado y boca seria
  rect(12, 11, 2, 2, "g"), px(13, 12, "k"), line(11, 9, 13, 10, "b"), hline(13, 15, 5, "b"),
  // corona
  rect(9, 5, 7, 3, "y"), hline(9, 7, 7, "Y"), px(15, 6, "r"), px(12, 6, "C"),
);

// Guardia: marciano de dos antenas en su casco de pecera, escudo redondo de cromo con el rayo
// del bando y pistola de rayos en alto.
piece("guard", { w: 25, h: 28 },
  // pistola de rayos en alto (detrás)
  rect(18, 13, 3, 3, "W"), line(19, 13, 21, 7, "M", 2), px(21, 8, "X"),
  rect(19, 6, 5, 2, "M"), hline(19, 6, 5, "m"), circ(23, 3, 2, "C"), px(23, 3, "c"), px(22, 2, "g"),
  // piernas y botas
  rect(9, 22, 2, 3, "o"), rect(14, 22, 2, 3, "O"), rect(8, 25, 4, 2, "X"), rect(13, 25, 4, 2, "X"), hline(8, 25, 4, "M"), hline(13, 25, 4, "M"),
  // cuerpo con correaje
  rect(8, 13, 10, 9, "W"), rect(8, 13, 3, 9, "w"), rect(15, 13, 3, 9, "o"), line(8, 13, 17, 21, "Y"), hline(8, 20, 10, "X"), px(13, 20, "y"),
  // pecera con la cabeza y dos antenas cortas
  circ(13, 6, 6, "c"), clip([13, 0, 12, 13], circ(13, 6, 6, "C")), px(10, 2, "g"), px(9, 3, "g"),
  circ(13, 7, 3, "W"), clip([0, 0, 13, 7], circ(13, 7, 3, "w")), px(12, 7, "k"), px(14, 7, "k"), hline(12, 9, 3, "b"),
  vline(11, 2, 2, "O"), vline(15, 2, 2, "O"), px(11, 2, "r"), px(15, 2, "r"),
  rect(9, 12, 9, 1, "M"),
  // escudo redondo de cromo con el rayo del bando
  circ(6, 17, 6, "X"), circ(6, 16, 5, "M"), circ(5, 16, 4, "m"),
  circ(6, 17, 3, "W"), px(5, 15, "w"), line(7, 14, 5, 17, "o"), line(5, 17, 7, 17, "o"), line(7, 17, 5, 20, "o"),
);

// Consejero: ojo volador con alitas de murciélago de cromo, párpado sabio, antenita y tres
// tentáculos de pulpito colgando.
piece("advisor", { w: 25, h: 27, mx: "c",
  post: [clip([13, 0, 12, 18], circ(12, 9, 7, "o")), clip([13, 0, 12, 7], circ(12, 9, 7, "W")),
    circ(12, 10, 4, "g"), clip([0, 0, 25, 8], circ(12, 10, 4, "W")), hline(8, 7, 9, "O"),
    circ(13, 11, 2, "C"), px(13, 11, "k"), px(14, 11, "k"), px(12, 10, "g"), px(5, 6, "g"), px(6, 5, "g")] },
  // antenita
  vline(12, 1, 2, "O"), px(12, 0, "r"),
  // alitas de cromo con sus varillas
  poly([6, 7, 1, 2, 0, 7, 1, 13, 6, 11], "M"), poly([6, 7, 1, 2, 1, 7, 6, 9], "m"), line(1, 3, 5, 8, "X"), line(0, 8, 5, 9, "X"),
  // cuerpo-ojo
  circ(12, 9, 7, "W"), clip([0, 0, 25, 6], circ(12, 9, 7, "w")),
  // tentáculos
  line(9, 15, 7, 21, "o", 2), line(7, 21, 9, 25, "o"), px(10, 25, "O"),
  vline(12, 16, 9, "o"), px(12, 25, "O"), px(11, 22, "O"),
);

// Elefante: bestia marciana gorda de perfil, con tres ojos, antenas de bolita, trompa enroscada,
// colmillos de cromo y lunares. Mirando a la izquierda.
piece("elephant", { w: 32, h: 26 },
  // cola y patas de atrás
  line(29, 11, 31, 16, "O"), px(31, 17, "b"),
  rect(14, 19, 3, 5, "O"), rect(27, 18, 3, 6, "O"),
  // cuerpo con lunares
  ellipse(20, 13, 11, 8, "W"), clip([0, 0, 32, 9], ellipse(20, 13, 11, 8, "w")), clip([0, 17, 32, 5], ellipse(20, 13, 11, 8, "o")),
  circ(22, 10, 2, "o"), circ(27, 14, 1, "o"), circ(17, 15, 1, "o"), px(21, 9, "W"),
  // patas de delante con uñas
  rect(9, 18, 4, 6, "W"), rect(22, 18, 4, 6, "W"), rect(9, 18, 1, 6, "w"), rect(22, 18, 1, 6, "w"),
  ...[9, 14, 22, 27].map((x) => hline(x, 24, x === 14 || x === 27 ? 3 : 4, "b")), px(9, 23, "g"), px(11, 23, "g"), px(22, 23, "g"), px(24, 23, "g"),
  // cabeza, trompa y colmillo
  circ(8, 10, 6, "W"), clip([0, 0, 32, 8], circ(8, 10, 6, "w")), clip([10, 9, 6, 9], ring(8, 10, 6, "o")), clip([0, 14, 16, 3], circ(8, 10, 6, "o")),
  line(4, 13, 2, 20, "W", 3), line(2, 20, 2, 24, "W", 2), rect(3, 24, 2, 1, "W"), px(5, 23, "W"), px(5, 22, "w"),
  px(1, 15, "o"), px(1, 18, "o"), px(1, 21, "o"),
  line(7, 15, 5, 19, "m", 2), px(5, 20, "M"), px(8, 15, "M"),
  // tres ojos y antenas de bolita
  rect(4, 8, 2, 2, "g"), px(4, 9, "k"), rect(7, 7, 2, 2, "g"), px(7, 8, "k"), rect(10, 8, 2, 2, "g"), px(10, 9, "k"),
  line(6, 4, 5, 1, "O"), ...ball(5, 1), line(10, 4, 11, 1, "O"), ...ball(11, 1),
);

// Camello: marciano zancudo, un cuerpo con dos jorobas y ojos saltones sobre cuatro patas
// larguísimas y flacas con rodillas.
piece("camel", { w: 25, h: 32, mx: "c",
  post: [clip([13, 0, 12, 14], ellipse(12, 9, 7, 4, "o")), clip([13, 0, 12, 8], ellipse(12, 9, 7, 4, "W")), clip([13, 0, 12, 7], circ(16, 5, 3, "W")),
    circ(15, 8, 2, "g"), hline(11, 11, 3, "b"), px(10, 10, "b"), px(14, 10, "b"),
    rect(8, 8, 2, 2, "k"), rect(14, 8, 2, 2, "k"), px(8, 8, "g"), px(14, 8, "g"), px(6, 4, "g")] },
  // jorobas
  circ(8, 5, 3, "w"),
  // cuerpo
  ellipse(12, 9, 7, 4, "W"), clip([0, 0, 25, 8], ellipse(12, 9, 7, 4, "w")), clip([0, 11, 25, 3], ellipse(12, 9, 7, 4, "o")),
  // ojos saltones
  circ(9, 8, 2, "g"),
  // antenita entre las jorobas
  vline(12, 2, 4, "O"), ...ball(12, 1),
  // patas larguísimas con rodilla y pies planos
  line(8, 12, 4, 20, "o"), line(4, 20, 6, 30, "o"), px(4, 20, "W"),
  line(11, 13, 10, 21, "O"), line(10, 21, 11, 30, "O"),
  rect(4, 30, 4, 2, "O"), hline(4, 30, 4, "o"), rect(10, 31, 2, 1, "b"),
);

// Cañón: pistola de rayos gigante de las de tebeo sobre un trípode: bulbo con aletas, globo de
// energía, aros de cromo y boca encendida. Apunta a la izquierda.
piece("cannon", { w: 32, h: 26 },
  // trípode
  line(21, 16, 15, 24, "X", 2), line(21, 16, 27, 24, "X", 2), vline(21, 15, 9, "M"),
  rect(13, 24, 4, 2, "X"), rect(26, 24, 4, 2, "X"), rect(20, 24, 3, 2, "X"),
  // aletas de cohete
  poly([25, 5, 29, 0, 31, 0, 30, 6], "o"), poly([25, 15, 29, 19, 31, 19, 30, 13], "O"),
  // bulbo
  circ(24, 10, 5, "W"), clip([0, 0, 32, 9], circ(24, 10, 5, "w")), clip([0, 12, 32, 5], circ(24, 10, 5, "o")),
  // cañón y aros
  rect(6, 8, 14, 5, "W"), hline(6, 8, 14, "w"), hline(6, 12, 14, "o"),
  ...[8, 12, 16].map((x) => [rect(x, 6, 2, 9, "M"), vline(x, 6, 9, "m"), hline(x, 14, 2, "X")]).flat(),
  // boca y rayo
  rect(2, 7, 4, 7, "M"), vline(2, 7, 7, "m"), rect(0, 9, 2, 3, "C"), px(0, 10, "c"), px(1, 10, "g"),
  // globo de energía con su chispa
  circ(24, 3, 2, "c"), circ(24, 3, 1, "C"), px(23, 2, "g"), px(24, 3, "g"),
  // mira y piloto
  px(26, 9, "r"), px(27, 9, "R"),
);

sheet("marcianitos", ["pawn", "rook", "knight", "bishop", "queen", "king", "guard", "advisor", "elephant", "camel", "cannon"], { pad: 2 });
