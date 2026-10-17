// Galería: grupos de imágenes según el progreso. Piezas, jefes y logros leen lo jugado; el resto llega después.
import { html, useRef } from '../lib.js';
import { Topbar, useEnter, BossCard } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { PIECE_TYPES, PIECE_NAMES } from '../../data/pieces.js';
import { BOSSES, BOSS_IDS } from '../../data/bosses.js';
import { ACHIEVEMENTS, loadAchievements } from '../../game/achievements.js';
import { loadBosses } from '../../game/run.js';

// Grupos sin arte todavía: se muestran cerrados y honestos.
const SOON = [
  { id: 'tableros', name: 'Tableros', items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
  { id: 'fondos', name: 'Fondos', items: [{ id: 'a' }, { id: 'b' }] },
  { id: 'personajes', name: 'Personajes', items: [{ id: 'a' }, { id: 'b' }] },
  { id: 'temporadas', name: 'Temporadas', items: [{ id: 'halloween', name: 'Halloween' }, { id: 'navidad', name: 'Navidad' }] },
];

export function GalleryScreen({ onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const beaten = loadBosses();
  const got = loadAchievements();
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Galería" sub="Imágenes desbloqueables, por grupos" onBack=${onBack} />
    <div class="mini-body">
      <section class="gal-group">
        <h2 class="gal-title">Piezas</h2>
        <div class="gal-row">
          ${PIECE_TYPES.map((t) => html`<figure class="gal-item">
            <div class="gal-art" dangerouslySetInnerHTML=${{ __html: pieceSVG(t) }}></div>
            <figcaption>${PIECE_NAMES[t]}</figcaption>
          </figure>`)}
        </div>
      </section>
      <section class="gal-group">
        <h2 class="gal-title">Jefes</h2>
        <div class="rules">
          ${BOSS_IDS.map((id) => html`<${BossCard} boss=${BOSSES[id]} unlocked=${beaten.includes(id)} />`)}
        </div>
      </section>
      <section class="gal-group">
        <h2 class="gal-title">Logros</h2>
        <div class="gal-row">
          ${ACHIEVEMENTS.map((a) => got.includes(a.id)
            ? html`<figure class="gal-item"><div class="gal-art"><${Icon} name=${a.icon} size=${40} /></div><figcaption>${a.name}</figcaption></figure>`
            : html`<figure class="gal-item locked" title="Logro por conseguir"><div class="gal-art"><${Icon} name="lock" size=${26} /></div><figcaption>${a.name}</figcaption></figure>`)}
        </div>
      </section>
      ${SOON.map((g) => html`<section class="gal-group">
        <h2 class="gal-title">${g.name}</h2>
        <div class="gal-row">
          ${g.items.map((it) => html`<figure class="gal-item locked" title=${it.name || 'Próximamente'}>
            <div class="gal-art"><${Icon} name="lock" size=${26} /></div>
            ${it.name && html`<figcaption>${it.name}</figcaption>`}
          </figure>`)}
        </div>
      </section>`)}
      <p class="mini-help">Los jefes y los logros se abren jugando; el resto de los grupos llega cuando haya arte.</p>
    </div>
  </div>`;
}
