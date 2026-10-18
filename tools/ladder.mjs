// Escalera del rival y ritmo de la torre: `node tools/ladder.mjs [games]`.
// (a) Matriz de victorias entre perfiles, a doble lado: cada peldaño debe ganarle al anterior,
//     y el ajuste de dificultad corre la escalera con topes.
// (b) Invariantes de 200 torres: mecánicas sin repetir entre pisos, minijuegos sin repetir en
//     la run, Élite desde el piso 3, mini-jefes de control y garantía de minis en runs largas.
// (c) Una torre de muestra para leer de un vistazo.
// Sale con código 1 si algo no cuadra.
import { generateMap, generateBoard, placePieces } from '../src/game/generate.js';
import { Match, botChooseMove } from '../src/game/match.js';
import { RIVALS, RIVAL_STEPS, isMiniModifier, rivalForFloor } from '../src/game/difficulty.js';
import { MODIFIERS } from '../src/data/modifiers.js';

const games = +(process.argv[2] || 40);
const fails = [];
const expect = (ok, msg) => { if (!ok) fails.push(msg); };

// (a) La escalera: mismo tablero y ejército para los dos, lado intercambiado en cada partida.
const rate = {};
for (const a of RIVAL_STEPS) {
  for (const b of RIVAL_STEPS) {
    if (a === b) continue;
    let win = 0, decided = 0;
    for (let g = 0; g < games; g++) {
      const flip = g % 2 === 1;
      const seed = 9000 + g;
      const board = generateBoard(seed, 4, 10, 'none');
      const pieces = placePieces(board, { playerCount: 2, seed, mutations: [], bonuses: {}, floor: 4, totalFloors: 10 });
      const players = [
        { color: 'light', kind: 'bot', name: flip ? 'B' : 'A' },
        { color: 'dark', kind: 'bot', name: flip ? 'A' : 'B' },
      ];
      const rivals = flip ? { light: RIVALS[b], dark: RIVALS[a] } : { light: RIVALS[a], dark: RIVALS[b] };
      const m = new Match({ board, pieces, players, modifier: 'none', rivals });
      for (let n = 0; !m.over && n < 4000; n++) {
        const mv = botChooseMove(m);
        if (!mv) { m.afterMove({ pass: true }); continue; }
        if (!m.move(mv.piece, mv.target)) throw new Error(`movimiento ilegal: ${a} vs ${b}, partida ${g}`);
        m.afterMove();
      }
      if (!m.over) throw new Error(`partida sin final: ${a} vs ${b}, ${g}`);
      if (!m.over.tie) { decided++; if (m.over.winnerName === 'A') win++; }
    }
    rate[`${a}>${b}`] = decided ? win / decided : 0.5;
  }
}
const beat = (a, b) => (rate[`${a}>${b}`] + (1 - rate[`${b}>${a}`])) / 2;
console.log('Victorias a doble lado (empates fuera):');
const steps = [['oficial', 'aprendiz', 0.58], ['maestro', 'oficial', 0.58], ['maestro', 'aprendiz', 0.8]];
for (const [a, b] of steps) {
  console.log(`  ${a} sobre ${b}: ${(beat(a, b) * 100).toFixed(0)}% (${(rate[`${a}>${b}`] * 100).toFixed(0)}% y ${((1 - rate[`${b}>${a}`]) * 100).toFixed(0)}% por lado)`);
}
for (const [a, b, min] of steps) expect(beat(a, b) >= min, `${a} debe ganarle a ${b} (${(beat(a, b) * 100).toFixed(0)}% < ${min * 100}%)`);

// El ajuste de dificultad corre la escalera con topes: Fácil no baja del Aprendiz ni Difícil pasa del Maestro.
expect(rivalForFloor(0, 10, { difficulty: 'facil' }).id === 'aprendiz', 'Fácil: la temprana no baja del Aprendiz');
expect(rivalForFloor(9, 10, { difficulty: 'facil' }).id === 'oficial', 'Fácil: la tardía se queda en el Oficial');
expect(rivalForFloor(0, 10, { difficulty: 'dificil' }).id === 'oficial', 'Difícil: la temprana arranca en el Oficial');
expect(rivalForFloor(9, 10, { difficulty: 'dificil' }).id === 'maestro', 'Difícil: la tardía no pasa del Maestro');

// (b) La torre: 200 mapas y sus reglas.
for (let s = 0; s < 200; s++) {
  const { nodes, floors } = generateMap(s);
  const byFloor = new Map();
  for (const n of nodes) byFloor.set(n.floor, [...(byFloor.get(n.floor) || []), n]);
  for (const n of nodes) expect(n.modifier, `mapa ${s}: nodo sin mecánica (${n.id})`);
  for (let f = 1; f < floors; f++) {
    const prev = new Set((byFloor.get(f - 1) || []).map((n) => n.modifier));
    for (const n of byFloor.get(f) || []) {
      expect(!prev.has(n.modifier), `mapa ${s}: ${n.id} repite ${n.modifier} del piso anterior`);
      expect(!(n.modifier === 'elite' && f < 2), `mapa ${s}: Élite antes del piso 3 (${n.id})`);
    }
  }
  const minis = nodes.filter((n) => isMiniModifier(n.modifier)).map((n) => n.modifier);
  expect(new Set(minis).size === minis.length, `mapa ${s}: minijuego repetido (${minis.join(', ')})`);
  const mb = nodes.filter((n) => n.isMiniBoss);
  expect(mb.length === (floors >= 8 ? 2 : 1), `mapa ${s}: ${mb.length} mini-jefes en ${floors} pisos`);
  for (const n of mb) expect(n.floor >= 2 && n.floor <= floors - 3, `mapa ${s}: mini-jefe en el piso ${n.floor + 1} de ${floors}`);
  if (floors >= 8) expect(new Set(minis).size >= 2, `mapa ${s}: ${minis.length} minijuegos en ${floors} pisos`);
  expect(nodes.find((n) => n.floor === floors - 1).modifier === 'boss', `mapa ${s}: el último piso no es jefe`);
  expect(nodes[0].modifier === 'none', `mapa ${s}: el primer piso no es llano`);
}

// (c) Torre de muestra.
{
  const { nodes, floors } = generateMap(1);
  console.log(`\nTorre de muestra (${floors} pisos, semilla 1):`);
  for (let f = 0; f < floors; f++) {
    const at = nodes.filter((n) => n.floor === f);
    const mods = at.map((n) => (n.isBoss ? 'JEFE' : n.isMiniBoss ? 'MINI-JEFE' : MODIFIERS[n.modifier].name));
    console.log(`  Piso ${String(f + 1).padStart(2)}: ${mods.join(' | ')} · Rival ${rivalForFloor(f, floors, { up: at[0].isMiniBoss ? 1 : 0 }).name}`);
  }
}

if (fails.length) {
  console.error(`\n✗ ${fails.length} fallas:`);
  fails.slice(0, 15).forEach((m) => console.error('  ' + m));
  process.exit(1);
}
console.log('\n✓ escalera del rival y ritmo de la torre verificados');
