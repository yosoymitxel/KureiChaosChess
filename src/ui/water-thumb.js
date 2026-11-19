import { html, useEffect, useRef } from './lib.js';
import { drawPlant, drawBoat } from '../view/pond.js';
import { School, spine, koiShape } from '../view/koi.js';

// Miniatura de una planta acuática o un barquito con el mismo dibujo del estanque, sobre agua.
// En píxel se pinta a 24 px y se amplía sin suavizar, como el estanque.
export function Thumb({ plant, boat }) {
  const ref = useRef(null);
  const src = () => new URL(`../../assets/agua/${plant ? plant + '-bloom' : 'boat-' + boat}.svg`, import.meta.url).href;
  const pixel = document.documentElement.dataset.art === 'pixel';
  useEffect(() => {
    if (boat !== 'koi') {
      // En píxel la SVG se baja a 24 px y se amplía sin suavizar: mismo grano que el estanque.
      if (!pixel) return;
      const cv = ref.current, im = new Image();
      cv.width = cv.height = 24;
      im.onload = () => { const c = cv.getContext('2d'); c.imageSmoothingEnabled = true; c.drawImage(im, 0, 0, 24, 24); };
      im.src = src();
      return;
    }
    const cv = ref.current, n = pixel ? 24 : 96;
    cv.width = cv.height = n;
    const ctx = cv.getContext('2d'), k = n / 12;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = '#245f6b'; ctx.fillRect(0, 0, 12, 12);
    ctx.fillStyle = '#3a8584'; ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    if (plant) drawPlant(ctx, { x: 6, y: 7, kind: plant, stage: 'bloom' }, 0, 9, pixel);
    else if (boat === 'koi') {
      const sc = new School(() => true, { count: 1, len: 8, home: [6, 6], spread: 0 }), f = sc.fish[0];
      f.kind = 0; f.pts = f.pts.map((_, i) => [9 - i * f.seg * 0.95, 6 + Math.sin(i) * 0.3]);
      const sh = koiShape(spine(f, 8, 0.3), f, 8);
      ctx.fillStyle = sh.kind.fin; for (const tri of [...sh.fins, ...sh.tail]) { ctx.beginPath(); tri.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.fill(); }
      ctx.beginPath(); sh.body.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.fillStyle = sh.kind.base; ctx.fill();
    } else drawBoat(ctx, { kind: boat, x: 6, y: 6, h: -Math.PI / 4, v: 0 }, 0, 11, pixel);
  }, [plant, boat]);
  if (boat !== 'koi' && !pixel) return html`<img class="wt-thumb-cv" src=${src()} alt="" />`;
  return html`<canvas class="wt-thumb-cv" ref=${ref} aria-hidden="true"></canvas>`;
}
