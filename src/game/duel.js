// Duelo: combate por turnos al modo Pokémon con piezas. Cada bando lleva tres; cuando una cae entra
// la siguiente. El tipo sale de cómo se mueve la pieza y hay un triángulo de ventajas:
// línea (torre, reina) vence a salto, salto (caballo, camello) a diagonal, diagonal (alfil, reina) a línea.
// Paso (peón, guardia, rey) es neutro. Reglas puras, sin DOM.
import { localize } from '../i18n/index.js';
export const BEATS = { linea: 'salto', salto: 'diagonal', diagonal: 'linea' };
export const TYPE_NAME = localize('duelTypes', { linea: 'Línea', salto: 'Salto', diagonal: 'Diagonal', paso: 'Paso' });

// Ataques: poder, precisión y efecto. guard = la próxima herida a la mitad; boost = el próximo golpe ×1,5;
// heal = cura (dos veces por pieza); pierce = ignora la guardia; recoil = parte del daño se lo lleva quien golpea.
export const MOVES = localize('duelMoves', {
  empuje: { name: 'Empuje', type: 'paso', power: 4, acc: 1 },
  avance: { name: 'Avance', type: 'paso', power: 0, acc: 1, boost: true, desc: 'El próximo golpe hace un 50 % más.' },
  coz: { name: 'Coz', type: 'salto', power: 5, acc: 0.95 },
  saltoL: { name: 'Salto en L', type: 'salto', power: 6, acc: 0.85, pierce: true, desc: 'Salta por encima de la guardia.' },
  diagonal: { name: 'Diagonal', type: 'diagonal', power: 6, acc: 0.9 },
  bendicion: { name: 'Bendición', type: 'paso', power: 0, acc: 1, heal: 6, desc: 'Cura 6 de vida.' },
  embestida: { name: 'Embestida', type: 'linea', power: 8, acc: 0.9, recoil: 2, desc: 'Se lleva 2 de daño al golpear.' },
  muralla: { name: 'Muralla', type: 'paso', power: 0, acc: 1, guard: true, desc: 'La próxima herida le hace la mitad.' },
  tormenta: { name: 'Tormenta', type: 'linea', power: 9, acc: 0.75 },
  rayo: { name: 'Rayo cruzado', type: 'diagonal', power: 7, acc: 0.9 },
  decreto: { name: 'Decreto', type: 'paso', power: 0, acc: 1, heal: 8, desc: 'Cura 8 de vida.' },
  golpeReal: { name: 'Golpe real', type: 'paso', power: 6, acc: 1 },
  escudo: { name: 'Escudo', type: 'paso', power: 0, acc: 1, guard: true, desc: 'La próxima herida le hace la mitad.' },
  joroba: { name: 'Joroba', type: 'salto', power: 7, acc: 0.85 },
});

export const FIGHTERS = {
  pawn: { type: 'paso', hp: 16, moves: ['empuje', 'avance'] },
  guard: { type: 'paso', hp: 20, moves: ['empuje', 'escudo'] },
  knight: { type: 'salto', hp: 20, moves: ['coz', 'saltoL', 'avance'] },
  camel: { type: 'salto', hp: 21, moves: ['joroba', 'coz', 'muralla'] },
  bishop: { type: 'diagonal', hp: 20, moves: ['diagonal', 'bendicion', 'empuje'] },
  rook: { type: 'linea', hp: 26, moves: ['embestida', 'muralla', 'empuje'] },
  queen: { type: 'linea', hp: 26, moves: ['tormenta', 'rayo', 'avance'] },
  king: { type: 'paso', hp: 24, moves: ['golpeReal', 'decreto', 'escudo'] },
};

// Tu equipo es fijo y variado; el rival crece con la dificultad.
export const DIFFS = {
  facil: { name: 'Fácil', mine: ['knight', 'bishop', 'rook'], foes: ['pawn', 'pawn', 'knight'] },
  normal: { name: 'Normal', mine: ['knight', 'bishop', 'rook'], foes: ['guard', 'bishop', 'rook'] },
  dificil: { name: 'Difícil', mine: ['knight', 'bishop', 'rook'], foes: ['camel', 'queen', 'king'] },
};

const unit = (type, side) => ({ type, side, hp: FIGHTERS[type].hp, max: FIGHTERS[type].hp, guard: false, boost: false, heals: 2 });

export function newDuel(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  return { diff, mine: diff.mine.map((t) => unit(t, 'light')), foes: diff.foes.map((t) => unit(t, 'dark')), over: null, log: [] };
}

export const active = (team) => team.find((u) => u.hp > 0);
export const effect = (move, target) => (BEATS[move.type] === FIGHTERS[target.type].type ? 1.5 : BEATS[FIGHTERS[target.type].type] === move.type ? 0.67 : 1);

// Un ataque de `a` a `d`. Devuelve qué pasó para que la pantalla lo cuente y lo anime.
function strike(a, d, id, rng) {
  const m = MOVES[id];
  const ev = { by: a.side, move: id, miss: false, dmg: 0, heal: 0, eff: 1, recoil: 0 };
  if (m.heal) { if (!a.heals) { ev.miss = true; return ev; } a.heals--; ev.heal = Math.min(m.heal, a.max - a.hp); a.hp += ev.heal; return ev; }
  if (m.guard) { a.guard = true; return ev; }
  if (m.boost) { a.boost = true; return ev; }
  if (rng() > m.acc) { ev.miss = true; return ev; }
  ev.eff = effect(m, d);
  let dmg = m.power * ev.eff * (a.boost ? 1.5 : 1) * (0.9 + rng() * 0.2);
  a.boost = false;
  if (d.guard && !m.pierce) { dmg /= 2; d.guard = false; ev.guarded = true; }
  ev.dmg = Math.max(1, Math.round(dmg));
  d.hp = Math.max(0, d.hp - ev.dmg);
  if (m.recoil) { ev.recoil = Math.min(m.recoil, a.hp - 1); a.hp -= ev.recoil; }
  ev.ko = d.hp <= 0;
  return ev;
}

// El rival elige el ataque con más daño esperado; si va mal de vida y puede curarse, se cura.
function foeChoice(s, rng) {
  const me = active(s.foes), you = active(s.mine);
  const ids = FIGHTERS[me.type].moves;
  const heal = ids.find((id) => MOVES[id].heal);
  if (heal && me.heals && me.hp < me.max * 0.35 && rng() < 0.8) return heal;
  const value = (id) => { const m = MOVES[id]; return m.power ? m.power * m.acc * effect(m, you) : m.boost && !me.boost ? 3 : m.guard && !me.guard ? 2.5 : 0; };
  return ids.reduce((b, id) => (value(id) + rng() > value(b) ? id : b), ids[0]);
}

// Un turno: atacas tú y, si el rival sigue en pie, responde. Devuelve los eventos en orden.
export function turn(s, id, rng = Math.random) {
  if (s.over) return [];
  const evs = [];
  const me = active(s.mine), foe = active(s.foes);
  evs.push(strike(me, foe, id, rng));
  if (!active(s.foes)) { s.over = 'win'; return evs; }
  if (foe.hp <= 0) { evs.push({ swap: 'dark', to: active(s.foes).type }); return evs; }
  evs.push(strike(foe, me, foeChoice(s, rng), rng));
  if (!active(s.mine)) s.over = 'lose';
  else if (me.hp <= 0) evs.push({ swap: 'light', to: active(s.mine).type });
  return evs;
}
