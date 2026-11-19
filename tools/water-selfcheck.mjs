// Jardín de Agua: sembrar gasta semilla, la flor abre a su hora, cortar paga y el nenúfar rebrota dos veces.
// `node tools/water-selfcheck.mjs` → una línea si va bien.
import { WATER_PLANTS, WATER_SLOTS, WATER_SIZE } from '../src/data/garden.js';
import { blankWater, waterSow, waterStage, waterHarvest, waterFeed } from '../src/game/water.js';

const fails = [], ok = (c, m) => c || fails.push(m);
let w = blankWater();
ok(w.slots.length === WATER_SLOTS.length, 'plazas');
ok(WATER_SLOTS.every(([x, y]) => Math.hypot(x - WATER_SIZE / 2, y - WATER_SIZE / 2) > 18), 'una plaza invade el centro');
w = waterSow(w, 0, 'nenufar', 0);
ok(w.seeds.nenufar === 0 && waterSow(w, 1, 'nenufar', 0) === w, 'sembrar sin semilla');
const full = WATER_PLANTS.nenufar.bloomMin * 60_000;
ok(waterStage(w, 0, full - 1).stage === 'bud' && waterStage(w, 0, full).stage === 'bloom', 'etapas');
let t = full, paid = 0;
for (let k = 0; k < 3; k++) { const r = waterHarvest(w, 0, t); paid += r.coins; w = r.w; t += full; }
ok(paid === WATER_PLANTS.nenufar.pays * 3 && w.slots[0] === null, `rebrote del nenúfar: ${paid}`);
ok(waterHarvest(w, 0, t).coins === 0, 'cortar vacío');
ok(waterFeed(w, 10 ** 9).coins > 0 && waterFeed(waterFeed(w, 10 ** 9).w, 10 ** 9 + 1).coins === 0, 'koi');
if (fails.length) { console.log('Jardín de Agua:\n' + fails.join('\n')); process.exit(1); }
console.log(`agua ok: ${WATER_SLOTS.length} plazas, ${Object.keys(WATER_PLANTS).length} plantas`);
