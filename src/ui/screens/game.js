// Game screen: the "director" that wires Match (rules) to BoardView (3D) and the HUD.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Icon, PieceIcon } from '../icons.js';
import { TurnBanner } from '../components.js';
import { BoardView } from '../../view/board-view.js';
import { Match, botChooseMove } from '../../game/match.js';
import { generateBoard, placePieces } from '../../game/generate.js';
import { moveCells, cellsOf, key, anchorForCell } from '../../game/rules.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { MUTATIONS, countMutations } from '../../data/mutations.js';
import { PIECE_NAMES, MOVE_NAMES } from '../../data/pieces.js';
import { BOSSES } from '../../data/bosses.js';
import { PauseOverlay } from './overlays.js';
import { Moments } from '../moments.js';

const SIDE_NAME = { light: 'marfil', dark: 'carmesí', wild: 'jade' };

export function GameScreen({ node, run, seats, settings, setSettings, onExit, onAbandon, onWin, onRestart, onHowTo }) {
  const hostRef = useRef(null);
  const mainRef = useRef(null);
  const ref = useRef({}); // mutable director state: view, match, busy, selected
  const [hud, setHud] = useState(null);
  const [log, setLog] = useState([]);
  const [inspect, setInspect] = useState(null);
  const [banner, setBanner] = useState(null);
  const [paused, setPaused] = useState(false);
  const [end, setEnd] = useState(null);
  const mod = MODIFIERS[node.modifier];
  const addLog = (m) => setLog((l) => [...l.slice(-30), m]);

  useEffect(() => {
    const d = ref.current;
    const board = generateBoard(node.seed, node.floor, run.map.floors);
    const pieces = placePieces(board, { playerCount: seats.length, isBoss: node.isBoss, seed: node.seed, mutations: run.mutations, bonuses: run.bonuses });
    const match = new Match({ board, pieces, players: seats, modifier: node.modifier, mutations: run.mutations, bonuses: run.bonuses });
    const humanTurn = () => match.player.kind === 'human' && !match.over && !d.busy && !d.paused;

    const refresh = () => {
      const p = match.player;
      d.view.setTurn(p.color);
      const threats = p.kind === 'human' ? match.threats() : new Set();
      if (p.kind === 'human' && match.inCheck(p.color)) threats.add(match.pieces.find((x) => x.royal && x.color === p.color));
      d.view.setThreats(threats);
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
      });
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
      setInspect({
        type: p.type, side: p.color, name: p.boss ? p.name : PIECE_NAMES[p.type], color: SIDE_NAME[p.color], moves: moves.length,
        extra: (p.boss ? p.moves : p.extraMoveTypes || []).map((t) => ({ name: MOVE_NAMES[t] || t, mut: (p.mutationExtras || []).includes(t) })),
        boss: p.boss && BOSSES[p.boss].desc,
      });
    };

    const finish = async () => {
      const r = match.over;
      const human = seats.find((s) => s.kind === 'human')?.color || 'light';
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
      if (fallenBoss) await d.moments.cinematic({ title: `¡${fallenBoss.name} derribado!`, sub: 'El coloso cae y la torre es tuya.', piece: { type: fallenBoss.type, side: fallenBoss.color }, tone: 'brass' });
      const after = match.afterMove();
      if (after.collapse) {
        addLog('¡El borde se desploma!');
        d.moments.callout({ text: '¡Derrumbe!', sub: 'El borde cae al vacío', icon: 'collapse', tone: 'danger' });
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
        setBanner({ key: Date.now(), text: seats.filter((s) => s.kind === 'human').length > 1 ? `Turno de ${p.name}` : 'Tu turno', side: p.color });
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
          d.moments.callout(mine
            ? { text: '¡Jaque!', sub: s === match.player ? 'Tu turno: protege al rey' : `${s.name}, tu rey está amenazado`, tone: 'danger', piece: { type: royal.type, side: s.color } }
            : { text: '¡Jaque!', sub: `${royal.boss ? royal.name : 'El rey ' + SIDE_NAME[s.color]} está a tiro`, tone: 'brass', piece: { type: royal.type, side: s.color } });
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
      const art = (p) => ({ type: p.type, side: p.color });
      if (res.bounced) {
        const b = res.victims[0].piece;
        return d.moments.callout({ text: '¡Golpe!', sub: `A ${b.name} le ${b.hp === 1 ? 'queda 1 vida' : `quedan ${b.hp} vidas`}`, tone, piece: art(b) });
      }
      if (killed.some((p) => p.boss)) return;
      const royal = killed.find((p) => p.royal);
      if (royal) return d.moments.callout({ text: '¡Rey caído!', sub: `Cae el bando ${SIDE_NAME[royal.color]}`, tone, piece: art(royal) });
      if (killed.length > 1) d.moments.callout({ text: res.piece.boss ? `¡Aplastados ×${killed.length}!` : `¡Captura ×${killed.length}!`, tone, piece: art(res.piece) });
      else {
        const big = killed.find((p) => p.type === 'queen' || p.type === 'rook');
        if (big) d.moments.callout({ text: `¡${PIECE_NAMES[big.type]} caída!`, tone, piece: art(big) });
      }
      if (res.promoted) d.moments.callout({ text: '¡Coronación!', sub: 'El peón asciende a reina', tone: 'brass', piece: { type: 'queen', side: res.piece.color } });
    };

    const onTap = (hit) => {
      if (!humanTurn()) return;
      const piece = hit.piece || match.pieceAt(hit.row, hit.col);
      const me = match.player.color;
      if (d.selected) {
        if (piece === d.selected) return clearSel();
        if (piece && piece.color === me) return select(piece);
        const moves = match.legal(d.selected);
        const anchor = anchorForCell(d.selected, hit.row, hit.col, moves);
        if (anchor) { doMove(d.selected, anchor); return; }
        if (piece) return inspectPiece(piece);
        return clearSel();
      }
      if (!piece) return clearSel();
      if (piece.color === me) select(piece); else inspectPiece(piece);
    };
    const onDrop = (piece, hit) => {
      if (!hit || !humanTurn()) return;
      const anchor = anchorForCell(piece, hit.row, hit.col, match.legal(piece));
      if (anchor) doMove(piece, anchor);
    };
    const canDrag = (p) => humanTurn() && p.color === match.player.color;

    d.match = match;
    d.check = {};
    d.moments = new Moments(mainRef.current, { speed: settings.speed, enabled: settings.moments });
    d.view = new BoardView(hostRef.current, { camera: settings.camera, shake: settings.shake, speed: settings.speed, onTap, onDrop, canDrag, onImpact });
    d.view.setBoard(board);
    d.view.setPieces(pieces);
    d.busy = true;
    addLog(`Piso ${node.floor + 1}/${run.map.floors} · ${board.rows}×${board.cols} · ${mod.name}`);
    const boss = pieces.find((p) => p.boss);
    if (boss) addLog(`Aparece ${boss.name}`);
    refresh();
    // The floor card plays over the board while it assembles; the boss gets its own entrance after landing.
    Promise.all([
      d.view.intro(pieces),
      !boss && d.moments.cinematic({ title: `Piso ${node.floor + 1}`, sub: `${mod.name}. ${mod.desc}`, icon: mod.icon }),
    ])
      .then(() => boss && d.moments.cinematic({ title: boss.name, sub: BOSSES[boss.boss].desc, piece: { type: boss.type, side: boss.color }, hp: { hp: boss.hp, max: boss.maxHp }, tone: 'danger' }))
      .then(() => { d.busy = false; startTurn(); });
    const onKey = (e) => e.key === 'Escape' && setPaused((v) => !v);
    addEventListener('keydown', onKey);
    return () => { clearTimeout(d.timer); removeEventListener('keydown', onKey); d.view.destroy(); d.moments.destroy(); };
  }, []);

  useEffect(() => { ref.current.paused = paused; }, [paused]);
  useEffect(() => { ref.current.view?.setCamera(settings.camera); if (ref.current.view) { ref.current.view.shakeOn = settings.shake; ref.current.view.speed = settings.speed; } if (ref.current.moments) Object.assign(ref.current.moments, { speed: settings.speed, enabled: settings.moments }); }, [settings]);

  const muts = Object.entries(countMutations(run.mutations || []));
  return html`<div class="screen game">
    <div class="game-main" ref=${mainRef}>
      <div class="game-top">
        <button class="btn ghost sm icon-only" aria-label="Pausa" title="Pausa (Escape)" onClick=${() => setPaused(true)}><${Icon} name="pause" /></button>
        <h1 class="title">${node.isBoss ? 'Piso final' : `Piso ${node.floor + 1} de ${run.map.floors}`}</h1>
      </div>
      <div class="board-host" ref=${hostRef}></div>
      ${banner && html`<${TurnBanner} key=${banner.key} text=${banner.text} side=${banner.side} />`}
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
          <div class="tags">${inspect.extra.map((t) => html`<span class=${'tag' + (t.mut ? ' mut' : '')}>${t.name}</span>`)}</div>
        </div>
      </section>`}
      <ol class="log" aria-live="polite" aria-label="Registro de jugadas">${log.slice(-6).map((l, i) => html`<li key=${log.length - 6 + i}>${l}</li>`)}</ol>
    </aside>
    ${paused && !end && html`<${PauseOverlay} settings=${settings} setSettings=${setSettings}
      onResume=${() => setPaused(false)} onRestart=${onRestart} onExit=${onExit} onAbandon=${onAbandon}
      onHowTo=${() => { setPaused(false); onHowTo(); }} />`}
    ${end && html`<${EndOverlay} state=${end} isFinal=${node.isBoss} onContinue=${onWin} onRetry=${onRestart} onMap=${onExit} />`}
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
