// Coleccionables del tablero: de uno en uno a lo largo del piso (nunca al empezar), en la tierra de
// nadie, cada PICKUPS_EVERY turnos tuyos y como mucho PICKUPS_MAX a la vez. Los recoge la primera pieza tuya que se pare encima; si llega antes una rival,
// se lo lleva. Los de `hand` (las hojas) no los pisa nadie: se quitan con un toque, como en el jardín.
// Agregar uno es agregar su entrada aquí y su dibujo en src/ui/zen-art.js (PICKUP_ART) o un icono con su mismo id; tools/check-registry.mjs lo comprueba.
//
// Efecto propio: `effect({ match, piece, view, log })` corre al recogerlo (piece es tu pieza; en los de
// `hand`, ninguna). Con eso basta para algo nuevo, p. ej. un dulce que da un paso más este turno:
//   effect: ({ match }) => { match.turnBonus += 1; }
// Los minijuegos de tablero ponen sus marcas de casilla con src/data/tile-marks.js.
import { localize } from '../i18n/index.js';
export const PICKUPS = localize('pickups', {
  coin: { id: 'coin', name: 'Moneda', weight: 5, coins: 2 },
  leaf: { id: 'leaf', name: 'Hoja de arce', weight: 4, coins: 1, hand: true },
  seed: { id: 'seed', name: 'Semilla', weight: 1, seed: 1 },
  // Visita del jardín: se toca como la hoja y deja 2 monedas o una semilla; se va sola a los `stay` turnos tuyos.
  butterfly: { id: 'butterfly', name: 'Mariposa', weight: 1, hand: true, gift: true, stay: 3 },
});
export const PICKUPS_PER_BOARD = [1, 1];
export const PICKUPS_EVERY = 3;
export const PICKUPS_MAX = 2;

// Casillas vacías entre las dos zonas de despliegue, sin terreno especial.
export function dropPickups(board, pieces, rng = Math.random) {
  const { rows, cols, holes, protectRows: safe = 2, terrain } = board;
  const free = [];
  for (let r = safe; r < rows - safe; r++) for (let c = 0; c < cols; c++) {
    const k = `${r},${c}`;
    if (!holes.has(k) && !terrain?.has(k) && !pieces.some((p) => p.row === r && p.col === c)) free.push([r, c]);
  }
  const [lo, hi] = PICKUPS_PER_BOARD, n = Math.min(free.length, lo + Math.floor(rng() * (hi - lo + 1)));
  const pool = Object.values(PICKUPS), total = pool.reduce((a, p) => a + p.weight, 0);
  const pick = () => { let x = rng() * total; return pool.find((p) => (x -= p.weight) < 0) || pool[0]; };
  return Array.from({ length: n }, () => {
    const [row, col] = free.splice(Math.floor(rng() * free.length), 1)[0];
    return { id: pick().id, row, col };
  });
}
