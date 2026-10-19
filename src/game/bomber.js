// Bomberman por turnos, fiel al de NES: arena apaisada con pilares, cajas, enemigos con su manera
// de moverse y la puerta de salida escondida bajo una caja. Cada acción del jugador avanza un tic.
const FUSE = 5, MAX_RANGE = 3; // la mecha corre en el mismo turno: cuatro jugadas antes de estallar
const L_JUMP = [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]];
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Los enemigos, como en el original, se distinguen por cómo se mueven:
//  peón   (Ballom) vaga despacio, sigue recto y gira al chocar; nunca caza.
//  alfil  vaga y, cerca de ti, se acerca en diagonal.
//  cañón  vaga y, si te tiene en línea a tiro, suelta una bomba y huye de ella.
//  caballo salta en L hacia ti cuando estás cerca (solo en Difícil).
export const FOES = {
  pawn: 'Vaga despacio y sigue recto hasta chocar.',
  bishop: 'Cerca de ti se acerca en diagonal.',
  cannon: 'Si te tiene en línea, suelta una bomba y huye.',
  knight: 'Salta en L hacia ti cuando estás cerca.',
};
// La dificultad crece a lo ancho y en quién sale; la arena es apaisada como la del original.
export const DIFFS = {
  facil: { name: 'Fácil', rows: 9, cols: 11, sight: 3, crates: 0.3, roster: ['pawn', 'pawn', 'bishop'] },
  normal: { name: 'Normal', rows: 11, cols: 13, sight: 4, crates: 0.38, roster: ['pawn', 'pawn', 'bishop', 'cannon'] },
  dificil: { name: 'Difícil', rows: 11, cols: 15, sight: 5, crates: 0.45, roster: ['pawn', 'bishop', 'cannon', 'knight', 'pawn'] },
};

const dist = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

export function newBomber(rng = Math.random, key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  const { rows, cols } = diff;
  const wall = (r, c) => r % 2 === 1 && c % 2 === 1;
  // La esquina de salida queda despejada: la primera bomba nunca es un suicidio obligado.
  const safe = (r, c) => r + c < 3 || (r === 0 && c < 4) || (c === 0 && r < 4);
  const cells = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (wall(r, c) ? 'wall' : !safe(r, c) && rng() < diff.crates ? 'crate' : null)));
  // Enemigos repartidos lejos del jugador, cada uno con su casilla y los cuatro lados respirables.
  const spots = [];
  for (let tries = 0; spots.length < diff.roster.length && tries < 500; tries++) {
    const r = Math.floor(rng() * rows), c = Math.floor(rng() * cols);
    if (wall(r, c) || r + c < 7 || spots.some((s) => dist(s, { r, c }) < 3)) continue;
    spots.push({ r, c });
  }
  const enemies = spots.map(({ r, c }, i) => {
    cells[r][c] = null;
    for (const [dr, dc] of DIRS) if (cells[r + dr]?.[c + dc] === 'crate') cells[r + dr][c + dc] = null;
    return { id: i, r, c, type: diff.roster[i], dir: DIRS[Math.floor(rng() * 4)], cool: 0 };
  });
  // La puerta va bajo una caja lejana; si no hubiera ninguna, queda a la vista en una casilla libre.
  const far = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (cells[r][c] === 'crate' && r + c >= (rows + cols) / 2) far.push({ r, c });
  const door = far.length ? far[Math.floor(rng() * far.length)] : { r: rows - 1, c: cols - 1 };
  if (!far.length) cells[door.r][door.c] = null;
  return { rows, cols, diff, cells, player: { r: 0, c: 0 }, enemies, bombs: [], blast: [], items: [], door, range: 2, maxBombs: 2, t: 0, over: null };
}

const inside = (s, r, c) => r >= 0 && c >= 0 && r < s.rows && c < s.cols;
const free = (s, r, c) => inside(s, r, c) && !s.cells[r][c] && !s.bombs.some((b) => b.r === r && b.c === c);
export const doorOpen = (s) => !s.cells[s.door.r][s.door.c];

// Casillas que alumbra una bomba: su casilla y, en cada dirección, hasta el alcance,
// cortando en el pilar y justo después de la primera caja.
function rays(s, bomb) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    for (let k = 1; k <= bomb.range; k++) {
      const r = bomb.r + dr * k, c = bomb.c + dc * k;
      if (!inside(s, r, c) || s.cells[r][c] === 'wall') break;
      const crate = s.cells[r][c] === 'crate';
      out.push({ r, c, crate });
      if (crate) break;
    }
  }
  return out;
}

export const blastOf = (s, bomb) => [{ r: bomb.r, c: bomb.c }, ...rays(s, bomb).map(({ r, c }) => ({ r, c }))];

function explode(s, bomb, out, rng) {
  s.bombs = s.bombs.filter((b) => b !== bomb);
  out.push([bomb.r, bomb.c]);
  for (const { r, c, crate } of rays(s, bomb)) {
    out.push([r, c]);
    const chain = s.bombs.find((b) => b.r === r && b.c === c);
    if (chain) explode(s, chain, out, rng);
    if (crate) {
      s.cells[r][c] = null;
      // Una de cada tres cajas deja mejora (nunca la de la puerta).
      if ((r !== s.door.r || c !== s.door.c) && rng() < 0.3) s.items.push({ r, c, kind: rng() < 0.5 ? 'bomb' : 'range' });
    }
  }
}

// Primer paso del camino más corto hacia el jugador (BFS por casillas libres).
function huntStep(s, e, p, clear) {
  const W = s.cols, start = e.r * W + e.c, goal = p.r * W + p.c;
  const prev = new Map([[start, start]]), q = [start];
  for (let i = 0; i < q.length && !prev.has(goal); i++) {
    const cur = q[i], r = Math.floor(cur / W), c = cur % W;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc, id = nr * W + nc;
      if (prev.has(id) || !(clear(nr, nc) || (nr === p.r && nc === p.c))) continue;
      prev.set(id, cur);
      q.push(id);
    }
  }
  if (!prev.has(goal)) return null;
  let cur = goal;
  while (prev.get(cur) !== start) cur = prev.get(cur);
  return [Math.floor(cur / W), cur % W];
}

// El paseo del original: sigue en su dirección y, al chocar, gira al azar.
function wander(e, clear, rng) {
  const ahead = [e.r + e.dir[0], e.c + e.dir[1]];
  if (clear(...ahead) && rng() < 0.85) return ahead;
  const opts = DIRS.filter(([dr, dc]) => clear(e.r + dr, e.c + dc));
  if (!opts.length) return null;
  e.dir = opts[Math.floor(rng() * opts.length)];
  return [e.r + e.dir[0], e.c + e.dir[1]];
}

// Salto propio (L o diagonal) que acerque; null si ninguno acerca.
function leap(e, p, set, clear, rng) {
  const d = ([r, c]) => Math.abs(r - p.r) + Math.abs(c - p.c);
  const moves = set.map(([dr, dc]) => [e.r + dr, e.c + dc]).filter(([r, c]) => clear(r, c) && d([r, c]) < d([e.r, e.c]));
  if (!moves.length) return null;
  const best = Math.min(...moves.map(d));
  const pool = moves.filter((o) => d(o) === best);
  return pool[Math.floor(rng() * pool.length)];
}

// ¿Ve el cañón al jugador en línea recta, sin pilares ni cajas en medio, a tiro de su bomba?
function inSight(s, e, p) {
  if (e.r !== p.r && e.c !== p.c) return false;
  const n = dist(e, p);
  if (n > 3 || n === 0) return false;
  const sr = Math.sign(p.r - e.r), sc = Math.sign(p.c - e.c);
  for (let k = 1; k < n; k++) if (s.cells[e.r + sr * k][e.c + sc * k]) return false;
  return true;
}

function moveFoe(s, e, p, clear, danger, rng) {
  const near = dist(e, p) <= 5;
  if (e.type === 'pawn') { e.slow = !e.slow; return e.slow ? null : wander(e, clear, rng); }
  if (e.type === 'cannon') {
    if (e.cool > 0) e.cool--;
    if (!e.cool && inSight(s, e, p) && !s.bombs.some((b) => b.r === e.r && b.c === e.c)) {
      s.bombs.push({ r: e.r, c: e.c, t: FUSE - 1, range: 2, foe: true });
      e.cool = 7;
      for (const { r, c } of blastOf(s, s.bombs[s.bombs.length - 1])) danger.add(r * 99 + c);
    }
    // Si está en una cruz que va a estallar, sale de ella antes que nada.
    if (danger.has(e.r * 99 + e.c)) {
      const out = DIRS.map(([dr, dc]) => [e.r + dr, e.c + dc]).filter(([r, c]) => clear(r, c));
      return out.find(([r, c]) => !danger.has(r * 99 + c)) || out[0] || null;
    }
    return wander(e, clear, rng);
  }
  // Los cazadores descansan uno de cada tres turnos: a tu misma velocidad no habría escapatoria.
  e.beat = ((e.beat || 0) + 1) % 3;
  if (!e.beat) return null;
  if (!near || dist(e, p) > s.diff.sight) return wander(e, clear, rng);
  if (e.type === 'bishop') return leap(e, p, DIAG, clear, rng) || wander(e, clear, rng);
  if (e.type === 'knight') return leap(e, p, L_JUMP, clear, rng) || huntStep(s, e, p, clear) || wander(e, clear, rng);
  return wander(e, clear, rng);
}

// action: { move: [dr, dc] } | { bomb: true } | { wait: true }. Devuelve false si no es válida.
export function step(s, action, rng = Math.random) {
  if (s.over) return false;
  const p = s.player;
  if (action.move) {
    const r = p.r + action.move[0], c = p.c + action.move[1];
    // Meterse en un enemigo no es una jugada: morir en la casilla pedida se lee como un fallo.
    if (!free(s, r, c) || s.enemies.some((e) => e.r === r && e.c === c)) return false;
    Object.assign(p, { r, c });
    const i = s.items.findIndex((it) => it.r === r && it.c === c);
    if (i >= 0) {
      const [it] = s.items.splice(i, 1);
      if (it.kind === 'bomb') s.maxBombs++; else s.range = Math.min(MAX_RANGE, s.range + 1);
    }
  } else if (action.bomb) {
    const mine = s.bombs.filter((b) => !b.foe).length;
    if (s.bombs.some((b) => b.r === p.r && b.c === p.c) || mine >= s.maxBombs) return false;
    s.bombs.push({ r: p.r, c: p.c, t: FUSE, range: s.range });
  } else if (!action.wait) return false;
  s.t++;
  s.blast = [];
  for (const b of s.bombs) b.t--;
  for (const b of [...s.bombs]) if (b.t <= 0 && s.bombs.includes(b)) explode(s, b, s.blast, rng);
  const hit = (r, c) => s.blast.some(([a, b]) => a === r && b === c);
  s.enemies = s.enemies.filter((e) => !hit(e.r, e.c));
  // Los enemigos ven venir las bombas a punto de estallar y no se meten en su cruz.
  const danger = new Set(s.bombs.filter((b) => b.t <= 2).flatMap((b) => blastOf(s, b)).map(({ r, c }) => r * 99 + c));
  const clear = (r, c) => free(s, r, c) && !s.enemies.some((o) => o.r === r && o.c === c) && !hit(r, c) && !danger.has(r * 99 + c);
  for (const e of s.enemies) {
    const pick = moveFoe(s, e, p, clear, danger, rng);
    if (pick) [e.r, e.c] = pick;
  }
  if (hit(p.r, p.c) || s.enemies.some((e) => e.r === p.r && e.c === p.c)) s.over = 'lose';
  // Como en el NES: con la arena limpia, la puerta abierta te saca del nivel.
  else if (!s.enemies.length && doorOpen(s) && p.r === s.door.r && p.c === s.door.c) s.over = 'win';
  return true;
}
