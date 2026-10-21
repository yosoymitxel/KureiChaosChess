// El set del tema "Michis": las once piezas de Zug como los gatos de una casa. Gatito sentado,
// michi asomado a su caja de cartón, gato equilibrista sobre un ovillo, gata egipcia de oro y
// lapislázuli, gata persa con tiara, gato león gordo con corona, gato guardia con colador, tenedor
// y tapa de olla, gato sabio con gafas en su puf, gato gordo paseando con cascabel, gato erizado
// de Halloween y gato montado en un cañón de lata. El pelo usa la rampa del bando (w W o O b) y se
// recolorea (crema, gris azulado, naranja); ojos, nariz, collares, cartón, metal y lana son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/gatos/piezas.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#24161c", // tinta: contorno e interiores
  w: "#fffaf0", W: "#f4e2c0", o: "#dcbf92", O: "#b08a60", b: "#7a5a3c", // pelo (claro)
  g: "#ffffff", // brillos y bigotes
  e: "#b8e04a", E: "#6e9c24", // ojos
  n: "#f48aa0", N: "#c85a74", // nariz, orejas por dentro, almohadillas y lengua
  r: "#e03a4a", R: "#9a1c30", // collares, lazos y terciopelo
  y: "#ffd84a", Y: "#c8901e", // oro y cascabeles
  l: "#5a7ae0", L: "#2e3e9a", // lapislázuli
  c: "#e8bc7c", C: "#c08c50", d: "#80582e", // cartón
  m: "#eef0f4", M: "#aab2be", X: "#6a7282", // metal
  u: "#f06aa8", U: "#a83a74", // lana
  t: "#c88a50", T: "#8a5a30", // madera
});
ramps("bOoWw", "XMm", "dCc", "Rr", "Yy", "Ee", "Nn", "Uu", "Tt", "Ll");

const piece = (name, { post = [], ...opts }, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" }, ...post);
};

// Una bola de pelo con luz arriba a la izquierda: la base en sombra, encima el tono medio corrido
// un píxel hacia la luz y un brillo arriba a la izquierda.
const inE = (cx, cy, rx, ry) => (x, y) => ((x - cx) / (rx + 0.5)) ** 2 + ((y - cy) / (ry + 0.5)) ** 2 < 1;
const orb = (cx, cy, rx, ry, [hi, mid, lo] = ["w", "W", "o"]) => [
  ellipse(cx, cy, rx, ry, lo),
  recolor({ [lo]: mid }, inE(cx - 1, cy - 1, rx, ry)),
  recolor({ [mid]: hi }, inE(cx - rx * 0.35 - 0.5, cy - ry * 0.4 - 0.5, rx * 0.45, ry * 0.4)),
];
// Orejas de una cabeza de frente centrada en la columna cx (la de la derecha en sombra).
const ears = (cx, cy, rx, ry, h = 3, gap = 4) => {
  const m = (x) => 2 * cx + 1 - x, top = cy - ry - h, base = cy - ry + 2;
  const L = [cx - rx, base, cx - rx + 1, top, cx - rx + gap + 1, cy - ry];
  return [
    poly(L, "W"), poly([m(L[0]), L[1], m(L[2]), L[3], m(L[4]), L[5]], "o"),
    poly([cx - rx + 2, base - 1, cx - rx + 2, top + 2, cx - rx + gap, cy - ry + 1], "n"),
    poly([m(cx - rx + 2), base - 1, m(cx - rx + 2), top + 2, m(cx - rx + gap), cy - ry + 1], "n"),
  ];
};
// Ojos verdes de frente: pupila de rendija y brillo. h = alto.
const eyes = (cx, y, dx, h = 2) => [
  rect(cx - dx - 1, y, 2, h, "e"), rect(cx + dx, y, 2, h, "e"),
  vline(cx - dx, y, h, "k"), vline(cx + dx, y, h, "k"), px(cx - dx - 1, y, "g"), px(cx + dx + 1, y, "g"),
  hline(cx - dx - 1, y + h - 1, 1, "E"), hline(cx + dx + 1, y + h - 1, 1, "E"),
];
// Hocico: nariz rosa y boca en w.
const snout = (cx, y) => [px(cx, y, "n"), px(cx - 1, y + 1, "b"), px(cx + 1, y + 1, "b"), px(cx, y + 1, "o")];
// Cabeza entera de frente.
const head = (cx, cy, rx, ry, { ear = 3, gap = 4, ex = 2, eh = 2, ey = 0 } = {}) => [
  ...ears(cx, cy, rx, ry, ear, gap), ...orb(cx, cy, rx, ry),
  ...eyes(cx, cy + ey, ex, eh), ...snout(cx, cy + ey + eh + 1),
];

// Peón: gatito sentado de frente, cabezón, con las patitas juntas y la cola enroscada a un lado.
// El más bajito.
piece("pawn", { w: 18, h: 21 },
  // cola enroscada (detrás)
  line(12, 19, 15, 18, "O", 2), line(15, 17, 16, 13, "o", 2), px(16, 12, "W"),
  // cuerpo y pechera
  ...orb(8, 15, 5, 4), ellipse(8, 16, 2, 2, "w"),
  // patitas
  rect(5, 18, 3, 2, "w"), rect(9, 18, 3, 2, "w"), px(7, 19, "o"), px(9, 19, "o"), px(11, 19, "o"),
  // cabeza
  ...head(8, 7, 6, 5, { ear: 3, gap: 4, ex: 2, eh: 2 }),
);

// Torre: michi asomado a una caja de cartón con las solapas levantadas como almenas, las patas
// colgando por el borde, cinta de embalar y un pescadito pintado.
piece("rook", { w: 26, h: 28 },
  // fondo de la caja por dentro y solapas de atrás
  rect(3, 10, 17, 5, "d"), poly([3, 10, 6, 5, 20, 5, 20, 10], "C"),
  // cabeza del michi
  ...head(11, 9, 6, 5, { ear: 3, gap: 4, ex: 2, eh: 2 }),
  // caja: cara de delante y lado en sombra
  rect(1, 15, 20, 13, "c"), hline(1, 15, 20, "C"), poly([21, 15, 25, 11, 25, 24, 21, 28], "C"), line(21, 15, 25, 11, "d"),
  // solapas abiertas
  poly([1, 15, 0, 8, 4, 9, 4, 15], "c"), vline(0, 9, 5, "C"),
  poly([21, 15, 22, 7, 25, 6, 25, 11], "C"), line(22, 8, 22, 14, "c"),
  // cinta y pescadito
  rect(9, 15, 4, 13, "C"), vline(9, 16, 12, "c"),
  poly([3, 21, 6, 19, 8, 21, 6, 23], "d"), poly([2, 19, 3, 21, 2, 23], "d"), px(6, 20, "c"),
  rect(15, 24, 4, 1, "d"), rect(16, 22, 2, 1, "d"),
  // patas colgando del borde
  ...orb(7, 15, 2, 2), ...orb(15, 15, 2, 2), px(6, 16, "o"), px(8, 16, "o"), px(14, 16, "o"), px(16, 16, "o"),
);

// Caballo: gato equilibrista de perfil, encaramado a un ovillo de lana con una pata delantera en
// alto y la cola en signo de interrogación; del ovillo sale la hebra. Mira a la izquierda.
piece("knight", { w: 30, h: 31 },
  // hebra suelta
  line(22, 27, 26, 29, "u"), line(26, 29, 29, 28, "u"),
  // ovillo con sus vueltas
  ...orb(15, 23, 7, 7, ["u", "u", "U"]),
  line(9, 20, 20, 30, "U"), line(10, 18, 21, 28, "U"), line(13, 17, 22, 25, "U"), line(9, 24, 14, 29, "U"),
  px(11, 18, "g"), px(12, 17, "g"),
  // cola en signo de interrogación
  line(23, 11, 26, 7, "o", 2), line(26, 7, 26, 3, "o", 2), line(26, 3, 24, 1, "W", 2), px(23, 1, "W"),
  // patas de atrás sobre el ovillo
  line(19, 13, 19, 17, "O", 2), line(17, 13, 16, 17, "o", 2),
  // cuerpo arqueado
  ...orb(16, 10, 8, 4),
  // pata delantera de apoyo y la que juega en alto
  line(10, 12, 12, 17, "o", 2), line(9, 12, 5, 14, "W", 2), px(4, 15, "w"), px(3, 14, "w"),
  // cabeza de perfil: oreja, hocico y ojo
  poly([6, 5, 7, 0, 10, 4], "W"), poly([7, 4, 8, 2, 9, 4], "n"), poly([2, 6, 2, 3, 5, 5], "W"),
  ...orb(6, 8, 4, 4), rect(1, 8, 3, 3, "W"), px(1, 8, "w"), px(1, 9, "n"), px(2, 11, "o"),
  rect(4, 7, 2, 2, "e"), px(4, 7, "k"), px(4, 8, "k"), px(5, 7, "g"),
  hline(2, 12, 3, "b"),
);

// Alfil: gata egipcia sentada de perfil, como las estatuas de Bastet: largas patas delanteras,
// orejas altas, collar ancho de oro y lapislázuli, pendiente de oro y la cola por delante.
piece("bishop", {}, `
....W....W.......
....Ww...WW......
....WnW..WnW.....
....WnwWWWnWo....
...wwwwWWWWWo....
..wwwwwWWWWWo....
.wwwekkkWWWWo....
wwwwWkWWWWWWo....
nWWWWWWWWWWYo....
.WWWWWWWWWWyo....
..oobWWWWWWo.....
....oWWWWWWo.....
...yyyyyyyyy.....
...yllllllllY....
...YLyLLyLLyY....
....wwWWWWWWWo...
....wwWWWWWWWWo..
....wwWWWwwWWWWo.
....wwWoWwwWWWWWo
....wwWoWwWWWWWWo
....wwWoWWWWWWWWo
....wwWoWWWWWWWWo
....wwWoWWWWWWWOo
....wwWoWWWWWWWOo
....wwWoWWWWWWOOo
....wwWoWWWWWOOOo
....wwWoWWWWOOOo.
....wwWoWWWOOOo..
...wwwwooOOOOo...
.bOOOOOOOOOOb....`);

// Reina: gata persa sentada de frente, pelo largo de campana, tiara de oro con piedra rosa,
// collar de perlas, pestañas y la cola de penacho subida por un lado.
piece("queen", { w: 27, h: 31 },
  // cola de penacho
  line(18, 29, 23, 24, "o", 3), line(23, 24, 23, 16, "W", 3), line(22, 15, 21, 12, "w", 2),
  // cuerpo de campana con su pechera de pelo largo
  poly([8, 15, 18, 15, 22, 30, 4, 30], "W"), poly([14, 15, 18, 15, 22, 30, 16, 30], "o"), vline(8, 19, 11, "w"),
  poly([10, 15, 16, 15, 15, 23, 13, 25, 11, 23], "w"), px(12, 24, "W"), px(14, 24, "W"),
  // patitas
  rect(8, 28, 3, 2, "w"), rect(15, 28, 3, 2, "W"), px(9, 29, "o"), px(16, 29, "o"),
  // collar de perlas
  ...[9, 11, 13, 15, 17].map((x) => px(x, 16 + (x === 13 ? 1 : 0), "g")), px(13, 18, "r"),
  // cabeza
  ...head(13, 10, 5, 4, { ear: 3, gap: 3, ex: 2, eh: 2, ey: -1 }), px(9, 8, "k"), px(17, 8, "k"),
  // tiara
  rect(10, 3, 7, 2, "y"), hline(10, 4, 7, "Y"), vline(10, 1, 2, "y"), vline(13, 0, 3, "y"), vline(16, 1, 2, "Y"), px(13, 3, "n"), px(13, 0, "g"),
  // mechones del pelo largo por los lados
  px(7, 19, "W"), px(6, 23, "W"), px(5, 27, "W"), px(4, 29, "W"),
);

// Rey: gato león gordísimo de frente, melena enorme de puntas, corona de oro con gemas, panza y
// bigotes. El más alto.
piece("king", { w: 31, h: 34,
  post: [hline(2, 18, 4, "g"), hline(25, 18, 4, "g"), hline(3, 20, 3, "g"), hline(25, 20, 3, "g")] },
  // panza y patas
  ...orb(15, 26, 11, 7), ellipse(14, 27, 6, 5, "w"), clip([15, 21, 7, 12], ellipse(14, 27, 6, 5, "W")),
  rect(8, 31, 5, 3, "W"), rect(18, 31, 5, 3, "o"), px(10, 33, "O"), px(20, 33, "O"),
  // melena de puntas
  poly([15, 3, 18, 6, 23, 5, 23, 9, 27, 12, 24, 15, 27, 19, 23, 21, 23, 25, 18, 23, 15, 26, 12, 23, 7, 25, 7, 21, 3, 19, 6, 15, 3, 12, 7, 9, 7, 5, 12, 6], "O"),
  ...orb(15, 15, 9, 8, ["o", "o", "O"]), clip([0, 0, 15, 15], circ(15, 15, 6, "o")),
  // orejitas y cara
  poly([8, 8, 9, 3, 12, 7], "o"), poly([23, 8, 22, 3, 19, 7], "O"), px(10, 6, "n"), px(21, 6, "n"),
  ...orb(15, 16, 6, 5), ellipse(15, 19, 3, 2, "w"),
  ...eyes(15, 14, 3, 2), line(11, 13, 13, 13, "b"), line(18, 13, 20, 13, "b"), ...snout(15, 17),
  // corona
  rect(10, 2, 11, 4, "y"), hline(10, 5, 11, "Y"), px(10, 1, "y"), px(10, 0, "y"), px(15, 0, "y"), px(15, 1, "y"), px(20, 0, "y"), px(20, 1, "y"),
  px(12, 3, "r"), px(15, 3, "l"), px(18, 3, "r"), px(11, 2, "g"),
);

// Guardia: gato de pie con un colador por casco (las orejas salen por los agujeros), tapa de
// olla por escudo y un tenedor por lanza.
piece("guard", { w: 25, h: 29 },
  // tenedor (detrás)
  vline(21, 4, 24, "M"), vline(22, 5, 23, "X"), rect(19, 3, 5, 2, "M"), vline(19, 0, 3, "m"), vline(21, 0, 3, "m"), vline(23, 0, 3, "M"),
  // cola
  line(16, 25, 20, 27, "O", 2),
  // patas y cuerpo
  rect(8, 24, 4, 4, "W"), rect(13, 24, 4, 4, "o"), hline(8, 27, 4, "w"), hline(13, 27, 4, "W"),
  ...orb(12, 19, 6, 6), ellipse(12, 20, 3, 4, "w"),
  // pata que agarra el tenedor
  ...orb(20, 15, 2, 2),
  // cabeza
  ...head(12, 10, 5, 4, { ear: 3, gap: 3, ex: 2, eh: 2, ey: 0 }),
  // colador
  clip([0, 0, 25, 9], circ(12, 9, 6, "M")), clip([0, 0, 12, 9], circ(12, 9, 6, "m")), hline(5, 8, 15, "X"), hline(5, 9, 15, "M"),
  px(9, 5, "X"), px(12, 4, "X"), px(15, 5, "X"), px(11, 6, "X"), px(14, 7, "X"), px(8, 7, "X"),
  poly([6, 5, 7, 0, 10, 3], "W"), poly([18, 5, 17, 0, 14, 3], "o"), px(8, 3, "n"), px(16, 3, "n"),
  // tapa de olla
  circ(5, 19, 5, "X"), circ(5, 19, 4, "M"), clip([0, 0, 6, 19], circ(5, 19, 4, "m")), rect(4, 18, 3, 2, "X"), px(4, 18, "M"),
);

// Consejero: gato sabio y viejo sentado en un puf de terciopelo con borlas: gafas redondas, cejas
// largas, barbita blanca y un libro abierto en las patas.
piece("advisor", { w: 25, h: 27 },
  // puf
  ...orb(12, 22, 11, 4, ["r", "r", "R"]), hline(4, 19, 14, "r"), hline(3, 22, 19, "R"), px(12, 22, "Y"),
  vline(1, 23, 3, "y"), vline(23, 23, 3, "Y"), px(1, 26, "Y"), px(23, 26, "Y"),
  // cola colgando por el puf
  line(18, 18, 21, 22, "O", 2), line(21, 22, 21, 25, "O", 2),
  // cuerpo
  ...orb(12, 14, 6, 5),
  // cabeza con cejas largas
  ...head(12, 7, 5, 4, { ear: 3, gap: 3, ex: 2, eh: 1, ey: 0 }),
  // gafas
  rect(8, 6, 4, 3, "k"), rect(13, 6, 4, 3, "k"), rect(9, 7, 2, 1, "c"), rect(14, 7, 2, 1, "c"), px(9, 7, "g"), px(14, 7, "g"), px(12, 7, "k"),
  line(7, 4, 9, 5, "w"), line(17, 4, 15, 5, "w"),
  // barbita
  px(11, 11, "w"), px(12, 11, "w"), px(13, 11, "w"), px(12, 12, "w"),
  // libro abierto
  rect(8, 15, 9, 4, "l"), rect(9, 15, 3, 3, "m"), rect(13, 15, 3, 3, "m"), vline(12, 15, 4, "L"), hline(9, 16, 2, "M"), hline(13, 16, 3, "M"),
  rect(7, 16, 2, 2, "w"), rect(16, 16, 2, 2, "W"),
);

// Elefante: gato gordo paseando de perfil, con la barriga colgando, collar rojo con cascabel de
// oro y la cola tiesa con la punta doblada. Mira a la izquierda.
piece("elephant", { w: 33, h: 23 },
  // cola tiesa
  line(26, 10, 29, 3, "o", 2), line(29, 3, 31, 1, "W", 2), px(32, 2, "W"),
  // patas de atrás (lado de atrás en sombra)
  rect(12, 17, 3, 5, "O"), rect(25, 16, 3, 6, "O"),
  // cuerpo gordo con barriga
  ...orb(18, 12, 10, 7), ellipse(18, 17, 7, 3, "w"), clip([0, 15, 33, 5], ellipse(18, 16, 7, 3, "W")),
  // rayas atigradas
  vline(17, 6, 3, "O"), vline(21, 6, 3, "O"), vline(25, 8, 3, "O"),
  // patas de delante
  rect(8, 16, 4, 6, "W"), rect(21, 17, 4, 5, "W"), vline(8, 16, 6, "w"), hline(8, 21, 4, "w"), hline(21, 21, 4, "w"),
  // cabeza de perfil
  poly([6, 4, 7, 0, 10, 3], "W"), poly([7, 3, 8, 1, 9, 3], "n"), poly([3, 5, 2, 1, 5, 3], "o"),
  ...orb(6, 8, 5, 4), rect(1, 8, 3, 3, "W"), px(1, 8, "w"), px(1, 9, "n"), hline(1, 11, 3, "o"),
  rect(4, 6, 2, 2, "e"), px(4, 6, "k"), px(4, 7, "k"), px(5, 6, "g"),
  // collar con cascabel
  line(7, 12, 10, 11, "r", 2), circ(9, 14, 1, "y"), px(9, 15, "Y"), px(8, 13, "g"),
);

// Camello: gato erizado de Halloween de perfil: lomo en arco como una joroba, patas larguísimas
// y tiesas, pelo de punta y la cola erizada hacia arriba; bufa con la boca abierta.
piece("camel", { w: 27, h: 32 },
  // cola erizada
  line(21, 13, 24, 2, "o", 3), px(26, 4, "o"), px(26, 8, "o"), px(22, 3, "W"), px(21, 7, "W"), px(25, 1, "W"),
  // patas de atrás (sombra)
  line(11, 15, 10, 30, "O", 2), line(20, 15, 21, 30, "O", 2),
  // lomo en arco con el pelo de punta
  clip([0, 0, 27, 17], ellipse(15, 16, 8, 9, "o")), clip([0, 0, 27, 16], ellipse(14, 15, 8, 9, "W")), clip([0, 0, 27, 11], ellipse(13, 14, 5, 6, "w")),
  px(11, 6, "W"), px(15, 5, "W"), px(19, 7, "o"), px(22, 10, "o"),
  // patas de delante tiesas
  line(9, 15, 8, 30, "W", 2), line(18, 15, 19, 30, "W", 2), rect(7, 30, 3, 1, "w"), rect(18, 30, 3, 1, "w"),
  // cabeza por delante del pecho, orejas echadas atrás, bufando con los colmillos fuera
  poly([1, 11, 0, 6, 4, 9], "W"), poly([1, 10, 1, 8, 3, 9], "n"), poly([6, 9, 10, 6, 10, 11], "o"),
  ...orb(5, 13, 5, 4), clip([5, 13, 7, 6], ellipse(5, 13, 5, 4, "O", true)),
  line(1, 11, 4, 12, "b"), rect(2, 12, 2, 1, "e"), px(3, 12, "k"),
  rect(0, 14, 4, 3, "k"), px(0, 14, "g"), px(3, 14, "g"), rect(1, 16, 2, 1, "n"), px(0, 13, "n"),
);

// Cañón: cañón de lata de sardinas sobre su cureña de madera, con un gato tumbado encima que
// asoma la cabeza por delante de la boca; al lado, la munición: ovillos. Apunta a la izquierda.
piece("cannon", { w: 32, h: 25 },
  // cureña y rueda de atrás
  poly([12, 17, 27, 17, 29, 22, 10, 22], "T"), hline(12, 17, 15, "t"),
  // cañón de lata
  rect(4, 12, 22, 6, "M"), hline(4, 12, 22, "m"), hline(4, 17, 22, "X"), rect(26, 13, 3, 4, "X"), px(29, 14, "X"),
  rect(2, 11, 3, 8, "M"), vline(2, 11, 8, "m"), vline(4, 11, 8, "X"), rect(0, 13, 2, 4, "k"),
  rect(11, 13, 7, 4, "r"), hline(11, 13, 7, "y"), hline(11, 16, 7, "R"),
  // rueda
  circ(19, 20, 4, "t"), ring(19, 20, 4, "T"), px(19, 20, "T"), line(16, 17, 22, 23, "T"), line(22, 17, 16, 23, "T"),
  // ovillo de munición
  ...orb(28, 21, 3, 3, ["u", "u", "U"]), line(26, 19, 30, 23, "U"), line(26, 21, 28, 23, "U"), px(27, 19, "g"),
  // gato tumbado sobre el cañón
  line(24, 10, 28, 14, "O", 2), line(28, 14, 30, 11, "O", 2),
  ...orb(16, 9, 8, 3), rect(10, 11, 3, 2, "W"), rect(19, 11, 3, 2, "o"),
  poly([5, 4, 6, 0, 9, 3], "W"), poly([6, 3, 7, 1, 8, 3], "n"), poly([10, 4, 12, 0, 13, 4], "o"),
  ...orb(8, 7, 4, 4), rect(3, 8, 2, 2, "W"), px(3, 9, "n"),
  rect(6, 6, 2, 2, "e"), px(6, 6, "k"), px(6, 7, "k"), px(7, 6, "g"),
  rect(5, 11, 3, 2, "w"),
);

sheet("michis", ["pawn", "rook", "knight", "bishop", "queen", "king", "guard", "advisor", "elephant", "camel", "cannon"], { pad: 2 });
