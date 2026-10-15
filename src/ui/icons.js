// Stamped icon set: solid ink silhouettes with details cut out in the surface colour
// (--icon-cut), like the pictograms printed in a board-game rulebook.
import { html } from './lib.js';
import { pieceSVG } from '../view/piece-art.js';
import { PIECE_TYPES } from '../data/pieces.js';

const CUT = 'var(--icon-cut, var(--paper))';
const cut = (d, w = 1.8) => html`<path d=${d} fill="none" stroke=${CUT} stroke-width=${w} stroke-linecap="round" stroke-linejoin="round" />`;
const dot = (cx, cy, r = 1.4) => html`<circle cx=${cx} cy=${cy} r=${r} fill=${CUT} />`;

const P = {
  pause: html`<rect x="5" y="4" width="5" height="16" rx="1.5" /><rect x="14" y="4" width="5" height="16" rx="1.5" />`,
  back: html`<path d="M14.5 4.5L6 12l8.5 7.5 2.3-2.6L11.2 12l5.6-4.9z" />`,
  check: html`<path d="M3.5 12.5l2.6-2.6 4.3 4.3 7.5-8.7 2.6 2.4-10 11.4z" />`,
  warn: html`<path d="M12 2.5L22.5 20.5h-21z" />${cut('M12 9v5')}${dot(12, 17.2, 1.2)}`,
  refresh: html`<path d="M12 4a8 8 0 1 0 7.7 10.2l-3-.9A4.9 4.9 0 1 1 15.4 8.4L13 10.8h7.5V3.3l-2.9 2.9A8 8 0 0 0 12 4z" />`,
  bot: html`<rect x="3.5" y="7" width="17" height="13" rx="3.5" /><rect x="10.7" y="2.5" width="2.6" height="5" rx="1" />${dot(8.7, 13, 1.7)}${dot(15.3, 13, 1.7)}${cut('M9 17h6', 1.6)}`,
  human: html`<circle cx="12" cy="7.5" r="4.5" /><path d="M3.5 21c0-5 3.8-8.3 8.5-8.3s8.5 3.3 8.5 8.3z" />`,
  map: html`<path d="M2.5 5.5l6-2.5 7 2.5 6-2.5v15.5l-6 2.5-7-2.5-6 2.5z" />${cut('M8.5 3v15.5M15.5 5.5V21', 1.4)}${cut('M11 10.5l2 2m0-2l-2 2', 1.4)}`,
  trophy: html`<path d="M6 3h12v5.5a6 6 0 0 1-12 0z" /><path d="M6 5H3v2a4 4 0 0 0 3.6 4M18 5h3v2a4 4 0 0 1-3.6 4" fill="none" stroke="currentColor" stroke-width="2" /><rect x="10.5" y="13.5" width="3" height="4" /><rect x="7" y="17.5" width="10" height="3.5" rx="1" />`,
  skull: html`<path d="M12 2.5c-5 0-8.5 3.6-8.5 8.3 0 2.7 1.2 4.6 3 5.8v4h11v-4c1.8-1.2 3-3.1 3-5.8 0-4.7-3.5-8.3-8.5-8.3z" />${dot(8.7, 11.5, 2.1)}${dot(15.3, 11.5, 2.1)}${cut('M10 17.5v3M14 17.5v3', 1.4)}`,
  book: html`<path d="M2.5 4.5c3.5-1 6.5-.5 9 1.5v15c-2.5-2-5.5-2.5-9-1.5zM21.5 4.5c-3.5-1-6.5-.5-9 1.5v15c2.5-2 5.5-2.5 9-1.5z" />${cut('M5 9c1.8-.3 3.2 0 4.5.6M5 12.5c1.8-.3 3.2 0 4.5.6M19 9c-1.8-.3-3.2 0-4.5.6', 1.3)}`,
  flag: html`<rect x="4" y="2.5" width="2.4" height="19" rx="1" /><path d="M6.4 3.5h13l-3 4.5 3 4.5h-13z" />`,
  gear: html`${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => html`<rect x="10.2" y="1.8" width="3.6" height="5" rx="1" transform=${`rotate(${a} 12 12)`} />`)}<circle cx="12" cy="12" r="7.4" /><circle cx="12" cy="12" r="3" fill=${CUT} />`,
  // Modifiers
  plain: html`<path d="M12 4l9.5 5.5L12 15 2.5 9.5z" /><path d="M2.5 9.5V12L12 17.5 21.5 12V9.5L12 15z" opacity=".55" />`,
  crown: html`<path d="M3 18.5L2 7l5.3 4.3L12 4l4.7 7.3L22 7l-1 11.5z" /><rect x="3" y="19.5" width="18" height="2.5" rx="1" />${dot(12, 13.5, 1.5)}`,
  collapse: html`<path d="M12 3l9.5 5.5L12 14 2.5 8.5z" />${cut('M9.5 5l2.2 2.4-1.6 2 2.6 2.6', 1.6)}<path d="M5.5 16.5l2.5 1.5-1 3.5-2.8-1.6zM16 17.5l3-1.5.8 3.4-2.6 1.6z" />`,
  rush: html`<path d="M5.5 2.5h13v2.3c0 3-2.2 5.3-4.8 7.2 2.6 1.9 4.8 4.2 4.8 7.2v2.3h-13v-2.3c0-3 2.2-5.3 4.8-7.2C7.7 10.1 5.5 7.8 5.5 4.8z" />${cut('M9 6.5h6M12 15.5l-3 3.5h6z', 1.5)}`,
  fog: html`<path d="M6.5 17.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.2 3.9 3.9 0 0 1-.4 7.8z" />${cut('M2.5 14h6M15 19.5h6.5', 1.8)}`,
  boss: html`<path d="M5 12c0-4.4 3.1-7.5 7-7.5s7 3.1 7 7.5v5.5H5z" /><path d="M5.5 10.5C3 9.5 1.8 7 2 3.5c1.6 2.2 3.4 3 5.4 3M18.5 10.5c2.5-1 3.7-3.5 3.5-7-1.6 2.2-3.4 3-5.4 3" /><rect x="4" y="17.5" width="16" height="3.5" rx="1" />${cut('M8 12.5h3M13 12.5h3M12 13v4.5', 1.8)}`,
  rest: html`<path d="M12 2.5c3.5 3.2 5 6 5 8.6a5 5 0 0 1-10 0c0-1.8.8-3.3 2.2-4.6.2 1.6 1 2.6 2.1 3-.4-2.3-.2-4.5.7-7z" /><path d="M3.5 18.5l17-3.5.6 2.8-17 3.5zM20.5 18.5l-17-3.5-.6 2.8 17 3.5z" />`,
  bag: html`<path d="M8.5 6.5h7l-1.5-3h-4z" /><path d="M9 6.5c-4 2.2-6.5 6-6.5 9.7 0 3.1 2.4 5.3 6 5.3h7c3.6 0 6-2.2 6-5.3 0-3.7-2.5-7.5-6.5-9.7z" />${cut('M8.5 8.5h7', 1.6)}<circle cx="12" cy="15" r="3" fill="none" stroke=${CUT} stroke-width="1.6" />`,
  // Rewards
  scroll: html`<rect x="5.5" y="5" width="13" height="14" /><rect x="3" y="2.5" width="18" height="4" rx="2" /><rect x="3" y="17.5" width="18" height="4" rx="2" />${cut('M8.5 10h7M8.5 13.5h5', 1.5)}`,
  boot: html`<path d="M7 2.5h6.5l-.5 9 6.5 3.3c1.3.7 2 1.8 2 3.2v2.5H4.5V16c0-1.5.8-2.2 1.5-3z" />${cut('M7.5 7h4M7 10.5h4', 1.4)}<path d="M1.5 6.5h4M1 10h4.5M2 13.5h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />`,
  flask: html`<path d="M9 2.5h6v2h-1v4.6l5.7 9.4c1 1.7-.2 3.5-2 3.5H6.3c-1.8 0-3-1.8-2-3.5L10 9.1V4.5H9z" />${cut('M7.5 15.5h9', 1.6)}${dot(10.5, 18.3, 1.1)}${dot(14, 17.8, 0.8)}`,
};

// Optical centring: measured offset of each glyph's bounding box from the 24×24 centre.
const OFFSET = {
  back: [-0.6, 0], check: [0, 0.4], warn: [0, -0.5], refresh: [0.25, -0.35], bot: [0, -0.75], skull: [0, -0.45],
  book: [0, 0.5], plain: [0, -1.25], crown: [0, 1], fog: [-0.4, 0.1], bag: [0, 0.5], boot: [-0.75, -0.5],
};

export function Icon({ name, size = 18 }) {
  if (PIECE_TYPES.includes(name)) return html`<${PieceIcon} type=${name} size=${size} />`;
  const [dx, dy] = OFFSET[name] || [0, 0];
  return html`<svg class="icon" width=${size} height=${size} viewBox=${`${dx} ${dy} 24 24`} fill="currentColor" aria-hidden="true">${P[name]}</svg>`;
}

export function PieceIcon({ type, size = 28, side = 'dark' }) {
  return html`<span class=${'piece-icon side-' + side} style=${{ width: size + 'px', height: size + 'px' }} dangerouslySetInnerHTML=${{ __html: pieceSVG(type, { fit: true }) }} />`;
}
