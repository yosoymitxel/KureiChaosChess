// Coronar: el peón pasa a reina; el guardia gana atrás lo mismo que delante (paso recto y 2 en
// diagonal) y el consejero suma hasta 2 pasos en cruz. Solo una vez por pieza.
export const crownable = (p) => !p.royal && !p.boss && !p.crowned && ['pawn', 'guard', 'advisor'].includes(p.type) && (p.h || 1) === 1;

export function crown(p) {
  if (p.type === 'pawn') p.type = 'queen';
  else p.extraMoveTypes = [...(p.extraMoveTypes || []), p.type === 'guard' ? 'guardBack' : 'rook2'];
  p.crowned = true;
}
