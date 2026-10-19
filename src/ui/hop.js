// Movimiento de fichas en los minijuegos, con los criterios del tablero (BoardView.playMove,
// liquid y squash): el charco (anime.js) llega primero, la ficha salta en arco (Motion) y aterriza aplastada.
import { animate } from 'animejs';
import { motion } from './lib.js';
import { loadSettings } from '../game/run.js';
import { pieceSVG } from '../view/piece-art.js';

const OUT = [0.16, 1, 0.3, 1];
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const speed = () => loadSettings().speed || 1;
let gooCount = 0; // los ids de filtro tienen que ser únicos en toda la página

// Un <svg> con una unidad por casilla, por encima de las celdas del tablero.
function gooOf(grid, cols, rows) {
  let svg = grid.querySelector('.goo');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'goo');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    grid.appendChild(svg);
  }
  svg.setAttribute('viewBox', `0 0 ${cols} ${rows}`);
  return svg;
}

// El charco: la receta del tablero (desenfoque + umbral de alfa que funde formas y dos erosiones
// que redibujan contorno y canto). Se estira por el recorrido (dobla la esquina de la L) y se recoge detrás.
function liquid(grid, from, to, { side, cell, cols, rows }) {
  const svg = gooOf(grid, cols, rows);
  // Mismo sitio y tamaño que la peana (.bm-slab .bm-pc::after): elipse al 72 % de la casilla.
  const rx = 0.25, ry = 0.15;
  const at = (r, c) => [c + 0.5, r + 0.72];
  const dr = to.row - from.row, dc = to.col - from.col;
  const pts = [at(from.row, from.col)];
  if (dr && dc && Math.abs(dr) !== Math.abs(dc)) pts.push(Math.abs(dr) > Math.abs(dc) ? at(to.row, from.col) : at(from.row, to.col));
  pts.push(at(to.row, to.col));
  const lens = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  const cum = lens.reduce((acc, l) => [...acc, acc[acc.length - 1] + l / total], [0]);
  const point = (t) => {
    const i = Math.max(0, cum.findIndex((v, j) => j > 0 && t <= v) - 1);
    const f = cum[i + 1] > cum[i] ? (t - cum[i]) / (cum[i + 1] - cum[i]) : 0;
    return pts[i].map((v, j) => v + (pts[i + 1][j] - v) * Math.min(1, f));
  };
  const route = (t0, t1) => [point(t0), ...pts.filter((_, i) => cum[i] > t0 && cum[i] < t1), point(t1)];

  const id = `goo-mini-${++gooCount}`, px = 1 / cell;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', `side-${side}`);
  g.innerHTML = `<filter id="${id}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-1" y="-1" width="${cols + 2}" height="${rows + 2}">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.07"/>
      <feComponentTransfer result="g"><feFuncA type="linear" slope="24" intercept="-11"/></feComponentTransfer>
      <feFlood class="ink"/><feComposite in2="g" operator="in" result="o"/>
      <feMorphology in="g" operator="erode" radius="${1.5 * px}" result="e1"/>
      <feFlood class="rim"/><feComposite in2="e1" operator="in" result="r"/>
      <feMorphology in="g" operator="erode" radius="${4 * px}" result="e2"/>
      <feFlood class="fill"/><feComposite in2="e2" operator="in" result="f"/>
      <feMerge><feMergeNode in="o"/><feMergeNode in="r"/><feMergeNode in="f"/></feMerge>
    </filter>
    <g filter="url(#${id})"><polyline fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="${Math.min(rx, ry) * 1.1}"/><ellipse rx="${rx}" ry="${ry}"/><ellipse rx="${rx}" ry="${ry}"/></g>`;
  svg.appendChild(g);

  const [neck, tail, head] = g.querySelectorAll('polyline, ellipse');
  const s = { head: 0, tail: 0 };
  const draw = () => {
    const [hx, hy] = point(s.head), [tx, ty] = point(s.tail);
    head.setAttribute('cx', hx); head.setAttribute('cy', hy);
    tail.setAttribute('cx', tx); tail.setAttribute('cy', ty);
    neck.setAttribute('points', route(s.tail, s.head).map((q) => q.join(',')).join(' '));
  };
  draw();

  const reach = 170 / speed();
  animate(s, { head: 1, duration: reach, ease: 'outExpo', onUpdate: draw });
  animate(s, { tail: 1, delay: reach + 140 / speed(), duration: 250 / speed(), ease: 'inOutSine', onUpdate: draw, onComplete: () => g.remove() });
}

// Salta de `from` a `to` ({ row, col }) con su charco. Se llama después de repintar, con la ficha
// ya en la casilla destino.
export function hopPiece(grid, pcEl, { from, to, side = 'light', cols, rows }) {
  if (!grid || !pcEl || reduced()) return;
  const cellEl = grid.querySelector('.bm-cell, .br-cell');
  if (!cellEl) return;
  const cw = cellEl.offsetWidth, chh = cellEl.offsetHeight;
  const dr = to.row - from.row, dc = to.col - from.col;
  if (!dr && !dc) return;
  const dx = -dc * cw, dy = -dr * chh;
  // Un paso a la casilla de al lado se camina: la ficha se desliza con su peana y se balancea en
  // dos pasitos. El charco y el arco quedan para los saltos, donde se leen; en un paso corto el
  // charco solo dejaba una estela detrás de la pieza.
  // Las vidas viven al lado de la ficha en la casilla: viajan con ella en vez de llegar antes.
  const hp = pcEl.parentElement?.querySelector('.pc-hp');
  if (Math.abs(dr) + Math.abs(dc) === 1) {
    const dur = 0.26 / speed();
    pcEl.style.transformOrigin = '50% 72%';
    motion(pcEl, { x: [dx, dx / 2, 0], y: [dy, dy / 2 - chh * 0.07, 0, -chh * 0.07, 0], rotate: [0, -5, 0, 5, 0] }, { duration: dur, ease: 'linear' });
    if (hp) motion(hp, { x: [dx, 0], y: [dy, 0] }, { duration: dur, ease: 'linear' });
    return;
  }
  if (hp) motion(hp, { x: [dx, 0], y: [dy, 0] }, { duration: 0.4 / speed(), ease: 'easeInOut' });
  // El arco no asoma por encima del borde del tablero (el `<div class="bm">` recorta): en la fila
  // de arriba la ficha salta bajo, y en el resto del tablero salta alto.
  const lift = Math.min(chh * 0.45, (to.row + 0.06) * chh);
  const dur = 0.4 / speed();
  // La peana no vuela con la figura: el charco hace de base por el suelo y la peana reaparece al aterrizar.
  pcEl.classList.add('hopping');
  setTimeout(() => pcEl.classList.remove('hopping'), dur * 1000);
  motion(pcEl, { x: [dx, dx / 2, 0], y: [dy, dy / 2 - lift, 0] }, { duration: dur, ease: 'easeInOut' });
  motion(pcEl, { scaleY: [0.78, 1.08, 1], scaleX: [1.13, 0.96, 1] }, { duration: 0.32 / speed(), delay: dur - 0.06, ease: OUT });
  liquid(grid, from, to, { side, cell: cw, cols, rows });
}

// Instantánea de piezas (id -> casilla, bando y tipo) para comparar antes y después de una acción.
export const snapPieces = (pieces) => new Map(pieces.map((p) => [p.id, { row: p.row, col: p.col, color: p.color, type: p.type }]));

// Fichas que saltaron y fichas que entraron, medido ya sobre el tablero repintado:
// el elemento de cada una vive en la casilla nueva, índice fila×columnas + columna.
export function pieceDiffs(grid, before, pieces, cols) {
  const hops = [], born = [];
  const cells = grid?.children;
  if (!cells) return { hops, born };
  for (const p of pieces) {
    const el = cells[p.row * cols + p.col]?.querySelector('.bm-pc');
    if (!el) continue;
    const b = before.get(p.id);
    if (!b) born.push(el);
    else if (b.row !== p.row || b.col !== p.col) hops.push({ el, from: b, to: { row: p.row, col: p.col }, side: p.color });
  }
  return { hops, born };
}

// La ficha que entra al tablero (compra, oleada, reina colocada) brota.
export function popPiece(grid, el) {
  if (!grid || !el || reduced()) return;
  motion(el, { scale: [0.35, 1.14, 1] }, { duration: 0.34 / speed(), ease: OUT });
}

// La pieza capturada cae: el estado ya la quitó, así que la copia se anima donde estaba,
// volcada sobre su base, como el derribo de los bolos.
export function fallPiece(grid, { row, col, type, side, cols }) {
  if (!grid || reduced()) return;
  const cellEl = grid.children[row * cols + col];
  if (!cellEl) return;
  const g = document.createElement('span');
  g.className = `bm-ghost side-${side}`;
  g.style.inset = '0';
  g.innerHTML = pieceSVG(type);
  cellEl.appendChild(g);
  const dir = (row + col) % 2 ? 1 : -1;
  motion(g, { rotate: dir * 88, x: dir * cellEl.offsetWidth * 0.3, opacity: [1, 1, 0] }, { duration: 0.5 / speed(), ease: 'easeIn', onComplete: () => g.remove() });
}
