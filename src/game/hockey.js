// Hockey de mesa: el disco y dos torres sobre un tablero de 6×10. Física pura, sin DOM.
// Unidades de mesa: 16 por casilla. Tu torre abajo (light), la del bot arriba (dark).
export const CELL = 16, COLS = 6, ROWS = 10;
export const W = COLS * CELL, H = ROWS * CELL;
export const PUCK_R = 4.6, MALLET_R = 7.6;
export const GOAL = [W / 2 - 20, W / 2 + 20]; // boca de cada portería, en x
export const GOALS = 5; // gana quien llegue antes
export const PUCK_MAX = 260; // tope del disco (u/s): cruza la mesa en ~0,6 s
export const PLAYER_MAX = 360; // tope de tu torre: más que cualquier bot
const FRICTION = 0.32; // pérdida por segundo, ligera
const WALL_E = 0.88, MALLET_E = 0.9;
const SERVE_PAUSE = 0.9; // respiro tras un gol antes de soltar el disco
const STALL_T = 4; // disco quieto en la raya: se vuelve a sacar
export const HOLD_T = 7; // regla de mesa: nadie retiene el disco en su mitad más de 7 s
const DT = 1 / 240; // subpaso fijo: ningún choque se salta a tope de velocidad

// react: cada cuánto replantea (s); speed: tope de su torre; err: error de puntería y de lectura (u);
// guard: lo que se adelanta de su portería al defender; bank: cuántos tiros intenta por banda;
// read: si lee los rebotes en banda al defender (si no, sigue la línea recta y la banda lo engaña).
export const DIFFS = {
  facil: { name: 'Fácil', react: 0.3, speed: 115, err: 14, guard: 16, bank: 0.1, read: false },
  normal: { name: 'Normal', react: 0.16, speed: 165, err: 8, guard: 20, bank: 0.3, read: false },
  dificil: { name: 'Difícil', react: 0.1, speed: 205, err: 5, guard: 24, bank: 0.45, read: true },
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Mitad de cada bando, sin meterse en su portería ni cruzar la línea central.
const limits = (side) => side === 'me'
  ? { x0: MALLET_R, x1: W - MALLET_R, y0: H / 2 + MALLET_R, y1: H - MALLET_R }
  : { x0: MALLET_R, x1: W - MALLET_R, y0: MALLET_R, y1: H / 2 - MALLET_R };
const mallet = (side) => ({ side, x: W / 2, y: side === 'me' ? H - 2 * CELL : 2 * CELL, vx: 0, vy: 0, tx: W / 2, ty: side === 'me' ? H - 2 * CELL : 2 * CELL });

export function newHockey(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  const s = { diff, me: mallet('me'), bot: mallet('bot'), puck: { x: W / 2, y: H / 2, vx: 0, vy: 0 }, score: { me: 0, bot: 0 }, pause: 0, slow: 0, hold: 0, shots: 0, half: null, t: 0, over: null, events: [], ai: { me: null, bot: null }, rng };
  serve(s, 'me', 0);
  return s;
}

// El disco vuelve al centro de la mitad de quien encajó, quieto: saca él.
function serve(s, side, pause = SERVE_PAUSE) {
  Object.assign(s.puck, { x: W / 2, y: side === 'me' ? H / 2 + CELL * 1.5 : H / 2 - CELL * 1.5, vx: 0, vy: 0 });
  s.pause = pause;
  s.slow = 0;
  s.hold = 0;
  if (pause) s.events.push({ kind: 'serve', side });
}

// Tu torre persigue el puntero con su tope de velocidad; la meta se recorta a tu mitad.
export function aim(s, x, y, side = 'me') {
  const m = s[side], L = limits(side);
  m.tx = clamp(x, L.x0, L.x1);
  m.ty = clamp(y, L.y0, L.y1);
}

function drive(m, max, dt) {
  const L = limits(m.side);
  const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy), go = Math.min(d, max * dt);
  const nx = d ? clamp(m.x + (dx / d) * go, L.x0, L.x1) : m.x, ny = d ? clamp(m.y + (dy / d) * go, L.y0, L.y1) : m.y;
  m.vx = (nx - m.x) / dt;
  m.vy = (ny - m.y) / dt;
  m.x = nx;
  m.y = ny;
}

// Dónde cruzará el disco la altura y, contando los rebotes en las bandas (sin fricción: basta para apuntar).
export function predictX(p, y) {
  if (p.vy === 0 || Math.sign(y - p.y) !== Math.sign(p.vy)) return p.x;
  const t = (y - p.y) / p.vy, span = W - 2 * PUCK_R;
  let x = p.x - PUCK_R + p.vx * t;
  x = ((x % (2 * span)) + 2 * span) % (2 * span);
  return PUCK_R + (x > span ? 2 * span - x : x);
}

// El bot (y el de las pruebas, que juega abajo): defiende su boca y ataca si el disco entra en su mitad.
export function think(s, side = 'bot') {
  const m = s[side], p = s.puck, d = side === 'bot' ? s.diff : (s.foeDiff || s.diff), rng = s.rng;
  const dir = side === 'bot' ? 1 : -1; // hacia dónde ataca (y crece hacia abajo)
  const home = side === 'bot' ? 0 : H; // su línea de fondo
  const mine = side === 'bot' ? p.y < H / 2 : p.y > H / 2;
  const err = () => (rng() * 2 - 1) * d.err;
  const coming = p.vy * dir < 0; // el disco va hacia su portería
  const speed = Math.hypot(p.vx, p.vy);
  if (mine && !(coming && speed > 120 && Math.abs(p.y - home) > H * 0.32)) {
    // Ataque: ponerse detrás del disco en la línea hacia la boca rival y atravesarlo.
    // Plan de tiro por posesión: un punto de la boca rival, a veces por banda (espejo en la banda).
    if (s.ai.plan?.[side]?.shots !== s.shots) {
      let x = GOAL[0] + PUCK_R + 2 + rng() * (GOAL[1] - GOAL[0] - 2 * PUCK_R - 4);
      if (rng() < d.bank) x = rng() < 0.5 ? 2 * PUCK_R - x : 2 * (W - PUCK_R) - x;
      s.ai.plan = { ...s.ai.plan, [side]: { shots: s.shots, x } };
    }
    const gx = s.ai.plan[side].x + err(), gy = home + dir * H;
    let ux = gx - p.x, uy = gy - p.y;
    const n = Math.hypot(ux, uy) || 1;
    ux /= n; uy /= n;
    const gap = PUCK_R + MALLET_R + 2, sx = p.x - ux * gap, sy = p.y - uy * gap;
    const along = (m.x - p.x) * ux + (m.y - p.y) * uy, side2 = (m.x - p.x) * -uy + (m.y - p.y) * ux;
    let tx, ty;
    if (along < -gap * 0.6 && Math.abs(side2) < MALLET_R) { tx = p.x + ux * 10; ty = p.y + uy * 10; } // detrás y alineado: golpe
    else if (along > -PUCK_R) { const k = side2 < 0 ? -1 : 1; tx = sx - uy * gap * k; ty = sy + ux * gap * k; } // delante: rodea por su lado
    else { tx = sx; ty = sy; }
    // Disco pegado a su banda de fondo: no hay detrás; se barre de lado.
    if (Math.abs(p.y - home) < MALLET_R + PUCK_R + 2) { tx = p.x + (p.x < W / 2 ? -1 : 1) * 3; ty = p.y + dir * 6; }
    aim(s, tx, ty, side);
    return 'attack';
  }
  // Defensa: entre el disco y el centro de su boca, a `guard` del fondo, leyendo la trayectoria.
  const gy = home + dir * d.guard;
  // La lectura falla más cuanto más rápido viene, y con un sesgo que se sortea en cada golpe.
  if (s.ai.shot?.[side] !== s.shots) { s.ai.shot = { ...s.ai.shot, [side]: s.shots }; s.ai.bias = { ...s.ai.bias, [side]: rng() * 2 - 1 }; }
  const miss = s.ai.bias[side] * d.err * (0.4 + 2.2 * speed / PUCK_MAX);
  const px = coming ? (d.read ? predictX(p, gy) : clamp(p.x + p.vx * (gy - p.y) / p.vy, 0, W)) + miss : p.x;
  const k = coming ? 0.9 : 0.45;
  aim(s, W / 2 + (px - W / 2) * k, gy, side);
  return 'guard';
}

function bounceMallet(s, m) {
  const p = s.puck, dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy), min = PUCK_R + MALLET_R;
  if (d >= min) return;
  const nx = d ? dx / d : 0, ny = d ? dy / d : (m.side === 'me' ? -1 : 1);
  p.x = m.x + nx * min;
  p.y = m.y + ny * min;
  const rel = (p.vx - m.vx) * nx + (p.vy - m.vy) * ny;
  if (rel >= 0) return;
  // La torre no cede (masa infinita): el disco rebota y se lleva su velocidad.
  p.vx -= (1 + MALLET_E) * rel * nx;
  p.vy -= (1 + MALLET_E) * rel * ny;
  capSpeed(p);
  s.shots += 1;
  const hit = Math.hypot(p.vx, p.vy);
  if (!s.hitCool || s.hitCool[m.side] <= 0) {
    s.events.push({ kind: 'hit', side: m.side, speed: hit, power: -rel, x: m.x + nx * MALLET_R, y: m.y + ny * MALLET_R });
    s.hitCool = { ...s.hitCool, [m.side]: 0.08 };
  }
}

function capSpeed(p) {
  const v = Math.hypot(p.vx, p.vy);
  if (v > PUCK_MAX) { p.vx *= PUCK_MAX / v; p.vy *= PUCK_MAX / v; }
}

// Bandas, postes y bocas. Devuelve 'me' o 'bot' si alguien marcó.
function walls(s) {
  const p = s.puck, r = PUCK_R;
  const inMouth = p.x > GOAL[0] && p.x < GOAL[1];
  if (p.x < r) { p.x = r; if (p.vx < 0) { wall(s, Math.abs(p.vx)); p.vx = -p.vx * WALL_E; } }
  if (p.x > W - r) { p.x = W - r; if (p.vx > 0) { wall(s, Math.abs(p.vx)); p.vx = -p.vx * WALL_E; } }
  if (!inMouth) {
    if (p.y < r) { p.y = r; if (p.vy < 0) { wall(s, Math.abs(p.vy)); p.vy = -p.vy * WALL_E; } }
    if (p.y > H - r) { p.y = H - r; if (p.vy > 0) { wall(s, Math.abs(p.vy)); p.vy = -p.vy * WALL_E; } }
  }
  // Los postes son puntos: el disco que roza la esquina de la boca rebota en ella.
  for (const [qx, qy] of [[GOAL[0], 0], [GOAL[1], 0], [GOAL[0], H], [GOAL[1], H]]) {
    const dx = p.x - qx, dy = p.y - qy, d = Math.hypot(dx, dy);
    if (d >= r || d === 0) continue;
    const nx = dx / d, ny = dy / d, rel = p.vx * nx + p.vy * ny;
    p.x = qx + nx * r; p.y = qy + ny * r;
    if (rel < 0) { wall(s, -rel); p.vx -= (1 + WALL_E) * rel * nx; p.vy -= (1 + WALL_E) * rel * ny; }
  }
  if (p.y < -r) return 'me';
  if (p.y > H + r) return 'bot';
  return null;
}
function wall(s, speed) { if (speed > 25) s.events.push({ kind: 'wall', speed, x: s.puck.x, y: s.puck.y }); }

// Un fotograma: dt real (se recorta) repartido en subpasos fijos. `bots` lista los bandos que
// piensa la máquina (en el juego solo 'bot'; en las pruebas, los dos).
export function step(s, dt, bots = ['bot']) {
  s.events = [];
  if (s.over) return s;
  dt = Math.min(dt, 1 / 20);
  for (let t = 0; t < dt - 1e-9 && !s.over; t += DT) sub(s, Math.min(DT, dt - t), bots);
  return s;
}

function sub(s, dt, bots) {
  s.t += dt;
  for (const k in s.hitCool) s.hitCool[k] -= dt;
  for (const side of bots) {
    const d = side === 'bot' ? s.diff : (s.foeDiff || s.diff);
    s.ai[side] = (s.ai[side] ?? 0) - dt;
    if (s.ai[side] <= 0) { s.ai[side] = d.react; think(s, side); }
  }
  drive(s.me, bots.includes('me') ? (s.foeDiff || s.diff).speed : PLAYER_MAX, dt);
  drive(s.bot, s.diff.speed, dt);
  if (s.pause > 0) { s.pause -= dt; return; }
  const p = s.puck, f = Math.exp(-FRICTION * dt);
  p.vx *= f; p.vy *= f;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  bounceMallet(s, s.me);
  bounceMallet(s, s.bot);
  const scored = walls(s);
  if (scored) {
    s.score[scored] += 1;
    s.events.push({ kind: 'goal', by: scored, x: clamp(p.x, GOAL[0], GOAL[1]), y: scored === 'me' ? 0 : H });
    if (s.score[scored] >= GOALS) { s.over = scored === 'me' ? 'win' : 'lose'; return; }
    serve(s, scored === 'me' ? 'bot' : 'me');
    return;
  }
  // Disco muerto justo en la raya: se saca de nuevo.
  const still = Math.hypot(p.vx, p.vy) < 6 && Math.abs(p.y - H / 2) < PUCK_R + 1;
  s.slow = still ? s.slow + dt : 0;
  if (s.slow > STALL_T) return serve(s, p.y < H / 2 ? 'bot' : 'me', 0.3);
  // Retenerlo en tu mitad más de HOLD_T pasa el saque al rival.
  const half = p.y > H / 2 ? 'me' : 'bot';
  s.hold = half === s.half ? s.hold + dt : 0;
  s.half = half;
  if (s.hold > HOLD_T) { s.events.push({ kind: 'hold', side: half }); serve(s, half === 'me' ? 'bot' : 'me', 0.6); }
}
