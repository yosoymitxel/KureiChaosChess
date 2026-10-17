// Ruta del caballo: pisa todas las casillas marcadas; las ya pisadas quedan cerradas.
// Las marcas salen de un paseo de caballo real, así que siempre hay solución.
export const SIZE = 5;
// Rutas cortas y con pocos aros para entrar; largas y cargadas para sufrir.
export const DIFFS = {
  facil: { name: 'Fácil', length: 8, marks: 3 },
  normal: { name: 'Normal', length: 11, marks: 6 },
  dificil: { name: 'Difícil', length: 14, marks: 9 },
};
const JUMPS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const k = (r, c) => r * SIZE + c;

export function newRoute(rng = Math.random, diff = DIFFS.normal) {
  for (;;) {
    const start = { r: Math.floor(rng() * SIZE), c: Math.floor(rng() * SIZE) };
    const path = [start], seen = new Set([k(start.r, start.c)]);
    while (path.length < diff.length) {
      const { r, c } = path[path.length - 1];
      const next = JUMPS.map(([a, b]) => ({ r: r + a, c: c + b })).filter((p) => p.r >= 0 && p.c >= 0 && p.r < SIZE && p.c < SIZE && !seen.has(k(p.r, p.c)));
      if (!next.length) break;
      const p = next[Math.floor(rng() * next.length)];
      path.push(p); seen.add(k(p.r, p.c));
    }
    if (path.length < diff.length) continue;
    const steps = path.slice(1);
    const targets = new Set([k(steps.at(-1).r, steps.at(-1).c)]);
    while (targets.size < diff.marks) { const p = steps[Math.floor(rng() * steps.length)]; targets.add(k(p.r, p.c)); }
    return { pos: start, visited: new Set([k(start.r, start.c)]), targets, over: null };
  }
}

export const jumps = (s) => JUMPS.map(([a, b]) => ({ r: s.pos.r + a, c: s.pos.c + b }))
  .filter((p) => p.r >= 0 && p.c >= 0 && p.r < SIZE && p.c < SIZE && !s.visited.has(k(p.r, p.c)));

export const isTarget = (s, r, c) => s.targets.has(k(r, c));
export const isVisited = (s, r, c) => s.visited.has(k(r, c));
export const remaining = (s) => [...s.targets].filter((t) => !s.visited.has(t)).length;

export function jump(s, r, c) {
  if (s.over || !jumps(s).some((p) => p.r === r && p.c === c)) return false;
  s.pos = { r, c };
  s.visited.add(k(r, c));
  if (!remaining(s)) s.over = 'win';
  else if (!jumps(s).length) s.over = 'lose';
  return true;
}
