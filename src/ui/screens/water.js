// Jardín de Agua: un estanque entero. Plantas acuáticas en las plazas de la orilla, koi y barquitos que
// se manejan como teledirigidos en el centro; abajo, la carrera de barquitos.
import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, useEnter } from '../components.js';
import { Icon } from '../icons.js';
import { Pond, runPond } from '../../view/pond.js';
import { gardenDecor, gardenInside } from '../../view/water-art.js';
import { Thumb } from '../water-thumb.js';
import { reduced } from '../hop.js';
import { newBoat, drive } from '../../game/boats.js';
import { RcPad, useRcKeys } from '../rc-pad.js';
import { GardenSwitch } from '../garden-switch.js';
import { GARDENS, WATER_PLANTS, WATER_SLOTS, WATER_SIZE as S, BOATS } from '../../data/garden.js';
import { loadWater, saveWater, waterStage, waterSow, waterHarvest, addWaterSeed, addBoat, waterFeed, waterKoiHungry } from '../../game/water.js';
import { addCoins, charge, loadShop } from '../../game/shop.js';
import { playSfx } from '../sfx.js';
import { t } from '../../i18n/index.js';

const inside = gardenInside(S);
const KINDS = Object.keys(WATER_PLANTS);
const mins = (ms) => Math.max(1, Math.ceil(ms / 60_000));

export function WaterScreen({ onBack, onGarden, onRace }) {
  const ref = useRef(null), cvRef = useRef(null), pondRef = useRef(null);
  useEnter(ref);
  const [w, setW] = useState(loadWater);
  const [coins, setCoins] = useState(() => loadShop().coins);
  const [seed, setSeed] = useState(KINDS[0]);
  const [msg, setMsg] = useState(t('water.hello', 'Toca una plaza de la orilla para plantar; el centro es para los koi y los barquitos.'));
  const [driving, setDriving] = useState(null);
  const [, tick] = useState(0);
  const rc = useRef(null), drivingRef = useRef(null);
  drivingRef.current = driving;
  const apply = (n) => { saveWater(n); setW(n); };
  const release = () => setDriving(null);
  useRcKeys(rc, driving != null, release);

  // Estanque vivo: koi, nenúfares que derivan, barquitos y las plantas de cada plaza.
  useEffect(() => {
    const pond = pondRef.current = new Pond(cvRef.current, { size: [S, S], inside, count: 4, len: 7.5, speed: 3.2, pads: [[24, 34, 2.2], [37, 24, 1.8]], duckweed: 12 });
    pond.decor = gardenDecor(S);
    pond.onStep = (dt) => pond.boats.forEach((b, i) => { b.sel = i === drivingRef.current; if (drive(b, b.sel ? rc.current : null, dt, inside) > 4) playSfx('tap', 0.7); });
    return runPond(pond, () => cvRef.current, reduced());
  }, []);
  useEffect(() => {
    const pond = pondRef.current;
    pond.boats = w.boats.map((k, i) => pond.boats[i] || newBoat(k, S / 2 + Math.cos(i * 2.4) * 10, S / 2 + Math.sin(i * 2.4) * 10, i * 2.4 + Math.PI / 2));
  }, [w.boats.length]);
  // Las plantas crecen con el reloj: se repinta su etapa cada pocos segundos.
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(id); }, []);
  const now = Date.now();
  if (pondRef.current) pondRef.current.plants = WATER_SLOTS.map(([x, y], i) => ({ x, y, ...waterStage(w, i, now) }));
  useEffect(() => { if (pondRef.current) pondRef.current.plants = WATER_SLOTS.map(([x, y], i) => ({ x, y, ...waterStage(w, i, Date.now()) })); });

  const pay = (n) => setCoins(addCoins(n));
  const buy = (price, name, then) => {
    if (coins < price) return setMsg(t('water.short', '{name} cuesta {cost} monedas: te faltan {n}.', { name, cost: price, n: price - coins }));
    if (!charge(price)) return;
    setCoins(loadShop().coins);
    playSfx('coin');
    then();
  };

  const tap = (e) => {
    const r = cvRef.current.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * S, y = ((e.clientY - r.top) / r.height) * S;
    const slot = WATER_SLOTS.findIndex(([sx, sy]) => Math.hypot(sx - x, sy - y) < 5.5);
    if (slot >= 0) {
      const st = waterStage(w, slot);
      if (st.stage === 'empty') {
        if (!(w.seeds[seed] > 0)) return setMsg(t('water.noSeed', 'No te quedan semillas de {name}: cómpralas abajo.', { name: WATER_PLANTS[seed].name }));
        apply(waterSow(w, slot, seed)); playSfx('dig');
        return setMsg(t('water.sown', '{name} plantado: crece solo, sin riego.', { name: WATER_PLANTS[seed].name }));
      }
      if (st.stage === 'bloom') {
        const h = waterHarvest(w, slot);
        apply(h.w); pay(h.coins); playSfx('coin'); pondRef.current.ripple(x, y, 1);
        return setMsg(t('water.cut', 'Flor de {name}: +{n} monedas.', { name: WATER_PLANTS[st.kind].name, n: h.coins }));
      }
      return setMsg(t('water.growing', '{name}: abre en {n} min.', { name: WATER_PLANTS[st.kind].name, n: mins(st.left) }));
    }
    const boats = pondRef.current.boats, near = boats.findIndex((b) => Math.hypot(b.x - x, b.y - y) < 5);
    if (near >= 0) { setDriving(near === driving ? null : near); playSfx('pop'); return setMsg(t('water.drive', 'Manejas {name}: arrastra el mando o usa las flechas.', { name: BOATS[boats[near].kind].name })); }
    pondRef.current.tap(x, y); playSfx('splash');
    const fed = waterFeed(w);
    if (fed.coins) { apply(fed.w); pay(fed.coins); setMsg(t('zen.koiHungryFed', 'Los koi tenían hambre: +{n} monedas.', { n: fed.coins })); }
    else setMsg(t('zen.koiFeed', 'Los koi vienen a comer.'));
  };

  return html`<div class="screen mini zen-screen water-screen" ref=${ref}>
    <${Topbar} title=${GARDENS.agua.name} onBack=${onBack}>
      <span class="coin-chip"><${Icon} name="coin" size=${16} /><b>${coins}</b></span>
    </${Topbar}>
    <div class="mini-body zen-body">
      <${GardenSwitch} current="agua" onGarden=${onGarden} />
      <div class="zen-main">
        <div class="zen-scene">
          <div class="mini-stage">
          <div class=${'wt-pond' + (waterKoiHungry(w) ? ' hungry' : '')} onClick=${tap} role="application" aria-label=${t('water.aria', 'Estanque: toca una plaza de la orilla para plantar o cortar, un barquito para manejarlo o el agua para dar de comer a los koi')}>
            <canvas class="wt-cv" ref=${cvRef}></canvas>
          </div>
          </div>
          <p class="zn-status" aria-live="polite">${msg}</p>
        </div>
        <div class="zen-panel">
          <section class="zn-sec" aria-label=${t('water.plants', 'Plantas acuáticas')}>
            <h3>${t('water.plants', 'Plantas acuáticas')}</h3>
            <div class="zn-tools">
              ${KINDS.map((k) => { const p = WATER_PLANTS[k]; return html`<button class=${'zn-tool' + (seed === k ? ' on' : '')} aria-pressed=${seed === k} title=${p.desc} onClick=${() => setSeed(k)}>
                <span class="zn-tool-ic wt-thumb"><${Thumb} plant=${k} /><b class="zn-packet-n">${w.seeds[k] || 0}</b></span><span>${p.name}</span></button>`; })}
            </div>
            <button class="zen-expand" onClick=${() => buy(WATER_PLANTS[seed].price, WATER_PLANTS[seed].name, () => apply(addWaterSeed(loadWater(), seed)))}>
              <${Icon} name="seed" size=${18} /><span class="zen-expand-text">${t('water.buySeed', 'Comprar {name}', { name: WATER_PLANTS[seed].name })}</span>
              <b class="zen-cost"><${Icon} name="coin" size=${13} />${WATER_PLANTS[seed].price}</b></button>
          </section>
          <section class="zn-sec" aria-label=${t('zen.boats', 'Barquitos')}>
            <h3>${t('zen.boats', 'Barquitos')}</h3>
            <div class="zn-tools">
              ${Object.values(BOATS).filter((b) => !b.fish).map((b) => {
                const own = w.boats.indexOf(b.id);
                return html`<button class=${'zn-tool' + (own >= 0 && driving === own ? ' on' : '')} title=${b.desc}
                  onClick=${() => (own >= 0 ? setDriving(driving === own ? null : own) : buy(b.price, b.name, () => { apply(addBoat(loadWater(), b.id)); setMsg(t('zen.boatBought', '{name} al agua: tócalo para manejarlo.', { name: b.name })); }))}>
                  <span class=${'zn-tool-ic wt-thumb' + (own >= 0 ? '' : ' locked')}><${Thumb} boat=${b.id} /></span>
                  <span>${b.name}${own >= 0 ? '' : ` · ${b.price}`}</span></button>`;
              })}
            </div>
          </section>
          ${onRace && html`<button class="zen-shop" onClick=${onRace}>
            <span class="zen-shop-text"><strong>${t('water.race', 'Carrera de barquitos')}</strong><small>${t('water.raceSub', 'Barcos y koi en el estanque grande')}</small></span>
            <${Icon} name="rush" size=${22} /></button>`}
        </div>
      </div>
    </div>
    ${driving != null && html`<div class="rc-float"><${RcPad} input=${rc} onRelease=${release} /></div>`}
  </div>`;
}
