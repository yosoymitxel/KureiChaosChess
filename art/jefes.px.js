// Jefes del tema "Pixelada": los siete colosos como criaturas de fantasía medieval, con el doble de
// píxeles por casilla que las piezas (el juego los dibuja a 1 píxel de arte por unidad, no a 2).
// Mismas reglas que art/pixelada.px.js: la ropa, la armadura pintada y las escamas usan la rampa
// del bando (w W o O b) y se recolorean; piel, metal, latón, hueso y piedra son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#2a2233",
  w: "#f8f0dc", W: "#e8d5ac", o: "#c9a468", O: "#9a7440", b: "#6b4d2c",
  p: "#a48fce", P: "#7d63b0", q: "#5a4487", Q: "#3a2a5c",
  t: "#a8e8cd", T: "#5ec3a4", u: "#338f77", U: "#1f6152",
  s: "#f1c5a0", S: "#c98e6c",
  m: "#d6dde6", M: "#8a95a5", X: "#5d6676", // metal claro, medio y en sombra
  n: "#9a6a3e", N: "#5e3c22",
  g: "#eee8d8", G: "#b9ae96", // hueso y cuerno
  y: "#f0c85a", Y: "#b08530",
  f: "#9fe3ff", F: "#4aa8d8",
  e: "#ffb347", E: "#e2552b", // brasa: ojos y fauces
  x: "#c9c2b4", r: "#9c958a", R: "#6f6a62", // piedra
  v: "#8db35f", V: "#55803f", // musgo
});
ramps("bOoWw", "QqPp", "UuTt", "SsS", "XMm", "Yy", "GgG", "EeE", "Rrx", "Vv");

const DARK = { w: "p", W: "P", o: "q", O: "Q", b: "Q" };
const WILD = { w: "t", W: "T", o: "u", O: "U", b: "U" };

const boss = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name + "_l", { base: "_" + name, outline: "k" });
  sprite(name + "_d", { base: "_" + name, swap: DARK, outline: "k" });
  sprite(name + "_w", { base: "_" + name, swap: WILD, outline: "k" });
};

// Titán: rey guerrero gigante, yelmo cornudo con corona, ojos de brasa, hombreras redondas,
// tabardo del bando con ribete de latón y capa a la espalda. Simétrico: se dibuja la mitad izquierda.
boss("boss-titan", { w: 34, h: 37, mx: true },
  // capa del bando detrás, con su pliegue
  poly([6, 13, 13, 13, 13, 36, 3, 36], "O"), vline(7, 20, 16, "b"),
  // piernas acorazadas: muslo, rodillera y bota
  rect(11, 27, 5, 7, "M"), rect(12, 27, 2, 7, "m"), rect(11, 30, 5, 2, "X"), rect(12, 30, 2, 1, "M"),
  rect(10, 34, 6, 3, "N"), rect(11, 34, 2, 1, "n"),
  // brazo con codal y puño
  rect(4, 17, 4, 9, "M"), rect(5, 17, 1, 9, "m"), rect(4, 21, 4, 1, "X"), rect(3, 26, 5, 4, "X"), rect(4, 26, 2, 1, "M"),
  // tabardo con ribete de latón, cinturón con hebilla y faldón
  rect(10, 13, 7, 14, "w"), rect(10, 13, 1, 14, "y"), rect(16, 15, 1, 8, "W"),
  rect(10, 23, 7, 2, "N"), rect(15, 23, 2, 2, "y"), rect(16, 23, 1, 1, "Y"),
  rect(10, 25, 7, 3, "W"), rect(10, 27, 7, 1, "O"),
  // hombrera redonda con remache
  circ(8, 14, 4, "M"), circ(8, 13, 3, "m"), rect(5, 16, 7, 1, "X"), px(7, 12, "g"), px(9, 15, "y"),
  // cuello y yelmo de cubo con visera
  rect(13, 10, 4, 3, "X"),
  rect(11, 3, 6, 8, "M"), rect(12, 3, 3, 7, "m"), rect(11, 7, 6, 1, "k"), px(14, 7, "e"), px(15, 7, "E"),
  rect(12, 9, 5, 1, "X"), px(13, 4, "g"),
  // cuernos de hueso que se curvan hacia arriba
  line(11, 5, 8, 4, "g", 2), line(8, 4, 6, 1, "g", 1), px(6, 0, "G"), px(9, 5, "G"),
  // corona de latón
  rect(12, 1, 5, 2, "y"), px(12, 0, "y"), px(15, 0, "y"), rect(12, 2, 5, 1, "Y"), px(16, 1, "e"),
);

// Ariete: carnero de guerra que embiste, de perfil y mirando a la izquierda. Lana de hueso,
// testera de hierro, cuernos de latón en espiral y gualdrapa del bando con ribete y blasón.
boss("boss-ram", { w: 40, h: 30 },
  // cola y patas traseras (detrás)
  ellipse(36, 13, 2, 2, "g"),
  rect(28, 20, 3, 7, "G"), rect(33, 19, 3, 8, "G"), rect(28, 26, 3, 2, "N"), rect(33, 26, 3, 2, "N"),
  // cuerpo de lana con rizos
  ellipse(23, 14, 13, 8, "g"), ellipse(23, 17, 12, 5, "G"),
  ...[[14, 8], [19, 6], [25, 6], [31, 8], [34, 12], [12, 12]].map(([x, y]) => ring(x, y, 1, "G")),
  // patas delanteras
  rect(13, 20, 3, 7, "G"), rect(18, 21, 3, 6, "G"), rect(13, 26, 3, 2, "N"), rect(18, 26, 3, 2, "N"),
  // gualdrapa del bando con ribete de latón y blasón
  poly([14, 9, 32, 9, 34, 20, 12, 20], "w"), poly([14, 9, 32, 9, 32, 11, 14, 11], "W"),
  hline(12, 20, 23, "y"), ...[13, 17, 21, 25, 29, 33].map((x) => px(x, 21, "y")),
  circ(23, 15, 2, "y"), px(23, 15, "Y"), vline(31, 11, 9, "W"),
  // cuello y cabeza de perfil, gacha para embestir: frente ancha, hocico y belfo
  ellipse(11, 12, 5, 5, "g"), poly([2, 10, 9, 8, 10, 17, 3, 18, 1, 15], "g"), rect(1, 15, 4, 3, "G"),
  px(1, 15, "k"), hline(2, 18, 3, "k"),
  // testera de hierro en la frente, con remaches
  poly([2, 9, 9, 7, 9, 11, 2, 12], "M"), poly([3, 9, 8, 8, 8, 9, 3, 10], "m"), px(4, 11, "y"), px(7, 10, "y"),
  // ojo de brasa bajo la testera
  px(7, 13, "e"), px(8, 13, "E"),
  // cuerno de latón enroscado alrededor de la oreja
  ring(13, 11, 4, "y"), ring(13, 11, 2, "Y"), px(13, 11, "y"), px(10, 14, "y"), px(9, 15, "Y"),
);

// Hidra: tres cabezas de serpiente sobre un cuerpo de escamas del bando, vientre de hueso,
// crestas de latón y fauces abiertas. Simétrica con columna central compartida.
boss("boss-hydra", { w: 37, h: 34, mx: "c" },
  // cuerpo enroscado
  ellipse(18, 28, 17, 6, "O"), ellipse(18, 27, 15, 5, "W"), ellipse(18, 26, 12, 3, "w"),
  rect(15, 22, 4, 11, "g"), ...[24, 26, 28, 30].map((y) => hline(15, y, 4, "G")),
  // cuello lateral y su cabeza, mirando afuera
  line(12, 25, 7, 16, "W", 4), line(11, 24, 7, 17, "w", 2),
  ...[[9, 19], [8, 16]].map(([x, y]) => px(x - 2, y, "y")),
  ellipse(5, 13, 4, 3, "W"), ellipse(2, 15, 3, 2, "W"), rect(0, 15, 4, 1, "E"), px(1, 16, "g"), px(3, 16, "g"),
  px(5, 12, "e"), px(4, 12, "k"), line(6, 10, 9, 8, "y", 1),
  // cuello central y la cabeza mayor, de frente
  rect(16, 9, 3, 15, "W"), rect(17, 9, 2, 15, "w"), ...[11, 14, 17, 20].map((y) => px(15, y, "y")),
  ellipse(18, 6, 5, 4, "W"), ellipse(18, 5, 4, 3, "w"),
  px(15, 5, "e"), px(16, 5, "E"), hline(15, 8, 4, "k"), hline(16, 9, 3, "E"), px(16, 9, "g"),
  line(14, 2, 12, 0, "y", 1), px(16, 2, "y"), px(18, 1, "y"),
);

// Gólem: coloso de piedra (3×3), hombros de roca con musgo, runas que brillan en el pecho y los
// ojos, faja del bando con hebilla de latón y puños enormes que tocan el suelo.
boss("boss-golem", { w: 42, h: 36, mx: true },
  // piernas y pies
  rect(13, 27, 6, 6, "r"), rect(13, 27, 1, 6, "R"), rect(12, 32, 8, 4, "R"), rect(13, 32, 4, 1, "r"),
  // torso de bloques con grietas y runa central
  poly([8, 12, 21, 12, 21, 27, 11, 27], "r"), rect(12, 13, 9, 1, "x"),
  line(13, 16, 15, 19, "R"), line(15, 19, 14, 22, "R"), hline(11, 21, 4, "R"),
  circ(21, 18, 2, "F"), circ(21, 18, 1, "f"),
  // faja del bando
  rect(11, 24, 10, 3, "w"), rect(11, 26, 10, 1, "O"), rect(19, 24, 2, 3, "y"),
  // brazos colgando y puños
  rect(2, 15, 6, 11, "r"), rect(2, 15, 1, 11, "R"), hline(2, 20, 6, "R"),
  circ(5, 29, 4, "R"), circ(5, 28, 3, "r"), px(3, 27, "x"), px(5, 26, "x"), px(7, 27, "x"),
  // hombro de roca con musgo
  circ(8, 12, 6, "R"), circ(8, 11, 5, "r"), circ(7, 10, 3, "x"),
  ellipse(7, 7, 4, 2, "v"), px(5, 7, "V"), px(9, 6, "V"), px(4, 9, "v"),
  // cabeza de bloque metida entre los hombros
  rect(15, 4, 6, 8, "x"), rect(15, 4, 6, 1, "r"), rect(15, 7, 6, 1, "R"),
  px(17, 8, "f"), px(18, 8, "F"), hline(18, 10, 3, "R"),
  ellipse(19, 3, 3, 1, "v"), px(17, 3, "V"),
);

// Jinete: caballero de armadura sobre corcel con gualdrapa del bando, escudo, lanza con
// banderola y penacho. Alto y estrecho (2×1 en vertical).
boss("boss-rider", { w: 28, h: 40 },
  // lanza y banderola, detrás
  line(20, 22, 26, 1, "N", 1), poly([26, 1, 27, 4, 22, 3], "w"), px(26, 0, "m"),
  // patas y cola del caballo
  rect(8, 31, 2, 8, "n"), rect(11, 31, 2, 7, "n"), rect(18, 31, 2, 7, "n"), rect(21, 31, 2, 8, "n"),
  rect(8, 38, 2, 2, "N"), rect(11, 37, 2, 2, "N"), rect(18, 37, 2, 2, "N"), rect(21, 38, 2, 2, "N"),
  line(24, 24, 27, 33, "N", 2),
  // cuerpo y gualdrapa con ribete
  ellipse(15, 27, 9, 5, "n"), poly([7, 23, 23, 23, 24, 31, 6, 31], "w"), hline(6, 31, 19, "y"),
  ...[7, 11, 15, 19, 23].map((x) => px(x, 32, "y")), circ(15, 27, 2, "y"),
  // cuello, crin, cabeza y testera
  line(9, 24, 5, 15, "n", 3), line(8, 22, 5, 14, "N", 1),
  ellipse(4, 15, 3, 2, "n"), rect(0, 15, 4, 3, "n"), px(1, 16, "k"),
  rect(2, 12, 4, 3, "m"), px(4, 14, "k"), px(3, 11, "M"),
  // caballero: piernas en estribo, torso, tabardo y escudo
  rect(13, 20, 3, 6, "M"), rect(12, 12, 7, 10, "m"), rect(12, 12, 1, 10, "M"),
  rect(13, 14, 5, 7, "w"), vline(15, 14, 7, "y"),
  rect(8, 14, 5, 7, "w"), rect(8, 14, 5, 1, "y"), rect(8, 20, 5, 1, "y"), px(10, 17, "y"),
  // yelmo con visera y penacho del bando
  rect(12, 6, 7, 6, "m"), rect(12, 6, 1, 6, "M"), hline(13, 8, 6, "k"), px(17, 8, "e"),
  line(15, 6, 19, 1, "o", 2), px(20, 1, "o"),
  // brazo con la lanza
  rect(18, 14, 3, 5, "M"),
);

// Muralla: un lienzo de muralla vivo (1×2) entre dos torres. Almenas, saeteras que miran como
// ojos, rastrillo de dientes de hierro en la puerta, estandartes del bando y musgo al pie.
boss("boss-wall", { w: 44, h: 26, mx: true },
  // torre con almenas
  rect(1, 4, 9, 20, "r"), ...[1, 4, 7].map((x) => rect(x, 1, 2, 3, "r")), rect(1, 4, 9, 1, "x"),
  // lienzo con almenas
  rect(10, 8, 12, 16, "r"), ...[11, 15, 19].map((x) => rect(x, 6, 2, 2, "r")), rect(10, 8, 12, 1, "x"),
  // hiladas de piedra con juntas alternas
  ...[12, 16, 20].map((y) => hline(1, y, 21, "R")),
  ...[[4, 9], [8, 9], [13, 9], [17, 9], [6, 13], [11, 13], [15, 13], [3, 17], [9, 17], [14, 17]].map(([x, y]) => vline(x, y, 3, "R")),
  // saetera-ojo en la torre y ojos del lienzo
  rect(5, 7, 1, 4, "k"), px(5, 8, "e"), rect(13, 10, 3, 2, "k"), px(14, 10, "e"), px(15, 10, "E"),
  // puerta-boca con rastrillo
  poly([18, 14, 22, 12, 22, 24, 18, 24], "k"), vline(19, 14, 5, "M"), vline(21, 13, 6, "M"), hline(18, 16, 4, "X"),
  px(19, 19, "m"), px(21, 19, "m"),
  // estandarte del bando en la torre
  rect(2, 12, 5, 7, "w"), poly([2, 19, 7, 19, 4, 22], "w"), rect(2, 12, 5, 1, "y"), px(4, 15, "y"), px(4, 16, "Y"),
  // musgo al pie
  ellipse(6, 24, 6, 1, "v"), ellipse(15, 24, 4, 1, "V"),
);

// Devorador: boca con patas. Cuerpo redondo del bando con manchas, fauces enormes con dos filas
// de dientes, lengua de brasa, ojillos arriba, cuernos de hueso y garras.
boss("boss-devourer", { w: 38, h: 32, mx: true },
  // patas con garras
  rect(6, 27, 6, 4, "O"), px(6, 31, "g"), px(8, 31, "g"), px(10, 31, "g"),
  // cuerpo con manchas
  ellipse(19, 17, 17, 12, "w"), ellipse(19, 21, 16, 8, "W"),
  circ(7, 12, 2, "W"), circ(11, 6, 1, "W"), circ(4, 19, 1, "O"),
  // fauces, dientes y lengua
  ellipse(19, 20, 12, 7, "k"), ellipse(19, 22, 9, 4, "E"), ellipse(19, 24, 5, 2, "e"),
  ...[8, 11, 14, 17].map((x) => poly([x, 14, x + 3, 14, x + 1, 17], "g")),
  ...[10, 13, 16].map((x) => poly([x, 27, x + 3, 27, x + 1, 24], "g")),
  // ojillos y cuernos
  circ(14, 7, 2, "g"), px(14, 7, "e"), px(15, 7, "k"), circ(9, 10, 1, "e"),
  line(11, 4, 8, 0, "G", 2), px(8, 0, "g"),
);

sheet("jefes", ["boss-*_l", "boss-*_d", "boss-*_w"], { pad: 2 });
