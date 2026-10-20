// Jefes del tema "Halloween": los siete colosos como monstruos de una noche de cementerio, con el
// doble de píxeles por casilla que las piezas. Mismas reglas que piezas.px.js: lo que lleva la rampa
// hueso (w W o O b) se recolorea por bando; hueso, piedra, hierro, calabaza y fuego son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/halloween/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1c1424",
  w: "#f3ecda", W: "#dccfb2", o: "#b9a684", O: "#8c7a5c", b: "#5e4f3c",
  g: "#e4e0cf", G: "#a39d88", // hueso
  v: "#a4d36a", V: "#5f9a3e", // hoja, musgo y brebaje
  m: "#a9b1bf", M: "#6b7383", X: "#454b58", // hierro
  n: "#7a5234", N: "#4a2e1d", // madera y paja oscura
  z: "#ecb73f", Z: "#a8741f", // paja y oro
  r: "#d43d4f", R: "#861c33", // sangre, fauces
  h: "#3b2a4a", // pelo negro
  y: "#ffe27a", e: "#ff8f1f", E: "#c4470f", // brasa y calabaza
  c: "#b4afbd", C: "#868094", d: "#5c566a", // piedra de lápida
});
ramps("bOoWw", "GgG", "Vv", "XMm", "Zz", "Rr", "NnN", "Eey", "dCc");

const boss = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Titán: espantapájaros gigante con cabeza de calabaza tallada, sombrero roto, abrigo del bando
// con remiendos, paja en los puños y brazos de rama. Simétrico, con detalles sueltos después.
sprite("_titan0", { w: 34, h: 37, mx: true },
  // piernas de palo con paja en los bajos
  rect(11, 28, 4, 7, "n"), rect(11, 28, 1, 7, "N"), poly([9, 34, 16, 34, 16, 37, 8, 37], "z"), px(10, 36, "Z"), px(13, 36, "Z"),
  // abrigo largo con el bajo en picos
  poly([7, 14, 17, 14, 17, 30, 5, 30], "w"), ...[5, 9, 13].map((x) => poly([x, 30, x + 4, 30, x + 2, 33], "w")),
  vline(16, 15, 15, "W"), vline(9, 20, 10, "W"), hline(10, 24, 7, "N"), px(16, 24, "z"),
  // brazo de rama abierto y puño de paja
  line(7, 15, 2, 22, "w", 3), line(5, 20, 2, 22, "W"), poly([0, 22, 4, 22, 5, 27, 2, 25, 0, 27], "z"), px(2, 24, "Z"),
  // cuello de paja
  rect(12, 12, 5, 3, "z"), px(13, 13, "Z"), px(15, 12, "Z"),
  // cabeza de calabaza
  ellipse(17, 8, 9, 5, "e"), ellipse(17, 8, 4, 5, "e"), ellipse(17, 8, 9, 5, "E", true), ellipse(13, 8, 3, 5, "E", true),
  ellipse(12, 6, 2, 1, "y"),
  // ojo triangular y boca dentada (la mitad)
  poly([11, 9, 13, 5, 15, 9], "k"), px(13, 8, "y"),
  rect(10, 11, 7, 2, "k"), px(11, 11, "e"), px(14, 11, "e"), px(12, 12, "y"), px(15, 12, "y"),
  // sombrero de ala rota
  rect(10, 1, 7, 3, "O"), rect(6, 3, 11, 2, "b"), hline(10, 1, 7, "o"),
);
boss("boss-titan", { base: "_titan0" },
  // remiendos y sombra del abrigo a la derecha
  recolor({ w: "W", W: "o" }, [19, 14, 15, 20]),
  rect(9, 17, 4, 4, "o"), hline(9, 17, 4, "O"), hline(9, 20, 4, "O"), px(9, 18, "k"), px(12, 19, "k"),
  rect(21, 25, 3, 3, "O"), px(22, 26, "k"),
  // corte en el ala del sombrero y tallo
  px(28, 4, "_"), px(27, 4, "_"), rect(16, 0, 2, 2, "n"),
  // un cuervo posado en el hombro
  rect(25, 11, 4, 3, "h"), px(25, 11, "e"), px(24, 12, "z"), px(28, 10, "h"),
);

// Ariete: toro espectral que embiste a la izquierda, con la calavera por cabeza, cuernos largos,
// costillas a la vista, ojos de brasa y llamas en las pezuñas.
boss("boss-ram", { w: 40, h: 30 },
  // cola
  line(37, 11, 39, 18, "b", 1), poly([37, 18, 39, 18, 39, 21, 37, 20], "b"),
  // patas de atrás
  rect(29, 19, 4, 8, "O"), rect(34, 18, 3, 9, "b"), rect(29, 26, 4, 2, "G"), rect(34, 26, 3, 2, "G"),
  // cuerpo
  ellipse(24, 14, 13, 8, "O"), ellipse(22, 12, 11, 5, "o"), ellipse(20, 10, 7, 2, "W"), ellipse(25, 19, 11, 3, "b"),
  // joroba del cuello
  ellipse(13, 11, 6, 6, "o"), ellipse(12, 9, 4, 3, "W"),
  // costillas y espinazo
  ...[19, 23, 27].map((x) => [line(x, 11, x - 1, 17, "g"), px(x - 1, 18, "G")]).flat(),
  hline(16, 9, 18, "G"), ...[18, 22, 26, 30].map((x) => px(x, 8, "g")),
  // patas de delante
  rect(12, 19, 4, 8, "O"), rect(17, 20, 3, 7, "b"), rect(12, 26, 4, 2, "G"), rect(17, 26, 3, 2, "G"),
  // llamas en las pezuñas
  ...[12, 17, 29, 34].map((x) => [px(x, 28, "e"), px(x + 2, 28, "E"), px(x + 1, 29, "y")]).flat(),
  // calavera de toro de frente, gacha para embestir: cráneo ancho, hocico largo y ojos de brasa
  rect(2, 7, 13, 6, "k"), poly([3, 12, 15, 12, 12, 20, 5, 20], "k"),
  rect(3, 8, 11, 4, "g"), poly([4, 12, 13, 12, 11, 19, 6, 19], "g"), rect(11, 8, 3, 4, "G"), poly([10, 12, 13, 12, 11, 19, 9, 19], "G"),
  rect(4, 10, 3, 2, "k"), rect(10, 10, 3, 2, "k"), px(5, 10, "e"), px(11, 10, "e"), px(5, 11, "y"),
  vline(8, 13, 3, "G"), px(7, 17, "k"), px(9, 17, "k"), hline(5, 8, 7, "w"),
  // cuernos largos que salen a los lados y suben
  line(3, 9, 0, 7, "g", 2), line(0, 6, 1, 2, "g", 1), px(2, 1, "G"),
  line(14, 9, 17, 7, "G", 2), line(17, 6, 16, 2, "G", 1), px(15, 1, "G"),
);

// Hidra: planta carnívora de calabazas. Una calabaza enorme por raíz, hojas, y tres tallos con
// fauces de dientes de hueso del bando. Simétrica con columna central.
sprite("_hydra0", { w: 37, h: 34, mx: "c" },
  // hojas y zarcillos al pie
  poly([0, 33, 6, 26, 12, 30, 8, 33], "V"), line(2, 32, 7, 28, "v"), poly([5, 26, 9, 22, 11, 27], "v"),
  // tallos
  line(14, 27, 6, 17, "V", 3), line(14, 26, 7, 18, "v", 1), rect(17, 10, 3, 16, "V"), vline(18, 10, 16, "v"),
  ...[[10, 21], [17, 14]].map(([x, y]) => poly([x, y, x - 4, y - 2, x - 2, y + 1], "v")),
  // calabaza raíz, del bando, con la cara tallada
  ellipse(18, 28, 11, 5, "o"), ellipse(18, 28, 7, 5, "W"), ellipse(18, 28, 3, 5, "w"), ellipse(18, 28, 7, 5, "O", true), ellipse(13, 26, 2, 1, "w"),
  rect(15, 29, 7, 2, "k"), px(16, 30, "y"), px(18, 29, "e"), poly([12, 28, 14, 25, 16, 28], "k"), px(14, 27, "e"),
  // cabeza lateral: fauces abiertas de lado
  ellipse(5, 13, 5, 4, "w"), ellipse(4, 13, 5, 2, "R"), hline(0, 13, 7, "r"), ellipse(6, 10, 3, 1, "W"),
  ...[0, 2, 4, 6].map((x) => px(x, 11, "g")), ...[1, 3, 5].map((x) => px(x, 15, "g")),
  ellipse(5, 16, 4, 1, "O"), px(8, 9, "y"),
  // cabeza central, mayor, con las fauces abiertas hacia arriba
  ellipse(18, 6, 6, 5, "w"), ellipse(18, 5, 5, 3, "R"), hline(14, 5, 5, "r"), ellipse(18, 10, 5, 1, "W"),
  ...[13, 15, 17].map((x) => px(x, 3, "g")), ...[14, 16].map((x) => px(x, 7, "g")), px(18, 2, "g"),
  rect(13, 0, 2, 1, "W"), px(12, 1, "w"),
);
boss("boss-hydra", { base: "_hydra0" },
  recolor({ w: "W" }, [26, 2, 12, 20]), recolor({ W: "o" }, [26, 9, 12, 12]),
);

// Gólem: monstruo de piedra cosido, a lo Frankenstein (3×3). Cabeza plana con flequillo negro,
// tornillos en el cuello, costura en la frente, ojos de brasa, chaqueta del bando y puños de roca.
sprite("_golem0", { w: 42, h: 36, mx: true },
  // piernas y botas
  rect(13, 27, 6, 6, "O"), rect(13, 27, 1, 6, "b"), rect(11, 32, 9, 4, "h"), rect(12, 32, 5, 1, "X"),
  // chaqueta: cuerpo y solapas
  poly([7, 12, 21, 12, 21, 28, 9, 28], "w"), vline(20, 13, 15, "W"), poly([14, 12, 21, 12, 21, 20], "W"),
  rect(9, 26, 12, 2, "W"), ...[16, 20, 24].map((y) => px(19, y, "X")),
  // brazos: manga corta y antebrazo de piedra
  rect(2, 14, 6, 8, "w"), rect(2, 14, 1, 8, "W"), hline(2, 21, 6, "o"),
  rect(3, 22, 4, 4, "C"), circ(5, 29, 4, "d"), circ(5, 28, 3, "C"), px(4, 26, "c"), px(6, 26, "c"),
  hline(3, 23, 4, "k"), ...[3, 5].map((x) => px(x, 22, "k")),
  // hombrera
  circ(8, 13, 5, "w"), circ(7, 12, 3, "W"), circ(7, 12, 2, "w"),
  // cuello y tornillos
  rect(17, 10, 4, 3, "C"), rect(12, 10, 5, 2, "M"), rect(12, 10, 2, 2, "m"),
  // cabeza: piedra plana con flequillo y costura
  rect(13, 2, 8, 9, "c"), rect(13, 8, 8, 3, "C"), rect(13, 0, 8, 3, "h"), rect(13, 3, 3, 1, "h"),
  px(16, 4, "k"), hline(15, 5, 3, "k"), px(16, 6, "k"),
  rect(16, 7, 3, 2, "k"), px(17, 7, "y"), px(18, 7, "e"), hline(17, 10, 4, "d"),
);
boss("boss-golem", { base: "_golem0" },
  recolor({ w: "W", W: "o" }, [27, 12, 15, 17]), recolor({ c: "C", C: "d" }, [26, 0, 16, 36]),
  // grieta en el pecho
  line(15, 18, 17, 21, "o"), line(17, 21, 16, 24, "o"),
);

// Jinete: segador alto y estrecho, con la capucha del bando, calavera en la sombra, mano de hueso
// y guadaña de hoja ancha. Flota sobre el bajo hecho jirones.
boss("boss-rider", { w: 28, h: 40 },
  // mango de la guadaña
  line(21, 3, 22, 39, "n", 1), line(22, 3, 23, 39, "N", 1),
  // túnica: cuerpo y bajo en jirones
  poly([6, 10, 18, 10, 22, 35, 2, 35], "w"), poly([15, 11, 18, 10, 22, 35, 17, 35], "W"),
  ...[2, 7, 12, 17].map((x) => poly([x, 35, x + 5, 35, x + 3, 39, x + 2, 37, x, 38], "w")),
  vline(8, 18, 17, "W"), vline(12, 20, 15, "W"), ...[17, 21].map((x) => vline(x, 36, 2, "o")),
  rect(6, 23, 13, 1, "b"), px(11, 23, "G"),
  // brazo con la mano en el mango
  poly([14, 14, 19, 16, 21, 21, 17, 22], "W"), rect(20, 18, 3, 3, "g"), px(20, 21, "g"),
  // capucha alta en punta, con la calavera en la sombra
  poly([5, 13, 7, 6, 12, 3, 17, 6, 19, 13], "w"), poly([14, 4, 17, 6, 19, 13, 16, 13], "W"),
  ellipse(12, 9, 4, 4, "k"), rect(10, 8, 5, 4, "g"), px(11, 9, "k"), px(13, 9, "k"), px(11, 9, "e"),
  hline(10, 12, 5, "G"), px(11, 12, "k"), px(13, 12, "k"),
  // hoja de la guadaña
  poly([22, 0, 14, 0, 6, 1, 1, 5, 8, 3, 15, 2, 22, 3], "m"), line(6, 2, 21, 1, "M"), px(2, 4, "g"),
);

// Muralla: verja de cementerio (1×2) entre dos pilares de piedra del bando, con calaveras en lo
// alto, lanzas de hierro, una cancela con candado y ojos que miran entre los barrotes.
sprite("_wall0", { w: 44, h: 26, mx: true },
  // barrotes con punta de lanza
  ...[12, 15, 18, 21].map((x) => [vline(x, 4, 21, "X"), px(x, 3, "M"), px(x - 1, 4, "M"), px(x + 1, 4, "M"), px(x, 2, "m")]).flat(),
  hline(10, 7, 12, "M"), hline(10, 19, 12, "M"), hline(10, 8, 12, "X"),
  // remolinos de forja entre los barrotes
  ...[13, 16, 19].map((x) => [px(x, 12, "M"), px(x + 1, 13, "M"), px(x, 14, "M")]).flat(),
  // pilar de piedra del bando con remate de calavera
  rect(1, 9, 9, 15, "w"), rect(0, 7, 11, 2, "W"), rect(0, 23, 11, 3, "O"), hline(0, 23, 11, "o"),
  ...[13, 17, 21].map((y) => hline(1, y, 9, "W")), vline(5, 9, 4, "W"), vline(3, 14, 3, "W"), vline(7, 18, 3, "W"),
  rect(8, 9, 2, 14, "W"),
  circ(5, 3, 3, "g"), rect(3, 5, 5, 2, "g"), px(4, 3, "k"), px(6, 3, "k"), px(4, 4, "e"), px(5, 5, "G"), hline(4, 6, 3, "G"),
  // cancela con candado en el centro
  rect(20, 15, 2, 4, "z"), px(21, 16, "k"), px(20, 14, "Z"),
  // hiedra en el pilar
  line(1, 12, 4, 20, "V"), px(2, 14, "v"), px(4, 17, "v"), px(3, 19, "v"),
);
boss("boss-wall", { base: "_wall0" },
  recolor({ w: "W", W: "o" }, [39, 7, 5, 17]), recolor({ g: "G" }, [39, 0, 5, 7]),
  // ojos que miran entre los barrotes
  px(16, 10, "e"), px(17, 10, "y"), px(26, 10, "y"), px(27, 10, "e"),
  // hierba al pie
  ...[11, 14, 23, 30].map((x) => [px(x, 25, "V"), px(x + 1, 24, "v")]).flat(),
);

// Devorador: calabaza gigante del bando que es toda boca. Fauces dentadas con la brasa dentro,
// ojos pequeños y furiosos, tallo retorcido y raíces por patas.
sprite("_devourer0", { w: 38, h: 32, mx: true },
  // raíces
  line(10, 26, 6, 31, "n", 2), line(15, 28, 13, 31, "N", 2),
  // calabaza con gajos
  ellipse(19, 17, 18, 13, "W"), ellipse(19, 17, 12, 13, "w"), ellipse(19, 17, 5, 13, "w"),
  ellipse(19, 17, 12, 13, "o", true), ellipse(19, 17, 5, 13, "o", true), ellipse(19, 17, 18, 13, "O", true),
  ellipse(10, 9, 3, 2, "w"),
  // fauces enormes, en zigzag
  ellipse(19, 20, 14, 7, "k"), ellipse(19, 23, 10, 3, "E"), ellipse(19, 24, 6, 2, "e"), px(18, 24, "y"),
  ...[6, 10, 14].map((x) => poly([x, 14, x + 4, 14, x + 2, 18], "w")), poly([17, 13, 19, 13, 19, 18], "w"),
  ...[8, 12, 16].map((x) => poly([x, 27, x + 4, 27, x + 2, 23], "W")),
  // ojos pequeños y ceño
  poly([10, 6, 16, 9, 10, 9], "k"), px(12, 8, "e"), px(13, 8, "y"),
);
boss("boss-devourer", { base: "_devourer0" },
  recolor({ w: "W", W: "o" }, [29, 4, 9, 22]),
  // tallo retorcido
  rect(18, 2, 3, 4, "n"), px(19, 2, "N"), line(20, 2, 24, 0, "n"), px(25, 1, "V"), px(26, 2, "v"),
  // migas que se traga: una pieza de hueso y un rastro hacia la boca
  px(4, 30, "g"), px(2, 31, "G"), px(33, 31, "g"),
);

sheet("jefes", ["boss-titan", "boss-ram", "boss-hydra", "boss-golem", "boss-rider", "boss-wall", "boss-devourer"], { pad: 2 });
