// Logros al estilo Steam: progreso total arriba, cada grupo con su barra y una rejilla de fichas
// iguales, primero las conseguidas.
import { html, useRef, useEffect } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { ACHIEVEMENTS, achievementGroups, loadAchievements } from '../../game/achievements.js';
import { t } from '../../i18n/index.js';

const Bar = ({ n, of }) => html`<span class="ach-bar" role="progressbar" aria-valuemin="0" aria-valuemax=${of} aria-valuenow=${n}><i style=${{ width: (100 * n) / of + '%' }}></i></span>`;

// `focus`: el logro que se tocó en la Galería; se lleva a la vista y destella.
export function AchievementsScreen({ onBack, onGallery, focus }) {
  const ref = useRef(null);
  useEnter(ref);
  const got = loadAchievements();
  const groups = achievementGroups(got);
  const total = ACHIEVEMENTS.filter((a) => got.includes(a.id)).length;
  useEffect(() => { ref.current?.querySelector(`[data-ach="${focus}"]`)?.scrollIntoView({ block: 'center' }); }, [focus]);
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title=${t('menu.achievements', 'Logros')} sub=${t('ach.sub', 'Hitos de tu progreso')} onBack=${onBack}>
      ${onGallery && html`<button class="btn ghost sm" onClick=${onGallery}><${Icon} name="book" size=${16} />${t('menu.gallery', 'Galería')}</button>`}
    </${Topbar}>
    <div class="mini-body ach-body">
      <section class="ach-total" data-enter>
        <b>${total} de ${ACHIEVEMENTS.length}</b>
        <span>${t('ach.done', '{n}% completado', { n: Math.round((100 * total) / ACHIEVEMENTS.length) })}</span>
        <${Bar} n=${total} of=${ACHIEVEMENTS.length} />
      </section>
      ${groups.map(({ name, items, n }) => {
        return html`<section class="ach-group" key=${name} data-enter>
          <h3><span>${t('achGroup.' + name, name)}</span><small>${n}/${items.length}</small></h3>
          <${Bar} n=${n} of=${items.length} />
          <div class="ach-grid">
            ${items.map((a) => {
              const on = got.includes(a.id);
              return html`<div key=${a.id} data-ach=${a.id} class=${'ach-tile' + (on ? ' on' : '') + (a.id === focus ? ' focus' : '')}>
                <span class="ach-badge"><${Icon} name=${on ? a.icon : 'lock'} size=${24} /></span>
                <b>${a.name}</b>
                <p>${a.desc}</p>
              </div>`;
            })}
          </div>
        </section>`;
      })}
    </div>
  </div>`;
}
