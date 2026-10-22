// La cacería: captura al fugitivo antes de que cruce la fila superior.
import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 8, fleeEvery: 3, evasion: 0 },
  normal: { name: 'Normal', turns: 7, fleeEvery: 2, evasion: 1 },
  dificil: { name: 'Difícil', turns: 6, fleeEvery: 1, evasion: 2 },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const make = (id, type, color, row, col) => ({ id, type, color, row, col });

export function newHunt(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  return {
    diff,
    board: board(),
    pieces: [make('hunter', 'queen', 'light', 6, 3), make('runner', 'pawn', 'dark', 3, 4)],
    turns: diff.turns,
    over: null,
    last: null,
    escaped: 0,
  };
}

export const legal = (s) => {
  if (s.over) return [];
  const hunter = s.pieces.find((p) => p.id === 'hunter');
  return hunter ? legalMoves(hunter, s.pieces, s.board) : [];
};

function isThreatened(s, hunter, row, col) {
  const runner = { id: 'runner-preview', type: 'pawn', color: 'dark', row, col };
  return legalMoves(hunter, [hunter, runner], s.board).some((m) => m.hits.includes(runner));
}

function runnerChoices(s, hunter, runner) {
  const row = runner.row - 1;
  if (row < 0) return [];
  return [-1, 0, 1]
    .map((dc) => ({ row, col: runner.col + dc }))
    .filter((p) => p.col >= 0 && p.col < SIZE && !(p.row === hunter.row && p.col === hunter.col))
    .map((p) => {
      const threatened = isThreatened(s, hunter, p.row, p.col);
      const distance = Math.abs(p.row - hunter.row) + Math.abs(p.col - hunter.col);
      const next = p.row > 0
        ? [-1, 0, 1]
          .map((dc) => ({ row: p.row - 1, col: p.col + dc }))
          .filter((q) => q.col >= 0 && q.col < SIZE && !(q.row === hunter.row && q.col === hunter.col))
        : [];
      const safeNext = next.filter((q) => !isThreatened(s, hunter, q.row, q.col)).length;
      let score;
      if (p.row === 0) {
        // Llegar a la salida termina la partida de inmediato; el cazador ya no puede responder.
        score = 10000;
      } else if (s.diff.evasion === 0) {
        // Fácil: avanza y se aleja, pero comete errores tácticos.
        score = distance * 2 + (threatened ? -3 : 2) + safeNext * 0.1;
      } else if (s.diff.evasion === 1) {
        // Normal: evita una captura inmediata y busca conservar más de una ruta.
        score = (threatened ? -100 : 100) + distance + safeNext * 4;
      } else {
        // Difícil: evita amenazas y prioriza casillas con varias continuaciones seguras.
        score = (threatened ? -1000 : 1000) + distance * 2 + safeNext * 12;
      }
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score || a.col - b.col);
}

function moveRunner(s, hunter, runner) {
  const choices = runnerChoices(s, hunter, runner);
  if (!choices.length) {
    s.pieces = [hunter];
    s.over = 'win';
    return;
  }
  const next = choices[0];
  runner.row = next.row;
  runner.col = next.col;
  if (runner.row === 0) {
    s.over = 'lose';
    s.escaped = 1;
  }
}

export function move(s, row, col) {
  if (s.over) return false;
  const hunter = s.pieces.find((p) => p.id === 'hunter');
  const runner = s.pieces.find((p) => p.id === 'runner');
  if (!hunter || !runner) return false;
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;

  const from = { row: hunter.row, col: hunter.col };
  const caught = m.hits.some((p) => p.id === runner.id);
  hunter.row = row;
  hunter.col = col;
  s.last = { id: hunter.id, from, to: { row, col }, caught };
  s.turns--;

  if (caught) {
    s.pieces = [hunter];
    s.over = 'win';
    return true;
  }

  const elapsed = s.diff.turns - s.turns;
  if (elapsed % s.diff.fleeEvery === 0) moveRunner(s, hunter, runner);
  if (!s.over && s.turns <= 0) s.over = 'lose';
  return true;
}
