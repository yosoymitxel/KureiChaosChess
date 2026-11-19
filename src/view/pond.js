// Estanque vivo en un <canvas>: lecho con hondura, luz que ondula en el fondo, sombras, koi
// procedurales (koi.js), nenúfares que derivan y se apartan de las ondas, un loto, lenteja de agua,
// brillos y aros al tocar o al caer gotas. Ideas de nagomi (msk1039); los koi, adaptados de su código
// (ver koi.js).
// Trabaja en unidades del dibujo (el jardín usa 48×48, el tablero 20×20). En píxel se pinta a baja
// resolución y cada píxel se lleva al color más cercano de una paleta corta: sprites limpios.
import { School, spine, koiShape, KOI_KINDS } from './koi.js';

const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);

const WATER = { deep: '#17414f', mid: '#245f6b', shallow: '#3a8584', light: '#bfeee6', ink: '#14191d' };
const PAD = { base: '#4f8f3a', dark: '#36692a', light: '#86bd5c', vein: '#3a6f2c' };
const LOTUS = { out: '#f3b8cd', in: '#fbe0ea', deep: '#df88aa', core: '#f2d36b' };
// Barquitos (vista desde arriba): casco, cubierta, vela o cabina y su borde.
const BOAT = { paper: '#f4f1e8', fold: '#c9c3b4', wood: '#9a6a3c', dark: '#5e3f22', bamboo: '#c9b26a', sail: '#fbf7ee', red: '#d2483a', buoy: '#e8573f' };
const PALETTE = [...new Set([...Object.values(WATER), ...Object.values(PAD), ...Object.values(LOTUS), ...Object.values(BOAT), ...KOI_KINDS.flatMap((k) => [k.base, k.accent, k.marking, k.fin]), '#171815', '#ffffff', '#2f7468', '#5aa39a', '#9a7b4c', '#7fc4a0'])]
  .map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);

// Nenúfar: disco con su muesca, cara más clara arriba a la izquierda, nervios desde el centro.
export function drawPad(ctx, x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const cut = 0.32;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, cut, TAU - cut); ctx.closePath();
  ctx.fillStyle = PAD.base; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.94, Math.PI * 0.75, Math.PI * 1.55); ctx.closePath();
  ctx.fillStyle = PAD.light; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = PAD.vein; ctx.lineWidth = r * 0.07;
  for (let a = 0.9; a < TAU - 0.6; a += 0.75) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, cut, TAU - cut); ctx.closePath();
  ctx.strokeStyle = PAD.dark; ctx.lineWidth = r * 0.1; ctx.stroke();
  ctx.restore();
}
// Loto: dos coronas de pétalos y el centro dorado.
export function drawLotus(ctx, x, y, r, T = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(T * 0.3) * 0.1);
  const petal = (a, len, w, c) => { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(w, -len * 0.5, 0, -len); ctx.quadraticCurveTo(-w, -len * 0.5, 0, 0); ctx.fillStyle = c; ctx.fill(); ctx.restore(); };
  for (let i = 0; i < 8; i++) petal((i / 8) * TAU, r, r * 0.42, i % 2 ? LOTUS.deep : LOTUS.out);
  for (let i = 0; i < 6; i++) petal((i / 6) * TAU + 0.3, r * 0.7, r * 0.3, LOTUS.in);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, TAU); ctx.fillStyle = LOTUS.core; ctx.fill();
  ctx.restore();
}

export class Pond {
  // canvas: el lienzo; size: [ancho, alto] en unidades; inside(x, y): si es agua.
  constructor(canvas, { size, inside, count = 2, len = 7, speed = 3, pads = [], lotus = null, duckweed = 0 }) {
    const [W, H] = size;
    Object.assign(this, { canvas, W, H, inside, len, ripples: [], pellets: [], rain: 0, rainAcc: 0 });
    this.ctx = canvas.getContext('2d');
    this.school = new School(inside, { count, len, speed, home: [W / 2, H / 2], spread: Math.min(W, H) * 0.25 });
    this.school.onEat = (bit) => { const i = this.pellets.indexOf(bit.el); if (i >= 0) this.pellets.splice(i, 1); this.ripple(bit.x, bit.y, 0.5); };
    this.pads = pads.map(([x, y, r]) => ({ x, y, r, rot: rnd(0, TAU), vx: 0, vy: 0, seed: rnd(0, 99) }));
    this.lotus = lotus; // índice del nenúfar que lleva la flor
    this.weed = Array.from({ length: duckweed }, () => { for (;;) { const x = rnd(0, W), y = rnd(0, H); if (inside(x, y)) return { x, y, r: rnd(0.35, 0.6) }; } });
    this.glints = Array.from({ length: 5 }, () => ({ x: rnd(W * 0.2, W * 0.8), y: rnd(H * 0.2, H * 0.8), ph: rnd(0, TAU) }));
    this.lo = document.createElement('canvas');
    this.boats = []; // { kind, x, y, h, v, vx, vy } de src/game/boats.js
    this.marks = []; // boyas de la carrera: { x, y, on }
    this.wake = [];  // estela: puntos que se abren y se apagan
    this.onStep = null; // quien maneja los barcos (jardín o carrera) antes de cada paso
  }

  ripple(x, y, k = 1) { this.ripples.push({ x, y, age: 0, k }); if (this.ripples.length > 24) this.ripples.shift(); }
  // Tocar el agua: un aro y unas bolitas de comida que los koi vienen a buscar.
  tap(x, y) {
    this.ripple(x, y, 1.4);
    for (let i = 0; i < 4; i++) { const p = { x: x + rnd(-1, 1) * this.len * 0.2, y: y + rnd(-1, 1) * this.len * 0.2 }; this.pellets.push(p); this.school.feed(p.x, p.y, p); }
  }

  step(dt, T) {
    this.onStep?.(dt, T);
    this.school.step(dt, T);
    // Estela de barcos y koi que corren: dos brazos en V que se abren, y una onda de vez en cuando.
    for (const w of this.wake) w.age += dt;
    this.wake = this.wake.filter((w) => w.age < 1.4);
    for (const b of [...this.boats, ...this.school.fish.filter((f) => f.ctl)]) {
      const sp = Math.hypot(b.vx ?? 0, b.vy ?? 0) || Math.abs(b.v || 0);
      if (sp < 1.2) continue;
      b.wt = (b.wt || 0) + dt;
      if (b.wt < 0.05) continue;
      b.wt = 0;
      const back = b.fish ? 0 : this.len * 0.3;
      this.wake.push({ x: b.x - Math.cos(b.h) * back, y: b.y - Math.sin(b.h) * back, h: b.h, age: 0, k: Math.min(1, sp / 10) });
      if (Math.random() < 0.12) this.ripple(b.x, b.y, 0.25 + 0.25 * Math.min(1, sp / 10));
    }
    if (this.wake.length > 160) this.wake.splice(0, this.wake.length - 160);
    for (const r of this.ripples) r.age += dt;
    this.ripples = this.ripples.filter((r) => r.age < 2.2);
    for (this.rainAcc += this.rain * dt; this.rainAcc >= 1; this.rainAcc--) { const x = rnd(0, this.W), y = rnd(0, this.H); if (this.inside(x, y)) this.ripple(x, y, rnd(0.5, 0.9)); }
    for (const p of this.pads) {
      // Deriva lenta; las ondas jóvenes los empujan; la orilla los devuelve.
      p.vx += Math.sin(T * 0.21 + p.seed) * 0.02 * dt; p.vy += Math.cos(T * 0.17 + p.seed * 1.3) * 0.02 * dt;
      for (const r of this.ripples) {
        const d = Math.hypot(p.x - r.x, p.y - r.y), front = r.age * this.len * 1.2;
        if (r.age < 0.8 && Math.abs(d - front) < p.r && d > 0.01) { p.vx += ((p.x - r.x) / d) * 0.6 * r.k * dt; p.vy += ((p.y - r.y) / d) * 0.6 * r.k * dt; }
      }
      for (const b of this.boats) {
        const d = Math.hypot(p.x - b.x, p.y - b.y), min = p.r + this.len * 0.22;
        if (d < min && d > 0.01) { const f = (min - d) * 3; p.vx += ((p.x - b.x) / d) * f * dt * 6; p.vy += ((p.y - b.y) / d) * f * dt * 6; }
      }
      if (!this.inside(p.x + p.vx * 2, p.y + p.vy * 2)) { p.vx += (this.W / 2 - p.x) * 0.02 * dt; p.vy += (this.H / 2 - p.y) * 0.02 * dt; }
      p.vx *= 1 - dt * 0.6; p.vy *= 1 - dt * 0.6;
      const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      if (this.inside(nx, ny)) { p.x = nx; p.y = ny; } else { p.vx = -p.vx; p.vy = -p.vy; }
      p.rot += (p.vx - p.vy) * dt * 0.2;
    }
  }

  draw(T, pixel) {
    const { canvas, W, H } = this, box = canvas.getBoundingClientRect();
    // Vector: a la resolución de la pantalla. Píxel: dos píxeles por unidad del dibujo.
    const target = pixel ? this.lo : canvas, scale = pixel ? 2 : Math.max(2, (box.width * Math.min(2, devicePixelRatio || 1)) / W);
    const cw = Math.round(W * scale), ch = Math.round(H * scale);
    if (target.width !== cw || target.height !== ch) { target.width = cw; target.height = ch; }
    const ctx = target.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    this.paint(ctx, T, pixel, scale);
    if (pixel) {
      quantize(ctx, cw, ch);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      const out = this.ctx;
      out.imageSmoothingEnabled = false; out.setTransform(1, 0, 0, 1, 0, 0); out.clearRect(0, 0, cw, ch); out.drawImage(this.lo, 0, 0);
    }
  }

  paint(ctx, T, pixel, scale) {
    const { W, H, len } = this, cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2;
    // Lecho: claro en el medio, hondo hacia la orilla.
    const g = ctx.createRadialGradient(cx * 0.9, cy * 0.85, 0, cx, cy, R);
    g.addColorStop(0, WATER.shallow); g.addColorStop(0.55, WATER.mid); g.addColorStop(1, WATER.deep);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Luz del fondo: líneas que ondulan despacio (cáusticas).
    ctx.strokeStyle = WATER.light; ctx.lineWidth = pixel ? 0.5 : 0.18;
    for (let i = 0; i < 7; i++) {
      ctx.globalAlpha = pixel ? 0.35 : 0.12;
      ctx.beginPath();
      for (let x = 0; x <= W; x += W / 24) {
        const y = (i + 0.5) * (H / 7) + Math.sin(x * 0.35 + T * 0.8 + i * 1.7) * H * 0.025 + Math.sin(x * 0.11 - T * 0.5 + i) * H * 0.03;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const fish = this.school.fish.map((f) => {
      const sh = koiShape(spine(f, len, Math.min(1, 0.3 + f.burst + f.v / (this.school.speed * 4))), f, len);
      return { f, sh, path: outline(sh) };
    });
    // Sombras: de peces y nenúfares, corridas abajo a la derecha (la luz viene de arriba).
    ctx.fillStyle = WATER.ink;
    for (const { f, path } of fish) {
      ctx.globalAlpha = pixel ? 0.3 : 0.18 + 0.12 * (1 - f.depth);
      ctx.save(); ctx.translate(len * 0.12 + f.depth * len * 0.08, len * 0.16 + f.depth * len * 0.1);
      ctx.fill(path); ctx.restore();
    }
    ctx.globalAlpha = 0.22;
    for (const p of this.pads) { ctx.beginPath(); ctx.arc(p.x + p.r * 0.25, p.y + p.r * 0.35, p.r, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    // Koi: aletas y cola debajo, cuerpo, manchas recortadas al cuerpo, ojos. Más hondos, más velados.
    for (const { f, sh, path } of fish) {
      ctx.globalAlpha = pixel ? 1 : 1 - Math.max(0, f.depth) * 0.35; // en píxel, colores puros
      ctx.fillStyle = sh.kind.fin;
      for (const tri of [...sh.fins, ...sh.tail]) { ctx.beginPath(); tri.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.fill(); }
      const body = new Path2D();
      sh.body.forEach(([x, y], i) => (i ? body.lineTo(x, y) : body.moveTo(x, y)));
      body.closePath(); body.moveTo(sh.nose.x + sh.nose.r, sh.nose.y); body.arc(sh.nose.x, sh.nose.y, sh.nose.r, 0, TAU);
      ctx.fillStyle = sh.kind.base; ctx.fill(body);
      ctx.save(); ctx.clip(body);
      for (const p of sh.spots) { ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.ang, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = '#171815';
      for (const e of sh.eyes) { ctx.beginPath(); ctx.arc(e.x, e.y, pixel ? 0.5 : e.r, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    // Comida flotando.
    ctx.fillStyle = '#9a7b4c';
    for (const p of this.pellets) { ctx.beginPath(); ctx.arc(p.x, p.y, pixel ? 0.5 : len * 0.05, 0, TAU); ctx.fill(); }
    // Aros: dos por toque, que crecen y se apagan.
    ctx.strokeStyle = '#ffffff';
    for (const r of this.ripples) for (const lag of [0, 0.3]) {
      const a = r.age - lag;
      if (a <= 0) continue;
      ctx.globalAlpha = Math.max(0, 0.55 - a * 0.28) * (lag ? 0.6 : 1);
      ctx.lineWidth = pixel ? 0.5 : 0.22;
      ctx.beginPath(); ctx.arc(r.x, r.y, 0.4 + a * len * 0.9 * r.k, 0, TAU); ctx.stroke();
    }
    // Estela: cada punto deja dos rayitas que se abren hacia atrás.
    ctx.lineWidth = pixel ? 0.5 : 0.2;
    for (const w of this.wake) {
      const open = 0.5 + w.age * len * 0.35, a = w.h + Math.PI;
      ctx.globalAlpha = Math.max(0, 0.6 - w.age * 0.45) * (0.4 + 0.6 * w.k);
      for (const side of [-1, 1]) {
        const px = w.x + Math.cos(a + side * 0.5) * open, py = w.y + Math.sin(a + side * 0.5) * open;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * 0.9, py + Math.sin(a) * 0.9); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // Lenteja de agua, nenúfares y el loto: flotan por encima de los peces.
    ctx.fillStyle = '#7fc4a0';
    for (const w of this.weed) { ctx.beginPath(); ctx.arc(w.x + Math.sin(T * 0.4 + w.x) * 0.3, w.y, pixel ? 0.5 : w.r, 0, TAU); ctx.fill(); }
    this.pads.forEach((p, i) => {
      const bob = Math.sin(T * 0.9 + p.seed) * 0.03;
      drawPad(ctx, p.x, p.y, p.r * (1 + bob), p.rot);
      if (i === this.lotus) drawLotus(ctx, p.x - p.r * 0.1, p.y - p.r * 0.15, p.r * 0.62, T);
    });
    for (const m of this.marks) drawBuoy(ctx, m, T, len);
    for (const b of this.boats) drawBoat(ctx, b, T, len, pixel);
    // Brillos sueltos en la superficie.
    ctx.fillStyle = '#ffffff';
    for (const s of this.glints) {
      const a = Math.max(0, Math.sin(T * 1.3 + s.ph));
      if (a < 0.6) continue;
      ctx.globalAlpha = (a - 0.6) * 1.6;
      ctx.fillRect(s.x + Math.sin(T * 0.2 + s.ph) * 2, s.y, pixel ? 1 : len * 0.12, pixel ? 0.5 : len * 0.03);
    }
    ctx.globalAlpha = 1;
  }
}

// Boya: se mece; la siguiente que toca pasar (`on`) lleva un aro que late.
function drawBuoy(ctx, m, T, len) {
  const r = len * 0.16, bob = Math.sin(T * 2 + m.x) * 0.06;
  ctx.fillStyle = WATER.ink; ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(m.x + r * 0.3, m.y + r * 0.4, r, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = BOAT.buoy; ctx.beginPath(); ctx.arc(m.x, m.y, r * (1 + bob), 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(m.x, m.y, r * 0.45, 0, TAU); ctx.fill();
  if (m.on) {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.3; ctx.globalAlpha = 0.5 + 0.4 * Math.sin(T * 6);
    ctx.beginPath(); ctx.arc(m.x, m.y, r * 2.4, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  }
}

// Barquito visto desde arriba, apuntando a su rumbo; se mece y escora al girar.
function drawBoat(ctx, b, T, len, pixel) {
  const L = len * 0.85, Wd = L * 0.45, rock = Math.sin(T * 2.6 + b.x * 0.7) * 0.04;
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.h + rock);
  const poly = (pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * L, y * Wd) : ctx.moveTo(x * L, y * Wd))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  // Sombra corrida abajo a la derecha, como la de los peces.
  ctx.save(); ctx.rotate(-(b.h + rock)); ctx.translate(L * 0.12, L * 0.16); ctx.rotate(b.h + rock);
  ctx.globalAlpha = pixel ? 0.3 : 0.22; poly([[0.55, 0], [0.2, 0.55], [-0.5, 0.5], [-0.5, -0.5], [0.2, -0.55]], WATER.ink); ctx.globalAlpha = 1;
  ctx.restore();
  if (b.kind === 'papel') {
    poly([[0.55, 0], [0.25, 0.5], [-0.5, 0.5], [-0.3, 0], [-0.5, -0.5], [0.25, -0.5]], BOAT.paper);
    poly([[0.25, 0.5], [-0.1, 0], [0.25, -0.5], [0.05, 0]], BOAT.fold);
    poly([[-0.3, 0], [-0.5, 0.5], [-0.15, 0.08]], BOAT.fold);
  } else if (b.kind === 'balsa') {
    poly([[0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]], BOAT.bamboo);
    ctx.strokeStyle = BOAT.dark; ctx.lineWidth = pixel ? 0.5 : 0.12;
    for (const y of [-0.25, 0, 0.25]) { ctx.beginPath(); ctx.moveTo(-0.5 * L, y * Wd); ctx.lineTo(0.5 * L, y * Wd); ctx.stroke(); }
    poly([[0.2, 0], [-0.25, 0.35], [-0.25, -0.35]], BOAT.sail);
  } else if (b.kind === 'velero') {
    poly([[0.6, 0], [0.2, 0.48], [-0.5, 0.4], [-0.5, -0.4], [0.2, -0.48]], BOAT.wood);
    poly([[0.45, 0], [0.15, 0.32], [-0.4, 0.28], [-0.4, -0.28], [0.15, -0.32]], BOAT.dark);
    const sw = Math.max(-0.5, Math.min(0.5, (b.v || 0) * 0.04)); // la vela se hincha con la velocidad
    poly([[0.25, 0], [-0.35, 0.7 + sw], [-0.35, 0.05]], BOAT.sail);
  } else if (b.kind === 'lancha') {
    poly([[0.65, 0], [0.25, 0.48], [-0.5, 0.45], [-0.5, -0.45], [0.25, -0.48]], BOAT.red);
    poly([[0.15, 0.3], [-0.2, 0.3], [-0.2, -0.3], [0.15, -0.3]], BOAT.paper);
    poly([[-0.5, 0.18], [-0.62, 0.18], [-0.62, -0.18], [-0.5, -0.18]], WATER.ink);
  }
  ctx.restore();
}

// Silueta entera (cuerpo, aletas y cola) para la sombra y el borde en píxel.
function outline(sh) {
  const p = new Path2D();
  for (const poly of [sh.body, ...sh.fins, ...sh.tail]) { poly.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); }
  p.moveTo(sh.nose.x + sh.nose.r, sh.nose.y); p.arc(sh.nose.x, sh.nose.y, sh.nose.r, 0, TAU);
  return p;
}

// Cada píxel al color más cercano de la paleta (y opaco o nada): sin bordes suavizados.
function quantize(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) { d[i + 3] = 0; continue; }
    let best = 0, bd = Infinity;
    for (let j = 0; j < PALETTE.length; j++) {
      const p = PALETTE[j], dr = d[i] - p[0], dg = d[i + 1] - p[1], db = d[i + 2] - p[2], e = dr * dr * 2 + dg * dg * 4 + db * db * 3;
      if (e < bd) { bd = e; best = j; }
    }
    const p = PALETTE[best];
    d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// Bucle: paso y dibujo por cuadro; quieto con la pestaña oculta; un solo cuadro si se pide menos
// movimiento. `getCanvas` puede devolver otro lienzo si el estanque se vuelve a montar.
export function runPond(pond, getCanvas, still = false) {
  let raf, last = performance.now();
  const pixel = () => document.documentElement.dataset.art === 'pixel';
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000), cv = getCanvas();
    last = now;
    if (cv && cv !== pond.canvas) { pond.canvas = cv; pond.ctx = cv.getContext('2d'); }
    if (cv && !document.hidden) { pond.step(dt, now / 1000); pond.draw(now / 1000, pixel()); }
    if (!still) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
