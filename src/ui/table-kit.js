import { html, motion } from './lib.js';
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

// Tirachinas de billares y bolos: tirar hacia atrás y soltar. Un toque que `near(p)` da por bueno mueve
// la salida con `slide(p)` en vez de apuntar; Z/X llaman a `nudge(±1)`.
export function slingshot({ table, w, h, ready, origin, shoot, pullMax = 60, near, slide, nudge }) {
  const a = { on: false, slide: false, keys: false, from: null, ang: -Math.PI / 2, pow: 0.5 }, rect = { current: null };
  const at = (e) => toTable(e, table(), rect, w, h);
  const pull = (p) => {
    const dx = a.from[0] - p[0], dy = a.from[1] - p[1], d = Math.hypot(dx, dy);
    if (d > 2) a.ang = Math.atan2(dy, dx);
    a.pow = Math.min(1, d / pullMax);
  };
  return {
    reset: () => (rect.current = null),
    down(e) {
      if (!ready()) return;
      e.preventDefault();
      rect.current = null;
      table().setPointerCapture?.(e.pointerId);
      const p = at(e), sl = !!near?.(p);
      Object.assign(a, { on: !sl, slide: sl, from: p, pow: 0 });
    },
    move(e) { if (a.slide) slide(at(e)); else if (a.on && a.from) pull(at(e)); },
    up(e) {
      if (a.on && a.from) { pull(at(e)); if (a.pow > 0.06) shoot(a.ang, a.pow); }
      Object.assign(a, { on: false, slide: false, from: null });
    },
    key(e) {
      if (e.type !== 'keydown' || e.target.closest?.('input, select, textarea, .overlay') || !ready()) return;
      const key = e.key.toLowerCase();
      const turn = { arrowleft: -1, a: -1, arrowright: 1, d: 1 }[key], dose = { arrowup: 1, w: 1, arrowdown: -1, s: -1 }[key], side = { z: -1, x: 1 }[key];
      if (turn) a.ang += turn * (e.shiftKey ? 0.12 : 0.03);
      else if (dose) a.pow = Math.max(0.05, Math.min(1, a.pow + dose * 0.05));
      else if (side && nudge) nudge(side);
      else if ((key === ' ' || key === 'enter') && a.keys) { if (shoot(a.ang, a.pow)) a.keys = false; }
      else return;
      e.preventDefault();
      a.keys = true;
    },
    draw(el, k) {
      const show = ready() && (a.on || a.keys);
      el.style.opacity = show ? 1 : 0;
      if (!show) return;
      const o = origin();
      el.style.width = (10 + a.pow * 50) * k + 'px';
      el.style.transform = `translate3d(${o.x * k}px, ${o.y * k}px, 0) rotate(${a.ang}rad)`;
      el.style.setProperty('--pow', a.pow);
    },
  };
}

// Esquinas de la mesa (sin tamaño), dentro de ella: toTable las mide con la cámara inclinada.
export const corners = html`<i class="tk-corner tk-tl"></i><i class="tk-corner tk-tr"></i><i class="tk-corner tk-br"></i><i class="tk-corner tk-bl"></i>`;

// Homografía que lleva 4 puntos de pantalla a 4 de mesa (eliminación de Gauss sobre 8 incógnitas).
function homography(src, dst) {
  const A = [];
  src.forEach(([x, y], i) => {
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u, u], [0, 0, 0, x, y, 1, -x * v, -y * v, v]);
  });
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]; }
  }
  const [a, b, c, d, e, f, g, h] = A.map((row, i) => row[8] / row[i]);
  return (x, y) => { const z = g * x + h * y + 1; return [(a * x + b * y + c) / z, (d * x + e * y + f) / z]; };
}

// Puntero → unidades de mesa; `rect` es una ref que se vacía al cambiar de tamaño o hacer scroll.
// Con la cámara inclinada la mesa es un trapecio en pantalla: se miden sus esquinas y se deshace la perspectiva.
export const toTable = (e, table, rect, w, h) => {
  if (!rect.current) {
    const marks = [...table.querySelectorAll(':scope > .tk-corner')];
    if (marks.length === 4) {
      const pts = marks.map((m) => { const r = m.getBoundingClientRect(); return [r.left, r.top]; });
      rect.current = { map: homography(pts, [[0, 0], [w, 0], [w, h], [0, h]]) };
    } else rect.current = table.getBoundingClientRect();
  }
  const r = rect.current;
  return r.map ? r.map(e.clientX, e.clientY) : [((e.clientX - r.left) / r.width) * w, ((e.clientY - r.top) / r.height) * h];
};
