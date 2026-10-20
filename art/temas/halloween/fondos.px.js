// Fondos del tema "Halloween": losas de lápida clara y de tierra con musgo para el tablero, y la
// piedra morada de la cripta para la mesa. Losas de 16×16 con bisel de luz arriba a la izquierda y
// junta abajo a la derecha; cada marca tiene causa (grieta, epitafio grabado, musgo en la esquina
// húmeda, hoja seca caída). La mesa es de 32×32 y empalma consigo misma.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/halloween/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#aba7b6", A: "#c2bfcc", c: "#928ea0", C: "#76728a", // lápida (--tile-a)
  d: "#584a3c", D: "#6a5a4a", e: "#4a3e32", E: "#3a3028", // tierra (--tile-b)
  v: "#6f8a46", V: "#4f6a36", // musgo
  l: "#d9792a", L: "#9c4a1c", // hoja seca
  r: "#2b2136", R: "#3a2e48", z: "#31263e", J: "#241b2e", j: "#18111f", // piedra de cripta y junta
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

// Lisa, con dos poros.
const plain = (t) => [px(5, 4, t.lo), px(10, 10, t.lo), px(10, 9, t.hi)];
// Grieta que baja desde la esquina de arriba a la derecha, con su luz al lado.
const crack = (t) => [px(13, 1, t.deep), px(12, 2, t.deep), px(12, 3, t.deep), px(11, 4, t.deep), px(10, 5, t.deep), px(10, 6, t.lo), px(13, 2, t.hi), px(12, 4, t.hi)];
// Epitafio gastado: dos renglones grabados, con la luz en el borde de abajo del surco.
const epitaph = (t) => [hline(4, 5, 8, t.lo), hline(4, 6, 8, t.hi), hline(5, 8, 6, t.lo), hline(5, 9, 6, t.hi), px(4, 8, t.lo)];
// Musgo que crece en la esquina húmeda de abajo a la izquierda.
const moss = () => [rect(1, 11, 3, 3, "V"), rect(1, 12, 2, 2, "v"), px(4, 13, "V"), px(1, 10, "V"), px(2, 11, "v")];
// Hoja seca caída, con su rabito.
const leaf = () => [poly([8, 5, 12, 6, 11, 9, 7, 8], "l"), line(8, 8, 11, 6, "L"), px(6, 9, "L")];

slab("tile-a", LIGHT, plain);
slab("tile-a2", LIGHT, crack);
slab("tile-a3", LIGHT, epitaph);
slab("tile-b", DARK, plain);
slab("tile-b2", DARK, moss);
slab("tile-b3", DARK, leaf);

// Mesa: piedra de cripta en hiladas de 8 de alto, con sillares de largo distinto en cada hilada.
// Luz en el canto de arriba, sombra en el de abajo; algunos sillares un tono distinto.
const ROWS = [[12, 10, 10], [7, 13, 12], [10, 12, 10], [14, 9, 9]], OFF = [0, 5, 9, 3];
const stones = [];
ROWS.forEach((widths, row) => {
  const y = row * 8;
  let x = OFF[row];
  widths.forEach((wd, i) => {
    const base = (row + i) % 3 === 1 ? "z" : "r";
    for (const dx of [0, -32]) { // cada sillar dos veces, para que empalme por los lados
      const sx = x + dx;
      stones.push(rect(sx, y, wd - 1, 7, base), hline(sx, y, wd - 1, "R"), hline(sx, y + 6, wd - 1, "J"), vline(sx + wd - 1, y, 7, "j"));
    }
    x += wd;
  });
  stones.push(hline(0, y + 7, 32, "j"));
});
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "j"), ...stones);

// Marcos de la interfaz, en nueve partes (esquinas de 4×4): el CSS los estira por los lados y el
// relleno lo pone el color del panel o del botón. Luz y sombra translúcidas; esquinas escalonadas.
const H = "#ffffff66", L = "#00000040";
const frame = (name, ...extra) => sprite(name, { w: 12, h: 12 },
  hline(2, 0, 8, "j"), hline(2, 11, 8, "j"), vline(0, 2, 8, "j"), vline(11, 2, 8, "j"),
  px(1, 1, "j"), px(10, 1, "j"), px(1, 10, "j"), px(10, 10, "j"),
  hline(2, 1, 8, H), vline(1, 2, 7, H), hline(2, 10, 8, L), vline(10, 2, 8, L), px(1, 9, L),
  ...extra,
);
// Panel: telarañas en las esquinas de arriba y un clavo de calabaza en las de abajo.
const WEB = "#e4e0cfaa";
frame("panel",
  px(2, 2, WEB), px(3, 2, WEB), px(2, 3, WEB), px(9, 2, WEB), px(8, 2, WEB), px(9, 3, WEB),
  px(2, 9, "#d9792a"), px(9, 9, "#d9792a"),
);
frame("boton");
