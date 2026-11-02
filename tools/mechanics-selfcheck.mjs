// Mecánicas de piso con reglas propias (src/game/mechanics.js): partidas bot contra bot en cada una.
// Comprueba que el bot solo hace jugadas legales, que toda partida termina y que la mecánica actúa.
import assert from 'node:assert/strict';
import { generateBoard, placePieces } from '../src/game/generate.js';
import { Match, botChooseMove } from '../src/game/match.js';
import { MECHANICS } from '../src/game/mechanics.js';

const GAMES = +(process.argv[2] || 6);
const acts = (r, m) => !!(r?.mech || r?.drunk || m?.pieces.some((p) => p.unseen));
for (const modifier of process.argv[3] ? process.argv[3].split(',') : Object.keys(MECHANICS)) {
  let fired = 0, wins = 0, moves = 0;
  for (let g = 0; g < GAMES; g++) {
    const seed = 500 + g * 31, floor = 3 + (g % 6);
    const board = generateBoard(seed, floor, 10, modifier);
    const pieces = placePieces(board, { modifier, playerCount: 2, seed, mutations: [], bonuses: {}, floor, totalFloors: 10 });
    if (MECHANICS[modifier].size) assert.equal(board.rows, MECHANICS[modifier].size, `${modifier}: board size`);
    const players = [{ color: 'light', kind: 'bot', name: 'A' }, { color: 'dark', kind: 'bot', name: 'B' }];
    const m = new Match({ board, pieces, players, modifier, mutations: [] });
    for (let n = 0; !m.over; n++) {
      assert.ok(n < 4000, `${modifier}/${g}: the game never ended`);
      const mv = botChooseMove(m);
      if (!mv) { const a = m.afterMove({ pass: true }); if (acts(a)) fired++; continue; }
      const r = m.move(mv.piece, mv.target);
      assert.ok(r, `${modifier}/${g}: the bot chose an illegal move`);
      if (acts(r, m)) fired++;
      const a = m.afterMove();
      if (acts(a)) fired++;
      moves++;
    }
    if (m.over.victory || m.over.winner === 'light') wins++;
  }
  // Las que solo cambian el reparto actúan al empezar, no durante la partida.
  const setupOnly = !MECHANICS[modifier].after && !MECHANICS[modifier].turn && !MECHANICS[modifier].redirect;
  assert.ok(setupOnly || fired > 0, `${modifier}: the mechanic never fired`);
  console.log(`${modifier}: ${GAMES} partidas, ${Math.round(moves / GAMES)} jugadas de media, efectos ${fired}, gana marfil ${wins}`);
}
console.log('Mecánicas OK');
