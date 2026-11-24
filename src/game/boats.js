// Barquitos y koi que se manejan como teledirigidos: rumbo `h`, velocidad de avance `v` y deriva lateral
// (vx, vy). Lo usan el Jardín de Agua (src/view/pond.js) y la carrera. Sin DOM.
import { BOATS } from '../data/garden.js';

const TAU = Math.PI * 2;
export const wrap = (a) => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const newBoat = (kind, x, y, h = -Math.PI / 2) => ({ kind, x, y, h, v: 0, vx: 0, vy: 0 });

// Mando: { throttle: -1..1, steer: -1..1 } (teclado) o { aim: ángulo, mag: 0..1 } (joystick: hacia dónde ir).
export function control(b, input) {
  if (!input) return { throttle: 0, steer: 0 };
  if (input.aim == null) return input;
  // Zona muerta pequeña (un toque solo apunta) y gas que baja poco a poco cuanto más hay que girar.
  const d = wrap(input.aim - b.h), m = clamp((input.mag - 0.12) / 0.88, 0, 1);
  return { steer: clamp(d * 2.5, -1, 1), throttle: m * clamp(Math.cos(Math.max(0, Math.abs(d) - 0.6)), 0.2, 1) };
}

// Un paso: acelera hacia `throttle · top`, gira más cuanto más corre, la deriva se pega al rumbo según
// `grip` y en la orilla resbala (inside(x, y): si es agua). Devuelve la fuerza del golpe contra la orilla.
// Se mira el centro, la proa y la popa: el casco entero queda en el agua.
export const BOW = 2.6;
export function drive(b, input, dt, inside0, scale = 1) {
  const fits = (x, y, h = b.h) => { const c = Math.cos(h) * BOW, s = Math.sin(h) * BOW; return inside0(x, y) && inside0(x + c, y + s) && inside0(x - c, y - s); };
  const inside = (x, y) => fits(x, y);
  const st = BOATS[b.kind] || BOATS.papel, { throttle, steer } = control(b, input);
  const want = throttle * st.top * scale * (throttle < 0 ? 0.4 : 1);
  b.v += (want - b.v) * Math.min(1, st.accel * dt);
  // Escora: se inclina hacia dentro de la curva, más cuanto más corre (solo se dibuja).
  b.lean = (b.lean || 0) + (steer * 0.18 * clamp(Math.abs(b.v) / st.top, 0, 1) - (b.lean || 0)) * Math.min(1, dt * 6);
  const h = wrap(b.h + steer * st.turn * dt * clamp(Math.abs(b.v) / (st.top * 0.35), 0.45, 1) * Math.sign(b.v || 1));
  // Si al girar la proa o la popa tocarían la orilla, el casco se aparta un poco de ella; si no cabe, no gira.
  if (fits(b.x, b.y, h) || !fits(b.x, b.y)) b.h = h;
  else for (let k = 0; k < 8; k++) {
    const x = b.x + Math.cos(k * Math.PI / 4) * 0.35, y = b.y + Math.sin(k * Math.PI / 4) * 0.35;
    if (fits(x, y, h)) { b.x = x; b.y = y; b.h = h; break; }
  }
  const fx = Math.cos(b.h) * b.v, fy = Math.sin(b.h) * b.v, k = Math.min(1, st.grip * dt);
  b.vx += (fx - b.vx) * k; b.vy += (fy - b.vy) * k;
  const nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
  // Si un choque lo dejó fuera, sale por donde pueda.
  if (inside(nx, ny) || !inside(b.x, b.y)) { b.x = nx; b.y = ny; return 0; }
  // Contra la orilla: la normal sale de los lados del casco que tocan tierra. Rebota un poco y sigue de
  // lado; solo un golpe de verdad (no el roce al resbalar) frena el casco y la marcha.
  let wx = 0, wy = 0;
  for (let k = 0; k < 12; k++) { const a = k * TAU / 12; if (!inside(b.x + Math.cos(a) * 0.8, b.y + Math.sin(a) * 0.8)) { wx -= Math.cos(a); wy -= Math.sin(a); } }
  if (!wx && !wy) { wx = -b.vx; wy = -b.vy; } // tierra más fina que el sondeo: contra la marcha
  const wl = Math.hypot(wx, wy) || 1, n = [wx / wl, wy / wl];
  const vn = b.vx * n[0] + b.vy * n[1];
  if (vn < 0) {
    const blow = -vn > 1.5, tx = -n[1], ty = n[0], vt = b.vx * tx + b.vy * ty, keep = Math.sign(vt) * Math.max(0, Math.abs(vt) + vn * (blow ? 0.35 : 0.06));
    b.vx = tx * keep - n[0] * vn * (blow ? 0.3 : 0); b.vy = ty * keep - n[1] * vn * (blow ? 0.3 : 0);
    if (blow) b.v = Math.sign(b.v) * Math.max(0, Math.abs(b.v) + vn * 0.3);
  }
  const mx = b.x + b.vx * dt, my = b.y + b.vy * dt;
  if (inside(mx, my)) { b.x = mx; b.y = my; }
  else if (inside(b.x + n[0] * 0.05, b.y + n[1] * 0.05)) { b.x += n[0] * 0.05; b.y += n[1] * 0.05; }
  return Math.max(0, -vn);
}
