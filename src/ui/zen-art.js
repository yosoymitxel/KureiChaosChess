// Arte del Jardín Zen (karesansui): arena rastrillada, macetas de bonsái, plantas por especie,
// estanque, musgo, pisaderas, farol y la rama de arce. La flor recortada (HEAD, chipArt) la
// comparten el jardín y la tienda.
import { html } from './lib.js';

// La flor abierta de cada especie, en pequeño: para fichas y sobres de semillas.
export const HEAD = {
  romero: html`<circle class="zn-fl" cx="12" cy="5.9" r="1.5"/><circle class="zn-fl" cx="9.8" cy="8.1" r="1.4"/><circle class="zn-fl" cx="14.2" cy="8.1" r="1.4"/><circle class="zn-dot" cx="12" cy="5.8" r=".45"/><circle class="zn-dot" cx="9.8" cy="8" r=".45"/><circle class="zn-dot" cx="14.2" cy="8" r=".45"/>`,
  salvia: html`<path class="zn-fl" d="M12 4.6c.5 1.2 1.2 1.8 2 2.2-1 .5-1.7 1.2-2 2.6-.3-1.4-1-2.1-2-2.6.8-.4 1.5-1 2-2.2z"/><path class="zn-fl" d="M12 8.2c.4 1 1 1.5 1.7 1.8-.8.4-1.4 1-1.7 2-.3-1-.9-1.6-1.7-2 .7-.3 1.3-.8 1.7-1.8z"/>`,
  lavanda: html`<path class="zn-fl" d="M12 3.9c1.2 1.3 1.8 2.9 1.8 4.7 0 1.5-.7 2.5-1.8 2.5s-1.8-1-1.8-2.5c0-1.8.6-3.4 1.8-4.7z"/><path class="zn-cut" d="M10.6 6.1h2.8"/><path class="zn-cut" d="M10.8 7.8h2.4"/>`,
};
// Recortada por el viewBox para que se lea a 24 px.
export const chipArt = (kind) => html`<svg class=${'zn-k-' + kind} viewBox="6.2 3.4 11.6 8.4" aria-hidden="true">${HEAD[kind]}<path class="zn-stem" d="M12 11.4V9.6"/></svg>`;

const f = (n) => +n.toFixed(2);
// Cada dibujo lleva también su sprite píxel (assets/zen/, de tools/zen-pixel.mjs) en las mismas
// coordenadas; el CSS muestra `.zn-vec` en las mesas normales y `.zn-px` en las píxel.
export const px = (name, w, h, x = 0, y = 0) => html`<image class="zn-px" href=${`assets/zen/${name}.png`} x=${x} y=${y} width=${w} height=${h} preserveAspectRatio="none"/>`;
const BASE = [12, 15.3]; // donde nace la planta, sobre la tierra de la maceta

// Maceta de bonsái: cuerpo esmaltado bajo y ancho, labio, brillo y dos patas. La tierra va
// encima del tallo para taparle el nacimiento.
export const POT = html`
  <path class="zn-pot" d="M5 16.4h14l-1.3 4.1c-.2.6-.7.9-1.3.9H7.6c-.6 0-1.1-.3-1.3-.9z"/>
  <rect class="zn-pot zn-lip" x="4.3" y="15" width="15.4" height="1.7" rx=".7"/>
  <path class="zn-glint" d="M6.8 17.6h4.6"/>
  <rect class="zn-feet" x="7.4" y="21.2" width="1.4" height=".7" rx=".2"/><rect class="zn-feet" x="15.2" y="21.2" width="1.4" height=".7" rx=".2"/>`;
export const SOIL = html`<ellipse class="zn-soil" cx="12" cy="15.55" rx="6.9" ry=".85"/><circle class="zn-mossdot" cx="9" cy="15.5" r=".45"/><circle class="zn-mossdot" cx="15.4" cy="15.6" r=".4"/>`;

// Romero: ramitas erguidas con agujas cortas; en flor, florecitas azul lavanda a lo largo.
function sprig([x0, y0], [x1, y1], { needles = 6, flowers = 0 } = {}) {
  const parts = [html`<path class="zn-twig" d=${`M${x0} ${y0}Q${f((x0 + x1) / 2 + (x1 - x0) * 0.1)} ${f((y0 + y1) / 2)} ${x1} ${y1}`}/>`];
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  for (let i = 1; i <= needles; i++) {
    const t = 0.2 + (0.78 * i) / needles, px = x0 + dx * t, py = y0 + dy * t, k = 1.1 - t * 0.5;
    for (const s of [-1, 1]) {
      // Aguja: sale hacia arriba en diagonal desde la ramita.
      const ax = px + (-uy * s * 0.9 + ux * 0.6) * k, ay = py + (ux * s * 0.9 + uy * 0.6) * k;
      parts.push(html`<path class="zn-needle" d=${`M${f(px)} ${f(py)}L${f(ax)} ${f(ay)}`}/>`);
    }
    if (i > needles - flowers) for (const s of [-1, 1]) parts.push(html`<circle class="zn-fl zn-tiny" cx=${f(px - uy * s * 0.75)} cy=${f(py + ux * s * 0.75)} r=".36"/>`);
  }
  return parts;
}
const ROMERO_TIPS = [[7.6, 7], [9.8, 4.6], [12.2, 3.6], [14.6, 4.8], [16.6, 7.6]];

// Salvia: roseta de hojas anchas con nervio; la espiga lleva verticilos que en flor se abren rojos.
const leaf = (cx, cy, rx, ry, rot) => html`<g transform=${`rotate(${rot} ${cx} ${cy})`}><ellipse class="zn-leaf" cx=${cx} cy=${cy} rx=${rx} ry=${ry}/><path class="zn-rib" d=${`M${f(cx - rx * 0.8)} ${cy}H${f(cx + rx * 0.8)}`}/></g>`;
const SALVIA_ROSETTE = [leaf(8.6, 13.4, 3.4, 1.35, -18), leaf(15.4, 13.4, 3.4, 1.35, 18), leaf(9.6, 11.2, 2.8, 1.15, -42), leaf(14.4, 11.2, 2.8, 1.15, 42)];
const WHORLS = [11.2, 9.2, 7.3, 5.5];
function salviaSpike(open) {
  const parts = [html`<path class="zn-twig zn-thick" d="M12 15.2V4.2"/>`];
  WHORLS.forEach((y, i) => {
    const w = 1.6 - i * 0.22;
    if (open) for (const s of [-1, 1]) parts.push(html`<ellipse class="zn-fl" cx=${f(12 + s * w)} cy=${y} rx=${f(w * 0.75)} ry=".55" transform=${`rotate(${s * -28} ${f(12 + s * w)} ${y})`}/>`);
    else parts.push(html`<ellipse class="zn-bud" cx="12" cy=${y} rx=${f(w * 0.7)} ry=".5"/>`);
  });
  parts.push(html`<ellipse class=${open ? 'zn-fl' : 'zn-bud'} cx="12" cy="4" rx=".7" ry="1"/>`);
  return parts;
}

// Lavanda: mata de hojas finas gris verdosas y tallos altos con espigas de verticilos violetas.
const LAV_STEMS = [[8.4, 4.6], [10.4, 3.2], [12.6, 2.8], [14.6, 3.6], [16.4, 5.4]];
const lavLeaves = (h) => [[-3.2, h * 0.55], [-1.9, h * 0.75], [-0.6, h], [0.7, h * 0.95], [2, h * 0.72], [3.3, h * 0.5]].map(([dx, hh]) =>
  html`<path class="zn-blade" d=${`M12 15.2Q${f(12 + dx * 0.3)} ${f(15.2 - hh * 0.6)} ${f(12 + dx)} ${f(15.2 - hh)}`}/>`);
function lavStem([x, y], open) {
  const head = [];
  for (let i = 0; i < 6; i++) head.push(html`<ellipse class=${(open ? 'zn-fl' : 'zn-bud') + ' zn-tiny'} cx=${f(x + (i % 2 ? 0.18 : -0.18))} cy=${f(y + i * 0.6)} rx=${f(0.5 - i * 0.03)} ry=".42"/>`);
  return [html`<path class="zn-twig zn-fine" d=${`M12 14.6Q${f((12 + x) / 2)} ${f((14.6 + y) / 2 + 1)} ${x} ${f(y + 3.4)}`}/>`, ...head];
}

// Una planta completa según su etapa: brote corto, crecida con capullo o en flor.
export function plantArt(kind, stage) {
  const grown = stage === 'bud' || stage === 'bloom', open = stage === 'bloom';
  if (stage === 'sprout') {
    if (kind === 'romero') return [...sprig(BASE, [10.6, 11.4], { needles: 3 }), ...sprig(BASE, [13.2, 11], { needles: 3 })];
    if (kind === 'salvia') return [leaf(10.4, 13.6, 1.9, 0.85, -25), leaf(13.6, 13.6, 1.9, 0.85, 25)];
    return lavLeaves(3.6);
  }
  if (!grown) return [];
  if (kind === 'romero') return ROMERO_TIPS.flatMap((tip, i) => sprig(BASE, tip, { needles: 6, flowers: open ? 3 + (i % 2) : 0 }));
  if (kind === 'salvia') return [...SALVIA_ROSETTE, ...salviaSpike(open)];
  return [...lavLeaves(5.6), ...LAV_STEMS.flatMap((s) => lavStem(s, open))];
}

// Estanque: borde orgánico (un óvalo con ondulaciones), piedras sobre la misma orilla,
// dos koi que nadan en órbitas distintas, nenúfares, un loto y ondas lentas.
const shore = (r, t) => r * (1 + 0.07 * Math.sin(3 * t + 0.6) + 0.05 * Math.cos(2 * t));
const loop = (r, cx = 24, cy = 24.5, sy = 0.9, n = 48) => {
  const pts = Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2, rr = shore(r, t); return [f(cx + Math.cos(t) * rr), f(cy + Math.sin(t) * rr * sy)]; });
  return `M${pts.map((p) => p.join(' ')).join('L')}Z`;
};
const STONES = Array.from({ length: 15 }, (_, i) => {
  const t = (i / 15) * Math.PI * 2 + (i % 3) * 0.08, r = shore(18.6, t), s = 2 + ((i * 7) % 5) * 0.32;
  return [f(24 + Math.cos(t) * r), f(24.5 + Math.sin(t) * r * 0.9), f(s), f(s * 0.72), (i * 37) % 60 - 30];
});
const KOI = html`<path d="M3.2 0C1.8-1.3-.6-1.5-2.4-.6L-3.8-1.6-3.4 0-3.8 1.6-2.4.6C-.6 1.5 1.8 1.3 3.2 0Z"/>`;
// Órbita de un koi por el estanque (misma orilla ondulada que el agua): ángulo -> [x, y].
export const orbit = (r, cx, cy) => (t) => { const rr = shore(r, t); return [cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * 0.9]; };
export const KOI_ORBITS = [{ r: 9.5, cx: 24, cy: 25, speed: 3.2, dir: 1 }, { r: 12.5, cx: 24, cy: 24, speed: 2.6, dir: -1 }];
export const pondArt = (still) => html`<svg class="zn-pondart" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="zn-water-g" cx="42%" cy="38%" r="70%"><stop offset="0" class="zn-shallow"/><stop offset=".7" class="zn-mid"/><stop offset="1" class="zn-deep"/></radialGradient>
    <clipPath id="zn-pond-clip"><path d=${loop(16.6)}/></clipPath>
  </defs>
  ${px('pond', 48, 48)}
  <path class="zn-bank zn-vec" d=${loop(18.2)}/>
  <path class="zn-water zn-vec" d=${loop(16.6)}/>
  <g clip-path="url(#zn-pond-clip)">
    <path class="zn-depth zn-vec" d=${loop(11, 25, 26)}/>
    <g class="zn-food"></g>
    <g class="zn-koi zn-koi-a" transform="translate(30 20)"><g class="zn-vec">${KOI}<circle class="zn-koi-spot" cx="1.1" cy="-.2" r=".8"/></g>${px('koi', 8, 5, -4.4, -2.5)}</g>
    <g class="zn-koi zn-koi-b" transform="translate(16 30) rotate(180)"><g class="zn-vec">${KOI}<circle class="zn-koi-spot" cx="-.6" cy=".1" r=".9"/></g>${px('koi', 8, 5, -4.4, -2.5)}</g>
    ${!still && html`<circle class="zn-ripple" cx="19" cy="29" r="2"/><circle class="zn-ripple zn-ripple-2" cx="29" cy="20" r="2"/>`}
    <path class="zn-glint zn-vec" d="M14 18c2.5-2.6 6-3.8 9-3.6"/>
  </g>
  <g class="zn-lilies zn-vec">
    <path class="zn-pad" d="M31.5 33 35.6 31.6A4 4 0 1 1 35.2 36.2Z"/>
    <path class="zn-pad" d="M15.2 33.6 12.4 31.4A3 3 0 1 0 15.8 31.2Z"/>
    <path class="zn-pad" d="M34 17.6 36.8 18A2.4 2.4 0 1 1 34.6 16Z"/>
    <g class="zn-lotus" transform="translate(33.2 33.4)"><path d="M0 0C-2.6-.4-3.2-2.6-2.4-3.6-1.4-2.6-.6-1.6 0 0Z"/><path d="M0 0C2.6-.4 3.2-2.6 2.4-3.6 1.4-2.6.6-1.6 0 0Z"/><path d="M0 0C-1-1.6-1-3.6 0-4.8 1-3.6 1-1.6 0 0Z"/></g>
  </g>
  <g class="zn-vec">${STONES.map(([x, y, rx, ry, rot]) => html`<ellipse class="zn-rock" cx=${x} cy=${y} rx=${rx} ry=${ry} transform=${`rotate(${rot} ${x} ${y})`}/>`)}</g>
  <path class="zn-mossdab zn-vec" d="M5.4 30.6c1.4-1.8 3.8-1.6 4.6.2-1.6.8-3.2.8-4.6-.2zM38.6 12.4c1.6-1 3.4-.4 3.8 1-1.4.6-2.8.4-3.8-1z"/>
</svg>`;

// Musgo en montículo con helechito y una piedra: rompe la rejilla.
export const MOSS = html`<svg class="zn-standart" viewBox="0 0 24 24" aria-hidden="true">${px('moss', 24, 24)}<g class="zn-vec">
  <path class="zn-moss" d="M3.2 19.6c-.6-3.4 1.6-6.2 4.4-6.4.8-2.6 3.6-4 6.2-3.2 2.6-.4 5.2 1.8 5.4 4.6 1.8.8 2.6 2.6 1.6 4.6-.6 1.2-2 1.6-3.2 1.6H5.6c-1.2 0-2.2-.4-2.4-1.2z"/>
  <path class="zn-moss-2" d="M5 18.8c.4-2 2-3.4 3.8-3.4.8-1.6 2.6-2.4 4.2-1.8"/>
  ${[[7, 16.6], [10.4, 13.6], [14.6, 12.8], [17.2, 15.6], [12, 17.6], [9, 18.6], [15.6, 18.4]].map(([x, y]) => html`<circle class="zn-moss-dot" cx=${x} cy=${y} r=".55"/>`)}
  <path class="zn-fern" d="M15.2 13.2c.6-2.4 2-4.2 4-5.2M16 11.2l1.4-.2M16.6 10l1.2-.6M15.6 12.4l1.4.2"/>
  <ellipse class="zn-rock" cx="6.6" cy="19.8" rx="2.2" ry="1.4"/>
</g></svg>`;

// Pisadera de granito: laja plana irregular con motas.
export const STEP = html`<svg class="zn-standart" viewBox="0 0 24 24" aria-hidden="true">${px('step', 24, 24)}<g class="zn-vec">
  <path class="zn-slab-side" d="M4 15.6c0 2.6 3 4.4 8 4.4s8.6-1.6 8.4-4.2"/>
  <path class="zn-slab" d="M4.2 14.6c-.6-2.4 2-4.6 6.4-4.8 4.6-.2 9.4.8 9.8 3.6.4 2.4-3.6 3.8-8.4 3.8-4.2 0-7.4-.8-7.8-2.6z"/>
  ${[[8, 13], [12.6, 12.2], [15.8, 14.2], [10.4, 15.4], [17.4, 12.8]].map(([x, y]) => html`<circle class="zn-fleck" cx=${x} cy=${y} r=".35"/>`)}
</g></svg>`;

// Farol de piedra (kasuga): peana, fuste, caja de luz encendida, tejado de aleros curvos y joya.
export const LANTERN = html`<svg class="zn-standart zn-lantern" viewBox="0 0 24 32" aria-hidden="true">
  <defs><radialGradient id="zn-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="#e8a440"/></radialGradient></defs>
  <ellipse class="zn-halo" cx="12" cy="15.4" rx="7" ry="5"/>
  ${px('lantern', 24, 32)}<g class="zn-vec">
  <path class="zn-lstone" d="M7.4 30.6h9.2l-.8-2.2H8.2z"/>
  <path class="zn-lstone" d="M10.6 28.4V21h2.8v7.4z"/>
  <path class="zn-lstone" d="M7.8 21h8.4l-1-1.6H8.8z"/>
  <rect class="zn-lstone" x="8.6" y="13.2" width="6.8" height="6.2" rx=".6"/>
  <rect class="zn-lwin" x="10.2" y="14.6" width="3.6" height="3.4" rx=".3"/>
  <path class="zn-lstone" d="M5 13.4c2.4-.4 4.4-2 5.4-4.2h3.2c1 2.2 3 3.8 5.4 4.2z"/>
  <path class="zn-lstone" d="M10.4 9.2c0-1.2.7-2 1.6-2s1.6.8 1.6 2z"/>
  <circle class="zn-lstone" cx="12" cy="6.2" r="1.1"/>
</g></svg>`;

// Rama de arce que asoma por una esquina, y la hoja suelta que cae despacio.
// Hoja de arce de siete lóbulos con su rabito y nervios, centrada en el origen.
const MAPLE = 'M0-4 .7-2.4 1.9-3.3 1.8-1.6 3.6-2 2.7-.5 4-.1 2.5.7 2.9 2 1.1 1.3.3 2.5 0 2.2-.3 2.5-1.1 1.3-2.9 2-2.5.7-4-.1-2.7-.5-3.6-2-1.8-1.6-1.9-3.3-.7-2.4Z';
const VEINS = 'M0 2.2V-3.2M0 .6 2.8-1.4M0 .6-2.8-1.4M0 1.4 2.6 1M0 1.4-2.6 1M0 2.2V3.8';
const maple = (cls, t) => html`<g class=${'zn-maple ' + cls} transform=${t}><path d=${MAPLE}/><path class="zn-vein" d=${VEINS}/></g>`;
export const mapleLeaf = html`<svg viewBox="-4.5 -4.5 9 9" aria-hidden="true"><g class="zn-vec">${maple('zn-maple-a', '')}</g>${px('leaf', 9, 9, -4.5, -4.5)}</svg>`;
export const BRANCH = html`<svg class="zn-branch" viewBox="0 0 60 40" aria-hidden="true">${px('branch', 60, 39)}<g class="zn-vec">
  <path class="zn-bark" d="M-4 4C8 7 16 6 25 10s14 5 23 3"/>
  <path class="zn-bark zn-twig-b" d="M17 7c4 4 6 9 5 14M33 12c3 3 7 5 11 5M42 13c1-3 3-5 6-6"/>
  ${[[22, 21, 1.15, 15, 'a'], [27, 14, 0.95, -15, 'b'], [47, 7, 0.9, 25, 'c'], [45, 18, 1, -30, 'a'], [11, 9, 0.9, 10, 'b'], [36, 15, 0.8, 45, 'c'], [18, 15, 0.75, -40, 'a'], [52, 13, 0.8, 60, 'b']]
    .map(([x, y, s, r, c]) => maple('zn-maple-' + c, `translate(${x} ${y}) rotate(${r}) scale(${s * 1.3})`))}
</g></svg>`;

// Mariposa: cuerpo, antenas y dos pares de alas que baten por CSS.
export const BUTTERFLY = html`<svg viewBox="-6 -6 12 12" aria-hidden="true">
  <g class="zn-wing zn-wing-l"><path d="M-.4-.6C-2.6-4.6-5.6-4-5.2-1.4-4.9.4-2.4.6-.4.2Z"/><path d="M-.4.4C-2.8 1-4 3.4-2.6 4.4-1.4 5-.4 3-.2 1Z"/></g>
  <g class="zn-wing zn-wing-r"><path d="M.4-.6C2.6-4.6 5.6-4 5.2-1.4 4.9.4 2.4.6.4.2Z"/><path d="M.4.4C2.8 1 4 3.4 2.6 4.4 1.4 5 .4 3 .2 1Z"/></g>
  <path class="zn-fly-body" d="M0-2.2C.5-2.2.6 2.8 0 3.4-.6 2.8-.5-2.2 0-2.2Z"/>
  <path class="zn-antenna" d="M-.2-2.1C-.8-3.4-1.4-4-2-4.2M.2-2.1C.8-3.4 1.4-4 2-4.2"/>
</svg>`;

// Regadera de latón para el gesto de regar: cuerpo, asa y pico con su roseta.
export const CAN = html`<svg viewBox="0 0 24 18" aria-hidden="true">${px('can', 24, 18)}<g class="zn-vec">
  <path class="zn-can" d="M6 6h9l1 9c0 1-.6 1.6-1.6 1.6H6.6C5.6 16.6 5 16 5 15z"/>
  <path class="zn-can-handle" d="M7.2 6C7 3 13.8 3 13.8 6"/>
  <path class="zn-can" d="M15.4 9.4 21 4.6l1 1.2-5.4 5.4z"/>
  <ellipse class="zn-can" cx="21.6" cy="5" rx="1.3" ry="1.8" transform="rotate(-40 21.6 5)"/>
</g></svg>`;

// Tijeras de podar: dos hojas que giran sobre el perno (12,12); el CSS las abre y las cierra.
export const SHEARS = html`<svg viewBox="0 0 24 24" aria-hidden="true">${px('shears', 24, 24)}<g class="zn-vec">
  <g class="zn-blade zn-blade-a"><path class="zn-grip-bar" d="M12 12 7.4 14.6"/><circle class="zn-grip" cx="5.6" cy="15.6" r="2.4"/><path class="zn-steel" d="M11.4 11.2 22.6 10.6 22.8 11.6 12 12.8z"/></g>
  <g class="zn-blade zn-blade-b"><path class="zn-grip-bar" d="M12 12 7.4 9.4"/><circle class="zn-grip" cx="5.6" cy="8.4" r="2.4"/><path class="zn-steel" d="M11.4 12.8 22.6 13.4 22.8 12.4 12 11.2z"/></g>
  <circle class="zn-pivot" cx="12" cy="12" r="1"/>
</g></svg>`;
// Pala de jardín: mango arriba, hoja abajo (la punta en el fondo del lienzo, donde se clava).
export const SHOVEL = html`<svg viewBox="0 0 12 28" aria-hidden="true">${px('shovel', 12, 27, 0, 1)}<g class="zn-vec">
  <path class="zn-grip-bar" d="M3.4 2.2h5.2"/><path class="zn-shaft" d="M6 2.2v14"/>
  <path class="zn-steel" d="M2.6 15.6h6.8v4.6c0 2.8-1.6 5.2-3.4 6.6-1.8-1.4-3.4-3.8-3.4-6.6z"/>
</g></svg>`;
// Bolsita de semillas, abierta por arriba.
export const POUCH = html`<svg viewBox="0 0 16 18" aria-hidden="true">${px('pouch', 16.5, 18, -0.25)}<g class="zn-vec">
  <path class="zn-pouch" d="M3.6 5.4h8.8l1.4 9.4c.2 1.4-.8 2.4-2.2 2.4H4.4c-1.4 0-2.4-1-2.2-2.4z"/>
  <path class="zn-pouch-tie" d="M3.4 5.6 5 3.2M12.6 5.6 11 3.2"/>
  <circle class="zn-seed" cx="7" cy="3.4" r=".9"/><circle class="zn-seed" cx="9.4" cy="2.6" r=".8"/>
</g></svg>`;

// Arena rastrillada: líneas paralelas cortadas alrededor de cada objeto y anillos que lo rodean.
// `objs`: { x, y, r } en unidades de casilla (centro y radio libre); `raw`: casillas sin cavar.
export function rakeArt(n, objs, raw) {
  const step = 0.12, ring = 0.09, lines = [];
  for (let y = step / 2; y < n; y += step) lines.push(`M0 ${f(y)}H${n}`);
  const d = lines.join('');
  const rings = objs.flatMap(({ x, y, r, sx = 1 }) => [0, 1, 2].map((k) => ({ x, y, rx: (r + k * ring) * sx, ry: r + k * ring })));
  return html`<svg class="zn-rake" viewBox=${`0 0 ${n} ${n}`} preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <mask id="zn-rake-mask"><rect width=${n} height=${n} fill="#fff"/>${objs.map(({ x, y, r, sx = 1 }) => html`<ellipse cx=${x} cy=${y} rx=${(r + 2.5 * ring) * sx} ry=${r + 2.5 * ring} fill="#000"/>`)}${raw.map(([r, c]) => html`<rect x=${c} y=${r} width="1" height="1" fill="#000"/>`)}</mask>
      <radialGradient id="zn-sun" cx="18%" cy="8%" r="110%"><stop offset="0" stop-color="#fff3d6" stop-opacity=".55"/><stop offset=".55" stop-color="#fff3d6" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity=".28"/></radialGradient>
    </defs>
    <g mask="url(#zn-rake-mask)"><path class="zn-groove" d=${d}/><path class="zn-ridge" d=${d} transform=${`translate(0 ${step * 0.3})`}/></g>
    ${rings.map(({ x, y, rx, ry }) => html`<ellipse class="zn-groove" cx=${x} cy=${y} rx=${rx} ry=${ry}/><ellipse class="zn-ridge" cx=${x} cy=${f(y + ring * 0.35)} rx=${rx} ry=${ry}/>`)}
    <rect width=${n} height=${n} fill="url(#zn-sun)"/>
  </svg>`;
}

// Coleccionables del tablero (src/data/pickups.js); la moneda usa su icono.
export const PICKUP_ART = { leaf: mapleLeaf, seed: POUCH };

// Estanque en el hueco central de un tablero: dos koi dando vueltas en sentidos contrarios.
// Cada koi va en su propia capa HTML que gira: girar un <g> dentro del SVG no pasa al compositor y
// recalculaba el tablero entero en cada fotograma.
export const boardPond = html`<div class="bd-pond" aria-hidden="true">
  <svg viewBox="0 0 20 20"><g class="bd-food"></g></svg>
  ${['a', 'b'].map((k) => html`<div class=${'bd-koi bd-koi-' + k}><svg viewBox="0 0 20 20"><g class=${'zn-koi zn-koi-' + k}><g transform=${k === 'a' ? 'translate(10 5) scale(.9)' : 'translate(10 16.5) scale(.75)'}><g class="zn-vec">${KOI}<circle class="zn-koi-spot" cx="1.1" cy="-.2" r=".8"/></g>${px('koi', 8, 5, -4.4, -2.5)}</g></g></svg></div>`)}
</div>`;

// Piedra que sale al ampliar: canto rodado con su cara al sol; `cracks` grietas según los golpes.
export const stoneArt = (cracks = 0) => html`<svg class="zn-standart zn-stone" viewBox="0 0 24 24" aria-hidden="true">${px('stone', 24, 24)}<g class="zn-vec">
  <path class="zn-rock" d="M3 22 2 17 4 11 8 7 13 5 18 7 21 12 22 18 21 22Z"/>
  <path class="zn-rock-lit" d="M2 17 4 11 8 7 13 5 11 10 9 15 7 22 3 22Z"/>
</g>${cracks > 0 && html`<path class="zn-crack" d="M12 6 10.6 10.4 13 13 11 17.6"/>`}${cracks > 1 && html`<path class="zn-crack" d="M18 9 15.6 12.4 17.4 15.4"/>`}</svg>`;

// Lo que se compra para el jardín (src/data/garden.js), con el mismo dibujo que en el cantero.
export const ITEM_ART = {
  shovel: SHOVEL, can: CAN, lantern: LANTERN,
  pot: html`<svg viewBox="0 0 24 24" aria-hidden="true"><g class="zn-vec">${POT}</g>${px('pot', 24, 24)}</svg>`,
};
// Peces del estanque, para el botón de dar de comer.
export const KOI_ART = html`<svg viewBox="-4.5 -3 9 6" aria-hidden="true"><g class="zn-koi zn-koi-a"><g class="zn-vec">${KOI}<circle class="zn-koi-spot" cx="1.1" cy="-.2" r=".8"/></g>${px('koi', 8, 5, -4.4, -2.5)}</g></svg>`;
