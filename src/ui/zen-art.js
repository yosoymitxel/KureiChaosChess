// La flor del Jardín Zen recortada para fichas; la comparten el jardín y la tienda.
import { html } from './lib.js';

// La flor abierta de cada especie: racimo menudito, espiga de verticilos y espiga alta.
export const HEAD = {
  romero: html`<circle class="zn-leaf" cx="12" cy="5.9" r="1.5"/><circle class="zn-leaf" cx="9.8" cy="8.1" r="1.4"/><circle class="zn-leaf" cx="14.2" cy="8.1" r="1.4"/><circle class="zn-dot" cx="12" cy="5.8" r=".45"/><circle class="zn-dot" cx="9.8" cy="8" r=".45"/><circle class="zn-dot" cx="14.2" cy="8" r=".45"/>`,
  salvia: html`<path class="zn-leaf" d="M12 4.6c.5 1.2 1.2 1.8 2 2.2-1 .5-1.7 1.2-2 2.6-.3-1.4-1-2.1-2-2.6.8-.4 1.5-1 2-2.2z"/><path class="zn-leaf" d="M12 8.2c.4 1 1 1.5 1.7 1.8-.8.4-1.4 1-1.7 2-.3-1-.9-1.6-1.7-2 .7-.3 1.3-.8 1.7-1.8z"/>`,
  lavanda: html`<path class="zn-leaf" d="M12 3.9c1.2 1.3 1.8 2.9 1.8 4.7 0 1.5-.7 2.5-1.8 2.5s-1.8-1-1.8-2.5c0-1.8.6-3.4 1.8-4.7z"/><path class="zn-cut" d="M10.6 6.1h2.8"/><path class="zn-cut" d="M10.8 7.8h2.4"/>`,
};
// Recortada por el viewBox para que se lea a 24 px.
export const chipArt = (kind) => html`<svg viewBox="6.2 3.4 11.6 8.4" aria-hidden="true">${HEAD[kind]}<path class="zn-stem" d="M12 11.4V9.6"/></svg>`;
