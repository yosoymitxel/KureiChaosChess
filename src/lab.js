// Animation lab: stage single BoardView scenes on demand (open lab.html).
import { BoardView } from './view/board-view.js';
import { makePiece, placeBoss } from './game/generate.js';
import { Match } from './game/match.js';
import { key } from './game/rules.js';

let view, camera = 'tilt';
const board = () => ({ rows: 7, cols: 7, holes: new Set([key(3, 0), key(3, 6)]), protectRows: 2 });

// Each scene builds a tiny position and returns an async "play" function.
const SCENES = {
  'Piezas': () => {
    const b = { rows: 4, cols: 6, holes: new Set(), protectRows: 0 };
    const types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'guard', 'advisor', 'elephant', 'camel', 'cannon', 'pawn'];
    const pieces = types.map((t, i) => makePiece(t, i < 6 ? 'light' : 'dark', 1 + Math.floor(i / 6) * 2, i % 6));
    return { b, pieces };
  },
  'Golpe al jefe': () => {
    const b = board(), pieces = [makePiece('rook', 'light', 5, 3), makePiece('king', 'light', 6, 6)];
    const boss = placeBoss(pieces, b, 'titan'); boss.row = 1;
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 2, col: 3 }) };
  },
  'Jefe aplasta': () => {
    const b = board(), pieces = [makePiece('pawn', 'light', 3, 3), makePiece('pawn', 'light', 3, 4), makePiece('king', 'light', 6, 6)];
    const boss = placeBoss(pieces, b, 'titan'); boss.row = 1;
    return { b, pieces, dark: true, play: (m) => m.move(boss, { row: 2, col: 3 }) };
  },
  'Salto de caballo': () => {
    const b = board(), pieces = [makePiece('knight', 'light', 5, 2), makePiece('pawn', 'dark', 3, 3), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 3, col: 3 }) };
  },
  'Coronación': () => {
    const b = board(), pieces = [makePiece('pawn', 'light', 1, 3, { canCrown: true }), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 0, col: 3 }) };
  },
  'Derrumbe': () => {
    const b = board(), pieces = [makePiece('king', 'light', 6, 3), makePiece('king', 'dark', 0, 3)];
    return { b, pieces, collapse: [[0, 0], [6, 6], [2, 6]] };
  },
  'Victoria': () => {
    const b = board(), pieces = [makePiece('queen', 'light', 4, 3), makePiece('king', 'light', 6, 3), ...[1, 2, 4, 5].map((c) => makePiece('pawn', 'dark', 1, c)), makePiece('king', 'dark', 0, 3)];
    return { b, pieces, victory: true };
  },
};

async function run(name) {
  view?.destroy();
  const s = SCENES[name]();
  view = new BoardView(document.getElementById('stage'), { camera });
  view.setBoard(s.b);
  view.setPieces(s.pieces);
  await view.intro(s.pieces);
  const players = [{ color: 'light', kind: 'human' }, { color: 'dark', kind: 'bot' }];
  const m = new Match({ board: s.b, pieces: s.pieces, players, modifier: 'none' });
  if (s.dark) m.current = 1;
  await new Promise((r) => setTimeout(r, 300));
  if (s.play) { const res = s.play(m); if (res) await view.playMove(res); }
  if (s.collapse) await view.collapse(s.collapse);
  if (s.victory) await view.victory('light');
}

const scenes = document.getElementById('scenes');
for (const name of Object.keys(SCENES)) {
  const b = document.createElement('button');
  b.className = 'btn sm'; b.textContent = name; b.onclick = () => run(name);
  scenes.appendChild(b);
}
const cams = document.getElementById('cams');
for (const [id, label] of [['flat', 'Cenital'], ['tilt', 'Mesa'], ['epic', 'Épica']]) {
  const b = document.createElement('button');
  b.textContent = label; b.className = id === camera ? 'on' : '';
  b.onclick = () => { camera = id; [...cams.children].forEach((x) => x.classList.toggle('on', x === b)); view?.setCamera(id); };
  cams.appendChild(b);
}
run(new URLSearchParams(location.search).get('scene') || 'Golpe al jefe');
