// Fondos del tema "Galaxia": las placas del suelo de la estación y la rejilla de circuitos de la
// mesa. Losas de 16×16 con bisel de luz arriba a la izquierda y la junta abajo a la derecha: las
// claras son placas de acero remachadas, las oscuras paneles de servicio. Las marcas tienen causa
// (quemadura de un disparo, remache saltado, rejilla de ventilación, piloto de estado, grieta por
// impacto), nada de ruido. La mesa es una placa de circuito azul noche de 32×32 que empalma
// consigo misma por los cuatro lados.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/scifi/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#8f9db4", A: "#b4c0d2", c: "#6f7c94", C: "#4e5a72", // placa de acero (--tile-a)
  d: "#3a4562", D: "#4c5878", e: "#2c3550", E: "#1e2538", // panel oscuro (--tile-b)
  q: "#5d6a84", // quemadura sobre la placa clara
  n: "#1fb4dc", N: "#8af7ff", // piloto cian
  t: "#0c1226", T: "#18234a", p: "#22325f", P: "#2d5f8f", // circuito de la mesa
  j: "#070a16", // tinta de los marcos
});

// Losa: base, bisel de luz arriba e izquierda, sombra y junta abajo y derecha.
const slab = (name, [base, hi, lo, deep], ...marks) => sprite(name, { w: 16, h: 16 },
  rect(0, 0, 16, 16, base),
  hline(0, 0, 15, hi), vline(0, 0, 15, hi),
  hline(1, 14, 15, lo), vline(14, 1, 14, lo),
  hline(0, 15, 16, deep), vline(15, 0, 16, deep),
  ...marks.flatMap((m) => m({ base, hi, lo, deep })),
);
const LIGHT = ["a", "A", "c", "C"], DARK = ["d", "D", "e", "E"];

// Remache: cabeza con su luz arriba a la izquierda y su sombra abajo a la derecha.
const rivet = (x, y, t) => [px(x, y, t.hi), px(x + 1, y + 1, t.deep), px(x + 1, y, t.lo), px(x, y + 1, t.lo)];
const RIVETS = [[2, 2], [12, 2], [2, 12], [12, 12]];
const rivets = (skip = -1) => (t) => RIVETS.flatMap(([x, y], i) => (i === skip ? [] : rivet(x, y, t)));

// Placa clara: cuatro remaches. Variante con la quemadura de un disparo, y otra con un remache
// saltado (queda el agujero) y el rayón que dejó al salir.
const burn = (t) => [rect(8, 7, 3, 2, "q"), px(9, 6, "q"), px(7, 8, "q"), px(9, 9, "q"), px(9, 7, t.deep), px(9, 8, t.lo), px(11, 7, t.lo)];
const lost = (t) => [px(12, 12, t.deep), px(13, 12, t.lo), px(12, 13, t.lo), px(13, 13, t.hi),
  px(11, 11, t.lo), px(10, 11, t.lo), px(9, 10, t.lo), px(8, 10, t.lo), px(10, 10, t.hi)];
slab("tile-a", LIGHT, rivets());
slab("tile-a2", LIGHT, rivets(), burn);
slab("tile-a3", LIGHT, rivets(3), lost);

// Panel oscuro: un marco hundido. Variante con la rejilla de ventilación, y otra con el piloto
// de estado encendido y una grieta que sale de él.
const inset = (t) => [hline(3, 3, 10, t.deep), vline(3, 3, 10, t.deep), hline(4, 12, 9, t.hi), vline(12, 4, 9, t.hi)];
const vent = (t) => [...[5, 7, 9].map((y) => hline(5, y, 6, t.deep)), ...[5, 7, 9].map((y) => hline(5, y + 1, 6, t.hi))];
const led = (t) => [px(5, 5, "n"), px(6, 5, "N"), px(5, 6, "n"), px(6, 6, "n"), px(7, 7, t.deep), px(8, 8, t.deep), px(8, 9, t.deep), px(9, 10, t.deep), px(8, 7, t.hi), px(9, 9, t.hi)];
slab("tile-b", DARK, inset);
slab("tile-b2", DARK, inset, vent);
slab("tile-b3", DARK, inset, led);

// Mesa: placa de circuito. Pistas que cruzan los bordes por el mismo sitio del lado contrario,
// con sus soldaduras; un único nodo encendido. Todo muy apagado: encima va el texto claro.
sprite("table", { w: 32, h: 32 },
  rect(0, 0, 32, 32, "t"),
  // pista ancha que baja y sube en diagonal
  hline(0, 6, 10, "T"), line(9, 6, 13, 10, "T"), hline(13, 10, 10, "T"), line(22, 10, 26, 6, "T"), hline(26, 6, 6, "T"),
  // pista vertical que empalma arriba y abajo
  vline(4, 26, 6, "T"), vline(4, 0, 3, "T"), px(4, 3, "p"), px(4, 25, "p"),
  // ramal que baja hasta el borde y vuelve a salir arriba hasta la pista ancha
  hline(15, 18, 10, "T"), line(24, 18, 28, 22, "T"), vline(28, 22, 10, "T"), vline(28, 0, 6, "T"), px(15, 18, "p"), px(28, 6, "p"),
  // pista corta con sus soldaduras
  hline(9, 25, 11, "T"), px(9, 25, "p"), px(19, 25, "p"),
  // nodo encendido en el cruce
  rect(12, 9, 3, 3, "p"), px(13, 10, "P"),
  // chip
  rect(17, 13, 5, 3, "T"), px(18, 12, "T"), px(20, 12, "T"), px(18, 16, "T"), px(20, 16, "T"),
);

// Marcos de la interfaz, en nueve partes (esquinas de 4×4): el CSS los estira por los lados y el
// relleno lo pone el color del panel o del botón. Luz y sombra translúcidas, esquinas escalonadas.
const H = "#ffffff66", L = "#00000040";
const frame = (name, ...extra) => sprite(name, { w: 12, h: 12 },
  hline(2, 0, 8, "j"), hline(2, 11, 8, "j"), vline(0, 2, 8, "j"), vline(11, 2, 8, "j"),
  px(1, 1, "j"), px(10, 1, "j"), px(1, 10, "j"), px(10, 10, "j"),
  hline(2, 1, 8, H), vline(1, 2, 7, H), hline(2, 10, 8, L), vline(10, 2, 8, L), px(1, 9, L),
  ...extra,
);
// Panel: un piloto cian en cada esquina, como los de las consolas de la estación.
frame("panel", px(2, 2, "n"), px(9, 2, "n"), px(2, 9, "n"), px(9, 9, "n"));
frame("boton");

sheet("fondos", ["tile-*", "table", "panel", "boton"], { pad: 2 });
