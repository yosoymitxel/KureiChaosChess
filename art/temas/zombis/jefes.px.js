// Jefes del tema "Zombis": los siete colosos como zombis enormes de una ciudad en ruinas, con el
// doble de píxeles por casilla que las piezas. Mismas reglas que piezas.px.js: la ropa (y la pintura
// del coche y la raya del autobús) usa la rampa del bando (w W o O b) y se recolorea; la piel verde,
// el metal, la madera, el amarillo del autobús, las vendas y los ojos son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/zombis/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1d1f1a",
  w: "#efe6cc", W: "#d6c69e", o: "#b3a074", O: "#857550", b: "#5a4e35",
  z: "#b4cf8e", Z: "#88a765", x: "#5e7c48",
  i: "#f6f3e4",
  r: "#c8384a", R: "#6e1f2e",
  h: "#3b3330",
  g: "#e6e0c8", G: "#aaa38a",
  m: "#c9ced3", M: "#8d949c", X: "#5c626b", T: "#3a3d42", // metal y goma
  n: "#9a6a3e", N: "#5e3c22",
  y: "#f2cf4a", Y: "#b48a26",
  c: "#f08a2e", C: "#b0561c",
  p: "#f2a7b8", P: "#c96d86",
  v: "#9be04e", V: "#5aa02c",
  f: "#bfe6f2", F: "#7fb4c9",
});
ramps("bOoWw", "xZz", "TXMm", "Yy", "Cc", "Pp", "Vv", "Ff", "Gg", "Nn", "Rr");

const boss = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Cabeza de zombi mirando a la izquierda (la misma que las piezas): ojo saltón, ojo hundido,
// boca torcida con un diente y la sombra a la derecha.
const head = (x, y, w = 9, h = 8) => [
  rect(x + 1, y, w - 2, h, "z"), rect(x, y + 1, w, h - 2, "z"),
  vline(x + w - 1, y + 2, h - 3, "Z"), hline(x + 2, y + h - 1, w - 3, "Z"), px(x + w - 2, y + h - 2, "Z"),
  px(x + w, y + 3, "Z"), px(x + w, y + 4, "x"),
  rect(x + 1, y + 2, 3, 3, "x"), rect(x + 1, y + 2, 2, 2, "i"), px(x + 1, y + 3, "k"),
  px(x + 5, y + 3, "x"), px(x + 5, y + 2, "i"), px(x + 5, y + 3, "k"),
  hline(x + 1, y + h - 2, 4, "R"), px(x + 2, y + h - 2, "i"), px(x + 4, y + h - 3, "R"),
];

// Titán: zombi gigantesco y encorvado, cabecita entre hombros enormes, camiseta de tirantes del
// bando, pantalón roto, descalzo, una farola arrancada por garrote y un zombi pequeño a la espalda.
boss("boss-titan", { w: 36, h: 38 },
  // brazo de atrás colgando
  rect(28, 16, 5, 11, "Z"), rect(32, 17, 1, 9, "x"), rect(27, 26, 6, 4, "Z"), hline(27, 29, 6, "x"),
  // zombi pequeño a la espalda, saludando
  ...head(26, 2, 7, 6), px(28, 1, "h"), px(30, 1, "h"), rect(33, 3, 2, 4, "w"), rect(34, 0, 2, 3, "z"),
  // piernas con el pantalón roto y los pies descalzos
  rect(11, 29, 6, 5, "O"), rect(21, 29, 6, 5, "O"), rect(16, 29, 6, 2, "O"), hline(11, 33, 6, "b"), hline(21, 33, 6, "b"),
  px(12, 33, "."), px(15, 33, "."), px(23, 33, "."), px(26, 33, "."),
  rect(11, 34, 6, 2, "Z"), rect(21, 34, 6, 2, "x"), rect(9, 36, 8, 2, "z"), rect(20, 36, 8, 2, "Z"), px(9, 37, "Z"), px(20, 37, "x"),
  // hombros enormes
  circ(9, 15, 5, "z"), circ(10, 16, 4, "z"), circ(27, 14, 5, "Z"), circ(26, 13, 4, "z"), px(29, 17, "x"),
  // torso y camiseta de tirantes, con el escote y los rotos
  poly([11, 12, 27, 12, 30, 29, 8, 29], "w"), poly([24, 12, 27, 12, 30, 29, 25, 29], "W"), hline(8, 28, 23, "o"),
  ellipse(18, 12, 4, 2, "z"), hline(15, 14, 7, "Z"), vline(11, 12, 4, "Z"), vline(26, 12, 4, "x"),
  px(14, 28, "."), px(20, 28, "."), px(26, 28, "."), px(17, 22, "z"), px(18, 23, "Z"), px(16, 23, "z"),
  line(12, 18, 14, 26, "W"), px(23, 20, "o"),
  // cabecita adelantada
  ...head(13, 4, 10, 9), rect(15, 3, 6, 1, "h"),
  // brazo de delante con el puño sobre la farola
  rect(5, 18, 6, 6, "z"), rect(5, 23, 5, 3, "Z"), rect(2, 24, 7, 5, "z"), hline(2, 28, 7, "Z"), px(3, 25, "Z"), px(3, 27, "Z"),
  // farola: poste, brazo curvo y el farol encendido
  rect(4, 6, 2, 30, "M"), vline(4, 6, 30, "m"), rect(3, 35, 4, 3, "X"),
  line(4, 6, 2, 2, "M"), hline(0, 1, 5, "X"), rect(0, 2, 5, 1, "X"), hline(1, 3, 3, "y"),
  // la venda de la rodilla
  hline(11, 31, 6, "g"), hline(11, 32, 6, "G"),
);

// Ariete: un carrito del súper lanzado a toda velocidad, con un zombi dentro que lleva un cono
// de tráfico por cuerno y otro zombi que empuja desde atrás.
boss("boss-ram", { w: 40, h: 30 },
  // zombi que empuja: piernas en carrera, cuerpo inclinado y brazos al asa
  line(34, 22, 31, 28, "O", 3), line(35, 22, 38, 28, "O", 3), rect(29, 28, 4, 2, "N"), rect(36, 28, 4, 2, "N"),
  poly([30, 12, 37, 13, 37, 23, 31, 23], "w"), poly([35, 13, 37, 13, 37, 23, 35, 23], "W"),
  ...head(31, 4, 8, 8), px(34, 3, "h"), px(36, 3, "h"),
  rect(26, 13, 5, 2, "w"), rect(25, 12, 2, 3, "z"),
  // zombi dentro del carro, embistiendo con el cono por delante
  poly([10, 10, 20, 10, 20, 18, 10, 18], "w"), poly([17, 10, 20, 10, 20, 18, 17, 18], "W"),
  ...head(8, 4, 9, 7), rect(4, 8, 6, 2, "z"), px(3, 9, "Z"),
  poly([4, 2, 9, 4, 9, 7, 7, 7], "c"), poly([5, 3, 7, 3, 8, 6, 7, 5], "C"), hline(6, 5, 3, "i"), rect(7, 7, 4, 1, "C"),
  // cesta de alambre: fondo en sombra, rejilla y el canto de arriba
  poly([3, 11, 27, 11, 25, 22, 7, 22], "X"),
  ...[6, 10, 14, 18, 22].map((x) => line(x, 12, x + 1, 21, "M")), ...[14, 17, 20].map((y) => hline(4, y, 23, "M")),
  hline(2, 11, 26, "m"), hline(6, 22, 20, "m"),
  // asa
  line(27, 11, 29, 9, "m"), hline(28, 9, 3, "r"),
  // chasis y ruedas
  line(7, 23, 26, 23, "M"), line(9, 23, 8, 26, "M"), line(24, 23, 25, 26, "M"),
  circ(8, 27, 2, "T"), px(8, 27, "M"), circ(25, 27, 2, "T"), px(25, 27, "M"),
  // líneas de velocidad detrás
  hline(32, 26, 3, "G"), hline(0, 25, 3, "G"),
);

// Hidra: un montón de zombis abrazados unos a otros, con cinco cabezas asomando y los brazos
// tendidos hacia todos lados.
boss("boss-hydra", { w: 38, h: 34 },
  // brazos que salen del montón
  line(3, 22, 0, 17, "z", 2), px(0, 16, "z"), line(34, 22, 37, 16, "Z", 2), px(37, 15, "Z"),
  // zombi de la izquierda, inclinado hacia fuera
  poly([2, 16, 10, 14, 14, 27, 5, 28], "W"), poly([3, 17, 9, 15, 11, 22, 4, 23], "w"),
  ...head(1, 7, 9, 8), px(3, 6, "h"), px(5, 6, "h"),
  // zombi de la derecha
  poly([26, 14, 35, 16, 34, 28, 24, 27], "W"), poly([27, 15, 33, 16, 32, 21, 26, 21], "o"),
  ...head(27, 6, 9, 8), rect(28, 5, 6, 1, "h"),
  // zombi del centro, el más alto
  rect(14, 11, 10, 17, "w"), rect(21, 11, 3, 17, "W"), vline(19, 12, 8, "r"), px(19, 11, "R"),
  ...head(14, 1, 10, 9), px(16, 0, "h"), px(19, 0, "h"), px(21, 0, "h"),
  // base del montón: cuerpos tumbados, zapatos y una pierna en alto
  ellipse(19, 29, 18, 5, "O"), ellipse(18, 28, 16, 4, "W"), ellipse(17, 27, 12, 3, "w"),
  rect(2, 31, 4, 2, "N"), rect(32, 31, 4, 2, "N"), line(28, 28, 31, 24, "O", 2), rect(31, 22, 3, 2, "N"),
  // dos cabezas pequeñas metidas en el montón
  ...head(5, 23, 7, 6), ...head(23, 22, 7, 6),
  // brazos que abrazan
  line(9, 17, 16, 19, "z", 2), line(29, 17, 22, 20, "Z", 2), line(12, 25, 18, 23, "z", 2),
  // vendas
  hline(14, 21, 4, "g"), px(15, 22, "G"),
);

// Gólem: zombi hecho de chatarra (3×3). El pecho es el morro de un coche pintado del bando con
// su rejilla y sus faros, los hombros son neumáticos, los brazos tubos de escape, las piernas
// bidones y la cabeza lleva un tapacubos por casco.
sprite("_golem0", { w: 42, h: 38, mx: true },
  // piernas de bidón
  rect(12, 28, 7, 8, "w"), rect(12, 28, 2, 8, "W"), hline(12, 30, 7, "O"), hline(12, 33, 7, "O"), rect(11, 36, 9, 2, "X"),
  // morro del coche: capó, rejilla, faros y parachoques
  rect(7, 14, 14, 14, "w"), rect(7, 14, 14, 2, "W"), rect(7, 26, 14, 2, "O"),
  rect(13, 20, 8, 5, "T"), ...[21, 23].map((y) => hline(13, y, 8, "X")),
  circ(10, 21, 2, "y"), px(9, 20, "i"),
  rect(7, 25, 14, 2, "m"), hline(7, 26, 14, "M"),
  // brazos de tubo de escape y puños de chatarra
  rect(1, 16, 4, 12, "M"), vline(1, 16, 12, "m"), hline(1, 21, 4, "X"),
  rect(0, 28, 6, 5, "X"), rect(1, 28, 3, 2, "M"), px(2, 31, "M"),
  // hombros de neumático con la llanta
  circ(5, 13, 5, "T"), ring(5, 13, 3, "X"), circ(5, 13, 2, "M"), px(4, 12, "m"),
  // cuello de muelle
  rect(18, 10, 3, 4, "X"), hline(18, 11, 3, "M"), hline(18, 13, 3, "M"),
);
boss("boss-golem", { base: "_golem0" },
  // la mitad derecha en sombra
  recolor({ w: "W", W: "o", m: "M", y: "Y" }, [22, 14, 20, 24]),
  // abolladuras, óxido y una puerta que no es de su color
  px(26, 16, "o"), px(27, 17, "o"), px(12, 16, "o"), rect(9, 15, 3, 2, "c"), px(10, 16, "C"),
  // cabeza con el tapacubos por casco
  ...head(16, 2, 11, 9), ellipse(21, 2, 7, 2, "M"), hline(15, 2, 13, "m"), px(21, 0, "m"), hline(15, 4, 13, "X"),
  // un cono de tráfico clavado en el hombro y una mancha de baba
  poly([34, 9, 36, 2, 38, 9], "c"), hline(34, 6, 4, "i"), hline(33, 9, 6, "C"), px(31, 20, "v"), px(31, 21, "V"),
);

// Jinete: zombi con gorra de jockey del bando montado en un avestruz zombi de patas larguísimas.
// Alto y estrecho (2×1 en vertical).
boss("boss-rider", { w: 26, h: 40 },
  // patas del avestruz con sus rodillas y los dedazos
  line(13, 25, 11, 32, "Z", 2), line(11, 32, 13, 38, "Z", 2), rect(9, 38, 6, 2, "x"),
  line(17, 25, 18, 32, "z", 2), line(18, 32, 16, 38, "z", 2), rect(13, 38, 6, 2, "Z"), px(18, 32, "x"),
  // cuerpo de plumas pelado y cola
  ellipse(16, 22, 8, 5, "G"), ellipse(15, 21, 7, 4, "g"), poly([22, 18, 26, 14, 25, 21, 22, 24], "G"), px(24, 17, "g"),
  px(19, 22, "z"), px(20, 23, "Z"), px(12, 24, "G"),
  // cuello largo y cabeza con el pico abierto
  line(9, 20, 5, 6, "z", 2), vline(7, 9, 9, "Z"), px(5, 13, "x"),
  ellipse(5, 4, 3, 3, "z"), poly([-1, 4, 3, 3, 3, 5], "y"), poly([-1, 7, 3, 6, 3, 7], "Y"), px(4, 3, "i"), px(4, 4, "k"),
  px(5, 0, "G"), px(7, 1, "G"),
  // jinete: pierna, cuerpo y brazo levantado
  rect(14, 18, 3, 6, "W"), rect(13, 24, 4, 2, "N"),
  rect(13, 11, 7, 8, "w"), rect(18, 11, 2, 8, "W"), hline(13, 14, 7, "o"),
  rect(20, 6, 2, 6, "w"), rect(20, 3, 2, 3, "z"), px(22, 4, "z"),
  rect(10, 12, 4, 2, "w"), rect(8, 12, 2, 2, "z"),
  // cabeza con gorra de jockey y visera
  ...head(13, 3, 7, 8), rect(13, 2, 7, 3, "w"), rect(18, 2, 2, 3, "W"), rect(11, 4, 4, 1, "O"), px(16, 1, "w"), px(15, 3, "o"),
);

// Muralla: un autobús escolar atravesado como barricada (1×2), con tablones clavados en las
// ventanillas, la raya del bando, zombis asomando y las ruedas pinchadas.
boss("boss-wall", { w: 44, h: 26 },
  // carrocería amarilla con el morro a la izquierda
  rect(4, 3, 40, 18, "y"), rect(0, 10, 5, 11, "y"), hline(4, 3, 40, "Y"), vline(43, 3, 18, "Y"), rect(0, 19, 44, 2, "Y"),
  // faro, parachoques y señal de stop plegada
  rect(0, 12, 2, 2, "i"), rect(0, 17, 5, 2, "M"), hline(0, 18, 5, "X"), rect(6, 11, 3, 3, "r"), px(7, 12, "i"),
  // raya del bando a lo largo
  rect(4, 15, 40, 3, "w"), hline(4, 17, 40, "W"),
  // ventanillas: cristal oscuro, una con tablones y otras con zombis
  ...[10, 17, 24, 31, 38].map((x) => rect(x, 5, 5, 7, "T")),
  rect(9, 6, 7, 2, "n"), rect(9, 9, 7, 2, "n"), px(10, 6, "M"), px(14, 9, "M"), hline(9, 7, 7, "N"), hline(9, 10, 7, "N"),
  ...head(17, 6, 5, 6), rect(23, 8, 7, 2, "w"), rect(22, 8, 2, 2, "z"), hline(24, 9, 6, "W"),
  ...head(31, 5, 5, 6), rect(39, 6, 3, 2, "n"), rect(37, 9, 6, 2, "n"), hline(37, 10, 6, "N"),
  // pintada y cono de tráfico al pie
  rect(25, 12, 1, 2, "r"),
  // ruedas pinchadas
  ellipse(10, 22, 4, 3, "T"), rect(8, 21, 4, 2, "X"), ellipse(36, 22, 4, 3, "T"), rect(34, 21, 4, 2, "X"),
  poly([20, 25, 22, 19, 24, 25], "c"), hline(21, 22, 3, "i"), rect(19, 24, 7, 2, "C"),
);

// Devorador: zombi tragón que sale de una alcantarilla, todo boca. Babero del bando, dientes
// torcidos, lengua fuera, ojillos arriba y la chatarra que se le va metiendo en la boca.
boss("boss-devourer", { w: 38, h: 33 },
  // alcantarilla abierta y la tapa tirada
  ellipse(19, 30, 18, 3, "X"), ellipse(19, 29, 16, 2, "T"), hline(4, 32, 31, "M"),
  // cuerpo y cabezota
  ellipse(19, 16, 15, 14, "z"), ellipse(23, 19, 11, 11, "Z"), ellipse(17, 14, 12, 11, "z"),
  // babero del bando atado al cuello
  poly([8, 23, 30, 23, 27, 30, 11, 30], "w"), poly([25, 23, 30, 23, 27, 30, 24, 30], "W"), hline(8, 23, 22, "o"),
  px(13, 26, "v"), px(14, 27, "v"), px(20, 28, "o"),
  // boca enorme: dientes torcidos, garganta, lengua
  ellipse(18, 15, 11, 7, "R"), ellipse(18, 17, 8, 4, "k"),
  ...[9, 13, 17, 21, 25].map((x, i) => poly([x, 8 + (i % 2), x + 3, 8 + (i % 2), x + 1, 11 + (i % 2)], "i")),
  ...[12, 16, 20, 24].map((x) => poly([x, 22, x + 3, 22, x + 1, 19], "i")),
  ellipse(19, 21, 5, 2, "r"), hline(17, 21, 3, "R"),
  // ojillos arriba y pelos
  rect(12, 4, 4, 3, "x"), rect(12, 4, 3, 3, "i"), px(12, 5, "k"), px(13, 5, "k"), rect(20, 5, 2, 2, "i"), px(20, 6, "k"), px(19, 5, "x"),
  px(16, 2, "h"), px(19, 2, "h"), px(17, 1, "h"),
  // chatarra que vuela hacia la boca: una lata y un zapato
  rect(1, 9, 3, 4, "M"), hline(1, 9, 3, "m"), px(2, 11, "r"), rect(32, 6, 4, 2, "N"), px(32, 5, "N"),
  // vendas en la cabeza
  line(25, 3, 31, 9, "g", 2), px(30, 9, "G"),
);
