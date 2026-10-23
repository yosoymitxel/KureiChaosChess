// Minijuegos de ajedrez que se juegan en el tablero de la partida (GameScreen + Match + BoardView):
// cada uno solo dice cómo se arma la mesa, con qué rival y cuándo se gana o se pierde.
// `setup(level, seed)` devuelve { board, pieces, rival, objective, status, labels?, hideRoyal?, single? }.
import { mulberry32, pickFrom } from '../core/rng.js';
import { makePiece, placeBoss } from '../game/generate.js';
import { MINI_BOSSES, FINAL_BOSSES, RIVALS } from '../game/difficulty.js';
import { legalMoves, key } from '../game/rules.js';

export const LEVELS = { facil: { name: 'Fácil' }, normal: { name: 'Normal' }, dificil: { name: 'Difícil' } };
const N = 8;
const board = () => ({ rows: N, cols: N, holes: new Set(), terrain: new Map(), portals: new Map() });
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
    id: 'caceria', name: 'La cacería', icon: 'hunt',
    goal: 'Captura a todos los peones carmesí antes de que uno corone. Comen en diagonal: cuidado con dónde caes.',
    levels: {
      facil: { hunters: ['knight', 'bishop', 'rook'], pawns: 2, holes: 2, rival: { noise: 6, capture: 1, pressure: 0, care: 0, advance: 3 } },
      normal: { hunters: ['knight', 'bishop'], pawns: 3, holes: 3, rival: { noise: 1, capture: 1, pressure: 0, care: 1, advance: 4 } },
      dificil: { hunters: ['knight', 'knight'], pawns: 4, holes: 4, rival: { noise: 0.3, capture: 1, pressure: 0, care: 2, advance: 5 } },
    },
    setup(lv, rng) {
      const b = board(), pieces = [];
      const files = shuffle(rng, [...Array(N).keys()]).slice(0, lv.pawns);
      for (const c of files) pieces.push(makePiece('pawn', 'dark', 1 + Math.floor(rng() * 2), c, { canCrown: true }));
      spots(rng, pieces, b, N - 2, N - 1, lv.hunters.length).forEach(([r, c], i) => pieces.push(makePiece(lv.hunters[i], 'light', r, c)));
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
    id: 'bodyguard', name: 'El guardaespaldas', icon: 'guard',
    goal: 'Mantén vivo a tu rey hasta el final del asedio, o derriba a toda la escuadra carmesí.',
    levels: {
      facil: { escorts: 2, squad: ['knight', 'bishop', 'pawn', 'pawn'], rounds: 8, holes: 2, rival: 'oficial' },
      normal: { escorts: 2, squad: ['knight', 'bishop', 'rook', 'pawn', 'pawn'], rounds: 10, holes: 3, rival: 'maestro' },
      dificil: { escorts: 1, squad: ['knight', 'knight', 'bishop', 'rook', 'queen', 'pawn'], rounds: 12, holes: 3, rival: 'maestro' },
    },
    setup(lv, rng) {
      const b = board(), pieces = [];
      const kc = 1 + Math.floor(rng() * (N - 2));
      pieces.push(makePiece('king', 'light', N - 1, kc));
      const guards = shuffle(rng, ['rook', 'bishop', 'knight', 'rook']).slice(0, lv.escorts);
      for (const [r, c] of spots(rng, pieces, b, N - 2, N - 1, 6).filter(([, c]) => Math.abs(c - kc) <= 2).slice(0, guards.length)) pieces.push(makePiece(guards.pop(), 'light', r, c));
      const squad = shuffle(rng, lv.squad);
      for (const [r, c] of spots(rng, pieces, b, 0, 1, squad.length)) pieces.push(makePiece(squad.pop(), 'dark', r, c));
      rubble(rng, b, pieces, lv.holes);
      return {
        board: b, pieces, rival: lv.rival,
        objective: (m) => m.eliminated.light ? { victory: false, note: 'La escuadra alcanzó a tu rey.' }
          : !side(m, 'dark').length ? { victory: true, note: 'Desarmaste a toda la escuadra.' }
          : rounds(m) >= lv.rounds ? { victory: true, note: 'Tu rey resistió el asedio.' } : null,
        status: (m) => `Aguanta ${lv.rounds - rounds(m)} rondas · ${side(m, 'dark').length} atacantes`,
      };
    },
  },

  // Un jefe de la torre contra una partida de caza; la reina es la que no puede caer.
  giantHunt: {
    id: 'giantHunt', name: 'Caza de gigantes', icon: 'boss',
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
    id: 'minefield', name: 'Campo minado', icon: 'bomb', single: true,
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
    id: 'kingImpostor', name: 'El rey impostor', icon: 'target', hideRoyal: true,
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
export function buildScenario(id, level = 'normal', seed = Math.floor(Math.random() * 1e9)) {
  const def = SCENARIOS[id];
  const lv = def.levels[level] || def.levels.normal;
  const game = def.setup(lv, mulberry32(seed));
  const rival = typeof game.rival === 'string' ? RIVALS[game.rival] : { id: 'mini', name: 'Bot', desc: '', blunder: 0, ...game.rival };
  const seats = def.single ? [{ color: 'light', kind: 'human', name: 'Tú' }] : [{ color: 'light', kind: 'human', name: 'Tú' }, { color: 'dark', kind: 'bot', name: 'Bot carmesí' }];
  return { ...def, ...game, rival, seats, level };
}
