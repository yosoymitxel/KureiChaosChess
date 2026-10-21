// Jefes del tema "Michis": los siete colosos como los gatos más grandes de la casa. Hogaza de gato
// gigante, gato que embiste dentro de su caja, maraña de tres gatos, gato gordo dormido hecho una
// rosca, gato caballero montado en su robot aspirador con un plumero por lanza, gato larguísimo
// tumbado y gato negro con la boca abierta de par en par. Mismas reglas que las piezas: el pelo usa
// la rampa del bando (w W o O b) y se recolorea; ojos, nariz, cartón, metal, lana y capas son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/gatos/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#24161c",
  w: "#fffaf0", W: "#f4e2c0", o: "#dcbf92", O: "#b08a60", b: "#7a5a3c",
  g: "#ffffff",
  e: "#b8e04a", E: "#6e9c24",
  n: "#f48aa0", N: "#c85a74",
  r: "#e03a4a", R: "#9a1c30",
  y: "#ffd84a", Y: "#c8901e",
  c: "#e8bc7c", C: "#c08c50", d: "#80582e",
  m: "#eef0f4", M: "#aab2be", X: "#6a7282",
  u: "#f06aa8", U: "#a83a74",
  t: "#c88a50", T: "#8a5a30",
});
ramps("bOoWw", "XMm", "dCc", "Rr", "Yy", "Ee", "Nn", "Uu", "Tt");

const boss = (name, { post = [], ...opts }, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" }, ...post);
};

const inE = (cx, cy, rx, ry) => (x, y) => ((x - cx) / (rx + 0.5)) ** 2 + ((y - cy) / (ry + 0.5)) ** 2 < 1;
const FUR = ["w", "W", "o"], DARK = ["o", "O", "b"];
const orb = (cx, cy, rx, ry, [hi, mid, lo] = FUR) => [
  ellipse(cx, cy, rx, ry, lo),
  recolor({ [lo]: mid }, inE(cx - 1, cy - 1, rx, ry)),
  recolor({ [mid]: hi }, inE(cx - rx * 0.35 - 0.5, cy - ry * 0.4 - 0.5, rx * 0.45, ry * 0.4)),
];
const ears = (cx, cy, rx, ry, h = 3, gap = 4, [l, d] = ["W", "o"]) => {
  const m = (x) => 2 * cx + 1 - x, top = cy - ry - h, base = cy - ry + 2;
  const L = [cx - rx, base, cx - rx + 1, top, cx - rx + gap + 1, cy - ry];
  return [
    poly(L, l), poly([m(L[0]), L[1], m(L[2]), L[3], m(L[4]), L[5]], d),
    poly([cx - rx + 2, base - 1, cx - rx + 2, top + 2, cx - rx + gap, cy - ry + 1], "n"),
    poly([m(cx - rx + 2), base - 1, m(cx - rx + 2), top + 2, m(cx - rx + gap), cy - ry + 1], "n"),
  ];
};
const eyes = (cx, y, dx, h = 2) => [
  rect(cx - dx - 1, y, 2, h, "e"), rect(cx + dx, y, 2, h, "e"),
  vline(cx - dx, y, h, "k"), vline(cx + dx, y, h, "k"), px(cx - dx - 1, y, "g"), px(cx + dx + 1, y, "g"),
  px(cx - dx - 1, y + h - 1, "E"), px(cx + dx + 1, y + h - 1, "E"),
];
const snout = (cx, y) => [px(cx, y, "n"), px(cx - 1, y + 1, "b"), px(cx + 1, y + 1, "b"), px(cx, y + 1, "o")];
// Cabeza de frente con un filo de sombra abajo a la derecha, para que se despegue del cuerpo.
const head = (cx, cy, rx, ry, { ear = 3, gap = 4, ex = 2, eh = 2, ey = 0, face = true } = {}) => [
  ...ears(cx, cy, rx, ry, ear, gap), ...orb(cx, cy, rx, ry),
  clip((x, y) => (x - cx) + 2 * (y - cy) > 0, ellipse(cx, cy, rx, ry, "O", true)),
  ...(face ? [...eyes(cx, cy + ey, ex, eh), ...snout(cx, cy + ey + eh + 1)] : []),
];
// Ojos cerrados de dormir: dos arcos.
const sleep = (cx, y, dx) => [hline(cx - dx - 2, y, 3, "b"), px(cx - dx - 3, y - 1, "b"), hline(cx + dx, y, 3, "b"), px(cx + dx + 3, y - 1, "b")];
// Z de dormir.
const zed = (x, y, s) => [hline(x, y, s, "m"), line(x + s - 1, y, x, y + s - 1, "m"), hline(x, y + s - 1, s, "m")];

// Titán: una hogaza de gato gigante: el cuerpo de pan con las patas metidas debajo, rayas de
// atigrado, cara de pocos amigos con los párpados a media asta y bigotes.
boss("boss-titan", { w: 38, h: 31,
  post: [hline(4, 18, 6, "g"), hline(28, 18, 6, "g"), line(4, 21, 9, 20, "g"), line(33, 21, 28, 20, "g")] },
  // hogaza
  ...orb(19, 20, 18, 10),
  line(3, 16, 5, 21, "o"), line(6, 13, 8, 18, "o"), line(35, 16, 33, 21, "O"), line(32, 13, 30, 18, "O"), line(30, 23, 31, 27, "O"), line(7, 23, 6, 27, "o"),
  // patitas metidas
  ellipse(13, 29, 3, 1, "w"), ellipse(25, 29, 3, 1, "W"), px(12, 29, "o"), px(14, 29, "o"), px(24, 29, "O"), px(26, 29, "O"),
  // cabeza
  ...head(19, 13, 9, 7, { ear: 4, gap: 5, ex: 3, eh: 2, ey: -1 }),
  rect(14, 12, 3, 1, "O"), rect(22, 12, 3, 1, "O"), line(13, 10, 16, 11, "b"), line(25, 10, 22, 11, "b"),
  ellipse(19, 17, 4, 2, "w"), ...snout(19, 15),
);

// Ariete: gato que embiste dentro de una caja de cartón: asoma medio cuerpo por delante con las
// patas estiradas, las solapas vuelan, la caja lleva una huella del bando y deja polvo y rayas.
boss("boss-ram", { w: 44, h: 30 },
  // rayas de velocidad
  hline(42, 10, 2, "M"), hline(42, 16, 2, "M"),
  // polvo
  circ(40, 27, 2, "m"), circ(36, 28, 1, "M"),
  // caja: tapa, cara larga y testa en sombra
  poly([13, 9, 18, 4, 41, 4, 36, 9], "c"), rect(13, 9, 23, 18, "c"), hline(13, 9, 23, "C"), poly([36, 9, 41, 4, 41, 22, 36, 27], "C"),
  line(36, 9, 41, 4, "d"), hline(13, 26, 23, "C"),
  // solapas al viento y cinta
  poly([18, 4, 22, 0, 32, 0, 28, 4], "C"), poly([30, 4, 38, 1, 41, 4], "c"), rect(24, 9, 4, 18, "C"), vline(24, 10, 16, "c"),
  // huella del bando en el cartón
  ellipse(31, 19, 2, 2, "O"), px(28, 15, "O"), px(30, 14, "O"), px(32, 14, "O"), px(34, 15, "O"),
  // boca de la caja: el hueco oscuro y las solapas de delante abiertas alrededor del gato
  rect(13, 10, 3, 16, "d"), poly([13, 9, 18, 4, 13, 0, 8, 4], "c"), line(13, 1, 9, 4, "C"), poly([13, 27, 13, 22, 6, 29, 11, 30], "C"),
  // patas estiradas hacia delante
  ...orb(5, 22, 5, 2), ...orb(7, 25, 5, 2), px(1, 22, "w"), px(3, 25, "w"),
  // cabeza decidida
  ...head(12, 14, 7, 6, { ear: 4, gap: 4, ex: 2, eh: 2 }), line(8, 12, 11, 13, "b"), line(16, 12, 13, 13, "b"),
);

// Hidra: maraña de tres gatos en un solo montón de pelo: uno arriba con los ojos como platos, uno a
// la izquierda bufando y otro a la derecha dormido; tres colas salen por los lados.
boss("boss-hydra", { w: 40, h: 34 },
  // colas
  line(3, 29, 0, 22, "o", 2), line(0, 22, 2, 18, "W", 2),
  line(37, 28, 39, 22, "O", 2), line(39, 22, 38, 18, "o", 2),
  line(24, 33, 30, 33, "O", 2),
  // montón de pelo
  ...orb(20, 26, 17, 7), line(10, 25, 12, 30, "o"), line(28, 25, 26, 30, "O"),
  // gato de arriba
  ...orb(20, 18, 7, 6),
  ...head(20, 10, 6, 5, { ear: 4, gap: 4, ex: 2, eh: 3, ey: -1 }),
  // gato de la izquierda, bufando
  ...head(8, 20, 6, 5, { ear: 3, gap: 4, face: false }),
  rect(4, 19, 2, 1, "e"), rect(10, 19, 2, 1, "e"), px(5, 19, "k"), px(10, 19, "k"), line(3, 17, 5, 18, "b"), line(12, 17, 10, 18, "b"),
  rect(6, 21, 4, 3, "k"), px(6, 21, "g"), px(9, 21, "g"), hline(7, 23, 2, "n"),
  // gato de la derecha, dormido
  ...head(32, 20, 6, 5, { ear: 3, gap: 4, face: false }), ...sleep(32, 20, 1), ...snout(32, 22),
  // patitas por delante
  ellipse(15, 32, 2, 1, "w"), ellipse(22, 32, 2, 1, "W"),
);

// Gólem: gato gordísimo dormido hecho una rosca: el lomo atigrado, la cola rodeándolo por delante,
// la cabeza apoyada en las patas con los ojos cerrados y tres zetas flotando.
boss("boss-golem", { w: 44, h: 38 },
  // zetas
  ...zed(30, 6, 3), ...zed(34, 2, 4), ...zed(39, 0, 4),
  // rosca de pelo
  ...orb(22, 24, 20, 13),
  line(13, 13, 15, 17, "o"), line(19, 11, 20, 16, "o"), line(25, 11, 25, 16, "W"), line(31, 12, 29, 17, "o"), line(37, 16, 34, 20, "O"), line(40, 23, 36, 25, "O"),
  // cola por delante
  clip((x, y) => y >= 30 && x >= 18, ellipse(22, 25, 18, 10, "O", true)), clip((x, y) => y >= 30 && x >= 18, ellipse(22, 25, 17, 9, "o", true)),
  clip((x, y) => y >= 30 && x >= 18, ellipse(22, 25, 16, 8, "O", true)), ellipse(19, 34, 2, 1, "w"),
  // patas y cabeza dormida
  ellipse(9, 33, 4, 2, "w"), ellipse(17, 34, 3, 2, "W"), px(8, 34, "o"), px(10, 34, "o"),
  ...head(13, 25, 8, 6, { ear: 4, gap: 5, face: false }), ...sleep(13, 25, 2), ...snout(13, 27),
);

// Jinete: gato caballero sentado en su robot aspirador, con capa roja al viento y un plumero de
// lana en alto por lanza.
boss("boss-rider", { w: 27, h: 41 },
  // capa
  poly([15, 15, 22, 14, 26, 27, 20, 29], "r"), poly([20, 14, 22, 14, 26, 27, 23, 28], "R"),
  // plumero
  vline(2, 8, 27, "t"), vline(3, 8, 27, "T"), ...orb(3, 5, 3, 4, ["u", "u", "U"]), px(1, 2, "g"), hline(1, 9, 4, "y"),
  // robot aspirador
  ellipse(13, 36, 13, 4, "X"), ellipse(13, 35, 13, 3, "M"), clip([0, 0, 27, 35], ellipse(13, 35, 13, 3, "m")),
  hline(1, 37, 25, "k"), px(3, 36, "e"), px(4, 36, "E"), rect(21, 35, 2, 1, "X"),
  // cola colgando
  line(19, 31, 23, 33, "O", 2), line(23, 33, 24, 37, "O", 2),
  // cuerpo sentado
  ...orb(13, 25, 7, 8), ellipse(12, 26, 3, 5, "w"),
  rect(8, 31, 4, 3, "w"), rect(14, 31, 4, 3, "W"), px(9, 33, "o"), px(11, 33, "o"), px(15, 33, "o"),
  // pata que agarra el plumero
  ...orb(4, 20, 2, 2), line(6, 21, 9, 22, "W", 2),
  // cabeza
  ...head(13, 11, 7, 6, { ear: 4, gap: 5, ex: 2, eh: 3, ey: -1 }), line(9, 8, 11, 9, "b"), line(17, 8, 15, 9, "b"),
  // cierre de la capa
  hline(10, 17, 7, "r"), px(13, 17, "y"),
);

// Muralla: gato larguísimo tumbado de lado, con la cabeza sobre las patas estiradas, el lomo
// atigrado y la cola larga.
boss("boss-wall", { w: 43, h: 20 },
  // cola
  line(37, 15, 41, 13, "o", 2), line(41, 13, 42, 8, "o", 2), px(41, 7, "W"),
  // patas de atrás
  ellipse(33, 18, 4, 1, "W"),
  // cuerpo largo
  ...orb(23, 12, 16, 6),
  ...[17, 22, 27, 32].map((x) => line(x, 7, x + 1, 10, x < 27 ? "o" : "O")),
  // patas de delante estiradas
  ellipse(6, 18, 5, 1, "w"), ellipse(14, 18, 3, 1, "W"),
  // cabeza
  ...head(8, 10, 6, 5, { ear: 4, gap: 4, ex: 2, eh: 2, ey: -1 }),
);

// Devorador: gato negro de frente con la boca abierta de par en par: colmillos, lengua, garganta
// roja, ojos de loco y una raspa de pescado que se le cae de la boca.
boss("boss-devourer", { w: 38, h: 35,
  post: [hline(0, 18, 6, "m"), line(0, 21, 5, 20, "m"), hline(32, 18, 6, "m"), line(37, 21, 32, 20, "m")] },
  // cuerpo y patas
  ...orb(19, 28, 14, 6, DARK), ellipse(12, 33, 3, 1, "o"), ellipse(26, 33, 3, 1, "O"),
  // orejas y cabeza grande
  ...ears(19, 16, 15, 12, 4, 7, ["O", "b"]),
  ...orb(19, 16, 15, 12, DARK),
  // ojos de loco
  circ(11, 10, 3, "e"), circ(27, 10, 3, "e"), vline(11, 8, 5, "k"), vline(27, 8, 5, "k"), px(10, 8, "g"), px(26, 8, "g"),
  clip([0, 0, 38, 10], circ(11, 10, 3, "E")), clip([0, 0, 38, 10], circ(27, 10, 3, "E")), vline(11, 8, 2, "k"), vline(27, 8, 2, "k"),
  line(6, 6, 13, 8, "b"), line(32, 6, 25, 8, "b"),
  px(19, 13, "n"), px(18, 13, "N"), px(20, 13, "N"),
  // boca enorme
  ellipse(19, 21, 10, 7, "k"), ellipse(19, 22, 8, 5, "R"), ellipse(19, 25, 5, 2, "n"), hline(17, 25, 5, "N"),
  poly([11, 15, 14, 15, 13, 20], "g"), poly([24, 15, 27, 15, 25, 20], "g"),
  ...[15, 18, 21].map((x) => poly([x, 28, x + 2, 28, x + 1, 26], "g")),
  // raspa
  hline(26, 25, 6, "m"), px(27, 24, "m"), px(29, 24, "m"), px(27, 26, "m"), px(29, 26, "m"), rect(31, 24, 2, 3, "m"), px(25, 24, "m"), px(25, 26, "m"),
);

sheet("jefes", ["boss-titan", "boss-ram", "boss-hydra", "boss-golem", "boss-rider", "boss-wall", "boss-devourer"], { pad: 2 });
