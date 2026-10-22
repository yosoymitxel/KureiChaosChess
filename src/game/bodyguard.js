import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 4, ai: 'simple' },
  normal: { name: 'Normal', turns: 5, ai: 'tactical' },
  dificil: { name: 'Difícil', turns: 6, ai: 'hunter' },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const piece = (id, type, color, row, col) => ({ id, type, color, row, col });

export function newBodyguard(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  // Distintas aperturas: el atacante no siempre empieza en la misma columna.
  const startCol = key === 'facil' ? 0 : key === 'dificil' ? 6 : 3;
  return {
    diff,
    board: board(),
    pieces: [
      piece('king', 'king', 'light', 6, 3),
      piece('guard', 'rook', 'light', 5, 3),
      piece('assailant', 'king', 'dark', 0, startCol),
    ],
    turns: diff.turns,
    over: null,
    events: [],
    enemyMoves: 0,
  };
}

export const legal = (s, p) => s.over || !p || p.color !== 'light'
  ? []
  : legalMoves(p, s.pieces, s.board);

const distance = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

function evaluateEnemyMove(s, enemy, king, guard, move, index) {
  const victims = move.hits || [];
  if (victims.some((p) => p.id === 'king')) return 1e6;
  const takesGuard = victims.some((p) => p.id === 'guard');
  const nextEnemy = { ...enemy, row: move.row, col: move.col };
  const remaining = s.pieces.filter((p) => p !== enemy && !victims.includes(p));
  const after = [...remaining, nextEnemy];
  const nextKing = remaining.find((p) => p.id === 'king');
  const nextGuard = remaining.find((p) => p.id === 'guard');
  if (!nextKing) return 1e6;

  const kingDistance = distance(nextEnemy, nextKing);
  const guardDistance = nextGuard ? distance(nextEnemy, nextGuard) : 0;
  // Una casilla desde la que el rey o la torre pueden capturar al atacante es peligrosa.
  const exposed = remaining
    .filter((p) => p.color === 'light')
    .some((p) => legalMoves(p, after, s.board).some((candidate) => candidate.hits?.some((hit) => hit.id === 'assailant')));

  if (s.diff.ai === 'simple') {
    // Fácil: persigue al rey sin cálculo táctico; sus desempates alternan para que no repita siempre la ruta.
    return -kingDistance * 10 + (takesGuard ? 1 : 0) + ((index + s.enemyMoves) % 2) * 0.2;
  }
  if (s.diff.ai === 'tactical') {
    return -kingDistance * 12 + (takesGuard ? 35 : 0) - (exposed ? 8 : 0) + (nextGuard ? -Math.max(0, 5 - guardDistance) : 0);
  }
  // Difícil: elimina la escolta cuando puede, presiona al rey y evita casillas de captura inmediata.
  return -kingDistance * 18 + (takesGuard ? 500 : 0) - (exposed ? 120 : 0)
    + (nextGuard ? -Math.max(0, 4 - guardDistance) * 4 : 0)
    + legalMoves(nextEnemy, after, s.board).length * 0.15;
}

function enemyTurn(s) {
  const enemy = s.pieces.find((p) => p.id === 'assailant');
  const king = s.pieces.find((p) => p.id === 'king');
  if (!enemy || !king) return;
  const guard = s.pieces.find((p) => p.id === 'guard');
  const moves = legalMoves(enemy, s.pieces, s.board);
  if (!moves.length) {
    // Si el atacante no puede actuar, el jugador ha resistido la amenaza.
    s.turns = 0;
    s.over = 'win';
    return;
  }
  const ranked = moves.map((m, i) => ({ move: m, score: evaluateEnemyMove(s, enemy, king, guard, m, i) }));
  ranked.sort((a, b) => b.score - a.score || a.move.row - b.move.row || a.move.col - b.move.col);
  const m = ranked[0].move;
  const from = { row: enemy.row, col: enemy.col };
  const victims = m.hits || [];
  enemy.row = m.row;
  enemy.col = m.col;
  s.pieces = s.pieces.filter((p) => !victims.includes(p));
  s.events.push({ id: enemy.id, from, to: { row: m.row, col: m.col }, victims: victims.map((p) => p.id) });
  s.enemyMoves++;
  if (victims.some((p) => p.id === 'king')) s.over = 'lose';
}

export function move(s, id, row, col) {
  if (s.over) return false;
  const p = s.pieces.find((x) => x.id === id && x.color === 'light');
  const m = legal(s, p).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: p.row, col: p.col }, victims = m.hits || [];
  p.row = row;
  p.col = col;
  s.pieces = s.pieces.filter((x) => !victims.includes(x));
  s.events = [{ id, from, to: { row, col }, victims: victims.map((x) => x.id) }];
  if (victims.some((x) => x.id === 'assailant')) {
    s.over = 'win';
    return true;
  }
  s.turns--;
  enemyTurn(s);
  if (!s.over && s.turns <= 0) s.over = 'win';
  return true;
}
