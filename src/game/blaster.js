// Alfil artillero: el alfil se mueve en diagonal y, al acabar, dispara solo por sus diagonales a los
// enemigos más cercanos. Llegan oleadas desde los bordes y avanzan una casilla por turno hacia él: lo
// que entra por recto no se puede disparar. Cada oleada dura unos turnos (o hasta limpiarla); limpiarla
// da un disparo más. Aguanta todas.
import { grid, key, inside, shuffle, pick, at, piece, freeCells, movesOf, cheb } from './turn-kit.js';
import { t } from '../i18n/index.js';

export const DIFFS = {
  facil: { name: 'Fácil', n: 7, waves: [3, 4, 5], range: 6, len: 8, time: 7 },
  normal: { name: 'Normal', n: 7, waves: [4, 5, 7], range: 4, len: 8, time: 5 },
  dificil: { name: 'Difícil', n: 7, waves: [5, 7, 9], range: 3, len: 9, time: 3.5 },
};
const TYPES = ['pawn', 'knight', 'guard'];

export function create(dk = 'normal', rng = Math.random) {
  const diff = DIFFS[dk] || DIFFS.normal, b = grid(diff.n), mid = Math.floor(diff.n / 2);
  const s = { diff, board: b, bishop: piece('bishop', 'light', mid, mid), foes: [], rng, wave: 0, clock: 0, shots: 1, killed: 0, over: null, note: '' };
  spawn(s);
  return s;
}
function spawn(s) {
  const edge = (r, c) => (r === 0 || c === 0 || r === s.board.rows - 1 || c === s.board.cols - 1) && cheb({ row: r, col: c }, s.bishop) >= 3;
  for (const [r, c] of shuffle(s.rng, freeCells(s.board, [s.bishop], edge)).slice(0, s.diff.waves[s.wave])) s.foes.push(piece(pick(s.rng, TYPES), 'dark', r, c));
}

// Primer enemigo de cada diagonal dentro del alcance, de más cerca a más lejos.
export function targets(s) {
  const out = [];
  for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) for (let i = 1; i <= s.diff.range; i++) {
    const r = s.bishop.row + dr * i, c = s.bishop.col + dc * i;
    if (!inside(s.board, r, c)) break;
    const f = at(s.foes, r, c);
    if (f) { out.push([i, f]); break; }
  }
  return out.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}

export function tap(s, r, c) {
  if (!movesOf(s.bishop, [s.bishop, ...s.foes], s.board).some(([a, b]) => a === r && b === c)) return null;
  const eaten = at(s.foes, r, c);
  if (eaten) { s.foes.splice(s.foes.indexOf(eaten), 1); s.killed++; }
  s.bishop.row = r; s.bishop.col = c;
  const post = [];
  for (const f of targets(s).slice(0, s.shots)) { post.push({ beam: [[r, c], [f.row, f.col]] }); s.foes.splice(s.foes.indexOf(f), 1); s.killed++; }
  if (post.length) post.push({ wait: 160 });
  if (!s.foes.length) { s.shots++; post.push({ power: s.bishop.id, color: '#c58bff' }, { float: [r, c, t('blaster.up', '+1 disparo')] }); nextWave(s); }
  return { pre: [], post, ms: 420 };
}

function nextWave(s) {
  s.wave++; s.clock = 0;
  if (s.wave >= s.diff.waves.length) { s.over = 'win'; s.note = t('blaster.won', 'Aguantaste las {n} oleadas.', { n: s.wave }); }
  else spawn(s);
}

// Cada enemigo da un paso hacia el alfil (el caballo, en L); si llega a su casilla, se lo come.
export function enemy(s) {
  for (const f of s.foes) {
    const steps = f.type === 'knight' ? movesOf(f, [f], s.board) : [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [f.row + dr, f.col + dc])).filter(([r, c]) => inside(s.board, r, c));
    const free = steps.filter(([r, c]) => !at(s.foes, r, c));
    if (free.some(([r, c]) => r === s.bishop.row && c === s.bishop.col)) { f.row = s.bishop.row; f.col = s.bishop.col; s.over = 'lose'; s.note = t('blaster.lost', 'Un enemigo alcanzó al alfil.'); return { pre: [], post: [{ hurt: s.bishop.id }] }; }
    const best = free.reduce((a, b) => (cheb({ row: b[0], col: b[1] }, s.bishop) < cheb({ row: a[0], col: a[1] }, s.bishop) ? b : a), [f.row, f.col]);
    [f.row, f.col] = best;
  }
  if (++s.clock >= s.diff.len) nextWave(s);
  return { pre: [], post: [{ doom: danger(s) }], ms: 380 };
}

// Aviso, como en la horda de la dama: casillas a las que algún enemigo llega el turno que viene.
const danger = (s) => [...new Map(s.foes.flatMap((f) => reach(s, f)).filter(([r, c]) => inside(s.board, r, c)).map((x) => [key(...x), x])).values()];
export const start = (s) => [{ doom: danger(s) }];

// Autocomprobación: casilla a la que ningún enemigo llega el turno que viene y con más blancos a tiro.
const reach = (s, f) => (f.type === 'knight' ? movesOf(f, [f], s.board) : [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [f.row + dr, f.col + dc])));
export const auto = (s) => {
  const moves = movesOf(s.bishop, [s.bishop, ...s.foes], s.board);
  const score = ([r, c]) => {
    const b = s.bishop, saved = [b.row, b.col], gone = at(s.foes, r, c);
    b.row = r; b.col = c;
    const shot = targets(s).filter((f) => f !== gone).slice(0, s.shots), left = s.foes.filter((f) => f !== gone && !shot.includes(f));
    b.row = saved[0]; b.col = saved[1];
    const hit = left.some((f) => reach(s, f).some(([a, b2]) => a === r && b2 === c));
    return shot.length * 2 + (gone ? 2 : 0) - (hit ? 20 : 0) - Math.abs(r - 3) * 0.1 - Math.abs(c - 3) * 0.1;
  };
  return moves.reduce((a, b) => (score(b) > score(a) ? b : a), moves[0]);
};

export const pieces = (s) => [s.bishop, ...s.foes].map((p) => ({ ...p }));
export const marks = (s) => [...movesOf(s.bishop, [s.bishop, ...s.foes], s.board).map(([r, c]) => [key(r, c), at(s.foes, r, c) ? 'cap' : 'mv']), ...targets(s).slice(0, s.shots).map((f) => [key(f.row, f.col), 'danger'])];
export const status = (s) => t('blaster.status', 'Oleada {n}/{total} · turnos {turns} · disparos {shots} · enemigos {left}', { n: s.wave + 1, total: s.diff.waves.length, turns: s.diff.len - s.clock, shots: s.shots, left: s.foes.length });
