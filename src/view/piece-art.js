// Piece silhouettes as inline SVG. Colours come from CSS custom properties on the
// parent (--pc body, --pc-2 detail, --ink outline), so themes recolour without rebuilding.
const F = 'var(--pc)', F2 = 'var(--pc-2)', S = 'var(--ink)';
const g = (body, fill = F) => `<g fill="${fill}" stroke="${S}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;

const BODIES = {
  king: g(`<path d="M22.5 11.6V6M20 8h5" fill="none"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0" fill="none" stroke="${F2}"/>`),
  queen: g(`<path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0" fill="none" stroke="${F2}"/>`),
  rook: g(`<path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23M15 22h15" fill="none" stroke="${F2}"/>`),
  bishop: g(`<path d="M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-1.9 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M17.5 26h10M22.5 15.5v5M20 18h5" fill="none" stroke="${F2}"/>`),
  knight: g(`<path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.4 2.9-5.6 7.4-8 9-3 2-2.8 4.3-5 4-1-.9 1.4-3 0-3-1 0 .2 1.2-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.9-1.9 2-3.5c-.7-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.8-2 2.5-3c1 0 1 3 1 3"/><circle cx="14.5" cy="15.5" r="1" fill="${S}"/><path d="M27 13c3 1.5 6.5 6 7 20" fill="none" stroke="${F2}"/>`),
  pawn: g(`<path d="M22.5 9c-2.2 0-4 1.8-4 4 0 .9.3 1.7.8 2.4-2 1.1-3.3 3.2-3.3 5.6 0 2 .9 3.8 2.4 5-3 1.1-7.4 5.6-7.4 13.5h23c0-7.9-4.4-12.4-7.4-13.5 1.5-1.2 2.4-3 2.4-5 0-2.4-1.3-4.5-3.3-5.6.5-.7.8-1.5.8-2.4 0-2.2-1.8-4-4-4z"/>`),
  guard: g(`<path d="M22.5 6L35 11v13c0 8-5.5 14-12.5 17C15.5 38 10 32 10 24V11z"/><path d="M22.5 10L31 13.5V24c0 6-4 10-8.5 12.5C18 34 14 30 14 24V13.5z" fill="none" stroke="${F2}"/><path d="M22.5 14v20M15 24h15" stroke="${F2}"/>`),
  advisor: g(`<path d="M22.5 5L34 19l-4 3v16H15V22l-4-3z"/><circle cx="22.5" cy="13" r="2.5" fill="${F2}" stroke="none"/><path d="M15 25h15" stroke="${F2}" stroke-width="2.4"/>`),
  elephant: g(`<path d="M9 20q0-11 6-14 5-2 7.5 2 2.5-4 7.5-2 6 3 6 14v13q0 7-3 9H12q-3-2-3-9z"/><circle cx="17" cy="15" r="2" fill="${F2}" stroke="none"/><circle cx="28" cy="15" r="2" fill="${F2}" stroke="none"/><path d="M22.5 20v14q0 3 3 3" fill="none" stroke="${F2}"/>`),
  camel: g(`<path d="M10 38q0-18 4-25 3-7 8.5 0 5.5-7 8.5 0 4 7 4 25v4H10z"/><circle cx="17" cy="16" r="1.6" fill="${F2}" stroke="none"/><circle cx="28" cy="16" r="1.6" fill="${F2}" stroke="none"/><path d="M14 30h17" fill="none" stroke="${F2}"/>`),
  cannon: g(`<rect x="5" y="17" width="27" height="11" rx="3"/><circle cx="33" cy="22.5" r="6.5"/><circle cx="33" cy="22.5" r="2.4" fill="${F2}" stroke="none"/><path d="M11 28h22v10H11z"/><path d="M8 42h28v-4H8z"/>`),
};

export function pieceSVG(type) {
  return `<svg viewBox="0 0 45 45" aria-hidden="true">${BODIES[type] || BODIES.pawn}</svg>`;
}
