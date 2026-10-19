// Galería: grupos de imágenes según el progreso. Piezas, jefes, logros y mesas leen lo jugado; el resto llega después.
import { html, useRef, useState } from '../lib.js';
import { Topbar, useEnter, BossCard } from '../components.js';
import { Icon } from '../icons.js';
import { pieceSVG } from '../../view/piece-art.js';
import { PIECE_TYPES, PIECE_NAMES, PIECE_RULES } from '../../data/pieces.js';
import { BOSSES, BOSS_IDS } from '../../data/bosses.js';
import { ACHIEVEMENTS, loadAchievements, loadSeen } from '../../game/achievements.js';
import { THEMES } from '../../data/themes.js';
import { loadBosses } from '../../game/run.js';
import { themeOwned } from '../../game/shop.js';

// Grupos sin arte todavía: se muestran cerrados y honestos.
const SOON = [
  { id: 'personajes', name: 'Personajes', items: [{ id: 'a' }, { id: 'b' }] },
  { id: 'temporadas', name: 'Temporadas', items: [{ id: 'halloween', name: 'Halloween' }, { id: 'navidad', name: 'Navidad' }] },
];

// Tableros y fondos salen de las mesas reales: las casillas y la madera de cada tema.
function ThemeGroup({ name, keys }) {
  return html`<section class="gal-group">
    <h2 class="gal-title">${name}</h2>
    <div class="gal-row">
      ${Object.values(THEMES).map((t) => {
        const owned = themeOwned(t.id);
        return html`<figure class=${'gal-item' + (owned ? '' : ' locked')} title=${owned ? t.name : 'Se compra en la tienda del Jardín Zen'}>
          <div class="gal-art gal-table"><span class="gal-swatch">${keys.map((k) => html`<i style=${{ background: t.vars[k] }}></i>`)}</span>${owned ? '' : html`<${Icon} name="lock" size=${14} />`}</div>
          <figcaption>${t.name}</figcaption>
        </figure>`;
      })}
    </div>
  </section>`;
}

const RULE = Object.fromEntries(PIECE_RULES);

export function GalleryScreen({ onBack, onAchievements }) {
  const ref = useRef(null);
  useEnter(ref);
  const beaten = loadBosses();
  const got = loadAchievements();
  const seen = loadSeen();
  const [piece, setPiece] = useState(null);
  const done = ACHIEVEMENTS.filter((a) => got.includes(a.id)).length;
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Galería" sub="Imágenes desbloqueables, por grupos" onBack=${onBack}>
      ${onAchievements && html`<button class="btn ghost sm" onClick=${onAchievements}><${Icon} name="trophy" size=${16} />Logros</button>`}
    </${Topbar}>
    <div class="mini-body">
      <section class="gal-group">
        <h2 class="gal-title">Piezas <small>${seen.length}/${PIECE_TYPES.length}</small></h2>
        <div class="gal-row">
          ${PIECE_TYPES.map((t) => seen.includes(t)
            ? html`<button class=${'gal-item' + (piece === t ? ' on' : '')} aria-pressed=${piece === t} onClick=${() => setPiece(piece === t ? null : t)}>
                <div class="gal-art side-light" dangerouslySetInnerHTML=${{ __html: pieceSVG(t) }}></div>
                <span class="gal-cap">${PIECE_NAMES[t]}</span>
              </button>`
            : html`<figure class="gal-item locked" title="Aparece al encontrarla en la torre"><div class="gal-art"><${Icon} name="lock" size=${26} /></div><figcaption>???</figcaption></figure>`)}
        </div>
        ${piece && html`<p class="gal-note"><b>${PIECE_NAMES[piece]}.</b> ${RULE[piece]}</p>`}
        ${seen.length < PIECE_TYPES.length && html`<p class="gal-note">Cada pieza se abre la primera vez que aparece en una mesa de la torre. Con todas cae el logro Enciclopedia.</p>`}
      </section>
      <section class="gal-group">
        <h2 class="gal-title">Jefes</h2>
        <div class="rules">
          ${BOSS_IDS.map((id) => html`<${BossCard} boss=${BOSSES[id]} unlocked=${beaten.includes(id)} />`)}
        </div>
      </section>
      <section class="gal-group">
        <h2 class="gal-title">Logros <small>${done}/${ACHIEVEMENTS.length}</small></h2>
        <div class="gal-row">
          ${ACHIEVEMENTS.map((a) => got.includes(a.id)
            ? html`<figure class="gal-item"><div class="gal-art"><${Icon} name=${a.icon} size=${40} /></div><figcaption>${a.name}</figcaption></figure>`
            : html`<figure class="gal-item locked" title="Logro por conseguir"><div class="gal-art"><${Icon} name="lock" size=${26} /></div><figcaption>${a.name}</figcaption></figure>`)}
        </div>
      </section>
      <${ThemeGroup} name="Tableros" keys=${['tile-a', 'tile-b', 'tile-side']} />
      <${ThemeGroup} name="Fondos" keys=${['table', 'table-2']} />
      ${SOON.map((g) => html`<section class="gal-group">
        <h2 class="gal-title">${g.name}</h2>
        <div class="gal-row">
          ${g.items.map((it) => html`<figure class="gal-item locked" title=${it.name || 'Próximamente'}>
            <div class="gal-art"><${Icon} name="lock" size=${26} /></div>
            ${it.name && html`<figcaption>${it.name}</figcaption>`}
          </figure>`)}
        </div>
      </section>`)}
      <p class="mini-help">Las piezas, los jefes y los logros se abren jugando; las mesas bloqueadas se compran en el Jardín Zen. El resto de los grupos llega cuando haya arte.</p>
    </div>
  </div>`;
}
