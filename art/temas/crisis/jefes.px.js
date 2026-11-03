// Jefes del tema "Crisis Financiera": la gente y las cosas que vienen a cobrar. Bando claro en
// plata (w W o) con verde (g G), como las piezas; piel, traje, papel y pantallas son fijos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/temas/crisis/jefes.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#101412",
  w: "#e6ede8", W: "#bccac1", o: "#83978a", g: "#3fd47a", G: "#1b8a4a",
  s: "#e0b08c", S: "#a8785a", t: "#2a2f36", T: "#1a1e23",
  y: "#f2cf5a", Y: "#b08a24", m: "#9aa3a8", M: "#5e666b",
  n: "#0e1a16", c: "#7ff0c0", r: "#ff4a5a", p: "#f1efe4", P: "#c9c4b0",
});
ramps("oWw", "Gg", "Ss", "Tt", "Yy", "Mm", "Pp");

const boss = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name, { base: "_" + name, outline: "k" });
};
const face = (x, y, w) => [rect(x, y, w, 7, "s"), rect(x + w - 2, y, 2, 7, "S"), px(x + 2, y + 3, "k"), px(x + w - 3, y + 3, "k"), hline(x + 2, y + 5, w - 4, "S")];

// Titán: el auditor, enorme, de traje, con la lupa y la carpeta.
boss("boss-titan", { w: 40, h: 44 },
  rect(8, 18, 24, 22, "t"), rect(26, 18, 6, 22, "T"), poly([16, 18, 20, 26, 24, 18], "w"), vline(20, 20, 10, "g"),
  ...face(13, 6, 14), rect(13, 4, 14, 3, "M"), rect(14, 9, 5, 3, "c", ), rect(21, 9, 5, 3, "c"), hline(19, 10, 2, "k"),
  rect(2, 22, 6, 14, "t"), circ(4, 16, 5, "m"), circ(4, 16, 3, "c"), rect(32, 22, 7, 12, "w"), rect(32, 22, 7, 2, "G"),
  rect(10, 40, 8, 4, "T"), rect(22, 40, 8, 4, "T"),
);

// Carnero: el cobrador que embiste con la factura vencida por delante.
boss("boss-ram", { w: 44, h: 32 },
  rect(12, 10, 22, 16, "t"), rect(28, 10, 6, 16, "T"), ...face(30, 2, 12), rect(30, 0, 12, 3, "G"),
  rect(0, 8, 14, 18, "p"), rect(11, 8, 3, 18, "P"), ...[11, 14, 17].map((y) => hline(2, y, 8, "o")), text(3, 20, "!!", "r"),
  rect(14, 26, 6, 6, "T"), rect(26, 26, 6, 6, "T"), rect(20, 14, 8, 3, "w"),
);

// Hidra: un cajero con tres pantallas que se ríen, cada una con su error.
boss("boss-hydra", { w: 46, h: 42 },
  rect(10, 18, 26, 24, "w"), rect(30, 18, 6, 24, "W"), rect(10, 18, 26, 3, "G"), rect(14, 32, 18, 2, "n"),
  ...[[2, 6], [17, 0], [32, 6]].flatMap(([x, y]) => [rect(x, y, 13, 11, "o"), rect(x + 2, y + 2, 9, 7, "n"),
    px(x + 4, y + 4, "r"), px(x + 8, y + 4, "r"), hline(x + 4, y + 6, 5, "c"), vline(x + 6, y + 11, 18 - y - 11 + 1, "M")]),
);

// Gólem: un montón de cajas fuertes apiladas que camina.
boss("boss-golem", { w: 40, h: 42 },
  ...[[4, 26, 32, 14], [8, 12, 24, 14], [12, 0, 16, 12]].flatMap(([x, y, w, h]) => [rect(x, y, w, h, "w"), rect(x + w - 5, y, 5, h, "W"),
    circ(x + w / 2, y + h / 2, Math.min(w, h) / 4, "m"), ring(x + w / 2, y + h / 2, Math.min(w, h) / 4, "M"), hline(x, y, w, "g")]),
  px(17, 5, "r"), px(22, 5, "r"), rect(6, 40, 10, 2, "M"), rect(24, 40, 10, 2, "M"),
);

// Jinete: el ejecutivo de corbata verde, alto y flaco, con el celular.
boss("boss-rider", { w: 21, h: 42 },
  rect(4, 12, 14, 22, "t"), rect(14, 12, 4, 22, "T"), poly([9, 12, 11, 16, 13, 12], "w"), vline(11, 14, 12, "g"), px(11, 26, "G"),
  ...face(5, 2, 12), rect(5, 0, 12, 3, "T"), rect(18, 14, 3, 7, "n"), px(19, 16, "c"),
  rect(5, 34, 5, 8, "T"), rect(12, 34, 5, 8, "T"),
);

// Muro: la ventanilla de atención con su vidrio, el cartel y la cola de recibos.
boss("boss-wall", { w: 45, h: 26 },
  rect(0, 8, 45, 18, "w"), rect(0, 8, 45, 3, "G"), hline(0, 8, 45, "g"), rect(0, 22, 45, 4, "o"),
  ...[2, 17, 32].flatMap((x) => [rect(x, 12, 12, 9, "c"), hline(x + 2, 14, 4, "w"), rect(x + 4, 19, 4, 2, "n")]),
  rect(14, 0, 20, 7, "n"), text(13, 1, "CERRADO", "r", { gap: 0 }),
);

// Devorador: la alcancía hambrienta que se traga las cuentas, boca abierta llena de monedas.
boss("boss-devourer", { w: 46, h: 38 },
  ellipse(22, 20, 21, 15, "w"), ellipse(26, 23, 16, 11, "W"), poly([10, 6, 15, 0, 18, 7], "G"), poly([26, 6, 31, 0, 34, 7], "G"),
  ellipse(36, 22, 8, 7, "n"), ...[[33, 21], [37, 24], [35, 26]].map(([x, y]) => circ(x, y, 1, "y")), hline(30, 16, 12, "r"),
  px(26, 13, "r"), px(27, 13, "r"), hline(14, 5, 8, "n"),
  rect(8, 32, 6, 6, "G"), rect(28, 32, 6, 6, "G"),
);
