// Billares: el redondo (carrom: lanzador en tu arco, dama roja) y el de troneras (mesa rectangular, la
// blanca se queda donde para). Mismas reglas: mete tus cuatro antes que el otro; meter una tuya repite
// y meter el lanzador es falta (una tuya vuelve a la mesa). Física de mesa compartida (physics.js).
import { DT, substeps, slide, bump, rim, walls } from './physics.js';

export const R = 80, W = 2 * R, H = 2 * R; // mesa redonda; centro en (R, R)
export const DISC_R = 5.6, STRIKER_R = 7.4, POCKET_R = 10.5;
export const POCKETS = [45, 135, 225, 315].map((a) => ({ x: R + Math.cos((a * Math.PI) / 180) * (R - 10), y: R + Math.sin((a * Math.PI) / 180) * (R - 10) }));
export const ARC_R = R * 0.66, ARCS = { me: [58, 122], bot: [238, 302] }; // grados; y crece hacia abajo
export const PULL_MAX = 60, PER_SIDE = 4, MAX_TURNS = 60;

// La máquina: cuántas posiciones del arco prueba, error de dirección (rad) y de fuerza, si mira la dama
// y el corte más fino que intenta (coseno).
export const DIFFS = {
  facil: { name: 'Fácil', spots: 1, err: 0.11, powErr: 0.25, queen: false, cuts: 0.35 },
  normal: { name: 'Normal', spots: 3, err: 0.055, powErr: 0.12, queen: true, cuts: 0.35 },
  dificil: { name: 'Difícil', spots: 5, err: 0.025, powErr: 0.06, queen: true, cuts: 0.35 },
};

const RW = 96, RH = 160;
// Las dos mesas: medidas, choques, bordes, troneras, saque y dónde vuelve una ficha tras una falta.
export const TABLES = {
  round: {
    W, H, discR: DISC_R, cueR: STRIKER_R, mCue: 1.6, e: 0.9, decel: 85, shotMax: 380, pockets: POCKETS, pocketIn: POCKET_R * 0.75,
    powers: [0.45, 0.7, 0.95], back: { x: R, y: R }, diffs: DIFFS,
    edge: (b, r, ev) => { const f = rim(b, r, R, R, R, 0.72); if (f > 30) ev?.push({ kind: 'rim', power: f, x: b.x, y: b.y }); },
  },
  rect: {
    W: RW, H: RH, discR: 4.4, cueR: 4.4, mCue: 1, e: 0.93, decel: 75, shotMax: 340, pocketR: 7, pocketIn: 7,
    pockets: [[6, 6], [RW - 6, 6], [6, RH / 2], [RW - 6, RH / 2], [6, RH - 6], [RW - 6, RH - 6]].map(([x, y]) => ({ x, y })),
    powers: [0.4, 0.65, 0.9], back: { x: RW / 2, y: RH * 0.3 }, spot: { x: RW / 2, y: RH * 0.76 },
    diffs: {
      facil: { name: 'Fácil', spots: 1, err: 0.14, powErr: 0.3, cuts: 0.6 },
      normal: { name: 'Normal', spots: 1, err: 0.05, powErr: 0.12, cuts: 0.4 },
      dificil: { name: 'Difícil', spots: 1, err: 0.022, powErr: 0.06, cuts: 0.25 },
    },
    // La banda de madera tapa unas 3 unidades: las bolas rebotan en su borde, no debajo de ella.
    edge: (b, r, ev) => walls(b, r + 3, RW, RH, 0.75, (f) => f > 40 && ev?.push({ kind: 'rim', power: f, x: b.x, y: b.y })),
  },
};

const other = (side) => (side === 'me' ? 'bot' : 'me');
export const arcPoint = (side, u) => {
  const [a0, a1] = ARCS[side], a = ((a0 + (a1 - a0) * u) * Math.PI) / 180;
  return { x: R + Math.cos(a) * ARC_R, y: R + Math.sin(a) * ARC_R };
};

export function newCarrom(key = 'normal', rng = Math.random, { duo = false, table = 'round' } = {}) {
  const T = TABLES[table], diff = T.diffs[key] || T.diffs.normal, discs = [];
  if (table === 'round') {
    // Corona de ocho fichas alternas alrededor de la dama, girada al azar.
    discs.push({ id: 0, side: 'queen', x: R, y: R, vx: 0, vy: 0, in: false });
    const rot = rng() * Math.PI * 2;
    for (let i = 0; i < 2 * PER_SIDE; i++) {
      const a = rot + (i / (2 * PER_SIDE)) * Math.PI * 2, d = DISC_R / Math.sin(Math.PI / (2 * PER_SIDE)) + 0.6;
      discs.push({ id: i + 1, side: i % 2 ? 'bot' : 'me', x: R + Math.cos(a) * d, y: R + Math.sin(a) * d, vx: 0, vy: 0, in: false });
    }
  } else {
    // Triángulo de ocho bolas arriba, con los colores mezclados al azar en cada partida.
    const sides = ['me', 'me', 'me', 'me', 'bot', 'bot', 'bot', 'bot'].sort(() => rng() - 0.5), gap = 2 * T.discR + 0.3;
    for (let row = 0, k = 0; row < 4; row++) for (let i = 0; i <= row; i++, k++) {
      discs.push({ id: k, side: sides[k], x: T.W / 2 + (i - row / 2) * gap, y: T.back.y - row * gap * 0.87, vx: 0, vy: 0, in: false });
    }
  }
  const s = { T, diff, rng, duo, discs, striker: { ...(T.spot || { x: 0, y: 0 }), vx: 0, vy: 0, in: false }, turn: 'me', phase: 'aim', u: 0.5, got: { me: 0, bot: 0 }, shot: null, turns: 0, wait: 0, botT: 0, t: 0, events: [], next: null, over: null };
  place(s, 0.5);
  return s;
}

// Mesa redonda: coloca el lanzador en su arco (u de 0 a 1); si pisa una ficha, busca el hueco libre más
// cercano. En la de troneras la blanca no se mueve a mano.
export function place(s, u) {
  if (s.phase !== 'aim' || s.over || s.T !== TABLES.round) return false;
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
  s.striker.vx = Math.cos(ang) * s.T.shotMax * pow;
  s.striker.vy = Math.sin(ang) * s.T.shotMax * pow;
  s.phase = 'roll';
  s.shot = { mine: 0, foul: false };
  (s.next ||= []).push({ kind: 'shot', power: pow, x: s.striker.x, y: s.striker.y, side });
  return true;
}

// Un subpaso de física para todos: rozamiento, choques, borde y troneras. Devuelve si algo se mueve.
function physics(T, discs, st, dt, ev, onPocket) {
  const live = discs.filter((d) => !d.in), all = st.in ? live : [st, ...live];
  let moving = false;
  for (const b of all) if (slide(b, T.decel, dt)) moving = true;
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i], b = all[j], cue = a === st, f = bump(a, b, (cue ? T.cueR : T.discR) + T.discR, T.e, cue ? T.mCue : 1, 1);
    if (f > (cue ? 15 : 20)) ev?.push({ kind: cue ? 'hit' : 'clack', power: f, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  for (const b of all) {
    T.edge(b, b === st ? T.cueR : T.discR, ev);
    const p = T.pockets.find((q) => Math.hypot(b.x - q.x, b.y - q.y) < T.pocketIn);
    if (p) { Object.assign(b, { in: true, vx: 0, vy: 0, x: p.x, y: p.y }); onPocket(b, p); }
  }
  return moving;
}

// Tiro simulado desde (x, y) hasta que todo para: qué entró y si fue falta (para la máquina y las pruebas).
export function simulate(s, from, ang, pow) {
  const discs = s.discs.map((d) => ({ ...d })), st = { ...from, vx: Math.cos(ang) * s.T.shotMax * pow, vy: Math.sin(ang) * s.T.shotMax * pow, in: false };
  const got = { me: 0, bot: 0, queen: 0, foul: false };
  for (let i = 0; i < 240 * 8; i++) if (!physics(s.T, discs, st, DT, null, (b) => { if (b === st) got.foul = true; else got[b.side]++; })) break;
  return got;
}

// Plan de la máquina: desde cada salida posible (huecos del arco o donde está la blanca), para cada ficha
// propia (o dama) y tronera, apunta a la "bola fantasma" que la empuja dentro; simula y se queda con lo mejor.
export function plan(s, side = s.turn, d = s.diff) {
  const T = s.T, round = T === TABLES.round;
  const starts = !round ? [{ ...s.striker }] : (d.spots === 1 ? [0.5] : Array.from({ length: d.spots }, (_, i) => i / (d.spots - 1))).map((u) => ({ u, ...arcPoint(side, u) }));
  const targets = s.discs.filter((x) => !x.in && (x.side === side || (d.queen && x.side === 'queen')));
  const rate = (g) => (g[side] + (d.queen ? 1.2 : 1) * g.queen) * 10 - g[other(side)] * 10 - (g.foul ? 15 : 0);
  let best = null;
  for (const st of starts) {
    if (round && s.discs.some((x) => !x.in && Math.hypot(x.x - st.x, x.y - st.y) < T.discR + T.cueR + 0.5)) continue;
    for (const t of targets) for (const p of T.pockets) {
      const px = p.x - t.x, py = p.y - t.y, pd = Math.hypot(px, py), r = T.discR + T.cueR;
      const ax = t.x - (px / pd) * r - st.x, ay = t.y - (py / pd) * r - st.y, ad = Math.hypot(ax, ay);
      if ((ax * px + ay * py) / (ad * pd) < d.cuts) continue; // corte imposible
      for (const pow of T.powers) {
        const ang = Math.atan2(ay, ax), v = rate(simulate(s, st, ang, pow));
        if (!best || v > best.v) best = { u: st.u, ang, pow, v };
      }
    }
  }
  if (best) return best;
  // Sin tiro limpio: un golpe medio hacia el centro, que al menos remueve.
  const st = starts[0];
  return { u: st.u, ang: Math.atan2(T.H / 2 - st.y, T.W / 2 - st.x), pow: 0.6, v: -1 };
}

function botShot(s) {
  const d = s.diff, p = plan(s, 'bot'), rng = s.rng;
  if (p.u != null) place(s, p.u);
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
  const moving = physics(s.T, s.discs, s.striker, dt, s.events, (b, p) => {
    if (b === s.striker) { s.shot.foul = true; s.events.push({ kind: 'foul', x: p.x, y: p.y }); return; }
    const owner = b.side === 'queen' ? s.turn : b.side;
    s.got[owner] += 1;
    if (owner === s.turn) s.shot.mine += 1;
    s.events.push({ kind: 'pocket', side: b.side, owner, x: p.x, y: p.y, id: b.id });
  });
  if (!moving) resolve(s);
}

// Primer hueco libre cerca de (x, y), en espiral.
function free(s, { x, y }) {
  let a = 0, px = x, py = y;
  while (s.discs.some((d) => !d.in && Math.hypot(d.x - px, d.y - py) < 2 * s.T.discR + 0.5)) { a += 0.9; px = x + Math.cos(a) * a * 1.5; py = y + Math.sin(a) * a * 1.5; }
  return { x: px, y: py };
}

function resolve(s) {
  const side = s.turn, sh = s.shot, T = s.T;
  if (sh.foul) {
    // Falta: la blanca vuelve a su sitio (en la redonda sale siempre del arco) y una de tus fichas a la mesa.
    if (T.spot) { Object.assign(s.striker, free(s, T.spot), { in: false, vx: 0, vy: 0 }); s.events.push({ kind: 'cue', x: s.striker.x, y: s.striker.y }); }
    const back = s.got[side] > 0 && (s.discs.find((d) => d.in && d.side === side) || s.discs.find((d) => d.in && d.side === 'queen'));
    if (back) {
      s.got[side] -= 1;
      Object.assign(back, free(s, T.back), { in: false, vx: 0, vy: 0 });
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
  if (!T.spot) s.striker.in = false;
}
