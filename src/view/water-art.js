// Lo que rodea el agua en el Jardín de Agua y la carrera, dibujado en el lienzo del estanque (pond.decor):
// así comparte luz, paleta y modo píxel con el agua. Lenguaje del agua: piedra redonda en el borde, hierba
// con matas, juncos en las esquinas y madera para lo que se usa (muelle, salida).
import { LAND, sprite } from './pond.js';

const TAU = Math.PI * 2;
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function drawSprite(ctx, im, x, y, size, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(im, -size / 2, -size / 2, size, size); ctx.restore(); }
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
export const PIER = { x: 24, y: 78, w: 6, h: 12 };
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
    ctx.beginPath(); ctx.rect(-S, -S, 3 * S, 3 * S); ctx.rect(GARDEN_EDGE - 1, S - GARDEN_EDGE + 1, S - 2 * GARDEN_EDGE + 2, -(S - 2 * GARDEN_EDGE + 2)); ctx.fill('evenodd');
    tufts(ctx, grass, pixel);
    for (const s of stones) rock(ctx, ...s);
    reeds(ctx, 4.5, 6, 5, T, pixel); reeds(ctx, S - 5, S - 4.5, 6, T, pixel); reeds(ctx, S - 4.5, 7, 3, T, pixel);
    planks(ctx, PIER.x, PIER.y, PIER.w, PIER.h, true);
    ctx.fillStyle = LAND.plank2; for (const [x, y] of [[PIER.x - 0.3, PIER.y], [PIER.x + PIER.w - 0.7, PIER.y]]) ctx.fillRect(x, y - 0.4, 1, 1); // postes
  };
}
// HULL: medio casco; el centro del barco no se acerca más a la orilla, así el dibujo no la pisa.
const HULL = 1.6;
export const gardenInside = (S) => (x, y) => x > GARDEN_EDGE + HULL && y > GARDEN_EDGE + HULL && x < S - GARDEN_EDGE - HULL && y < S - GARDEN_EDGE - HULL
  && !(x > PIER.x - HULL && x < PIER.x + PIER.w + HULL && y > PIER.y - HULL);

// Carrera: hierba fuera del canal, playa de arena en sus dos orillas, rocas, algas, juncos y salida a cuadros.
export function raceDecor(W, H, track) {
  const r = rng(11), grass = [], reedAt = [];
  const out = (x, y) => !track.line.some((p, i) => i % 3 === 0 && Math.hypot(p.x - x, p.y - y) < 10);
  for (let i = 0; i < 90 && grass.length < 50; i++) { const x = r() * W, y = r() * H; if (out(x, y)) grass.push([x, y]); }
  for (let i = 0; i < 40 && reedAt.length < 6; i++) { const x = 3 + r() * (W - 6), y = 5 + r() * (H - 8); if (out(x, y)) reedAt.push([x, y]); }
  const loop = (ctx, pts) => pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  const p0 = track.line[0];
  return (ctx, T, pixel) => {
    // Arena: el canal un poco más ancho, bajo la hierba; la hierba deja ver el canal y la arena.
    ctx.lineJoin = 'round';
    ctx.strokeStyle = LAND.sand; ctx.lineWidth = 2.4;
    for (const e of [track.outer, track.inner]) { ctx.beginPath(); loop(ctx, e); ctx.closePath(); ctx.stroke(); }
    ctx.fillStyle = LAND.grass; ctx.beginPath(); ctx.rect(-W, -H, 3 * W, 3 * H);
    loop(ctx, track.outer.map((q, i) => ({ x: q.x + (q.x - track.line[i].x) * 0.16, y: q.y + (q.y - track.line[i].y) * 0.16 }))); ctx.closePath();
    loop(ctx, track.inner.map((q, i) => ({ x: q.x + (q.x - track.line[i].x) * 0.16, y: q.y + (q.y - track.line[i].y) * 0.16 }))); ctx.closePath();
    ctx.fill('evenodd');
    // Hierba: manchas de otro verde (sin rayitas) y matas de junco del mismo dibujo que el jardín.
    ctx.fillStyle = LAND.grass2;
    for (const [x, y] of grass) { ctx.beginPath(); ctx.ellipse(x, y, 2.2, 1.4, x, 0, TAU); ctx.fill(); }
    const reed = sprite('junco-bud');
    for (const [x, y] of reedAt) reed ? drawSprite(ctx, reed, x, y, 7, x) : reeds(ctx, x, y, 4, T, pixel);
    // Algas que frenan: lenteja de agua con un par de nenúfares, los sprites de las plantas del jardín.
    const duck = sprite('lenteja-bud'), pad = sprite('nenufar-bud');
    for (const w of track.weed) {
      if (!duck || !pad) { ctx.fillStyle = '#7fbf5a'; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, TAU); ctx.fill(); continue; }
      drawSprite(ctx, duck, w.x, w.y, w.r * 2.4, w.x + Math.sin(T * 0.3) * 0.05);
      drawSprite(ctx, pad, w.x + w.r * 0.5, w.y - w.r * 0.3, w.r * 1.3, w.y);
    }
    for (const q of track.rocks) { rock(ctx, q.x, q.y, q.r, q.x); rock(ctx, q.x + q.r * 0.6, q.y + q.r * 0.4, q.r * 0.45, q.y); }
    // Salida: franja a cuadros de orilla a orilla, de través al canal.
    const s = 1.1, nx = -p0.ty, ny = p0.tx, n = Math.round(15 / s);
    for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#14191d' : '#ffffff';
      const x = p0.x + nx * (i - n / 2) * s + p0.tx * j * s, y = p0.y + ny * (i - n / 2) * s + p0.ty * j * s;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  };
}
