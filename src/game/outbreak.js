// Antídoto (id `outbreak`): puzle de cura en cadena (referencia: Dr. Mario, NES: con la cápsula que
// toca y la siguiente a la vista, limpiar todos los virus). El tablero está lleno de piezas carmesí
// infectadas y tienes una cola de vacunas, cada una con forma de pieza. La vacuna se pone en una casilla
// vacía y cura a las infectadas que esa forma ataca desde ahí; cada curada cura a su vez a las que ataca,
// en cadena. Las vacunas y las curadas se quedan en el tablero y tapan líneas. Hay que curarlas a todas.
// Las mesas se generan con la solución hecha primero: cada vacuna en su casilla y su cadena alrededor.
import { canHit, ctxOf, key } from './rules.js';

const TYPES = ['pawn', 'pawn', 'knight', 'knight', 'bishop', 'rook', 'queen'];
const DOSES = ['knight', 'knight', 'bishop', 'bishop', 'rook', 'pawn'];
// doses: vacunas en la cola · reach: infectadas por vacuna en la solución · undos: deshacer · greedy: parte de
// mesas que se dejan ganar con "la cadena más larga cada vez" (el resto se descarta: hay que pensar el orden).
export const DIFFS = {
  facil: { name: 'Fácil', n: 6, doses: 3, reach: [2, 3], undos: 3, greedy: 1 },
  normal: { name: 'Normal', n: 7, doses: 3, reach: [3, 4], undos: 2, greedy: 0.5 },
  dificil: { name: 'Difícil', n: 8, doses: 3, reach: [4, 5], undos: 1, greedy: 0.3 },
};

const boardOf = (n) => ({ rows: n, cols: n, holes: new Set(), terrain: new Map(), portals: new Map() });
const pickOf = (rng, list) => list[Math.floor(rng() * list.length)];
export const occupied = (s, r, c) => s.pieces.some((p) => p.row === r && p.col === c);
export const next = (s) => s.queue[s.used];

// La cadena que desata la vacuna `dose` (pieza aún fuera de s.pieces): oleadas de curadas.
export function chain(s, dose) {
  const all = [...s.pieces, dose], healed = new Set([...s.pieces.filter((p) => !p.sick), dose]), waves = [];
  let front = [dose];
  while (front.length) {
    // Curadas y vacunas atacan como bando marfil; las infectadas son el carmesí.
    const view = all.map((p) => ({ ...p, color: healed.has(p) ? 'light' : 'dark', src: p }));
    const ctx = ctxOf(view, boardOf(s.n)), found = [];
    for (const f of front) {
      const me = view.find((v) => v.src === f);
      // Como el color de la cápsula en Dr. Mario: la vacuna solo cura a las de su misma forma; las curadas, a todas.
      for (const v of view) if (v.color === 'dark' && (f !== dose || v.type === dose.type) && !found.includes(v.src) && canHit(me, v, ctx)) found.push(v.src);
    }
    for (const p of found) healed.add(p);
    if (found.length) waves.push(found);
    front = found;
  }
  return waves;
}

const doseAt = (s, r, c) => ({ id: 'd' + s.used, type: next(s), row: r, col: c, sick: false, dose: true });

// Lo que curaría la vacuna de turno en (r, c), sin ponerla: oleadas (vacía si la casilla no vale).
export function preview(s, r, c) {
  if (s.over || !next(s) || occupied(s, r, c)) return [];
  return chain(s, doseAt(s, r, c));
}

// Pone la vacuna de turno en (r, c). Devuelve las oleadas curadas, o null si no se puede.
export function vaccinate(s, r, c) {
  if (s.over || !next(s) || r < 0 || c < 0 || r >= s.n || c >= s.n || occupied(s, r, c)) return null;
  // Id nuevo en cada vacuna: una deshecha y vuelta a poner no es la misma pieza para el tablero.
  const dose = { ...doseAt(s, r, c), id: 'd' + (s.made = (s.made || 0) + 1) }, waves = chain(s, dose);
  s.history.push({ dose, cured: waves.flat() });
  for (const p of waves.flat()) p.sick = false;
  s.pieces.push(dose);
  s.used += 1;
  settle(s);
  return waves;
}

function settle(s) {
  s.stuck = false;
  if (s.pieces.every((p) => !p.sick)) s.over = 'win';
  else if (s.used >= s.queue.length) { if (s.undos > 0) s.stuck = true; else s.over = 'lose'; }
}

// Deshace la última vacuna (gasta un deshacer): vuelve a la cola y sus curadas recaen.
export function undo(s) {
  if (s.over || !s.history.length || s.undos <= 0) return null;
  const { dose, cured } = s.history.pop();
  s.pieces = s.pieces.filter((p) => p !== dose);
  for (const p of cured) p.sick = true;
  s.used -= 1;
  s.undos -= 1;
  s.undone = true;
  settle(s);
  return { dose, cured };
}

// Sin vacunas y sin ganas de deshacer: se acaba la partida.
export function giveUp(s) {
  if (!s.over) s.over = 'lose';
}

// Casillas vacías a las que `piece` (marfil) llegaría atacando, con lo que hay ahora en el tablero.
function reach(s, piece, pieces) {
  const out = [], view = pieces.map((p) => ({ ...p, color: 'light' })), me = view.find((v) => v.id === piece.id), ctx = ctxOf(view, boardOf(s.n));
  // Una pieza de prueba en cada casilla vacía, metida y sacada del mapa de ocupación (rehacerlo era lo caro).
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) {
    const k = key(r, c);
    if (ctx.occ.has(k)) continue;
    const dummy = { id: '?', type: 'pawn', color: 'dark', row: r, col: c };
    ctx.occ.set(k, dummy);
    if (canHit(me, dummy, ctx)) out.push([r, c]);
    ctx.occ.delete(k);
  }
  return out;
}

// Estrategias de referencia (selfcheck y filtro de mesas). `score(s, r, c)` → valor de poner ahí la de turno.
export const empties = (s) => {
  const out = [];
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) if (!occupied(s, r, c)) out.push([r, c]);
  return out;
};
export const cures = (s, r, c) => preview(s, r, c).flat().length;
export function play(s, pick, rng = Math.random) {
  while (!s.over && !s.stuck) {
    const cells = empties(s), vals = cells.map(([r, c]) => pick(s, r, c, rng)), best = Math.max(...vals);
    const top = cells.filter((_, i) => vals[i] === best);
    vaccinate(s, ...pickOf(rng, top));
  }
  return s.over === 'win';
}
export const greedy = (s, r, c) => cures(s, r, c);
export const blind = (s, r, c, rng) => rng();

export const clone = (s) => {
  const pieces = s.pieces.map((p) => ({ ...p }));
  return { ...s, pieces, queue: [...s.queue], history: [], undos: 0 };
};

export function newOutbreak(key = 'normal', rng = Math.random) {
  const diff = DIFFS[key] || DIFFS.normal, easy = rng() < diff.greedy;
  for (let tries = 0; ; tries++) {
    const queue = Array.from({ length: diff.doses }, () => pickOf(rng, DOSES));
    const s = { diff, n: diff.n, queue, pieces: [], used: 0, undos: diff.undos, history: [], stuck: false, over: null };
    // La solución: cada vacuna en una casilla libre y, desde ella, la cadena que curará.
    const plan = [], built = [];
    for (const [i, type] of queue.entries()) {
      const free = empties({ ...s, pieces: built });
      const [r, c] = pickOf(rng, free), dose = { id: 'd' + i, type, row: r, col: c, sick: false, dose: true };
      plan.push([r, c]);
      built.push(dose);
      let left = diff.reach[0] + Math.floor(rng() * (diff.reach[1] - diff.reach[0] + 1)), front = [dose];
      while (left > 0 && front.length) {
        const f = front.shift(), spots = reach(s, f, built);
        for (let k = 0; k < 1 + Math.floor(rng() * 2) && left > 0 && spots.length; k++) {
          const [pr, pc] = spots.splice(Math.floor(rng() * spots.length), 1)[0];
          const p = { id: 'v' + built.length, type: f === dose ? type : pickOf(rng, TYPES), row: pr, col: pc, sick: true };
          built.push(p); front.push(p); left--;
        }
      }
    }
    s.pieces = built.filter((p) => !p.dose);
    if (s.pieces.length < diff.doses * diff.reach[0]) continue;
    // Comprueba la solución desde la mesa limpia (las piezas puestas después pueden haber tapado líneas).
    const t = clone(s);
    for (const [r, c] of plan) if (!t.over) vaccinate(t, r, c);
    if (t.over !== 'win' || t.used < diff.doses) continue;
    // Ni la primera vacuna sola ni "la cadena más larga" deben bastar siempre.
    // (con tres desempates distintos: muchas casillas curan lo mismo).
    if (!easy && tries < 400 && [0, 1, 2].some(() => play(clone(s), greedy, rng))) continue;
    s.solution = plan;
    return s;
  }
}
