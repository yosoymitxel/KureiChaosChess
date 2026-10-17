// Jardín Zen: el apartado tranquilo entre runs. Sembrar, esperar, cosechar.
import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { ZEN_KINDS, zenStage, zenPlant, zenHarvest, loadZen, saveZen } from '../../game/zen.js';
import { award } from '../../game/achievements.js';

const NOMBRES = { romero: 'Romero', salvia: 'Salvia', lavanda: 'Lavanda' };
const ETAPAS = { empty: 'vacía', sprout: 'con brote', bud: 'con capullo', bloom: 'flor lista para cortar' };
const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // el centro (4) es el estanque

// El tiesto de cartón y su tierra se dibujan siempre; la tierra va al final para tapar el nacimiento del tallo.
const POT = html`<path class="zn-potb" d="M6.3 16.6h11.4l-1.15 3.9c-.15.5-.6.85-1.12.85H8.57c-.52 0-.97-.35-1.12-.85z"/><rect class="zn-potb" x="5.6" y="14.4" width="12.8" height="2.2" rx="0.9"/>`;
const SOIL = html`<ellipse class="zn-soil" cx="12" cy="15" rx="5.4" ry="1.15"/>`;

// Hojas por especie: el brote lleva un par corto y la planta crecida dos pares. Cada silueta es su firma.
const SPROUT = {
  romero: html`<path class="zn-leaf" d="M12 13.4C11.4 13.2 10.7 12.6 10.2 11.1 11 12.1 11.6 12.6 12 13.4Z"/><path class="zn-leaf" d="M12 13.4C12.6 13.2 13.3 12.6 13.8 11.1 13 12.1 12.4 12.6 12 13.4Z"/>`,
  salvia: html`<path class="zn-leaf" d="M12 13.5C10.9 13.4 9.9 12.8 9.4 11.3 10.6 11.5 11.6 12.2 12 13.5Z"/><path class="zn-leaf" d="M12 13.5C13.1 13.4 14.1 12.8 14.6 11.3 13.4 11.5 12.4 12.2 12 13.5Z"/>`,
  lavanda: html`<path class="zn-leaf" d="M12 13.5C11.5 13.3 11 12.7 10.7 11.2 11.4 12.1 11.8 12.7 12 13.5Z"/><path class="zn-leaf" d="M12 13.5C12.5 13.3 13 12.7 13.3 11.2 12.6 12.1 12.2 12.7 12 13.5Z"/>`,
};
const GROWN = {
  romero: html`<path class="zn-leaf" d="M12 13.6C11.2 13.4 10.2 12.6 9.6 10.6 10.6 11.9 11.4 12.6 12 13.6Z"/><path class="zn-leaf" d="M12 13.6C12.8 13.4 13.8 12.6 14.4 10.6 13.4 11.9 12.6 12.6 12 13.6Z"/><path class="zn-leaf" d="M12 11.6C11.4 11.4 10.6 10.8 10.1 9.3 10.9 10.3 11.6 10.8 12 11.6Z"/><path class="zn-leaf" d="M12 11.6C12.6 11.4 13.4 10.8 13.9 9.3 13.1 10.3 12.4 10.8 12 11.6Z"/>`,
  salvia: html`<path class="zn-leaf" d="M12 13.8C10.6 13.7 9.4 13 8.8 11.3 10.2 11.5 11.4 12.4 12 13.8Z"/><path class="zn-leaf" d="M12 13.8C13.4 13.7 14.6 13 15.2 11.3 13.8 11.5 12.6 12.4 12 13.8Z"/><path class="zn-leaf" d="M12 11.8C11 11.7 10.1 11.2 9.6 9.9 10.7 10.1 11.6 10.8 12 11.8Z"/><path class="zn-leaf" d="M12 11.8C13 11.7 13.9 11.2 14.4 9.9 13.3 10.1 12.4 10.8 12 11.8Z"/>`,
  lavanda: html`<path class="zn-leaf" d="M12 13.8C11.4 13.6 10.7 12.7 10.4 10.4 11.4 11.7 11.9 12.6 12 13.8Z"/><path class="zn-leaf" d="M12 13.8C12.6 13.6 13.3 12.7 13.6 10.4 12.6 11.7 12.1 12.6 12 13.8Z"/><path class="zn-leaf" d="M12 11.8C11.5 11.6 11 10.9 10.8 9.1 11.5 10.1 11.9 10.9 12 11.8Z"/><path class="zn-leaf" d="M12 11.8C12.5 11.6 13 10.9 13.2 9.1 12.5 10.1 12.1 10.9 12 11.8Z"/>`,
};
// El capullo cerrado y la flor abierta de cada especie: racimo menudito, espiga de verticilos y espiga alta.
const BUD = html`<path class="zn-leaf" d="M12 5.2c1.5.5 2.4 1.8 2.4 3.4 0 1.7-1 2.8-2.4 2.8s-2.4-1.1-2.4-2.8c0-1.6.9-2.9 2.4-3.4z"/><path class="zn-cut" d="M10.4 6.7c-.4.8-.5 1.7-.3 2.5M13.6 6.7c.4.8.5 1.7.3 2.5"/>`;
const HEAD = {
  romero: html`<circle class="zn-leaf" cx="12" cy="5.9" r="1.5"/><circle class="zn-leaf" cx="9.8" cy="8.1" r="1.4"/><circle class="zn-leaf" cx="14.2" cy="8.1" r="1.4"/><circle class="zn-dot" cx="12" cy="5.8" r=".45"/><circle class="zn-dot" cx="9.8" cy="8" r=".45"/><circle class="zn-dot" cx="14.2" cy="8" r=".45"/>`,
  salvia: html`<path class="zn-leaf" d="M12 4.6c.5 1.2 1.2 1.8 2 2.2-1 .5-1.7 1.2-2 2.6-.3-1.4-1-2.1-2-2.6.8-.4 1.5-1 2-2.2z"/><path class="zn-leaf" d="M12 8.2c.4 1 1 1.5 1.7 1.8-.8.4-1.4 1-1.7 2-.3-1-.9-1.6-1.7-2 .7-.3 1.3-.8 1.7-1.8z"/>`,
  lavanda: html`<path class="zn-leaf" d="M12 3.9c1.2 1.3 1.8 2.9 1.8 4.7 0 1.5-.7 2.5-1.8 2.5s-1.8-1-1.8-2.5c0-1.8.6-3.4 1.8-4.7z"/><path class="zn-cut" d="M10.6 6.1h2.8"/><path class="zn-cut" d="M10.8 7.8h2.4"/>`,
};
// El estanque del centro: charco de tinta con dos ondas, un nenúfar en flor y dos piedras.
const POND = html`<span class="bm-cell zen-pond" aria-hidden="true"><svg class="zn-pondart" viewBox="0 0 24 24">
  <path class="zn-water" d="M4.9 14c0-3.3 3.2-5.6 7.1-5.6s7.1 2.3 7.1 5.6c0 2-.9 3.6-2.5 4.5-1.3.8-2.9 1.2-4.6 1.2s-3.3-.4-4.6-1.2C5.8 17.6 4.9 16 4.9 14z"/>
  <path class="zn-rip" d="M8.3 13.4c0-1.6 1.6-2.6 3.5-2.6"/>
  <path class="zn-rip" d="M9.5 16.3c0-.9 1-1.6 2.2-1.6"/>
  <path class="zn-lily" d="M15.6 16.3 17.8 15.7A2.1 2.1 0 1 1 17.5 18Z"/>
  <circle class="zn-petal" cx="15.5" cy="15.1" r=".65"/><circle class="zn-petal" cx="16.5" cy="15.8" r=".65"/><circle class="zn-petal" cx="16.1" cy="16.9" r=".65"/><circle class="zn-petal" cx="14.9" cy="16.9" r=".65"/><circle class="zn-petal" cx="14.5" cy="15.8" r=".65"/><circle class="zn-dot" cx="15.5" cy="16.1" r=".4"/>
  <circle class="zn-stone" cx="18.2" cy="13.3" r="1.35"/>
  <circle class="zn-stone" cx="6.1" cy="19.2" r="1.05"/>
</svg></span>`;

// Una maceta completa: el tiesto siempre, la planta encima según su etapa.
function potArt(kind, stage) {
  const grown = stage === 'bud' || stage === 'bloom';
  const stem = grown ? 'M12 15.3V9.5' : stage === 'sprout' ? 'M12 15.3V12.6' : '';
  return html`<svg class="zn-plant" viewBox="0 0 24 24" aria-hidden="true">
    ${POT}
    ${stem && html`<path class="zn-stem" d=${stem}/>`}
    ${stage === 'sprout' ? SPROUT[kind] : grown ? GROWN[kind] : null}
    ${stage === 'bud' ? BUD : stage === 'bloom' ? HEAD[kind] : null}
    ${SOIL}
  </svg>`;
}
// En la repisa la flor va sola, recortada por el viewBox, para que se lea a 24 px.
const chipArt = (kind) => html`<svg viewBox="6.2 3.4 11.6 8.4" aria-hidden="true">${HEAD[kind]}<path class="zn-stem" d="M12 11.4V9.6"/></svg>`;

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
    ? `${NOMBRES[wait.kind]}: florece en ${Math.ceil(wait.msLeft / 1000)} s.`
    : `Lo próximo que plantas: ${NOMBRES[nextKind]} · En la colección: ${total}.`;

  const pot = (cell) => (cell === 4 ? -1 : cell < 4 ? cell : cell - 1);

  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Jardín Zen" sub="Un rincón tranquilo entre runs" onBack=${onBack} />
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <p class="mini-help">Toca una maceta vacía para sembrar; echa capullo al minuto y florece a los dos minutos y medio. Cuando la flor esté lista, la maceta se marca en latón: tócala y suma a tu colección.</p>
      <div class="mini-stage">
        <div class="bm zn-tray" style=${{ '--n': 3 }} role="group" aria-label="Macetas del jardín">
          ${CELLS.map((cell) => {
            const i = pot(cell);
            if (i < 0) return POND;
            const st = zenStage(z, i, now);
            const cls = 'bm-cell zen-pot' + (st.kind ? ' zn-k-' + st.kind : '') + (st.stage === 'bloom' ? ' ready' : '');
            return html`<button class=${cls} aria-label=${`Maceta ${i + 1}: ${st.kind ? NOMBRES[st.kind] + ', ' : ''}${ETAPAS[st.stage]}`} onClick=${() => tap(i)}>${potArt(st.kind, st.stage)}</button>`;
          })}
        </div>
      </div>
      <div class="zen-shelf">
        ${ZEN_KINDS.map((k) => {
          const n = z.flores[k] || 0;
          return html`<span class=${'zen-chip zn-k-' + k + (n ? '' : ' pending')}>
            ${chipArt(k)}
            <b>${n}</b><span>${NOMBRES[k]}</span>
          </span>`;
        })}
      </div>
    </div>
  </div>`;
}
