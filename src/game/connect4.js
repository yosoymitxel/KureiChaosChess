// Conecta 4: tokens drop down columns; four in a row (any direction) wins. Pure rules, no DOM.
export const ROWS = 6, COLS = 7;

export const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// Row a token would land on in this column, or -1 if the column is full.
export function dropRow(grid, col) {
  for (let r = ROWS - 1; r >= 0; r--) if (!grid[r][col]) return r;
  return -1;
}

// The four winning cells if `who` has four in a row through (r, c), else null.
export function lineAt(grid, r, c, who) {
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const cells = [[r, c]];
    for (const s of [1, -1]) {
      let rr = r + dr * s, cc = c + dc * s;
      while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && grid[rr][cc] === who) { cells.push([rr, cc]); rr += dr * s; cc += dc * s; }
    }
    if (cells.length >= 4) return cells;
  }
  return null;
}

export const isFull = (grid) => grid[0].every(Boolean);

// Bot: win now, else block the player's win, else avoid handing over a win, preferring the centre.
export function botColumn(grid, me = 'dark', foe = 'light') {
  const open = [...Array(COLS).keys()].filter((c) => dropRow(grid, c) >= 0);
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
  // Centre columns are worth more; a little noise keeps games from repeating.
  return pool.map((c) => ({ c, s: 4 - Math.abs(c - 3) + Math.random() * 1.5 })).sort((a, b) => b.s - a.s)[0].c;
}
