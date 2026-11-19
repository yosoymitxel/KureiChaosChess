// Jardín de Agua: estanque solo de agua, plantas acuáticas, koi como centro de experiencia
// y barquitos (papel y varios tipos) que se manejan o corren en minijuego. La lógica está en
// src/game/watergarden.js; el dibujo reusa src/view/pond.js y src/view/koi.js.
// Agregar una planta, koi o barco pide su entrada aquí y su sprite en art/zen/.
import { localize } from '../i18n/index.js';

// Plantas acuáticas: `bloomMin` minutos con agua hasta florecer, `pays` monedas por cosecha,
// `xp` experiencia al cosechar, `waterSteps` regadas necesarias.
export const WATER_PLANTS = localize('waterPlants', {
  loto: { id: 'loto', name: 'Loto', rarity: 'Común', weight: 5, price: 30, bloomMin: 20, pays: 40, xp: 15, waterSteps: 3, desc: 'La flor del estanque: agua quieta y lento.' },
  nenufar: { id: 'nenufar', name: 'Nenúfar', rarity: 'Común', weight: 4, price: 20, bloomMin: 12, pays: 25, xp: 10, waterSteps: 2, desc: 'Flotante: da calma y adorna la superficie.' },
  junco: { id: 'junco', name: 'Junco', rarity: 'Rara', weight: 2, price: 45, bloomMin: 30, pays: 60, xp: 20, waterSteps: 4, desc: 'Borde del estanque: estética y altura.' },
  lenteja: { id: 'lenteja', name: 'Lenteja de agua', rarity: 'Rara', weight: 2, price: 50, bloomMin: 25, pays: 35, xp: 18, waterSteps: 3, desc: 'Cubre la superficie: reduce la evaporación del agua.' },
  alga: { id: 'alga', name: 'Alga marina', rarity: 'Épica', weight: 1, price: 70, bloomMin: 40, pays: 80, xp: 30, waterSteps: 5, desc: 'Fondo del estanque: da experiencia pasiva mientras crece.' },
  papiro: { id: 'papiro', name: 'Papiro', rarity: 'Épica', weight: 1, price: 80, bloomMin: 45, pays: 100, xp: 25, waterSteps: 4, desc: 'Orilla: crece alto y da buen paisaje.' },
});

// Peces koi: el centro de experiencia. Cada uno nadando genera XP pasivo por segundo.
// `price`: monedas para comprarlo. `xpPerSec`: experiencia por segundo nadando.
export const KOI_KINDS_DATA = localize('koiKinds', {
  kohaku: { id: 'kohaku', name: 'Kohaku', rarity: 'Común', price: 100, xpPerSec: 0.5, color: '#f1eadb', accent: '#dc4b2f' },
  sanke: { id: 'sanke', name: 'Sanke', rarity: 'Rara', price: 180, xpPerSec: 0.9, color: '#f2ebdc', accent: '#df5032' },
  showa: { id: 'showa', name: 'Showa', rarity: 'Rara', price: 200, xpPerSec: 1.0, color: '#eee6d5', accent: '#d9482e' },
  ogon: { id: 'ogon', name: 'Ogon', rarity: 'Épica', price: 350, xpPerSec: 1.8, color: '#e7aa31', accent: '#cf7626' },
  tancho: { id: 'tancho', name: 'Tancho', rarity: 'Épica', price: 400, xpPerSec: 2.0, color: '#f2ebdc', accent: '#da4430' },
  shiro: { id: 'shiro', name: 'Shiro', rarity: 'Legendaria', price: 700, xpPerSec: 4.0, color: '#eae5da', accent: '#252825' },
});

// Barquitos: `papel` es el barato y frágil; los otros se desbloquean con monedas o nivel.
// `speed`: velocidad de navegación. `capacity`: cuántos koi puede llevar (decorativo).
export const BOAT_KINDS_DATA = localize('boatKinds', {
  papel: { id: 'papel', name: 'Barco de papel', rarity: 'Común', price: 40, speed: 1.2, capacity: 1, desc: 'Barato, frágil y lento. Estética origami.' },
  madera: { id: 'madera', name: 'Barco de madera', rarity: 'Rara', price: 120, speed: 1.8, capacity: 2, desc: 'Resistente y equilibrado.' },
  bambu: { id: 'bambu', name: 'Barco de bambú', rarity: 'Rara', price: 150, speed: 2.4, capacity: 2, desc: 'Ligero y rápido.' },
  lujo: { id: 'lujo', name: 'Barco de lujo', rarity: 'Épica', price: 300, speed: 1.5, capacity: 3, desc: 'Bonito y espacioso.' },
  velocidad: { id: 'velocidad', name: 'Barco de velocidad', rarity: 'Legendaria', price: 600, speed: 3.5, capacity: 1, desc: 'Para carreras.' },
});

// Herramientas del jardín de agua.
export const WATER_TOOLS = localize('waterTools', {
  red: { id: 'red', name: 'Red de agua', price: 60, desc: 'Limpia hojas y basura flotante del estanque.' },
  cebo: { id: 'cebo', name: 'Cebo para koi', price: 25, stack: true, desc: 'Atrae a los koi a una zona: más XP brevemente.' },
  regadera: { id: 'regadera', name: 'Regadera mágica', price: 200, desc: 'Acelera el crecimiento de una planta acuática.' },
  escaneo: { id: 'escaneo', name: 'Escáner', price: 90, desc: 'Toca una planta o pez para ver sus stats y nivel.' },
  camara: { id: 'camara', name: 'Cámara', price: 150, desc: 'Haz una foto del estanque y guárdala en la galería.' },
});

// Reglas del estanque.
export const WATER_MAX_SIZE = 8;
export const WATER_BASE_SIZE = 4;
export const WATER_LEVEL_COST = (n) => 100 * 2 ** (n - WATER_BASE_SIZE); // monedas para subir nivel de agua
export const KOI_HUNGER_MS = 20 * 60_000; // hambre cada 20 minutos
export const KOI_FEED_XP = 10; // experiencia al alimentar
export const BOAT_WEAR_MAX = 5; // golpes antes de reparar
export const RACE_ENTRY_COST = 20; // monedas para entrar a una carrera
export const RACE_WIN_PRIZE = 60; // monedas por ganar

// Estado inicial del jardín de agua.
export const blankWaterGarden = () => ({
  size: WATER_BASE_SIZE,
  coins: 0,
  xp: 0,
  level: 1,
  waterTiles: {}, // { [key]: true } casillas que son agua
  plants: {}, // { [key]: { kind, t, g, wet, wt, cap, planted } }
  kois: [], // [{ id, kind, x, y, level, hungerT, xp, boughtT }]
  boats: [], // [{ id, kind, x, y, target, wear, boughtT }]
  tools: {},
  racesWon: 0,
  bestRaceTime: null,
  leaves: [], // hojas flotantes para limpiar con la red
  v: 1,
});

// Clave de casilla en el estanque (grid de agua).
export const waterCellKey = (r, c) => `r${r}c${c}`;
export const parseWaterKey = (k) => k.slice(1).split('c').map(Number);

// Todo el estanque es agua: cada casilla del grid puede ser agua o costa.
export const inWaterGrid = (z, r, c) => r >= 0 && c >= 0 && r < z.size && c < z.size;

// Si una casilla es agua.
export const isWater = (z, key) => !!z.waterTiles?.[key];

// Nivel del jardín según la experiencia.
export const waterLevelFor = (xp) => {
  let lvl = 1;
  while (xp >= lvl * 200) lvl += 1;
  return lvl;
};

// Experiencia necesaria para el siguiente nivel.
export const xpToNext = (level) => level * 200;

// ---------- Cría de koi ----------
// Dos koi del mismo tipo pueden reproducirse si el estanque tiene espacio y están bien alimentados.
// `breedCooldownMs`: tiempo entre crías. `breedCost`: monedas por cría. `breedSpaceKoi`: espacio mínimo.
export const KOI_BREED_COOLDOWN_MS = 60 * 60_000; // 1 hora entre crías
export const KOI_BREED_COST = 50; // monedas por intento de cría
export const KOI_BREED_SUCCESS_CHANCE = 0.35; // 35 % de éxito
export const KOI_BREED_MIN_SPACE = 4; // casillas de agua libres mínimas

// ---------- Galería de fotos del estanque ----------
// Cada foto guarda una instantánea del estanque con su fecha y los koi presentes.
export const GALLERY_MAX_PHOTOS = 24;
export const PHOTO_COST = 10; // monedas por foto

// ---------- Sonidos del jardín de agua ----------
export const WATER_SOUNDS = {
  ambient: 'assets/sfx/water-ambient.mp3',
  splash: 'assets/sfx/water-splash.mp3',
  feed: 'assets/sfx/water-feed.mp3',
  breed: 'assets/sfx/water-breed.mp3',
  camera: 'assets/sfx/water-camera.mp3',
  race: 'assets/sfx/water-race.mp3',
};
