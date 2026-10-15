// Card balance: `node tools/balance.mjs [games]`.
// Bot vs bot on normal floors; side A holds three copies of one card and plays one whenever it
// can (best target by moves gained). Compares A's win rate and game length against a no-card
// baseline: a card that pushes the win rate far above it, or ends games much sooner, is too strong.
import { generateBoard, placePieces } from '../src/game/generate.js';
import { Match, botChooseMove } from '../src/game/match.js';
import { CARDS, CARD_IDS, cardTargets, previewMoves, playCard } from '../src/game/cards.js';
import { cellsOf } from '../src/game/rules.js';

const games = +(process.argv[2] || 200);
const MODS = ['none', 'none', 'rush', 'promote', 'ice', 'portal'];

// Pick the target that gains the most reach (pieces) or hurts the enemy royal most (tiles).
function bestTarget(m, card) {
  const targets = cardTargets(m, card);
  if (!targets.length) return null;
  if (card.target === 'piece') {
    let best = null;
    for (const p of targets) {
      const gain = previewMoves(m, card, p).cells.size - m.legal(p).length + (card.id === 'fortify' ? 4 : 0) + Math.random();
      if (!best || gain > best.gain) best = { gain, t: { piece: p } };
    }
    return best.t;
  }
  const foe = m.pieces.find((p) => p.royal && p.color !== m.player.color);
  const near = (t) => (foe ? Math.min(...cellsOf(foe).map(([r, c]) => Math.max(Math.abs(r - t.row), Math.abs(c - t.col)))) : 0);
  return card.id === 'quake' ? targets.sort((a, b) => near(a) - near(b))[0] : targets[Math.floor(Math.random() * targets.length)];
}

function play(seed, cardId) {
  const modifier = MODS[seed % MODS.length];
  const board = generateBoard(seed, 1 + (seed % 3), 6, modifier);
  const pieces = placePieces(board, { playerCount: 2, isBoss: false, seed, mutations: [], bonuses: {} });
  const players = [{ color: 'light', kind: 'bot', name: 'A' }, { color: 'dark', kind: 'bot', name: 'B' }];
  const m = new Match({ board, pieces, players, modifier, mutations: [] });
  const hand = cardId ? [cardId, cardId, cardId] : [];
  for (let n = 0; !m.over && n < 5000; n++) {
    if (m.player.name === 'A' && hand.length && !m.cardUsed && m.movesThisTurn === 0) {
      const card = CARDS[hand[0]];
      const t = card.target === 'none' ? null : bestTarget(m, card);
      if ((card.target === 'none' || t) && playCard(m, card.id, t)) hand.shift();
    }
    const mv = botChooseMove(m);
    if (!mv) { m.afterMove({ pass: true }); continue; }
    m.move(mv.piece, mv.target);
    m.afterMove();
  }
  return { win: m.over?.winnerName === 'A', tie: !!m.over?.tie, turns: m.turn };
}

const rows = [];
for (const id of [null, ...CARD_IDS]) {
  let win = 0, tie = 0, turns = 0;
  for (let g = 0; g < games; g++) {
    const r = play(5000 + g, id);
    win += r.win; tie += r.tie; turns += r.turns;
  }
  rows.push({ card: id || '(sin cartas)', winA: `${Math.round((win / games) * 100)}%`, ties: `${Math.round((tie / games) * 100)}%`, turns: +(turns / games).toFixed(1) });
}
console.table(rows);
