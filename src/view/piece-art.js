// Piece silhouettes as inline SVG. Colours come from CSS custom properties on the
// parent (--pc body, --pc-2 detail, --ink outline), so themes recolour without rebuilding.
// Every piece is a body standing on one shared plinth; the body is normalised by code
// (measured box -> target height on a fixed ladder) so the set reads as a single family.
import { PIXEL_PIECES, PIXEL_META } from './pixel-pieces.js';

const F = 'var(--pc)', F2 = 'var(--pc-2)', S = 'var(--ink)';
const STROKE = 1.6;
const detail = (d, w = 1.4) => `<path d="${d}" fill="none" stroke="${F2}" stroke-width="${w}"/>`;

const PLINTH = `<path d="M9.5 40h26v-3.2c0-.8-.6-1.3-1.4-1.3H10.9c-.8 0-1.4.5-1.4 1.3z"/><path d="M12.5 35.5l1.6-3.2h16.8l1.6 3.2z"/>`;
const PLINTH_TOP = 32.6; // bodies overlap the collar slightly so no gap shows
const CX = 22.5;

// Raw bodies without any base, in their original drawing coordinates.
const BODIES = {
  pawn: `<path d="M22.5 9c-2.2 0-4 1.8-4 4 0 .9.3 1.7.8 2.4-2 1.1-3.3 3.2-3.3 5.6 0 2 .9 3.8 2.4 5-2.6 1-5.4 3.8-6 7.8h20.2c-.6-4-3.4-6.8-6-7.8 1.5-1.2 2.4-3 2.4-5 0-2.4-1.3-4.5-3.3-5.6.5-.7.8-1.5.8-2.4 0-2.2-1.8-4-4-4z"/>`,
  rook: `<path d="M11 15v-5h4v2h5v-2h5v2h5v-2h4v5"/><path d="M34 15l-3 3H14l-3-3z"/><path d="M31 18v12.5H14V18"/><path d="M31 30.5l1.5 2.5h-20l1.5-2.5z"/>${detail('M11 15h23M15 24h15')}`,
  bishop: `<path d="M15 34c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>${detail('M17.5 28h10M22.5 17.5v5M20 20h5')}`,
  knight: `<path d="M22 11c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 19c.4 2.9-5.6 7.4-8 9-3 2-2.8 4.3-5 4-1-.9 1.4-3 0-3-1 0 .2 1.2-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.9-1.9 2-3.5c-.7-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.8-2 2.5-3c1 0 1 3 1 3"/><circle cx="14.5" cy="16.5" r="1" fill="${S}"/>${detail('M27 14c3 1.5 6.5 6 7 20')}`,
  queen: `<path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 28c8.5-1.5 21-1.5 27 0l2-14-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14z"/><path d="M9 28c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1 1 0 1.8 1 2 6.5 1 15.5 1 22 0 1-.2 2-1 1-2 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/>${detail('M11.5 32c3.5-1 18.5-1 22 0')}`,
  king: `<path d="M22.5 11.6V6M20 8h5" fill="none"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M12.5 39.5c5.5 2.5 14.5 2.5 20 0V30C32.5 30 41.5 25.5 38.5 19.5 34.5 13 25 16 22.5 23.5V26v-2.5C20 16 10.5 13 6.5 19.5 3.5 25.5 12.5 30 12.5 30z"/>${detail('M12.5 32c5-3 15-3 20 0M12.5 35.5c5-3 15-3 20 0')}`,
  // Guardia: foot soldier, crested helmet on a short column.
  guard: `<path d="M15.5 32.3c1.2-3.6 2.2-7.4 2.4-11.3h9.2c.2 3.9 1.2 7.7 2.4 11.3z"/><path d="M15.5 21h14v-2.6h-14z"/><path d="M14.5 18.4c0-6 3.6-10.4 8-10.4s8 4.4 8 10.4z"/><path d="M22.5 8.2c-2-1.6-2.4-3.9-0-6.2 2.4 2.3 2 4.6 0 6.2z" fill="${F2}"/>${detail('M18 14.2h9M22.5 14.2v4.2', 1.6)}`,
  // Consejero: hooded sage with a tassel; steps diagonally like a court advisor.
  advisor: `<path d="M14.5 32.3c1.5-4 2.6-8.6 2.6-12.8h10.8c0 4.2 1.1 8.8 2.6 12.8z"/><path d="M22.5 6.5c-4.6 0-7.2 5-7.2 10.4 0 1.2.3 2 .8 2.6h12.8c.5-.6.8-1.4.8-2.6 0-5.4-2.6-10.4-7.2-10.4z"/><path d="M22.5 11.5c-2.1 0-3.4 2.1-3.4 4.6h6.8c0-2.5-1.3-4.6-3.4-4.6z" fill="${F2}"/><circle cx="22.5" cy="4.6" r="1.8"/>${detail('M17 25.5h11M18 29h9')}`,
  // Elefante: profile head with ear, trunk curling forward and a tusk.
  elephant: `<path d="M31 32.3c1.6-2.8 2.4-5.8 2.4-9.3 0-7-4.8-12-11.2-12-5.8 0-10.4 4.2-10.4 10 0 2.4.8 4.4 2 5.8-.9 1.4-2.5 2.8-4.3 3-1.4.2-1.9 1.9-.6 2.4 3.2 1.2 6.6-.6 8.4-3.1.8.3 1.7.5 2.6.5-.2 1-.4 1.8-.8 2.7z"/><path d="M24.5 14.5c4.6-1.6 8.6.8 8.6 6 0 3.2-2 5.6-5 6.3-1.8-3.8-3-8-3.6-12.3z" fill="${F2}"/><circle cx="17.6" cy="18.6" r="1.1" fill="${S}" stroke="none"/><path d="M19.6 25.2c-.6 2.2.1 4 1.9 4.9" fill="none" stroke="${S}" stroke-width="2.6"/><path d="M19.6 25.2c-.6 2.2.1 4 1.9 4.9" fill="none" stroke="var(--side-light, #f5efe0)" stroke-width="1.2"/>`,
  // Camello: thick curved neck, drooping snout, small ear, big hump behind.
  camel: `<path d="M25.5 32.3c0-8.4 4.8-13.8 9.8-13.8s7.4 5.2 6.2 13.8z"/><path d="M33 32.3c-.2-6.6-1.4-11-3.2-14.4-1.3-2.4-1.8-4.6-1.8-7.6 0-2.6-2-4.3-4.6-4.3h-4.6c-2 0-3.5.9-4.5 2.4l-2.4 3.6c-.6 1 0 2.2 1.2 2.2h3.6c1.2 0 2 .9 2 2.1 0 3.6-.4 6.4-1.4 9.4-.8 2.4-1.2 4.4-1.2 6.6z"/><path d="M24.4 6.2l1.2-2.8 1.6 3"/><circle cx="20" cy="9.6" r="1" fill="${S}" stroke="none"/>${detail('M12.4 12.2h2.4M30.2 21.5c.9 3 1.3 6.6 1.3 10.4M36 21.5c1.6 1.4 2.6 3.4 2.9 6')}`,
  // Cañón: mortar-style bombard, barrel raised steeply on a carriage, with a wheel and trunnion.
  cannon: `<path d="M13 32.3l2-7h15l2 7z"/><path d="M16.57 21.62L25.93 8.14L32.07 11.86L24.43 26.38Z"/><path d="M23.82 10.24L25.38 7.68L32.72 12.14L31.16 14.7Z"/><ellipse cx="29.1" cy="9.3" rx="2.5" ry="1.1" transform="rotate(31 29.1 9.3)" fill="${F2}"/><circle cx="19.4" cy="25.6" r="2.3"/><circle cx="21.8" cy="21.4" r="2.1" fill="${F2}"/><circle cx="15" cy="28.4" r="3.9"/><circle cx="15" cy="28.4" r="1.2" fill="${F2}"/>${detail('M15 24.9v7M11.5 28.4h7', 1.1)}`,
};

// Bosses are their own family: creatures and siege engines instead of chessmen, standing on a
// wider stepped dais, all with brass eyes or lights so a boss reads as one at a glance.
const EYE = 'var(--brass)';
const eyes = (...pts) => pts.map(([x, y, r = 1.1]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${EYE}" stroke="${S}" stroke-width="0.7"/>`).join('');
// Thick limb or neck: an ink stroke with a body-coloured stroke inside, so it reads as one outlined shape.
const limb = (d, w = 4) => `<path d="${d}" fill="none" stroke="${S}" stroke-width="${w + 2.2}"/><path d="${d}" fill="none" stroke="${F}" stroke-width="${w}"/>`;
const fangs = (xs, y, dir) => xs.map((x) => `<path d="M${x - 1.4} ${y}L${x} ${y + dir * 3.2}L${x + 1.4} ${y}z" stroke-width="0.7"/>`).join('');
Object.assign(BODIES, {
  // Titán: crowned great helm on broad armoured shoulders.
  'boss-titan': `<path d="M6 34c0-8 2-12 6-14l4-1v-3h13v3l4 1c4 2 6 6 6 14z"/><path d="M16.5 9.5l1.6-4.5 2 3.2 2.4-5 2.4 5 2-3.2 1.6 4.5z" fill="${F2}"/><path d="M15.5 17c0-6.5 3-10 7-10s7 3.5 7 10z"/><path d="M17.5 12.6h10" stroke="${S}" stroke-width="2.4"/>${eyes([20.3, 12.6, 0.9], [24.7, 12.6, 0.9])}${detail('M14 27c5 2.2 12 2.2 17 0M12 20v8M33 20v8')}`,
  // Ariete: ram's head with curled horns over the shoulders of the siege engine.
  'boss-ram': `<path d="M9.5 34c0-6 4-8.5 8.5-9h9c4.5.5 8.5 3 8.5 9z"/>${limb('M17.5 12.5c-5.5-4-12-1-11 5.5.6 4 5 5.2 7.2 2.6 1.6-2-.2-4.2-2-3.6')}${limb('M27.5 12.5c5.5-4 12-1 11 5.5-.6 4-5 5.2-7.2 2.6-1.6-2 .2-4.2 2-3.6')}<path d="M17 13.5c0-4 2.5-6 5.5-6s5.5 2 5.5 6l-1 10.5c-.5 3.5-2.2 5.5-4.5 5.5s-4-2-4.5-5.5z"/>${eyes([20, 15], [25, 15])}${detail('M21 26.5h3M22.5 18v5')}`,
  // Hidra: three serpent necks rising from one coiled body.
  'boss-hydra': `${limb('M17 28c-4-5-7-10-6.5-15.5', 3.6)}${limb('M28 28c4-5 7-10 6.5-15.5', 3.6)}${limb('M22.5 27c0-7-1.5-12 0-18', 3.6)}<path d="M7 34c0-7 6-10 15.5-10S38 27 38 34z"/><ellipse cx="10.5" cy="11.5" rx="3.2" ry="2.4"/><ellipse cx="34.5" cy="11.5" rx="3.2" ry="2.4"/><ellipse cx="22.5" cy="7.5" rx="3.2" ry="2.4"/>${eyes([9.6, 11, 0.8], [35.4, 11, 0.8], [21.6, 7, 0.8], [23.4, 7, 0.8])}${detail('M12 30c3.5-1.8 7-1.8 10.5 0 3.5-1.8 7-1.8 10.5 0')}`,
  // Gólem: stacked stone blocks with boulder shoulders and a small sunken head.
  'boss-golem': `<path d="M9 34l1-14h25l1 14z"/><path d="M4 24l2-7 7-1 2 6-4 4z"/><path d="M41 24l-2-7-7-1-2 6 4 4z"/><path d="M17 20l.5-9h10l.5 9z"/><path d="M18 13.2h9" stroke="${S}" stroke-width="1.4"/>${eyes([20.5, 15.4], [24.5, 15.4])}${detail('M15 23l3 3-1 4M30 22.5l-2 4 2 3M22.5 21v4M8 19.5l3 2.5M37 19.5l-3 2.5')}`,
  // Jinete: barded warhorse with a plume and a couched lance with a pennant.
  'boss-rider': `${limb('M36.4 2.5l1.6 30.5', 1.6)}<path d="M36.6 3.6l6.4 2.6-6.2 2.6z" fill="${F2}"/><path d="M14 34c0-8 3-12 5-16l-7 2c-2.5.5-4-1-3.2-3L15 9c2-3 5-4 8-3.5 7 1 11 7.5 10 28.5z"/><path d="M23 5.5c0-3 4-4.5 7-3.5-2 1-2.5 2.5-3 4.5z" fill="${F2}"/><path d="M15 9l4.5-2-1.5 7z" fill="${F2}"/>${eyes([17, 11])}${detail('M24.5 9c3.5 2 6 8 6.5 22M20 20l7-1.5')}`,
  // Muralla: a stretch of wall between two towers, gate shut, arrow slits lit.
  'boss-wall': `<path d="M3 34V12h2.6v-3h2.6v3h2.2v-3H12v9h2.5v-2h3v2h3v-2h4v2h3v-2h3v2H33V9h1.6v3h2.2V9h2.6v3H42v22z"/><path d="M18.5 34v-7c0-2.5 1.8-4 4-4s4 1.5 4 4v7z" fill="${F2}"/>${detail('M20.5 25v9M22.5 23v11M24.5 25v9', 0.9)}<path d="M7.5 17.5v3.5M37.5 17.5v3.5" stroke="${EYE}" stroke-width="1.6"/>${detail('M3 22h9M33 22h9M12 26h6.5M26.5 26H33')}`,
  // Devorador: a horned maw that swallows whatever it steps on.
  'boss-devourer': `<path d="M12 16l-3-8 7 5z"/><path d="M33 16l3-8-7 5z"/><path d="M6 34c-1-12 6-24 16.5-24S40 22 39 34z"/><path d="M11 25c3-5 20-5 23 0-3 6-20 6-23 0z" fill="${S}"/><g fill="${F}">${fangs([15, 19, 22.5, 26, 30], 22.3, 1)}${fangs([17, 20.8, 24.2, 28], 28.6, -1)}</g>${eyes([17, 16.5, 1.6], [28, 16.5, 1.6])}<path d="M17 15.3v2.4M28 15.3v2.4" stroke="${S}" stroke-width="0.8"/>${detail('M13 31c6 1.5 13 1.5 19 0')}`,
});

// Measured geometric boxes of each raw body [x, y, w, h] (getBBox, stroke excluded).
// Re-measure after editing a body (lab.html scene "Piezas" shows the result).
const BODY_BOX = {
  pawn: [12.4, 9, 20.2, 24.8], rook: [11, 10, 23, 23], bishop: [13.7, 7.5, 17.61, 28.38],
  knight: [6, 8, 32.03, 32], queen: [4, 5.5, 37, 35.25], king: [5.83, 6, 33.29, 35.38],
  guard: [14.5, 2.8, 16, 29.5], advisor: [14.5, 2.8, 16, 29.5], elephant: [8.15, 11, 25.25, 21.58],
  camel: [11.66, 3.4, 30.14, 28.9], cannon: [11.1, 7.07, 21.62, 25.23],
  // Bosses: measured with their thick limbs included.
  'boss-titan': [6, 3.2, 33, 30.8], 'boss-ram': [4.1, 7.5, 36.8, 26.5], 'boss-hydra': [7, 5.1, 31, 28.9],
  'boss-golem': [4, 11, 37, 23], 'boss-rider': [8.6, 1.4, 34.4, 32.7], 'boss-wall': [3, 9, 39, 25],
  'boss-devourer': [5.9, 8, 33.2, 26],
};
// The boss dais: a wide riveted slab under a second step, broader than any chessman's plinth.
const BOSS_PLINTH = `<path d="M4.5 40.5h36v-3c0-.8-.6-1.3-1.3-1.3H5.8c-.7 0-1.3.5-1.3 1.3z"/><path d="M8 36.2v-3.6h29v3.6z"/>${[8, 15, 22.5, 30, 37].map((x) => `<circle cx="${x}" cy="38.4" r="0.7" fill="${F2}" stroke="none"/>`).join('')}`;
const isBoss = (type) => type.startsWith('boss-');

// Height ladder above the plinth: value order follows the chess hierarchy; maxW keeps wide crowns in check.
// ax: x of the raw drawing that sits over the plinth centre (the knight balances on its neck, not its bbox).
// The guard's plume is light, so it may rise above the ladder like the original drawing did.
const LADDER = {
  pawn: { h: 18.5 }, rook: { h: 21.5 }, guard: { h: 25.5 }, cannon: { h: 23 }, elephant: { h: 22.5 },
  advisor: { h: 23.5 }, camel: { h: 24.5, maxW: 31, ax: 28.4 }, knight: { h: 24, ax: 25.5 }, bishop: { h: 25 },
  queen: { h: 26.5, maxW: 29 }, king: { h: 27.5, maxW: 29 },
  'boss-titan': { h: 29, maxW: 34 }, 'boss-ram': { h: 26, maxW: 36, ax: 22.5 }, 'boss-hydra': { h: 28.5, maxW: 34 },
  'boss-golem': { h: 25, maxW: 38 }, 'boss-rider': { h: 30, maxW: 32, ax: 23 }, 'boss-wall': { h: 23, maxW: 40 },
  'boss-devourer': { h: 26.5, maxW: 36 },
};

function layout(type) {
  const [x, y, w, h] = BODY_BOX[type];
  const { h: th, maxW = 30, ax = x + w / 2 } = LADDER[type];
  const s = Math.min(th / h, maxW / w);
  const tx = CX - ax * s, ty = PLINTH_TOP - (y + h) * s;
  return { s, tx, ty, top: PLINTH_TOP - h * s, left: CX - (ax - x) * s, right: CX + (x + w - ax) * s };
}

// Volumen: la misma silueta otra vez, sin tinta y rellena con una luz que entra desde arriba a la
// izquierda (como en el jardín): brillo de un lado, sombra del otro. Cada parte se ilumina por su
// cuenta, así se lee la forma (el cuello del caballo, el cuerpo del rey, los escalones de la peana)
// sin dibujar sombras a mano, y vale para cualquier dibujo nuevo.
const SHADE = `<defs><linearGradient id="pc-shade" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient></defs>`;
const cache = new Map();
function art(type) {
  if (!BODIES[type]) type = 'pawn';
  if (!cache.has(type)) {
    const L = layout(type);
    const body = `<g transform="translate(${L.tx.toFixed(2)} ${L.ty.toFixed(2)}) scale(${L.s.toFixed(4)})" stroke-width="${(STROKE / L.s).toFixed(3)}">${BODIES[type]}</g>`;
    const base = isBoss(type) ? BOSS_PLINTH : PLINTH;
    cache.set(type, { L, svg: `${SHADE}<g fill="${F}" stroke="${S}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">${body}${base}</g><g class="pc-light" fill="url(#pc-shade)" stroke="none" pointer-events="none">${body}${base}</g>` });
  }
  return cache.get(type);
}

// Set píxel de la mesa Pixelada (arte en art/pixelada.px.js, PNG incrustados por tools/pixel-art.mjs).
// El PNG ya trae color y contorno: el SVG apila los tres bandos y board.css muestra el que toca.
const PX = 2; // unidades del lienzo (45×41) por píxel de arte
const PX_BOTTOM = 40.5; // la misma línea de apoyo que la peana vectorial
const pixelMode = () => document.documentElement?.dataset?.art === 'pixel';

function pixelArt(type) {
  const meta = PIXEL_META[type];
  if (!meta) return null;
  const half = (meta.w * PX) / 2, w = meta.w * PX, h = meta.h * PX;
  const L = { left: CX - half, right: CX + half, top: PX_BOTTOM - h };
  const img = (side) => `<image class="px-${side}" href="${PIXEL_PIECES[type][side]}" x="${L.left}" y="${L.top}" width="${w}" height="${h}"/>`;
  return { L, svg: img('l') + img('d') + img('w') };
}

// El tema decide; las cartas e iconos impresos (`paper`) van siempre en papel.
const pick = (type, paper = false) => (pixelMode() && !paper ? pixelArt(type) || art(type) : art(type));

// On the board the foot sits on the base (bottom-aligned); as an icon (`fit`) the piece is centred in a square.
export function pieceSVG(type, { fit = false, paper = false } = {}) {
  const { L, svg } = pick(type, paper);
  let vb = '0 0 45 41', align = 'xMidYMax';
  if (fit) {
    const base = isBoss(type) ? [4.5, 40.5] : [9.5, 35.5];
    const left = Math.min(L.left, base[0]), right = Math.max(L.right, base[1]), top = L.top, bottom = 40.5;
    const size = Math.max(right - left, bottom - top) + 3;
    vb = `${((left + right) / 2 - size / 2).toFixed(2)} ${((top + bottom) / 2 - size / 2).toFixed(2)} ${size.toFixed(2)} ${size.toFixed(2)}`;
    align = 'xMidYMid';
  }
  return `<svg viewBox="${vb}" preserveAspectRatio="${align} meet" aria-hidden="true">${svg}</svg>`;
}

// Height of the figure's head as a fraction of the board canvas (0 = top), for labels that sit on it.
export const headTop = (type) => pick(type).L.top / 41;

export const RAW_BODIES = BODIES;

// Which drawing a piece uses: bosses have their own; everything else draws its type.
export const artOf = (p) => (p.boss ? `boss-${p.boss}` : p.type);
