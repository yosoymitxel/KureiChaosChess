import assert from 'node:assert/strict';
import { DIFFS, newCollapsingFloor, legal, move, routeToTop } from '../src/game/collapsing-floor.js';
import { legalMoves } from '../src/game/rules.js';

const key = (r, c) => r + ',' + c;
const seeded = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

for (const level of ['facil', 'normal', 'dificil']) {
  for (let seed = 1; seed <= 32; seed++) {
    const game = newCollapsingFloor(level), rng = seeded(seed * 31 + level.length);
    let steps = 0;
    while (!game.over && steps++ < game.diff.turns) {
      const route = routeToTop(game);
      assert.ok(route && route.length <= game.turns, level + ' always has a route before a planned jump');
      const { row, col } = route[0];
      const old = key(game.pieces[0].row, game.pieces[0].col);
      assert.equal(move(game, row, col, rng), true);
      assert.ok(game.board.holes.has(old), 'the abandoned tile falls');
      const extras = game.lastCollapsed.slice(1);
      assert.ok(extras.length <= game.diff.collapse, 'only the configured number of threatened tiles falls');

      const boardBeforeExtras = new Set(game.board.holes);
      extras.forEach((tile) => boardBeforeExtras.delete(tile));
      const available = legalMoves(game.pieces[0], game.pieces, { ...game.board, holes: boardBeforeExtras });
      for (const tile of extras) {
        assert.ok(available.some((m) => key(m.row, m.col) === tile), 'each extra collapse targets an immediate usable route tile');
      }
      if (!game.over) {
        const nextRoute = routeToTop(game);
        assert.ok(nextRoute && nextRoute.length <= game.turns, level + ' preserves a route within the remaining clock');
      }
    }
    assert.equal(game.over, 'win', level + ' remains solvable by following a shortest route');
  }
}

const margins = Object.fromEntries(['facil', 'normal', 'dificil'].map((level) => {
  const shortest = routeToTop(newCollapsingFloor(level)).length;
  return [level, DIFFS[level].turns - shortest];
}));
console.log('Margen sobre la ruta mínima: ' +
  Object.entries(margins).map(([level, slack]) => level + ' +' + slack + ' saltos').join(' · '));
assert.ok(margins.facil > margins.normal && margins.normal > margins.dificil, 'the clock tightens with each difficulty');

function playImperfectly(level, seed) {
  const game = newCollapsingFloor(level);
  const choices = seeded(seed * 7919 + 17), hazards = seeded(seed * 104729 + 53);
  while (!game.over) {
    const moves = legal(game);
    const current = game.pieces[0];
    const holesAfterStep = new Set(game.board.holes);
    holesAfterStep.add(key(current.row, current.col));
    const scored = moves.map((m) => {
      if (m.row === 0) return { move: m, distance: 1 };
      const tail = routeToTop(game, m, holesAfterStep);
      return { move: m, distance: tail ? tail.length + 1 : Infinity };
    });
    const feasible = scored.filter((x) => x.distance <= game.turns);
    const routePool = feasible.length
      ? feasible.filter((x) => x.distance <= Math.min(...feasible.map((v) => v.distance)) + 1)
      : scored;
    const pool = choices() < 0.4 ? scored : routePool;
    const picked = pool[Math.floor(choices() * pool.length)] || scored[0];
    if (!picked || !move(game, picked.move.row, picked.move.col, hazards)) {
      game.over = 'lose';
      break;
    }
  }
  return game.over === 'win';
}

// The balance agent favors short routes but takes a random legal move 40% of the time.
const rates = {};
for (const level of ['facil', 'normal', 'dificil']) {
  let wins = 0;
  for (let seed = 1; seed <= 160; seed++) wins += Number(playImperfectly(level, seed));
  rates[level] = wins / 160;
}
console.log('Tasas de victoria (rutas cortas con errores frecuentes): ' +
  Object.entries(rates).map(([level, rate]) => level + ' ' + Math.round(rate * 100) + '%').join(' · '));
assert.ok(rates.facil > rates.normal, 'Fácil should be more forgiving than Normal');
assert.ok(rates.normal > rates.dificil, 'Difícil should challenge more than Normal');
assert.ok(rates.dificil >= 0.08, 'Difícil must remain winnable without perfect play');
assert.equal(DIFFS.dificil.collapse, 2, 'hard mode can collapse two extra route tiles per turn');
console.log('El suelo se acaba: derrumbes dirigidos, rutas viables y balance por dificultad OK');
