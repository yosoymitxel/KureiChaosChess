// Fondos del tema "Pixelada": las losas del tablero y el ladrillo de la mesa. Losas de 16×16 que el
// CSS estira a la casilla (cada píxel de arte queda del tamaño de los de las piezas), con bisel de
// luz arriba a la izquierda y la junta abajo a la derecha; las marcas tienen causa (grieta, esquina
// gastada, desgaste del paso), nada de ruido. El ladrillo es de 32×32 y empalma consigo mismo.
// Reconstruir:  node <pxl>/bin/pxl.js build art/fondos/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#dcc49a", A: "#ead8b2", c: "#c7ab7c", C: "#a68b60", // losa clara (--tile-a)
  d: "#b08b5e", D: "#c09d70", e: "#977550", E: "#735737", // losa oscura (--tile-b)
  r: "#3a3047", R: "#463a55", z: "#352b41", J: "#2f2639", j: "#221b2b", // ladrillo ciruela y junta
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

// Lisa, con dos poros de la piedra.
const plain = (t) => [px(5, 4, t.lo), px(10, 10, t.lo), px(10, 9, t.hi)];
// Grieta que baja desde la esquina de arriba a la derecha, con su luz al lado.
const crack = (t) => [px(13, 1, t.deep), px(12, 2, t.deep), px(12, 3, t.deep), px(11, 4, t.deep), px(10, 5, t.deep), px(10, 6, t.lo), px(13, 2, t.hi), px(12, 4, t.hi)];
// Esquina de abajo a la izquierda gastada por los pasos.
const chip = (t) => [px(0, 13, t.lo), px(0, 14, t.deep), px(1, 14, t.deep), px(1, 13, t.lo), px(4, 6, t.lo)];

slab("bg-tile-a", LIGHT, plain);
slab("bg-tile-a2", LIGHT, crack);
slab("bg-tile-a3", LIGHT, chip);
slab("bg-tile-b", DARK, plain);
slab("bg-tile-b2", DARK, crack);
slab("bg-tile-b3", DARK, chip);

// Mesa: ladrillos de 16×8 a soga, cada hilada corrida media pieza. Luz en el canto de arriba,
// sombra en el de abajo; algunos ladrillos un tono más hondo para que el muro no parezca papel.
const bricks = [];
for (let row = 0; row < 4; row++) {
  const y = row * 8, off = row % 2 ? 8 : 0;
  for (let i = -1; i < 2; i++) {
    const x = i * 16 + off, base = (row + i) % 3 === 0 ? "z" : "r";
    bricks.push(rect(x, y, 15, 7, base), hline(x, y, 15, "R"), hline(x, y + 6, 15, "J"));
  }
  bricks.push(hline(0, y + 7, 32, "j"));
  for (let x = off - 1; x < 32; x += 16) if (x >= 0) bricks.push(vline(x, y, 7, "j"));
}
sprite("bg-table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "j"), ...bricks);
