// Bolos: pista con canaletas y diez piezas de pie (alfiles, guardias y consejeros) en triángulo. Tú y el
// bot os turnáis por entradas de dos tiros; cuenta lo derribado. Física de mesa compartida (physics.js).
import { substeps, slide, bump } from './physics.js';

export const W = 96, H = 160, GUTTER = 9, BALL_R = 6, PIN_R = 4.2, LINE = H - 18;
export const SHOT_MAX = 300, PULL_MAX = 60, FRAMES = 3, PIN_TYPES = ['bishop', 'guard', 'advisor'];
const DECEL = 22, PIN_DECEL = 200, E = 0.6, M_BALL = 2.2, DOWN = 6, WOBBLE = 0.015;

// Error de dirección del bot (rad), de fuerza y de colocación (u).
export const DIFFS = {
  facil: { name: 'Fácil', err: 0.07, powErr: 0.2, slide: 8 },
  normal: { name: 'Normal', err: 0.04, powErr: 0.1, slide: 4 },
  dificil: { name: 'Difícil', err: 0.02, powErr: 0.05, slide: 2 },
};

// Triángulo con la punta hacia el jugador.
const RACK = [];
for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) RACK.push({ x: W / 2 + (i - row / 2) * 13, y: 46 - row * 11 });

export function newTenpin(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  const s = { diff, rng, types: RACK.map(() => PIN_TYPES[Math.floor(rng() * PIN_TYPES.length)]), pins: [], ball: null, turn: 'me', roll: 0, frame: 0, frames: FRAMES,
    score: { me: [], bot: [] }, phase: 'aim', x: W / 2, wait: 0, botT: 0, t: 0, events: [], next: null, over: null };
  rack(s);
  return s;
}

function rack(s) {
  s.pins = RACK.map((p, id) => { const x = p.x + (s.rng() - 0.5) * 1.6, y = p.y + (s.rng() - 0.5) * 1.6; return { id, type: s.types[id], x, y, x0: x, y0: y, vx: 0, vy: 0, down: false, gone: false }; });
  s.roll = 0;
  (s.next ||= []).push({ kind: 'rack' });
}

// Sitúa la bola en la línea de tiro (entre las canaletas).
export function place(s, x) {
  if (s.phase !== 'aim') return false;
  s.x = Math.max(GUTTER + BALL_R, Math.min(W - GUTTER - BALL_R, x));
  return true;
}

export function shoot(s, ang, pow, side = 'me') {
  if (s.over || s.phase !== 'aim' || s.turn !== side) return false;
  pow = Math.max(0.15, Math.min(1, pow));
  ang += (s.rng() * 2 - 1) * WOBBLE; // la mano nunca tira dos veces igual
  s.ball = { x: s.x, y: LINE, vx: Math.cos(ang) * SHOT_MAX * pow, vy: Math.sin(ang) * SHOT_MAX * pow, gutter: false };
  s.phase = 'roll';
  (s.next ||= []).push({ kind: 'shot', power: pow, side });
  return true;
}

// Un subpaso: la bola rueda (en la canaleta ya no toca nada) y las piezas chocan entre sí.
function physics(s, dt, ev) {
  const b = s.ball, live = s.pins.filter((p) => !p.gone);
  let moving = false;
  if (b && b.y > -BALL_R) {
    moving = slide(b, DECEL, dt) > 1;
    if (!b.gutter && (b.x < GUTTER || b.x > W - GUTTER)) { b.gutter = true; b.vx = 0; b.x = b.x < GUTTER ? GUTTER / 2 : W - GUTTER / 2; ev?.push({ kind: 'gutter', x: b.x, y: b.y }); }
    if (!b.gutter) for (const p of live) { const f = bump(b, p, BALL_R + PIN_R, E, M_BALL, 1); if (f > 10) ev?.push({ kind: 'hit', power: f, x: p.x, y: p.y }); }
  }
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) { const f = bump(live[i], live[j], 2 * PIN_R, E); if (f > 10) ev?.push({ kind: 'clack', power: f, x: live[i].x, y: live[i].y }); }
  for (const p of live) {
    if (slide(p, PIN_DECEL, dt) > 0.5) moving = true;
    if (!p.down && Math.hypot(p.x - p.x0, p.y - p.y0) > DOWN) { p.down = true; ev?.push({ kind: 'down', id: p.id, vx: p.vx, vy: p.vy }); }
    if (p.x < GUTTER || p.x > W - GUTTER || p.y < 0) { p.gone = true; p.down = true; }
  }
  return moving;
}

// Desde el centro, al centro de las que quedan en pie (con todas, a la punta de lleno).
export function plan(s) {
  const up = s.pins.filter((p) => !p.down);
  if (!up.length) return { x: W / 2, ang: -Math.PI / 2, pow: 0.9 };
  const x = W / 2, tx = up.reduce((a, p) => a + p.x, 0) / up.length, ty = Math.max(...up.map((p) => p.y));
  return { x, ang: Math.atan2(ty - LINE, tx - x), pow: 0.9 };
}

function botShot(s) {
  const d = s.diff, p = plan(s), r = () => s.rng() * 2 - 1;
  place(s, p.x + r() * d.slide);
  shoot(s, p.ang + r() * d.err, p.pow * (1 + r() * d.powErr), 'bot');
}

export const total = (s, side) => s.score[side].reduce((a, f) => a + f.reduce((x, y) => x + y, 0), 0);

export function step(s, dt) {
  s.events = s.next || [];
  s.next = null;
  if (!s.over) substeps(dt, (h) => sub(s, h), () => !s.over);
  return s;
}

function sub(s, dt) {
  s.t += dt;
  if (s.phase === 'wait') { if ((s.wait -= dt) <= 0) { s.phase = 'aim'; s.x = W / 2; s.botT = 0.9; s.events.push({ kind: 'turn', side: s.turn, roll: s.roll }); } return; }
  if (s.phase === 'aim') { if (s.turn === 'bot' && (s.botT -= dt) <= 0) botShot(s); return; }
  if (!physics(s, dt, s.events)) resolve(s);
}

function resolve(s) {
  const side = s.turn, frame = (s.score[side][s.frame] ||= []);
  const before = frame.reduce((a, b) => a + b, 0), downed = s.pins.filter((p) => p.down).length - before;
  frame.push(downed);
  s.ball = null;
  const all = s.pins.every((p) => p.down);
  s.events.push({ kind: 'result', side, n: downed, strike: all && s.roll === 0, spare: all && s.roll === 1 });
  for (const p of s.pins) if (p.down) p.gone = true;
  if (s.roll === 0 && !all) s.roll = 1;
  else {
    rack(s);
    if (side === 'bot') s.frame += 1;
    s.turn = side === 'me' ? 'bot' : 'me';
    if (s.frame >= s.frames) {
      const me = total(s, 'me'), bot = total(s, 'bot');
      if (me !== bot || s.frames > FRAMES + 3) { s.over = me > bot ? 'win' : 'lose'; return; }
      s.frames += 1; // empate: otra entrada
    }
  }
  s.phase = 'wait';
  s.wait = 0.9;
}
