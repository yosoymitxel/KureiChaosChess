// Logros al estilo Steam: progreso total arriba, cada grupo con su barra y una rejilla de fichas
// iguales, primero las conseguidas.
import { html, useRef } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS, loadAchievements } from '../../game/achievements.js';

const Bar = ({ n, of }) => html`<span class="ach-bar" role="progressbar" aria-valuemin="0" aria-valuemax=${of} aria-valuenow=${n}><i style=${{ width: (100 * n) / of + '%' }}></i></span>`;

export function AchievementsScreen({ onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const got = loadAchievements();
  const groups = ACHIEVEMENT_GROUPS
    .map((name) => {
      const items = ACHIEVEMENTS.filter((a) => a.group === name);
      return { name, items: [...items.filter((a) => got.includes(a.id)), ...items.filter((a) => !got.includes(a.id))] };
    })
    .filter((g) => g.items.length);
  const total = ACHIEVEMENTS.filter((a) => got.includes(a.id)).length;
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Logros" sub="Hitos de tu progreso" onBack=${onBack} />
    <div class="mini-body ach-body">
      <section class="ach-total" data-enter>
        <b>${total} de ${ACHIEVEMENTS.length}</b>
        <span>${Math.round((100 * total) / ACHIEVEMENTS.length)}% completado</span>
        <${Bar} n=${total} of=${ACHIEVEMENTS.length} />
      </section>
      ${groups.map((g) => {
        const n = g.items.filter((a) => got.includes(a.id)).length;
        return html`<section class="ach-group" key=${g.name} data-enter>
          <h3><span>${g.name}</span><small>${n}/${g.items.length}</small></h3>
          <${Bar} n=${n} of=${g.items.length} />
          <div class="ach-grid">
            ${g.items.map((a) => {
              const on = got.includes(a.id);
              return html`<div key=${a.id} class=${'ach-tile' + (on ? ' on' : '')}>
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
