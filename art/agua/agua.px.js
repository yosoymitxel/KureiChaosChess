// Jardín de Agua en arte píxel, para las mesas píxel (las otras usan las SVG de assets/agua). Paleta y
// reglas del Jardín Zen (zen.px.js): luz arriba a la izquierda, contorno de tinta `k` de 1 px, sin ruido.
// Lienzos de 24×24; los barcos miran a la derecha (+x), como sus SVG.
// Reconstruir:  node <pxl>/bin/pxl.js build art/agua/agua.px.js  y copiar out/sprites/*.png a assets/agua/px/.

pal({
  k: "#241812",
  G: "#2e5f33", g: "#5a9147", h: "#85ad5a", H: "#b9d37f",          // hoja
  o: "#fdd3d6", O: "#e48c9b", r: "#c25a7a",                        // loto y capullo
  y: "#f6eedc", N: "#f6bd5f",                                      // pétalo blanco, núcleo
  u: "#fbf8ef", t: "#e5ddcd", T: "#cdbfa6", J: "#a6957e",          // papel
  C: "#6b4529", K: "#946640", P: "#b88a5a",                        // madera
  d: "#8f6a2c", D: "#c99a4d", E: "#e8c477",                        // bambú
  R: "#c23a30", e: "#e8574a", X: "#8fcdc4", 5: "#4d4944",          // lancha, cristal, motor
  q: "#5a3b2b", Q: "#7a5440",                                      // espiga del junco
});
ramps("kGghH", "rOo", "JTtu", "kCKP", "ddDE", "Re");

// Barcos (mirando a +x).
sprite("boat-papel", { w: 24, h: 24, outline: "k" },
  poly([1, 12, 5, 8, 18, 8, 23, 12, 18, 16, 5, 16], "t"),
  poly([3, 12, 6, 10, 17, 10, 21, 12, 17, 14, 6, 14], "T"),
  poly([6, 12, 13, 8, 19, 12], "u"),
  poly([6, 12, 13, 16, 19, 12], "J"),
  hline(6, 12, 14, "k"));
sprite("boat-balsa", { w: 24, h: 24, outline: "k" },
  rect(3, 7, 18, 10, "D"), hline(3, 9, 18, "d"), hline(3, 12, 18, "d"), hline(3, 15, 18, "d"),
  hline(3, 7, 18, "E"), hline(3, 10, 18, "E"), hline(3, 13, 18, "E"),
  vline(6, 6, 12, "C"), vline(17, 6, 12, "C"),
  poly([9, 9, 15, 12, 9, 15], "u"), px(15, 12, "C"));
sprite("boat-velero", { w: 24, h: 24, outline: "k" },
  poly([1, 9, 16, 8, 23, 12, 16, 16, 1, 15], "K"),
  poly([3, 10, 15, 10, 20, 12, 15, 14, 3, 14], "P"),
  hline(4, 12, 14, "K"),
  poly([14, 12, 3, 3, 6, 12], "u"), line(14, 12, 4, 4, "C"), px(14, 12, "C"));
sprite("boat-lancha", { w: 24, h: 24, outline: "k" },
  poly([2, 8, 16, 8, 23, 12, 16, 16, 2, 16], "R"),
  hline(3, 9, 14, "e"),
  rect(7, 10, 7, 4, "u"), vline(14, 10, 4, "X"), rect(9, 11, 3, 2, "K"),
  rect(0, 10, 2, 4, "5"));

// Nenúfar: hoja con su muesca; capullo rosa o flor blanca.
sprite("_pad", { w: 24, h: 24 },
  circ(12, 12, 9, "g"), circ(10, 9, 5, "h"), circ(12, 12, 9, "g", { ring: true }),
  poly([12, 12, 22, 8, 22, 13], "_"),
  line(12, 12, 4, 10, "G"), line(12, 12, 8, 19, "G"), line(12, 12, 16, 20, "G"), line(12, 12, 12, 3, "G"));
sprite("nenufar-bud", { w: 24, h: 24, outline: "k" }, stamp("_pad", 0, 0), ellipse(11, 11, 2, 3, "o"), vline(12, 9, 5, "O"));
sprite("nenufar-bloom", { w: 24, h: 24, outline: "k" }, stamp("_pad", 0, 0),
  poly([11, 5, 13, 10, 18, 11, 13, 13, 11, 18, 9, 13, 4, 11, 9, 10], "y"), poly([11, 8, 12, 11, 15, 11, 12, 12, 11, 15, 10, 12, 7, 11, 10, 11], "t"), rect(10, 10, 3, 2, "N"));

// Loto: dos hojas redondas; capullo alto o flor rosa de tres anillos.
sprite("_lpads", { w: 24, h: 24 }, circ(14, 14, 8, "g"), circ(12, 12, 4, "h"), circ(5, 5, 4, "G"), circ(4, 4, 2, "g"));
sprite("loto-bud", { w: 24, h: 24, outline: "k" }, stamp("_lpads", 0, 0), ellipse(13, 12, 3, 5, "O"), vline(13, 8, 9, "r"), px(12, 8, "o"), px(12, 9, "o"));
sprite("loto-bloom", { w: 24, h: 24, outline: "k" }, circ(19, 19, 3, "G"), circ(4, 5, 3, "g"),
  poly([12, 2, 15, 9, 22, 12, 15, 15, 12, 22, 9, 15, 2, 12, 9, 9], "r"),
  poly([12, 5, 14, 10, 19, 12, 14, 14, 12, 19, 10, 14, 5, 12, 10, 10], "O"),
  circ(12, 12, 3, "o"), circ(12, 12, 1, "N"));

// Junco: hojas largas desde una mata; en flor, espigas pardas.
sprite("_blades", { w: 24, h: 24 },
  line(12, 13, 3, 4, "G"), line(12, 13, 20, 3, "g"), line(12, 13, 22, 18, "G"), line(12, 13, 5, 21, "g"), line(12, 13, 13, 1, "h"), line(12, 13, 1, 14, "g"), circ(12, 13, 1, "G"));
sprite("junco-bud", { w: 24, h: 24, outline: "k" }, stamp("_blades", 0, 0));
sprite("junco-bloom", { w: 24, h: 24, outline: "k" }, stamp("_blades", 0, 0),
  ellipse(6, 6, 1, 2, "q"), px(6, 5, "Q"), ellipse(18, 5, 1, 2, "q"), px(18, 4, "Q"), ellipse(17, 17, 2, 1, "q"), px(17, 17, "Q"));

// Lenteja de agua: muchas hojitas redondas; en flor, puntitos blancos.
sprite("_duck", { w: 24, h: 24 }, (c) => {
  for (let i = 0; i < 17; i++) { const a = i * 2.4, d = 2.2 * Math.sqrt(i + 0.6); c.circ(Math.round(12 + Math.cos(a) * d), Math.round(12 + Math.sin(a) * d * 0.9), 1, i % 3 ? "h" : "g"); }
});
sprite("lenteja-bud", { w: 24, h: 24, outline: "k" }, stamp("_duck", 0, 0));
sprite("lenteja-bloom", { w: 24, h: 24, outline: "k" }, stamp("_duck", 0, 0), px(10, 9, "y"), px(15, 13, "y"), px(9, 15, "y"), px(11, 9, "N"));

sheet("agua", ["boat-*", "nenufar-*", "loto-*", "junco-*", "lenteja-*"], { pad: 2 });
