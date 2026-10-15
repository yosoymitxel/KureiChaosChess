// Run (roguelike map) persistence and progression helpers.
import { generateMap } from './generate.js';
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
  return { seed, map: generateMap(seed), currentFloor: 0, completed: {}, mutations: [], bonuses: {}, lastNode: null };
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

export const DEFAULT_SETTINGS = { theme: 'walnut', camera: 'tilt', shake: true, fullscreen: false, speed: 1 };
export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...(read(SETTINGS_KEY) || {}) });
export const saveSettings = (s) => write(SETTINGS_KEY, s);
