// Clima propio sobre el tablero con las recetas de Sprite Fusion Pixel Art VFX (MIT, Hugo Duprez):
// nieve en tres capas de profundidad con viento y cristales, niebla en bancos que se desplazan a
// distinta velocidad, brasas (chispas, rescoldos y ceniza sobre un fondo de calor) y luciérnagas que
// vagan y parpadean. Cada tipo dice cuántas partículas quiere vivas, cómo nace una (`any`: en
// cualquier punto, para arrancar lleno), cómo se mueve (`tick`) y cómo se pinta en vector o en píxel.
const G = 3; // la rejilla de las mesas píxel (la misma de Fx.block)
const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
// Ruido suave de una dimensión: dos senos desfasados bastan para viento y deriva.
const noise = (t, s = 0) => Math.sin(t + s * 1.7) * 0.6 + Math.sin(t * 2.3 + s * 4.1) * 0.4;

function dot(ctx, x, y, size, pixel) {
  if (pixel) { const n = Math.max(1, Math.round(size / G)) * G; ctx.fillRect(Math.round(x / G) * G, Math.round(y / G) * G, n, n); }
  else ctx.fillRect(x - size / 2, y - size / 2, size, size);
}
// Luz sumada: un halo que solo aclara (en la capa transparente, 'lighter' no oscurece).
function glow(ctx, x, y, r, color, a) {
  if (a <= 0.02) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'transparent');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}

// ── Nieve ─────────────────────────────────────────────────────────────────────────────────
const FALL = [26, 52, 86], SWAY = [8, 16, 30];
const FLAKE = { W: '#ffffff', w: '#e3edff', b: '#9fb1e6', d: '#6c7cb8' };
const CRYSTAL = [
  ['..b..', '.bwb.', 'bwWwb', '.bwb.', '..b..'],
  ['b...b', '.bwb.', '.wWw.', '.bwb.', 'b...b'],
];
const snowWind = (T) => 14 + 16 * noise(T * 0.3, 5);
const snow = {
  count: (w, h) => ({ far: w * h * 0.0006, mid: w * h * 0.00035, near: w * h * 0.00004 }),
  spawn(kind, w, h, any) {
    const layer = { far: 0, mid: 1, near: 2 }[kind], vy = FALL[layer] * rnd(0.75, 1.25);
    return { x: rnd(-60, w), y: any ? rnd(-20, h) : -rnd(4, 40), vx: 0, vy, layer, sway: SWAY[layer] * rnd(0.6, 1.2), f: rnd(0.8, 1.8), ph: rnd(0, TAU), dim: Math.random() < 0.5 };
  },
  tick(p, dt, T, w, h) {
    p.x += (snowWind(T) * (0.5 + p.layer * 0.4) + Math.cos(T * p.f + p.ph) * p.sway) * dt;
    if (p.x > w + 40) p.x -= w + 100;
    return p.y < h + 8;
  },
  draw(ctx, p, T, pixel) {
    if (p.layer === 0) { ctx.fillStyle = p.dim ? FLAKE.d : FLAKE.b; return dot(ctx, p.x, p.y, 1.5, pixel); }
    if (p.layer === 1) {
      if (pixel) { ctx.fillStyle = FLAKE.W; return dot(ctx, p.x, p.y, G, true); }
      const u = 1.5;
      ctx.fillStyle = FLAKE.W; dot(ctx, p.x, p.y, u, pixel);
      ctx.fillStyle = FLAKE.w; dot(ctx, p.x + u, p.y, u, pixel); dot(ctx, p.x, p.y + u, u, pixel);
      ctx.fillStyle = FLAKE.b; dot(ctx, p.x + u, p.y + u, u, pixel);
      return;
    }
    // Cristal cercano: alterna dos dibujos, como si girara.
    const rows = CRYSTAL[Math.floor(T * 3 + p.ph) & 1], u = pixel ? G : 1.5;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const ch = rows[r][c];
      if (ch === '.') continue;
      ctx.fillStyle = FLAKE[ch];
      ctx.fillRect((pixel ? Math.round(p.x / G) * G : p.x) + (c - 2) * u, (pixel ? Math.round(p.y / G) * G : p.y) + (r - 2) * u, u, u);
    }
  },
};

// ── Niebla ────────────────────────────────────────────────────────────────────────────────
const TONES = ['#8a90ad', '#aab0c8', '#d4d8e6'];
const fog = {
  count: (w) => ({ bank: Math.max(5, Math.round(w / 70)) }),
  spawn(kind, w, h, any) {
    const d = Math.random(), size = rnd(50, 80) * (0.7 + 0.6 * d);
    return { x: any ? rnd(-size * 2, w + size) : -size * 2.2, y: h * (0.35 + 0.6 * Math.random()), vx: 22 * (0.4 + 0.8 * d) * 0.7, vy: 0, d, size, ph: rnd(0, TAU), tone: TONES[Math.min(2, Math.floor(d * 3))] };
  },
  tick: (p, dt, T, w) => p.x < w + p.size * 2.4,
  draw(ctx, p, T, pixel, w) {
    // Respira arriba y abajo; entra y sale por los lados sin cortarse.
    const y = p.y + 2.4 * Math.sin(T * 0.35 + p.ph), rx = p.size * 2.2, ry = p.size * 0.55;
    const edge = Math.min(1, (p.x + rx) / (rx * 1.5), (w + rx - p.x) / (rx * 1.5));
    const a = (0.2 + 0.16 * p.d) * 0.9 * Math.max(0, edge);
    if (a <= 0.01) return;
    if (pixel) {
      // Tramado ordenado (Bayer) en la rejilla píxel, con la cresta más clara arriba.
      const S = G;
      ctx.globalAlpha = 0.4;
      for (let yy = Math.floor((y - ry) / S) * S; yy < y + ry; yy += S) for (let xx = Math.floor((p.x - rx) / S) * S; xx < p.x + rx; xx += S) {
        const dx = (xx - p.x) / rx, dy = (yy - y) / ry, f = (1 - (dx * dx + dy * dy)) * a * 1.8;
        if (f <= bayer(xx / S, yy / S)) continue;
        ctx.fillStyle = dy < -0.55 ? '#e8ebf4' : p.tone;
        ctx.fillRect(xx, yy, S, S);
      }
      return;
    }
    ctx.save(); ctx.translate(p.x, y); ctx.scale(rx / ry, 1);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
    g.addColorStop(0, p.tone); g.addColorStop(1, 'transparent');
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(-ry, -ry, ry * 2, ry * 2);
    // Cresta: un borde más claro arriba del banco.
    const c = ctx.createRadialGradient(0, -ry * 0.35, 0, 0, -ry * 0.35, ry * 0.6);
    c.addColorStop(0, '#eef0f7'); c.addColorStop(1, 'transparent');
    ctx.globalAlpha = a * 0.45; ctx.fillStyle = c; ctx.fillRect(-ry, -ry, ry * 2, ry * 2);
    ctx.restore();
  },
};

// ── Brasas ────────────────────────────────────────────────────────────────────────────────
const EMBER = { hot: '#fff3a6', yellow: '#ffe26b', orange: '#ff8a2a', deep: '#f2561d', red: '#c9281f', ash: '#5a5160', ash2: '#3a3442' };
const embers = {
  count: (w) => ({ spark: w * 0.22, cinder: w * 0.05, ash: w * 0.012 }),
  spawn(kind, w, h, any) {
    const seed = Math.random() * 100;
    if (kind === 'spark') { const life = rnd(2.2, 4.2); return { x: rnd(-20, w + 20), y: any ? rnd(h * 0.3, h) : h + rnd(-5, 25), vx: rnd(-25, 25), vy: -rnd(60, 150), life, max: life, seed }; }
    const ash = kind === 'ash', life = ash ? rnd(5, 7) : rnd(3.5, 6);
    return { x: rnd(0, w), y: any ? rnd(h * 0.2, h) : h + 8, vx: rnd(-15, 15), vy: ash ? -rnd(25, 45) : -rnd(35, 75), life, max: life, seed, ash, big: !ash && Math.random() < 0.3 };
  },
  tick(p, dt, T) {
    if (p.ash != null) {
      p.vx += noise(T * 0.9 + p.seed, 1) * 60 * dt; p.vx -= p.vx * 0.8 * dt;
      p.x += Math.sin(T * 2 + p.seed) * 10 * dt;
    } else {
      p.vy += (-60 + Math.sin(T * 3 + p.seed) * 40) * dt; p.vx += Math.cos(T * 2.3 + p.seed) * 90 * dt;
      p.vx -= p.vx * 1.6 * dt; p.vy -= p.vy * 1.6 * dt;
    }
    return true;
  },
  draw(ctx, p, T, pixel) {
    const k = p.life / p.max;
    if (p.ash == null) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = k > 0.5 ? (Math.sin(T * 22 + p.seed * 3) > -0.2 ? EMBER.yellow : EMBER.orange) : k > 0.2 ? EMBER.orange : EMBER.red;
      dot(ctx, p.x, p.y, 1.6, pixel);
      return glow(ctx, p.x, p.y, 6, ctx.fillStyle, 0.3 * k);
    }
    const a = Math.min(1, k * 3) * Math.min(1, (1 - k) * 8), u = pixel ? G : 1.6;
    ctx.globalAlpha = a;
    if (p.ash) { ctx.fillStyle = EMBER.ash; dot(ctx, p.x, p.y, u, pixel); ctx.fillStyle = EMBER.ash2; return dot(ctx, p.x + (Math.sin(T * 3 + p.seed) > 0 ? u : 0), p.y + u, u, pixel); }
    const fl = 0.65 + 0.35 * noise(T * 9 + p.seed, 2), hot = k * fl;
    const core = hot > 0.55 ? EMBER.hot : hot > 0.35 ? EMBER.yellow : EMBER.orange, rim = hot > 0.45 ? EMBER.orange : EMBER.deep;
    ctx.fillStyle = rim;
    if (p.big) { dot(ctx, p.x - u, p.y, u, pixel); dot(ctx, p.x + u, p.y, u, pixel); dot(ctx, p.x, p.y - u, u, pixel); dot(ctx, p.x, p.y + u, u, pixel); }
    else dot(ctx, p.x, p.y + u, u, pixel);
    ctx.fillStyle = core; dot(ctx, p.x, p.y, u, pixel);
    glow(ctx, p.x, p.y, p.big ? 18 : 10, EMBER.orange, (p.big ? 0.45 : 0.35) * a * fl);
  },
  // Calor que sube del fondo: una franja rojiza que ondula a lo ancho.
  under(ctx, T, pixel, w, h) {
    const H = 44, step = pixel ? G * 2 : 6;
    for (let x = 0; x < w; x += step) {
      const k = 0.7 + 0.3 * noise(x * 0.01 + T * 0.6, 7), g = ctx.createLinearGradient(0, h - H, 0, h);
      g.addColorStop(0, 'rgba(79,26,19,0)'); g.addColorStop(0.6, 'rgba(138,31,23,0.35)'); g.addColorStop(1, 'rgba(201,40,31,0.6)');
      ctx.globalAlpha = k * 0.7; ctx.fillStyle = g; ctx.fillRect(x, h - H, step, H);
    }
  },
};

// Noche: oscurece todo un poco y los bordes más, para que la luz de luciérnagas y niebla se lea en
// cualquier mesa; el centro del tablero queda casi limpio.
function night(ctx, w, h, a, tone) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, `rgba(${tone},${a * 0.45})`); g.addColorStop(1, `rgba(${tone},${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
fog.under = (ctx, T, pixel, w, h) => night(ctx, w, h, 0.4, '20,24,38');

// ── Luciérnagas ───────────────────────────────────────────────────────────────────────────
const FLY = { core: '#faffbe', glow: '#c8ff5a', dim: '#6f8f2a', body: '#2a2418', wing: '#8a96a8' };
const fireflies = {
  count: (w) => ({ far: w / 16, close: Math.max(3, Math.round(w / 110)) }),
  spawn(kind, w, h, any) {
    const life = kind === 'close' ? rnd(8, 14) : rnd(4, 8);
    return { x: rnd(0, w), y: rnd(h * 0.15, h * 0.95), vx: rnd(-20, 20), vy: rnd(-15, 15), life: any ? life * Math.random() + 0.5 : life, max: life, seed: Math.random() * 100, close: kind === 'close', per: rnd(1.6, 2.6) };
  },
  tick(p, dt, T) {
    const a = p.seed * 0.63 + T * (0.7 + (p.seed % 1) * 0.9), k = Math.min(1, dt * 1.5), s = p.close ? 0.5 : 1;
    p.vx += (Math.cos(a) * 55 * s - p.vx) * k; p.vy += (Math.sin(a * 1.3) * 38 * s - 8 - p.vy) * k;
    return true;
  },
  draw(ctx, p, T, pixel) {
    const k = p.life / p.max, fade = Math.min(1, (1 - k) * 6) * Math.min(1, k * 4);
    if (!p.close) {
      const a = fade * Math.max(0, Math.sin(T * (2.2 + (p.seed % 3) * 0.7) + p.seed));
      if (a < 0.08) return;
      ctx.globalAlpha = 1; ctx.fillStyle = a > 0.5 ? FLY.core : FLY.glow; dot(ctx, p.x, p.y, 1.8, pixel);
      return glow(ctx, p.x, p.y, 14, FLY.glow, 0.55 * a);
    }
    // De cerca se ve el bicho: alas que baten, cuerpo y la cola que late.
    const u = pixel ? G : 1.6, dir = p.vx > 0 ? 1 : -1, ph = (T / p.per + p.seed) % 1, pulse = (ph < 0.6 ? Math.pow(Math.sin((ph / 0.6) * Math.PI), 0.7) : 0) * fade;
    const wy = p.y - (Math.sin(T * 50 + p.seed) > 0 ? 2 : 1) * u;
    ctx.globalAlpha = 0.6 * fade; ctx.fillStyle = FLY.wing; dot(ctx, p.x - dir * u, wy, u, pixel); dot(ctx, p.x, wy, u, pixel);
    ctx.globalAlpha = fade; ctx.fillStyle = FLY.body; dot(ctx, p.x + dir * u, p.y, u, pixel); dot(ctx, p.x + dir * 2 * u, p.y, u, pixel);
    ctx.fillStyle = pulse > 0.25 ? FLY.core : FLY.dim; dot(ctx, p.x, p.y, u, pixel);
    ctx.fillStyle = pulse > 0.5 ? FLY.core : pulse > 0.15 ? FLY.glow : FLY.dim; dot(ctx, p.x - dir * u, p.y, u, pixel);
    glow(ctx, p.x, p.y, 40, FLY.glow, 0.5 * pulse);
    glow(ctx, p.x, p.y, 12, FLY.core, 0.6 * pulse);
  },
};

fireflies.under = (ctx, T, pixel, w, h) => night(ctx, w, h, 0.55, '6,10,22');

// ── Hojas que caen ───────────────────────────────────────────────────────────────────────
// Los tres dibujos y las cuatro paletas de Falling Leaves de Sprite Fusion: L luz, B base, R nervio,
// S sombra, D borde, T tallo. Caen en péndulo: se mecen a los lados, frenan en cada extremo, se
// inclinan con el vaivén y a veces giran sobre sí mismas.
const LEAF_SHAPES = [
  ['......DDDD..', '...DDDLLLBD.', '.DDLLLRLBBBD', 'TRRRRRRRRRRD', '.DDBBBBBRSSD', '...DDDSSSSD.', '......DDDD..'],
  ['...DDD...', '..DLLBD..', '.DLLLBBD.', 'DLLRBBBSD', 'DLBBRBSSD', '.DBBBRSD.', '..DDSSD..', '....T....'],
  ['.....D.....', '....DLD....', '.DD.DLD.DD.', '.DLDDLDDLD.', '..DLLLBBD..', 'DDDLLRBBDDD', '.DLLBRBSSD.', '..DDBRSDD..', '....DRD....', '.....T.....'],
];
const LEAF_PALS = [['#ffc86a', '#f08a2a', '#b8521a', '#5e240e'], ['#ff8a66', '#d8382a', '#9a1f22', '#470f15'], ['#fff09a', '#f0c83a', '#b88a1c', '#5a3f10'], ['#c99a62', '#9a6a3b', '#6b4424', '#33200f']];
let leafArt = null; // [forma][paleta] → lienzo con el dibujo a 1 px por celda
function leafSprites() {
  if (leafArt) return leafArt;
  leafArt = LEAF_SHAPES.map((rows) => LEAF_PALS.map(([L, B, S, D]) => {
    const pal = { L, B, S, D, R: S, T: D }, c = Object.assign(document.createElement('canvas'), { width: rows[0].length, height: rows.length }), x = c.getContext('2d');
    rows.forEach((r, y) => [...r].forEach((ch, i) => { if (ch !== '.') { x.fillStyle = pal[ch]; x.fillRect(i, y, 1, 1); } }));
    return c;
  }));
  return leafArt;
}
const leaves = {
  count: (w, h) => ({ leaf: Math.max(8, w * h * 0.00012) }),
  spawn(kind, w, h, any) {
    const x0 = rnd(-40, w);
    return { x0, x: x0, y: any ? rnd(-20, h) : -rnd(10, 40), vx: 0, vy: 0, fall: rnd(34, 56), amp: rnd(14, 34), w: rnd(1.8, 2.8), ph: rnd(0, TAU), flip: rnd(0, TAU), near: Math.random() < 0.35, shape: Math.floor(Math.random() * 3), pal: Math.floor(Math.random() * 4), ang: 0, seed: Math.floor(Math.random() * 1e6) };
  },
  tick(p, dt, T, w, h) {
    p.ph += p.w * dt; p.x0 += 12 * dt;
    p.x = p.x0 + Math.sin(p.ph) * p.amp;
    p.y += p.fall * (0.45 + 0.9 * Math.abs(Math.cos(p.ph))) * dt;
    p.ang = Math.cos(p.ph) * 0.75 + (p.near ? 0 : 0.3);
    // De vez en cuando, en un vaivén, da la vuelta rápido (se ve de canto).
    p.flip += ((Math.sin(Math.floor(p.ph / Math.PI) * 12.9898 + p.seed) * 43758.5453) % 1 + 1) % 1 < 0.25 ? 6 * dt : 0.4 * dt;
    return p.y < h + 20 && p.x0 < w + 60;
  },
  draw(ctx, p, T, pixel) {
    const img = leafSprites()[p.shape][p.pal], u = pixel ? G : 2, sx = 0.35 + 0.65 * Math.abs(Math.cos(p.flip));
    ctx.imageSmoothingEnabled = false;
    ctx.translate(pixel ? Math.round(p.x / G) * G : p.x, pixel ? Math.round(p.y / G) * G : p.y);
    ctx.rotate(pixel ? Math.round(p.ang / (Math.PI / 8)) * (Math.PI / 8) : p.ang); ctx.scale(sx * (p.near ? 1 : 0.75), p.near ? 1 : 0.75);
    ctx.globalAlpha = p.near ? 1 : 0.8;
    ctx.drawImage(img, (-img.width * u) / 2, (-img.height * u) / 2, img.width * u, img.height * u);
  },
};

// ── Burbujas ─────────────────────────────────────────────────────────────────────────────
// Como Bubbles de Sprite Fusion: salen de unas pocas fumarolas al fondo, muchas chicas y alguna
// tanda de grandes; suben más rápido cuanto más grandes, se mecen, crecen un poco al subir y se
// pintan con su lado iluminado, su sombra y un brillo. Arriba revientan en un aro.
const BUB = { hi: '#ffffff', lit: '#c6f3ff', rim: '#68bfe6', shade: '#2f7fb6', fill: '#4b9fce' };
const bubbles = {
  count: (w, h) => ({ bubble: w * h * 0.00022 }),
  spawn(kind, w, h, any) {
    // Una fumarola cada ~90 px de ancho; de vez en cuando, una grande.
    const n = Math.max(3, Math.round(w / 90)), vent = ((Math.floor(Math.random() * n) + 0.5) / n) * w, big = Math.random() < 0.12;
    const r = big ? rnd(1.5, 3.2) : Math.random() < 0.7 ? rnd(0.5, 1.4) : rnd(1.4, 2.6);
    return { x0: vent + rnd(-28, 28), x: vent, y: any ? rnd(h * 0.1, h) : h + rnd(0, 20), vx: 0, vy: 0, r, ph: rnd(0, TAU), near: Math.random() < 0.35, top: rnd(h * 0.02, h * 0.25), pop: 0 };
  },
  tick(p, dt, T, w, h) {
    if (p.pop) { p.pop += dt; return p.pop < 0.2; }
    p.y -= (40 + 26 * p.r) * 0.8 * dt;
    p.ph += dt * (4 + 2 / p.r);
    p.x0 += noise(T * 0.4 + p.ph, 5) * 6 * dt;
    p.x = p.x0 + Math.sin(p.ph) * (1 + p.r * 1.6) * 3;
    p.r = Math.min(5, p.r + dt * 0.12);
    if (p.y < p.top) p.pop = 0.001;
    return true;
  },
  draw(ctx, p, T, pixel) {
    const u = G, cell = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * u, y * u, u, u); };
    const cx = p.x / u, cy = p.y / u, r = p.r;
    if (p.pop) {
      // Aro que se abre hacia arriba y se apaga.
      const k = p.pop / 0.2, rr = r + 1 + k * 3;
      ctx.globalAlpha = 1 - k;
      for (let a = 0; a < TAU; a += 0.5 / rr) if (Math.sin(a) < 0.2) cell(Math.floor(cx + Math.cos(a) * rr), Math.floor(cy + Math.sin(a) * rr * 0.5), k < 0.5 ? BUB.hi : BUB.lit);
      return;
    }
    ctx.globalAlpha = p.near ? 1 : 0.75;
    if (r < 0.9) return cell(Math.floor(cx), Math.floor(cy), r < 0.7 ? BUB.rim : BUB.lit);
    if (r < 1.5) {
      const x = Math.floor(cx), y = Math.floor(cy);
      cell(x, y, BUB.hi); cell(x + 1, y, BUB.lit); cell(x, y + 1, BUB.rim); cell(x + 1, y + 1, BUB.shade);
      return;
    }
    const sq = 0.1 * Math.sin(p.ph * 2) * Math.min(1, (r - 1.5) / 2), rx = r * (1 + sq), ry = r * (1 - sq);
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = Math.sqrt(dx * dx + dy * dy) * r;
      if (d > r + 0.5) continue;
      const lit = (-dx - dy) / Math.SQRT2 / Math.max(0.01, d / r);
      if (d > r - 0.6) cell(x, y, lit > 0.45 ? BUB.lit : lit < -0.55 ? BUB.shade : BUB.rim);
      else if (bayer(x, y) < 0.12) cell(x, y, BUB.fill);
    }
    const hx = Math.round(cx - rx * 0.45), hy = Math.round(cy - ry * 0.45);
    cell(hx, hy, BUB.hi);
    if (r >= 2.5) { cell(hx + 1, hy, BUB.lit); cell(hx, hy + 1, BUB.lit); }
    if (r >= 2) cell(Math.round(cx + rx * 0.5), Math.round(cy + ry * 0.5), BUB.lit);
  },
};

export const WEATHER_FX = { snow, fog, embers, fireflies, leaves, bubbles };
