// Bolos de nuez (como Wall-nut Bowling de PvZ): las piezas carmesí avanzan de derecha a izquierda
// por 5 carriles; una cinta trae fichas que se lanzan desde la zona de la izquierda (hasta la línea roja).
// La ficha rebota en diagonal al chocar y sigue; la explosiva limpia un 3×3.
export const ROWS = 5, COLS = 9, LAUNCH_COLS = 3, BELT_MAX = 4;
// La dificultad mueve cuántas piezas hay que derribar, el ritmo de entrada y el de la cinta.
export const DIFFS = {
  facil: { name: 'Fácil', goal: 8, horde: 5, enemyEvery: 6, spawnEvery: 9, beltEvery: 4 },
  normal: { name: 'Normal', goal: 10, horde: 6, enemyEvery: 4, spawnEvery: 6, beltEvery: 4 },
  dificil: { name: 'Difícil', goal: 14, horde: 8, enemyEvery: 3, spawnEvery: 5, beltEvery: 5 },
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
// Primer rebote según el carril, con las probabilidades del original.
const DOWN = [1, 0.75, 0.5, 0.25, 0];

const pickLane = (s, rng) => {
  const free = [...Array(ROWS).keys()].filter((r) => !s.enemies.some((e) => e.r === r && e.c >= COLS - 3));
  const pool = free.length ? free : [...Array(ROWS).keys()];
  return pool[Math.floor(rng() * pool.length)];
};
const token = (rng) => (rng() < 1 / 7 ? 'boom' : 'nut');

export const newBowling = (key = 'normal', rng = Math.random) => ({
  t: 0, balls: [], enemies: [], down: 0, spawned: 0, over: null, nextId: 0, best: 0, horde: null,
  belt: [token(rng), 'nut'], diff: DIFFS[key] || DIFFS.normal, events: [],
});

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
      b.dr = b.dr ? -b.dr : rng() < DOWN[b.r] ? 1 : -1;
    }
  };
  for (const b of s.balls) {
    b.c++;
    b.r += b.dr;
    if (b.r < 0 || b.r >= ROWS) { b.dr = -b.dr; b.r += 2 * b.dr; }
  }
  collide();
  s.balls = s.balls.filter((b) => b.c < COLS);
  const every = s.diff.enemyEvery;
  const moved = s.enemies.filter((e) => s.t % (e.fast ? Math.max(1, every >> 1) : every) === 0);
  for (const e of moved) e.c--;
  if (moved.length) collide();
  const spawn = (r) => {
    const type = pickType(s, rng);
    s.enemies.push({ id: s.nextId++, r, c: COLS - 1, type, hp: HP[type], maxHp: HP[type], vault: type === 'knight' });
    s.spawned++;
  };
  // Como en PvZ: tras el goteo llega el banderín y una gran horda; la partida acaba al limpiarla,
  // nunca de golpe al llegar a un número.
  if (s.horde == null && s.spawned < s.diff.goal) {
    if (s.t % s.diff.spawnEvery === 1) spawn(pickLane(s, rng));
  } else if (s.horde == null && !s.enemies.some((e) => e.c > COLS - 4)) {
    s.horde = s.diff.horde;
    if (s.belt.length < BELT_MAX) s.belt.push('boom'); // la cinta te da una explosiva para recibirla
    s.events.push({ kind: 'horde' });
  } else if (s.horde > 0 && s.t % 3 === 0) {
    spawn((s.spawned * 2) % ROWS);
    s.horde--;
  }
  if (s.enemies.some((e) => e.c < 0)) s.over = 'lose';
  else if (s.horde === 0 && !s.enemies.length) s.over = 'win';
}
