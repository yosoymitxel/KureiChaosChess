// Carrera de barquitos y koi en tiempo real por un canal cerrado que sale al azar (óvalo, riñón, trébol,
// gota u ola), con rocas que cortan el paso y algas que frenan. Cada corredor se maneja con drive() de
// boats.js; los rivales siguen las boyas y esquivan las rocas con el pulso que da la dificultad. Sin DOM.
import { drive, newBoat, wrap } from './boats.js';
import { bump } from './physics.js';
import { BOATS } from '../data/garden.js';
import { localize } from '../i18n/index.js';

export const W = 72, H = 120, LAPS = 2, COUNT = 3, LIMIT = 240;
const N = 180, LANE = 15, R = 2.2, GATE = LANE / 2 + 1.5, STEP = 10, GRID = 2; // GRID: celdas por unidad de la máscara
// Formas del canal: armónicos que deforman una elipse (k: cuántas ondas; a: cuánto).
export const TRACKS = localize('boatTracks', {
  ovalo: { name: 'Óvalo', h: [] },
  rinon: { name: 'Riñón', h: [[2, 0.2]] },
  trebol: { name: 'Trébol', h: [[3, 0.15]] },
  gota: { name: 'Gota', h: [[1, 0.16], [2, 0.1]] },
  ola: { name: 'Ola', h: [[4, 0.07], [2, 0.1]] },
});
export const DIFFS = {
  facil: { name: 'Fácil', pace: 0.72, wobble: 0.5, rocks: 4, weed: 2 },
  normal: { name: 'Normal', pace: 0.76, wobble: 0.3, rocks: 6, weed: 3, nitro: true },
  dificil: { name: 'Difícil', pace: 0.78, wobble: 0.15, rocks: 8, weed: 4, nitro: true },
};
const RIVALS = ['papel', 'velero', 'koi'];
// Nitro: un empujón corto para remontar y luego hay que esperar a que se recargue.
export const NITRO = { time: 1.6, boost: 1.45, cooldown: 9 };

// Radio de la curva más cerrada (por tres puntos seguidos).
function minRadius(line) {
  let min = Infinity;
  for (let i = 0; i < N; i++) {
    const a = line[(i + N - 3) % N], b = line[i], c = line[(i + 3) % N];
    const ab = Math.hypot(b.x - a.x, b.y - a.y), bc = Math.hypot(c.x - b.x, c.y - b.y), ca = Math.hypot(a.x - c.x, a.y - c.y);
    const area = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
    if (area > 1e-6) min = Math.min(min, (ab * bc * ca) / (4 * area));
  }
  return min;
}

export function makeTrack(diff, rng = Math.random, type) {
  type ||= Object.keys(TRACKS)[Math.floor(rng() * Object.keys(TRACKS).length)];
  const h0 = TRACKS[type].h.map(([k, a]) => [k, a * (0.8 + rng() * 0.4), rng() * Math.PI * 2]);
  const rx = W / 2 - LANE / 2 - 3, ry = H / 2 - LANE / 2 - 3;
  // Línea central, de abajo y en el sentido de las agujas del reloj. Si alguna curva queda más cerrada
  // que el canal (la orilla de dentro haría pico y los barcos la pisarían), se suavizan las ondas.
  let line;
  for (let soft = 1; soft > 0.05; soft *= 0.8) {
    const h = h0.map(([k, a, p]) => [k, a * soft, p]), f = (t) => 1 + h.reduce((q, [k, a, p]) => q + a * Math.cos(k * t + p), 0);
    let max = 0;
    for (let i = 0; i < N; i++) max = Math.max(max, f((i / N) * Math.PI * 2));
    line = Array.from({ length: N }, (_, i) => { const t = Math.PI / 2 + (i / N) * Math.PI * 2, k = f(t) / max; return { x: W / 2 + Math.cos(t) * rx * k, y: H / 2 + Math.sin(t) * ry * k }; });
    if (minRadius(line) > LANE / 2 + 4) break;
  }
  line.forEach((p, i) => { const a = line[(i + N - 1) % N], b = line[(i + 1) % N], d = Math.hypot(b.x - a.x, b.y - a.y); p.tx = (b.x - a.x) / d; p.ty = (b.y - a.y) / d; });
  const edge = (side) => line.map((p) => ({ x: p.x - p.ty * side * LANE / 2, y: p.y + p.tx * side * LANE / 2 }));
  // Rocas a un lado del canal (nunca en la salida) y algas en el medio.
  const at = (i, off) => { const p = line[i % N]; return { x: p.x - p.ty * off, y: p.y + p.tx * off }; };
  const spots = Array.from({ length: diff.rocks + diff.weed }, (_, k) => Math.floor(((k + 1) / (diff.rocks + diff.weed + 1)) * N));
  const rocks = spots.slice(0, diff.rocks).map((i, k) => ({ ...at(i + Math.floor(rng() * 6), (k % 2 ? 1 : -1) * LANE * (0.27 + rng() * 0.08)), r: 1.8 + rng() * 0.8 }));
  const weed = spots.slice(diff.rocks).map((i) => ({ ...at(i, (rng() - 0.5) * LANE * 0.3), r: 3.5 + rng() * 1.5 }));
  const track = { type, line, outer: edge(1), inner: edge(-1), rocks, weed, gates: line.filter((_, i) => i % STEP === STEP / 2) };
  // Máscara del agua: dentro del canal y fuera de las rocas.
  const gw = W * GRID, gh = H * GRID, mask = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    const x = (gx + 0.5) / GRID, y = (gy + 0.5) / GRID;
    let d = Infinity;
    for (let i = 0; i < N; i += 2) d = Math.min(d, (line[i].x - x) ** 2 + (line[i].y - y) ** 2);
    mask[gy * gw + gx] = d < (LANE / 2) ** 2 && !rocks.some((r) => (r.x - x) ** 2 + (r.y - y) ** 2 < r.r ** 2) ? 1 : 0;
  }
  track.inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[Math.floor(y * GRID) * gw + Math.floor(x * GRID)] === 1;
  return track;
}

export function newRace(kind = 'papel', key = 'normal', rng = Math.random, type) {
  const diff = DIFFS[key] || DIFFS.normal, track = makeTrack(diff, rng, type);
  const kinds = [kind, ...RIVALS.map((k) => (k === kind ? 'balsa' : k))];
  // Los rivales van a la par del barco que llevas, a medias: uno mejor ayuda, pero no gana solo.
  const top = diff.pace * (9 + (BOATS[kind].top - 9) * 0.5), p0 = track.line[0];
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
  for (let a = 0; a < s.racers.length; a++) for (let b = a + 1; b < s.racers.length; b++) {
    const p = bump(s.racers[a], s.racers[b], R * 2, 0.5);
    if (p > 3) s.events.push({ kind: 'bump', x: (s.racers[a].x + s.racers[b].x) / 2, y: (s.racers[a].y + s.racers[b].y) / 2, power: p });
  }
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
