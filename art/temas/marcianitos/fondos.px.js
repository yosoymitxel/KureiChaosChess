// Fondos del tema "Marcianitos": el suelo de Marte y el cielo de noche. Losas de 16×16 de roca
// rojiza (clara y oscura) con bisel de luz arriba a la izquierda y la junta abajo a la derecha; las
// variantes llevan un cráter pequeño o una piedra con su sombra, nada de ruido. La mesa es un
// cielo nocturno de 32×32 con estrellas de píxel que empalma consigo mismo.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/marcianitos/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#d99a76", A: "#e8b392", c: "#c4805e", C: "#a26446", // roca clara (--tile-a)
  d: "#a65640", D: "#b8684e", e: "#8e4634", E: "#6c3226", // roca oscura (--tile-b)
  n: "#0e0a1e", // cielo
  s: "#ffffff", S: "#b8aee0", t: "#6a5ea0", // estrellas: brillante, media y lejana
  l: "#b4ec4c", // verde marciano (remaches del panel)
  j: "#1a1030", // tinta de los marcos
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

// Lisa: dos granos de arena gruesa, cada uno con su luz encima.
const plain = (t) => [px(4, 5, t.lo), px(4, 4, t.hi), px(10, 10, t.lo), px(10, 9, t.hi)];
// Cráter pequeño: el borde de fuera se ilumina arriba a la izquierda y se ensombrece abajo a la
// derecha; por dentro es al revés (la pared de arriba hace sombra en el fondo).
const crater = (cx, cy, r) => (t) => {
  const ul = (x, y) => x - cx + (y - cy) < 0;
  return [
    clip(ul, ring(cx, cy, r, t.hi)), clip((x, y) => !ul(x, y), ring(cx, cy, r, t.lo)),
    clip(ul, circ(cx, cy, r - 1, t.deep)), clip((x, y) => !ul(x, y), circ(cx, cy, r - 1, t.lo)),
    clip((x, y) => x - cx + (y - cy) > 0, ring(cx, cy, r - 1, t.hi)), px(cx, cy, t.lo),
  ];
};
// Piedra suelta con su luz y la sombra que echa abajo a la derecha, y un craterito al lado.
const rock = (t) => [
  rect(4, 9, 3, 2, t.lo), hline(4, 9, 2, t.hi), px(6, 9, t.base), px(5, 11, t.deep), px(6, 11, t.deep), px(7, 10, t.deep), px(7, 11, t.deep),
  ...crater(11, 5, 2)(t),
];

slab("tile-a", LIGHT, plain);
slab("tile-a2", LIGHT, crater(8, 7, 3), (t) => [px(3, 12, t.lo), px(3, 11, t.hi)]);
slab("tile-a3", LIGHT, rock);
slab("tile-b", DARK, plain);
slab("tile-b2", DARK, crater(8, 7, 3), (t) => [px(3, 12, t.lo), px(3, 11, t.hi)]);
slab("tile-b3", DARK, rock);

// Mesa: cielo de noche de 32×32. Pocas estrellas y la cruz no llega al borde, así el mosaico empalma
// sin costuras: una cruz brillante, algunas medias y varias lejanas.
const star = (x, y) => [px(x, y, "s"), px(x - 1, y, "S"), px(x + 1, y, "S"), px(x, y - 1, "S"), px(x, y + 1, "S"), px(x - 2, y, "t"), px(x + 2, y, "t"), px(x, y - 2, "t"), px(x, y + 2, "t")];
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "n"),
  ...star(8, 9),
  px(22, 4, "s"), px(26, 20, "s"), px(14, 25, "S"), px(3, 19, "S"), px(19, 14, "S"),
  px(29, 8, "t"), px(12, 3, "t"), px(6, 29, "t"), px(23, 28, "t"), px(16, 18, "t"), px(1, 2, "t"), px(30, 31, "t"),
);

// Marcos de la interfaz, en nueve partes (esquinas de 4×4): el CSS los estira por los lados y el
// relleno lo pone el color del panel o del botón. Luz y sombra translúcidas. Esquinas escalonadas.
const H = "#ffffff66", L = "#00000040";
const frame = (name, ...extra) => sprite(name, { w: 12, h: 12 },
  hline(2, 0, 8, "j"), hline(2, 11, 8, "j"), vline(0, 2, 8, "j"), vline(11, 2, 8, "j"),
  px(1, 1, "j"), px(10, 1, "j"), px(1, 10, "j"), px(10, 10, "j"),
  hline(2, 1, 8, H), vline(1, 2, 7, H), hline(2, 10, 8, L), vline(10, 2, 8, L), px(1, 9, L),
  ...extra,
);
// Panel: un remache verde marciano en cada esquina.
frame("panel", px(2, 2, "l"), px(9, 2, "l"), px(2, 9, "l"), px(9, 9, "l"));
frame("boton");
