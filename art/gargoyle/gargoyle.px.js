pal({
  k: "#181422",
  d: "#383447",
  s: "#5b5770",
  l: "#8985a0",
  h: "#b8b4cc",
  r: "#e23855",
  y: "#ffa834",
  w: "#f4f0ff"
})

ramps("kdslh", "kdrw")

// Gárgola dormida: estatua de piedra con cuernos, alas plegadas y ojos cerrados de piedra
sprite("gargoyle_sleep", { mx: true, outline: "k" }, `
  ........h.
  .......hhd
  ......llsd
  .....llls.
  ....llshd.
  ...llshdd.
  ..llshdd..
  .llshdd.ss
  lllshd.ssl
  llshd.ssll
  llsd.sslll
  .ssd.sslll
  ..sd.sllls
  ...d.slll.
  ....dsss..
  ...dddss..
  ..ddddss..
  .dddddss..
  ddddddds..
  ddddddds..
`)

// Gárgola despierta: ojos encendidos y runas de fuego en el pecho
sprite("gargoyle_awake", { base: "gargoyle_sleep", swap: { s: "s" } },
  px(7, 7, "r"), px(8, 7, "y"), px(13, 7, "y"), px(14, 7, "r"),
  px(8, 8, "r"), px(13, 8, "r"),
  px(10, 11, "y"), px(11, 11, "y"),
  px(10, 12, "r"), px(11, 12, "r")
)

