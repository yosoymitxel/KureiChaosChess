// Tests del Jardín de Agua (Kure'iChaosChess).
// Ejecutar con: node tests/watergarden.js
import {
  blankWaterGarden,
  WATER_PLANTS, KOI_KINDS_DATA, BOAT_KINDS_DATA, WATER_TOOLS,
  waterCellKey, parseWaterKey, inWaterGrid, isWater,
  WATER_MAX_SIZE, WATER_BASE_SIZE, KOI_HUNGER_MS,
  waterLevelFor, xpToNext,
  KOI_BREED_COST, KOI_BREED_SUCCESS_CHANCE, GALLERY_MAX_PHOTOS, PHOTO_COST, WATER_SOUNDS,
  RACE_ENTRY_COST, RACE_WIN_PRIZE,
} from '../src/data/watergarden.js';
import {
  waterPlant, waterPlantWater, waterHarvest, waterPlantStage,
  buyKoi, feedKoi, koiPassiveXP, breedKoi,
  buyBoat, moveBoat, setBoatTarget, boatsStep, useNet, useBait, addWaterTool,
  startRace, expandWater, buyWaterItem,
  takePhoto, playWaterSound,
} from '../src/game/watergarden.js';

let passed = 0;
let failed = 0;
const assert = (cond, msg) => {
  if (cond) { passed++; console.log('  ✓', msg); }
  else { failed++; console.error('  ✗', msg); process.exitCode = 1; }
};

console.log('\n=== Jardín de Agua: tests ===\n');

// ---------- Datos ----------
console.log('-- Datos --');
assert(Object.keys(WATER_PLANTS).length === 6, '6 plantas acuáticas');
assert(Object.keys(KOI_KINDS_DATA).length === 6, '6 tipos de koi');
assert(Object.keys(BOAT_KINDS_DATA).length === 5, '5 tipos de barcos');
assert(Object.keys(WATER_TOOLS).length === 5, '5 herramientas');
assert(WATER_MAX_SIZE === 8, 'tamaño máximo 8×8');
assert(WATER_BASE_SIZE === 4, 'tamaño base 4×4');
assert(KOI_HUNGER_MS === 20 * 60_000, 'hambre cada 20 min');
assert(GALLERY_MAX_PHOTOS === 24, 'galería hasta 24 fotos');
assert(PHOTO_COST === 10, 'foto cuesta 10 monedas');
assert(KOI_BREED_COST === 50, 'cría cuesta 50 monedas');

// ---------- Estado inicial ----------
console.log('-- Estado inicial --');
const z0 = blankWaterGarden();
assert(z0.size === 4, 'tamaño inicial 4');
assert(z0.coins === 0, 'monedas iniciales 0');
assert(z0.xp === 0, 'XP inicial 0');
assert(z0.level === 1, 'nivel inicial 1');
assert(z0.kois.length === 0, 'sin koi iniciales');
assert(z0.boats.length === 0, 'sin barcos iniciales');
assert((z0.photos || []).length === 0, 'sin fotos iniciales');

// ---------- Grid de agua ----------
console.log('-- Grid de agua --');
assert(waterCellKey(0, 0) === 'r0c0', 'clave de casilla');
assert(parseWaterKey('r2c3')[0] === 2 && parseWaterKey('r2c3')[1] === 3, 'parsear clave');
assert(inWaterGrid(z0, 0, 0), 'dentro del grid');
assert(!inWaterGrid(z0, 4, 4), 'fuera del grid (4x4)');
assert(!isWater(z0, 'r0c0'), 'sin agua inicialmente');

// ---------- Nivel y XP ----------
console.log('-- Nivel y XP --');
assert(waterLevelFor(0) === 1, 'nivel 1 con 0 XP');
assert(waterLevelFor(200) === 2, 'nivel 2 con 200 XP');
assert(waterLevelFor(400) === 3, 'nivel 3 con 400 XP');
assert(xpToNext(1) === 200, 'siguiente nivel desde 1: 200');
assert(xpToNext(2) === 400, 'siguiente nivel desde 2: 400');

// ---------- Plantar y regar ----------
console.log('-- Plantar y regar --');
const z1 = { ...z0, waterTiles: { 'r0c0': true }, coins: 100 };
const z2 = waterPlant(z1, 'r0c0', 'loto');
assert(z2.plants['r0c0'] !== undefined, 'planta sembrada');
assert(z2.coins === 70, 'se gastaron 30 monedas');
assert(z2.plants['r0c0'].kind === 'loto', 'tipo loto');
assert(z2.plants['r0c0'].g === 0, 'crecimiento inicial 0');

const z3 = waterPlantWater(z2, 'r0c0', Date.now());
assert(z3.plants['r0c0'].wet === true, 'planta regada');

const stage = waterPlantStage(z3, 'r0c0');
assert(stage.stage === 'sprout' || stage.stage === 'bud' || stage.stage === 'bloom', 'etapa válida');

// ---------- Cosechar ----------
console.log('-- Cosechar --');
// Avanzar el tiempo para que florezca (usar un now muy futuro)
const nowFar = Date.now() + 100 * 60_000; // 100 minutos después
const z4 = waterPlant(z1, 'r0c0', 'loto', nowFar);
const z5 = waterPlantWater(z4, 'r0c0', nowFar + 60_000);
// Forzar a bloom directamente modificando g
const zBloom = { ...z4, plants: { ...z4.plants, 'r0c0': { ...z4.plants['r0c0'], g: 99999999 } } };
const z6 = waterHarvest(zBloom, 'r0c0', nowFar + 60_000);
assert(z6.plants['r0c0'] === null, 'planta cosechada (eliminada)');
assert(z6.coins > z4.coins, 'se ganaron monedas al cosechar');

// ---------- Koi ----------
console.log('-- Koi --');
const zK0 = { ...z0, waterTiles: { 'r0c0': true }, coins: 1000 };
const zK1 = buyKoi(zK0, 'kohaku', Date.now());
assert(zK1.kois.length === 1, 'koi comprado');
assert(zK1.kois[0].kind === 'kohaku', 'tipo kohaku');
assert(zK1.coins === 900, 'se gastaron 100 monedas');

const zK2 = feedKoi(zK1, zK1.kois[0].id);
assert(zK2.kois[0].xp > zK1.kois[0].xp, 'koi ganó XP al comer');

// ---------- Cría ----------
console.log('-- Cría --');
const zB0 = { ...z0, waterTiles: { 'r0c0': true, 'r0c1': true, 'r0c2': true, 'r0c3': true, 'r1c0': true, 'r1c1': true, 'r1c2': true, 'r1c3': true }, coins: 100, kois: [
  { id: 'a', kind: 'kohaku', key: 'r0c0', r: 0, c: 0, level: 1, hungerT: 0, xp: 0, boughtT: 0 },
  { id: 'b', kind: 'kohaku', key: 'r0c1', r: 0, c: 1, level: 1, hungerT: 0, xp: 0, boughtT: 0 },
] };
const zB1 = breedKoi(zB0, 'a', 'b', Date.now(), () => 0.1); // éxito garantizado
assert(zB1.bred === true, 'cría exitosa');
assert(zB1.kois.length === 3, 'nació un koi nuevo');
assert(zB1.coins === 50, 'se gastaron 50 monedas en cría');

const zB2 = breedKoi(zB0, 'a', 'b', Date.now(), () => 0.9); // fallo garantizado
assert(zB2.bred === false, 'cría falló por azar');
assert(zB2.coins === 50, 'se gastaron 50 monedas aunque falló');

// ---------- Barcos ----------
console.log('-- Barcos --');
const zBoat0 = { ...z0, waterTiles: { 'r0c0': true, 'r1c1': true }, coins: 500 };
const zBoat1 = buyBoat(zBoat0, 'papel');
assert(zBoat1.boats.length === 1, 'barco comprado');
assert(zBoat1.boats[0].kind === 'papel', 'tipo papel');

const zBoat2 = moveBoat(zBoat1, zBoat1.boats[0].id, 1, 1);
assert(zBoat2.boats[0].x === 1 && zBoat2.boats[0].y === 1, 'barco movido');

const zBoat3 = setBoatTarget(zBoat2, zBoat2.boats[0].id, 0, 0);
assert(zBoat3.boats[0].target[0] === 0 && zBoat3.boats[0].target[1] === 0, 'objetivo asignado');

const zBoat4 = boatsStep(zBoat3, 1);
assert(zBoat4.boats[0].x < 1 || zBoat4.boats[0].y < 1, 'barco avanzó hacia objetivo (0,0)');

// ---------- Herramientas ----------
console.log('-- Herramientas --');
const zTool0 = { ...z0, coins: 200, leaves: [{ x: 1, y: 1 }] };
const zTool1 = addWaterTool(zTool0, 'red');
assert(!!zTool1.tools.red, 'red comprada');

const zTool2 = useNet(zTool1, 0);
assert(zTool2.coins === 201, 'limpiar hoja da +1 moneda');
assert((zTool2.leaves || []).length === 0, 'hoja eliminada');

// ---------- Carreras ----------
console.log('-- Carreras --');
const zRace0 = { ...z0, coins: 100, boats: [{ id: 'b1', kind: 'velocidad', x: 0, y: 0, target: null, wear: 0 }] };
const { z: zRace1, raced, won } = startRace(zRace0, 'b1');
assert(raced === true, 'carrera iniciada');
assert(zRace1.coins === zRace0.coins - RACE_ENTRY_COST + (won ? RACE_WIN_PRIZE : 0), 'monedas ajustadas por carrera');

// ---------- Galería ----------
console.log('-- Galería --');
const zGal0 = { ...z0, coins: 50 };
const zGal1 = takePhoto(zGal0);
assert(zGal1.photo !== null, 'foto tomada');
assert(zGal1.coins === 40, 'se gastaron 10 monedas');
assert((zGal1.photos || []).length === 1, 'una foto en galería');

// ---------- Sonido ----------
console.log('-- Sonido --');
assert(WATER_SOUNDS.ambient !== undefined, 'sonido ambiental definido');
assert(WATER_SOUNDS.feed !== undefined, 'sonido de alimentación definido');
assert(WATER_SOUNDS.breed !== undefined, 'sonido de cría definido');
assert(WATER_SOUNDS.camera !== undefined, 'sonido de cámara definido');

// ---------- Compras integradas ----------
console.log('-- Tienda integrada --');
const zShop0 = { ...z0, coins: 200 };
const zShop1 = buyWaterItem(zShop0, 'loto');
assert((zShop1.seeds || {}).loto === 1, 'semilla de loto comprada');

const zShop2 = buyWaterItem({ ...zShop0, waterTiles: { 'r0c0': true } }, 'kohaku');
assert(zShop2.kois.length === 1, 'koi comprado desde tienda');

console.log(`\nResultado: ${passed} pasaron, ${failed} fallaron\n`);
if (failed > 0) process.exit(1);
