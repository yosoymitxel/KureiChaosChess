// Galería: imágenes en grupos, según desbloqueables. El arte real llega después; por ahora, placeholders.
import { html, useRef } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { PIECE_TYPES, PIECE_NAMES } from '../../data/pieces.js';

const GROUPS = [
  { id: 'piezas', name: 'Piezas', on: true, items: PIECE_TYPES.map((t) => ({ id: t, name: PIECE_NAMES[t] })) },
  { id: 'tableros', name: 'Tableros', on: false, items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
  { id: 'fondos', name: 'Fondos', on: false, items: [{ id: 'a' }, { id: 'b' }] },
  { id: 'personajes', name: 'Personajes', on: false, items: [{ id: 'a' }, { id: 'b' }] },
  { id: 'temporadas', name: 'Temporadas', on: false, items: [{ id: 'halloween', name: 'Halloween' }, { id: 'navidad', name: 'Navidad' }] },
];

export function GalleryScreen({ onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Galería" sub="Imágenes desbloqueables, por grupos" onBack=${onBack} />
    <div class="mini-body">
      ${GROUPS.map((g) => html`<section class="gal-group">
        <h2 class="gal-title">${g.name}</h2>
        <div class="gal-row">
          ${g.items.map((it) => g.on
            ? html`<figure class="gal-item">
                <div class="gal-art" dangerouslySetInnerHTML=${{ __html: pieceSVG(it.id) }}></div>
                <figcaption>${it.name}</figcaption>
              </figure>`
            : html`<figure class="gal-item locked" title=${it.name || 'Próximamente'}>
                <div class="gal-art"><${Icon} name="lock" size=${26} /></div>
                ${it.name && html`<figcaption>${it.name}</figcaption>`}
              </figure>`)}
        </div>
      </section>`)}
      <p class="mini-help">Las imágenes se desbloquean con el progreso. Las piezas ya tienen arte; los demás grupos llegan después.</p>
    </div>
  </div>`;
}
