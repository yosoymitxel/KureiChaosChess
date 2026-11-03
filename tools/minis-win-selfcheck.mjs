// Minijuegos sin prueba propia (reinas, matamarcianos, zombi al revés, bolos de nuez, duelo, fusión y
// damas): un jugador simple gana alguna partida en cada dificultad, así que ninguna mesa es imposible.
// `node tools/minis-win-selfcheck.mjs [--all]`.
import { mulberry32 } from '../src/core/rng.js';
import * as Q from '../src/game/queens.js';
import * as M from '../src/game/marcianos.js';
import * as Z from '../src/game/izombie.js';
import * as B from '../src/game/bowling.js';
import * as D from '../src/game/duel.js';
import * as F from '../src/game/fusion.js';
import * as K from '../src/game/checkers.js';

const LEVELS = ['facil', 'normal', 'dificil'], N = 20, fails = [], rows = [];

const players = {
  // Vuelta atrás que respeta las dos reinas ya puestas.
  queens: (level, rng) => {
    const s = Q.newQueens(level, rng), fixed = new Map(s.queens.map((q) => [q.r, q.c])), cols = [];
    const ok = (r, c) => cols.every((cc, rr) => cc !== c && Math.abs(cc - c) !== r - rr);
    const go = (r) => r === s.n || [...Array(s.n).keys()].some((c) => (!fixed.has(r) || fixed.get(r) === c) && ok(r, c) && (cols.push(c), go(r + 1) || (cols.pop(), false)));
    go(0);
    cols.forEach((c, r) => fixed.get(r) !== c && Q.toggle(s, r, c));
    return s.over === 'win';
  },
  // Esquiva el rayo que le cae encima; si no, va bajo el marciano más bajo y dispara.
  marcianos: (level, rng) => {
    const s = M.newMarcianos(rng, level);
    for (let i = 0; i < 3000 && !s.over; i++) {
      const col = s.player.col, hit = (c) => s.bolts.some((b) => b.col === c && b.row >= s.playerRow - 2);
      if (hit(col)) M.act(s, { move: !hit(col - 1) && col > 0 ? -1 : 1 }, rng);
      else {
        const low = [...s.enemies].sort((a, b) => b.row - a.row || Math.abs(a.col - col) - Math.abs(b.col - col))[0];
        if (low && low.col !== col && !hit(col + Math.sign(low.col - col))) M.act(s, { move: Math.sign(low.col - col) }, rng);
        M.act(s, { shoot: true }, rng);
      }
      M.tick(s, rng);
    }
    return s.over === 'win';
  },
  // Compras al azar: basta con que alguna de 40 recetas gane.
  izombie: (level, rng) => {
    for (let k = 0; k < 40; k++) {
      const s = Z.newZombie(level, mulberry32(Math.floor(rng() * 1e9)));
      for (let i = 0; i < 60 && !s.over; i++) {
        for (let tries = 0; tries < 6; tries++) { const types = Object.keys(Z.COST); Z.buy(s, types[Math.floor(rng() * types.length)], Math.floor(rng() * Z.COLS)); }
        Z.advance(s);
      }
      if (s.over === 'win') return true;
    }
    return false;
  },
  // Lanza en la fila del enemigo más adelantado.
  bowling: (level, rng) => {
    const s = B.newBowling(level, rng);
    for (let i = 0; i < 3000 && !s.over; i++) {
      const front = [...s.enemies].sort((a, b) => a.c - b.c)[0];
      if (front) B.launch(s, front.r, 0);
      B.tick(s, rng);
    }
    return s.over === 'win';
  },
  // El ataque que más daño hace contra el tipo del rival.
  duel: (level, rng) => {
    const s = D.newDuel(level, rng);
    for (let i = 0; i < 200 && !s.over; i++) {
      const me = D.active(s.mine), foe = D.active(s.foes);
      const best = D.FIGHTERS[me.type].moves.map((id) => [id, (D.MOVES[id].power || 0) * (D.MOVES[id].acc || 1) * D.effect(D.MOVES[id], foe)]).sort((a, b) => b[1] - a[1])[0][0];
      D.turn(s, best, rng);
    }
    return s.over === 'win';
  },
  // Esquina: abajo e izquierda; si no se puede, lo que se pueda.
  fusion: (level, rng) => {
    const s = F.newFusion(level, rng);
    for (let i = 0; i < 5000 && !s.over; i++) if (!F.slide(s, ['down', 'left'][i % 2], rng)) for (const d of ['down', 'left', 'right', 'up']) if (F.slide(s, d, rng)) break;
    return s.over === 'win';
  },
  // Damas a dos jugadas: la que deja más material propio tras la mejor respuesta del bot (la búsqueda
  // del bot mira solo por el bando oscuro, así que no sirve para jugar con las claras).
  checkers: (level, rng) => {
    const s = K.newCheckers(level);
    const after = (st, mv) => { const t = structuredClone(st); K.play(t, { p: t.pieces.find((p) => p.id === mv.p.id), to: mv.to }); return t; };
    const score = (t) => t.over === 'win' ? 99 : t.over === 'lose' ? -99 : t.pieces.reduce((a, p) => a + (p.side === 'light' ? 1 : -1) * (p.king ? 1.5 : 1), 0);
    for (let i = 0; i < 3000 && !s.over; i++) {
      if (s.turn === 'dark') { K.play(s, K.botMove(s, rng)); continue; }
      const rate = (mv) => { const t = after(s, mv); while (!t.over && t.turn === 'light') K.play(t, K.legal(t)[0]); return t.over ? score(t) : Math.min(...K.legal(t).map((r) => score(after(t, r)))) + rng() * 0.1; };
      K.play(s, K.legal(s).map((mv) => [mv, rate(mv)]).sort((x, y) => y[1] - x[1])[0][0]);
    }
    return s.over === 'win';
  },
};

for (const [id, play] of Object.entries(players)) for (const level of LEVELS) {
  let wins = 0;
  const n = N; // las damas con búsqueda honda son lentas
  for (let seed = 1; seed <= n; seed++) if (play(level, mulberry32(seed))) wins++;
  rows.push(`${id} ${level}: ${wins}/${n}`);
  if (wins < 1) fails.push(`${id}/${level}: el jugador simple no gana ninguna de ${n}`);
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (fails.length) { console.log('Minis imposibles:\n' + fails.join('\n') + '\n' + rows.join(' · ')); process.exit(1); }
console.log('minis ganables: ' + rows.join(' · '));
