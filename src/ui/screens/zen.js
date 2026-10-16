// Jardín Zen: el apartado tranquilo entre runs. Sembrar, esperar, cosechar.
import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { ZEN_KINDS, zenStage, zenPlant, zenHarvest, loadZen, saveZen } from '../../game/zen.js';
import { award } from '../../game/achievements.js';

const NOMBRES = { romero: 'Romero', salvia: 'Salvia', lavanda: 'Lavanda' };
const ETAPAS = { empty: 'vacía', sprout: 'con brote', bud: 'con capullo', bloom: 'flor lista para cortar' };
const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // el centro (4) es el estanque

// Bocetos por etapa: brote, capullo y flor. Capullo y flor se tiñen con el color de su especie.
const PLANT = {
  sprout: html`<rect x="11.3" y="14" width="1.4" height="7" rx="0.7" /><path d="M12.7 15.5c-2.7 0-4.7-1.9-5-4.7 2.8 0 4.7 1.8 5 4.7z" /><path d="M11.3 15.5c2.7 0 4.7-1.9 5-4.7-2.8 0-4.7 1.8-5 4.7z" />`,
  bud: html`<rect x="11.3" y="15" width="1.4" height="6" rx="0.7" /><path d="M12.7 16c-2.5 0-4.4-1.8-4.7-4.4 2.6 0 4.4 1.7 4.7 4.4z" /><path d="M11.3 16c2.5 0 4.4-1.8 4.7-4.4-2.6 0-4.4 1.7-4.7 4.4z" /><path class="zn-bloom" d="M12 3.2c2.2 1.7 3.2 3.9 2.6 6.1-.4 1.6-1.4 2.5-2.6 2.5s-2.2-.9-2.6-2.5C8.8 7.1 9.8 4.9 12 3.2z" />`,
  bloom: html`<rect x="11.3" y="15" width="1.4" height="6" rx="0.7" /><path d="M12.7 16c-2.5 0-4.4-1.8-4.7-4.4 2.6 0 4.4 1.7 4.7 4.4z" /><path d="M11.3 16c2.5 0 4.4-1.8 4.7-4.4-2.6 0-4.4 1.7-4.7 4.4z" /><g class="zn-bloom"><circle cx="12" cy="6.2" r="2.2" /><circle cx="15.1" cy="8.6" r="2.2" /><circle cx="13.9" cy="12.2" r="2.2" /><circle cx="10.1" cy="12.2" r="2.2" /><circle cx="8.9" cy="8.6" r="2.2" /></g><circle class="zn-heart" cx="12" cy="9.6" r="1.5" />`,
};

export function ZenScreen({ onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const [z, setZ] = useState(loadZen);
  const [, tick] = useState(0);
  const [note, setNote] = useState(null); // maceta tocada que todavía no floreció
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id); }, []);

  const now = Date.now();
  const apply = (next) => { if (next !== z) { saveZen(next); setZ(next); } };
  const tap = (i) => {
    const { stage } = zenStage(z, i, now);
    if (stage === 'empty') { apply(zenPlant(z, i, now)); setNote(null); }
    else if (stage === 'bloom') {
      const next = zenHarvest(z, i, now);
      apply(next);
      setNote(null);
      award('flower_1');
      const flores = ZEN_KINDS.reduce((n, k) => n + (next.flores[k] || 0), 0);
      if (flores >= 3) award('flower_3');
    }
    else setNote(i);
  };

  const total = ZEN_KINDS.reduce((n, k) => n + (z.flores[k] || 0), 0);
  const nextKind = ZEN_KINDS[z.planted % ZEN_KINDS.length];
  const wait = note == null ? null : zenStage(z, note, now);
  const status = wait && wait.msLeft != null
    ? `Florece en ${Math.ceil(wait.msLeft / 1000)} s.`
    : `Lo próximo que plantas: ${NOMBRES[nextKind]} · En la colección: ${total}.`;

  const pot = (cell) => (cell === 4 ? -1 : cell < 4 ? cell : cell - 1);

  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Jardín Zen" sub="Un rincón tranquilo entre runs" onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <p class="mini-help">Toca una maceta vacía para sembrar; echa capullo al minuto y florece a los dos minutos y medio. Tócala florecida y esa flor suma a tu colección.</p>
      <div class="mini-stage">
        <div class="bm" style=${{ '--n': 3 }} role="group" aria-label="Macetas del jardín">
          ${CELLS.map((cell) => {
            const i = pot(cell);
            if (i < 0) return html`<span class="bm-cell zen-pond" aria-hidden="true"></span>`;
            const st = zenStage(z, i, now);
            const cls = 'bm-cell ' + ((cell + Math.floor(cell / 3)) % 2 ? 'b' : 'a') + ' zen-pot' + (st.kind ? ' zn-k-' + st.kind : '');
            return html`<button class=${cls} aria-label=${`Maceta ${i + 1}, ${ETAPAS[st.stage]}`} onClick=${() => tap(i)}>
              ${st.stage !== 'empty' && html`<svg class="zn-plant" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${PLANT[st.stage]}</svg>`}
            </button>`;
          })}
        </div>
      </div>
      <div class="zen-shelf">
        ${ZEN_KINDS.map((k) => {
          const n = z.flores[k] || 0;
          return html`<span class=${'zen-chip zn-k-' + k + (n ? '' : ' pending')}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${PLANT.bloom}</svg>
            <b>${n}</b><span>${NOMBRES[k]}</span>
          </span>`;
        })}
      </div>
    </div>
  </div>`;
}
