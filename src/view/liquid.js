// Charco de la peana, común al tablero (BoardView) y a los minijuegos de rejilla propia (hop.js):
// la base se derrite donde estaba (se aplasta y salpica dos gotas) y brota donde aterriza la pieza.
// Nada cruza el tablero, así que una L o un jefe 2×2 no arrastran un chorro por las esquinas.
import { animate } from 'animejs';

let count = 0; // los ids de filtro tienen que ser únicos en toda la página

// svg: un <svg> con una unidad por casilla. from/to: centros [x, y] de la peana; rx/ry: sus radios.
// px: un píxel de pantalla en unidades de casilla. area: [cols, rows] que cubre el filtro.
// Devuelve una promesa que se cumple cuando el charco ya brotó del todo y se ha retirado.
export function liquid(svg, { side, from: [ox, oy], to: [dx, dy], rx, ry, px, area: [cols, rows], dur, pixel = false }) {
  if (pixel) return pixelLiquid(svg, { side, from: [ox, oy], to: [dx, dy], rx, ry, dur });
  const id = `goo-${++count}`;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', `side-${side}`);
  // Desenfoque + umbral de alfa funden las formas; las erosiones redibujan el contorno de tinta
  // (1,5 px) y el canto (4 px) sobre la forma que tome el charco.
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
    <g filter="url(#${id})"><ellipse/><circle/><circle/><ellipse/></g>`;
  svg.appendChild(g);
  const [melt, dropL, dropR, rise] = g.querySelectorAll('ellipse, circle');
  const r0 = Math.min(rx, ry) * 0.45;
  const s = { m: 1, u: 0 };
  const draw = () => {
    // Al derretirse se ensancha y aplana antes de irse; las gotas salen hacia fuera y menguan.
    const f = 1 - s.m;
    melt.setAttribute('cx', ox); melt.setAttribute('cy', oy + ry * 0.25 * f);
    melt.setAttribute('rx', Math.max(0, rx * s.m * (1 + 0.5 * f))); melt.setAttribute('ry', Math.max(0, ry * s.m * s.m));
    for (const [d, sg] of [[dropL, -1], [dropR, 1]]) {
      d.setAttribute('cx', ox + sg * rx * (0.3 + 1.1 * f)); d.setAttribute('cy', oy + ry * 0.3 * f);
      d.setAttribute('r', Math.max(0, r0 * (1 - f) * Math.min(1, f * 4)));
    }
    rise.setAttribute('cx', dx); rise.setAttribute('cy', dy);
    rise.setAttribute('rx', Math.max(0, rx * s.u)); rise.setAttribute('ry', Math.max(0, ry * s.u));
  };
  draw();
  return Promise.all([
    animate(s, { m: 0, duration: dur * 0.55, ease: 'inQuad', onUpdate: draw }),
    animate(s, { u: 1, delay: dur * 0.45, duration: dur * 0.55, ease: 'outBack', onUpdate: draw }),
  ]).then(() => g.remove());
}

// En las mesas píxel el desenfoque no encaja: el charco son discos escalonados como la peana
// (--px-disc de board.css: contorno de tinta, relleno del bando y banda de sombra abajo) que
// menguan y crecen sin fundirse.
const DISC = [[30, 0], [70, 0], [70, 8], [84, 8], [84, 18], [92, 18], [92, 32], [100, 32], [100, 68], [92, 68], [92, 82], [84, 82], [84, 92], [70, 92], [70, 100], [30, 100], [30, 92], [16, 92], [16, 82], [8, 82], [8, 68], [0, 68], [0, 32], [8, 32], [8, 18], [16, 18], [16, 8], [30, 8]];
const disc = (cx, cy, rx, ry) => DISC.map(([x, y]) => `${cx + (x / 50 - 1) * rx},${cy + (y / 50 - 1) * ry}`).join(' ');

function pixelLiquid(svg, { side, from: [ox, oy], to: [dx, dy], rx, ry, dur }) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', `side-${side} px-goo`);
  const blob = () => '<polygon class="px-ink"/><polygon class="px-shade"/><polygon class="px-fill"/>';
  g.innerHTML = blob() + blob() + blob() + blob();
  svg.appendChild(g);
  const parts = [...g.querySelectorAll('polygon')];
  const put = (i, cx, cy, ax, ay) => {
    const [ink, shade, fill] = parts.slice(i * 3, i * 3 + 3);
    const on = ax > 0.01 && ay > 0.01;
    for (const el of [ink, shade, fill]) el.style.display = on ? '' : 'none';
    if (!on) return;
    ink.setAttribute('points', disc(cx, cy, ax, ay));
    shade.setAttribute('points', disc(cx, cy, ax * 0.82, ay * 0.82));
    fill.setAttribute('points', disc(cx, cy - ay * 0.18, ax * 0.82, ay * 0.64));
  };
  const s = { m: 1, u: 0 };
  const draw = () => {
    const m = s.m, f = 1 - m, u = s.u;
    put(0, ox, oy + ry * 0.25 * f, rx * m * (1 + 0.5 * f), ry * m * m);
    const r = Math.min(rx, ry) * 0.4 * (1 - f) * Math.min(1, f * 4);
    put(1, ox - rx * (0.3 + 1.1 * f), oy + ry * 0.3 * f, r, r);
    put(2, ox + rx * (0.3 + 1.1 * f), oy + ry * 0.3 * f, r, r);
    put(3, dx, dy, rx * u, ry * u);
  };
  draw();
  return Promise.all([
    animate(s, { m: 0, duration: dur * 0.55, ease: 'inQuad', onUpdate: draw }),
    animate(s, { u: 1, delay: dur * 0.45, duration: dur * 0.55, ease: 'outBack', onUpdate: draw }),
  ]).then(() => g.remove());
}
