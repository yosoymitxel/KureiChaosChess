// Damas a ciegas: cada uno pone sus damas donde quiere y elige hacia dónde dispara cada una (una de
// las ocho direcciones de la dama). Las rivales no se ven: aparecen al azar justo antes de la
// descarga, y todas disparan a la vez. El disparo sigue su línea hasta la primera pieza: si es
// rival la derriba, si es propia se queda ahí. Tras cada descarga las supervivientes se vuelven a
// esconder. Gana quien deje al otro sin damas; si se acaban las descargas, quien tenga más.

export const DIRS = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
// `aim`: probabilidad de que una rival elija la dirección con la línea más larga (si no, al azar).
export const DIFFS = {
  facil: { name: 'Fácil', n: 6, mine: 3, foes: 3, volleys: 4, aim: 0.3 },
  normal: { name: 'Normal', n: 7, mine: 3, foes: 4, volleys: 4, aim: 0.6 },
  dificil: { name: 'Difícil', n: 8, mine: 3, foes: 5, volleys: 4, aim: 0.9 },
};

export function newBlind(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal;
  return { diff, n: diff.n, mine: [], foes: diff.foes, volley: 0, last: null, over: null, rng, ids: 0 };
}

const inside = (s, r, c) => r >= 0 && c >= 0 && r < s.n && c < s.n;
export const occupied = (pieces, r, c) => pieces.find((p) => p.row === r && p.col === c);

// Casillas que recorre el disparo de `q` hasta la primera pieza (incluida) o el borde.
export function ray(s, q, pieces) {
  const [dr, dc] = DIRS[q.dir], cells = [];
  for (let r = q.row + dr, c = q.col + dc; inside(s, r, c); r += dr, c += dc) {
    cells.push([r, c]);
    if (occupied(pieces, r, c)) break;
  }
  return cells;
}

// Poner, mover o girar: un toque en casilla vacía pone una dama (antes de la primera descarga; luego,
// o con todas puestas, mueve la elegida); un toque en una dama propia la gira 45°. Las caídas no vuelven.
export function place(s, r, c, sel) {
  const q = occupied(s.mine, r, c);
  if (q) { q.dir = (q.dir + 1) % 8; return q; }
  if (!s.volley && s.mine.length < s.diff.mine) {
    const n = { id: 'm' + s.ids++, row: r, col: c, dir: r < s.n / 2 ? 4 : 0 };
    s.mine.push(n);
    return n;
  }
  if (sel) Object.assign(sel, { row: r, col: c });
  return sel;
}

// La descarga: las rivales salen en casillas libres al azar, eligen dirección y todas disparan.
// Devuelve { foes, shots: [{ from, to, kill }] } para animarla.
export function fire(s) {
  const rng = s.rng, free = [];
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) if (!occupied(s.mine, r, c)) free.push([r, c]);
  const foes = [];
  for (let i = 0; i < s.foes && free.length; i++) {
    const [row, col] = free.splice(Math.floor(rng() * free.length), 1)[0];
    foes.push({ id: 'f' + s.ids++, row, col, dir: 0, foe: true });
  }
  const all = [...s.mine, ...foes];
  for (const f of foes) {
    if (rng() < s.diff.aim) {
      const len = (d) => ray(s, { ...f, dir: d }, all).length;
      f.dir = [...DIRS.keys()].sort((a, b) => len(b) - len(a))[0];
    } else f.dir = Math.floor(rng() * 8);
  }
  const shots = all.map((q) => {
    const cells = ray(s, q, all), end = cells.at(-1), hit = end && occupied(all, ...end);
    return { from: q, to: end ? { row: end[0], col: end[1] } : { row: q.row, col: q.col }, kill: hit && !!hit.foe !== !!q.foe ? hit : null };
  });
  const dead = new Set(shots.map((x) => x.kill).filter(Boolean));
  s.mine = s.mine.filter((q) => !dead.has(q));
  const alive = foes.filter((f) => !dead.has(f));
  s.foes = alive.length;
  s.volley += 1;
  s.last = { foes, shots, dead: [...dead] };
  if (!s.foes) s.over = 'win';
  else if (!s.mine.length) s.over = 'lose';
  else if (s.volley >= s.diff.volleys) s.over = s.mine.length > s.foes ? 'win' : 'lose';
  return s.last;
}
