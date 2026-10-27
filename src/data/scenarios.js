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
import { t, tp } from '../i18n/index.js';

export const LEVELS = { facil: { name: t('diff.facil', 'Fácil') }, normal: { name: t('diff.normal', 'Normal') }, dificil: { name: t('diff.dificil', 'Difícil') } };
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
    goal: t('sc.caceria.goal', 'Captura a todos los peones carmesí antes de que uno corone. Comen en diagonal: cuidado con dónde caes.'),
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
        objective: (m) => side(m, 'dark').some((p) => p.type !== 'pawn') ? { victory: false, note: t('sc.caceria.lost1', 'Un peón llegó al fondo y coronó.') }
          : !side(m, 'light').length ? { victory: false, note: t('sc.caceria.lost2', 'Los peones se comieron a tus cazadores.') }
          : !side(m, 'dark').length ? { victory: true, note: t('sc.caceria.won', 'No quedó ni un fugitivo.') }
          : rounds(m) >= 20 ? { victory: false, note: t('sc.caceria.lost3', 'Los fugitivos aguantaron 20 rondas.') } : null,
        status: (m) => t('sc.caceria.status', 'Peones: {n} · el más adelantado corona en {d} · quedan {r} rondas', { n: side(m, 'dark').length, d: Math.min(...side(m, 'dark').map((p) => N - 1 - p.row)), r: 20 - rounds(m) }),
      };
    },
  },

  // Tu rey y su escolta aguantan el asedio de una escuadra sin rey.
  bodyguard: {
    id: 'bodyguard',
    goal: t('sc.bodyguard.goal', 'Mantén vivo a tu rey hasta el final del asedio, o derriba a toda la escuadra carmesí. Cada bando mueve dos veces por turno y la segunda no puede capturar; a mitad del asedio, tres.'),
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
        objective: (m) => m.eliminated.light ? { victory: false, note: t('sc.bodyguard.lost', 'La escuadra alcanzó a tu rey.') }
          : !side(m, 'dark').length ? { victory: true, note: t('sc.bodyguard.won1', 'Desarmaste a toda la escuadra.') }
          : rounds(m) >= lv.rounds ? { victory: true, note: t('sc.bodyguard.won2', 'Tu rey resistió el asedio.') } : null,
        // Todos mueven dos veces (la segunda sin capturar); pasada la mitad del asedio, tres.
        bonus: (m) => (rounds(m) >= lv.rounds / 2 ? 2 : 1),
        status: (m) => t('sc.bodyguard.status', 'Aguanta {r} rondas · {n} atacantes · {k} jugadas por turno', { r: lv.rounds - rounds(m), n: side(m, 'dark').length, k: rounds(m) >= lv.rounds / 2 ? 3 : 2 }),
      };
    },
  },

  // Un jefe de la torre contra una partida de caza; la reina es la que no puede caer.
  giantHunt: {
    id: 'giantHunt',
    goal: t('sc.giantHunt.goal', 'Derriba al jefe antes de que acaben las rondas. Cada golpe le quita una vida; si cae tu reina, pierdes.'),
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
        objective: (m) => m.eliminated.dark ? { victory: true, note: t('sc.giantHunt.won', '{name} cayó.', { name: boss.name }) }
          : m.eliminated.light ? { victory: false, note: t('sc.giantHunt.lost1', '{name} aplastó a tu reina.', { name: boss.name }) }
          : rounds(m) >= lv.rounds ? { victory: false, note: t('sc.giantHunt.lost2', 'Se acabaron las rondas: {name} sigue en pie.', { name: boss.name }) } : null,
        status: (m) => t('sc.giantHunt.status', '{name}: {hp}/{max} vidas · quedan {r} rondas', { name: boss.name, hp: boss.hp, max: boss.maxHp, r: lv.rounds - rounds(m) }),
      };
    },
  },

  // Solo el caballo y un campo con minas escondidas; las casillas pisadas cuentan las minas de alrededor.
  minefield: {
    id: 'minefield', single: true,
    goal: t('sc.minefield.goal', 'Lleva el caballo a la fila de arriba. Cada casilla pisada dice cuántas minas la rodean; siempre hay un camino seguro.'),
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
        objective: (m) => !m.pieces.length ? { victory: false, note: t('sc.minefield.lost1', 'El caballo pisó una mina.') }
          : knight.row === 0 ? { victory: true, note: t('sc.minefield.won', 'Cruzaste el campo minado.') }
          : m.turn >= limit ? { victory: false, note: t('sc.minefield.lost2', 'Se acabaron los saltos.') } : null,
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
    goal: t('sc.kingImpostor.goal', 'Entre los reyes carmesí solo uno es de verdad. Los demás son piezas disfrazadas: el disfraz cae si se mueven más de una casilla. Captura al rey verdadero antes de que acaben las rondas.'),
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
        objective: (m) => m.eliminated.dark ? { victory: true, note: t('sc.kingImpostor.won', 'Desenmascaraste al rey de verdad.') }
          : m.eliminated.light ? { victory: false, note: t('sc.kingImpostor.lost1', 'Cayó tu rey antes de dar con el impostor.') }
          : rounds(m) >= lv.rounds ? { victory: false, note: t('sc.kingImpostor.lost2', 'El rey verdadero se escabulló.') } : null,
        status: (m) => t('sc.kingImpostor.status', 'Sospechosos: {n} · quedan {r} rondas', { n: side(m, 'dark').filter((p) => p.type === 'king' || (p.disguise && !p.unmasked)).length, r: lv.rounds - rounds(m) }),
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
      return m.eliminated.light ? { victory: false, note: t('sc.caught', 'Te atraparon.') }
        : goal(runner) && !left.size ? { victory: true, note }
        : rounds(m) >= limit ? { victory: false, note: t('sc.outOfRounds', 'Se acabaron las rondas.') } : null;
    },
    labels: () => new Map([...left].map((k) => [k, 'icon:flask'])),
    status: (m) => t('sc.crossing.status', 'Quedan {r} rondas · {n} guardias', { r: limit - rounds(m), n: side(m, 'dark').length }) + (all.length ? ' · ' + t('sc.crossing.samples', 'muestras {got}/{total}', { got: all.length - left.size, total: all.length }) : ''),
  };
}
Object.assign(SCENARIOS, {
  escape: {
    id: 'escape',
    goal: t('sc.escape.goal', 'Lleva tu caballo a la fila de arriba. Los guardias carmesí te cierran el paso y te cazan si te pones a tiro.'),
    levels: {
      facil: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight'], holes: 6, rounds: 10, rival: 'oficial' },
      normal: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'bishop'], holes: 8, rounds: 8, rival: 'maestro' },
      dificil: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'knight', 'bishop', 'rook'], holes: 10, rounds: 7, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = board(), runner = makePiece('knight', 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      rubble(rng, b, pieces, lv.holes);
      return crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: t('sc.escape.won', 'Escapaste del tablero.') });
    }),
  },
  contraband: {
    id: 'contraband',
    goal: t('sc.contraband.goal', 'Lleva el caballo a la salida marcada con ⚑. Los portales te mandan a su gemelo del mismo color; los guardias vigilan.'),
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
      const game = crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === exit[0] && p.col === exit[1], note: t('sc.contraband.won', 'El contrabando cruzó.') });
      return { ...game, labels: () => new Map([[key(...exit), 'icon:flag']]) };
    }),
  },
  laboratory: {
    id: 'laboratory',
    goal: t('sc.laboratory.goal', 'Tu pieza lleva una mutación de prueba. Recoge las muestras ⚗ y llévala a la fila de arriba: cada casilla que dejas se hunde y los guardias acechan.'),
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
      return crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: t('sc.laboratory.won', 'El experimento salió bien.'), samples: lv.samples });
    }),
  },
  // Ruta del caballo: pisar todas las casillas marcadas; lo pisado se hunde. Las marcas salen de
  // un paseo real del caballo, así que siempre hay solución.
  knight: {
    id: 'knight', single: true,
    goal: t('sc.knight.goal', 'Pisa con el caballo todas las casillas marcadas ◎. Cada casilla que dejas se hunde: si te quedas sin saltos, pierdes.'),
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
            return !left.size ? { victory: true, note: t('sc.knight.won', 'Ruta completa.') } : !m.canMove() ? { victory: false, note: t('sc.knight.lost', 'El caballo se quedó sin saltos.') } : null;
          },
          labels: () => new Map([...left].map((k) => [k, 'icon:target'])),
          status: () => tp('sc.knight.status', left.size, 'Falta {n} casilla', 'Faltan {n} casillas'),
        };
      }
    },
  },
  // Mate en 1 o 2 de la colección validada (src/data/mates.js); el rival defiende con la mejor
  // respuesta legal (game/mates.js). Variedad: problema al azar y tablero espejado.
  mates: {
    id: 'mates',
    goal: t('sc.mates.goal', 'Da jaque mate al rey carmesí en las jugadas indicadas. El rival defiende con su mejor respuesta.'),
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
        objective: (m) => isCheckmate(m.pieces, 'dark', b) ? { victory: true, note: t('sc.mates.won', '¡Jaque mate!') }
          : m.eliminated.light ? { victory: false, note: t('sc.mates.lost1', 'Dejaste a tu rey a tiro.') }
          : rounds(m) >= n ? { victory: false, note: t('sc.mates.lost2', 'No llegó el mate en {n}.', { n }) } : null,
        status: (m) => t('sc.mates.status', 'Mate en {n} · te quedan {r} jugadas', { n, r: n - rounds(m) }),
      };
    },
  },
  collapsingFloor: {
    id: 'collapsingFloor',
    goal: t('sc.collapsingFloor.goal', 'Cruza con el caballo hasta la fila de arriba. Cada casilla que dejas se hunde y los guardias te cortan el paso.'),
    levels: {
      facil: { guards: ['pawn', 'pawn', 'pawn', 'knight'], holes: 6, rounds: 10, fall: 1, rival: 'oficial' },
      normal: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'bishop'], holes: 9, rounds: 9, fall: 2, rival: 'maestro' },
      dificil: { guards: ['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'knight', 'bishop', 'rook'], holes: 12, rounds: 8, fall: 3, rival: 'maestro' },
    },
    setup: (lv, rng) => passable(lv, () => {
      const b = board(), runner = makePiece('knight', 'light', N - 1, Math.floor(rng() * N), { royal: true }), pieces = [runner];
      b.sinking = 'light';
      rubble(rng, b, pieces, lv.holes);
      const game = crossing({ b, pieces, runner, guards: shuffle(rng, lv.guards), rng, rival: lv.rival, rounds: lv.rounds, goal: (p) => p.row === 0, note: t('sc.collapsingFloor.won', 'Llegaste antes de que se acabara el suelo.') });
      // Además, al empezar cada ronda tuya se hunden `fall` casillas por delante del caballo, una justo
      // en su camino (la fila de arriba): obliga a saltar el hueco. Nunca la que deja la meta sin salida.
      let last = -1;
      game.tick = (m) => {
        const now = rounds(m);
        if (m.player.color !== 'light' || now === last || now === 0) return null;
        last = now;
        const r0 = runner.row, free = (r, c) => r >= 1 && r < N && c >= 0 && c < N && !b.holes.has(key(r, c)) && !m.pieces.some((p) => p.row === r && p.col === c);
        const ahead = [], near = [];
        for (let c = 0; c < N; c++) { if (free(r0 - 1, c) && Math.abs(c - runner.col) <= 1) ahead.push([r0 - 1, c]); for (const r of [r0 - 2, r0 - 3]) if (free(r, c)) near.push([r, c]); }
        const sunk = [];
        for (const [r, c] of [...shuffle(rng, ahead).slice(0, 1), ...shuffle(rng, near)]) {
          if (sunk.length >= lv.fall) break;
          b.holes.add(key(r, c));
          if (routeLen(b, runner, (p) => p.row === 0) === Infinity) b.holes.delete(key(r, c));
          else sunk.push([r, c]);
        }
        return sunk.length ? { sunk } : null;
      };
      return game;
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
});

// Contrarreloj: el tablero cambia por turno (match.tick).
const freeTiles = (b, pieces) => {
  const used = taken(pieces, b), out = [];
  for (let r = 0; r < b.rows; r++) for (let c = 0; c < b.cols; c++) if (!used.has(key(r, c))) out.push([r, c]);
  return out;
};
Object.assign(SCENARIOS, {
  clock: {
    id: 'clock',
    goal: t('sc.clock.goal', 'Llega a la casilla del reloj antes de que se agote (el número son tus jugadas) y recoge las monedas. Van apareciendo piezas carmesí que te cazan; tú también puedes capturarlas.'),
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
          if (m.eliminated.light) return { victory: false, note: t('sc.caught', 'Te atraparon.') };
          const at = key(runner.row, runner.col);
          if (coins.delete(at)) { got++; if (got + coins.size < lv.coins) addCoin(m.pieces); }
          if (got >= lv.coins) return { victory: true, note: t('sc.clock.won', 'Todas las monedas, y a tiempo.') };
          if (at === clock.k) newClock(rounds(m), m.pieces);
          return rounds(m) >= clock.until ? { victory: false, note: t('sc.clock.lost', 'Se paró el reloj.') } : null;
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
        labels: (m) => new Map([...[...coins].map((k) => [k, 'icon:coin']), ...(clock.k ? [[clock.k, Math.max(0, clock.until - (m.players ? rounds(m) : 0))]] : [])]),
        status: (m) => t('sc.clock.status', 'Monedas {got}/{total} · reloj {n}', { got, total: lv.coins, n: Math.max(0, clock.until - rounds(m)) }),
      };
    },
  },
});

// La bruja: la regla del Aquelarre a solas (match.wake). Las brujas duermen hasta que una de tus piezas
// puede tocarlas; entonces despiertan y cazan como casi una reina.
const WITCH_MOVES = ['rook2', 'bishop2', 'knight'];
Object.assign(SCENARIOS, {
  witch: {
    id: 'witch',
    goal: t('sc.witch.goal', 'Recoge las monedas antes del amanecer sin despertar a las brujas: si una de tus piezas puede tocar a una bruja dormida (ojo verde), despierta (ojo rojo) y te caza. Puedes capturarla, pero solo despierta.'),
    levels: {
      facil: { team: ['rook', 'knight', 'bishop'], witches: 2, guards: 2, coins: 4, rubble: 3, turns: 30, rival: 'aprendiz' },
      normal: { team: ['rook', 'knight', 'bishop'], witches: 3, guards: 2, coins: 5, rubble: 4, turns: 30, rival: 'oficial' },
      dificil: { team: ['rook', 'knight', 'bishop'], witches: 4, guards: 3, coins: 5, rubble: 4, turns: 28, rival: 'oficial' },
    },
    setup(lv, rng) {
      const b = board(), pieces = [];
      const cols = shuffle(rng, [...Array(N).keys()]);
      lv.team.forEach((type, i) => pieces.push(makePiece(type, 'light', N - 1, cols[i])));
      for (const [r, c] of spots(rng, pieces, b, 0, 1, lv.guards)) pieces.push(makePiece('pawn', 'dark', r, c, { startRow: -1 }));
      rubble(rng, b, pieces, lv.rubble);
      // Cada bruja duerme donde ninguna de tus piezas llega al empezar.
      const seen = () => new Set(side({ pieces }, 'light').flatMap((p) => legalMoves(p, pieces, b).map((m) => key(m.row, m.col))));
      for (let i = 0; i < lv.witches; i++) {
        const watched = seen(), at = spots(rng, pieces, b, 1, N - 3, 40).find(([r, c]) => !watched.has(key(r, c)));
        if (at) pieces.push(makePiece('queen', 'dark', at[0], at[1], { witch: true, moves: WITCH_MOVES, startRow: -1 }));
      }
      const coins = new Set(spots(rng, pieces, b, 1, N - 2, lv.coins).map(([r, c]) => key(r, c)));
      const total = coins.size;
      const awake = (m) => side(m, 'dark').filter((p) => p.witch && p.awake).length;
      return {
        board: b, pieces, rival: lv.rival,
        objective: (m) => {
          for (const p of side(m, 'light')) coins.delete(key(p.row, p.col));
          if (!side(m, 'light').length) return { victory: false, note: t('sc.witch.lost', 'Las brujas cazaron a todas tus piezas.') };
          if (!coins.size) return awake(m) ? { victory: true, note: t('sc.witch.won', 'Todas las monedas.') } : { victory: true, award: 'witch_clean', note: t('sc.witch.clean', 'Todas las monedas sin despertar a ninguna bruja.') };
          return rounds(m) >= lv.turns ? { victory: false, note: t('sc.witch.dawn', 'Amaneció con monedas sin recoger.') } : null;
        },
        labels: () => new Map([...coins].map((k) => [k, 'icon:coin'])),
        status: (m) => t('sc.witch.status', 'Monedas {got}/{total} · brujas despiertas {n} · turnos {left}', { got: total - coins.size, total, n: awake(m), left: Math.max(0, lv.turns - rounds(m)) }),
      };
    },
  },
});

export function buildScenario(id, level = 'normal', seed = Math.floor(Math.random() * 1e9)) {
  const def = SCENARIOS[id];
  const lv = def.levels[level] || def.levels.normal;
  const game = def.setup(lv, mulberry32(seed));
  const rival = typeof game.rival === 'string' ? RIVALS[game.rival] : { id: 'mini', name: 'Bot', desc: '', blunder: 0, ...game.rival };
  const you = { color: 'light', kind: 'human', name: t('seat.you', 'Tú') };
  const seats = def.single ? [you] : [you, { color: 'dark', kind: 'bot', name: t('seat.bot', 'Bot {side}', { side: t('side.darkLower', 'carmesí') }) }];
  // Nombre e icono salen del registro de mecánicas: un solo sitio para cada minijuego.
  return { ...def, name: MODIFIERS[id].name, icon: MODIFIERS[id].icon, ...game, rival, seats, level };
}
