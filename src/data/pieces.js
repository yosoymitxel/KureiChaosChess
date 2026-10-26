// Una entrada por pieza: nombre, cómo se llama su movimiento, valor para el bot y regla para
// las ayudas. Agregar una pieza es agregar su entrada aquí, su dibujo (src/view/piece-art.js)
// y su movimiento (src/game/rules.js); tools/check-registry.mjs avisa si falta alguno.
// El orden es el de las ayudas y la galería: primero las del ajedrez de siempre.
export const PIECES = {
  pawn: { name: 'Peón', move: 'peón', value: 10, rule: 'Avanza 1 (o 2 desde su fila inicial). Captura en diagonal hacia delante.' },
  rook: { name: 'Torre', move: 'torre', value: 50, rule: 'Se desliza en cruz hasta chocar.' },
  knight: { name: 'Caballo', move: 'caballo', value: 30, rule: 'Salta en L (2 y 1). Ignora lo que haya en medio.' },
  bishop: { name: 'Alfil', move: 'alfil', value: 30, rule: 'Se desliza en diagonal.' },
  queen: { name: 'Reina', move: 'reina', value: 90, rule: 'Torre + alfil.' },
  king: { name: 'Rey', move: 'rey', value: 1000, rule: '1 paso en cualquier dirección. Si cae, su bando queda eliminado.' },
  guard: { name: 'Guardia', move: 'guardia', value: 18, rule: 'Como el rey pero nunca retrocede: 1 paso adelante, a los lados o en diagonal hacia delante, o 2 en diagonal hacia delante si el paso está libre.' },
  advisor: { name: 'Consejero', move: 'consejero', value: 18, rule: '1 paso en diagonal.' },
  elephant: { name: 'Elefante', move: 'elefante', value: 22, rule: 'Salta 2 en diagonal.' },
  camel: { name: 'Camello', move: 'camello', value: 30, rule: 'Salta en L larga (3 y 1).' },
  cannon: { name: 'Cañón', move: 'cañón', value: 40, rule: 'Se mueve como torre, pero no captura deslizándose: mata saltando 1 pieza por medio. También salta 1 pieza propia y cae en el hueco justo detrás, así no queda encerrado.' },
};

// Patrones que no son una pieza propia: los prestan mutaciones y jefes.
const EXTRA_PATTERNS = { pawnBack: 'retroceso', rook2: 'torre corta', bishop2: 'alfil corto' };

export const PIECE_TYPES = Object.keys(PIECES);
// Piezas menores: las que la Plaga zombi levanta y el Contagio infecta (las mayores no caen en eso).
export const MINOR_TYPES = ['pawn', 'knight', 'bishop', 'guard', 'advisor', 'elephant'];
export const PIECE_NAMES = Object.fromEntries(PIECE_TYPES.map((t) => [t, PIECES[t].name]));
export const PIECE_VALUE = Object.fromEntries(PIECE_TYPES.map((t) => [t, PIECES[t].value]));
export const PIECE_RULES = PIECE_TYPES.map((t) => [t, PIECES[t].rule]);
// Names for movement patterns (a piece can borrow patterns from mutations / bosses).
export const MOVE_NAMES = { ...Object.fromEntries(PIECE_TYPES.map((t) => [t, PIECES[t].move])), ...EXTRA_PATTERNS };
