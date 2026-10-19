// Jardín Zen: un karesansui sobre la mesa. Arena rastrillada que rodea cada maceta y piedra,
// estanque con koi, musgo, pisaderas, farol y una rama de arce. Semillas reales, herramientas
// y tierra hasta 8×8.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { chipArt, POT, SOIL, plantArt, pondArt, MOSS, STEP, LANTERN, BRANCH, mapleLeaf, rakeArt } from '../zen-art.js';
import { ZEN_KINDS, ZEN_NAMES, ZEN_MAX, ZEN_BASE, BASE_GRID, cellKey, expandCost, zenStage, zenSow, zenWater, zenDig, zenHarvest, zenExpand, loadZen, saveZen } from '../../game/zen.js';
import { award } from '../../game/achievements.js';
import { COINS_PER_FLOWER, addCoins, charge, loadShop } from '../../game/shop.js';
import { playSfx } from '../sfx.js';

const ETAPAS = { empty: 'vacía', sprout: 'con brote', bud: 'con capullo', bloom: 'lista para cortar' };
// Sembrar es la herramienta por defecto; ampliar se paga en monedas y pide confirmación.
const TOOLS = [
  { id: 'sow', icon: 'seed', name: 'Sembrar' },
  { id: 'water', icon: 'drop', name: 'Regar' },
  { id: 'dig', icon: 'spade', name: 'Cavar' },
  { id: 'cut', icon: 'shears', name: 'Cortar' },
];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// "el romero", "la salvia": el artículo que pide cada especie, para los avisos.
const the = (k) => (k === 'romero' ? 'el ' : 'la ') + ZEN_NAMES[k].toLowerCase();
const cap = (s) => s[0].toUpperCase() + s.slice(1);
// Cuánto aire deja la arena alrededor de cada cosa (en casillas) y dónde está su centro.
const ROOM = { pot: 0.3, moss: 0.34, step: 0.3, lantern: 0.22 };

// Una maceta completa: el tiesto quieto y la planta encima según su etapa, meciéndose a su ritmo.
function potArt(kind, stage, d = 0) {
  return html`<svg class=${'zn-plant' + (kind ? ' zn-k-' + kind : ' zn-empty')} viewBox="0 0 24 24" aria-hidden="true">
    ${POT}
    <g class="zn-sway" style=${{ '--d': `-${d}s` }}><g transform="translate(12 15.3) scale(1.28) translate(-12 -15.3)">${kind && plantArt(kind, stage)}</g></g>
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
  const [help, setHelp] = useState(false);
  const coinRef = useRef(null);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (!gain) return; const t = setTimeout(() => setGain(null), 3200); return () => clearTimeout(t); }, [gain]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => { setMsg(null); setArmed(false); }, 5000); return () => clearTimeout(t); }, [msg]);

  const now = Date.now();
  const seedKind = ZEN_KINDS[seed];
  const apply = (next) => { if (next !== z) { saveZen(next); setZ(next); } };
  const say = (s) => { setArmed(false); setMsg(s); };
  const pickTool = (id) => { setTool(id); setArmed(false); setMsg(null); };
  const secs = (ms) => { const s = Math.ceil(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; };

  const harvest = (key, kind) => {
    const next = zenHarvest(z, key, now);
    apply(next);
    setGain(kind);
    // Las monedas saltan del tiesto en arco y vuelan al monedero; el contador sube al llegar.
    const from = document.querySelector(`[data-k="${key}"]`)?.getBoundingClientRect(), to = coinRef.current?.getBoundingClientRect();
    const land = () => { setCoins(addCoins(COINS_PER_FLOWER)); motion(coinRef.current, { scale: [1, 1.35, 1] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }); };
    if (!from || !to || reduced()) land();
    else {
      const x0 = from.left + from.width / 2, y0 = from.top + from.height * 0.3, x1 = to.left + to.width * 0.3, y1 = to.top + to.height / 2;
      for (let i = 0; i < 3; i++) {
        const c = document.createElement('i');
        c.className = 'zn-coinpop';
        c.style.left = x0 + 'px'; c.style.top = y0 + 'px';
        document.body.appendChild(c);
        const sx = (i - 1) * 26;
        motion(c, { x: [0, sx, x1 - x0], y: [0, -70 - i * 12, y1 - y0], scale: [0.4, 1.1, 0.7] }, { duration: 0.85, delay: i * 0.09, ease: 'easeInOut', onComplete: () => { c.remove(); if (i === 2) land(); } });
      }
    }
    award('flower_1');
    playSfx('flower');
    const flores = ZEN_KINDS.reduce((n, k) => n + (next.flores[k] || 0), 0);
    if (flores >= 3) award('flower_3');
    if (ZEN_KINDS.every((k) => (next.flores[k] || 0) > 0)) award('zen_all');
  };

  // Un toque aplica la herramienta elegida; el estado cuenta la espera y las novedades.
  const tap = (type, key) => {
    if (type === 'raw') {
      if (tool === 'dig') { apply(zenDig(z, key)); playSfx('tap'); say('Tiesto nuevo: siembra cuando quieras.'); }
      else say('Tierra virgen: elige Cavar para hacer un tiesto.');
      return;
    }
    const st = zenStage(z, key, now);
    if (tool === 'sow') {
      if (st.stage === 'empty') {
        if (!(z.seeds[seedKind] > 0)) return say(`Sin semillas de ${ZEN_NAMES[seedKind]}: caen al ganar nodos y se venden en la tienda.`);
        apply(zenSow(z, key, seedKind, now));
        playSfx('tap');
        say(`Sembraste ${ZEN_NAMES[seedKind]}: riega para acortar la espera.`);
      } else if (st.stage === 'bloom') say(`${cap(the(st.kind))} está en flor: córtala con las tijeras.`);
      else say(`${ZEN_NAMES[st.kind]}: flor en ${secs(st.msLeft)}${st.watered ? '' : ' · puedes regarla'}.`);
    } else if (tool === 'water') {
      if (st.stage === 'empty') say('Ahí no hay nada que regar.');
      else if (st.stage === 'bloom') say(`${cap(the(st.kind))} ya está en flor: córtala.`);
      else if (st.watered) say('Ya la regaste: cada planta se riega una vez.');
      else {
        const next = zenWater(z, key, now);
        apply(next);
        playSfx('tap');
        say(`Regaste ${the(st.kind)}: flor en ${secs(zenStage(next, key, now).msLeft)}.`);
      }
    } else if (tool === 'dig') {
      say(st.stage === 'empty' ? 'Ese tiesto ya está cavado.' : 'Ahí ya hay una planta.');
    } else if (tool === 'cut') {
      if (st.stage === 'bloom') harvest(key, st.kind);
      else if (st.stage === 'empty') say('Ahí no hay flor que cortar.');
      else say(`${ZEN_NAMES[st.kind]}: la flor abre en ${secs(st.msLeft)}.`);
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
    playSfx('coin');
    award('zen_ring');
    say(`El cantero crece a ${z.size + 1}×${z.size + 1}: la tierra nueva pide cava.`);
  };

  const total = ZEN_KINDS.reduce((n, k) => n + (z.flores[k] || 0), 0);
  // El estado cuenta lo más útil: la última acción o la flor que abrirá antes.
  const soon = Object.entries(z.pots)
    .map(([key, pot]) => (pot ? zenStage(z, key, now) : null))
    .filter((x) => x && x.msLeft != null)
    .reduce((a, x) => (a == null || x.msLeft < a.msLeft ? x : a), null);
  const status = gain
    ? `+${COINS_PER_FLOWER} monedas por ${the(gain)}.`
    : msg || (soon ? `${cap(the(soon.kind))} abre en ${secs(soon.msLeft)}.` : `Flores cortadas: ${total}.`);

  const potCell = (key) => {
    const st = zenStage(z, key, now);
    const label = st.kind ? `${ZEN_NAMES[st.kind]}, ${ETAPAS[st.stage]}${st.stage !== 'bloom' && !st.watered ? ', pide agua' : ''}` : 'Tiesto vacío';
    const need = st.stage === 'bloom' ? 'cut' : st.kind && !st.watered ? 'water' : null;
    const d = (key.charCodeAt(1) * 7 + key.charCodeAt(3) * 3) % 10 / 3;
    return html`<button key=${key} data-k=${key} class=${'bm-cell zen-pot' + (st.stage === 'bloom' ? ' ready' : '')} aria-label=${label} onClick=${() => tap('pot', key)}>
      ${potArt(st.kind, st.stage, d)}
      ${need && html`<span class=${'zn-need ' + need}><${Icon} name=${need === 'cut' ? 'shears' : 'drop'} size=${14} /></span>`}
    </button>`;
  };

  // El cantero se arma fila por fila: el 4×4 base arriba a la izquierda y los anillos al sur y al este.
  // De paso se anota qué ocupa cada casilla, para que la arena se rastrille a su alrededor.
  const cells = [], objs = [], raw = [];
  const keep = (r, c, room) => objs.push({ x: c + 0.5, y: r + 0.62, r: room });
  for (let r = 0; r < z.size; r++) {
    for (let c = 0; c < z.size; c++) {
      const key = cellKey(r, c);
      if (r < ZEN_BASE && c < ZEN_BASE) {
        const t = BASE_GRID[r][c];
        if (t === 'pond') { if (r === 1 && c === 2) { cells.push(html`<span key="pond" class="bm-cell zen-pond" aria-hidden="true">${pondArt(reduced())}</span>`); objs.push({ x: c + 1, y: r + 1.02, r: 0.78, sx: 1.06 }); } continue; }
        if (t === 'lawn') { cells.push(html`<span key=${key} class="bm-cell zn-deco" aria-hidden="true">${MOSS}</span>`); keep(r, c, ROOM.moss); continue; }
        if (t === 'step') {
          const lantern = key === 'r3c1';
          cells.push(html`<span key=${key} class=${'bm-cell zn-deco' + (lantern ? ' zn-tall' : '')} aria-hidden="true">${lantern ? LANTERN : STEP}</span>`);
          keep(r, c, lantern ? ROOM.lantern : ROOM.step);
          continue;
        }
        cells.push(potCell(key)); keep(r, c, ROOM.pot);
      } else if (z.pots[key] !== undefined) { cells.push(potCell(key)); keep(r, c, ROOM.pot); }
      else { cells.push(html`<button key=${key} class="bm-cell zn-raw" aria-label="Tierra sin cavar" onClick=${() => tap('raw', key)}></button>`); raw.push([r, c]); }
    }
  }

  return html`<div class="screen mini zen-screen" ref=${ref}>
    <${Topbar} title="Jardín Zen" sub="Un rincón tranquilo entre runs" onBack=${onBack}>
      <button class="btn ghost sm icon-only" aria-label="Cómo se cuida el jardín" title="Cómo se cuida el jardín" onClick=${() => setHelp(true)}><${Icon} name="book" size=${16} /></button>
      <span class="coin-chip" ref=${coinRef} title="Monedas del jardín"><${Icon} name="coin" size=${16} /><b>${coins}</b></span>
    </${Topbar}>
    <div class="mini-body zen-body">
      <div class="zen-main">
        <div class="zen-scene">
          <div class="mini-stage">
            <div class=${'zn-yard' + (tool === 'dig' ? ' dig' : '')}>
              <div class="bm zn-tray" style=${{ '--n': z.size }} role="group" aria-label="Cantero del jardín">
                ${rakeArt(z.size, objs, raw)}
                ${cells}
              </div>
              ${BRANCH}
              ${!reduced() && [0, 1, 2].map((i) => html`<span class=${'zn-fall zn-fall-' + i} aria-hidden="true">${mapleLeaf}</span>`)}
            </div>
          </div>
          <p class="zn-status" aria-live="polite">${status}</p>
        </div>
        <div class="zen-panel">
          <section class="zn-sec" aria-label="Semilla para sembrar">
            <h3>Semillas</h3>
            <div class="zn-packets">
              ${ZEN_KINDS.map((k, ki) => {
                const n = z.seeds[k] || 0;
                return html`<button class=${'zn-packet zn-k-' + k + (seed === ki ? ' on' : '') + (n ? '' : ' off')} aria-pressed=${seed === ki} aria-label=${`Semilla de ${ZEN_NAMES[k]}: tienes ${n}`} onClick=${() => { setSeed(ki); pickTool('sow'); }}>
                  <span class="zn-packet-art">${chipArt(k)}</span><span class="zn-packet-name">${ZEN_NAMES[k]}</span><b class="zn-packet-n">${n}</b>
                </button>`;
              })}
            </div>
          </section>
          <section class="zn-sec" aria-label="Herramientas">
            <h3>Herramientas</h3>
            <div class="zn-tools">
              ${TOOLS.map((t) => html`<button class=${'zn-tool' + (tool === t.id ? ' on' : '')} aria-pressed=${tool === t.id} onClick=${() => pickTool(t.id)}><span class="zn-tool-ic"><${Icon} name=${t.icon} size=${22} /></span><span>${t.name}</span></button>`)}
            </div>
          </section>
          <button class=${'zen-expand' + (armed ? ' on' : '')} disabled=${z.size >= ZEN_MAX}
            title=${z.size >= ZEN_MAX ? 'El cantero ya llega a 8×8' : coins < expandCost(z.size) ? `Faltan ${expandCost(z.size) - coins} monedas` : ''}
            onClick=${grow}>
            <${Icon} name="expand" size=${18} />
            <span class="zen-expand-text">${z.size >= ZEN_MAX ? 'Cantero al máximo · 8×8' : armed ? `Confirmar ${z.size + 1}×${z.size + 1}` : `Ampliar a ${z.size + 1}×${z.size + 1}`}</span>
            ${z.size < ZEN_MAX && html`<b class="zen-cost"><${Icon} name="coin" size=${13} />${expandCost(z.size)}</b>`}
          </button>
          <button class="btn sm ghost zen-shop" onClick=${onShop}><${Icon} name="coin" size=${16} />Tienda del jardín</button>
        </div>
      </div>
    </div>
    ${help && html`<div class="overlay" onClick=${(e) => e.target === e.currentTarget && setHelp(false)}>
      <div class="panel mini-sheet" role="dialog" aria-modal="true" aria-label="Cómo se cuida el jardín">
        <h2>Cómo se cuida el jardín</h2>
        <p>Las semillas caen al ganar un nodo y se compran en la tienda. Elige un sobre y toca un tiesto para sembrar. Cada planta se riega una vez y así abre antes. Cuando la flor abre, córtala con las tijeras: cada flor paga ${COINS_PER_FLOWER} monedas.</p>
        <p>Con monedas el cantero crece hasta 8×8; la tierra nueva se cava para hacer tiestos.</p>
        <button class="btn primary" autofocus onClick=${() => setHelp(false)}>Entendido</button>
      </div>
    </div>`}
  </div>`;
}
