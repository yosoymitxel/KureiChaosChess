// Jardín Zen: el cantero 2.5D sobre la mesa. Semillas reales, herramientas y tierra hasta 8×8.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { chipArt, HEAD } from '../zen-art.js';
import { ZEN_KINDS, ZEN_NAMES, ZEN_MAX, ZEN_BASE, BASE_GRID, cellKey, expandCost, zenStage, zenSow, zenWater, zenDig, zenHarvest, zenExpand, loadZen, saveZen } from '../../game/zen.js';
import { award } from '../../game/achievements.js';
import { COINS_PER_FLOWER, addCoins, charge, loadShop } from '../../game/shop.js';

const ETAPAS = { empty: 'vacía', sprout: 'con brote', bud: 'con capullo', bloom: 'lista para cortar' };
// Sembrar es la herramienta por defecto; ampliar se paga en monedas y pide confirmación.
const TOOLS = [
  { id: 'sow', icon: 'seed', name: 'Sembrar' },
  { id: 'water', icon: 'drop', name: 'Regar' },
  { id: 'dig', icon: 'spade', name: 'Cavar' },
  { id: 'cut', icon: 'shears', name: 'Cortar' },
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
// El capullo cerrado: una yema con dos cortes de color.
const BUD = html`<path class="zn-leaf" d="M12 5.2c1.5.5 2.4 1.8 2.4 3.4 0 1.7-1 2.8-2.4 2.8s-2.4-1.1-2.4-2.8c0-1.6.9-2.9 2.4-3.4z"/><path class="zn-cut" d="M10.4 6.7c-.4.8-.5 1.7-.3 2.5M13.6 6.7c.4.8.5 1.7.3 2.5"/>`;
// Juncos y guijarros de la orilla: piezas de pie con sombra, recortadas a su contenido.
const REEDS = html`<span class="zn-stand zn-reeds" aria-hidden="true"><svg viewBox="5.5 3.5 13 12" preserveAspectRatio="xMidYMax meet">
  <path class="zn-stem" d="M8.6 11.6c-.7-2.3-.6-4.6.5-7M11.8 12.8c-.3-2.5.3-4.8 1.7-6.7M14.8 14.2c.2-2 .9-3.6 2-5"/>
  <path class="zn-leaf zn-reed" d="M9.1 4.6c.4 1 .5 2 .2 3-.7-.8-.8-1.9-.2-3z"/>
  <path class="zn-leaf zn-reed" d="M13.5 6.1c.5 1 .6 2 .5 3-.8-.7-1.1-1.8-.5-3z"/>
</svg></span>`;
const PEEBLES = html`<span class="zn-stand zn-pebbles" aria-hidden="true"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMax meet">
  <circle class="zn-stone" cx="7.4" cy="16.6" r="3.4"/>
  <circle class="zn-stone" cx="14.2" cy="18" r="2.5"/>
  <circle class="zn-stone" cx="11.6" cy="13" r="1.9"/>
</svg></span>`;
// El estanque ocupa cuatro celdas: agua, ondas y nenúfar en flor; los juncos y los guijarros
// van de pie en la orilla, como el resto de las piezas del cantero.
const POND = html`<span class="bm-cell zen-pond zn-soil" aria-hidden="true"><svg class="zn-pondart" viewBox="0 0 48 48">
  <path class="zn-water" d="M4.5 29C4.5 15.5 12.6 6.4 24 6.4S43.5 15.5 43.5 29c0 8.4-6.7 14-19.5 14S4.5 37.4 4.5 29z"/>
  <path class="zn-rip" d="M14 27.5c0-4.4 4-7.3 9-7.3"/>
  <path class="zn-rip" d="M17.5 35.5c0-2.4 2.7-4.3 6.2-4.3"/>
  <path class="zn-lily" d="M30 34.6 34.3 32.9A4.1 4.1 0 1 1 33.8 37.7Z"/>
  <circle class="zn-petal" cx="30" cy="31" r="1.25"/><circle class="zn-petal" cx="31" cy="31.7" r="1.25"/><circle class="zn-petal" cx="30.6" cy="32.8" r="1.25"/><circle class="zn-petal" cx="29.4" cy="32.8" r="1.25"/><circle class="zn-petal" cx="29" cy="31.7" r="1.25"/><circle class="zn-dot" cx="30" cy="32" r=".75"/>
</svg>${REEDS}${PEEBLES}</span>`;
// Matas de pasto: tres briznas para romper la simetría del cantero.
const TUFT = html`<path class="zn-blade" d="M7.2 19.4c0-3.4.7-6 2-8.2M12 19.4c.1-4.3.8-7 1.7-9.2M16.8 19.4c-.3-3.4-1-5.6-2-7.4"/><path class="zn-blade" d="M9.6 19.2c-.1-2.2-.6-3.9-1.4-5.3M14.3 19.3c.5-2.2.5-4 .1-5.5"/>`;
// Farolillo de piedra del sendero: se para en el escalón con su ventana encendida.
const LANTERN = html`<span class="zn-stand zn-lantern" aria-hidden="true"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMax meet">
  <rect class="zn-stone" x="9" y="19.2" width="6" height="2.2" rx="0.8"/>
  <rect class="zn-stone" x="10.7" y="14.8" width="2.6" height="4.4"/>
  <rect class="zn-stone" x="8.4" y="11.2" width="7.2" height="3.6" rx="0.8"/>
  <rect class="zn-window" x="10.2" y="12" width="3.6" height="2"/>
  <path class="zn-stone" d="M7 11.4 12 8.4l5 3z"/>
  <circle class="zn-stone" cx="12" cy="8" r="0.9"/>
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

export function ZenScreen({ onBack, onShop }) {
  const ref = useRef(null);
  useEnter(ref);
  const [z, setZ] = useState(loadZen);
  const [, tick] = useState(0);
  const [seed, setSeed] = useState(0); // especie elegida para sembrar
  const [tool, setTool] = useState('sow');
  const [msg, setMsg] = useState(null); // aviso de la última acción
  const [armed, setArmed] = useState(false); // ampliar pide un segundo toque
  const [coins, setCoins] = useState(() => loadShop().coins);
  const [gain, setGain] = useState(null); // última flor cortada, para el aviso de monedas
  const coinRef = useRef(null);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (!gain) return; const t = setTimeout(() => setGain(null), 3200); return () => clearTimeout(t); }, [gain]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => { setMsg(null); setArmed(false); }, 5000); return () => clearTimeout(t); }, [msg]);

  const now = Date.now();
  const seedKind = ZEN_KINDS[seed];
  const apply = (next) => { if (next !== z) { saveZen(next); setZ(next); } };
  const say = (s) => { setArmed(false); setMsg(s); };
  const pickTool = (id) => { setTool(id); setArmed(false); setMsg(null); };

  const harvest = (key, kind) => {
    const next = zenHarvest(z, key, now);
    apply(next);
    setCoins(addCoins(COINS_PER_FLOWER));
    setGain(kind);
    motion(coinRef.current, { scale: [1, 1.35, 1] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
    award('flower_1');
    const flores = ZEN_KINDS.reduce((n, k) => n + (next.flores[k] || 0), 0);
    if (flores >= 3) award('flower_3');
    if (ZEN_KINDS.every((k) => (next.flores[k] || 0) > 0)) award('zen_all');
  };

  // Un toque aplica la herramienta elegida; el estatus cuenta la espera y las novedades.
  const tap = (type, key) => {
    if (type === 'raw') {
      if (tool === 'dig') { apply(zenDig(z, key)); say('Tiesto nuevo: siembra cuando quieras.'); }
      else say('Tierra virgen: elige Cavar para hacer un tiesto.');
      return;
    }
    const st = zenStage(z, key, now);
    if (tool === 'sow') {
      if (st.stage === 'empty') {
        if (!(z.seeds[seedKind] > 0)) return say(`Sin semillas de ${ZEN_NAMES[seedKind]}: caen al ganar nodos y se venden en la tienda.`);
        apply(zenSow(z, key, seedKind, now));
        say(`Sembraste ${ZEN_NAMES[seedKind]}: riega para acortar la espera.`);
      } else if (st.stage === 'bloom') say(`La ${ZEN_NAMES[st.kind]} está lista: córtala con las tijeras.`);
      else say(`${ZEN_NAMES[st.kind]}: flor en ${Math.ceil(st.msLeft / 1000)} s${st.watered ? '' : ' · puedes regarla'}.`);
    } else if (tool === 'water') {
      if (st.stage === 'empty') say('Ahí no hay nada que regar.');
      else if (st.stage === 'bloom') say(`La ${ZEN_NAMES[st.kind]} ya está lista: córtala.`);
      else if (st.watered) say('Ya la regaste: cada planta se riega una vez.');
      else {
        const next = zenWater(z, key, now);
        apply(next);
        say(`Regaste la ${ZEN_NAMES[st.kind]}: flor en ${Math.ceil(zenStage(next, key, now).msLeft / 1000)} s.`);
      }
    } else if (tool === 'dig') {
      say(st.stage === 'empty' ? 'Ese tiesto ya está cavado.' : 'Ahí ya hay una planta.');
    } else if (tool === 'cut') {
      if (st.stage === 'bloom') harvest(key, st.kind);
      else if (st.stage === 'empty') say('Ahí no hay flor que cortar.');
      else say(`${ZEN_NAMES[st.kind]}: la flor abre en ${Math.ceil(st.msLeft / 1000)} s.`);
    }
  };

  // Ampliar: el primer toque avisa el precio, el segundo paga y suma el anillo.
  const grow = () => {
    if (z.size >= ZEN_MAX) return;
    const cost = expandCost(z.size);
    if (coins < cost) return say(`Ampliar cuesta ${cost} monedas: te faltan ${cost - coins}.`);
    if (!armed) { setArmed(true); setMsg(`Ampliar a ${z.size + 1}×${z.size + 1} cuesta ${cost} monedas. Toca otra vez para confirmar.`); return; }
    if (!charge(cost)) return say('Faltan monedas.');
    setCoins(loadShop().coins);
    apply(zenExpand(z));
    award('zen_ring');
    say(`El cantero crece a ${z.size + 1}×${z.size + 1}: la tierra nueva pide cava.`);
  };

  const total = ZEN_KINDS.reduce((n, k) => n + (z.flores[k] || 0), 0);
  // El estatus cuenta lo más útil: la última acción o la flor que florecerá antes.
  const soon = Object.entries(z.pots)
    .map(([key, pot]) => (pot ? zenStage(z, key, now) : null))
    .filter((x) => x && x.msLeft != null)
    .reduce((a, x) => (a == null || x.msLeft < a.msLeft ? x : a), null);
  const status = gain
    ? `+${COINS_PER_FLOWER} monedas por la ${ZEN_NAMES[gain]}.`
    : msg
      ? msg
      : soon
        ? `Creciendo: ${ZEN_NAMES[soon.kind]} florece en ${Math.ceil(soon.msLeft / 1000)} s. En la colección: ${total}.`
        : `Semilla: ${ZEN_NAMES[seedKind]} ×${z.seeds[seedKind] || 0} · En la colección: ${total}.`;

  const potCell = (key) => {
    const st = zenStage(z, key, now);
    const cls = 'bm-cell zen-pot zn-soil' + (st.kind ? ' zn-k-' + st.kind : '') + (st.stage === 'bloom' ? ' ready' : '');
    const label = st.kind ? `${ZEN_NAMES[st.kind]}, ${ETAPAS[st.stage]}` : 'Tiesto vacío';
    return html`<button key=${key} class=${cls} aria-label=${label} onClick=${() => tap('pot', key)}>${potArt(st.kind, st.stage)}</button>`;
  };

  // El cantero se arma fila por fila: el 4×4 base arriba a la izquierda y los anillos al sur y al este.
  const cells = [];
  for (let r = 0; r < z.size; r++) {
    for (let c = 0; c < z.size; c++) {
      const key = cellKey(r, c);
      if (r < ZEN_BASE && c < ZEN_BASE) {
        const t = BASE_GRID[r][c];
        if (t === 'pond') { if (r === 1 && c === 2) cells.push(POND); continue; }
        if (t === 'lawn') { cells.push(html`<span key=${key} class="bm-cell zn-lawn" aria-hidden="true"><svg class="zn-tuft" viewBox="0 0 24 24">${TUFT}</svg></span>`); continue; }
        if (t === 'step') { cells.push(html`<span key=${key} class="bm-cell zn-step" aria-hidden="true">${key === 'r3c1' ? LANTERN : null}</span>`); continue; }
        cells.push(potCell(key));
      } else if (z.pots[key] !== undefined) cells.push(potCell(key));
      else cells.push(html`<button key=${key} class="bm-cell zn-raw" aria-label="Tierra sin cavar" onClick=${() => tap('raw', key)}></button>`);
    }
  }

  return html`<div class="screen mini" ref=${ref}>
    <${Topbar} title="Jardín Zen" sub="Un rincón tranquilo entre runs" onBack=${onBack}>
      <span class="coin-chip" ref=${coinRef} title="Monedas del jardín"><${Icon} name="coin" size=${16} /><b>${coins}</b></span>
    </${Topbar}>
    <div class="mini-body zen-body">
      <p class="mini-status" aria-live="polite">${status}</p>
      <div class="zen-main">
        <div class="mini-stage">
          <div class=${'zn-yard' + (tool === 'dig' ? ' dig' : '')}>
            <div class="bm zn-tray" style=${{ '--n': z.size }} role="group" aria-label="Cantero del jardín">
              ${cells}
            </div>
          </div>
        </div>
        <div class="zen-seeds" role="group" aria-label="Semilla para sembrar">
          <span class="zen-label">Semillas</span>
          <div class="zen-seedrow">
            ${ZEN_KINDS.map((k, ki) => {
              const n = z.seeds[k] || 0;
              return html`<button class=${'zen-chip zen-seed zn-k-' + k + (seed === ki ? ' on' : '') + (n ? '' : ' off')} aria-pressed=${seed === ki} aria-label=${`Semilla de ${ZEN_NAMES[k]}: tienes ${n}`} onClick=${() => setSeed(ki)}>${chipArt(k)}<span>${ZEN_NAMES[k]}</span><b>×${n}</b></button>`;
            })}
          </div>
        </div>
        <div class="zen-tools" role="group" aria-label="Herramientas">
          <span class="zen-label">Herramientas</span>
          <div class="zen-toolrow">
            ${TOOLS.map((t) => html`<button class=${'zen-tool' + (tool === t.id ? ' on' : '')} aria-pressed=${tool === t.id} onClick=${() => pickTool(t.id)}><${Icon} name=${t.icon} size=${22} /><span>${t.name}</span></button>`)}
          </div>
        </div>
        <button class=${'zen-expand' + (armed ? ' on' : '')} disabled=${z.size >= ZEN_MAX}
          title=${z.size >= ZEN_MAX ? 'El cantero ya llega a 8×8' : coins < expandCost(z.size) ? `Faltan ${expandCost(z.size) - coins} monedas` : ''}
          onClick=${grow}>
          <${Icon} name="expand" size=${18} />
          <span class="zen-expand-text">${z.size >= ZEN_MAX ? 'Cantero al máximo · 8×8' : armed ? `Confirmar ${z.size + 1}×${z.size + 1}` : `Ampliar a ${z.size + 1}×${z.size + 1}`}</span>
          ${z.size < ZEN_MAX && html`<b class="zen-cost"><${Icon} name="coin" size=${13} />${expandCost(z.size)}</b>`}
        </button>
        <div class="zen-desk">
          <button class="btn sm ghost" data-enter onClick=${onShop}><${Icon} name="coin" size=${16} />Tienda del jardín</button>
        </div>
        <p class="mini-help">Las semillas caen al ganar un nodo y se compran en la tienda. Elige semilla y herramienta: siembra en un tiesto, riega una vez por planta para acortar la espera, cava la tierra virgen y corta la flor cuando abra; cada corte paga ${COINS_PER_FLOWER} monedas. El cantero crece hasta 8×8.</p>
      </div>
    </div>
  </div>`;
}
