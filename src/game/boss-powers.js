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

const POWER_COLOR = { quake: '#ffc83d', charge: '#ff6b3d', heal: '#7dffb0', rockfall: '#c9a07a', summon: '#29e3ff', push: '#9fd0ff', pull: '#b06bff' };
const cells0 = (plan) => plan.cells[0];
// Rampas (de oscuro a claro) para pixelfx, una por poder.
const RAMP = {
  quake: ['#2a1a0c', '#5e3a18', '#9c6426', '#d89a3a', '#ffc83d', '#fff0b4', '#ffffff'],
  charge: ['#2a0c08', '#6e1e12', '#b8401f', '#f26b3d', '#ffa06b', '#ffe0c4', '#ffffff'],
  heal: ['#0c2a18', '#16502e', '#2a8a4e', '#4fd07c', '#7dffb0', '#d4ffe4', '#ffffff'],
  rockfall: ['#1d1620', '#4a3a3c', '#7d6a66', '#b09c90', '#dccab4', '#f6ead2', '#ffffff'],
  summon: ['#06202a', '#0c4256', '#147a96', '#20b4d6', '#29e3ff', '#bff6ff', '#ffffff'],
  push: ['#0e1a2a', '#1e3656', '#3a5e8e', '#6a94c6', '#9fd0ff', '#e0f0ff', '#ffffff'],
  pull: ['#1a0526', '#3d0a56', '#6a1e96', '#9a4ad6', '#b06bff', '#e4c8ff', '#ffffff'],
};
// Efecto píxel de cada poder: en el jefe (`mid`), donde sale cada pieza movida y donde cae.
const PFX = {
  quake: (mid, moved) => [{ sf: 'explosion', at: mid, opts: { s: 1.4, fire: 0, chunks: 18 } }, { pfx: 'groundSlam', at: mid, f: 2.4 }, ...moved.map(({ to }) => ({ pfx: 'heavyLanding', at: [to.row, to.col] }))],
  charge: (mid, moved) => [{ pfx: 'groundSlam', at: mid, f: 1.8 }, ...moved.map(({ from }) => ({ pfx: 'bluntHit', at: [from.row, from.col], f: 1.2 }))],
  heal: (mid) => [{ sf: 'heal', at: mid, opts: { count: 22 } }, { pfx: 'collectBurst', at: mid, f: 2 }],
  rockfall: (mid, moved, cells) => [{ sf: 'explosion', at: cells[0] || mid, opts: { s: 1.1, fire: 0 } }, ...cells.map((c) => ({ pfx: 'heavyLanding', at: c, f: 1.2 }))],
  summon: (mid, moved, cells) => [...cells.slice(0, 1).map((c) => ({ sf: 'holy-light', at: c, opts: { hold: 0.5, width: 8 } })), { pfx: 'poof', at: mid, f: 1.6 }, ...cells.slice(0, 1).map((c) => ({ pfx: 'poof', at: c, f: 1.2 }))],
  push: (mid, moved) => [{ pfx: 'groundSlam', at: mid, f: 1.6 }, ...moved.map(({ from }) => ({ pfx: 'bluntHit', at: [from.row, from.col] }))],
  pull: (mid, moved) => [{ sf: 'black-hole', at: mid, opts: { r: 0.45, life: 1.1, pull: 0.6 } }, { pfx: 'collectBurst', at: mid, f: 2.4 }, ...moved.map(({ from, to }) => [{ pfx: 'poof', at: [from.row, from.col] }, { pfx: 'hitSpark', at: [to.row, to.col] }]).flat()],
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
    const mid = [Math.round(b.row + (b.h - 1) / 2), Math.round(b.col + (b.w - 1) / 2)];
    out.fx.push({ bossCut: b.id, title: b.name, sub: def.powerName, color: POWER_COLOR[def.power] }, { stamp: plan.cells, color: POWER_COLOR[def.power] });
    out.fx.push({ transform: b.id, label: def.powerName, color: POWER_COLOR[def.power] });
    DO[def.power](m, b, plan.cells, out, plan);
    // Rastro de cada pieza que el poder desplaza (atraída, empujada…), antes de que se mueva.
    const trails = out.moved.map(({ from, to }) => ({ trail: [[from.row, from.col], [to.row, to.col]], color: POWER_COLOR[def.power] }));
    if (trails.length) out.fx.splice(4, 0, def.power === 'pull' || def.power === 'quake' ? { ring: mid, color: POWER_COLOR[def.power], size: 2.4 } : {}, ...trails, { wait: 260 });
    out.fx.splice(4, 0, ...PFX[def.power](mid, out.moved, plan.cells).map((e) => ({ ...e, palette: RAMP[def.power] })));
    if (def.power === 'summon' && cells0(plan)) out.fx.push({ beam: [mid, cells0(plan)], color: POWER_COLOR.summon });
    if (def.power === 'heal') out.fx.push({ sparkle: mid, color: POWER_COLOR.heal });
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
