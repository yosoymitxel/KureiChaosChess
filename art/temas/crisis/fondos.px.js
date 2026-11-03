// Fondos del tema "Crisis Financiera": mármol de sucursal sucio (claras), moqueta verde dinero
// gastada (oscuras) y, de mesa, el suelo de terrazo negro con papeles. Losas de 16×16; mesa 32×32.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/crisis/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#b9c2bd", A: "#cfd7d2", c: "#9aa59f", C: "#76827b",
  d: "#2f4a3c", D: "#3a5a49", e: "#253c30", E: "#18241e",
  r: "#121614", R: "#1a201d", z: "#222a26", j: "#0b0e0c",
  p: "#d8d5c6", g: "#3fd47a", x: "#ff4a5a",
});

const slab = (name, [base, hi, lo, deep], ...marks) => sprite(name, { w: 16, h: 16 },
  rect(0, 0, 16, 16, base),
  hline(0, 0, 15, hi), vline(0, 0, 15, hi),
  hline(1, 14, 15, lo), vline(14, 1, 14, lo),
  hline(0, 15, 16, deep), vline(15, 0, 16, deep),
  ...marks.flatMap((m) => m({ base, hi, lo, deep })),
);
const LIGHT = ["a", "A", "c", "C"], DARK = ["d", "D", "e", "E"];

// Veta del mármol, en diagonal.
const vein = (t) => [px(3, 3, t.lo), px(4, 4, t.lo), px(5, 4, t.lo), px(6, 5, t.lo), px(8, 7, t.lo), px(9, 8, t.lo)];
// Grieta desde la esquina, de cuando se llevaron la caja fuerte.
const crack = (t) => [...vein(t), px(13, 1, t.deep), px(12, 2, t.deep), px(12, 3, t.deep), px(11, 4, t.deep), px(10, 5, t.deep)];
// Recibo caído con una cifra en rojo.
const receipt = (t) => [...vein(t), ...[0, 1, 2, 3, 4].map((i) => hline(8, 8 + i, 5, "p")), hline(9, 9, 3, t.lo), hline(9, 11, 2, "x")];
// Moqueta: el pelo cepillado en bandas.
const nap = (t) => [hline(2, 4, 4, t.hi), hline(9, 10, 4, t.hi)];
// Mancha de café del último ejecutivo.
const stain = (t) => [...nap(t), px(6, 7, t.lo), px(7, 7, t.lo), px(5, 8, t.lo), px(8, 8, t.lo), px(6, 9, t.lo), px(7, 9, t.lo)];
// Billete pisado.
const bill = (t) => [...nap(t), rect(4, 6, 7, 4, "g"), px(7, 7, t.base), px(7, 8, t.base)];

slab("tile-a", LIGHT, vein);
slab("tile-a2", LIGHT, crack);
slab("tile-a3", LIGHT, receipt);
slab("tile-b", DARK, nap);
slab("tile-b2", DARK, stain);
slab("tile-b3", DARK, bill);

// Mesa: terrazo negro en baldosas de 16 con su junta; empalma por los cuatro lados.
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "r"), (c) => {
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    if (x % 16 === 15 || y % 16 === 15) c.px(x, y, "j");
    else if ((x + y) % 16 === 0 && (x * 7 + y * 3) % 5 === 0) c.px(x, y, "z");
  }
  c.rect(0, 0, 15, 15, "R");
  c.rect(16, 16, 15, 15, "R");
  c.px(5, 9, "z"); c.px(22, 4, "z"); c.px(26, 25, "z"); c.px(10, 21, "z");
});

const H = "#ffffff55", L = "#00000040", INK = "#101412";
const frame = (name, ...extra) => sprite(name, { w: 12, h: 12 },
  hline(2, 0, 8, INK), hline(2, 11, 8, INK), vline(0, 2, 8, INK), vline(11, 2, 8, INK),
  px(1, 1, INK), px(10, 1, INK), px(1, 10, INK), px(10, 10, INK),
  hline(2, 1, 8, H), vline(1, 2, 7, H), hline(2, 10, 8, L), vline(10, 2, 8, L), px(1, 9, L),
  ...extra,
);
// Panel: esquinas de recibo con un píxel verde de pantalla, como un ticket de cajero.
frame("panel", px(2, 2, "#3fd47a"), px(9, 2, "#3fd47a"), px(2, 9, "#3fd47a"), px(9, 9, "#3fd47a"));
frame("boton");
