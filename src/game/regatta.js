// Regata de barquitos: el campo del golf hecho estanque (algas que frenan, corriente que resbala,
// remolinos que devuelven el barco y piezas como rocas) contra un rival que sopla por turnos.
// Gana el primero que llega a la boya. Misma física y validador que el golf: cada estanque tiene par.
import { substeps, bump } from './physics.js';
import { makeHole, plan, roll, DIFFS as COURSES, SHOT_MAX, BALL_R, W, H } from './golf.js';

export { W, H, SHOT_MAX };
export const MAX_TURNS = 10;
const BOAT_E = 0.8, THINK = 0.7; // rebote entre barcos; lo que tarda el rival en soplar (s)
// err: pulso del rival (radianes de desvío y el doble en fuerza relativa).
export const DIFFS = {
  facil: { name: 'Fácil', course: 'facil', err: 0.18 },
  normal: { name: 'Normal', course: 'normal', err: 0.12 },
  dificil: { name: 'Difícil', course: 'dificil', err: 0.02 },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function newRegatta(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal, course = makeHole(COURSES[diff.course], rng);
  const at = (dx) => ({ x: course.tee.x + dx, y: course.tee.y, vx: 0, vy: 0 });
  const boats = [at(-4), at(4)];
  return { diff, rng, course, boats, last: boats.map((b) => ({ x: b.x, y: b.y })), turn: 0, turns: 0, t: 0, moving: false, wait: 0, events: [], next: null, over: null };
}

const launch = (s, i, ang, pow) => {
  const b = s.boats[i];
  pow = clamp(pow, 0.05, 1);
  b.vx = Math.cos(ang) * SHOT_MAX * pow;
  b.vy = Math.sin(ang) * SHOT_MAX * pow;
  s.moving = true;
  (s.next ||= []).push({ kind: 'shot', who: i, power: pow, x: b.x, y: b.y });
};

// Soplo del jugador: ang en radianes (0 = derecha, y crece hacia abajo); pow de 0 a 1.
export function shoot(s, ang, pow) {
  if (s.over || s.moving || s.wait > 0 || s.turn !== 0) return false;
  s.turns += 1;
  launch(s, 0, ang, pow);
  return true;
}

export function step(s, dt) {
  s.events = s.next || [];
  s.next = null;
  if (!s.over) substeps(dt, (h) => sub(s, h), () => !s.over);
  return s;
}

function sub(s, dt) {
  s.t += dt;
  if (s.wait > 0) {
    s.wait -= dt;
    if (s.wait <= 0) {
      s.wait = 0;
      const p = plan(s.course, s.boats[1], s.t), e = s.diff.err;
      launch(s, 1, p.ang + (s.rng() * 2 - 1) * e, p.pow * (1 + (s.rng() * 2 - 1) * e * 2));
    }
    return;
  }
  const hit = bump(s.boats[0], s.boats[1], BALL_R * 2, BOAT_E);
  if (hit > 25) s.events.push({ kind: 'bump', power: hit, x: (s.boats[0].x + s.boats[1].x) / 2, y: (s.boats[0].y + s.boats[1].y) / 2 });
  s.boats.forEach((b, i) => {
    if (s.over) return;
    const r = roll(s.course, b, s.t, dt, s.events);
    if (r === 'sink') {
      b.vx = b.vy = 0;
      s.over = i === 0 ? 'win' : 'lose';
      s.events.push({ kind: 'sink', who: i, x: s.course.cup.x, y: s.course.cup.y });
    } else if (r === 'fall') {
      s.events.push({ kind: 'fall', who: i, x: b.x, y: b.y });
      Object.assign(b, s.last[i], { vx: 0, vy: 0 });
    } else if (r === 'rest') s.last[i] = { x: b.x, y: b.y };
  });
  if (s.over || !s.moving || s.boats.some((b) => b.vx || b.vy)) return;
  s.moving = false;
  if (s.turn === 1) { s.turn = 0; s.events.push({ kind: 'turn', who: 0 }); return; }
  if (s.turns >= MAX_TURNS) { s.over = 'lose'; return; }
  s.turn = 1;
  s.wait = THINK;
  s.events.push({ kind: 'turn', who: 1 });
}
