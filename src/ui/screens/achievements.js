// Logros: hitos del progreso, armados con lo que el juego ya hace.
import { html, useRef } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { ACHIEVEMENTS, loadAchievements } from '../../game/achievements.js';

export function AchievementsScreen({ onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const got = loadAchievements();
  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Logros" sub="Hitos de tu progreso" onBack=${onBack} />
    <div class="mini-body">
      <div class="ach-list">
        ${ACHIEVEMENTS.map((a) => {
          const on = got.includes(a.id);
          return html`<div class=${'ach-item' + (on ? '' : ' locked')}>
            <${Icon} name=${on ? a.icon : 'lock'} size=${22} />
            <div>
              <b>${a.name}</b>
              <p>${a.desc}</p>
            </div>
          </div>`;
        })}
      </div>
      <p class="mini-help">${got.length} de ${ACHIEVEMENTS.length} logros.</p>
    </div>
  </div>`;
}
