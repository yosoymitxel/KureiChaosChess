// Fondos del tema "Ñandutí": casillas claras de baldosa colonial marfil con un ñandutí sutil (el
// encaje radial de Itauguá), casillas oscuras de ladrillo de tierra colorada de Tobatí, y la mesa,
// un tablón oscuro de lapacho. Losas de 16×16 con bisel de luz arriba a la izquierda y la junta
// abajo a la derecha; las marcas tienen causa (encaje pintado, esquina gastada, grieta, la flor
// de lapacho que cayó encima), nada de ruido. La mesa es de 32×32 y empalma consigo misma.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/paraguay/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#e2d6ba", A: "#f1e8d2", c: "#ccbe9c", C: "#a8987a", // baldosa marfil (--tile-a)
  d: "#8e5440", D: "#a6664e", e: "#784331", E: "#55301f", // ladrillo de tierra colorada (--tile-b)
  r: "#2c1d15", R: "#36251b", z: "#3f2b1f", Z: "#4a3324", j: "#1c120c", // tablón de lapacho y junta
  l: "#e98ab8", L: "#c0568c", y: "#f2c64e", // flor de lapacho caída
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

// Ñandutí pintado en la baldosa: un anillo de 8 puntos alrededor de un centro, apenas marcado.
const nanduti = (t) => [
  px(7, 7, t.lo),
  ...[[7, 4], [10, 7], [7, 10], [4, 7], [5, 5], [9, 5], [9, 9], [5, 9]].map(([x, y]) => px(x, y, t.lo)),
];
// El ñandutí más marcado: rayos desde el centro hasta el anillo, la rueda con sus picos y la luz.
const nandutiFull = (t) => [
  px(7, 7, t.deep), px(7, 6, t.hi), px(6, 7, t.hi),
  ...[[7, 5], [7, 9], [5, 7], [9, 7], [6, 6], [8, 6], [8, 8], [6, 8]].map(([x, y]) => px(x, y, t.lo)),
  ...[[7, 3], [11, 7], [7, 11], [3, 7], [4, 4], [10, 4], [10, 10], [4, 10]].map(([x, y]) => px(x, y, t.lo)),
  ...[[5, 3], [9, 3], [11, 5], [11, 9], [9, 11], [5, 11], [3, 9], [3, 5]].map(([x, y]) => px(x, y, t.lo)),
  px(7, 2, t.deep), px(12, 7, t.deep), px(7, 12, t.deep), px(2, 7, t.deep),
];
// Esquina de abajo a la izquierda gastada por los pasos, con el ñandutí sutil.
const chip = (t) => [...nanduti(t), px(0, 13, t.lo), px(0, 14, t.deep), px(1, 14, t.deep), px(1, 13, t.lo), px(2, 14, t.lo)];

// Ladrillo: las marcas de los dedos del alfarero al sacarlo del molde.
const fingers = (t) => [hline(4, 4, 3, t.lo), hline(5, 5, 2, t.hi), hline(9, 10, 3, t.lo), hline(10, 11, 2, t.hi)];
// Grieta que baja desde la esquina de arriba a la derecha, con su luz al lado.
const crack = (t) => [px(13, 1, t.deep), px(12, 2, t.deep), px(12, 3, t.deep), px(11, 4, t.deep), px(10, 5, t.deep), px(10, 6, t.lo), px(9, 7, t.lo), px(13, 2, t.hi), px(12, 4, t.hi)];
// Flor de lapacho caída: cinco pétalos rosados con el centro amarillo y su sombrita.
const flower = (t) => [hline(4, 4, 3, t.lo),
  px(9, 8, "l"), px(10, 8, "l"), px(8, 9, "l"), px(11, 9, "L"), px(9, 10, "l"), px(10, 10, "L"), px(9, 9, "y"), px(10, 9, "l"),
  px(8, 10, "l"), px(11, 10, "L"), px(10, 11, t.deep), px(11, 11, t.lo), px(12, 10, t.lo)];

slab("tile-a", LIGHT, nanduti);
slab("tile-a2", LIGHT, nandutiFull);
slab("tile-a3", LIGHT, chip);
slab("tile-b", DARK, fingers);
slab("tile-b2", DARK, crack);
slab("tile-b3", DARK, flower);

// Mesa: tablones de lapacho de 8 de alto, a lo ancho. Cada tablón con su luz arriba, su sombra
// abajo, la junta, la veta a lo largo y una testa en un sitio distinto en cada hilada; todo con
// vuelta para que el mosaico empalme por los cuatro lados.
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "r"), (c) => {
  const at = (x, y, k) => c.px(((x % 32) + 32) % 32, ((y % 32) + 32) % 32, k);
  const ends = [5, 21, 13, 29];
  for (let row = 0; row < 4; row++) {
    const y = row * 8, base = row % 2 ? "R" : "r";
    for (let x = 0; x < 32; x++) { for (let i = 1; i < 7; i++) at(x, y + i, base); at(x, y + 1, "z"); at(x, y + 7, "j"); }
    // la veta: dos trazos largos por tablón
    for (let i = 0; i < 9; i++) at(ends[row] + 6 + i, y + 3, "z");
    for (let i = 0; i < 7; i++) at(ends[row] + 18 + i, y + 5, "j");
    // la testa: junta vertical con el canto de luz al lado
    for (let i = 1; i < 7; i++) { at(ends[row], y + i, "j"); at(ends[row] + 1, y + i, "Z"); }
  }
});

// Marcos de la interfaz, en nueve partes (esquinas de 4×4): el CSS los estira por los lados y el
// relleno lo pone el color del panel o del botón. La luz y la sombra son translúcidas por eso
// mismo. Esquinas escalonadas, nada redondo.
const H = "#ffffff66", L = "#00000040", INK = "#1e1612";
const frame = (name, ...extra) => sprite(name, { w: 12, h: 12 },
  hline(2, 0, 8, INK), hline(2, 11, 8, INK), vline(0, 2, 8, INK), vline(11, 2, 8, INK),
  px(1, 1, INK), px(10, 1, INK), px(1, 10, INK), px(10, 10, INK),
  hline(2, 1, 8, H), vline(1, 2, 7, H), hline(2, 10, 8, L), vline(10, 2, 8, L), px(1, 9, L),
  ...extra,
);
// Panel: en cada esquina una florcita de ñandutí: centro rojo y cuatro puntas de encaje blanco.
const lace = (x, y, dx, dy) => [px(x, y, "#a3201c"), px(x + dx, y, "#fffaf0"), px(x, y + dy, "#fffaf0"), px(x + dx, y + dy, "#f2e8d5")];
frame("panel", ...lace(2, 2, 1, 1), ...lace(9, 2, -1, 1), ...lace(2, 9, 1, -1), ...lace(9, 9, -1, -1));
frame("boton");

// Muestra de control (va a out/scenes, el importador no la lee): la mesa en mosaico y el damero.
scene("muestra", { w: 96, h: 64 },
  tile("table", 0, 0, 3, 2),
  ...[0, 1, 2, 3].flatMap((i) => [0, 1].map((j) => stamp(((i + j) % 2 ? "tile-b" : "tile-a") + (["", "2", "3"][(i * 2 + j) % 3]), 16 + i * 16, 16 + j * 16))),
);
