// El set del tema "Galaxia": las once piezas de Zug como máquinas y tripulantes de una estación
// espacial. Droide, torre de comunicaciones, mecha-caballo, androide psíquico, comandante con capa,
// emperador IA en su cúpula, robot con escudo de energía, holograma, tanque-mamut, rover de patas
// largas y cañón láser. El blindaje pintado usa la rampa del bando (w W o O b) y se recolorea;
// el metal de las juntas, el neón cian y el ámbar de los pilotos son fijos para los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/scifi/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#0d0f1c", // tinta: contorno e interiores
  w: "#f4f8fc", W: "#cdd8e6", o: "#9daac0", O: "#6b7891", b: "#475069", // blindaje plata (claro)
  m: "#5b6680", M: "#3b4459", X: "#252c3d", // metal de juntas, fijo
  c: "#8af7ff", C: "#1fb4dc", // neón cian
  y: "#ffd95a", Y: "#d8901e", // pilotos ámbar
  r: "#ff4b5c", // piloto rojo
  g: "#ffffff", // brillo
});
ramps("bOoWw", "XMm", "Cc", "Yy");

// Cada pieza: el dibujo (opts.post son retoques asimétricos que van después del espejo) y la
// pieza con su contorno.
const piece = (name, { post = [], ...opts }, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" }, ...post);
};

// Peón: droide pequeño de cúpula, un ojo cian en la visera, bracitos y pies de oruga. El más bajo.
piece("pawn", { w: 19, h: 23, mx: "c",
  post: [px(5, 5, "g"), px(4, 6, "g"), rect(13, 7, 2, 4, "W"), vline(14, 16, 4, "O")] },
  // antena
  vline(9, 0, 3, "M"), px(9, 0, "r"),
  // cúpula y aro
  ellipse(9, 9, 7, 6, "w"), clip([0, 11, 19, 5], ellipse(9, 9, 7, 6, "W")), hline(2, 12, 8, "o"),
  // visera con el ojo
  rect(3, 7, 7, 3, "X"), px(8, 8, "c"), px(9, 8, "c"), px(7, 8, "C"),
  // cuello y cuerpo
  rect(6, 15, 4, 1, "X"), poly([4, 16, 10, 16, 10, 21, 5, 21], "W"), rect(5, 16, 5, 1, "w"), px(9, 18, "y"),
  // bracitos con pinza
  rect(2, 16, 2, 3, "M"), px(2, 19, "m"), px(1, 19, "M"),
  // orugas
  rect(2, 21, 6, 2, "X"), px(3, 21, "m"), px(5, 21, "m"),
);

// Torre: torre de comunicaciones artillada. Peana ancha, fuste con paneles, corona de emisores
// almenada y una antena con su plato. Alta y maciza.
piece("rook", { w: 25, h: 30, mx: "c",
  post: [vline(19, 11, 13, "O"), vline(18, 11, 13, "o"), rect(18, 25, 3, 3, "O"), px(5, 12, "g")] },
  // peana con patas
  rect(2, 25, 11, 3, "W"), rect(2, 25, 11, 1, "w"), rect(1, 28, 5, 2, "M"), rect(1, 28, 5, 1, "m"),
  // fuste
  rect(5, 11, 8, 14, "w"), hline(5, 17, 8, "o"), vline(8, 12, 5, "W"), vline(8, 18, 6, "W"),
  rect(10, 19, 3, 3, "X"), px(11, 20, "c"), px(12, 20, "c"),
  // corona de emisores con almenas
  rect(2, 7, 11, 4, "W"), rect(2, 7, 11, 1, "w"), hline(2, 10, 11, "O"),
  rect(2, 4, 3, 3, "w"), rect(7, 4, 3, 3, "w"), rect(12, 4, 1, 3, "w"),
  px(3, 8, "c"), px(8, 8, "c"),
  // mástil central
  vline(12, 0, 4, "M"), px(12, 0, "r"),
);

// Caballo: mecha cuadrúpedo con cabeza de caballo blindada, crin de cables de neón y cola de
// antena. De perfil, mirando a la izquierda.
piece("knight", { w: 28, h: 28 },
  // patas traseras (detrás) y cola de antena
  rect(21, 18, 2, 7, "M"), rect(24, 17, 2, 8, "M"), rect(20, 25, 4, 2, "X"), rect(23, 25, 4, 2, "X"),
  line(25, 12, 27, 6, "M"), px(27, 5, "c"),
  // cuerpo
  poly([10, 11, 26, 11, 27, 17, 24, 19, 11, 19, 9, 15], "w"), poly([10, 16, 27, 16, 24, 19, 11, 19], "W"),
  hline(11, 12, 14, "g"), vline(17, 12, 6, "o"), rect(19, 13, 4, 2, "X"), px(20, 13, "c"), px(21, 13, "c"),
  // patas delanteras con rodilla
  rect(11, 19, 2, 6, "M"), rect(15, 19, 2, 6, "m"), rect(10, 21, 3, 1, "X"),
  rect(10, 25, 4, 2, "X"), rect(14, 25, 4, 2, "X"),
  // cuello y cabeza de caballo
  poly([7, 4, 12, 3, 13, 12, 9, 15, 7, 12], "w"), poly([10, 6, 13, 7, 13, 12, 10, 14], "W"),
  poly([1, 5, 8, 3, 9, 8, 5, 10, 1, 10, 0, 8], "w"), poly([0, 8, 6, 8, 5, 10, 1, 10], "W"),
  px(8, 1, "w"), px(8, 2, "w"), px(9, 2, "W"),
  // visor del ojo y rejilla del morro
  rect(4, 5, 3, 1, "c"), px(4, 5, "g"), px(1, 8, "X"), px(2, 9, "X"),
  // crin de cables de neón
  line(10, 3, 14, 10, "C"), line(11, 3, 15, 9, "c"),
);

// Alfil: androide psíquico de cráneo alargado y puntiagudo, ojos encendidos, antena con orbe y
// túnica de placas. Los anillos de su mente flotan alrededor de la cabeza.
piece("bishop", { w: 23, h: 30, mx: "c",
  post: [poly([13, 19, 14, 19, 17, 28, 15, 28], "W"), px(8, 5, "g"), px(7, 7, "g"), vline(17, 26, 2, "O")] },
  // antena con orbe
  vline(11, 2, 2, "M"), circ(11, 1, 1, "c"), px(11, 1, "g"),
  // anillo psíquico
  ellipse(11, 11, 10, 2, "C", true), clip([0, 11, 23, 3], ellipse(11, 11, 10, 2, "c", true)),
  // cráneo alargado
  poly([11, 3, 15, 8, 16, 14, 11, 17, 6, 14, 7, 8], "w"),
  hline(8, 12, 7, "X"), px(9, 12, "c"), px(10, 12, "c"),
  vline(11, 5, 6, "o"),
  // cuello y túnica de placas
  rect(9, 17, 3, 2, "M"),
  poly([7, 19, 15, 19, 18, 28, 4, 28], "w"), vline(11, 19, 9, "o"), hline(6, 23, 6, "W"),
  rect(10, 20, 2, 2, "y"),
  rect(3, 28, 9, 2, "M"), rect(3, 28, 9, 1, "m"),
);

// Reina: comandante con capa al viento, casco de cresta triple, visor cian, hombreras y bastón
// de mando. La segunda más alta.
piece("queen", { w: 26, h: 31 },
  // capa detrás
  poly([5, 11, 19, 11, 24, 29, 1, 29], "O"), poly([16, 12, 19, 11, 24, 29, 20, 29], "b"), vline(4, 17, 12, "b"),
  // traje
  poly([8, 12, 17, 12, 18, 29, 7, 29], "w"), rect(15, 12, 3, 17, "W"), vline(12, 19, 10, "o"),
  rect(8, 17, 10, 2, "M"), rect(11, 17, 3, 2, "y"), px(12, 17, "g"),
  // hombreras
  ellipse(7, 12, 3, 2, "w"), ellipse(18, 12, 3, 2, "W"), px(6, 11, "g"),
  // bastón de mando
  vline(22, 6, 23, "M"), vline(23, 7, 22, "X"), circ(22, 4, 2, "c"), px(21, 3, "g"), rect(19, 16, 4, 3, "W"),
  // casco con visor
  rect(8, 3, 9, 8, "w"), rect(14, 3, 3, 8, "W"), rect(9, 6, 7, 2, "c"), rect(13, 6, 3, 2, "C"), px(9, 6, "g"),
  rect(9, 9, 7, 2, "o"),
  // cresta triple
  poly([8, 4, 9, 0, 10, 4], "o"), poly([11, 3, 12, 0, 14, 0, 14, 3], "w"), poly([15, 4, 16, 0, 17, 4], "o"),
  rect(5, 29, 16, 2, "M"), rect(5, 29, 16, 1, "m"),
);

// Rey: emperador IA, un gran cerebro de neón en una cúpula de cristal sobre un trono-chasis de
// hombros anchos y faldón de placas. Corona de antenas. El más alto.
piece("king", { w: 28, h: 33, mx: true,
  post: [rect(20, 17, 3, 12, "W"), px(8, 6, "g"), px(7, 7, "g"), px(9, 5, "g")] },
  // corona de antenas
  vline(13, 0, 3, "M"), px(13, 0, "y"), line(8, 4, 6, 1, "M"), px(6, 0, "y"),
  // cúpula de cristal con el cerebro
  circ(14, 10, 8, "m"), circ(14, 10, 7, "X"), clip([0, 11, 28, 7], circ(14, 10, 7, "M")),
  ellipse(11, 10, 3, 4, "c"), rect(11, 7, 3, 8, "c"), vline(13, 7, 8, "C"),
  px(10, 8, "C"), px(9, 10, "C"), px(11, 11, "C"), px(10, 13, "C"), px(12, 9, "C"),
  vline(13, 15, 2, "C"),
  // collar de la cúpula
  rect(5, 17, 9, 3, "w"), rect(5, 17, 9, 1, "g"), hline(5, 19, 9, "o"), px(8, 18, "y"),
  // hombros
  rect(1, 17, 5, 5, "w"), rect(1, 21, 5, 1, "o"), px(2, 18, "g"),
  // chasis y faldón de placas
  poly([5, 20, 14, 20, 14, 30, 2, 30], "W"), rect(7, 21, 7, 9, "w"), vline(10, 21, 9, "o"),
  rect(11, 23, 3, 3, "X"), px(12, 24, "r"), px(13, 24, "r"),
  rect(1, 30, 13, 3, "M"), rect(1, 30, 13, 1, "m"),
);

// Guardia: robot achaparrado con un escudo de energía hexagonal delante, de neón cian.
piece("guard", { w: 24, h: 27 },
  // piernas
  rect(4, 20, 4, 5, "M"), rect(13, 20, 4, 5, "M"), rect(3, 25, 6, 2, "X"), rect(12, 25, 6, 2, "X"),
  // cuerpo y brazo de detrás
  rect(3, 9, 16, 11, "w"), rect(15, 9, 4, 11, "W"), hline(3, 9, 16, "g"),
  rect(19, 10, 3, 7, "W"), rect(19, 17, 3, 2, "M"),
  // cabeza con visor
  rect(6, 2, 10, 7, "w"), rect(13, 2, 3, 7, "W"), rect(7, 4, 8, 2, "X"), rect(8, 4, 4, 1, "c"), px(7, 2, "g"),
  vline(14, 0, 2, "M"),
  // escudo de energía hexagonal con el emisor en el brazo
  poly([4, 11, 10, 9, 16, 11, 16, 18, 10, 21, 4, 18], "C"), poly([5, 12, 10, 10, 15, 12, 15, 17, 10, 20, 5, 17], "c"),
  poly([6, 13, 10, 11, 10, 19, 6, 17], "g"), rect(9, 14, 2, 2, "C"),
  rect(1, 13, 3, 5, "o"), rect(1, 13, 3, 1, "w"),
);

// Consejero: holograma flotante de un sabio encapuchado sobre su proyector. El haz de luz baja
// del proyector y las líneas de barrido cruzan la figura.
piece("advisor", { w: 22, h: 29, mx: true,
  post: [px(7, 3, "g"), px(6, 4, "g"), rect(15, 10, 2, 5, "W"), rect(16, 16, 2, 6, "W")] },
  // capucha con la cara en sombra y los ojos encendidos
  ellipse(11, 6, 6, 6, "w"), px(10, 0, "w"), ellipse(11, 8, 3, 4, "X"), px(9, 8, "c"),
  // hábito con las mangas juntas
  poly([5, 11, 11, 11, 11, 22, 1, 22], "w"), poly([3, 13, 11, 13, 11, 17, 4, 17], "W"), hline(5, 17, 6, "o"),
  vline(10, 18, 4, "W"),
  // líneas de barrido y el corte del parpadeo
  hline(1, 12, 10, "C"), hline(1, 20, 10, "C"), rect(0, 15, 11, 1, "_"),
  // haz
  poly([5, 22, 11, 22, 11, 25, 8, 25], "C"), rect(9, 22, 2, 3, "c"),
  // proyector
  rect(3, 25, 8, 2, "W"), rect(3, 25, 8, 1, "w"), rect(7, 25, 4, 1, "c"),
  rect(5, 27, 6, 2, "M"), rect(5, 27, 6, 1, "m"),
);

// Elefante: tanque-mamut de orugas con trompa de cañón flexible que cuelga, dos colmillos de
// metal y una torreta en el lomo. De perfil, mirando a la izquierda.
piece("elephant", { w: 32, h: 25 },
  // orugas
  rect(4, 19, 27, 6, "X"), rect(5, 20, 25, 4, "M"), ...[7, 11, 15, 19, 23, 27].map((x) => circ(x, 22, 1, "X")),
  hline(5, 19, 25, "m"),
  // casco
  poly([6, 9, 30, 9, 31, 18, 5, 18], "w"), poly([5, 15, 31, 15, 31, 18, 5, 18], "W"),
  hline(7, 9, 23, "g"), vline(18, 10, 5, "o"), vline(25, 10, 5, "o"),
  // torreta y antena
  rect(14, 4, 12, 5, "w"), rect(22, 4, 4, 5, "W"), hline(14, 4, 12, "g"), rect(16, 6, 3, 1, "c"),
  line(25, 4, 28, 0, "M"),
  // cabeza, orejas-blindaje, trompa de cañón y colmillos
  rect(1, 8, 8, 9, "w"), rect(6, 9, 4, 8, "W"), rect(3, 10, 2, 1, "c"),
  poly([0, 15, 3, 15, 3, 22, 1, 23, 0, 21], "o"), hline(0, 18, 3, "O"), hline(0, 20, 3, "O"), rect(0, 23, 2, 1, "C"),
  line(4, 17, 7, 20, "m"), line(5, 17, 8, 20, "g"),
);

// Camello: rover lunar de patas largas y finas, con dos jorobas (tanque y antena-plato) y una
// cabeza de cámara en un cuello alto. De perfil, mirando a la izquierda.
piece("camel", { w: 30, h: 30 },
  // patas largas (las de detrás más oscuras)
  line(19, 17, 21, 27, "M"), line(26, 17, 28, 27, "M"), rect(20, 27, 3, 2, "X"), rect(27, 27, 3, 2, "X"),
  line(13, 17, 11, 27, "m"), line(23, 17, 24, 27, "m"), rect(10, 27, 3, 2, "X"), rect(23, 27, 3, 2, "X"),
  // cuerpo
  poly([10, 12, 28, 12, 29, 16, 27, 18, 11, 18, 9, 16], "w"), poly([9, 16, 29, 16, 27, 18, 11, 18], "W"),
  // jorobas: tanque redondo y plato
  ellipse(15, 11, 4, 3, "w"), clip([11, 11, 9, 2], ellipse(15, 11, 4, 3, "W")), px(13, 9, "g"),
  ellipse(24, 10, 4, 3, "o"), ellipse(24, 9, 3, 2, "w"), px(24, 10, "M"), vline(24, 4, 6, "M"), px(24, 4, "r"),
  rect(18, 14, 4, 2, "X"), px(19, 14, "c"),
  // cuello y cabeza de cámara
  line(10, 13, 6, 5, "W", 2), line(9, 12, 5, 5, "w"),
  rect(1, 2, 7, 4, "w"), rect(5, 2, 3, 4, "W"), rect(0, 3, 2, 2, "X"), px(0, 3, "c"), px(2, 2, "g"),
);

// Cañón: cañón láser sobre trípode, con bobinas de neón a lo largo del tubo y la boca encendida.
piece("cannon", { w: 30, h: 24 },
  // trípode
  line(12, 15, 4, 23, "M", 2), line(14, 15, 23, 23, "M", 2), vline(13, 15, 8, "X"),
  rect(2, 22, 5, 2, "X"), rect(21, 22, 5, 2, "X"),
  // cuerpo del cañón con la célula de energía
  rect(5, 8, 12, 8, "w"), rect(5, 13, 12, 3, "W"), hline(5, 8, 12, "g"), rect(7, 10, 4, 2, "y"), px(7, 10, "g"),
  rect(1, 9, 4, 6, "O"), rect(1, 9, 4, 1, "o"),
  // tubo con bobinas
  rect(17, 9, 10, 4, "W"), hline(17, 9, 10, "w"),
  ...[18, 21, 24].map((x) => rect(x, 8, 2, 6, "C")), ...[18, 21, 24].map((x) => vline(x, 8, 6, "c")),
  // boca encendida
  rect(27, 8, 2, 6, "M"), rect(29, 9, 1, 4, "c"),
  // mira
  rect(8, 5, 5, 3, "o"), px(9, 6, "c"),
);

// La hoja de control: el set entero de una vez.
sheet("galaxia", ["*"], { pad: 2 });
