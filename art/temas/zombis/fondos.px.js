// Fondos del tema "Zombis": la acera y el asfalto de una ciudad abandonada, y una valla metálica de
// noche para la mesa. Losas de 16×16 con bisel (luz arriba a la izquierda, junta abajo a la
// derecha) y marcas con causa: grieta, mancha de baba verde, la raya pintada de la carretera y un
// hierbajo que asoma por una grieta. La valla es un rombo de alambre de 8 que empalma solo.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/zombis/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#b7b6a2", A: "#cbcab7", c: "#a09f8b", C: "#7f7e6b", // losa de acera (--tile-a)
  d: "#686d68", D: "#787d77", e: "#575c58", E: "#3f4440", // asfalto (--tile-b)
  v: "#86b746", V: "#5d8c31", u: "#aed66c", // baba y hierbajo
  y: "#d8b84c", Y: "#a68a34", // pintura de la carretera
  j: "#1c211d", J: "#2c332d", l: "#323a33", L: "#3f4840", // valla de noche
});

const slab = (name, [base, hi, lo, deep], ...marks) => sprite(name, { w: 16, h: 16 },
  rect(0, 0, 16, 16, base),
  hline(0, 0, 15, hi), vline(0, 0, 15, hi),
  hline(1, 14, 15, lo), vline(14, 1, 14, lo),
  hline(0, 15, 16, deep), vline(15, 0, 16, deep),
  ...marks.flatMap((m) => m({ base, hi, lo, deep })),
);
const LIGHT = ["a", "A", "c", "C"], DARK = ["d", "D", "e", "E"];

// Acera lisa: dos poros del hormigón.
const pores = (t) => [px(4, 5, t.lo), px(11, 10, t.lo), px(11, 9, t.hi)];
// Grieta que baja desde la esquina de arriba a la derecha y se abre en dos.
const crack = (t) => [
  px(13, 1, t.deep), px(12, 2, t.deep), px(12, 3, t.deep), px(11, 4, t.deep), px(10, 5, t.deep), px(10, 6, t.deep),
  px(9, 7, t.deep), px(11, 6, t.lo), px(12, 7, t.lo), px(13, 2, t.hi), px(13, 4, t.hi), px(11, 7, t.hi),
];
// Charco de baba verde que ha dejado un zombi al pasar, con su brillo arriba a la izquierda.
const goo = () => [
  ellipse(7, 9, 3, 2, "V"), ellipse(7, 9, 2, 1, "v"), px(5, 8, "u"), px(6, 8, "u"),
  px(12, 10, "V"), px(11, 6, "V"), px(3, 11, "V"), hline(6, 11, 2, "V"),
];
// Raya discontinua de la carretera, gastada por las ruedas.
const line = () => [
  rect(2, 6, 12, 3, "y"), hline(2, 8, 12, "Y"), px(5, 7, "d"), px(6, 6, "d"), px(10, 8, "d"), px(11, 7, "D"), px(13, 6, "D"),
];
// Grieta del asfalto con un hierbajo que sale por ella.
const weed = (t) => [
  px(2, 12, t.deep), px(3, 11, t.deep), px(4, 11, t.deep), px(5, 10, t.deep), px(6, 10, t.deep), px(7, 9, t.deep), px(8, 9, t.deep),
  px(4, 12, t.hi), px(6, 11, t.hi),
  vline(5, 7, 3, "V"), px(4, 8, "v"), px(3, 7, "v"), px(6, 7, "v"), px(7, 6, "u"), px(5, 6, "u"),
];

slab("tile-a", LIGHT, pores);
slab("tile-a2", LIGHT, crack);
slab("tile-a3", LIGHT, goo);
slab("tile-b", DARK, (t) => [px(4, 4, t.lo), px(11, 11, t.lo), px(9, 3, t.hi)]);
slab("tile-b2", DARK, line);
slab("tile-b3", DARK, weed);

// Mesa: valla de alambre de rombos de noche, sobre negro verdoso. Un sentido del alambre algo
// más claro que el otro (le da la luz) y los nudos donde se cruzan un punto más claros.
sprite("table", { w: 32, h: 32 }, (c) => {
  c.rect(0, 0, 32, 32, "j");
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const a = (x + y) % 8 === 0, b = (x - y + 32) % 8 === 4;
    if (a && b) c.px(x, y, "L");
    else if (a) c.px(x, y, "l");
    else if (b) c.px(x, y, "J");
  }
});

// Marcos de la interfaz, en nueve partes (esquinas de 4×4), interior transparente.
const H = "#ffffff66", S = "#00000040";
const frame = (name, ...extra) => sprite(name, { w: 12, h: 12 },
  hline(2, 0, 8, "j"), hline(2, 11, 8, "j"), vline(0, 2, 8, "j"), vline(11, 2, 8, "j"),
  px(1, 1, "j"), px(10, 1, "j"), px(1, 10, "j"), px(10, 10, "j"),
  hline(2, 1, 8, H), vline(1, 2, 7, H), hline(2, 10, 8, S), vline(10, 2, 8, S), px(1, 9, S),
  ...extra,
);
// Panel: un tornillo en cada esquina, como una chapa clavada a una barricada.
const bolt = (x, y) => [px(x, y, "#c9ced3"), px(x + 1, y, "#8d949c"), px(x, y + 1, "#8d949c"), px(x + 1, y + 1, "#5c626b")];
frame("panel", ...bolt(2, 2), ...bolt(8, 2), ...bolt(2, 8), ...bolt(8, 8));
frame("boton");
