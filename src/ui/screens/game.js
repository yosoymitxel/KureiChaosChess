// Game screen: the "director" that wires Match (rules) to BoardView (3D) and the HUD.
import { html, render, useState, useEffect, useRef, motion, motionStagger } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { TurnBanner, CardFace, MiniEnd } from '../components.js';
import { BoardView } from '../../view/board-view.js';
import { artOf } from '../../view/piece-art.js';
import { Match, botChooseMove } from '../../game/match.js';
import { rivalForFloor } from '../../game/difficulty.js';
import { generateBoard, placePieces, eliteVariants } from '../../game/generate.js';
import { moveCells, cellsOf, key, anchorForCell, immune, walkable } from '../../game/rules.js';
import { playDemo, mutationDemo, bossDemo } from '../demos.js';
import { CARDS, cardTargets, previewMoves, playCard } from '../../game/cards.js';
import { MODIFIERS, nodeModifier } from '../../data/modifiers.js';
import { MUTATIONS, countMutations } from '../../data/mutations.js';
import { takeNewDemos, loadBosses } from '../../game/run.js';
import { PIECE_NAMES, MOVE_NAMES } from '../../data/pieces.js';
import { BOSSES } from '../../data/bosses.js';
import { PauseOverlay } from './overlays.js';
import { Moments } from '../moments.js';
import { playSfx } from '../sfx.js';
import { award, seePieces, seeMutations } from '../../game/achievements.js';
import { PICKUPS, dropPickups } from '../../data/pickups.js';
import { PICKUP_ART } from '../zen-art.js';
import { isShopCard, addCoins } from '../../game/shop.js';
import { addZenSeeds, pickSeed, ZEN_NAMES } from '../../game/zen.js';

const SIDE_NAME = { light: 'marfil', dark: 'carmesí', wild: 'jade' };

// Nombre visible: el propio (jefes, colosos) o el de su tipo. Las piezas fortificadas no llevan name.
const pieceName = (p) => p.name || PIECE_NAMES[p.disguise && !p.unmasked ? p.disguise : p.type] || p.type;
// Consejos del panel: rotan por turno cuando no hay nada más urgente que decir.
const TIPS = [
  'Toca una pieza enemiga para ver su alcance en rojo.',
  'Pellizca el tablero para ampliarlo y arrástralo para moverte.',
  'Valen el enroque y la captura al paso.',
  'Si la partida se estanca, gana quien tenga más piezas.',
  'Toca un chip del panel para saber qué hace.',
];

// One line on what a card does to this piece, counted from the preview.
function cardEffect(card, piece, pv) {
  const name = pieceName(piece);
  const gained = [...pv.cells].filter((k) => !pv.before.has(k)).length;
  const reach = gained ? ` · ${gained} casilla${gained > 1 ? 's' : ''} nueva${gained > 1 ? 's' : ''} (en azul)` : '';
  if (card.id === 'ascend') return `${name} → Reina${reach}`;
  if (card.id === 'mount') return `${name} aprende el salto en L${reach}`;
  if (card.id === 'colossus') return `${name} → Coloso 2×1: se mueve como rey y aguanta 3 golpes${reach}`;
  if (card.id === 'fortify') return `${name} aguantará 2 golpes: el primero rebota`;
  return `${name}: ${card.desc}`;
}

// `scenario` (un minijuego de src/data/scenarios.js ya armado): trae tablero, piezas, rival y objetivo
// propios; el resto (vista, bot, avisos, demos) es el de cualquier piso.
// `onRound(result)` (partida local): cuenta la ronda y devuelve la nota de la ficha final.
export function GameScreen({ node, run, seats, settings, setSettings, onExit, onMenu, onAbandon, onWin, onRestart, onHowTo, onUseCard, scenario, tools, exitLabel, onRound }) {
  const hostRef = useRef(null);
  const mainRef = useRef(null);
  const ref = useRef({}); // mutable director state: view, match, busy, selected
  const [hud, setHud] = useState(null);
  const [log, setLog] = useState([]);
  const [inspect, setInspect] = useState(null);
  const [chipInfo, setChipInfo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [paused, setPaused] = useState(false);
  const [end, setEnd] = useState(null);
  const [cardSel, setCardSel] = useState(null); // index in the hand while aiming a card
  const [cardTip, setCardTip] = useState(null); // what the aimed card would do to the previewed target
  const [placing, setPlacing] = useState(null); // fase previa de "Organizar": { left, total }
  const [zoom, setZoom] = useState(1); // pellizco sobre el tablero; por encima de 1 asoma el botón de encuadre
  const mod = scenario || nodeModifier(node);
  ref.current.hand = run.cards || [];
  ref.current.onUseCard = onUseCard;
  const addLog = (m) => setLog((l) => [...l.slice(-30), m]);

  useEffect(() => {
    const d = ref.current;
    const board = scenario?.board || generateBoard(node.seed, node.floor, run.map.floors, node.modifier, node.board);
    const pieces = scenario?.pieces || placePieces(board, { modifier: node.modifier, playerCount: seats.length, isBoss: node.isBoss, isMiniBoss: node.isMiniBoss, elite: node.modifier === 'elite', seed: node.seed, mutations: run.mutations, bonuses: run.bonuses, floor: node.floor, totalFloors: run.map.floors });
    // El rival lo manda el tramo de la torre (difficulty.js); el ajuste de dificultad corre la
    // escalera y el mini-jefe sube un peldaño.
    const rival = scenario?.rival || rivalForFloor(node.floor, run.map.floors, { up: node.isMiniBoss ? 1 : 0, difficulty: run.tutorial ? 'facil' : settings.difficulty });
    const match = new Match({ board, pieces, players: seats, modifier: node.modifier, mutations: run.mutations, bonuses: run.bonuses, rival, objective: scenario?.objective, bonus: scenario?.bonus, tick: scenario?.tick });
    // Foto del bando humano al repartir: decide los logros de fin de partida.
    const human = seats.find((s) => s.kind === 'human')?.color || 'light';
    d.feats = { human, mine: new Set(pieces.filter((p) => p.color === human)), cards: 0, hadCards: d.hand.length > 0 };
    // Las piezas del reparto: el panel muestra como capturas las que ya no están en el tablero.
    d.dealt = pieces.filter((p) => !p.boss);
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
      if (scenario?.labels) d.view.setLabels(scenario.labels(match));
      const boss = match.pieces.find((x) => x.boss);
      setHud({
        goal: scenario?.status(match),
        current: match.current, moves: match.movesThisTurn, movesFor: seats.map((s) => match.movesFor(s.color)),
        eliminated: { ...match.eliminated }, threats: p.kind === 'human' ? match.threats().size : 0,
        chaosIn: 3 - (match.turn % 3), boss: boss && { name: boss.name, hp: boss.hp, maxHp: boss.maxHp, id: boss.boss },
        counts: Object.fromEntries(seats.map((s) => [s.color, match.pieces.filter((x) => x.color === s.color).length])),
        canCard: p.kind === 'human' && !match.cardUsed && !match.over,
        captured: Object.fromEntries(seats.map((s) => [s.color, d.dealt.filter((x) => x.color === s.color && !match.pieces.includes(x)).map((x) => x.type)])),
        turn: match.turn,
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
      // Con ratón y sin carta en la mano, pasar por encima de una casilla especial ya la explica.
      if (d.cardSel == null) { if (!touch && hit && !(hit.piece || match.pieceAt(hit.row, hit.col)) && !terrainInfo(hit.row, hit.col)) d.view.hideTip(); return; }
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
      playSfx('card');
      d.feats.cards++;
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
    // Detalle de una pieza para el panel: separa lo que añadieron las mutaciones, las cartas o un
    // jefe de lo básico del tipo, que era lo que quedaba confuso al caer dos mejoras en la misma.
    const detailOf = (p, count, threat) => {
      const guarded = immune(p, match.pieces);
      const escort = p.escort && match.pieces.find((o) => o.id === p.escort);
      const mut = [];
      const cards = [];
      const lent = [];
      for (const t of p.extraMoveTypes || []) {
        if (p.mutationFrom?.[t]) mut.push(p.mutationFrom[t]);
        else if (p.lent) lent.push(MOVE_NAMES[t] || t);
        else cards.push('mount');
      }
      if (p.canCrown) mut.push('crown');
      if (p.cannonHops) mut.push('cannonRange');
      if (p.colossus) cards.push('colossus');
      else if ((p.maxHp || 1) > 1 && !p.boss) cards.push('fortify');
      if (p.ascended) cards.push('ascend');
      return {
        type: p.type, side: p.color, name: pieceName(p), color: SIDE_NAME[p.color], moves: count, threat,
        boss: p.boss && BOSSES[p.boss].desc,
        guard: guarded && (p.trait === 'last' ? 'Solo cae cuando sea la última pieza de su bando.' : `Protegida: no cae mientras viva su escolta (${(escort ? pieceName(escort) : 'pieza').toLowerCase()}).`),
        mut: [...new Set(mut)],
        cards: [...new Set(cards)],
        copied: p.moves && !p.colossus ? p.moves.map((t) => MOVE_NAMES[t] || t) : [],
        lent,
      };
    };
    const select = (p) => {
      d.selected = p; d.view.select(p);
      setInspect(detailOf(p, show(p, false).length, false));
    };
    const inspectPiece = (p) => {
      d.selected = null; d.view.select(null);
      if (d.view.fogged(p)) return d.view.tileTip(p.row, p.col, 'Algo se mueve', 'La niebla no deja ver qué pieza es. Acércate para descubrirla.');
      if (p.disguise && !p.unmasked) return d.view.tileTip(p.row, p.col, 'Sospechoso', 'Parece un rey. Si se mueve más de una casilla, el disfraz cae.');
      setInspect(detailOf(p, show(p, true).length, true));
    };

    const finish = async () => {
      const r = match.over;
      if (onRound) r.note = onRound(r);
      if (!scenario) { if (r.victory) playSfx('win'); else if (!r.tie) playSfx('lose'); }
      const human = seats.find((s) => s.kind === 'human')?.color || 'light';
      if (r.victory && !scenario) {
        // La pérdida se lee por identidad: toda pieza caída sale de match.pieces.
        const lost = [...d.feats.mine].filter((p) => !match.pieces.includes(p));
        if (!lost.length) { award('flawless'); if (node.modifier === 'elite') award('elite_flawless'); }
        else if (lost.some((p) => p.type === 'queen')) award('queen_win');
        if (d.feats.cards === 0 && d.feats.hadCards) award('no_cards');
        if (node.modifier === 'fog') award('fog_win');
        if (node.modifier === 'elite') award('elite_slain');
        if (node.isMiniBoss) award('mini_boss_slain');
      }
      await d.moments.whenIdle(); // the closing callout (fallen king) plays before the end screen
      if (r.victory) await d.view.victory(human);
      else if (!r.tie) await d.view.defeat(human);
      setEnd(r);
    };

    const doMove = async (piece, to) => {
      const human = match.player.kind === 'human';
      const res = match.move(piece, to);
      if (!res) return false;
      if (human) d.moments.dropWaiting();
      d.busy = true;
      clearSel();
      const tag = match.player.kind === 'bot' ? '◆ ' : '';
      const nm = pieceName(piece);
      if (res.bounced) addLog(`${tag}${nm} golpea a ${pieceName(res.victims[0].piece)} (${res.victims[0].piece.hp} ${res.victims[0].piece.hp === 1 ? "vida" : "vidas"})`);
      else if (res.enPassant) addLog(`${tag}${nm} captura al paso`);
      else if (res.victims.length) addLog(`${tag}${nm} captura ${res.victims.map((v) => (v.piece.boss ? v.piece.name : pieceName(v.piece).toLowerCase())).join(', ')}`);
      else if (res.castle) addLog(`${tag}Enroque`);
      else addLog(`${tag}${nm} mueve`);
      if (res.zombie) addLog(`${tag}${pieceName(res.zombie)} se levanta como zombi`);
      if (res.infected?.length) addLog(`${tag}Contagio: ${res.infected.map((p) => pieceName(p).toLowerCase()).join(', ')} cambian de bando`);
      if (res.promoted) {
        addLog(`${tag}¡Coronación!`);
        if (piece.color === d.feats.human) award('crowned');
      }
      await d.view.playMove(res);
      pickUp(piece);
      if (res.woke?.length) {
        const w = res.woke[0];
        addLog(`${tag}¡La bruja despierta!`);
        playSfx('stomp');
        d.view.shake(10, 420);
        d.moments.callout({ text: '¡La bruja despierta!', sub: 'La miraste: ahora va a por ti', piece: { type: artOf(w), side: w.color }, tone: 'danger', anim: 'tremble', tier: 'major' });
      }
      const fallenBoss = res.victims.find((v) => v.killed && v.piece.boss)?.piece;
      if (fallenBoss) {
        playSfx('shatter');
        await d.moments.cinematic({ title: `¡${fallenBoss.name} derribado!`, sub: 'El coloso cae y la torre es tuya.', piece: { type: artOf(fallenBoss), side: fallenBoss.color }, tone: 'brass', anim: 'down' });
      }
      const after = match.afterMove();
      if (after.collapse) {
        addLog('¡El borde se desploma!');
        playSfx('shatter');
        d.moments.callout({ text: '¡Derrumbe!', sub: 'El borde cae al vacío', icon: 'collapse', tone: 'danger', anim: 'crumble', tier: 'major' });
        await d.view.collapse(after.collapse);
      }
      await showTick(after.tick);
      d.busy = false;
      if (match.over) return finish(), true;
      startTurn(after.ended);
      return true;
    };

    // Lo que un minijuego hizo al cambiar de turno (match.tick): piezas que llegan, casillas que se hunden.
    const showTick = async (tick) => {
      if (!tick) return;
      const { spawned = [], sunk = [], fallen = [] } = tick;
      await Promise.all([...spawned.map((p) => d.view.dropIn(p)), ...fallen.map((p) => d.view.kill(p, p, p)), sunk.length && d.view.collapse(sunk)]);
    };

    // Coleccionables: caen una vez por piso, después del primer «Tu turno», para no frenar la entrada.
    const dropProps = () => {
      if (d.props || scenario || node.versus) return;
      d.props = new Map();
      for (const { id, row, col } of dropPickups(board, match.pieces)) {
        const el = d.view.addProp(row, col, id), it = PICKUPS[id];
        render(PICKUP_ART[id] || html`<${Icon} name=${id} size=${24} />`, el);
        if (it.hand) {
          el.classList.add('hand');
          el.setAttribute('role', 'button'); el.setAttribute('aria-label', `${it.name}: tócala para quitarla`);
          el.addEventListener('take', () => { if (d.props.delete(key(row, col))) take(it, el, true); });
        }
        d.props.set(key(row, col), { id, el, hand: it.hand });
      }
    };
    const pickUp = (piece) => {
      if (!d.props?.size) return;
      for (const [k, prop] of d.props) {
        const onIt = piece.row + ',' + piece.col === k && !prop.hand, sunk = board.holes.has(k);
        if (!onIt && !sunk) continue;
        d.props.delete(k);
        const mine = onIt && piece.color === human, it = PICKUPS[prop.id];
        if (!mine) { d.view.takeProp(prop.el, false); if (onIt) addLog(`${pieceName(piece)} rival se lleva: ${it.name.toLowerCase()}`); continue; }
        take(it, prop.el);
      }
    };
    const take = (it, el, hand) => {
      d.view.takeProp(el, true, hand);
      playSfx(hand ? 'leaf' : 'coin');
      if (it.coins) { addCoins(it.coins); addLog(`${it.name}: +${it.coins} moneda${it.coins > 1 ? 's' : ''}`); }
      if (it.seed) { const kind = pickSeed(); addZenSeeds(kind, it.seed); addLog(`Semilla de ${ZEN_NAMES[kind].toLowerCase()} para el jardín`); }
    };

    const startTurn = (newTurn = true) => {
      refresh();
      const p = match.player;
      if (!match.canMove()) {
        addLog(`${p.name} no puede moverse`);
        const a = match.afterMove({ pass: true });
        return showTick(a.tick).then(() => (match.over ? finish() : setTimeout(() => startTurn(a.ended), 400)));
      }
      if (p.kind === 'bot') {
        // The bot waits for the labels on screen: its move used to land under a collapse or a capture.
        // It checks again right before moving, since the "Jaque" of this same turn queues after this.
        d.moments.whenIdle().then(() => {
          if (d.leaving || d.dead || match.over) return;
          d.timer = setTimeout(function step() {
            if (d.paused || d.moments.playing) { d.timer = setTimeout(step, 300); return; }
            const mv = scenario?.bot?.(match) || botChooseMove(match);
            if (mv) doMove(mv.piece, mv.target);
          }, 450 + Math.random() * 300);
        });
      }
      const warned = announceChecks();
      if (p.kind === 'human' && newTurn && !warned && seats.length > 1) {
        // Let queued callouts (capture, collapse, jaque) finish before "Tu turno", so nothing overlaps.
        const text = seats.filter((s) => s.kind === 'human').length > 1 ? `Turno de ${p.name}` : 'Tu turno';
        d.moments.whenIdle().then(() => { setBanner({ key: Date.now(), text, side: p.color }); setTimeout(() => !d.dead && dropProps(), 900); });
      }
    };

    // "Jaque" fires once when a royal becomes threatened; returns true if the current human was warned.
    const announceChecks = () => {
      let warnedMe = false;
      const anyHuman = seats.some((s) => s.kind === 'human');
      for (const s of seats) {
        // El rey impostor no se delata con un aviso de jaque.
        const now = match.inCheck(s.color) && !(scenario?.hideRoyal && s.kind !== 'human');
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
      if (royal) return d.moments.callout({ text: royal.type === 'king' ? '¡Rey caído!' : `¡${pieceName(royal)} cae!`, sub: `Cae el bando ${SIDE_NAME[royal.color]}`, tone, piece: art(royal), anim: 'explode', tier: 'major' });
      if (killed.length > 1) d.moments.callout({ text: res.piece.boss ? `¡Aplastados ×${killed.length}!` : `¡Captura ×${killed.length}!`, tone, piece: art(res.piece), anim: 'stomp' });
      else {
        const big = killed.find((p) => p.type === 'queen' || p.type === 'rook');
        if (big) d.moments.callout({ text: `¡${PIECE_NAMES[big.type]} caída!`, tone, piece: art(big), anim: 'fall', tier: 'major' });
      }
      if (res.promoted) d.moments.callout({ text: '¡Coronación!', sub: 'El peón asciende a reina', tone: 'brass', piece: { type: 'pawn', side: res.piece.color }, pieceTo: { type: 'queen', side: res.piece.color }, anim: 'promote' });
    };

    // Qué hace una casilla: etiqueta al momento junto a ella, no un rótulo en cola.
    const terrainInfo = (r, c) => {
      const k = key(r, c), t = board.terrain?.get(k);
      const edge = node.modifier === 'chaos' && [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dr, dc]) => !walkable(board, r + dr, c + dc));
      if (t === 'ice') d.view.tileTip(r, c, 'Hielo', 'La pieza que acaba aquí resbala una casilla más en su dirección.');
      else if (t === 'portal') d.view.tileTip(r, c, 'Portal', 'La pieza que acaba aquí sale por el portal gemelo, que ahora brilla.', board.portals.get(k));
      else if (edge) d.view.tileTip(r, c, 'Borde inestable', `Las casillas del borde se desploman cada 3 turnos; faltan ${3 - (match.turn % 3)}.`);
      else return false;
      return true;
    };
    // Organizar: fase previa a la partida. Cada intercambio gasta dos piezas del presupuesto.
    const mine = new Set(seats.filter((s) => s.kind === 'human').map((s) => s.color));
    const placeClear = () => { d.psel = null; d.view.select(null); d.view.clearMarks(); };
    const placeSwap = async (a, b) => {
      if (d.swapping || !a || !b || a === b || !mine.has(a.color) || !mine.has(b.color)) return;
      if (d.placing.left < 1) { addLog('Organizar: ya no quedan intercambios'); return placeClear(); }
      d.swapping = true;
      d.placing.left -= 1;
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
    // Antes de jugar: cada mutación nueva de la run enseña cómo mueve (una vez) y un jefe aún no
    // derrotado enseña su patrón. Todo se salta con un toque.
    const playDemos = async (boss) => {
      const human = seats.find((s) => s.kind === 'human')?.color || 'light';
      seeMutations(run.mutations || []);
      for (const id of takeNewDemos(run)) await playDemo(d.moments, mutationDemo(id, human));
      if (boss && !loadBosses().includes(boss.boss)) await playDemo(d.moments, bossDemo(boss.boss, boss.color));
    };
    // Cara o cruz (ajuste de la mesa): cara empieza el primer asiento; cruz, el siguiente.
    const tossCoin = () => {
      if (!settings.coin || scenario || seats.length < 2) return;
      const heads = Math.random() < 0.5, starter = seats[heads ? 0 : 1];
      match.current = heads ? 0 : 1;
      addLog(`${heads ? 'Cara' : 'Cruz'}: empieza ${starter.name}`);
      playSfx('select');
      return d.moments.coin({ heads, title: heads ? 'Cara' : 'Cruz', sub: starter.name === 'Tú' ? 'Empiezas tú' : `Empieza ${starter.name}` });
    };
    const beginPlacing = () => {
      if (d.hand.indexOf('organize') < 0 || !mine.size) { d.busy = false; return startTurn(); }
      // La carta se juega sola al empezar y sale de la mano: 2, 4, 6 u 8 intercambios según el tablero (8×8 a 11×11+).
      const total = 2 * Math.max(1, Math.min(4, Math.min(board.rows, board.cols) - 7));
      d.feats.cards++;
      d.onUseCard(d.hand.indexOf('organize'));
      award('organize');
      d.placing = { total, left: total };
      d.busy = true;
      addLog(`Carta Organizar: hasta ${total} intercambios antes de empezar`);
      d.moments.callout({ text: 'Organizar', sub: `Antes de empezar: intercambia hasta ${total} parejas de piezas tuyas`, icon: 'swap', tone: 'brass', tier: 'info' });
      setPlacing({ total, left: total });
    };
    d.endPlacing = () => {
      if (!d.placing) return;
      d.placing = null;
      placeClear();
      setPlacing(null);
      d.busy = false;
      startTurn();
    };
    const onTap = (hit) => {
      // Una hoja en la casilla tocada se quita con la mano, aunque alguna figura la tape un poco.
      const leaf = !hit.piece && d.props?.get(key(hit.row, hit.col));
      if (leaf?.hand) { d.props.delete(key(hit.row, hit.col)); return take(PICKUPS[leaf.id], leaf.el, true); }
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
        // Tapping an enemy means "attack it": pick the legal move that hits it, nearest to the tap,
        // so a 3×3 boss is one target instead of nine cells to aim at.
        if (piece && piece.color !== me) {
          const strike = moves.filter((m) => m.hits.includes(piece))
            .sort((a, b) => Math.hypot(a.row - hit.row, a.col - hit.col) - Math.hypot(b.row - hit.row, b.col - hit.col))[0];
          if (strike) { doMove(d.selected, { row: strike.row, col: strike.col }); return; }
        }
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
    d.view = new BoardView(hostRef.current, { camera: settings.camera, shake: settings.shake, speed: settings.speed, framed: !!scenario, pond: !scenario, onTap, onDrop, canDrag, onImpact, onHover, onZoom: (z) => setZoom((v) => ((v > 1.01) === (z > 1.01) ? v : z)) });
    d.view.setBoard(board);
    d.view.setPieces(pieces);
    seePieces(pieces.filter((p) => !p.boss).map((p) => p.type));
    d.busy = true;
    addLog(scenario ? `${mod.name} · ${board.rows}×${board.cols}` : `Piso ${node.floor + 1}/${run.map.floors} · ${board.rows}×${board.cols} · ${mod.name} · Rival ${rival.name}`);
    const boss = pieces.find((p) => p.boss);
    d.bossId = boss?.boss;
    const learned = pieces.filter((p) => p.color !== 'light' && p.extraMoveTypes?.length).length;
    // On a boss floor enemy officers borrow moves: the star badge marks them and the entrance says so.
    const bossSub = boss && `${BOSSES[boss.boss].desc}${learned ? ' Sus oficiales llevan la estrella: movimientos prestados.' : ''}`;
    if (boss) addLog(`Aparece ${boss.name}${learned ? ` · ${learned} oficial${learned > 1 ? 'es' : ''} con movimientos prestados` : ''}`);
    refresh();
    // The floor card plays over the board while it assembles; the boss gets its own entrance after landing.
    Promise.all([
      d.view.intro(pieces),
      (!boss || scenario) && d.moments.cinematic({ title: scenario ? mod.name : `Piso ${node.floor + 1}`, sub: scenario ? mod.goal : `${mod.name}. ${mod.desc}`, icon: mod.icon, wave: seats.flatMap((s) => ['pawn', 'knight', 'king'].map((t) => [t, s.color])) }),
    ])
      .then(() => boss && d.moments.cinematic({ title: boss.name, sub: bossSub, piece: { type: artOf(boss), side: boss.color }, hp: { hp: boss.hp, max: boss.maxHp }, tone: 'danger', anim: 'stomp' }))
      .then(() => playDemos(boss))
      .then(() => tossCoin())
      .then(() => beginPlacing());
    const onKey = (e) => e.key === 'Escape' && setPaused((v) => !v);
    addEventListener('keydown', onKey);
    return () => { d.dead = true; clearTimeout(d.timer); removeEventListener('keydown', onKey); d.view.destroy(); d.moments.destroy(); };
  }, []);

  useEffect(() => { ref.current.paused = paused; }, [paused]);
  // La mano se reparte desde abajo, una carta tras otra (translate: no pisa el giro del abanico).
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    mainRef.current?.querySelectorAll('.hand-card').forEach((el, i) => el.animate(
      [{ translate: '0 70px', opacity: 0 }, { translate: '0 0', opacity: 1 }],
      { duration: 420, delay: 700 + i * 70, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
    ));
  }, []);
  const first = useRef(true);
  useEffect(() => { if (first.current) first.current = false; else ref.current.view?.restyle(); }, [settings.theme]);
  useEffect(() => { ref.current.view?.setCamera(settings.camera); if (ref.current.view) { ref.current.view.shakeOn = settings.shake; ref.current.view.speed = settings.speed; } if (ref.current.moments) Object.assign(ref.current.moments, { speed: settings.speed, enabled: settings.moments }); }, [settings]);

  const muts = Object.entries(countMutations(run.mutations || []));
  // Un toque explica el chip; el de peligro además hace latir las piezas amenazadas.
  const explain = (id, title, text) => {
    if (chipInfo?.id === id) return setChipInfo(null);
    setChipInfo({ id, title, text });
    if (id === 'threats') ref.current.view?.pulseThreats();
  };
  const hand = run.cards || [];
  const leave = (kind, then) => ref.current.leave(kind, then);
  return html`<div class="screen game">
    <div class="game-main" ref=${mainRef}>
      <div class="game-top">
        <button class="btn ghost sm icon-only" aria-label="Pausa" title="Pausa (Escape)" onClick=${() => setPaused(true)}><${Icon} name="pause" /></button>
        <h1 class="title">${scenario ? mod.name : node.versus ? 'Partida local' : node.isBoss ? 'Piso final' : node.isMiniBoss ? 'Mini-jefe' : `Piso ${node.floor + 1} de ${run.map.floors}`}</h1>
        ${tools}
      </div>
      <div class="board-host" ref=${hostRef}></div>
      ${placing && html`<div class="place-bar" role="group" aria-label="Fase Organizar">
        <div>
          <strong>Carta Organizar · ${placing.left} de ${placing.total} intercambios</strong>
          <small>${placing.left > 0 ? 'Toca una pieza tuya y luego otra para cambiarlas de casilla.' : 'Ya no quedan intercambios.'} Pulsa Comenzar cuando quieras.</small>
        </div>
        <button class="btn primary sm" autofocus onClick=${() => ref.current.endPlacing()}>Comenzar</button>
      </div>`}
      ${zoom > 1.01 && html`<button class="zoom-reset" aria-label="Quitar el zoom" title="Quitar el zoom" onClick=${() => ref.current.view?.resetZoom()}><${Icon} name="shrink" size=${18} /></button>`}
      ${banner && html`<${TurnBanner} key=${banner.key} text=${banner.text} side=${banner.side} />`}
      ${hand.length > 0 && html`<div class=${'hand' + (hud?.canCard ? '' : ' spent')} role="group" aria-label="Mano de cartas tácticas">
        ${hand.map((id, i) => html`<button key=${id + i} class=${'hand-card' + (cardSel === i ? ' on' : '')} style=${{ '--rot': (i - (hand.length - 1) / 2) * 7 + 'deg', '--drop': Math.abs(i - (hand.length - 1) / 2) * 7 + 'px' }}
            disabled=${!hud?.canCard || !!placing} aria-pressed=${cardSel === i} title=${CARDS[id].desc} onClick=${() => ref.current.pickCard(i)}>
          <${CardFace} card=${{ ...CARDS[id], kind: 'tactic' }} mini shop=${isShopCard(run, i)} />
        </button>`)}
        <p class=${'hand-hint' + (cardTip ? ' tip' : '')} aria-live="polite">${placing ? 'Organizar: acomoda tus piezas y pulsa Comenzar' : cardSel != null ? cardTip || CARDS[hand[cardSel]]?.aim || '' : hud?.canCard ? 'Una carta por turno' : 'Ya jugaste carta este turno'}</p>
      </div>`}
    </div>
    <aside class="hud panel">
      ${end && scenario && html`<${MiniEnd} win=${!!end.victory} title=${end.tie ? 'Tablas' : end.victory ? '¡Victoria!' : 'Derrota'} note=${end.note || (end.tie ? 'Partida bloqueada: empate.' : end.victory ? 'Minijuego superado.' : 'No salió esta vez.')} label=${scenario.endLabel || 'Continuar'} onEnd=${() => leave('exit', () => end.victory ? onWin(ref.current.bossId) : onExit())} />`}
      ${hud?.boss && html`<section class="boss-bar" aria-label="Jefe">
        <div class="boss-row"><strong>${hud.boss.name}</strong>
          <span class="hp">${Array.from({ length: hud.boss.maxHp }, (_, i) => html`<b class=${i < hud.boss.hp ? 'on' : ''}></b>`)}</span></div>
      </section>`}
      <section class="mod-card">
        <span class="mod-icon"><${Icon} name=${mod.icon} size=${22} /></span>
        <div><h2>${mod.name}</h2><p>${scenario ? mod.goal : mod.desc}</p>
          ${hud?.goal && html`<p class="goal" aria-live="polite"><strong>${hud.goal}</strong></p>`}
          ${node.modifier === 'elite' && html`<ul class="elite-list">${eliteVariants(node.floor, run.map.floors).map((v) => html`<li><span class="elite-ico"><${Icon} name=${v.icon} size=${13} /></span><div><strong>${v.name}</strong><span>${v.desc}</span></div></li>`)}</ul>`}</div>
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
        ${hud?.threats > 0 && html`<button class="chip danger" aria-pressed=${chipInfo?.id === 'threats'} onClick=${() => explain('threats', `${hud.threats} en peligro`, 'Las piezas que laten en rojo pueden ser capturadas en la próxima jugada rival. Muévelas o protégelas.')}><${Icon} name="warn" size=${12} /> ${hud.threats} en peligro</button>`}
        ${node.modifier === 'chaos' && hud && html`<button class="chip" aria-pressed=${chipInfo?.id === 'chaos'} onClick=${() => explain('chaos', `Derrumbe en ${hud.chaosIn}`, `${mod.desc} Faltan ${hud.chaosIn} turnos para el próximo; lo que esté encima cae.`)}><${Icon} name="collapse" size=${12} /> derrumbe en ${hud.chaosIn}</button>`}
        ${muts.map(([id, n]) => html`<button class="chip mut" aria-pressed=${chipInfo?.id === id} onClick=${() => explain(id, MUTATIONS[id]?.name + (n > 1 ? ' ×' + n : ''), MUTATIONS[id]?.desc + ' Es una mutación de tu ejército: dura toda la run.')}><${Icon} name=${MUTATIONS[id]?.icon} size=${12} />${MUTATIONS[id]?.name}${n > 1 ? ' ×' + n : ''}</button>`)}
      </div>
      ${chipInfo && html`<p class="chip-info" role="status"><strong>${chipInfo.title}</strong> ${chipInfo.text}</p>`}
      ${inspect && html`<section class=${'inspector' + (inspect.threat ? ' threat' : '')}>
        <${PieceIcon} type=${inspect.type} side=${inspect.side} size=${44} />
        <div>
          <strong>${inspect.name} <small>${inspect.color}</small></strong>
          <p>${inspect.boss || `Alcanza ${inspect.moves} casilla${inspect.moves === 1 ? '' : 's'}`}</p>
          ${inspect.guard && html`<p class="guard-note"><${Icon} name="lock" size=${13} /> ${inspect.guard}</p>`}
          ${inspect.mut.length > 0 && html`<div class="insp-row"><span class="insp-key">Mutación</span><span class="tags">${inspect.mut.map((id) => html`<span class="tag mut" title=${MUTATIONS[id]?.desc}><${Icon} name=${MUTATIONS[id]?.icon} size=${11} />${MUTATIONS[id]?.name}</span>`)}</span></div>
            ${inspect.mut.map((id) => html`<p class="insp-desc">${MUTATIONS[id]?.desc}</p>`)}`}
          ${inspect.cards.length > 0 && html`<div class="insp-row"><span class="insp-key">Carta</span><span class="tags">${inspect.cards.map((id) => html`<span class="tag carta" title=${CARDS[id]?.desc}><${Icon} name=${CARDS[id]?.icon} size=${11} />${CARDS[id]?.name}</span>`)}</span></div>
            ${inspect.cards.map((id) => html`<p class="insp-desc">${CARDS[id]?.desc}</p>`)}`}
          ${inspect.copied.length > 0 && html`<div class="insp-row"><span class="insp-key">Movimiento</span><span class="tags">${inspect.copied.map((n) => html`<span class="tag">${n}</span>`)}</span></div>`}
          ${inspect.lent.length > 0 && html`<div class="insp-row"><span class="insp-key">Prestado por el jefe</span><span class="tags">${inspect.lent.map((n) => html`<span class="tag">${n}</span>`)}</span></div>`}
        </div>
      </section>`}
      ${hud && Object.values(hud.captured).some((l) => l.length) && html`<section class="captures" aria-label="Piezas capturadas">
        ${seats.map((s) => hud.captured[s.color].length > 0 && html`<div class="cap-row"><span class=${'token side-' + s.color}></span>
          <span class="cap-list">${hud.captured[s.color].map((t) => html`<${PieceIcon} type=${t} side=${s.color} size=${20} />`)}</span></div>`)}
      </section>`}
      ${hud && html`<p class="hud-tip"><${Icon} name="book" size=${13} /> ${hud.threats > 0 ? 'Tienes piezas en peligro: toca el chip rojo para ver cuáles.' : hud.canCard && hand.length ? 'Puedes jugar una carta de tu mano este turno.' : TIPS[hud.turn % TIPS.length]}</p>`}
      ${hand.length > 0 && html`<section class="hand-list" aria-label="Qué hace cada carta de tu mano">
        ${hand.map((id, i) => html`<div key=${id + i} class=${'hl-row' + (cardSel === i ? ' on' : '')}><${Icon} name=${CARDS[id].icon} size=${15} /><span><b>${CARDS[id].name}</b> ${CARDS[id].desc}</span></div>`)}
      </section>`}
      <ol class="log" aria-live="polite" aria-label="Registro de jugadas">${log.slice(-6).map((l, i) => html`<li key=${log.length - 6 + i}>${l}</li>`)}</ol>
    </aside>
    ${paused && !end && html`<${PauseOverlay} settings=${settings} setSettings=${setSettings}
      onResume=${() => setPaused(false)} onRestart=${onRestart && (() => leave('reset', onRestart))} onExit=${() => leave('exit', onExit)} onMenu=${() => leave('exit', onMenu)} onAbandon=${() => leave('resign', onAbandon)}
      onHowTo=${() => { setPaused(false); onHowTo(); }} />`}
    ${end && !scenario && html`<${EndOverlay} state=${end} isFinal=${node.isBoss} exitLabel=${exitLabel} onContinue=${() => leave('exit', () => onWin(ref.current.bossId))} onRetry=${() => leave('reset', onRestart)} onMap=${() => leave('exit', onExit)}
      onMenu=${() => leave('exit', end.victory ? () => onWin(ref.current.bossId, { toMenu: true }) : onMenu)} />`}
  </div>`;
}

// `exitLabel`: el minijuego tiene una sola salida (seguir la run u otra partida) en lugar de mapa y menú.
function EndOverlay({ state, isFinal, exitLabel, onContinue, onRetry, onMap, onMenu }) {
  const ref = useRef(null);
  useEffect(() => {
    const card = ref.current, OUT = [0.16, 1, 0.3, 1];
    motion(card.parentElement, { opacity: [0, 1] }, { duration: 0.3 });
    motion(card, { scale: [0.9, 1], rotate: [-6, -2], opacity: [0, 1] }, { duration: 0.5, ease: OUT });
    // El sello cae como un tampón sobre la ficha: grande, girado, y asienta con un golpe seco.
    motion(card.querySelector('.stamp'), { scale: [1.9, 0.92, 1], rotate: [-28, -6, -8], opacity: [0, 1, 1] }, { duration: 0.45, delay: 0.28, ease: OUT });
    motion(card.querySelectorAll('h1, p, .end-actions .btn'), { y: [10, 0], opacity: [0, 1] }, { duration: 0.35, delay: motionStagger(0.06, { startDelay: 0.42 }), ease: OUT });
  }, []);
  const kind = state.tie ? 'tie' : state.victory ? 'win' : 'loss';
  const title = state.tie ? 'Tablas' : state.victory ? (isFinal ? 'Run completada' : 'Victoria') : 'Derrota';
  const msg = state.note || (state.tie ? 'Partida bloqueada: empate a piezas.'
    : state.victory ? (isFinal ? 'Has conquistado la torre entera.' : 'El tablero es tuyo.')
    : `Tu rey ha caído.${state.winnerName ? ' Gana ' + state.winnerName + '.' : ''}`);
  return html`<div class="overlay">
    <div class=${'end-card panel ' + kind} ref=${ref}>
      <div class="stamp"><${Icon} name=${state.tie ? 'flag' : state.victory ? 'trophy' : 'skull'} size=${34} /></div>
      <h1>${title}</h1>
      <p>${msg}</p>
      <div class="end-actions">
        ${state.victory && html`<button class="btn primary" autofocus onClick=${onContinue}>${exitLabel || (isFinal ? 'Nueva run' : 'Reclamar recompensa')}</button>`}
        <button class="btn" onClick=${onRetry}><${Icon} name="refresh" size=${16} />Reintentar</button>
        ${!state.victory && html`<button class="btn ghost-ink" onClick=${onMap}><${Icon} name="map" size=${16} />${exitLabel || 'Volver al mapa'}</button>`}
        ${(!state.victory || isFinal) && !exitLabel && html`<button class="btn ghost-ink" onClick=${onMenu}><${Icon} name="home" size=${16} />Menú principal</button>`}
      </div>
    </div>
  </div>`;
}
