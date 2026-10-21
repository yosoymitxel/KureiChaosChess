// Jefes del tema "Ñandutí": los siete colosos como seres del monte y de la fiesta de San Juan.
// Tau, el gigante oscuro del monte; el toro candil con los cuernos encendidos; Teju Jagua, el
// lagarto con cabezas de perro (cinco a la vista); el gólem de piedra y tierra colorada (Itá Pytã); el jinete
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

// Titán: Tau, el gigante oscuro del monte. Cuerpo de corteza, rostro oscuro con ojos claros,
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
  // cabeza de corteza con la cara oscura hundida, la frente saliente, ojos claros que brillan,
  // la boca negra y una barba corta de raíces que cae sobre el cuello del poncho
  rect(10, 4, 7, 9, "d"), rect(10, 4, 1, 9, "D"), hline(11, 4, 6, "D"),
  rect(12, 7, 5, 5, "D"), hline(11, 6, 6, "d"), px(12, 7, "d"),
  rect(13, 8, 2, 1, "F"), rect(13, 9, 2, 1, "e"), vline(16, 8, 3, "d"),
  hline(14, 11, 3, "k"),
  ...[[12, 13], [14, 13], [16, 13], [13, 14], [16, 14]].map(([x, y]) => px(x, y, "N")),
  // corona de ramas con hojas
  line(12, 4, 8, 0, "N"), line(10, 2, 7, 3, "N"), line(15, 4, 15, 0, "N"),
  px(7, 0, "v"), px(8, 1, "V"), px(6, 3, "v"), px(6, 2, "V"), px(14, 0, "v"), px(16, 1, "v"), px(15, 0, "V"),
);

// Ariete: el toro candil del San Juan, de perfil y embistiendo a la izquierda, con la cabeza
// gacha, los cuernos encendidos y una manta del bando con la guarda azul y los flecos.
boss("boss-ram", { w: 40, h: 30 },
  // cola con la borla y patas de atrás
  line(37, 10, 39, 19, "R"), rect(38, 19, 2, 3, "N"),
  rect(29, 20, 4, 7, "R"), rect(34, 19, 3, 8, "r"), rect(29, 27, 4, 2, "N"), rect(34, 27, 3, 2, "N"),
  // cuerpo con la giba en la cruz
  ellipse(25, 15, 12, 7, "r"), ellipse(25, 19, 11, 3, "R"), circ(17, 10, 5, "r"), px(15, 6, "w"),
  // patas de delante, con la rodilla
  rect(14, 20, 4, 7, "R"), rect(19, 21, 3, 6, "r"), hline(14, 23, 4, "N"), rect(14, 27, 4, 2, "N"), rect(19, 27, 3, 2, "N"),
  // manta del bando que cae sobre el lomo, con la guarda y los flecos
  poly([19, 8, 33, 8, 36, 11, 36, 20, 17, 20, 17, 11], "w"),
  clip([19, 8, 33, 8, 36, 11, 36, 20, 17, 20, 17, 11], rect(31, 8, 6, 13, "W"), rect(0, 16, 40, 2, "a"), hline(0, 9, 40, "W"),
    ...[[21, 11], [25, 11], [29, 11], [23, 13], [27, 13]].map(([x, y]) => px(x, y, "o"))),
  ...[18, 21, 24, 27, 30, 33].map((x) => px(x, 21, "o")),
  // cabeza gacha para embestir: testuz ancho, hocico claro y la papada
  poly([4, 10, 11, 9, 15, 12, 14, 18, 9, 22, 3, 23, 0, 20, 1, 14], "r"), line(13, 11, 13, 18, "R"),
  rect(0, 19, 5, 4, "S"), px(0, 19, "r"), px(1, 21, "k"), hline(1, 23, 4, "k"), poly([9, 21, 14, 18, 15, 22, 11, 24], "R"),
  rect(7, 13, 2, 2, "k"), px(8, 13, "e"), hline(6, 12, 4, "R"),
  // oreja
  rect(11, 10, 3, 2, "R"), px(13, 9, "R"),
  // cuernos gruesos de hueso: el de delante hacia adelante y arriba, el otro detrás
  line(10, 9, 13, 6, "G", 2), line(13, 6, 13, 3, "G", 2), px(12, 3, "G"),
  line(6, 10, 3, 8, "g", 3), line(3, 8, 2, 4, "g", 2), px(4, 9, "G"), px(5, 10, "G"), px(3, 6, "w"),
  // las llamas en las puntas de los cuernos
  px(2, 3, "e"), px(1, 2, "E"), px(2, 2, "F"), px(3, 2, "e"), px(2, 1, "E"), px(1, 3, "E"), px(3, 3, "E"), px(2, 0, "e"), px(3, 1, "E"),
  px(13, 2, "e"), px(12, 1, "E"), px(13, 1, "F"), px(14, 1, "e"), px(13, 0, "E"), px(14, 2, "E"), px(12, 2, "E"), px(14, 0, "e"),
);

// Hidra: Teju Jagua, el gran lagarto de las cuevas con cabezas de perro. Cuerpo de lagarto de
// perfil, chato y largo, con las patas abiertas, las garras, la cola que se enrosca y las manchas
// del lomo; de los hombros salen cinco cuellos con cinco cabezas de perro bien separadas (hocico
// con la nariz, oreja parada y ojos de fuego), y el oro de la cueva a sus pies.
// Cabeza de perro mirando a la izquierda: oreja parada, cráneo, hocico largo con la nariz negra,
// la boca abierta con la lengua y la mandíbula.
sprite("_dog", `
  .......o..
  ......ooW.
  ....wwwoWW
  ..wwwwwwwW
  kwwwwkewWW
  wwwwwwwwWW
  kkkoWWWWW.
  .EEoWWW...`);
boss("boss-hydra", { w: 42, h: 38 },
  // cola larga que se arrastra a la derecha y enrosca la punta
  line(31, 31, 38, 32, "W", 3), line(38, 32, 40, 30, "W", 2), line(41, 30, 41, 26, "W"), px(40, 26, "W"),
  hline(32, 30, 5, "w"), hline(36, 33, 3, "o"),
  // patas del otro lado, más oscuras, asomando bajo la panza
  rect(12, 34, 3, 3, "o"), rect(25, 34, 3, 3, "o"), ...[11, 13, 24, 26].map((x) => px(x, 37, "o")),
  // cuerpo de lagarto, chato y largo: lomo claro, panza oscura y manchas del bando en el lomo
  ellipse(20, 31, 13, 4, "W"), ellipse(19, 29, 11, 1, "w"), ellipse(20, 34, 10, 1, "o"),
  ...[[10, 30], [15, 29], [20, 29], [25, 29], [29, 30]].map(([x, y]) => rect(x, y, 2, 2, "a")), ...[11, 16, 21, 26].map((x) => px(x, 33, "A")),
  // patas de este lado, abiertas hacia afuera como las de un lagarto, con tres garras
  poly([7, 32, 11, 32, 9, 36, 5, 36], "W"), line(10, 33, 8, 36, "o"), rect(3, 36, 6, 1, "W"), ...[3, 5, 7].map((x) => px(x, 37, "g")),
  poly([28, 32, 32, 32, 35, 36, 31, 36], "W"), line(31, 33, 33, 36, "o"), rect(32, 36, 6, 1, "W"), ...[33, 35, 37].map((x) => px(x, 37, "g")),
  // el oro de la cueva bajo la panza
  hline(17, 37, 5, "y"), px(19, 37, "F"), px(18, 36, "Y"), px(20, 36, "y"),
  // cinco cuellos finos que salen de los hombros y se abren en abanico, sin tocarse
  line(14, 28, 7, 21, "W", 2), line(17, 27, 12, 12, "W", 2), line(20, 27, 21, 9, "W", 2), line(23, 27, 30, 12, "W", 2), line(26, 28, 34, 21, "W", 2),
  // las cinco cabezas de perro: la mayor arriba y dos a cada lado
  stamp("_dog", 0, 14), stamp("_dog", 5, 5), stamp("_dog", 14, 1), stamp("_dog", 27, 5, { flip: "x" }), stamp("_dog", 32, 14, { flip: "x" }),
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

// Jinete: el jinete de poncho y sombrero sobre un caballo criollo flaco, de perfil y mirando a
// la izquierda: cabeza larga de caballo con las orejas, crin y cola oscuras, patas finas con los
// cascos. El poncho del bando con su guarda y el pelero bajo la montura. Alto y estrecho (2×1).
boss("boss-rider", { w: 28, h: 40 },
  // cola oscura que cae
  line(24, 23, 26, 26, "N", 2), line(26, 26, 26, 33, "N", 2), px(25, 34, "N"),
  // patas del otro lado, más oscuras
  rect(11, 30, 2, 8, "R"), rect(20, 30, 2, 8, "R"), rect(11, 38, 2, 2, "N"), rect(20, 38, 2, 2, "N"),
  // cuerpo flaco de caballo: lomo, panza y anca
  ellipse(16, 26, 9, 4, "r"), ellipse(16, 29, 7, 1, "R"), circ(22, 25, 3, "r"), ...[14, 17].map((x) => vline(x, 27, 2, "R")),
  // patas de este lado, finas y largas, con la rodilla, el corvejón y los cascos
  rect(8, 29, 2, 9, "r"), px(9, 33, "R"), rect(8, 38, 3, 2, "N"),
  rect(23, 28, 2, 5, "r"), rect(22, 33, 2, 5, "r"), px(23, 33, "R"), rect(22, 38, 3, 2, "N"),
  // cuello de caballo en diagonal con la crin oscura por detrás, y la cabeza larga que baja
  // hacia el hocico, con las orejas paradas, el ojo y la nariz
  grid(0, 10, `
    .....r.r.....
    .....rRr.....
    ....rrrrN....
    ...rrkrrNN...
    ..rrrrrrrNN..
    .rrrR.rrrrN..
    rrrR...rrrrN.
    rrR....RrrrN.
    kR......RrrrN
    ........Rrrrr
    .........Rrrr
    .........Rrrr
    .........rrrr
    ........rrrrr
    ........rrrrr`),
  // riendas
  line(7, 14, 11, 16, "N"),
  // pelero del bando bajo la montura, con las listas
  rect(12, 22, 9, 3, "a"), hline(12, 22, 9, "A"), ...[13, 16, 19].map((x) => vline(x, 23, 2, "w")),
  // jinete: pierna con la bota y el estribo
  rect(15, 21, 2, 6, "o"), vline(16, 21, 6, "W"), rect(14, 27, 4, 2, "N"), hline(14, 29, 4, "M"),
  // poncho del bando con listas finas, la guarda y los flecos
  poly([13, 11, 19, 11, 21, 21, 11, 21], "w"),
  clip([13, 11, 19, 11, 21, 21, 11, 21], ...[12, 15, 18].map((x) => vline(x, 11, 10, "W")), rect(18, 11, 4, 10, "W"), hline(11, 18, 11, "a")),
  ...[11, 13, 15, 17, 19].map((x) => px(x + 1, 21, "o")),
  // mano con las riendas
  rect(11, 16, 2, 2, "s"),
  // cara y sombrero de ala ancha con la cinta del bando
  rect(14, 7, 4, 4, "s"), rect(17, 7, 1, 4, "S"), px(15, 8, "k"), hline(14, 10, 3, "S"),
  rect(13, 3, 6, 3, "h"), rect(17, 3, 2, 3, "H"), hline(13, 5, 6, "a"), rect(10, 6, 12, 1, "h"), hline(11, 7, 2, "H"), hline(19, 7, 2, "H"),
);

// Muralla: Moñái, la gran serpiente de los campos, tendida a lo ancho en ondas bajas (1×2), con
// la cabeza alzada a la izquierda y dos cuernos de hueso ramificados como los de un ciervo.
// Escamas del bando con bandas azules en el lomo y el vientre más oscuro.
boss("boss-wall", { w: 44, h: 26 },
  // cuerpo en ondas, del cuello (izquierda) a la cola (derecha), que se afina hacia la punta;
  // después el vientre abajo y las bandas del lomo
  (c) => {
    for (let x = 16; x < 40; x++) {
      const y = Math.round(19 - Math.sin((x - 16) / 3.4) * 3.5), r = x < 37 ? 3 : 2;
      c.circ(x, y, r, "w");
    }
    c.line(40, 18, 42, 15, "w", 2), c.line(42, 15, 42, 12, "w"), c.px(41, 11, "w");
    for (let x = 12; x < 44; x++) {
      let bottom = -1, top = -1;
      for (let y = 12; y < 26; y++) if (c.is(x, y, "wWo")) { if (top < 0) top = y; bottom = y; }
      if (bottom < 0) continue;
      c.px(x, bottom, "o");
      if (bottom - 1 > top + 1) c.px(x, bottom - 1, "W");
      if (x > 13 && x < 39 && x % 5 < 2) for (let y = top; y < bottom - 1; y++) c.px(x, y, x % 5 ? "A" : "a");
    }
  },
  // cuello que se alza en curva, más fino que el cuerpo, con el vientre por delante
  line(16, 20, 13, 17, "w", 3), line(13, 17, 10, 13, "w", 3), line(14, 21, 11, 17, "W"), line(11, 17, 9, 14, "W"), px(14, 22, "o"), px(15, 22, "o"),
  // cabeza ancha de serpiente mirando a la izquierda: mandíbula, ojo de brasa y lengua bífida
  poly([0, 10, 4, 8, 9, 8, 12, 11, 10, 14, 1, 14], "w"), hline(2, 13, 8, "W"), hline(2, 14, 7, "o"),
  hline(0, 12, 5, "k"), px(0, 10, "W"), rect(6, 9, 2, 2, "k"), px(7, 9, "e"), hline(4, 8, 4, "W"), px(2, 10, "k"),
  px(0, 13, "E"), px(1, 13, "E"),
  // cuernos de hueso como de ciervo: una vara curva hacia atrás con dos puntas que suben
  line(8, 7, 10, 5, "g"), line(10, 5, 15, 3, "g"), px(16, 3, "G"), line(11, 5, 11, 2, "g"), px(11, 1, "G"), line(14, 4, 15, 1, "G"),
  line(6, 7, 6, 4, "G"), px(5, 3, "G"), line(7, 4, 9, 2, "G"),
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
  // guarda del bando bajo la boca
  hline(6, 27, 26, "a"), hline(8, 28, 22, "A"),
  // fauces enormes, dientes y lengua
  ellipse(19, 18, 12, 7, "k"), ellipse(19, 21, 9, 3, "E"), ellipse(19, 22, 5, 1, "e"),
  ...[8, 11, 14, 17].map((x) => poly([x, 12, x + 3, 12, x + 1, 15], "g")),
  ...[10, 13, 16].map((x) => poly([x, 25, x + 3, 25, x + 1, 22], "g")),
  // ojillos de brasa y orejas
  circ(14, 7, 2, "D"), px(14, 7, "e"), px(15, 7, "F"), px(13, 6, "e"),
  poly([7, 4, 9, 0, 11, 4], "W"), px(9, 2, "o"),
);

sheet("jefes", ["boss-titan", "boss-ram", "boss-hydra", "boss-golem", "boss-rider", "boss-wall", "boss-devourer"], { pad: 2 });
