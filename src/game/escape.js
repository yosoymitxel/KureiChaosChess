import { legalMoves } from './rules.js';

// Huida del caballo: la guardia baja hacia ti y se cruza en el camino. No se puede capturar;
// hay que pasar por encima de su línea antes de que te alcance. El guardia usa la pieza
// `guard` de rules.js (un paso en cualquier dirección salvo hacia atrás, o dos en diagonal
// hacia delante si el paso está libre), así que su amenaza es real y se lee en el tablero.
export const SIZE = 7;
export const DIFFS = {
  facil: {
    name: 'Fácil', turns: 5, guardEvery: 2,
    guards: [{ row: 2, col: 3 }],
    holes: ['4,0', '4,6'],
  },
  normal: {
    name: 'Normal', turns: 5, guardEvery: 1,
    guards: [{ row: 3, col: 3 }],
    holes: ['3,0', '3,6', '4,2', '4,4'],
  },
  dificil: {
    name: 'Difícil', turns: 4, guardEvery: 1,
    guards: [{ row: 2, col: 2 }, { row: 2, col: 4 }],
    holes: ['2,1', '2,5', '3,1', '3,5', '4,3'],
  },
};

const board = (holes) => ({ rows: SIZE, cols: SIZE, holes: new Set(holes), terrain: new Map(), portals: new Map() });
const piece = (id, type, color, row, col) => ({ id, type, color, row, col });
const runnerOf = (s) => s.pieces.find((p) => p.id === 'runner');
const guardsOf = (s) => s.pieces.filter((p) => p.color === 'dark');

export function newEscape(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  return {
    diff,
    board: board(diff.holes),
    pieces: [
      piece('runner', 'knight', 'light', 6, 3),
      ...diff.guards.map((g, i) => piece(i ? `guard${i + 1}` : 'guard', 'guard', 'dark', g.row, g.col)),
    ],
    turns: diff.turns,
    over: null,
    loseReason: null,
    last: null,
  };
}

// El caballo salta; no puede capturar. Las casillas del guardia quedan fuera.
export const legal = (s) => s.over ? [] : legalMoves(runnerOf(s), s.pieces, s.board).filter((m) => !m.hits.length);

// La guardia persigue de forma determinista: si puede atrapar, atrapa; si no, da el paso que
// más la acerca al caballo, prefiriendo bajar (nunca puede volver hacia arriba).
function guardStep(s, guard, runner) {
  const moves = legalMoves(guard, s.pieces, s.board);
  if (!moves.length) return null;
  const capture = moves.find((m) => m.hits.includes(runner));
  if (capture) return capture;
  const dist = (m) => Math.abs(runner.row - m.row) + Math.abs(runner.col - m.col);
  moves.sort((a, b) => dist(a) - dist(b) || b.row - a.row || Math.abs(runner.col - b.col) - Math.abs(runner.col - a.col));
  return moves[0];
}

const guardsMoveNow = (s) => {
  const made = s.diff.turns - s.turns;
  return made > 0 && made % s.diff.guardEvery === 0;
};

// Mueve la guardia y decide el final. `s.last.guards` alimenta la animación de la pantalla.
function advanceGuards(s) {
  const runner = runnerOf(s);
  for (const guard of guardsOf(s)) {
    const m = guardStep(s, guard, runner);
    if (!m) continue;
    const from = { row: guard.row, col: guard.col };
    guard.row = m.row; guard.col = m.col;
    s.last?.guards.push({ id: guard.id, from, to: { row: m.row, col: m.col } });
    if (m.hits.includes(runner)) {
      s.over = 'lose'; s.loseReason = 'caught'; s.caughtBy = guard.id;
      return;
    }
  }
  if (s.turns <= 0) { s.over = 'lose'; s.loseReason = 'turns'; }
  else if (!legal(s).length) { s.over = 'lose'; s.loseReason = 'stuck'; }
}

export function move(s, row, col) {
  if (s.over) return false;
  const runner = runnerOf(s);
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: runner.row, col: runner.col };
  runner.row = row; runner.col = col;
  s.turns--;
  s.last = { runner: { id: runner.id, from, to: { row, col } }, guards: [] };
  s.caughtBy = null;
  if (runner.row === 0) { s.over = 'win'; return true; }
  if (guardsMoveNow(s)) advanceGuards(s);
  else if (s.turns <= 0) { s.over = 'lose'; s.loseReason = 'turns'; }
  else if (!legal(s).length) { s.over = 'lose'; s.loseReason = 'stuck'; }
  return true;
}

// Saltos que pierden en la jugada siguiente: la pantalla los marca en rojo antes de saltar.
// Se simula cada salto sobre una copia para respetar el orden y la cadencia de la guardia.
export function losingMoves(s) {
  const out = new Set();
  if (s.over) return out;
  for (const m of legal(s)) {
    const c = { ...s, pieces: s.pieces.map((p) => ({ ...p })), last: null, caughtBy: null };
    const runner = runnerOf(c);
    runner.row = m.row; runner.col = m.col;
    c.turns--;
    if (runner.row === 0) continue;
    if (guardsMoveNow(c)) advanceGuards(c);
    else if (c.turns <= 0 || !legal(c).length) c.over = 'lose';
    if (c.over === 'lose') out.add(m.row + ',' + m.col);
  }
  return out;
}
