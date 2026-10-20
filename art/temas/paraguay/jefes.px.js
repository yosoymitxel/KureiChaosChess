// Jefes del tema "Ñandutí": los siete colosos como seres del monte y de la fiesta de San Juan.
// Tau, el gigante oscuro del monte; el toro candil con los cuernos encendidos; Teju Jagua, el
// lagarto de siete cabezas de perro; el gólem de piedra y tierra colorada (Itá Pytã); el jinete
// alto de poncho sobre un caballo flaco; Moñái, la serpiente cornuda que corta el campo, y Ao Ao,
// el bicho lanudo de boca enorme. Solo se dibuja el bando claro (w W o y el acento a A: ponchos,
// mantas, escamas y lana del bando); lo demás es fijo en los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/paraguay/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#1e1612",
  w: "#f4ecda", W: "#ddd0b2", o: "#b8a27a", a: "#2f5fc4", A: "#1b2f7e", // marfil y azul (claro)
  s: "#e3ad84", S: "#b07650", // piel
  h: "#ead08a", H: "#b8964e", // paja
  n: "#9a5e34", N: "#5c381c", // madera y cuero
  r: "#a26a42", R: "#6c4428", // pelaje del toro y del caballo
  d: "#5a5048", D: "#3c3430", // corteza oscura del monte (Tau)
  y: "#f2c64e", Y: "#b48a2c", // oro
  g: "#efe9dc", G: "#aaa292", // hueso, cuerno y dientes
  m: "#d6dde6", M: "#8a95a5", // metal
  e: "#ffb347", E: "#e2552b", F: "#ffe58a", // fuego y ojos de brasa
  x: "#d08a66", q: "#a8604a", Q: "#7a4232", // arenisca y tierra colorada
  v: "#86b552", V: "#4c7c34", // hojas y musgo
  l: "#e98ab8", L: "#c0568c", // flor de lapacho
});
ramps("oWw", "Aa", "SsS", "Hh", "NnN", "Rr", "Dd", "Yy", "Gg", "Mm", "EeF", "Qqx", "Vv", "Ll");

const boss = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Titán: Tau, el gigante oscuro del monte. Cuerpo de corteza con barba de musgo, ojos de brasa,
// una corona de ramas con hojas (sin cuernos) y un poncho enorme del bando sobre los hombros,
// con guarda y flecos. Simétrico: se dibuja la mitad izquierda.
boss("boss-titan", { w: 34, h: 37, mx: true },
  // piernas de tronco y pies con raíces
  rect(10, 27, 6, 7, "d"), rect(10, 27, 2, 7, "D"), rect(9, 34, 8, 3, "D"), px(8, 36, "D"), hline(11, 34, 3, "d"),
  // brazos largos de corteza y manos que cuelgan
  rect(2, 14, 5, 12, "d"), vline(2, 14, 12, "D"), hline(3, 19, 3, "D"), rect(1, 26, 6, 4, "D"), rect(2, 26, 4, 2, "d"),
  px(1, 30, "D"), px(3, 30, "D"), px(5, 30, "D"),
  // poncho del bando: cae de los hombros hasta las rodillas, con listas, guarda y flecos
  poly([5, 12, 17, 12, 17, 28, 7, 28, 4, 18], "w"),
  clip([5, 12, 17, 12, 17, 28, 7, 28, 4, 18], ...[7, 11, 15].map((x) => vline(x, 12, 16, "W")), rect(0, 24, 17, 1, "a"), rect(0, 26, 17, 1, "A"), rect(4, 12, 3, 16, "W")),
  ...[7, 10, 13, 16].map((x) => px(x, 28, "o")),
  rect(13, 12, 4, 2, "o"),
  // cabeza de corteza con la barba de musgo y los ojos de brasa
  rect(10, 4, 7, 8, "d"), rect(10, 4, 1, 8, "D"), hline(11, 4, 6, "D"),
  rect(13, 7, 2, 1, "D"), px(14, 7, "e"), px(15, 7, "F"), hline(12, 6, 4, "D"),
  rect(11, 10, 6, 3, "v"), rect(12, 12, 5, 2, "v"), px(11, 12, "V"), px(13, 13, "V"), px(15, 11, "V"), hline(14, 10, 3, "k"),
  // corona de ramas con hojas
  line(12, 4, 8, 0, "N"), line(10, 2, 7, 3, "N"), line(15, 4, 15, 0, "N"),
  px(7, 0, "v"), px(8, 1, "V"), px(6, 3, "v"), px(6, 2, "V"), px(14, 0, "v"), px(16, 1, "v"), px(15, 0, "V"),
);

// Ariete: el toro candil del San Juan, de perfil y embistiendo a la izquierda, con la cabeza
// gacha, los cuernos encendidos y una manta del bando con la guarda azul y los flecos.
boss("boss-ram", { w: 40, h: 30 },
  // cola y patas de atrás
  line(36, 9, 38, 18, "R"), rect(37, 18, 2, 3, "N"),
  rect(29, 20, 3, 7, "R"), rect(34, 19, 3, 8, "r"), rect(29, 27, 3, 2, "N"), rect(34, 27, 3, 2, "N"),
  // cuerpo con la giba
  ellipse(24, 14, 13, 8, "r"), ellipse(24, 18, 12, 4, "R"), ellipse(15, 9, 5, 3, "r"),
  // patas de delante
  rect(13, 20, 3, 7, "R"), rect(18, 21, 3, 6, "r"), rect(13, 27, 3, 2, "N"), rect(18, 27, 3, 2, "N"),
  // manta del bando con la guarda y los flecos
  poly([17, 7, 33, 7, 35, 19, 15, 19], "w"),
  clip([17, 7, 33, 7, 35, 19, 15, 19], rect(30, 7, 6, 13, "W"), rect(0, 15, 40, 2, "a"), hline(0, 8, 40, "W"),
    ...[[20, 10], [24, 10], [28, 10], [22, 12], [26, 12]].map(([x, y]) => px(x, y, "o"))),
  ...[16, 19, 22, 25, 28, 31, 34].map((x) => px(x, 20, "o")),
  // cuello y cabeza gacha
  ellipse(11, 13, 5, 5, "r"), poly([1, 12, 8, 9, 11, 12, 10, 20, 4, 21, 1, 18], "r"), rect(0, 16, 4, 4, "R"),
  px(1, 17, "k"), hline(1, 20, 3, "k"), rect(6, 13, 2, 1, "k"), px(7, 13, "e"),
  // oreja y cuernos de hueso
  px(10, 10, "R"), px(11, 9, "R"),
  line(7, 10, 4, 6, "g", 2), line(4, 6, 3, 3, "g"), px(3, 3, "G"),
  line(10, 10, 13, 6, "G", 2), line(13, 6, 14, 4, "G"),
  // las llamas en las puntas de los cuernos
  px(3, 2, "e"), px(2, 1, "E"), px(3, 1, "F"), px(4, 1, "e"), px(3, 0, "E"), px(2, 2, "E"), px(4, 2, "E"),
  px(14, 3, "e"), px(13, 2, "E"), px(14, 2, "F"), px(15, 2, "e"), px(14, 1, "E"), px(15, 3, "E"), px(13, 3, "E"),
  glow("eEF", { where: [0, 0, 17, 5], r: 3, strength: 0.4, bands: 2 }),
);

// Hidra: Teju Jagua, el lagarto de escamas del bando con siete cabezas de perro de ojos de fuego,
// manchas azules en el lomo y el oro de las cuevas a sus pies. Simétrica con columna central.
const dog = (x, y) => [
  // cabeza de perro mirando afuera (a la izquierda): cráneo, hocico, oreja caída y ojo de fuego
  rect(x, y, 5, 4, "w"), rect(x + 3, y, 2, 4, "W"), rect(x - 2, y + 2, 3, 2, "W"), px(x - 2, y + 2, "k"), hline(x - 1, y + 4, 3, "o"),
  rect(x + 3, y - 1, 2, 3, "o"), px(x + 1, y + 1, "e"),
];
boss("boss-hydra", { w: 37, h: 34, mx: "c" },
  // el oro de la cueva
  ellipse(18, 32, 7, 1, "y"), px(13, 31, "y"), px(16, 31, "Y"), px(14, 32, "Y"),
  // cuerpo de lagarto, chato y ancho, con las patas abiertas y las garras
  rect(3, 27, 5, 4, "W"), rect(2, 31, 6, 2, "o"), px(1, 33, "g"), px(3, 33, "g"), px(5, 33, "g"),
  ellipse(18, 26, 14, 6, "W"), ellipse(18, 25, 12, 4, "w"), ellipse(18, 30, 9, 2, "o"),
  ...[[10, 24], [14, 22], [18, 23], [8, 27]].map(([x, y]) => rect(x, y, 2, 2, "a")),
  // cuellos que salen del lomo
  line(10, 23, 4, 19, "W", 3), line(12, 22, 7, 12, "W", 3), line(15, 21, 12, 6, "W", 3), line(18, 21, 18, 4, "W", 3),
  line(10, 22, 4, 18, "w"), line(12, 21, 7, 11, "w"), line(15, 20, 12, 5, "w"), line(17, 21, 17, 4, "w"),
  // tres cabezas por lado
  ...dog(3, 15), ...dog(6, 8), ...dog(11, 2),
  // la cabeza del medio, de frente: orejas caídas, hocico y ojos de fuego
  rect(15, 1, 7, 5, "w"), rect(14, 1, 2, 4, "o"), rect(16, 5, 5, 2, "W"), px(18, 5, "k"), hline(17, 7, 3, "E"), px(16, 3, "e"),
  px(18, 1, "y"), px(18, 0, "y"),
);

// Gólem: Itá Pytã, el coloso de arenisca y tierra colorada (3×3). Hombros de roca con un lapacho
// en flor que le crece encima, una estrella de ñandutí que brilla en el pecho, faja del bando
// con su guarda y puños enormes que tocan el suelo.
boss("boss-golem", { w: 42, h: 36, mx: true },
  // piernas y pies
  rect(13, 27, 6, 6, "q"), rect(13, 27, 1, 6, "Q"), rect(12, 32, 8, 4, "Q"), rect(13, 32, 4, 1, "q"),
  // torso de bloques con las juntas
  poly([8, 12, 21, 12, 21, 27, 11, 27], "q"), rect(12, 13, 9, 1, "x"),
  hline(10, 17, 11, "Q"), vline(15, 13, 4, "Q"), hline(11, 21, 10, "Q"), vline(13, 17, 4, "Q"), vline(19, 17, 4, "Q"),
  // estrella de ñandutí en el pecho
  ...[[21, 15], [21, 21], [18, 18]].map(([x, y]) => px(x, y, "F")), line(21, 16, 21, 20, "e"), line(19, 18, 21, 18, "e"),
  px(19, 16, "e"), px(19, 20, "e"), px(21, 18, "F"), px(20, 17, "y"), px(20, 19, "y"),
  // faja del bando
  rect(11, 23, 10, 4, "w"), rect(11, 26, 10, 1, "W"), rect(11, 24, 10, 1, "a"), ...[12, 15, 18].map((x) => px(x, 27, "o")),
  // brazos colgando y puños
  rect(2, 15, 6, 11, "q"), rect(2, 15, 1, 11, "Q"), hline(2, 20, 6, "Q"),
  circ(5, 29, 4, "Q"), circ(5, 28, 3, "q"), px(3, 27, "x"), px(5, 26, "x"), px(7, 27, "x"),
  // hombro de roca
  circ(8, 12, 6, "Q"), circ(8, 11, 5, "q"), circ(7, 10, 3, "x"),
  // lapacho chico en el hombro: tronquito y copa rosada
  vline(7, 4, 4, "N"), px(8, 6, "N"),
  ellipse(7, 3, 4, 2, "l"), px(4, 3, "L"), px(9, 4, "L"), px(6, 2, "F"), px(8, 2, "l"), px(5, 1, "l"), px(10, 3, "L"),
  // cabeza de bloque metida entre los hombros, con musgo
  rect(15, 4, 6, 8, "x"), rect(15, 4, 6, 1, "q"), rect(15, 7, 6, 1, "Q"),
  px(17, 8, "e"), px(18, 8, "E"), hline(18, 10, 3, "Q"),
  ellipse(19, 3, 3, 1, "v"), px(17, 3, "V"),
);

// Jinete: el jinete alto de poncho y sombrero sobre un caballo flaco de patas largas. El poncho
// del bando se le vuela atrás. Alto y estrecho (2×1 en vertical).
boss("boss-rider", { w: 28, h: 40 },
  // poncho al viento detrás
  poly([17, 12, 27, 16, 25, 24, 17, 22], "W"), clip([17, 12, 27, 16, 25, 24, 17, 22], line(17, 18, 27, 21, "a", 2)),
  px(26, 24, "o"), px(24, 25, "o"),
  // patas largas y flacas del caballo, y la cola
  rect(8, 29, 2, 9, "r"), rect(11, 29, 1, 9, "R"), rect(18, 29, 1, 9, "R"), rect(21, 29, 2, 9, "r"),
  rect(7, 38, 3, 2, "N"), rect(11, 38, 2, 2, "N"), rect(18, 38, 2, 2, "N"), rect(21, 38, 3, 2, "N"),
  line(24, 23, 26, 33, "N", 2),
  // cuerpo flaco con las costillas
  ellipse(15, 26, 9, 4, "r"), ellipse(15, 28, 8, 2, "R"), ...[13, 16, 19].map((x) => vline(x, 25, 2, "R")),
  // pelero del bando
  rect(11, 21, 9, 3, "a"), hline(11, 21, 9, "A"), ...[12, 15, 18].map((x) => vline(x, 22, 2, "w")),
  // cuello largo, crin y cabeza
  line(9, 24, 5, 14, "r", 3), line(8, 22, 6, 13, "N"),
  ellipse(4, 14, 3, 2, "r"), rect(0, 14, 4, 3, "r"), rect(0, 15, 2, 2, "R"), px(1, 15, "k"), px(4, 13, "k"), px(5, 11, "r"), px(6, 11, "R"),
  line(2, 16, 12, 17, "N"),
  // jinete: pierna larga con la bota y el estribo
  rect(14, 21, 3, 8, "o"), rect(14, 29, 3, 2, "N"), hline(13, 31, 5, "M"),
  // poncho del bando con las listas finas y la guarda
  poly([12, 9, 20, 9, 22, 22, 10, 22], "w"),
  clip([12, 9, 20, 9, 22, 22, 10, 22], ...[11, 14, 17, 20].map((x) => vline(x, 9, 13, "W")), rect(19, 9, 4, 13, "W"), hline(9, 19, 14, "a")),
  ...[10, 12, 14, 16, 18, 20].map((x) => px(x + 1, 22, "o")),
  // mano con las riendas
  rect(10, 15, 2, 2, "s"),
  // cara flaca y sombrero alto de ala ancha
  rect(13, 4, 6, 5, "s"), rect(17, 4, 2, 5, "S"), px(14, 6, "k"), hline(14, 8, 3, "S"),
  rect(13, 0, 6, 3, "h"), rect(17, 0, 2, 3, "H"), hline(13, 2, 6, "a"), rect(9, 3, 14, 1, "h"), hline(10, 4, 3, "H"), hline(19, 4, 3, "H"),
);

// Muralla: Moñái, la gran serpiente de los campos, con cuernos, tendida a lo ancho y en ondas
// bajas. Escamas del bando con rombos azules en el lomo y el vientre claro. Ancha y baja (1×2).
boss("boss-wall", { w: 44, h: 26 },
  // cuerpo en ondas, de la cola (derecha) al cuello (izquierda)
  (c) => {
    for (let x = 8; x < 44; x++) {
      const t = (x - 8) / 35, r = Math.max(1, Math.round(5 - t * 3.6));
      const y = Math.round(17 - Math.sin((x - 8) / 5.5) * 3 * (1 - t * 0.4));
      c.circ(x, y, r, "w");
      c.rect(x, y + Math.max(0, r - 1), 1, 1, "o");
      if (r > 1) c.rect(x, y + r - 2, 1, 1, "W");
      if ((x - 8) % 6 === 0 && r > 2) { c.px(x, y - r + 1, "a"); c.px(x - 1, y - r + 2, "a"); c.px(x + 1, y - r + 2, "a"); c.px(x, y - r + 3, "A"); }
    }
  },
  // cuello levantado y la cabeza mirando a la izquierda
  line(10, 17, 6, 10, "w", 5), line(10, 20, 7, 13, "W", 2),
  ellipse(6, 8, 6, 4, "w"), rect(0, 8, 6, 4, "w"), ellipse(7, 11, 5, 1, "W"), hline(0, 11, 6, "W"),
  px(0, 8, "k"), hline(0, 10, 4, "k"), px(5, 7, "k"), px(6, 7, "e"), rect(4, 4, 6, 1, "W"),
  // lengua bífida
  hline(0, 13, 1, "E"), px(1, 12, "E"),
  // cuernos curvos de hueso
  line(7, 5, 11, 1, "g", 2), line(11, 1, 13, 0, "g"), px(13, 0, "G"),
  line(4, 5, 4, 1, "G", 2), px(3, 0, "G"),
  // rombos del lomo en el cuello
  px(8, 12, "a"), px(9, 13, "a"), px(7, 13, "a"), px(8, 14, "A"),
);

// Devorador: Ao Ao, el bicho lanudo de los cerros. Una bola de lana del bando con rizos, la boca
// enorme abierta con dos filas de dientes, ojillos de brasa, orejas y patas de pezuña.
boss("boss-devourer", { w: 38, h: 32, mx: true },
  // patas de pezuña
  rect(7, 27, 5, 3, "W"), rect(7, 30, 5, 2, "D"), px(9, 30, "k"),
  // cuerpo de lana con el borde en rizos
  ellipse(19, 17, 17, 12, "w"), ellipse(19, 21, 16, 8, "W"),
  ...[[3, 12], [2, 17], [3, 22], [6, 7], [10, 4], [15, 3], [6, 26], [11, 28]].map(([x, y]) => circ(x, y, 2, "w")),
  ...[[4, 13], [3, 18], [7, 8], [11, 5], [4, 23]].map(([x, y]) => ring(x, y, 1, "W")),
  ...[[8, 18], [6, 13]].map(([x, y]) => ring(x, y, 1, "o")),
  // guarda del bando bajo la boca
  hline(6, 27, 26, "a"), hline(8, 28, 22, "A"),
  // fauces enormes, dientes y lengua
  ellipse(19, 18, 12, 7, "k"), ellipse(19, 21, 9, 3, "E"), ellipse(19, 22, 5, 1, "e"),
  ...[8, 11, 14, 17].map((x) => poly([x, 12, x + 3, 12, x + 1, 15], "g")),
  ...[10, 13, 16].map((x) => poly([x, 25, x + 3, 25, x + 1, 22], "g")),
  // ojillos de brasa y orejas
  circ(14, 7, 2, "D"), px(14, 7, "e"), px(15, 7, "F"), circ(9, 9, 1, "D"), px(9, 9, "e"),
  poly([7, 4, 9, 0, 11, 4], "W"), px(9, 2, "o"),
);

sheet("jefes", ["boss-titan", "boss-ram", "boss-hydra", "boss-golem", "boss-rider", "boss-wall", "boss-devourer"], { pad: 2 });
