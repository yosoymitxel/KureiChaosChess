// Billar: mesa rectangular con seis troneras y una sola bola blanca que se queda donde para. Cada bando
// mete sus cuatro bolas antes que el otro; meter una tuya repite y meter la blanca es falta (una tuya
// vuelve a la mesa). Mismas reglas y máquina que el billar redondo (carrom.js), con bandas rectas.
import { DT, substeps, slide, bump, walls } from './physics.js';

export const W = 96, H = 160, BALL_R = 4.4, POCKET_R = 7;
export const POCKETS = [[6, 6], [W - 6, 6], [4, H / 2], [W - 4, H / 2], [6, H - 6], [W - 6, H - 6]].map(([x, y]) => ({ x, y }));
export const SPOT = { x: W / 2, y: H * 0.76 }, SHOT_MAX = 340, PULL_MAX = 60, PER_SIDE = 4, MAX_TURNS = 60;
const DECEL = 75, E_BALL = 0.93, E_WALL = 0.75;

export const DIFFS = {
  facil: { name: 'Fácil', err: 0.1, powErr: 0.25, cuts: 0.6 },
  normal: { name: 'Normal', err: 0.05, powErr: 0.12, cuts: 0.4 },
  dificil: { name: 'Difícil', err: 0.022, powErr: 0.06, cuts: 0.25 },
};

const other = (side) => (side === 'me' ? 'bot' : 'me');

export function newPool(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  // Triángulo de ocho bolas arriba, con los colores mezclados al azar en cada partida.
  const sides = ['me', 'me', 'me', 'me', 'bot', 'bot', 'bot', 'bot'].sort(() => rng() - 0.5), balls = [];
  const top = H * 0.3, gap = 2 * BALL_R + 0.3;
  for (let row = 0, k = 0; row < 4; row++) for (let i = 0; i <= row && k < 8; i++, k++) {
    balls.push({ id: k, side: sides[k], x: W / 2 + (i - row / 2) * gap, y: top - row * gap * 0.87, vx: 0, vy: 0, in: false });
  }
  return { diff, rng, balls, cue: { ...SPOT, vx: 0, vy: 0, in: false }, turn: 'me', phase: 'aim', got: { me: 0, bot: 0 }, shot: null, turns: 0, wait: 0, botT: 0, t: 0, events: [], next: null, over: null };
}

export function shoot(s, ang, pow, side = 'me') {
  if (s.over || s.phase !== 'aim' || s.turn !== side) return false;
  pow = Math.max(0.05, Math.min(1, pow));
  s.cue.vx = Math.cos(ang) * SHOT_MAX * pow;
  s.cue.vy = Math.sin(ang) * SHOT_MAX * pow;
  s.phase = 'roll';
  s.shot = { mine: 0, foul: false };
  (s.next ||= []).push({ kind: 'shot', power: pow, x: s.cue.x, y: s.cue.y, side });
  return true;
}

function physics(balls, cue, dt, ev, onPocket) {
  const live = balls.filter((b) => !b.in), all = cue.in ? live : [cue, ...live];
  let moving = false;
  for (const b of all) if (slide(b, DECEL, dt)) moving = true;
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const f = bump(all[i], all[j], 2 * BALL_R, E_BALL);
    if (f > 15) ev?.push({ kind: all[i] === cue ? 'hit' : 'clack', power: f, x: (all[i].x + all[j].x) / 2, y: (all[i].y + all[j].y) / 2 });
  }
  for (const b of all) {
    const p = POCKETS.find((q) => Math.hypot(b.x - q.x, b.y - q.y) < POCKET_R);
    if (p) { Object.assign(b, { in: true, vx: 0, vy: 0, x: p.x, y: p.y }); onPocket(b, p); continue; }
    walls(b, BALL_R, W, H, E_WALL, (f) => f > 40 && ev?.push({ kind: 'rim', power: f, x: b.x, y: b.y }));
  }
  return moving;
}

export function simulate(s, ang, pow) {
  const balls = s.balls.map((b) => ({ ...b })), cue = { ...s.cue, vx: Math.cos(ang) * SHOT_MAX * pow, vy: Math.sin(ang) * SHOT_MAX * pow };
  const got = { me: 0, bot: 0, foul: false };
  for (let i = 0; i < 240 * 8; i++) if (!physics(balls, cue, DT, null, (b) => { if (b === cue) got.foul = true; else got[b.side]++; })) break;
  return got;
}

// Bola fantasma: para cada bola propia y tronera, el punto donde la blanca debe tocarla; simula y elige.
export function plan(s, side = s.turn, d = s.diff) {
  const c = s.cue, rate = (g) => g[side] * 10 - g[other(side)] * 10 - (g.foul ? 15 : 0);
  let best = null;
  for (const t of s.balls) {
    if (t.in || t.side !== side) continue;
    for (const p of POCKETS) {
      const px = p.x - t.x, py = p.y - t.y, pd = Math.hypot(px, py);
      const gx = t.x - (px / pd) * 2 * BALL_R, gy = t.y - (py / pd) * 2 * BALL_R, ax = gx - c.x, ay = gy - c.y, ad = Math.hypot(ax, ay);
      if ((ax * px + ay * py) / (ad * pd) < d.cuts) continue;
      for (const pow of [0.4, 0.65, 0.9]) {
        const ang = Math.atan2(ay, ax), v = rate(simulate(s, ang, pow));
        if (!best || v > best.v) best = { ang, pow, v };
      }
    }
  }
  if (best) return best;
  const t = s.balls.find((b) => !b.in && b.side === side) || { x: W / 2, y: H / 3 };
  return { ang: Math.atan2(t.y - c.y, t.x - c.x), pow: 0.6, v: -1 };
}

export function step(s, dt) {
  s.events = s.next || [];
  s.next = null;
  if (!s.over) substeps(dt, (h) => sub(s, h), () => !s.over);
  return s;
}

function sub(s, dt) {
  s.t += dt;
  if (s.phase === 'wait') { s.wait -= dt; if (s.wait <= 0) { s.phase = 'aim'; s.botT = 0.8; s.events.push({ kind: 'turn', side: s.turn }); } return; }
  if (s.phase === 'aim') {
    if (s.turn === 'bot' && (s.botT -= dt) <= 0) { const d = s.diff, p = plan(s, 'bot'); shoot(s, p.ang + (s.rng() * 2 - 1) * d.err, p.pow * (1 + (s.rng() * 2 - 1) * d.powErr), 'bot'); }
    return;
  }
  const moving = physics(s.balls, s.cue, dt, s.events, (b, p) => {
    if (b === s.cue) { s.shot.foul = true; s.events.push({ kind: 'foul', x: p.x, y: p.y }); return; }
    s.got[b.side] += 1;
    if (b.side === s.turn) s.shot.mine += 1;
    s.events.push({ kind: 'pocket', side: b.side, x: p.x, y: p.y, id: b.id });
  });
  if (!moving) resolve(s);
}

// Primer hueco libre cerca de (x, y), en espiral.
function free(s, x, y) {
  let a = 0, px = x, py = y;
  while ([s.cue, ...s.balls].some((b) => !b.in && b !== s.cue && Math.hypot(b.x - px, b.y - py) < 2 * BALL_R + 0.5)) { a += 0.9; px = x + Math.cos(a) * a * 1.4; py = y + Math.sin(a) * a * 1.4; }
  return { x: px, y: py };
}

function resolve(s) {
  const side = s.turn, sh = s.shot;
  if (sh.foul) {
    Object.assign(s.cue, free(s, SPOT.x, SPOT.y), { in: false, vx: 0, vy: 0 });
    s.events.push({ kind: 'cue', x: s.cue.x, y: s.cue.y });
    const back = s.got[side] > 0 && s.balls.find((b) => b.in && b.side === side);
    if (back) {
      s.got[side] -= 1;
      Object.assign(back, free(s, W / 2, H * 0.3), { in: false, vx: 0, vy: 0 });
      s.events.push({ kind: 'back', id: back.id, x: back.x, y: back.y });
    }
  }
  s.turns += 1;
  if (s.got.me >= PER_SIDE || s.got.bot >= PER_SIDE) s.over = s.got.me >= PER_SIDE && (s.got.bot < PER_SIDE || side === 'me') ? 'win' : 'lose';
  else if (s.turns >= MAX_TURNS) s.over = s.got.me > s.got.bot ? 'win' : 'lose';
  if (s.over) return;
  if (sh.foul || !sh.mine) s.turn = other(side);
  else s.events.push({ kind: 'again', side });
  s.phase = 'wait';
  s.wait = 0.5;
}
