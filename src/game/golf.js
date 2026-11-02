// Golf de mesa: una bola sobre el tablero de 6×10 con arena, hielo, huecos y piezas de obstáculo.
// Física pura, sin DOM; mismas unidades que el hockey (16 por casilla). Tres hoyos al azar, cada
// uno validado con el mismo simulador: un golfista codicioso lo emboca en su par.
import { DT, substeps, collide, slide, walls as rails } from './physics.js';

export const CELL = 16, COLS = 6, ROWS = 10;
export const W = COLS * CELL, H = ROWS * CELL;
export const BALL_R = 3.2, CUP_R = 5, PIECE_R = 6.4;
export const SHOT_MAX = 320; // golpe a tope (u/s)
export const PULL_MAX = CELL * 3.5; // tirar hacia atrás esto = golpe a tope
export const HOLES = 3, MAX_STROKES = 8;
const ROLL = { g: 70, s: 320, i: 12 }; // frenado (u/s²) por suelo: césped, arena, hielo
const CUP_V = 100; // más rápido que esto, la bola salta el hoyo
const PULL = 280; // el borde del hoyo atrae la bola lenta
const WALL_E = 0.72, PIECE_E = 0.8;

// walls: filas cerradas por piezas o huecos con una abertura de `gap` casillas;
// pieces/sand/ice/void: casillas de cada cosa; mover: torre que patrulla una fila;
// slack: golpes de más sobre el par total con los que aún se gana.
export const DIFFS = {
  facil: { name: 'Fácil', walls: 1, gap: 2, pieces: 1, sand: 2, ice: 1, void: 0, mover: false, slack: 3 },
  normal: { name: 'Normal', walls: 1, gap: 1, pieces: 2, sand: 3, ice: 2, void: 1, mover: false, slack: 2 },
  dificil: { name: 'Difícil', walls: 2, gap: 1, pieces: 2, sand: 3, ice: 2, void: 2, mover: true, slack: 2 },
};
const TYPES = ['rook', 'bishop', 'knight', 'pawn', 'queen'];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const center = (r, c) => ({ x: (c + 0.5) * CELL, y: (r + 0.5) * CELL });
export const tileAt = (course, x, y) => {
  const r = Math.floor(y / CELL), c = Math.floor(x / CELL);
  return r < 0 || c < 0 || r >= ROWS || c >= COLS ? 'g' : course.tiles[r * COLS + c];
};

// La torre que patrulla va y viene por su fila; posición y velocidad en el instante t.
export function moverAt(m, t) {
  const span = m.x1 - m.x0, u = ((t * m.speed + m.phase * 2 * span) % (2 * span) + 2 * span) % (2 * span);
  return u < span ? { x: m.x0 + u, y: m.y, vx: m.speed } : { x: m.x1 - (u - span), y: m.y, vx: -m.speed };
}

function bounce(b, px, py, mvx, ev) {
  const power = collide(b, px, py, BALL_R + PIECE_R, PIECE_E, mvx);
  if (!power) return;
  const d = Math.hypot(b.x - px, b.y - py);
  ev?.push({ kind: 'bump', x: px + ((b.x - px) / d) * PIECE_R, y: py + ((b.y - py) / d) * PIECE_R, power, px, py });
}

// Un subpaso de la bola. Devuelve 'sink', 'fall', 'rest' (se acaba de parar) o null.
function roll(c, b, t, dt, ev) {
  const sp0 = Math.hypot(b.vx, b.vy);
  const ground = tileAt(c, b.x, b.y);
  slide(b, ROLL[ground] ?? ROLL.g, dt);
  rails(b, BALL_R, W, H, WALL_E, (v) => v > 25 && ev?.push({ kind: 'wall', speed: v, x: b.x, y: b.y }));
  for (const p of c.pieces) bounce(b, p.x, p.y, 0, ev);
  if (c.mover) { const m = moverAt(c.mover, t); bounce(b, m.x, m.y, m.vx, ev); }
  const sp = Math.hypot(b.vx, b.vy);
  if (!sp) return null;
  const now = tileAt(c, b.x, b.y);
  if (now === 'v') return 'fall';
  if (now === 's' && ground !== 's' && sp > 40) ev?.push({ kind: 'sand', x: b.x, y: b.y });
  const dx = c.cup.x - b.x, dy = c.cup.y - b.y, d = Math.hypot(dx, dy);
  if (d < CUP_R + BALL_R) {
    if (sp < CUP_V) {
      if (d < CUP_R * 0.55) return 'sink';
      b.vx += (dx / d) * PULL * dt; b.vy += (dy / d) * PULL * dt;
      return null;
    }
    if (d < CUP_R * 0.7 && !b.lip) {
      // Va lanzada: salta el hoyo, frenada y algo desviada hacia el lado por el que entró.
      b.lip = true;
      const side = Math.sign(dx * b.vy - dy * b.vx) || 1, a = 0.3 * side, cos = Math.cos(a), sin = Math.sin(a);
      [b.vx, b.vy] = [(b.vx * cos - b.vy * sin) * 0.7, (b.vx * sin + b.vy * cos) * 0.7];
      ev?.push({ kind: 'lip', x: b.x, y: b.y });
    }
  } else b.lip = false;
  if (Math.hypot(b.vx, b.vy) < 3) { b.vx = b.vy = 0; return 'rest'; }
  return null;
}

// Golpe simulado hasta que la bola para, cae o entra (para el validador y el bot de las pruebas).
export function simulate(c, ball, t, ang, pow) {
  const b = { x: ball.x, y: ball.y, vx: Math.cos(ang) * SHOT_MAX * pow, vy: Math.sin(ang) * SHOT_MAX * pow };
  for (let i = 0; i < 240 * 10; i++) {
    const r = roll(c, b, t, DT, null);
    t += DT;
    if (r) return { b, t, res: r };
  }
  return { b, t, res: 'rest' };
}

// Distancia por casillas hasta el hoyo, rodeando huecos y piezas (8 vecinos).
function field(c) {
  if (c.field) return c.field;
  const f = new Array(ROWS * COLS).fill(Infinity), q = [];
  const blocked = new Set(c.pieces.map((p) => p.r * COLS + p.c));
  const start = Math.floor(c.cup.y / CELL) * COLS + Math.floor(c.cup.x / CELL);
  f[start] = 0; q.push(start);
  while (q.length) {
    q.sort((a, b) => f[a] - f[b]);
    const i = q.shift(), r = Math.floor(i / COLS), cc = i % COLS;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = cc + dc, j = nr * COLS + nc;
      if ((!dr && !dc) || nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || c.tiles[j] === 'v' || blocked.has(j)) continue;
      const w = f[i] + (dr && dc ? 1.42 : 1);
      if (w < f[j]) { f[j] = w; q.push(j); }
    }
  }
  return (c.field = f);
}
function score(c, res, b) {
  if (res === 'sink') return -1;
  if (res === 'fall') return Infinity;
  const f = field(c), i = Math.floor(b.y / CELL) * COLS + Math.floor(b.x / CELL);
  if (f[i] === 0) return Math.hypot(b.x - c.cup.x, b.y - c.cup.y);
  return f[i] * CELL + (tileAt(c, b.x, b.y) === 's' ? CELL : 0);
}

// El mejor golpe a la vista: muestrea dirección y fuerza y se queda con el que más acerca.
export function plan(c, ball, t = 0) {
  const all = [];
  const tryShot = (ang, pow) => {
    if (pow <= 0 || pow > 1) return;
    const r = simulate(c, ball, t, ang, pow);
    all.push({ ang, pow, v: score(c, r.res, r.b) });
  };
  const top = (n) => all.sort((a, b) => a.v - b.v).slice(0, n);
  // Barrido grueso, luego fino alrededor del mejor, y de los cinco mejores el que aguanta un pulso
  // imperfecto (peor caso con algo de error en dirección y fuerza): así no roza huecos por los pelos.
  for (let a = 0; a < 24; a++) for (let p = 1; p <= 6; p++) tryShot((a / 24) * 2 * Math.PI, p / 6);
  const [g] = top(1);
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) tryShot(g.ang + i * (Math.PI / 48), g.pow + j / 24);
  let best = null;
  for (const o of top(5)) {
    let worst = o.v;
    for (const [da, dp] of [[0.04, 0], [-0.04, 0], [0, 0.08], [0, -0.08]]) {
      const pow = Math.min(1, o.pow * (1 + dp)), r = simulate(c, ball, t, o.ang + da, pow);
      worst = Math.max(worst, score(c, r.res, r.b));
    }
    const v = o.v + (worst === Infinity ? 1e6 : worst) * 0.5;
    if (!best || v < best.v) best = { ang: o.ang, pow: o.pow, v };
  }
  return best;
}

// Golpes que necesita el golfista codicioso (null si no la mete en `max` o si algún golpe no
// aguanta un pulso imperfecto).
export function solve(c, max = 6) {
  let ball = c.tee, t = 0;
  for (let n = 1; n <= max; n++) {
    const p = plan(c, ball, t);
    if (p.v >= 1e5) return null; // solo pasa rozando un hueco: injusto para una mano de verdad
    const r = simulate(c, ball, t, p.ang, p.pow);
    if (r.res === 'sink') return n;
    if (r.res === 'fall') return null;
    ball = r.b; t = r.t;
  }
  return null;
}

export function makeHole(diff, rng = Math.random) {
  for (let k = 0; k < 40; k++) {
    const tee = { r: 7 + Math.floor(rng() * 3), c: Math.floor(rng() * COLS) }, cup = { r: Math.floor(rng() * 3), c: Math.floor(rng() * COLS) };
    const tiles = new Array(ROWS * COLS).fill('g'), used = new Set([tee.r * COLS + tee.c, cup.r * COLS + cup.c]);
    const free = (r0 = 1, r1 = 8) => { for (let i = 0; i < 99; i++) { const r = r0 + Math.floor(rng() * (r1 - r0 + 1)), c = Math.floor(rng() * COLS), j = r * COLS + c; if (!used.has(j)) { used.add(j); return { r, c, j }; } } return null; };
    const pieces = [], wallRows = [3, 4, 5, 6].sort(() => rng() - 0.5).slice(0, diff.walls).sort();
    if (wallRows.length === 2 && wallRows[1] - wallRows[0] < 2) wallRows[1] = Math.min(7, wallRows[0] + 2);
    for (const r of wallRows) {
      const g = Math.floor(rng() * (COLS - diff.gap + 1)), water = diff.void && rng() < 0.5;
      for (let c = 0; c < COLS; c++) {
        const j = r * COLS + c;
        used.add(j);
        if (c >= g && c < g + diff.gap) continue;
        if (water) tiles[j] = 'v';
        else pieces.push({ type: TYPES[Math.floor(rng() * TYPES.length)], r, c, ...center(r, c) });
      }
    }
    for (const [kind, n] of [['s', diff.sand], ['i', diff.ice], ['v', diff.void]]) for (let i = 0; i < n; i++) { const f = free(); if (f) tiles[f.j] = kind; }
    for (let i = 0; i < diff.pieces; i++) { const f = free(2, 7); if (f) pieces.push({ type: TYPES[Math.floor(rng() * TYPES.length)], r: f.r, c: f.c, ...center(f.r, f.c) }); }
    let mover = null;
    if (diff.mover) {
      const rows = [2, 3, 4, 5, 6, 7].filter((r) => !wallRows.includes(r) && !pieces.some((p) => p.r === r));
      const r = rows[Math.floor(rng() * rows.length)];
      if (r != null) mover = { type: 'rook', x0: CELL / 2, x1: W - CELL / 2, y: (r + 0.5) * CELL, speed: 26 + rng() * 16, phase: rng() };
    }
    const c = { tiles, pieces, mover, tee: center(tee.r, tee.c), cup: center(cup.r, cup.c) };
    const par = solve(c, mover ? 5 : 4);
    if (par) { c.par = par + 1; delete c.field; return c; } // el par deja un golpe de margen al golfista perfecto
  }
  return { tiles: new Array(ROWS * COLS).fill('g'), pieces: [], mover: null, tee: center(8, 2), cup: center(1, 3), par: 2 };
}

export function newGolf(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  const holes = Array.from({ length: HOLES }, () => makeHole(diff, rng));
  const s = { diff, rng, holes, hole: 0, course: null, ball: null, last: null, strokes: 0, card: [], total: 0, t: 0, moving: false, wait: 0, events: [], over: null };
  s.target = holes.reduce((a, h) => a + h.par, 0) + diff.slack;
  startHole(s, 0);
  return s;
}

function startHole(s, i) {
  s.hole = i;
  s.course = s.holes[i];
  s.ball = { x: s.course.tee.x, y: s.course.tee.y, vx: 0, vy: 0 };
  s.last = { x: s.ball.x, y: s.ball.y };
  s.strokes = 0;
  s.moving = false;
  s.events.push({ kind: 'hole', hole: i });
}

// ang en radianes (0 = derecha, y crece hacia abajo); pow de 0 a 1.
export function shoot(s, ang, pow) {
  if (s.over || s.moving || s.wait > 0) return false;
  pow = clamp(pow, 0.05, 1);
  s.ball.vx = Math.cos(ang) * SHOT_MAX * pow;
  s.ball.vy = Math.sin(ang) * SHOT_MAX * pow;
  s.strokes += 1;
  s.moving = true;
  (s.next ||= []).push({ kind: 'shot', power: pow, x: s.ball.x, y: s.ball.y }); // sale en el próximo step, con lo demás
  return true;
}

export function step(s, dt) {
  s.events = s.next || [];
  s.next = null;
  if (!s.over) substeps(dt, (h) => sub(s, h), () => !s.over);
  return s;
}

const lost = (s) => s.total + s.strokes > s.target;
function endHole(s, strokes) {
  s.total += strokes;
  s.card.push(strokes);
  s.wait = 1.3;
}

function sub(s, dt) {
  s.t += dt;
  if (s.wait > 0) {
    s.wait -= dt;
    if (s.wait <= 0) {
      s.wait = 0;
      if (s.hole + 1 >= HOLES) s.over = s.total <= s.target ? 'win' : 'lose';
      else startHole(s, s.hole + 1);
    }
    return;
  }
  const b = s.ball, r = roll(s.course, b, s.t, dt, s.events);
  if (!s.moving && Math.hypot(b.vx, b.vy) > 0) s.moving = true; // la torre que patrulla la empujó
  if (r === 'sink') {
    b.vx = b.vy = 0;
    s.moving = false;
    s.events.push({ kind: 'sink', strokes: s.strokes, par: s.course.par, x: s.course.cup.x, y: s.course.cup.y });
    Object.assign(b, s.course.cup);
    endHole(s, s.strokes);
  } else if (r === 'fall') {
    s.events.push({ kind: 'fall', x: b.x, y: b.y });
    Object.assign(b, s.last, { vx: 0, vy: 0 });
    s.moving = false;
  } else if (r === 'rest') {
    s.moving = false;
    s.last = { x: b.x, y: b.y };
  }
  if (!s.moving && !s.wait && (lost(s) || s.strokes >= MAX_STROKES)) {
    if (lost(s)) { s.total += s.strokes; s.card.push(s.strokes); s.over = 'lose'; return; }
    s.events.push({ kind: 'pickup' });
    endHole(s, s.strokes);
  }
}
