// Bolos de nuez: las piezas carmesí avanzan de derecha a izquierda por 5 carriles; lanzas fichas
// rodando desde la izquierda. Al derribar una pieza la ficha rebota en diagonal y sigue.
export const ROWS = 5, COLS = 9, GOAL = 12;
const ENEMY_EVERY = 4, SPAWN_EVERY = 6, RELOAD = 3;
const TYPES = ['pawn', 'pawn', 'knight', 'bishop', 'rook'];

export const newBowling = () => ({ t: 0, balls: [], enemies: [], down: 0, reload: 0, spawned: 0, over: null, nextId: 0 });

export function launch(s, row) {
  if (s.over || s.reload > 0 || s.enemies.some((e) => e.c === 0 && e.r === row)) return false;
  s.balls.push({ r: row, c: 0, dr: 0 });
  s.reload = RELOAD;
  return true;
}

export function tick(s, rng = Math.random) {
  if (s.over) return;
  s.t++;
  if (s.reload > 0) s.reload--;
  const collide = () => {
    for (const b of s.balls) {
      const hit = s.enemies.find((e) => e.r === b.r && e.c === b.c);
      if (!hit) continue;
      s.enemies = s.enemies.filter((e) => e !== hit);
      s.down++;
      b.dr = b.dr || (b.r === 0 ? 1 : b.r === ROWS - 1 ? -1 : rng() < 0.5 ? -1 : 1);
    }
  };
  for (const b of s.balls) {
    b.c++;
    b.r += b.dr;
    if (b.r < 0 || b.r >= ROWS) { b.dr = -b.dr; b.r += 2 * b.dr; }
  }
  collide();
  s.balls = s.balls.filter((b) => b.c < COLS);
  if (s.t % ENEMY_EVERY === 0) { for (const e of s.enemies) e.c--; collide(); }
  if (s.t % SPAWN_EVERY === 1 && s.spawned < GOAL + 6) {
    s.enemies.push({ id: s.nextId++, r: Math.floor(rng() * ROWS), c: COLS - 1, type: TYPES[Math.floor(rng() * TYPES.length)] });
    s.spawned++;
  }
  if (s.enemies.some((e) => e.c < 0)) s.over = 'lose';
  else if (s.down >= GOAL) s.over = 'win';
  else if (s.spawned >= GOAL + 6 && !s.enemies.length) s.over = 'lose';
}
