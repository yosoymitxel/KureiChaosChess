// Billar redondo: carrom en una mesa circular. Cada bando tira con el lanzador desde su arco y mete
// sus fichas en los cuatro agujeros; la dama vale por una ficha de quien la mete. Física pura, sin DOM,
// con la de mesa compartida (src/game/physics.js).
import { DT, substeps, slide, bump, rim } from './physics.js';

export const R = 80, W = 2 * R, H = 2 * R; // unidades de mesa; centro en (R, R)
export const DISC_R = 5.6, STRIKER_R = 7.4, POCKET_R = 10.5;
export const POCKETS = [45, 135, 225, 315].map((a) => ({ x: R + Math.cos((a * Math.PI) / 180) * (R - 10), y: R + Math.sin((a * Math.PI) / 180) * (R - 10) }));
export const ARC_R = R * 0.66, ARCS = { me: [58, 122], bot: [238, 302] }; // grados; y crece hacia abajo
export const SHOT_MAX = 380, PULL_MAX = 60, PER_SIDE = 4, MAX_TURNS = 60;
const DECEL = 85, E_DISC = 0.9, E_RIM = 0.72, M_STRIKER = 1.6;

// La máquina: cuántas posiciones del arco prueba, error de dirección (rad) y de fuerza, y si mira la dama.
export const DIFFS = {
  facil: { name: 'Fácil', spots: 1, err: 0.11, powErr: 0.25, queen: false },
  normal: { name: 'Normal', spots: 3, err: 0.055, powErr: 0.12, queen: true },
  dificil: { name: 'Difícil', spots: 5, err: 0.025, powErr: 0.06, queen: true },
};

const other = (side) => (side === 'me' ? 'bot' : 'me');
export const arcPoint = (side, u) => {
  const [a0, a1] = ARCS[side], a = ((a0 + (a1 - a0) * u) * Math.PI) / 180;
  return { x: R + Math.cos(a) * ARC_R, y: R + Math.sin(a) * ARC_R };
};

export function newCarrom(key = 'normal', rng = Math.random, { duo = false } = {}) {
  const diff = DIFFS[key] || DIFFS.normal;
  // Corona de ocho fichas alternas alrededor de la dama, girada al azar.
  const discs = [{ id: 0, side: 'queen', x: R, y: R, vx: 0, vy: 0, in: false }], rot = rng() * Math.PI * 2;
  for (let i = 0; i < 2 * PER_SIDE; i++) {
    const a = rot + (i / (2 * PER_SIDE)) * Math.PI * 2, d = DISC_R / Math.sin(Math.PI / (2 * PER_SIDE)) + 0.6;
    discs.push({ id: i + 1, side: i % 2 ? 'bot' : 'me', x: R + Math.cos(a) * d, y: R + Math.sin(a) * d, vx: 0, vy: 0, in: false });
  }
  const s = { diff, rng, duo, discs, striker: { x: 0, y: 0, vx: 0, vy: 0, in: false }, turn: 'me', phase: 'aim', u: 0.5, got: { me: 0, bot: 0 }, shot: null, turns: 0, wait: 0, botT: 0, t: 0, events: [], next: null, over: null };
  place(s, 0.5);
  return s;
}

// Coloca el lanzador en su arco (u de 0 a 1); si pisa una ficha, busca el hueco libre más cercano.
export function place(s, u) {
  if (s.phase !== 'aim' || s.over) return false;
  const free = (v) => { const p = arcPoint(s.turn, v); return s.discs.every((d) => d.in || Math.hypot(d.x - p.x, d.y - p.y) > DISC_R + STRIKER_R + 0.5) && p; };
  for (let k = 0; k <= 40; k++) for (const v of [u + k / 80, u - k / 80]) {
    if (v < 0 || v > 1) continue;
    const p = free(v);
    if (p) { s.u = v; Object.assign(s.striker, p, { vx: 0, vy: 0, in: false }); return true; }
  }
  return false;
}

// ang en radianes (0 = derecha, y hacia abajo); pow de 0 a 1. `side` permite tirar a la máquina o al segundo jugador.
export function shoot(s, ang, pow, side = 'me') {
  if (s.over || s.phase !== 'aim' || s.turn !== side) return false;
  pow = Math.max(0.05, Math.min(1, pow));
  s.striker.vx = Math.cos(ang) * SHOT_MAX * pow;
  s.striker.vy = Math.sin(ang) * SHOT_MAX * pow;
  s.phase = 'roll';
  s.shot = { mine: 0, foul: false };
  (s.next ||= []).push({ kind: 'shot', power: pow, x: s.striker.x, y: s.striker.y, side });
  return true;
}

// Un subpaso de física para todos: rozamiento, choques, banda y agujeros. Devuelve si algo se mueve.
function physics(discs, st, dt, ev, onPocket) {
  const live = discs.filter((d) => !d.in);
  let moving = false;
  for (const b of [st, ...live]) if (!b.in && slide(b, DECEL, dt)) moving = true;
  for (let i = 0; i < live.length; i++) {
    if (!st.in) { const f = bump(st, live[i], STRIKER_R + DISC_R, E_DISC, M_STRIKER, 1); if (f > 15) ev?.push({ kind: 'hit', power: f, x: (st.x + live[i].x) / 2, y: (st.y + live[i].y) / 2 }); }
    for (let j = i + 1; j < live.length; j++) { const f = bump(live[i], live[j], 2 * DISC_R, E_DISC); if (f > 20) ev?.push({ kind: 'clack', power: f, x: (live[i].x + live[j].x) / 2, y: (live[i].y + live[j].y) / 2 }); }
  }
  for (const b of [st, ...live]) {
    if (b.in) continue;
    const f = rim(b, b === st ? STRIKER_R : DISC_R, R, R, R, E_RIM);
    if (f > 30) ev?.push({ kind: 'rim', power: f, x: b.x, y: b.y });
    const p = POCKETS.find((q) => Math.hypot(b.x - q.x, b.y - q.y) < POCKET_R * 0.75);
    if (p) { Object.assign(b, { in: true, vx: 0, vy: 0, x: p.x, y: p.y }); onPocket(b, p); }
  }
  return moving;
}

const clone = (s) => ({ discs: s.discs.map((d) => ({ ...d })), striker: { ...s.striker } });

// Tiro simulado hasta que todo para: qué entró y si fue falta (para la máquina y las pruebas).
export function simulate(s, u, ang, pow, side = s.turn) {
  const c = clone(s), [a0, a1] = ARCS[side], a = ((a0 + (a1 - a0) * u) * Math.PI) / 180;
  Object.assign(c.striker, { x: R + Math.cos(a) * ARC_R, y: R + Math.sin(a) * ARC_R, vx: Math.cos(ang) * SHOT_MAX * pow, vy: Math.sin(ang) * SHOT_MAX * pow, in: false });
  const got = { me: 0, bot: 0, queen: 0, foul: false };
  for (let i = 0; i < 240 * 8; i++) if (!physics(c.discs, c.striker, DT, null, (b) => { if (b === c.striker) got.foul = true; else if (b.side === 'queen') got.queen++; else got[b.side]++; })) break;
  return got;
}

// Plan de la máquina: para cada hueco del arco, ficha propia (o dama) y agujero, apunta a la "bola
// fantasma" que la empuja hacia el agujero; simula y se queda con lo mejor. Luego tira con su error.
export function plan(s, side = s.turn, d = s.diff) {
  const spots = d.spots === 1 ? [0.5] : Array.from({ length: d.spots }, (_, i) => i / (d.spots - 1));
  const targets = s.discs.filter((x) => !x.in && (x.side === side || (d.queen && x.side === 'queen')));
  let best = null;
  const rate = (g) => (g[side] + (d.queen ? 1.2 : 1) * g.queen) * 10 - g[other(side)] * 10 - (g.foul ? 15 : 0);
  for (const u of spots) {
    const st = arcPoint(side, u);
    if (s.discs.some((x) => !x.in && Math.hypot(x.x - st.x, x.y - st.y) < DISC_R + STRIKER_R + 0.5)) continue;
    for (const t of targets) for (const p of POCKETS) {
      const px = p.x - t.x, py = p.y - t.y, pd = Math.hypot(px, py);
      const gx = t.x - (px / pd) * (DISC_R + STRIKER_R), gy = t.y - (py / pd) * (DISC_R + STRIKER_R);
      const ax = gx - st.x, ay = gy - st.y, ad = Math.hypot(ax, ay);
      if ((ax * px + ay * py) / (ad * pd) < 0.35) continue; // corte imposible
      for (const pow of [0.45, 0.7, 0.95]) {
        const ang = Math.atan2(ay, ax), v = rate(simulate(s, u, ang, pow, side));
        if (!best || v > best.v) best = { u, ang, pow, v };
      }
    }
  }
  // Sin tiro limpio: un golpe medio hacia el centro, que al menos remueve.
  return best || { u: 0.5, ang: Math.atan2(R - arcPoint(side, 0.5).y, R - arcPoint(side, 0.5).x), pow: 0.6, v: -1 };
}

function botShot(s) {
  const d = s.diff, p = plan(s, 'bot'), rng = s.rng;
  place(s, p.u);
  shoot(s, p.ang + (rng() * 2 - 1) * d.err, p.pow * (1 + (rng() * 2 - 1) * d.powErr), 'bot');
}

export function step(s, dt) {
  s.events = s.next || [];
  s.next = null;
  if (!s.over) substeps(dt, (h) => sub(s, h), () => !s.over);
  return s;
}

function sub(s, dt) {
  s.t += dt;
  if (s.phase === 'wait') { s.wait -= dt; if (s.wait <= 0) { s.phase = 'aim'; s.botT = 0.7; place(s, 0.5); s.events.push({ kind: 'turn', side: s.turn }); } return; }
  if (s.phase === 'aim') { if (s.turn === 'bot' && !s.duo && (s.botT -= dt) <= 0) botShot(s); return; }
  const moving = physics(s.discs, s.striker, dt, s.events, (b, p) => {
    if (b === s.striker) { s.shot.foul = true; s.events.push({ kind: 'foul', x: p.x, y: p.y }); return; }
    const owner = b.side === 'queen' ? s.turn : b.side;
    s.got[owner] += 1;
    if (owner === s.turn) s.shot.mine += 1;
    s.events.push({ kind: 'pocket', side: b.side, owner, x: p.x, y: p.y, id: b.id });
  });
  if (!moving) resolve(s);
}

function resolve(s) {
  const side = s.turn, sh = s.shot;
  if (sh.foul && s.got[side] > 0) {
    // Falta: una de tus fichas metidas vuelve al centro.
    const back = s.discs.find((d) => d.in && d.side === side) || s.discs.find((d) => d.in && d.side === 'queen');
    if (back) {
      s.got[side] -= 1;
      let a = 0, x = R, y = R;
      while (s.discs.some((d) => !d.in && Math.hypot(d.x - x, d.y - y) < 2 * DISC_R + 0.5)) { a += 0.9; x = R + Math.cos(a) * a * 1.6; y = R + Math.sin(a) * a * 1.6; }
      Object.assign(back, { in: false, x, y, vx: 0, vy: 0 });
      s.events.push({ kind: 'back', id: back.id, x, y });
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
  s.striker.in = false;
}
