import { html, useRef, useLayoutEffect } from './lib.js';
import { BoardView } from '../view/board-view.js';
import { loadSettings } from '../game/run.js';
import { key } from '../game/rules.js';

// El tablero de la partida para minijuegos sin Match. Piezas { id, type, color, row, col }: cada cambio
// entre dos pintadas se anima como en la partida (entra cayendo, salta, captura al aterrizar, sale derribada).
export function MiniBoard({ board, pieces, onTap, marks, labels, disabled, label }) {
  const host = useRef(null), view = useRef(null), tap = useRef(null);
  tap.current = disabled ? null : onTap;
  useLayoutEffect(() => {
    const s = loadSettings();
    view.current = new BoardView(host.current, { camera: s.camera, shake: s.shake, speed: s.speed, framed: true, onTap: (hit) => tap.current?.(hit.row, hit.col) });
    return () => view.current.ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const v = view.current;
    if (v.board !== board) { v.setBoard(board); v.setPieces(pieces.map((p) => ({ ...p }))); v.intro([...v.els.keys()]); }
    else sync(v, pieces);
    v.clearMarks();
    for (const [k, cls] of marks || []) v.tiles.get(k)?.classList.add(...cls.split(' '));
    v.setLabels(labels);
  });
  return html`<div class="mini-stage board-host" ref=${host} role="grid" aria-label=${label}></div>`;
}

function sync(v, pieces) {
  const live = new Map([...v.els.keys()].map((p) => [p.id, p]));
  const gone = new Map([...live].filter(([id]) => !pieces.some((q) => q.id === id)).map(([, p]) => [key(p.row, p.col), p]));
  for (const q of pieces) {
    const p = live.get(q.id);
    if (!p) { v.dropIn({ ...q }); continue; }
    const from = { row: p.row, col: p.col }, to = { row: q.row, col: q.col }, art = p.type !== q.type || p.color !== q.color;
    Object.assign(p, q);
    if (art) v.setArt(p);
    if (from.row === to.row && from.col === to.col) continue;
    const victim = gone.get(key(to.row, to.col));
    gone.delete(key(to.row, to.col));
    v.playMove({ piece: p, from, to, victims: victim ? [{ piece: victim, killed: true }] : [] });
  }
  for (const p of gone.values()) v.kill(p, p, p);
}
