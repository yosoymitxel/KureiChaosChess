// Run (roguelike map) persistence and progression helpers.
import { generateMap } from './generate.js';
import { STARTER_CARDS } from './cards.js';
import { addToHand, takePending } from './shop.js';
import { randomSeed } from '../core/rng.js';

const RUN_KEY = 'zugzwang.run.v2';
const SETTINGS_KEY = 'zugzwang.settings.v2';

const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const loadRun = () => read(RUN_KEY);
export const saveRun = (run) => write(RUN_KEY, run);
export const clearRun = () => write(RUN_KEY, null);

export function createRun() {
  const seed = randomSeed();
  // El sobre de la tienda entra al repartir: esas cartas quedan marcadas en la mano.
  const hand = addToHand({ cards: [...STARTER_CARDS], shopCount: 0 }, takePending(), true);
  return { seed, map: generateMap(seed), currentFloor: 0, completed: {}, mutations: [], bonuses: {}, cards: hand.cards, shopCount: hand.shopCount, lastNode: null };
}

export function completeNode(run, node, patch = {}) {
  return {
    ...run, ...patch,
    completed: { ...run.completed, [node.id]: true },
    currentFloor: Math.min(run.map.floors - 1, node.floor + 1),
    lastNode: node.id,
  };
}

export function isAvailable(run, node) {
  if (run.completed[node.id] || node.floor !== run.currentFloor) return false;
  if (node.floor === 0) return true;
  return run.map.connections.some((cn) => cn.to === node.id && run.completed[cn.from]);
}

// Minigames won at least once; they stay playable from the menu across runs.
const MINIS_KEY = 'zugzwang.minis.v1';
export const loadUnlocked = () => read(MINIS_KEY) || [];
export const unlockMini = (id) => { const u = loadUnlocked(); if (!u.includes(id)) write(MINIS_KEY, [...u, id]); };

// Bosses already defeated; their entry opens in the rules overlay and the gallery.
const BOSSES_KEY = 'zugzwang.bosses.v1';
export const loadBosses = () => read(BOSSES_KEY) || [];
export const unlockBoss = (id) => { const u = loadBosses(); if (id && !u.includes(id)) write(BOSSES_KEY, [...u, id]); };

export const DEFAULT_SETTINGS = { theme: 'walnut', camera: 'tilt', shake: true, moments: true, fullscreen: false, speed: 1, miniDiff: 'normal' };
export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...(read(SETTINGS_KEY) || {}) });
export const saveSettings = (s) => write(SETTINGS_KEY, s);
