// Fondos del tema "Piratas": las losas son tablones de cubierta y la mesa es el mar de noche.
// Losas de 16×16 con tres tablones a lo largo, junta oscura entre ellos, clavos en las testas y
// la veta de la madera; bisel de luz arriba a la izquierda y junta abajo a la derecha. Las marcas
// tienen causa (veta, nudo, empalme con clavos), nada de ruido. El mar es de 32×32 y empalma
// consigo mismo por los cuatro lados.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/piratas/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#d6ae7a", A: "#e6c497", c: "#bf9462", C: "#93683f", // tablón claro (--tile-a)
  d: "#9a6a42", D: "#ad7d52", e: "#83583a", E: "#5e3d26", // tablón oscuro (--tile-b)
  j: "#0c1626", r: "#13223a", R: "#192d4b", z: "#24406a", Z: "#33577f", // mar de noche
});

// Tablón: base, bisel, las dos juntas entre tablones con su canto de luz, y los clavos.
const plank = (name, [base, hi, lo, deep], ...marks) => sprite(name, { w: 16, h: 16 },
  rect(0, 0, 16, 16, base),
  hline(0, 0, 15, hi), vline(0, 0, 15, hi),
  ...[5, 10].flatMap((y) => [hline(0, y, 15, deep), hline(1, y + 1, 13, hi)]),
  hline(1, 14, 15, lo), vline(14, 1, 14, lo),
  hline(0, 15, 16, deep), vline(15, 0, 16, deep),
  // clavos en las testas de cada tablón
  ...[2, 7, 12].flatMap((y) => [px(2, y + 1, deep), px(12, y + 1, deep)]),
  ...marks.flatMap((m) => m({ base, hi, lo, deep })),
);
const LIGHT = ["a", "A", "c", "C"], DARK = ["d", "D", "e", "E"];

// Lisa: la veta corre a lo largo de cada tablón.
const grain = (t) => [hline(4, 2, 5, t.lo), hline(7, 8, 4, t.lo), hline(4, 12, 3, t.lo), hline(9, 13, 3, t.lo)];
// Nudo de la madera con la veta que lo rodea.
const knot = (t) => [hline(4, 2, 5, t.lo), hline(3, 12, 4, t.lo),
  px(8, 8, t.deep), px(9, 8, t.deep), px(7, 8, t.lo), px(10, 8, t.lo), hline(8, 7, 2, t.lo), hline(5, 7, 2, t.lo), hline(11, 9, 2, t.lo), hline(8, 9, 2, t.hi)];
// Empalme: el tablón del centro está hecho de dos piezas, con sus clavos a cada lado.
const joint = (t) => [hline(4, 2, 5, t.lo), hline(9, 13, 3, t.lo), vline(8, 6, 4, t.deep), vline(9, 7, 3, t.hi), px(6, 8, t.deep), px(11, 8, t.deep), px(4, 8, t.lo)];

plank("tile-a", LIGHT, grain);
plank("tile-a2", LIGHT, knot);
plank("tile-a3", LIGHT, joint);
plank("tile-b", DARK, grain);
plank("tile-b2", DARK, knot);
plank("tile-b3", DARK, joint);

// Mesa: mar de noche. Franjas de mar de fondo más claras y crestas de ola con su lomo, puestas
// en hileras alternas que se repiten cada 32 px; todo se dibuja con vuelta para que empalme.
const wave = (c, x0, y0) => {
  const at = (x, y, k) => c.px(((x0 + x) % 32 + 32) % 32, ((y0 + y) % 32 + 32) % 32, k);
  [[2, 0], [3, 0], [4, 0]].forEach(([x, y]) => at(x, y, "Z"));
  [[1, 1], [5, 1], [0, 2], [6, 2]].forEach(([x, y]) => at(x, y, "z"));
  [[-2, 2], [-1, 2], [7, 2], [8, 2], [1, 2], [5, 2]].forEach(([x, y]) => at(x, y, "R"));
};
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "r"),
  ...[1, 9, 17, 25].map((y) => hline(0, y + 5, 32, "j")),
  (c) => {
    [[3, 1], [19, 1], [11, 9], [27, 9], [5, 17], [21, 17], [13, 25], [29, 25]].forEach(([x, y]) => wave(c, x, y));
  },
);

// Marcos de la interfaz, en nueve partes (esquinas de 4×4): el CSS los estira por los lados y el
// relleno lo pone el color del panel o del botón. La luz y la sombra son translúcidas por eso
// mismo. Esquinas escalonadas, nada redondo.
const H = "#ffffff66", L = "#00000040", INK = "#1e1a26";
const frame = (name, ...extra) => sprite(name, { w: 12, h: 12 },
  hline(2, 0, 8, INK), hline(2, 11, 8, INK), vline(0, 2, 8, INK), vline(11, 2, 8, INK),
  px(1, 1, INK), px(10, 1, INK), px(1, 10, INK), px(10, 10, INK),
  hline(2, 1, 8, H), vline(1, 2, 7, H), hline(2, 10, 8, L), vline(10, 2, 8, L), px(1, 9, L),
  ...extra,
);
// Panel: clavos de latón en las esquinas, como en las cajas de a bordo.
const nail = (x, y) => [px(x, y, "#ecc456"), px(x + (x < 6 ? 1 : -1), y + (y < 6 ? 1 : -1), "#a97b28")];
frame("panel", ...nail(2, 2), ...nail(9, 2), ...nail(2, 9), ...nail(9, 9));
frame("boton");

// Muestra de control (va a out/scenes, el importador no la lee): la mesa en mosaico y el damero.
scene("muestra", { w: 96, h: 64 },
  tile("table", 0, 0, 3, 2),
  ...[0, 1, 2, 3].flatMap((i) => [0, 1].map((j) => stamp(((i + j) % 2 ? "tile-b" : "tile-a") + (["", "2", "3"][(i * 2 + j) % 3]), 16 + i * 16, 16 + j * 16))),
);
