// Vesper: jefes góticos sensuales. Siluetas curvas y dramáticas.
pal({
  k: "#0a0810", w: "#e8d8e0", W: "#c9b8c4", o: "#726174", O: "#4a3d4a", b: "#2a2230",
  g: "#f5e6ef", G: "#dfbfd4", r: "#b33b61", R: "#81304f", z: "#c9a36a", Z: "#80613d",
  p: "#f4d3de", P: "#d88ca6", t: "#8ed1c1", T: "#3e806e", y: "#fff0f5", Y: "#f5e6ef",
  s: "#c9b8c4", S: "#726174", m: "#4a3d4a", M: "#2a2230", n: "#3a2d40", N: "#1a1420",
  c: "#b33b61", C: "#81304f", q: "#e8d8e0", Q: "#c9b8c4", h: "#f5e6ef", H: "#dfbfd4"
});
ramps("bOoWw", "kRr", "Pp", "Yy", "Gg", "Tt", "Cc");

// Jefe titán: soberana de terciopelo, corona de espinas y vestido ceñido.
sprite("boss-titan", { w: 44, h: 44, outline: "k" },
  // corona de espinas
  poly([10, 6, 14, 2, 18, 6, 22, 1, 26, 6, 29, 3, 32, 7, 30, 10, 12, 10], "z"),
  px(14, 4, "r"), px(20, 3, "r"), px(26, 4, "r"), px(30, 5, "r"),
  // rostro
  rect(14, 8, 16, 9, "g"), rect(16, 10, 4, 3, "k"), rect(24, 10, 4, 3, "k"),
  px(17, 11, "r"), px(25, 11, "r"), hline(17, 15, 10, "r"),
  // cuerpo curvo
  poly([10, 17, 16, 14, 28, 14, 34, 17, 37, 32, 30, 38, 14, 38, 7, 32], "b"),
  poly([13, 18, 18, 16, 26, 16, 31, 18, 33, 31, 28, 36, 16, 36, 11, 31], "O"),
  vline(22, 19, 17, "W"),
  // encaje y detalles
  hline(12, 36, 20, "r"), px(14, 35, "r"), px(18, 35, "r"), px(22, 35, "r"), px(26, 35, "r"), px(30, 35, "r"),
  rect(16, 20, 12, 6, "r"), px(18, 21, "y"), px(22, 23, "y"), px(26, 21, "y"),
  // brazos
  rect(4, 18, 7, 15, "b"), rect(33, 18, 7, 15, "b"),
  px(6, 22, "r"), px(35, 22, "r"),
  // base
  rect(8, 38, 28, 3, "k"),
);

// Jefe carnero: verdugo con cuernos curvos y armadura ceñida.
sprite("boss-ram", { w: 40, h: 40, outline: "k" },
  poly([4, 12, 0, 7, 2, 2, 6, 0, 9, 4, 10, 11], "z"),
  poly([30, 11, 31, 4, 34, 0, 38, 2, 40, 7, 36, 12], "z"),
  rect(11, 7, 18, 13, "b"), rect(13, 10, 14, 7, "g"),
  rect(15, 12, 3, 3, "k"), rect(22, 12, 3, 3, "k"), px(16, 13, "r"), px(23, 13, "r"),
  poly([13, 20, 27, 20, 33, 31, 7, 31], "O"), rect(11, 23, 18, 7, "b"),
  ...[25, 28].map(y => hline(13, y, 14, "o")),
  rect(8, 30, 9, 8, "b"), rect(23, 30, 9, 8, "b"), rect(6, 37, 12, 2, "k"), rect(22, 37, 12, 2, "k"),
  rect(19, 22, 2, 8, "r"), px(19, 23, "y"), px(19, 25, "y"),
);

// Jefe hidra: tres cráneos conectados a un cuello serpentino.
sprite("boss-hydra", { w: 44, h: 42, outline: "k" },
  line(13, 28, 9, 18, "O", 5), line(9, 18, 7, 10, "b", 5),
  line(22, 29, 22, 17, "O", 5), line(22, 17, 22, 9, "b", 5),
  line(31, 28, 35, 18, "O", 5), line(35, 18, 37, 10, "b", 5),
  circ(7, 8, 5, "g"), circ(22, 7, 5, "g"), circ(37, 8, 5, "g"),
  px(5, 7, "r"), px(9, 7, "r"), px(20, 6, "r"), px(24, 6, "r"), px(35, 7, "r"), px(39, 7, "r"),
  poly([8, 28, 36, 28, 41, 39, 3, 39], "b"), ellipse(22, 30, 10, 5, "O"),
  rect(19, 28, 6, 7, "r"), px(21, 29, "y"), px(23, 31, "y"),
);

// Jefe gólem: sarcófago ambulante con runas grabadas.
sprite("boss-golem", { w: 38, h: 42, outline: "k" },
  rect(7, 12, 24, 26, "O"), rect(10, 15, 18, 20, "b"),
  ...[19, 24, 29].map(y => hline(10, y, 18, "o")),
  rect(5, 5, 28, 10, "g"), rect(9, 8, 6, 3, "k"), rect(23, 8, 6, 3, "k"),
  px(11, 9, "r"), px(25, 9, "r"), poly([15, 12, 19, 10, 22, 12, 19, 14], "k"),
  rect(0, 15, 7, 17, "b"), rect(31, 15, 7, 17, "b"),
  px(3, 19, "z"), px(34, 19, "z"), rect(12, 35, 5, 5, "b"), rect(22, 35, 5, 5, "b"),
  rect(16, 18, 7, 9, "r"), px(18, 20, "y"), px(20, 23, "y"),
);

// Jefe jinete: espectro encapuchado sobre corcel.
sprite("boss-rider", { w: 34, h: 44, outline: "k" },
  poly([12, 25, 28, 25, 33, 35, 28, 40, 5, 40, 1, 35], "b"),
  ellipse(18, 33, 12, 5, "O"), rect(8, 35, 3, 7, "b"), rect(24, 35, 3, 7, "b"),
  poly([4, 12, 11, 3, 21, 1, 29, 12, 25, 28, 8, 28], "b"),
  rect(10, 10, 14, 12, "O"), rect(12, 12, 10, 8, "k"), px(14, 14, "r"), px(20, 14, "r"), px(17, 8, "g"),
  poly([8, 20, 25, 20, 29, 30, 5, 30], "b"), vline(17, 22, 7, "W"),
  rect(27, 3, 2, 25, "n"), px(28, 1, "z"), poly([24, 2, 29, 0, 33, 4, 30, 10], "m"),
);

// Jefe muro: muralla de ataúdes apilados y almenas con ojos.
sprite("boss-wall", { w: 46, h: 34, outline: "k" },
  rect(2, 8, 42, 24, "O"), ...[13, 20, 27].map(y => hline(3, y, 40, "b")),
  ...[8, 22, 36].map(x => vline(x, 9, 23, "o")),
  rect(0, 2, 8, 7, "g"), rect(12, 0, 8, 9, "g"), rect(26, 1, 8, 8, "g"), rect(38, 2, 8, 7, "g"),
  px(3, 5, "r"), px(16, 4, "r"), px(29, 4, "r"), px(41, 5, "r"),
  rect(18, 14, 10, 12, "b"), rect(20, 16, 6, 8, "k"), px(21, 18, "r"), px(24, 18, "r"),
  rect(0, 32, 46, 2, "k"),
);

// Jefe devorador: boca vertical, dientes de hueso y brazos largos.
sprite("boss-devourer", { w: 42, h: 42, outline: "k" },
  poly([8, 11, 15, 4, 27, 4, 34, 11, 37, 27, 30, 35, 12, 35, 5, 27], "b"),
  rect(11, 8, 20, 12, "g"), rect(13, 10, 16, 8, "k"),
  ...[14, 18, 22, 26].map(x => px(x, 10, "w")),
  ...[14, 18, 22, 26].map(x => px(x, 17, "w")),
  rect(18, 12, 6, 4, "r"), px(20, 13, "y"),
  rect(1, 14, 9, 19, "O"), rect(32, 14, 9, 19, "O"),
  line(4, 29, 1, 39, "b", 3), line(37, 29, 40, 39, "b", 3),
  poly([11, 30, 31, 30, 27, 40, 15, 40], "b"), rect(17, 32, 8, 6, "r"),
  px(19, 33, "y"), px(23, 35, "y"),
);

