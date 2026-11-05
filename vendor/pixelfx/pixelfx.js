// pixelfx (https://github.com/patch-gg/pixelfx): núcleo y 7 efectos empaquetados con esbuild, sin otros cambios.
// MIT License. Copyright (c) 2026 Patch. Partes adaptan Sprite Fusion Pixel Art VFX, Copyright (c) 2026 Hugo Duprez, MIT.
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// pixelfx/src/core/math.js
var TAU = Math.PI * 2, clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x, lerp = (a, b, t) => a + (b - a) * t;
var seg = (t, t0, t1) => clamp((t - t0) / (t1 - t0)), smooth = (e0, e1, x) => {
  let t = seg(x, e0, e1);
  return t * t * (3 - 2 * t);
};
var ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inQuart: (t) => t * t * t * t,
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inExpo: (t) => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  outExpo: (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inSine: (t) => 1 - Math.cos(t * Math.PI / 2),
  outSine: (t) => Math.sin(t * Math.PI / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inBack: (t, s = 1.70158) => t <= 0 ? 0 : t >= 1 ? 1 : (s + 1) * t * t * t - s * t * t,
  outBack: (t, s = 1.70158) => t <= 0 ? 0 : t >= 1 ? 1 : 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  outElastic: (t) => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
  outBounce: (t) => t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
};
function hash(...ns) {
  let h = 2654435769;
  for (let n of ns)
    h = Math.imul(h ^ (n | 0), 2246822507), h ^= h >>> 13, h = Math.imul(h, 3266489909), h ^= h >>> 16;
  return h >>> 0;
}
var rand = (...ns) => hash(...ns) / 4294967296, Rng = class {
  constructor(seed = 1) {
    this.s = seed >>> 0 || 1;
  }
  next() {
    let t = this.s = this.s + 1831565813 >>> 0;
    return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  range(a, b) {
    return a + (b - a) * this.next();
  }
  int(a, b) {
    return Math.floor(this.range(a, b + 1));
  }
  chance(p) {
    return this.next() < p;
  }
  sign() {
    return this.next() < 0.5 ? -1 : 1;
  }
  pick(list) {
    return list[Math.floor(this.next() * list.length)];
  }
  /** Roughly normal, mean 0, sd 1. */
  gauss() {
    return (this.next() + this.next() + this.next() + this.next() - 2) * 1.732;
  }
};
function noise(x, seed = 0) {
  let i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(rand(i, seed), rand(i + 1, seed), u) * 2 - 1;
}
function noise2(x, y, seed = 0) {
  let ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), a = rand(ix, iy, seed), b = rand(ix + 1, iy, seed), c = rand(ix, iy + 1, seed), d = rand(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

// pixelfx/src/core/color.js
var rgb = (r, g, b) => 255 << 24 | (b & 255) << 16 | (g & 255) << 8 | r & 255, red = (c) => c & 255, green = (c) => c >>> 8 & 255, blue = (c) => c >>> 16 & 255;
function hex(h) {
  if (typeof h == "number") return h;
  let s = h.replace("#", "");
  s.length === 3 && (s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2]);
  let v = parseInt(s.slice(0, 6), 16);
  return rgb(v >> 16 & 255, v >> 8 & 255, v & 255);
}
var toHex = (c) => "#" + [red(c), green(c), blue(c)].map((v) => v.toString(16).padStart(2, "0")).join("");
function mix(a, b, t) {
  return t = clamp(t), rgb(red(a) + (red(b) - red(a)) * t, green(a) + (green(b) - green(a)) * t, blue(a) + (blue(b) - blue(a)) * t);
}
var scale = (c, k) => rgb(Math.min(255, red(c) * k), Math.min(255, green(c) * k), Math.min(255, blue(c) * k));
var ramp = (list) => list.map(hex);
function fit(r, n) {
  return r = r.map(hex), r.length === n ? r : Array.from({ length: n }, (_, i) => r[Math.round(i * (r.length - 1) / Math.max(1, n - 1))]);
}
var PAL = {
  fire: ["#1f0b10", "#4a1118", "#8c1d1c", "#cc3a1a", "#f2701f", "#ffae35", "#ffe27a", "#fff8d6"],
  ember: ["#1a0a0e", "#3d1012", "#701a14", "#a8301a", "#e0561e", "#ff8a2a", "#ffc46a"],
  lava: ["#14060a", "#380a10", "#6e1210", "#ac2410", "#e8501a", "#ff8c2a", "#ffd25a"],
  smoke: ["#0e0c12", "#1d1a22", "#2e2a35", "#433e4b", "#5c5664", "#7b7484", "#a39cab"],
  dust: ["#1c1610", "#33281c", "#4f3f2c", "#6e5a40", "#927a58", "#b89f78", "#dcc8a2"],
  ice: ["#0c1430", "#162c5c", "#1f4f94", "#2f7fcc", "#58b4ec", "#9bdcff", "#d8f4ff", "#ffffff"],
  water: ["#081830", "#0e2e5a", "#14508c", "#1c76bc", "#36a2e0", "#78ccf4", "#c4ecff", "#ffffff"],
  electric: ["#0a0f2e", "#172a78", "#2550d0", "#3f8cff", "#7cc8ff", "#c8f0ff", "#ffffff"],
  volt: ["#24160a", "#5e3a0c", "#a8680f", "#e8a218", "#ffd23c", "#fff08a", "#ffffff"],
  poison: ["#0d1a0c", "#173a14", "#265e18", "#3f8a1e", "#6cb82a", "#a8e04a", "#e0ff8a"],
  holy: ["#2a1c08", "#5a3e10", "#9a6c18", "#d8a428", "#ffd84a", "#fff09a", "#fffbe6", "#ffffff"],
  heal: ["#08201a", "#0f3f2c", "#17663e", "#24924e", "#3ec466", "#7ee88a", "#c8ffc4", "#ffffff"],
  arcane: ["#140a26", "#2b1252", "#481c88", "#6b2cc0", "#9a48ec", "#c684ff", "#ecc8ff", "#ffffff"],
  shadow: ["#050308", "#0f0a18", "#1c1230", "#2c1a4a", "#432468", "#5e3290", "#8048b8", "#a970e0"],
  blood: ["#14040a", "#3a0a14", "#6a101c", "#a01824", "#d42a30", "#ff5a50", "#ff9a8a"],
  earth: ["#140e0a", "#2a1e14", "#47321e", "#69492a", "#8e6638", "#b88a52", "#dcb47c"],
  stone: ["#0e0e12", "#1c1c24", "#2c2c38", "#42424f", "#5c5c6b", "#7d7d8c", "#a4a4b2", "#d0d0da"],
  gold: ["#1e1206", "#4a2c08", "#86520c", "#c48412", "#f0b424", "#ffe066", "#fff6c4", "#ffffff"],
  leaf: ["#0c1a0e", "#163418", "#225224", "#357530", "#4f9a3a", "#7cc048", "#b4e070", "#e4ffb0"],
  wood: ["#160c06", "#2e1a0c", "#4a2c14", "#6a421e", "#8e5c2c", "#b47c40", "#d8a464"],
  metal: ["#0c0e14", "#1c2230", "#2e3648", "#4a5468", "#6e7a90", "#9aa6ba", "#d0d8e6", "#ffffff"],
  bone: ["#1a1814", "#3a352c", "#5e5648", "#8a806c", "#b8ad96", "#e4dcc8", "#fffaf0"],
  neon: ["#1a0516", "#3d0a33", "#701560", "#b0228f", "#f53cd1", "#ff86e6", "#ffd2f6", "#ffffff"],
  cyber: ["#041418", "#08303a", "#0c5260", "#108088", "#18b4b0", "#4ce8d8", "#b4fff0", "#ffffff"],
  matrix: ["#020a04", "#05200c", "#0a3c16", "#106624", "#1a9a34", "#3cd650", "#a4ffa8", "#e8ffe8"],
  candy: ["#ff4a5a", "#ff9a2a", "#ffe03c", "#5ad84a", "#3cc8ff", "#7a6cff", "#f53cd1"],
  night: ["#07060d", "#0c0a18", "#131026", "#1b1734", "#241f44", "#2f2956"]
}, RAMP = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, ramp(v)])), WHITE = hex("#ffffff"), BLACK = hex("#000000"), INK = hex("#0b0a10"), PATCH = hex("#f53cd1");

// pixelfx/src/core/font.js
var MINI = {
  A: ".#.|#.#|###|#.#|#.#",
  B: "##.|#.#|##.|#.#|##.",
  C: ".##|#..|#..|#..|.##",
  D: "##.|#.#|#.#|#.#|##.",
  E: "###|#..|##.|#..|###",
  F: "###|#..|##.|#..|#..",
  G: ".##|#..|#.#|#.#|.##",
  H: "#.#|#.#|###|#.#|#.#",
  I: "###|.#.|.#.|.#.|###",
  J: "..#|..#|..#|#.#|.#.",
  K: "#.#|#.#|##.|#.#|#.#",
  L: "#..|#..|#..|#..|###",
  M: "#.#|###|###|#.#|#.#",
  N: "##.|#.#|#.#|#.#|#.#",
  O: ".#.|#.#|#.#|#.#|.#.",
  P: "##.|#.#|##.|#..|#..",
  Q: ".#.|#.#|#.#|##.|.##",
  R: "##.|#.#|##.|#.#|#.#",
  S: ".##|#..|.#.|..#|##.",
  T: "###|.#.|.#.|.#.|.#.",
  U: "#.#|#.#|#.#|#.#|###",
  V: "#.#|#.#|#.#|#.#|.#.",
  W: "#.#|#.#|###|###|#.#",
  X: "#.#|#.#|.#.|#.#|#.#",
  Y: "#.#|#.#|.#.|.#.|.#.",
  Z: "###|..#|.#.|#..|###",
  0: "###|#.#|#.#|#.#|###",
  1: ".#.|##.|.#.|.#.|###",
  2: "##.|..#|.#.|#..|###",
  3: "##.|..#|.#.|..#|##.",
  4: "#.#|#.#|###|..#|..#",
  5: "###|#..|##.|..#|##.",
  6: ".##|#..|###|#.#|###",
  7: "###|..#|.#.|.#.|.#.",
  8: "###|#.#|###|#.#|###",
  9: "###|#.#|###|..#|##.",
  "+": "...|.#.|###|.#.|...",
  "-": "...|...|###|...|...",
  "!": "#|#|#|.|#",
  "?": "##.|..#|.#.|...|.#.",
  ".": ".|.|.|.|#",
  ",": "..|..|..|.#|#.",
  ":": ".|#|.|#|.",
  "/": "..#|..#|.#.|#..|#..",
  "%": "#.#|..#|.#.|#..|#.#",
  x: "...|#.#|.#.|#.#|...",
  "*": "#.#|.#.|#.#|...|...",
  "'": "#|#|.|.|.",
  "(": ".#|#.|#.|#.|.#",
  ")": "#.|.#|.#|.#|#.",
  "<": "..#|.#.|#..|.#.|..#",
  ">": "#..|.#.|..#|.#.|#..",
  "=": "...|###|...|###|...",
  _: "...|...|...|...|###",
  "#": "#.#|###|#.#|###|#.#"
}, BIG = {
  A: ".###.|#...#|#...#|#####|#...#|#...#|#...#",
  B: "####.|#...#|#...#|####.|#...#|#...#|####.",
  C: ".###.|#...#|#....|#....|#....|#...#|.###.",
  D: "####.|#...#|#...#|#...#|#...#|#...#|####.",
  E: "#####|#....|#....|####.|#....|#....|#####",
  F: "#####|#....|#....|####.|#....|#....|#....",
  G: ".###.|#...#|#....|#.###|#...#|#...#|.####",
  H: "#...#|#...#|#...#|#####|#...#|#...#|#...#",
  I: "###|.#.|.#.|.#.|.#.|.#.|###",
  J: "..###|...#.|...#.|...#.|...#.|#..#.|.##..",
  K: "#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#",
  L: "#....|#....|#....|#....|#....|#....|#####",
  M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#",
  N: "#...#|#...#|##..#|#.#.#|#..##|#...#|#...#",
  O: ".###.|#...#|#...#|#...#|#...#|#...#|.###.",
  P: "####.|#...#|#...#|####.|#....|#....|#....",
  Q: ".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#",
  R: "####.|#...#|#...#|####.|#.#..|#..#.|#...#",
  S: ".####|#....|#....|.###.|....#|....#|####.",
  T: "#####|..#..|..#..|..#..|..#..|..#..|..#..",
  U: "#...#|#...#|#...#|#...#|#...#|#...#|.###.",
  V: "#...#|#...#|#...#|#...#|#...#|.#.#.|..#..",
  W: "#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.",
  X: "#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",
  Y: "#...#|#...#|.#.#.|..#..|..#..|..#..|..#..",
  Z: "#####|....#|...#.|..#..|.#...|#....|#####",
  0: ".###.|#...#|#..##|#.#.#|##..#|#...#|.###.",
  1: ".#.|##.|.#.|.#.|.#.|.#.|###",
  2: ".###.|#...#|....#|...#.|..#..|.#...|#####",
  3: "#####|...#.|..#..|...#.|....#|#...#|.###.",
  4: "...#.|..##.|.#.#.|#..#.|#####|...#.|...#.",
  5: "#####|#....|####.|....#|....#|#...#|.###.",
  6: "..##.|.#...|#....|####.|#...#|#...#|.###.",
  7: "#####|....#|...#.|..#..|.#...|.#...|.#...",
  8: ".###.|#...#|#...#|.###.|#...#|#...#|.###.",
  9: ".###.|#...#|#...#|.####|....#|...#.|.##..",
  "!": "#|#|#|#|#|.|#",
  "?": ".###.|#...#|....#|...#.|..#..|.....|..#..",
  "+": ".....|..#..|..#..|#####|..#..|..#..|.....",
  "-": "....|....|....|####|....|....|....",
  ".": ".|.|.|.|.|.|#",
  ",": "..|..|..|..|..|.#|#.",
  ":": ".|.|#|.|.|#|.",
  "/": "....#|....#|...#.|..#..|.#...|#....|#....",
  "%": "##...|##..#|...#.|..#..|.#...|#..##|...##",
  x: ".....|.....|#...#|.#.#.|..#..|.#.#.|#...#",
  "*": ".....|..#..|#.#.#|.###.|#.#.#|..#..|.....",
  "'": "#|#|.|.|.|.|.",
  "<": "...#|..#.|.#..|#...|.#..|..#.|...#",
  ">": "#...|.#..|..#.|...#|..#.|.#..|#...",
  "=": "....|....|####|....|####|....|....",
  "(": "..#|.#.|#..|#..|#..|.#.|..#",
  ")": "#..|.#.|..#|..#|..#|.#.|#..",
  "#": ".#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#."
};
function build(table, h) {
  let out = {};
  for (let [ch, src] of Object.entries(table)) {
    let rows = src.split("|");
    if (out[ch] = { w: rows[0].length, rows: rows.map((r) => [...r].map((c) => c === "#")) }, rows.length !== h) throw new Error(`glyph ${ch} has ${rows.length} rows, expected ${h}`);
  }
  return out;
}
var FONTS = {
  mini: { h: 5, space: 2, gap: 1, glyphs: build(MINI, 5) },
  big: { h: 7, space: 3, gap: 1, glyphs: build(BIG, 7) }
};
function textWidth(str, font = "mini") {
  let F = FONTS[font], w = 0;
  for (let ch of String(str)) {
    let g = F.glyphs[ch] ?? F.glyphs[ch.toUpperCase()];
    w += (g ? g.w : F.space) + F.gap;
  }
  return Math.max(0, w - F.gap);
}
function rasterText(str, font, plot2) {
  let F = FONTS[font], x = 0;
  for (let ch of String(str)) {
    let g = F.glyphs[ch] ?? F.glyphs[ch.toUpperCase()];
    if (!g) {
      x += F.space + F.gap;
      continue;
    }
    for (let r = 0; r < F.h; r++) for (let c = 0; c < g.w; c++) g.rows[r][c] && plot2(x + c, r);
    x += g.w + F.gap;
  }
}

// pixelfx/src/core/painter.js
var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16), OUT = { c: 0, a: 1, l: 0, k: 0 }, sprites = /* @__PURE__ */ new WeakMap(), call = (v, ...args) => typeof v == "function" ? v(...args) : v, Painter = class {
  constructor(frame2) {
    this.frame = frame2, this.reset();
  }
  /** Re-read the frame and clear placement, fade and light strength. */
  reset() {
    let f = this.frame;
    return this.w = f.w, this.h = f.h, this.ox = f.ox | 0, this.oy = f.oy | 0, this.C = f.color, this.L = f.light, this.tx = 0, this.ty = 0, this.fx = 1, this.cs = 1, this.sn = 0, this.fade = 1, this.lightK = 1, this.layer = "front", this;
  }
  /** Put the effect's origin at (x, y) in frame space, mirrored if flip, rotated by angle (radians). */
  place(x, y, flip = !1, angle = 0) {
    return this.tx = x, this.ty = y, this.fx = flip ? -1 : 1, this.cs = Math.cos(angle), this.sn = Math.sin(angle), this;
  }
  // ---- transforms: local (effect) space <-> screen (frame) space
  toX(x, y) {
    return this.tx + x * this.fx * this.cs - y * this.sn;
  }
  toY(x, y) {
    return this.ty + x * this.fx * this.sn + y * this.cs;
  }
  fromX(sx, sy) {
    let dx = sx - this.tx, dy = sy - this.ty;
    return (dx * this.cs + dy * this.sn) * this.fx;
  }
  fromY(sx, sy) {
    let dx = sx - this.tx, dy = sy - this.ty;
    return -dx * this.sn + dy * this.cs;
  }
  // the screen pixel of the local pixel cell holding (x, y): mirrors and rotations land on whole cells
  cellX(x, y) {
    return Math.floor(this.toX(Math.floor(x) + 0.5, Math.floor(y) + 0.5));
  }
  cellY(x, y) {
    return Math.floor(this.toY(Math.floor(x) + 0.5, Math.floor(y) + 0.5));
  }
  // ---- raw writes, screen space, whole pixels. Color 0 means "nothing": it never erases what's there.
  put(sx, sy, c, a = 1) {
    if (!c || (a *= this.fade, a < 1 && a <= BAYER[(sy & 3) << 2 | sx & 3])) return;
    let x = sx - this.ox, y = sy - this.oy;
    x < 0 || y < 0 || x >= this.w || y >= this.h || (this.C[y * this.w + x] = c);
  }
  add(sx, sy, c, k = 1) {
    if (k *= this.fade * this.lightK, k <= 4e-3) return;
    let x = sx - this.ox, y = sy - this.oy;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    let i = y * this.w + x, d = this.L[i], r = Math.min(255, (d & 255) + (c & 255) * k) | 0, g = Math.min(255, (d >>> 8 & 255) + (c >>> 8 & 255) * k) | 0, b = Math.min(255, (d >>> 16 & 255) + (c >>> 16 & 255) * k) | 0;
    this.L[i] = 255 << 24 | b << 16 | g << 8 | r;
  }
  /**
   * Blend a color over what's there at alpha a (0..1), keeping the result's own alpha: soft smoke, vapour and
   * mist. Use dithered dot() for hard pixel fades and blend() for translucent volumes.
   */
  blendPx(sx, sy, c, a) {
    if (a *= this.fade, !c || a <= 4e-3) return;
    let x = sx - this.ox, y = sy - this.oy;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    let i = y * this.w + x, d = this.C[i], da = (d >>> 24) / 255, oa = a + da * (1 - a), k = a / oa, ch = (s) => (c >>> s & 255) * k + (d >>> s & 255) * (1 - k) & 255;
    this.C[i] = (oa * 255 & 255) << 24 | ch(16) << 16 | ch(8) << 8 | ch(0);
  }
  /** Translucent pixel at a local point. */
  blend(x, y, c, a) {
    this.blendPx(this.cellX(x, y), this.cellY(x, y), c, a);
  }
  /** A translucent disc: puffs of smoke, vapour, dust. c and a may be functions of (d: 0 center..1 rim, angle). */
  disc(cx, cy, r, c, a) {
    if (r < 0.5) return this.blend(cx, cy, call(c, 0, 0), call(a, 0, 0));
    this.each(cx - r, cy - r, cx + r, cy + r, (x, y, sx, sy) => {
      let dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
      if (d2 > r * r) return;
      let d = Math.sqrt(d2) / r, ang = Math.atan2(dy, dx);
      this.blendPx(sx, sy, call(c, d, ang), call(a, d, ang));
    });
  }
  /** Read back the color under a local point (0 if empty). */
  get(x, y) {
    let sx = this.cellX(x, y) - this.ox, sy = this.cellY(x, y) - this.oy;
    return sx < 0 || sy < 0 || sx >= this.w || sy >= this.h ? 0 : this.C[sy * this.w + sx];
  }
  // ---- pixels
  /** One opaque pixel. */
  px(x, y, c) {
    this.put(this.cellX(x, y), this.cellY(x, y), c, 1);
  }
  /** One pixel at alpha a (0..1), faded by ordered dither. */
  dot(x, y, c, a = 1) {
    a > 0 && this.put(this.cellX(x, y), this.cellY(x, y), c, a);
  }
  /** Add light to one pixel. */
  light(x, y, c, k = 1) {
    this.add(this.cellX(x, y), this.cellY(x, y), c, k);
  }
  /**
   * Visit every screen pixel whose center falls in the local box [x0, x1] x [y0, y1], with that center in
   * local space: fn(lx, ly, sx, sy). The basis of every filled shape, so shapes mirror and rotate exactly.
   */
  each(x0, y0, x1, y1, fn) {
    let ax = 1 / 0, bx = -1 / 0, ay = 1 / 0, by = -1 / 0;
    for (let k = 0; k < 4; k++) {
      let x = k & 1 ? x1 : x0, y = k & 2 ? y1 : y0, sx = this.toX(x, y), sy = this.toY(x, y);
      sx < ax && (ax = sx), sx > bx && (bx = sx), sy < ay && (ay = sy), sy > by && (by = sy);
    }
    let sx0 = Math.max(Math.floor(ax), this.ox), sx1 = Math.min(Math.ceil(bx), this.ox + this.w - 1), sy0 = Math.max(Math.floor(ay), this.oy), sy1 = Math.min(Math.ceil(by), this.oy + this.h - 1);
    for (let sy = sy0; sy <= sy1; sy++)
      for (let sx = sx0; sx <= sx1; sx++) {
        let cx = sx + 0.5, cy = sy + 0.5;
        fn(this.fromX(cx, cy), this.fromY(cx, cy), sx, sy);
      }
  }
  /**
   * A pixel shader over a local box. fn(x, y, out) returns a color, or sets out.c (color), out.a (alpha),
   * out.l (light color, defaults to out.c) and out.k (light amount). Return nothing to leave the pixel alone.
   */
  shade(x0, y0, x1, y1, fn) {
    let o = OUT;
    this.each(x0, y0, x1, y1, (lx, ly, sx, sy) => {
      o.c = 0, o.a = 1, o.l = 0, o.k = 0;
      let c = fn(lx, ly, o) || o.c;
      c && this.put(sx, sy, c, o.a), o.k > 0 && this.add(sx, sy, o.l || c, o.k);
    });
  }
  // ---- shapes. Colors (c) and alphas (a) can be numbers or functions of the shape's own coordinates.
  /** 1 px line. c and a may be functions of u (0 at the start, 1 at the end). */
  line(x0, y0, x1, y1, c, a = 1) {
    let sx = this.cellX(x0, y0), sy = this.cellY(x0, y0), ex = this.cellX(x1, y1), ey = this.cellY(x1, y1), dx = Math.abs(ex - sx), dy = -Math.abs(ey - sy), stepx = sx < ex ? 1 : -1, stepy = sy < ey ? 1 : -1, n = Math.max(dx, -dy) || 1, fc = typeof c == "function", fa = typeof a == "function", err = dx + dy, i = 0;
    for (; ; ) {
      let u = i++ / n;
      if (this.put(sx, sy, fc ? c(u) : c, fa ? a(u) : a), sx === ex && sy === ey) break;
      let e2 = 2 * err;
      e2 >= dy && (err += dy, sx += stepx), e2 <= dx && (err += dx, sy += stepy);
    }
  }
  /** Lines through a list of points [[x, y], ...]. */
  polyline(pts, c, a = 1) {
    for (let i = 1; i < pts.length; i++) this.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c, a);
  }
  /** Thick segment with round ends. c and a may be functions of (u along, v across: 0 center, 1 edge). */
  beam(x0, y0, x1, y1, width, c, a = 1) {
    let r = width / 2, dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1e-9;
    this.shade(Math.min(x0, x1) - r, Math.min(y0, y1) - r, Math.max(x0, x1) + r, Math.max(y0, y1) + r, (x, y, o) => {
      let u = clamp(((x - x0) * dx + (y - y0) * dy) / L2), px = x0 + dx * u - x, py = y0 + dy * u - y, d2 = px * px + py * py;
      if (d2 > r * r) return;
      let v = Math.sqrt(d2) / r;
      o.c = call(c, u, v), o.a = call(a, u, v);
    });
  }
  /** Filled disc. c and a may be functions of (d: 0 center to 1 rim, angle). */
  circle(cx, cy, r, c, a = 1) {
    if (r < 0.6) return this.dot(cx, cy, call(c, 0, 0), call(a, 0, 0));
    this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
      let dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
      if (d2 > r * r) return;
      let d = Math.sqrt(d2) / r, ang = Math.atan2(dy, dx);
      o.c = call(c, d, ang), o.a = call(a, d, ang);
    });
  }
  /** Ellipse. c and a may be functions of (d: 0 center to 1 rim, angle). */
  ellipse(cx, cy, rx, ry, c, a = 1) {
    rx <= 0 || ry <= 0 || this.shade(cx - rx, cy - ry, cx + rx, cy + ry, (x, y, o) => {
      let dx = (x - cx) / rx, dy = (y - cy) / ry, d2 = dx * dx + dy * dy;
      if (d2 > 1) return;
      let d = Math.sqrt(d2), ang = Math.atan2(dy, dx);
      o.c = call(c, d, ang), o.a = call(a, d, ang);
    });
  }
  /** Ring from radius r - w to r. c and a may be functions of (v: 0 inner to 1 outer, angle). */
  ring(cx, cy, r, w, c, a = 1) {
    let r0 = Math.max(0, r - w);
    this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
      let dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
      if (d2 > r * r || d2 < r0 * r0) return;
      let v = w > 0 ? (Math.sqrt(d2) - r0) / (r - r0 || 1) : 1, ang = Math.atan2(dy, dx);
      o.c = call(c, v, ang), o.a = call(a, v, ang);
    });
  }
  /**
   * Band of a ring from angle a0 to a1 (radians, a1 > a0), radius r - w to r: the slash and smear shape.
   * c and a may be functions of (u: 0 at a0 to 1 at a1, v: 0 inner to 1 outer). w can be a function of u
   * for a crescent that tapers at both ends.
   */
  arc(cx, cy, r, w, a0, a1, c, a = 1) {
    let span = a1 - a0, wf = typeof w == "function";
    this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
      let dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) return;
      let ang = Math.atan2(dy, dx) - a0;
      if (ang -= Math.floor(ang / (Math.PI * 2)) * Math.PI * 2, ang > span) return;
      let u = ang / span, ww = wf ? w(u) : w;
      if (ww <= 0 || d < r - ww) return;
      let v = (d - (r - ww)) / ww;
      o.c = call(c, u, v), o.a = call(a, u, v);
    });
  }
  /** Filled rectangle. */
  rect(x, y, w, h, c, a = 1) {
    if (this.sn === 0) {
      let X0 = Math.round(x), Y0 = Math.round(y), X1 = Math.round(x + w), Y1 = Math.round(y + h);
      for (let yy = Y0; yy < Y1; yy++) for (let xx = X0; xx < X1; xx++) this.put(this.cellX(xx, yy), this.cellY(xx, yy), c, a);
      return;
    }
    this.shade(x, y, x + w, y + h, (lx, ly, o) => {
      lx < x || ly < y || lx >= x + w || ly >= y + h || (o.c = c, o.a = a);
    });
  }
  /** Filled polygon from points [[x, y], ...] (even-odd rule). */
  poly(pts, c, a = 1) {
    let x0 = 1 / 0, y0 = 1 / 0, x1 = -1 / 0, y1 = -1 / 0;
    for (let [x, y] of pts)
      x < x0 && (x0 = x), x > x1 && (x1 = x), y < y0 && (y0 = y), y > y1 && (y1 = y);
    let n = pts.length;
    this.shade(x0, y0, x1, y1, (x, y, o) => {
      let inside = !1;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        let [xi, yi] = pts[i], [xj, yj] = pts[j];
        yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi && (inside = !inside);
      }
      inside && (o.c = call(c, x, y), o.a = call(a, x, y));
    });
  }
  tri(x0, y0, x1, y1, x2, y2, c, a = 1) {
    this.poly([[x0, y0], [x1, y1], [x2, y2]], c, a);
  }
  // ---- light
  /** Radial glow into the light buffer: k at the center, falling to 0 at radius r. */
  glow(x, y, r, c, k = 0.5) {
    if (r < 1 || k <= 4e-3) return;
    let cx = this.toX(x, y), cy = this.toY(x, y), x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r), y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
    for (let sy = y0; sy <= y1; sy++) {
      let dy = (sy + 0.5 - cy) / r;
      for (let sx = x0; sx <= x1; sx++) {
        let dx = (sx + 0.5 - cx) / r, d = dx * dx + dy * dy;
        if (d >= 1) continue;
        let f = 1 - Math.sqrt(d);
        this.add(sx, sy, c, f * f * k);
      }
    }
  }
  /** Glow around a segment (a soft beam of light). */
  glowLine(x0, y0, x1, y1, r, c, k = 0.5) {
    if (r < 1 || k <= 4e-3) return;
    let ax = this.toX(x0, y0), ay = this.toY(x0, y0), bx = this.toX(x1, y1), by = this.toY(x1, y1), dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9, X0 = Math.floor(Math.min(ax, bx) - r), X1 = Math.ceil(Math.max(ax, bx) + r), Y0 = Math.floor(Math.min(ay, by) - r), Y1 = Math.ceil(Math.max(ay, by) + r);
    for (let sy = Y0; sy <= Y1; sy++)
      for (let sx = X0; sx <= X1; sx++) {
        let px = sx + 0.5, py = sy + 0.5, u = clamp(((px - ax) * dx + (py - ay) * dy) / L2), ex = ax + dx * u - px, ey = ay + dy * u - py, d = Math.sqrt(ex * ex + ey * ey) / r;
        if (d >= 1) continue;
        let f = 1 - d;
        this.add(sx, sy, c, f * f * k);
      }
  }
  /** Glow hugging a circle of radius R (a shockwave's light), falling off over width r. */
  glowRing(x, y, R, r, c, k = 0.5) {
    if (r < 1 || k <= 4e-3) return;
    let cx = this.toX(x, y), cy = this.toY(x, y), E = R + r;
    for (let sy = Math.floor(cy - E); sy <= Math.ceil(cy + E); sy++)
      for (let sx = Math.floor(cx - E); sx <= Math.ceil(cx + E); sx++) {
        let d = Math.abs(Math.hypot(sx + 0.5 - cx, sy + 0.5 - cy) - R) / r;
        if (d >= 1) continue;
        let f = 1 - d;
        this.add(sx, sy, c, f * f * k);
      }
  }
  // ---- sprites, text, masks
  /**
   * A little sprite from strings: rows like ["..##..", ".#oo#."], pal maps characters to colors
   * ({ "#": "#222034", o: 0xff... }); "." and " " are empty. Top-left at (x, y).
   * opts: { scale, a, flip (mirror left-right), flipY (upside down), tint (draw every pixel in one color) }.
   */
  sprite(rows, pal, x, y, opts = {}) {
    let s = sprites.get(rows);
    s || sprites.set(rows, s = rows.map((r) => [...r]));
    let k = opts.scale ?? 1, a = opts.a ?? 1, W = s[0]?.length ?? 0, cache = {};
    for (let r = 0; r < s.length; r++)
      for (let q = 0; q < s[r].length; q++) {
        let ch = s[r][q];
        if (ch === "." || ch === " ") continue;
        let c = opts.tint;
        if (c === void 0 && (c = cache[ch], c === void 0 && (c = cache[ch] = pal[ch] === void 0 ? 0 : hex(pal[ch]))), !c) continue;
        let col = opts.flip ? W - 1 - q : q, row = opts.flipY ? s.length - 1 - r : r;
        k === 1 ? this.dot(x + col, y + row, c, a) : this.rect(x + col * k, y + row * k, k, k, c, a);
      }
  }
  /**
   * Pixel text. opts: { font: "mini" (3x5) | "big" (5x7), scale, align: "left" | "center" | "right",
   * outline: color, shadow: color, a }. (x, y) is the top of the text, at the left, center or right.
   */
  text(str, x, y, c, opts = {}) {
    let font = opts.font ?? "mini", k = opts.scale ?? 1, a = opts.a ?? 1, w = textWidth(str, font) * k, left = Math.round(opts.align === "center" ? x - w / 2 : opts.align === "right" ? x - w : x), top = Math.round(y), ol = opts.outline, sh = opts.shadow;
    ol !== void 0 && rasterText(str, font, (gx, gy) => this.rect(left + gx * k - 1, top + gy * k - 1, k + 2, k + 2, ol, a)), sh !== void 0 && rasterText(str, font, (gx, gy) => this.rect(left + gx * k + 1, top + gy * k + 1, k, k, sh, a)), rasterText(str, font, (gx, gy) => this.rect(left + gx * k, top + gy * k, k, k, call(c, gx, gy), a));
  }
  /** Size of text in pixels: [w, h]. */
  measure(str, opts = {}) {
    let k = opts.scale ?? 1;
    return [textWidth(str, opts.font ?? "mini") * k, FONTS[opts.font ?? "mini"].h * k];
  }
  /** Fill a mask ({ w, h, data }) with its top-left at (x, y). c may be a function of (mx, my). */
  mask(m, x, y, c, a = 1) {
    for (let my = 0; my < m.h; my++)
      for (let mx = 0; mx < m.w; mx++) m.data[my * m.w + mx] && this.dot(x + mx, y + my, call(c, mx, my), call(a, mx, my));
  }
  /** The 1 px outline just outside a mask. */
  outline(m, x, y, c, a = 1) {
    let at = (mx, my) => mx >= 0 && my >= 0 && mx < m.w && my < m.h && m.data[my * m.w + mx];
    for (let my = -1; my <= m.h; my++)
      for (let mx = -1; mx <= m.w; mx++)
        !at(mx, my) && (at(mx - 1, my) || at(mx + 1, my) || at(mx, my - 1) || at(mx, my + 1)) && this.dot(x + mx, y + my, call(c, mx, my), call(a, mx, my));
  }
};

// pixelfx/src/core/actor.js
var HERO = [
  "....kkkkk...",
  "..kkhhhhhk..",
  ".khhhhhhhhk.",
  ".khhhhhhhhhk",
  ".khhssssshhk",
  ".khsessesshk",
  ".khsessesshk",
  "..ksssssssk.",
  "...kkSSSkk..",
  "..kttttttk..",
  ".kttTttTttk.",
  ".ksttTTttsk.",
  ".kstttttttk.",
  "..kbbbbbbk..",
  "..kppkkppk..",
  "..kppk.kppk.",
  "..kppk.kppk.",
  "..koook.kook",
  "..kkkkk.kkkk"
], HERO_PAL = {
  k: "#17121f",
  h: "#7a4128",
  s: "#f3c49d",
  S: "#c98b6c",
  e: "#17121f",
  t: "#5f6f94",
  T: "#46536f",
  b: "#8a5a32",
  p: "#38334a",
  o: "#6a4030",
  // the 2x character's extra detail
  H: "#a35d34",
  w: "#ffffff",
  m: "#a3564a",
  g: "#e8c060",
  L: "#7f90b6",
  O: "#8f5a3f",
  P: "#4b4560",
  // the scarf
  c: "#f53cd1",
  C: "#ff8fe6",
  D: "#a31f8a"
}, DUMMY_PAL = {
  k: "#0e0c14",
  A: "#e4e6ec",
  B: "#b6b9c3",
  C: "#868995",
  D: "#5c5e6a",
  E: "#6e707c",
  F: "#4b4d58",
  G: "#34353f",
  J: "#2a2b33",
  m: "#f53cd1"
}, HERO2 = [
  "...........kkk..........",
  "..........kAABk.........",
  ".........kAAABJk........",
  ".........kABBJJk........",
  ".........kBBBJCDk.......",
  ".........kBCJDDDk.......",
  ".........kkJJJDk........",
  ".......kkkkABBJCkk......",
  "......kAABCJBCCCkDk.....",
  "......kABBCJCCCmDkDk....",
  "......kBBCDDJCDDDkDk....",
  "......kABCDJDDDDDkk.....",
  ".....kAABDkDDDDJkk......",
  ".....kABCDkDDJJGkk......",
  ".....kABCkJJJGGGkk......",
  "....kJJCDkFFFGGGk.......",
  "....kAJJDkJJJGGGk.......",
  "....kJCJJkABBJGGk.......",
  ".....kJCCkBBCDJJJk......",
  ".....kCCCJBBCDJJDk......",
  ".....kCCCDJCCDkJDDk.....",
  "......kCDDJBCDkDDDk.....",
  ".......kDJJJCDkDDDkk....",
  ".......kJBCJCDkDDDkk....",
  ".......kBDJBCDkCDDkk....",
  "........kJJBCDkCDDk.....",
  "........kBBBCDkCCDDk....",
  "........kBBBCDkCCDDk....",
  ".........kBBCDkJDDDk....",
  "........kBJJJJkCJJJk....",
  "........kBBCCDkCCDDk....",
  "........kBBCDDkCDDk.....",
  "........kBBCDkCCDDk.....",
  "........kBCCDkCCDDk.....",
  "........kBCDDkCDDDk.....",
  ".......kJBCJkkkDJkkkk...",
  ".......kAJJAAAAkCCCCCk..",
  "........kkkkkkkkkkkkk..."
];
function maskOf(rows, k = 1) {
  let h = rows.length * k, w = rows[0].length * k, data = new Uint8Array(w * h);
  return rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch !== ".")
      for (let j = 0; j < k * k; j++) data[(y * k + (j / k | 0)) * w + x * k + j % k] = 1;
  })), { w, h, data };
}
var MASKS = { 1: maskOf(HERO, 1), 2: maskOf(HERO2, 1) };
function pixelsOf(rows, pal) {
  let w = rows[0].length, data = new Uint32Array(w * rows.length);
  return rows.forEach((r, y) => [...r].forEach((ch, x) => data[y * w + x] = ch === "." ? 0 : hex(pal[ch]))), data;
}
var PIXELS = { 1: pixelsOf(HERO, HERO_PAL), 2: pixelsOf(HERO2, DUMMY_PAL) };
function stockActor(k = 1) {
  k = k === 2 ? 2 : 1;
  let m = MASKS[k], x = -Math.floor(m.w / 2), y = -m.h;
  return { mask: m, pixels: PIXELS[k], x, y, w: m.w, h: m.h, k, head: [0, y], chest: [0, k === 2 ? -26 : y + 11], ...k === 2 ? { eyes: [[13, 3], [15, 3]] } : {} };
}

// pixelfx/src/core/fx.js
var painters = /* @__PURE__ */ new WeakMap();
function painterFor(frame2) {
  let p = painters.get(frame2);
  return p || painters.set(frame2, p = new Painter(frame2)), p.reset();
}
var FADE = 0.3, isRamp = (v) => Array.isArray(v) && v.length > 0 && v.every((c) => typeof c == "number" || /^#[0-9a-f]{3,8}$/i.test(c));
function resolveOptions(meta8, o = {}) {
  let opts = { ...meta8.options ?? {}, ...o };
  for (let [k, def] of Object.entries(meta8.options ?? {}))
    isRamp(def) && isRamp(o[k]) && o[k].length !== def.length && (opts[k] = fit(o[k], def.length).map(toHex));
  return meta8.actor && !opts.actor && (opts.actor = stockActor(meta8.actor === 2 ? 2 : 1)), opts;
}
function createFx(mod, o = {}) {
  let meta8 = mod.meta ?? {}, opts = resolveOptions(meta8, o), impl = mod.create ? mod.create(opts) : mod, D = meta8.duration ?? 1, t = 0, stopAt = 1 / 0;
  return {
    meta: meta8,
    options: opts,
    get t() {
      return t;
    },
    update(dt) {
      if (t += dt, !impl.update) return;
      let n = Math.max(1, Math.ceil(dt * 120 - 1e-9));
      for (let i = 0; i < n; i++) impl.update(dt / n, opts);
    },
    draw(frame2, layer) {
      let p = painterFor(frame2);
      p.place(opts.x ?? 0, opts.y ?? 0, !!opts.flip, opts.angle ?? 0), p.fade = stopAt === 1 / 0 ? 1 : clamp(1 - (t - stopAt) / FADE), p.lightK = opts.light ?? 1;
      let tt = meta8.loop ? t % D : Math.min(t, D);
      layer !== "front" && impl.drawBack && (p.layer = "back", impl.drawBack(p, tt, opts)), layer !== "back" && (p.layer = "front", impl.draw(p, tt, opts));
    },
    /** Let it end: loops fade out, one-shots cut short. */
    stop() {
      stopAt === 1 / 0 && (stopAt = t);
    },
    done() {
      return t - stopAt >= FADE || !meta8.loop && t >= D;
    }
  };
}

// pixelfx/src/fx/impacts/hit-spark.js
var hit_spark_exports = {};
__export(hit_spark_exports, {
  create: () => create,
  meta: () => meta
});

// pixelfx/src/core/sim.js
var GRAVITY = 950, CROSS = [[1, 0], [-1, 0], [0, 1], [0, -1]], DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]], HOT = ["#fff3a6", "#ffe26b", "#ff8a2a", "#f2561d"].map(hex), FIRE_RAMP = ["#ffffff", "#fff3a6", "#ffe26b", "#ffc23d", "#ff8a2a", "#f2561d", "#c9281f", "#8a1f17", "#4a1712"].map(hex), SMOKE_RAMP = ["#7b6f72", "#5d5660", "#433d48", "#2b2630", "#1a171e"].map(hex), rampAt = (r, t) => r[Math.min(r.length - 1, Math.max(0, Math.floor(t * r.length)))], P = { SPARK: 0, MOTE: 1, STREAK: 2, FLAKE: 3, VAPOUR: 4, DUST: 5, STAR: 6, EMBER: 7, SMOKE: 8, FIRE: 9, BRAND: 10, GRIT: 11 }, PF = { SMOKES: 1, BIG: 2, BACK: 4 }, SOFT = /* @__PURE__ */ new Set([P.VAPOUR, P.DUST, P.SMOKE]), Particles = class {
  constructor(opts = {}) {
    this.R = opts.rng ?? new Rng(opts.seed ?? 1), this.list = [], this.t = 0, this.ground = opts.ground ?? (() => 1 / 0), this.sparks = (opts.sparks ?? HOT).map(hex), this.haze = opts.haze === void 0 ? null : hex(opts.haze), this.onLand = opts.onLand ?? null;
  }
  /** delay: seconds before it appears; flag: PF bits. col 0 lets FIRE and SMOKE use their own ramps. */
  spawn(k, x, y, vx, vy, life, col = WHITE, size = 1, delay = 0, flag = 0) {
    this.list.push({ k, x, y, vx, vy, life, max: life, col: col ? hex(col) : 0, size, seed: this.R.next() * 100, delay, flag });
  }
  get count() {
    return this.list.length;
  }
  update(dt) {
    this.t += dt;
    let R = this.R, t = this.t;
    for (let i = this.list.length - 1; i >= 0; i--) {
      let p = this.list[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      if ((p.life -= dt) <= 0) {
        if (p.k === P.FIRE && p.flag & PF.SMOKES) {
          let big = p.flag & PF.BIG;
          this.spawn(P.SMOKE, p.x, p.y, p.vx * 0.6, p.vy * 0.6 - 6, big ? R.range(1.3, 2.3) : R.range(0.8, 1.4), 0, p.size * (big ? 0.85 : 0.7), 0, big ? PF.BIG : 0);
        }
        this.list.splice(i, 1);
        continue;
      }
      switch (p.k) {
        case P.FIRE:
          p.vy -= 95 * dt, p.vx += Math.sin(t * 17 + p.seed) * 30 * dt, p.vx -= p.vx * 5 * dt, p.vy -= p.vy * 3.2 * dt;
          break;
        case P.GRIT: {
          p.vy += GRAVITY * dt, p.vx -= p.vx * 0.8 * dt;
          let g = this.ground(p.x), ny = p.y + p.vy * dt;
          p.x += p.vx * dt, p.vy > 0 && p.y <= g && ny >= g ? (p.y = g - 0.25, p.vy > 130 && R.chance(0.4) ? (p.vy = -p.vy * 0.25, p.vx = p.vx * 0.5 + R.range(-10, 10)) : (p.vx = p.vy = 0, p.life = Math.min(p.life, 0.5))) : p.y = ny;
          continue;
        }
        case P.BRAND: {
          p.vy += GRAVITY * 0.8 * dt, p.vx -= p.vx * 0.9 * dt, R.chance(0.9 * Math.min(1, dt * 60)) && this.spawn(P.FIRE, p.x, p.y, p.vx * 0.1 + R.range(-7, 7), p.vy * 0.1 - 10, R.range(0.16, 0.32), 0, R.range(0.9, 1.7) * (0.5 + p.life / p.max * 0.6), 0, R.chance(0.4) ? PF.SMOKES : 0);
          let g = this.ground(p.x), ny = p.y + p.vy * dt;
          p.x += p.vx * dt, p.vy > 0 && p.y <= g && ny >= g ? (this.onLand?.(p.x, g), this.list.splice(i, 1)) : p.y = ny;
          continue;
        }
        case P.SPARK: {
          p.vy += GRAVITY * 0.45 * dt, p.vx -= p.vx * 2.2 * dt, p.vy -= p.vy * 2.2 * dt;
          let g = this.ground(p.x), ny = p.y + p.vy * dt;
          p.x += p.vx * dt, p.vy > 0 && p.y <= g && ny >= g ? (p.vy = -p.vy * 0.45, p.vx *= 0.7, p.y = g - 0.25) : p.y = ny;
          continue;
        }
        case P.STREAK:
          p.vx += p.vx * 3 * dt, p.vy += p.vy * 3 * dt;
          break;
        case P.FLAKE:
          p.vx -= p.vx * 2.2 * dt, p.vy -= p.vy * 2.2 * dt - 35 * dt, p.x += Math.sin(this.t * 2.5 + p.seed) * 7 * dt;
          break;
        case P.EMBER:
          p.vy += (-30 + Math.sin(t * 3 + p.seed) * 20) * dt, p.vx += Math.cos(t * 2.3 + p.seed) * 45 * dt, p.vx -= p.vx * 1.6 * dt, p.vy -= p.vy * 1.6 * dt;
          break;
        case P.SMOKE: {
          let big = p.flag & PF.BIG;
          p.vy -= (big ? 23 : 16) * dt, p.vx += Math.sin(t * 1.3 + p.seed) * 8 * dt, p.vx -= p.vx * 1.6 * dt, p.vy -= p.vy * 1.2 * dt;
          break;
        }
        case P.MOTE:
          p.vx -= p.vx * 0.6 * dt, p.vy -= p.vy * 0.6 * dt;
          break;
        default: {
          let drag = SOFT.has(p.k) ? 4 : 1.6;
          p.vx -= p.vx * drag * dt, p.vy -= p.vy * drag * dt + 5 * dt;
        }
      }
      p.x += p.vx * dt, p.y += p.vy * dt;
    }
  }
  draw(p, layer) {
    for (let q of this.list) {
      if (q.delay > 0 || layer && (SOFT.has(q.k) || q.flag & PF.BACK ? "back" : "front") !== layer) continue;
      let k = q.life / q.max, x = q.x, y = q.y, sp = Math.hypot(q.vx, q.vy) || 1, ux = q.vx / sp, uy = q.vy / sp;
      switch (q.k) {
        case P.SPARK: {
          let S = this.sparks, head = k > 0.6 ? S[0] : k > 0.3 ? S[1] : S[2], len2 = Math.min(9, 1 + sp * 0.022);
          p.line(x - ux * len2, y - uy * len2, x - ux * len2 * 0.4, y - uy * len2 * 0.4, k > 0.5 ? head : S[S.length - 1]), p.line(x - ux * len2 * 0.45, y - uy * len2 * 0.45, x, y, head), p.glow(x, y, 3, head, 0.45 * k);
          break;
        }
        case P.MOTE: {
          let len2 = Math.min(16, 0.5 + sp * 0.026) * q.size, a = k < 0.35 ? k / 0.35 : 1;
          p.line(x - ux * len2, y - uy * len2, x - ux * len2 * 0.35, y - uy * len2 * 0.35, scale(q.col, 0.55), a), p.line(x - ux * len2 * 0.4, y - uy * len2 * 0.4, x, y, q.col, a), p.glow(x, y, 2.5 + q.size, q.col, 0.4 * k);
          break;
        }
        case P.STREAK: {
          let L = clamp(sp / 30, 1, 7);
          for (let d = L; d >= 0; d -= 0.5) p.dot(x - ux * d, y - uy * d, d < 1 ? WHITE : d < L * 0.5 ? q.col : scale(q.col, 0.6), d < L * 0.5 ? 1 : 1.2 - d / L);
          p.glow(x, y, 4, q.col, 0.4);
          break;
        }
        case P.FLAKE: {
          let a = Math.min(1, k * 3);
          if (p.dot(x, y, q.col, a), q.size > 1.3) for (let [dx, dy] of CROSS) p.dot(x + dx, y + dy, scale(q.col, 0.8), a * 0.8);
          break;
        }
        case P.VAPOUR: {
          let r = q.size * (0.6 + (1 - k) * 0.9);
          p.disc(x, y, r, q.col, Math.pow(k, 1.3) * 0.45), this.haze && p.glow(x, y, r * 1.8, this.haze, 0.16 * k);
          break;
        }
        case P.DUST:
          p.disc(x, y, q.size * (0.6 + (1 - k) * 0.9), q.col, Math.pow(k, 1.3) * 0.7);
          break;
        case P.SMOKE: {
          let age = 1 - k, big = q.flag & PF.BIG, r = q.size * (0.65 + Math.min(1, age * 2.5) * 0.45 + age * (big ? 0.5 : 0.4)), a = Math.min(1, age * 12) * Math.min(1, k * 2.4) * (big ? 0.7 : 0.58), c = q.col ? mix(q.col, rampAt(SMOKE_RAMP, age), age) : rampAt(SMOKE_RAMP, age * 1.05);
          p.disc(x, y, r, c, a * 0.45), p.disc(x + r * 0.05, y + r * 0.06, r * 0.74, c, a * 0.62), age < 0.5 && p.disc(x - r * 0.22, y - r * 0.3, r * 0.5, mix(c, WHITE, 0.12), a * 0.4 * (1 - age * 2));
          break;
        }
        case P.FIRE: {
          let age = 1 - k, heat = Math.min(0.999, Math.pow(age, 0.62) + q.seed % 1 * 0.1), F = FIRE_RAMP, n = F.length, idx = Math.min(n - 2, Math.floor(heat * (n - 1))), r = q.size * (0.55 + 0.45 * Math.min(1, age * 7)) * (1 - age * 0.55), c = F[idx];
          idx >= n - 2 ? p.disc(x, y, r, c, Math.min(1, k * 3) * 0.85) : (p.circle(x, y, r, F[Math.min(n - 1, idx + 2)]), p.circle(x - r * 0.16, y - r * 0.22, r * 0.78, c), r > 1.6 && p.circle(x, y - r * 0.9, r * 0.42, c), idx <= 3 && r > 1.8 && p.circle(x - r * 0.28, y - r * 0.34, r * 0.36, F[Math.max(0, idx - 1)]), idx < 6 && p.glow(x, y, r * 2.4 + 2, c, 0.18 * k));
          break;
        }
        case P.BRAND:
          p.circle(x, y, 1.6, HOT[3]), p.px(x, y, Math.sin(this.t * 40 + q.seed) > 0 ? HOT[0] : HOT[1]), p.px(x + 1, y, HOT[1]), p.glow(x, y, 7, HOT[2], 0.45);
          break;
        case P.GRIT:
          (k > 0.25 || k * 4 > 0.5) && (p.px(x, y, q.col), q.size >= 2 && (p.px(x + 1, y, q.col), p.px(x, y + 1, scale(q.col, 0.8)), p.px(x + 1, y + 1, scale(q.col, 0.7))));
          break;
        case P.EMBER: {
          let c = k > 0.6 ? this.sparks[0] : k > 0.3 ? this.sparks[1] : this.sparks[2];
          if (k < 0.25 && Math.sin(this.t * 40 + q.seed) < 0) break;
          p.px(x, y, c), q.size > 1.5 && p.px(x, y + 1, this.sparks[this.sparks.length - 1]), p.glow(x, y, 3 + q.size, c, 0.35 * k);
          break;
        }
        default: {
          let tw = 0.6 + 0.4 * Math.sin(this.t * (8 + q.seed % 5) + q.seed);
          if (q.size < 1) {
            tw * k > 0.25 && p.px(x, y, tw > 0.8 ? WHITE : q.col), p.glow(x, y, 3, q.col, 0.4 * k * tw);
            break;
          }
          sparkle(p, x, y, q.size * tw * Math.min(1, k * 3), q.col, scale(q.col, 0.75), 0.5 * k * tw);
        }
      }
    }
  }
};
var B = { SHARD: 0, CHUNK: 1, DRIP: 2 }, Bits = class {
  constructor(opts = {}) {
    this.list = [], this.ground = opts.ground ?? (() => 1 / 0);
  }
  add(b) {
    let life = b.life ?? 1;
    this.list.push({ kind: B.SHARD, vx: 0, vy: 0, a: 0, va: 0, s: 1, c: WHITE, g: 1, drag: 0, bounce: 0, rest: !1, ...b, life, max: life });
  }
  get count() {
    return this.list.length;
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      let b = this.list[i];
      if ((b.life -= dt) <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      if (b.rest) continue;
      b.vy += GRAVITY * b.g * dt, b.vx -= b.vx * b.drag * dt, b.vy -= b.vy * b.drag * dt, b.x += b.vx * dt, b.y += b.vy * dt, b.a += b.va * dt;
      let floor = this.ground(b.x), sp = b.vy;
      b.g <= 0 || b.y < floor || sp <= 0 || (b.y = floor - 0.01, b.kind === B.DRIP ? b.life = 0 : b.bounce > 0 && sp > 70 ? (b.vy = -sp * b.bounce, b.vx *= 0.7, b.va *= 0.6) : (b.rest = !0, b.vx = b.vy = 0));
    }
  }
  draw(p) {
    for (let b of this.list) {
      let a = Math.min(1, b.life / 0.4), ca = Math.cos(b.a), sa = Math.sin(b.a);
      if (b.kind === B.SHARD)
        for (let d = -b.s / 2; d <= b.s / 2; d += 0.5) p.dot(b.x + ca * d, b.y + sa * d, d > b.s / 2 - 0.6 ? WHITE : hex(b.c), a);
      else if (b.kind === B.DRIP)
        p.dot(b.x, b.y, hex(b.c), a), p.dot(b.x, b.y - 1, hex(b.c), a * 0.5);
      else {
        let R = (b.ramp ?? ["#1c2030", "#3a4a66", "#6e86a8", "#a8c0dc", "#e8f2ff"]).map(hex), n = R.length, x = Math.round(b.x), y = Math.round(b.y), r = Math.ceil(b.s) + 1;
        for (let py = -r; py <= r; py++)
          for (let px = -r; px <= r; px++) {
            let u = (px + 0.5) * ca + (py + 0.5) * sa, v = -(px + 0.5) * sa + (py + 0.5) * ca, d = Math.abs(u) / b.s + Math.abs(v) / (b.s * 0.62);
            d > 1.3 || p.dot(x + px, y + py, d > 1 ? R[0] : v < 0 ? u < 0 ? R[n - 1] : R[n - 2] : u < 0 ? R[n - 3] : R[Math.max(1, n - 4)], a);
          }
      }
    }
  }
}, Lights = class {
  constructor() {
    this.list = [];
  }
  add(x, y, r, color, k, life) {
    this.list.push({ x, y, r, color: hex(color), k, life, max: life });
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) (this.list[i].life -= dt) <= 0 && this.list.splice(i, 1);
  }
  draw(p) {
    for (let l of this.list) {
      let k = l.life / l.max;
      p.glow(l.x, l.y, l.r * (0.55 + 0.45 * k), l.color, l.k * k * k);
    }
  }
};
function sparkle(p, x, y, arm, c, tip = c, k = 0.6) {
  let n = Math.round(arm);
  if (n < 1) return;
  let X = Math.floor(x), Y = Math.floor(y);
  for (let d = 1; d <= n; d++) {
    let cc = d > n * 0.6 ? tip : c;
    for (let [dx, dy] of CROSS) p.px(X + dx * d, Y + dy * d, cc);
  }
  if (n >= 3) for (let [dx, dy] of DIAG) p.px(X + dx, Y + dy, c);
  if (n >= 6) for (let [dx, dy] of DIAG) p.px(X + dx * 2, Y + dy * 2, tip);
  p.px(X, Y, WHITE), p.glow(x, y, 4 + n * 2, c, k);
}
function flare(p, x, y, L, k, ramp2) {
  if (L < 1) return;
  let R = ramp2.map(hex), n = R.length;
  for (let i = 0; i < 8; i++) {
    let an = i * Math.PI / 4, len2 = i % 4 === 0 ? L : i % 2 === 0 ? L * 0.6 : L * 0.3, ca = Math.cos(an), sa = Math.sin(an);
    for (let d = 0; d <= len2; d += 0.5) {
      let u = d / len2;
      p.dot(x + ca * d, y + sa * d, u < 0.35 ? WHITE : u < 0.7 ? R[n - 2] : R[n - 3], u < 0.6 ? 1 : k * 1.5 * (1 - u) + 0.2);
    }
  }
}
function band(p, cx, cy, r, sy, th, k, ramp2, keep = () => !0, hot = !1) {
  if (r <= 0 || k <= 0) return;
  let R = ramp2.map(hex), n = R.length;
  for (let j = 0, m = Math.ceil(r * TAU * 1.2); j < m; j++) {
    let ang = j / m * TAU, ca = Math.cos(ang), sa = Math.sin(ang);
    if (keep(ang))
      for (let o = th; o >= 0; o -= 0.5) {
        let u = o / th, c = u < 0.15 ? hot ? WHITE : R[n - 1] : u < 0.4 ? R[n - 2] : u < 0.7 ? R[n - 3] : R[n - 4];
        p.dot(cx + ca * (r - o), cy + sa * (r - o) * sy, c, k * (u < 0.4 ? 1.2 : 1.15 - u));
      }
  }
}

// pixelfx/src/core/scene.js
var SKY = hex("#15131d"), SKY_TOP = hex("#0d0b14"), SKY_LOW = hex("#221d33"), FLOOR_EDGE = hex("#4a4263"), FLOOR = hex("#2b2639"), FLOOR_DARK = hex("#211d2d"), MORTAR = hex("#1a1724");

// pixelfx/src/core/rig.js
var PAL2 = Object.fromEntries(Object.entries(DUMMY_PAL).map(([k, v]) => [k, hex(v) >>> 0])), INK2 = PAL2.k, SEAM = PAL2.J, MARK = PAL2.m, SHELL = [PAL2.A, PAL2.B, PAL2.C, PAL2.D], CORE = [PAL2.E, PAL2.F, PAL2.G, PAL2.G], DEG = Math.PI / 180;
var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], len = (a) => Math.hypot(a[0], a[1], a[2]), unit = (a) => mul(a, 1 / (len(a) || 1e-6)), rotY = (t) => {
  let c = Math.cos(t), s = Math.sin(t);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}, rotZ = (t) => {
  let c = Math.cos(t), s = Math.sin(t);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}, mm = (A, B2) => {
  let o = new Array(9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = A[r * 3] * B2[c] + A[r * 3 + 1] * B2[3 + c] + A[r * 3 + 2] * B2[6 + c];
  return o;
}, mv = (M2, v) => [M2[0] * v[0] + M2[1] * v[1] + M2[2] * v[2], M2[3] * v[0] + M2[4] * v[1] + M2[5] * v[2], M2[6] * v[0] + M2[7] * v[1] + M2[8] * v[2]];
var clamp01 = (v) => Math.max(0, Math.min(1, v)), M = {
  pelvis: 19.7,
  spine1: 2.8,
  spine2: 4.6,
  shoulderUp: 2.5,
  shoulderOut: 5.9,
  neckUp: 4,
  headUp: 3.1,
  hipDown: 1.1,
  hipOut: 2.8,
  thigh: 8.6,
  shin: 8.3,
  upper: 7.6,
  fore: 7.4,
  turn: 36 * DEG
}, STAND = { lean: 0, crouch: 0, yaw: 0, fx: -3, fy: -15, bx: 5, by: -15, ffx: -2, ffy: -4, fbx: 3, fby: -4 };
function ik(a, target, L1, L2, pole) {
  let to = sub(target, a), d = len(to), reach = L1 + L2 - 0.02;
  d > reach && (to = mul(to, reach / d), d = reach);
  let u = unit(to), along = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - along * along)), v = sub(pole, mul(u, dot(pole, u)));
  return v = len(v) < 1e-4 ? unit(cross(u, [0, 0, 1])) : unit(v), { joint: add(a, add(mul(u, along), mul(v, h))), end: add(a, to), u, v };
}
function frame(t, R) {
  return { t, R };
}
function boneFrame(a, b, pole) {
  let x = unit(sub(b, a)), y = sub(pole, mul(x, dot(pole, x)));
  y = len(y) < 1e-4 ? unit(cross(x, [0, 0, 1])) : unit(y);
  let z = cross(x, y);
  return frame(a, [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]]);
}
var weaponOf = (name) => WEAPONS[name];
function solve(pose) {
  let q = { ...STAND, ...pose }, lean = q.lean, W = q.weapon && weaponOf(q.weapon), OW = q.offWeapon && weaponOf(q.offWeapon), sa = q.sa ?? 0, wl = q.wl ?? 1, axisZ = Math.sqrt(Math.max(0, 1 - wl * wl)) * (q.wz ?? 1), axis = [Math.cos(sa) * wl, -Math.sin(sa) * wl, axisZ], side = [-Math.sin(sa), -Math.cos(sa), 0], two = !!(q.two && W), nearZ = q.fz ?? (two ? 3 : 4.5), fwd = (q.fx - STAND.fx) / 24, farFwd = two ? 0 : (q.bx - STAND.bx) / 22, turn = M.turn + (fwd >= 0 ? -44 * DEG * Math.min(1, fwd) : 28 * DEG * Math.min(1, -fwd * 1.8));
  turn += (farFwd > 0 ? 34 * DEG * Math.min(1, farFwd) : 0) + (q.twist ?? 0) * 4 * DEG, q.turn !== void 0 && (turn = q.turn);
  let hipTurn = M.turn + (turn - M.turn) * 0.45, tilt = Math.atan2(lean, 13), Rp = mm(rotZ(-tilt * 0.25), rotY(-hipTurn)), Rc = mm(rotZ(-tilt), rotY(-turn)), ankleN = [q.ffx, -q.ffy - 1.8, q.fzz ?? 2.4], ankleF = [q.fbx, -q.fby - 1.8, q.bzz ?? -2.4], pelvis = [lean * 0.2, M.pelvis - q.crouch, 0], hipAt = (s) => add(pelvis, mv(Rp, [0, -M.hipDown, s * M.hipOut])), maxLeg = (M.thigh + M.shin) * 0.995;
  for (let [s, a] of [[1, ankleN], [-1, ankleF]]) {
    let h = hipAt(s), dx = h[0] - a[0], dz = h[2] - a[2], flat = dx * dx + dz * dz;
    if (flat < maxLeg * maxLeg) {
      let top = a[1] + Math.sqrt(maxLeg * maxLeg - flat);
      h[1] > top && (pelvis = [pelvis[0], pelvis[1] - (h[1] - top), pelvis[2]]);
    }
  }
  let waist = add(pelvis, [Math.sin(tilt * 0.45) * M.spine1, Math.cos(tilt * 0.45) * M.spine1, 0]), chest = add(waist, [Math.sin(tilt) * M.spine2, Math.cos(tilt) * M.spine2, 0]), neck = add(chest, mv(Rc, [0, M.neckUp, 0])), headTurn = M.turn * 0.9 + (turn - M.turn) * 0.35, nod = tilt * 0.35 + (q.hy ?? 0) * 7 * DEG, roll = (q.hx ?? 0) * 7 * DEG, Rh = mm(rotZ(-nod - roll), rotY(-headTurn)), head = add(neck, mv(Rh, [0.15, M.headUp, 0])), pick = (s, target) => {
    let base = add(chest, mv(Rc, [0, M.shoulderUp, s * M.shoulderOut])), to = sub(target, base), d = len(to);
    return add(base, mul(unit(to), Math.min(1.8, Math.max(0, d - 11) * 0.35)));
  }, nearT = [q.fx, -q.fy, nearZ], farT = two ? [q.fx + axis[0] * W.two, -q.fy + axis[1] * W.two, nearZ + axis[2] * W.two] : [q.bx, -q.by, q.bz ?? (q.armsFront ? 5.5 : -4.5)], sN = pick(1, nearT), sF = pick(-1, farT), pole = (s, T, shoulder, hold) => {
    let up = clamp01((T[1] - shoulder[1] + 2) / 10), base = [-0.55 + up * 1.1, -1 + up * 0.9, s * (0.45 + up * 0.5)];
    if (!hold) return base;
    let u = unit(sub(T, shoulder)), best = base, score = 1 / 0;
    for (let i = 0; i < 16; i++) {
      let a = i / 16 * Math.PI * 2, x = unit(cross(u, [0.3, 1, 0.2])), y = cross(u, x), v = add(mul(x, Math.cos(a)), mul(y, Math.sin(a))), A = ik(shoulder, T, M.upper, M.fore, v), f = unit(sub(A.end, A.joint)), cost = Math.abs(dot(f, hold)) * 0.7 + (1 - dot(unit(base), v)) * 0.55;
      cost < score && (score = cost, best = v);
    }
    return best;
  }, holdN = W ? W.across ? side : axis : null, holdF = two ? W.across ? side : axis : OW ? [Math.cos(q.sb ?? Math.PI), -Math.sin(q.sb ?? Math.PI), 0] : null, armN = ik(sN, nearT, M.upper, M.fore, pole(1, nearT, sN, holdN)), armF = ik(sF, farT, M.upper, M.fore, pole(-1, farT, sF, holdF)), kneePole = (s) => mv(Rp, [1, 0, s * 0.35]), hipN = hipAt(1), hipF = hipAt(-1), legN = ik(hipN, ankleN, M.thigh, M.shin, kneePole(1)), legF = ik(hipF, ankleF, M.thigh, M.shin, kneePole(-1)), footDir = (s) => {
    let t = hipTurn * 0.6 + s * 8 * DEG;
    return [Math.cos(t), 0, Math.sin(t)];
  }, B2 = {
    pelvis: frame(pelvis, Rp),
    waist: frame(waist, mm(rotZ(-tilt * 0.6), rotY(-(turn + hipTurn) / 2))),
    chest: frame(chest, Rc),
    head: frame(head, Rh),
    neck: frame(neck, Rh),
    upperN: boneFrame(sN, armN.joint, armN.v),
    foreN: boneFrame(armN.joint, armN.end, armN.v),
    upperF: boneFrame(sF, armF.joint, armF.v),
    foreF: boneFrame(armF.joint, armF.end, armF.v),
    thighN: boneFrame(hipN, legN.joint, legN.v),
    shinN: boneFrame(legN.joint, legN.end, legN.v),
    thighF: boneFrame(hipF, legF.joint, legF.v),
    shinF: boneFrame(legF.joint, legF.end, legF.v)
  };
  return B2.footN = frame(legN.end, mm(rotY(-Math.atan2(footDir(1)[2], footDir(1)[0])), rotZ(q.toeF ? -55 * DEG : 0))), B2.footF = frame(legF.end, mm(rotY(-Math.atan2(footDir(-1)[2], footDir(-1)[0])), rotZ(q.toeB ? -55 * DEG : 0))), { B: B2, W, OW, q, axis, side, armN, armF, legN, legF, sN, sF, hipN, hipF, turn };
}
var BW = 300, BH = 240, OX = 150, OY = 180, Zb = new Float32Array(BW * BH), Tone = new Float32Array(BW * BH), Part = new Int8Array(BW * BH), Mat = new Int8Array(BW * BH), Fr = new Int8Array(BW * BH), LX = new Float32Array(BW * BH), LY = new Float32Array(BW * BH), Col = new Uint32Array(BW * BH), touched = [], LIGHT = unit([-0.55, 0.72, 0.5]);
var curFrameIndex = 0;
var onlyPart = 0;
function plot(i, z, tone, part, mat, wx, wy, color) {
  if (!(onlyPart && part !== onlyPart)) {
    if (Part[i] === 0) touched.push(i);
    else if (z <= Zb[i]) return;
    Zb[i] = z, Tone[i] = tone, Part[i] = part, Mat[i] = mat, Fr[i] = curFrameIndex, LX[i] = wx, LY[i] = wy, Col[i] = color;
  }
}
var PART = { pelvis: 1, waist: 2, chest: 3, neck: 4, head: 5, face: 6, upperN: 7, elbowN: 8, foreN: 9, handN: 10, upperF: 11, elbowF: 12, foreF: 13, handF: 14, thighN: 15, kneeN: 16, shinN: 17, footN: 18, thighF: 19, kneeF: 20, shinF: 21, footF: 22, weapon: 23, offWeapon: 24 };
var STEEL = Object.fromEntries(Object.entries({ hi: "#ffffff", a: "#e8edf6", b: "#a4afc6", d: "#68748f", gold: "#ffd84a", goldD: "#b8862a", grip: "#7a3a2a", gripD: "#4a2018", wood: "#8a5a32", woodD: "#5a3820", dark: "#3a3448", darkD: "#262033", olive: "#58663f", oliveA: "#7d8c58", oliveD: "#3a4529" }).map(([k, v]) => [k, hex(v) >>> 0]));
function blade(T, from, length, w) {
  for (let i = from; i <= from + length + 0.01; i += 0.4) {
    let r = i - from, wd = r > length - 5 ? Math.max(0, (length - r) / 5 * w) : w;
    for (let k = -wd; k <= wd + 0.01; k += 0.4) T(i, k, k < -w * 0.4 ? STEEL.hi : k > w * 0.4 ? STEEL.d : STEEL.a);
  }
}
var haft = (T, from, to, a, d, r = 0.8) => {
  for (let i = from; i <= to; i += 0.4) for (let k = -r; k <= r + 0.01; k += 0.4) T(i, k, k > 0.1 ? d : a);
}, WEAPONS = {
  // the fist is at i = 0; `two` is where the other hand goes; `across`: the handle lies across the weapon's length
  sword: { two: -4.4, draw(T, q) {
    let end = q.two ? -6.5 : -2.6;
    haft(T, end, 2.2, STEEL.grip, STEEL.gripD);
    for (let k = -1.4; k <= 1.4; k += 0.4) T(end - 0.4, k, STEEL.gold);
    for (let k = -4.6; k <= 4.6; k += 0.4) T(2.6, k, Math.abs(k) > 3.8 ? STEEL.goldD : STEEL.gold), T(3, k, STEEL.goldD);
    blade(T, 3.2, 25, 2.2);
  } },
  greatsword: { two: -4.8, draw(T) {
    haft(T, -7.2, 2.2, STEEL.grip, STEEL.gripD);
    for (let k = -1.8; k <= 1.8; k += 0.4) T(-7.6, k, STEEL.gold);
    for (let k = -6.6; k <= 6.6; k += 0.4) T(2.6, k, Math.abs(k) > 5.6 ? STEEL.goldD : STEEL.gold), T(3, k, STEEL.goldD);
    blade(T, 3.2, 31, 3);
    for (let i = 4; i <= 28; i += 0.4) T(i, 0, STEEL.b);
  } },
  dagger: { draw(T) {
    haft(T, -2.4, 1.8, STEEL.grip, STEEL.gripD);
    for (let k = -2.6; k <= 2.6; k += 0.4) T(2.2, k, STEEL.goldD);
    blade(T, 2.6, 10, 1.3);
  } },
  spear: { two: -12, draw(T) {
    haft(T, -18, 36, STEEL.wood, STEEL.woodD, 0.5), blade(T, 36, 11, 2);
    for (let k = -2.4; k <= 2.4; k += 0.4) T(36, k, STEEL.goldD);
  } },
  hammer: { two: -7, draw(T) {
    for (let lift of [-0.8, 0, 0.8]) for (let i = -10; i <= 18; i += 0.4) for (let k = -0.8; k <= 0.81; k += 0.4) T(i, k, k > 0.1 ? STEEL.woodD : STEEL.wood, lift);
    for (let i = 18; i <= 28; i += 0.4) for (let k = -9; k <= 9; k += 0.4) {
      let face = Math.abs(k) > 7.4 ? k < 0 ? STEEL.a : STEEL.d : i < 20 ? STEEL.hi : i > 26.4 ? STEEL.d : Math.abs(k) < 2 ? STEEL.gold : STEEL.b;
      if (T(i, k, face, 4.5), T(i, k, face, -4.5), i < 18.4 || i > 27.6 || Math.abs(k) > 8.6) for (let l = -4; l <= 4; l += 0.4) T(i, k, k < 0 ? STEEL.a : i > 27.6 ? STEEL.d : STEEL.b, l);
    }
  } },
  scythe: { two: -11, draw(T) {
    haft(T, -16, 31, STEEL.dark, STEEL.darkD, 0.5);
    for (let j = 0; j <= 28; j += 0.4) {
      let u = j / 28, w = 3.2 * (1 - u) + 0.3, b = 31.5 - u * u * 12;
      for (let k = -w; k <= w; k += 0.4) T(b + k, j + 0.8, k > w * 0.3 ? STEEL.hi : k < -w * 0.4 ? STEEL.d : STEEL.b);
    }
  } },
  claw: { draw(T) {
    for (let q0 of [-2.4, 0, 2.4])
      for (let i = 2; i <= 9.5; i += 0.4) {
        let u = (i - 2) / 7.5, k = q0 + u * u * 1.8;
        T(i, k, u > 0.55 ? STEEL.hi : STEEL.a), u < 0.6 && T(i, k + 0.8, STEEL.d);
      }
  } },
  bow: { across: !0, draw(T, q, off) {
    for (let u = -1; u <= 1.001; u += 0.025) {
      let k = u * 17, i = 6 * (1 - u * u) - 1;
      T(i, k, Math.abs(u) > 0.85 ? STEEL.goldD : STEEL.wood), T(i + 0.8, k, STEEL.woodD);
    }
    let tipA = T.at(-1, -17), tipB = T.at(-1, 17), mid = q.pull ? off : T.at(-1, 0), line = (A, B2, c) => {
      let n = Math.max(2, Math.ceil(len(sub(B2, A)) / 0.4)), Z = STEEL.a;
      for (let k = 0; k <= n; k++) {
        let P2 = add(A, mul(sub(B2, A), k / n)), wx = Math.round(P2[0]), wy = Math.round(P2[1]), idx = (OY - wy) * BW + (OX + wx);
        curFrameIndex = -1, plot(idx, P2[2] + 0.05, 2, PART.weapon, 2, wx, wy, c ?? Z);
      }
    };
    if (line(tipA, mid), line(tipB, mid), q.nocked) {
      let nock = mid, tip = T.at(13, 0);
      line(nock, tip, STEEL.wood);
      for (let i = 9; i <= 13; i += 0.4) for (let k = -(13 - i) * 0.45; k <= (13 - i) * 0.45; k += 0.4) T(i, k, STEEL.hi);
    }
  } },
  pistol: { across: !0, draw(T) {
    for (let i = -1; i <= 9.5; i += 0.4) for (let k = -4.2; k <= -2.4; k += 0.4) T(i, k, k < -3.6 ? STEEL.a : k > -2.9 ? STEEL.d : STEEL.b);
    for (let i = -1.2; i <= 1.2; i += 0.4) for (let k = -2.4; k <= 2.4; k += 0.4) T(i, k, STEEL.gripD);
    T(9, -4.6, STEEL.hi);
  } },
  launcher: { two: -9, draw(T) {
    for (let i = -14; i <= 22; i += 0.4) for (let k = -6; k <= -1; k += 0.4) T(i, k, k < -4.8 ? STEEL.oliveA : k > -2.2 ? STEEL.oliveD : Math.abs(i - 3) < 1.4 ? STEEL.gold : STEEL.olive);
    for (let k = -6.8; k <= -0.2; k += 0.4) T(22.4, k, STEEL.b), T(-14.4, k, STEEL.d);
  } },
  handle: { draw(T) {
    haft(T, -2.6, 6, STEEL.grip, STEEL.gripD);
    for (let k = -1.6; k <= 1.6; k += 0.4) T(-3, k, STEEL.gold), T(6.4, k, STEEL.gold);
  } }
};
var REST_FRAMES = null;
REST_FRAMES = solve({}).B;

// pixelfx/src/core/act.js
var TW = 38, TH = 52, TP = Object.fromEntries(Object.entries({ ink: "#0b0a1a", wood: "#724c2e", woodL: "#a0703a", woodD: "#4e331f", straw: "#d2aa55", strawL: "#f0d98a", burlapD: "#86643a", burlap: "#b38b57", burlapL: "#c9a26c", red: "#9a2f3c", redL: "#c4434f", white: "#ffffff" }).map(([k, v]) => [k, hex(v)])), DUST = ["#efe7dc", "#c9bfb8", "#8f8693", "#5a5468"].map(hex), DUMMY = new Uint32Array(TW * TH);
(function() {
  let px = (x, y, c) => {
    x >= 0 && y >= 0 && x < TW && y < TH && (DUMMY[y * TW + x] = c);
  }, R = (x, y, w, h, c) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c);
  };
  R(15, 38, 8, 14, TP.ink), R(16, 34, 6, 18, TP.wood), R(16, 34, 2, 18, TP.woodL), R(20, 34, 2, 18, TP.woodD), R(1, 18, 36, 1, TP.ink), R(1, 23, 36, 1, TP.ink), R(1, 19, 36, 4, TP.wood), R(1, 19, 36, 1, TP.woodL), R(1, 22, 36, 1, TP.woodD);
  for (let [bx, s] of [[0, -1], [33, 1]]) {
    R(bx, 17, 5, 8, TP.straw);
    for (let [dx, dy, c] of [[2, 16, TP.straw], [3, 15, TP.strawL], [1, 17, TP.strawL], [2, 25, TP.straw], [1, 26, TP.strawL], [3, 25, TP.burlapD], [2, 19, TP.strawL], [3, 21, TP.strawL], [1, 22, TP.burlapD], [2, 23, TP.strawL]]) px(bx + dx, dy, c);
    px(s < 0 ? bx - 1 : bx + 5, 19, TP.straw), px(s < 0 ? bx - 1 : bx + 5, 22, TP.strawL);
  }
  let sack = (x, y, w, h) => {
    R(x + 1, y, w - 2, 1, TP.ink), R(x + 1, y + h - 1, w - 2, 1, TP.ink), R(x, y + 1, 1, h - 2, TP.ink), R(x + w - 1, y + 1, 1, h - 2, TP.ink), R(x + 1, y + 1, w - 2, h - 2, TP.burlap), R(x + w - 4, y + 1, 3, h - 2, TP.burlapD), R(x + 1, y + h - 3, w - 2, 2, TP.burlapD), R(x + 1, y + 1, 1, h - 4, TP.burlapL), R(x + 1, y + 1, w - 6, 1, TP.burlapL);
    for (let j = y + 2; j < y + h - 2; j += 3) for (let i = x + 3 + j % 2; i < x + w - 4; i += 4) px(i, j, TP.burlapD);
  };
  sack(9, 17, 20, 24);
  for (let y = 19; y < 36; y++) for (let x = 11; x < 27; x++) {
    let d = Math.hypot(x - 18.5, y - 27);
    (d > 4 && d < 5.4 || d < 1.9) && px(x, y, x + y < 45 ? TP.redL : TP.red);
  }
  for (let x = 10; x < 28; x++)
    px(x, 36, x & 1 ? TP.woodL : TP.straw), px(x, 37, x & 1 ? TP.woodD : TP.wood);
  for (let [x, y, c] of [[11, 41, TP.straw], [12, 42, TP.strawL], [14, 41, TP.strawL], [15, 42, TP.straw], [23, 41, TP.straw], [24, 42, TP.strawL], [26, 41, TP.straw], [13, 43, TP.straw], [25, 43, TP.straw]]) px(x, y, c);
  sack(10, 1, 18, 16);
  for (let ex of [14, 23]) for (let d = -2; d <= 2; d++)
    px(ex + d, 7 + d, TP.ink), px(ex - d, 7 + d, TP.ink);
  for (let x = 14; x < 24; x++) px(x, 12, x & 1 ? TP.ink : TP.burlapD);
  for (let x of [15, 18, 21])
    px(x, 11, TP.ink), px(x, 13, TP.ink);
  for (let x = 12; x < 26; x++)
    px(x, 16, x & 1 ? TP.woodL : TP.straw), px(x, 17, x & 1 ? TP.wood : TP.woodD);
  for (let [x, y, c] of [[13, 0, TP.straw], [15, 0, TP.strawL], [18, 0, TP.straw], [21, 0, TP.strawL], [24, 0, TP.straw], [9, 4, TP.straw], [28, 6, TP.straw], [8, 7, TP.strawL], [29, 3, TP.strawL]]) px(x, y, c);
})();
var SKINS = { flash: [TP.white, 1], char: [hex("#1a0c0e"), 0.72], ice: [hex("#a8e8ff"), 0.72], shadow: [hex("#3a1a70"), 0.5], holy: [hex("#fff4c0"), 0.5], red: [hex("#ff2040"), 0.45], shock: [hex("#8fd6ff"), 0.6], poison: [hex("#58c43a"), 0.5] }, STRAW = [TP.strawL, TP.straw, TP.straw, TP.burlapD, TP.burlapD];
var REST_MASK = new Uint8Array(24 * 38), REST_PX = new Uint32Array(24 * 38);
HERO2.forEach((row, r) => [...row].forEach((ch, c) => {
  ch !== "." && (REST_MASK[r * 24 + c] = 1, REST_PX[r * 24 + c] = hex(DUMMY_PAL[ch]));
}));
var NEAREST = new Int16Array(24 * 38).fill(-1);
for (let r = 0; r < 38; r++)
  for (let c = 0; c < 24; c++) {
    let best = -1, bd = 1e9;
    for (let y = Math.max(0, r - 7); y < Math.min(38, r + 8); y++)
      for (let x = Math.max(0, c - 7); x < Math.min(24, c + 8); x++) {
        let d = (x - c) * (x - c) + (y - r) * (y - r);
        REST_MASK[y * 24 + x] && d < bd && (bd = d, best = y * 24 + x);
      }
    NEAREST[r * 24 + c] = best;
  }

// pixelfx/src/core/poses.js
var READY = { crouch: 3, fx: 11, fy: -21, bx: 9, by: -21, ffx: 7, fbx: -7 };

// pixelfx/src/fx/impacts/hit-spark.js
var meta = {
  name: "Hit spark",
  desc: "The everyday hit: a sharp, lopsided cross flare with one long ray along the blow round a white diamond core, then a cone of sparks and hot chips that fall and bounce.",
  tags: ["impact", "hit", "spark", "combat", "directional", "one-shot"],
  size: [136, 80],
  origin: [44, 64],
  duration: 0.5,
  loop: !1,
  fps: 30,
  bg: "ground",
  options: { palette: ["#4a1712", "#c9281f", "#f2561d", "#ff8a2a", "#ffe26b", "#fff3a6", "#ffffff"], height: 20, aim: 0.1, seed: 4 }
};
function ray(p, x, y, a, L, w, C, from = 0) {
  let c = Math.cos(a), s = Math.sin(a);
  for (let d = from * L; d <= L; d += 0.5) {
    let u = d / L, hw = w * Math.pow(1 - u, 1.6), col = u < 0.3 ? WHITE : u < 0.62 ? C[5] : u < 0.88 ? C[4] : C[3];
    if (p.px(x + c * d, y + s * d, col), hw > 0.45) for (let o = 0.5; o <= hw; o += 0.5) for (let e of [-o, o]) p.px(x + c * d - s * e, y + s * d + c * e, u < 0.3 && o < 1 ? C[5] : C[4]);
  }
}
function diamond(p, x, y, r, C) {
  for (let dy = -r - 1; dy <= r + 1; dy++)
    for (let dx = -r - 1; dx <= r + 1; dx++) {
      let m = Math.abs(dx) + Math.abs(dy);
      m <= r ? p.px(x + dx, y + dy, WHITE) : m === r + 1 && p.px(x + dx, y + dy, C[3]);
    }
}
function create(o) {
  let C = fit(o.palette, 7), R = new Rng(o.seed), X = 0, Y = -o.height, A = o.aim, floor = () => 0, ps = new Particles({ rng: R, ground: floor, sparks: [C[6], C[5], C[4], C[2]] }), lights = new Lights(), tilt = R.range(-0.08, 0.08), rays = [
    { a: A + tilt, L: R.range(33, 37), w: 2.2 },
    { a: A + Math.PI + tilt, L: R.range(8, 10), w: 2.2 },
    { a: A - Math.PI / 2 + tilt, L: R.range(15, 18), w: 2.6 },
    { a: A + Math.PI / 2 + tilt, L: R.range(10, 12), w: 2.3 },
    { a: A - Math.PI / 4 + tilt, L: R.range(5, 7), w: 1 }
  ];
  lights.add(X, Y, 38, C[4], 0.35, 0.18), lights.add(X + Math.cos(A) * 10, Y + Math.sin(A) * 10, 22, C[5], 0.45, 0.1), lights.add(X, -2, 26, C[3], 0.22, 0.22);
  for (let i = 0; i < 9; i++) {
    let a = A + R.range(-0.6, 0.6) - 0.15, v = R.range(170, 360);
    ps.spawn(P.SPARK, X + 1, Y, Math.cos(a) * v, Math.sin(a) * v - 40, R.range(0.25, 0.45), WHITE, 1, i > 6 ? R.range(0.01, 0.03) : 0);
  }
  for (let i = 0; i < 6; i++) {
    let a = A + R.range(-1.1, 0.5) - 0.3, v = R.range(70, 170);
    ps.spawn(P.GRIT, X + 1, Y, Math.cos(a) * v, Math.sin(a) * v - R.range(30, 80), R.range(0.35, 0.45), R.pick([C[5], C[4], C[4], C[3]]), 1);
  }
  let t = 0;
  return {
    update(dt) {
      t += dt, ps.update(dt), lights.update(dt);
    },
    draw(p) {
      if (ps.draw(p), t < 0.025) {
        for (let r of rays) ray(p, X, Y, r.a, r.L, r.w, C);
        diamond(p, X, Y, 4, C);
      } else if (t < 0.058) {
        for (let r of rays) ray(p, X, Y, r.a, r.L * 1.2, r.w * 0.55, C, 0.12);
        diamond(p, X, Y, 3, C);
      } else if (t < 0.092) {
        let r = rays[0];
        ray(p, X, Y, r.a, r.L * 1.3, 0.6, [C[0], C[1], C[2], C[3], C[3], C[4]], 0.4);
      }
      let pop = Math.exp(-t / 0.045);
      pop > 0.02 && (p.glow(X, Y, 22, C[4], 0.3 * pop), p.glow(X, Y, 7, WHITE, 0.15 * pop), p.glowLine(X, Y, X + Math.cos(A) * 26, Y + Math.sin(A) * 26, 4, C[5], 0.25 * pop)), lights.draw(p);
    }
  };
}

// pixelfx/src/fx/spawn/poof.js
var poof_exports = {};
__export(poof_exports, {
  create: () => create2,
  meta: () => meta2
});
var meta2 = {
  name: "Poof",
  desc: "A cartoon death poof: a white pop, a ring of soft round smoke balls bursting out between speed lines, little stars spinning off, and the cloud lifting and thinning away.",
  tags: ["spawn", "death", "despawn", "smoke", "poof", "cartoon", "one-shot"],
  size: [112, 92],
  origin: [56, 80],
  duration: 1.6,
  loop: !1,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#2a2440", "#5e5878", "#9a94b4", "#cdc8e0", "#f2f0fa", "#ffffff"],
    stars: ["#ffd84a", "#fff3a6", "#ffffff"],
    seed: 21
  }
}, CY = -17;
function create2(o) {
  let C = fit(o.palette, 6), S = fit(o.stars, 3), R = new Rng(o.seed), floor = () => 0, ps = new Particles({ rng: R, ground: floor, sparks: [WHITE, S[1], S[0], C[2]] }), lights = new Lights(), balls = [], lines = [], ring2 = 9;
  for (let i = 0; i < ring2; i++) {
    let a = i / ring2 * TAU + R.range(-0.2, 0.2), sp = R.range(95, 140), r = R.range(5, 7);
    balls.push({ x: Math.cos(a) * 3, y: CY + Math.sin(a) * 3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8 - 12, r0: r * 0.5, r1: r, life: R.range(0.7, 1.05), delay: R.range(0, 0.03) });
  }
  for (let i = 0; i < 5; i++) {
    let a = R.range(0, TAU), sp = R.range(20, 60);
    balls.push({ x: Math.cos(a) * 2, y: CY + Math.sin(a) * 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 16, r0: 4, r1: R.range(6.5, 8.5), life: R.range(0.85, 1.2), delay: R.range(0.02, 0.06) });
  }
  for (let i = 0; i < 7; i++) {
    let a = R.range(0, TAU), sp = R.range(170, 240), r = R.range(2.2, 3.6);
    balls.push({ x: Math.cos(a) * 4, y: CY + Math.sin(a) * 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.75 - 10, r0: r * 0.6, r1: r, life: R.range(0.32, 0.5), delay: R.range(0.01, 0.04) });
  }
  for (let b of balls) b.max = b.life;
  for (let i = 0; i < 12; i++) {
    let a = i / 12 * TAU + R.range(-0.12, 0.12) + 0.13, sa = Math.sin(a);
    lines.push({ a, r1: Math.min(R.range(24, 34), sa > 0.1 ? (-2 - CY) / sa : 99), d: R.range(0, 0.04) });
  }
  for (let i = 0; i < 7; i++) {
    let a = R.range(-Math.PI, 0.3), sp = R.range(70, 125);
    ps.spawn(P.STAR, Math.cos(a) * 6, CY + Math.sin(a) * 6, Math.cos(a) * sp, Math.sin(a) * sp - 30, R.range(0.55, 0.95), R.pick([S[2], S[1], S[1], S[0]]), R.range(1.3, 2.4), R.range(0.02, 0.1));
  }
  for (let i = 0; i < 10; i++) {
    let a = R.range(0, TAU), sp = R.range(40, 110);
    ps.spawn(P.STAR, Math.cos(a) * 5, CY + Math.sin(a) * 5, Math.cos(a) * sp, Math.sin(a) * sp - 20, R.range(0.3, 0.6), R.pick([WHITE, S[1]]), 0.6, R.range(0, 0.08));
  }
  for (let i = 0; i < 6; i++) {
    let s = R.sign();
    ps.spawn(P.DUST, s * R.range(1, 6), -1, s * R.range(25, 70), -R.range(2, 10), R.range(0.4, 0.7), C[2], R.range(1.6, 3), R.range(0.02, 0.08));
  }
  lights.add(0, CY, 46, C[4], 0.8, 0.4), lights.add(0, CY, 22, WHITE, 0.8, 0.1);
  let t = 0, radius = (b) => {
    let age = b.max - b.life, u = age / b.max, grow = b.r0 + (b.r1 - b.r0) * ease.outBack(clamp(age / 0.22), 2), breathe = 1 + 0.06 * Math.sin(age * 14 + b.r1);
    return grow * breathe * (u < 0.62 ? 1 : 1 - ease.inBack(clamp((u - 0.62) / 0.38), 1.4));
  }, drawBall = (p, b, layer) => {
    let age = b.max - b.life, r = radius(b), a = Math.min(1, age * 20), lit = age < 0.12;
    if (r < 0.6) return;
    let hy = (b.y - CY + 6) / 14, lo = hy > 0.4, hi = hy < -0.3;
    layer === "shade" ? p.disc(b.x + r * 0.16, b.y + r * 0.2, r, lit ? C[3] : lo ? C[1] : C[2], 0.8 * a) : layer === "body" ? p.disc(b.x - r * 0.06, b.y - r * 0.08, r * 0.86, lit ? C[4] : lo ? C[2] : C[3], 0.88 * a) : (!lo || lit) && (p.disc(b.x - r * 0.28, b.y - r * 0.34, r * 0.42, lit || hi ? WHITE : C[4], 0.85 * a), age < 0.25 && p.disc(b.x - r * 0.3, b.y - r * 0.38, r * 0.2, WHITE, 0.9 * a * (1 - age / 0.25)));
  };
  return {
    update(dt) {
      t += dt;
      for (let i = balls.length - 1; i >= 0; i--) {
        let b = balls[i];
        if (b.delay > 0) {
          b.delay -= dt;
          continue;
        }
        if ((b.life -= dt) <= 0) {
          b.r1 > 4 && ps.spawn(P.STAR, b.x, b.y, 0, -8, 0.22, WHITE, 0.6), balls.splice(i, 1);
          continue;
        }
        b.vx -= b.vx * 7 * dt, b.vy -= b.vy * 7 * dt + 30 * dt, b.x += b.vx * dt, b.y = Math.min(b.y + b.vy * dt, -radius(b) * 0.7);
      }
      ps.update(dt), lights.update(dt);
    },
    drawBack(p) {
      let s = 1 - smooth(0.1, 0.9, t);
      s > 0 && p.glow(0, -1, 26, C[4], 0.25 * s), ps.draw(p, "back");
    },
    draw(p) {
      let live = balls.filter((b) => b.delay <= 0);
      for (let layer of ["shade", "body", "cap"]) for (let b of live) drawBall(p, b, layer);
      if (t < 0.07) {
        let k = t / 0.07;
        p.circle(0, CY, 9 + 3 * k, C[4]), p.circle(0, CY, 7 + 3 * k, WHITE), flare(p, 0, CY, 20 * (1 - k * 0.5), 1 - k, C);
      }
      let rk = (t - 0.03) / 0.2;
      rk > 0 && rk < 1 && p.ring(0, CY, 8 + 18 * ease.outCubic(rk), Math.max(1, 2.5 * (1 - rk)), rk < 0.3 ? WHITE : C[4], 1.1 - rk);
      for (let l of lines) {
        let u = (t - l.d) / 0.2;
        if (u <= 0 || u >= 1) continue;
        let head = 8 + (l.r1 - 8) * ease.outExpo(clamp(u / 0.6)), tail = 8 + (l.r1 - 8) * ease.inCubic(u), ca = Math.cos(l.a), sa = Math.sin(l.a);
        p.line(ca * tail, CY + sa * tail, ca * head, CY + sa * head, (v) => v > 0.6 ? WHITE : C[4]), p.glowLine(ca * tail, CY + sa * tail, ca * head, CY + sa * head, 3, C[4], 0.25);
      }
      ps.draw(p, "front"), lights.draw(p);
    }
  };
}

// pixelfx/src/fx/pickups/collect-burst.js
var collect_burst_exports = {};
__export(collect_burst_exports, {
  create: () => create3,
  meta: () => meta3
});

// pixelfx/src/fx/pickups/_lib.js
var SHADOW = hex("#100e17");
var INK3 = hex("#0b0814");
function glint(p, x, y, arm, c, k = 0.4, tip = scale(c, 0.8)) {
  let n = Math.round(arm), X = Math.floor(x), Y = Math.floor(y);
  if (!(n < 0)) {
    for (let d = 1; d <= n; d++) {
      let cc = d === n && n > 1 ? tip : c;
      p.px(X + d, Y, cc), p.px(X - d, Y, cc), p.px(X, Y + d, cc), p.px(X, Y - d, cc);
    }
    p.px(X, Y, n > 0 ? WHITE : c), p.glow(X + 0.5, Y + 0.5, 3 + n * 2.5, c, k);
  }
}

// pixelfx/src/fx/pickups/collect-burst.js
var meta3 = {
  name: "Collect burst",
  desc: "The moment of pickup: a white flash and a cross of light, a thin ring snapping out ahead of a softer one, twinkles thrown wide on curving paths that brake, hang and wink out.",
  tags: ["pickup", "collect", "burst", "sparkle", "reward", "one-shot"],
  size: [112, 108],
  origin: [56, 94],
  duration: 1.35,
  loop: !1,
  fps: 30,
  bg: "ground",
  options: { palette: ["#1a0516", "#3d0a33", "#701560", "#b0228f", "#f53cd1", "#ff86e6", "#ffd2f6", "#ffffff"], seed: 3 }
}, CY2 = -30;
function create3(o) {
  let C = fit(o.palette, 8), R = new Rng(o.seed), lights = new Lights();
  lights.add(0, CY2, 36, C[5], 0.85, 0.32), lights.add(0, CY2, 14, WHITE, 0.75, 0.08);
  let stars = Array.from({ length: 14 }, (_, i) => {
    let a = i / 14 * TAU + R.range(-0.2, 0.2), sp = R.range(145, 225) * (i % 3 === 0 ? 1.12 : 0.85);
    return { x: 0, y: CY2, a, sp, turn: (i % 2 ? 1 : -1) * R.range(2.5, 5), life: R.range(0.75, 1.15), age: 0, size: i % 3 === 0 ? 2.6 : R.range(1.2, 2), tr: [], c: i % 4 === 0 ? WHITE : i % 2 ? C[6] : C[5], ph: R.range(0, TAU) };
  }), motes = Array.from({ length: 7 }, () => ({ x: R.range(-8, 8), y: CY2 + R.range(-4, 6), vy: -R.range(12, 30), life: R.range(0.5, 0.9), d: R.range(0.05, 0.25), w: R.range(0, TAU) })), t = 0;
  return {
    update(dt) {
      t += dt;
      for (let s of stars)
        s.age > s.life || (s.age += dt, s.tr.unshift([s.x, s.y]), s.tr.length > 4 && s.tr.pop(), s.a += s.turn * dt * Math.max(0, 1 - s.age * 1.5), s.sp -= s.sp * 4.3 * dt, s.x += Math.cos(s.a) * s.sp * dt, s.y += Math.sin(s.a) * s.sp * dt + 6 * s.age * dt, s.y > -2 && (s.y = -2, s.a = -Math.abs(s.a), s.sp *= 0.5));
      lights.update(dt);
    },
    draw(p) {
      if (t < 0.07 && p.circle(0, CY2, 5.5 * (1 - t / 0.07) + 1, WHITE), t < 0.16) {
        let k = 1 - t / 0.16, L = 26 * ease.outCubic(Math.min(1, t / 0.03 + 0.4)) * k;
        for (let [dx, dy, l] of [[1, 0, 1], [-1, 0, 1], [0, 1, 0.6], [0, -1, 0.6]])
          p.line(0, CY2, dx * L * l, CY2 + dy * L * l, (u) => u < 0.3 ? WHITE : u < 0.65 ? C[6] : C[5], (u) => (u < 0.5 ? 1 : (1 - u) * 2) * (0.5 + k));
        p.glow(0, CY2, 20 * k + 4, C[5], 0.6 * k);
      }
      let u1 = t / 0.32;
      if (u1 < 1) {
        let r = 3 + 23 * ease.outExpo(u1);
        p.ring(0, CY2, r, 1, u1 < 0.3 ? WHITE : C[6], 1.3 - u1 * 1.2), p.glowRing(0, CY2, r, 4, C[5], 0.4 * (1 - u1));
      }
      let u2 = (t - 0.04) / 0.5;
      if (u2 > 0 && u2 < 1) {
        let r = 2 + 16 * ease.outCubic(u2);
        p.ring(0, CY2, r, Math.max(1, 2.6 * (1 - u2)), C[5], 1 - u2);
      }
      for (let s of stars) {
        if (s.age > s.life) continue;
        let k = 1 - s.age / s.life, tw = 0.65 + 0.35 * Math.sin(s.age * 26 + s.ph);
        s.tr.forEach(([x, y], i) => i > 0 && p.dot(x, y, i < 2 ? C[5] : C[4], (1 - i / 4) * k * 1.4)), !(k < 0.3 && Math.sin(s.age * 40 + s.ph) < 0) && glint(p, s.x, s.y, Math.round(s.size * tw * Math.min(1, k * 2.5)), s.c, 0.45 * k);
      }
      for (let m of motes) {
        let a = t - m.d;
        if (a < 0 || a > m.life) continue;
        let k = 1 - a / m.life, x = m.x + Math.sin(a * 6 + m.w) * 1.5, y = m.y + m.vy * a;
        p.dot(x, y, k > 0.5 ? C[6] : C[5], k * 1.5), p.glow(x + 0.5, y + 0.5, 3, C[5], 0.3 * k);
      }
      lights.draw(p);
    }
  };
}

// pixelfx/src/fx/water/splash.js
var splash_exports = {};
__export(splash_exports, {
  create: () => create4,
  meta: () => meta4
});

// pixelfx/src/fx/water/_lib.js
var WATER = ["#0a1630", "#123063", "#1b5596", "#2a7fc4", "#45a9e3", "#86d3f5", "#cdf1ff", "#ffffff"], ROCK = ["#141219", "#221f2b", "#34303f", "#4a4558", "#655f74", "#8a8498"];
function bead(p, x, y, vx, vy, s, C, a = 1) {
  let sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp, tail = Math.min(5, sp * 0.011);
  if (tail >= 1 && p.line(x - ux * (tail + 1), y - uy * (tail + 1), x - ux * 1.2, y - uy * 1.2, (u) => u < 0.45 ? C[3] : s > 1 ? C[5] : C[4], a), s >= 3)
    p.circle(x, y, 1.75, C[4], a), p.circle(x - 0.25, y - 0.25, 1.15, C[6], a), p.dot(x - 0.7, y - 0.7, WHITE, a);
  else if (s >= 2) {
    let X = Math.floor(x), Y = Math.floor(y);
    p.dot(X, Y, WHITE, a), p.dot(X + 1, Y, C[6], a), p.dot(X, Y + 1, C[5], a), p.dot(X + 1, Y + 1, C[4], a);
  } else p.dot(x, y, sp > 160 ? C[6] : C[5], a);
}
var Drops = class {
  constructor({ sy = 0.22, g = 820, drag = 0.35, onLand = null } = {}) {
    this.sy = sy, this.g = g, this.drag = drag, this.onLand = onLand, this.list = [];
  }
  add(d) {
    let life = d.life ?? 4;
    this.list.push({ x: 0, z: 0, h: 0, vx: 0, vz: 0, vh: 0, s: 1, delay: 0, ...d, life, max: life });
  }
  get count() {
    return this.list.length;
  }
  update(dt) {
    let k = this.drag * dt;
    for (let i = this.list.length - 1; i >= 0; i--) {
      let d = this.list[i];
      if (d.delay > 0) {
        d.delay -= dt;
        continue;
      }
      if ((d.life -= dt) <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      d.vh -= this.g * dt, d.vx -= d.vx * k, d.vz -= d.vz * k, d.vh -= d.vh * k * 0.5, d.x += d.vx * dt, d.z += d.vz * dt, d.h += d.vh * dt, d.h <= 0 && d.vh < 0 && (d.h = 0, this.list.splice(i, 1), this.onLand?.(d));
    }
  }
  /** Draw the drops behind z = 0 ("back"), in front of it ("front"), or all. */
  draw(p, C, layer) {
    for (let d of this.list) {
      if (d.delay > 0 || layer === "back" && d.z >= 0 || layer === "front" && d.z < 0) continue;
      let x = d.x, y = d.z * this.sy - d.h;
      bead(p, x, y, d.vx, d.vz * this.sy - d.vh, d.s, C, Math.min(1, d.life / 0.2)), p.glow(x, y, 2.5 + d.s, C[5], 0.1 + 0.05 * d.s);
    }
  }
};
function ring(p, cx, cy, r, sy, k, C, { n = 2, gap = 3, half = 0, hot = !1, glint: glint2 = 0, seed = 0, wob = 0 } = {}) {
  if (!(k <= 0.02 || r < 0.5)) {
    for (let j = 0; j < n; j++) {
      let rr = r - j * gap;
      if (rr < 0.6) break;
      let kj = k * (1 - j * 0.42), m = Math.max(6, Math.ceil(rr * TAU * 1.3)), need = 1.15 - 2.3 * Math.min(1, kj * 1.25);
      for (let i = 0; i < m; i++) {
        let a = i / m * TAU, s = Math.sin(a), near = s > 0;
        if (half > 0 && !near || half < 0 && near || noise(a * 4.7 + seed * 13.1 + j * 5.3, seed) * 0.65 + noise(a * 11.3 + seed * 7.7, seed + 3) * 0.35 < need) continue;
        let lit = kj * (near ? 1 : 0.7) * (0.88 - 0.12 * Math.cos(a)), c = hot && near && j === 0 ? WHITE : C[lit > 0.7 ? 6 : lit > 0.38 ? 5 : 4], ra = wob ? rr + wob * noise(a * 2.6 + seed * 1.9 + j, seed + 11) : rr, x = cx + Math.cos(a) * ra, y = cy + s * ra * sy;
        p.dot(x, y, c), j === 0 && p.light(x, y, C[4], 0.3 * lit);
      }
    }
    if (glint2 > 0 && half >= 0) {
      let x = cx + Math.cos(2.05) * r, y = cy + Math.sin(2.05) * r * sy;
      p.px(x, y, WHITE), p.glow(x, y, 3 + glint2 * 2, C[5], 0.35 * glint2);
    }
  }
}
var Ripples = class {
  constructor({ sy = 0.22 } = {}) {
    this.sy = sy, this.list = [];
  }
  add(x, z, r0, r1, life, o = {}) {
    this.list.push({ x, z, r0, r1, life, age: -(o.delay ?? 0), k: o.k ?? 1, n: o.n ?? 2, gap: o.gap ?? 3, hot: o.hot ?? 0.1, glint: o.glint ?? 0, seed: this.seq = (this.seq ?? 0) + 1 });
  }
  get count() {
    return this.list.length;
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) (this.list[i].age += dt) >= this.list[i].life && this.list.splice(i, 1);
  }
  draw(p, C, half = 0) {
    for (let q of this.list) {
      if (q.age < 0) continue;
      let u = q.age / q.life, r = q.r0 + (q.r1 - q.r0) * (1 - Math.pow(1 - u, 2.6)), k = q.k * Math.pow(1 - u, 1.7);
      ring(p, q.x, q.z * this.sy, r, this.sy, k, C, { n: q.n, gap: q.gap * (0.55 + 0.6 * u), half, hot: q.age < q.hot, glint: q.glint * k, seed: q.seed });
    }
  }
};
function lace(p, cx, cy, rx, ry, k, C, t, seed = 0) {
  if (k <= 0.01 || rx < 1) return;
  let sy = ry / rx;
  p.shade(cx - rx, cy - ry, cx + rx, cy + ry, (x, y, o) => {
    let dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy;
    if (d > 1) return;
    let u = (x - cx) * 0.36, v = (y - cy) / sy * 0.36, n = noise2(u + seed * 7.13, v - t * 0.35, seed), m = noise2(u * 2.2 - t * 0.3, v * 2.2 + seed * 3.1, seed + 9), net = 1 - Math.abs(n) * 4.6 + m * 0.3, need = 1.02 - k * (1.15 - d * 0.9);
    net < need || (o.c = net > need + 0.4 ? WHITE : C[6]);
  });
}
var Mist = class {
  constructor() {
    this.list = [];
  }
  add(x, y, vx, vy, r0, r1, life, c, a = 0.25, delay = 0) {
    this.list.push({ x, y, vx, vy, r0, r1, life, max: life, c: hex(c), a, delay });
  }
  get count() {
    return this.list.length;
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      let m = this.list[i];
      if (m.delay > 0) {
        m.delay -= dt;
        continue;
      }
      if ((m.life -= dt) <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      m.vx -= m.vx * 2.4 * dt, m.vy -= m.vy * 2.4 * dt + 7 * dt, m.x += m.vx * dt, m.y += m.vy * dt;
    }
  }
  draw(p, haze) {
    for (let m of this.list) {
      if (m.delay > 0) continue;
      let age = 1 - m.life / m.max, r = m.r0 + (m.r1 - m.r0) * (1 - Math.pow(1 - age, 2.2)), a = m.a * Math.min(1, age / 0.12) * Math.pow(1 - age, 1.4);
      a < 0.01 || (p.disc(m.x, m.y, r, m.c, (d) => a * (1 - d * d) * (1 - d * 0.5)), p.disc(m.x - r * 0.2, m.y - r * 0.32, r * 0.55, WHITE, (d) => a * 0.25 * (1 - d) * (1 - d)), haze && p.glow(m.x, m.y, r * 1.5, haze, 0.16 * a / m.a * Math.min(1, m.a * 3)));
    }
  }
};
function pebble(p, x, y, r, ST) {
  p.shade(x - r - 1, y - r - 1, x + r + 1, y + r + 1, (px, py, o) => {
    let dx = px - x, dy = py - y, d = Math.hypot(dx * 1.1, dy);
    if (d > r + 0.8) return;
    let lit = (dx + dy) / Math.max(0.5, r);
    o.c = d > r ? ST[0] : lit < -0.7 ? ST[5] : lit < 0.2 ? ST[4] : lit < 0.8 ? ST[3] : ST[2];
  });
}
var rock = () => ROCK.map(hex);

// pixelfx/src/fx/water/splash.js
var meta4 = {
  name: "Splash",
  desc: "A stone drops into still water: a white hit, a crown that tears into droplets arcing out to plink down with rings, a jet that bounces back, foam and drifting mist.",
  tags: ["water", "splash", "impact", "drop", "liquid", "one-shot"],
  size: [176, 100],
  origin: [88, 78],
  duration: 2.5,
  loop: !1,
  fps: 30,
  bg: "ground",
  options: { palette: WATER, stone: !0, seed: 3 }
}, SY = 0.22, HIT = 0.16, G = 820, FINGERS = 12, JET = 0.3, TEAR = 0.11, height = (u) => 19 * ease.outCubic(clamp(u / 0.09)) * (1 - ease.inQuad(clamp((u - 0.12) / 0.3))), foot = (u) => 3 + 7.5 * ease.outCubic(clamp(u / 0.45)), lip = (u) => foot(u) + height(u) * 0.42 + 3 * ease.outCubic(clamp(u / 0.25)), jetH = (u) => 26 * (ease.outCubic(clamp(u / 0.12)) - ease.inQuad(clamp((u - 0.15) / 0.28)));
function create4(o) {
  let C = fit(o.palette, 8), R = new Rng(o.seed), ST = rock(), phi = R.range(0, TAU), ps = new Particles({ rng: R }), mist = new Mist(), lights = new Lights(), rings = new Ripples({ sy: SY }), plinks = [], bubbles = [], spikes = Array.from({ length: FINGERS }, (_, k) => ({ a: (k * TAU / FINGERS + phi) % TAU, L: R.range(0.2, 0.36) })), drops = new Drops({
    sy: SY,
    g: G,
    onLand: (d) => {
      if (rings.add(d.x, d.z, 0.6, 2 + d.s * 1.8, 0.34 + d.s * 0.1, { n: 1, k: 0.95, hot: 0.06 }), plinks.push({ x: d.x, y: d.z * SY, s: d.s, age: 0 }), d.s > 1 && !d.small)
        for (let i = 0; i < d.s; i++) {
          let a = R.range(0, TAU), v = R.range(10, 34);
          drops.add({ x: d.x, z: d.z, h: 0.5, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vh: R.range(55, 110), s: 1, small: !0, life: 1 });
        }
    }
  }), t = 0, done = /* @__PURE__ */ new Set(), once = (key, at) => !done.has(key) && t >= at && done.add(key), scallop = (a, h) => h * (0.86 + 0.14 * noise(Math.cos(a) * 2.2 + Math.sin(a) * 1.3 + phi * 3, o.seed));
  function crown(p, back) {
    let u = t - HIT, h = height(u);
    if (u < 0 || h < 0.7) return;
    let r0 = foot(u), rt = lip(u), white = u < 0.045, cells = /* @__PURE__ */ new Map(), put = (x, y, c, a, rank) => {
      let X = Math.floor(x), Y = Math.floor(y), key = (Y + 4096) * 8192 + X + 4096, cur = cells.get(key);
      (!cur || rank > cur.r) && cells.set(key, { x: X, y: Y, c, a, r: rank });
    }, n = Math.ceil(rt * TAU * 1.6);
    for (let i = 0; i < n; i++) {
      let a = i / n * TAU, s = Math.sin(a), c = Math.cos(a);
      if (s < 0 !== back) continue;
      let lane = Math.floor((a + phi) * rt / 2.2), streak = rand(lane, 31) < 0.3, H = scallop(a, h), keep = 1 - clamp((u - 0.13 - 0.14 * rand(lane, 7)) / 0.1), steps = Math.ceil(H * 1.4) + 2;
      for (let k = 0; k <= steps * keep; k++) {
        let v = k / steps, r = r0 + (rt - r0) * Math.pow(v, 2.2), x = c * r, y = s * r * SY - H * v;
        white ? put(x, y, WHITE, 1, 3) : back ? put(x, y, v > 0.72 ? streak ? C[5] : C[4] : streak ? C[3] : C[2], 1, 1) : Math.abs(c) > 0.9 ? put(x, y, c < 0 ? Math.abs(c) > 0.97 ? WHITE : C[6] : C[4], 1, 2) : v < 0.1 ? put(x, y, v < 0.05 ? WHITE : C[6], 1, 2) : streak ? put(x, y, c < -0.2 ? C[6] : C[5], 1, 1) : put(x, y, c < 0 ? C[5] : C[4], 0.22, 0);
      }
      if (!white && keep >= 1) {
        let x = c * rt, y = s * rt * SY - H;
        put(x, y, back ? C[5] : c < 0.45 ? WHITE : C[6], 1, 3), !back && c < 0.2 && put(x, y + 1, C[6], 1, 2);
      }
    }
    for (let q of cells.values())
      q.r === 0 ? p.blend(q.x, q.y, q.c, q.a) : p.px(q.x, q.y, q.c);
    let reach = 1 - smooth(TEAR, TEAR + 0.1, u);
    for (let f of spikes) {
      if (Math.sin(f.a) < 0 !== back || reach <= 0) continue;
      let H = scallop(f.a, h), L = h * f.L * reach, x0 = Math.cos(f.a) * rt, y0 = Math.sin(f.a) * rt * SY - H, x1 = x0 + Math.cos(f.a) * L * 0.45, y1 = y0 - L;
      L >= 1 && p.line(x0, y0, x1, y1, white ? WHITE : back ? C[4] : C[6]), u > 0.04 && u < TEAR && bead(p, x1 - (back ? 0 : 0.5), y1 - 1, 0, -1, back ? 1 : 2, C), !back && Math.sin(f.a) > 0.3 && p.glow(x0, y0, 6, C[5], 0.22 * reach);
    }
  }
  function jet(p) {
    let u = t - HIT - JET, h = jetH(u);
    if (u < 0 || h < 0.8) return;
    let top = -h;
    p.ellipse(0, 0, 5, 2.4, (d, a) => Math.sin(a) > 0 ? null : d < 0.5 ? WHITE : Math.cos(a) < 0 ? C[6] : C[5]), p.shade(-3, top - 2, 3, 0, (x, y, out) => {
      let v = clamp((y - top) / h), w = 1.15 + 1.5 * v * v * v, q = x / w;
      Math.abs(q) > 1 || (out.c = q < -0.5 ? C[6] : q < 0.3 ? WHITE : q < 0.72 ? C[5] : C[4]);
    }), u < 0.12 && (p.circle(0, top - 1, 1.7, C[5]), p.circle(-0.3, top - 1.3, 1.1, C[6]), p.px(-1, top - 2, WHITE)), p.glowLine(0, -1, 0, top, 7, C[5], 0.3);
  }
  return {
    update(dt) {
      if (t += dt, once("hit", HIT)) {
        lights.add(0, -6, 52, C[5], 0.6, 0.45), lights.add(0, -4, 16, WHITE, 0.5, 0.08), rings.add(0, 0, 8, 56, 2, { n: 2, gap: 3.4, k: 1.35, hot: 0.16, glint: 1 }), rings.add(0, 0, 5, 38, 1.7, { n: 1, k: 0.9, delay: 0.14 });
        for (let i = 0; i < 20; i++) {
          let a = R.range(0, TAU), v = R.range(50, 125);
          drops.add({ x: Math.cos(a) * 3, z: Math.sin(a) * 3, h: R.range(1, 6), vx: Math.cos(a) * v, vz: Math.sin(a) * v, vh: R.range(160, 270), s: R.chance(0.25) ? 2 : 1, delay: R.range(0, 0.04) });
        }
        for (let i = 0; i < 9; i++) {
          let s = i % 2 ? 1 : -1, x = s * R.range(4, 12);
          mist.add(x, -R.range(1, 7), s * R.range(25, 70), -R.range(4, 16), R.range(2.5, 4), R.range(7, 11), R.range(0.9, 1.5), R.chance(0.5) ? C[6] : C[5], R.range(0.3, 0.42), R.range(0, 0.1));
        }
      }
      if (once("spray", HIT + 0.04)) {
        for (let i = 0; i < 20; i++) {
          let a = R.range(0, TAU);
          ps.spawn(P.FLAKE, Math.cos(a) * 9, Math.sin(a) * 9 * SY - R.range(6, 15), Math.cos(a) * R.range(25, 90), -R.range(30, 100), R.range(0.7, 1.3), R.chance(0.5) ? WHITE : C[6], R.range(0.6, 1.5));
        }
        for (let i = 0; i < 5; i++) ps.spawn(P.STAR, R.range(-13, 13), -R.range(6, 20), 0, -4, R.range(0.25, 0.55), C[6], R.range(1, 2.4), R.range(0, 0.15));
      }
      if (once("tear", HIT + TEAR)) {
        let h = height(TEAR), rt = lip(TEAR);
        for (let f of spikes) {
          let a = f.a + R.range(-0.08, 0.08), v = R.range(32, 88), L = h * f.L;
          drops.add({ x: Math.cos(f.a) * (rt + L * 0.45), z: Math.sin(f.a) * rt, h: h + L + 1, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vh: R.range(90, 190), s: R.chance(0.3) ? 3 : 2 });
        }
      }
      let u = t - HIT;
      if (u > 0.13 && u < 0.3 && R.chance(0.3)) {
        let a = R.range(0, TAU), rt = lip(u), v = R.range(15, 45);
        drops.add({ x: Math.cos(a) * rt, z: Math.sin(a) * rt, h: scallop(a, height(u)) * R.range(0.6, 1), vx: Math.cos(a) * v, vz: Math.sin(a) * v, vh: R.range(-10, 45), s: R.chance(0.3) ? 2 : 1 });
      }
      if (once("fall", HIT + 0.3))
        for (let i = 0; i < 8; i++) {
          let a = R.range(0, TAU), r = lip(0.3), v = R.range(15, 40);
          drops.add({ x: Math.cos(a) * r, z: Math.sin(a) * r, h: R.range(3, 7), vx: Math.cos(a) * v, vz: Math.sin(a) * v, vh: R.range(30, 80), s: R.chance(0.4) ? 2 : 1 });
        }
      if (once("bead", HIT + JET + 0.12)) {
        drops.add({ x: 0, z: 0.2, h: jetH(0.12) + 1, vx: R.range(-6, 6), vz: 0, vh: 55, s: 3 });
        for (let i = 0; i < 3; i++) mist.add(R.range(-3, 3), -jetH(0.12) + R.range(2, 8), R.range(-14, 14), -R.range(4, 12), 2, R.range(4, 6), R.range(0.6, 1), C[6], 0.3);
      }
      if (once("slump", HIT + JET + 0.38)) {
        rings.add(0, 0, 3, 30, 1.5, { n: 2, gap: 2.6, k: 0.9 });
        for (let i = 0; i < 4; i++) mist.add(R.range(-6, 6), -R.range(1, 4), R.range(-30, 30), -R.range(3, 10), 2.5, R.range(6, 9), R.range(0.8, 1.2), C[5], 0.28);
      }
      for (let [i, at] of [[0, 0.95], [1, 1.2], [2, 1.5]])
        once("glug" + i, HIT + at) && bubbles.push({ x: R.range(-5, 5), z: R.range(-6, 6), t0: t, r: R.range(1.3, 2.3), popped: !1 });
      for (let b of bubbles)
        if (!b.popped && t - b.t0 > 0.2) {
          b.popped = !0, rings.add(b.x, b.z, 1, 7, 0.6, { n: 1, k: 0.9 }), plinks.push({ x: b.x, y: b.z * SY, s: 1, age: 0 });
          for (let i = 0; i < 2; i++) drops.add({ x: b.x, z: b.z, h: 1, vx: R.range(-20, 20), vz: R.range(-10, 10), vh: R.range(50, 90), s: 1, small: !0, life: 1 });
        }
      for (let i = plinks.length - 1; i >= 0; i--) (plinks[i].age += dt) > 0.14 && plinks.splice(i, 1);
      drops.update(dt), rings.update(dt), mist.update(dt), ps.update(dt), lights.update(dt);
    },
    drawBack(p) {
      let u = t - HIT;
      if (u > 0 && u < 0.26) {
        let r = foot(u) * 0.85 * (1 - smooth(0.12, 0.26, u));
        p.ellipse(0, 0, r, r * SY + 0.6, (d, a) => Math.sin(a) < 0 ? C[1] : C[2]);
      }
      rings.draw(p, C, -1), crown(p, !0), drops.draw(p, C, "back");
    },
    draw(p) {
      let u = t - HIT;
      if (rings.draw(p, C, 1), u > 0.2) {
        let rx = 4 + 11 * ease.outCubic(clamp((u - 0.2) / 0.7)), k = smooth(0.2, 0.32, u) * (1 - smooth(0.5, 2, u)) * 0.9;
        lace(p, 0, 0, rx, rx * SY + 0.5, k, C, t, o.seed);
      }
      crown(p, !1), jet(p);
      for (let b of bubbles) {
        let g = (t - b.t0) / 0.2;
        if (g > 1) continue;
        let r = b.r * ease.outBack(g), x = b.x, y = b.z * SY;
        for (let a = Math.PI; a <= TAU + 0.01; a += 0.5 / Math.max(1, r)) p.dot(x + Math.cos(a) * r, y + Math.sin(a) * r, C[6]);
        p.px(x - r * 0.4, y - r * 0.6, WHITE), p.glow(x, y - 1, 4, C[5], 0.25);
      }
      for (let q of plinks) {
        let k = q.age / 0.14;
        k < 0.5 && p.px(q.x, q.y, WHITE), q.s > 1 && p.line(q.x, q.y - 1, q.x, q.y - 1 - 3 * (1 - k), k < 0.4 ? WHITE : C[6]), p.glow(q.x, q.y, 4, C[5], 0.3 * (1 - k));
      }
      if (drops.draw(p, C, "front"), u >= 0 && u < 0.07 && (p.ellipse(0, 0, 10, 2.4, (d) => d < 0.6 ? WHITE : C[6]), sparkle(p, 0, -3, 5 * (1 - u / 0.07), C[6], C[5], 0.5)), o.stone && t < HIT) {
        let v = t / HIT, y = -70 + 70 * (0.4 * v + 0.6 * v * v);
        p.line(0, y - 12, 0, y - 3, ST[4], (w) => w * 0.8), pebble(p, 0, y, 2.6, ST);
      }
      mist.draw(p, C[5]), ps.draw(p), lights.draw(p), u > 0 && (p.glow(0, -2, 34, C[4], 0.2 * (1 - smooth(0, 1.6, u))), p.glow(0, 2, 64, C[3], 0.16 * (1 - smooth(0.1, 2.1, u))));
    }
  };
}

// pixelfx/src/fx/impacts/blunt-hit.js
var blunt_hit_exports = {};
__export(blunt_hit_exports, {
  create: () => create5,
  meta: () => meta5
});

// pixelfx/src/fx/impacts/_lib.js
var SOOT = hex("#0d0a12"), OUTLINE = hex("#1a1422"), LIGHT2 = Math.atan2(-1, -1);
function stone(c) {
  return c = hex(c), { light: mix(scale(c, 1.35), WHITE, 0.08), body: c, shade: scale(c, 0.64), dust: mix(scale(c, 1.2), rgb(150, 140, 150), 0.3), lip: mix(scale(c, 1.55), WHITE, 0.12) };
}
function star(p, x, y, list, sc, th, [rim, body, inner, core], a = 1, heart = 2.4) {
  for (let pass = 0; pass < 3; pass++)
    for (let s of list) {
      let c = Math.cos(s.a), sn = Math.sin(s.a), L = s.len * sc;
      for (let d = 0; d <= L && !(pass === 2 && d > L * 0.55); d += 0.5) {
        let hw0 = s.w * th * (1 - d / L) * Math.min(1, 0.5 + d / 3), hw = pass === 0 ? hw0 + 0.8 : pass === 1 ? hw0 : hw0 * 0.45, col = pass === 0 ? rim : pass === 1 ? d < L * 0.35 ? inner : body : core;
        for (let o = -hw; o <= hw; o += 0.5) p.dot(x + c * d - sn * o, y + sn * d + c * o, col, a);
      }
    }
  let r = heart * sc * Math.sqrt(th);
  p.circle(x, y, r + 0.8, inner, a), p.circle(x, y, r, core, a);
}
function walk(R, x, y, a, L, { jit = 0.55, steer = 0.45, step = [2, 4], maxY = 1 / 0, d0 = 0 } = {}) {
  let pts = [[x, y, d0]], d = 0, cur = a;
  for (; d < L - 0.01; ) {
    let s = Math.min(L - d, R.range(step[0], step[1]));
    cur += R.range(-jit, jit) + (a - cur) * steer, x += Math.cos(cur) * s, y = clamp(y + Math.sin(cur) * s, 0.5, maxY), d += s, pts.push([x, y, d0 + d]);
  }
  return pts;
}
function makeCracks(R, n, { len: len2 = [14, 40], dive = 0.85, maxY = 22, forks = 0.5, x0 = [1, 5] } = {}) {
  let out = [];
  for (let i = 0; i < n; i++) {
    let side = i % 2 ? 1 : -1, dip = 0.06 + Math.pow(R.next(), 1.7) * dive, L = R.range(len2[0], len2[1]) * (1 - 0.5 * dip / (dive + 0.06)), a = side > 0 ? dip : Math.PI - dip, pts = walk(R, side * R.range(x0[0], x0[1]), R.range(0.5, 1.5), a, L, { maxY }), c = { pts, len: L, t0: R.range(0, 0.035), kids: [] };
    for (let j = 2; j < pts.length - 1; j++)
      if (R.chance(forks * 0.4)) {
        let [fx, fy, fd] = pts[j];
        c.kids.push(walk(R, fx, fy, a + R.sign() * R.range(0.45, 1), R.range(3, 9) * (1 - 0.5 * j / pts.length), { maxY, d0: fd, jit: 0.7, step: [1.5, 3] }));
      }
    out.push(c);
  }
  return out;
}
function drawCracks(p, cracks, g, heat, hot, dark, lip2, k = 1) {
  if (k <= 0) return;
  let col = (d) => {
    let h = heat(d);
    return h > 0.75 ? hot[0] : h > 0.5 ? hot[1] : h > 0.3 ? hot[2] : h > 0.12 ? hot[3] : dark;
  };
  for (let c of cracks) {
    let G2 = g(c);
    if (!(G2 <= 0))
      for (let path of [c.pts, ...c.kids])
        for (let i = 1; i < path.length; i++) {
          let [x0, y0, d0] = path[i - 1], [x1, y1, d1] = path[i];
          if (d0 >= G2) break;
          let f = d1 > G2 ? (G2 - d0) / (d1 - d0) : 1, ex = x0 + (x1 - x0) * f, ey = y0 + (y1 - y0) * f;
          p.line(x0, y0 + 1, ex, ey + 1, lip2, (u) => rand(Math.round(x0 + (ex - x0) * u), Math.round(y0 + (ey - y0) * u), 5) < 0.3 ? k * 0.8 : 0), p.line(x0, y0, ex, ey, (u) => col(d0 + (d1 - d0) * f * u), k);
          let h = heat(d0);
          h > 0.12 && p.glow((x0 + ex) / 2, (y0 + ey) / 2, 4 + h * 4, hot[2], 0.22 * h * k);
        }
  }
}
function frontCrescent(p, x, dir, h, w, cols, k = 1) {
  if (h < 1 || w < 0.3 || k <= 0) return;
  let ry = h * 0.8, cy = -h * 0.2, rx = Math.max(2, h * 0.55), x0 = dir > 0 ? x - rx - w - 1 : x - 1, x1 = dir > 0 ? x + 1 : x + rx + w + 1;
  p.shade(x0, -h - 1, x1, 0, (px, py, out) => {
    if (py > 0) return;
    let ey = (py - cy) / ry;
    if (ey <= -1 || ey >= 1) return;
    let e2 = 1 - ey * ey, edge = rx * Math.sqrt(e2) - rx, wt = w * Math.pow(e2, 0.45), q = (edge - (px - x) * dir) / Math.max(0.5, wt);
    q < 0 || q > 1 || (out.c = q < 0.28 ? cols[0] : q < 0.62 ? cols[1] : cols[2], out.a = k * (ey < -0.8 ? 0.7 : 1) * (q > 0.7 ? 1.25 - q * 0.8 : 1));
  });
}
function dustRing(p, cx, cy, r, w, k, c, { sy = 1, ph = 0, brk = 0, lit = 0.35, maxY = 1 / 0, half = 0 } = {}) {
  if (k <= 0.01 || r <= 0) return;
  let W = w * 1.6, lite = mix(c, WHITE, lit);
  for (let y = Math.floor(cy - (r + W) * sy) - 1; y <= Math.min(maxY - 1, Math.ceil(cy + (r + W) * sy) + 1); y++)
    for (let x = Math.floor(cx - r - W) - 1; x <= Math.ceil(cx + r + W) + 1; x++) {
      let dx = x + 0.5 - cx, dy = (y + 0.5 - cy) / sy, d = Math.hypot(dx, dy), g = Math.atan2(dy, dx);
      if (half < 0 && dy >= 0 || half > 0 && dy < 0) continue;
      let lumpy = 0.6 + 0.3 * Math.sin(5 * g + ph) + 0.18 * Math.sin(11 * g + ph * 2.1) + 0.12 * Math.sin(17 * g + ph * 0.7), wt = w * lumpy, off = Math.abs(d - r - w * 0.25 * Math.sin(7 * g + ph));
      if (off >= wt) continue;
      let tear = brk > 0 ? clamp((0.55 + 0.45 * Math.sin(6 * g + ph * 1.7) - brk) / 0.25) : 1, a = k * (1 - Math.pow(off / wt, 2)) * tear;
      a > 0.01 && p.blend(x, y, dy < 0 && d > r - wt * 0.3 ? lite : c, a);
    }
}
var rockShape = (R, n = 6) => Array.from({ length: n }, () => R.range(0.7, 1.12));
function rock2(p, b, st) {
  let r = 0.75 + b.s * 0.8, n = b.pts.length, fade = Math.min(1, b.life / 0.5), ca = Math.cos(b.a), sa = Math.sin(b.a);
  p.shade(b.x - r - 2, b.y - r - 2, b.x + r + 2, b.y + r + 2, (x, y, out) => {
    let dx = x - b.x, dy = y - b.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, d = Math.hypot(u, v), ang = Math.atan2(v, u);
    ang < 0 && (ang += TAU);
    let f = ang / TAU * n, i = Math.floor(f) % n, w = f - Math.floor(f), edge = r * (b.pts[i] * (1 - w) + b.pts[(i + 1) % n] * w);
    if (d > edge + 0.85) return;
    if (out.a = fade, d > edge) return OUTLINE;
    let lit = Math.cos((i + 0.5) / n * TAU + b.a - LIGHT2);
    return d < edge * 0.42 ? lit > 0.55 ? st.light : st.body : lit > 0.35 ? st.light : lit < -0.4 ? st.shade : st.body;
  });
}

// pixelfx/src/fx/impacts/blunt-hit.js
var meta5 = {
  name: "Blunt hit",
  desc: "A heavy, soft thud: a white-hot lumpy blob cools to cream in a warm pool of light, inked wedges jab out and snap back, a squashed ring of dust puffs swells and drifts, clods drop.",
  tags: ["impact", "hit", "blunt", "punch", "club", "thump", "dust", "comic", "one-shot"],
  size: [128, 88],
  origin: [64, 72],
  duration: 0.9,
  loop: !1,
  fps: 30,
  bg: "ground",
  options: { palette: ["#1d1620", "#4a3a3c", "#7d6a66", "#b09c90", "#dccab4", "#f6ead2", "#ffffff"], warm: "#ffc98a", dust: "#b7a8a6", clod: "#6e5a5a", height: 22, seed: 9 }
}, lump = (r, a, ph) => r * (1 + 0.15 * Math.sin(5 * a + ph) + 0.08 * Math.sin(9 * a + ph * 2.3));
function create5(o) {
  let C = fit(o.palette, 7), R = new Rng(o.seed), X = 0, Y = -o.height, PH = R.range(0, TAU), floor = () => 0, WARM = hex(o.warm), DUST2 = hex(o.dust), st = stone(o.clod), lights = new Lights(), bits = new Bits({ ground: floor });
  lights.add(X, Y, 48, WARM, 0.6, 0.4), lights.add(X, Y, 16, WHITE, 0.6, 0.07), lights.add(X, -2, 36, WARM, 0.25, 0.4);
  let wedges = Array.from({ length: 9 }, (_, i) => ({ a: i / 9 * TAU + R.range(-0.2, 0.2), len: R.range(6, 15), w: R.range(3.2, 5), r0: R.range(13, 16), t0: R.range(0.015, 0.04), out: R.range(0.04, 0.06), back: R.range(0.09, 0.14) })), puffs = Array.from({ length: 30 }, (_, i) => {
    let a = i / 30 * TAU + R.range(-0.12, 0.12), side = Math.abs(Math.cos(a)), v = R.range(40, 140) * (0.6 + 0.5 * side);
    return { x: X + Math.cos(a) * 9, y: Y + Math.sin(a) * 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5, r: R.range(2.4, 6.2) * (0.75 + 0.35 * side), life: R.range(0.35, 0.85), max: 0, t0: R.range(0.03, 0.1), lift: R.range(4, 16) };
  });
  for (let i = 0; i < 5; i++)
    puffs.push({ x: X + R.range(-6, 6), y: Y - R.range(3, 6), vx: R.range(-30, 30), vy: -R.range(20, 45), r: R.range(3.5, 5.5), life: R.range(0.6, 0.85), max: 0, t0: R.range(0.05, 0.1), lift: R.range(14, 24) });
  for (let q of puffs) q.max = q.life;
  for (let i = 0; i < 5; i++) {
    let s = R.sign(), a = -Math.PI / 2 + s * R.range(0.5, 1.3), v = R.range(70, 140);
    bits.add({ kind: B.CHUNK, x: X + s * R.range(4, 8), y: Y + R.range(-3, 3), vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 1, drag: 0.6, bounce: 0.28, life: R.range(0.65, 0.85), a: R.range(0, TAU), va: s * R.range(8, 16), s: R.chance(0.4) ? 2 : 1, pts: rockShape(R), pvy: 0 });
  }
  let kicks = [], t = 0;
  return {
    update(dt) {
      t += dt;
      for (let q of puffs)
        t < q.t0 || (q.life -= dt, q.vx -= q.vx * 4.5 * dt, q.vy -= q.vy * 4.5 * dt + (q.lift ?? 6) * dt, q.x += q.vx * dt, q.y += q.vy * dt);
      for (let b of bits.list) b.pvy = b.vy;
      bits.update(dt);
      for (let b of bits.list)
        if (b.pvy > 60 && b.vy <= 0) {
          for (let i = 0; i < 2; i++) kicks.push({ x: b.x, y: -1, vx: R.sign() * R.range(8, 22), vy: -R.range(3, 10), r: R.range(1.2, 2), life: 0.4, max: 0.4, t0: 0 });
          b.pvy = 0;
        }
      for (let q of kicks)
        q.life -= dt, q.vx -= q.vx * 4 * dt, q.vy -= q.vy * 4 * dt, q.x += q.vx * dt, q.y += q.vy * dt;
      lights.update(dt);
    },
    draw(p) {
      for (let q of [...puffs, ...kicks]) {
        let k = q.life / q.max;
        if (t < q.t0 || k <= 0) continue;
        let r = q.r * (0.7 + (1 - k) * 0.85), a = Math.pow(k, 1.25) * Math.min(1, (t - q.t0) / 0.03), c = mix(DUST2, WARM, clamp(1 - (t - 0.03) / 0.25) * 0.55);
        p.disc(q.x, q.y, r, c, (d) => 0.58 * a * (1 - d * d * 0.75)), p.disc(q.x - r * 0.22, q.y - r * 0.32, r * 0.58, mix(c, WHITE, 0.55), (d) => 0.48 * a * (1 - d * d));
      }
      for (let b of bits.list) rock2(p, b, st);
      if (t < 0.058) {
        let f = t < 0.025 ? 0 : 1, R0 = f ? 13.5 : 11.5;
        p.shade(X - R0 * 1.4, Y - R0 * 1.4, X + R0 * 1.4, Y + R0 * 1.4, (x, y) => {
          let dx = x - X, dy = (y - Y) * (f ? 1.25 : 1.1), d = Math.hypot(dx, dy), ro = lump(R0, Math.atan2(dy, dx), PH + f * 0.6);
          if (d > ro) return;
          let q = d / ro;
          return f === 0 ? q < 0.55 ? WHITE : q < 0.86 ? C[5] : C[4] : q < 0.3 ? WHITE : q < 0.72 ? C[5] : q < 0.9 ? C[4] : C[3];
        });
      }
      for (let w of wedges) {
        let u = t - w.t0;
        if (u < 0 || u > w.out + w.back) continue;
        let s = u < w.out ? ease.outCubic(u / w.out) : 1 - ease.inQuad((u - w.out) / w.back), L = w.len * s;
        if (L < 1.5) continue;
        let ca = Math.cos(w.a), sa = Math.sin(w.a), r0 = w.r0 + 2 * s, hw = w.w * (0.6 + 0.4 * s) / 2, tip = [X + ca * r0, Y + sa * r0], end = [X + ca * (r0 + L), Y + sa * (r0 + L)], n = [-sa * hw, ca * hw], wedge = (g) => [[tip[0] - ca * g, tip[1] - sa * g], [end[0] + n[0] * (1 + g * 0.45) + ca * g, end[1] + n[1] * (1 + g * 0.45) + sa * g], [end[0] - n[0] * (1 + g * 0.45) + ca * g, end[1] - n[1] * (1 + g * 0.45) + sa * g]];
        p.poly(wedge(1), C[1]), p.poly(wedge(0), u < w.out + 0.02 ? WHITE : C[5]);
      }
      let pop = Math.exp(-t / 0.06);
      pop > 0.02 && p.glow(X, Y, 28, WARM, 0.5 * pop), lights.draw(p);
    }
  };
}

// pixelfx/src/fx/impacts/ground-slam.js
var ground_slam_exports = {};
__export(ground_slam_exports, {
  create: () => create6,
  meta: () => meta6
});
var meta6 = {
  name: "Ground slam",
  desc: "Something lands hard: the floor flashes and cracks, two crescent shock waves race out along it, a dust wave and a tall dust cloud rise, rocks erupt, bounce and settle.",
  tags: ["impact", "ground", "slam", "shockwave", "quake", "rocks", "dust", "one-shot"],
  size: [288, 208],
  origin: [144, 164],
  duration: 3.2,
  loop: !1,
  fps: 30,
  bg: "ground",
  options: { palette: ["#2a1712", "#5e2c1c", "#a4502a", "#e8893a", "#ffc764", "#fff0b4", "#ffffff"], stone: "#4a3f69", reach: 104, seed: 5 }
}, WAVE = 0.6;
function crater(p, st, hot, C, k) {
  for (let x = -12; x <= 11; x++) {
    let q = Math.abs(x + 0.5) / 12, dep = Math.round(2.6 * (1 - q * q));
    if (q < 0.84) {
      for (let y = 0; y < dep; y++) p.dot(x, y, SOOT, k);
      p.dot(x, dep, hot > 0.5 ? C[5] : hot > 0.2 ? C[4] : st.lip, k);
    } else
      p.dot(x, -1, q > 0.93 ? st.light : st.lip, k), q < 0.9 && p.dot(x, -2, st.light, k * 0.8);
  }
}
function create6(o) {
  let C = fit(o.palette, 7), st = stone(o.stone), REACH = o.reach, R = new Rng(o.seed), floor = () => 0, D = meta6.duration, ps = new Particles({ rng: R, ground: floor, sparks: [C[6], C[5], C[4], C[3]] }), bits = new Bits({ ground: floor }), lights = new Lights(), HOT2 = [WHITE, C[5], C[4], C[3]], dustLit = mix(st.dust, WHITE, 0.2), cracks = makeCracks(R, 10, { len: [22, 58], dive: 0.55, maxY: 22, forks: 0.7, x0: [2, 9] }), front = (t2) => 7 + (REACH - 7) * ease.outCubic(clamp((t2 - 0.015) / WAVE)), heat = (t2) => Math.pow(clamp(1 - t2 / 0.8), 1.4), crest = (u) => [6 + 28 * Math.pow(1 - u, 0.75), 1.5 + 5 * Math.pow(1 - u, 0.9)], burst = [
    { a: -0.07, len: R.range(34, 40), w: 1.9 },
    { a: Math.PI + 0.07, len: R.range(34, 40), w: 1.9 },
    { a: -0.42 + R.range(-0.08, 0.08), len: R.range(15, 20), w: 1.5 },
    { a: -Math.PI + 0.42 + R.range(-0.08, 0.08), len: R.range(15, 20), w: 1.5 },
    { a: -Math.PI / 2 + R.range(-0.15, 0.15), len: R.range(18, 24), w: 1.7 },
    { a: -1.05 + R.range(-0.1, 0.1), len: R.range(10, 14), w: 1.2 },
    { a: -Math.PI + 1.05 + R.range(-0.1, 0.1), len: R.range(10, 14), w: 1.2 }
  ], embers = [];
  for (let c of cracks)
    for (let [x, y, d] of c.pts) d > 3 && d < 32 && R.chance(0.25) && embers.push({ x, y, d, life: R.range(0.8, 2.2), ph: R.range(0, TAU) });
  lights.add(0, -12, 96, C[4], 0.6, 0.6), lights.add(0, -4, 50, WHITE, 0.9, 0.14);
  for (let i = 0; i < 56; i++) {
    let low = i < 14, s = R.sign(), a = low ? s > 0 ? -R.range(0.04, 0.6) : Math.PI + R.range(0.04, 0.6) : -Math.PI / 2 + R.range(-1.15, 1.15), sp = low ? R.range(150, 380) : R.range(200, 500);
    ps.spawn(P.SPARK, R.range(-4, 4), -1, Math.cos(a) * sp, Math.sin(a) * sp, low ? R.range(0.2, 0.5) : R.range(0.25, 0.65), WHITE, 1, low ? 0 : R.range(0, 0.05));
  }
  for (let i = 0; i < 20; i++) {
    let s = i < 3 ? 4 : R.int(1, 3), a = -Math.PI / 2 + R.range(-0.5, 0.5), sp = s > 3 ? R.range(110, 190) : R.range(170, 380) * (s > 2 ? 0.8 : 1);
    bits.add({ kind: B.CHUNK, x: R.range(-7, 7), y: -2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 1, drag: 0.4, bounce: 0.38, life: R.range(1.9, 2.7), a: R.range(0, TAU), va: R.range(-14, 14), s, pts: rockShape(R), pvy: 0 });
  }
  for (let i = 0; i < 110; i++) {
    let u = R.range(-1, 1), a = -Math.PI / 2 + u * 0.65, sp = R.range(110, 380) * (1 - 0.35 * Math.abs(u));
    ps.spawn(P.GRIT, u * 6, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1, 2.2), R.pick([st.light, st.body, st.body, st.shade, st.shade, st.lip]), R.chance(0.35) ? 2 : 1);
  }
  for (let i = 0; i < 28; i++) {
    let core = i < 14, s = R.sign();
    ps.spawn(P.SMOKE, core ? R.range(-5, 5) : s * R.range(4, 12), -R.range(2, 10), core ? R.range(-12, 12) : s * R.range(14, 38), -R.range(50, 130) * (core ? 1 : R.range(0.3, 0.6)), R.range(1.9, 2.7), R.chance(0.35) ? dustLit : st.dust, core ? R.range(4.5, 9) : R.range(4, 7.5), R.range(0.02, 0.22), PF.BIG);
  }
  for (let i = 0; i < 10; i++) {
    let s = R.sign();
    ps.spawn(P.SMOKE, s * R.range(2, 14), -R.range(2, 6), s * R.range(20, 70), -R.range(4, 20), R.range(1.4, 2.3), st.dust, R.range(6, 9), R.range(0, 0.08), PF.BIG);
  }
  for (let i = 0; i < 26; i++)
    ps.spawn(P.FLAKE, R.range(-22, 22), -R.range(14, 80), R.range(-12, 12), R.range(-10, 4), R.range(1.2, 2), R.chance(0.5) ? st.lip : dustLit, R.range(0.5, 1.2), R.range(0.25, 1));
  let t = 0, acc = [R.next(), R.next()], ring2 = (p, back) => {
    let u = clamp((t - 0.015) / (WAVE + 0.1));
    t < 0.015 || u >= 0.9 || band(
      p,
      0,
      0.5,
      front(t) + 1,
      0.16,
      Math.max(1, 4 * Math.pow(1 - u, 0.8)),
      u < 0.55 ? 1.1 : (0.9 - u) / 0.35,
      u < 0.35 ? [C[3], C[4], C[5], C[6]] : [st.body, st.light, C[4], C[5]],
      (g) => Math.sin(g) < 0 === back,
      t < 0.09
    );
  }, fronts = (p) => {
    let u = clamp((t - 0.03) / (WAVE + 0.16));
    if (t < 0.03 || u >= 1) return;
    let fr = front(t), [h, w] = crest(u), k = u < 0.7 ? 1 : (1 - u) / 0.3, cols = u < 0.14 ? [WHITE, C[6], C[5]] : u < 0.34 ? [C[6], C[5], C[4]] : u < 0.55 ? [C[5], C[4], st.lip] : [st.lip, st.light, st.dust];
    for (let s of [-1, 1])
      frontCrescent(p, s * fr, s, h, w, cols, k), p.glow(s * fr, -h * 0.3, 8 + h * 0.7, C[4], 0.5 * (1 - u) * k);
  };
  return {
    update(dt) {
      t += dt;
      let u = clamp((t - 0.015) / WAVE);
      if (u > 0 && u < 1) {
        let fr = front(t), [h] = crest(u);
        for (let k = 0; k < 2; k++) {
          let s = k ? 1 : -1;
          for (acc[k] += dt * 120 * (1 - u * 0.7); acc[k] > 1; acc[k]--)
            ps.spawn(P.SMOKE, s * (fr - R.range(1, 7)), -R.range(0.5, 3), s * R.range(15, 70) * (1 - u), -R.range(2, 12), R.range(1, 2.1), R.chance(0.3) ? dustLit : st.dust, R.range(2.5, 6.5) * (1 - 0.4 * u), 0, PF.BIG), R.chance(0.5) && ps.spawn(P.DUST, s * (fr - R.range(0, 3)), -R.range(0.3, 0.9) * h, s * R.range(-15, 25), -R.range(8, 35), R.range(0.3, 0.6), R.chance(0.5) ? dustLit : st.dust, R.range(1.2, 2.4)), R.chance(0.4) && ps.spawn(P.GRIT, s * fr, -1, s * R.range(10, 60), -R.range(40, 140) * (1 - u), R.range(0.5, 1), R.pick([st.light, st.body, st.lip]), 1), u < 0.45 && R.chance(0.2) && ps.spawn(P.SPARK, s * fr, -1, s * R.range(60, 200), -R.range(30, 160), R.range(0.12, 0.3));
        }
      }
      for (let b of bits.list) b.pvy = b.vy;
      bits.update(dt);
      for (let b of bits.list)
        if (b.pvy > 70 && b.vy <= 0) {
          let n = b.pvy > 200 ? 3 : 2;
          for (let i = 0; i < n; i++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(8, 35), -R.range(2, 16), R.range(0.3, 0.65), st.dust, R.range(1.3, 2.4) * (0.7 + b.s * 0.25));
          b.pvy = 0;
        }
      ps.update(dt), lights.update(dt);
    },
    drawBack(p) {
      let fade = 1 - smooth(D - 0.9, D - 0.15, t), H = heat(t);
      t > 0.02 && crater(p, st, H, C, fade), drawCracks(p, cracks, (c) => c.len * ease.outCubic(clamp((t - c.t0) / 0.1)), (d) => H * clamp(1.2 - d / 40), HOT2, SOOT, st.light, fade);
      for (let e of embers) {
        let k = 1 - (t - 0.1) / e.life;
        if (t < 0.1 || k <= 0) continue;
        let f = 0.6 + 0.4 * Math.sin(t * 23 + e.ph);
        p.px(e.x, e.y, k * f > 0.55 ? C[5] : k * f > 0.25 ? C[4] : C[3]), p.glow(e.x, e.y, 4, C[4], 0.35 * k * f);
      }
      ring2(p, !0), ps.draw(p, "back");
    },
    draw(p) {
      ring2(p, !1), fronts(p);
      for (let b of bits.list) rock2(p, b, st);
      ps.draw(p, "front"), t < 0.035 ? (p.ellipse(0, 0, 30, 4.5, (d) => d > 0.8 ? C[4] : d > 0.5 ? C[6] : WHITE), star(p, 0, -1, burst, 1, 1, [C[4], C[6], WHITE, WHITE])) : t < 0.07 && star(p, 0, -1, burst, 1.25, 0.5, [C[3], C[5], C[6], WHITE]), t < 0.14 && p.glowLine(-80, 0, 80, 0, 10, C[5], 0.55 * (1 - t / 0.14));
      let H = heat(t);
      H > 0 && p.glow(0, 1, 46, C[4], 0.35 * H), lights.draw(p);
    }
  };
}

// pixelfx/src/fx/impacts/heavy-landing.js
var heavy_landing_exports = {};
__export(heavy_landing_exports, {
  act: () => act,
  create: () => create7,
  meta: () => meta7
});
var meta7 = {
  name: "Heavy landing",
  desc: "A character lands hard: the floor dents and cracks under their feet, two rings of dust roll out along the floor one after the other, and pebbles hop away.",
  tags: ["impact", "landing", "ground", "stomp", "dust", "rocks", "actor", "one-shot"],
  size: [176, 80],
  origin: [88, 60],
  duration: 1.6,
  loop: !1,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: ["#1c1a24", "#2f2a3a", "#4a4258", "#6b6280", "#9088a4", "#bdb6cc", "#e6e1ee"], stone: "#4a3f69", seed: 14 }
}, FALL = { turn: 0.8, y: -46, crouch: -1, lean: -1, fx: -9, fy: -42, bx: 10, by: -42, ffx: 6, ffy: -8, fbx: -3, fby: -3, toeB: !0, ghost: 1 }, HERO_ = { y: 0, crouch: 8, lean: 5, fx: 13, fy: -8, bx: -6, by: -23, ffx: 11, fbx: -10 }, act = {
  poses: [
    [-0.26, FALL],
    [-0.01, { ...FALL, y: -6 }, "in"],
    [0, HERO_, "snap"],
    [0.55, { ...HERO_, crouch: 7 }],
    [0.95, { ...HERO_, crouch: 5, lean: 3, fx: 13, fy: -15, bx: -5, by: -20 }],
    [1.3, READY],
    [1.6, READY]
  ],
  hits: [{ t: 5e-3, stop: 0.13, shake: 0.32, amp: 3 }]
};
function dent(p, st, k) {
  for (let x = -10; x <= 9; x++) {
    let q = Math.abs(x + 0.5) / 10, dep = Math.round(1.8 * (1 - q * q));
    if (q < 0.82) {
      for (let y = 0; y < dep; y++) p.dot(x, y, SOOT, k);
      p.dot(x, dep, st.lip, k);
    } else p.dot(x, -1, q > 0.92 ? st.light : st.lip, k);
  }
}
function create7(o) {
  let C = fit(o.palette, 7), st = stone(o.stone), R = new Rng(o.seed), floor = () => 0, D = meta7.duration, back = new Particles({ rng: R, ground: floor }), front = new Particles({ rng: R, ground: floor }), bits = new Bits({ ground: floor }), cracks = makeCracks(R, 6, { len: [8, 20], dive: 0.7, maxY: 12, forks: 0.4, x0: [2, 6] }), DUST2 = mix(st.dust, C[5], 0.4), LIT = mix(DUST2, WHITE, 0.3), PH = R.range(0, TAU), ring2 = (n, v0, v1, size, delay) => {
    for (let i = 0; i < n; i++) {
      let g = i / n * TAU + R.range(-0.1, 0.1), v = R.range(v0, v1);
      (Math.sin(g) < 0 ? back : front).spawn(P.DUST, Math.cos(g) * 4, Math.sin(g) * 0.7 - 1, Math.cos(g) * v, Math.sin(g) * v * 0.16 - R.range(2, 10), R.range(0.45, 0.8), R.chance(0.45) ? LIT : DUST2, R.range(size[0], size[1]), delay + R.range(0, 0.03));
    }
  };
  ring2(20, 140, 190, [2.2, 3.4], 0.01), ring2(18, 70, 110, [3.4, 5.4], 0.12);
  for (let i = 0; i < 12; i++) {
    let s = R.sign(), up = i < 6;
    (i % 2 ? front : back).spawn(P.DUST, s * R.range(2, 10), -R.range(1, 4), s * R.range(10, 35) * (up ? 0.6 : 1), -(up ? R.range(25, 60) : R.range(4, 12)), R.range(0.55, 0.9), R.chance(0.5) ? LIT : DUST2, R.range(3, 5), R.range(0.02, 0.1));
  }
  for (let i = 0; i < 12; i++) {
    let s = R.sign(), v = R.range(50, 130);
    bits.add({ kind: B.CHUNK, x: s * R.range(3, 8), y: -1, vx: s * v, vy: -R.range(140, 230), g: 1, drag: 0.5, bounce: 0.55, life: R.range(1, 1.45), a: R.range(0, TAU), va: s * R.range(8, 16), s: R.chance(0.3) ? 2 : 1, pts: rockShape(R) });
  }
  for (let i = 0; i < 24; i++) {
    let s = R.sign(), a = -Math.PI / 2 + s * R.range(0.3, 1.2), v = R.range(60, 170);
    front.spawn(P.GRIT, s * R.range(2, 7), -1, Math.cos(a) * v, Math.sin(a) * v, R.range(0.6, 1.1), R.pick([st.light, st.body, st.lip]), R.chance(0.3) ? 2 : 1);
  }
  let t = 0, rings = (p, far) => {
    for (let [t0, dur, r1, w, k0, edge] of [[0.01, 0.45, 58, 4.5, 0.75, 1], [0.12, 0.85, 42, 6, 0.8, 0]]) {
      let g = (t - t0) / dur;
      if (g <= 0 || g >= 1) continue;
      let r = 6 + r1 * ease.outCubic(g);
      dustRing(p, 0, 0, r, w * (1 + g), k0 * Math.pow(1 - g, 1.2) * Math.min(1, g / 0.06), DUST2, { sy: 0.2, ph: PH + t0 * 10, brk: g * 0.8, half: far ? -1 : 1 }), edge && g < 0.75 && band(p, 0, 0.5, r + 2, 0.2, Math.max(1, 2.5 * (1 - g)), 1.1 - g / 0.75, [st.body, st.light, LIT, WHITE], (a) => Math.sin(a) < 0 === far);
    }
  };
  return {
    update(dt) {
      t += dt;
      for (let b of bits.list) b.pvy = b.vy;
      bits.update(dt);
      for (let b of bits.list)
        b.pvy > 80 && b.vy <= 0 && (front.spawn(P.DUST, b.x, -0.5, R.sign() * R.range(6, 20), -R.range(2, 10), R.range(0.25, 0.45), DUST2, R.range(1, 1.8)), b.pvy = 0);
      back.update(dt), front.update(dt);
    },
    drawBack(p) {
      let fade = 1 - smooth(D - 0.5, D - 0.1, t);
      dent(p, st, fade), drawCracks(p, cracks, (c) => c.len * ease.outCubic(clamp((t - c.t0) / 0.08)), () => 0, [WHITE, WHITE, WHITE, WHITE], SOOT, st.light, fade), rings(p, !0), back.draw(p);
    },
    draw(p) {
      rings(p, !1), front.draw(p);
      for (let b of bits.list) rock2(p, b, st);
      if (t < 0.035) p.ellipse(0, 0, 15, 2.5, (d) => d < 0.55 ? WHITE : C[6]);
      else if (t < 0.07) for (let x = -22; x <= 22; x++) p.dot(x, 0, Math.abs(x) < 10 ? WHITE : C[5], 1 - Math.abs(x) / 24);
      t < 0.12 && p.glowLine(-20, 0, 20, 0, 8, C[6], 0.45 * (1 - t / 0.12));
    }
  };
}
export {
  blunt_hit_exports as bluntHit,
  collect_burst_exports as collectBurst,
  createFx,
  ground_slam_exports as groundSlam,
  heavy_landing_exports as heavyLanding,
  hit_spark_exports as hitSpark,
  poof_exports as poof,
  splash_exports as splash
};
