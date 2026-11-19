// Lo que rodea el agua en el Jardín de Agua y la carrera, dibujado en el lienzo del estanque (pond.decor):
// así comparte luz, paleta y modo píxel con el agua. Lenguaje del agua: piedra redonda en el borde, hierba
// con matas, juncos en las esquinas y madera para lo que se usa (muelle, salida).
import { LAND } from './pond.js';

const TAU = Math.PI * 2;
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function rock(ctx, x, y, r, rot) {
  ctx.fillStyle = 'rgba(20,25,29,0.3)'; ctx.beginPath(); ctx.ellipse(x + r * 0.2, y + r * 0.3, r, r * 0.8, rot, 0, TAU); ctx.fill();
  ctx.fillStyle = LAND.rock2; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.82, rot, 0, TAU); ctx.fill();
  ctx.fillStyle = LAND.rock; ctx.beginPath(); ctx.ellipse(x - r * 0.15, y - r * 0.18, r * 0.75, r * 0.6, rot, 0, TAU); ctx.fill();
}
function tufts(ctx, pts, pixel) {
  ctx.strokeStyle = LAND.tuft; ctx.lineWidth = pixel ? 0.5 : 0.25;
  for (const [x, y] of pts) for (const d of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.moveTo(x + d * 0.6, y); ctx.lineTo(x + d * 1.2, y - 1.1); ctx.stroke(); }
}
function reeds(ctx, x, y, n, T, pixel) {
  ctx.lineWidth = pixel ? 0.5 : 0.3; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.28 + Math.sin(T * 0.8 + i) * 0.04, l = 3.4 + (i % 3) * 0.9;
    const ex = x + Math.cos(a) * l + (i - n / 2) * 0.4, ey = y + Math.sin(a) * l;
    ctx.strokeStyle = i % 2 ? '#3f6a2a' : '#5f8a3a'; ctx.beginPath(); ctx.moveTo(x + (i - n / 2) * 0.4, y); ctx.lineTo(ex, ey); ctx.stroke();
    if (i % 2 === 0) { ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); ctx.ellipse(ex, ey, 0.35, 0.8, a + Math.PI / 2, 0, TAU); ctx.fill(); }
  }
  ctx.lineCap = 'butt';
}
function planks(ctx, x, y, w, h, along) {
  ctx.fillStyle = 'rgba(20,25,29,0.3)'; ctx.fillRect(x + 0.6, y + 0.8, w, h);
  const n = Math.round((along ? h : w) / 1.6);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? LAND.plank : LAND.plank2;
    if (along) ctx.fillRect(x, y + (i * h) / n, w, h / n - 0.15); else ctx.fillRect(x + (i * w) / n, y, w / n - 0.15, h);
  }
}

// Jardín de Agua (estanque cuadrado de lado S): marco de hierba, borde de piedras, juncos y el muelle.
export const PIER = { x: 15, y: 50, w: 6, h: 10 };
export const GARDEN_EDGE = 4.6;
export function gardenDecor(S) {
  const r = rng(7), stones = [];
  for (let k = 0; k < 4; k++) for (let t = 2; t < S - 2; t += 2.6 + r() * 1.4) {
    const [x, y] = [[t, 3], [S - 3, t], [S - t, S - 3], [3, S - t]][k];
    if (k === 2 && x > PIER.x - 1 && x < PIER.x + PIER.w + 1) continue;
    stones.push([x + (r() - 0.5) * 0.8, y + (r() - 0.5) * 0.8, 1.3 + r() * 0.8, r() * 3]);
  }
  const grass = Array.from({ length: 26 }, () => { const s = r() * S, side = Math.floor(r() * 4); return [[s, 1], [S - 1, s], [s, S - 1], [1, s]][side]; });
  return (ctx, T, pixel) => {
    ctx.fillStyle = LAND.grass;
    ctx.beginPath(); ctx.rect(0, 0, S, S); ctx.rect(GARDEN_EDGE - 1, S - GARDEN_EDGE + 1, S - 2 * GARDEN_EDGE + 2, -(S - 2 * GARDEN_EDGE + 2)); ctx.fill('evenodd');
    tufts(ctx, grass, pixel);
    for (const s of stones) rock(ctx, ...s);
    reeds(ctx, 4.5, 6, 5, T, pixel); reeds(ctx, S - 5, S - 4.5, 6, T, pixel); reeds(ctx, S - 4.5, 7, 3, T, pixel);
    planks(ctx, PIER.x, PIER.y, PIER.w, PIER.h, true);
    ctx.fillStyle = LAND.plank2; for (const [x, y] of [[PIER.x - 0.3, PIER.y], [PIER.x + PIER.w - 0.7, PIER.y]]) ctx.fillRect(x, y - 0.4, 1, 1); // postes
  };
}
export const gardenInside = (S) => (x, y) => x > GARDEN_EDGE && y > GARDEN_EDGE && x < S - GARDEN_EDGE && y < S - GARDEN_EDGE
  && !(x > PIER.x - 1.5 && x < PIER.x + PIER.w + 1.5 && y > PIER.y - 1.5);

// Carrera: hierba fuera del canal, playa de arena en las dos orillas, piedras en la isla, juncos y salida a cuadros.
export function raceDecor(W, H, shore, isle, start) {
  const r = rng(11), ring = [], grass = [];
  for (let a = 0; a < TAU; a += 0.22 + r() * 0.12) ring.push([isle.cx + Math.cos(a) * isle.rx, isle.cy + Math.sin(a) * isle.ry, 1.1 + r() * 0.9, r() * 3]);
  for (let i = 0; i < 40; i++) {
    const x = r() * W, y = r() * H, out = ((x - shore.cx) / shore.rx) ** 2 + ((y - shore.cy) / shore.ry) ** 2 > 1.08, inn = ((x - isle.cx) / (isle.rx - 2)) ** 2 + ((y - isle.cy) / (isle.ry - 2)) ** 2 < 1;
    if (out || inn) grass.push([x, y]);
  }
  const ell = (e, d) => { ctx0.ellipse(e.cx, e.cy, e.rx + d, e.ry + d, 0, 0, TAU); };
  let ctx0;
  return (ctx, T, pixel) => {
    ctx0 = ctx;
    // Arena: un aro bajo la hierba que asoma por las dos orillas.
    ctx.fillStyle = LAND.sand; ctx.beginPath(); ctx.rect(0, 0, W, H); ell(shore, -1.2); ctx.fill('evenodd');
    ctx.beginPath(); ell(isle, 1.2); ctx.fill();
    ctx.fillStyle = LAND.grass; ctx.beginPath(); ctx.rect(0, 0, W, H); ell(shore, 0.6); ctx.fill('evenodd');
    ctx.beginPath(); ell(isle, -0.8); ctx.fill();
    ctx.fillStyle = LAND.grass2; ctx.beginPath(); ell(isle, -4); ctx.fill();
    tufts(ctx, grass, pixel);
    for (const s of ring) rock(ctx, ...s);
    reeds(ctx, 6, 10, 5, T, pixel); reeds(ctx, W - 6, H - 8, 6, T, pixel); reeds(ctx, isle.cx, isle.cy - 6, 4, T, pixel);
    // Salida: franja a cuadros de la isla a la orilla.
    const s = 1.2;
    for (let y = start.y0, i = 0; y < start.y1; y += s, i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? '#14191d' : '#ffffff'; ctx.fillRect(start.x + j * s, y, s, s); }
  };
}
