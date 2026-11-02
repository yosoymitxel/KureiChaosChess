// Física de mesa compartida (hockey, golf y los que vengan): círculos que chocan, bandas y subpasos fijos.
// Cuerpos { x, y, vx, vy }; unidades de mesa (16 por casilla). Sin DOM.
export const DT = 1 / 240; // subpaso fijo: ningún choque se salta a tope de velocidad

// Reparte un dt real (recortado a 1/20 s) en subpasos fijos mientras `go()` siga siendo cierto.
export function substeps(dt, fn, go = () => true) {
  dt = Math.min(dt, 1 / 20);
  for (let t = 0; t < dt - 1e-9 && go(); t += DT) fn(Math.min(DT, dt - t));
}

// Choque de un cuerpo móvil `b` contra uno que no cede (masa infinita) en (ox, oy) con velocidad
// (ovx, ovy). `min`: suma de radios; `ny0`: normal si están justo encima. Saca a `b` y, si se
// acercaban, lo rebota con elasticidad `e`. Devuelve la fuerza del golpe (0 si solo se tocaban).
export function collide(b, ox, oy, min, e, ovx = 0, ovy = 0, ny0 = -1) {
  const dx = b.x - ox, dy = b.y - oy, d = Math.hypot(dx, dy);
  if (d >= min) return 0;
  const nx = d ? dx / d : 0, ny = d ? dy / d : ny0;
  b.x = ox + nx * min;
  b.y = oy + ny * min;
  const rel = (b.vx - ovx) * nx + (b.vy - ovy) * ny;
  if (rel >= 0) return 0;
  b.vx -= (1 + e) * rel * nx;
  b.vy -= (1 + e) * rel * ny;
  return -rel || 1e-9;
}

// Bandas de la mesa [0, w] × [0, h] para un cuerpo de radio r. `open(b)` deja pasar por arriba y
// abajo (bocas de portería). `hit(speed)` avisa de cada rebote.
export function walls(b, r, w, h, e, hit, open) {
  if (b.x < r) { b.x = r; if (b.vx < 0) { hit?.(-b.vx); b.vx = -b.vx * e; } }
  if (b.x > w - r) { b.x = w - r; if (b.vx > 0) { hit?.(b.vx); b.vx = -b.vx * e; } }
  if (open?.(b)) return;
  if (b.y < r) { b.y = r; if (b.vy < 0) { hit?.(-b.vy); b.vy = -b.vy * e; } }
  if (b.y > h - r) { b.y = h - r; if (b.vy > 0) { hit?.(b.vy); b.vy = -b.vy * e; } }
}
