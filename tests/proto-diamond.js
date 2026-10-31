import { BoardView } from '../src/view/board-view.js';
import { applyTheme, THEMES } from '../src/data/themes.js';
import { botChooseMove } from '../src/game/match.js';
import { key } from '../src/game/rules.js';
import { DIAMOND_DIFFICULTIES, createDiamondMatch } from '../src/lab/proto/diamond-game.js';

const params = new URLSearchParams(location.search);
const themeId = params.get('theme') || 'walnut';
const difficultyControl = document.getElementById('proto-difficulty');
const statusEl = document.getElementById('proto-status');
const hintEl = document.getElementById('proto-hint');
const roundEl = document.getElementById('proto-round');
const lightCountEl = document.getElementById('proto-light-count');
const darkCountEl = document.getElementById('proto-dark-count');
const host = document.getElementById('proto-board');

let match = null;
let view = null;
let selected = null;
let busy = false;
let ended = false;
let botTimer = null;

applyTheme(THEMES[themeId] ? themeId : 'walnut');
difficultyControl.value = DIAMOND_DIFFICULTIES[params.get('diff')] ? params.get('diff') : 'normal';

const setStatus = (text, phase) => {
  statusEl.textContent = text;
  statusEl.dataset.phase = phase;
  statusEl.dataset.difficulty = difficultyControl.value;
};

function updateBoardState() {
  view.setTurn(match.player.color);
  const threats = match.threats('light');
  const king = match.pieces.find(piece => piece.color === 'light' && piece.royal);
  if (king && match.inCheck('light')) threats.add(king);
  view.setThreats(threats);
  roundEl.textContent = String(Math.floor(match.turn / 2) + 1);
  lightCountEl.textContent = String(match.pieces.filter(piece => piece.color === 'light').length);
  darkCountEl.textContent = String(match.pieces.filter(piece => piece.color === 'dark').length);
}

function clearSelection() {
  selected = null;
  view.select(null);
  view.clearMarks();
}

function selectPiece(piece) {
  selected = piece;
  view.select(piece);
  const moves = match.legal(piece);
  const cells = new Set(moves.map(move => key(move.row, move.col)));
  const captures = new Set();
  for (const move of moves) for (const victim of move.hits || []) captures.add(key(victim.row, victim.col));
  view.showMoves(cells, captures);
  hintEl.textContent = moves.length
    ? 'Destinos marcados: toca una casilla para mover. Los puntos rojos son capturas.'
    : 'Esta pieza no tiene movimientos legales ahora. Elige otra.';
}

async function finishMatch() {
  if (ended || !match.over) return;
  ended = true;
  busy = true;
  clearTimeout(botTimer);
  clearSelection();
  const result = match.over;
  if (result.tie) {
    setStatus('Empate · el rombo queda bloqueado', 'over');
    hintEl.textContent = 'Reinicia para intentar otra partida.';
  } else if (result.victory) {
    setStatus('Victoria · el rey carmesí cayó', 'over');
    hintEl.textContent = 'Conquistaste el vértice contrario.';
    await view.victory('light');
  } else {
    setStatus('Derrota · tu rey cayó', 'over');
    hintEl.textContent = 'El rival conquistó tu vértice. Prueba otra dificultad.';
    await view.defeat('light');
  }
  busy = false;
}

async function commitMove(piece, target) {
  if (busy || ended) return;
  const result = match.move(piece, target);
  if (!result) return;
  busy = true;
  clearSelection();
  await view.playMove(result);
  const after = match.afterMove();
  busy = false;
  updateBoardState();
  if (match.over || after.over) return finishMatch();
  startTurn();
}

async function runBotTurn() {
  if (ended || busy || match.player.color !== 'dark') return;
  if (!match.canMove()) {
    const after = match.afterMove({ pass: true });
    updateBoardState();
    if (match.over || after.over) return finishMatch();
    startTurn();
    return;
  }
  const choice = botChooseMove(match);
  if (!choice) {
    const after = match.afterMove({ pass: true });
    updateBoardState();
    if (match.over || after.over) return finishMatch();
    startTurn();
    return;
  }
  await commitMove(choice.piece, choice.target);
}

function startTurn() {
  if (ended || busy || match.over) return;
  if (!match.canMove()) {
    const after = match.afterMove({ pass: true });
    updateBoardState();
    if (match.over || after.over) return finishMatch();
    return startTurn();
  }
  updateBoardState();
  if (match.player.color === 'dark') {
    setStatus('Turno carmesí · el rival está pensando', 'bot');
    hintEl.textContent = 'El rival usa la dificultad seleccionada.';
    botTimer = window.setTimeout(runBotTurn, 420);
  } else {
    setStatus('Tu turno · elige una pieza marfil', 'human');
  }
}

async function onTap(hit) {
  if (busy || ended || match.player.color !== 'light' || !hit) return;
  const piece = hit.piece || match.pieceAt(hit.row, hit.col);
  if (!selected) {
    if (piece?.color === 'light') selectPiece(piece);
    return;
  }
  if (piece === selected) {
    clearSelection();
    hintEl.textContent = 'Selección cancelada.';
    return;
  }
  if (piece?.color === 'light') {
    selectPiece(piece);
    return;
  }
  const move = match.legal(selected).find(option => option.row === hit.row && option.col === hit.col);
  if (move) return commitMove(selected, { row: move.row, col: move.col });
  if (piece?.color === 'dark') {
    const capture = match.legal(selected).find(option => option.hits.includes(piece));
    if (capture) return commitMove(selected, { row: capture.row, col: capture.col });
  }
  clearSelection();
}

function onDrop(piece, hit) {
  if (busy || ended || match.player.color !== 'light' || piece.color !== 'light' || !hit) return;
  const move = match.legal(piece).find(option => option.row === hit.row && option.col === hit.col);
  if (move) commitMove(piece, { row: move.row, col: move.col });
}

function canDrag(piece) {
  return !busy && !ended && match.player.color === 'light' && piece.color === 'light';
}

function resetGame() {
  clearTimeout(botTimer);
  if (view) view.destroy();
  selected = null;
  busy = false;
  ended = false;
  match = createDiamondMatch(difficultyControl.value);
  view = new BoardView(host, { camera: 'flat', shake: true, vfx: true, framed: true, onTap, onDrop, canDrag });
  view.setBoard(match.board);
  view.setPieces(match.pieces);
  view.host.dataset.protoDiamond = 'true';
  for (const [piece, element] of view.els) {
    element.dataset.piece = piece.type;
    element.dataset.color = piece.color;
  }
  for (const coords of [[6, 0], [6, 12]]) view.tiles.get(key(coords[0], coords[1]))?.classList.add('proto-vertex');
  updateBoardState();
  setStatus('Tu turno · elige una pieza marfil', 'human');
  hintEl.textContent = 'Toca una pieza marfil para ver sus movimientos legales.';
}

document.getElementById('proto-restart').addEventListener('click', resetGame);
difficultyControl.addEventListener('change', resetGame);
resetGame();
