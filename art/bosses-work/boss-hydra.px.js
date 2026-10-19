// Jefe 3: Hidra. Serpiente de 3 cabezas: base ancha, tres cuellos que suben con tres
// cabezas (ojos de latón en cada una) y boca abajo. Cuerpo en la rampa del bando (w W),
// panza W y base U fijas. Base 20x20 (con outline k queda en 22x22).
// Reconstruir: node <pxl>/bin/pxl.js build art/bosses-work/boss-hydra.px.js

pal({ k:"#2a2233", w:"#f8f0dc", W:"#e8d5ac", o:"#c9a468", O:"#9a7440", b:"#6b4d2c", p:"#a48fce", P:"#7d63b0", q:"#5a4487", Q:"#3a2a5c", t:"#a8e8cd", T:"#5ec3a4", u:"#338f77", U:"#1f6152", s:"#f1c5a0", S:"#c98e6c", m:"#d6dde6", M:"#8a95a5", n:"#9a6a3e", N:"#5e3c22", g:"#e9e6df", G:"#a9a49a", y:"#f0c85a", Y:"#b08530", f:"#9fe3ff", F:"#4aa8d8", e:"#ffb347" });
ramps("bOoWw", "QqPp", "UuTt", "SsS", "MmM", "Yy");

const DARK = { w:"p", W:"P", o:"q", O:"Q", b:"Q" };
const WILD = { w:"t", W:"T", o:"u", O:"U", b:"U" };

const piece = (name, art) => {
  sprite("_" + name, art);
  sprite(name + "_l", { base: "_" + name, outline: "k" });
  sprite(name + "_d", { base: "_" + name, swap: DARK, outline: "k" });
  sprite(name + "_w", { base: "_" + name, swap: WILD, outline: "k" });
};

piece("boss-hydra", `
.........kk.........
........kkkkkk.......
kkkkk..kkkkkk..kkkkk
kywyk..kkkkkk..kywyk
kkkkk..kywwyk..kkkkk
kkkkk..kkkkkk..kkkkk
..k......kk......k..
..kkk...kkkk...kkk..
..kww...kWWk...wwk..
..kww...kWWk...wwk..
..kwwk..kWWk..kwwk..
..kwwk..kWWk..kwwk..
kwwwwk..kWWk..kwwwwk
kwwwwwwwwWWwwwwwwwwk
kwwwwwwwwWWwwwwwwwwk
kwwwwwwwwWWwwwwwwwwk
kUwwwwwwwWWwwwwwwwUk
kUUwwwwwwWWwwwwwwUUk
kUUUUwwwwWWwwwwUUUUk
kUUUUUUUUUUUUUUUUUUk`);

sheet("jefe_hydra", ["boss-hydra_l","boss-hydra_d","boss-hydra_w"], {pad:1, cols:1});
