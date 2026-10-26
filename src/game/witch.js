// La bruja: un laberinto a lo Pac-Man (Namco, NES). Tu rey recoge todas las monedas, un paso por
// turno; las brujas avanzan un paso recto por turno y lo cazan. Las pócimas las asustan unos turnos:
// entonces huyen y el rey puede atraparlas (vuelven a su casa al rato).
export const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const KING = [...DIRS, [-1, -1], [-1, 1], [1, -1], [1, 1]];
// `chase`: probabilidad de ir por el camino más corto hacia el rey (si no, un paso al azar).
export const DIFFS = {
  facil: { name: 'Fácil', n: 7, walls: 8, coins: 12, witches: 2, chase: 0.55, scared: 7 },
  normal: { name: 'Normal', n: 8, walls: 11, coins: 16, witches: 3, chase: 0.7, scared: 6 },
  dificil: { name: 'Difícil', n: 8, walls: 11, coins: 18, witches: 3, chase: 0.85, scared: 5 },
};
const k = (r, c) => `${r},${c}`;
const free = (s, r, c) => r >= 0 && c >= 0 && r < s.n && c < s.n && !s.walls.has(k(r, c));

// Distancias (en pasos rectos) desde (r, c) a todo el laberinto.
function dist(s, r, c) {
  const d = new Map([[k(r, c), 0]]), q = [[r, c]];
  while (q.length) {
    const [a, b] = q.shift();
    for (const [dr, dc] of DIRS) if (free(s, a + dr, b + dc) && !d.has(k(a + dr, b + dc))) { d.set(k(a + dr, b + dc), d.get(k(a, b)) + 1); q.push([a + dr, b + dc]); }
  }
  return d;
}

export function newWitch(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal, n = diff.n;
  for (;;) {
    const s = { diff, n, walls: new Set(), coins: new Set(), potions: new Set(), witches: [], scared: 0, turn: 0, over: null, rng };
    // Muros en tramos de dos, en espejo izquierda-derecha, como un laberinto de recreativa.
    for (let i = 0; i < diff.walls; i++) {
      const r = 1 + Math.floor(rng() * (n - 2)), c = Math.floor(rng() * Math.ceil(n / 2)), h = rng() < 0.5;
      for (const [a, b] of [[r, c], h ? [r, c + 1] : [r + 1, c]]) if (a < n - 1 && b < n) { s.walls.add(k(a, b)); s.walls.add(k(a, n - 1 - b)); }
    }
    s.king = { row: n - 1, col: Math.floor(n / 2) };
    s.walls.delete(k(s.king.row, s.king.col));
    const home = [0, Math.floor(n / 2)];
    s.walls.delete(k(...home));
    const reach = dist(s, s.king.row, s.king.col);
    const open = [...reach.keys()];
    if (open.length < n * n * 0.7 || !reach.has(k(...home))) continue;
    s.home = home;
    for (let i = 0; i < diff.witches; i++) s.witches.push({ id: 'w' + i, row: home[0], col: home[1], out: i * 2 });
    const spots = open.filter((x) => x !== k(s.king.row, s.king.col) && x !== k(...home)).sort(() => rng() - 0.5);
    for (const x of spots.slice(0, diff.coins)) s.coins.add(x);
    // Dos pócimas lejos de la casa de las brujas.
    const fromHome = dist(s, ...home);
    for (const x of spots.slice(diff.coins).sort((a, b) => fromHome.get(a) - fromHome.get(b)).slice(-2)) s.potions.add(x);
    return s;
  }
}

export const kingMoves = (s) => KING.map(([dr, dc]) => [s.king.row + dr, s.king.col + dc]).filter(([r, c]) => free(s, r, c));

// Choques: una bruja en la casilla del rey lo caza, salvo que esté asustada (entonces cae ella).
function clash(s, events) {
  for (const w of s.witches) {
    if (w.out > 0 || w.row !== s.king.row || w.col !== s.king.col) continue;
    if (s.scared) { events.push({ kind: 'eat', id: w.id }); Object.assign(w, { row: s.home[0], col: s.home[1], out: 4 }); }
    else { s.over = 'lose'; events.push({ kind: 'caught', id: w.id }); }
  }
}

// El turno: el rey da su paso, recoge, y después las brujas dan el suyo. Devuelve los sucesos.
export function step(s, r, c) {
  if (s.over || !kingMoves(s).some(([a, b]) => a === r && b === c)) return null;
  const events = [];
  Object.assign(s.king, { row: r, col: c });
  if (s.coins.delete(k(r, c))) events.push({ kind: 'coin' });
  if (s.potions.delete(k(r, c))) { s.scared = s.diff.scared; events.push({ kind: 'potion' }); }
  clash(s, events);
  if (!s.over && !s.coins.size) { s.over = 'win'; return events; }
  if (s.over) return events;
  const toKing = dist(s, s.king.row, s.king.col);
  const taken = new Set();
  for (const w of s.witches) {
    if (w.out > 0) { w.out -= 1; continue; }
    const opts = DIRS.map(([dr, dc]) => [w.row + dr, w.col + dc]).filter(([a, b]) => free(s, a, b) && !taken.has(k(a, b)));
    if (!opts.length) continue;
    const d = (x) => toKing.get(k(...x)) ?? 99;
    opts.sort((a, b) => (s.scared ? d(b) - d(a) : d(a) - d(b)));
    const [a, b] = s.rng() < s.diff.chase ? opts[0] : opts[Math.floor(s.rng() * opts.length)];
    Object.assign(w, { row: a, col: b });
    taken.add(k(a, b));
  }
  clash(s, events);
  if (s.scared) s.scared -= 1;
  s.turn += 1;
  return events;
}
