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

// Bot: alpha-beta search over the drop order, DEPTH plies deep (instant and still
// beatable, by design). Every 4-cell window is scored, with extra weight on threes
// that complete on move parity and on the centre, so it builds double threats
// instead of only reacting to yours.
const ORDER = [3, 2, 4, 1, 5, 0, 6]; // centre first: strongest play and best pruning
const DEPTH = 6;
// Profundidad de la búsqueda: somero se deja engañar; hondo ve venir las dobles amenazas.
export const DIFFS = {
  facil: { name: 'Fácil', depth: 4 },
  normal: { name: 'Normal', depth: 6 },
  dificil: { name: 'Difícil', depth: 8 },
};
const WIN = 1e6;

// All 4-in-a-row windows, built once.
const WINDOWS = (() => {
  const out = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const r3 = r + 3 * dr, c3 = c + 3 * dc;
        if (r3 < ROWS && c3 >= 0 && c3 < COLS) out.push([[r, c], [r + dr, c + dc], [r + 2 * dr, c + 2 * dc], [r3, c3]]);
      }
  return out;
})();

// A clean window scores by token count; a three whose empty cell sits on an odd row
// (from the bottom) is the deadlier kind in Connect 4, so it scores higher.
const weight = (n, empty) => (n === 3 ? ((ROWS - empty) % 2 ? 130 : 70) : [0, 1, 10][n]);

function evaluate(grid, me, foe) {
  let s = 0;
  for (const w of WINDOWS) {
    let m = 0, f = 0, empty = 0;
    for (const [r, c] of w) { const v = grid[r][c]; if (v === me) m++; else if (v === foe) f++; else empty = r; }
    if (m && f) continue;
    s += weight(m, empty) - weight(f, empty);
  }
  for (let r = 0; r < ROWS; r++) s += grid[r][3] === me ? 3 : grid[r][3] === foe ? -3 : 0;
  return s;
}

// Negamax: scores are always read from `who`'s point of view.
function search(grid, me, foe, who, depth, alpha, beta, top) {
  let best = -Infinity, any = false;
  for (const c of ORDER) {
    const r = dropRow(grid, c);
    if (r < 0) continue;
    any = true;
    grid[r][c] = who;
    const v = lineAt(grid, r, c, who) ? WIN - (top - depth)
      : depth <= 1 ? (who === me ? evaluate(grid, me, foe) : -evaluate(grid, me, foe))
      : -search(grid, me, foe, who === me ? foe : me, depth - 1, -beta, -alpha, top);
    grid[r][c] = null;
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return any ? best : 0;
}

// Best column for `me`, or null on a full board. Ties among exactly-equal moves break
// randomly so games vary; a move whose search cut off on beta only offers a bound, so
// it is dropped instead of being mistaken for a tie.
export function botColumn(grid, me = 'dark', foe = 'light', depth = DEPTH) {
  let best = -Infinity, cols = [];
  for (const c of ORDER) {
    const r = dropRow(grid, c);
    if (r < 0) continue;
    grid[r][c] = me;
    let v;
    if (lineAt(grid, r, c, me)) v = WIN;
    else {
      const ret = search(grid, me, foe, foe, depth - 1, -Infinity, -best, depth);
      v = ret >= -best ? -Infinity : -ret;
    }
    grid[r][c] = null;
    if (v > best) { best = v; cols = [c]; }
    else if (v === best) cols.push(c);
  }
  return cols.length ? cols[Math.floor(Math.random() * cols.length)] : null;
}
