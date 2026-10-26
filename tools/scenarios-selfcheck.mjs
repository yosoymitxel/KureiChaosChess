// Minijuegos sobre el tablero de la partida (src/data/scenarios.js): se arman, terminan y varían.
import assert from 'node:assert/strict';
import { SCENARIOS, buildScenario } from '../src/data/scenarios.js';
import { Match, botChooseMove } from '../src/game/match.js';
import { RIVALS } from '../src/game/difficulty.js';
import { key } from '../src/game/rules.js';

const matchOf = (sc) => new Match({ board: sc.board, pieces: sc.pieces, players: sc.seats, modifier: 'none', mutations: [], bonuses: {},
  rival: sc.rival, rivals: { dark: sc.rival, light: RIVALS.maestro }, objective: sc.objective, bonus: sc.bonus });
function play(m, sc) {
  for (let i = 0; i < 400 && !m.over; i++) {
    const mv = m.canMove() && botChooseMove(m);
    if (mv) assert.ok(m.move(mv.piece, mv.target), 'bot move is legal');
    sc.labels?.(m);
    m.afterMove({ pass: !mv });
  }
  return m.over;
}

for (const id of Object.keys(SCENARIOS)) for (const level of ['facil', 'normal', 'dificil']) {
  const layouts = new Set();
  let wins = 0;
  for (let seed = 1; seed <= 25; seed++) {
    const sc = buildScenario(id, level, seed);
    layouts.add(sc.pieces.map((p) => p.type + key(p.row, p.col)).join() + [...sc.board.holes, ...(sc.board.mines || []), ...(sc.labels?.({ pieces: [] }).keys() || [])].join());
    assert.ok(sc.pieces.some((p) => p.color === 'light'), `${id}: the player has pieces`);
    assert.equal(typeof sc.status(matchOf(sc)), 'string');
    const over = play(matchOf(sc), sc);
    assert.ok(over && typeof over.victory === 'boolean' && over.note, `${id}/${level}/${seed} ends with a verdict`);
    if (over.victory) wins++;
  }
  assert.ok(layouts.size >= 20, `${id}/${level}: tables vary (${layouts.size})`);
  console.log(`${id.padEnd(13)} ${level.padEnd(8)} bot maestro gana ${wins}/25`);
}

// El guardaespaldas: dos jugadas por turno y la segunda no captura.
const bg = matchOf(buildScenario('bodyguard', 'normal', 2));
assert.equal(bg.movesFor('light'), 2, 'two moves per turn');
const mover = bg.pieces.find((p) => p.color === 'light' && bg.legal(p).some((x) => !x.hits.length));
const step = bg.legal(mover).find((x) => !x.hits.length);
bg.move(mover, { row: step.row, col: step.col });
assert.ok(!bg.afterMove().ended, 'the turn goes on after the first move');
assert.ok(bg.pieces.filter((p) => p.color === 'light').every((p) => bg.legal(p).every((x) => !x.hits.length)), 'second move cannot capture');

// La cacería: un peón que corona pierde la partida.
const hunt = buildScenario('caceria', 'normal', 3);
const pawn = hunt.pieces.find((p) => p.color === 'dark');
pawn.type = 'queen';
assert.equal(hunt.objective(matchOf(hunt)).victory, false, 'a crowned pawn loses the hunt');

// Campo minado: la ruta segura del caballo existe y la mina se lleva la pieza.
const mf = buildScenario('minefield', 'dificil', 9);
const m = matchOf(mf);
const knight = mf.pieces[0];
const mine = [...mf.board.mines].find((k) => m.legal(knight).some((t) => key(t.row, t.col) === k));
if (mine) {
  const [r, c] = mine.split(',').map(Number);
  const res = m.move(knight, { row: r, col: c });
  assert.ok(res.mine && !m.pieces.length && mf.board.holes.has(mine), 'stepping on a mine removes the knight and leaves a hole');
  m.afterMove();
  assert.equal(m.over.victory, false);
}

// El rey impostor: un paso de rey no delata; un salto sí.
const ki = buildScenario('kingImpostor', 'normal', 4);
const masked = ki.pieces.filter((p) => p.disguise);
assert.ok(masked.length === 4 && masked.every((p) => p.type !== 'king'), 'impostors are disguised non-kings');
assert.equal(ki.pieces.filter((p) => p.color === 'dark' && p.type === 'king').length, 1, 'one true king');
console.log('Escenarios OK: mesas variables, final con veredicto, coronación, minas y disfraces');
