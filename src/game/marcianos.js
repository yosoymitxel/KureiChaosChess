// Matamarcianos: oleadas retro, disparo y vidas. Reglas puras, sin DOM.
export const COLS = 8;
export const ROWS = 8;
export const PLAYER_ROW = ROWS - 1;
const SHOT_STEP = 100; // el disparo atraviesa todo el tablero de una
const MAX_SHOTS = 3; // disparos en vuelo a la vez

// El reparto de cada oleada: peones al principio y las piezas de salto entran en las siguientes.
// La última es la gran horda (dos filas), anunciada como en los niveles de PvZ.
export const WAVES = [
  { types: ['pawn', 'pawn', 'pawn', 'pawn', 'pawn'] },
  { types: ['pawn', 'knight', 'pawn', 'pawn', 'bishop', 'pawn', 'knight'] },
  { types: ['knight', 'bishop', 'pawn', 'pawn', 'elephant', 'pawn', 'bishop', 'pawn'] },
  { horde: true, types: ['pawn', 'pawn', 'knight', 'bishop', 'pawn', 'elephant', 'pawn', 'knight', 'pawn', 'bishop', 'pawn', 'pawn'] },
];
// Cada pieza baja a su manera: el peón recto, el caballo corrido de columna, el alfil en diagonal
// rebotando en los bordes y el elefante, a veces, dos filas de golpe.
// Desde la segunda oleada, la pieza más baja de una columna dispara a veces (FIRE por descenso).
const FIRE = [0, 0.25, 0.35, 0.45];

// Vidas y pausa entre descensos (por oleada): Normal es el juego de siempre.
export const DIFFS = {
  facil: { name: 'Fácil', lives: 4, every: [6, 5, 4, 4] },
  normal: { name: 'Normal', lives: 3, every: [5, 4, 4, 4] },
  dificil: { name: 'Difícil', lives: 2, every: [4, 4, 3, 4] },
};

export function newMarcianos(rng = Math.random, key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  const s = { wave: 0, lives: diff.lives, diff, player: { col: Math.floor(COLS / 2) }, enemies: [], shots: [], bolts: [], zaps: [], events: [], tick: 0, over: null };
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
  s.enemies = types.map((type, i) => ({ id: `${s.wave}-${i}`, type, row: Math.floor(i / COLS), col: order[i % COLS], dir: rng() < 0.5 ? -1 : 1 }));
  s.shots = [];
  s.bolts = [];
  if (WAVES[s.wave].horde) s.events.push({ kind: 'horde' });
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

function descend(s, rng) {
  const taken = (r, c, me) => s.enemies.some((o) => o !== me && !o.pop && o.row === r && o.col === c);
  for (const e of s.enemies) {
    let col = e.col, rows = 1;
    if (e.type === 'knight') col = e.col + (rng() < 0.5 ? -1 : 1);
    else if (e.type === 'bishop') { if (e.col + e.dir < 0 || e.col + e.dir >= COLS) e.dir = -e.dir; col = e.col + e.dir; }
    else if (e.type === 'elephant' && rng() < 0.35) rows = 2;
    if (col < 0 || col >= COLS || taken(e.row + rows, col, e)) col = e.col;
    if (taken(e.row + rows, col, e)) rows = 1;
    e.row += Math.min(rows, PLAYER_ROW - e.row);
    e.col = col;
    const b = s.shots.find((x) => x.row === e.row && x.col === e.col);
    if (b) { e.pop = true; s.zaps.push({ row: e.row, col: e.col }); s.shots = s.shots.filter((x) => x !== b); continue; }
    if (e.row >= PLAYER_ROW) { e.pop = true; s.zaps.push({ row: PLAYER_ROW, col: e.col }); s.lives -= 1; }
  }
  s.enemies = s.enemies.filter((e) => !e.pop);
  // Fuego carmesí: la pieza más baja de una columna al azar suelta un proyectil.
  if (rng() < FIRE[s.wave] && s.enemies.length) {
    const shooter = s.enemies[Math.floor(rng() * s.enemies.length)];
    const low = s.enemies.filter((e) => e.col === shooter.col).sort((a, b) => b.row - a.row)[0];
    s.bolts.push({ row: low.row + 1, col: low.col });
  }
}

// Proyectiles carmesí: bajan dos filas por jugada; si llegan a tu fila en tu columna, pierdes una vida.
function fall(s) {
  s.bolts = s.bolts.flatMap((b) => {
    const row = b.row + 2;
    if (row >= PLAYER_ROW) {
      if (b.col === s.player.col) { s.lives -= 1; s.zaps.push({ row: PLAYER_ROW, col: b.col }); }
      return [];
    }
    return [{ row, col: b.col }];
  });
}

// action: { move: -1|1 }, { shoot: true } o { wait: true }. Devuelve false si la jugada no es válida.
export function step(s, action, rng = Math.random) {
  if (s.over) return false;
  if (action.move) {
    const col = s.player.col + action.move;
    if (col < 0 || col >= COLS) return false;
    s.player.col = col;
  } else if (action.shoot) {
    if (s.shots.length >= MAX_SHOTS) return false;
  } else if (!action.wait) return false;
  s.zaps = [];
  s.events = [];
  s.tick += 1;
  if (action.shoot) s.shots.push({ row: PLAYER_ROW - 1, col: s.player.col });
  s.shots = s.shots.flatMap((b) => climb(s, b));
  s.enemies = s.enemies.filter((e) => !e.pop);
  fall(s);
  if (s.tick % s.diff.every[Math.min(s.wave, s.diff.every.length - 1)] === 0) descend(s, rng);
  if (s.lives <= 0) s.over = 'lose';
  else if (!s.enemies.length) {
    if (s.wave + 1 >= WAVES.length) s.over = 'win';
    else { s.wave += 1; spawnWave(s, rng); }
  }
  return true;
}
