// Fondos del tema "Michis": el suelo del salón y la pared. Losas de 16×16 de parquet tibio (miel y
// nogal) en dos tablas con su junta, luz arriba y sombra abajo; las variantes llevan una huella de
// gato, un ovillo de lana o una raspa de pescado, nada de ruido. La mesa es papel pintado oscuro
// de 32×32, con rayas finas y cabecitas de gato en tresbolillo, que empalma consigo mismo.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/gatos/fondos.px.js  &&  node tools/pixel-art.mjs

pal({
  a: "#e8c592", A: "#f4d8a8", c: "#d4ab76", C: "#b88a56", // parquet de miel (--tile-a)
  d: "#a86a42", D: "#ba7c52", e: "#95593a", E: "#754229", // parquet de nogal (--tile-b)
  u: "#f06aa8", U: "#a83a74", // lana
  s: "#f6eedc", S: "#cfc2a6", // raspa
  n: "#2a1b24", N: "#33232d", m: "#433040", // papel pintado
  p: "#f48aa0", // almohadillas (marco)
  j: "#24161c", // tinta de los marcos
});

// Losa de parquet de tres tablas largas: canto de luz arriba, junta suave abajo y una veta corta
// en cada una. Las claras van tumbadas y las oscuras de pie, como un parquet de cestería: así el
// tablero se lee por la dirección de la madera además de por el tono.
const slab = (name, [base, hi, lo, deep], vertical, ...marks) => {
  const h = (x, y, n, c) => vertical ? vline(y, x, n, c) : hline(x, y, n, c);
  return sprite(name, { w: 16, h: 16 },
    rect(0, 0, 16, 16, base),
    ...[[0, 4, 3], [5, 9, 9], [10, 15, 5]].flatMap(([top, joint, g]) => [
      h(0, top, 16, hi), h(0, joint, 16, joint === 15 ? deep : lo), h(g, top + 2, 4, lo),
    ]),
    ...marks.flatMap((m) => m({ base, hi, lo, deep })),
  );
};
const LIGHT = ["a", "A", "c", "C"], DARK = ["d", "D", "e", "E"];

// Huella de gato: almohadilla y cuatro deditos, en el tono de la veta.
const paw = (x, y) => (t) => [
  rect(x + 1, y + 3, 3, 2, t.lo), px(x + 2, y + 5, t.lo),
  px(x, y + 1, t.lo), px(x + 1, y, t.lo), px(x + 3, y, t.lo), px(x + 4, y + 1, t.lo),
];
// Ovillo de lana con su hebra.
const yarn = () => [
  circ(7, 11, 2, "u"), px(6, 10, "#f8a8cc"), line(6, 13, 8, 9, "U"), px(9, 12, "U"),
  line(9, 13, 13, 13, "u"), px(14, 12, "u"),
];
// Raspa de pescado: cabeza, espina, costillas y cola.
const bone = () => [
  rect(3, 10, 2, 3, "s"), px(3, 10, "S"), hline(5, 11, 7, "s"),
  ...[6, 8, 10].flatMap((x) => [px(x, 10, "s"), px(x, 12, "s")]), px(4, 11, "S"),
  px(12, 10, "s"), px(12, 12, "s"), px(13, 9, "s"), px(13, 13, "s"),
];

slab("tile-a", LIGHT, false);
slab("tile-a2", LIGHT, false, paw(5, 1), paw(9, 9));
slab("tile-a3", LIGHT, false, () => yarn());
slab("tile-b", DARK, true);
slab("tile-b2", DARK, true, paw(5, 1), paw(9, 9));
slab("tile-b3", DARK, true, () => bone());

// Mesa: papel pintado de 32×32 con dos rayas finas y dos cabecitas de gato en tresbolillo; nada
// toca el borde salvo las rayas, que lo cruzan enteras, así el mosaico empalma sin costuras.
const cat = (x, y) => [
  rect(x, y + 2, 5, 3, "m"), px(x, y + 1, "m"), px(x + 4, y + 1, "m"), px(x + 1, y + 2, "m"), px(x + 3, y + 2, "m"),
  px(x + 1, y + 3, "n"), px(x + 3, y + 3, "n"),
];
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "n"),
  vline(0, 0, 32, "N"), vline(16, 0, 32, "N"),
  ...cat(6, 5), ...cat(22, 21),
  px(8, 22, "N"), px(24, 6, "N"),
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
// Panel: una almohadilla rosa en cada esquina.
frame("panel", px(2, 2, "p"), px(9, 2, "p"), px(2, 9, "p"), px(9, 9, "p"));
frame("boton");
