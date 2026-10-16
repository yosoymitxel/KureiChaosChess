// Animation lab: stage single BoardView scenes on demand (open lab.html).
import { BoardView } from './view/board-view.js';
import { makePiece, placeBoss } from './game/generate.js';
import { Match } from './game/match.js';
import { key } from './game/rules.js';
import { Moments } from './ui/moments.js';
import { BOSSES } from './data/bosses.js';

let view, camera = 'tilt';
const board = () => ({ rows: 7, cols: 7, holes: new Set([key(3, 0), key(3, 6)]), protectRows: 2 });

// Each scene builds a tiny position and returns an async "play" function.
// Foreground moments, played over the lab stage without a match.
const MOMENTS = {
  'Momento: jaque': (m) => m.callout({ text: '¡Jaque!', sub: 'Tu turno: protege al rey', tone: 'danger', piece: { type: 'king', side: 'light' }, anim: 'tremble', tier: 'major' }),
  'Momento: reina caída': (m) => m.callout({ text: '¡Reina caída!', tone: 'brass', piece: { type: 'queen', side: 'dark' }, anim: 'fall', tier: 'major' }),
  'Momento: rey caído': (m) => m.callout({ text: '¡Rey caído!', sub: 'Cae el bando carmesí', tone: 'brass', piece: { type: 'king', side: 'dark' }, anim: 'explode', tier: 'major' }),
  'Momento: coronación': (m) => m.callout({ text: '¡Coronación!', sub: 'El peón asciende a reina', tone: 'brass', piece: { type: 'pawn', side: 'light' }, pieceTo: { type: 'queen', side: 'light' }, anim: 'promote' }),
  'Momento: golpe al jefe': (m) => m.callout({ text: '¡Golpe!', sub: 'A Titán le quedan 2 vidas', tone: 'brass', piece: { type: 'king', side: 'dark' }, anim: 'hit', tier: 'major' }),
  'Momento: aplastados': (m) => m.callout({ text: '¡Aplastados ×3!', tone: 'danger', piece: { type: 'king', side: 'dark' }, anim: 'stomp' }),
  'Momento: derrumbe': (m) => m.callout({ text: '¡Derrumbe!', sub: 'El borde cae al vacío', tone: 'danger', icon: 'collapse', anim: 'crumble', tier: 'major' }),
  'Momento: piso': (m) => m.cinematic({ title: 'Piso 3', sub: 'Prisa. Cada jugador mueve dos veces por turno.', icon: 'rush', wave: ['pawn', 'knight', 'king'].flatMap((t) => [[t, 'light'], [t, 'dark']]) }),
  'Momento: jefe': (m) => m.cinematic({ title: 'Titán', sub: BOSSES.titan.desc, piece: { type: 'king', side: 'dark' }, hp: { hp: 3, max: 3 }, tone: 'danger', anim: 'stomp' }),
  'Momento: jefe derribado': (m) => m.cinematic({ title: '¡Titán derribado!', sub: 'El coloso cae y la torre es tuya.', piece: { type: 'king', side: 'dark' }, tone: 'brass', anim: 'down' }),
};

const SCENES = {
  'Piezas': () => {
    const b = { rows: 4, cols: 6, holes: new Set(), protectRows: 0 };
    const types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'guard', 'advisor', 'elephant', 'camel', 'cannon', 'pawn'];
    const pieces = types.map((t, i) => makePiece(t, i < 6 ? 'light' : 'dark', 1 + Math.floor(i / 6) * 2, i % 6));
    return { b, pieces };
  },
  'Jefes': () => {
    const b = { rows: 7, cols: 11, holes: new Set(), protectRows: 0 };
    const at = { titan: [0, 0], ram: [0, 3], hydra: [0, 6], devourer: [0, 9], golem: [3, 0], rider: [3, 4], wall: [3, 7] };
    const pieces = Object.entries(at).map(([id, [r, c]]) => {
      const d = BOSSES[id];
      return makePiece(d.art, 'dark', r, c, { boss: id, h: d.size[0], w: d.size[1], hp: d.hp, maxHp: d.hp, name: d.name, royal: true });
    });
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
  view = new BoardView(document.getElementById('board'), { camera });
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

const stage = document.getElementById('stage');
const moments = new Moments(stage);
async function play(name) {
  if (MOMENTS[name]) { if (!view) await run('Piezas'); return MOMENTS[name](moments); }
  return run(name);
}

const scenes = document.getElementById('scenes');
for (const name of [...Object.keys(SCENES), ...Object.keys(MOMENTS)]) {
  const b = document.createElement('button');
  b.className = 'btn sm'; b.textContent = name; b.onclick = () => play(name);
  scenes.appendChild(b);
}
const cams = document.getElementById('cams');
for (const [id, label] of [['flat', 'Cenital'], ['tilt', 'Mesa'], ['epic', 'Épica']]) {
  const b = document.createElement('button');
  b.textContent = label; b.className = id === camera ? 'on' : '';
  b.onclick = () => { camera = id; [...cams.children].forEach((x) => x.classList.toggle('on', x === b)); view?.setCamera(id); };
  cams.appendChild(b);
}
play(new URLSearchParams(location.search).get('scene') || 'Golpe al jefe');
