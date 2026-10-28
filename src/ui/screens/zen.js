// Jardín Zen: un karesansui sobre la mesa. Arena rastrillada que rodea cada maceta y piedra,
// estanque con koi que vienen a comer, musgo, pisaderas, farol y una rama de arce que suelta
// hojas. Se siembra, se riega, se cava y se corta con su gesto; las hojas caídas se barren y
// las mariposas que visitan las flores dejan regalos.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { Fx } from '../../view/fx.js';
import { chipArt, POT, SOIL, plantArt, pondArt, MOSS, STEP, LANTERN, BRANCH, mapleLeaf, rakeArt, orbit, KOI_ORBITS, BUTTERFLY, CAN, SHEARS, SHOVEL, POUCH, px, stoneArt, ITEM_ART, KOI_ART } from '../zen-art.js';
import { ZEN_KINDS, ZEN_NAMES, ZEN_MAX, cellKey, cellType, lakeBox, expandCost, zenStage, zenSow, zenWater, zenWaterAround, zenDig, digWait, zenBreak, zenHarvest, zenExpand, zenLake, zenPlace, zenClear, zenStore, zenLeaves, zenSweep, LEAF_COINS, BUTTERFLY_MS, butterflyGift, loadZen, saveZen } from '../../game/zen.js';
import { SEEDS, GARDEN_ITEMS, LAKE_MAX, lakeCost } from '../../data/garden.js';
import { award } from '../../game/achievements.js';
import { addCoins, charge, loadShop } from '../../game/shop.js';
import { playSfx } from '../sfx.js';
import { flyCoins as coinsTo } from '../coins.js';
import { t, tp } from '../../i18n/index.js';

const ETAPAS = { empty: t('zen.stage.empty', 'vacía'), sprout: t('zen.stage.sprout', 'con brote'), bud: t('zen.stage.bud', 'con capullo'), bloom: t('zen.stage.bloom', 'lista para cortar') };
// Sembrar es la herramienta por defecto; ampliar se paga en monedas y pide confirmación.
const TOOLS = [
  { id: 'sow', icon: 'seed', name: t('zen.sow', 'Sembrar') },
  { id: 'water', icon: 'drop', name: t('zen.water', 'Regar') },
  { id: 'dig', icon: 'spade', name: t('zen.dig', 'Cavar') },
  { id: 'cut', icon: 'shears', name: t('zen.cut', 'Cortar') },
  { id: 'hammer', icon: 'hammer', name: t('zen.hammer', 'Mazo') },
];
// Guardar abre la bolsa: lo que se recoge del cantero y lo que se compra se pone desde ahí.
const STORE = { id: 'store', icon: 'bag', name: t('zen.store', 'Guardar') };
// Lo que se lleva en la mano: sigue al puntero sobre el jardín y hace el gesto al tocar.
const TOOL_ART = { sow: POUCH, water: CAN, dig: SHOVEL, cut: SHEARS, hammer: html`<${Icon} name="hammer" size=${40} />`, store: html`<${Icon} name="bag" size=${30} />`, lantern: ITEM_ART.lantern, pot: ITEM_ART.pot };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const later = (fn, ms = 40) => setTimeout(fn, ms); // tras el repintado de Preact
// "el romero", "la salvia": el artículo que pide cada especie, para los avisos.
const the = (k) => t('zen.the.' + k, (k === 'romero' ? 'el ' : 'la ') + ZEN_NAMES[k].toLowerCase());
const cap = (s) => s[0].toUpperCase() + s.slice(1);
// Cuánto aire deja la arena alrededor de cada cosa (en casillas) y dónde está su centro.
const ROOM = { pot: 0.3, moss: 0.34, step: 0.3, lantern: 0.22 };
// Lo que se cuenta al tocar una cosa del jardín que la herramienta en mano no trabaja.
const INFO = {
  lantern: [t('zen.lanternName', 'Farol'), t('zen.lanternInfo', 'Las ocho casillas de alrededor crecen un 50 % más rápido. Con Guardar lo llevas a la bolsa para ponerlo en otro sitio.')],
  bush: [t('zen.bushName', 'Arbusto'), t('zen.bushInfo', 'Estorba: córtalo con las tijeras y queda tierra para cavar.')],
  stone: [t('zen.stoneName', 'Losa'), t('zen.stoneInfo', 'Pártela con el mazo y queda tierra para cavar.')],
  rock: [t('zen.rockName', 'Piedra'), t('zen.rockInfo', 'Pártela a golpes de mazo; queda tierra para cavar o para una maceta.')],
};
const SOIL_COLORS = ['#4a3220', '#6b4a30', '#8a6a48'];
const OUT = [0.16, 1, 0.3, 1];

// Una maceta completa: el tiesto quieto y la planta encima según su etapa, meciéndose a su ritmo.
// `.zn-grow` es el asa de las animaciones (brotar, estirón, cortar) sin pisar el balanceo.
function potArt(kind, stage, d = 0) {
  const sprite = kind && ['sprout', 'bud', 'bloom'].includes(stage);
  return html`<svg class=${'zn-plant' + (kind ? ' zn-k-' + kind : ' zn-empty')} viewBox="0 0 24 24" aria-hidden="true">
    <g class="zn-vec">${POT}</g>${px('pot', 24, 24)}
    <g class="zn-sway" style=${{ '--d': `-${d}s` }}><g class="zn-grow"><g class="zn-vec" transform="translate(12 15.3) scale(1.28) translate(-12 -15.3)">${kind && plantArt(kind, stage)}</g>${sprite && px(`${kind}-${stage}`, 24, 24)}</g></g>
    <g class="zn-vec">${SOIL}</g>
  </svg>`;
}

export function ZenScreen({ onBack, onShop }) {
  const ref = useRef(null);
  useEnter(ref);
  const [z, setZ] = useState(() => { const n = zenLeaves(loadZen(), Date.now()); saveZen(n); return n; });
  const [, tick] = useState(0);
  const [seed, setSeed] = useState(0); // especie elegida para sembrar
  const [tool, setTool] = useState('sow');
  const [msg, setMsg] = useState(null); // aviso de la última acción
  const [armed, setArmed] = useState(false); // ampliar pide un segundo toque
  const [coins, setCoins] = useState(() => loadShop().coins);
  const [gain, setGain] = useState(null); // último regalo, para el aviso
  const [help, setHelp] = useState(false);
  const [pour, setPour] = useState(null); // regadera en el aire: { x, y, id }
  const [act, setAct] = useState(null); // tijeras o pala haciendo su gesto: { tool, x, y, id }
  const handRef = useRef(null);
  const [fly, setFly] = useState(null); // mariposa: { key, id }
  const coinRef = useRef(null), yardRef = useRef(null), fxRef = useRef(null), flyRef = useRef(null);
  const prevStage = useRef(null), leafCount = useRef(z.leaves.length), feedRef = useRef(null);

  // Reloj del jardín: crecen las plantas y caen hojas de la rama.
  useEffect(() => {
    const id = setInterval(() => {
      tick((n) => n + 1);
      setZ((cur) => { const n = zenLeaves(cur, Date.now()); if (n !== cur) saveZen(n); return n; });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (!gain) return; const t = setTimeout(() => setGain(null), 3200); return () => clearTimeout(t); }, [gain]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => { setMsg(null); setArmed(false); }, 5000); return () => clearTimeout(t); }, [msg]);
  useEffect(() => { fxRef.current = new Fx(yardRef.current); return () => fxRef.current.destroy(); }, []);

  const now = Date.now();
  const seedKind = ZEN_KINDS[seed];
  const apply = (next) => { if (next !== z) { saveZen(next); setZ(next); } };
  const say = (s) => { setArmed(false); setMsg(s); };
  // Ficha sobre la cosa tocada, como las de las casillas del tablero.
  const [tip, setTip] = useState(null);
  const info = (key, type) => {
    const cell = cellOf(key), [title, text] = INFO[type];
    if (!cell) return say(text);
    const id = Date.now();
    setTip({ ...spot(cell, 0.5, 0.15), title, text, id });
    setTimeout(() => setTip((x) => (x?.id === id ? null : x)), 3200);
  };
  const pickTool = (id) => { setTool(id); setArmed(false); setMsg(null); };
  const secs = (ms) => { const s = Math.ceil(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; };

  // Posiciones en la capa de efectos (la del patio) y piezas de cada maceta.
  const cellOf = (key) => yardRef.current?.querySelector(`[data-k="${key}"]`);
  const at = (el, bias = 0.5) => fxRef.current.pointOf(el, bias);
  // Anima la planta de un tiesto. Motion recuerda el último fotograma (tras cortar: subida, giro y
  // escala 0), así que se vuelve a cero antes de cada animación o la siguiente planta nacería desplazada.
  const growFx = (key, frames, opts) => {
    const g = cellOf(key)?.querySelector('.zn-grow');
    if (!g) return opts?.onComplete?.();
    motion(g, { y: 0, rotate: 0, scale: 1, scaleY: 1 }, { duration: 0 });
    motion(g, frames, opts);
  };
  // Punto de una casilla en coordenadas del jardín (para las herramientas, que viven en él).
  const spot = (cell, fx = 0.5, fy = 0.5) => {
    const c = cell.getBoundingClientRect(), y = yardRef.current.getBoundingClientRect();
    return { x: c.left - y.left + c.width * fx, y: c.top - y.top + c.height * fy };
  };
  const gesture = (tool, cell, fy, ms) => {
    const id = Date.now();
    setAct({ tool, ...spot(cell, 0.5, fy), id });
    setTimeout(() => setAct((a) => (a?.id === id ? null : a)), ms);
  };
  // La mano: con ratón, la herramienta acompaña al puntero (sin repintar: se mueve el elemento).
  const hover = (e) => {
    const el = handRef.current;
    if (!el || e.pointerType !== 'mouse') return;
    const y = yardRef.current.getBoundingClientRect();
    el.style.translate = `${e.clientX - y.left}px ${e.clientY - y.top}px`;
    el.classList.add('on');
  };
  const unhover = () => handRef.current?.classList.remove('on');

  const flyCoins = (from, n, amount) => coinsTo(from, coinRef.current, n, () => setCoins(addCoins(amount)));

  // Gestos de cada acción.
  const fxSow = (key) => later(() => {
    const cell = cellOf(key);
    playSfx('pop');
    if (!cell || reduced()) return;
    const p = at(cell, 0.66);
    fxRef.current.burst(p.x, p.y, { count: 10, color: SOIL_COLORS, speed: [40, 140], life: [0.3, 0.6], size: [2, 4], gravity: 500, shape: 'chunk', spread: Math.PI, angle: -Math.PI / 2 });
    growFx(key, { scale: [0, 1.25, 1] }, { duration: 0.6, ease: OUT });
  });
  const fxWater = (key) => {
    const cell = cellOf(key), yard = yardRef.current;
    if (!cell || reduced()) return;
    const c = cell.getBoundingClientRect(), y = yard.getBoundingClientRect();
    // El pico (a 39 px del borde de la regadera) queda sobre el centro de la maceta: el chorro cae en la planta.
    setPour({ x: c.left - y.left + c.width * 0.5 - 39, y: c.top - y.top - c.height * 0.38, id: Date.now() });
    setTimeout(() => {
      playSfx('water');
      growFx(key, { rotate: [0, -6, 4, 0], scaleY: [1, 0.94, 1.05, 1] }, { duration: 0.9, ease: 'easeInOut' }); // la planta agradece el agua
      const p = at(cell, 0.42);
      for (let i = 0; i < 3; i++) setTimeout(() => fxRef.current.burst(p.x + 6, p.y - 8, { count: 8, color: ['#9fd3ff', '#5aa9e6', '#e6f6ff'], speed: [30, 90], life: [0.35, 0.6], size: [1.5, 3], gravity: 900, spread: 0.7, angle: Math.PI / 2 + 0.3 }), i * 140);
    }, 420);
    setTimeout(() => setPour(null), 1500);
  };
  // La pala se clava, palanquea y saca la tierra; el tiesto sale cuando vuela la tierra.
  const fxDig = (key) => later(() => {
    const cell = cellOf(key);
    if (!cell) return;
    if (reduced()) return playSfx('dig');
    gesture('dig', cell, 0.62, 900);
    setTimeout(() => { playSfx('dig'); dirt(cell); }, 330);
  });
  // Cada estorbo con su herramienta: las tijeras podan el arbusto (hojas), el mazo parte la piedra
  // (lascas grises); guardar levanta la cosa del cantero hacia la bolsa.
  const fxClear = (key, tool, done) => later(() => {
    const cell = cellOf(key);
    if (!cell || reduced()) { playSfx(tool === 'cut' ? 'snip' : 'dig'); return done?.(); }
    gesture(tool, cell, tool === 'cut' ? 0.35 : 0.45, 900);
    setTimeout(() => {
      playSfx(tool === 'cut' ? 'snip' : 'dig');
      const p = at(cell, 0.6);
      fxRef.current.burst(p.x, p.y, tool === 'cut'
        ? { count: 16, color: ['#5a9b45', '#7fbf5a', '#3f7a35'], speed: [60, 200], life: [0.6, 1.1], size: [2, 4], gravity: 220, drag: 0.9, shape: 'chunk' }
        : { count: 18, color: ['#9a958c', '#c9c4ba', '#6e6a63'], speed: [90, 280], life: [0.4, 0.8], size: [2.5, 5], gravity: 700, shape: 'chunk', spread: Math.PI * 0.9, angle: -Math.PI / 2 });
      fxRef.current.dust(p.x, p.y, 0.8);
      done?.();
    }, tool === 'cut' ? 560 : 380);
  });
  const fxLift = (key, done) => {
    const art = cellOf(key)?.querySelector('svg');
    playSfx('pop');
    if (!art || reduced()) return done();
    motion(art, { y: [0, -18], scale: [1, 0.4], opacity: [1, 0] }, { duration: 0.35, ease: OUT, onComplete: done });
  };
  const dirt = (cell) => {
    const p = at(cell, 0.7);
    fxRef.current.burst(p.x, p.y, { count: 16, color: SOIL_COLORS, speed: [80, 260], life: [0.4, 0.8], size: [2.5, 5], gravity: 700, shape: 'chunk', spread: Math.PI * 0.9, angle: -Math.PI / 2 });
    fxRef.current.dust(p.x, p.y, 0.9);
    const art = cell.querySelector('.zn-plant, .zn-stone');
    if (art) motion(art, { scale: [0.4, 1.12, 1], y: [8, -4, 0] }, { duration: 0.5, ease: OUT });
  };
  const fxBloom = (key) => {
    const cell = cellOf(key);
    if (!cell || reduced()) return;
    const p = at(cell, 0.25), fl = getComputedStyle(cell.querySelector('.zn-plant')).getPropertyValue('--fl').trim() || '#ffcf6b';
    fxRef.current.sparkle(p.x, p.y, fl, 8);
    growFx(key, { scale: [1, 1.18, 0.96, 1] }, { duration: 0.6, ease: OUT });
  };

  // Al cortar, la planta se recoge, vuelan pétalos de su color y las monedas van al monedero.
  const harvest = (key, kind) => {
    const cell = cellOf(key);
    const done = () => {
      const next = zenHarvest(z, key, Date.now()), pays = SEEDS[kind].pays;
      apply(next);
      setGain(t('zen.paid', '+{n} monedas por {kind}', { n: pays, kind: the(kind) }) + (next.gift ? t('zen.dropsSeed', ' y suelta una semilla') : '') + (next.pots[key] ? t('zen.regrows', '. Rebrota: riégala otra vez') : '') + '.');
      flyCoins(cell?.getBoundingClientRect(), 3, pays);
      award('flower_1');
      playSfx('flower');
      const flores = ZEN_KINDS.reduce((n, k) => n + (next.flores[k] || 0), 0);
      if (flores >= 3) award('flower_3');
      if (flores >= 25) award('flowers_25');
      if (ZEN_KINDS.every((k) => (next.flores[k] || 0) > 0)) award('zen_all');
    };
    if (!cell || reduced()) { playSfx('snip'); return done(); }
    // Las tijeras bajan al tallo, abren y cierran dos veces (cada cierre suena) y la flor salta.
    busyCut.current = true;
    gesture('cut', cell, 0.3, 900);
    setTimeout(() => playSfx('snip'), 330); // los dos cierres de las hojas (zn-snip, 37 % y 49 %)
    setTimeout(() => {
      busyCut.current = false;
      const p = at(cell, 0.25), fl = getComputedStyle(cell.querySelector('.zn-plant')).getPropertyValue('--fl').trim() || '#ffcf6b';
      fxRef.current.burst(p.x, p.y, { count: 18, color: [fl, fl, '#fff'], speed: [60, 220], life: [0.6, 1.1], size: [2, 4], gravity: 160, drag: 0.9, shape: 'chunk' });
      growFx(key, { scale: [1, 1.15, 0], y: [0, -4, -10], rotate: [0, 0, 40] }, { duration: 0.35, ease: [0.7, 0, 0.84, 0], onComplete: done });
    }, 560);
  };
  const busyCut = useRef(false);

  // Un toque aplica la herramienta elegida; el estado cuenta la espera y las novedades.
  const tap = (type, key) => {
    setTip(null);
    if (tool === 'store') {
      const next = zenStore(z, key);
      if (next === z) return say(t('zen.storeWhat', 'Con Guardar se llevan a la bolsa los tiestos vacíos y los faroles.'));
      fxLift(key, () => apply(next));
      return say(type === 'lantern' ? t('zen.lanternStored', 'Farol a la bolsa: elígelo abajo y ponlo donde quieras.') : t('zen.potStored', 'Maceta a la bolsa: elígela abajo y ponla donde quieras.'));
    }
    if (GARDEN_ITEMS[tool]) {
      const next = zenPlace(z, tool, key);
      if (next === z) return say(tool === 'lantern' ? t('zen.lanternWhere', 'El farol va en tierra virgen o en un tiesto vacío.') : t('zen.potWhere', 'La maceta va sobre tierra virgen o una piedra.'));
      apply(next); playSfx('dig');
      if (!next.items[tool]) setTool('sow');
      return say(tool === 'lantern' ? t('zen.lanternSet', 'Farol puesto: lo que crece a su lado abre antes.') : t('zen.potSet', 'Maceta puesta: ya se puede sembrar.'));
    }
    if (type === 'lantern') return info(key, 'lantern');
    if (type === 'bush' || type === 'stone') {
      if (tool !== (type === 'bush' ? 'cut' : 'hammer')) return info(key, type);
      fxClear(key, tool, () => apply(zenClear(z, key)));
      return say(type === 'bush' ? t('zen.bushCut', 'Arbusto cortado: queda tierra para cavar.') : t('zen.stoneBroken', 'Losa partida: queda tierra para cavar.'));
    }
    if (type === 'rock') {
      if (tool !== 'hammer') return info(key, 'rock');
      const { z: next, broke } = zenBreak(z, key);
      fxClear(key, 'hammer', () => apply(next));
      return say(broke ? t('zen.rockBreaks', 'La piedra se parte: queda tierra virgen.') : t('zen.rockCracks', 'La piedra se agrieta: otro golpe.'));
    }
    if (type === 'raw') {
      if (tool !== 'dig') return say(t('zen.raw', 'Tierra virgen: elige Cavar para hacer un tiesto.'));
      const wait = digWait(z, now);
      if (wait) return say(t('zen.shovelRest', 'La pala descansa: {time}. La de acero de la tienda no espera.', { time: secs(wait) }));
      apply(zenDig(z, key, now)); fxDig(key); say('Tiesto nuevo: siembra cuando quieras.');
      return;
    }
    const st = zenStage(z, key, now);
    if (tool === 'sow') {
      if (st.stage === 'empty') {
        if (!(z.seeds[seedKind] > 0)) return say(t('zen.noSeeds', 'Sin semillas de {kind}: caen al ganar nodos y se venden en la tienda.', { kind: ZEN_NAMES[seedKind] }));
        apply(zenSow(z, key, seedKind, now));
        fxSow(key);
        say(t('zen.sown', 'Sembraste {kind}: riega para acortar la espera.', { kind: the(seedKind) }));
      } else if (st.stage === 'bloom') say(t('zen.inBloom', '{kind} está en flor: córtala con las tijeras.', { kind: cap(the(st.kind)) }));
      else say(t('zen.flowerIn', '{kind}: flor en {time}', { kind: cap(the(st.kind)), time: secs(st.msLeft) }) + (st.watered ? '' : t('zen.canWater', ' · puedes regarla')) + '.');
    } else if (tool === 'water') {
      if (st.stage === 'empty') say(t('zen.nothingToWater', 'Ahí no hay nada que regar.'));
      else if (st.stage === 'bloom') say(t('zen.alreadyBloom', '{kind} ya está en flor: córtala.', { kind: cap(the(st.kind)) }));
      else if (st.watered) say(t('zen.alreadyWatered', 'Ya la regaste: cada planta se riega una vez.'));
      else {
        const next = z.items.can ? zenWaterAround(z, key, now) : zenWater(z, key, now);
        apply(next);
        fxWater(key);
        say(t('zen.watered', 'Regaste {kind}: flor en {time}.', { kind: the(st.kind), time: secs(zenStage(next, key, now).msLeft) }));
      }
    } else if (tool === 'dig') {
      say(st.stage === 'empty' ? t('zen.alreadyDug', 'Ese tiesto ya está cavado.') : t('zen.alreadyPlant', 'Ahí ya hay una planta.'));
    } else if (tool === 'cut') {
      if (busyCut.current) return;
      if (st.stage === 'bloom') harvest(key, st.kind);
      else if (st.stage === 'empty') say(t('zen.nothingToCut', 'Ahí no hay flor que cortar.'));
      else say(t('zen.opensIn', '{kind}: la flor abre en {time}.', { kind: cap(the(st.kind)), time: secs(st.msLeft) }));
    }
  };

  // Hojas caídas: un toque las sopla fuera del cantero y cada una paga una moneda.
  const sweep = (leaf, el) => {
    if (!el || el.dataset.gone) return;
    el.dataset.gone = '1';
    const from = el.getBoundingClientRect();
    const done = () => {
      setZ((cur) => { const n = zenSweep(cur, leaf); saveZen(n); return n; });
      flyCoins(from, 1, LEAF_COINS);
    };
    playSfx('leaf');
    if (reduced()) return done();
    const dir = leaf.x < z.size / 2 ? -1 : 1;
    motion(el, { x: [0, dir * 70], y: [0, -50, -90], rotate: [0, dir * 260], opacity: [1, 1, 0] }, { duration: 0.7, ease: 'easeOut', onComplete: done });
  };

  // Las que caen mientras miras bajan desde la rama, meciéndose, hasta su sitio en la arena.
  useEffect(() => {
    const n = z.leaves.length, before = leafCount.current;
    leafCount.current = n;
    if (n <= before || reduced()) return;
    const els = yardRef.current?.querySelectorAll('.zn-fallen');
    for (let i = before; i < n; i++) {
      const el = els?.[i];
      if (el) motion(el, { y: [-260, -150, -60, 0], x: [-30, 24, -14, 0], opacity: [0, 1, 1, 1] }, { duration: 3.2, ease: 'easeInOut' });
    }
  }, [z.leaves.length]);

  // Cada vez que una planta pasa de etapa da un estirón; la flor abre con un destello.
  useEffect(() => {
    const cur = Object.fromEntries(Object.keys(z.pots).map((k) => [k, zenStage(z, k, Date.now()).stage]));
    const prev = prevStage.current;
    prevStage.current = cur;
    if (!prev) return;
    for (const [k, s] of Object.entries(cur)) if (prev[k] && prev[k] !== s && (s === 'bud' || s === 'bloom')) fxBloom(k);
  });

  // Mariposas: de vez en cuando una visita una flor abierta; tocarla deja un regalo.
  const blooms = Object.keys(z.pots).filter((k) => zenStage(z, k, now).stage === 'bloom');
  useEffect(() => {
    let t;
    const plan = () => {
      const [a, b] = BUTTERFLY_MS;
      t = setTimeout(() => {
        setFly((cur) => {
          if (cur) return cur;
          const open = Object.keys(loadZen().pots).filter((k) => zenStage(loadZen(), k, Date.now()).stage === 'bloom');
          return open.length ? { key: open[Math.floor(Math.random() * open.length)], id: Date.now() } : null;
        });
        plan();
      }, a + Math.random() * (b - a));
    };
    plan();
    return () => clearTimeout(t);
  }, []);
  const flyAway = (after) => {
    const el = flyRef.current;
    if (!el || reduced()) { setFly(null); return after?.(); }
    el.classList.remove('rest');
    motion(el, { x: [0, -60, 40, 160], y: [0, -60, -140, -260], opacity: [1, 1, 1, 0] }, { duration: 1.4, ease: 'easeIn', onComplete: () => { setFly(null); after?.(); } });
  };
  useEffect(() => {
    if (!fly) return;
    const el = flyRef.current, cell = cellOf(fly.key), yard = yardRef.current;
    if (!el || !cell) return setFly(null);
    const c = cell.getBoundingClientRect(), y = yard.getBoundingClientRect();
    // Se posa a un costado de la flor, así no tapa la maceta al cortar.
    el.style.left = c.left - y.left + c.width * 0.14 + 'px';
    el.style.top = c.top - y.top + c.height * 0.12 + 'px';
    if (!reduced()) motion(el, { x: [260, 120, 40, 0], y: [-220, -80, -40, 0], opacity: [0, 1, 1, 1] }, { duration: 2.4, ease: 'easeOut', onComplete: () => el.classList.add('rest') });
    else el.classList.add('rest');
    const leave = setTimeout(() => flyAway(), 26000);
    return () => clearTimeout(leave);
  }, [fly?.id]);
  // Si la flor se corta, la mariposa se va.
  useEffect(() => { if (fly && !blooms.includes(fly.key)) flyAway(); }, [blooms.join()]);
  const catchFly = () => {
    if (!fly) return;
    const gift = butterflyGift(), from = flyRef.current?.getBoundingClientRect();
    if (gift.coins) { flyCoins(from, 2, gift.coins); setGain(tp('zen.flyCoins', gift.coins, 'La mariposa deja {n} moneda.', 'La mariposa deja {n} monedas.')); }
    else { apply({ ...z, seeds: { ...z.seeds, [gift.seed]: (z.seeds[gift.seed] || 0) + 1 } }); setGain(t('zen.flySeed', 'La mariposa deja una semilla de {kind}.', { kind: ZEN_NAMES[gift.seed].toLowerCase() })); playSfx('flower'); }
    if (from && !reduced()) fxRef.current.sparkle(from.left - yardRef.current.getBoundingClientRect().left + from.width / 2, from.top - yardRef.current.getBoundingClientRect().top + from.height / 2, '#ffe2a8', 10);
    award('butterfly');
    flyAway();
  };

  // Koi: nadan su órbita y, si tocas el agua, cae alimento y van a comérselo.
  useEffect(() => {
    if (reduced()) return;
    const svg = yardRef.current?.querySelector('.zn-pondart');
    if (!svg) return;
    const fish = [...svg.querySelectorAll('.zn-koi')].map((g, i) => {
      const o = KOI_ORBITS[i], path = orbit(o.r, o.cx, o.cy), t = Math.random() * Math.PI * 2, [x, y] = path(t);
      return { g, o, path, t, x, y, h: 0 };
    });
    let raf, last = performance.now();
    const step = (time) => {
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      const food = feedRef.current;
      fish.forEach((f, i) => {
        f.t += (f.o.dir * f.o.speed * dt) / f.o.r;
        let [tx, ty] = f.path(f.t + f.o.dir * 0.5);
        let speed = f.o.speed;
        const bit = food?.pellets.find((p) => !p.eaten);
        if (bit) {
          tx = bit.x + (i ? 1 : -1) * 0.6; ty = bit.y; speed = 7;
          if (Math.hypot(bit.x - f.x, bit.y - f.y) < 1.2) { bit.eaten = true; bit.el.remove(); }
        }
        const want = Math.atan2(ty - f.y, tx - f.x);
        let d = want - f.h;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        f.h += d * Math.min(1, dt * 4);
        f.x += Math.cos(f.h) * speed * dt;
        f.y += Math.sin(f.h) * speed * dt;
        f.g.setAttribute('transform', `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)}) rotate(${((f.h * 180) / Math.PI).toFixed(1)})`);
      });
      if (food && food.pellets.every((p) => p.eaten)) feedRef.current = null;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  const feed = (e) => {
    const svg = e.currentTarget.querySelector('.zn-pondart'), r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 48, y = ((e.clientY - r.top) / r.height) * 48;
    if (Math.hypot(x - 24, (y - 24.5) / 0.9) > 15) return; // fuera del agua
    const yard = yardRef.current.getBoundingClientRect();
    if (!reduced()) {
      fxRef.current.ring(e.clientX - yard.left, e.clientY - yard.top, { color: '#e6f6ff', radius: r.width * 0.12, width: 2, life: 0.6 });
      setTimeout(() => fxRef.current.ring(e.clientX - yard.left, e.clientY - yard.top, { color: '#e6f6ff', radius: r.width * 0.2, width: 1.5, life: 0.8 }), 180);
    }
    const g = svg.querySelector('.zn-food'), pellets = [];
    for (let i = 0; i < 4; i++) {
      const p = { x: x + (Math.random() - 0.5) * 3, y: y + (Math.random() - 0.5) * 3 };
      p.el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      p.el.setAttribute('cx', p.x.toFixed(2)); p.el.setAttribute('cy', p.y.toFixed(2)); p.el.setAttribute('r', '.45');
      p.el.setAttribute('class', 'zn-pellet');
      g.appendChild(p.el);
      pellets.push(p);
    }
    feedRef.current = { pellets: [...(feedRef.current?.pellets.filter((p) => !p.eaten) || []), ...pellets] };
    playSfx('splash');
    say(t('zen.koiFeed', 'Los koi vienen a comer.'));
    award('koi');
  };

  // Ampliar: el primer toque avisa el precio, el segundo paga y suma el anillo.
  const grow = () => {
    if (z.size >= ZEN_MAX) return;
    const cost = expandCost(z.size);
    if (coins < cost) return say(t('zen.expandShort', 'Ampliar cuesta {cost} monedas: te faltan {n}.', { cost, n: cost - coins }));
    if (!armed) { setArmed(true); setMsg(t('zen.expandConfirm', 'Ampliar a {size} cuesta {cost} monedas. Toca otra vez para confirmar.', { size: `${z.size + 1}×${z.size + 1}`, cost })); return; }
    if (!charge(cost)) return say(t('zen.noCoins', 'Faltan monedas.'));
    setCoins(loadShop().coins);
    apply(zenExpand(z));
    playSfx('coin');
    award('zen_ring');
    if (z.size + 1 >= ZEN_MAX) award('zen_max');
    say(t('zen.expanded', 'El cantero crece a {size}: la tierra nueva pide cava.', { size: `${z.size + 1}×${z.size + 1}` }));
  };

  const total = ZEN_KINDS.reduce((n, k) => n + (z.flores[k] || 0), 0);
  // El estado cuenta lo más útil: el último regalo, la última acción o la flor que abrirá antes.
  const soon = Object.entries(z.pots)
    .map(([key, pot]) => (pot ? zenStage(z, key, now) : null))
    .filter((x) => x && x.msLeft != null)
    .reduce((a, x) => (a == null || x.msLeft < a.msLeft ? x : a), null);
  const status = gain || msg
    || (z.leaves.length ? tp('zen.leaves', z.leaves.length, 'Hay {n} hoja en la arena: tócala para barrerla.', 'Hay {n} hojas en la arena: tócalas para barrerlas.') : null)
    || (soon ? t('zen.soon', '{kind} abre en {time}.', { kind: cap(the(soon.kind)), time: secs(soon.msLeft) }) : t('zen.cutTotal', 'Flores cortadas: {n}.', { n: total }));

  const potCell = (key) => {
    const st = zenStage(z, key, now);
    const label = st.kind ? `${ZEN_NAMES[st.kind]}, ${ETAPAS[st.stage]}${st.stage !== 'bloom' && !st.watered ? t('zen.needsWater', ', pide agua') : ''}` : t('zen.emptyPot', 'Tiesto vacío');
    const need = st.stage === 'bloom' ? 'cut' : st.kind && !st.watered ? 'water' : null;
    const d = (key.charCodeAt(1) * 7 + key.charCodeAt(3) * 3) % 10 / 3;
    const wet = st.watered && st.stage !== 'bloom';
    return html`<button key=${key} data-k=${key} class=${'bm-cell zen-pot' + (st.stage === 'bloom' ? ' ready' : '') + (wet ? ' wet' : '')} aria-label=${label} onClick=${() => tap('pot', key)}>
      ${potArt(st.kind, st.stage, d)}
      ${need && html`<span class=${'zn-need ' + need}><${Icon} name=${need === 'cut' ? 'shears' : 'drop'} size=${14} /></span>`}
    </button>`;
  };

  // El cantero se arma fila por fila en coordenadas absolutas: el 4×4 base de r0c0 a r3c3 y los
  // anillos alrededor (`off` filas y columnas arriba a la izquierda). De paso se anota qué ocupa cada
  // casilla, para que la arena se rastrille a su alrededor.
  const off = z.off || 0, [la, lb] = lakeBox(z.lake || 2), lakeN = lb - la;
  const cells = [], objs = [], raw = [], glows = [];
  const keep = (r, c, room) => objs.push({ x: c + off + 0.5, y: r + off + 0.62, r: room });
  for (let r = -off; r < z.size - off; r++) {
    for (let c = -off; c < z.size - off; c++) {
      const key = cellKey(r, c), ct = cellType(z, key);
      if (ct === 'pond') {
        if (r === la && c === la) {
          cells.push(html`<button key="pond" class="bm-cell zen-pond" style=${{ gridRow: `span ${lakeN}`, gridColumn: `span ${lakeN}` }} aria-label=${t('zen.pondAria', 'Estanque: toca el agua para dar de comer a los koi')} onClick=${feed}>${pondArt(reduced())}</button>`);
          objs.push({ x: la + off + lakeN / 2, y: la + off + lakeN / 2 + 0.02, r: 0.39 * lakeN, sx: 1.06 });
        }
        continue;
      }
      if (ct === 'bush' || ct === 'stone') {
        cells.push(html`<button key=${key} data-k=${key} class="bm-cell zn-deco" aria-label=${INFO[ct][0]} onClick=${() => tap(ct, key)}>${ct === 'bush' ? MOSS : STEP}</button>`);
        keep(r, c, ct === 'bush' ? ROOM.moss : ROOM.step);
        continue;
      }
      if (ct === 'lantern') {
        cells.push(html`<button key=${key} data-k=${key} class="bm-cell zn-deco zn-tall zn-lit" aria-label=${t('zen.lanternLit', 'Farol encendido')} onClick=${() => tap('lantern', key)}>${LANTERN}</button>`);
        keep(r, c, ROOM.lantern);
        // Su luz cubre justo lo que acelera: la casilla y sus ocho vecinas, sin salirse del cantero.
        const [x0, x1, y0, y1] = [Math.max(0, c + off - 1), Math.min(z.size, c + off + 2), Math.max(0, r + off - 1), Math.min(z.size, r + off + 2)];
        const w = x1 - x0, h = y1 - y0, pct = (v) => (v / z.size) * 100 + '%';
        glows.push(html`<i key=${'glow-' + key} class="zn-glow" style=${{ left: pct(x0), top: pct(y0), width: pct(w), height: pct(h),
          '--gx': ((c + off + 0.5 - x0) / w) * 100 + '%', '--gy': ((r + off + 0.5 - y0) / h) * 100 + '%', '--grx': (1.6 / w) * 100 + '%', '--gry': (1.6 / h) * 100 + '%' }}></i>`);
        continue;
      }
      if (ct === 'pot') { cells.push(potCell(key)); keep(r, c, ROOM.pot); continue; }
      if (ct === 'rock') {
        const hp = z.rocks[key];
        cells.push(html`<button key=${key} data-k=${key} class="bm-cell zn-rockcell" aria-label=${t('zen.rockAria', 'Piedra: pártela con el mazo')} onClick=${() => tap('rock', key)}>${stoneArt(Math.max(0, 3 - hp))}</button>`);
        keep(r, c, ROOM.step);
        continue;
      }
      cells.push(html`<button key=${key} data-k=${key} class="bm-cell zn-raw" aria-label=${t('zen.rawAria', 'Tierra sin cavar')} onClick=${() => tap('raw', key)}></button>`); raw.push([r + off, c + off]);
    }
  }

  // Ampliar el estanque: igual que el cantero, un toque avisa y otro paga.
  const [lakeArmed, setLakeArmed] = useState(false);
  const growLake = () => {
    const n = z.lake || 2, cost = lakeCost(n);
    if (n >= LAKE_MAX) return;
    if (coins < cost) return say(t('zen.pondShort', 'Ampliar el estanque cuesta {cost} monedas: te faltan {n}.', { cost, n: cost - coins }));
    if (!lakeArmed) { setLakeArmed(true); setMsg(t('zen.pondConfirm', 'El estanque pasa a {size} por {cost} monedas; lo que haya debajo vuelve a la bolsa. Toca otra vez.', { size: `${n + 1}×${n + 1}`, cost })); return; }
    setLakeArmed(false);
    if (!charge(cost)) return say(t('zen.noCoins', 'Faltan monedas.'));
    setCoins(loadShop().coins);
    apply(zenLake(z));
    playSfx('splash');
    if (n + 1 >= LAKE_MAX) award('pond_max');
    say(t('zen.pondGrown', 'El estanque crece a {size}.', { size: `${n + 1}×${n + 1}` }));
  };
  const owned = Object.entries(GARDEN_ITEMS).filter(([id, it]) => it.stack && z.items[id] > 0);

  return html`<div class="screen mini zen-screen" ref=${ref}>
    <${Topbar} title=${t('menu.zen', 'Jardín Zen')} sub=${t('zen.sub', 'Un rincón tranquilo entre runs')} onBack=${onBack}>
      <button class="btn ghost sm icon-only" data-pad="select" aria-label=${t('zen.help', 'Cómo se cuida el jardín')} title=${t('zen.help', 'Cómo se cuida el jardín')} onClick=${() => setHelp(true)}><${Icon} name="book" size=${16} /></button>
      <button class="coin-chip" data-pad="y" ref=${coinRef} title=${t('zen.shop', 'Tienda del jardín')} aria-label=${t('zen.coinsShop', '{n} monedas: abrir la tienda', { n: coins })} onClick=${onShop}><${Icon} name="coin" size=${16} /><b>${coins}</b></button>
    </${Topbar}>
    <div class="mini-body zen-body">
      <div class="zen-main">
        <div class="zen-scene">
          <div class="mini-stage">
            <div class=${'zn-yard' + (tool === 'dig' ? ' dig' : '') + (act || pour ? ' acting' : '')} ref=${yardRef} onPointerMove=${hover} onPointerLeave=${unhover}>
              <div class="bm zn-tray" style=${{ '--n': z.size }} role="group" aria-label=${t('zen.bed', 'Cantero del jardín')}>
                ${rakeArt(z.size, objs, raw)}
                ${glows}
                ${cells}
                ${z.leaves.map((l) => html`<button key=${`leaf-${l.x}-${l.y}`} class="zn-fallen" data-pad="x" style=${{ left: (l.x / z.size) * 100 + '%', top: (l.y / z.size) * 100 + '%', '--r': l.r + 'deg' }}
                  aria-label=${t('zen.leafAria', 'Hoja caída: tócala para barrerla')} onClick=${(e) => sweep(l, e.currentTarget)}>${mapleLeaf}</button>`)}
              </div>
              ${BRANCH}
              ${pour && html`<span key=${pour.id} class="zn-canfx" style=${{ left: pour.x + 'px', top: pour.y + 'px' }} aria-hidden="true">${CAN}<i class="zn-stream"></i></span>`}
              ${tip && html`<span key=${tip.id} class="tile-tip" style=${{ left: tip.x + 'px', top: tip.y + 'px' }}><b>${tip.title}</b>${tip.text}</span>`}
              ${act && html`<span key=${act.id} class=${'zn-toolfx t-' + act.tool} style=${{ left: act.x + 'px', top: act.y + 'px' }} aria-hidden="true">${TOOL_ART[act.tool]}</span>`}
              <span class=${'zn-hand t-' + tool} ref=${handRef} aria-hidden="true">${TOOL_ART[tool]}</span>
              ${fly && html`<button key=${fly.id} ref=${flyRef} class="zn-fly" data-pad="x" aria-label=${t('zen.flyAria', 'Mariposa: tócala')} onClick=${catchFly}>${BUTTERFLY}</button>`}
            </div>
          </div>
          <p class="zn-status" aria-live="polite">${status}</p>
        </div>
        <div class="zen-panel">
          <section class="zn-sec" aria-label=${t('zen.seedPick', 'Semilla para sembrar')}>
            <h3>${t('zen.seeds', 'Semillas')}</h3>
            <div class="zn-packets" data-pad="l2 r2">
              ${ZEN_KINDS.map((k, ki) => {
                const n = z.seeds[k] || 0;
                return html`<button class=${'zn-packet zn-k-' + k + (seed === ki ? ' on' : '') + (n ? '' : ' off')} aria-pressed=${seed === ki} aria-label=${`Semilla de ${ZEN_NAMES[k]}: tienes ${n}`} onClick=${() => { setSeed(ki); pickTool('sow'); }}>
                  <span class="zn-packet-art">${chipArt(k)}</span><span class="zn-packet-name">${ZEN_NAMES[k]}</span><b class="zn-packet-n">${n}</b>
                </button>`;
              })}
            </div>
          </section>
          <section class="zn-sec" aria-label=${t('zen.tools', 'Herramientas')}>
            <h3>${t('zen.tools', 'Herramientas')}</h3>
            <div class="zn-tools" data-pad="l1 r1">
              ${TOOLS.map((t) => html`<button class=${'zn-tool' + (tool === t.id ? ' on' : '')} aria-pressed=${tool === t.id} onClick=${() => pickTool(t.id)}><span class="zn-tool-ic"><${Icon} name=${t.icon} size=${22} /></span><span>${t.name}</span></button>`)}
            </div>
          </section>
          <section class="zn-sec" aria-label=${t('zen.bag', 'Bolsa')}>
            <h3>${t('zen.bag', 'Bolsa')}</h3>
            <div class="zn-tools">
              <button class=${'zn-tool' + (tool === 'store' ? ' on' : '')} aria-pressed=${tool === 'store'} onClick=${() => pickTool('store')}><span class="zn-tool-ic"><${Icon} name=${STORE.icon} size=${22} /></span><span>${STORE.name}</span></button>
              ${owned.map(([id, it]) => html`<button class=${'zn-tool' + (tool === id ? ' on' : '')} aria-pressed=${tool === id} onClick=${() => pickTool(id)}><span class="zn-tool-ic zn-art-ic">${ITEM_ART[id]}</span><span>${it.name} ×${z.items[id]}</span></button>`)}
            </div>
          </section>
          <button class=${'zen-expand' + (armed ? ' on' : '')} disabled=${z.size >= ZEN_MAX}
            title=${z.size >= ZEN_MAX ? t('zen.maxTitle', 'El cantero ya llega a 8×8') : coins < expandCost(z.size) ? tp('zen.missing', expandCost(z.size) - coins, 'Falta {n} moneda', 'Faltan {n} monedas') : ''}
            onClick=${grow}>
            <${Icon} name="expand" size=${18} />
            <span class="zen-expand-text">${z.size >= ZEN_MAX ? t('zen.max', 'Cantero al máximo · 8×8') : armed ? t('zen.confirmSize', 'Confirmar {size}', { size: `${z.size + 1}×${z.size + 1}` }) : t('zen.expandTo', 'Ampliar a {size}', { size: `${z.size + 1}×${z.size + 1}` })}</span>
            ${z.size < ZEN_MAX && html`<b class="zen-cost"><${Icon} name="coin" size=${13} />${expandCost(z.size)}</b>`}
          </button>
          ${(z.lake || 2) < LAKE_MAX && html`<button class=${'zen-expand' + (lakeArmed ? ' on' : '')} onClick=${growLake}>
            <span class="zn-art-ic">${KOI_ART}</span>
            <span class="zen-expand-text">${lakeArmed ? t('zen.confirmPond', 'Confirmar estanque') : t('zen.pondTo', 'Estanque a {size}', { size: `${(z.lake || 2) + 1}×${(z.lake || 2) + 1}` })}</span>
            <b class="zen-cost"><${Icon} name="coin" size=${13} />${lakeCost(z.lake || 2)}</b>
          </button>`}
          <button class="zen-shop" onClick=${onShop}>
            <span class="zen-shop-text"><strong>${t('zen.shop', 'Tienda del jardín')}</strong><small>${t('zen.shopSub', 'Semillas, macetas, faroles y herramientas')}</small></span>
            <span class="zen-shop-coins"><${Icon} name="coin" size=${16} />${coins}</span>
          </button>
        </div>
      </div>
    </div>
    ${help && html`<div class="overlay" onClick=${(e) => e.target === e.currentTarget && setHelp(false)}>
      <div class="panel mini-sheet" role="dialog" aria-modal="true" aria-label=${t('zen.help', 'Cómo se cuida el jardín')}>
        <h2>${t('zen.help', 'Cómo se cuida el jardín')}</h2>
        <p>${t('zen.help1', 'Las semillas caen al ganar un nodo y se compran en la tienda. Elige un sobre y toca un tiesto para sembrar. Cada planta se riega una vez y así abre antes. Cuando la flor abre, córtala con las tijeras: cada flor paga según su especie: {pays}. La salvia rebrota una vez y la lavanda, rara, a veces suelta su semilla.', { pays: ZEN_KINDS.map((k) => `${ZEN_NAMES[k].toLowerCase()} ${SEEDS[k].pays}`).join(', ') })}</p>
        <p>${t('zen.help2', 'Del arce caen hojas a la arena, también mientras no estás: tócalas para barrerlas (una moneda cada una). Si una mariposa se posa en una flor, tócala y te deja un regalo. Toca el agua del estanque para dar de comer a los koi.')}</p>
        <p>${t('zen.help3', 'Con monedas el cantero crece hasta 8×8, un anillo abajo a la derecha y el siguiente arriba a la izquierda. La tierra nueva se cava (la pala descansa entre cava y cava) y a veces sale con piedras y losas (se parten con el mazo) o arbustos (se cortan con las tijeras). Con Guardar te llevas a la bolsa tiestos vacíos y faroles para ponerlos en otro sitio. El estanque también crece, hasta 4×4. En la tienda hay pala de acero, regadera grande, faroles que aceleran lo que crece a su lado y macetas.')}</p>
        <button class="btn primary" autofocus onClick=${() => setHelp(false)}>${t('howto.ok', 'Entendido')}</button>
      </div>
    </div>`}
  </div>`;
}
