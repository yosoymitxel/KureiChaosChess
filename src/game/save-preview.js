import { ACHIEVEMENTS } from './achievements.js';
import { THEMES } from '../data/themes.js';
import { DIFFICULTIES } from './difficulty.js';

const KEYS = Object.freeze({
  run: 'zugzwang.run.v2',
  settings: 'zugzwang.settings.v2',
  minis: 'zugzwang.minis.v1',
  bosses: 'zugzwang.bosses.v1',
  achievements: 'zugzwang.achievements.v1',
  stats: 'zugzwang.stats.v1',
  seen: 'zugzwang.seen.v1',
  mutseen: 'zugzwang.mutseen.v1',
  zen: 'zugzwang.zen.v1',
  shop: 'zugzwang.shop.v1',
});

function read(snapshot, key, fallback) {
  const value = snapshot?.[KEYS[key]];
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

const count = (value) => Array.isArray(value) ? value.length : 0;
const totalValues = (value) => Object.values(value || {}).reduce((sum, item) => sum + (Number.isFinite(item) ? item : 0), 0);
const safeObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function summarizeSave(snapshot = {}) {
  const run = read(snapshot, 'run', null);
  const settings = safeObject(read(snapshot, 'settings', {}));
  const savedAchievements = read(snapshot, 'achievements', []);
  const achievements = [...new Set((Array.isArray(savedAchievements) ? savedAchievements : []).filter((id) => typeof id === 'string'))]
    .filter((id) => ACHIEVEMENTS.some((item) => item.id === id));
  const totalAchievements = ACHIEVEMENTS.length;
  const groups = [...new Set(ACHIEVEMENTS.map((item) => item.group))].map((name) => ({
    name,
    unlocked: ACHIEVEMENTS.filter((item) => item.group === name && achievements.includes(item.id)).length,
    total: ACHIEVEMENTS.filter((item) => item.group === name).length,
  }));
  const stats = safeObject(read(snapshot, 'stats', {}));
  const statistics = Object.entries(stats).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? value.length : Number.isFinite(value) ? value : null,
  })).filter((item) => item.value !== null && item.value > 0)
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, 6);
  const zen = safeObject(read(snapshot, 'zen', {}));
  const shop = safeObject(read(snapshot, 'shop', {}));
  const map = safeObject(run?.map);
  const completed = safeObject(run?.completed);
  const completedIds = new Set(Object.keys(completed).filter((id) => completed[id]));
  const nodes = Array.isArray(map.nodes) ? map.nodes : [];
  const clearedFloors = new Set(nodes.filter((node) => completedIds.has(node?.id)).map((node) => node?.floor).filter(Number.isInteger));
  const floors = Number.isInteger(map.floors) && map.floors > 0 ? map.floors : 0;
  const floor = run ? Math.min(floors || Number.MAX_SAFE_INTEGER, Math.max(1, (Number(run.currentFloor) || 0) + 1)) : 0;
  const flowers = totalValues(zen.flores);
  const settingsTheme = settings.theme || 'walnut';
  const settingsDifficulty = settings.difficulty || 'normal';

  return {
    run: run ? {
      floor,
      floors,
      completedNodes: completedIds.size,
      completedFloors: clearedFloors.size,
      mutations: count(run.mutations),
      cards: count(run.cards),
      suspended: !!(run.suspended || run.level),
    } : null,
    achievements: {
      unlocked: achievements.length,
      total: totalAchievements,
      percent: totalAchievements ? Math.round(100 * achievements.length / totalAchievements) : 0,
      groups,
      items: achievements.map((id) => { const item = ACHIEVEMENTS.find((entry) => entry.id === id); return { id, name: item.name, group: item.group }; }),
    },
    garden: {
      size: Number.isInteger(zen.size) ? zen.size : 4,
      planted: Number.isFinite(zen.planted) ? zen.planted : 0,
      harvested: flowers,
      seeds: totalValues(zen.seeds),
      pots: Object.keys(safeObject(zen.pots)).length,
      lake: Number.isInteger(zen.lake) ? zen.lake : 2,
    },
    economy: {
      coins: Number.isFinite(shop.coins) ? shop.coins : 0,
      tables: count(shop.themes),
      pendingCards: count(shop.pending),
    },
    unlocks: {
      minigames: count(read(snapshot, 'minis', [])),
      bosses: count(read(snapshot, 'bosses', [])),
      pieces: count(read(snapshot, 'seen', [])),
      mutations: count(read(snapshot, 'mutseen', [])),
    },
    settings: {
      theme: THEMES[settingsTheme]?.name || settingsTheme,
      difficulty: DIFFICULTIES[settingsDifficulty]?.name || settingsDifficulty,
    },
    statistics,
  };
}
