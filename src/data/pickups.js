// Coleccionables del tablero: tras el primer «Tu turno» de un piso de la travesía caen unos pocos en
// la tierra de nadie. Los recoge la primera pieza tuya que se pare encima; si llega antes una rival,
// se lo lleva. Agregar uno es agregar su entrada aquí y su dibujo en src/ui/zen-art.js (PICKUP_ART)
// o un icono con su mismo id; tools/check-registry.mjs lo comprueba.
export const PICKUPS = {
  coin: { id: 'coin', name: 'Moneda', weight: 5, coins: 2 },
  leaf: { id: 'leaf', name: 'Hoja de arce', weight: 3, coins: 1 },
  seed: { id: 'seed', name: 'Semilla', weight: 1, seed: 1 },
};
export const PICKUPS_PER_BOARD = [1, 3];

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
