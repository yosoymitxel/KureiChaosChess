// Run (roguelike map) persistence and progression helpers.
import { generateMap, tutorialMap } from './generate.js';
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

export function createRun({ tutorial = false } = {}) {
  const seed = randomSeed();
  // El sobre de la tienda entra al repartir: esas cartas quedan marcadas en la mano.
  const hand = addToHand({ cards: [...STARTER_CARDS], shopCount: 0 }, takePending(), true);
  return { seed, tutorial, map: tutorial ? tutorialMap(seed) : generateMap(seed), currentFloor: 0, completed: {}, mutations: [], bonuses: {}, cards: hand.cards, shopCount: hand.shopCount, lastNode: null, prefs: { fav: [], ban: [] } };
}

// Selector de la run: hasta 3 mecánicas favoritas y 1 vetada; mientras no se haya jugado nada,
// el mapa se vuelve a sortear con la misma semilla y las preferencias nuevas.
export const PREF_LIMITS = { fav: 3, ban: 1 };
export const withPrefs = (run, prefs) => ({ ...run, prefs, map: generateMap(run.seed, prefs) });

// Al entrar a un nivel se guarda la mano y los bonos: reiniciarlo, o dejarlo a medias por otro, los devuelve.
export const enterLevel = (run, node) => ({ ...run, level: { node: node.id, cards: run.cards || [], shopCount: run.shopCount || 0, bonuses: run.bonuses || {} } });
export const resetLevel = (run) => (run.level ? { ...run, cards: run.level.cards, shopCount: run.level.shopCount, bonuses: run.level.bonuses, suspended: undefined } : run);
export const dropLevel = (run) => ({ ...resetLevel(run), level: undefined });

export function completeNode(run, node, patch = {}) {
  return {
    ...run, ...patch, level: undefined, suspended: undefined,
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

// El nivel del minijuego lo manda el piso: primer tercio de la torre fácil, el medio normal
// y el último difícil. En la run no se elige; en partida libre sí. (La tabla vive en difficulty.js.)
export { floorTier } from './difficulty.js';

// Minigames won at least once; they stay playable from the menu across runs.
const MINIS_KEY = 'zugzwang.minis.v1';
export const loadUnlocked = () => read(MINIS_KEY) || [];
export const unlockMini = (id) => { const u = loadUnlocked(); if (!u.includes(id)) write(MINIS_KEY, [...u, id]); };

// Bosses already defeated; their entry opens in the rules overlay and the gallery.
const BOSSES_KEY = 'zugzwang.bosses.v1';
export const loadBosses = () => read(BOSSES_KEY) || [];
export const unlockBoss = (id) => { const u = loadBosses(); if (id && !u.includes(id)) write(BOSSES_KEY, [...u, id]); };

export const DEFAULT_SETTINGS = { theme: 'walnut', camera: 'tilt', shake: true, vfx: false, moments: true, fullscreen: false, speed: 1, difficulty: 'normal', miniDiff: {}, sound: true, music: true, volume: 'normal', coin: false };
// El ajuste viejo guardaba un solo nivel global; ahora es un nivel por minijuego.
export const loadSettings = () => {
  const s = { ...DEFAULT_SETTINGS, ...(read(SETTINGS_KEY) || {}) };
  return typeof s.miniDiff === 'string' ? { ...s, miniDiff: { bowling: s.miniDiff } } : s;
};
export const saveSettings = (s) => write(SETTINGS_KEY, s);

// Demos de mutaciones: cada mutación se enseña una vez por run, al empezar la primera partida
// después de conseguirla. Se guarda aparte para no tocar la run desde la partida.
const DEMO_KEY = 'zugzwang.demoed.v1';
export function takeNewDemos(run) {
  const prev = read(DEMO_KEY);
  const done = prev?.seed === run.seed ? prev.ids : [];
  const fresh = [...new Set(run.mutations || [])].filter((id) => !done.includes(id));
  if (fresh.length) write(DEMO_KEY, { seed: run.seed, ids: [...done, ...fresh] });
  return fresh;
}
