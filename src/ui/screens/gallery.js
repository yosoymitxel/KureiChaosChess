// Galería: grupos de imágenes según el progreso. Piezas, mutaciones, jefes, logros y mesas leen lo
// jugado; el resto llega después. Tocar una pieza, una mutación o un jefe abierto enseña cómo se mueve
// con la misma demo de la partida (demos.js), y tocar un logro lleva a su ficha en Logros.
import { html, useEffect, useRef, useState } from '../lib.js';
import { Topbar, useEnter, BossCard, ThemeLook } from '../components.js';
import { Icon } from '../icons.js';
import { Moments } from '../moments.js';
import { pieceSVG } from '../../view/piece-art.js';
import { PIECE_TYPES, PIECE_NAMES, PIECE_RULES } from '../../data/pieces.js';
import { BOSSES, BOSS_IDS } from '../../data/bosses.js';
import { MUTATIONS } from '../../data/mutations.js';
import { ACHIEVEMENTS, achievementGroups, loadAchievements, loadSeen, loadMutSeen } from '../../game/achievements.js';
import { THEMES } from '../../data/themes.js';
import { loadBosses, loadSettings } from '../../game/run.js';
import { themeOwned } from '../../game/shop.js';
import { playDemo, pieceDemo, mutationDemo, bossDemo } from '../demos.js';

// Grupos sin arte todavía: se muestran cerrados y honestos.
const SOON = [
  { id: 'personajes', name: 'Personajes', items: [{ id: 'a' }, { id: 'b' }] },
  { id: 'temporadas', name: 'Temporadas', items: [{ id: 'halloween', name: 'Halloween' }, { id: 'navidad', name: 'Navidad' }] },
];

// Tableros y fondos salen de las mesas reales: el tablero con su pieza, como en la tienda, y la madera de cada tema.
function ThemeGroup({ name, keys }) {
  return html`<section class="gal-group">
    <h2 class="gal-title">${name}</h2>
    <div class="gal-row">
      ${Object.values(THEMES).map((t) => {
        const owned = themeOwned(t.id);
        return html`<figure class=${'gal-item' + (owned ? '' : ' locked')} title=${owned ? t.name : 'Se compra en la tienda del Jardín Zen'}>
          <div class="gal-art gal-table">${keys ? html`<span class="gal-swatch">${keys.map((k) => html`<i style=${{ background: t.vars[k] }}></i>`)}</span>` : html`<${ThemeLook} t=${t} />`}${owned ? '' : html`<${Icon} name="lock" size=${14} />`}</div>
          <figcaption>${t.name}</figcaption>
        </figure>`;
      })}
    </div>
  </section>`;
}

const RULE = Object.fromEntries(PIECE_RULES);
const Locked = ({ title, name = '???' }) => html`<figure class="gal-item locked" title=${title}><div class="gal-art"><${Icon} name="lock" size=${26} /></div><figcaption>${name}</figcaption></figure>`;

export function GalleryScreen({ onBack, onAchievements }) {
  const ref = useRef(null);
  useEnter(ref);
  const beaten = loadBosses();
  const got = loadAchievements();
  const seen = loadSeen();
  const mutSeen = loadMutSeen();
  const mutIds = Object.keys(MUTATIONS);
  const [piece, setPiece] = useState(null);
  const done = ACHIEVEMENTS.filter((a) => got.includes(a.id)).length;
  // Las demos se montan sobre la pantalla; se crea al primer toque y se apaga al salir.
  const moments = useRef(null);
  useEffect(() => () => moments.current?.destroy(), []);
  const show = (spec) => {
    moments.current ||= new Moments(ref.current, { speed: loadSettings().speed || 1 });
    playDemo(moments.current, spec);
  };
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Galería" sub="Imágenes desbloqueables, por grupos" onBack=${onBack}>
      ${onAchievements && html`<button class="btn ghost sm" onClick=${() => onAchievements()}><${Icon} name="trophy" size=${16} />Logros</button>`}
    </${Topbar}>
    <div class="mini-body">
      <section class="gal-group">
        <h2 class="gal-title">Piezas <small>${seen.length}/${PIECE_TYPES.length}</small></h2>
        <div class="gal-row">
          ${PIECE_TYPES.map((t) => seen.includes(t)
            ? html`<button class=${'gal-item' + (piece === t ? ' on' : '')} aria-pressed=${piece === t} onClick=${() => { setPiece(t); show(pieceDemo(t)); }}>
                <div class="gal-art side-light" dangerouslySetInnerHTML=${{ __html: pieceSVG(t) }}></div>
                <span class="gal-cap">${PIECE_NAMES[t]}</span>
              </button>`
            : html`<${Locked} title="Aparece al encontrarla en la torre" />`)}
        </div>
        ${piece && html`<p class="gal-note"><b>${PIECE_NAMES[piece]}.</b> ${RULE[piece]}</p>`}
        ${seen.length < PIECE_TYPES.length && html`<p class="gal-note">Cada pieza se abre la primera vez que aparece en una mesa de la torre. Con todas cae el logro Enciclopedia.</p>`}
      </section>
      <section class="gal-group">
        <h2 class="gal-title">Mutaciones <small>${mutSeen.filter((id) => MUTATIONS[id]).length}/${mutIds.length}</small></h2>
        <div class="gal-row">
          ${mutIds.map((id) => mutSeen.includes(id)
            ? html`<button class="gal-item" title=${MUTATIONS[id].desc} onClick=${() => show(mutationDemo(id))}>
                <div class="gal-art"><${Icon} name=${MUTATIONS[id].icon} size=${40} /></div>
                <span class="gal-cap">${MUTATIONS[id].name}</span>
              </button>`
            : html`<${Locked} title="Se abre la primera vez que tu ejército la consigue en una run" />`)}
        </div>
      </section>
      <section class="gal-group">
        <h2 class="gal-title">Jefes <small>${BOSS_IDS.filter((id) => beaten.includes(id)).length}/${BOSS_IDS.length}</small></h2>
        <div class="rules">
          ${BOSS_IDS.map((id) => beaten.includes(id)
            ? html`<button class="gal-boss" aria-label=${`Ver cómo se mueve ${BOSSES[id].name}`} onClick=${() => show(bossDemo(id))}><${BossCard} boss=${BOSSES[id]} unlocked /></button>`
            : html`<${BossCard} boss=${BOSSES[id]} unlocked=${false} />`)}
        </div>
      </section>
      <section class="gal-group">
        <h2 class="gal-title">Logros <small>${done}/${ACHIEVEMENTS.length}</small></h2>
        ${achievementGroups(got).map(({ name, items, n }) => html`
          <h3 class="gal-sub">${name} <small>${n}/${items.length}</small></h3>
          <div class="gal-row">
            ${items.map((a) => html`<button class=${'gal-item' + (got.includes(a.id) ? '' : ' locked')} title=${a.desc} onClick=${() => onAchievements?.(a.id)}>
              <div class="gal-art"><${Icon} name=${got.includes(a.id) ? a.icon : 'lock'} size=${got.includes(a.id) ? 40 : 26} /></div>
              <span class="gal-cap">${a.name}</span>
            </button>`)}
          </div>`)}
      </section>
      <${ThemeGroup} name="Tableros" />
      <${ThemeGroup} name="Fondos" keys=${['table', 'table-2']} />
      ${SOON.map((g) => html`<section class="gal-group">
        <h2 class="gal-title">${g.name}</h2>
        <div class="gal-row">
          ${g.items.map((it) => html`<${Locked} title=${it.name || 'Próximamente'} name=${it.name} />`)}
        </div>
      </section>`)}
      <p class="mini-help">Las piezas, las mutaciones, los jefes y los logros se abren jugando; toca uno abierto para verlo en acción. Las mesas bloqueadas se compran en el Jardín Zen. El resto de los grupos llega cuando haya arte.</p>
    </div>
  </div>`;
}
