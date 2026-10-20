// Jefes del tema "Marcianitos": los siete colosos como la invasión de un tebeo de los años 50.
// Marciano gigante con armadura, platillo que embiste, blob de cinco cabezas, robot de hojalata
// de juguete, trípode de la guerra de los mundos, nave nodriza y gelatina tragona. Mismas reglas
// que las piezas: la piel marciana y la chapa pintada usan la rampa del bando (w W o O b) y se
// recolorean; cristal, cromo, latón, ojos y bombillas son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/marcianitos/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1a1030",
  w: "#e8ffa8", W: "#b4ec4c", o: "#80c830", O: "#4c9428", b: "#2a5c1e",
  g: "#ffffff",
  c: "#c4f2ff", C: "#6cc4e4", d: "#3a86b0",
  m: "#eef0f6", M: "#a8b0c4", X: "#646c88",
  r: "#ff5468", R: "#b0203c",
  y: "#ffe35a", Y: "#d8961e",
});
ramps("bOoWw", "XMm", "dCc", "Rr", "Yy");

const boss = (name, { post = [], ...opts }, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" }, ...post);
};
const ball = (x, y) => [circ(x, y, 1, "r"), px(x, y, "r"), px(x - 1, y, "R"), px(x, y + 1, "R"), px(x, y - 1, "g")];
// Ojo redondo: blanco, pupila mirando a la izquierda y brillo.
const eye = (x, y, r = 2) => [circ(x, y, r, "g"), rect(x - r + 1, y - 1, 2, 2, "k"), px(x - r + 1, y - 1, "g")];

// Titán: marciano gigante con armadura de cromo, gran pecera con dos antenas que la atraviesan,
// peto del bando con un planeta de latón, hombreras remachadas y garras marcianas.
boss("boss-titan", { w: 34, h: 37, mx: true,
  post: [clip([17, 2, 8, 15], ring(16, 9, 7, "C")), clip([17, 2, 8, 15], ring(16, 9, 6, "C")), px(11, 5, "g"), px(12, 4, "g"), px(10, 7, "g"),
    rect(19, 9, 2, 2, "g"), px(19, 10, "k"), rect(13, 9, 2, 2, "g"), px(13, 10, "k"),
    rect(20, 18, 4, 10, "W"), clip([28, 14, 6, 10], circ(27, 19, 5, "M")), rect(27, 22, 5, 8, "X"), rect(28, 22, 2, 8, "M")] },
  // antenas que salen de la pecera
  line(13, 4, 10, 1, "O"), ...ball(10, 1),
  // brazos de cromo y garras marcianas
  rect(2, 22, 5, 8, "M"), vline(2, 22, 8, "m"), hline(2, 25, 5, "X"),
  rect(1, 30, 6, 3, "W"), hline(1, 30, 6, "w"), rect(1, 33, 2, 2, "o"), rect(5, 33, 2, 2, "o"), px(3, 33, "o"),
  // piernas y botas
  rect(10, 30, 5, 4, "M"), vline(10, 30, 4, "m"), rect(9, 34, 8, 3, "X"), hline(9, 34, 8, "M"),
  // peto del bando con el planeta de latón y cinturón
  rect(8, 17, 9, 12, "w"), rect(8, 26, 9, 2, "W"), vline(8, 17, 9, "W"),
  circ(16, 22, 2, "y"), px(15, 21, "g"), hline(12, 22, 4, "Y"), px(11, 22, "Y"),
  rect(8, 28, 9, 2, "X"), rect(15, 28, 2, 2, "y"),
  // hombreras remachadas
  circ(6, 19, 5, "M"), circ(5, 18, 4, "m"), hline(2, 23, 9, "X"), px(4, 17, "Y"), px(8, 19, "Y"),
  // cuello de cromo
  rect(10, 15, 7, 2, "M"), hline(10, 15, 7, "m"),
  // pecera con la cabeza
  circ(16, 9, 7, "c"), circ(16, 10, 5, "W"), clip([0, 0, 34, 9], circ(16, 10, 5, "w")), clip([0, 13, 34, 3], circ(16, 10, 5, "o")),
  hline(14, 13, 3, "b"), line(12, 8, 14, 9, "b"),
);

// Ariete: platillo volante que embiste de morro, inclinado, con espolón de cromo, marciano
// furioso en la cúpula, luces en el borde, estela de rayas y chispas del choque.
const A = -0.22, CA = Math.cos(A), SA = Math.sin(A);
const tilt = (cx, cy, rx, ry, col, keep = () => true) => (c) => {
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = dx * CA + dy * SA, v = -dx * SA + dy * CA;
    if ((u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1 && keep(u, v)) c.px(x, y, col);
  }
};
// Un punto a lo largo del disco (u) y a su través (v), desde el centro del platillo.
const RX = 22, RY = 18;
const at = (u, v) => [Math.round(RX + u * CA - v * SA), Math.round(RY + u * SA + v * CA)];
boss("boss-ram", { w: 40, h: 30 },
  // estela de rayas detrás
  hline(33, 4, 6, "c"), hline(35, 7, 5, "C"), hline(36, 25, 4, "c"), hline(31, 28, 6, "C"),
  // disco: encima del bando, borde y panza
  tilt(RX, RY, 18, 5, "w", (u, v) => v <= 0.5), tilt(RX, RY, 18, 5, "W", (u, v) => v > -1.5 && v <= 0.5),
  tilt(RX, RY, 18, 5, "O", (u, v) => v > 0.5), tilt(RX, RY, 18, 5, "o", (u, v) => v > 0.5 && v < 2),
  tilt(RX, RY, 9, 4, "X", (u, v) => v > 3), tilt(RX, RY, 9, 4, "M", (u, v) => v > 3 && v < 4.2),
  (c) => { for (const u of [-12, -7, -2, 3, 8, 13]) { const [x, y] = at(u, 1.2); c.px(x, y, "y"); } },
  // cúpula con el marciano furioso
  tilt(RX, RY, 8, 11, "c", (u, v) => v < -2.5), tilt(RX, RY, 8, 11, "C", (u, v) => v < -2.5 && u > 4),
  tilt(RX, RY, 5, 9, "W", (u, v) => v < -3), tilt(RX, RY, 5, 9, "w", (u, v) => v < -7 && u < 1),
  (c) => { const [x, y] = at(-1, -6); c.rect(x - 2, y - 1, 2, 2, "g"); c.px(x - 2, y, "k"); c.rect(x + 2, y - 2, 2, 2, "g"); c.px(x + 2, y - 1, "k");
    c.line(x - 3, y - 3, x, y - 2, "b"); c.line(x + 4, y - 4, x + 2, y - 3, "b"); c.line(x - 1, y + 2, x + 3, y + 1, "b");
    const [hx, hy] = at(-6, -6); c.px(hx, hy, "g"); c.px(hx, hy + 1, "g"); },
  // espolón de cromo en el morro
  (c) => { const [ax, ay] = at(-15, -3), [bx, by] = at(-15, 3), [tx, ty] = at(-22, 0);
    c.poly([ax, ay, tx, ty, bx, by], "M"); c.line(ax, ay, tx, ty, "m"); },
  // tobera con la llama
  (c) => { const [x, y] = at(17, -0.5); c.rect(x, y - 1, 2, 3, "X"); c.rect(x + 2, y - 1, 2, 3, "y"); c.px(x + 4, y, "Y"); },
  // chispas del choque
  px(1, 21, "y"), px(0, 20, "y"), px(2, 20, "Y"), px(1, 26, "y"), px(3, 27, "y"), px(0, 24, "Y"),
);

// Hidra: blob del bando con cinco cabezas: tres grandes de un solo ojo (la del medio con
// antena de bolita y las de los lados con colmillos) y dos ojitos en pedúnculo.
boss("boss-hydra", { w: 37, h: 34, mx: "c",
  post: [clip([19, 20, 18, 14], ellipse(18, 27, 17, 6, "o")), clip([19, 20, 18, 4], ellipse(18, 27, 17, 6, "W")),
    clip([19, 2, 5, 22], rect(16, 11, 5, 13, "o")), clip([19, 2, 6, 11], circ(18, 7, 5, "o")), clip([19, 2, 6, 7], circ(18, 7, 5, "W")),
    ...eye(18, 7, 2), hline(17, 11, 3, "b"),
    ...eye(5, 12, 2), ...eye(31, 12, 2), px(32, 11, "k"), px(30, 11, "g"), px(31, 11, "g"), px(30, 12, "g"),
    rect(25, 18, 2, 2, "g"), px(25, 18, "k"), rect(10, 18, 2, 2, "g"), px(10, 18, "k")] },
  // cuerpo de blob con lunares
  ellipse(18, 27, 17, 6, "W"), clip([0, 0, 37, 25], ellipse(18, 27, 17, 6, "w")), clip([0, 30, 37, 4], ellipse(18, 27, 17, 6, "o")),
  circ(9, 28, 1, "o"), circ(14, 31, 1, "o"), px(5, 26, "o"),
  // pedúnculos con ojitos
  line(13, 22, 11, 18, "o"),
  // cuellos y cabezas de los lados con colmillos
  line(12, 25, 6, 15, "W", 4), line(11, 24, 6, 16, "w", 1),
  circ(5, 12, 4, "W"), clip([0, 0, 37, 11], circ(5, 12, 4, "w")), clip([0, 14, 37, 3], circ(5, 12, 4, "o")),
  hline(3, 15, 4, "k"), px(3, 16, "g"), px(6, 16, "g"),
  // cuello y cabeza del medio con antena
  rect(16, 11, 5, 13, "W"), vline(16, 11, 13, "w"),
  circ(18, 7, 5, "W"), clip([0, 0, 18, 6], circ(18, 7, 5, "w")), vline(18, 1, 1, "O"), ...ball(18, 1),
);

// Gólem: robot de hojalata de juguete de los 50. Cabeza de caja con ojos de manómetro, rejilla
// en la boca y dos válvulas de radio encendidas; chapa pintada del bando con remaches, panel de
// diales, brazos de tubo de acordeón con pinzas y la llave de dar cuerda.
boss("boss-golem", { w: 42, h: 38, mx: true,
  post: [rect(21, 2, 8, 11, "X"), rect(21, 2, 7, 10, "M"), rect(21, 13, 15, 15, "W"), rect(33, 14, 3, 13, "o"),
    ...eye(17, 6, 2), ...eye(24, 6, 2), rect(16, 9, 10, 2, "X"), ...[17, 19, 21, 23, 25].map((x) => vline(x, 9, 2, "M")),
    rect(14, 16, 14, 8, "X"), rect(15, 17, 12, 6, "b"), circ(18, 20, 2, "m"), line(18, 20, 19, 18, "k"), circ(24, 20, 2, "m"), line(24, 20, 23, 19, "R"),
    px(16, 18, "r"), px(26, 18, "y"), px(21, 22, "C"), px(21, 18, "c"),
    ...[15, 19, 23, 27].map((y) => [px(35, y, "M"), px(22, y + 1, "M")]).flat(),
    rect(36, 21, 2, 3, "Y"), rect(38, 19, 2, 7, "y"), vline(38, 19, 7, "Y")] },
  // válvulas de radio en la cabeza
  rect(14, 0, 3, 3, "c"), px(15, 1, "y"), px(14, 0, "g"), rect(13, 3, 5, 1, "X"),
  // cabeza de caja con remaches
  rect(13, 3, 8, 10, "M"), rect(13, 3, 8, 1, "m"), vline(13, 3, 10, "m"), ...[[14, 4], [14, 11]].map(([x, y]) => px(x, y, "X")),
  rect(10, 6, 3, 4, "X"), rect(10, 7, 2, 2, "y"),
  // brazos de acordeón con pinzas
  rect(1, 14, 5, 13, "M"), ...[15, 17, 19, 21, 23, 25].map((y) => hline(1, y, 5, "X")), vline(1, 14, 13, "m"),
  poly([0, 27, 7, 27, 7, 31, 5, 35, 4, 31, 3, 31, 2, 35, 0, 31], "X"), hline(0, 27, 7, "M"),
  rect(6, 15, 2, 3, "X"),
  // cuerpo de chapa del bando con remaches
  rect(8, 13, 13, 15, "w"), vline(8, 13, 15, "W"), hline(8, 27, 13, "o"),
  ...[15, 19, 23, 27].map((y) => px(9, y, "M")),
  // cadera y piernas de caja
  rect(10, 28, 11, 2, "X"), rect(11, 30, 6, 4, "M"), vline(11, 30, 4, "m"),
  rect(9, 34, 9, 4, "W"), hline(9, 34, 9, "w"), hline(9, 37, 9, "o"),
);

// Jinete: trípode de la guerra de los mundos. Capota del bando con su ojo de rayos de calor,
// panza de cromo, tentáculo con el cañoncito y tres patas larguísimas con articulaciones.
boss("boss-rider", { w: 26, h: 40,
  post: [] },
  // patas: la de atrás, más oscura
  line(13, 14, 13, 38, "X", 1), rect(11, 39, 5, 1, "X"),
  line(10, 13, 5, 25, "M", 2), line(5, 25, 1, 38, "M", 2), circ(5, 25, 1, "X"), rect(0, 38, 5, 2, "X"),
  line(16, 13, 21, 25, "M", 2), line(21, 25, 24, 38, "M", 2), circ(21, 25, 1, "X"), rect(21, 38, 5, 2, "X"),
  vline(5, 26, 4, "m"), vline(1, 34, 3, "m"),
  // tentáculo con el cañoncito
  line(18, 13, 22, 17, "X"), line(22, 17, 22, 20, "X"), rect(21, 20, 3, 2, "M"), px(22, 22, "c"),
  // panza de cromo
  ellipse(13, 11, 8, 3, "M"), clip([0, 11, 26, 4], ellipse(13, 11, 8, 3, "X")), hline(6, 10, 15, "m"),
  // capota del bando
  ellipse(13, 7, 11, 5, "W"), clip([0, 0, 26, 6], ellipse(13, 7, 11, 5, "w")), clip([0, 9, 26, 4], ellipse(13, 7, 11, 5, "o")),
  clip([16, 0, 10, 9], ellipse(13, 7, 11, 5, "o")), clip([16, 0, 10, 4], ellipse(13, 7, 11, 5, "W")),
  hline(3, 9, 20, "O"), vline(13, 2, 7, "W"),
  // ojo de rayos de calor
  circ(9, 7, 2, "d"), circ(9, 7, 1, "C"), px(9, 7, "c"), px(8, 6, "g"),
  // antenita
  line(17, 3, 19, 0, "O"), px(19, 0, "r"),
);

// Muralla: nave nodriza ancha y baja. Cúpula con el capitán, cubierta con ojos de buey por donde
// se asoman los marcianitos, disco del bando con luces y panza con tres emisores de rayo tractor.
boss("boss-wall", { w: 44, h: 24, mx: true,
  post: [clip([22, 0, 22, 12], ellipse(21, 6, 7, 5, "C")), px(18, 3, "g"), px(17, 4, "g"),
    clip([22, 6, 22, 7], ellipse(21, 10, 16, 4, "o")), clip([22, 10, 22, 8], ellipse(21, 14, 21, 5, "W")), hline(22, 14, 21, "O")] },
  // cúpula con el capitán
  ellipse(21, 6, 7, 5, "c"), circ(21, 6, 2, "W"), px(20, 6, "k"), px(21, 4, "O"), px(21, 3, "r"),
  // cubierta con ojos de buey
  ellipse(21, 10, 16, 4, "W"), clip([0, 0, 44, 9], ellipse(21, 10, 16, 4, "w")),
  ...[8, 13, 18].flatMap((x) => [rect(x, 9, 3, 3, "k"), px(x, 10, "W"), px(x + 1, 10, "g"), px(x + 1, 11, "k")]),
  // disco con luces
  ellipse(21, 14, 21, 5, "w"), clip([0, 15, 44, 5], ellipse(21, 14, 21, 5, "O")), hline(0, 14, 22, "o"),
  ...[2, 6, 10, 14, 18].map((x) => px(x, 14, "y")), ...[4, 8, 12, 16, 20].map((x) => px(x, 14, "Y")),
  // emisores de rayo tractor
  rect(8, 19, 4, 3, "M"), hline(8, 19, 4, "m"), rect(9, 22, 2, 2, "C"), px(9, 22, "c"),
  rect(19, 20, 3, 2, "M"), hline(19, 20, 3, "m"), rect(20, 22, 2, 2, "C"), px(20, 22, "c"),
);

// Devorador: gelatina tragona del bando con una boca enorme llena de dientes y lengua, ojos
// flotando dentro, burbujas y un tornillo que se acaba de zampar; gotea por abajo.
boss("boss-devourer", { w: 38, h: 32, mx: true,
  post: [clip([19, 0, 19, 32], ellipse(19, 18, 18, 13, "W")), clip([19, 0, 19, 32], ellipse(19, 21, 17, 10, "o")),
    clip([19, 0, 19, 8], ellipse(19, 18, 18, 13, "w")),
    ellipse(19, 20, 12, 7, "k"), ellipse(19, 23, 8, 3, "R"), ellipse(17, 24, 4, 2, "r"),
    ...[9, 13, 17, 21, 25].map((x) => poly([x, 14, x + 4, 14, x + 2, 17], "g")),
    ...[11, 15, 19, 23].map((x) => poly([x, 27, x + 4, 27, x + 2, 24], "g")),
    ...eye(12, 8, 2), ...eye(25, 7, 3), ...eye(19, 4, 1),
    line(31, 13, 34, 10, "M", 2), px(30, 14, "X"), px(31, 14, "X"), px(30, 13, "X"),
    circ(7, 12, 1, "c"), px(32, 19, "c"), px(5, 20, "c"), px(6, 6, "g"), px(7, 5, "g"), px(5, 7, "g")] },
  // gotas que caen
  rect(6, 28, 3, 3, "o"), rect(13, 29, 3, 3, "o"),
  // cuerpo de gelatina
  ellipse(19, 18, 18, 13, "W"), ellipse(19, 21, 17, 10, "o"), ellipse(19, 18, 18, 13, "W", true),
  clip([0, 0, 38, 8], ellipse(19, 18, 18, 13, "w")),
);

sheet("jefes", ["boss-titan", "boss-ram", "boss-hydra", "boss-golem", "boss-rider", "boss-wall", "boss-devourer"], { pad: 2 });
