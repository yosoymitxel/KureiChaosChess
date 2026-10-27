import { mulberry32 } from '../core/rng.js';
import { localize } from '../i18n/index.js';

export const MUTATIONS = localize('mutations', {
  fury: { id: 'fury', name: 'Furia', icon: 'boot', desc: '+1 movimiento por turno que no captura (máx. 3).', stack: true, maxStack: 3, rarity: 'rare' },
  crown: { id: 'crown', name: 'Corona doble', icon: 'crown', desc: 'Tus peones coronan siempre en la última fila.', rarity: 'common' },
  knightBishop: { id: 'knightBishop', name: 'Caballo loco', icon: 'knight', desc: 'Tus caballos también se mueven como alfiles.', rarity: 'rare' },
  towerDiag: { id: 'towerDiag', name: 'Torre diagonal', icon: 'rook', desc: 'Tus torres también se mueven hasta 2 en diagonal.', rarity: 'common' },
  pawnBack: { id: 'pawnBack', name: 'Retroceso', icon: 'pawn', desc: 'Tus peones pueden retroceder 1.', rarity: 'common' },
  kingRook: { id: 'kingRook', name: 'Rey blindado', icon: 'king', desc: 'Tu rey puede moverse 2 en línea recta.', rarity: 'common' },
  guardKnight: { id: 'guardKnight', name: 'Guardia montado', icon: 'guard', desc: 'Tus guardias saltan como caballos.', rarity: 'rare' },
  cannonRange: { id: 'cannonRange', name: 'Artillería', icon: 'cannon', desc: 'Tus cañones saltan 2 piezas propias.', rarity: 'common' },
  queenKnight: { id: 'queenKnight', name: 'Reina estratega', icon: 'queenKnight', desc: 'Tu reina también salta como caballo.', rarity: 'epic' },
  bishopOrth: { id: 'bishopOrth', name: 'Alfil blindado', icon: 'bishop', desc: 'Tus alfiles también se mueven hasta 2 en línea recta.', rarity: 'common' },
});
const KEYS = Object.keys(MUTATIONS);

export const countMutations = (list) => list.reduce((c, m) => ((c[m] = (c[m] || 0) + 1), c), {});

export function pickMutationChoices(seed, owned) {
  const rng = mulberry32(seed);
  const pool = KEYS.filter((k) => {
    const n = owned.filter((x) => x === k).length;
    return MUTATIONS[k].stack ? n < MUTATIONS[k].maxStack : n === 0;
  });
  const picks = [];
  while (picks.length < 3 && pool.length) picks.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return picks;
}

export const EXTRA_MOVES = {
  knightBishop: ['knight', 'bishop'], towerDiag: ['rook', 'bishop2'], kingRook: ['king', 'rook2'],
  guardKnight: ['guard', 'knight'], queenKnight: ['queen', 'knight'], bishopOrth: ['bishop', 'rook2'],
  pawnBack: ['pawn', 'pawnBack'],
};

export function applyMutations(pieces, list, color) {
  if (!list?.length) return;
  const c = countMutations(list);
  for (const p of pieces) {
    if (p.color !== color) continue;
    if (p.type === 'pawn' && c.crown) p.canCrown = true;
    if (p.type === 'cannon' && c.cannonRange) p.cannonHops = 1;
    for (const [mut, [type, extra]] of Object.entries(EXTRA_MOVES)) {
      if (c[mut] && p.type === type) {
        p.extraMoveTypes = [...(p.extraMoveTypes || []), extra];
        p.mutationExtras = [...(p.mutationExtras || []), extra];
        p.mutationFrom = { ...(p.mutationFrom || {}), [extra]: mut };
      }
    }
  }
}
