// Damas (reglas inglesas): fichas en casillas oscuras, captura obligatoria y saltos encadenados,
// coronación en la última fila; la dama da un paso en cualquier diagonal. Reglas puras, sin DOM.
// El marfil abajo sube; el carmesí arriba baja.
export const DIFFS = {
  facil: { name: 'Fácil', size: 6, rows: 2, depth: 0 },
  normal: { name: 'Normal', size: 8, rows: 3, depth: 1 },
  dificil: { name: 'Difícil', size: 10, rows: 4, depth: 3 },
};
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const fwd = (side) => (side === 'light' ? -1 : 1);

export function newCheckers(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal, n = diff.size, pieces = [];
  let id = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if ((r + c) % 2 !== 1) continue;
    if (r < diff.rows) pieces.push({ id: id++, r, c, side: 'dark', king: false });
    else if (r >= n - diff.rows) pieces.push({ id: id++, r, c, side: 'light', king: false });
  }
  return { n, diff, pieces, turn: 'light', chain: null, over: null, last: null };
}

export const pieceAt = (s, r, c) => s.pieces.find((p) => p.r === r && p.c === c);
const inside = (s, r, c) => r >= 0 && c >= 0 && r < s.n && c < s.n;
const dirsOf = (p) => (p.king ? DIAG : DIAG.filter(([dr]) => dr === fwd(p.side)));

function movesOf(s, p) {
  const steps = [], jumps = [];
  for (const [dr, dc] of dirsOf(p)) {
    const r = p.r + dr, c = p.c + dc;
    if (!inside(s, r, c)) continue;
    const o = pieceAt(s, r, c);
    if (!o) steps.push({ p, to: { r, c }, cap: null });
    else if (o.side !== p.side && inside(s, r + dr, c + dc) && !pieceAt(s, r + dr, c + dc)) jumps.push({ p, to: { r: r + dr, c: c + dc }, cap: o });
  }
  return { steps, jumps };
}

// Jugadas válidas del bando que mueve: si alguna pieza puede capturar, solo valen capturas;
// en mitad de una cadena, solo sigue la pieza que salta.
export function legal(s, side = s.turn) {
  const mine = s.chain ? [s.chain] : s.pieces.filter((p) => p.side === side);
  const all = mine.map((p) => movesOf(s, p));
  const jumps = all.flatMap((m) => m.jumps);
  if (jumps.length || s.chain) return jumps;
  return all.flatMap((m) => m.steps);
}

export function play(s, move) {
  if (s.over) return null;
  const ok = legal(s).find((m) => m.p === move.p && m.to.r === move.to.r && m.to.c === move.to.c);
  if (!ok) return null;
  const from = { r: ok.p.r, c: ok.p.c };
  ok.p.r = ok.to.r; ok.p.c = ok.to.c;
  if (ok.cap) s.pieces = s.pieces.filter((x) => x !== ok.cap);
  const crowned = !ok.p.king && ok.p.r === (ok.p.side === 'light' ? 0 : s.n - 1);
  if (crowned) ok.p.king = true;
  // La cadena sigue si la misma pieza puede volver a capturar (coronar corta la cadena).
  s.chain = ok.cap && !crowned && movesOf(s, ok.p).jumps.length ? ok.p : null;
  if (!s.chain) s.turn = s.turn === 'light' ? 'dark' : 'light';
  s.last = { from, to: { ...ok.to }, cap: ok.cap, crowned, p: ok.p };
  if (!legal(s).length) s.over = s.turn === 'light' ? 'lose' : 'win';
  return s.last;
}

// Copia barata para buscar jugadas sin tocar el estado de la partida.
const clone = (s) => {
  const pieces = s.pieces.map((p) => ({ ...p }));
  return { ...s, pieces, chain: s.chain && pieces.find((p) => p.id === s.chain.id) };
};
const score = (s) => s.pieces.reduce((n, p) => n + (p.side === 'dark' ? 1 : -1) * (p.king ? 1.6 : 1), 0);

function search(s, depth) {
  if (s.over) return s.over === 'lose' ? 99 : -99;
  if (depth <= 0) return score(s);
  const maximize = s.turn === 'dark';
  let best = maximize ? -Infinity : Infinity;
  for (const m of legal(s)) {
    const t = clone(s);
    play(t, { p: t.pieces.find((p) => p.id === m.p.id), to: m.to });
    const v = search(t, t.turn === s.turn ? depth : depth - 1);
    best = maximize ? Math.max(best, v) : Math.min(best, v);
  }
  return best;
}

// El bot carmesí: en Fácil captura si puede y si no juega al azar; más arriba mira jugadas adelante.
export function botMove(s, rng = Math.random) {
  const opts = legal(s);
  if (!opts.length) return null;
  if (!s.diff.depth) return opts[Math.floor(rng() * opts.length)];
  let best = -Infinity, pool = [];
  for (const m of opts) {
    const t = clone(s);
    play(t, { p: t.pieces.find((p) => p.id === m.p.id), to: m.to });
    const v = search(t, t.turn === 'dark' ? s.diff.depth : s.diff.depth - 1) + rng() * 0.2;
    if (v > best) { best = v; pool = [m]; } else if (v === best) pool.push(m);
  }
  return pool[Math.floor(rng() * pool.length)];
}
