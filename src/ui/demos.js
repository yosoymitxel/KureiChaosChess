// Demos de movimiento: cómo se enseña una pieza, una mutación o un jefe (tablerito con su alcance,
// la pieza que salta a una casilla). Las arman la partida (al encontrarlos) y la galería (al tocarlos)
// desde aquí, con los datos de cada uno: una pieza, mutación o jefe nuevo trae su demo sin tocar nada.
import { PIECES } from '../data/pieces.js';
import { BOSSES } from '../data/bosses.js';
import { MUTATIONS, EXTRA_MOVES } from '../data/mutations.js';
import { reachPreview } from '../game/rules.js';
import { t } from '../i18n/index.js';

export const pieceDemo = (type, side = 'light') => ({
  title: PIECES[type].name, sub: PIECES[type].rule, piece: { type, side }, ...reachPreview({ type }),
});

// Las mutaciones que no cambian el movimiento (Furia, Corona doble…) se cuentan con su icono.
export function mutationDemo(id, side = 'light') {
  const m = MUTATIONS[id], ex = EXTRA_MOVES[id];
  if (!ex) return { cinematic: true, title: m.name, sub: m.desc, icon: m.icon };
  const { base, extra } = reachPreview({ type: ex[0], extra: [ex[1]] });
  return { title: m.name, sub: m.desc, piece: { type: ex[0], side }, base, extra };
}

// Margen para que se vea el recorrido entero; un 2×2 va en 8×8 para quedar centrado con el mismo
// margen a cada lado (en 9×9 sobraba una fila y una columna). El tablerito mide lo mismo.
export function bossDemo(id, side = 'dark') {
  const { name, desc, moves, size } = BOSSES[id];
  const n = size[0] === 2 && size[1] === 2 ? 8 : Math.max(7, size[0] + 6, size[1] + 6) | 1;
  return { title: t('demo.bossMoves', 'Así se mueve {name}', { name }), sub: desc, piece: { type: 'boss-' + id, side }, ...reachPreview({ moves, size }, n), n, tone: 'danger' };
}

export const playDemo = (moments, spec) => (spec.cinematic ? moments.cinematic(spec) : moments.demo(spec));
