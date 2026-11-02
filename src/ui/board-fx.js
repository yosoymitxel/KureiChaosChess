// Efectos del tablero pedidos como datos (minis por turnos y mecánicas de piso: src/game/mechanics.js).
import { key } from '../game/rules.js';
import { playSfx } from './sfx.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Un efecto por objeto: { doom | blast | sink | fire: casillas } · { beam: [desde, hasta], color } ·
// { float: [r, c, texto] } · { ring | sparkle | shield: [r, c] } · { hurt | power: id(s) } · { shake } · { sfx } · { wait }.
export async function playFx(v, list = []) {
  for (const e of list) {
    if (!v) return;
    const pt = (r, c) => { const t = v.tiles.get(key(r, c)); return t ? v.fx.pointOf(t) : null; };
    const byId = (id) => [...v.els.keys()].find((p) => p.id === id);
    if (e.sfx) playSfx(e.sfx);
    if (e.doom) v.setDoom(e.doom, false);
    if (e.blast) await v.blast(e.blast);
    if (e.sink) await v.collapse(e.sink);
    if (e.fire) for (const [r, c] of e.fire) { const p = pt(r, c); if (p) v.fx.fire(p.x - v.sq * 0.4, p.y - v.sq * 0.9, v.sq * 0.8, v.sq, 1.2); }
    if (e.beam) { const a = pt(...e.beam[0]), b = pt(...e.beam[1]); if (a && b) { playSfx('laser'); v.fx.beam(a.x, a.y - v.sq * 0.3, b.x, b.y - v.sq * 0.3, { color: e.color || '#c58bff' }); } }
    if (e.float) { const p = pt(e.float[0], e.float[1]); if (p) v.floatText(p.x, p.y - v.sq * 0.7, e.float[2]); }
    if (e.ring) { const p = pt(...e.ring); if (p) { v.fx.ring(p.x, p.y, { radius: v.sq * (e.size || 1.4), width: 4, color: e.color || '#fff' }); v.fx.dust(p.x, p.y, 1); } }
    if (e.sparkle) { const p = pt(...e.sparkle); if (p) v.fx.sparkle(p.x, p.y - v.sq * 0.3, e.color || '#ffcf6b', 12); }
    if (e.shield) { const p = pt(...e.shield); if (p) v.fx.shield(p.x, p.y - v.sq * 0.4, v.sq * 0.6, { broken: !!e.broken }); }
    if (e.hurt) { const p = byId(e.hurt); if (p) v.hurt(p); }
    if (e.power) v.powerUp([].concat(e.power).map(byId).filter(Boolean), e.color || '#ffcf6b');
    if (e.shake) v.shake(e.shake, 360);
    if (e.wait) await wait(v.d(e.wait));
  }
}

// Lo que una mecánica de piso hizo (un `mech`): efectos, piezas que caen, se desplazan, llegan o cambian.
export async function playMech(v, m) {
  if (!m || !v) return;
  await playFx(v, m.fx);
  if (m.sink?.length) await v.collapse(m.sink);
  await Promise.all([
    ...(m.moved || []).map(({ piece, from, to, how }) => (how === 'warp' ? v.warp(piece, { from, to }) : v.playMove({ piece, from, to, victims: [] }))),
    ...(m.spawned || []).map((p) => v.dropIn(p)),
    ...(m.kills || []).map((p) => v.kill(p, p, p)),
  ]);
  for (const p of m.art || []) { v.setArt(p); v.els.get(p)?.classList.toggle('crowned', !!p.crowned); }
}
