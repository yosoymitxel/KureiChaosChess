// Koi procedurales. Cada pez es una columna de puntos: la cabeza decide hacia dónde ir sumando unas
// pocas ganas (vagar, no chocar, no salir del agua, ir a la comida) y el resto la sigue a distancia
// fija. La forma (perfil, onda, aletas, cola en horquilla, manchas y las seis variedades) está
// adaptada de nagomi: https://github.com/msk1039/nagomi
// Required Notice: Copyright 2026 Mayank Kadam (https://github.com/msk1039)
// Licencia de esas partes: PolyForm Noncommercial 1.0.0 (el juego es gratis y sin ingresos).
const N = 14; // puntos de la columna
const WIDE = 0.185; // medio ancho del cuerpo respecto del largo
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class School {
  // inside(x, y): si ese punto es agua. home: [x, y] de un punto seguro donde nacer.
  constructor(inside, { count = 2, len = 7, speed = 3, home = [0, 0], spread = 3 } = {}) {
    Object.assign(this, { inside, len, speed, food: [], onEat: null });
    this.fish = Array.from({ length: count }, (_, i) => {
      const h = Math.random() * Math.PI * 2, x = home[0] + (Math.random() - 0.5) * spread, y = home[1] + (Math.random() - 0.5) * spread;
      return { x, y, h, v: speed, seg: len / (N - 1), pts: Array.from({ length: N }, (_, k) => [x - Math.cos(h) * k * len / (N - 1), y - Math.sin(h) * k * len / (N - 1)]),
        phase: Math.random() * 6, seed: Math.random() * 100, burst: 0, depth: Math.random(), kind: i % 6 };
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

// Variedades (Kohaku, Sanke, Showa, Ogon, Tancho, Shiro): cuerpo, acento, marca, aletas, y sus
// manchas en el espacio del cuerpo: dónde (0 cabeza, 1 cola), largo, ancho, desvío lateral y color.
export const KOI_KINDS = [
  { base: '#f1eadb', accent: '#dc4b2f', marking: '#27251f', fin: '#e6ddca', spots: [[0.17, 0.09, 0.74, 0.04, 'a'], [0.48, 0.115, 0.69, -0.12, 'a'], [0.76, 0.085, 0.62, 0.16, 'a']] },
  { base: '#f2ebdc', accent: '#df5032', marking: '#20211f', fin: '#e7dece', spots: [[0.19, 0.095, 0.7, 0.04, 'a'], [0.58, 0.105, 0.66, -0.14, 'a'], [0.38, 0.045, 0.3, 0.38, 'm'], [0.79, 0.04, 0.28, -0.36, 'm']] },
  { base: '#eee6d5', accent: '#d9482e', marking: '#242622', fin: '#c9bfaa', spots: [[0.15, 0.082, 0.63, -0.05, 'a'], [0.53, 0.092, 0.58, 0.17, 'a'], [0.32, 0.09, 0.72, 0.1, 'm'], [0.73, 0.105, 0.67, -0.14, 'm']] },
  { base: '#e7aa31', accent: '#cf7626', marking: '#78431f', fin: '#d9922a', spots: [] },
  { base: '#f2ebdc', accent: '#da4430', marking: '#292723', fin: '#e7dece', spots: [[0.16, 0.07, 0.52, 0, 'a']] },
  { base: '#eae5da', accent: '#252825', marking: '#4f5c5a', fin: '#d7d2c7', spots: [[0.22, 0.092, 0.68, 0.08, 'a'], [0.51, 0.09, 0.6, -0.18, 'a'], [0.79, 0.074, 0.54, 0.22, 'a']] },
];

// Medio ancho en cada punto: la cabeza crece rápido y el cuerpo se afina hasta la cola.
const widthAt = (len, k) => { const t = k / (N - 1); return len * WIDE * (t < 0.18 ? 0.73 + (t / 0.18) * 0.27 : Math.max(0, 1 - (t - 0.18) / 0.82) ** 0.72); };

// Columna con la onda de nado (más amplia hacia la cola y con más esfuerzo), su normal y su ancho.
export function spine(f, len, effort = 0.5) {
  const out = [], bw = len * WIDE;
  for (let k = 0; k < N; k++) {
    const a = f.pts[Math.max(0, k - 1)], b = f.pts[Math.min(N - 1, k + 1)], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), t = k / (N - 1);
    const nx = -Math.sin(ang), ny = Math.cos(ang), wave = Math.sin(f.phase - t * 6.1) * bw * 1.15 * t ** 1.72 * (0.08 + effort * 0.92);
    out.push({ x: f.pts[k][0] + nx * wave, y: f.pts[k][1] + ny * wave, nx, ny, fx: Math.cos(ang), fy: Math.sin(ang), w: widthAt(len, k) });
  }
  return out;
}

// Lo que se pinta de un koi: aletas (pectorales y pélvicas), cola en horquilla, el cuerpo como
// contorno cerrado con la nariz redonda, sus manchas (elipses que siguen la columna) y los ojos.
export function koiShape(s, f, len) {
  const bw = len * WIDE, L = s.map((p) => [p.x + p.nx * p.w, p.y + p.ny * p.w]), R = s.map((p) => [p.x - p.nx * p.w, p.y - p.ny * p.w]);
  const pulse = 0.82 + 0.11 * Math.sin(f.phase * 0.64 + f.seed), add = (p, x, y, k) => [p[0] + x * k, p[1] + y * k];
  // Aleta: triángulo del borde del cuerpo hacia fuera (izquierda, +normal; derecha, −normal).
  const fin = (front, c, back, reach, slide = 0) => [[L, 1], [R, -1]].map(([P, side]) => {
    const n = s[c];
    return [P[front], [P[c][0] + n.nx * reach * side - n.fx * slide, P[c][1] + n.ny * reach * side - n.fy * slide], P[back]];
  });
  const fins = [...fin(3, 4, 6, bw * 0.7 * pulse, bw * 0.22), ...fin(7, 8, 9, bw * (0.28 + 0.05 * pulse))];
  const t = s[N - 1], spread = bw * (0.58 + 0.08 * Math.sin(f.phase - 0.8)), back = (k) => [t.x - t.fx * bw * k, t.y - t.fy * bw * k];
  const tail = [[[t.x, t.y], add(back(1.38), t.nx, t.ny, spread), back(0.86)], [[t.x, t.y], back(0.86), add(back(1.38), t.nx, t.ny, -spread)]];
  const h = s[0], nose = { x: h.x + h.fx * bw * 0.43, y: h.y + h.fy * bw * 0.43, r: Math.max(0.1, h.w * 0.72 * 0.72) };
  const body = [...L, [nose.x + h.nx * h.w * 0.72, nose.y + h.ny * h.w * 0.72], [nose.x - h.nx * h.w * 0.72, nose.y - h.ny * h.w * 0.72], ...R.slice().reverse()];
  const kind = KOI_KINDS[f.kind % KOI_KINDS.length];
  const spots = kind.spots.map(([pos, l, w, off, c]) => {
    const at = pos * (N - 1), k = Math.min(N - 2, Math.floor(at)), u = at - k, a = s[k], b = s[k + 1], lw = a.w * (1 - u) + b.w * u;
    return { x: a.x + (b.x - a.x) * u + a.nx * lw * off, y: a.y + (b.y - a.y) * u + a.ny * lw * off, ang: Math.atan2(a.fy, a.fx), rx: len * l, ry: lw * w, color: c === 'a' ? kind.accent : kind.marking };
  });
  const eye = (side) => ({ x: h.x + h.fx * bw * 0.08 + h.nx * h.w * 0.58 * side, y: h.y + h.fy * bw * 0.08 + h.ny * h.w * 0.58 * side, r: Math.max(len * 0.02, bw * 0.11) });
  return { kind, fins, tail, body, nose, spots, eyes: [eye(1), eye(-1)] };
}
