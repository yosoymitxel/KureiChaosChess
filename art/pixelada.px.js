// El set del tema "Pixelada": las once piezas de Zug dibujadas a un píxel de arte.
// Método: formas (circ/ellipse/poly/line) sobre una base "o", y el volumen con capas
// `light`/`shade` sobre las rampas: luz desde arriba-izquierda, sombra abajo-derecha.
// Las siluetas siguen el set vectorial (piece-art.js): bustos para elefante, camello y caballo,
// busto almenado para la torre, y alturas escalonadas peón < torre < ... < reina < rey.
// Reconstruir:  node <pxl>/bin/pxl.js build art/pixelada.px.js  &&  node tools/pixel-art.mjs
// (pxl es la skill pxl-pixel-art: el dibujo es código, la app recibe los PNG incrustados.)

pal({
  k: "#2a2233", // tinta: contorno e interiores
  w: "#f8f0dc", W: "#e8d5ac", o: "#c9a468", O: "#9a7440", b: "#6b4d2c", // marfil y roble (claro)
  p: "#a48fce", P: "#7d63b0", q: "#5a4487", Q: "#3a2a5c", // ciruela (oscuro)
  t: "#a8e8cd", T: "#5ec3a4", u: "#338f77", U: "#1f6152", // verdemar (salvaje)
  y: "#ecc35a", Y: "#ad8530", // latón: el acento compartido por los tres bandos
});
ramps("bOoWw", "QqPp", "UuTt", "Yy");

// El bando oscuro y el salvaje son el mismo dibujo con la paleta cambiada.
const DARK = { w: "p", W: "P", o: "q", O: "Q", b: "Q" };
const WILD = { w: "t", W: "T", o: "u", O: "U", b: "U" };

// La peana de todos: collarín de dos pisos sobre una losa. Centro exacto en la columna 6.
sprite("_peana", { mx: "c" }, `
  ....oWW
  .oWWWWW
  oWWWWWW
  .OOOOOO`);

const piece = (name, opts, ...items) => {
  sprite("_" + name, opts, ...items);
  sprite(name + "_l", { base: "_" + name, outline: "k" });
  sprite(name + "_d", { base: "_" + name, swap: DARK, outline: "k" });
  sprite(name + "_w", { base: "_" + name, swap: WILD, outline: "k" });
};

// ── Simétricas (13 columnas, centro en x=6) ────────────────────────────────

// Peón: bola, collarín y falda. El más bajito del set.
piece("pawn", { w: 13, h: 13 },
  circ(6, 3, 2, "o"),
  rect(5, 5, 3, 1, "o"),
  rect(3, 6, 7, 1, "o"),
  poly([3, 7, 9, 7, 10, 9, 2, 9], "o"),
  layer("lt", { light: 2 },
    circ(4, 3, 2, "k"),
    rect(3, 6, 5, 1, "k"),
    poly([2, 7, 7, 7, 6, 9, 2, 9], "k")),
  layer("sh", { shade: 1 }, rect(8, 2, 5, 7, "k")),
  layer("sh2", { shade: 1 }, rect(9, 6, 4, 4, "k")),
  hline(4, 7, 5, "O"),
  px(4, 2, "w"),
  stamp("_peana", 0, 9));

// Torre: tres almenas, plataforma, fuste con aspillera y pie acampanado.
piece("rook", { w: 13, h: 14 },
  rect(1, 0, 3, 3, "o"),
  rect(5, 0, 3, 3, "o"),
  rect(9, 0, 3, 3, "o"),
  rect(1, 3, 11, 2, "o"),
  poly([1, 5, 11, 5, 10, 6, 2, 6], "o"),
  rect(2, 6, 9, 3, "o"),
  poly([2, 9, 10, 9, 11, 10, 1, 10], "o"),
  layer("lt", { light: 2 },
    rect(1, 0, 5, 1, "k"),
    rect(1, 3, 5, 1, "k"),
    rect(2, 5, 3, 4, "k")),
  layer("sh", { shade: 1 }, rect(9, 1, 3, 8, "k")),
  layer("sh2", { shade: 1 }, rect(11, 3, 1, 7, "k")),
  rect(6, 6, 1, 2, "k"),
  hline(1, 5, 11, "O"),
  stamp("_peana", 0, 10));

// Guardia: yelmo redondo con penacho, visor de hendidura y capa corta.
piece("guard", { w: 13, h: 16 },
  ellipse(6, 4, 4, 3, "o"),
  rect(5, 7, 3, 2, "o"),
  rect(2, 9, 9, 1, "o"),
  poly([3, 10, 9, 10, 10, 12, 2, 12], "o"),
  layer("lt", { light: 2 },
    circ(4, 3, 2, "k"),
    rect(2, 9, 4, 1, "k"),
    poly([2, 10, 6, 10, 5, 12, 2, 12], "k")),
  layer("sh", { shade: 1 }, rect(9, 1, 3, 7, "k")),
  layer("sh2", { shade: 1 }, rect(10, 8, 2, 4, "k")),
  line(6, 2, 10, 0, "O", 2), // penacho subiendo a la derecha
  hline(4, 4, 5, "k"),
  vline(6, 5, 2, "k"),
  hline(2, 7, 9, "O"),
  stamp("_peana", 0, 12));

// Consejero: capucha redonda con ojos en la sombra, borla arriba y túnica.
piece("advisor", { w: 13, h: 15 },
  circ(6, 1, 1, "o"),
  ellipse(6, 5, 4, 4, "o"),
  poly([4, 9, 8, 9, 11, 11, 1, 11], "o"),
  layer("lt", { light: 2 },
    circ(4, 3, 2, "k"),
    poly([1, 9, 5, 9, 4, 11, 1, 11], "k")),
  layer("sh", { shade: 1 }, rect(8, 2, 5, 8, "k")),
  layer("sh2", { shade: 1 }, rect(9, 9, 3, 2, "k")),
  px(5, 5, "k"), px(7, 5, "k"),
  hline(4, 10, 5, "O"),
  stamp("_peana", 0, 11));

// Alfil: mitra con cruz y bola, cintura y falda de campana.
piece("bishop", { w: 13, h: 16 },
  circ(6, 1, 1, "o"),
  poly([6, 2, 9, 7, 3, 7], "o"),
  rect(3, 7, 7, 1, "o"),
  rect(4, 8, 5, 2, "o"),
  poly([4, 10, 8, 10, 10, 12, 2, 12], "o"),
  layer("lt", { light: 2 },
    circ(5, 3, 2, "k"),
    rect(3, 7, 4, 1, "k"),
    rect(4, 8, 3, 2, "k"),
    poly([2, 10, 6, 10, 5, 12, 2, 12], "k")),
  layer("sh", { shade: 1 }, rect(7, 2, 5, 8, "k")),
  layer("sh2", { shade: 1 }, rect(8, 8, 4, 4, "k")),
  vline(6, 3, 3, "O"),
  hline(5, 4, 3, "O"),
  hline(4, 8, 5, "O"),
  stamp("_peana", 0, 12));

// Reina: cinco puntas con bola de latón, cabeza, gola y vestido ancho.
piece("queen", { w: 13, h: 17 },
  px(2, 0, "y"), px(4, 0, "y"), px(6, 0, "y"), px(8, 0, "y"), px(10, 0, "y"),
  vline(2, 1, 2, "o"), vline(4, 1, 2, "o"), vline(6, 1, 2, "o"), vline(8, 1, 2, "o"), vline(10, 1, 2, "o"),
  rect(2, 3, 9, 1, "o"),
  rect(1, 4, 11, 1, "o"),
  circ(6, 6, 2, "o"),
  rect(4, 8, 5, 2, "o"),
  poly([3, 10, 9, 10, 11, 13, 1, 13], "o"),
  layer("lt", { light: 2 },
    rect(1, 4, 5, 1, "k"),
    circ(5, 5, 2, "k"),
    rect(4, 8, 3, 2, "k"),
    poly([1, 10, 6, 10, 5, 13, 1, 13], "k")),
  layer("sh", { shade: 1 }, rect(7, 4, 5, 6, "k")),
  layer("sh2", { shade: 1 }, poly([7, 10, 11, 10, 11, 13, 7, 13], "k")),
  hline(4, 9, 5, "y"),
  hline(3, 11, 7, "O"),
  stamp("_peana", 0, 13));

// Rey: cruz, corona con gemas de latón, cabeza y manto ancho. El más alto.
piece("king", { w: 13, h: 18 },
  vline(6, 0, 4, "o"),
  hline(4, 1, 5, "o"),
  rect(3, 4, 7, 1, "o"),
  rect(2, 5, 9, 1, "o"),
  circ(6, 7, 2, "o"),
  rect(4, 9, 5, 1, "o"),
  poly([3, 10, 9, 10, 12, 14, 0, 14], "o"),
  layer("lt", { light: 2 },
    rect(5, 0, 2, 3, "k"),
    rect(2, 4, 5, 2, "k"),
    circ(5, 6, 2, "k"),
    rect(4, 9, 3, 1, "k"),
    poly([0, 10, 6, 10, 4, 14, 0, 14], "k")),
  layer("sh", { shade: 1 }, rect(7, 4, 5, 7, "k")),
  layer("sh2", { shade: 1 }, poly([6, 10, 12, 10, 12, 14, 6, 14], "k")),
  px(4, 5, "y"), px(8, 5, "y"),
  hline(3, 11, 7, "O"),
  stamp("_peana", 0, 14));

// ── Perfiles (filas enteras) ───────────────────────────────────────────────

// Elefante: busto de perfil mirando a la izquierda: frente redonda, oreja oscura
// con pliegue y trompa que baja por delante con el colmillo blanco al lado.
piece("elephant", { w: 13, h: 15 },
  ellipse(6, 3, 5, 3, "o"),
  ellipse(9, 2, 2, 3, "O"),
  line(3, 5, 3, 10, "o", 3),
  px(2, 10, "o"), px(1, 10, "o"), px(1, 9, "o"),
  px(5, 7, "w"), px(4, 8, "w"),
  layer("lt", { light: 2 }, ellipse(4, 1, 3, 2, "k"), rect(1, 5, 3, 5, "k")),
  layer("sh", { shade: 1 }, rect(11, 1, 2, 6, "k"), rect(6, 6, 7, 1, "k")),
  px(5, 3, "k"),
  ring(9, 2, 1, "o"),
  stamp("_peana", 0, 11));

// Camello: hocico caído a la izquierda, cuello diagonal y joroba alta separada
// del lomo por un pliegue.
piece("camel", { w: 15, h: 16 },
  rect(1, 0, 4, 3, "o"),
  px(5, 0, "o"), px(5, 1, "o"),
  rect(0, 3, 3, 2, "o"),
  line(4, 3, 8, 9, "o", 3),
  ellipse(10, 6, 3, 3, "o"),
  ellipse(7, 10, 5, 2, "o"),
  layer("lt", { light: 2 },
    circ(3, 1, 2, "k"),
    line(4, 3, 7, 7, "k", 2),
    ellipse(9, 5, 2, 2, "k"),
    poly([2, 10, 7, 10, 7, 12, 2, 12], "k")),
  layer("sh", { shade: 1 },
    rect(13, 3, 2, 8, "k"),
    rect(12, 9, 3, 3, "k"),
    rect(3, 11, 9, 1, "k")),
  px(2, 2, "k"),
  px(0, 4, "O"),
  line(6, 5, 8, 8, "O", 1),
  vline(7, 5, 4, "O"),
  px(13, 9, "o"), px(13, 10, "o"),
  stamp("_peana", 1, 12));

// Cañón al modo del set vectorial: mortero de tubo grueso y corto con brocal reforzado
// y boca abierta (el óvalo oscuro es el agujero), cureña ancha y rueda con radios y cruz.
piece("cannon", { w: 13, h: 15 },
  poly([2, 9, 10, 9, 11, 11, 1, 11], "b"),
  line(4, 8, 8, 3, "o", 5),
  circ(9, 2, 2, "o"),
  circ(3, 9, 3, "o"),
  layer("lt", { light: 2 },
    rect(3, 3, 5, 3, "k"),
    circ(8, 1, 2, "k"),
    circ(2, 8, 2, "k")),
  layer("sh", { shade: 1 },
    line(4, 9, 9, 4, "k", 2),
    rect(5, 6, 3, 5, "k")),
  ring(3, 9, 3, "O"),
  vline(3, 6, 3, "O"),
  hline(0, 9, 3, "O"),
  hline(4, 9, 3, "O"),
  px(3, 9, "y"),
  ellipse(9, 2, 1, 2, "O"),
  px(9, 2, "b"),
  px(6, 7, "y"),
  stamp("_peana", 0, 11));

// Caballo: cabeza de perfil a la izquierda, orejas cortas, crin al borde y cuello fino.
piece("knight", { w: 15, h: 16 },
  px(3, 0, "o"), px(5, 0, "o"),
  circ(4, 2, 3, "o"),
  poly([0, 3, 4, 3, 3, 7, 0, 7], "o"),
  line(5, 5, 10, 9, "o", 3),
  rect(4, 10, 9, 2, "o"),
  layer("lt", { light: 2 },
    circ(3, 1, 2, "k"),
    poly([0, 3, 3, 3, 2, 7, 0, 7], "k"),
    line(5, 4, 9, 8, "k", 2),
    rect(4, 10, 4, 2, "k")),
  layer("sh", { shade: 1 },
    rect(6, 1, 3, 4, "k"),
    line(9, 7, 12, 10, "k", 2),
    rect(11, 10, 2, 2, "k")),
  layer("sh2", { shade: 1 }, hline(4, 11, 9, "k")),
  px(3, 2, "k"),
  px(0, 6, "k"),
  line(6, 4, 11, 8, "O", 1),
  stamp("_peana", 1, 12));

// La hoja de control: una fila por bando para mirar el set entero de una vez.
sheet("pixelada", [
  "pawn_l", "pawn_d", "pawn_w", "rook_l", "rook_d", "rook_w",
  "guard_l", "guard_d", "guard_w", "advisor_l", "advisor_d", "advisor_w",
  "bishop_l", "bishop_d", "bishop_w", "queen_l", "queen_d", "queen_w",
  "king_l", "king_d", "king_w", "elephant_l", "elephant_d", "elephant_w",
  "camel_l", "camel_d", "camel_w", "cannon_l", "cannon_d", "cannon_w",
  "knight_l", "knight_d", "knight_w",
], { pad: 1, cols: 12 });
