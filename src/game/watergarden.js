// Jardín de Agua: estanque solo de agua, plantas acuáticas, koi como centro de experiencia
// y barquitos (papel y varios tipos) que se manejan o corren en carreras. Lógica pura:
// cada función recibe el estado y devuelve uno nuevo (inmutable). La persistencia está en
// las funciones load/save al final.
// Reusa patrones de src/game/zen.js y los datos de src/data/watergarden.js.
import {
  WATER_PLANTS, KOI_KINDS_DATA, BOAT_KINDS_DATA, WATER_TOOLS,
  blankWaterGarden, waterCellKey, parseWaterKey, inWaterGrid, isWater,
  WATER_MAX_SIZE, WATER_BASE_SIZE, WATER_LEVEL_COST, KOI_HUNGER_MS,
  KOI_FEED_XP, KOI_COIN_PER_SEC, BOAT_WEAR_MAX, RACE_ENTRY_COST, RACE_WIN_PRIZE,
  waterLevelFor, xpToNext,
  KOI_BREED_COOLDOWN_MS, KOI_BREED_COST, KOI_BREED_SUCCESS_CHANCE, KOI_BREED_MIN_SPACE,
  GALLERY_MAX_PHOTOS, PHOTO_COST, WATER_SOUNDS,
} from '../data/watergarden.js';

const KEY = 'zugzwang.watergarden.v1';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const loadWaterGarden = () => {
  const base = blankWaterGarden();
  const z = read(KEY);
  if (!z) return base;
  // Migración: versiones anteriores guardaban el grid de agua vacío y el modo era injugable.
  let waterTiles = z.waterTiles || {};
  if (Object.keys(waterTiles).length === 0) {
    waterTiles = base.waterTiles;
  }
  return {
    ...base, ...z,
    plants: z.plants || {}, kois: z.kois || [], boats: z.boats || [],
    tools: z.tools || {}, waterTiles,
    leaves: z.leaves || [], photos: z.photos || [], leavesCleaned: z.leavesCleaned || 0,
  };
};
export const saveWaterGarden = (z) => write(KEY, z);

// Monedas: agregar (la tienda cobra antes, como en zen.js).
export const addWaterCoins = (z, n) => ({ ...z, coins: z.coins + n });

// ---------- Plantas acuáticas ----------

// Comprar y plantar una planta en una casilla de agua libre.
export const waterPlant = (z, key, kind, now = Date.now()) => {
  if (!isWater(z, key)) return z;
  if (z.plants[key]) return z;
  const plant = WATER_PLANTS[kind];
  if (!plant || z.coins < plant.price) return z;
  return {
    ...z,
    coins: z.coins - plant.price,
    plants: { ...z.plants, [key]: { kind, t: now, g: 0, wet: false, wt: now, cap: 0, planted: now } },
  };
};

// Regar una planta: crece hasta el siguiente tramo si tiene hambre de agua.
export const waterPlantWater = (z, key, now = Date.now()) => {
  const plant = z.plants[key];
  if (!plant) return z;
  const sp = WATER_PLANTS[plant.kind];
  const full = sp.bloomMin * 60_000;
  const g = plant.wet ? Math.min(plant.cap, plant.g + (now - plant.wt)) : plant.g;
  if (g >= full || g < plant.cap) return z;
  const cap = Math.min(full, (Math.floor((g / full) * sp.waterSteps + 1e-9) + 1) * (full / sp.waterSteps));
  return {
    ...z,
    plants: { ...z.plants, [key]: { ...plant, g, wt: now, wet: true, cap } },
  };
};

// Etapa de una planta: empty, sprout, bud, bloom.
export const waterPlantStage = (z, key, now = Date.now()) => {
  const plant = z.plants[key];
  if (!plant) return { stage: 'empty' };
  const sp = WATER_PLANTS[plant.kind];
  const full = sp.bloomMin * 60_000;
  const g = plant.wet ? Math.min(plant.cap, plant.g + (now - plant.wt)) : plant.g;
  const step = Math.min(sp.waterSteps, Math.floor((g / full) * sp.waterSteps + 1e-9));
  if (g >= full) return { ...plant, stage: 'bloom' };
  return { ...plant, stage: g >= full * 0.4 ? 'bud' : 'sprout', msLeft: (full - g), stepLeft: g < plant.cap ? (plant.cap - g) : 0, step };
};

// Cosechar una planta en flor: monedas, XP y a veces semilla (aquí solo monedas y XP).
export const waterHarvest = (z, key, now = Date.now(), rng = Math.random) => {
  const { stage, kind } = waterPlantStage(z, key, now);
  if (stage !== 'bloom') return z;
  const sp = WATER_PLANTS[kind];
  const back = rng() < 0.3;
  return {
    ...z,
    coins: z.coins + sp.pays,
    xp: z.xp + sp.xp,
    plants: { ...z.plants, [key]: null },
    ...(back ? { seeds: { ...(z.seeds || {}), [kind]: ((z.seeds || {})[kind] || 0) + 1 } } : {}),
    harvested: { ...(z.harvested || {}), [kind]: true },
  };
};

// ---------- Peces koi ----------

// Comprar un koi y ponerlo en el estanque (posicion aleatoria dentro del agua).
export const buyKoi = (z, kind, now = Date.now(), rng = Math.random) => {
  const kd = KOI_KINDS_DATA[kind];
  if (!kd || z.coins < kd.price) return z;
  // Buscar una casilla de agua libre para el koi.
  const waterKeys = Object.keys(z.waterTiles).filter((k) => !z.kois.some((q) => q.key === k));
  if (waterKeys.length === 0) return z;
  const key = waterKeys[Math.floor(rng() * waterKeys.length)];
  const [r, c] = parseWaterKey(key);
  return {
    ...z,
    coins: z.coins - kd.price,
    kois: [...z.kois, { id: crypto.randomUUID?.() || `${now}-${Math.random()}`, kind, key, r, c, level: 1, hungerT: now + KOI_HUNGER_MS, xp: 0, boughtT: now }],
  };
};

// Alimentar a un koi: experiencia inmediata y reinicia el hambre.
export const feedKoi = (z, koiId, now = Date.now()) => {
  const koi = z.kois.find((k) => k.id === koiId);
  if (!koi) return z;
  const kd = KOI_KINDS_DATA[koi.kind];
  const newXP = koi.xp + KOI_FEED_XP;
  const level = waterLevelFor(newXP);
  return {
    ...z,
    kois: z.kois.map((k) => k.id === koiId ? { ...k, xp: newXP, level, hungerT: now + KOI_HUNGER_MS } : k),
    xp: z.xp + KOI_FEED_XP,
  };
};

// El koi genera XP y monedas pasivas mientras nada (llamado una vez por segundo).
export const koiPassiveXP = (z, dtSec) => {
  let added = 0;
  const kois = z.kois.map((k) => {
    const kd = KOI_KINDS_DATA[k.kind];
    const gain = (kd?.xpPerSec || 0) * dtSec;
    added += gain;
    return { ...k, xp: (k.xp || 0) + gain };
  });
  const coins = (z.coins || 0) + z.kois.length * KOI_COIN_PER_SEC * dtSec;
  return { ...z, kois, xp: z.xp + added, coins };
};

// ---------- Barquitos ----------

// Comprar un barquito.
export const buyBoat = (z, kind, now = Date.now()) => {
  const bd = BOAT_KINDS_DATA[kind];
  if (!bd || z.coins < bd.price) return z;
  return {
    ...z,
    coins: z.coins - bd.price,
    boats: [...z.boats, { id: crypto.randomUUID?.() || `${now}-${Math.random()}`, kind, x: 1, y: 1, target: null, wear: 0, boughtT: now }],
  };
};

// Mover un barquito a una casilla de agua (jugador lo maneja directamente).
export const moveBoat = (z, boatId, tx, ty) => {
  const boat = z.boats.find((b) => b.id === boatId);
  if (!boat) return z;
  if (!inWaterGrid(z, ty, tx) || !isWater(z, waterCellKey(ty, tx))) return z;
  const wear = Math.min(BOAT_WEAR_MAX, (boat.wear || 0) + 1);
  return {
    ...z,
    boats: z.boats.map((b) => b.id === boatId ? { ...b, x: tx, y: ty, target: null, wear } : b),
  };
};

// Asignar un destino al barquito (navegación autónoma simple).
export const setBoatTarget = (z, boatId, tx, ty) => {
  if (!inWaterGrid(z, ty, tx) || !isWater(z, waterCellKey(ty, tx))) return z;
  return {
    ...z,
    boats: z.boats.map((b) => b.id === boatId ? { ...b, target: [tx, ty] } : b),
  };
};

// Paso del bucle para barcos: avanzan hacia su objetivo si tienen uno.
export const boatsStep = (z, dtSec) => {
  return {
    ...z,
    boats: z.boats.map((b) => {
      if (!b.target) return b;
      const [tx, ty] = b.target;
      const d = Math.hypot(tx - b.x, ty - b.y);
      if (d < 0.1) return { ...b, target: null };
      const bd = BOAT_KINDS_DATA[b.kind];
      const step = bd.speed * dtSec * 0.5;
      const nx = b.x + (tx - b.x) / d * step;
      const ny = b.y + (ty - b.y) / d * step;
      return { ...b, x: nx, y: ny };
    }),
  };
};

// ---------- Herramientas ----------

export const addWaterTool = (z, id) => {
  const tool = WATER_TOOLS[id];
  if (!tool) return z;
  const count = tool.stack ? (z.tools[id] || 0) + 1 : true;
  return { ...z, tools: { ...z.tools, [id]: count } };
};

export const useNet = (z, leafIndex) => {
  const leaves = [...(z.leaves || [])];
  if (leafIndex < 0 || leafIndex >= leaves.length) return z;
  leaves.splice(leafIndex, 1);
  return { ...z, leaves, leavesCleaned: (z.leavesCleaned || 0) + 1, coins: z.coins + 1 };
};

export const useBait = (z, now = Date.now()) => {
  // Atrae koi: hambre pospuesta y XP extra al alimentar luego.
  return { ...z, kois: z.kois.map((k) => ({ ...k, hungerT: k.hungerT + 5 * 60_000 })) };
};

// ---------- Carreras de barquitos (minijuego extra) ----------

// Iniciar una carrera: gasta monedas, devuelve el estado y el resultado de la carrera.
// El jugador elige su barco; oponentes son IA simple. Ganar da premio y logro.
export const startRace = (z, playerBoatId, rng = Math.random) => {
  const player = z.boats.find((b) => b.id === playerBoatId);
  if (!player || z.coins < RACE_ENTRY_COST) return { z, raced: false };
  const bd = BOAT_KINDS_DATA[player.kind];
  const kinds = Object.keys(BOAT_KINDS_DATA);
  // Oponentes equilibrados: mismo ritmo que tu barco (0.7–0.95×) para que cualquier barco
  // tenga posibilidades; el tipo es solo estético.
  const opponents = Array.from({ length: 3 }, (_, i) => {
    const k = kinds[Math.floor(rng() * kinds.length)];
    return { id: `opp-${i}`, kind: k, speed: bd.speed * (0.7 + rng() * 0.25), dist: 0 };
  });
  const playerSpeed = bd.speed;
  const raceDist = 100;
  let playerDist = 0;
  let winner = null;
  let turns = 0;
  // Simulación por turnos hasta que alguien llegue.
  while (!winner && turns < 500) {
    turns += 1;
    playerDist += playerSpeed * 0.1 + rng() * 0.5;
    for (const o of opponents) {
      o.dist += o.speed * 0.1 + rng() * 0.5;
      if (o.dist >= raceDist && !winner) winner = 'opponent';
    }
    if (playerDist >= raceDist && !winner) winner = 'player';
  }
  const won = winner === 'player';
  const timeSec = turns * 0.1;
  const best = z.bestRaceTime == null || timeSec < z.bestRaceTime ? timeSec : z.bestRaceTime;
  const out = {
    ...z,
    coins: z.coins - RACE_ENTRY_COST + (won ? RACE_WIN_PRIZE : 0),
    racesWon: (z.racesWon || 0) + (won ? 1 : 0),
    bestRaceTime: best,
  };
  return { z: out, raced: true, won, timeSec, opponents };
};

// ---------- Nivel y XP ----------

export const addWaterXP = (z, xp) => {
  const newXP = z.xp + xp;
  const level = waterLevelFor(newXP);
  return { ...z, xp: newXP, level };
};

// ---------- Hojas flotantes (para limpiar con la red) ----------

export const waterLeaves = (z, now = Date.now(), rng = Math.random) => {
  const leaves = z.leaves || [];
  if (z.leafT == null) return { ...z, leaves, leafT: now };
  const due = Math.floor((now - z.leafT) / 120_000); // una hoja cada 2 minutos
  if (due <= 0) return z;
  const room = Math.max(0, 12 - leaves.length);
  const fresh = Array.from({ length: Math.min(due, room) }, () => ({
    x: 0.3 + rng() * (z.size - 0.6),
    y: 0.3 + rng() * (z.size - 0.6),
  }));
  return { ...z, leaves: [...leaves, ...fresh], leafT: z.leafT + due * 120_000 };
};

// ---------- Compras de la tienda (para usar desde UI/tienda) ----------

export const buyWaterItem = (z, id) => {
  const plant = WATER_PLANTS[id];
  const koi = KOI_KINDS_DATA[id];
  const boat = BOAT_KINDS_DATA[id];
  const tool = WATER_TOOLS[id];
  if (plant) {
    if (z.coins < plant.price) return z;
    return { ...z, coins: z.coins - plant.price, seeds: { ...(z.seeds || {}), [id]: ((z.seeds || {})[id] || 0) + 1 } };
  }
  if (koi) {
    if (z.coins < koi.price) return z;
    return buyKoi(z, id);
  }
  if (boat) {
    if (z.coins < boat.price) return z;
    return buyBoat(z, id);
  }
  if (tool) {
    if (z.coins < tool.price) return z;
    // Ojo: addWaterTool devuelve el estado completo; hay que tomar solo `tools` para no
    // reemplazar el descuento de monedas con el saldo viejo.
    const withTool = addWaterTool(z, id);
    return { ...z, coins: z.coins - tool.price, tools: withTool.tools };
  }
  return z;
};

// Nivel del estanque (más agua disponible).
export const expandWater = (z) => {
  if (z.size >= WATER_MAX_SIZE) return z;
  const cost = WATER_LEVEL_COST(z.size);
  if (z.coins < cost) return z;
  // Las nuevas casillas del borde se marcan como agua automáticamente.
  const waterTiles = { ...z.waterTiles };
  const oldSize = z.size;
  const newSize = z.size + 1;
  for (let r = 0; r < newSize; r++) {
    for (let c = 0; c < newSize; c++) {
      if (r >= oldSize || c >= oldSize) waterTiles[waterCellKey(r, c)] = true;
    }
  }
  return { ...z, coins: z.coins - cost, size: newSize, waterTiles };
};

// ---------- Cría de koi ----------
// Intenta criar dos koi del mismo tipo. Devuelve { z, bred: boolean, koi?: nuevo, msg }.
export const breedKoi = (z, idA, idB, now = Date.now(), rng = Math.random) => {
  const a = z.kois.find((k) => k.id === idA);
  const b = z.kois.find((k) => k.id === idB);
  if (!a || !b || a.id === b.id || a.kind !== b.kind) {
    return { z, bred: false, msg: 'Necesitas dos koi distintos del mismo tipo.' };
  }
  // Los padres deben estar alimentados (hungerT en el futuro) y no venir de otra cría reciente.
  const fed = (k) => (k.hungerT || 0) > now;
  if (!fed(a) || !fed(b)) return { z, bred: false, msg: 'Alimenta a los dos koi antes de criar.' };
  const resting = (k) => k.bredT && now - k.bredT < KOI_BREED_COOLDOWN_MS;
  if (resting(a) || resting(b)) return { z, bred: false, msg: 'Los koi descansan: espera una hora entre crías.' };
  // Espacio libre en el estanque.
  const waterKeys = Object.keys(z.waterTiles || {});
  const occupied = new Set(z.kois.map((k) => k.key));
  const free = waterKeys.filter((k) => !occupied.has(k));
  if (free.length < KOI_BREED_MIN_SPACE) return { z, bred: false, msg: 'No hay suficiente espacio en el estanque.' };
  if (z.coins < KOI_BREED_COST) return { z, bred: false, msg: 'No tienes suficientes monedas.' };
  // El intento cuenta como cría aunque falle: ambos padres descansan.
  const parents = z.kois.map((k) => (k.id === idA || k.id === idB ? { ...k, bredT: now } : k));
  if (rng() > KOI_BREED_SUCCESS_CHANCE) {
    return { ...z, coins: z.coins - KOI_BREED_COST, kois: parents, bred: false, msg: 'La cría no tuvo éxito esta vez.' };
  }
  // Nacer un koi nuevo del mismo tipo.
  const key = free[Math.floor(rng() * free.length)];
  const [r, c] = parseWaterKey(key);
  const baby = {
    id: crypto.randomUUID?.() || `${now}-${Math.random()}`,
    kind: a.kind,
    key, r, c,
    level: 1,
    hungerT: now + KOI_HUNGER_MS,
    xp: 0,
    boughtT: now,
    bredT: now,
  };
  return {
    ...z,
    coins: z.coins - KOI_BREED_COST,
    kois: [...parents, baby],
    bred: true,
    msg: `¡Nació un koi ${KOI_KINDS_DATA[a.kind].name}!`,
  };
};

// ---------- Galería de fotos ----------
// Toma una foto del estanque y la guarda en la galería.
export const takePhoto = (z, now = Date.now(), img = null, cost = PHOTO_COST) => {
  if (z.coins < cost) return { z, photo: null, msg: 'No tienes suficientes monedas.' };
  const photos = [...(z.photos || [])];
  if (photos.length >= GALLERY_MAX_PHOTOS) return { z, photo: null, msg: 'La galería está llena.' };
  const photo = {
    id: crypto.randomUUID?.() || `photo-${now}`,
    kind: 'estanque',
    size: z.size,
    koiCount: z.kois.length,
    plantCount: Object.values(z.plants || {}).filter(Boolean).length,
    boatCount: z.boats.length,
    takenT: now,
    img: typeof img === 'string' ? img : null,
  };
  return {
    ...z,
    coins: z.coins - cost,
    photos: [...photos, photo],
    photo,
    msg: 'Foto guardada en la galería.',
  };
};

// ---------- Sonido ----------
export const playWaterSound = (kind) => {
  const sfx = WATER_SOUNDS[kind];
  if (!sfx) return;
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('zugzwang:water:sound', { detail: { kind, sfx } }));
  }
};
