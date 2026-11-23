// Carrera de barquitos y koi en tiempo real por un canal cerrado que sale al azar (óvalo, riñón, trébol,
// gota u ola), con rocas que cortan el paso y algas que frenan. Cada corredor se maneja con drive() de
// boats.js; los rivales siguen las boyas y esquivan las rocas con el pulso que da la dificultad. Sin DOM.
import { drive, newBoat, wrap } from './boats.js';
import { bump } from './physics.js';
import { BOATS } from '../data/garden.js';
import { localize } from '../i18n/index.js';

export const W = 110, H = 180, LAPS = 2, COUNT = 3, LIMIT = 240;
const N = 360, LANE = 15, R = 2.8, GATE = LANE / 2 + 1.5, STEP = 12, GRID = 2; // GRID: celdas por unidad de la máscara
// Formas del canal: el borde de una mancha de casillas (poliominó) que crece al azar, con las esquinas
// redondeadas. cells: cuántas casillas; grow: 'blob' (compacta), 'snake' (brazos largos) o 'any'.
export const TRACKS = localize('boatTracks', {
  ovalo: { name: 'Óvalo', cells: 10, grow: 'blob' },
  rinon: { name: 'Riñón', cells: 9, grow: 'any' },
  trebol: { name: 'Trébol', cells: 12, grow: 'any' },
  gota: { name: 'Gota', cells: 8, grow: 'snake' },
  ola: { name: 'Ola', cells: 11, grow: 'snake' },
});
export const DIFFS = {
  facil: { name: 'Fácil', pace: 0.72, wobble: 0.5, rocks: 4, weed: 2 },
  normal: { name: 'Normal', pace: 0.8, wobble: 0.3, rocks: 6, weed: 3, nitro: true },
  dificil: { name: 'Difícil', pace: 0.85, wobble: 0.15, rocks: 8, weed: 4, nitro: true },
};
// Dos carreras distintas: barcos contra barcos (los otros tres modelos) y koi contra koi.
const BOATS_RACE = ['papel', 'balsa', 'velero', 'lancha'];
// Nitro: un empujón corto para remontar y luego hay que esperar a que se recargue.
export const NITRO = { time: 1.6, boost: 1.45, cooldown: 9 };

// Radio de la curva más cerrada (por tres puntos seguidos).
function minRadius(line) {
  let min = Infinity;
  for (let i = 0; i < N; i++) {
    const a = line[(i + N - 6) % N], b = line[i], c = line[(i + 6) % N];
    const ab = Math.hypot(b.x - a.x, b.y - a.y), bc = Math.hypot(c.x - b.x, c.y - b.y), ca = Math.hypot(a.x - c.x, a.y - c.y);
    const area = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
    if (area > 1e-6) min = Math.min(min, (ab * bc * ca) / (4 * area));
  }
  return min;
}

// Curva cerrada por los puntos (Catmull-Rom) y vuelta a muestrear en N tramos iguales.
function spline(pts) {
  const n = pts.length, dense = [];
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((d) => pts[(i + d + n) % n]);
    for (let k = 0; k < 30; k++) {
      const t = k / 30, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
      dense.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  return resample(dense);
}
function resample(pts) {
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) { const a = pts[i - 1], b = pts[i % pts.length]; cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y)); }
  const len = cum[pts.length], out = [];
  for (let i = 0, j = 0; i < N; i++) {
    const want = (i / N) * len;
    while (cum[j + 1] < want) j++;
    const a = pts[j], b = pts[(j + 1) % pts.length], k = (want - cum[j]) / (cum[j + 1] - cum[j] || 1);
    out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
  }
  return out;
}
// Que dos tramos lejanos del canal no se toquen.
const clear = (line) => line.every((p, i) => line.every((q, j) => { const d = Math.abs(i - j); return Math.min(d, N - d) < 48 || Math.hypot(p.x - q.x, p.y - q.y) > LANE + 4; }));

// Mancha de `cells` casillas en una rejilla gw×gh, sin agujeros ni casillas que se toquen solo por la esquina.
const CELL = 22;
function blob(rng, gw, gh, cells, grow) {
  const on = new Uint8Array(gw * gh), at = (x, y) => x >= 0 && y >= 0 && x < gw && y < gh && on[y * gw + x];
  const ok = () => {
    for (let y = 0; y < gh - 1; y++) for (let x = 0; x < gw - 1; x++) {
      const a = at(x, y), b = at(x + 1, y), c = at(x, y + 1), d = at(x + 1, y + 1);
      if ((a && d && !b && !c) || (b && c && !a && !d)) return false;
    }
    // Agujeros: lo vacío tiene que llegar al borde.
    const seen = new Uint8Array((gw + 2) * (gh + 2)), todo = [[-1, -1]];
    seen[0] = 1;
    while (todo.length) {
      const [x, y] = todo.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = (ny + 1) * (gw + 2) + nx + 1;
        if (nx < -1 || ny < -1 || nx > gw || ny > gh || seen[k] || at(nx, ny)) continue;
        seen[k] = 1; todo.push([nx, ny]);
      }
    }
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (!at(x, y) && !seen[(y + 1) * (gw + 2) + x + 1]) return false;
    return true;
  };
  on[Math.floor(rng() * gh) * gw + Math.floor(rng() * gw)] = 1;
  for (let n = 1; n < cells; n++) {
    const cand = [];
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      if (at(x, y)) continue;
      const k = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => at(x + dx, y + dy)).length;
      if (k) cand.push({ x, y, s: (grow === 'blob' ? k : grow === 'snake' ? -k : 0) + rng() * 1.5 });
    }
    cand.sort((a, b) => b.s - a.s);
    if (!cand.some((c) => { on[c.y * gw + c.x] = 1; if (ok()) return true; on[c.y * gw + c.x] = 0; return false; })) break;
  }
  // Borde en el sentido de las agujas del reloj: de cada vértice sale un solo tramo.
  const next = new Map(), key = (x, y) => x + ',' + y;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    if (!at(x, y)) continue;
    if (!at(x, y - 1)) next.set(key(x, y), [x + 1, y]);
    if (!at(x + 1, y)) next.set(key(x + 1, y), [x + 1, y + 1]);
    if (!at(x, y + 1)) next.set(key(x + 1, y + 1), [x, y + 1]);
    if (!at(x - 1, y)) next.set(key(x, y + 1), [x, y]);
  }
  const [k0] = next.keys(), loop = [k0.split(',').map(Number)];
  for (let v = next.get(k0); key(...v) !== k0; v = next.get(key(...v))) loop.push(v);
  // Solo las esquinas.
  return loop.filter((p, i) => { const a = loop[(i + loop.length - 1) % loop.length], b = loop[(i + 1) % loop.length]; return (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) !== 0; });
}
// Esquinas a mundo, cada una cambiada por un cuarto de curva de radio `d`.
function rounded(corners, d) {
  const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1]);
  const ox = (W - (Math.max(...xs) + Math.min(...xs)) * CELL) / 2, oy = (H - (Math.max(...ys) + Math.min(...ys)) * CELL) / 2;
  const P = corners.map(([x, y]) => ({ x: ox + x * CELL, y: oy + y * CELL })), out = [];
  P.forEach((p, i) => {
    const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length];
    const ia = Math.hypot(p.x - a.x, p.y - a.y), ob = Math.hypot(b.x - p.x, b.y - p.y);
    const inx = (p.x - a.x) / ia, iny = (p.y - a.y) / ia, ox2 = (b.x - p.x) / ob, oy2 = (b.y - p.y) / ob;
    // Cuarto de círculo: de p - entrada·d a p + salida·d.
    for (let k = 0; k <= 6; k++) {
      const t = (k / 6) * Math.PI / 2, c = Math.cos(t), sn = Math.sin(t);
      out.push({ x: p.x - inx * d + ox2 * d - ox2 * d * c + inx * d * sn, y: p.y - iny * d + oy2 * d - oy2 * d * c + iny * d * sn });
    }
  });
  return resample(out);
}

export function makeTrack(diff, rng = Math.random, type) {
  type ||= Object.keys(TRACKS)[Math.floor(rng() * Object.keys(TRACKS).length)];
  const { cells, grow } = TRACKS[type], m = LANE / 2 + 3;
  // Línea central; si dos tramos quedan demasiado cerca, se sortea otra mancha.
  let line;
  for (let tries = 0; ; tries++) {
    line = rounded(blob(rng, Math.floor((W - 2 * m) / CELL), Math.floor((H - 2 * m) / CELL), tries > 30 ? 4 : cells, grow), CELL * 0.48);
    if ((minRadius(line) >= LANE / 2 + 1 && clear(line)) || tries > 30) break;
  }
  // La salida, a media recta del tramo más bajo.
  const low = Math.max(...line.map((p) => p.y)), bottom = line.map((p, i) => i).filter((i) => line[i].y > low - 0.5);
  const s0 = bottom.reduce((best, i) => (Math.abs(line[i].x - W / 2) < Math.abs(line[best].x - W / 2) ? i : best));
  line = [...line.slice(s0), ...line.slice(0, s0)];
  line.forEach((p, i) => { const a = line[(i + N - 1) % N], b = line[(i + 1) % N], d = Math.hypot(b.x - a.x, b.y - a.y); p.tx = (b.x - a.x) / d; p.ty = (b.y - a.y) / d; });
  const edge = (side) => line.map((p) => ({ x: p.x - p.ty * side * LANE / 2, y: p.y + p.tx * side * LANE / 2 }));
  // Rocas a un lado del canal (nunca en la salida) y algas en el medio.
  const at = (i, off) => { const p = line[i % N]; return { x: p.x - p.ty * off, y: p.y + p.tx * off }; };
  const spots = Array.from({ length: diff.rocks + diff.weed }, (_, k) => Math.floor(((k + 1) / (diff.rocks + diff.weed + 1)) * N));
  const rocks = spots.slice(0, diff.rocks).map((i, k) => ({ ...at(i + Math.floor(rng() * 6), (k % 2 ? 1 : -1) * LANE * (0.3 + rng() * 0.08)), r: 1.8 + rng() * 0.8 }));
  const weed = spots.slice(diff.rocks).map((i) => ({ ...at(i, (rng() - 0.5) * LANE * 0.3), r: 3.5 + rng() * 1.5 }));
  const track = { type, line, outer: edge(1), inner: edge(-1), rocks, weed, gates: line.filter((_, i) => i % STEP === STEP / 2) };
  // Máscara por donde puede ir el centro de un barco: el canal y las rocas, con medio casco (R) de margen.
  const gw = W * GRID, gh = H * GRID, mask = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    const x = (gx + 0.5) / GRID, y = (gy + 0.5) / GRID;
    let d = Infinity;
    for (let i = 0; i < N; i += 2) d = Math.min(d, (line[i].x - x) ** 2 + (line[i].y - y) ** 2);
    mask[gy * gw + gx] = d < (LANE / 2 - R) ** 2 && !rocks.some((r) => (r.x - x) ** 2 + (r.y - y) ** 2 < (r.r + 1.2) ** 2) ? 1 : 0;
  }
  track.inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[Math.floor(y * GRID) * gw + Math.floor(x * GRID)] === 1;
  return track;
}

export function newRace(kind = 'papel', key = 'normal', rng = Math.random, type) {
  const diff = DIFFS[key] || DIFFS.normal, track = makeTrack(diff, rng, type);
  const kinds = kind === 'koi' ? ['koi', 'koi', 'koi', 'koi'] : [kind, ...BOATS_RACE.filter((k) => k !== kind)];
  // Los rivales van a la par del barco que llevas, a medias: uno mejor ayuda, pero no gana solo.
  const top = diff.pace * (kind === 'koi' ? BOATS.koi.top * 1.1 : 13.5 + (BOATS[kind].top - 13.5) * 0.5), p0 = track.line[0];
  const h = Math.atan2(p0.ty, p0.tx);
  const racers = kinds.map((k, i) => {
    const back = 3 + Math.floor(i / 2) * 5, side = (i % 2 ? 1 : -1) * LANE * 0.2;
    return { ...newBoat(k, p0.x - p0.tx * back - p0.ty * side, p0.y - p0.ty * back + p0.tx * side, h), next: 0, lap: 0, done: null, boost: 0, cd: 2, fish: !!BOATS[k].fish, seed: rng() * 99,
      scale: i ? (top / BOATS[k].top) * (0.95 + rng() * 0.1) : 1 };
  });
  return { diff, rng, track, racers, t: -COUNT, events: [], over: null, place: null };
}

// Hacia dónde iría un piloto: a la boya que toca, mirando la siguiente, y apartándose de la roca que tenga delante.
export function aim(s, r) {
  const g = s.track.gates, a = g[r.next % g.length], b = g[(r.next + 1) % g.length], d = Math.hypot(a.x - r.x, a.y - r.y), k = Math.max(0, 1 - d / 14) * 0.5;
  let ang = Math.atan2(a.y + (b.y - a.y) * k - r.y, a.x + (b.x - a.x) * k - r.x);
  for (const q of s.track.rocks) {
    const dx = q.x - r.x, dy = q.y - r.y, dist = Math.hypot(dx, dy);
    if (dist > 14) continue;
    const off = wrap(Math.atan2(dy, dx) - ang), lat = Math.sin(off) * dist;
    if (Math.cos(off) > 0 && Math.abs(lat) < q.r + 2.8) ang -= Math.sign(lat || 1) * (1 - dist / 14) * 1.1;
  }
  return ang;
}
const bot = (s, r) => ({ aim: aim(s, r) + Math.sin(s.t * 1.3 + r.seed) * s.diff.wobble * 0.5, mag: 1 });
const slowed = (s, r) => (s.track.weed.some((w) => Math.hypot(w.x - r.x, w.y - r.y) < w.r) ? 0.55 : 1);

// Encender el nitro del corredor `i` (0: el jugador) si está cargado.
export function nitro(s, i = 0) {
  const r = s.racers[i];
  if (s.t < 0 || s.over || r.done || r.cd > 0) return false;
  r.boost = NITRO.time; r.cd = NITRO.cooldown;
  s.events.push({ kind: 'nitro', who: i, x: r.x, y: r.y });
  return true;
}

// input: el mando del jugador (como en el jardín) o null.
export function step(s, dt, input) {
  s.events = [];
  if (s.over) return s;
  const prev = s.t, g = s.track.gates;
  s.t += dt;
  if (prev < 0) { if (Math.ceil(prev) !== Math.ceil(s.t)) s.events.push({ kind: s.t >= 0 ? 'go' : 'count', n: -Math.floor(s.t) }); return s; }
  s.racers.forEach((r, i) => {
    if (r.done) { r.vx *= 0.96; r.vy *= 0.96; if (s.track.inside(r.x + r.vx * dt, r.y + r.vy * dt)) { r.x += r.vx * dt; r.y += r.vy * dt; } return; }
    r.cd = Math.max(0, r.cd - dt); r.boost = Math.max(0, r.boost - dt);
    // Los rivales lo usan para remontar (por detrás del jugador); en difícil, en cuanto se carga.
    if (i && !r.cd && (s.diff.nitro || behind(s, r))) nitro(s, i);
    const w = slowed(s, r) * (r.boost ? NITRO.boost : 1);
    const hit = drive(r, i ? bot(s, r) : input, dt, s.track.inside, r.scale * w);
    if (hit > 4 && !i) s.events.push({ kind: 'shore', x: r.x, y: r.y });
    if (slowed(s, r) < 1 && !i && !r.weed) s.events.push({ kind: 'weed', x: r.x, y: r.y });
    r.weed = slowed(s, r) < 1;
    const q = g[r.next % g.length];
    if (Math.hypot(q.x - r.x, q.y - r.y) < GATE) {
      r.next++;
      if (r.next % g.length === 0) { r.lap++; if (!i) s.events.push({ kind: 'lap', lap: r.lap }); }
      if (r.lap >= LAPS) { r.done = s.t; s.events.push({ kind: 'finish', who: i }); }
    }
  });
  // Choques entre corredores; si el empujón saca a uno del agua, vuelve a donde estaba.
  const before = s.racers.map((r) => [r.x, r.y]);
  for (let a = 0; a < s.racers.length; a++) for (let b = a + 1; b < s.racers.length; b++) {
    const p = bump(s.racers[a], s.racers[b], R * 2, 0.3);
    if (p > 3) s.events.push({ kind: 'bump', x: (s.racers[a].x + s.racers[b].x) / 2, y: (s.racers[a].y + s.racers[b].y) / 2, power: p });
  }
  s.racers.forEach((r, i) => {
    if (!s.track.inside(r.x, r.y)) [r.x, r.y] = before[i];
    // Un rival que se queda atascado reaparece en la última boya, mirando a la siguiente.
    r.stuck = !i || r.done || Math.hypot(r.vx, r.vy) > 2 ? 0 : (r.stuck || 0) + dt;
    if (r.stuck > 1.5) {
      const a = g[(r.next + g.length - 1) % g.length], b = g[r.next % g.length];
      Object.assign(r, { x: a.x, y: a.y, h: Math.atan2(b.y - a.y, b.x - a.x), v: 0, vx: 0, vy: 0, stuck: 0 });
    }
  });
  const me = s.racers[0];
  if (me.done || s.t > LIMIT) {
    s.place = me.done ? s.racers.filter((r) => r.done && r.done <= me.done).length : s.racers.length;
    s.over = s.place === 1 ? 'win' : 'lose';
  }
  return s;
}
const progress = (s, r) => { const g = s.track.gates; return r.next * 1000 - Math.hypot(g[r.next % g.length].x - r.x, g[r.next % g.length].y - r.y) + (r.done ? 1e6 - r.done : 0); };
const behind = (s, r) => progress(s, r) < progress(s, s.racers[0]);
// Puesto ahora: por boyas pasadas y, a igualdad, por cercanía a la que toca.
export const standing = (s) => {
  return 1 + s.racers.slice(1).filter((r) => progress(s, r) > progress(s, s.racers[0])).length;
};
