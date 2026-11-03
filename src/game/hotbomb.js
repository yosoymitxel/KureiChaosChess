// Papa caliente: las piezas de los dos bandos forman un corro en la mesa redonda (carrom.js). La bomba
// arde en tiempo real y quien la tiene la lanza girando; la atrapa la pieza más cercana a donde cae, así
// que apuntar a una rival que tiene al lado una tuya es arriesgado. Al acabarse la mecha estalla y se
// lleva a quien la tiene (o a la pieza que pille si estalla en el aire); el corro se cierra y sigue.
// Gana quien deja al otro sin piezas.
import { substeps } from './physics.js';
import { R, W, H } from './carrom.js';

export { W, H };
export const PC_R = 7.6, RING = R * 0.62, FLY = 0.55, KILL = 12, BLAST = 26;
const WALK = 50; // u/s al cerrar el corro
const TYPES = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

// Piezas por bando [tú, bot], reflejos del bot (s), su error al apuntar (fracción de la distancia),
// mecha (s, al azar en el rango) y si se ve la cuenta.
export const DIFFS = {
  facil: { name: 'Fácil', count: [3, 2], react: 1.5, err: 0.3, fuse: [9, 13], show: true },
  normal: { name: 'Normal', count: [3, 3], react: 0.75, err: 0.18, fuse: [7, 11], show: true },
  dificil: { name: 'Difícil', count: [3, 4], react: 0.5, err: 0.1, fuse: [6, 10], show: false },
};

const other = (side) => (side === 'me' ? 'bot' : 'me');
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const alive = (s, side) => s.pcs.filter((p) => !p.out && (!side || p.side === side));
export const holder = (s) => s.pcs.find((p) => p.id === s.holder);

export function newHotbomb(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal, [me, bot] = diff.count;
  // Bandos intercalados por el corro (lo más repartidos posible), girado al azar.
  const order = [...Array.from({ length: me }, (_, i) => ['me', (i + 0.5) / me]), ...Array.from({ length: bot }, (_, i) => ['bot', (i + rng() * 0.5) / bot])].sort((a, b) => a[1] - b[1]);
  const pcs = order.map(([side], id) => ({ id, side, type: TYPES[Math.floor(rng() * TYPES.length)], x: R, y: R, out: false }));
  const s = { diff, rng, pcs, rot: rng() * Math.PI * 2, bomb: { x: R, y: R }, holder: null, fly: null, phase: 'hold', fuse: 0, fuseMax: 0, botT: 0, wait: 0, t: 0, last: 'me', events: [], next: null, over: null };
  for (const [p, at] of slots(s)) Object.assign(p, at);
  arm(s, 'me');
  return s;
}

// Hueco de cada pieza viva en el corro, repartidas a partes iguales y en su orden.
function slots(s) {
  const live = alive(s);
  return live.map((p, i) => { const a = s.rot + (i / live.length) * Math.PI * 2; return [p, { x: R + Math.cos(a) * RING, y: R + Math.sin(a) * RING }]; });
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
  Object.assign(s.bomb, { x: p.x, y: p.y });
  s.botT = s.diff.react * (0.7 + 0.6 * s.rng());
  (s.next ||= []).push({ kind: 'catch', id: p.id, side: p.side });
}

// Lanza hacia (x, y) en unidades de mesa; cae con un error proporcional a la distancia.
export function hurl(s, x, y, side = 'me', err = 0.05) {
  const h = holder(s);
  if (s.over || s.phase !== 'hold' || !h || h.side !== side) return false;
  const d = Math.hypot(x - h.x, y - h.y), a = s.rng() * Math.PI * 2, r = d * err * Math.sqrt(s.rng());
  s.fly = { from: { x: h.x, y: h.y }, to: { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r }, t: 0 };
  s.holder = null;
  s.phase = 'fly';
  s.last = side;
  (s.next ||= []).push({ kind: 'hurl', side, x: h.x, y: h.y });
  return true;
}

// El bot apunta a la rival que tiene más lejos a sus propias piezas (la que menos riesgo tiene de rebotarle).
export function plan(s, side = 'bot') {
  const mine = alive(s, side), h = holder(s);
  let best = null;
  for (const f of alive(s, other(side))) {
    const v = Math.min(...mine.filter((m) => m !== h).map((m) => dist(m, f)), 999) + s.rng() * 6;
    if (!best || v > best.v) best = { x: f.x, y: f.y, v };
  }
  return best || { x: R, y: R };
}

export function step(s, dt) {
  s.events = s.next || [];
  s.next = null;
  if (!s.over) substeps(dt, (h) => sub(s, h), () => !s.over);
  return s;
}

function sub(s, dt) {
  s.t += dt;
  if (s.phase === 'wait') {
    // El corro se cierra: cada pieza camina hasta su hueco nuevo.
    let moving = false;
    for (const [p, at] of slots(s)) {
      const d = dist(p, at), k = Math.min(1, (WALK * dt) / (d || 1));
      if (d > 0.3) { moving = true; p.x += (at.x - p.x) * k; p.y += (at.y - p.y) * k; }
    }
    if (!moving && (s.wait -= dt) <= 0) arm(s, s.after);
    return;
  }
  s.fuse -= dt;
  if (s.fuse <= 0) return boom(s);
  if (s.phase === 'hold') {
    const h = holder(s);
    if (h.side === 'bot' && (s.botT -= dt) <= 0) { const p = plan(s); hurl(s, p.x, p.y, 'bot', s.diff.err); }
  } else {
    const f = s.fly;
    f.t = Math.min(1, f.t + dt / FLY);
    s.bomb.x = f.from.x + (f.to.x - f.from.x) * f.t;
    s.bomb.y = f.from.y + (f.to.y - f.from.y) * f.t;
    if (f.t >= 1) {
      s.events.push({ kind: 'land', x: s.bomb.x, y: s.bomb.y });
      give(s, alive(s).reduce((m, p) => (dist(p, s.bomb) < dist(m, s.bomb) ? p : m)));
    }
  }
}

// Estalla donde está la bomba: en la mano se lleva a quien la tiene; en el aire, a la pieza que pille cerca.
function boom(s) {
  const b = s.bomb, h = holder(s) || alive(s).find((p) => dist(p, b) < KILL);
  if (h) h.out = true;
  s.events.push({ kind: 'boom', x: b.x, y: b.y, dead: h ? [h.id] : [] });
  s.holder = null;
  s.fly = null;
  const me = alive(s, 'me').length, bot = alive(s, 'bot').length;
  if (!me || !bot) { s.over = me ? 'win' : 'lose'; return; }
  // La bomba nueva, para el bando contrario al que la sufrió (o al que la tiró, si estalló en el vacío).
  s.after = other(h ? h.side : s.last);
  s.phase = 'wait';
  s.wait = 0.6;
}
