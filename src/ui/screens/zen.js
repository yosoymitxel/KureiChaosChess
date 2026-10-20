// Jardín Zen: un karesansui sobre la mesa. Arena rastrillada que rodea cada maceta y piedra,
// estanque con koi que vienen a comer, musgo, pisaderas, farol y una rama de arce que suelta
// hojas. Se siembra, se riega, se cava y se corta con su gesto; las hojas caídas se barren y
// las mariposas que visitan las flores dejan regalos.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { Fx } from '../../view/fx.js';
import { chipArt, POT, SOIL, plantArt, pondArt, MOSS, STEP, LANTERN, BRANCH, mapleLeaf, rakeArt, orbit, KOI_ORBITS, BUTTERFLY, CAN, SHEARS, SHOVEL, POUCH, px } from '../zen-art.js';
import { ZEN_KINDS, ZEN_NAMES, ZEN_MAX, ZEN_BASE, BASE_GRID, cellKey, expandCost, zenStage, zenSow, zenWater, zenDig, zenHarvest, zenExpand, zenLeaves, zenSweep, LEAF_COINS, BUTTERFLY_MS, butterflyGift, loadZen, saveZen } from '../../game/zen.js';
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
// Lo que se lleva en la mano: sigue al puntero sobre el jardín y hace el gesto al tocar.
const TOOL_ART = { sow: POUCH, water: CAN, dig: SHOVEL, cut: SHEARS };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const later = (fn, ms = 40) => setTimeout(fn, ms); // tras el repintado de Preact
// "el romero", "la salvia": el artículo que pide cada especie, para los avisos.
const the = (k) => (k === 'romero' ? 'el ' : 'la ') + ZEN_NAMES[k].toLowerCase();
const cap = (s) => s[0].toUpperCase() + s.slice(1);
// Cuánto aire deja la arena alrededor de cada cosa (en casillas) y dónde está su centro.
const ROOM = { pot: 0.3, moss: 0.34, step: 0.3, lantern: 0.22 };
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

  // Las monedas saltan del punto de origen en arco y vuelan al monedero; el contador sube al llegar.
  const flyCoins = (from, n, amount) => {
    const to = coinRef.current?.getBoundingClientRect();
    const land = () => { setCoins(addCoins(amount)); playSfx('coin'); motion(coinRef.current, { scale: [1, 1.35, 1] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }); };
    if (!from || !to || reduced()) return land();
    const x0 = from.left + from.width / 2, y0 = from.top + from.height * 0.3, x1 = to.left + to.width * 0.3, y1 = to.top + to.height / 2;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'zn-coinpop';
      c.style.left = x0 + 'px'; c.style.top = y0 + 'px';
      document.body.appendChild(c);
      const sx = (i - (n - 1) / 2) * 26;
      motion(c, { x: [0, sx, x1 - x0], y: [0, -70 - i * 12, y1 - y0], scale: [0.4, 1.1, 0.7] }, { duration: 0.85, delay: i * 0.09, ease: 'easeInOut', onComplete: () => { c.remove(); if (i === n - 1) land(); } });
    }
  };

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
  const dirt = (cell) => {
    const p = at(cell, 0.7);
    fxRef.current.burst(p.x, p.y, { count: 16, color: SOIL_COLORS, speed: [80, 260], life: [0.4, 0.8], size: [2.5, 5], gravity: 700, shape: 'chunk', spread: Math.PI * 0.9, angle: -Math.PI / 2 });
    fxRef.current.dust(p.x, p.y, 0.9);
    motion(cell.querySelector('.zn-plant'), { scale: [0.4, 1.12, 1], y: [8, -4, 0] }, { duration: 0.5, ease: OUT });
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
      const next = zenHarvest(z, key, Date.now());
      apply(next);
      setGain(`+${COINS_PER_FLOWER} monedas por ${the(kind)}.`);
      flyCoins(cell?.getBoundingClientRect(), 3, COINS_PER_FLOWER);
      award('flower_1');
      playSfx('flower');
      const flores = ZEN_KINDS.reduce((n, k) => n + (next.flores[k] || 0), 0);
      if (flores >= 3) award('flower_3');
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
    if (type === 'raw') {
      if (tool === 'dig') { apply(zenDig(z, key)); fxDig(key); say('Tiesto nuevo: siembra cuando quieras.'); }
      else say('Tierra virgen: elige Cavar para hacer un tiesto.');
      return;
    }
    const st = zenStage(z, key, now);
    if (tool === 'sow') {
      if (st.stage === 'empty') {
        if (!(z.seeds[seedKind] > 0)) return say(`Sin semillas de ${ZEN_NAMES[seedKind]}: caen al ganar nodos y se venden en la tienda.`);
        apply(zenSow(z, key, seedKind, now));
        fxSow(key);
        say(`Sembraste ${the(seedKind)}: riega para acortar la espera.`);
      } else if (st.stage === 'bloom') say(`${cap(the(st.kind))} está en flor: córtala con las tijeras.`);
      else say(`${cap(the(st.kind))}: flor en ${secs(st.msLeft)}${st.watered ? '' : ' · puedes regarla'}.`);
    } else if (tool === 'water') {
      if (st.stage === 'empty') say('Ahí no hay nada que regar.');
      else if (st.stage === 'bloom') say(`${cap(the(st.kind))} ya está en flor: córtala.`);
      else if (st.watered) say('Ya la regaste: cada planta se riega una vez.');
      else {
        const next = zenWater(z, key, now);
        apply(next);
        fxWater(key);
        say(`Regaste ${the(st.kind)}: flor en ${secs(zenStage(next, key, now).msLeft)}.`);
      }
    } else if (tool === 'dig') {
      say(st.stage === 'empty' ? 'Ese tiesto ya está cavado.' : 'Ahí ya hay una planta.');
    } else if (tool === 'cut') {
      if (busyCut.current) return;
      if (st.stage === 'bloom') harvest(key, st.kind);
      else if (st.stage === 'empty') say('Ahí no hay flor que cortar.');
      else say(`${cap(the(st.kind))}: la flor abre en ${secs(st.msLeft)}.`);
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
    if (gift.coins) { flyCoins(from, 2, gift.coins); setGain(`La mariposa deja ${gift.coins} monedas.`); }
    else { apply({ ...z, seeds: { ...z.seeds, [gift.seed]: (z.seeds[gift.seed] || 0) + 1 } }); setGain(`La mariposa deja una semilla de ${ZEN_NAMES[gift.seed].toLowerCase()}.`); playSfx('flower'); }
    if (from && !reduced()) fxRef.current.sparkle(from.left - yardRef.current.getBoundingClientRect().left + from.width / 2, from.top - yardRef.current.getBoundingClientRect().top + from.height / 2, '#ffe2a8', 10);
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
    say('Los koi vienen a comer.');
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
  // El estado cuenta lo más útil: el último regalo, la última acción o la flor que abrirá antes.
  const soon = Object.entries(z.pots)
    .map(([key, pot]) => (pot ? zenStage(z, key, now) : null))
    .filter((x) => x && x.msLeft != null)
    .reduce((a, x) => (a == null || x.msLeft < a.msLeft ? x : a), null);
  const status = gain || msg
    || (z.leaves.length ? `Hay ${z.leaves.length} hoja${z.leaves.length > 1 ? 's' : ''} en la arena: tócalas para barrerlas.` : null)
    || (soon ? `${cap(the(soon.kind))} abre en ${secs(soon.msLeft)}.` : `Flores cortadas: ${total}.`);

  const potCell = (key) => {
    const st = zenStage(z, key, now);
    const label = st.kind ? `${ZEN_NAMES[st.kind]}, ${ETAPAS[st.stage]}${st.stage !== 'bloom' && !st.watered ? ', pide agua' : ''}` : 'Tiesto vacío';
    const need = st.stage === 'bloom' ? 'cut' : st.kind && !st.watered ? 'water' : null;
    const d = (key.charCodeAt(1) * 7 + key.charCodeAt(3) * 3) % 10 / 3;
    const wet = st.watered && st.stage !== 'bloom';
    return html`<button key=${key} data-k=${key} class=${'bm-cell zen-pot' + (st.stage === 'bloom' ? ' ready' : '') + (wet ? ' wet' : '')} aria-label=${label} onClick=${() => tap('pot', key)}>
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
        if (t === 'pond') {
          if (r === 1 && c === 2) {
            cells.push(html`<button key="pond" class="bm-cell zen-pond" aria-label="Estanque: toca el agua para dar de comer a los koi" onClick=${feed}>${pondArt(reduced())}</button>`);
            objs.push({ x: c + 1, y: r + 1.02, r: 0.78, sx: 1.06 });
          }
          continue;
        }
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
            <div class=${'zn-yard' + (tool === 'dig' ? ' dig' : '') + (act || pour ? ' acting' : '')} ref=${yardRef} onPointerMove=${hover} onPointerLeave=${unhover}>
              <div class="bm zn-tray" style=${{ '--n': z.size }} role="group" aria-label="Cantero del jardín">
                ${rakeArt(z.size, objs, raw)}
                ${cells}
                ${z.leaves.map((l) => html`<button key=${`leaf-${l.x}-${l.y}`} class="zn-fallen" style=${{ left: (l.x / z.size) * 100 + '%', top: (l.y / z.size) * 100 + '%', '--r': l.r + 'deg' }}
                  aria-label="Hoja caída: tócala para barrerla" onClick=${(e) => sweep(l, e.currentTarget)}>${mapleLeaf}</button>`)}
              </div>
              ${BRANCH}
              ${pour && html`<span key=${pour.id} class="zn-canfx" style=${{ left: pour.x + 'px', top: pour.y + 'px' }} aria-hidden="true">${CAN}<i class="zn-stream"></i></span>`}
              ${act && html`<span key=${act.id} class=${'zn-toolfx t-' + act.tool} style=${{ left: act.x + 'px', top: act.y + 'px' }} aria-hidden="true">${TOOL_ART[act.tool]}</span>`}
              <span class=${'zn-hand t-' + tool} ref=${handRef} aria-hidden="true">${TOOL_ART[tool]}</span>
              ${fly && html`<button key=${fly.id} ref=${flyRef} class="zn-fly" aria-label="Mariposa: tócala" onClick=${catchFly}>${BUTTERFLY}</button>`}
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
        <p>Del arce caen hojas a la arena, también mientras no estás: tócalas para barrerlas (una moneda cada una). Si una mariposa se posa en una flor, tócala y te deja un regalo. Toca el agua del estanque para dar de comer a los koi.</p>
        <p>Con monedas el cantero crece hasta 8×8; la tierra nueva se cava para hacer tiestos.</p>
        <button class="btn primary" autofocus onClick=${() => setHelp(false)}>Entendido</button>
      </div>
    </div>`}
  </div>`;
}
