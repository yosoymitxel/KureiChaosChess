// Piece silhouettes as inline SVG. Colours come from CSS custom properties on the
// parent (--pc body, --pc-2 detail, --ink outline), so themes recolour without rebuilding.
// Every piece rests on y = 40 so the foot lands on the centre of its token base.
const F = 'var(--pc)', F2 = 'var(--pc-2)', S = 'var(--ink)';
const g = (body) => `<g fill="${F}" stroke="${S}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;

// Staunton plinth shared by the invented pieces, so they read as one family with the classics.
const PLINTH = `<path d="M9.5 40h26v-3.2c0-.8-.6-1.3-1.4-1.3H10.9c-.8 0-1.4.5-1.4 1.3z"/><path d="M12.5 35.5l1.6-3.2h16.8l1.6 3.2z"/>`;
const detail = (d, w = 1.4) => `<path d="${d}" fill="none" stroke="${F2}" stroke-width="${w}"/>`;

const BODIES = {
  king: g(`<path d="M22.5 11.6V6M20 8h5" fill="none"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 39.5c5.5 2.5 15.5 2.5 21 0v-9.5s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V26v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/>${detail('M11.5 32c5.5-3 15.5-3 21 0M11.5 35.5c5.5-3 15.5-3 21 0')}`),
  queen: g(`<path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 28c8.5-1.5 21-1.5 27 0l2-14-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z"/><path d="M9 28c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1 1 0 1.8 1 2 6.5 1 15.5 1 22 0 1-.2 2-1 1-2 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/>${detail('M11.5 32c3.5-1 18.5-1 22 0')}`),
  rook: g(`<path d="M9 40h27v-3H9zM12 37v-4h21v4zM11 15v-5h4v2h5v-2h5v2h5v-2h4v5"/><path d="M34 15l-3 3H14l-3-3z"/><path d="M31 18v12.5H14V18"/><path d="M31 30.5l1.5 2.5h-20l1.5-2.5z"/>${detail('M11 15h23M15 24h15')}`),
  bishop: g(`<path d="M9 38c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2H6c1.4-1.5 3-2 3-2z"/><path d="M15 34c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>${detail('M17.5 28h10M22.5 17.5v5M20 20h5')}`),
  knight: g(`<path d="M22 11c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 19c.4 2.9-5.6 7.4-8 9-3 2-2.8 4.3-5 4-1-.9 1.4-3 0-3-1 0 .2 1.2-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.9-1.9 2-3.5c-.7-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.8-2 2.5-3c1 0 1 3 1 3"/><circle cx="14.5" cy="16.5" r="1" fill="${S}"/>${detail('M27 14c3 1.5 6.5 6 7 20')}`),
  pawn: g(`<path d="M22.5 10c-2.2 0-4 1.8-4 4 0 .9.3 1.7.8 2.4-2 1.1-3.3 3.2-3.3 5.6 0 2 .9 3.8 2.4 5-3 1.1-7.4 5.6-7.4 13h23c0-7.4-4.4-11.9-7.4-13 1.5-1.2 2.4-3 2.4-5 0-2.4-1.3-4.5-3.3-5.6.5-.7.8-1.5.8-2.4 0-2.2-1.8-4-4-4z"/>`),

  // Guardia: foot soldier, crested helmet on a short column.
  guard: g(`${PLINTH}<path d="M15.5 32.3c1.2-3.6 2.2-7.4 2.4-11.3h9.2c.2 3.9 1.2 7.7 2.4 11.3z"/><path d="M15.5 21h14v-2.6h-14z"/><path d="M14.5 18.4c0-6 3.6-10.4 8-10.4s8 4.4 8 10.4z"/><path d="M22.5 8c-.4-2.6 1.2-4.6 4.6-5.2-.9 1.6-.3 3-1.3 4.6-1 .4-2.2.6-3.3.6z" fill="${F2}"/>${detail('M18 14.2h9M22.5 14.2v4.2', 1.6)}`),
  // Consejero: hooded sage with a tassel; steps diagonally like a court advisor.
  advisor: g(`${PLINTH}<path d="M14.5 32.3c1.5-4 2.6-8.6 2.6-12.8h10.8c0 4.2 1.1 8.8 2.6 12.8z"/><path d="M22.5 6.5c-4.6 0-7.2 5-7.2 10.4 0 1.2.3 2 .8 2.6h12.8c.5-.6.8-1.4.8-2.6 0-5.4-2.6-10.4-7.2-10.4z"/><path d="M22.5 11.5c-2.1 0-3.4 2.1-3.4 4.6h6.8c0-2.5-1.3-4.6-3.4-4.6z" fill="${F2}"/><circle cx="22.5" cy="4.6" r="1.8"/>${detail('M17 25.5h11M18 29h9')}`),
  // Elefante: profile head with ear, trunk curling forward and a tusk.
  elephant: g(`${PLINTH}<path d="M31 32.3c1.6-2.8 2.4-5.8 2.4-9.3 0-7-4.8-12-11.2-12-5.8 0-10.4 4.2-10.4 10 0 2.4.8 4.4 2 5.8-.9 1.4-2.5 2.8-4.3 3-1.4.2-1.9 1.9-.6 2.4 3.2 1.2 6.6-.6 8.4-3.1.8.3 1.7.5 2.6.5-.2 1-.4 1.8-.8 2.7z"/><path d="M24.5 14.5c4.6-1.6 8.6.8 8.6 6 0 3.2-2 5.6-5 6.3-1.8-3.8-3-8-3.6-12.3z" fill="${F2}"/><circle cx="17.6" cy="18.6" r="1.1" fill="${S}" stroke="none"/><path d="M19.6 25.2c-.6 2.2.1 4 1.9 4.9" fill="none" stroke="${S}" stroke-width="2.6"/><path d="M19.6 25.2c-.6 2.2.1 4 1.9 4.9" fill="none" stroke="var(--side-light, #f5efe0)" stroke-width="1.2"/>`),
  // Camello: long curved neck, drooping snout, small ear.
  camel: g(`${PLINTH}<path d="M27 32.3c.4-5.4 3.4-9.6 6.6-9.6s5 3.4 4.4 9.6z"/><path d="M32 32.3c-.2-6.6-1.6-11-3.6-14.4-1.4-2.4-1.9-4.6-1.9-7.6 0-2.6-1.9-4.3-4.4-4.3h-4.4c-2 0-3.5.9-4.5 2.4l-2.2 3.4c-.6 1 0 2.2 1.2 2.2h3.6c1.2 0 2 .9 2 2.1 0 3.9 1.4 6.9 3.4 9.8 1.4 2 1.6 4.4 1.2 6.4z"/><path d="M24.2 6.2l1.2-2.8 1.6 3" /><circle cx="20" cy="9.4" r="1" fill="${S}" stroke="none"/>${detail('M12.4 11.9h2.4M29 22c.8 2.8 1.2 6 1.2 9.6')}`),
  // Cañón: barrel raised on a spoked wheel, sitting on the plinth.
  cannon: g(`${PLINTH}<path d="M12.8 28l18-12 3.6 5.6-18 12z"/><path d="M29.6 14.6l4.2-2.8 5 7.6-4.2 2.8z"/><circle cx="18.6" cy="27.4" r="5.6"/><circle cx="18.6" cy="27.4" r="1.7" fill="${F2}"/>${detail('M18.6 22.6v9.6M13.8 27.4h9.6')}`),
};

export function pieceSVG(type) {
  return `<svg viewBox="0 0 45 41" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${BODIES[type] || BODIES.pawn}</svg>`;
}
