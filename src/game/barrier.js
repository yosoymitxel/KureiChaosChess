// Barrera (tipo Quoridor): llega a la fila contraria; en vez de mover puedes poner una valla de dos casillas.
export const N = 7;
// Más vallas premian a quien sabe tapar (tú); menos convierten la partida en carrera pura.
export const DIFFS = {
  facil: { name: 'Fácil', fences: 7 },
  normal: { name: 'Normal', fences: 5 },
  dificil: { name: 'Difícil', fences: 3 },
};
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export const newBarrier = (key = 'normal') => {
  const fences = (DIFFS[key] || DIFFS.normal).fences;
  return {
    pos: { light: { r: N - 1, c: 3 }, dark: { r: 0, c: 3 } },
    goal: { light: 0, dark: N - 1 },
    left: { light: fences, dark: fences },
    walls: [], turn: 'light', over: null,
  };
};

// Valla h en (r,c): corta entre filas r y r+1, columnas c y c+1. Valla v: entre columnas c y c+1, filas r y r+1.
const blocks = (walls, r, c, dr, dc) => walls.some((w) => (dr
  ? w.o === 'h' && w.r === Math.min(r, r + dr) && (w.c === c || w.c === c - 1)
  : w.o === 'v' && w.c === Math.min(c, c + dc) && (w.r === r || w.r === r - 1)));

const other = (who) => (who === 'light' ? 'dark' : 'light');

export function steps(s, who) {
  const { r, c } = s.pos[who], o = s.pos[other(who)];
  return DIRS.map(([dr, dc]) => ({ r: r + dr, c: c + dc, dr, dc }))
    .filter((m) => m.r >= 0 && m.c >= 0 && m.r < N && m.c < N && !blocks(s.walls, r, c, m.dr, m.dc) && !(m.r === o.r && m.c === o.c));
}

// Casillas hasta la meta ignorando al rival (BFS); Infinity si no hay camino.
export function distance(s, who, walls = s.walls) {
  const seen = new Set([s.pos[who].r * N + s.pos[who].c]);
  let front = [s.pos[who]], d = 0;
  while (front.length) {
    if (front.some((p) => p.r === s.goal[who])) return d;
    const next = [];
    for (const { r, c } of front) for (const [dr, dc] of DIRS) {
      const rr = r + dr, cc = c + dc, k = rr * N + cc;
      if (rr < 0 || cc < 0 || rr >= N || cc >= N || seen.has(k) || blocks(walls, r, c, dr, dc)) continue;
      seen.add(k); next.push({ r: rr, c: cc });
    }
    front = next; d++;
  }
  return Infinity;
}

export function canWall(s, w) {
  if (s.left[s.turn] <= 0 || w.r < 0 || w.c < 0 || w.r > N - 2 || w.c > N - 2) return false;
  const clash = s.walls.some((x) => (x.r === w.r && x.c === w.c)
    || (x.o === w.o && (w.o === 'h' ? x.r === w.r && Math.abs(x.c - w.c) === 1 : x.c === w.c && Math.abs(x.r - w.r) === 1)));
  if (clash) return false;
  const walls = [...s.walls, w];
  return distance(s, 'light', walls) < Infinity && distance(s, 'dark', walls) < Infinity;
}

// action: { move: {r,c} } | { wall: {o,r,c} }
export function act(s, action) {
  if (s.over) return false;
  const who = s.turn;
  if (action.move) {
    if (!steps(s, who).some((m) => m.r === action.move.r && m.c === action.move.c)) return false;
    s.pos[who] = { r: action.move.r, c: action.move.c };
    if (s.pos[who].r === s.goal[who]) s.over = who;
  } else {
    if (!canWall(s, action.wall)) return false;
    s.walls.push(action.wall);
    s.left[who]--;
  }
  s.turn = other(who);
  if (!s.over && !steps(s, s.turn).length) s.turn = who;
  return true;
}

// Bot: si va por delante avanza por el camino más corto; si no, pone la valla que más alarga tu camino.
export function botAction(s) {
  const me = s.turn, foe = other(me);
  const best = () => steps(s, me).map((m) => {
    const saved = s.pos[me]; s.pos[me] = m; const d = distance(s, me); s.pos[me] = saved; return { m, d };
  }).sort((a, b) => a.d - b.d)[0]?.m;
  const mine = distance(s, me), theirs = distance(s, foe);
  if (s.left[me] > 0 && theirs <= mine) {
    let pick = null, gain = 0;
    for (const o of ['h', 'v']) for (let r = 0; r < N - 1; r++) for (let c = 0; c < N - 1; c++) {
      const w = { o, r, c };
      if (!canWall(s, w)) continue;
      const g = distance(s, foe, [...s.walls, w]) - theirs - (distance(s, me, [...s.walls, w]) - mine);
      if (g > gain) { gain = g; pick = w; }
    }
    if (pick) return { wall: pick };
  }
  const m = best();
  return m ? { move: { r: m.r, c: m.c } } : null;
}
