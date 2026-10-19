// El set del tema "Pixelada": las once piezas de Zug como personajes de fantasía medieval.
// Cada uno con una silueta propia que se lee a 30 px: lanza, gólem almenado, jinete, mago con
// sombrero, hechicera, rey con capa, escudero, monje con farol, elefante de guerra, camello con
// jinete y enano artillero. La ropa usa la rampa del bando (w W o O b) y se recolorea; piel, metal,
// madera, barba y latón son fijos para los tres bandos.
// Reconstruir:  node <pxl>/bin/pxl.js build art/pixelada.px.js  &&  node tools/pixel-art.mjs

pal({
  k: "#2a2233", // tinta: contorno e interiores
  w: "#f8f0dc", W: "#e8d5ac", o: "#c9a468", O: "#9a7440", b: "#6b4d2c", // marfil y roble (claro)
  p: "#a48fce", P: "#7d63b0", q: "#5a4487", Q: "#3a2a5c", // ciruela (oscuro), la del tema Pixelada
  t: "#a8e8cd", T: "#5ec3a4", u: "#338f77", U: "#1f6152", // verdemar (salvaje)
  s: "#f1c5a0", S: "#c98e6c", // piel
  m: "#d6dde6", M: "#8a95a5", // metal
  n: "#9a6a3e", N: "#5e3c22", // madera
  g: "#e9e6df", G: "#a9a49a", // barba y pelo canos
  y: "#f0c85a", Y: "#b08530", // latón
  f: "#9fe3ff", F: "#4aa8d8", // luz de magia
  e: "#ffb347", // fuego del farol y la mecha
});
ramps("bOoWw", "QqPp", "UuTt", "SsS", "MmM", "Yy");

const DARK = { w: "p", W: "P", o: "q", O: "Q", b: "Q" };
const WILD = { w: "t", W: "T", o: "u", O: "U", b: "U" };

const piece = (name, art) => {
  sprite("_" + name, art);
  sprite(name + "_l", { base: "_" + name, outline: "k" });
  sprite(name + "_d", { base: "_" + name, swap: DARK, outline: "k" });
  sprite(name + "_w", { base: "_" + name, swap: WILD, outline: "k" });
};

// Peón: soldadito de casco redondo con la lanza al hombro. El más bajito.
piece("pawn", `
  .........y.
  ........yYy
  ...mmm...n.
  ..mmmmM..n.
  ..mMMMM..n.
  ..ssss...n.
  ..skks...n.
  ..ssss..sn.
  .owwwwo.sn.
  owwWWwwoon.
  owwwwwwo.n.
  .oWWWWo..n.
  .oo..oo..n.
  .bb..bb..N.`);

// Torre: gólem de piedra con la cabeza almenada como una torre, puños enormes.
piece("rook", `
  ...w.ww.ww.w...
  ...wwwwwwwww...
  ...wWkwwwkWw...
  ...wWWwwwWWw...
  ....oooooooo...
  .oooWWWWWWWooo.
  owwoWwwwwwWowwo
  owwoWwwWwwWowwo
  oWWoWwwwwwWoWWo
  .oo.oWWWWWo.oo.
  ....oWo.oWo....
  ...oWWo.oWWo...
  ...bbb...bbb...`);

// Caballo: jinete con lanza sobre un caballo de perfil mirando a la izquierda.
piece("knight", `
  ...........y...
  ..........yYy..
  ...........n...
  ..b.....mmmn...
  .bwb....mskn...
  .bwwb..owwwo...
  bwwwwb.oWwwo...
  wkwwwwboWwo....
  wwwwwwwbooo....
  .ww.bwwwwwwWo..
  ....bwwwwwWWWo.
  .....wwwWWWWWo.
  .....oWWWWWWo..
  .....oWo..oWo..
  .....oWo..oWo..
  .....bbb..bbb..`);

// Alfil: mago de sombrero puntiagudo caído, barba larga y bastón con la piedra encendida.
piece("bishop", `
  .....w.......
  ....ww....f..
  ...wwW...fFf.
  ...wWW....f..
  ..wwWWW...n..
  .ooooooo..n..
  ...ssss...n..
  ...skks...n..
  ...gggg..sn..
  ..ogggggson..
  ..owgggwo.n..
  .owwwgwwwon..
  .owwwWwwwo...
  .oWWWWWWWo...
  oWWWWWWWWWo..
  bbbbbbbbbbb..`);

// Reina: hechicera con corona de tres puntas, melena y vestido largo; la varita con estrella.
piece("queen", `
  ...y.y.y.....
  ...yyyyy..y..
  ..NnnnnnN.yfy
  .NnssssnN..y.
  .NnskksnN..n.
  .NnssssnN..n.
  .N.ossso..sn.
  ..owwwwwo.s..
  .owwWyWwwoo..
  .owwwWwwwo...
  .oWwwwwwWo...
  owWwwwwwWwo..
  oWWwwwwwWWo..
  oWWWWWWWWWWo.
  bbbbbbbbbbbb.`);

// Rey: corona grande con gemas, barba ancha, capa abierta y cetro de latón.
piece("king", `
  ..y.y.y.y.....
  ..yyyyyyy..y..
  ..yfyyyfy.yYy.
  ...sssss...y..
  ...skssk...n..
  ...sssss...n..
  ..ggggggg..n..
  .oggggggggsn..
  owwgggggwwsn..
  owwwgggwwwo...
  oWwwwyWwwWo...
  oWwwwwwwwWWo..
  oWWwwwwwwWWo..
  oWWWWWWWWWWWo.
  bbbbbbbbbbbbb.`);

// Guardia: escudero de yelmo con penacho, escudo redondo delante con la cruz de latón.
piece("guard", `
  .....o.......
  ....oo.......
  ...mmmmm.....
  ..mmmmmmM....
  ..mkkkkkM....
  ..mmmmmmM....
  ...sssss.....
  ..wwoooooo...
  .wwowwywwoo..
  .wowwwywwwO..
  .woyyyyyyyO..
  .wowwwywwwO..
  ..oowwywwoo..
  ...OoooooO...
  ...bb..bb....`);

// Consejero: monje con capucha honda, ojos en la sombra y farol encendido en la mano.
piece("advisor", `
  ....ooo......
  ...owwwo.....
  ..owwWWwo....
  ..owkbkWo....
  ..owbbbWo....
  ..owwWWwo.n..
  .owwwwwwwonn.
  .owwWwwwwo.y.
  .owwWwwwso.e.
  .owwWwwwwo.y.
  .oWwWwwwWo...
  .oWWWWWWWo...
  oWWWWWWWWWo..
  bbbbbbbbbbb..`);

// Elefante: elefante de guerra de perfil con trompa, colmillo y una torrecilla en el lomo.
piece("elephant", `
  ........y.y.y...
  ........yyyyy...
  ........ywwwy...
  ...oooo.yyyyy...
  ..owwwwooooooo..
  .owkwwWwwwwwwwo.
  owwwWWWwwwwwwwwo
  owwWWWwwwwwwwwwo
  ow.gwWwwwwwwwWWo
  ow.goWWwwwwwWWWo
  ow..oWWWWWWWWWWo
  ow...oWo..oWWo..
  .o...oWo..oWo...
  .....bbb..bbb...`);

// Camello: camello de perfil con jinete de turbante entre las dos jorobas.
piece("camel", `
  ........yyy......
  .......yYyyy.....
  ........sss......
  ........sks......
  .......owwwo.....
  ..oo...oWWo......
  .owwo.oowwoo.oo..
  owwkwowwwwwwowwo.
  .ooowwwwwwwwwwwwo
  ...owwwwwWWWWwwwo
  ...owWWWWWWWWWWo.
  ...oWo.oWo.oWo...
  ...oWo.oWo.oWo...
  ...bbb.bbb.bbb...`);

// Cañón: enano artillero de barba trenzada junto a su cañón con la mecha encendida.
piece("cannon", `
  ........e.......
  ........y.......
  ..oo...MMMMMMMk.
  .owwo.MmmmmmmmMk
  .ssss.MmmmmmmmMk
  .skks.MMMMMMMMk.
  .ssss...nNNn....
  .gggg..nNyyNn...
  owgggo.nyNNyn...
  owwgwo.nNyyNn...
  oWWWWo..nNNn....
  .bb.bb..........`);

// La hoja de control: una fila por bando para mirar el set entero de una vez.
sheet("pixelada", ["*_l", "*_d", "*_w"], { pad: 2 });
