// Matamaecianos: oleadas retro, disparo y tres vidas. Reglas puras, sin DOM.
export const COLS = 8;
export const ROWS = 8;
export const PLAYER_ROW = ROWS - 1;
export const MAX_LIVES = 3;
const SHOT_STEP = 4; // filas que sube cada disparo por jugada
const MAX_SHOTS = 3; // disparos en vuelo a la vez

// Oleada a oleada suben los enemigos y se acorta la pausa entre descensos.
export const WAVES = [
  { types: ['pawn', 'pawn', 'pawn', 'pawn', 'pawn'], every: 4 },
  { types: ['pawn', 'knight', 'pawn', 'pawn', 'bishop', 'pawn', 'knight'], every: 3 },
  { types: ['knight', 'bishop', 'pawn', 'pawn', 'elephant', 'pawn', 'bishop', 'pawn'], every: 2 },
];

export function newMarcianos(rng = Math.random) {
  const s = { wave: 0, lives: MAX_LIVES, player: { col: Math.floor(COLS / 2) }, enemies: [], shots: [], zaps: [], tick: 0, over: null };
  spawnWave(s, rng);
  return s;
}

function spawnWave(s, rng) {
  const types = [...WAVES[s.wave].types];
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  // Columnas barajadas: cada oleada cae en un reparto distinto y ninguna fila se amontona.
  const order = [...Array(COLS).keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  s.enemies = types.map((type, i) => ({ id: `${s.wave}-${i}`, type, row: Math.floor(i / COLS), col: order[i % COLS] }));
  s.shots = [];
}

// Un disparo trepa SHOT_STEP filas por jugada y muere en el primer enemigo que cruza.
function climb(s, b) {
  for (let r = b.row; r >= Math.max(0, b.row - SHOT_STEP); r--) {
    const hit = s.enemies.find((e) => !e.pop && e.row === r && e.col === b.col);
    if (hit) { hit.pop = true; s.zaps.push({ row: r, col: b.col }); return []; }
  }
  const row = b.row - SHOT_STEP;
  return row < 0 ? [] : [{ row, col: b.col }];
}

function descend(s) {
  for (const e of s.enemies) {
    e.row += 1;
    const b = s.shots.find((x) => x.row === e.row && x.col === e.col);
    if (b) { e.pop = true; s.zaps.push({ row: e.row, col: e.col }); s.shots = s.shots.filter((x) => x !== b); continue; }
    if (e.row >= PLAYER_ROW) { e.pop = true; s.zaps.push({ row: PLAYER_ROW, col: e.col }); s.lives -= 1; }
  }
  s.enemies = s.enemies.filter((e) => !e.pop);
}

// action: { move: -1|1 } o { shoot: true }. Devuelve false si la jugada no es válida.
export function step(s, action, rng = Math.random) {
  if (s.over) return false;
  if (action.move) {
    const col = s.player.col + action.move;
    if (col < 0 || col >= COLS) return false;
    s.player.col = col;
  } else if (action.shoot) {
    if (s.shots.length >= MAX_SHOTS) return false;
  } else return false;
  s.zaps = [];
  s.tick += 1;
  if (action.shoot) s.shots.push({ row: PLAYER_ROW - 1, col: s.player.col });
  s.shots = s.shots.flatMap((b) => climb(s, b));
  s.enemies = s.enemies.filter((e) => !e.pop);
  if (s.tick % WAVES[s.wave].every === 0) descend(s);
  if (s.lives <= 0) s.over = 'lose';
  else if (!s.enemies.length) {
    if (s.wave + 1 >= WAVES.length) s.over = 'win';
    else { s.wave += 1; spawnWave(s, rng); }
  }
  return true;
}
