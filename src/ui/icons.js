import { html } from './lib.js';
import { pieceSVG } from '../view/piece-art.js';
import { PIECE_TYPES } from '../data/pieces.js';

const P = {
  pause: html`<rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/>`,
  back: html`<polyline points="15 18 9 12 15 6"/>`,
  arrow: html`<polyline points="9 6 15 12 9 18"/>`,
  check: html`<polyline points="5 13 10 18 20 7"/>`,
  eye: html`<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>`,
  warn: html`<path d="M12 3l10 17H2z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r=".8" fill="currentColor"/>`,
  refresh: html`<path d="M21 12a9 9 0 0 1-15 7l-3-3"/><polyline points="3 21 3 16 8 16"/><path d="M3 12a9 9 0 0 1 15-7l3 3"/><polyline points="21 3 21 8 16 8"/>`,
  bot: html`<rect x="4" y="9" width="16" height="11" rx="3"/><circle cx="9" cy="14.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="14.5" r="1.6" fill="currentColor" stroke="none"/><line x1="12" y1="4" x2="12" y2="9"/>`,
  human: html`<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  home: html`<path d="M3 12l9-9 9 9"/><path d="M6 10v10h12V10"/>`,
  trophy: html`<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="8" y1="20" x2="16" y2="20"/>`,
  skull: html`<path d="M6 12a6 6 0 0 1 12 0v5l-1.5 1.5v1h-2l-1-1.5h-3l-1 1.5h-2v-1L6 17z"/><circle cx="9.8" cy="11.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="14.2" cy="11.5" r="1.5" fill="currentColor" stroke="none"/>`,
  plain: html`<path d="M2 19l6-9 4 4 4-7 6 12z" fill="currentColor" stroke="none"/>`,
  crown: html`<path d="M3 19L2 8l5 4 5-8 5 8 5-4-1 11z" fill="currentColor" stroke="none"/>`,
  bolt: html`<polygon points="13 2 4 14 11 14 9 22 20 10 13 10" fill="currentColor" stroke="none"/>`,
  fog: html`<path d="M3 7q3-2 6 0t6 0 6 0M3 12q3-2 6 0t6 0 6 0M3 17q3-2 6 0t6 0 6 0" stroke-width="2.2"/>`,
  boss: html`<path d="M4 8l4 3 4-7 4 7 4-3-2 12H6z" fill="currentColor" stroke="none"/><circle cx="9.5" cy="14" r="1.3" fill="var(--paper)" stroke="none"/><circle cx="14.5" cy="14" r="1.3" fill="var(--paper)" stroke="none"/>`,
  collapse: html`<path d="M3 6h18v5H3z" fill="currentColor" stroke="none"/><path d="M6 14l2 6M12 14v7M18 14l-2 6"/>`,
  heart: html`<path d="M12 21s-7-4.5-9-9.5C1.5 8 3.5 5 6.5 5c2 0 3.5 1 4.5 2.5C12 6 13.5 5 15.5 5c3 0 5 3 3.5 6.5C17 16.5 12 21 12 21z" fill="currentColor" stroke="none"/>`,
  shield: html`<path d="M12 3l8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6z"/><polyline points="8 12 11 15 16 9"/>`,
  coin: html`<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9 9.5h4.5a1.75 1.75 0 0 1 0 3.5h-3a1.75 1.75 0 0 0 0 3.5H15"/>`,
  book: html`<path d="M4 4h7v16H4zM13 4h7v16h-7z"/>`,
  star: html`<path d="M12 2l3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1z" fill="currentColor" stroke="none"/>`,
  layers: html`<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>`,
  dice: html`<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/>`,
  flag: html`<path d="M5 21V4h11l-2 4 2 4H5"/>`,
};

export function Icon({ name, size = 18 }) {
  if (PIECE_TYPES.includes(name)) return html`<${PieceIcon} type=${name} size=${size} />`;
  return html`<svg class="icon" width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.star}</svg>`;
}

export function PieceIcon({ type, size = 28, side = 'dark' }) {
  return html`<span class=${'piece-icon side-' + side} style=${{ width: size + 'px', height: size + 'px' }} dangerouslySetInnerHTML=${{ __html: pieceSVG(type) }} />`;
}
