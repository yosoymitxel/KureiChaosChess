// Koi con animación procedural (la técnica de nagomi, de msk1039; código propio porque su licencia
// no permite uso comercial). Cada pez es una columna de puntos: la cabeza decide hacia dónde ir
// sumando unas pocas ganas (vagar, no chocar, no salir del agua, ir a la comida) y el resto la sigue
// a distancia fija; al dibujar se suma una onda que crece hacia la cola. Sirve para el estanque del
// jardín y el del tablero; pond.js los pinta.
const N = 8; // puntos de la columna
const WIDTH = [0.5, 0.92, 1, 0.94, 0.78, 0.58, 0.38, 0.2]; // ancho del cuerpo a lo largo
const f2 = (n) => Math.round(n * 100) / 100;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class School {
  // inside(x, y): si ese punto es agua. home: [x, y] de un punto seguro donde nacer.
  constructor(inside, { count = 2, len = 7, speed = 3, home = [0, 0], spread = 3 } = {}) {
    Object.assign(this, { inside, len, speed, food: [], onEat: null });
    this.fish = Array.from({ length: count }, (_, i) => {
      const h = Math.random() * Math.PI * 2, x = home[0] + (Math.random() - 0.5) * spread, y = home[1] + (Math.random() - 0.5) * spread;
      return { x, y, h, v: speed, seg: len / (N - 1), pts: Array.from({ length: N }, (_, k) => [x - Math.cos(h) * k * len / (N - 1), y - Math.sin(h) * k * len / (N - 1)]),
        phase: Math.random() * 6, seed: Math.random() * 100, burst: 0, depth: Math.random(), kind: i % 4 };
    });
  }

  feed(x, y, el) { this.food.push({ x, y, el }); }

  step(dt, T) {
    const { fish, inside, len, speed, food } = this;
    for (const f of fish) {
      let want = f.h + Math.sin(T * 0.35 + f.seed) * 0.9 * dt * 2; // vagar: un giro lento que cambia
      let turn = 1.6, v = speed * (0.8 + 0.3 * Math.sin(T * 0.5 + f.seed));
      const bit = food.reduce((a, p) => (!a || Math.hypot(p.x - f.x, p.y - f.y) < Math.hypot(a.x - f.x, a.y - f.y) ? p : a), null);
      if (bit) {
        const d = Math.hypot(bit.x - f.x, bit.y - f.y);
        want = Math.atan2(bit.y - f.y, bit.x - f.x);
        turn = 4; v = speed * 2.2; f.burst = 1;
        if (d < len * 0.18) { food.splice(food.indexOf(bit), 1); this.onEat?.(bit); }
      }
      // Separarse: si otra cabeza está a menos de un cuerpo, girar hacia el lado contrario.
      for (const o of fish) {
        if (o === f) continue;
        const d = Math.hypot(o.x - f.x, o.y - f.y);
        if (d < len * 0.8 && d > 0) want += wrap(Math.atan2(f.y - o.y, f.x - o.x) - f.h) * 0.35 * (1 - d / (len * 0.8));
      }
      // Orilla: dos sondas por delante; si una sale del agua, girar hacia la otra.
      const look = len * 0.9, L = inside(f.x + Math.cos(f.h - 0.6) * look, f.y + Math.sin(f.h - 0.6) * look), R = inside(f.x + Math.cos(f.h + 0.6) * look, f.y + Math.sin(f.h + 0.6) * look);
      if (!L || !R) { want = f.h + (L ? -1.4 : 1.4); turn = 3.2; v *= 0.8; }
      const d = wrap(want - f.h), max = turn * dt;
      f.h += Math.max(-max, Math.min(max, d));
      f.v += (v - f.v) * Math.min(1, dt * 2);
      const nx = f.x + Math.cos(f.h) * f.v * dt, ny = f.y + Math.sin(f.h) * f.v * dt;
      if (inside(nx, ny)) { f.x = nx; f.y = ny; } else f.h += Math.PI * dt * 2;
      f.burst = Math.max(0, f.burst - dt);
      f.phase += dt * (3 + f.v * 0.9);
      f.depth = 0.5 + 0.5 * Math.sin(T * 0.2 + f.seed) - f.burst * 0.5; // sube al comer
      const p = f.pts;
      p[0] = [f.x, f.y];
      for (let k = 1; k < N; k++) {
        const a = Math.atan2(p[k - 1][1] - p[k][1], p[k - 1][0] - p[k][0]);
        p[k] = [p[k - 1][0] - Math.cos(a) * f.seg, p[k - 1][1] - Math.sin(a) * f.seg];
      }
    }
  }
}

// Columna con la onda de nado y su normal en cada punto.
export function spine(f, len) {
  const out = [];
  for (let k = 0; k < N; k++) {
    const a = f.pts[Math.max(0, k - 1)], b = f.pts[Math.min(N - 1, k + 1)], ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
    const nx = -Math.sin(ang), ny = Math.cos(ang), wave = Math.sin(f.phase - k * 0.8) * len * 0.07 * (k / (N - 1)) ** 1.4;
    out.push({ x: f.pts[k][0] + nx * wave, y: f.pts[k][1] + ny * wave, nx, ny, w: WIDTH[k] * len * 0.15 });
  }
  return out;
}

// Contorno suave: un lado, la cola en abanico y el otro lado, con curvas por los puntos medios.
export function bodyPath(s, len) {
  const t = s[N - 1], fan = len * 0.22;
  const pts = [...s.map((p) => [p.x + p.nx * p.w, p.y + p.ny * p.w]),
    [t.x + t.nx * fan - t.ny * len * 0.02, t.y + t.ny * fan + t.nx * len * 0.02],
    [t.x - (s[N - 2].x - t.x) * 0.6, t.y - (s[N - 2].y - t.y) * 0.6],
    [t.x - t.nx * fan - t.ny * len * 0.02, t.y - t.ny * fan + t.nx * len * 0.02],
    ...s.slice().reverse().map((p) => [p.x - p.nx * p.w, p.y - p.ny * p.w])];
  const h = s[0], nose = [h.x + (h.x - s[1].x) * 0.45, h.y + (h.y - s[1].y) * 0.45];
  pts.push(nose);
  let d = `M${f2((pts.at(-1)[0] + pts[0][0]) / 2)} ${f2((pts.at(-1)[1] + pts[0][1]) / 2)}`;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    d += `Q${f2(p[0])} ${f2(p[1])} ${f2((p[0] + q[0]) / 2)} ${f2((p[1] + q[1]) / 2)}`;
  }
  return d + 'Z';
}
export const finPath = (s, len) => [-1, 1].map((side) => {
  const p = s[2], w = p.w + len * 0.1, bx = p.x - (s[1].x - s[3].x) * 0.3, by = p.y - (s[1].y - s[3].y) * 0.3;
  return `M${f2(p.x + side * p.nx * p.w * 0.8)} ${f2(p.y + side * p.ny * p.w * 0.8)}L${f2(bx + side * p.nx * w)} ${f2(by + side * p.ny * w)}L${f2(s[3].x + side * s[3].nx * s[3].w)} ${f2(s[3].y + side * s[3].ny * s[3].w)}Z`;
}).join('');
export const spotPath = (s, kind) => (kind ? [[1, 0.35], [4, -0.3]] : [[2, -0.2], [4, 0.4]]).map(([k, o]) => {
  const p = s[k], r = p.w * 0.55;
  return `M${f2(p.x + p.nx * p.w * o - r)} ${f2(p.y + p.ny * p.w * o)}a${f2(r)} ${f2(r)} 0 1 0 ${f2(r * 2)} 0a${f2(r)} ${f2(r)} 0 1 0 ${f2(-r * 2)} 0`;
}).join('');
