// Koi procedurales. Cada pez es una columna de puntos: la cabeza decide hacia dónde ir sumando unas
// pocas ganas (vagar, cardumen suelto, no chocar, no salir del agua, ir a la comida) y el resto la sigue.
// Adaptado de nagomi (msk1039), PolyForm Noncommercial 1.0.0: los cinco estados de nado, el giro con
// inercia, la hondura por temporadas, los bocados en la superficie, la llamada escalonada al tocar, los
// pececillos y la forma (perfil, onda, aletas, cola, manchas y variedades). https://github.com/msk1039/nagomi
// Required Notice: Copyright 2026 Mayank Kadam (https://github.com/msk1039)
// Licencia: https://polyformproject.org/licenses/noncommercial/1.0.0 (docs/licencias/nagomi.md)
const N = 14; // puntos de la columna
const WIDE = 0.185; // medio ancho del cuerpo respecto del largo
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (k, dt) => 1 - Math.exp(-k * dt);

// Estados de nado: deslizar, planear sin cola, quedarse quieto, acelerón y giro cerrado. Duración, a dónde
// pasa al acabar (umbrales de una tirada 0..1), velocidad que busca, respuesta y esfuerzo de la cola.
const GLIDE = 0, COAST = 1, HOVER = 2, BURST = 3, PIVOT = 4;
const STATE = [
  { dur: [1.7, 5.2], next: [[0.25, COAST], [0.43, HOVER], [0.61, PIVOT], [0.72, BURST], [1, GLIDE]], resp: 1.65, effort: 0.62 },
  { dur: [0.7, 2.1], next: [[0.38, HOVER], [0.72, GLIDE], [0.9, PIVOT], [1, BURST]], resp: 1.05, effort: 0.16 },
  { dur: [0.65, 3.1], next: [[0.34, PIVOT], [0.55, BURST], [1, GLIDE]], resp: 3.6, effort: 0.05 },
  { dur: [0.32, 0.92], next: [[1, COAST]], resp: 6.4, effort: 1.22 },
  { dur: [0.3, 0.78], next: [[0.38, BURST], [1, GLIDE]], resp: 4.2, effort: 1 },
];

export class School {
  // inside(x, y): si ese punto es agua. home: [x, y] de un punto seguro donde nacer.
  constructor(inside, { count = 2, len = 7, speed = 3, home = [0, 0], spread = 3 } = {}) {
    Object.assign(this, { inside, len, speed, food: [], onEat: null, call: null });
    this.fish = Array.from({ length: count }, (_, i) => {
      const h = Math.random() * Math.PI * 2, x = home[0] + (Math.random() - 0.5) * spread, y = home[1] + (Math.random() - 0.5) * spread;
      // Carácter: cada uno con su marcha, su punta, su cintura y su prisa por acudir.
      const cruise = speed * rnd(0.8, 1.25);
      const f = { x, y, h, v: cruise, seg: len / (N - 1), pts: Array.from({ length: N }, (_, k) => [x - Math.cos(h) * k * len / (N - 1), y - Math.sin(h) * k * len / (N - 1)]),
        phase: Math.random() * 6, seed: Math.random() * 100, kind: i % 6,
        cruise, max: cruise * rnd(1.55, 1.9), agile: rnd(4.4, 6.8), react: rnd(0.35, 1), av: 0, effort: 0.6,
        depth: rnd(0.05, 0.18), deepGoal: 0.1, deepRate: 1, deepT: rnd(0, 10), deepDur: rnd(8, 22), deep: false, gulpT: rnd(1, 4), gulp: 0, wait: -1, callAge: 0 };
      enter(f, i % 5);
      f.stT = rnd(0, f.stDur * 0.8);
      return f;
    });
  }

  feed(x, y, el) { this.food.push({ x, y, el }); }

  // Llamada (un toque): cada koi acude con su retraso, más tarde si está lejos o es tranquilo, y sube.
  callTo(x, y) {
    this.call = { x, y, age: 0 };
    const far = this.len * 11;
    for (const f of this.fish) f.wait = 0.04 + clamp(Math.hypot(f.x - x, f.y - y) / far, 0, 1) ** 1.5 * 1.05 + rnd(0, 0.18) + (1 - f.react) * 0.22, f.callAge = 0, f.called = false;
  }

  // Susto (barco que choca, golpe fuerte): todos salen disparados hacia lados distintos.
  scatter() {
    for (const f of this.fish) if (!f.ctl) { f.h += rnd(-1.35, 1.35); f.v = f.max; f.av += rnd(-2, 2); enter(f, BURST); }
    this.call = null;
  }

  step(dt, T) {
    const { fish, inside, len, food } = this, call = this.call;
    if (call && (call.age += dt) > 4.4) this.call = null;
    for (const f of fish) {
      if (f.ctl) { swim(f, dt); continue; } // lo lleva la carrera: solo nada, sin rumbo propio
      if ((f.stT += dt) >= f.stDur) { const r = Math.random(); enter(f, STATE[f.state].next.find(([p]) => r < p)[1]); }
      // La comida que ve: la más cercana, una vez pasado su retraso.
      const bit = f.wait <= 0 || !this.call ? food.reduce((a, p) => (!a || Math.hypot(p.x - f.x, p.y - f.y) < Math.hypot(a.x - f.x, a.y - f.y) ? p : a), null) : null;
      if (this.call) {
        f.wait -= dt;
        if (f.called) f.callAge += dt;
        else if (f.wait <= 0) { f.called = true; f.callAge = 0; f.deepGoal = 0.035; f.deepRate = 3 / 2.4; enter(f, BURST); }
      }
      depth(f, dt, !!(this.call && f.called));
      // Bocado: tranquilo, cerca de la superficie y despacio, abre la boca y deja un aro pequeño.
      f.gulp = Math.max(0, f.gulp - dt);
      if ((f.gulpT -= dt) <= 0) {
        if (f.state !== BURST && f.state !== PIVOT && !f.called && f.depth <= 0.23 && f.v <= f.cruise * 0.62) {
          this.onNibble?.(f.x + Math.cos(f.h) * len * 0.12, f.y + Math.sin(f.h) * len * 0.12); f.gulp = 0.24; f.gulpT = rnd(1, 4);
        } else f.gulpT = rnd(0.55, 1.35);
      }
      // Ganas, sumadas como vectores: seguir, vagar (o girar en redondo), cardumen y orilla.
      const fx = Math.cos(f.h), fy = Math.sin(f.h);
      let sx = fx * 0.95, sy = fy * 0.95;
      if (f.state === PIVOT) { sx = Math.cos(f.pivot) * 4.7; sy = Math.sin(f.pivot) * 4.7; }
      else if (f.state !== HOVER) { const w = f.h + Math.sin(T * 0.29 + f.seed) * 0.7 + Math.sin(T * 0.113 + f.seed * 1.73) * 0.45; sx += Math.cos(w) * 0.62; sy += Math.sin(w) * 0.62; }
      let n = 0, cx = 0, cy = 0, ax = 0, ay = 0, px = 0, py = 0;
      const near = len * 1.1, sep = len * 0.42;
      for (const o of fish) {
        if (o === f || o.ctl) continue;
        const dx = f.x - o.x, dy = f.y - o.y, d = Math.hypot(dx, dy);
        if (d < 0.001 || d > near) continue;
        n++; cx += o.x; cy += o.y; ax += Math.cos(o.h); ay += Math.sin(o.h);
        if (d < sep) { px += (dx / d) * (sep - d) / sep; py += (dy / d) * (sep - d) / sep; }
      }
      if (n) {
        const [ux, uy] = unit(cx / n - f.x, cy / n - f.y, fx, fy), [vx, vy] = unit(ax, ay, fx, fy);
        sx += ux * 0.25 + vx * 0.42 + px * 2.8; sy += uy * 0.25 + vy * 0.42 + py * 2.8;
      }
      // Orilla: seis sondas alrededor; las que caen fuera del agua empujan hacia dentro.
      for (let k = 0; k < 6; k++) {
        const a = f.h + k * Math.PI / 3, r = len * (k === 0 ? 1.1 : 0.8);
        if (!inside(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r)) { sx -= Math.cos(a) * 2.4; sy -= Math.sin(a) * 2.4; }
      }
      // Barcos que pasan cerca: se apartan con un coletazo.
      for (const o of this.avoid || []) {
        const dx = f.x - o.x, dy = f.y - o.y, d = Math.hypot(dx, dy);
        if (d < len * 1.3 && d > 0) { sx += (dx / d) * 6; sy += (dy / d) * 6; if (f.state !== BURST) enter(f, BURST); }
      }
      // A la comida (o al punto tocado): tira fuerte; ya encima, da vueltas alrededor en vez de amontonarse.
      const goal = bit || (this.call && f.called ? this.call : null);
      if (goal) {
        const dx = goal.x - f.x, dy = goal.y - f.y, d = Math.hypot(dx, dy), [ux, uy] = unit(dx, dy, fx, fy);
        if (bit || d > len * 0.4) { const k = f.callAge < 2.6 ? 3.35 : 2.45; sx += ux * k; sy += uy * k; }
        else { sx += -uy * 2.2 - ux * 0.5; sy += ux * 2.2 - uy * 0.5; }
        if (bit && d < len * 0.18) { food.splice(food.indexOf(bit), 1); this.onEat?.(bit); }
      }
      // Hacia dónde y a qué velocidad.
      let want = f.state === HOVER ? 0 : f.state === COAST ? f.cruise * 0.28 : f.state === BURST ? f.max * 1.08 : f.state === PIVOT ? f.cruise * 0.16 : f.cruise;
      if (goal) {
        const d = Math.hypot(goal.x - f.x, goal.y - f.y);
        want = f.called && f.callAge < 2.6 ? f.max * (1.25 + (1 - f.callAge / 2.6) * 0.34) : Math.max(want, f.cruise + (f.max - f.cruise) * clamp(d / (len * 3), 0.2, 1));
      }
      const st = STATE[f.state], piv = f.state === PIVOT;
      f.av += (wrap(Math.atan2(sy, sx) - f.h) * f.agile * (piv ? 2.65 : 1) - f.av * (piv ? 2.15 : 3.8)) * dt;
      f.av = clamp(f.av, -(piv ? 4.35 : 2.25), piv ? 4.35 : 2.25);
      f.h = wrap(f.h + f.av * dt);
      f.v += (want - f.v) * ease(st.resp, dt);
      f.effort += (st.effort - f.effort) * ease(4.5, dt);
      const nx = f.x + Math.cos(f.h) * f.v * dt, ny = f.y + Math.sin(f.h) * f.v * dt;
      if (inside(nx, ny)) { f.x = nx; f.y = ny; } else { f.av += (f.av >= 0 ? 1 : -1) * 6 * dt; f.v *= 0.9; }
      swim(f, dt);
    }
  }
}

function enter(f, s) {
  f.state = s; f.stT = 0; f.stDur = rnd(...STATE[s].dur);
  if (s === PIVOT) f.pivot = wrap(f.h + (Math.random() < 0.5 ? -1 : 1) * rnd(0.85, 2.35));
}
const unit = (x, y, dx, dy) => { const l = Math.hypot(x, y); return l > 1e-6 ? [x / l, y / l] : [dx, dy]; };

// Hondura por temporadas: largas cerca de la superficie, más cortas al fondo; al llamarlos, suben.
function depth(f, dt, rising) {
  if (!rising && (f.deepT += dt) >= f.deepDur) {
    f.deepT = 0;
    if (Math.random() < 0.72) f.deep = !f.deep;
    f.deepGoal = f.deep ? rnd(0.45, 0.75) : rnd(0.04, 0.22);
    f.deepDur = f.deep ? rnd(4, 10) : rnd(8, 22);
    f.deepRate = 3 / rnd(2, 5);
  }
  f.depth += (f.deepGoal - f.depth) * ease(f.deepRate, dt);
}

// Ondular y arrastrar el cuerpo detrás de la cabeza: cerca de la cabeza firme, la cola más suelta.
function swim(f, dt) {
  f.phase += dt * (f.max ? 0.45 + (f.v / f.max) * 4.6 + f.effort * 0.9 : 3 + Math.abs(f.v) * 0.9);
  const p = f.pts;
  p[0] = [f.x, f.y];
  // Cada vértebra se dobla como mucho BEND respecto a la anterior: en un giro cerrado el cuerpo hace una
  // curva de pez y no se enrosca sobre sí mismo.
  let prev = null;
  for (let k = 1; k < N; k++) {
    let a = Math.atan2(p[k - 1][1] - p[k][1], p[k - 1][0] - p[k][0]);
    if (prev != null) a = prev + Math.max(-BEND, Math.min(BEND, wrap(a - prev)));
    const tx = p[k - 1][0] - Math.cos(a) * f.seg, ty = p[k - 1][1] - Math.sin(a) * f.seg, s = f.max ? 0.94 - (k / (N - 1)) * 0.17 : 1;
    p[k] = [p[k][0] + (tx - p[k][0]) * s, p[k][1] + (ty - p[k][1]) * s];
    prev = a;
  }
}
const BEND = 0.22;

// Pececillos: cardúmenes de peces diminutos que se arremolinan juntos y, al tocar el agua, huyen en una
// ola que se propaga desde el toque (los cercanos primero).
export class Minnows {
  constructor(inside, { count = 0, len = 7, size = [48, 48] } = {}) {
    const tl = len * 0.2, schools = Math.max(1, Math.round(count / 7));
    Object.assign(this, { inside, tl, from: null, schools: [] });
    this.fish = [];
    for (let s = 0; s < schools && count; s++) {
      let hx, hy;
      for (let t = 0; t < 60; t++) { hx = rnd(0.15, 0.85) * size[0]; hy = rnd(0.15, 0.85) * size[1]; if (inside(hx, hy)) break; }
      const h = rnd(-Math.PI, Math.PI), swirl = s % 2 ? -1 : 1, k = Math.round(count / schools);
      this.schools.push({ swirl, phase: rnd(0, 6), h });
      for (let i = 0; i < k; i++) {
        const a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * tl * 4, cruise = tl * rnd(2.7, 3.9), hh = h + rnd(-0.34, 0.34);
        this.fish.push({ x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r * 0.6, vx: Math.cos(hh) * cruise, vy: Math.sin(hh) * cruise, cruise, s, ph: rnd(0, 6), tail: rnd(0, 6), wait: -1, flee: 0, len: tl * rnd(0.85, 1.15), gold: s % 2 === 0 });
      }
    }
  }

  fleeFrom(x, y, far = Infinity) {
    this.from = { x, y };
    const tl = this.tl;
    for (const f of this.fish) { const d = Math.hypot(f.x - x, f.y - y); if (d < Math.min(far, tl * 40)) { f.wait = d / (tl * 26) + rnd(0, 0.16); f.fleeDur = rnd(1.45, 2.35); } }
  }

  step(dt, T, avoid = []) {
    const { fish, tl, inside } = this;
    for (const b of avoid) if (Math.hypot(b.vx || 0, b.vy || 0) > 1) for (const f of fish) if (f.flee <= 0 && f.wait < 0 && Math.hypot(f.x - b.x, f.y - b.y) < tl * 9) { this.from = { x: b.x, y: b.y }; f.wait = 0; f.fleeDur = rnd(0.8, 1.4); }
    this.schools.forEach((sc, si) => {
      let cx = 0, cy = 0, mx = 0, my = 0, c = 0;
      for (const f of fish) if (f.s === si) { cx += f.x; cy += f.y; mx += f.vx; my += f.vy; c++; }
      if (!c) return;
      cx /= c; cy /= c;
      const [gx, gy] = unit(mx, my, Math.cos(sc.h), Math.sin(sc.h));
      for (const f of fish) {
        if (f.s !== si) continue;
        if (f.wait >= 0 && (f.wait -= dt) < 0) { f.flee = f.fleeDur; const [ux, uy] = unit(f.x - this.from.x, f.y - this.from.y, gx, gy); f.vx += ux * tl * 1.9; f.vy += uy * tl * 1.9; }
        let n = 0, ax = 0, ay = 0, ox = 0, oy = 0, px = 0, py = 0;
        for (const o of fish) {
          if (o === f || o.s !== si) continue;
          const dx = f.x - o.x, dy = f.y - o.y, d = Math.hypot(dx, dy);
          if (d < 0.001 || d > tl * 3.6) continue;
          n++; ox += o.x; oy += o.y; const [vx, vy] = unit(o.vx, o.vy, gx, gy); ax += vx; ay += vy;
          if (d < tl * 0.9) { px += (dx / d) * (tl * 0.9 - d) / (tl * 0.9); py += (dy / d) * (tl * 0.9 - d) / (tl * 0.9); }
        }
        const [fx, fy] = unit(f.vx, f.vy, gx, gy);
        const [hx, hy] = n ? unit(ox / n - f.x, oy / n - f.y, gx, gy) : unit(cx - f.x, cy - f.y, gx, gy), [lx, ly] = n ? unit(ax, ay, gx, gy) : [gx, gy];
        const [rx, ry] = unit(f.x - cx, f.y - cy, fx, fy);
        const w = Math.atan2(fy, fx) + Math.sin(T * 0.62 + f.ph + sc.phase) * 0.58 + Math.sin(T * 0.19 + f.ph * 1.7) * 0.31;
        let sx = fx * 0.82 + Math.cos(w) * 0.34 - ry * sc.swirl * 0.46 + px * 2.8, sy = fy * 0.82 + Math.sin(w) * 0.34 + rx * sc.swirl * 0.46 + py * 2.8;
        let want = f.cruise * (1 + Math.sin(T * 0.83 + f.ph) * 0.46);
        if (f.flee > 0) {
          f.flee = Math.max(0, f.flee - dt);
          const [ux, uy] = unit(f.x - this.from.x, f.y - this.from.y, fx, fy);
          sx += ux * 5.8 + lx * 0.58; sy += uy * 5.8 + ly * 0.58; want = tl * rnd(7, 9);
        } else { sx += hx * 0.62 + lx * 0.56; sy += hy * 0.62 + ly * 0.56; }
        for (let k = 0; k < 4; k++) { const a = Math.atan2(fy, fx) + k * Math.PI / 2, r = tl * (k ? 2 : 3); if (!inside(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r)) { sx -= Math.cos(a) * 4.8; sy -= Math.sin(a) * 4.8; } }
        const h = Math.atan2(fy, fx), turn = clamp(wrap(Math.atan2(sy, sx) - h), -2.4 * dt, 2.4 * dt), sp = Math.hypot(f.vx, f.vy);
        const v = sp + (want - sp) * ease(4.7, dt);
        f.vx = Math.cos(h + turn) * v; f.vy = Math.sin(h + turn) * v;
        const nx = f.x + f.vx * dt, ny = f.y + f.vy * dt;
        if (inside(nx, ny)) { f.x = nx; f.y = ny; } else { f.vx = -f.vx * 0.5; f.vy = -f.vy * 0.5; }
        f.tail += (4.4 + v / tl * 0.6) * dt;
      }
    });
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
  const body = [[nose.x + h.nx * h.w * 0.72, nose.y + h.ny * h.w * 0.72], ...L, ...R.slice().reverse(), [nose.x - h.nx * h.w * 0.72, nose.y - h.ny * h.w * 0.72]];
  const kind = KOI_KINDS[f.kind % KOI_KINDS.length];
  const spots = kind.spots.map(([pos, l, w, off, c]) => {
    const at = pos * (N - 1), k = Math.min(N - 2, Math.floor(at)), u = at - k, a = s[k], b = s[k + 1], lw = a.w * (1 - u) + b.w * u;
    return { x: a.x + (b.x - a.x) * u + a.nx * lw * off, y: a.y + (b.y - a.y) * u + a.ny * lw * off, ang: Math.atan2(a.fy, a.fx), rx: len * l, ry: lw * w, color: c === 'a' ? kind.accent : kind.marking };
  });
  const eye = (side) => ({ x: h.x + h.fx * bw * 0.08 + h.nx * h.w * 0.58 * side, y: h.y + h.fy * bw * 0.08 + h.ny * h.w * 0.58 * side, r: Math.max(len * 0.02, bw * 0.11) });
  return { kind, fins, tail, body, nose, spots, eyes: [eye(1), eye(-1)] };
}
