// Monedas que saltan del punto de origen en arco y vuelan al monedero (jardín y tablero); `land`
// corre cuando llega la última, para que el contador suba al llegar.
import { motion } from './lib.js';
import { playSfx } from './sfx.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function flyCoins(from, purse, n, land) {
  const to = purse?.getBoundingClientRect();
  const done = () => { land(); playSfx('coin'); if (purse) motion(purse, { scale: [1, 1.35, 1] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }); };
  if (!from || !to || reduced()) return done();
  const x0 = from.left + from.width / 2, y0 = from.top + from.height * 0.3, x1 = to.left + to.width * 0.3, y1 = to.top + to.height / 2;
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.className = 'zn-coinpop';
    c.style.left = x0 + 'px'; c.style.top = y0 + 'px';
    document.body.appendChild(c);
    const sx = (i - (n - 1) / 2) * 26;
    motion(c, { x: [0, sx, x1 - x0], y: [0, -70 - i * 12, y1 - y0], scale: [0.4, 1.1, 0.7] }, { duration: 0.85, delay: i * 0.09, ease: 'easeInOut', onComplete: () => { c.remove(); if (i === n - 1) done(); } });
  }
}
