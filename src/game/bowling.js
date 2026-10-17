// Bolos de nuez: las piezas carmesí avanzan de derecha a izquierda por 5 carriles; lanzas fichas
// rodando desde la izquierda. Al chocar, la ficha rebota en diagonal y sigue.
export const ROWS = 5, COLS = 9;
// La dificultad mueve cuántas piezas hay que derribar y con qué ritmo entran; el paso del
// tiempo (TICK_MS en la pantalla) es el mismo en los tres, así que el pulso no cambia.
export const DIFFS = {
  facil: { name: 'Fácil', goal: 8, enemyEvery: 6, spawnEvery: 9, reload: 2 },
  normal: { name: 'Normal', goal: 12, enemyEvery: 4, spawnEvery: 6, reload: 3 },
  dificil: { name: 'Difícil', goal: 16, enemyEvery: 3, spawnEvery: 5, reload: 4 },
};
const TYPES = ['pawn', 'pawn', 'knight', 'bishop', 'rook'];
const HITS = { pawn: 1, knight: 2, bishop: 2, rook: 3 };

// Carril de la nuez nueva evitando los carriles con otra pegada al borde, para repartir la tanda.
const pickLane = (s, rng) => {
  const free = [...Array(ROWS).keys()].filter((r) => !s.enemies.some((e) => e.r === r && e.c >= COLS - 3));
  const pool = free.length ? free : [...Array(ROWS).keys()];
  return pool[Math.floor(rng() * pool.length)];
};

export const newBowling = (key = 'normal') => ({ t: 0, balls: [], enemies: [], down: 0, reload: 0, spawned: 0, over: null, nextId: 0, diff: DIFFS[key] || DIFFS.normal });

export function launch(s, row) {
  if (s.over || s.reload > 0 || s.enemies.some((e) => e.c === 0 && e.r === row)) return false;
  s.balls.push({ r: row, c: 0, dr: 0 });
  s.reload = s.diff.reload;
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
      hit.hp--;
      if (hit.hp <= 0) { s.enemies = s.enemies.filter((e) => e !== hit); s.down++; }
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
  if (s.t % s.diff.enemyEvery === 0) { for (const e of s.enemies) e.c--; collide(); }
  if (s.t % s.diff.spawnEvery === 1 && s.spawned < s.diff.goal + 6) {
    const type = TYPES[Math.floor(rng() * TYPES.length)];
    s.enemies.push({ id: s.nextId++, r: pickLane(s, rng), c: COLS - 1, type, hp: HITS[type], maxHp: HITS[type] });
    s.spawned++;
  }
  if (s.enemies.some((e) => e.c < 0)) s.over = 'lose';
  else if (s.down >= s.diff.goal) s.over = 'win';
  else if (s.spawned >= s.diff.goal + 6 && !s.enemies.length) s.over = 'lose';
}
