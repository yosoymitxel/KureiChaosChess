// Minijuegos de ajedrez que se juegan en el tablero de la partida (GameScreen + Match + BoardView):
// cada uno solo dice cómo se arma la mesa, con qué rival y cuándo se gana o se pierde.
// `setup(level, seed)` devuelve { board, pieces, rival, objective, status, labels?, hideRoyal?, single? }.
import { mulberry32, pickFrom } from '../core/rng.js';
import { makePiece, placeBoss, addTerrain, generateBoard, placePieces } from '../game/generate.js';
import { MINI_BOSSES, FINAL_BOSSES, RIVALS } from '../game/difficulty.js';
import { legalMoves, key } from '../game/rules.js';
import { applyMutations, EXTRA_MOVES } from './mutations.js';
import { MODIFIERS } from './modifiers.js';
import { MATES } from './mates.js';
import { SIZE as MATE_SIZE, board as mateBoard, defend, isCheckmate } from '../game/mates.js';

export const LEVELS = { facil: { name: 'Fácil' }, normal: { name: 'Normal' }, dificil: { name: 'Difícil' } };
const N = 8;
const board = (n = N) => ({ rows: n, cols: n, holes: new Set(), terrain: new Map(), portals: new Map() });
const rounds = (m) => Math.floor(m.turn / m.players.length);
const side = (m, color) => m.pieces.filter((p) => p.color === color);
const shuffle = (rng, list) => list.map((x) => [rng(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const taken = (pieces, b) => new Set([...pieces.map((p) => key(p.row, p.col)), ...b.holes]);
// Casillas libres al azar de las filas dadas.
function spots(rng, pieces, b, rowsFrom, rowsTo, n) {
  const used = taken(pieces, b), out = [];
  for (let r = rowsFrom; r <= rowsTo; r++) for (let c = 0; c < N; c++) if (!used.has(key(r, c))) out.push([r, c]);
  return shuffle(rng, out).slice(0, n);
}
// Unas casillas caídas en el medio del tablero: cambian las líneas de cada partida.
function rubble(rng, b, pieces, n, keep = () => false) {
  for (const [r, c] of spots(rng, pieces, b, 2, N - 3, n * 3)) {
    if (b.holes.size >= n) break;
    if (!keep(r, c)) b.holes.add(key(r, c));
  }
}

export const SCENARIOS = {
  // El peón corre a coronar con las reglas de siempre; tus cazadores tienen que alcanzarlo.
  caceria: {
    id: 'caceria',
    goal: 'Captura a todos los peones carmesí antes de que uno corone. Comen en diagonal: cuidado con dónde caes.',
    levels: {
      facil: { hunters: ['knight', 'bishop', 'rook', 'knight'], pawns: 2, holes: 2, rival: { noise: 6, capture: 1, pressure: 0, care: 0, advance: 2 } },
      normal: { hunters: ['knight', 'bishop', 'rook'], pawns: 3, holes: 3, rival: { noise: 2, capture: 1, pressure: 0, care: 1, advance: 3 } },
      dificil: { hunters: ['knight', 'knight', 'bishop'], pawns: 4, holes: 4, rival: { noise: 0.5, capture: 1, pressure: 0, care: 2, advance: 4 } },
    },
    setup(lv, rng) {
      const b = board(), pieces = [];
      const files = shuffle(rng, [...Array(N).keys()]).slice(0, lv.pawns);
      // Sin doble paso (startRow -1): la carrera dura lo bastante para cazar.
      for (const c of files) pieces.push(makePiece('pawn', 'dark', Math.floor(rng() * 2), c, { canCrown: true, startRow: -1 }));
      spots(rng, pieces, b, N - 4, N - 2, lv.hunters.length).forEach(([r, c], i) => pieces.push(makePiece(lv.hunters[i], 'light', r, c)));
      rubble(rng, b, pieces, lv.holes, (r, c) => files.includes(c));
      return {
        board: b, pieces, rival: lv.rival,
        objective: (m) => side(m, 'dark').some((p) => p.type !== 'pawn') ? { victory: false, note: 'Un peón llegó al fondo y coronó.' }
          : !side(m, 'light').length ? { victory: false, note: 'Los peones se comieron a tus cazadores.' }
          : !side(m, 'dark').length ? { victory: true, note: 'No quedó ni un fugitivo.' }
          : rounds(m) >= 20 ? { victory: false, note: 'Los fugitivos aguantaron 20 rondas.' } : null,
        status: (m) => `Peones: ${side(m, 'dark').length} · el más adelantado corona en ${Math.min(...side(m, 'dark').map((p) => N - 1 - p.row))} · quedan ${20 - rounds(m)} rondas`,
      };
    },
  },

  // Tu rey y su escolta aguantan el asedio de una escuadra sin rey.
  bodyguard: {
    id: 'bodyguard',
    goal: 'Mantén vivo a tu rey hasta el final del asedio, o derriba a toda la escuadra carmesí. Cada bando mueve dos veces por turno y la segunda no puede capturar; a mitad del asedio, tres.',
    levels: {
      facil: { escorts: 3, squad: ['knight', 'knight', 'pawn', 'pawn', 'pawn', 'pawn'], rounds: 8, holes: 2, rival: 'oficial' },
      normal: { escorts: 3, squad: ['knight', 'knight', 'knight', 'pawn', 'pawn', 'pawn', 'pawn'], rounds: 10, holes: 3, rival: 'maestro' },
      dificil: { escorts: 3, squad: ['knight', 'knight', 'knight', 'knight', 'pawn', 'pawn', 'pawn', 'pawn'], rounds: 12, holes: 3, rival: 'maestro' },
    },
    setup(lv, rng) {
      // Se reparte otra vez si la escolta podía comer algo en la primera jugada.
      for (;;) {
        const game = this.deal(lv, rng);
        const { pieces, board: b } = game;
        if (!pieces.some((p) => p.color === 'light' && legalMoves(p, pieces, b).some((m) => m.hits.length))) return game;
      }
    },
    deal(lv, rng) {
      const b = board(), pieces = [];
      const kc = 1 + Math.floor(rng() * (N - 2));
      pieces.push(makePiece('king', 'light', N - 1, kc));
      const guards = shuffle(rng, ['rook', 'bishop', 'knight', 'rook', 'knight']).slice(0, lv.escorts);
      for (const [r, c] of spots(rng, pieces, b, N - 2, N - 1, 6).filter(([, c]) => Math.abs(c - kc) <= 2).slice(0, guards.length)) pieces.push(makePiece(guards.pop(), 'light', r, c));
      const squad = shuffle(rng, lv.squad);
      for (const [r, c] of spots(rng, pieces, b, 0, 1, squad.length)) pieces.push(makePiece(squad.pop(), 'dark', r, c));
      rubble(rng, b, pieces, lv.holes);
      return {
        board: b, pieces, rival: lv.rival,
        objective: (m) => m.eliminated.light ? { victory: false, note: 'La escuadra alcanzó a tu rey.' }
          : !side(m, 'dark').length ? { victory: true, note: 'Desarmaste a toda la escuadra.' }
          : rounds(m) >= lv.rounds ? { victory: true, note: 'Tu rey resistió el asedio.' } : null,
        // Todos mueven dos veces (la segunda sin capturar); pasada la mitad del asedio, tres.
        bonus: (m) => (rounds(m) >= lv.rounds / 2 ? 2 : 1),
        status: (m) => `Aguanta ${lv.rounds - rounds(m)} rondas · ${side(m, 'dark').length} atacantes · ${rounds(m) >= lv.rounds / 2 ? 3 : 2} jugadas por turno`,
      };
    },
  },

  // Un jefe de la torre contra una partida de caza; la reina es la que no puede caer.
  giantHunt: {
    id: 'giantHunt',
    goal: 'Derriba al jefe antes de que acaben las rondas. Cada golpe le quita una vida; si cae tu reina, pierdes.',
    levels: {
      facil: { bosses: MINI_BOSSES, team: ['rook', 'bishop', 'knight'], rounds: 16, holes: 2, rival: 'aprendiz' },
      normal: { bosses: [...MINI_BOSSES, ...FINAL_BOSSES], team: ['rook', 'knight'], rounds: 14, holes: 3, rival: 'oficial' },
      dificil: { bosses: FINAL_BOSSES, team: ['knight'], rounds: 12, holes: 4, rival: 'maestro' },
    },
    setup(lv, rng) {
      const b = board(), pieces = [];
      const boss = placeBoss(pieces, b, pickFrom(rng, lv.bosses));
      const [qr, qc] = spots(rng, pieces, b, N - 1, N - 1, 1)[0];
      pieces.push(makePiece('queen', 'light', qr, qc, { royal: true }));
      const team = [...lv.team];
      for (const [r, c] of spots(rng, pieces, b, N - 2, N - 1, team.length)) pieces.push(makePiece(team.pop(), 'light', r, c));
      rubble(rng, b, pieces, lv.holes, (r) => r < boss.h + 1);
      return {
        board: b, pieces, rival: lv.rival,
        objective: (m) => m.eliminated.dark ? { victory: true, note: `${boss.name} cayó.` }
          : m.eliminated.light ? { victory: false, note: `${boss.name} aplastó a tu reina.` }
          : rounds(m) >= lv.rounds ? { victory: false, note: `Se acabaron las rondas: ${boss.name} sigue en pie.` } : null,
        status: (m) => `${boss.name}: ${boss.hp}/${boss.maxHp} vidas · quedan ${lv.rounds - rounds(m)} rondas`,
      };
    },
  },

  // Solo el caballo y un campo con minas escondidas; las casillas pisadas cuentan las minas de alrededor.
  minefield: {
    id: 'minefield', single: true,
    goal: 'Lleva el caballo a la fila de arriba. Cada casilla pisada dice cuántas minas la rodean; siempre hay un camino seguro.',
    levels: {
      facil: { mines: 9, slack: 5, area: true },
      normal: { mines: 13, slack: 3, area: true },
      dificil: { mines: 17, slack: 2, area: false },
    },
    setup(lv, rng) {
      const b = board();
      const start = [N - 1, Math.floor(rng() * N)];
      const route = knightRoute(rng, start);
      const free = shuffle(rng, [...Array((N - 1) * N).keys()].map((i) => key(Math.floor(i / N), i % N)).filter((k) => !route.includes(k)));
      b.mines = new Set(free.slice(0, lv.mines));
      const knight = makePiece('knight', 'light', ...start);
      const seen = new Set();
      const near = (r, c) => [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => key(r + dr, c + dc))).filter((k) => b.mines.has(k)).length;
      const limit = route.length - 1 + lv.slack;
      return {
        board: b, pieces: [knight], rival: 'oficial',
        objective: (m) => !m.pieces.length ? { victory: false, note: 'El caballo pisó una mina.' }
          : knight.row === 0 ? { victory: true, note: 'Cruzaste el campo minado.' }
          : m.turn >= limit ? { victory: false, note: 'Se acabaron los saltos.' } : null,
        status: (m) => `Saltos: ${limit - m.turn} · minas: ${b.mines.size}`,
        // Lo pisado (y en Fácil y Normal lo que lo rodea sin minas) queda escrito.
        labels: (m) => {
          if (m.pieces.length) {
            seen.add(key(knight.row, knight.col));
            if (lv.area) for (const dr of [-1, 0, 1]) for (const dc of [-1, 0, 1]) {
              const r = knight.row + dr, c = knight.col + dc;
              if (r >= 0 && c >= 0 && r < N && c < N && !b.mines.has(key(r, c))) seen.add(key(r, c));
            }
          }
          return new Map([...seen].map((k) => [k, near(...k.split(',').map(Number))]));
        },
      };
    },
  },

  // Varios «reyes» carmesí: uno es el de verdad y el resto, piezas disfrazadas que se delatan al moverse.
  kingImpostor: {
    id: 'kingImpostor', hideRoyal: true,
    goal: 'Entre los reyes carmesí solo uno es de verdad. Los demás son piezas disfrazadas: el disfraz cae si se mueven más de una casilla. Captura al rey verdadero antes de que acaben las rondas.',
    levels: {
      facil: { suspects: 3, army: ['rook', 'bishop', 'knight', 'pawn', 'pawn', 'pawn'], rounds: 18, rival: 'aprendiz' },
      normal: { suspects: 4, army: ['rook', 'knight', 'pawn', 'pawn', 'pawn'], rounds: 16, rival: 'oficial' },
      dificil: { suspects: 5, army: ['bishop', 'knight', 'pawn', 'pawn'], rounds: 14, rival: 'maestro' },
    },
    setup(lv, rng) {
      const b = board(), pieces = [];
      pieces.push(makePiece('king', 'light', N - 1, 3 + Math.floor(rng() * 2)));
      const army = [...lv.army];
      for (const [r, c] of spots(rng, pieces, b, N - 2, N - 1, army.length)) pieces.push(makePiece(army.pop(), 'light', r, c));
      const masks = shuffle(rng, ['rook', 'bishop', 'knight', 'queen', 'knight', 'bishop']).slice(0, lv.suspects);
      const cells = spots(rng, pieces, b, 0, 1, lv.suspects + 1);
      const [kr, kc] = cells.pop();
      pieces.push(makePiece('king', 'dark', kr, kc));
      for (const [r, c] of cells) pieces.push(makePiece(masks.pop(), 'dark', r, c, { disguise: 'king' }));
      return {
        board: b, pieces, rival: lv.rival, hideRoyal: true,
        objective: (m) => m.eliminated.dark ? { victory: true, note: 'Desenmascaraste al rey de verdad.' }
          : m.eliminated.light ? { victory: false, note: 'Cayó tu rey antes de dar con el impostor.' }
          : rounds(m) >= lv.rounds ? { victory: false, note: 'El rey verdadero se escabulló.' } : null,
        status: (m) => `Sospechosos: ${side(m, 'dark').filter((p) => p.type === 'king' || (p.disguise && !p.unmasked)).length} · quedan ${lv.rounds - rounds(m)} rondas`,
      };
    },
  },
};

// Cruzar el tablero (Escape, Contrabando, Laboratorio): tu pieza es la «real» que el bot persigue;
// gana al llegar a la meta y pierde si cae o se acaban las rondas.
// `samples` (El laboratorio): casillas que hay que pisar antes de llegar a la meta.
function crossing({ b, pieces, runner, guards, rng, rival, rounds: limit, goal, note, samples = 0 }) {
  const left = new Set(spots(rng, pieces, b, 2, N - 3, samples).map(([r, c]) => key(r, c)));
  const all = [...left];
  for (const [r, c] of spots(rng, pieces, b, 1, N - 4, guards.length)) pieces.push(makePiece(guards.pop(), 'dark', r, c));
  return {
    board: b, pieces, rival, runner, goalAt: goal, samples: all,
    objective: (m) => {
      left.delete(key(runner.row, runner.col));
      return m.eliminated.light ? { victory: false, note: 'Te atraparon.' }
        : goal(runner) && !left.size ? { victory: true, note }
        : rounds(m) >= limit ? { victory: false, note: 'Se acabaron las rondas.' } : null;
    },
    labels: () => new Map([...left].map((k) => [k, '⚗'])),
    status: (m) => `Quedan ${limit - rounds(m)} rondas · ${side(m, 'dark').length} guardias${all.length ? ` · muestras ${all.length - left.size}/${all.length}` : ''}`,
  };
}
Object.assign(SCENARIOS, {
  escape: {
    id: 'escape',
    goal: 'Lleva tu caballo a la fila de arriba. Los guardias carmesí te cierran el paso y te cazan si te pones a tiro.',
    levels: {
      facil: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight'], holes: 6, rounds: 10, rival: 'oficial' },
      normal: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'bishop'], holes: 8, rounds: 8, rival: 'maestro' },
      dificil: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'knight', 'bishop', 'rook'], holes: 10, rounds: 7, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = board(), runner = makePiece('knight', 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      rubble(rng, b, pieces, lv.holes);
      return crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: 'Escapaste del tablero.' });
    }),
  },
  contraband: {
    id: 'contraband',
    goal: 'Lleva el caballo a la salida marcada con ⚑. Los portales te mandan a su gemelo del mismo color; los guardias vigilan.',
    levels: {
      facil: { guards: ['pawn', 'pawn', 'knight'], holes: 6, rounds: 18, rival: 'aprendiz' },
      normal: { guards: ['pawn', 'pawn', 'pawn', 'knight', 'bishop'], holes: 8, rounds: 12, rival: 'oficial' },
      dificil: { guards: ['pawn', 'pawn', 'pawn', 'knight', 'knight', 'bishop', 'rook'], holes: 10, rounds: 10, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = board(), runner = makePiece('knight', 'light', N - 1, Math.floor(rng() * 3), { royal: true }), pieces = [runner];
      const exit = [0, N - 1 - Math.floor(rng() * 3)];
      // Un muro de escombros en el medio: los portales son el atajo.
      for (let c = 0; c < N; c++) if (rng() < 0.75) b.holes.add(key(3 + (c % 2), c));
      for (const [r, c] of spots(rng, pieces, b, 1, N - 2, 4)) { b.terrain.set(key(r, c), 'portal'); }
      const ps = [...b.terrain.keys()];
      [[ps[0], ps[1]], [ps[2], ps[3]]].forEach(([a, z]) => { b.portals.set(a, z); b.portals.set(z, a); });
      b.holes.delete(key(...exit));
      const game = crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === exit[0] && p.col === exit[1], note: 'El contrabando cruzó.' });
      return { ...game, labels: () => new Map([[key(...exit), '⚑']]) };
    }),
  },
  laboratory: {
    id: 'laboratory',
    goal: 'Tu pieza lleva una mutación de prueba. Recoge las muestras ⚗ y llévala a la fila de arriba: cada casilla que dejas se hunde y los guardias acechan.',
    levels: {
      facil: { muts: ['kingRook', 'towerDiag', 'bishopOrth'], samples: 1, guards: ['pawn', 'pawn', 'pawn', 'knight', 'knight'], holes: 6, rounds: 10, rival: 'oficial' },
      normal: { muts: ['knightBishop', 'towerDiag', 'bishopOrth'], samples: 2, guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'bishop'], holes: 8, rounds: 10, rival: 'maestro' },
      dificil: { muts: ['guardKnight', 'kingRook', 'knightBishop'], samples: 3, guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'knight', 'bishop', 'rook'], holes: 10, rounds: 10, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = board(), mut = pickFrom(rng, lv.muts);
      const runner = makePiece(EXTRA_MOVES[mut][0], 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      applyMutations(pieces, [mut], 'light');
      b.sinking = 'light';
      rubble(rng, b, pieces, lv.holes);
      return crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: 'El experimento salió bien.', samples: lv.samples });
    }),
  },
  // Ruta del caballo: pisar todas las casillas marcadas; lo pisado se hunde. Las marcas salen de
  // un paseo real del caballo, así que siempre hay solución.
  knight: {
    id: 'knight', single: true,
    goal: 'Pisa con el caballo todas las casillas marcadas ◎. Cada casilla que dejas se hunde: si te quedas sin saltos, pierdes.',
    levels: {
      facil: { size: 5, length: 8, marks: 3 },
      normal: { size: 6, length: 12, marks: 6 },
      dificil: { size: 7, length: 16, marks: 9 },
    },
    setup(lv, rng) {
      for (;;) {
        const b = board(lv.size);
        b.sinking = 'light';
        const knight = makePiece('knight', 'light', Math.floor(rng() * lv.size), Math.floor(rng() * lv.size), { royal: true });
        const path = [];
        let at = { ...knight };
        while (path.length < lv.length - 1) {
          const opts = legalMoves(at, [at], b).filter((m) => m.row !== knight.row || m.col !== knight.col).filter((m) => !path.includes(key(m.row, m.col)));
          if (!opts.length) break;
          const m = pickFrom(rng, opts);
          at = { ...at, row: m.row, col: m.col };
          path.push(key(m.row, m.col));
        }
        if (path.length < lv.length - 1) continue;
        const left = new Set([path.at(-1), ...shuffle(rng, path).slice(0, lv.marks - 1)]);
        return {
          board: b, pieces: [knight], rival: 'oficial',
          objective: (m) => {
            left.delete(key(knight.row, knight.col));
            return !left.size ? { victory: true, note: 'Ruta completa.' } : !m.canMove() ? { victory: false, note: 'El caballo se quedó sin saltos.' } : null;
          },
          labels: () => new Map([...left].map((k) => [k, '◎'])),
          status: () => `Faltan ${left.size} casillas`,
        };
      }
    },
  },
  // Mate en 1 o 2 de la colección validada (src/data/mates.js); el rival defiende con la mejor
  // respuesta legal (game/mates.js). Variedad: problema al azar y tablero espejado.
  mates: {
    id: 'mates',
    goal: 'Da jaque mate al rey carmesí en las jugadas indicadas. El rival defiende con su mejor respuesta.',
    levels: { facil: { mateIn: [1] }, normal: { mateIn: [1, 2] }, dificil: { mateIn: [2] } },
    setup(lv, rng) {
      const n = pickFrom(rng, lv.mateIn), flip = rng() < 0.5;
      const pieces = pickFrom(rng, MATES[n]).map(([t, color, r, c]) => makePiece(t, color, r, flip ? MATE_SIZE - 1 - c : c));
      const b = mateBoard();
      return {
        board: b, pieces, rival: 'maestro',
        bot: (m) => {
          const d = defend(m.pieces, Math.max(1, n - rounds(m)));
          return d && { piece: d.p, target: { row: d.m.row, col: d.m.col } };
        },
        objective: (m) => isCheckmate(m.pieces, 'dark', b) ? { victory: true, note: '¡Jaque mate!' }
          : m.eliminated.light ? { victory: false, note: 'Dejaste a tu rey a tiro.' }
          : rounds(m) >= n ? { victory: false, note: `No llegó el mate en ${n}.` } : null,
        status: (m) => `Mate en ${n} · te quedan ${n - rounds(m)} jugadas`,
      };
    },
  },
  collapsingFloor: {
    id: 'collapsingFloor',
    goal: 'Cruza con el caballo hasta la fila de arriba. Cada casilla que dejas se hunde y los guardias te cortan el paso.',
    levels: {
      facil: { guards: ['pawn', 'pawn', 'pawn', 'knight'], holes: 6, rounds: 10, rival: 'oficial' },
      normal: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'bishop'], holes: 9, rounds: 9, rival: 'maestro' },
      dificil: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'bishop', 'rook'], holes: 12, rounds: 8, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = board(), runner = makePiece('knight', 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      b.sinking = 'light';
      rubble(rng, b, pieces, lv.holes);
      return crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: 'Llegaste antes de que se acabara el suelo.' });
    }),
  },
});

// Jugadas mínimas de `piece` (sin guardias, con portales) hasta cumplir `goal` habiendo pisado
// todas las `samples`; Infinity si no se puede. Valida que cada mesa al azar sea pasable.
function routeLen(b, piece, goal, samples = []) {
  const full = (1 << samples.length) - 1;
  const id = (p, mask) => key(p.row, p.col) + '|' + mask;
  let front = [{ row: piece.row, col: piece.col, mask: 0 }], d = 0;
  const seen = new Set([id(front[0], 0)]);
  while (front.length) {
    if (front.some((p) => p.mask === full && goal(p))) return d;
    const next = [];
    for (const p of front) for (const m of legalMoves({ ...piece, row: p.row, col: p.col }, [], b)) {
      const twin = b.portals.get(key(m.row, m.col));
      const [row, col] = twin ? twin.split(',').map(Number) : [m.row, m.col];
      const i = samples.indexOf(key(row, col));
      const s = { row, col, mask: i < 0 ? p.mask : p.mask | (1 << i) };
      if (!seen.has(id(s, s.mask))) { seen.add(id(s, s.mask)); next.push(s); }
    }
    front = next; d++;
  }
  return Infinity;
}
// Reparte hasta que la ruta mínima quepa holgada en las rondas.
function passable(lv, deal) {
  for (;;) {
    const g = deal();
    const d = routeLen(g.board, g.runner, g.goalAt, g.samples);
    if (d >= 2 && d <= lv.rounds - 2) return g;
  }
}

// Ruta segura del caballo de abajo arriba, con algún rodeo.
function knightRoute(rng, [r0, c0]) {
  const piece = { type: 'knight', color: 'light' };
  const open = board();
  for (;;) {
    const path = [key(r0, c0)];
    let at = { ...piece, row: r0, col: c0 };
    while (path.length < 10 && at.row > 0) {
      const opts = legalMoves(at, [at], open).filter((m) => !path.includes(key(m.row, m.col)) && m.row <= at.row + 1);
      const up = opts.filter((m) => m.row < at.row);
      const pool = up.length && rng() < 0.75 ? up : opts;
      if (!pool.length) break;
      const m = pickFrom(rng, pool);
      at = { ...piece, row: m.row, col: m.col };
      path.push(key(m.row, m.col));
    }
    if (at.row === 0) return path;
  }
}

// Arma una partida del minijuego: mesa, rival (un perfil de difficulty.js o uno propio) y jugadores.
// Minijuegos que estrenan una mecánica de los pisos sobre su propio tablero (`modifier`).
Object.assign(SCENARIOS, {
  blizzard: {
    id: 'blizzard',
    modifier: 'fog',
    goal: 'Cruza el lago helado hasta la fila de arriba con tu caballo. En el hielo se patina una casilla más y la niebla esconde a los guardias.',
    levels: {
      facil: { guards: ['pawn', 'pawn', 'pawn', 'knight'], holes: 4, rounds: 12, rival: 'aprendiz' },
      normal: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight'], holes: 6, rounds: 10, rival: 'oficial' },
      dificil: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'bishop'], holes: 8, rounds: 9, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = { ...board(), protectRows: 2 }, runner = makePiece('knight', 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      rubble(rng, b, pieces, lv.holes);
      addTerrain(b, rng, 'ice');
      return crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: 'Cruzaste el lago helado.' });
    }),
  },
  outbreak: {
    id: 'outbreak',
    modifier: 'contagion',
    goal: 'Cada captura contagia a las piezas menores pegadas a la víctima y pasan al bando que capturó. Pasa a tu bando las piezas pedidas antes de que se acaben las rondas, sin perder a tu rey.',
    levels: {
      facil: { need: 5, rounds: 16, rival: 'aprendiz' },
      normal: { need: 7, rounds: 14, rival: 'oficial' },
      dificil: { need: 8, rounds: 14, rival: 'maestro' },
    },
    setup(lv, rng) {
      const seed = Math.floor(rng() * 1e9), b = generateBoard(seed, 4, 10, 'contagion');
      const pieces = placePieces(b, { modifier: 'contagion', playerCount: 2, seed, mutations: [], bonuses: {}, floor: 4, totalFloors: 10 });
      const turned = (m) => m.pieces.filter((p) => p.color === 'light' && p.infected).length;
      return {
        board: b, pieces, rival: lv.rival,
        objective: (m) => m.eliminated.light ? { victory: false, note: 'Cayó tu rey.' }
          : turned(m) >= lv.need || m.eliminated.dark ? { victory: true, note: 'El brote es tuyo.' }
          : rounds(m) >= lv.rounds ? { victory: false, note: 'El brote no llegó a tanto.' } : null,
        status: (m) => `Contagiadas ${turned(m)}/${lv.need} · quedan ${lv.rounds - rounds(m)} rondas`,
      };
    },
  },
});

// Contrarreloj y Alfiles a ciegas: el tablero cambia por turno (match.tick).
const freeTiles = (b, pieces) => {
  const used = taken(pieces, b), out = [];
  for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) if (!used.has(key(r, c))) out.push([r, c]);
  return out;
};
Object.assign(SCENARIOS, {
  clock: {
    id: 'clock',
    goal: 'Llega a la casilla del reloj antes de que se agote (el número son tus jugadas) y recoge las monedas ●. Van apareciendo piezas carmesí que te cazan; tú también puedes capturarlas.',
    levels: {
      facil: { coins: 4, time: 6, every: 4, foes: ['pawn', 'pawn', 'knight'], rival: 'aprendiz', piece: ['queen', 'rook'] },
      normal: { coins: 5, time: 5, every: 3, foes: ['pawn', 'knight', 'bishop'], rival: 'oficial', piece: ['rook', 'bishop', 'knight'] },
      dificil: { coins: 6, time: 4, every: 2, foes: ['knight', 'bishop', 'rook'], rival: 'oficial', piece: ['knight', 'bishop'] },
    },
    setup(lv, rng) {
      const b = board(), runner = makePiece(pickFrom(rng, lv.piece), 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      rubble(rng, b, pieces, 4);
      const coins = new Set(), clock = { k: null, until: 0 };
      let got = 0, spawnedAt = 0;
      // El reloj cae en una casilla a la que se llega con margen; las monedas, donde haya sitio.
      const newClock = (now, all) => {
        const options = shuffle(rng, freeTiles(b, all)).filter(([r, c]) => !coins.has(key(r, c)));
        const fit = options.find(([r, c]) => { const d = routeLen(b, runner, (p) => p.row === r && p.col === c); return d >= 2 && d <= lv.time - 1; }) || options[0];
        Object.assign(clock, { k: key(...fit), until: now + lv.time });
      };
      const addCoin = (all) => { const [r, c] = shuffle(rng, freeTiles(b, all)).find(([r, c]) => key(r, c) !== clock.k) || []; if (r != null) coins.add(key(r, c)); };
      newClock(0, pieces);
      for (let i = 0; i < 3; i++) addCoin(pieces);
      return {
        board: b, pieces, rival: lv.rival, runner,
        objective: (m) => {
          if (m.eliminated.light) return { victory: false, note: 'Te atraparon.' };
          const at = key(runner.row, runner.col);
          if (coins.delete(at)) { got++; if (got + coins.size < lv.coins) addCoin(m.pieces); }
          if (got >= lv.coins) return { victory: true, note: 'Todas las monedas, y a tiempo.' };
          if (at === clock.k) newClock(rounds(m), m.pieces);
          return rounds(m) >= clock.until ? { victory: false, note: 'Se paró el reloj.' } : null;
        },
        tick: (m) => {
          const now = rounds(m);
          if (m.player.color !== 'light' || now - spawnedAt < lv.every) return null;
          spawnedAt = now;
          const far = shuffle(rng, freeTiles(b, m.pieces)).find(([r, c]) => Math.max(Math.abs(r - runner.row), Math.abs(c - runner.col)) >= 3 && !coins.has(key(r, c)) && key(r, c) !== clock.k);
          if (!far) return null;
          const foe = makePiece(pickFrom(rng, lv.foes), 'dark', far[0], far[1], { startRow: -1 });
          m.pieces.push(foe);
          return { spawned: [foe] };
        },
        labels: (m) => new Map([...[...coins].map((k) => [k, '●']), ...(clock.k ? [[clock.k, Math.max(0, clock.until - (m.players ? rounds(m) : 0))]] : [])]),
        status: (m) => `Monedas ${got}/${lv.coins} · reloj ${Math.max(0, clock.until - rounds(m))}`,
      };
    },
  },
  witch: {
    id: 'witch',
    goal: 'Cruza hasta la fila de arriba sin mirar a las brujas (ojo verde): si alguna de tus jugadas posibles puede tocarla, despierta y te persigue moviéndose casi como una reina.',
    levels: {
      facil: { witches: 2, guards: ['pawn', 'pawn'], holes: 4, rounds: 12, rival: 'oficial' },
      normal: { witches: 3, guards: ['pawn', 'pawn', 'pawn'], holes: 6, rounds: 10, rival: 'oficial' },
      dificil: { witches: 4, guards: ['pawn', 'pawn', 'pawn', 'knight'], holes: 6, rounds: 9, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = board(), runner = makePiece('knight', 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      rubble(rng, b, pieces, lv.holes);
      // Dormidas y fuera de la vista del caballo al empezar.
      const sees = (r, c) => legalMoves(runner, pieces, b).some((m) => m.row === r && m.col === c);
      for (const [r, c] of spots(rng, pieces, b, 1, N - 3, lv.witches * 3).filter(([r, c]) => !sees(r, c)).slice(0, lv.witches))
        pieces.push(makePiece('queen', 'dark', r, c, { witch: true, moves: ['rook2', 'bishop2', 'knight'] }));
      return crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: 'Pasaste sin despertarlas… o sin que te alcanzaran.' });
    }),
  },
  blind: {
    id: 'blind',
    modifier: 'fog',
    goal: 'Alfiles a ciegas: todos caen al azar y la niebla no deja ver a los rivales. Captúralos antes de que el tablero se encoja del todo; el borde se hunde cada pocas rondas.',
    levels: {
      facil: { n: 10, mine: 2, foes: 3, every: 3, rival: 'aprendiz' },
      normal: { n: 11, mine: 2, foes: 4, every: 2, rival: 'oficial' },
      dificil: { n: 12, mine: 2, foes: 5, every: 2, rival: 'oficial' },
    },
    setup(lv, rng) {
      const b = board(lv.n), pieces = [];
      // Al azar, pero sin nadie a tiro en la primera jugada.
      for (;;) {
        pieces.length = 0;
        for (const [color, n] of [['light', lv.mine], ['dark', lv.foes]])
          for (const [r, c] of shuffle(rng, freeTiles(b, pieces)).slice(0, n)) pieces.push(makePiece('bishop', color, r, c));
        if (!pieces.some((p) => legalMoves(p, pieces, b).some((m) => m.hits.length))) break;
      }
      let ring = 0, lastSink = 0;
      const mine = (m) => side(m, 'light').length, foes = (m) => side(m, 'dark').length;
      const minSide = () => lv.n - 2 * ring <= 4;
      return {
        board: b, pieces, rival: lv.rival,
        objective: (m) => !mine(m) ? { victory: false, note: 'Cayeron tus alfiles.' }
          : !foes(m) ? { victory: true, note: 'Ni uno en pie.' }
          : minSide() ? (mine(m) > foes(m) ? { victory: true, note: 'Quedaste con más alfiles al cerrarse el tablero.' } : { victory: false, note: 'El tablero se cerró y no les ganaste.' })
          : null,
        tick: (m) => {
          const now = rounds(m);
          if (m.player.color !== 'light' || now === lastSink || now % lv.every) return null;
          lastSink = now;
          const k = ring++, n = lv.n, sunk = [];
          for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
            if ((r === k || c === k || r === n - 1 - k || c === n - 1 - k) && Math.min(r, c, n - 1 - r, n - 1 - c) === k && !b.holes.has(key(r, c))) { b.holes.add(key(r, c)); sunk.push([r, c]); }
          const fallen = m.pieces.filter((p) => b.holes.has(key(p.row, p.col)));
          for (const p of fallen) m.pieces.splice(m.pieces.indexOf(p), 1);
          return { sunk, fallen };
        },
        status: (m) => `Tus alfiles ${mine(m)} · rivales ${foes(m)} · tablero ${lv.n - 2 * ring}×${lv.n - 2 * ring}`,
      };
    },
  },
});

export function buildScenario(id, level = 'normal', seed = Math.floor(Math.random() * 1e9)) {
  const def = SCENARIOS[id];
  const lv = def.levels[level] || def.levels.normal;
  const game = def.setup(lv, mulberry32(seed));
  const rival = typeof game.rival === 'string' ? RIVALS[game.rival] : { id: 'mini', name: 'Bot', desc: '', blunder: 0, ...game.rival };
  const seats = def.single ? [{ color: 'light', kind: 'human', name: 'Tú' }] : [{ color: 'light', kind: 'human', name: 'Tú' }, { color: 'dark', kind: 'bot', name: 'Bot carmesí' }];
  // Nombre e icono salen del registro de mecánicas: un solo sitio para cada minijuego.
  return { ...def, name: MODIFIERS[id].name, icon: MODIFIERS[id].icon, ...game, rival, seats, level };
}
