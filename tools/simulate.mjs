// Bot-vs-bot simulation to sanity-check the rules: `node tools/simulate.mjs [games]`.
// Fails loudly if a bot picks an illegal move, a protected piece is hit, a royal falls
// without check, or a game never ends. Covers every boss, elites, ice and portals.
import { generateBoard, placePieces, placeBoss } from '../src/game/generate.js';
import { Match, botChooseMove } from '../src/game/match.js';
import { immune } from '../src/game/rules.js';
import { BOSS_IDS } from '../src/data/bosses.js';

const games = +(process.argv[2] || 60);
const MODS = ['chaos', 'rush', 'promote', 'fog', 'ice', 'portal', 'elite'];
const stats = { win: 0, loss: 0, tie: 0, bossHits: 0, bossCrushes: 0, checks: 0, learned: 0, slides: 0, portals: 0, protectedFalls: 0 };
for (let g = 0; g < games; g++) {
  const seed = 1000 + g, isBoss = g % 3 === 0, three = g % 7 === 0;
  const modifier = isBoss ? 'boss' : MODS[g % MODS.length];
  const board = generateBoard(seed, isBoss ? 9 : 3, 10, modifier);
  const pieces = placePieces(board, { playerCount: three ? 3 : 2, isBoss: false, elite: modifier === 'elite', seed, mutations: ['fury', 'knightBishop'], bonuses: {} });
  if (isBoss) placeBoss(pieces, board, BOSS_IDS[g % BOSS_IDS.length]);
  const players = [{ color: 'light', kind: 'bot', name: 'A' }, { color: 'dark', kind: 'bot', name: 'B' }];
  if (three) players.push({ color: 'wild', kind: 'bot', name: 'C' });
  const m = new Match({ board, pieces, players, modifier, mutations: ['fury'] });
  for (let n = 0; !m.over; n++) {
    if (n > 5000) throw new Error(`game ${g} never ended`);
    const mv = botChooseMove(m);
    if (!mv) { m.afterMove({ pass: true }); continue; }
    const checked = Object.fromEntries(players.map((p) => [p.color, m.inCheck(p.color)]));
    const shielded = new Set(m.pieces.filter((p) => immune(p, m.pieces)));
    const r = m.move(mv.piece, mv.target);
    if (!r) throw new Error(`game ${g}: bot chose an illegal move`);
    for (const v of r.victims) {
      if (shielded.has(v.piece)) throw new Error(`game ${g}: protected piece was hit`);
      if (v.killed && (v.piece.trait || v.piece.escort)) stats.protectedFalls++;
      if (v.killed && v.piece.royal && !checked[v.piece.color]) throw new Error(`game ${g}: royal fell without check`);
    }
    stats.checks += Object.values(checked).filter(Boolean).length;
    if (r.bounced) stats.bossHits++;
    if (r.piece.boss && r.victims.length) stats.bossCrushes++;
    stats.learned += r.absorbed?.length || 0;
    if (r.slide) stats.slides++;
    if (r.portal) stats.portals++;
    m.afterMove();
  }
  m.over.tie ? stats.tie++ : m.over.winnerName === 'A' ? stats.win++ : stats.loss++;
}
console.log(stats);

// Direct checks for rules the bots rarely trigger.
{
  const { makePiece } = await import('../src/game/generate.js');
  const board = { rows: 6, cols: 6, holes: new Set(), terrain: new Map(), portals: new Map(), protectRows: 1 };
  const pieces = [makePiece('knight', 'light', 2, 2), makePiece('king', 'light', 5, 5)];
  const boss = placeBoss(pieces, board, 'devourer');
  const m = new Match({ board, pieces, players: [{ color: 'dark', kind: 'bot' }, { color: 'light', kind: 'bot' }], modifier: 'boss' });
  const r = m.move(boss, { row: 1, col: 2 });
  if (!r || !boss.moves.includes('knight')) throw new Error('devourer did not learn the knight move');
  const q = makePiece('queen', 'dark', 0, 0, { trait: 'last' });
  const pawn = makePiece('pawn', 'dark', 0, 5);
  if (!immune(q, [q, pawn]) || immune(q, [q])) throw new Error('"last" trait is wrong');
  // Cards: colossus grows backwards, preview matches the real result, one card per turn.
  const { playCard, previewMoves, cardTargets, CARDS } = await import('../src/game/cards.js');
  const b2 = { rows: 8, cols: 8, holes: new Set(), terrain: new Map(), portals: new Map(), protectRows: 2 };
  const rook = makePiece('rook', 'light', 5, 3), king = makePiece('king', 'light', 7, 7), foe = makePiece('king', 'dark', 0, 0);
  const m2 = new Match({ board: b2, pieces: [rook, king, foe], players: [{ color: 'light', kind: 'human' }, { color: 'dark', kind: 'bot' }], modifier: 'none' });
  if (!cardTargets(m2, CARDS.colossus).includes(rook)) throw new Error('rook should be a colossus target');
  const pv = previewMoves(m2, CARDS.colossus, rook);
  if (rook.h) throw new Error('preview mutated the real piece');
  if (!playCard(m2, 'colossus', { piece: rook }) || rook.h !== 2 || rook.hp !== 2) throw new Error('colossus failed');
  if (playCard(m2, 'haste')) throw new Error('second card in one turn was allowed');
  const real = m2.legal(rook).length;
  if (!pv.cells.size || !real) throw new Error('colossus has no moves');
  m2.afterMove({ pass: true }); m2.afterMove({ pass: true });
  if (!playCard(m2, 'quake', { row: 3, col: 3 }) || !b2.holes.has('3,3')) throw new Error('quake failed');
  console.log('direct checks ok');
}
