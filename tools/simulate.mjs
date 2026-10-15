// Bot-vs-bot simulation to sanity-check the rules: `node tools/simulate.mjs [games]`.
// Fails loudly if a bot ever picks an illegal move or a game never ends.
import { generateBoard, placePieces } from '../src/game/generate.js';
import { Match, botChooseMove } from '../src/game/match.js';

const games = +(process.argv[2] || 60);
const stats = { win: 0, loss: 0, tie: 0, bossHits: 0, bossCrushes: 0 };
for (let g = 0; g < games; g++) {
  const seed = 1000 + g, isBoss = g % 2 === 0, three = g % 5 === 0;
  const board = generateBoard(seed, isBoss ? 9 : 3, 10);
  const pieces = placePieces(board, { playerCount: three ? 3 : 2, isBoss, seed, mutations: ['fury', 'knightBishop'], bonuses: {} });
  const players = [{ color: 'light', kind: 'bot', name: 'A' }, { color: 'dark', kind: 'bot', name: 'B' }];
  if (three) players.push({ color: 'wild', kind: 'bot', name: 'C' });
  const modifier = isBoss ? 'boss' : ['chaos', 'rush', 'promote', 'fog'][g % 4];
  const m = new Match({ board, pieces, players, modifier, mutations: ['fury'] });
  for (let n = 0; !m.over; n++) {
    if (n > 5000) throw new Error(`game ${g} never ended`);
    const mv = botChooseMove(m);
    if (!mv) { m.afterMove({ pass: true }); continue; }
    const r = m.move(mv.piece, mv.target);
    if (!r) throw new Error(`game ${g}: bot chose an illegal move`);
    if (r.bounced) stats.bossHits++;
    if (r.piece.boss && r.victims.length) stats.bossCrushes++;
    m.afterMove();
  }
  m.over.tie ? stats.tie++ : m.over.winnerName === 'A' ? stats.win++ : stats.loss++;
}
console.log(stats);
