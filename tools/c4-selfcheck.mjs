// Conecta 4 bot self-check: `node tools/c4-selfcheck.mjs [games]`.
// Forced tactics first, then the alpha-beta bot against the old 1-ply heuristic
// (kept here as the sparring partner), clean boards, both colours. Throws if the
// bot misses a tactic, plays an illegal column, or loses more than a tenth of games.
import { emptyGrid, dropRow, lineAt, isFull, botColumn } from '../src/game/connect4.js';

// The old heuristic, verbatim from the version this replaced.
function oldBot(grid, me = 'dark', foe = 'light') {
  const open = [...Array(7).keys()].filter((c) => dropRow(grid, c) >= 0);
  const winsWith = (who) => open.find((c) => { const r = dropRow(grid, c); grid[r][c] = who; const w = lineAt(grid, r, c, who); grid[r][c] = null; return w; });
  const win = winsWith(me);
  if (win != null) return win;
  const block = winsWith(foe);
  if (block != null) return block;
  const safe = open.filter((c) => {
    const r = dropRow(grid, c);
    if (r === 0) return true;
    grid[r][c] = me; grid[r - 1][c] = foe;
    const bad = lineAt(grid, r - 1, c, foe);
    grid[r][c] = null; grid[r - 1][c] = null;
    return !bad;
  });
  const pool = safe.length ? safe : open;
  return pool.map((c) => ({ c, s: 4 - Math.abs(c - 3) + Math.random() * 1.5 })).sort((a, b) => b.s - a.s)[0].c;
}

// Tactics: take the win, block the only loss, own win beats blocking.
{
  const g = emptyGrid();
  for (const c of [0, 1, 2]) g[5][c] = 'dark';
  const win = botColumn(g);
  if (win !== 3) throw new Error('missed immediate win, played ' + win);
}
{
  const g = emptyGrid();
  for (const c of [4, 5, 6]) g[5][c] = 'light';
  const block = botColumn(g);
  if (block !== 3) throw new Error('missed the forced block, played ' + block);
}
{
  const g = emptyGrid();
  for (const c of [0, 1, 2]) g[5][c] = 'dark';
  g[5][6] = 'light'; g[4][6] = 'light'; g[3][6] = 'light';
  const take = botColumn(g);
  if (take !== 3) throw new Error('blocked instead of winning, played ' + take);
}
console.log('tactics OK');

// Games: clean boards, alternating colours.
const games = +(process.argv[2] || 32);
const stats = { botWins: 0, oldWins: 0, draws: 0 };
let worst = 0, total = 0, moves = 0;
for (let g = 0; g < games; g++) {
  const grid = emptyGrid();
  const botColor = g % 2 ? 'light' : 'dark';
  const oldColor = botColor === 'dark' ? 'light' : 'dark';
  let turn = 'light', winner = null;
  for (let n = 0; n < 42; n++) {
    let c;
    if (turn === botColor) {
      const t0 = performance.now();
      c = botColumn(grid, botColor, oldColor);
      const dt = performance.now() - t0;
      total += dt; moves++;
      if (dt > worst) worst = dt;
    } else c = oldBot(grid, oldColor, botColor);
    if (c == null || dropRow(grid, c) < 0) throw new Error(`game ${g}: illegal move ${c}`);
    const r = dropRow(grid, c);
    grid[r][c] = turn;
    if (lineAt(grid, r, c, turn)) { winner = turn; break; }
    if (isFull(grid)) break;
    turn = turn === 'light' ? 'dark' : 'light';
  }
  winner === botColor ? stats.botWins++ : winner === oldColor ? stats.oldWins++ : stats.draws++;
}
console.log(stats, { avgMs: +(total / moves).toFixed(1), worstMs: Math.round(worst) });
if (stats.oldWins / games > 0.1) throw new Error(`the bot lost ${stats.oldWins}/${games} to the old heuristic`);
console.log('c4 self-check OK');
