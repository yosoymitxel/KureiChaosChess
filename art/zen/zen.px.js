// Jardín Zen (karesansui) en arte píxel, para la mesa "Pixelada". Una casilla del jardín mide 24×24 y
// el juego la pinta a 1 píxel de arte por unidad. Luz de arriba a la izquierda, contorno de tinta `k`
// de 1 px en todos los objetos, nada de tramado ni ruido: cada marca tiene causa (el labio de la
// maceta, la junta del farol, las vetas del granito, el surco del rastrillo).
// Las plantas van SIN maceta en su propio lienzo de 24×24: nacen en (12, 15), justo sobre la tierra
// de `pot`, y se pintan encima de ella. Los koi van aparte para animarlos sobre el agua del estanque.
// Reconstruir:  node <pxl>/bin/pxl.js build art/zen/zen.px.js

pal({
  k: "#241812", // tinta: contorno y juntas
  1: "#6b4c3b", 2: "#a37d64", 3: "#c49c80", 4: "#e6cdb2", // esmalte de la maceta (canela)
  S: "#2b1c14", s: "#4a3122", z: "#6a4a34", // tierra de la maceta
  G: "#2e5f33", g: "#5a9147", h: "#85ad5a", H: "#b9d37f", // hoja: romero, salvia, musgo, nenúfar
  v: "#587865", V: "#80a28b", i: "#afc8b2", // hoja gris verdosa de la lavanda
  b: "#6c76c2", B: "#a3acea", c: "#d6dafa", // flor del romero (azul lavanda)
  r: "#9a2230", R: "#d73337", e: "#f2735e", // flor de la salvia y rojo del arce
  l: "#66419a", L: "#9b6bce", m: "#c9a2ec", // flor de la lavanda (violeta)
  5: "#4d4944", 6: "#77726b", 7: "#a9a49c", 8: "#cbc7bf", 9: "#ebe8e1", // granito
  w: "#0d3d51", W: "#2a6e7a", x: "#4f9698", X: "#8fcdc4", Y: "#d8f1ea", // agua
  o: "#fdd3d6", O: "#e48c9b", // loto
  a: "#f2823b", A: "#c25a24", y: "#f6eedc", // koi
  t: "#e5ddcd", T: "#cdbfa6", u: "#f6f1e6", // arena rastrillada
  j: "#c4b5a1", J: "#a6957e", f: "#d7cbb9", // tierra sin cavar
  n: "#e98a35", N: "#f6bd5f", // naranja del arce
  Z: "#3e281c", q: "#5a3b2b", Q: "#7a5440", // corteza
  d: "#8f6a2c", D: "#c99a4d", E: "#e8c477", F: "#f8e6ac", // latón
  M: "#8b95a3", I: "#c9d1da", U: "#eef2f6", // acero
  C: "#6b4529", K: "#946640", P: "#b88a5a", // madera
  p: "#8f714a", 0: "#bf9f73", "=": "#dfc597", // arpillera de la bolsita
  $: "#e09a3c", "&": "#ffd36e", "^": "#fff0bf", // luz del farol
});
ramps("k56789", "k1234", "kSsz", "kGghH", "kvVi", "kbBc", "krRe", "klLm", "kwWxXY", "Oo", "Aay", "Ttu", "Jjf",
  "rnN", "kZqQ", "dDEF", "MIU", "CKP", "p0=", "$&^");

// Tramos de fila en coordenadas finales: row(y, "3:2 4-19:3") = x 3 en "2", x 4..19 en "3".
const row = (y, spec) => spec.trim().split(/\s+/).map((seg) => {
  const [xs, col] = seg.split(":");
  const [a, b = a] = xs.split("-").map(Number);
  return hline(a, y, b - a + 1, col);
});
const rows = (y0, ...specs) => specs.flatMap((s, i) => row(y0 + i, s));
// Dentro de un sprite con outline el lienzo crece 1 px por lado: esta capa deja dibujar en
// coordenadas del PNG final.
const F = (...items) => layer("f", { x: -1, y: -1 }, ...items.flat(Infinity));
// Objeto con contorno de lienzo final w×h.
const obj = (name, w, h, ...items) => sprite(name, { w: w - 2, h: h - 2, outline: "k" }, F(...items));

// ── Maceta de bonsái ──────────────────────────────────────────────────────────────────────────
// Esmalte canela, baja: borde trasero, la tierra, el labio con su brillo, la sombra bajo el labio,
// el cuerpo con el reflejo del esmalte a la izquierda y dos patas. 16 px de labio, como la vectorial.
obj("pot", 24, 24,
  ...rows(14,
    "6:1 7-16:2 17:1",
    "5:2 6-17:s 18:1",
    "4:3 5-8:4 9-16:3 17-18:2 19:1",
    "4-16:2 17-19:1",
    "5-18:k",
    "6:2 7:3 8-10:4 11-14:2 15-17:1",
    "6:2 7:3 8-14:2 15-17:1",
    "7-16:1",
    "8-9:1 14-15:1"),
  // tierra: un terrón con luz y dos motas de musgo
  row(15, "7:z 10:g 14:g 16-17:S"),
);

// ── Plantas ───────────────────────────────────────────────────────────────────────────────────
// Cada planta: `under` sin contorno (tallos finos), `over` con contorno, y se borra todo lo que
// quede por debajo de la tierra (y >= 16) para que asiente en la maceta.
const plant = (name, under, over, { outline = true } = {}) => {
  if (outline) sprite(`_${name}-o`, { w: 22, h: 22, outline: "k" }, F(...over));
  else sprite(`_${name}-o`, { w: 24, h: 24 }, ...over.flat(Infinity));
  sprite(name, { w: 24, h: 24 }, ...under.flat(Infinity), stamp(`_${name}-o`, 0, 0), rect(0, 16, 24, 8, "_"));
};
const lerp = (a, b, t) => a + (b - a) * t;

// Romero: cinco ramitas erguidas de agujas apretadas (luz a la izquierda, sombra a la derecha,
// el tallo asomando cada dos filas) separadas por una rendija que cierra el contorno; abajo se
// juntan en la cepa leñosa. Capullo: puntitos claros en las puntas. Flor: florecitas azules a lo
// largo de la mitad de arriba de cada ramita, algunas asomando fuera.
// [y de la punta, centros por fila hasta y = 12]
const ROMERO = [[8, [4, 4, 4, 4, 6]], [4, [8, 8, 8, 8, 8, 8, 8, 8, 9]], [2, [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]],
  [4, [16, 16, 16, 16, 16, 16, 16, 16, 15]], [8, [20, 20, 20, 20, 18]]];
const romero = (stage) => (c) => {
  for (const [ty, xs] of ROMERO) xs.forEach((x, i) => {
    const y = ty + i;
    if (i === 0) { c.px(x, y, "h"); return; }
    c.hline(x - 1, y, 3, "g"); c.px(x - 1, y, "h"); c.px(x + 1, y, "G");
    if (i % 2 === 0) c.px(x, y, "G");
    if (i === 1) c.px(x, y - 1, "H");
    if (stage === "bud" && (i === 1 || i === 3)) c.px(i === 1 ? x + 1 : x - 1, y, "c");
    if (stage === "bloom" && i % 2 === 1 && i < 7) {
      const s = (i >> 1) % 2 ? 1 : -1;
      c.px(x + s, y, "B"); c.px(x + s * 2, y, s < 0 ? "B" : "b"); c.px(x + s, y - 1, s < 0 ? "c" : "B");
    }
  });
  c.hline(6, 13, 13, "G"); c.hline(7, 13, 4, "g"); c.px(8, 13, "h"); c.hline(10, 14, 5, "G"); c.px(10, 14, "g"); c.hline(11, 15, 3, "q");
};
const romeroSprout = (c) => {
  for (const [x, ty] of [[10, 10], [14, 11]]) for (let y = ty; y <= 13; y++) {
    if (y === ty) { c.px(x, y, "h"); continue; }
    c.hline(x - 1, y, 3, "g"); c.px(x - 1, y, "h"); c.px(x + 1, y, "G"); if ((y - ty) % 2 === 0) c.px(x, y, "G");
  }
  c.hline(10, 14, 5, "G"); c.hline(11, 15, 3, "q");
};
plant("romero-sprout", [], [romeroSprout]);
plant("romero-bud", [], [romero("bud")]);
plant("romero-bloom", [], [romero("bloom")]);

// Salvia: roseta de hojas anchas con nervio y una espiga central con verticilos.
// Cada hoja es una pieza con su propio contorno, así se separan unas de otras.
sprite("_sal-big", { outline: "k" }, `
  .hhhhg.
  hgGGGGg
  .gggGG.`);
sprite("_sal-up", { outline: "k" }, `
  hh...
  hgg..
  .gGg.
  ..gGG`);
sprite("_sal-small", { outline: "k" }, `
  .hhg.
  hGGGg
  .ggG.`);
const DIM = { h: "g", g: "G" };
const salviaLeaves = (big) => big
  ? [
    stamp("_sal-up", 6, 7), stamp("_sal-up", 12, 7, { flip: "x", swap: DIM }),
    stamp("_sal-big", 2, 11), stamp("_sal-big", 13, 11, { flip: "x", swap: DIM }),
    row(15, "11-13:G"),
  ]
  : [stamp("_sal-small", 6, 11), stamp("_sal-small", 12, 11, { flip: "x", swap: DIM }), row(15, "11-13:G")];
const SAL_BLOOM = `
  .....e.....
  ....eRr....
  .....r.....
  ...eRRRr...
  ....rGr....
  ..eRRGRRr..
  ...r.G.r...
  .eRRRGRRRr.
  ..r..G..r..
  .....G.....`;
const SAL_BUD = `
  ....r....
  ....g....
  ....G....
  ...hGg...
  ....G....
  ..rhGgr..
  ....G....
  .rhgGgGr.
  ....G....
  ....G....`;
sprite("_sal-bloom", { outline: "k" }, SAL_BLOOM);
sprite("_sal-bud", { outline: "k" }, SAL_BUD);
const salviaSpike = (open) => [stamp(open ? "_sal-bloom" : "_sal-bud", open ? 6 : 7, 1), vline(12, 11, 4, "G"), vline(11, 12, 3, "k"), vline(13, 12, 3, "k")];
// Las hojas y la espiga llevan su propio contorno; sin contorno común para que no se rellenen
// de tinta los huecos entre ellas.
const SAL = { outline: false };
plant("salvia-sprout", [], salviaLeaves(false), SAL);
plant("salvia-bud", [], [...salviaSpike(false), ...salviaLeaves(true)], SAL);
plant("salvia-bloom", [], [...salviaSpike(true), ...salviaLeaves(true)], SAL);

// Lavanda: mata de hojas finas gris verdosas en abanico; tallos altos (sin contorno) con
// espigas de verticilos violetas.
// Hojas: arrancan juntas en la base y se abren hacia arriba, así el contorno cierra los huecos
// entre ellas y cada hoja se lee suelta.
const lavTuft = (h) => [
  ...[[-3, -7, 0.45, "i"], [-2, -5, 0.8, "i"], [-1, -2, 1, "i"], [0, 0, 0.85, "V"], [1, 2, 1, "V"], [2, 5, 0.8, "v"], [3, 7, 0.45, "v"]]
    .map(([d0, d1, k, col]) => line(12 + d0, 15, 12 + d1, 15 - Math.round(h * k), col)),
];
const LAV = [[5, 6], [8, 4], [11, 2], [14, 3], [17, 5]];
const lavStems = () => LAV.map(([x, y]) => line(x + 1, y + 5, 12, 12, "v"));
const lavSpikes = (open) => LAV.map(([x, y]) => grid(x, y, open ? ".m\nmL\nLl\nmL\nLl\nl." : ".l\nVL\nvv\nVL\nv."));
plant("lavanda-sprout", [], lavTuft(4));
plant("lavanda-bud", lavStems(), [...lavSpikes(false), ...lavTuft(6)]);
plant("lavanda-bloom", lavStems(), [...lavSpikes(true), ...lavTuft(6)]);

// ── Piezas del jardín ─────────────────────────────────────────────────────────────────────────
// Canto rodado del borde: óvalo con contorno de 1 px (4-vecinos), luz arriba a la izquierda y
// sombra abajo a la derecha.
const pebble = (cx, cy, s) => (c) => {
  const rx = s, ry = s * 0.7, inside = (x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
  const x0 = Math.floor(cx - rx - 1), x1 = Math.ceil(cx + rx + 1), y0 = Math.floor(cy - ry - 1), y1 = Math.ceil(cy + ry + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (inside(x, y)) {
      const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
      c.px(x, y, u + v < -0.9 ? "8" : u + v > 0.8 || v > 0.55 ? "6" : "7");
    } else if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1)) c.px(x, y, "k");
  }
};
// Musgo: tres cojines (el de atrás y dos delante) con luz arriba a la izquierda, un helecho
// pequeño asomando detrás y una piedrita delante.
const cushion = (cx, cy, rx, ry) => [
  ellipse(cx, cy, rx, ry, "G"), ellipse(cx, cy, rx - 1, ry - 1, "g"),
  ellipse(cx - 1, cy - 1, rx - 2, ry - 2, "h"), ellipse(cx, cy, rx - 2, ry - 2, "g"),
  px(cx - Math.round(rx / 2), cy - ry + 1, "H"),
];
obj("moss", 24, 24,
  grid(15, 4, `
    ....h.
    ..h.Gg
    ..hGg.
    .h.G.g
    .hhGg.
    ..hG..
    ...G..`),
  ...cushion(13, 15, 7, 5),
  ...cushion(7, 19, 5, 4),
  ...cushion(17, 19, 5, 3),
  rect(0, 22, 24, 2, "_"), pebble(5.5, 20, 2.8),
);

// Pisadera: laja de granito plana, cara de arriba clara y canto en sombra, con vetas.
obj("step", 24, 24,
  ellipse(12, 17, 10, 4, "5"), ellipse(12, 16, 10, 4, "6"), ellipse(12, 15, 10, 4, "8"),
  ...rows(11, "9-14:9", "6-9:9", "4-5:9"),
  ...[[8, 14], [13, 13], [16, 16], [10, 17], [18, 14], [6, 16]].map(([x, y]) => px(x, y, "7")),
  px(15, 12, "9"), px(17, 15, "6"), px(12, 16, "6"),
);

// Piedra grande: canto rodado con dos caras, la de la izquierda al sol.
obj("stone", 24, 24,
  poly([3, 22, 2, 17, 4, 11, 8, 7, 13, 5, 18, 7, 21, 12, 22, 18, 21, 22], "7"),
  poly([2, 17, 4, 11, 8, 7, 13, 5, 11, 10, 9, 15, 7, 22, 3, 22], "8"),
  poly([4, 12, 8, 7, 12, 6, 9, 10, 6, 13], "9"),
  line(12, 6, 10, 11, "6"), line(10, 11, 8, 21, "6"),
  poly([16, 17, 21, 14, 22, 18, 21, 22, 14, 22], "6"), row(21, "4-20:5"), line(17, 8, 19, 11, "8"),
  px(14, 13, "6"), px(15, 14, "6"), px(18, 16, "5"),
);

// Farol de piedra (kasuga): peana, fuste, plataforma, caja de luz encendida, tejado de aleros
// curvos y joya. Simétrico salvo la luz.
obj("lantern", 24, 32,
  // joya y remate
  ...rows(4, "11-12:8", "10-13:7", "11-12:7", "10-13:8", "9-14:7"),
  // tejado con aleros curvados hacia arriba
  ...rows(9, "10-13:8", "8-15:8", "6-17:8", "4-19:7"), px(3, 11, "7"), px(20, 11, "7"),
  row(10, "8-11:9"), row(11, "6-9:9"), row(12, "17-19:6"), row(11, "15-17:7"),
  // sombra bajo el alero y caja de luz
  row(13, "8-15:k"), rect(8, 14, 8, 5, "7"), vline(8, 14, 5, "8"), vline(15, 14, 5, "6"),
  rect(10, 14, 4, 4, "&"), rect(11, 15, 2, 2, "^"), row(17, "10-13:$"), vline(13, 14, 4, "$"), hline(10, 14, 3, "^"),
  // plataforma, fuste y peana
  ...rows(19, "8-15:8", "7-16:6"), row(19, "8-10:9"),
  rect(10, 21, 4, 7, "7"), vline(10, 21, 7, "8"), vline(13, 21, 7, "6"), row(21, "10-13:5"),
  ...rows(28, "8-15:8", "7-16:7", "7-16:6"), row(28, "8-9:9"),
  vline(16, 29, 2, "5"),
);

// Estanque 48×48: orilla ondulada, borde de cantos rodados, agua con luz arriba a la izquierda y
// sombra de la orilla, brillo, tres nenúfares y un loto. Sin peces: los koi se animan encima.
const shore = (r, t) => r * (1 + 0.07 * Math.sin(3 * t + 0.6) + 0.05 * Math.cos(2 * t));
const polar = (x, y, cx = 24, cy = 24.5) => {
  const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) / 0.9;
  return [Math.hypot(dx, dy), Math.atan2(dy, dx)];
};
const STONES = Array.from({ length: 14 }, (_, i) => {
  const t = (i / 14) * Math.PI * 2 + (i % 3) * 0.1, r = shore(18.4, t), s = 2.3 + ((i * 7) % 5) * 0.3;
  return [24 + Math.cos(t) * r, 24.5 + Math.sin(t) * r * 0.9, s];
});
const pad = (cx, cy, r, notch) => (c) => {
  c.circ(cx, cy, r + 1, "k");
  c.circ(cx, cy, r, "h");
  c.circ(cx + 1, cy + 1, r - 1, "g");
  c.line(cx, cy, cx + Math.round(Math.cos(notch) * r), cy + Math.round(Math.sin(notch) * r), "k");
  c.px(cx - r + 1, cy - 1, "H");
};
obj("pond", 48, 48,
  (c) => {
    for (let y = 1; y < 47; y++) for (let x = 1; x < 47; x++) {
      const [r, t] = polar(x, y);
      if (r < shore(16.4, t)) {
        // agua: clara arriba a la izquierda (donde da el cielo), más honda hacia el borde de abajo
        const [rl] = polar(x, y, 20, 19);
        let col = rl < 7 ? "x" : rl < 13.5 ? "W" : "w";
        if (r > shore(15.2, t) && Math.sin(t) < 0 && Math.cos(t) < 0.5) col = "w"; // sombra de la orilla
        if (r > shore(15.6, t)) col = "k";
        c.px(x, y, col);
      } else if (r < shore(20.2, t)) c.px(x, y, Math.sin(t + 0.8) < -0.3 ? "h" : "g"); // orilla de musgo
    }
  },
  // brillo del cielo
  line(13, 20, 16, 17, "X"), line(17, 16, 21, 15, "X"), px(16, 17, "Y"), px(17, 16, "Y"), line(28, 37, 32, 38, "x"),
  pad(33, 34, 4, -0.5), pad(14, 32, 3, -2.4), pad(35, 18, 2, -1.7),
  // loto sobre el nenúfar grande
  rows(31, "33:o", "32:o 33:O 34:o", "31-35:o"), px(32, 33, "O"), px(34, 33, "O"), px(33, 30, "o"), row(30, "32:k 34:k"),
  ...STONES.map(([x, y, s]) => pebble(x, y, s)),
);

// Koi 8×5 blanco y naranja mirando a la derecha.
obj("koi", 8, 5, ...rows(1, "1:a 3-4:y 5:a", "2-3:y 4-5:a 6:y", "1:a 3:a 4-5:y"));

// ── Suelos que empalman ───────────────────────────────────────────────────────────────────────
// Arena rastrillada: surco (sombra), cresta (luz) y arena, cada 3 filas: 8 pasadas por casilla.
sprite("sand", { w: 24, h: 24 }, rect(0, 0, 24, 24, "t"),
  ...Array.from({ length: 8 }, (_, i) => [hline(0, i * 3, 24, "T"), hline(0, i * 3 + 1, 24, "u")]).flat());

// Tierra sin cavar: más oscura, con terrones en tresbolillo (luz arriba, sombra debajo).
sprite("raw", { w: 24, h: 24 }, rect(0, 0, 24, 24, "j"), (c) => {
  for (let gy = 0; gy < 6; gy++) for (let gx = 0; gx < 4; gx++) {
    const x = gx * 6 + (gy % 2) * 3 + 1, y = gy * 4 + 1;
    c.hline(x % 24, y, 2, "f"); c.hline((x + 1) % 24, y + 1, 2, "J"); c.px((x + 2) % 24, y, "j");
  }
});

// ── Arce ──────────────────────────────────────────────────────────────────────────────────────
// Hoja caída de 7×7: cinco lóbulos (las muescas las cierra el contorno) y el rabito.
obj("leaf", 7, 7, grid(1, 1, `
  ..e..
  e.R.R
  eeRRr
  .RRr.
  ..r..`));
// Hojas de la rama, de 9×9: más lóbulos y nervio central.
sprite("_maple", { outline: "k" }, `
  ...e...
  e..e..R
  ee.eR.R
  .eeRRR.
  eeeRRrr
  ..eRr..
  ...r...`);
sprite("_maple-r", { base: "_maple" });
sprite("_maple-o", { base: "_maple", swap: { e: "N", R: "n", r: "R" } });
sprite("_maple-d", { base: "_maple", swap: { e: "R", R: "r", r: "Z" } });

// Rama que entra por la izquierda, con tres ramitas y hojas rojas y naranjas colgando.
sprite("_branch", { w: 38, h: 24, outline: "k" }, F(
  line(0, 4, 9, 6, "q", 3), line(9, 6, 18, 8, "q", 3), line(18, 8, 27, 10, "q", 2), line(27, 10, 36, 11, "q", 2),
  line(0, 3, 9, 5, "Q"), line(9, 5, 18, 7, "Q"), line(18, 7, 27, 9, "Q"), line(0, 5, 18, 9, "Z"),
  line(12, 8, 14, 15, "q"), line(23, 10, 28, 15, "q"), line(29, 10, 32, 5, "q"), line(5, 6, 6, 9, "q"),
));
const BR_LEAVES = [[2, 6, "o"], [10, 13, "r", "x"], [19, 12, "o"], [25, 14, "d"], [28, 1, "o", "x"], [32, 8, "r"], [16, 1, "d", "x"]];
sprite("branch", { w: 40, h: 26 },
  stamp("_branch", 0, 0),
  ...BR_LEAVES.map(([x, y, v, flip]) => stamp("_maple-" + v, x, y, flip ? { flip } : {})),
  // la rama sigue fuera del lienzo: sin contorno en el borde izquierdo
  vline(0, 3, 1, "Q"), vline(0, 4, 2, "q"), vline(0, 6, 1, "Z"),
);

// ── Herramientas ──────────────────────────────────────────────────────────────────────────────
// Regadera de latón con el pico a la derecha.
obj("can", 16, 12,
  ...rows(1, "4-9:D", "3:D 10:D", "3:D 10:D", "3:D 10:D"),
  ...rows(5, "3-10:E", "2-10:D", "2-10:D", "2-10:D", "2-10:D", "3-10:d"),
  row(5, "4-5:F"), vline(3, 6, 4, "E"), vline(10, 6, 4, "d"), row(8, "11:d"),
  line(11, 9, 13, 4, "D", 2), rect(13, 2, 2, 2, "E"), px(14, 1, "F"), px(14, 3, "d"),
);

// Tijeras de podar: mangos rojos a la izquierda, hojas de acero a la derecha, perno de latón.
obj("shears", 16, 16,
  ring(4, 4, 2, "R"), ring(4, 11, 2, "R"), px(3, 3, "e"), px(3, 10, "e"), px(5, 13, "r"), px(5, 6, "r"),
  line(6, 5, 8, 7, "M"), line(6, 10, 8, 8, "M"),
  poly([8, 6, 15, 6, 15, 7, 8, 8], "I"), poly([8, 8, 15, 9, 15, 10, 8, 10], "I"),
  row(6, "9-14:U"), row(9, "9-14:M"), row(8, "9-14:k"),
  rect(7, 7, 2, 2, "D"), px(7, 7, "E"),
);

// Pala: empuñadura en T, mango de madera y hoja de acero con la punta abajo.
obj("shovel", 8, 18,
  row(1, "1-6:P"), row(2, "1-6:K"),
  rect(3, 3, 2, 7, "K"), vline(3, 3, 7, "P"), rect(3, 9, 2, 1, "M"),
  ...rows(10, "1-6:I", "1-6:I", "1-6:I", "1-6:I", "2-5:I", "2-5:I", "3-4:I"),
  vline(1, 10, 4, "U"), vline(2, 14, 2, "U"), vline(6, 10, 4, "M"), vline(5, 14, 2, "M"), px(4, 16, "M"), row(10, "2-5:U"),
);

// Bolsita de semillas de arpillera, atada y abierta por arriba.
obj("pouch", 11, 12,
  ...rows(1, "4:K 6:C", "3-7:p"),
  ...rows(3, "2-8:=", "3-7:r", "2-8:0", "1-9:0", "1-9:0", "1-9:0", "1-9:0", "2-8:p"),
  row(3, "2-3:0 7-8:p"), vline(1, 6, 4, "="), vline(2, 5, 4, "="), vline(9, 6, 4, "p"), row(9, "6-9:p"), px(3, 4, "e"),
);

// Hojas de prueba (solo para revisar que todo combina): las nueve plantas en su maceta, y un
// trozo de jardín con las demás piezas sobre la arena.
scene("macetas", { w: 72, h: 72, bg: "t" }, pattern("sand", 0, 0, 72, 72),
  ...["romero", "salvia", "lavanda"].flatMap((k, i) => ["sprout", "bud", "bloom"].flatMap((st, j) =>
    [stamp("pot", j * 24, i * 24), stamp(`${k}-${st}`, j * 24, i * 24)])));
scene("jardin", { w: 144, h: 96, bg: "t" },
  pattern("sand", 0, 0, 144, 96), tile("raw", 120, 72, 1, 1), tile("raw", 96, 72, 1, 1),
  stamp("pond", 0, 0), stamp("koi", 14, 18), stamp("koi", 26, 30, { flip: "x" }),
  stamp("pot", 48, 0), stamp("romero-bloom", 48, 0), stamp("pot", 72, 0), stamp("salvia-bloom", 72, 0),
  stamp("pot", 48, 24), stamp("lavanda-bloom", 48, 24), stamp("moss", 72, 24),
  stamp("step", 0, 48), stamp("step", 24, 48), stamp("stone", 0, 72), stamp("lantern", 24, 64),
  stamp("stone", 72, 48), stamp("moss", 48, 48),
  stamp("branch", 104, 0), stamp("leaf", 100, 40), stamp("leaf", 60, 74, { flip: "x" }),
  stamp("can", 98, 52), stamp("shears", 118, 50), stamp("shovel", 136, 46), stamp("pouch", 80, 78));

sheet("zen", ["pot", "romero-*", "salvia-*", "lavanda-*", "moss", "step", "stone", "lantern", "pond", "koi", "sand", "raw", "leaf", "branch", "can", "shears", "shovel", "pouch"], { pad: 2 });
