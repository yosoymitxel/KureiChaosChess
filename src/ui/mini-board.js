import { html, useRef, useLayoutEffect } from './lib.js';
import { BoardView } from '../view/board-view.js';
import { loadSettings } from '../game/run.js';
import { key } from '../game/rules.js';

// El tablero de la partida para minijuegos sin Match. Piezas { id, type, color, row, col }: cada cambio
// entre dos pintadas se anima como en la partida (entra cayendo, salta, captura al aterrizar, sale derribada).
// `strikes` [{ id, from, to }]: capturas sin moverse (la pieza en `from` embiste a la `id` y vuelve), tras los saltos.
// `hidden` (ids): las que salen escondiéndose, no derribadas. `onView` recibe el tablero (para efectos propios).
export function MiniBoard({ board, pieces, onTap, marks, labels, strikes, hidden, disabled, label, hostRef, onView }) {
  const own = useRef(null), host = hostRef || own, view = useRef(null), tap = useRef(null);
  tap.current = disabled ? null : onTap;
  useLayoutEffect(() => {
    const s = loadSettings();
    view.current = new BoardView(host.current, { camera: s.camera, shake: s.shake, speed: s.speed, framed: true, onTap: (hit) => tap.current?.(hit.row, hit.col) });
    onView?.(view.current);
    return () => view.current.ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const v = view.current;
    if (v.board !== board) { v.setBoard(board); v.setPieces(pieces.map((p) => ({ ...p }))); v.intro([...v.els.keys()]); }
    else sync(v, pieces, strikes, hidden);
    v.clearMarks();
    for (const [k, cls] of marks || []) v.tiles.get(k)?.classList.add(...cls.split(' '));
    v.setLabels(labels);
  });
  return html`<div class="mini-stage board-host" ref=${host} role="grid" aria-label=${label}></div>`;
}

async function sync(v, pieces, strikes = [], hidden = new Set()) {
  const live = new Map([...v.els.keys()].map((p) => [p.id, p]));
  const gone = new Map([...live].filter(([id]) => !pieces.some((q) => q.id === id)));
  for (const [id, p] of gone) if (hidden.has(id)) { gone.delete(id); v.vanish(p); }
  const struck = new Map(strikes.filter((x) => gone.has(x.id)).map((x) => [x.id, x]));
  const step = (p, to, victims = []) => {
    const from = { row: p.row, col: p.col };
    Object.assign(p, to);
    return v.playMove({ piece: p, from, to, victims });
  };
  const moves = [];
  // Una pieza capturada tras moverse llega primero a su casilla.
  for (const [id, x] of struck) { const p = gone.get(id); if (p.row !== x.to.row || p.col !== x.to.col) moves.push(step(p, x.to)); }
  for (const q of pieces) {
    const p = live.get(q.id);
    if (!p) { moves.push(v.dropIn({ ...q })); continue; }
    const to = { row: q.row, col: q.col }, art = p.type !== q.type || p.color !== q.color;
    const victim = [...gone.values()].find((g) => !struck.has(g.id) && g.row === to.row && g.col === to.col);
    const moved = p.row !== to.row || p.col !== to.col;
    Object.assign(p, q, { row: p.row, col: p.col });
    if (!moved) { if (art) v.setArt(p); continue; }
    if (victim) gone.delete(victim.id);
    // Cambiar de figura al moverse es coronar: gira al aterrizar.
    moves.push(step(p, to, victim ? [{ piece: victim, killed: true }] : []).then(() => {
      if (!art) return;
      v.els.get(p)?.classList.toggle('crown', !!p.crown);
      return v.promote(p);
    }));
  }
  if (!gone.size) return;
  await Promise.all(moves);
  for (const [id, { from }] of struck) {
    const victim = gone.get(id), piece = [...v.els.keys()].find((p) => p.row === from.row && p.col === from.col);
    gone.delete(id);
    if (piece) v.playMove({ piece, from, to: { row: victim.row, col: victim.col }, victims: [{ piece: victim, killed: true }], bounced: true });
    else gone.set(id, victim);
  }
  for (const p of gone.values()) v.kill(p, p, p);
}

// El carmesí de los minis de oleadas viste de zombi.
export const zombies = (pieces) => pieces.map((p) => (p.color === 'dark' ? { ...p, zombie: true } : p));
