// Unlocked minigames, playable outside a run.
import { html, useRef } from '../lib.js';
import { Icon } from '../icons.js';
import { Topbar, useEnter } from '../components.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';

export function MinisScreen({ unlocked, onBack, onPlay }) {
  const ref = useRef(null);
  useEnter(ref);
  return html`<div class="screen minis" ref=${ref}>
    <${Topbar} title=${t('menu.minis', 'Minijuegos')} sub=${t('minis.sub', 'Los que ya ganaste en una run')} onBack=${onBack} />
    <div class="mini-body">
      <div class="minis-list">
        ${unlocked.map((id) => MODIFIERS[id] && html`<button class="btn" data-enter onClick=${() => onPlay(id)}>
          <span class="mini-chip"><${Icon} name=${MODIFIERS[id].icon} /></span>${MODIFIERS[id].name}</button>`)}
      </div>
    </div>
  </div>`;
}
