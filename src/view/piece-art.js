// Piece silhouettes as inline SVG. Colours come from CSS custom properties on the
// parent (--pc body, --pc-2 detail, --ink outline), so themes recolour without rebuilding.
// Every piece is a body standing on one shared plinth; the body is normalised by code
// (measured box -> target height on a fixed ladder) so the set reads as a single family.
// Los cuerpos se dibujan a mano en art/vector/ (un .svg por figura) y tools/vector-art.mjs los
// trae a piece-bodies.js; acá se miden en el navegador, así un dibujo editado se reescala solo.
import { PIXEL_PACKS, PIXEL_BASE } from '../data/pixel-packs.js';
import { pixelSrc } from '../data/pixel-src.js';
import { BODIES } from './piece-bodies.js';

const F = 'var(--pc)', F2 = 'var(--pc-2)', S = 'var(--ink)';
const STROKE = 1.6;

const PLINTH = `<path d="M9.5 40h26v-3.2c0-.8-.6-1.3-1.4-1.3H10.9c-.8 0-1.4.5-1.4 1.3z"/><path d="M12.5 35.5l1.6-3.2h16.8l1.6 3.2z"/>`;
const PLINTH_TOP = 32.6; // bodies overlap the collar slightly so no gap shows
const CX = 22.5;

// The boss dais: a wide riveted slab under a second step, broader than any chessman's plinth.
const BOSS_PLINTH = `<path d="M4.5 40.5h36v-3c0-.8-.6-1.3-1.3-1.3H5.8c-.7 0-1.3.5-1.3 1.3z"/><path d="M8 36.2v-3.6h29v3.6z"/>${[8, 15, 22.5, 30, 37].map((x) => `<circle cx="${x}" cy="38.4" r="0.7" fill="${F2}" stroke="none"/>`).join('')}`;
const isBoss = (type) => type.startsWith('boss-');

// Height ladder above the plinth: value order follows the chess hierarchy; maxW keeps wide crowns in check.
// ax: x of the raw drawing that sits over the plinth centre (the knight balances on its neck, not its bbox).
// The guard's plume is light, so it may rise above the ladder like the original drawing did.
const LADDER = {
  pawn: { h: 18.5 }, rook: { h: 21.5 }, guard: { h: 26.2 }, cannon: { h: 23 }, elephant: { h: 22.5 },
  advisor: { h: 23.5 }, camel: { h: 24.5, maxW: 31, ax: 28.4 }, knight: { h: 24, ax: 25.5 }, bishop: { h: 25 },
  queen: { h: 26.5, maxW: 29 }, king: { h: 27.5, maxW: 29 },
  'boss-titan': { h: 29, maxW: 34 }, 'boss-ram': { h: 26, maxW: 37.6, ax: 22.5 }, 'boss-hydra': { h: 28.5, maxW: 34, ax: 225 },
  'boss-golem': { h: 25, maxW: 38 }, 'boss-rider': { h: 31.5, maxW: 32, ax: 23 }, 'boss-wall': { h: 23, maxW: 40 },
  'boss-devourer': { h: 26.5, maxW: 36 },
};

// Caja del dibujo [x, y, w, h] medida en el navegador: cada forma por su rectángulo en pantalla
// (con su transform), sin el contorno, salvo los trazos gruesos sin relleno (cuellos, patas,
// lanzas), que son parte del cuerpo. Sin DOM (las herramientas de Node) vale el lienzo entero.
// Se miden todas juntas la primera vez: una sola pasada de maquetado en vez de una por figura
// (medir de a una, en pleno reparto de piezas, trababa la animación en teléfonos).
let boxes = null;
function measure(type) {
  if (boxes) return boxes[type];
  if (typeof document === 'undefined' || !document.body) return [0, 0, 45, 41];
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none';
  const types = Object.keys(BODIES);
  probe.innerHTML = types.map((t) => `<svg viewBox="0 0 45 41" width="450" height="410" style="position:absolute;left:0;top:0"><g fill="#000" stroke="#000" stroke-width="${STROKE}">${BODIES[t]}</g></svg>`).join('');
  document.body.appendChild(probe);
  const base = probe.firstChild.getBoundingClientRect(), u = 45 / base.width;
  boxes = {};
  types.forEach((t, i) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of probe.children[i].querySelectorAll('path, circle, ellipse, rect, polygon, polyline, line')) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el), sw = parseFloat(cs.strokeWidth);
      const pad = cs.fill === 'none' && cs.stroke !== 'none' && sw > 2.5 ? sw / 2 : 0;
      x0 = Math.min(x0, (r.left - base.left) * u - pad); y0 = Math.min(y0, (r.top - base.top) * u - pad);
      x1 = Math.max(x1, (r.right - base.left) * u + pad); y1 = Math.max(y1, (r.bottom - base.top) * u + pad);
    }
    boxes[t] = [x0, y0, x1 - x0, y1 - y0];
  });
  probe.remove();
  return boxes[type];
}

function layout(type) {
  const [x, y, w, h] = measure(type);
  const { h: th, maxW = 30, ax = x + w / 2 } = LADDER[type];
  const s = Math.min(th / h, maxW / w);
  const tx = CX - ax * s, ty = PLINTH_TOP - (y + h) * s;
  return { s, tx, ty, top: PLINTH_TOP - h * s, left: CX - (ax - x) * s, right: CX + (x + w - ax) * s };
}

const cache = new Map();
function art(type) {
  if (!BODIES[type]) type = 'pawn';
  if (!cache.has(type)) {
    const L = layout(type);
    const body = `<g transform="translate(${L.tx.toFixed(2)} ${L.ty.toFixed(2)}) scale(${L.s.toFixed(4)})" stroke-width="${(STROKE / L.s).toFixed(3)}">${BODIES[type]}</g>`;
    cache.set(type, { L, svg: `<g fill="${F}" stroke="${S}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">${body}${isBoss(type) ? BOSS_PLINTH : PLINTH}</g>` });
  }
  return cache.get(type);
}

// Temas píxel (art/temas/<tema>, importados por tools/pixel-art.mjs): cada figura es un PNG por
// bando en assets/pixel/<tema>/. El PNG ya trae color y contorno: el SVG apila los tres bandos y
// board.css muestra el que toca. Lo que el tema no dibujó se toma del tema base.
const PX = 1; // unidades del lienzo (45×41) por píxel de arte
const PX_BOTTOM = 40.5; // la misma línea de apoyo que la peana vectorial
const pixelMode = () => document.documentElement?.dataset?.art === 'pixel';

function pixelArt(type, want = document.documentElement.dataset.pack) {
  const pack = PIXEL_PACKS[want]?.sprites[type] ? want : PIXEL_BASE;
  const size = PIXEL_PACKS[pack].sprites[type];
  if (!size) return null;
  const w = size[0] * PX, h = size[1] * PX;
  const L = { left: CX - w / 2, right: CX + w / 2, top: PX_BOTTOM - h };
  const img = (side) => `<image class="px-${side}" href="${pixelSrc(pack, `${type}_${side}`)}" x="${L.left}" y="${L.top}" width="${w}" height="${h}"/>`;
  return { L, svg: img('l') + img('d') + img('w') };
}

// En un tema píxel todo va a píxel, también cartas, galería e iconos. `pack` fuerza el arte de
// otra mesa (la tienda enseña cada mesa con su pieza): un id de tema píxel, o '' para el vectorial.
const pick = (type, pack) => {
  const pixel = pack === undefined ? pixelMode() : !!pack;
  return pixel ? pixelArt(type, pack || undefined) || art(type) : art(type);
};

// On the board the foot sits on the base (bottom-aligned); as an icon (`fit`) the piece is centred in a square.
export function pieceSVG(type, { fit = false, pack } = {}) {
  const { L, svg } = pick(type, pack);
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
// A disguised piece (El rey impostor) wears its mask until a move gives it away.
export const artOf = (p) => (p.boss ? `boss-${p.boss}` : p.disguise && !p.unmasked ? p.disguise : p.type);
