// Bolos de nuez (como Wall-nut Bowling de PvZ): las piezas carmesí avanzan de derecha a izquierda
// por sus carriles; una cinta trae fichas que se lanzan desde la zona de la izquierda (hasta la línea roja).
// La ficha rebota en diagonal al chocar y sigue; la explosiva limpia un 3×3.
export const LAUNCH_COLS = 2, BELT_MAX = 4;
// La dificultad crece a lo ancho (más carriles que vigilar) y a lo largo (más recorrido para rebotar),
// además de cuántas piezas hay que derribar y el ritmo de entrada y de la cinta.
export const DIFFS = {
  facil: { name: 'Fácil', rows: 5, cols: 10, goal: 8, horde: 5, enemyEvery: 5, spawnEvery: 8, beltEvery: 3 },
  normal: { name: 'Normal', rows: 6, cols: 11, goal: 12, horde: 8, enemyEvery: 4, spawnEvery: 4, beltEvery: 3 },
  dificil: { name: 'Difícil', rows: 7, cols: 12, goal: 15, horde: 9, enemyEvery: 3, spawnEvery: 5, beltEvery: 3 },
};
// Vida por tipo, como cono, cubo y periódico en el original. El caballo salta la primera ficha
// (el saltador de pértiga) y la reina acelera al perder su primera vida.
export const HP = { pawn: 1, knight: 2, bishop: 2, rook: 3, queen: 4 };
// Qué entra según el avance: al principio peones; hacia el final, piezas duras.
const MIX = [['pawn', 6, 1], ['knight', 1, 3], ['bishop', 1, 3], ['rook', 0, 3], ['queen', 0, 1.5]];
const pickType = (s, rng) => {
  const t = Math.min(1, s.spawned / s.diff.goal);
  const w = MIX.map(([type, a, b]) => [type, a + (b - a) * t]);
  let x = rng() * w.reduce((n, [, v]) => n + v, 0);
  return w.find(([, v]) => (x -= v) < 0)?.[0] || 'pawn';
};
// Primer rebote según el carril, como en el original: arriba siempre baja, abajo siempre sube.
const down = (s, r) => 1 - r / (s.rows - 1);

const pickLane = (s, rng) => {
  const free = [...Array(s.rows).keys()].filter((r) => !s.enemies.some((e) => e.r === r && e.c >= s.cols - 3));
  const pool = free.length ? free : [...Array(s.rows).keys()];
  return pool[Math.floor(rng() * pool.length)];
};
const token = (rng) => (rng() < 1 / 7 ? 'boom' : 'nut');

export const newBowling = (key = 'normal', rng = Math.random) => {
  const diff = DIFFS[key] || DIFFS.normal;
  return {
    t: 0, balls: [], enemies: [], down: 0, spawned: 0, over: null, nextId: 0, best: 0, horde: null,
    belt: [token(rng), 'nut'], diff, rows: diff.rows, cols: diff.cols, events: [],
  };
};

export const canLaunch = (s, r, c) => !s.over && s.belt.length > 0 && c < LAUNCH_COLS && !s.enemies.some((e) => e.r === r && e.c === c) && !s.balls.some((b) => b.r === r && b.c === c);

export function launch(s, r, c = 0) {
  if (!canLaunch(s, r, c)) return false;
  s.balls.push({ r, c, dr: 0, kind: s.belt.shift(), chain: 0 });
  return true;
}

export function tick(s, rng = Math.random) {
  if (s.over) return;
  s.t++;
  s.events = [];
  if (s.t % s.diff.beltEvery === 0 && s.belt.length < BELT_MAX) s.belt.push(token(rng));
  const kill = (e) => { s.enemies = s.enemies.filter((x) => x !== e); s.down++; };
  const collide = () => {
    for (const b of [...s.balls]) {
      const hit = s.enemies.find((e) => e.r === b.r && e.c === b.c);
      if (!hit) continue;
      if (hit.vault) { hit.vault = false; hit.c--; s.events.push({ kind: 'vault', e: hit }); continue; }
      if (b.kind === 'boom') {
        const caught = s.enemies.filter((e) => Math.abs(e.r - b.r) <= 1 && Math.abs(e.c - b.c) <= 1);
        caught.forEach(kill);
        s.balls = s.balls.filter((x) => x !== b);
        s.events.push({ kind: 'boom', r: b.r, c: b.c, n: caught.length });
        continue;
      }
      hit.hp--;
      if (hit.type === 'queen' && hit.hp === HP.queen - 1) hit.fast = true;
      if (hit.hp <= 0) kill(hit);
      b.chain++;
      s.best = Math.max(s.best, b.chain);
      if (b.chain > 1) s.events.push({ kind: 'chain', r: b.r, c: b.c, n: b.chain });
      b.dr = b.dr ? -b.dr : rng() < down(s, b.r) ? 1 : -1;
    }
  };
  for (const b of s.balls) {
    b.c++;
    b.r += b.dr;
    if (b.r < 0 || b.r >= s.rows) { b.dr = -b.dr; b.r += 2 * b.dr; }
  }
  collide();
  s.balls = s.balls.filter((b) => b.c < s.cols);
  const every = s.diff.enemyEvery;
  const moved = s.enemies.filter((e) => s.t % (e.fast ? Math.max(1, every >> 1) : every) === 0);
  for (const e of moved) e.c--;
  if (moved.length) collide();
  const spawn = (r) => {
    const type = pickType(s, rng);
    s.enemies.push({ id: s.nextId++, r, c: s.cols - 1, type, hp: HP[type], maxHp: HP[type], vault: type === 'knight' });
    s.spawned++;
  };
  // Como en PvZ: tras el goteo llega el banderín y una gran horda; la partida acaba al limpiarla,
  // nunca de golpe al llegar a un número.
  if (s.horde == null && s.spawned < s.diff.goal) {
    if (s.t % s.diff.spawnEvery === 1) spawn(pickLane(s, rng));
  } else if (s.horde == null && !s.enemies.some((e) => e.c > s.cols - 4)) {
    s.horde = s.diff.horde;
    if (s.belt.length < BELT_MAX) s.belt.push('boom'); // la cinta te da una explosiva para recibirla
    s.events.push({ kind: 'horde' });
  } else if (s.horde > 0 && s.t % 3 === 0) {
    spawn((s.spawned * 2) % s.rows);
    s.horde--;
  }
  if (s.enemies.some((e) => e.c < 0)) s.over = 'lose';
  else if (s.horde === 0 && !s.enemies.length) s.over = 'win';
}
