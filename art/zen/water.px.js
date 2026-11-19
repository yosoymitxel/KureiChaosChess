pal({
  k: "#1a1a1a",
  w: "#ffffff",
  g: "#34d399",
  G: "#10b981",
  b: "#3b82f6",
  B: "#2563eb",
  y: "#fbbf24",
  Y: "#f59e0b",
  r: "#ef4444",
  p: "#c084fc",
  o: "#f97316",
  s: "#94a3b8",
  W: "#e2e8f0",
})

ramps("kGgw", "kyy", "kbb", "krr", "kpp")

// ---------- Koi (estanque, ~14x9) ----------
// Kohaku: blanco con manchas rojas
sprite("koi_kohaku", { w: 14, h: 9, outline: "k", mx: true }, `
  ....wwww....
  ...wwwwww...
  ..wwrrwwww..
  .wwrrrrwww.
  wwrrrrrrww.
  .wwrrrrwww.
  ..wwwwwwww..
  ...wwww....`)

// Sanke: blanco, rojo y negro
sprite("koi_sanke", { w: 14, h: 9, outline: "k", mx: true }, `
  ....wwww....
  ...wwwwww...
  ..wwrkwww...
  .wwrrkwww.
  wwrrkkrww.
  .wwrrkwww.
  ..wwwwwwww..
  ...wwww....`)

// Showa: negro base con rojo y blanco
sprite("koi_showa", { w: 14, h: 9, outline: "k", mx: true }, `
  ....kkkk....
  ...kkkkkk...
  ..kkrrkkkk..
  .kkrrrrkkk.
  kkrrrrrrkk.
  .kkrrrrkkk.
  ..kkkkkkkk..
  ...kkkk....`)

// Ogon: dorado sólido
sprite("koi_ogon", { w: 14, h: 9, outline: "k", mx: true }, `
  ....yyyy....
  ...yyyyyy...
  ..yyyyyyyy..
  .yyyyyyyyy.
  yyyyyyyyyy.
  .yyyyyyyyy.
  ..yyyyyyyy..
  ...yyyy....`)

// Tancho: blanco con corona roja en la cabeza
sprite("koi_tancho", { w: 14, h: 9, outline: "k", mx: true }, `
  ....rrrr....
  ...rrrrrr...
  ..wwwwwwww..
  .wwwwwwwww.
  wwrwrrrrww.
  .wwwwwwwww.
  ..wwwwwwww..
  ...wwww....`)

// Shiro: blanco plateado (muy claro)
sprite("koi_shiro", { w: 14, h: 9, outline: "k", mx: true }, `
  ....WWWW....
  ...WWWWWW...
  ..WWWWWWWW..
  .WWWWWWWWW.
  WWWWWWWWWW.
  .WWWWWWWWW.
  ..WWWWWWWW..
  ...WWWW....`)

// ---------- Barquitos (estanque, ~12x8) ----------
// Barco de papel (origami)
sprite("boat_papel", { w: 12, h: 8, outline: "k", mx: true }, `
  ....WW....
  ...WWWW...
  ..WWWWWW..
  .WWWWWWWW.
  WWWWWWWWWW
  .WW..WW.W.
  ....WW....`)

// Barco de madera
sprite("boat_madera", { w: 12, h: 8, outline: "k", mx: true }, `
  ....yy....
  ...yyyyy..
  ..yyyyyyy.
  .yyyyyyyyy.
  yyyyyyyyyy
  .yy..yy.y.
  ....yy....`)

// Barco de bambú
sprite("boat_bambu", { w: 12, h: 8, outline: "k", mx: true }, `
  ....GG....
  ...GGGGG..
  ..GGGGGGG.
  .GGGGGGGGG.
  GGGGGGGGGG
  .GG..GG.G.
  ....GG....`)

// Barco de lujo
sprite("boat_lujo", { w: 12, h: 8, outline: "k", mx: true }, `
  ....pp....
  ...ppppp..
  ..ppppppp.
  .ppppppppp.
  pppppppppp
  .pp..pp.p.
  ....pp....`)

// Barco de velocidad
sprite("boat_velocidad", { w: 12, h: 8, outline: "k", mx: true }, `
  ....oo....
  ...ooooo..
  ..ooooooo.
  .ooooooooo.
  oooooooooo
  .oo..oo.o.
  ....oo....`)

// ---------- Plantas acuáticas (estanque, ~10x10) ----------
// Loto (flor rosa en centro)
sprite("plant_loto", { w: 10, h: 10, outline: "k" }, `
  .....p....
  ....ppp...
  ...ppppp..
  ..ppppppp.
  .ppppppppp.
  ..ppppppp.
  ...ppppp..
  ....ppp...
  .....p....
  ..........`)

// Nenúfar (hoja verde redonda)
sprite("plant_nenufar", { w: 10, h: 10, outline: "k" }, `
  ..........
  .GGGGGGGG.
  GGGGGGGGGG
  GGGwwGGGGG
  GGGwwGGGGG
  GGGGGGGGGG
  GGGGGGGGGG
  .GGGGGGGG.
  ..........
  ..........`)

// Junco (tallo alto verde)
sprite("plant_junco", { w: 10, h: 10, outline: "k" }, `
  ......G...
  ......G...
  ......G...
  ......G...
  ......G...
  ......G...
  ......G...
  ......G...
  ......G...
  ......G...`)

// Lenteja de agua (pequeños puntos verdes flotantes)
sprite("plant_lenteja", { w: 10, h: 10, outline: "k" }, `
  ..........
  .g.g.g.g..
  ..g..g..g.
  .g.g.g.g..
  ..g..g..g.
  .g.g.g.g..
  ..g..g..g.
  .g.g.g.g..
  ..........
  ..........`)

// Alga marina (verde oscuro, ondulante)
sprite("plant_alga", { w: 10, h: 10, outline: "k" }, `
  ......G...
  .....GG...
  ......G...
  .....GG...
  ......G...
  .....GG...
  ......G...
  .....GG...
  ......G...
  ......G...`)

// Papiro (pluma en cima, tallo)
sprite("plant_papiro", { w: 10, h: 10, outline: "k" }, `
  .....G....
  ....GGG...
  ...GGGGG..
  ....GGG...
  .....G....
  .....G....
  .....G....
  .....G....
  .....G....
  .....G....`)

// ---------- Escena del estanque ----------
scene("estanque", { w: 128, h: 128, bg: "b" },
  layer("fondo", rect(0, 0, 128, 128, "B")),
  layer("agua", rect(4, 4, 120, 120, "b")),
  stamp("koi_kohaku", 30, 40),
  stamp("koi_sanke", 70, 50),
  stamp("boat_papel", 60, 30),
  stamp("plant_loto", 50, 70),
  stamp("plant_nenufar", 90, 60),
  stamp("plant_junco", 100, 80),
  stamp("plant_lenteja", 20, 90),
  stamp("plant_alga", 110, 90),
  stamp("plant_papiro", 10, 80))

sheet("watergarden", ["koi_*", "boat_*", "plant_*"], { pad: 2 })
