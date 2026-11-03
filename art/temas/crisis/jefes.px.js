// Jefes del tema "Crisis Financiera": los que llegan el día de la intervención. Bando claro en
// plata (w W o) con verde lima (g G), como las piezas; piel, papel, pantallas y tinta son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/crisis/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#0d1110",
  w: "#eef3ef", W: "#c5d1c9", o: "#8a9a90", g: "#9be22d", G: "#4f8a1a",
  s: "#e8b48e", S: "#b27a58", h: "#3a2a22", H: "#d9d9d2",
  t: "#2b3038", T: "#1b1f25", y: "#f5cf4a", Y: "#b38a22",
  p: "#f4f1e6", P: "#cfc8b2", n: "#0b1712", c: "#8ef0c8", r: "#ff4256", R: "#a8202f",
  m: "#a3acb1", M: "#646d72", b: "#f7d23a", u: "#c8a070", U: "#8e6a44",
});
ramps("oWw", "Gg", "Ss", "Tt", "Yy", "Pp", "Mm", "Rr", "Uu");

const boss = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};

// Titán: el interventor, un funcionario gigante con el sello rojo levantado.
boss("boss-titan", { w: 40, h: 42 },
  rect(12, 2, 14, 13, "s"), rect(12, 2, 14, 3, "h"), rect(23, 4, 3, 11, "S"),
  rect(14, 7, 4, 2, "c"), rect(20, 7, 4, 2, "c"), hline(18, 7, 2, "k"), hline(16, 12, 6, "R"), px(15, 11, "S"), px(22, 11, "S"),
  poly([8, 15, 30, 15, 33, 38, 5, 38], "o"), poly([24, 15, 30, 15, 33, 38, 27, 38], "W"), poly([16, 15, 19, 21, 22, 15], "w"), vline(19, 18, 12, "g"),
  rect(30, 16, 5, 12, "o"), rect(2, 9, 5, 17, "o"), rect(1, 6, 7, 3, "s"),
  rect(3, 4, 3, 2, "U"), rect(0, 0, 10, 4, "R"), hline(0, 3, 10, "r"), line(3, 1, 6, 2, "p"), line(6, 1, 3, 2, "p"),
  rect(32, 25, 7, 9, "p"), rect(37, 25, 2, 9, "P"), ...[27, 29, 31].map((y) => hline(33, y, 4, "o")), rect(31, 27, 2, 3, "s"),
  rect(9, 38, 8, 4, "T"), rect(22, 38, 8, 4, "T"),
);

// Carnero: el cobrador que embiste, porque la deuda no se anula aunque el banco cierre.
boss("boss-ram", { w: 44, h: 30 },
  rect(30, 2, 12, 11, "s"), rect(30, 2, 12, 3, "h"), rect(39, 4, 3, 9, "S"), px(33, 7, "k"), px(37, 7, "k"), hline(32, 6, 3, "h"), hline(36, 6, 3, "h"), hline(33, 10, 5, "R"),
  poly([14, 10, 34, 12, 36, 24, 12, 24], "o"), poly([28, 12, 34, 12, 36, 24, 30, 24], "W"), rect(26, 13, 3, 6, "w"),
  rect(0, 6, 16, 16, "p"), rect(13, 6, 3, 16, "P"), text(1, 7, "PAGUE", "R"), ...[14, 16, 18].map((y) => hline(2, y, 10, "o")), hline(2, 20, 6, "r"),
  rect(16, 12, 6, 4, "s"), rect(14, 24, 6, 6, "T"), rect(28, 24, 6, 6, "T"),
);

// Hidra: la app de tres cabezas, tres celulares que contestan errores distintos.
boss("boss-hydra", { w: 46, h: 40 },
  rect(10, 22, 26, 18, "w"), rect(30, 22, 6, 18, "W"), rect(10, 22, 26, 3, "g"), rect(13, 30, 20, 2, "n"), rect(13, 34, 20, 2, "n"),
  ...[[1, 6, "404"], [17, 0, "500"], [33, 6, "ERR"]].flatMap(([x, y, err]) => [
    rect(x, y, 12, 16, "o"), rect(x + 1, y + 1, 10, 14, "n"), px(x + 3, y + 4, "r"), px(x + 8, y + 4, "r"), hline(x + 3, y + 7, 6, "R"),
    text(x + 1, y + 9, err, "c"), rect(x + 5, y + 16, 2, 22 - y - 16 + 1, "M")]),
);

// Gólem: las empresas vinculadas, un gigante de cajas de cartón "S.A." que se presta a sí mismo.
boss("boss-golem", { w: 40, h: 42 },
  ...[[4, 26, 32, 12], [8, 13, 24, 13], [12, 1, 16, 12]].flatMap(([x, y, w, h]) => [rect(x, y, w, h, "u"), rect(x + w - 4, y, 4, h, "U"), hline(x, y, w, "w"), vline(x + w / 2, y, 3, "U"), ...(h < 13 && y < 5 ? [] : [text(x + w / 2 - 3, y + h - 6, "SA", "U")])]),
  px(16, 5, "k"), px(23, 5, "k"), rect(17, 8, 6, 2, "n"), px(18, 9, "y"), px(21, 9, "y"),
  rect(0, 16, 8, 5, "u"), rect(32, 16, 8, 5, "u"), vline(4, 16, 5, "U"), vline(36, 16, 5, "U"),
  rect(6, 38, 10, 4, "U"), rect(24, 38, 10, 4, "U"),
);

// Jinete: el cadete con la caja de la capitalización de 100 millones, que no llegó a tiempo.
boss("boss-rider", { w: 21, h: 42 },
  rect(3, 0, 15, 15, "u"), rect(14, 0, 4, 15, "U"), hline(3, 0, 15, "w"), text(5, 2, "USD", "k"), text(3, 8, "100M", "G"),
  rect(4, 15, 12, 7, "s"), rect(4, 15, 12, 2, "G"), rect(13, 16, 3, 6, "S"), px(7, 18, "k"), px(12, 18, "k"), rect(9, 20, 2, 1, "R"), px(16, 18, "c"), px(17, 19, "c"),
  rect(3, 22, 14, 11, "w"), rect(13, 22, 4, 11, "W"), hline(3, 27, 14, "g"),
  rect(4, 33, 5, 7, "t"), rect(12, 33, 5, 7, "t"), rect(3, 40, 6, 2, "T"), rect(12, 40, 6, 2, "T"),
);

// Muro: la ventanilla bajada: cerrado, vuelva en 15 días.
boss("boss-wall", { w: 45, h: 26 },
  rect(0, 0, 45, 22, "w"), rect(0, 0, 45, 3, "g"), hline(0, 2, 45, "G"),
  rect(3, 5, 39, 14, "o"), ...[7, 10, 13, 16].map((y) => hline(3, y, 39, "W")),
  rect(7, 6, 31, 11, "p"), text(9, 7, "CERRADO", "R"), text(9, 13, "15DIAS", "k"),
  rect(0, 22, 45, 4, "o"), hline(0, 22, 45, "W"),
);

// Devorador: la tarjeta de crédito con boca, que sigue cobrando cuotas aunque todo esté caído.
boss("boss-devourer", { w: 46, h: 36 },
  rect(0, 2, 46, 30, "w"), rect(38, 2, 8, 30, "W"), rect(0, 6, 46, 4, "o"),
  rect(5, 13, 8, 6, "y"), hline(5, 16, 8, "Y"), vline(9, 13, 6, "Y"),
  rect(26, 12, 5, 5, "p"), rect(34, 12, 5, 5, "p"), px(28, 14, "k"), px(36, 14, "k"),
  rect(22, 21, 22, 9, "R"), ...[23, 27, 31, 35, 39].map((x) => [rect(x, 21, 2, 2, "p"), rect(x + 2, 28, 2, 2, "p")]).flat(),
  circ(26, 26, 2, "y"), circ(33, 25, 1, "y"), text(1, 22, "CUOTA", "G"), text(1, 27, "999", "R"),
);
