// Comprobación de Barrera: `node tools/barrier-check.mjs`. Saltos sobre el rival (recto y en
// diagonal cuando detrás hay valla o borde) y una partida entera bot contra bot que termina.
import { N, newBarrier, steps, act, botAction } from '../src/game/barrier.js';

const has = (list, r, c) => list.some((m) => m.r === r && m.c === c);
const fail = (msg) => { console.error('barrier-check falló: ' + msg); process.exit(1); };

// Cara a cara en el centro: salta recto por encima.
let s = newBarrier();
s.pos = { light: { r: 4, c: 3 }, dark: { r: 3, c: 3 } };
let m = steps(s, 'light');
if (has(m, 3, 3)) fail('puede pisar la casilla del rival');
if (!has(m, 2, 3)) fail('no salta recto por encima del rival');
if (has(m, 3, 2) || has(m, 3, 4)) fail('salta en diagonal teniendo el recto libre');

// Valla detrás del rival: el salto se abre en diagonal a sus costados.
s.walls = [{ o: 'h', r: 2, c: 3 }];
m = steps(s, 'light');
if (has(m, 2, 3)) fail('salta a través de una valla');
if (!has(m, 3, 2) || !has(m, 3, 4)) fail('con valla detrás no ofrece las diagonales');

// Rival contra el borde: también en diagonal.
s = newBarrier();
s.pos = { light: { r: 1, c: 0 }, dark: { r: 0, c: 0 } };
m = steps(s, 'light');
if (!has(m, 0, 1) || has(m, -1, 0)) fail('contra el borde no salta en diagonal');

// Valla entre los dos: no hay salto.
s = newBarrier();
s.pos = { light: { r: 4, c: 3 }, dark: { r: 3, c: 3 } };
s.walls = [{ o: 'h', r: 3, c: 3 }];
if (steps(s, 'light').some((x) => x.jump)) fail('salta con una valla en medio');

// Bot contra bot: siempre termina.
for (let g = 0; g < 30; g++) {
  s = newBarrier(['facil', 'normal', 'dificil'][g % 3]);
  let turns = 0;
  while (!s.over && turns++ < 400) { const a = botAction(s); if (!a || !act(s, a)) fail(`el bot se trabó en la partida ${g}`); }
  if (!s.over) fail(`la partida ${g} no terminó`);
  if (s.pos[s.over].r !== s.goal[s.over]) fail('ganó quien no llegó a la meta');
}
console.log(`barrier-check OK: saltos y 30 partidas bot contra bot en ${N}×${N}`);
