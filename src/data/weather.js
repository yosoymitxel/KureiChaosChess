// Clima sobre el tablero (Ajustes › Efectos extra). Recetas de Sprite Fusion Pixel Art VFX (MIT).
// Algunas mecánicas traen su clima fijo; el resto de pisos tienen una probabilidad baja de clima
// al azar, repartida por `weight` (más alto, más común).
export const WEATHER = {
  rain: { id: 'rain', name: 'Lluvia', weight: 5 },
  leaves: { id: 'leaves', name: 'Hojas que caen', weight: 4 },
  fireflies: { id: 'fireflies', name: 'Luciérnagas', weight: 3 },
  fog: { id: 'fog', name: 'Niebla', weight: 2 },
  snow: { id: 'snow', name: 'Nieve', weight: 2 },
  bubbles: { id: 'bubbles', name: 'Burbujas', weight: 1 },
  embers: { id: 'embers', name: 'Brasas', weight: 0 }, // solo jefe final y meteoritos
};

// Mecánica o minijuego → su clima de siempre.
export const TIED_WEATHER = { ice: 'snow', blizzard: 'snow', fog: 'fog', zombie: 'fog', outbreak: 'fog', izombie: 'fog', meteor: 'embers' };

const CHANCE = 0.22; // pisos normales con clima

// `seed` fija el resultado por piso: volver a entrar no cambia el tiempo.
export function weatherFor({ modifier, isBoss, seed = Math.random() * 1e9 }) {
  if (isBoss) return 'embers';
  if (TIED_WEATHER[modifier]) return TIED_WEATHER[modifier];
  let r = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  if (r >= CHANCE) return null;
  const pool = Object.values(WEATHER).filter((w) => w.weight), total = pool.reduce((a, w) => a + w.weight, 0);
  r = (r / CHANCE) * total;
  for (const w of pool) if ((r -= w.weight) < 0) return w.id;
  return null;
}
