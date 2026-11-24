// Regalo diario (src/data/daily.js): cuándo toca, qué sale y cómo se guarda. dailyReady y rollDaily son
// puras (`now` y `rng` inyectados); claimDaily lo reparte entre la tienda, el jardín zen y el de agua.
import { DAILY } from '../data/daily.js';
import { WATER_PLANTS } from '../data/garden.js';
import { CARDS } from './cards.js';
import { addCoins, addPending, seenCards } from './shop.js';
import { addZenSeeds, pickSeed } from './zen.js';
import { loadWater, saveWater, addWaterSeed } from './water.js';

const KEY = 'zugzwang.daily.v1', HOUR = 3_600_000;
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

// El día del calendario local: cambia a medianoche en la zona del jugador.
export const dayKey = (now) => { const d = new Date(now); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
export function loadDaily() {
  const d = read() || {};
  return { claims: Math.max(0, d.claims | 0), lastDay: typeof d.lastDay === 'string' ? d.lastDay : '', lastTs: Number.isFinite(d.lastTs) ? d.lastTs : 0 };
}
// Toca si cambió el día y pasaron GAP_H horas (viajar o cambiar de zona no da dos). Con el reloj
// atrasado por debajo del último regalo no toca hasta que la hora real lo supere.
export function dailyReady(d, now = Date.now()) {
  if (!d.lastTs) return true;
  if (now < d.lastTs) return false;
  return dayKey(now) !== d.lastDay && now - d.lastTs >= DAILY.gapH * HOUR;
}
// Puesto en el ciclo (0..cycle-1) del próximo regalo.
export const dailySlot = (d) => d.claims % DAILY.cycle;

const pick = (weights, rng) => {
  const keys = Object.keys(weights), total = keys.reduce((a, k) => a + weights[k], 0);
  let x = rng() * total;
  return keys.find((k) => (x -= weights[k]) < 0) || keys[0];
};
const pickCard = (pool, rng) => pick(Object.fromEntries(pool.map((id) => [id, DAILY.cardWeight[CARDS[id]?.rarity] || 1])), rng);

// Qué trae el regalo número `slot` del ciclo. `pool`: cartas que puede dar.
export function rollDaily(slot, rng = Math.random, pool = Object.keys(CARDS)) {
  const r = { coins: 0, zen: {}, water: {}, cards: [] };
  const zen = (n) => { for (let i = 0; i < n; i++) { const k = pickSeed(rng); r.zen[k] = (r.zen[k] || 0) + 1; } };
  if (slot === DAILY.cycle - 1) {
    const [a, b] = DAILY.chest.coins;
    r.coins = Math.round((a + rng() * (b - a)) / 5) * 5;
    zen(DAILY.chest.zen);
    for (let i = 0; i < DAILY.chest.card; i++) r.cards.push(pickCard(pool, rng));
    return r;
  }
  const kind = pick(Object.fromEntries(Object.entries(DAILY.loot).map(([k, v]) => [k, v.weight])), rng), L = DAILY.loot[kind];
  if (kind === 'coins') r.coins = Math.round((L.min + rng() * (L.max - L.min)) / 5) * 5;
  else if (kind === 'zen') zen(L.n);
  else if (kind === 'water') for (let i = 0; i < L.n; i++) { const k = pick(DAILY.water, rng); r.water[k] = (r.water[k] || 0) + 1; }
  else r.cards.push(pickCard(pool, rng));
  return r;
}

// Recoge el regalo de hoy: lo reparte y lo guarda. Devuelve lo que trajo (null si no tocaba).
export function claimDaily(now = Date.now(), rng = Math.random) {
  const d = loadDaily();
  if (!dailyReady(d, now)) return null;
  const slot = dailySlot(d), r = rollDaily(slot, rng, [...seenCards()].filter((id) => CARDS[id]));
  // Carta que no cabe en el sobre: monedas.
  r.cards = r.cards.filter((id) => addPending(id) || ((r.coins += DAILY.cardCoins), false));
  if (r.coins) addCoins(r.coins);
  for (const [k, n] of Object.entries(r.zen)) addZenSeeds(k, n);
  let w = loadWater();
  for (const [k, n] of Object.entries(r.water)) for (let i = 0; i < n && WATER_PLANTS[k]; i++) w = addWaterSeed(w, k);
  if (Object.keys(r.water).length) saveWater(w);
  write({ claims: d.claims + 1, lastDay: dayKey(now), lastTs: now });
  return { ...r, slot };
}
