// Papa caliente: la mesa redonda del billar (carrom.js) con las piezas de cada bando quietas; la bomba arde en tiempo real y la
// pieza que la tiene la lanza girando hacia otra. La atrapa la pieza más cercana a donde cae; si nadie,
// rueda hasta que toca una. Al acabarse la mecha estalla: mata a quien la tiene (o lo que pille cerca)
// y la onda empuja al resto, que puede caer por las troneras. Gana quien deja al otro sin piezas.
import { substeps, slide, bump, rim } from './physics.js';
import { R, W, H, POCKETS, POCKET_R } from './carrom.js';

export { W, H, POCKETS };

export const PC_R = 7.6, BOMB_R = 4;
export const FLY = 0.55, CATCH = PC_R + 7, KILL = 11, BLAST = 34;
const DECEL = 70, ROLL_DECEL = 90, E = 0.85, ROLL = 55, PUSH = 260;
const TYPES = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

// Piezas por bando [tú, bot], reflejos del bot (s), su error al apuntar (fracción de la distancia),
// mecha (s, al azar en el rango) y si se ve la cuenta.
export const DIFFS = {
  facil: { name: 'Fácil', count: [3, 2], react: 1.5, err: 0.22, fuse: [9, 13], show: true },
  normal: { name: 'Normal', count: [3, 3], react: 0.75, err: 0.11, fuse: [7, 11], show: true },
  dificil: { name: 'Difícil', count: [3, 4], react: 0.5, err: 0.07, fuse: [6, 10], show: false },
};

const other = (side) => (side === 'me' ? 'bot' : 'me');
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const alive = (s, side) => s.pcs.filter((p) => !p.out && (!side || p.side === side));

export function newHotbomb(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal, pcs = [];
  // Cada bando en su mitad, lejos de troneras y bandas, sin pisarse.
  const put = (side, n) => {
    for (let i = 0, tries = 0; i < n && tries < 2000; tries++) {
      const x = 14 + rng() * (W - 28), y = side === 'me' ? R + 10 + rng() * (R - 24) : 14 + rng() * (R - 24);
      if (Math.hypot(x - R, y - R) > R - 16) continue;
      if (pcs.some((p) => Math.hypot(p.x - x, p.y - y) < PC_R * 3.2) || POCKETS.some((q) => Math.hypot(q.x - x, q.y - y) < 22)) continue;
      pcs.push({ id: pcs.length, side, type: TYPES[Math.floor(rng() * TYPES.length)], x, y, vx: 0, vy: 0, out: false });
      i++;
    }
  };
  put('me', diff.count[0]);
  put('bot', diff.count[1]);
  const s = { diff, rng, pcs, bomb: { x: 0, y: 0, vx: 0, vy: 0 }, holder: null, fly: null, phase: 'hold', fuse: 0, fuseMax: 0, botT: 0, wait: 0, t: 0, throws: 0, events: [], next: null, over: null };
  arm(s, 'me');
  return s;
}

// Bomba nueva con mecha nueva en una pieza al azar del bando.
function arm(s, side) {
  const team = alive(s, side);
  if (!team.length) return;
  const [a, b] = s.diff.fuse;
  s.fuse = s.fuseMax = a + s.rng() * (b - a);
  give(s, team[Math.floor(s.rng() * team.length)]);
  s.next = [...(s.next || []), { kind: 'arm', side }];
}

function give(s, p) {
  s.holder = p.id;
  s.phase = 'hold';
  Object.assign(s.bomb, { x: p.x, y: p.y, vx: 0, vy: 0 });
  s.botT = s.diff.react * (0.7 + 0.6 * s.rng());
  (s.next ||= []).push({ kind: 'catch', id: p.id, side: p.side });
}

export const holder = (s) => s.pcs.find((p) => p.id === s.holder);

// Lanza hacia (x, y) en unidades de mesa; cae con un error proporcional a la distancia.
export function hurl(s, x, y, side = 'me', err = 0.05) {
  const h = holder(s);
  if (s.over || s.phase !== 'hold' || !h || h.side !== side) return false;
  const d = Math.hypot(x - h.x, y - h.y), a = s.rng() * Math.PI * 2, r = d * err * Math.sqrt(s.rng());
  const to = { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r }, out = Math.hypot(to.x - R, to.y - R), max = R - BOMB_R;
  if (out > max) { to.x = R + ((to.x - R) / out) * max; to.y = R + ((to.y - R) / out) * max; }
  s.fly = { from: { x: h.x, y: h.y }, to, t: 0, by: h.id };
  s.holder = null;
  s.phase = 'fly';
  s.throws += 1;
  s.last = side;
  (s.next ||= []).push({ kind: 'hurl', side, x: h.x, y: h.y });
  return true;
}

// Dónde apunta el bot: a la pieza rival que, al estallar, más arrastra hacia una tronera y menos a los suyos.
export function plan(s, side = 'bot') {
  const foes = alive(s, other(side)), mine = alive(s, side);
  let best = null;
  for (const f of foes) {
    const pocket = Math.min(...POCKETS.map((q) => dist(q, f))), crowd = foes.filter((g) => g !== f && dist(g, f) < BLAST).length;
    const risk = mine.filter((m) => dist(m, f) < BLAST).length;
    const v = crowd * 2 - risk * 3 - pocket / 30 + s.rng() * 0.5;
    if (!best || v > best.v) best = { x: f.x, y: f.y, v };
  }
  return best || { x: W / 2, y: H / 2 };
}

export function step(s, dt) {
  s.events = s.next || [];
  s.next = null;
  if (!s.over) substeps(dt, (h) => sub(s, h), () => !s.over);
  return s;
}

function sub(s, dt) {
  s.t += dt;
  const moving = physics(s, dt);
  if (s.phase === 'wait') {
    if (!moving && (s.wait -= dt) <= 0) {
      if (judge(s)) return;
      arm(s, s.after);
    }
    return;
  }
  s.fuse -= dt;
  if (s.fuse <= 0) return boom(s);
  if (s.phase === 'hold') {
    const h = holder(s);
    if (!h) return;
    Object.assign(s.bomb, { x: h.x, y: h.y });
    if (h.side === 'bot' && (s.botT -= dt) <= 0) { const p = plan(s); hurl(s, p.x, p.y, 'bot', s.diff.err); }
  } else if (s.phase === 'fly') {
    const f = s.fly;
    f.t = Math.min(1, f.t + dt / FLY);
    s.bomb.x = f.from.x + (f.to.x - f.from.x) * f.t;
    s.bomb.y = f.from.y + (f.to.y - f.from.y) * f.t;
    if (f.t >= 1) land(s);
  } else if (s.phase === 'roll') {
    const b = s.bomb;
    slide(b, ROLL_DECEL, dt);
    rim(b, BOMB_R, R, R, R, 0.6);
    const q = POCKETS.find((p) => dist(p, b) < POCKET_R * 0.8);
    if (q) { Object.assign(b, q); return boom(s, true); }
    const p = alive(s).find((x) => dist(x, b) < PC_R + BOMB_R);
    if (p) give(s, p);
    else if (Math.hypot(b.vx, b.vy) < 2) give(s, alive(s).reduce((m, x) => (dist(x, b) < dist(m, b) ? x : m)));
  }
}

function land(s) {
  const b = s.bomb, f = s.fly;
  s.events.push({ kind: 'land', x: b.x, y: b.y });
  const near = alive(s).filter((p) => dist(p, b) < CATCH).sort((p, q) => dist(p, b) - dist(q, b))[0];
  if (near) return give(s, near);
  const d = Math.hypot(f.to.x - f.from.x, f.to.y - f.from.y) || 1;
  b.vx = ((f.to.x - f.from.x) / d) * ROLL;
  b.vy = ((f.to.y - f.from.y) / d) * ROLL;
  s.phase = 'roll';
}

// Estalla donde esté la bomba: muere lo que está encima y la onda empuja al resto.
function boom(s, pocket = false) {
  const b = s.bomb, h = holder(s), dead = [];
  const victim = h && !h.out ? h.side : null;
  for (const p of alive(s)) {
    const d = dist(p, b);
    if (p === h || (!pocket && d < KILL)) { p.out = true; dead.push(p.id); continue; }
    if (d < BLAST) {
      const k = (PUSH * (1 - d / BLAST)) / (d || 1);
      p.vx += (p.x - b.x) * k;
      p.vy += (p.y - b.y) * k;
    }
  }
  s.events.push({ kind: 'boom', x: b.x, y: b.y, dead, pocket });
  s.holder = null;
  s.fly = null;
  s.phase = 'wait';
  s.wait = 0.6;
  // La bomba nueva, para el bando contrario al que la sufrió (o al que la tiró, si cayó por una tronera).
  s.after = victim ? other(victim) : other(s.last || 'me');
}

// Piezas empujadas: rozamiento, choques entre ellas, bandas y troneras.
function physics(s, dt) {
  const live = alive(s);
  let moving = false;
  for (const p of live) if (slide(p, DECEL, dt) > 0.5) moving = true;
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) bump(live[i], live[j], 2 * PC_R, E);
  for (const p of live) {
    const q = POCKETS.find((o) => dist(o, p) < POCKET_R);
    if (q && Math.hypot(p.vx, p.vy) > 1) { p.out = true; Object.assign(p, { x: q.x, y: q.y, vx: 0, vy: 0 }); s.events.push({ kind: 'pocket', id: p.id, side: p.side, x: q.x, y: q.y }); continue; }
    rim(p, PC_R, R, R, R, 0.7);
  }
  return moving;
}

function judge(s) {
  const me = alive(s, 'me').length, bot = alive(s, 'bot').length;
  if (!me || !bot) s.over = me ? 'win' : 'lose';
  return !!s.over;
}
