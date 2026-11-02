import { motion } from './lib.js';
import { reduced } from './hop.js';

// Lo común de las mesas con física (hockey, golf…): escala de unidades de mesa a píxeles, colocar
// por transform, sacudida, aplastar al chocar y cartel central. `w`: ancho de la mesa en unidades.
export function tableKit(table, wrap, settings, w, onResize) {
  const still = reduced();
  let k = table.clientWidth / w;
  const ro = new ResizeObserver(() => { k = table.clientWidth / w; onResize?.(); });
  ro.observe(table);
  return {
    still,
    k: () => k,
    at: (e) => ({ x: e.x * k, y: e.y * k }),
    place: (el, o) => { if (el) el.style.transform = `translate3d(${o.x * k}px, ${o.y * k}px, 0) translate(-50%, -50%)`; },
    shake: (a) => settings.shake && !still && motion(wrap, { x: [0, -a, a * 0.8, -a * 0.5, a * 0.3, 0], y: [0, a * 0.4, -a * 0.6, a * 0.3, 0] }, { duration: 0.3, ease: 'easeOut' }),
    squash: (el, a = 0.86) => el && !still && motion(el.firstElementChild, { scaleX: [1, 1 / a, 1], scaleY: [1, a, 1] }, { duration: 0.22, ease: [0.16, 1, 0.3, 1] }),
    banner: (text) => {
      const b = document.createElement('div');
      b.className = 'mini-banner';
      b.textContent = text;
      table.appendChild(b);
      if (still) return setTimeout(() => b.remove(), 1200);
      motion(b, { scale: [1.4, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
      motion(b, { opacity: [1, 0] }, { duration: 0.3, delay: 0.9, onComplete: () => b.remove() });
    },
    destroy: () => ro.disconnect(),
  };
}

// Puntero → unidades de mesa; `rect` es una ref que se vacía al cambiar de tamaño o hacer scroll.
export const toTable = (e, table, rect, w, h) => {
  const r = rect.current || (rect.current = table.getBoundingClientRect());
  return [((e.clientX - r.left) / r.width) * w, ((e.clientY - r.top) / r.height) * h];
};
