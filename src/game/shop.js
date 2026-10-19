// Tienda del jardín: monedas que pagan las flores del Jardín Zen y lo que se compra con ellas.
import { HAND_LIMIT } from './cards.js';
import { award } from './achievements.js';

const KEY = 'zugzwang.shop.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const COINS_PER_FLOWER = 10;
export const CARD_PRICE = { common: 40, rare: 70 };
// Las semillas del Jardín Zen: también caen al ganar nodos (una por victoria).
export const SEED_PRICE = 12;
// Lo que paga ganar una partida en la travesía; los nodos duros pagan más.
export const COINS_PER_NODE = { normal: 15, elite: 25, miniBoss: 40, boss: 80 };
export const THEME_SHOP = { pergamino: 160, corinto: 160, noche: 160, pixelada: 160 };
export const PENDING_LIMIT = 5;

export function loadShop() {
  const s = read(KEY) || {};
  return {
    coins: s.coins || 0,
    pending: Array.isArray(s.pending) ? s.pending : [],
    themes: Array.isArray(s.themes) ? s.themes : [],
  };
}
export const saveShop = (s) => write(KEY, s);

export function addCoins(n) { const s = loadShop(); const coins = s.coins + n; saveShop({ ...s, coins }); if (coins >= 100) award('rich'); return coins; }
export function charge(n) { const s = loadShop(); if (s.coins < n) return false; saveShop({ ...s, coins: s.coins - n }); return true; }

export const themeOwned = (id) => !THEME_SHOP[id] || loadShop().themes.includes(id);
export const grantTheme = (id) => { const s = loadShop(); if (!s.themes.includes(id)) saveShop({ ...s, themes: [...s.themes, id] }); };

// Cartas compradas sin run: esperan en un sobre y entran al empezar la siguiente.
export function addPending(id) {
  const s = loadShop();
  if (s.pending.length >= PENDING_LIMIT) return false;
  saveShop({ ...s, pending: [...s.pending, id] });
  return true;
}
export function takePending() {
  const s = loadShop();
  if (!s.pending.length) return [];
  saveShop({ ...s, pending: [] });
  return s.pending;
}

// La mano: las compradas son un tramo al final de run.cards (shopCount), así el premio
// más antiguo no las expulsa y la partida puede marcarlas.
export function addToHand(run, ids, shop = false) {
  const cards = [...(run.cards || [])];
  if (shop) cards.push(...ids);
  else cards.splice(cards.length - (run.shopCount || 0), 0, ...ids);
  let shopCount = (run.shopCount || 0) + (shop ? ids.length : 0);
  while (cards.length > HAND_LIMIT) {
    if (shopCount === cards.length) shopCount--;
    cards.shift();
  }
  return { ...run, cards, shopCount };
}
export function consumeCard(run, i) {
  const total = (run.cards || []).length, shopCount = Math.max(0, (run.shopCount || 0) - (i >= total - (run.shopCount || 0) ? 1 : 0));
  return { ...run, cards: run.cards.filter((_, j) => j !== i), shopCount };
}
export const isShopCard = (run, i) => i >= (run.cards || []).length - (run.shopCount || 0);
