// Logros: hitos del progreso, agrupados por dónde se ganan.
import { html, useRef } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS, loadAchievements } from '../../game/achievements.js';

export function AchievementsScreen({ onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const got = loadAchievements();
  const groups = ACHIEVEMENT_GROUPS
    .map((name) => ({ name, items: ACHIEVEMENTS.filter((a) => a.group === name) }))
    .filter((g) => g.items.length);
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Logros" sub="Hitos de tu progreso" onBack=${onBack} />
    <div class="mini-body">
      ${groups.map((g) => html`<section class="ach-group" key=${g.name}>
        <h3>${g.name}<small>${g.items.filter((a) => got.includes(a.id)).length}/${g.items.length}</small></h3>
        <div class="ach-list">
          ${g.items.map((a) => {
            const on = got.includes(a.id);
            return html`<div key=${a.id} class=${'ach-item' + (on ? '' : ' locked')}>
              <${Icon} name=${on ? a.icon : 'lock'} size=${22} />
              <div>
                <b>${a.name}</b>
                <p>${a.desc}</p>
              </div>
            </div>`;
          })}
        </div>
      </section>`)}
      <p class="mini-help">${got.length} de ${ACHIEVEMENTS.length} logros.</p>
    </div>
  </div>`;
}
