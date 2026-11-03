// Minijuegos sobre el tablero de la partida (src/data/scenarios.js): se arman, terminan y varían.
import assert from 'node:assert/strict';
import { mulberry32 } from '../src/core/rng.js';
import { SCENARIOS, buildScenario } from '../src/data/scenarios.js';
import { Match, botChooseMove } from '../src/game/match.js';
import { RIVALS } from '../src/game/difficulty.js';
import { key, canHit, ctxOf, legalMoves } from '../src/game/rules.js';
const botMoves = (m, p) => legalMoves(p, m.pieces, m.board);

const matchOf = (sc) => new Match({ board: sc.board, pieces: sc.pieces, players: sc.seats, modifier: sc.modifier || 'none', mutations: [], bonuses: {},
  rival: sc.rival, rivals: { dark: sc.rival, light: RIVALS.maestro }, objective: sc.objective, bonus: sc.bonus, tick: sc.tick });
function play(m, sc) {
  for (let i = 0; i < 400 && !m.over; i++) {
    const mv = m.canMove() && ((m.player.color === 'dark' && sc.bot?.(m)) || botChooseMove(m));
    if (mv) assert.ok(m.move(mv.piece, mv.target), 'bot move is legal');
    sc.labels?.(m);
    m.afterMove({ pass: !mv });
  }
  return m.over;
}

for (const id of Object.keys(SCENARIOS)) for (const level of ['facil', 'normal', 'dificil']) {
  const layouts = new Set();
  let wins = 0;
  for (let seed = 1; seed <= 25; seed++) {
    const sc = buildScenario(id, level, seed);
    layouts.add(sc.pieces.map((p) => p.type + key(p.row, p.col)).join() + [...sc.board.holes, ...(sc.board.mines || []), ...(sc.labels?.({ pieces: [] }).keys() || [])].join());
    assert.ok(sc.pieces.some((p) => p.color === 'light'), `${id}: the player has pieces`);
    assert.equal(typeof sc.status(matchOf(sc)), 'string');
    const over = play(matchOf(sc), sc);
    assert.ok(over && typeof over.victory === 'boolean' && over.note, `${id}/${level}/${seed} ends with a verdict`);
    if (over.victory) wins++;
  }
  // Mates sale de una biblioteca de problemas validados: varía menos.
  assert.ok(layouts.size >= (id === 'mates' ? 15 : 20), `${id}/${level}: tables vary (${layouts.size})`);
  console.log(`${id.padEnd(13)} ${level.padEnd(8)} bot maestro gana ${wins}/25`);
}

// El guardaespaldas: dos jugadas por turno y la segunda no captura.
const bg = matchOf(buildScenario('bodyguard', 'normal', 2));
assert.equal(bg.movesFor('light'), 2, 'two moves per turn');
const mover = bg.pieces.find((p) => p.color === 'light' && bg.legal(p).some((x) => !x.hits.length));
const step = bg.legal(mover).find((x) => !x.hits.length);
bg.move(mover, { row: step.row, col: step.col });
assert.ok(!bg.afterMove().ended, 'the turn goes on after the first move');
assert.ok(bg.pieces.filter((p) => p.color === 'light').every((p) => bg.legal(p).every((x) => !x.hits.length)), 'second move cannot capture');

// La cacería: un peón que corona pierde la partida.
const hunt = buildScenario('caceria', 'normal', 3);
const pawn = hunt.pieces.find((p) => p.color === 'dark');
pawn.type = 'queen';
assert.equal(hunt.objective(matchOf(hunt)).victory, false, 'a crowned pawn loses the hunt');

// Campo minado: la ruta segura del caballo existe y la mina se lleva la pieza.
const mf = buildScenario('minefield', 'dificil', 9);
const m = matchOf(mf);
const knight = mf.pieces[0];
const mine = [...mf.board.mines].find((k) => m.legal(knight).some((t) => key(t.row, t.col) === k));
assert.ok(mine, 'campo minado: el caballo debe tener una mina a su alcance para probarla');
{
  const [r, c] = mine.split(',').map(Number);
  const res = m.move(knight, { row: r, col: c });
  assert.ok(res.mine && !m.pieces.length && mf.board.holes.has(mine), 'stepping on a mine removes the knight and leaves a hole');
  m.afterMove();
  assert.equal(m.over.victory, false);
}

// El rey impostor: un paso de rey no delata; un salto sí.
const ki = buildScenario('kingImpostor', 'normal', 4);
const masked = ki.pieces.filter((p) => p.disguise);
assert.ok(masked.length === 4 && masked.every((p) => p.type !== 'king'), 'impostors are disguised non-kings');
assert.equal(ki.pieces.filter((p) => p.color === 'dark' && p.type === 'king').length, 1, 'one true king');
// La bruja es pasable: un jugador simple (va a la moneda más cercana, evita despertar brujas y quedar a
// tiro) gana al menos 1 de cada 10 en cada dificultad.
function coinSeeker(m, sc) {
  const coins = [...sc.labels(m).keys()].map((c) => c.split(',').map(Number));
  let best = null, top = -Infinity;
  for (const p of m.pieces.filter((q) => q.color === 'light')) for (const mv of m.legal(p)) {
    const at = [p.row, p.col], gone = new Set((mv.hits || []).map((v) => v.piece || v));
    Object.assign(p, { row: mv.row, col: mv.col });
    const alive = m.pieces.filter((q) => !gone.has(q)), ctx = ctxOf(alive, m.board);
    const wakes = alive.filter((w) => w.witch && !w.awake && alive.some((q) => q.color === 'light' && canHit(q, w, ctx))).length;
    const shot = alive.some((e) => e.color === 'dark' && (!e.witch || e.awake) && canHit(e, p, ctx));
    const near = Math.min(99, ...coins.map(([r, c]) => Math.max(Math.abs(r - mv.row), Math.abs(c - mv.col))));
    const score = (near === 0 ? 50 : -2 * near) - 30 * wakes - (shot ? 40 : 0) + 10 * gone.size + Math.random();
    Object.assign(p, { row: at[0], col: at[1] });
    if (score > top) { top = score; best = { piece: p, target: { row: mv.row, col: mv.col } }; }
  }
  return best;
}
for (const level of ['facil', 'normal', 'dificil']) {
  let wins = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const sc = buildScenario('witch', level, seed), m = matchOf(sc);
    for (let i = 0; i < 400 && !m.over; i++) {
      const mv = m.canMove() && (m.player.color === 'light' ? coinSeeker(m, sc) : botChooseMove(m));
      if (mv) m.move(mv.piece, mv.target);
      sc.labels(m);
      m.afterMove({ pass: !mv });
    }
    if (m.over?.victory) wins++;
  }
  assert.ok(wins >= 4, `witch/${level}: a simple coin seeker wins ${wins}/40`);
  console.log(`witch ${level}: buscador de monedas gana ${wins}/40`);
}

// Lluvia de bombas: un rey que solo esquiva (sale de lo marcado) siempre aguanta; uno que no mira cae.
for (const level of ['facil', 'normal', 'dificil']) {
  let wins = 0, blind = 0;
  for (let seed = 1; seed <= 40; seed++) for (const careful of [true, false]) {
    const sc = buildScenario('bombs', level, seed), m = matchOf(sc);
    for (let i = 0; i < 100 && !m.over; i++) {
      const doom = new Set(sc.doom().map(([r, c]) => key(r, c)));
      const king = m.pieces[0], all = botMoves(m, king).filter((t) => !careful || !doom.has(key(t.row, t.col)));
      const t = all[(seed + i) % all.length];
      assert.ok(t, `bombs/${level}/${seed}: the king always has a safe square`);
      m.move(king, t);
      m.afterMove();
    }
    if (m.over?.victory) careful ? wins++ : blind++;
  }
  assert.equal(wins, 40, `bombs/${level}: a careful king survives ${wins}/40`);
  assert.ok(blind < 40, `bombs/${level}: bombs threaten a careless king`);
  console.log(`bombs ${level}: rey atento gana ${wins}/40 · despistado ${blind}/40`);
}

// Escape, contrabando, laboratorio, campo minado y reloj son pasables: un corredor simple (va por el camino
// más corto a lo marcado o a la meta, no se pone a tiro y conoce las minas) gana alguna en cada dificultad.
function runner(m, sc, i0 = 0) {
  const me = sc.runner || m.pieces.find((p) => p.color === 'light');
  if (!me || !m.pieces.includes(me)) return null;
  const labels = sc.labels?.(m) || new Map(), marks = [...labels].filter(([, v]) => String(v).startsWith('icon:')).map(([k]) => k);
  const goal = sc.goalAt || ((p) => p.row === 0), mines = sc.board.mines || new Set();
  let isTarget = (r, c) => (marks.length ? marks.includes(key(r, c)) : goal({ row: r, col: c }));
  const others = m.pieces.filter((p) => p !== me);
  // Saltos que faltan desde (r, c) hasta un objetivo, con las piezas de ahora como obstáculos.
  const dist = (r, c) => {
    let front = [[r, c]], seen = new Set([key(r, c)]);
    for (let d = 0; d < 12 && front.length; d++) {
      if (front.some(([a, b]) => isTarget(a, b))) return d;
      const next = [];
      for (const [a, b] of front) for (const t of legalMoves({ ...me, row: a, col: b }, others, m.board)) {
        const k = key(t.row, t.col);
        if (!seen.has(k) && !mines.has(k)) { seen.add(k); next.push([t.row, t.col]); }
      }
      front = next;
    }
    return 99;
  };
  // Reloj: si apura, primero el reloj y luego las monedas.
  const clock = sc.goals?.()[0];
  if (clock && labels.get(clock) <= dist(me.row, me.col) + 2) { const coins = isTarget; isTarget = (r, c) => key(r, c) === clock; if (dist(me.row, me.col) > 50) isTarget = coins; }
  let best = null, top = -Infinity;
  for (const mv of m.legal(me)) {
    if (mines.has(key(mv.row, mv.col))) continue;
    const at = [me.row, me.col];
    Object.assign(me, { row: mv.row, col: mv.col });
    const ctx = ctxOf(m.pieces, m.board), shot = m.pieces.some((e) => e.color === 'dark' && canHit(e, me, ctx));
    const score = (isTarget(mv.row, mv.col) ? 100 : -3 * dist(mv.row, mv.col)) - (shot ? 60 : 0) + ((mv.row * 7 + mv.col * 3 + i0) % 5) * 0.1;
    Object.assign(me, { row: at[0], col: at[1] });
    if (score > top) { top = score; best = { piece: me, target: { row: mv.row, col: mv.col } }; }
  }
  return best;
}
for (const id of ['escape', 'contraband', 'laboratory', 'minefield', 'clock']) for (const level of ['facil', 'normal', 'dificil']) {
  let wins = 0;
  for (let seed = 1; seed <= 40; seed++) {
    Math.random = mulberry32(seed); // el bot rival también tira dados: así el resultado no baila entre ejecuciones
    const sc = buildScenario(id, level, seed), m = matchOf(sc);
    for (let i = 0; i < 400 && !m.over; i++) {
      const mv = m.canMove() && (m.player.color === 'light' ? runner(m, sc, i) : (sc.bot?.(m) || botChooseMove(m)));
      if (mv) m.move(mv.piece, mv.target);
      sc.labels?.(m);
      m.afterMove({ pass: !mv });
    }
    if (m.over?.victory) wins++;
  }
  console.log(`${id} ${level}: corredor simple gana ${wins}/40`);
  assert.ok(wins >= 2, `${id}/${level}: a simple runner wins ${wins}/40 (must be passable)`);
}

console.log('Escenarios OK: mesas variables, final con veredicto, coronación, minas, disfraces, brujas y bombas pasables');
