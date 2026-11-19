// Carrera de barquitos y koi alrededor de una isla, en tiempo real. Cada corredor se maneja con
// drive() de boats.js; los rivales siguen las boyas con un pulso que da la dificultad. Sin DOM.
import { drive, newBoat, wrap } from './boats.js';
import { bump } from './physics.js';
import { BOATS } from '../data/garden.js';

export const W = 64, H = 96, LAPS = 2, COUNT = 3, LIMIT = 150;
const CX = W / 2, CY = H / 2, OUT = [29.5, 45.5], ISLE = [12, 27], MID = [20.75, 36.25], R = 2.2, GATE = 8;
const BUOYS = 8;
// Agua: dentro de la orilla y fuera de la isla (elipses).
export const inside = (x, y) => ((x - CX) / OUT[0]) ** 2 + ((y - CY) / OUT[1]) ** 2 < 1 && ((x - CX) / ISLE[0]) ** 2 + ((y - CY) / ISLE[1]) ** 2 > 1;
export const ISLAND = { cx: CX, cy: CY, rx: ISLE[0], ry: ISLE[1] }, SHORE = { cx: CX, cy: CY, rx: OUT[0], ry: OUT[1] };
// Boyas en el medio del canal, en el sentido de las agujas del reloj desde la salida (abajo).
export const buoys = Array.from({ length: BUOYS }, (_, k) => { const a = Math.PI / 2 + ((k + 1) / BUOYS) * Math.PI * 2; return { x: CX + Math.cos(a) * MID[0], y: CY + Math.sin(a) * MID[1] }; });

// pace: velocidad de los rivales respecto a la suya; wobble: cuánto se tuercen.
export const DIFFS = {
  facil: { name: 'Fácil', pace: 0.85, wobble: 0.5 },
  normal: { name: 'Normal', pace: 0.92, wobble: 0.3 },
  dificil: { name: 'Difícil', pace: 0.94, wobble: 0.15 },
};
const RIVALS = ['papel', 'velero', 'koi'];

export function newRace(kind = 'papel', key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  const kinds = [kind, ...RIVALS.map((k) => (k === kind ? (k === 'koi' ? 'balsa' : 'koi') : k))];
  // Los rivales van a la par del barco que llevas, a medias: uno mejor ayuda, pero no gana solo.
  const top = diff.pace * (9 + (BOATS[kind].top - 9) * 0.5);
  const racers = kinds.map((k, i) => ({ ...newBoat(k, CX + 2, CY + ISLE[1] + 3.5 + i * 3.8, Math.PI), next: 0, lap: 0, done: null, fish: !!BOATS[k].fish, seed: rng() * 99,
    scale: i ? top / BOATS[k].top * (0.95 + rng() * 0.1) : 1 }));
  return { diff, rng, racers, t: -COUNT, events: [], over: null, place: null };
}

// Lo que haría un piloto que va a la boya que toca, mirando ya la siguiente.
export function aim(s, r) {
  const a = buoys[r.next % BUOYS], b = buoys[(r.next + 1) % BUOYS], d = Math.hypot(a.x - r.x, a.y - r.y), k = Math.max(0, 1 - d / 14) * 0.5;
  return Math.atan2(a.y + (b.y - a.y) * k - r.y, a.x + (b.x - a.x) * k - r.x);
}
const bot = (s, r, i) => ({ aim: aim(s, r) + Math.sin(s.t * 1.3 + r.seed) * s.diff.wobble * 0.5, mag: 1 });

// input: el mando del jugador (como en el jardín) o null.
export function step(s, dt, input) {
  s.events = [];
  if (s.over) return s;
  const prev = s.t;
  s.t += dt;
  if (prev < 0) { if (Math.ceil(prev) !== Math.ceil(s.t)) s.events.push({ kind: s.t >= 0 ? 'go' : 'count', n: -Math.floor(s.t) }); return s; }
  s.racers.forEach((r, i) => {
    if (r.done) { r.vx *= 0.96; r.vy *= 0.96; r.x += r.vx * dt; r.y += r.vy * dt; return; }
    const hit = drive(r, i ? bot(s, r, i) : input, dt, inside, r.scale);
    if (hit > 4 && !i) s.events.push({ kind: 'shore', x: r.x, y: r.y });
    const g = buoys[r.next % BUOYS];
    if (Math.hypot(g.x - r.x, g.y - r.y) < GATE) {
      r.next++;
      if (r.next % BUOYS === 0) { r.lap++; if (!i) s.events.push({ kind: 'lap', lap: r.lap }); }
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
// Puesto ahora: por vueltas y boyas pasadas, y a igualdad, por cercanía a la boya que toca.
export const standing = (s) => {
  const score = (r) => r.next * 1000 - Math.hypot(buoys[r.next % BUOYS].x - r.x, buoys[r.next % BUOYS].y - r.y) + (r.done ? 1e6 - r.done : 0);
  return 1 + s.racers.slice(1).filter((r) => score(r) > score(s.racers[0])).length;
};
