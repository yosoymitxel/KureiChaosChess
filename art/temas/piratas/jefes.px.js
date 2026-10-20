// Jefes del tema "Piratas": los siete colosos como terrores del mar. Capitán fantasma, barco que
// embiste con su mascarón, kraken, gólem de roca y coral, pirata a lomos de un tiburón, fuerte
// de empalizada con cañones y el gran tiburón que se lo traga todo. Solo se dibuja el bando claro
// (w W o O b: casacas, velas, escamas y pieles del bando); el resto es fijo en los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/piratas/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1e1a26",
  w: "#f6efdc", W: "#e2d3ae", o: "#c3a878", O: "#94784c", b: "#665032",
  s: "#f0c49c", S: "#c2875e",
  n: "#9a5f36", N: "#5c381f",
  y: "#ecc456", Y: "#a97b28",
  m: "#dce2ea", M: "#8c97a8", X: "#555e72",
  h: "#33303f", H: "#4d4a5c",
  g: "#efe9da", G: "#aca392",
  e: "#ffb347", E: "#d9452b",
  f: "#c8f7b8", F: "#6fcf8f", // fuego fantasma
  x: "#bdb6aa", r: "#8c867c", R: "#5f5a54", // roca
  c: "#f5917e", C: "#c0505e", // coral
  a: "#4f86c0", A: "#2f5688", // agua
  v: "#7fb35a", V: "#4a7a3c", // algas
});
ramps("bOoWw", "SsS", "NnN", "Yy", "XMm", "hH", "Gg", "EeE", "Ff", "Rrx", "Cc", "Aa", "Vv");

const boss = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Titán: el capitán fantasma. Calavera de ojos verdes bajo un tricornio enorme, casaca del bando
// abierta sobre las costillas, charreteras de latón, manos de niebla y, en vez de piernas, la
// estela del fantasma. Simétrico: se dibuja la mitad izquierda.
boss("boss-titan", { w: 34, h: 37, mx: true },
  // estela fantasma
  poly([6, 29, 17, 29, 17, 37, 14, 34, 12, 37, 9, 33, 7, 36], "F"), poly([8, 29, 17, 29, 17, 33, 13, 31, 10, 31], "f"),
  // casaca con los faldones hechos jirones
  poly([5, 15, 17, 15, 17, 31, 4, 31], "w"), rect(4, 26, 13, 5, "W"), vline(8, 18, 13, "W"),
  px(4, 30, "_"), px(7, 30, "_"), px(11, 30, "_"), px(12, 30, "_"), px(16, 30, "_"),
  // pecho abierto con las costillas
  poly([13, 15, 17, 15, 17, 26, 15, 26], "k"), ...[17, 19, 21, 23].map((y) => hline(15, y, 2, "g")), vline(13, 15, 10, "o"), vline(12, 16, 9, "O"),
  // cinturón y hebilla
  rect(4, 25, 13, 2, "b"), rect(15, 25, 2, 2, "y"),
  // mangas, puños y manos de niebla
  rect(1, 17, 4, 9, "w"), vline(4, 17, 9, "W"), rect(1, 24, 4, 2, "o"), rect(1, 26, 4, 3, "f"), vline(4, 26, 3, "F"), px(1, 29, "F"), px(3, 29, "F"),
  // charreteras con flecos
  rect(2, 15, 6, 2, "y"), hline(2, 16, 6, "Y"), ...[2, 4, 6].map((x) => px(x, 17, "y")),
  // cuello y calavera de ojos encendidos
  rect(14, 13, 3, 2, "G"),
  rect(11, 7, 6, 6, "g"), rect(12, 12, 5, 2, "g"), vline(11, 8, 4, "G"), px(11, 7, "_"),
  rect(12, 8, 3, 3, "k"), px(13, 9, "F"), px(14, 9, "f"), px(16, 11, "k"), hline(13, 13, 4, "k"), px(14, 13, "g"), px(16, 13, "g"), hline(12, 14, 5, "G"),
  // tricornio enorme con ribete y calavera
  grid(0, 0, `
    ..hh.............
    ..hhh......hhhhhh
    ...hhhhhhhhhhhhhh
    ...hHhhhhhhhhhhgg
    ....hHhhhhhhhhhhg
    ....yyyyyyyyyyyyy
    ...............yh`),
);

// Ariete: el barco que embiste, de perfil y mirando a la izquierda. Casco de madera con la
// franja y las velas del bando, troneras con cañones, espolón de latón a ras del agua y el
// mascarón de proa: una cabeza de carnero con su cuerno enroscado.
boss("boss-ram", { w: 40, h: 30 },
  // mástiles, vergas y bandera negra
  vline(21, 0, 15, "N"), vline(33, 3, 12, "N"), rect(22, 0, 4, 2, "h"), px(23, 0, "g"),
  // velas hinchadas del bando
  poly([13, 3, 20, 2, 21, 13, 14, 13, 12, 8], "w"), poly([22, 2, 29, 3, 31, 8, 30, 13, 22, 13], "w"),
  poly([17, 3, 20, 2, 21, 13, 17, 13], "W"), poly([26, 3, 29, 3, 31, 8, 30, 13, 26, 13], "W"), hline(13, 2, 17, "N"),
  poly([30, 5, 36, 5, 37, 9, 36, 13, 31, 13], "w"), poly([34, 5, 36, 5, 37, 9, 36, 13, 34, 13], "W"), hline(29, 4, 9, "N"),
  // casco: borda, franja del bando, tablazón y obra viva
  poly([4, 13, 40, 13, 40, 25, 13, 26, 7, 21], "n"),
  hline(5, 13, 35, "y"), clip([4, 13, 40, 13, 40, 25, 13, 26, 7, 21], rect(0, 16, 40, 3, "o"), hline(0, 16, 40, "w"), hline(0, 21, 40, "N"), hline(0, 24, 40, "N"), rect(0, 25, 40, 2, "N")),
  // troneras con las bocas de los cañones
  ...[14, 21, 28, 35].map((x) => [rect(x, 17, 3, 2, "k"), px(x + 1, 17, "X")]).flat(),
  // popa alta con su farol
  rect(36, 9, 4, 4, "n"), hline(36, 9, 4, "y"), px(38, 7, "e"), px(38, 8, "Y"),
  // espolón de latón a ras del agua
  poly([0, 23, 9, 20, 10, 25, 6, 26], "y"), poly([0, 23, 9, 23, 10, 25, 6, 26], "Y"),
  // mascarón: cabeza de carnero dorada con el cuerno enroscado
  poly([1, 12, 6, 9, 9, 12, 8, 17, 4, 17, 1, 15], "y"), poly([1, 15, 4, 15, 8, 17, 4, 17], "Y"), px(4, 12, "k"), px(1, 14, "Y"),
  ring(7, 9, 3, "Y"), ring(7, 9, 1, "Y"), px(7, 9, "y"), px(6, 7, "y"), px(8, 7, "y"),
  // olas y espuma
  rect(0, 27, 40, 3, "a"), hline(0, 29, 40, "A"), ...[[2, 26], [11, 26], [20, 27], [29, 27], [36, 26]].map(([x, y]) => hline(x, y, 4, "g")), hline(0, 27, 12, "g"),
);

// Hidra: el kraken. Cabeza-manto del bando con manchas, ojos de cabra amarillos y ocho
// tentáculos que se alzan y se enroscan como cabezas, con sus ventosas.
boss("boss-hydra", { w: 37, h: 34, mx: "c" },
  // tentáculos de los lados, alzados y enroscados arriba
  line(12, 18, 4, 16, "W", 3), line(4, 16, 2, 8, "W", 3), ring(4, 5, 2, "W"), px(4, 5, "o"), line(11, 17, 4, 15, "w", 1), line(3, 15, 1, 9, "w", 1),
  ...[[3, 12], [5, 16], [8, 17]].map(([x, y]) => px(x, y, "o")),
  // tentáculos bajos que se abren por el suelo
  line(13, 20, 7, 26, "W", 3), line(7, 26, 3, 31, "W", 2), ring(2, 30, 2, "W"), px(2, 30, "o"), ...[[9, 25], [5, 29]].map(([x, y]) => px(x, y, "o")),
  line(15, 21, 12, 30, "w", 3), line(12, 30, 9, 33, "w", 2), px(8, 32, "w"), ...[[12, 27], [11, 31], [14, 25]].map(([x, y]) => px(x, y, "o")),
  line(18, 21, 18, 31, "W", 3), px(18, 33, "W"), ...[[18, 24], [18, 27], [18, 30]].map(([x, y]) => px(x, y, "o")),
  // manto
  ellipse(18, 10, 8, 10, "w"), ellipse(20, 12, 6, 8, "W"), ellipse(18, 18, 9, 3, "w"),
  circ(15, 4, 1, "o"), px(12, 9, "o"), px(14, 7, "o"),
  // ojos de cabra
  circ(14, 14, 2, "y"), hline(13, 14, 3, "k"), px(13, 13, "g"),
  // boca-pico bajo el manto
  px(18, 19, "k"), hline(17, 20, 3, "E"),
);

// Gólem: coloso de roca vieja del fondo del mar, cubierto de coral y percebes, con algas en
// los hombros, ojos de farol, el timón de latón empotrado en el pecho y una vela rota del bando
// atada como faja. Puños enormes que tocan el suelo.
boss("boss-golem", { w: 42, h: 36, mx: true },
  // piernas y pies
  rect(13, 27, 6, 6, "r"), rect(13, 27, 1, 6, "R"), rect(12, 32, 8, 4, "R"), rect(13, 32, 4, 1, "r"),
  // torso de bloques con grietas
  poly([8, 12, 21, 12, 21, 27, 11, 27], "r"), rect(12, 13, 9, 1, "x"),
  line(12, 15, 14, 18, "R"), hline(11, 21, 4, "R"),
  // timón de latón en el pecho
  ring(21, 18, 3, "y"), px(21, 18, "Y"), vline(21, 14, 9, "Y"), hline(17, 18, 8, "Y"), px(21, 13, "y"), px(17, 17, "y"),
  // vela rota atada como faja
  rect(11, 23, 10, 4, "w"), rect(11, 26, 10, 1, "W"), line(11, 23, 15, 26, "o"), poly([11, 27, 14, 27, 12, 30], "w"), px(13, 28, "W"),
  // brazos colgando y puños
  rect(2, 15, 6, 11, "r"), rect(2, 15, 1, 11, "R"), hline(2, 20, 6, "R"),
  circ(5, 29, 4, "R"), circ(5, 28, 3, "r"), px(3, 27, "x"), px(5, 26, "x"),
  // coral que le crece en el brazo y el puño, percebes
  vline(3, 16, 4, "c"), px(2, 16, "c"), px(4, 17, "c"), px(3, 15, "c"), px(4, 19, "C"),
  px(7, 30, "c"), px(8, 29, "c"), px(8, 31, "C"), ...[[6, 23], [15, 30], [10, 18]].map(([x, y]) => [px(x, y, "g"), px(x + 1, y, "G")]).flat(),
  // hombro de roca con algas colgando
  circ(8, 12, 6, "R"), circ(8, 11, 5, "r"), circ(7, 10, 3, "x"),
  ellipse(7, 7, 4, 2, "v"), px(5, 7, "V"), px(9, 6, "V"), vline(4, 8, 4, "v"), vline(11, 8, 3, "V"), px(4, 12, "V"),
  // rama de coral en el hombro
  vline(9, 1, 6, "c"), line(9, 3, 7, 1, "c"), line(9, 4, 11, 2, "c"), px(7, 0, "C"), px(11, 1, "C"), vline(10, 4, 3, "C"),
  // cabeza de bloque metida entre los hombros
  rect(15, 4, 6, 8, "x"), rect(15, 4, 6, 1, "r"), rect(15, 7, 6, 1, "R"),
  px(17, 8, "e"), px(18, 8, "E"), hline(18, 10, 3, "R"),
  ellipse(19, 3, 3, 1, "v"), px(17, 3, "V"),
);

// Jinete: pirata larguirucho de pie sobre un tiburón que nada mirando a la izquierda, con las
// riendas de cuerda, el tricornio y la casaca larga del bando. Alto y estrecho.
boss("boss-rider", { w: 28, h: 40 },
  // cola del tiburón levantada detrás
  poly([22, 29, 27, 22, 26, 30, 28, 37, 22, 33], "M"), line(24, 30, 26, 24, "X"),
  // cuerpo del tiburón: lomo gris, vientre blanco, aleta, branquias y boca
  ellipse(13, 32, 12, 5, "M"), ellipse(12, 35, 11, 3, "g"), poly([1, 31, 5, 29, 8, 31, 8, 35, 2, 35], "M"),
  hline(1, 34, 9, "k"), ...[2, 4, 6, 8].map((x) => px(x, 35, "g")), px(0, 32, "M"), px(4, 31, "k"), px(4, 30, "g"),
  ...[10, 12].map((x) => line(x, 31, x - 1, 34, "X")),
  poly([8, 37, 13, 37, 9, 40], "M"),
  // silla y riendas del bando
  rect(13, 27, 7, 2, "o"), hline(13, 28, 7, "O"), line(5, 32, 13, 17, "N"),
  // botas y piernas
  rect(14, 25, 2, 3, "b"), rect(17, 25, 2, 3, "b"), rect(14, 21, 2, 4, "O"), rect(17, 21, 2, 4, "O"),
  // casaca larga con faldones
  poly([12, 11, 20, 11, 22, 24, 11, 24], "w"), poly([18, 12, 20, 11, 22, 24, 19, 24], "W"), vline(16, 12, 12, "o"), hline(12, 18, 9, "b"), px(16, 18, "y"),
  ...[13, 15].map((y) => px(15, y, "y")),
  // brazo con las riendas y brazo con el alfanje en alto
  rect(10, 13, 3, 4, "w"), rect(9, 16, 3, 2, "s"),
  rect(20, 11, 3, 4, "W"), rect(22, 9, 2, 3, "s"), rect(21, 8, 4, 1, "y"), line(23, 7, 25, 1, "m"), line(24, 7, 26, 1, "M"), px(26, 0, "m"),
  // cara, perilla y pelo
  rect(13, 6, 6, 5, "s"), rect(17, 7, 2, 4, "S"), px(14, 8, "k"), px(17, 8, "k"), rect(14, 10, 4, 2, "h"), vline(12, 6, 6, "h"),
  // tricornio
  rect(12, 3, 9, 3, "h"), hline(13, 2, 7, "h"), hline(11, 5, 11, "h"), px(11, 4, "h"), px(21, 4, "h"), hline(12, 5, 9, "y"), px(14, 3, "H"),
);

// Muralla: el fuerte de empalizada. Troncos afilados con el cinturón de cuerda, dos blocaos con
// tejado y estandarte del bando, troneras con cañones que miran como ojos y la puerta de
// estacas como una boca. Ancho y bajo.
boss("boss-wall", { w: 44, h: 26, mx: true },
  // blocao con tejado del bando
  rect(1, 6, 9, 18, "n"), poly([0, 6, 5, 1, 11, 6], "o"), poly([5, 1, 11, 6, 6, 6], "O"), hline(0, 6, 11, "b"),
  ...[9, 13, 17, 21].map((y) => hline(1, y, 9, "N")), rect(4, 9, 3, 2, "k"), px(5, 9, "e"),
  // empalizada: troncos con punta y vetas
  ...[10, 13, 16, 19].map((x, i) => [rect(x, 8 + (i % 2), 3, 16 - (i % 2), "n"), px(x + 1, 6 + (i % 2), "n"), rect(x, 7 + (i % 2), 3, 1, "n"), vline(x + 2, 8 + (i % 2), 16 - (i % 2), "N"), px(x, 8 + (i % 2), "y")]).flat(),
  rect(10, 7, 1, 1, "_"), rect(12, 7, 1, 1, "_"), rect(16, 7, 1, 1, "_"), rect(18, 7, 1, 1, "_"),
  // cinturón de cuerda que ata los troncos
  hline(1, 18, 21, "y"), hline(1, 19, 21, "Y"),
  // troneras-ojo con la boca del cañón
  rect(12, 11, 5, 4, "k"), circ(14, 13, 1, "X"), px(14, 13, "k"), px(13, 12, "M"),
  // puerta-boca de estacas afiladas
  poly([19, 16, 22, 14, 22, 24, 19, 24], "k"), ...[19, 21].map((x) => [vline(x, 21, 3, "n"), px(x, 20, "G")]).flat(), px(21, 15, "G"), px(20, 16, "G"),
  // estandarte del bando en el blocao
  rect(2, 12, 6, 6, "w"), poly([2, 18, 8, 18, 5, 21], "w"), hline(2, 12, 6, "y"), rect(4, 14, 2, 2, "o"), vline(7, 13, 5, "W"),
  // arena y agua al pie
  rect(0, 24, 22, 2, "o"), hline(0, 25, 22, "O"), ellipse(3, 24, 3, 1, "a"),
);

// Devorador: el gran tiburón de frente con las fauces abiertas de par en par sobre un remolino.
// Piel del bando, vientre blanco, dos filas de dientes, garganta roja y ojillos negros.
boss("boss-devourer", { w: 38, h: 32, mx: true },
  // remolino que lo arrastra todo
  ellipse(19, 28, 19, 4, "A"), ellipse(19, 28, 15, 3, "a"), ellipse(19, 28, 10, 2, "A"),
  line(2, 28, 8, 30, "g"), line(10, 26, 16, 25, "g"), px(5, 25, "a"), px(8, 24, "a"), px(3, 30, "a"),
  // aletas pectorales
  poly([2, 18, 8, 15, 10, 22, 4, 26, 0, 25], "O"), line(3, 22, 8, 17, "b"),
  // cabeza
  ellipse(19, 14, 15, 12, "w"), ellipse(19, 18, 14, 8, "W"), ellipse(19, 22, 11, 5, "g"),
  // aleta dorsal
  poly([16, 0, 19, 0, 19, 4, 14, 4], "o"), px(17, 1, "W"),
  // fauces, encías, garganta y dos filas de dientes
  ellipse(19, 17, 12, 8, "k"), ellipse(19, 17, 11, 7, "E"), ellipse(19, 19, 7, 4, "k"), ellipse(19, 20, 4, 2, "h"),
  ...[8, 11, 14, 17].map((x) => poly([x, 10, x + 3, 10, x + 1, 14], "g")),
  ...[9, 12, 15].map((x) => poly([x, 25, x + 3, 25, x + 1, 21], "g")),
  // ojillos negros con su brillo
  circ(7, 9, 1, "k"), px(6, 8, "g"), px(10, 5, "o"),
);

sheet("jefes", ["boss-titan", "boss-ram", "boss-hydra", "boss-golem", "boss-rider", "boss-wall", "boss-devourer"], { pad: 2 });
