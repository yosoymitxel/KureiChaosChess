// Game screen: the "director" that wires Match (rules) to BoardView (3D) and the HUD.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { TurnBanner, CardFace } from '../components.js';
import { BoardView } from '../../view/board-view.js';
import { artOf } from '../../view/piece-art.js';
import { Match, botChooseMove } from '../../game/match.js';
import { generateBoard, placePieces } from '../../game/generate.js';
import { moveCells, cellsOf, key, anchorForCell, immune } from '../../game/rules.js';
import { CARDS, cardTargets, previewMoves, playCard } from '../../game/cards.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { MUTATIONS, countMutations } from '../../data/mutations.js';
import { PIECE_NAMES, MOVE_NAMES } from '../../data/pieces.js';
import { BOSSES } from '../../data/bosses.js';
import { PauseOverlay } from './overlays.js';
import { Moments } from '../moments.js';

const SIDE_NAME = { light: 'marfil', dark: 'carmesí', wild: 'jade' };

// One line on what a card does to this piece, counted from the preview.
function cardEffect(card, piece, pv) {
  const name = piece.name || PIECE_NAMES[piece.type];
  const gained = [...pv.cells].filter((k) => !pv.before.has(k)).length;
  const reach = gained ? ` · ${gained} casilla${gained > 1 ? 's' : ''} nueva${gained > 1 ? 's' : ''} (en azul)` : '';
  if (card.id === 'ascend') return `${name} → Reina${reach}`;
  if (card.id === 'mount') return `${name} aprende el salto en L${reach}`;
  if (card.id === 'colossus') return `${name} → Coloso 2×1: se mueve como rey y aguanta 2 golpes${reach}`;
  if (card.id === 'fortify') return `${name} aguantará 2 golpes: el primero rebota`;
  return `${name}: ${card.desc}`;
}

export function GameScreen({ node, run, seats, settings, setSettings, onExit, onAbandon, onWin, onRestart, onHowTo, onUseCard }) {
  const hostRef = useRef(null);
  const mainRef = useRef(null);
  const ref = useRef({}); // mutable director state: view, match, busy, selected
  const [hud, setHud] = useState(null);
  const [log, setLog] = useState([]);
  const [inspect, setInspect] = useState(null);
  const [banner, setBanner] = useState(null);
  const [paused, setPaused] = useState(false);
  const [end, setEnd] = useState(null);
  const [cardSel, setCardSel] = useState(null); // index in the hand while aiming a card
  const [cardTip, setCardTip] = useState(null); // what the aimed card would do to the previewed target
  const [placing, setPlacing] = useState(null); // fase previa de "Organizar": { left, total }
  const [zoom, setZoom] = useState(1); // pellizco sobre el tablero; por encima de 1 asoma el botón de encuadre
  const mod = MODIFIERS[node.modifier];
  ref.current.hand = run.cards || [];
  ref.current.onUseCard = onUseCard;
  const addLog = (m) => setLog((l) => [...l.slice(-30), m]);

  useEffect(() => {
    const d = ref.current;
    const board = generateBoard(node.seed, node.floor, run.map.floors, node.modifier);
    const pieces = placePieces(board, { playerCount: seats.length, isBoss: node.isBoss, elite: node.modifier === 'elite', seed: node.seed, mutations: run.mutations, bonuses: run.bonuses });
    const match = new Match({ board, pieces, players: seats, modifier: node.modifier, mutations: run.mutations, bonuses: run.bonuses });
    const humanTurn = () => match.player.kind === 'human' && !match.over && !d.busy && !d.paused;

    const refresh = () => {
      const p = match.player;
      d.view.setTurn(p.color);
      const threats = p.kind === 'human' ? match.threats() : new Set();
      if (p.kind === 'human' && match.inCheck(p.color)) threats.add(match.pieces.find((x) => x.royal && x.color === p.color));
      d.view.setThreats(threats);
      d.view.setGuards(match.pieces, (x) => immune(x, match.pieces));
      if (node.modifier === 'fog') {
        const viewer = p.kind === 'human' ? p.color : seats.find((s) => s.kind === 'human')?.color || 'light';
        d.view.setFog(match.pieces, viewer);
      }
      const boss = match.pieces.find((x) => x.boss);
      setHud({
        current: match.current, moves: match.movesThisTurn, movesFor: seats.map((s) => match.movesFor(s.color)),
        eliminated: { ...match.eliminated }, threats: p.kind === 'human' ? match.threats().size : 0,
        chaosIn: 3 - (match.turn % 3), boss: boss && { name: boss.name, hp: boss.hp, maxHp: boss.maxHp, id: boss.boss },
        counts: Object.fromEntries(seats.map((s) => [s.color, match.pieces.filter((x) => x.color === s.color).length])),
        canCard: p.kind === 'human' && !match.cardUsed && !match.over,
      });
    };

    // Tactic cards: pick from the hand, aim at a marked target (hover previews the result), play.
    const aim = () => {
      const card = CARDS[d.hand[d.cardSel]];
      const targets = cardTargets(match, card);
      const keys = new Set(card.target === 'piece' ? targets.flatMap((p) => cellsOf(p).map(([r, c]) => key(r, c))) : targets.map((t) => key(t.row, t.col)));
      return { card, targets, keys, pieces: card.target === 'piece' ? targets : [] };
    };
    const cancelCard = () => { d.cardSel = null; d.cardPick = null; setCardSel(null); setCardTip(null); d.view.clearMarks(); d.view.select(null); };
    d.pickCard = (i) => {
      if (!humanTurn() || match.cardUsed) return;
      if (CARDS[d.hand[i]]?.preMatch) { addLog('Organizar: se juega al empezar la partida'); return; }
      if (d.cardSel === i) return cancelCard();
      clearSel();
      d.cardSel = i; d.cardPick = null; setCardSel(i); setCardTip(null);
      const { card, keys, pieces } = aim();
      if (card.target === 'none') return playFromHand(null);
      if (!keys.size) { addLog(`${card.name}: no hay objetivos válidos ahora`); return cancelCard(); }
      d.view.showTargets(keys, pieces);
    };
    // Hover (mouse), keyboard cursor or first tap (touch) on a target: show what the card would do there.
    const onHover = (hit, touch = false) => {
      if (d.cardSel == null) return;
      const { card, targets, keys, pieces } = aim();
      const piece = hit && (hit.piece || match.pieceAt(hit.row, hit.col));
      const again = touch ? ' Toca otra vez para jugarla.' : '';
      if (card.target === 'piece' && targets.includes(piece)) {
        const pv = previewMoves(match, card, piece);
        d.view.showPreview(keys, pieces, pv);
        d.view.select(piece); // the previewed piece wears the solid selection ring
        setCardTip(cardEffect(card, piece, pv) + '.' + again);
      } else if (card.target === 'tile' && hit && keys.has(key(hit.row, hit.col))) {
        d.view.showPreview(keys, pieces, { footprint: [key(hit.row, hit.col)] });
        setCardTip((card.id === 'quake' ? 'Esta casilla se hundirá para siempre.' : 'Aquí entrará un peón nuevo.') + again);
      } else { d.view.showTargets(keys, pieces); d.view.select(null); setCardTip(null); }
    };
    const playFromHand = async (hit) => {
      const i = d.cardSel, id = d.hand[i], card = CARDS[id];
      const target = card.target === 'piece' ? { piece: hit?.piece || match.pieceAt(hit.row, hit.col) } : hit;
      const res = playCard(match, id, target);
      if (!res) return cancelCard();
      d.busy = true;
      cancelCard();
      await flyCard(i, res);
      d.onUseCard(i);
      addLog(`Carta: ${card.name}`);
      d.moments.callout({ text: `¡${card.name}!`, sub: card.desc, tone: 'brass', icon: card.icon, anim: 'stomp', tier: 'info' });
      await d.view.applyCard(res);
      d.busy = false;
      refresh();
      if (!match.canMove()) startTurn(false);
    };
    // The played card flies from the hand to its target and burns out there.
    const flyCard = async (i, res) => {
      const src = mainRef.current.querySelectorAll('.hand-card')[i];
      if (!src) return;
      const from = src.getBoundingClientRect();
      const at = res.piece ? d.view.centerOf(res.piece) : res.cell ? d.view.centerOf({ row: res.cell.row, col: res.cell.col }) : { x: d.view.fx.w / 2, y: d.view.fx.h / 2 };
      const host = hostRef.current.getBoundingClientRect();
      const ghost = src.cloneNode(true);
      Object.assign(ghost.style, { position: 'fixed', left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', margin: 0, zIndex: 60, pointerEvents: 'none' });
      document.body.appendChild(ghost);
      src.style.visibility = 'hidden';
      await motion(ghost, { x: [0, host.left + at.x - from.left - from.width / 2], y: [0, host.top + at.y - from.top - from.height / 2], rotate: [0, 360], scale: [1, 0.35], opacity: [1, 0.2] }, { duration: 0.55, ease: [0.7, 0, 0.3, 1] });
      ghost.remove();
      src.style.visibility = '';
    };

    const clearSel = () => { d.selected = null; d.view.select(null); d.view.clearMarks(); setInspect(null); };
    const show = (p, danger) => {
      const moves = match.legal(p);
      const caps = new Set();
      for (const m of moves) if (m.hits.length) for (const v of m.hits) for (const [r, c] of cellsOf(v)) caps.add(key(r, c));
      const cells = moveCells(p, moves);
      d.view.showMoves(cells, new Set([...cells].filter((k) => caps.has(k))), danger);
      return moves;
    };
    const select = (p) => {
      setInspect(null);
      d.selected = p; d.view.select(p);
      show(p, false);
    };
    const inspectPiece = (p) => {
      d.selected = null; d.view.select(null);
      const moves = show(p, true);
      const guarded = immune(p, match.pieces);
      const escort = p.escort && match.pieces.find((o) => o.id === p.escort);
      setInspect({
        type: p.type, side: p.color, name: p.name || PIECE_NAMES[p.type], color: SIDE_NAME[p.color], moves: moves.length,
        extra: (p.moves || p.extraMoveTypes || []).map((t) => ({ name: MOVE_NAMES[t] || t, mut: (p.mutationExtras || []).includes(t) })),
        boss: p.boss && BOSSES[p.boss].desc,
        guard: guarded && (p.trait === 'last' ? 'Solo cae cuando sea la última pieza de su bando.' : `Protegida: no cae mientras viva su escolta (${PIECE_NAMES[escort.type].toLowerCase()}).`),
      });
    };

    const finish = async () => {
      const r = match.over;
      const human = seats.find((s) => s.kind === 'human')?.color || 'light';
      await d.moments.whenIdle(); // the closing callout (fallen king) plays before the end screen
      if (r.victory) await d.view.victory(human);
      else if (!r.tie) await d.view.defeat(human);
      setEnd(r);
    };

    const doMove = async (piece, to) => {
      const res = match.move(piece, to);
      if (!res) return false;
      d.busy = true;
      clearSel();
      const tag = match.player.kind === 'bot' ? '◆ ' : '';
      const nm = piece.boss ? piece.name : PIECE_NAMES[piece.type];
      if (res.bounced) addLog(`${tag}${nm} golpea a ${res.victims[0].piece.name} (${res.victims[0].piece.hp} ${res.victims[0].piece.hp === 1 ? "vida" : "vidas"})`);
      else if (res.victims.length) addLog(`${tag}${nm} captura ${res.victims.map((v) => v.piece.boss ? v.piece.name : PIECE_NAMES[v.piece.type].toLowerCase()).join(', ')}`);
      else addLog(`${tag}${nm} mueve`);
      if (res.promoted) addLog(`${tag}¡Coronación!`);
      await d.view.playMove(res);
      const fallenBoss = res.victims.find((v) => v.killed && v.piece.boss)?.piece;
      if (fallenBoss) await d.moments.cinematic({ title: `¡${fallenBoss.name} derribado!`, sub: 'El coloso cae y la torre es tuya.', piece: { type: artOf(fallenBoss), side: fallenBoss.color }, tone: 'brass', anim: 'down' });
      const after = match.afterMove();
      if (after.collapse) {
        addLog('¡El borde se desploma!');
        d.moments.callout({ text: '¡Derrumbe!', sub: 'El borde cae al vacío', icon: 'collapse', tone: 'danger', anim: 'crumble', tier: 'major' });
        await d.view.collapse(after.collapse);
      }
      d.busy = false;
      if (match.over) return finish(), true;
      startTurn(after.ended);
      return true;
    };

    const startTurn = (newTurn = true) => {
      refresh();
      const p = match.player;
      if (!match.canMove()) {
        addLog(`${p.name} no puede moverse`);
        const a = match.afterMove({ pass: true });
        if (match.over) return finish();
        return setTimeout(() => startTurn(a.ended), 400);
      }
      if (p.kind === 'bot') {
        d.timer = setTimeout(function step() {
          if (d.paused) { d.timer = setTimeout(step, 300); return; }
          const mv = botChooseMove(match);
          if (mv) doMove(mv.piece, mv.target);
        }, 450 + Math.random() * 300);
      }
      const warned = announceChecks();
      if (p.kind === 'human' && newTurn && !warned) {
        // Let queued callouts (capture, collapse, jaque) finish before "Tu turno", so nothing overlaps.
        const text = seats.filter((s) => s.kind === 'human').length > 1 ? `Turno de ${p.name}` : 'Tu turno';
        d.moments.whenIdle().then(() => setBanner({ key: Date.now(), text, side: p.color }));
      }
    };

    // "Jaque" fires once when a royal becomes threatened; returns true if the current human was warned.
    const announceChecks = () => {
      let warnedMe = false;
      const anyHuman = seats.some((s) => s.kind === 'human');
      for (const s of seats) {
        const now = match.inCheck(s.color);
        if (now && !d.check[s.color] && anyHuman) {
          const royal = match.pieces.find((x) => x.royal && x.color === s.color);
          const mine = s.kind === 'human';
          d.moments.callout({
            text: '¡Jaque!', piece: { type: royal.type, side: s.color }, anim: 'tremble', tier: 'major',
            ...(mine
              ? { sub: s === match.player ? 'Tu turno: protege al rey' : `${s.name}, tu rey está amenazado`, tone: 'danger' }
              : { sub: `${royal.boss ? royal.name : 'El rey ' + SIDE_NAME[s.color]} está a tiro`, tone: 'brass' }),
          });
          if (mine && s === match.player) warnedMe = true;
        }
        d.check[s.color] = now;
      }
      d.view.host.classList.toggle('in-check', seats.some((s) => s.kind === 'human' && d.check[s.color]));
      return warnedMe;
    };

    // Callouts at the instant of impact, from the mover's point of view.
    const onImpact = (res) => {
      const mine = match.player.kind === 'human';
      const tone = mine ? 'brass' : 'danger';
      const killed = res.victims.filter((v) => v.killed).map((v) => v.piece);
      const art = (p) => ({ type: artOf(p), side: p.color });
      if (res.bounced) {
        const b = res.victims[0].piece;
        return d.moments.callout({ text: '¡Golpe!', sub: `A ${b.name || PIECE_NAMES[b.type]} le ${b.hp === 1 ? 'queda 1 vida' : `quedan ${b.hp} vidas`}`, tone, piece: art(b), anim: 'hit', tier: 'major' });
      }
      if (res.absorbed?.length) d.moments.callout({ text: '¡Aprende!', sub: `${res.piece.name} roba: ${res.absorbed.map((t) => MOVE_NAMES[t]).join(', ')}`, tone, piece: art(res.piece), anim: 'tremble' });
      if (killed.some((p) => p.boss)) return;
      const royal = killed.find((p) => p.royal);
      if (royal) return d.moments.callout({ text: '¡Rey caído!', sub: `Cae el bando ${SIDE_NAME[royal.color]}`, tone, piece: art(royal), anim: 'explode', tier: 'major' });
      if (killed.length > 1) d.moments.callout({ text: res.piece.boss ? `¡Aplastados ×${killed.length}!` : `¡Captura ×${killed.length}!`, tone, piece: art(res.piece), anim: 'stomp' });
      else {
        const big = killed.find((p) => p.type === 'queen' || p.type === 'rook');
        if (big) d.moments.callout({ text: `¡${PIECE_NAMES[big.type]} caída!`, tone, piece: art(big), anim: 'fall', tier: 'major' });
      }
      if (res.promoted) d.moments.callout({ text: '¡Coronación!', sub: 'El peón asciende a reina', tone: 'brass', piece: { type: 'pawn', side: res.piece.color }, pieceTo: { type: 'queen', side: res.piece.color }, anim: 'promote' });
    };

    // Tapping a terrain tile (ice, portal…) explains what it does.
    const terrainInfo = (r, c) => {
      const m = MODIFIERS[board.terrain?.get(key(r, c))];
      if (m) d.moments.callout({ text: m.name, sub: m.desc, icon: m.icon, tone: 'paper', tier: 'info' });
      return !!m;
    };
    // Organizar: fase previa a la partida. Cada intercambio gasta dos piezas del presupuesto.
    const mine = new Set(seats.filter((s) => s.kind === 'human').map((s) => s.color));
    const placeClear = () => { d.psel = null; d.view.select(null); d.view.clearMarks(); };
    const placeSwap = async (a, b) => {
      if (d.swapping || !a || !b || a === b || !mine.has(a.color) || !mine.has(b.color)) return;
      if (d.placing.left < 2) { addLog('Organizar: ya no quedan piezas por acomodar'); return placeClear(); }
      d.swapping = true;
      d.placing.left -= 2;
      setPlacing({ ...d.placing });
      placeClear();
      addLog(`Organizar: ${PIECE_NAMES[a.type].toLowerCase()} ↔ ${PIECE_NAMES[b.type].toLowerCase()}`);
      await d.view.swapPieces(a, b);
      d.swapping = false;
    };
    const placeTap = (hit) => {
      const piece = hit.piece || match.pieceAt(hit.row, hit.col);
      if (!piece || !mine.has(piece.color)) return placeClear();
      if (d.psel === piece) return placeClear();
      if (d.psel) return placeSwap(d.psel, piece);
      d.psel = piece;
      d.view.showSwaps(piece, match.pieces.filter((o) => o !== piece && mine.has(o.color)));
    };
    const beginPlacing = () => {
      if (d.hand.indexOf('organize') < 0 || !mine.size) { d.busy = false; return startTurn(); }
      // Tableros de 9 a 12 casillas por lado: dos piezas por cada fila extra sobre ocho.
      const total = 2 * Math.max(1, Math.min(4, Math.min(board.rows, board.cols) - 8));
      d.placing = { total, left: total };
      d.busy = true;
      addLog(`Organizar: intercambia hasta ${total} piezas y pulsa Comenzar`);
      d.moments.callout({ text: 'Organizar', sub: `Acomoda tu formación: hasta ${total} piezas`, icon: 'swap', tone: 'brass', tier: 'info' });
      setPlacing({ total, left: total });
    };
    d.endPlacing = () => {
      if (!d.placing) return;
      const used = d.placing.total - d.placing.left;
      const i = d.hand.indexOf('organize');
      if (used > 0 && i >= 0) { d.onUseCard(i); addLog('Carta: Organizar'); }
      d.placing = null;
      placeClear();
      setPlacing(null);
      d.busy = false;
      startTurn();
    };
    const onTap = (hit) => {
      if (d.placing) return placeTap(hit);
      if (!humanTurn()) return;
      if (d.cardSel != null) {
        const { card, keys } = aim();
        if (!keys.has(key(hit.row, hit.col))) return cancelCard();
        // Touch has no hover: the first tap on a target previews it, a second tap on it plays.
        const pick = card.target === 'piece' ? (hit.piece || match.pieceAt(hit.row, hit.col))?.id : key(hit.row, hit.col);
        if (hit.touch && d.cardPick !== pick) { d.cardPick = pick; return onHover(hit, true); }
        return playFromHand(hit);
      }
      const piece = hit.piece || match.pieceAt(hit.row, hit.col);
      const me = match.player.color;
      if (d.selected) {
        if (piece === d.selected) return clearSel();
        if (piece && piece.color === me) return select(piece);
        const moves = match.legal(d.selected);
        const anchor = anchorForCell(d.selected, hit.row, hit.col, moves);
        if (anchor) { doMove(d.selected, anchor); return; }
        terrainInfo(hit.row, hit.col);
        if (piece) return inspectPiece(piece);
        return clearSel();
      }
      if (!piece) { terrainInfo(hit.row, hit.col); return clearSel(); }
      if (piece.color === me) select(piece); else { terrainInfo(hit.row, hit.col); inspectPiece(piece); }
    };
    const onDrop = (piece, hit) => {
      if (d.placing) {
        const p = hit?.piece || (hit && match.pieceAt(hit.row, hit.col));
        if (p && p !== piece) placeSwap(piece, p);
        return;
      }
      if (!hit || !humanTurn()) return;
      const anchor = anchorForCell(piece, hit.row, hit.col, match.legal(piece));
      if (anchor) doMove(piece, anchor);
    };
    const canDrag = (p) => d.placing ? mine.has(p.color) && d.placing.left >= 2 : humanTurn() && d.cardSel == null && p.color === match.player.color;

    // Every way out of the board has its own gesture before the screen changes.
    d.leave = async (kind, then) => {
      if (d.leaving) return;
      d.leaving = true; d.busy = true;
      clearTimeout(d.timer);
      setPaused(false); setEnd(null);
      const human = seats.find((s) => s.kind === 'human')?.color || 'light';
      if (kind === 'resign') {
        const king = match.pieces.find((x) => x.royal && x.color === human);
        await Promise.all([
          d.view.outro('resign', human),
          d.moments.cinematic({ title: 'Te rindes', sub: 'El rey se tumba sobre el tablero. La run termina aquí.', piece: { type: king?.type || 'king', side: human }, anim: 'resign' }),
        ]);
      } else await d.view.outro(kind);
      then();
    };

    d.match = match;
    d.check = {};
    d.moments = new Moments(mainRef.current, { speed: settings.speed, enabled: settings.moments });
    d.view = new BoardView(hostRef.current, { camera: settings.camera, shake: settings.shake, speed: settings.speed, onTap, onDrop, canDrag, onImpact, onHover, onZoom: (z) => setZoom((v) => ((v > 1.01) === (z > 1.01) ? v : z)) });
    d.view.setBoard(board);
    d.view.setPieces(pieces);
    d.busy = true;
    addLog(`Piso ${node.floor + 1}/${run.map.floors} · ${board.rows}×${board.cols} · ${mod.name}`);
    const boss = pieces.find((p) => p.boss);
    const learned = pieces.filter((p) => p.color !== 'light' && p.extraMoveTypes?.length).length;
    // On a boss floor enemy officers borrow moves: the star badge marks them and the entrance says so.
    const bossSub = boss && `${BOSSES[boss.boss].desc}${learned ? ' Sus oficiales llevan la estrella: movimientos prestados.' : ''}`;
    if (boss) addLog(`Aparece ${boss.name}${learned ? ` · ${learned} oficial${learned > 1 ? 'es' : ''} con movimientos prestados` : ''}`);
    refresh();
    // The floor card plays over the board while it assembles; the boss gets its own entrance after landing.
    Promise.all([
      d.view.intro(pieces),
      !boss && d.moments.cinematic({ title: `Piso ${node.floor + 1}`, sub: `${mod.name}. ${mod.desc}`, icon: mod.icon, wave: seats.flatMap((s) => ['pawn', 'knight', 'king'].map((t) => [t, s.color])) }),
    ])
      .then(() => boss && d.moments.cinematic({ title: boss.name, sub: bossSub, piece: { type: artOf(boss), side: boss.color }, hp: { hp: boss.hp, max: boss.maxHp }, tone: 'danger', anim: 'stomp' }))
      .then(() => beginPlacing());
    const onKey = (e) => e.key === 'Escape' && setPaused((v) => !v);
    addEventListener('keydown', onKey);
    return () => { clearTimeout(d.timer); removeEventListener('keydown', onKey); d.view.destroy(); d.moments.destroy(); };
  }, []);

  useEffect(() => { ref.current.paused = paused; }, [paused]);
  useEffect(() => { ref.current.view?.setCamera(settings.camera); if (ref.current.view) { ref.current.view.shakeOn = settings.shake; ref.current.view.speed = settings.speed; } if (ref.current.moments) Object.assign(ref.current.moments, { speed: settings.speed, enabled: settings.moments }); }, [settings]);

  const muts = Object.entries(countMutations(run.mutations || []));
  const hand = run.cards || [];
  const leave = (kind, then) => ref.current.leave(kind, then);
  return html`<div class="screen game">
    <div class="game-main" ref=${mainRef}>
      <div class="game-top">
        <button class="btn ghost sm icon-only" aria-label="Pausa" title="Pausa (Escape)" onClick=${() => setPaused(true)}><${Icon} name="pause" /></button>
        <h1 class="title">${node.isBoss ? 'Piso final' : `Piso ${node.floor + 1} de ${run.map.floors}`}</h1>
      </div>
      <div class="board-host" ref=${hostRef}></div>
      ${placing && html`<div class="place-bar" role="group" aria-label="Fase Organizar">
        <div>
          <strong>Organizar</strong>
          <small>${placing.left > 0 ? `Quedan ${placing.left} piezas por acomodar.` : 'Ya acomodaste tus piezas.'} Toca o arrastra una pieza tuya sobre otra para intercambiarlas.</small>
        </div>
        <button class="btn primary sm" autofocus onClick=${() => ref.current.endPlacing()}>Comenzar</button>
      </div>`}
      ${zoom > 1.01 && html`<button class="zoom-reset" aria-label="Quitar el zoom" title="Quitar el zoom" onClick=${() => ref.current.view?.resetZoom()}><${Icon} name="shrink" size=${18} /></button>`}
      ${banner && html`<${TurnBanner} key=${banner.key} text=${banner.text} side=${banner.side} />`}
      ${hand.length > 0 && html`<div class=${'hand' + (hud?.canCard ? '' : ' spent')} role="group" aria-label="Mano de cartas tácticas">
        ${hand.map((id, i) => html`<button key=${id + i} class=${'hand-card' + (cardSel === i ? ' on' : '')} style=${{ '--rot': (i - (hand.length - 1) / 2) * 7 + 'deg', '--drop': Math.abs(i - (hand.length - 1) / 2) * 7 + 'px' }}
            disabled=${!hud?.canCard || !!placing} aria-pressed=${cardSel === i} title=${CARDS[id].desc} onClick=${() => ref.current.pickCard(i)}>
          <${CardFace} card=${{ ...CARDS[id], kind: 'tactic' }} mini />
        </button>`)}
        <p class=${'hand-hint' + (cardTip ? ' tip' : '')} aria-live="polite">${placing ? 'Organizar: acomoda tus piezas y pulsa Comenzar' : cardSel != null ? cardTip || CARDS[hand[cardSel]]?.aim || '' : hud?.canCard ? 'Una carta por turno' : 'Ya jugaste carta este turno'}</p>
      </div>`}
    </div>
    <aside class="hud panel">
      ${hud?.boss && html`<section class="boss-bar" aria-label="Jefe">
        <div class="boss-row"><strong>${hud.boss.name}</strong>
          <span class="hp">${Array.from({ length: hud.boss.maxHp }, (_, i) => html`<b class=${i < hud.boss.hp ? 'on' : ''}></b>`)}</span></div>
      </section>`}
      <section class="mod-card">
        <span class="mod-icon"><${Icon} name=${mod.icon} size=${22} /></span>
        <div><h2>${mod.name}</h2><p>${mod.desc}</p></div>
      </section>
      <section class="seats">
        ${seats.map((s, i) => {
          const cur = hud?.current === i && !hud?.eliminated[s.color];
          const n = hud?.movesFor[i] || 1;
          return html`<div class=${'seat' + (cur ? ' cur' : '') + (hud?.eliminated[s.color] ? ' out' : '')}>
            <span class=${'token side-' + s.color}></span>
            <span class="nm">${s.name}</span>
            ${cur && n > 1 && html`<span class="pips">${Array.from({ length: n }, (_, k) => html`<i class=${k < hud.moves ? 'used' : ''}></i>`)}</span>`}
            <span class="cnt">${hud?.counts[s.color] ?? ''}</span>
            <${Icon} name=${s.kind} size=${15} />
          </div>`;
        })}
      </section>
      <div class="chips">
        ${hud?.threats > 0 && html`<span class="chip danger"><${Icon} name="warn" size=${12} /> ${hud.threats} en peligro</span>`}
        ${node.modifier === 'chaos' && hud && html`<span class="chip"><${Icon} name="collapse" size=${12} /> derrumbe en ${hud.chaosIn}</span>`}
        ${muts.map(([id, n]) => html`<span class="chip mut" title=${MUTATIONS[id]?.desc}>${MUTATIONS[id]?.name}${n > 1 ? ' ×' + n : ''}</span>`)}
      </div>
      ${inspect && html`<section class="inspector">
        <${PieceIcon} type=${inspect.type} side=${inspect.side} size=${44} />
        <div>
          <strong>${inspect.name} <small>${inspect.color}</small></strong>
          <p>${inspect.boss || `Alcanza ${inspect.moves} casilla${inspect.moves === 1 ? '' : 's'}`}</p>
          ${inspect.guard && html`<p class="guard-note"><${Icon} name="lock" size=${13} /> ${inspect.guard}</p>`}
          <div class="tags">${inspect.extra.map((t) => html`<span class=${'tag' + (t.mut ? ' mut' : '')}>${t.name}</span>`)}</div>
        </div>
      </section>`}
      <ol class="log" aria-live="polite" aria-label="Registro de jugadas">${log.slice(-6).map((l, i) => html`<li key=${log.length - 6 + i}>${l}</li>`)}</ol>
    </aside>
    ${paused && !end && html`<${PauseOverlay} settings=${settings} setSettings=${setSettings}
      onResume=${() => setPaused(false)} onRestart=${() => leave('reset', onRestart)} onExit=${() => leave('exit', onExit)} onAbandon=${() => leave('resign', onAbandon)}
      onHowTo=${() => { setPaused(false); onHowTo(); }} />`}
    ${end && html`<${EndOverlay} state=${end} isFinal=${node.isBoss} onContinue=${() => leave('exit', onWin)} onRetry=${() => leave('reset', onRestart)} onMap=${() => leave('exit', onExit)} />`}
  </div>`;
}

function EndOverlay({ state, isFinal, onContinue, onRetry, onMap }) {
  const ref = useRef(null);
  useEffect(() => {
    motion(ref.current, { scale: [0.85, 1], rotate: [-6, -2], opacity: [0, 1] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
  }, []);
  const kind = state.tie ? 'tie' : state.victory ? 'win' : 'loss';
  const title = state.tie ? 'Tablas' : state.victory ? (isFinal ? 'Run completada' : 'Victoria') : 'Derrota';
  const msg = state.tie ? 'Partida bloqueada: empate a piezas.'
    : state.victory ? (isFinal ? 'Has conquistado la torre entera.' : 'El tablero es tuyo.')
    : `Tu rey ha caído.${state.winnerName ? ' Gana ' + state.winnerName + '.' : ''}`;
  return html`<div class="overlay">
    <div class=${'end-card panel ' + kind} ref=${ref}>
      <div class="stamp"><${Icon} name=${state.tie ? 'flag' : state.victory ? 'trophy' : 'skull'} size=${34} /></div>
      <h1>${title}</h1>
      <p>${msg}</p>
      <div class="end-actions">
        ${state.victory && html`<button class="btn primary" autofocus onClick=${onContinue}>${isFinal ? 'Nueva run' : 'Reclamar recompensa'}</button>`}
        <button class="btn" onClick=${onRetry}><${Icon} name="refresh" size=${16} />Reintentar</button>
        ${!state.victory && html`<button class="btn ghost-ink" onClick=${onMap}><${Icon} name="map" size=${16} />Volver al mapa</button>`}
      </div>
    </div>
  </div>`;
}
