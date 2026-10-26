// Movimiento de fichas en los minijuegos, con los criterios del tablero (BoardView.playMove,
// liquid y squash): la peana se derrite al salir y brota al llegar, la ficha salta en arco (Motion) y aterriza aplastada.
import { motion } from './lib.js';
import { liquid } from '../view/liquid.js';
import { loadSettings } from '../game/run.js';
import { playSfx } from './sfx.js';

const OUT = [0.16, 1, 0.3, 1];
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const speed = () => loadSettings().speed || 1;

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

// El charco del tablero (src/view/liquid.js) a la medida de la peana de estas rejillas
// (.bm-slab .bm-pc::after): elipse al 72 % de la casilla. dur en segundos, como Motion.
function puddle(grid, from, to, { side, cell, cols, rows, dur }) {
  const at = (r, c) => [c + 0.5, r + 0.72];
  liquid(gooOf(grid, cols, rows), { side, from: at(from.row, from.col), to: at(to.row, to.col), rx: 0.25, ry: 0.15, px: 1 / cell, area: [cols, rows], dur: dur * 1000 });
}

// Salta de `from` a `to` ({ row, col }) con su charco. Se llama después de repintar, con la ficha
// ya en la casilla destino.
export function hopPiece(grid, pcEl, { from, to, side = 'light', cols, rows, liquid: forceLiquid = false }) {
  if (!grid || !pcEl || reduced()) return;
  const cellEl = grid.querySelector('.bm-cell, .br-cell');
  if (!cellEl) return;
  const cw = cellEl.offsetWidth, chh = cellEl.offsetHeight;
  const dr = to.row - from.row, dc = to.col - from.col;
  if (!dr && !dc) return;
  const dx = -dc * cw, dy = -dr * chh;
  // Motion pinta su primer fotograma en el siguiente cuadro: sin esto la ficha asoma un instante ya llegada.
  pcEl.style.transform = `translate(${dx}px, ${dy}px)`;
  // Un paso a la casilla de al lado se camina: la ficha se desliza con su peana y se balancea en
  // dos pasitos. El charco y el arco quedan para los saltos, donde se leen; en un paso corto el
  // charco solo dejaba una estela detrás de la pieza.
  // Las vidas viven al lado de la ficha en la casilla: viajan con ella en vez de llegar antes.
  const hp = pcEl.parentElement?.querySelector('.pc-hp');
  if (Math.abs(dr) + Math.abs(dc) === 1) {
    const dur = 0.26 / speed();
    playSfx('step');
    setTimeout(() => playSfx('step'), dur * 500);
    pcEl.style.transformOrigin = '50% 72%';
    motion(pcEl, { x: [dx, dx / 2, 0], y: [dy, dy / 2 - chh * 0.07, 0, -chh * 0.07, 0], rotate: [0, -5, 0, 5, 0] }, { duration: dur, ease: 'linear' });
    if (hp) motion(hp, { x: [dx, 0], y: [dy, 0] }, { duration: dur, ease: 'linear' });
    if (forceLiquid) puddle(grid, from, to, { side, cell: cw, cols, rows, dur });
    return;
  }
  if (hp) motion(hp, { x: [dx, 0], y: [dy, 0] }, { duration: 0.4 / speed(), ease: 'easeInOut' });
  // El arco no asoma por encima del borde del tablero (el `<div class="bm">` recorta): en la fila
  // de arriba la ficha salta bajo, y en el resto del tablero salta alto.
  const lift = Math.min(chh * 0.45, (to.row + 0.06) * chh);
  const dur = 0.4 / speed();
  // La peana no vuela con la figura: el charco hace de base por el suelo y la peana reaparece al aterrizar.
  pcEl.classList.add('hopping');
  setTimeout(() => { pcEl.classList.remove('hopping'); playSfx('land'); }, dur * 1000);
  motion(pcEl, { x: [dx, dx / 2, 0], y: [dy, dy / 2 - lift, 0] }, { duration: dur, ease: 'easeInOut' });
  motion(pcEl, { scaleY: [0.78, 1.08, 1], scaleX: [1.13, 0.96, 1] }, { duration: 0.32 / speed(), delay: dur - 0.06, ease: OUT });
  puddle(grid, from, to, { side, cell: cw, cols, rows, dur });
}

// La ficha que entra al tablero (compra, oleada, reina colocada) brota.
export function popPiece(grid, el) {
  playSfx('pop');
  if (!grid || !el || reduced()) return;
  motion(el, { scale: [0.35, 1.14, 1] }, { duration: 0.34 / speed(), ease: OUT });
}
