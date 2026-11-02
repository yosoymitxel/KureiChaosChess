// Mecánicas de piso con reglas propias (nombre, icono y peso en src/data/modifiers.js). Cada una
// engancha solo lo que necesita y Match las llama:
//   size            lado del tablero (generate.js)
//   setup(pieces, board, rng)          retoca el reparto (generate.js)
//   moves(match, p) jugadas extra · filter(match, p, moves) las recorta
//   redirect(match, p, m)              cambia el destino de una jugada sin captura
//   after(match, p, from, res)         tras mover; lo que pasa va a res.mech
//   turn(match)     al cambiar de turno; devuelve un `mech` · over(match) fin propio (null = sigue)
//   bot(match, p, m)                   ajuste de puntuación del bot
// Un `mech` es { fx, kills, moved: [{ piece, from, to, how }], spawned, art, log, callout } y el tablero
// lo anima con los efectos de siempre (src/ui/board-fx.js).
import { key, walkable, buildOccupancy, legalMoves, ctxOf, canHit, cellsOf, immune, threatenedPieces } from './rules.js';
import { PIECE_VALUE } from '../data/pieces.js';
import { t } from '../i18n/index.js';

const ev = () => ({ fx: [], kills: [], moved: [], spawned: [], art: [] });
const free = (m, r, c) => walkable(m.board, r, c) && !buildOccupancy(m.pieces).get(key(r, c));
const small = (p) => !p.boss && (p.h || 1) === 1 && (p.w || 1) === 1;
const rnd = (list) => list[Math.floor(Math.random() * list.length)];
const NEAR = [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [dr, dc])).filter(([a, b]) => a || b);
// Quita una pieza; si era el último rey de su bando, ese bando cae.
function kill(m, p, out) {
  const i = m.pieces.indexOf(p);
  if (i < 0) return;
  m.pieces.splice(i, 1);
  out.kills.push(p);
  if (p.royal && !m.pieces.some((q) => q.royal && q.color === p.color)) m.eliminated[p.color] = true;
}
const has = (out) => out.fx.length || out.kills.length || out.moved.length || out.spawned.length || out.art.length || out.log;
const retype = (pieces, ok, type, extra = {}) => { for (const p of pieces) if (!p.royal && !p.boss && ok(p)) Object.assign(p, { type, moves: undefined, ...extra }); };
let chicks = 0;

export const MECHANICS = {
  // Superpoderes: rey que salta dos casillas, torre y alfil que atraviesan a los suyos, peón que
  // siempre puede avanzar dos, dama que empuja a quien tenga pegado y caballo que repite al capturar.
  powers: {
    moves(m, p) {
      const out = [], occ = buildOccupancy(m.pieces);
      if (!small(p)) return out;
      if (p.type === 'king') for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        const r = p.row + dr, c = p.col + dc;
        if (Math.max(Math.abs(dr), Math.abs(dc)) === 2 && walkable(m.board, r, c) && !occ.get(key(r, c))) out.push({ row: r, col: c, hits: [], power: 'blink' });
      }
      if (p.type === 'rook' || p.type === 'bishop') {
        const dirs = p.type === 'rook' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of dirs) {
          let r = p.row + dr, c = p.col + dc, through = false;
          for (; walkable(m.board, r, c); r += dr, c += dc) {
            const o = occ.get(key(r, c));
            if (o?.color === p.color) { through = true; continue; }
            if (through && !(o && immune(o, m.pieces))) out.push({ row: r, col: c, hits: o ? [o] : [] });
            if (o) break;
          }
        }
      }
      if (p.type === 'pawn' && p.startRow !== p.row) {
        const dir = p.color === 'light' ? -1 : 1;
        if (free(m, p.row + dir, p.col) && free(m, p.row + 2 * dir, p.col)) out.push({ row: p.row + 2 * dir, col: p.col, hits: [] });
      }
      return out;
    },
    after(m, p, from, res) {
      const out = ev();
      if (p.type === 'king' && Math.max(Math.abs(p.row - from.row), Math.abs(p.col - from.col)) === 2) out.fx.push({ ring: [from.row, from.col], color: '#c58bff' }, { ring: [p.row, p.col], color: '#c58bff' }, { sfx: 'warp' });
      if (p.type === 'knight' && res.victims.some((v) => v.killed)) { m.turnBonus = (m.turnBonus || 0) + 1; out.fx.push({ float: [p.row, p.col, t('mech.again', '¡Otra vez!')] }); }
      if (p.type === 'queen') for (const [dr, dc] of NEAR) {
        const o = m.pieces.find((q) => q.row === p.row + dr && q.col === p.col + dc && q.color !== p.color && small(q) && !q.royal && !q.chicken);
        if (!o) continue;
        const r = o.row + dr, c = o.col + dc;
        if (r < 0 || c < 0 || r >= m.board.rows || c >= m.board.cols || m.board.holes.has(key(r, c))) { kill(m, o, out); continue; }
        if (!free(m, r, c)) continue;
        out.moved.push({ piece: o, from: { row: o.row, col: o.col }, to: { row: r, col: c }, how: 'slide' });
        o.row = r; o.col = c;
      }
      if (out.moved.length || out.kills.length) out.fx.unshift({ ring: [p.row, p.col], color: '#ffcf6b', size: 1.6 }, { shake: 8 });
      if (has(out)) res.mech = out;
    },
  },

  // Piezas con vida: aguantan golpes según lo que valen (el golpe que no mata rebota, como con los jefes).
  hp: {
    setup(pieces) {
      const HP = { queen: 3, rook: 2, bishop: 2, knight: 2, camel: 2, cannon: 2, elephant: 2, king: 2 };
      for (const p of pieces) if (!p.boss && HP[p.type]) Object.assign(p, { hp: HP[p.type], maxHp: HP[p.type] });
    },
  },

  // Gravedad: tras cada turno, las piezas de quien acaba de mover caen una casilla hacia un costado
  // (el rey y los jefes se agarran); la que cae a un hueco se pierde. Cada seis rondas cambia de lado.
  gravity: {
    turn(m) {
      const st = (m.mech ||= { dir: 0 }), out = ev();
      const mover = m.players[(m.current + m.players.length - 1) % m.players.length].color;
      const round = m.turn / m.players.length;
      if (round && round % 6 === 0) {
        st.dir = 1 - st.dir;
        out.callout = { text: t('mech.gravity', '¡La gravedad cambia!'), sub: [t('mech.left', 'Hacia la izquierda'), t('mech.right', 'Hacia la derecha')][st.dir], icon: 'drop' };
      }
      const [dr, dc] = [[0, -1], [0, 1]][st.dir];
      const order = m.pieces.filter((p) => p.color === mover && small(p) && !p.royal).sort((a, b) => (b.row - a.row) * dr + (b.col - a.col) * dc);
      for (const p of order) {
        const r = p.row + dr, c = p.col + dc;
        if (r < 0 || c < 0 || r >= m.board.rows || c >= m.board.cols) continue;
        if (m.board.holes.has(key(r, c))) { kill(m, p, out); continue; }
        if (!free(m, r, c)) continue;
        out.moved.push({ piece: p, from: { row: p.row, col: p.col }, to: { row: r, col: c }, how: 'slide' });
        p.row = r; p.col = c;
      }
      // Un cartel sobre la primera pieza que resbala: que se entienda por qué se mueven solas.
      const first = out.moved[0];
      if (first) out.fx.push({ float: [first.to.row, first.to.col, t('mech.gravityPull', 'Gravedad {dir}', { dir: st.dir ? '→' : '←' })] });
      return has(out) || out.callout ? out : null;
    },
  },

  // Arena del caos: cada tres turnos, un evento al azar.
  events: {
    turn(m) {
      if (m.turn % 3) return null;
      const out = ev(), rest = m.pieces.filter((p) => small(p) && !p.royal && !p.chicken);
      const kind = rnd(['quake', 'bombs', 'swap', 'pit']);
      if (kind === 'quake') {
        for (const p of rest.sort(() => Math.random() - 0.5).slice(0, 3)) {
          const to = NEAR.map(([a, b]) => [p.row + a, p.col + b]).filter(([r, c]) => free(m, r, c));
          if (!to.length) continue;
          const [r, c] = rnd(to);
          out.moved.push({ piece: p, from: { row: p.row, col: p.col }, to: { row: r, col: c }, how: 'slide' });
          p.row = r; p.col = c;
        }
        out.fx.push({ shake: 16 });
        out.callout = { text: t('mech.quake', '¡Terremoto!'), sub: t('mech.quakeSub', 'Algunas piezas se tambalean'), icon: 'collapse' };
      } else if (kind === 'bombs') {
        const cells = [];
        for (let i = 0; i < 3; i++) cells.push([1 + Math.floor(Math.random() * (m.board.rows - 2)), Math.floor(Math.random() * m.board.cols)]);
        out.fx.push({ blast: cells });
        for (const [r, c] of cells) { const p = rest.find((q) => q.row === r && q.col === c); if (p) kill(m, p, out); }
        out.callout = { text: t('mech.bombs', '¡Bombardeo!'), sub: t('mech.bombsSub', 'Caen tres bombas al azar'), icon: 'bomb' };
      } else if (kind === 'swap') {
        const a = rnd(rest.filter((p) => p.color === 'light')), b = rnd(rest.filter((p) => p.color !== 'light'));
        if (a && b) {
          out.moved.push({ piece: a, from: { row: a.row, col: a.col }, to: { row: b.row, col: b.col }, how: 'warp' }, { piece: b, from: { row: b.row, col: b.col }, to: { row: a.row, col: a.col }, how: 'warp' });
          [a.row, a.col, b.row, b.col] = [b.row, b.col, a.row, a.col];
        }
        out.callout = { text: t('mech.swap', '¡Cambio de sitio!'), sub: t('mech.swapSub', 'Dos piezas rivales intercambian casillas'), icon: 'swap' };
      } else {
        const occ = buildOccupancy(m.pieces), cand = [];
        for (let r = 1; r < m.board.rows - 1; r++) for (let c = 0; c < m.board.cols; c++) if (walkable(m.board, r, c) && !occ.get(key(r, c))) cand.push([r, c]);
        const cells = cand.sort(() => Math.random() - 0.5).slice(0, 2);
        for (const [r, c] of cells) m.board.holes.add(key(r, c));
        out.sink = cells;
        out.callout = { text: t('mech.pit', '¡Socavón!'), sub: t('mech.pitSub', 'Se hunden dos casillas'), icon: 'collapse' };
      }
      return out;
    },
  },

  // Corona caliente: cada cinco turnos la corona salta a otra pieza del mismo bando, que pasa a ser el
  // rey (jaque y derrota) sin cambiar su forma de moverse. Se avisa un turno antes.
  potato: {
    turn(m) {
      const st = (m.mech ||= {}), out = ev(), phase = m.turn % 5;
      if (phase === 4) {
        st.heirs = {};
        for (const color of new Set(m.pieces.filter((p) => p.royal && !p.boss).map((p) => p.color))) {
          const heir = safeHeir(m, color);
          if (heir) { st.heirs[color] = heir.id; out.fx.push({ ring: [heir.row, heir.col], color: '#ffcf6b' }); }
        }
        out.log = t('mech.potatoWarn', 'La corona saltará el próximo turno (anillo dorado).');
      } else if (phase === 0 && st.heirs) {
        for (const [color, id] of Object.entries(st.heirs)) {
          // Si el heredero quedó a tiro, la corona busca otra pieza a salvo: no salta a una muerte segura.
          let heir = m.pieces.find((p) => p.id === id);
          const old = m.pieces.find((p) => p.royal && p.color === color && !p.boss);
          if (!heir || threatenedPieces(m.pieces, color, m.board).has(heir)) heir = safeHeir(m, color);
          if (!heir || !old) continue;
          old.royal = false; old.crowned = false; heir.royal = true; heir.crowned = true;
          out.art.push(old, heir);
          out.fx.push({ power: heir.id, color: '#ffcf6b' }, { sparkle: [heir.row, heir.col] });
        }
        st.heirs = null;
        out.callout = { text: t('mech.potato', '¡La corona salta!'), sub: t('mech.potatoSub', 'La pieza coronada es ahora el rey'), icon: 'crown' };
      }
      return has(out) || out.callout ? out : null;
    },
  },

  // Ajedrez invisible: la pieza que mueve desaparece de la vista; la que captura queda a la vista
  // hasta que vuelve a moverse. Las tuyas se ven en transparencia.
  invis: {
    after(m, p, from, res) { p.unseen = !res.victims.some((v) => v.killed); },
  },

  // Borracho: una jugada sin captura puede torcerse a una casilla vecina libre (15 %).
  drunk: {
    redirect(m, p, mv) {
      if (mv.hits.length || mv.castle || mv.ep || !small(p) || Math.random() >= 0.15) return null;
      const near = NEAR.map(([a, b]) => ({ row: mv.row + a, col: mv.col + b })).filter((x) => (x.row !== p.row || x.col !== p.col) && free(m, x.row, x.col));
      return near.length ? { ...rnd(near), hits: [], drunk: true } : null;
    },
    after(m, p, from, res) { if (res.drunk) res.mech = { ...ev(), fx: [{ float: [p.row, p.col, t('mech.hic', '¡Hip!')] }] }; },
  },

  // Gallinero: cada pieza capturada se vuelve una gallina (jade) que no se puede capturar, no la mueve
  // nadie, deambula cada ronda y estorba.
  chicken: {
    after(m, p, from, res) {
      const out = ev();
      for (const v of res.victims) {
        if (!v.killed || v.piece.royal || v.piece.boss || v.piece.chicken) continue;
        const spot = NEAR.map(([a, b]) => [v.piece.row + a, v.piece.col + b]).find(([r, c]) => free(m, r, c));
        if (!spot) continue;
        const hen = { id: 'hen' + ++chicks + '-' + Date.now().toString(36), type: 'pawn', color: 'wild', chicken: true, row: spot[0], col: spot[1], startRow: -1 };
        m.pieces.push(hen); out.spawned.push(hen);
      }
      if (out.spawned.length) { out.fx.push({ sfx: 'pop' }); res.mech = out; }
    },
    turn(m) {
      if (m.turn % m.players.length) return null;
      const out = ev();
      for (const h of m.pieces.filter((p) => p.chicken)) {
        const to = NEAR.map(([a, b]) => [h.row + a, h.col + b]).filter(([r, c]) => free(m, r, c));
        if (!to.length || Math.random() < 0.3) continue;
        const [r, c] = rnd(to);
        out.moved.push({ piece: h, from: { row: h.row, col: h.col }, to: { row: r, col: c }, how: 'hop' });
        h.row = r; h.col = c;
      }
      return has(out) ? out : null;
    },
  },

  // Balacera: tras moverse, la pieza dispara en la dirección en que se movió; la bala (alcance 3)
  // tumba a la primera pieza que encuentra, sea de quien sea (rey incluido).
  bullet: {
    after(m, p, from, res) {
      const hit = shot(m, p, from, p.row, p.col);
      const out = ev();
      out.fx.push({ beam: [[p.row, p.col], hit.end], color: '#ffcf6b' });
      if (hit.piece) {
        if (hit.piece.boss) { hit.piece.hp = (hit.piece.hp || 1) - 1; out.fx.push({ hurt: hit.piece.id }); if (hit.piece.hp <= 0) kill(m, hit.piece, out); }
        else kill(m, hit.piece, out);
      }
      res.mech = out;
    },
    bot(m, p, mv) {
      const hit = shot(m, p, { row: p.row, col: p.col }, mv.row, mv.col, mv.hits);
      if (!hit.piece) return 0;
      const v = hit.piece.royal ? 900 : PIECE_VALUE[hit.piece.type] || 20;
      return hit.piece.color === p.color ? -v : v;
    },
  },

  // Ajedrez al revés: capturar es obligatorio, el rey es una pieza más y gana quien se queda sin piezas
  // (o sin jugadas).
  anti: {
    setup(pieces) { for (const p of pieces) if (!p.boss) p.royal = false; },
    filter(m, p, moves) {
      const caps = moves.filter((x) => x.hits.length);
      if (caps.length) return caps;
      // ¿Tiene el bando alguna captura? Una vez por posición, que se pregunta pieza a pieza.
      const id = [m.turn, m.movesThisTurn, m.pieces.length, p.color].join();
      if (m.antiAt !== id) {
        const ctx = ctxOf(m.pieces, m.board);
        m.antiAt = id;
        m.antiCapture = m.pieces.some((q) => q.color === p.color && legalMoves(q, m.pieces, m.board, ctx).some((x) => x.hits.length));
      }
      return m.antiCapture ? [] : moves;
    },
    over(m) {
      const humans = m.players.filter((x) => x.kind === 'human').map((x) => x.color);
      const win = (color) => ({ victory: humans.includes(color), winner: color, winnerName: m.players.find((x) => x.color === color)?.name });
      for (const pl of m.players) if (!m.pieces.some((p) => p.color === pl.color)) return win(pl.color);
      if (!m.pieces.some((p) => p.color === m.player.color && m.legal(p).length)) return win(m.player.color);
      if (m.quietTurns >= 20 * m.players.length) {
        const n = (c) => m.pieces.filter((p) => p.color === c).length;
        const best = m.players.reduce((a, b) => (n(b.color) < n(a.color) ? b : a));
        return win(best.color);
      }
      return null;
    },
    bot(m, p, mv) {
      const lost = mv.hits.reduce((s, v) => s + (PIECE_VALUE[v.type] || 20), 0);
      const moved = { ...p, row: mv.row, col: mv.col }, virtual = m.pieces.filter((x) => x !== p && !mv.hits.includes(x)).concat([moved]);
      const ctx = ctxOf(virtual, m.board), exposed = virtual.some((e) => e.color !== p.color && canHit(e, moved, ctx));
      return -lost * 2 + (exposed ? 40 : 0);
    },
  },

  // Ejército al azar: las piezas de atrás cambian a tipos al azar, iguales para los dos bandos.
  randarmy: {
    setup(pieces, board, rng) {
      const POOL = ['rook', 'knight', 'bishop', 'queen', 'camel', 'cannon', 'guard', 'advisor', 'elephant'];
      for (const p of pieces.filter((x) => x.color === 'light' && !x.royal && x.type !== 'pawn')) {
        const type = POOL[Math.floor(rng() * POOL.length)];
        p.type = type;
        const twin = pieces.find((q) => q.color !== 'light' && q.row === board.rows - 1 - p.row && q.col === p.col && !q.royal && q.type !== 'pawn');
        if (twin) twin.type = type;
      }
    },
  },

  // Tablero gigante: 12×12, otra fila de peones y piezas raras (arzobispo: alfil + caballo;
  // canciller: torre + caballo; camello y cañón).
  giant: {
    size: 12,
    setup(pieces, board) {
      for (const color of ['light', 'dark']) {
        const mine = pieces.filter((p) => p.color === color), dir = color === 'light' ? -1 : 1;
        const pawns = mine.filter((p) => p.type === 'pawn');
        if (!pawns.length) continue;
        const front = color === 'light' ? Math.min(...pawns.map((p) => p.row)) + dir : Math.max(...pawns.map((p) => p.row)) + dir;
        const half = color === 'light' ? front > board.rows / 2 : front < board.rows / 2 - 1;
        if (half) for (let c = 0; c < board.cols; c++) if (walkable(board, front, c) && !pieces.some((p) => p.row === front && p.col === c)) pieces.push({ id: 'g' + color + c + '-' + Date.now().toString(36), type: 'pawn', color, row: front, col: c, startRow: front });
        const take = (type) => mine.find((p) => p.type === type && !p.extraMoveTypes && !p.royal);
        const b = take('bishop'), r = take('rook');
        if (b) b.extraMoveTypes = ['knight'];
        if (r) r.extraMoveTypes = ['knight'];
        const k = take('knight'); if (k) k.type = 'camel';
        const k2 = take('knight') || take('bishop'); if (k2) k2.type = 'cannon';
      }
    },
  },

  // Fiesta: todo el ejército (menos el rey) de un solo tipo.
  pqueen: { setup: (pieces) => retype(pieces, () => true, 'queen') },
  ppawn: { setup: (pieces) => retype(pieces, () => true, 'pawn', { canCrown: true }) },
  horse: { setup: (pieces) => retype(pieces, () => true, 'knight') },
};

// Pieza del bando que puede heredar la corona sin estar a tiro.
function safeHeir(m, color) {
  const hot = threatenedPieces(m.pieces, color, m.board);
  return rnd(m.pieces.filter((p) => p.color === color && !p.royal && !p.boss && !p.chicken && !hot.has(p)));
}

// La bala que sale de (r, c) en la dirección de la jugada: primera pieza que toca y dónde acaba.
function shot(m, p, from, r, c, gone = []) {
  const dr = Math.sign(r - from.row), dc = Math.sign(c - from.col);
  let rr = r + dr, cc = c + dc, end = [r, c];
  if (!dr && !dc) return { end };
  for (let n = 0; n < 3 && rr >= 0 && cc >= 0 && rr < m.board.rows && cc < m.board.cols; n++, rr += dr, cc += dc) {
    end = [rr, cc];
    if (m.board.holes.has(key(rr, cc))) continue;
    const o = m.pieces.find((q) => q !== p && !gone.includes(q) && cellsOf(q).some(([a, b]) => a === rr && b === cc));
    if (o) return { piece: o.chicken ? null : o, end };
  }
  return { end };
}

export const mechOf = (modifier) => MECHANICS[modifier];
