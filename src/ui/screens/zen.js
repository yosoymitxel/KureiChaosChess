// Jardín Zen: el cantero en 2.5D sobre la mesa. Sembrar, esperar, cosechar, cobrar.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { ZEN_KINDS, zenStage, zenPlant, zenHarvest, loadZen, saveZen } from '../../game/zen.js';
import { award } from '../../game/achievements.js';
import { COINS_PER_FLOWER, addCoins, loadShop } from '../../game/shop.js';

const NOMBRES = { romero: 'Romero', salvia: 'Salvia', lavanda: 'Lavanda' };
const ETAPAS = { empty: 'vacía', sprout: 'con brote', bud: 'con capullo', bloom: 'flor lista para cortar' };
// El cantero, en orden de lectura: 8 macetas, un estanque de 2×2, dos matas de pasto y dos piedras de paso.
const GARDEN = [
  { t: 'pot', i: 0 }, { t: 'pot', i: 1 }, { t: 'pot', i: 2 }, { t: 'lawn' },
  { t: 'pot', i: 3 }, { t: 'pot', i: 4 }, { t: 'pond' },
  { t: 'lawn' }, { t: 'pot', i: 5 },
  { t: 'pot', i: 6 }, { t: 'step' }, { t: 'step' }, { t: 'pot', i: 7 },
];

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
// El estanque ocupa cuatro celdas: agua, ondas, nenúfar en flor, piedras en la orilla y juncos.
const POND = html`<span class="bm-cell zen-pond zn-soil" aria-hidden="true"><svg class="zn-pondart" viewBox="0 0 48 48">
  <path class="zn-water" d="M4.5 29C4.5 15.5 12.6 6.4 24 6.4S43.5 15.5 43.5 29c0 8.4-6.7 14-19.5 14S4.5 37.4 4.5 29z"/>
  <path class="zn-rip" d="M14 27.5c0-4.4 4-7.3 9-7.3"/>
  <path class="zn-rip" d="M17.5 35.5c0-2.4 2.7-4.3 6.2-4.3"/>
  <path class="zn-lily" d="M30 34.6 34.3 32.9A4.1 4.1 0 1 1 33.8 37.7Z"/>
  <circle class="zn-petal" cx="30" cy="31" r="1.25"/><circle class="zn-petal" cx="31" cy="31.7" r="1.25"/><circle class="zn-petal" cx="30.6" cy="32.8" r="1.25"/><circle class="zn-petal" cx="29.4" cy="32.8" r="1.25"/><circle class="zn-petal" cx="29" cy="31.7" r="1.25"/><circle class="zn-dot" cx="30" cy="32" r=".75"/>
  <circle class="zn-stone" cx="38.6" cy="23.4" r="2.5"/>
  <circle class="zn-stone" cx="10.2" cy="37.8" r="1.9"/>
  <path class="zn-stem" d="M8.6 11.6c-.7-2.3-.6-4.6.5-7M11.8 12.8c-.3-2.5.3-4.8 1.7-6.7M14.8 14.2c.2-2 .9-3.6 2-5"/>
  <path class="zn-leaf zn-reed" d="M9.1 4.6c.4 1 .5 2 .2 3-.7-.8-.8-1.9-.2-3z"/>
  <path class="zn-leaf zn-reed" d="M13.5 6.1c.5 1 .6 2 .5 3-.8-.7-1.1-1.8-.5-3z"/>
</svg></span>`;
// Matas de pasto: tres briznas para romper la simetría del cantero.
const TUFT = html`<path class="zn-blade" d="M7.2 19.4c0-3.4.7-6 2-8.2M12 19.4c.1-4.3.8-7 1.7-9.2M16.8 19.4c-.3-3.4-1-5.6-2-7.4"/><path class="zn-blade" d="M9.6 19.2c-.1-2.2-.6-3.9-1.4-5.3M14.3 19.3c.5-2.2.5-4 .1-5.5"/>`;

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

export function ZenScreen({ onBack, onShop }) {
  const ref = useRef(null);
  useEnter(ref);
  const [z, setZ] = useState(loadZen);
  const [, tick] = useState(0);
  const [note, setNote] = useState(null); // maceta tocada que todavía no floreció
  const [seed, setSeed] = useState(0); // especie elegida para sembrar
  const [coins, setCoins] = useState(() => loadShop().coins);
  const [gain, setGain] = useState(null); // última flor cortada, para el aviso de monedas
  const coinRef = useRef(null);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (!gain) return; const t = setTimeout(() => setGain(null), 3200); return () => clearTimeout(t); }, [gain]);

  const now = Date.now();
  const apply = (next) => { if (next !== z) { saveZen(next); setZ(next); } };
  const tap = (i) => {
    const { stage, kind } = zenStage(z, i, now);
    if (stage === 'empty') { apply(zenPlant(z, i, ZEN_KINDS[seed], now)); setNote(null); }
    else if (stage === 'bloom') {
      const next = zenHarvest(z, i, now);
      apply(next);
      setNote(null);
      setCoins(addCoins(COINS_PER_FLOWER));
      setGain(kind);
      motion(coinRef.current, { scale: [1, 1.35, 1] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
      award('flower_1');
      const flores = ZEN_KINDS.reduce((n, k) => n + (next.flores[k] || 0), 0);
      if (flores >= 3) award('flower_3');
    }
    else setNote(i);
  };

  const total = ZEN_KINDS.reduce((n, k) => n + (z.flores[k] || 0), 0);
  // El estatus cuenta lo más útil: la maceta tocada, la flor que florecerá antes o la semilla elegida.
  const soon = z.pots
    .map((pot, i) => (pot ? zenStage(z, i, now) : null))
    .filter((x) => x && x.msLeft != null)
    .reduce((a, x) => (a == null || x.msLeft < a.msLeft ? x : a), null);
  const wait = note == null ? null : zenStage(z, note, now);
  const status = gain
    ? `+${COINS_PER_FLOWER} monedas por la ${NOMBRES[gain]}.`
    : wait && wait.msLeft != null
      ? `${NOMBRES[wait.kind]}: florece en ${Math.ceil(wait.msLeft / 1000)} s.`
      : soon
        ? `Creciendo: ${NOMBRES[soon.kind]} florece en ${Math.ceil(soon.msLeft / 1000)} s. En la colección: ${total}.`
        : `Semilla: ${NOMBRES[ZEN_KINDS[seed]]} · En la colección: ${total}.`;

  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Jardín Zen" sub="Un rincón tranquilo entre runs" onBack=${onBack}>
      <span class="coin-chip" ref=${coinRef} title="Monedas del jardín"><${Icon} name="coin" size=${16} /><b>${coins}</b></span>
    </${Topbar}>
    <div class="mini-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <p class="mini-help">Elige la semilla y toca una maceta vacía para sembrar; echa capullo al minuto y florece a los dos minutos y medio. Cuando la flor esté lista, la maceta se marca en latón: tócala y suma a tu colección; cada corte paga ${COINS_PER_FLOWER} monedas para la tienda.</p>
      <div class="zen-seeds" role="group" aria-label="Semilla para sembrar">
        ${ZEN_KINDS.map((k, ki) => html`<button class=${'zen-chip zen-seed zn-k-' + k + (seed === ki ? ' on' : '')} aria-pressed=${seed === ki} onClick=${() => setSeed(ki)}>${chipArt(k)}<span>${NOMBRES[k]}</span></button>`)}
      </div>
      <div class="mini-stage">
        <div class="zn-yard">
          <div class="bm zn-tray" role="group" aria-label="Cantero del jardín">
            ${GARDEN.map((cell) => {
              if (cell.t === 'pond') return POND;
              if (cell.t === 'lawn') return html`<span class="bm-cell zn-lawn" aria-hidden="true"><svg class="zn-tuft" viewBox="0 0 24 24">${TUFT}</svg></span>`;
              if (cell.t === 'step') return html`<span class="bm-cell zn-step" aria-hidden="true"></span>`;
              const i = cell.i;
              const st = zenStage(z, i, now);
              const cls = 'bm-cell zen-pot zn-soil' + (st.kind ? ' zn-k-' + st.kind : '') + (st.stage === 'bloom' ? ' ready' : '');
              return html`<button class=${cls} aria-label=${`Maceta ${i + 1}: ${st.kind ? NOMBRES[st.kind] + ', ' : ''}${ETAPAS[st.stage]}`} onClick=${() => tap(i)}>${potArt(st.kind, st.stage)}</button>`;
            })}
          </div>
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
      <div class="zen-desk">
        <button class="btn sm" data-enter onClick=${onShop}><${Icon} name="coin" size=${16} />Tienda del jardín</button>
      </div>
    </div>
  </div>`;
}
