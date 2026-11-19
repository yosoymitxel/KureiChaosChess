import { html } from './lib.js';
import { GARDENS } from '../data/garden.js';

// Selector de jardín en la barra de arriba: cada jardín es su propia pantalla.
export function GardenSwitch({ current, onGarden }) {
  return html`<div class="garden-switch" role="tablist">
    ${Object.values(GARDENS).map((g) => html`<button role="tab" aria-selected=${g.id === current} class=${'btn sm' + (g.id === current ? ' on' : ' ghost')}
      onClick=${() => g.id !== current && onGarden(g.screen)}>${g.name}</button>`)}
  </div>`;
}
