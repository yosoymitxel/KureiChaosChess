// Poder de cada jefe (src/data/bosses.js: `power`, `every`). Como la intención en Slay the Spire, se avisa
// un turno antes con casillas marcadas y se cumple en su siguiente turno: da tiempo a apartarse o a golpearlo.
// Devuelve un `mech` (src/game/mechanics.js) que el tablero anima.
import { key, walkable, buildOccupancy, cellsOf } from './rules.js';
import { BOSSES } from '../data/bosses.js';
import { PIECE_VALUE } from '../data/pieces.js';
import { makePiece } from './generate.js';
import { t } from '../i18n/index.js';

const ev = () => ({ fx: [], kills: [], moved: [], spawned: [], art: [] });
const ring = (b, d = 1) => {
  const out = [];
  for (let r = b.row - d; r < b.row + b.h + d; r++) for (let c = b.col - d; c < b.col + b.w + d; c++)
    if (r < b.row || r >= b.row + b.h || c < b.col || c >= b.col + b.w) out.push([r, c]);
  return out;
};
const on = (cells, p) => !p.boss && cells.some(([r, c]) => r === p.row && c === p.col);
const sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
// Desplaza `p` un paso (dr, dc) si la casilla está libre; si no, se queda.
function shove(m, p, dr, dc, out) {
  const r = p.row + dr, c = p.col + dc;
  if (!walkable(m.board, r, c) || buildOccupancy(m.pieces).get(key(r, c))) return;
  out.moved.push({ piece: p, from: { row: p.row, col: p.col }, to: { row: r, col: c }, how: 'hop' });
  p.row = r; p.col = c;
}
// Paso de `p` alejándose del centro del jefe (o acercándose con `toward`).
const away = (b, p, toward) => {
  const dr = sign(p.row - (b.row + (b.h - 1) / 2)), dc = sign(p.col - (b.col + (b.w - 1) / 2));
  return toward ? [-dr, -dc] : [dr, dc];
};
const inBoard = (m) => ([r, c]) => walkable(m.board, r, c);

// Casillas que avisa cada poder (lo que se marca en rojo).
const AIM = {
  quake: (m, b) => ring(b).filter(inBoard(m)),
  charge: (m, b) => { const out = []; for (let r = b.row + b.h; r < b.row + b.h + 4; r++) for (let c = b.col; c < b.col + b.w; c++) out.push([r, c]); return out.filter(inBoard(m)); },
  heal: () => [],
  rockfall(m, b) {
    const foes = m.pieces.filter((p) => p.color !== b.color && !p.royal);
    const p = foes.sort((x, y) => (PIECE_VALUE[y.type] || 20) - (PIECE_VALUE[x.type] || 20) || Math.random() - 0.5)[0];
    const royal = m.pieces.filter((x) => x.royal && !x.boss);
    return p ? [[p.row, p.col], [p.row - 1, p.col], [p.row + 1, p.col], [p.row, p.col - 1], [p.row, p.col + 1]].filter(inBoard(m))
      .filter(([r, c]) => !royal.some((k) => k.row === r && k.col === c)) : [];
  },
  summon: (m, b) => ring(b).filter(([r, c]) => walkable(m.board, r, c) && !buildOccupancy(m.pieces).get(key(r, c))).slice(0, 1),
  push: (m, b) => { const out = []; for (let c = b.col - 3; c < b.col + b.w + 3; c++) for (let r = b.row; r < b.row + b.h + 1; r++) if (c < b.col || c >= b.col + b.w || r >= b.row + b.h) out.push([r, c]); return out.filter(inBoard(m)); },
  pull: (m, b) => ring(b, 2).filter(inBoard(m)),
};

// Lo que hace al cumplirse, sobre las casillas avisadas.
const DO = {
  quake(m, b, cells, out) { for (const p of m.pieces.filter((x) => x.color !== b.color && on(cells, x))) shove(m, p, ...away(b, p), out); out.fx.push({ shake: 14 }); },
  charge(m, b, cells, out) { for (const p of m.pieces.filter((x) => x.color !== b.color && on(cells, x))) shove(m, p, 0, p.col < b.col + b.w / 2 ? -1 : 1, out); out.fx.push({ shake: 10 }); },
  heal(m, b, cells, out, plan) {
    if (b.hp < plan.hp || b.hp >= b.maxHp) return;
    b.hp++;
    out.fx.push({ power: b.id, color: '#7dffb0' }, { float: [b.row, b.col, '+1'] });
  },
  rockfall(m, b, all, out) {
    // Nunca bajo un jefe: se quedaría sobre el vacío.
    const cells = all.filter(([r, c]) => !m.pieces.some((p) => p.boss && cellsOf(p).some(([a, d]) => a === r && d === c)));
    out.fx.push({ blast: cells });
    for (const [r, c] of cells) m.board.holes.add(key(r, c));
    for (const p of m.pieces.filter((x) => !x.boss && cellsOf(x).some(([r, c]) => cells.some(([a, d]) => a === r && d === c)))) {
      m.pieces.splice(m.pieces.indexOf(p), 1); out.kills.push(p);
      if (p.royal && !m.pieces.some((q) => q.royal && q.color === p.color)) m.eliminated[p.color] = true;
    }
  },
  summon(m, b, cells, out) {
    if (m.pieces.filter((p) => p.escortOf === b.id).length >= 2) return;
    const [r, c] = cells[0] || [];
    if (r == null || buildOccupancy(m.pieces).get(key(r, c))) return;
    const p = makePiece('knight', b.color, r, c, { escortOf: b.id });
    m.pieces.push(p); out.spawned.push(p);
  },
  push(m, b, cells, out) { for (const p of m.pieces.filter((x) => x.color !== b.color && on(cells, x))) shove(m, p, b.color === 'dark' ? 1 : -1, 0, out); out.fx.push({ shake: 8 }); },
  pull(m, b, cells, out) { for (const p of m.pieces.filter((x) => x.color !== b.color && on(cells, x))) shove(m, p, ...away(b, p, true), out); },
};

export function bossPower(m, mover) {
  const b = m.pieces.find((p) => p.boss && p.color === mover);
  const def = b && BOSSES[b.boss];
  if (!def?.power) return null;
  const out = ev();
  const plan = m.bossPlan;
  if (plan && plan.id === b.id) {
    m.bossPlan = null;
    out.fx.push({ doom: [] });
    DO[def.power](m, b, plan.cells, out, plan);
    out.log = def.powerName;
    return out;
  }
  m.bossTurns = (m.bossTurns || 0) + 1;
  if (m.bossTurns % def.every) return null;
  const cells = AIM[def.power](m, b);
  if (!cells.length && def.power !== 'heal') return null;
  m.bossPlan = { id: b.id, cells, hp: b.hp };
  if (cells.length) out.fx.push({ doom: cells, sfx: 'alarm' });
  const text = t('boss.warn', '{name} prepara {power}', { name: b.name, power: def.powerName });
  // El cartel grande solo la primera vez; luego basta el registro y las casillas marcadas.
  if (m.bossTurns === def.every) out.callout = { text }; else out.log = text;
  return out;
}
