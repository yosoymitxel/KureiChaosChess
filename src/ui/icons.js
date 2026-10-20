// Stamped icon set: solid ink silhouettes with details cut out in the surface colour
// (--icon-cut), like the pictograms printed in a board-game rulebook.
import { html } from './lib.js';
import { pieceSVG } from '../view/piece-art.js';
import { PIECE_TYPES } from '../data/pieces.js';
import { PIXEL_ICONS } from './pixel-icons.js';

const CUT = 'var(--icon-cut, var(--paper))';
const cut = (d, w = 1.8) => html`<path d=${d} fill="none" stroke=${CUT} stroke-width=${w} stroke-linecap="round" stroke-linejoin="round" />`;
const dot = (cx, cy, r = 1.4) => html`<circle cx=${cx} cy=${cy} r=${r} fill=${CUT} />`;
// Trazo macizo: una cápsula de grosor w por tramo de la polilínea, todas en un solo trazado para
// que se unan sin costuras (también bajo el contorno de tinta de las cartas).
const f3 = (v) => +v.toFixed(3);
const bar = (pts, w) => pts.slice(1).map(([bx, by], i) => {
  const [ax, ay] = pts[i], r = w / 2, L = Math.hypot(bx - ax, by - ay) || 1, nx = (-(by - ay) / L) * r, ny = ((bx - ax) / L) * r;
  return `M${f3(ax + nx)} ${f3(ay + ny)}L${f3(bx + nx)} ${f3(by + ny)}A${r} ${r} 0 0 0 ${f3(bx - nx)} ${f3(by - ny)}L${f3(ax - nx)} ${f3(ay - ny)}A${r} ${r} 0 0 0 ${f3(ax + nx)} ${f3(ay + ny)}Z`;
}).join('');
// Gira un punto sobre el centro (12,12): sirve para dibujos de simetría radial exacta (hielo).
const rot = ([x, y], a) => { const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180); return [12 + (x - 12) * c - (y - 12) * s, 12 + (x - 12) * s + (y - 12) * c]; };

const P = {
  pause: html`<rect x="5" y="2.5" width="5" height="19" rx="1.6" /><rect x="14" y="2.5" width="5" height="19" rx="1.6" />`,
  back: html`<path d=${bar([[11.2, 4.6], [4.2, 12], [11.2, 19.4]], 4.2) + bar([[4.6, 12], [19.8, 12]], 4.2)} />`,
  check: html`<path d=${bar([[4.8, 12.3], [9.7, 17.2], [19.2, 6.7]], 5.2)} />`,
  warn: html`<path d="M12 2.6c.7 0 1.3.4 1.7 1l7.9 14.2c.7 1.3-.2 2.8-1.7 2.8H4.1c-1.5 0-2.4-1.5-1.7-2.8L10.3 3.6c.4-.6 1-1 1.7-1z" />${cut('M12 9v5', 2.2)}${dot(12, 17.3, 1.35)}`,
  refresh: html`<path d="M11.7 3.31a9.04 9.04 0 1 0 8.7 11.53l-3.39-1.02A5.54 5.54 0 1 1 15.54 8.28L12.83 10.99h8.47V2.52l-3.28 3.28A9.04 9.04 0 0 0 11.7 3.31z" />`,
  bot: html`<rect x="3.5" y="7.4" width="17" height="14" rx="3.6" /><rect x="10.8" y="3" width="2.4" height="5" /><circle cx="12" cy="3.6" r="1.8" />${dot(8.6, 13.6, 2.1)}${dot(15.4, 13.6, 2.1)}${cut('M9 18h6', 2)}`,
  human: html`<circle cx="12" cy="7.2" r="4.8" /><path d="M2.99 21.54c0-5.3 4.03-8.8 9.01-8.8s9.01 3.5 9.01 8.8z" />`,
  map: html`<path d="M2.5 5.5l6-2.5 7 2.5 6-2.5v15.5l-6 2.5-7-2.5-6 2.5z" />${cut('M8.5 3.5v15M15.5 6v15', 2.2)}${cut('M10.8 10.2l2.4 2.4m0-2.4l-2.4 2.4', 1.8)}${dot(5.5, 14.5, 1.2)}${dot(5.5, 9.5, 1.2)}${dot(18.5, 14.5, 1.2)}`,
  // Casa clásica: tejado a dos aguas con alero, cuerpo y puerta en arco recortada. Simétrica en x=12.
  home: html`<path d="M12 2.6l10 8.8H2z" /><rect x="5.4" y="10" width="13.2" height="11.5" rx="1" /><path d="M10.1 21.5v-3.9a1.9 1.9 0 0 1 3.8 0v3.9z" fill=${CUT} />`,
  trophy: html`<path d="M6 3h12v5.5a6 6 0 0 1-12 0z" /><path d=${bar([[6.6, 5.2], [3.6, 5.2], [3.6, 7.2], [6.6, 10.6]], 2.2) + bar([[17.4, 5.2], [20.4, 5.2], [20.4, 7.2], [17.4, 10.6]], 2.2)} /><rect x="10.6" y="13.5" width="2.8" height="4" /><rect x="7" y="17.5" width="10" height="3.5" rx="1" /><path d="M12 4.9l.9 1.9 2 .2-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9.1 7l2-.2z" fill=${CUT} />`,
  skull: html`<path d="M12 2.5c-5 0-8.5 3.6-8.5 8.3 0 2.7 1.2 4.6 3 5.8v4.4h11v-4.4c1.8-1.2 3-3.1 3-5.8 0-4.7-3.5-8.3-8.5-8.3z" />${dot(8.7, 11.3, 2.4)}${dot(15.3, 11.3, 2.4)}<path d="M12 14l1.3 2.1h-2.6z" fill=${CUT} />${cut('M10.1 18.4v3M13.9 18.4v3', 1.6)}`,
  book: html`<path d="M2.5 4.5c3.5-1 6.5-.5 8.7 1.5v15c-2.2-2-5.2-2.5-8.7-1.5zM21.5 4.5c-3.5-1-6.5-.5-8.7 1.5v15c2.2-2 5.2-2.5 8.7-1.5z" />${cut('M5 8.4c1.6-.2 3-.1 4.2.4M5 11.6c1.6-.2 3-.1 4.2.4M19 8.4c-1.6-.2-3-.1-4.2.4M19 11.6c-1.6-.2-3-.1-4.2.4', 1.7)}${cut('M3.8 16.6c2.8-.6 5.2-.2 7.2 1M20.2 16.6c-2.8-.6-5.2-.2-7.2 1', 1.3)}`,
  flag: html`<rect x="3.8" y="2.5" width="2.6" height="19" rx="1.2" /><path d="M6.4 3.5h14l-3.2 4.8 3.2 4.8h-14z" />`,
  gear: html`${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => html`<rect x="10.3" y="2.6" width="3.4" height="4.6" rx="1" transform=${`rotate(${a} 12 12)`} />`)}<circle cx="12" cy="12" r="6.8" /><circle cx="12" cy="12" r="3" fill=${CUT} />`,
  // Modifiers
  plain: html`<path d="M12 3l9.5 6v3.6L12 18.6l-9.5-6V9z" />${cut('M3.4 9.6L12 15l8.6-5.4M12 15.2v2.8', 1.6)}`,
  crown: html`<path d="M3 18.3L2 7l5.3 5L12 4l4.7 8L22 7l-1 11.3z" /><rect x="3" y="19.6" width="18" height="2.2" rx="1" />${dot(7.3, 15.3, 1.3)}${dot(12, 15.3, 1.6)}${dot(16.7, 15.3, 1.3)}`,
  // Reina estratega: cabeza de caballo de perfil con la corona de la reina (puntas con bolas) encima.
  queenKnight: html`<path d="M7.82 21.5v-2.09c0-2.18.95-3.99 2.85-5.13l-3.42 1.71c-1.23.57-2.56.1-2.94-1.14-.28-.85 0-1.71.66-2.28l4.46-3.99c1.04-.95 2.38-1.42 3.8-1.42h1.99c2.75 1.04 4.08 4.37 4.08 7.98v6.37z" />${dot(11.9, 11, 1.3)}${cut('M16.18 10.58c1.04 1.33 1.52 3.23 1.52 5.32', 1.5)}<path d="M9.72 7.35L9.34 4.5l2.18 1.33 1.99-2.28 1.99 2.28 2.18-1.33-.38 2.85z" /><circle cx="9.34" cy="4.1" r="1.2" /><circle cx="13.5" cy="3.15" r="1.2" /><circle cx="17.7" cy="4.1" r="1.2" />`,
  collapse: html`<path d="M12 2.5l9.5 5.5v2.6L12 16.1l-9.5-5.5V8z" />${cut('M3.4 8.6L12 13.6l8.6-5', 1.4)}${cut('M10.2 4.3l2.2 2.5-1.8 2.2 2.6 2.8', 1.8)}<path d="M4.6 17.2l3.6 1.8-1.1 3.4-3.4-1.8zM15.8 19l3.6-1.8.9 3.4-3.4 1.8z" />`,
  rush: html`<path d="M5.5 2.5h13v2.3c0 3-2.2 5.3-4.8 7.2 2.6 1.9 4.8 4.2 4.8 7.2v2.3h-13v-2.3c0-3 2.2-5.3 4.8-7.2C7.7 10.1 5.5 7.8 5.5 4.8z" />${cut('M9 6.5h6M12 15.5l-3 3.5h6z', 1.5)}`,
  fog: html`<path d="M6.94 14.74a4.14 4.14 0 0 1-.55-8.28 5.52 5.52 0 0 1 10.58 1.1 3.59 3.59 0 0 1-.37 7.18z" />${cut('M8.4 11.6c0-1.3 1-2.4 2.4-2.6', 1.6)}<path d=${bar([[3.6, 17.6], [12.6, 17.6]], 2.4) + bar([[10.4, 20.8], [20.4, 20.8]], 2.4)} />`,
  boss: html`<path d="M5 12c0-4.4 3.1-7.5 7-7.5s7 3.1 7 7.5v5.5H5z" /><path d="M5.5 10.5C3 9.5 1.8 7 2 3.5c1.6 2.2 3.4 3 5.4 3M18.5 10.5c2.5-1 3.7-3.5 3.5-7-1.6 2.2-3.4 3-5.4 3" /><rect x="4" y="18.4" width="16" height="3" rx="1" />${cut('M7.8 12.4h3.2M13 12.4h3.2M12 13v5', 2.4)}`,
  rest: html`<path d="M12 2.5c3.5 3.2 5 6 5 8.6a5 5 0 0 1-10 0c0-1.8.8-3.3 2.2-4.6.2 1.6 1 2.6 2.1 3-.4-2.3-.2-4.5.7-7z" /><path d="M3.5 18.5l17-3.5.6 2.8-17 3.5zM20.5 18.5l-17-3.5-.6 2.8 17 3.5z" />`,
  bag: html`<path d="M8.5 6.5h7l-1.5-3h-4z" /><path d="M9 6.5c-4 2.2-6.5 6-6.5 9.7 0 3.1 2.4 5.3 6 5.3h7c3.6 0 6-2.2 6-5.3 0-3.7-2.5-7.5-6.5-9.7z" />${cut('M8.5 8.5h7', 1.8)}<circle cx="12" cy="15" r="3" fill="none" stroke=${CUT} stroke-width="2" />`,
  coin: html`<circle cx="12" cy="12" r="9.2" /><circle cx="12" cy="12" r="5.4" fill="none" stroke=${CUT} stroke-width="1.8" />${dot(12, 12, 1.3)}`,
  // Copo de seis brazos a 60° con ramitas en V: cada brazo es el mismo girado sobre el centro.
  ice: html`<path d=${[0, 60, 120, 180, 240, 300].map((a) => bar([rot([12, 12], a), rot([12, 3.4], a)], 2.4) + bar([rot([9.4, 4.8], a), rot([12, 7.3], a), rot([14.6, 4.8], a)], 2)).join('')} />`,
  portal: html`<circle cx="12" cy="12" r="9.2" /><circle cx="12" cy="12" r="5.8" fill=${CUT} /><circle cx="12" cy="12" r="3.1" />`,
  swords: html`<path d="M4 2.5l11.5 11.5-1.8 1.8L2.2 4.3zM20 2.5L8.5 14l1.8 1.8L21.8 4.3z" /><path d="M5.5 15.5l3 3-2.2 2.2-1.6-.4-.4-1.6zM18.5 15.5l-3 3 2.2 2.2 1.6-.4.4-1.6z" /><path d=${bar([[4, 14], [10, 20]], 2.2) + bar([[20, 14], [14, 20]], 2.2)} />`,
  shield: html`<path d="M12 2.6l8 3v5.9c0 5-3.4 8.2-8 10.2-4.6-2-8-5.2-8-10.2V5.6z" />${cut('M12 6v12.5M7.4 10.8h9.2', 2.2)}`,
  lock: html`<path d="M7 10V7.5a5 5 0 0 1 10 0V10h-2.6V7.5a2.4 2.4 0 0 0-4.8 0V10z" /><rect x="4.5" y="10" width="15" height="11.5" rx="2.5" />${dot(12, 15, 1.7)}${cut('M12 15.5v2.6', 1.8)}`,
  fence: html`<path d="M4.9 5.6L6.4 3l1.5 2.6V21h-3zM10.5 5.6L12 3l1.5 2.6V21h-3zM16.1 5.6L17.6 3l1.5 2.6V21h-3z" /><rect x="2.5" y="8.6" width="19" height="2.4" rx="1.2" /><rect x="2.5" y="15" width="19" height="2.4" rx="1.2" />`,
  // Último bastión: torre almenada con puerta (la misma idea que la versión píxel).
  last: html`<path d="M4.5 2.5h3.2v2.7h2.7V2.5h3.2v2.7h2.7V2.5h3.2v6.3l-2.4 2.4v7.3h1.8v3H5.1v-3h1.8v-7.3L4.5 8.8z" /><path d="M10 18.5v-3a2 2 0 0 1 4 0v3z" fill=${CUT} />${cut('M7 9.4h10', 1.6)}`,
  hand: html`<rect x="7.8" y="4" width="8.4" height="14" rx="1.6" transform="rotate(-20 12 22)" /><rect x="7.8" y="4" width="8.4" height="14" rx="1.6" transform="rotate(20 12 22)" /><rect x="7.8" y="2.6" width="8.4" height="14" rx="1.6" stroke=${CUT} stroke-width="1.8" /><path d="M12 6.2l2.3 3.4-2.3 3.4-2.3-3.4z" fill=${CUT} />`,
  // Rewards
  scroll: html`<rect x="5.5" y="5" width="13" height="14" /><rect x="3" y="2.5" width="18" height="4" rx="2" /><rect x="3" y="17.5" width="18" height="4" rx="2" />${cut('M8.5 10h7M8.5 13.5h5', 1.5)}`,
  boot: html`<path d="M7 2.5h6.5l-.5 9 6.5 3.3c1.3.7 2 1.8 2 3.2v2.5H4.5V16c0-1.5.8-2.2 1.5-3z" />${cut('M7.5 7h4M7 10.5h4', 1.4)}<path d="M1.5 6.5h4M1 10h4.5M2 13.5h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />`,
  connect4: html`<rect x="2.5" y="3.5" width="19" height="17" rx="2.5" />${[7, 12, 17].flatMap((x) => [8.5, 15.5].map((y) => dot(x, y, 2)))}`,
  expand: html`<path d="M3 3h7v3H6v4H3zM21 3h-7v3h4v4h3zM3 21h7v-3H6v-4H3zM21 21h-7v-3h4v-4h3z" />`,
  shrink: html`<path d="M7 3h3v7H3V7h4zM17 3h-3v7h7V7h-4zM7 21h3v-7H3v3h4zM17 21h-3v-7h7v3h-4z" />`,
  // Herramientas del Jardín Zen
  drop: html`<path d="M12 2.6c3.4 4.3 5.2 7.1 5.2 9.6a5.2 5.2 0 0 1-10.4 0c0-2.5 1.8-5.3 5.2-9.6z" />${cut('M9.4 12.6c0-1.3.7-2.8 2.1-4.8', 1.5)}`,
  seed: html`<path d="M2.5 17c2.6-1.8 5.8-2.7 9.5-2.7s6.9.9 9.5 2.7v4.5H2.5z" /><path d="M12 3.2c1.7 2 2.5 3.5 2.5 5 0 1.7-1 2.9-2.5 2.9S9.5 9.9 9.5 8.2c0-1.5.8-3 2.5-5z" />${cut('M6.3 18.2c1.8-.9 3.7-1.3 5.7-1.3s3.9.4 5.7 1.3', 1.6)}`,
  spade: html`<rect x="10.7" y="2" width="2.6" height="6.6" rx="1.2" /><path d="M8.2 7.6h7.6v3.5c0 3.2-2 5.7-3.8 7.2-1.8-1.5-3.8-4-3.8-7.2z" />${cut('M12 10.4v4.6', 1.4)}`,
  shears: html`<path d="M5.3 2.1l2.3.5 9.8 13.2-2.2 1.7zM18.7 2.1l-2.3.5-9.8 13.2 2.2 1.7z" /><circle cx="7.2" cy="19.3" r="2.6" /><circle cx="16.8" cy="19.3" r="2.6" /><circle cx="7.2" cy="19.3" r="1.1" fill=${CUT} /><circle cx="16.8" cy="19.3" r="1.1" fill=${CUT} />`,
  flask: html`<path d="M9 2.5h6v2h-1v4.6l5.7 9.4c1 1.7-.2 3.5-2 3.5H6.3c-1.8 0-3-1.8-2-3.5L10 9.1V4.5H9z" />${cut('M7.5 15.5h9', 1.6)}${dot(10.5, 18.3, 1.1)}${dot(14, 17.8, 0.8)}`,
  // La flecha de abajo es la de arriba girada 180° sobre el centro (12,12).
  swap: html`<path d="M3.2 7.2h12.1V3.9L22.6 8.4l-7.3 4.5V9.6H3.2zM20.8 16.8H8.7v3.3L1.4 15.6l7.3-4.5v3.3h12.1z" />`,
  bomb: html`<circle cx="12" cy="14.5" r="7" /><path d="M15.3 4.6l2.5 2.5-2.5 2.5-2.5-2.5z" /><path d="M17.5 5.1c.9-.7 1.8-1.1 2.8-1.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />${dot(21.2, 3.2, 1.6)}${cut('M8.6 12.4a4.3 4.3 0 0 1 2.3-3.3', 1.7)}`,
  checkers: html`<ellipse cx="12" cy="16.4" rx="8.6" ry="3.6" /><rect x="3.4" y="11.6" width="17.2" height="4.8" /><ellipse cx="12" cy="11.6" rx="8.6" ry="3.6" />${cut('M7.6 11.6a4.4 1.8 0 0 0 8.8 0a4.4 1.8 0 0 0-8.8 0', 1.3)}`,
  bowl: html`<circle cx="7.2" cy="16.6" r="5.1" />${dot(5.9, 15.3, 1.05)}${dot(8.6, 14.9, 1.05)}${dot(7, 18, 1.05)}<circle cx="15" cy="5.2" r="2.6" /><rect x="13.9" y="7.2" width="2.2" height="2.6" rx="1" /><path d="M12.6 12.6c0-1.9.9-3.4 2.4-4.4 1.5 1 2.4 2.5 2.4 4.4 0 2.5-1.6 4.3-2.4 6.2-.8-1.9-2.4-3.7-2.4-6.2z" />`,
  target: html`<circle cx="12" cy="12" r="9.2" /><circle cx="12" cy="12" r="5.3" fill="none" stroke=${CUT} stroke-width="1.8" />${dot(12, 12, 1.7)}${cut('M12 2.6v4.2M12 17.2v4.2M2.6 12h4.2M17.2 12h4.2', 1.7)}`,
  invader: html`<rect x="8.2" y="2.5" width="2.2" height="3.2" rx="1" /><rect x="13.6" y="2.5" width="2.2" height="3.2" rx="1" /><rect x="6.6" y="4.8" width="10.8" height="3.4" rx="1.4" /><rect x="5.4" y="8.6" width="13.2" height="5.8" rx="1.8" /><rect x="2.8" y="9.4" width="2.6" height="4.4" rx="1" /><rect x="18.6" y="9.4" width="2.6" height="4.4" rx="1" /><rect x="6.8" y="14.6" width="3" height="5.2" rx="1" /><rect x="14.2" y="14.6" width="3" height="5.2" rx="1" />${dot(9.8, 11.4, 1.3)}${dot(14.2, 11.4, 1.3)}`,
  // Hockey de mesa: la torre-mazo (pomo, mango y peana) y el disco.
  hockey: html`<circle cx="9" cy="4.6" r="2.6" /><rect x="7.6" y="5.5" width="2.8" height="7" rx="1" /><ellipse cx="9" cy="16.2" rx="7" ry="3" /><rect x="2" y="12.8" width="14" height="3.4" /><ellipse cx="9" cy="12.8" rx="7" ry="3" />${cut('M2.6 13.4a6.4 2.6 0 0 0 12.8 0', 1.2)}<ellipse cx="19" cy="19.6" rx="3.6" ry="1.6" /><rect x="15.4" y="17.6" width="7.2" height="2" /><ellipse cx="19" cy="17.6" rx="3.6" ry="1.6" />${cut('M15.8 18a3.2 1.3 0 0 0 6.4 0', 1)}`,
};

// Optical centring: measured offset of each glyph's bounding box from the 24×24 centre.
const OFFSET = {
  back: [-0.6, 0], check: [0, 0.4], warn: [0, -0.5], refresh: [0.25, -0.35], bot: [0, -0.75], skull: [0, -0.45],
  book: [0, 0.5], plain: [0, -1.25], crown: [0, 1], fog: [-0.4, 0.1], bag: [0, 0.5], boot: [-0.75, -0.5],
  bomb: [1.9, -0.45], bowl: [-2.15, 0.15], invader: [0, -0.85], spade: [0, -1.8],
};

// Cada icono lleva sus dos versiones y el CSS muestra la del tema: la vectorial en las mesas
// normales y la píxel 16×16 (art/iconos/) en las píxel. Así cambiar de mesa no obliga a repintar.
export function Icon({ name, size = 18 }) {
  if (PIECE_TYPES.includes(name)) return html`<${PieceIcon} type=${name} size=${size} />`;
  const [dx, dy] = OFFSET[name] || [0, 0];
  return html`<svg class="icon icon-vec" width=${size} height=${size} viewBox=${`${dx} ${dy} 24 24`} fill="currentColor" aria-hidden="true">${P[name]}</svg>${PIXEL_ICONS[name] && html`<svg class="icon icon-px" width=${size} height=${size} viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d=${PIXEL_ICONS[name]} /></svg>`}`;
}

// `paper` keeps the printed look (cards, lists); the moments pass false so they wear the table's art set.
export function PieceIcon({ type, size = 28, side = 'dark', paper = true }) {
  return html`<span class=${'piece-icon side-' + side} style=${{ width: size + 'px', height: size + 'px' }} dangerouslySetInnerHTML=${{ __html: pieceSVG(type, { fit: true, paper }) }} />`;
}
