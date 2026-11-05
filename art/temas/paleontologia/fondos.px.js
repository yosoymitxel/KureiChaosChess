// Pixel art de paleontología; RLE de una pasada por fila para conservar cada píxel.
pal({
  0:"#241c16", 1:"#251b15", 2:"#30271f", 3:"#3a2d22", 4:"#4a3828", 5:"#514132", 6:"#57412d", 7:"#57422e", 8:"#6e5439", 9:"#6f5944", a:"#867457", b:"#8b755d", c:"#8c4d25", d:"#927653", e:"#92795a", f:"#b59a72", g:"#b69b72", h:"#c27a31", i:"#c9b28c", j:"#e4c58c", k:"#e6d1a8", l:"#e7d5b3", m:"#f0bb53", n:"#fff3d7"
});
const countChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const runSprite = (name, w, h, rows) => sprite(name, { w, h }, (c) => {
  rows.forEach((row, y) => {
    let x = 0;
    for (let i = 0; i < row.length; i += 2) {
      const key = row[i], n = countChars.indexOf(row[i + 1]) + 1;
      if (key !== ".") c.rect(x, y, n, 1, key);
      x += n;
    }
  });
});

runSprite("tile-a", 16, 16, [
  "if",
  "lf",
  "if",
  "i3e0ia",
  "i4e0i9",
  "if",
  "ef",
  "gf",
  "if",
  "iae0i3",
  "i9e0i4",
  "if",
  "if",
  "ef",
  "lf",
  "if",
]);

runSprite("tile-a2", 16, 16, [
  "if",
  "lb50l2",
  "ia50i3",
  "i3e0i550i3",
  "i4e0i350i4",
  "i950i4",
  "ea50e3",
  "ga50g3",
  "ib50i2",
  "ia50i3",
  "i950i4",
  "i850i5",
  "i7g0i6",
  "ef",
  "lf",
  "if",
]);

runSprite("tile-a3", 16, 16, [
  "if",
  "lf",
  "if",
  "i3e0ia",
  "i4e0i0e2i5",
  "i5e0i0l0i0e0i4",
  "e750e6",
  "g4e0g052g0e0g3",
  "i4e0i052i0e0i3",
  "i4e0i052i0e0i3",
  "i4e0i150i0e1i3",
  "i5e0i050i0e0i4",
  "i6e2i5",
  "ef",
  "lf",
  "if",
]);

runSprite("tile-b", 16, 16, [
  "bf",
  "ff",
  "bf",
  "b350ba",
  "b450b9",
  "bf",
  "5f",
  "9f",
  "bf",
  "ba50b3",
  "b950b4",
  "bf",
  "bf",
  "5f",
  "ff",
  "bf",
]);

runSprite("tile-b2", 16, 16, [
  "bf",
  "ff",
  "bf",
  "b350ba",
  "b450b9",
  "b550f250b4",
  "55f052f054",
  "9350f094f05092",
  "b350f0b1j0b250b2",
  "b350b551b2",
  "b450b351b3",
  "b554b4",
  "bf",
  "5f",
  "ff",
  "bf",
]);

runSprite("tile-b3", 16, 16, [
  "bf",
  "ff",
  "bf",
  "b350ba",
  "b450b1h0b6",
  "b6h2b5",
  "56h1m0h054",
  "95h1m0n0m0h093",
  "b4h1m4h0b2",
  "b4h2m2h0b3",
  "b5h2m0h1b3",
  "b5h4b4",
  "b9h0b4",
  "5f",
  "ff",
  "bf",
]);

runSprite("table", 32, 32, [
  "7v",
  "37003e0036",
  "370034c0380036",
  "370032c0m0c0380036",
  "370032c3370036",
  "370033c1380036",
  "370033c0390036",
  "8v",
  "4e004f",
  "4e004f",
  "4e004f",
  "4e004f",
  "4e004f",
  "4e004f",
  "4e004f",
  "4v",
  "23002k0024",
  "23002k0020h022",
  "23002k00h0m0h021",
  "23002kh420",
  "23002k00h221",
  "23002k0020h022",
  "23002k0024",
  "8v",
  "7a007e0073",
  "74a272007e0073",
  "72a172a170007e0073",
  "72a074a070007e0073",
  "7a007e0073",
  "7a007e0073",
  "7a007e0073",
  "7a007e0073",
]);

runSprite("panel", 12, 12, [
  ".b",
  ".010k1d3k110.0",
  ".0k0h0.5h060.0",
  ".0k0.760.0",
  ".0d0.760.0",
  ".0d0.760.0",
  ".0d0.760.0",
  ".0d0.760.0",
  ".0k0.760.0",
  ".0k0d0.5d060.0",
  ".0106710.0",
  ".b",
]);

runSprite("boton", 12, 12, [
  ".b",
  ".010k1d3k110.0",
  ".0k0m0.5m060.0",
  ".0k0.760.0",
  ".0d0.760.0",
  ".0d0.760.0",
  ".0d0.760.0",
  ".0d0.760.0",
  ".0k0.760.0",
  ".0k0d0.5d060.0",
  ".0106710.0",
  ".b",
]);

