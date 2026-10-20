// Jefes del tema "Galaxia": los siete colosos como amenazas de una estación espacial, con el
// doble de píxeles por casilla que las piezas. Igual que en piezas.px.js, el blindaje y la piel
// del bando usan la rampa w W o O b y se recolorean; el metal de las juntas, el neón cian, los
// pilotos, la piel violeta de los alienígenas y el vacío del agujero negro son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/scifi/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#0d0f1c",
  w: "#f4f8fc", W: "#cdd8e6", o: "#9daac0", O: "#6b7891", b: "#475069",
  m: "#5b6680", M: "#3b4459", X: "#252c3d",
  c: "#8af7ff", C: "#1fb4dc",
  y: "#ffd95a", Y: "#d8901e",
  r: "#ff4b5c",
  g: "#ffffff",
  v: "#9b86d8", V: "#6a58a8", u: "#463a78", // piel violeta de los alienígenas
  z: "#1a1030", // vacío del agujero negro
});
ramps("bOoWw", "XMm", "Cc", "Yy", "uVv");

const boss = (name, { post = [], ...opts }, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" }, ...post);
};

// Titán: mecha gigante de cresta en V, visor cian, hombreras enormes, núcleo en el pecho y
// puños-cañón. Simétrico: se dibuja la mitad izquierda; las sombras de la derecha van después.
boss("boss-titan", { w: 34, h: 37, mx: true,
  post: [rect(27, 10, 3, 3, "W"), rect(22, 12, 2, 9, "W"), rect(28, 23, 3, 5, "o"), rect(19, 27, 3, 5, "o"), px(4, 10, "g"), px(13, 4, "g")] },
  // brazos: hombro, codo, antebrazo y puño-cañón
  rect(3, 15, 4, 8, "M"), rect(4, 15, 1, 8, "m"),
  rect(1, 23, 7, 5, "W"), rect(1, 23, 7, 1, "w"), hline(1, 26, 7, "o"),
  rect(2, 28, 5, 4, "X"), rect(3, 30, 3, 2, "C"), px(4, 31, "c"),
  // pecho con núcleo
  poly([9, 11, 17, 11, 17, 22, 11, 22], "w"), hline(10, 11, 7, "g"), hline(11, 19, 6, "o"),
  rect(14, 13, 3, 4, "C"), rect(15, 14, 2, 2, "c"), px(12, 13, "y"),
  // cintura y faldón
  rect(12, 22, 5, 2, "M"), hline(12, 22, 5, "m"),
  poly([11, 24, 17, 24, 17, 27, 10, 27], "W"), vline(14, 24, 3, "o"),
  // piernas, rodilla y pie
  rect(11, 27, 5, 6, "W"), rect(11, 27, 5, 1, "w"), rect(11, 29, 5, 2, "o"), px(12, 29, "w"),
  rect(9, 33, 7, 4, "M"), rect(9, 33, 7, 1, "m"), rect(9, 36, 7, 1, "X"),
  // hombreras con franja de aviso
  rect(1, 9, 9, 6, "w"), rect(1, 9, 9, 1, "g"), rect(1, 13, 9, 2, "O"), rect(2, 11, 7, 1, "y"),
  // cabeza con visor y bozal
  rect(15, 10, 2, 2, "X"),
  rect(12, 2, 5, 8, "w"), rect(12, 2, 5, 1, "g"), rect(12, 5, 5, 2, "X"), rect(13, 5, 4, 1, "c"), rect(14, 8, 3, 2, "M"), px(15, 8, "X"),
  // cresta en V con el piloto
  line(16, 3, 11, 0, "y"), line(16, 4, 12, 2, "Y"), px(16, 2, "r"),
);

// Ariete: nave de embestida de perfil, mirando a la izquierda. Proa de metal en cuña con estrías,
// casco del bando, cabina de cristal, aleta de cola, motores cian y patines que flotan.
boss("boss-ram", { w: 40, h: 30 },
  // aletas de cola (detrás)
  poly([28, 9, 33, 1, 37, 1, 36, 11], "W"), hline(33, 1, 4, "w"), poly([28, 21, 36, 20, 37, 26, 33, 26], "O"),
  // casco
  poly([10, 6, 30, 7, 37, 11, 37, 21, 30, 24, 10, 25], "w"), poly([10, 17, 37, 17, 37, 21, 30, 24, 10, 25], "W"),
  poly([10, 22, 32, 22, 30, 24, 10, 25], "O"), hline(11, 6, 19, "g"),
  hline(12, 15, 25, "o"), rect(28, 12, 6, 2, "o"), vline(22, 8, 7, "o"), vline(22, 18, 4, "o"),
  rect(24, 18, 4, 2, "y"), px(24, 18, "Y"),
  // cabina
  poly([15, 7, 20, 2, 27, 2, 29, 7], "C"), poly([17, 6, 20, 3, 24, 3, 22, 6], "c"), px(20, 3, "g"), px(19, 4, "g"),
  // motores
  rect(37, 9, 3, 15, "X"), rect(37, 11, 2, 4, "C"), rect(37, 17, 2, 4, "C"), px(39, 12, "c"), px(39, 13, "c"), px(39, 18, "c"), px(39, 19, "c"),
  // proa de embestida en cuña con estrías
  poly([0, 16, 11, 5, 13, 5, 13, 26, 11, 26], "m"), poly([0, 16, 13, 16, 13, 26, 11, 26], "M"),
  line(3, 13, 12, 7, "g"), line(5, 16, 12, 16, "X"), line(4, 18, 12, 23, "X"), line(5, 14, 12, 10, "X"),
  px(1, 16, "g"),
  // patines con el colchón de energía
  rect(14, 25, 7, 2, "M"), rect(26, 24, 7, 3, "M"), hline(14, 25, 7, "m"),
  rect(15, 27, 5, 1, "C"), rect(27, 27, 5, 1, "C"), rect(16, 28, 3, 2, "c"), rect(28, 28, 3, 2, "c"),
);

// Hidra: alienígena de tres tentáculos-cabeza sobre un cuerpo de piel del bando. Cada cabeza es un
// ojo único y unas fauces; ventosas a lo largo del cuello. Simétrica con columna central.
boss("boss-hydra", { w: 37, h: 34, mx: "c",
  post: [rect(24, 27, 7, 2, "O"), px(9, 25, "w"), px(17, 2, "g")] },
  // cuerpo de babosa
  ellipse(18, 28, 17, 6, "O"), ellipse(18, 27, 15, 5, "W"), ellipse(17, 26, 12, 3, "w"),
  ...[5, 9, 13].map((x) => px(x, 30, "b")), hline(4, 33, 30, "b"),
  // tentáculo lateral y su cabeza, mirando afuera
  line(12, 25, 6, 15, "W", 4), line(11, 24, 6, 16, "w", 2),
  ...[[9, 21], [7, 18]].map(([x, y]) => px(x, y, "o")),
  ellipse(5, 11, 5, 4, "W"), ellipse(5, 10, 4, 3, "w"),
  circ(5, 10, 2, "y"), px(5, 10, "k"), px(4, 9, "g"),
  hline(1, 14, 7, "X"), px(2, 15, "g"), px(5, 15, "g"), px(2, 13, "g"), px(6, 13, "g"),
  // tentáculo central y la cabeza mayor, de frente
  rect(16, 9, 3, 15, "W"), rect(16, 9, 2, 15, "w"), ...[12, 16, 20].map((y) => px(16, y, "o")),
  ellipse(18, 5, 6, 5, "W"), ellipse(18, 4, 5, 4, "w"),
  circ(18, 4, 2, "y"), circ(18, 4, 1, "r"), px(18, 4, "k"),
  rect(14, 8, 9, 2, "X"), px(15, 8, "g"), px(17, 9, "g"), px(13, 7, "o"),
);

// Gólem: robot colosal de bloques (3×3). Cabeza-cubo con ranura de ojos, torso de placas
// remachadas con el reactor, brazos de bloques que llegan al suelo y piernas cortas.
boss("boss-golem", { w: 42, h: 36, mx: true,
  post: [rect(37, 13, 3, 11, "W"), rect(28, 12, 2, 15, "W"), rect(24, 4, 2, 9, "W"), px(3, 13, "g"), px(16, 4, "g")] },
  // piernas cortas y pies
  rect(12, 28, 7, 5, "W"), rect(12, 28, 7, 1, "w"), rect(11, 33, 9, 3, "M"), rect(11, 33, 9, 1, "m"),
  // torso de placas
  rect(8, 12, 13, 16, "w"), hline(8, 12, 13, "g"), hline(8, 19, 13, "o"), hline(8, 24, 13, "o"), vline(14, 13, 6, "o"),
  ...[[9, 13], [9, 20], [12, 25], [19, 13]].map(([x, y]) => px(x, y, "M")),
  // reactor
  rect(17, 14, 4, 5, "X"), rect(18, 15, 3, 3, "C"), px(19, 16, "c"), px(20, 16, "c"),
  rect(16, 25, 5, 3, "M"), px(17, 26, "y"), px(19, 26, "y"),
  // brazos de bloques hasta el suelo
  rect(1, 13, 7, 6, "W"), rect(1, 13, 7, 1, "w"), rect(3, 19, 4, 2, "M"),
  rect(1, 21, 7, 7, "W"), rect(1, 21, 7, 1, "w"),
  rect(0, 28, 8, 7, "O"), rect(0, 28, 8, 1, "o"), hline(1, 31, 7, "b"), px(2, 30, "M"), px(5, 30, "M"),
  // hombros
  rect(2, 9, 10, 4, "o"), rect(2, 9, 10, 1, "W"), px(4, 11, "M"), px(9, 11, "M"),
  // cabeza-cubo con la ranura de los ojos
  rect(14, 2, 7, 10, "w"), hline(14, 2, 7, "g"), rect(15, 5, 6, 2, "X"), rect(16, 5, 3, 1, "c"), px(16, 6, "C"),
  rect(16, 9, 5, 1, "o"), vline(20, 0, 2, "M"), px(20, 0, "r"),
);

// Jinete: alienígena alto y flaco, de cabeza grande y ojos negros, con traje del bando y lanza de
// energía, montado en una bestia violeta de patas largas. Alto y estrecho (2×1 en vertical).
boss("boss-rider", { w: 28, h: 40 },
  // lanza de energía, detrás
  line(21, 24, 26, 1, "M"), rect(25, 0, 2, 4, "c"), px(26, 0, "g"),
  // patas de la bestia
  line(9, 29, 7, 37, "u", 2), line(19, 29, 21, 37, "u", 2), line(12, 29, 12, 37, "V", 2), line(16, 29, 17, 37, "V", 2),
  rect(6, 38, 3, 2, "u"), rect(11, 38, 3, 2, "V"), rect(16, 38, 3, 2, "V"), rect(20, 38, 3, 2, "u"),
  // cola
  line(23, 26, 27, 34, "u", 2), px(27, 35, "c"),
  // cuerpo de la bestia con manchas y silla
  ellipse(15, 26, 9, 5, "V"), ellipse(14, 25, 7, 3, "v"), ...[[19, 27], [21, 24], [10, 28]].map(([x, y]) => px(x, y, "c")),
  poly([9, 22, 21, 22, 22, 29, 8, 29], "W"), hline(9, 22, 12, "o"), hline(8, 29, 15, "y"), vline(20, 23, 6, "o"),
  ...[9, 13, 17, 21].map((x) => px(x, 30, "y")),
  // cuello largo y cabeza con mandíbulas
  line(8, 24, 4, 14, "V", 3), line(7, 23, 3, 14, "v"),
  ellipse(3, 13, 3, 3, "V"), rect(0, 13, 4, 3, "V"), px(2, 12, "y"), hline(0, 15, 3, "X"), px(1, 16, "g"),
  // alienígena: piernas, cuerpo flaco con el traje, brazo con la lanza

  rect(12, 10, 6, 9, "w"), rect(16, 10, 2, 9, "W"), hline(12, 15, 6, "o"), px(14, 12, "c"),
  rect(18, 11, 2, 7, "W"), rect(19, 17, 3, 2, "v"),
  rect(12, 19, 5, 3, "O"), rect(12, 22, 2, 6, "O"), rect(11, 28, 3, 1, "u"), hline(12, 19, 5, "o"),
  // cuello y cabeza grande de ojos negros
  rect(14, 8, 2, 2, "V"),
  ellipse(15, 4, 5, 4, "v"), ellipse(16, 5, 3, 3, "V"), clip([10, 0, 7, 5], ellipse(15, 4, 5, 4, "v")),
  poly([11, 4, 14, 4, 13, 7, 11, 6], "z"), poly([16, 4, 19, 4, 18, 6, 17, 7], "z"), px(12, 5, "g"), px(17, 5, "g"),
);

// Muralla: barrera de escudos (1×2), ancha y baja. Dos pilones emisores del bando con su ojo rojo
// y, entre ellos, un campo de energía de celdas hexagonales sobre un raíl de metal.
boss("boss-wall", { w: 42, h: 24, mx: true,
  post: [rect(38, 3, 2, 17, "W"), px(2, 4, "g")] },
  // raíl
  rect(1, 20, 21, 4, "M"), hline(1, 20, 21, "m"), ...[5, 11, 17].map((x) => rect(x, 22, 2, 1, "X")),
  // campo de energía
  rect(8, 4, 13, 16, "C"),
  ...[[10, 6], [16, 6], [13, 10], [19, 10], [10, 14], [16, 14], [13, 18], [19, 18], [10, 2], [16, 2], [19, 2]].map(([x, y]) => poly([x - 2, y, x - 1, y - 2, x + 1, y - 2, x + 2, y, x + 1, y + 2, x - 1, y + 2], "c")),
  clip([8, 0, 13, 4], rect(8, 0, 13, 4, "_")), hline(8, 4, 13, "c"),
  // pilón emisor con almenas, ojo y franja de aviso
  rect(1, 3, 8, 17, "w"), hline(1, 3, 8, "g"), rect(1, 0, 2, 3, "w"), rect(5, 0, 2, 3, "w"),
  rect(3, 6, 4, 3, "X"), rect(4, 7, 2, 1, "r"), px(4, 7, "g"),
  rect(1, 12, 8, 2, "y"), ...[2, 5].map((x) => px(x, 13, "X")),
  vline(7, 4, 16, "W"), rect(2, 16, 5, 1, "o"),
  // bobinas que alimentan el campo
  ...[7, 11, 15].map((y) => rect(8, y, 2, 2, "M")),
);

// Devorador: agujero negro con boca. Un cuerpo alienígena redondo del bando, abierto en unas
// fauces que son un remolino de vacío con su disco de luz y un anillo de dientes. Ojillos arriba
// y patas de tentáculo.
boss("boss-devourer", { w: 38, h: 32, mx: true,
  post: [rect(31, 12, 2, 10, "W"), px(9, 8, "g"), px(8, 9, "g")] },
  // tentáculos de apoyo
  line(8, 25, 4, 31, "O", 3), line(14, 27, 12, 31, "W", 2), px(3, 31, "b"),
  // cuerpo
  ellipse(19, 16, 18, 13, "w"), ellipse(19, 20, 17, 9, "W"), ellipse(19, 26, 13, 3, "O"),
  ...[[6, 13], [9, 22], [4, 18]].map(([x, y]) => circ(x, y, 1, "o")),
  // fauces: disco de luz, dientes y el vacío que gira
  circ(19, 17, 10, "X"), circ(19, 17, 9, "C"), ring(19, 17, 8, "c"),
  ...[[10, 13], [10, 21], [13, 9], [13, 25], [17, 8], [17, 26]].map(([x, y]) => poly([x - 1, y - 1, x + 2, y, x, y + 2], "g")),
  circ(19, 17, 6, "z"), circ(19, 17, 6, "z"),
  line(13, 15, 17, 12, "u"), line(14, 20, 18, 22, "u"), line(16, 17, 18, 15, "V"),
  circ(19, 17, 2, "k"),
  // ojillos y antenas
  circ(14, 4, 2, "y"), px(14, 4, "k"), px(13, 3, "g"),
  line(11, 3, 8, 0, "O", 1), px(8, 0, "c"),
);

sheet("jefes", ["boss-*"], { pad: 2 });
