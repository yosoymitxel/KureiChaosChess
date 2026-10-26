// Ventisca: un lago helado con bloques de hielo y agujeros de agua (referencia: Kickle Cubicle, NES,
// y las cuevas de hielo). La torre resbala en línea recta hasta chocar con un bloque o el borde; si
// cruza un agujero, se hunde. Las monedas se recogen al pasar por encima y, con todas, se sale por
// la bandera. La ventisca solo deja ver los bloques cerca de la torre; lo visto queda a la vista.

export const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
// `fog`: casillas de vista; `slack`: jugadas de más sobre la solución más corta.
export const DIFFS = {
  facil: { name: 'Fácil', n: 7, blocks: 7, holes: 2, coins: 2, fog: 3, slack: 6 },
  normal: { name: 'Normal', n: 8, blocks: 9, holes: 3, coins: 3, fog: 2, slack: 4 },
  dificil: { name: 'Difícil', n: 9, blocks: 12, holes: 4, coins: 3, fog: 2, slack: 2 },
};

const k = (r, c) => `${r},${c}`;

// Hasta dónde llega deslizando desde (r, c) en `dir`: { row, col, path, sunk }.
export function slide(s, r, c, dir) {
  const [dr, dc] = DIRS[dir], path = [];
  for (;;) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= s.n || nc >= s.n || s.blocks.has(k(nr, nc))) break;
    r = nr; c = nc;
    path.push([r, c]);
    if (s.holes.has(k(r, c))) return { row: r, col: c, path, sunk: true };
    if (r === s.exit[0] && c === s.exit[1] && s.coins.every((x) => s.got.has(x) || path.some(([a, b]) => k(a, b) === x))) break;
  }
  return { row: r, col: c, path, sunk: false };
}

// Jugadas mínimas para coger todas las monedas y salir; Infinity si no se puede.
export function shortest(s) {
  const all = (1 << s.coins.length) - 1, start = { r: s.at[0], c: s.at[1], m: 0 };
  const id = (x) => `${x.r},${x.c},${x.m}`, seen = new Set([id(start)]);
  let front = [start];
  for (let d = 0; d < 60 && front.length; d++) {
    const next = [];
    for (const x of front) for (let dir = 0; dir < 4; dir++) {
      const t = { ...s, got: new Set(s.coins.filter((_, i) => x.m & (1 << i))) }, res = slide(t, x.r, x.c, dir);
      if (res.sunk || (res.row === x.r && res.col === x.c)) continue;
      let m = x.m;
      for (const [a, b] of res.path) { const i = s.coins.indexOf(k(a, b)); if (i >= 0) m |= 1 << i; }
      if (m === all && res.row === s.exit[0] && res.col === s.exit[1]) return d + 1;
      const y = { r: res.row, c: res.col, m };
      if (!seen.has(id(y))) { seen.add(id(y)); next.push(y); }
    }
    front = next;
  }
  return Infinity;
}

export function newBlizzard(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal, n = diff.n;
  for (let tries = 0; ; tries++) {
    const cells = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c]);
    const pick = () => cells.splice(Math.floor(rng() * cells.length), 1)[0];
    const at = [n - 1, Math.floor(rng() * n)];
    cells.splice(cells.findIndex(([r, c]) => r === at[0] && c === at[1]), 1);
    const exit = cells.splice(cells.findIndex(([r]) => r === 0) + Math.floor(rng() * (n - 1)), 1)[0];
    const s = { diff, n, at, exit, blocks: new Set(), holes: new Set(), coins: [], got: new Set(), moves: 0, over: null, seen: new Set() };
    for (let i = 0; i < diff.blocks; i++) s.blocks.add(k(...pick()));
    for (let i = 0; i < diff.holes; i++) s.holes.add(k(...pick()));
    for (let i = 0; i < diff.coins; i++) s.coins.push(k(...pick()));
    const best = shortest(s);
    if (best === Infinity || (best < diff.coins + 2 && tries < 200)) continue;
    s.best = best;
    s.limit = best + diff.slack;
    look(s);
    return s;
  }
}

// La ventisca: se ve hasta `fog` casillas de la torre (en línea recta o no).
export function look(s) {
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) if (Math.max(Math.abs(r - s.at[0]), Math.abs(c - s.at[1])) <= s.diff.fog) s.seen.add(k(r, c));
}

// Una jugada: resbalar en `dir`. Devuelve el resultado de slide (o null si no se mueve).
export function move(s, dir) {
  if (s.over) return null;
  const res = slide(s, s.at[0], s.at[1], dir);
  if (res.row === s.at[0] && res.col === s.at[1]) return null;
  for (const [a, b] of res.path) if (s.coins.includes(k(a, b))) s.got.add(k(a, b));
  s.at = [res.row, res.col];
  s.moves += 1;
  look(s);
  if (res.sunk) s.over = 'lose';
  else if (s.got.size === s.coins.length && res.row === s.exit[0] && res.col === s.exit[1]) s.over = 'win';
  else if (s.moves >= s.limit) s.over = 'lose';
  return res;
}
