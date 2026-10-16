export const PIECE_TYPES = ['pawn', 'guard', 'advisor', 'elephant', 'camel', 'cannon', 'rook', 'knight', 'bishop', 'queen', 'king'];

export const PIECE_NAMES = {
  pawn: 'Peón', guard: 'Guardia', advisor: 'Consejero', elephant: 'Elefante', camel: 'Camello',
  cannon: 'Cañón', rook: 'Torre', knight: 'Caballo', bishop: 'Alfil', queen: 'Reina', king: 'Rey',
};

// Names for movement patterns (a piece can borrow patterns from mutations / bosses).
export const MOVE_NAMES = {
  pawn: 'peón', pawnBack: 'retroceso', guard: 'guardia', advisor: 'consejero', elephant: 'elefante',
  camel: 'camello', cannon: 'cañón', rook: 'torre', rook2: 'torre corta', knight: 'caballo',
  bishop: 'alfil', queen: 'reina', king: 'rey',
};

export const PIECE_VALUE = {
  pawn: 10, guard: 18, advisor: 18, elephant: 22, camel: 30, cannon: 40,
  knight: 30, bishop: 30, rook: 50, queen: 90, king: 1000,
};

export const PIECE_RULES = [
  ['pawn', 'Avanza 1 (o 2 desde su fila inicial). Captura en diagonal hacia delante.'],
  ['rook', 'Se desliza en cruz hasta chocar.'],
  ['knight', 'Salta en L (2 y 1). Ignora lo que haya en medio.'],
  ['bishop', 'Se desliza en diagonal.'],
  ['queen', 'Torre + alfil.'],
  ['king', '1 paso en cualquier dirección. Si cae, su bando queda eliminado.'],
  ['guard', '1 paso adelante, lateral o diagonal, o 2 en diagonal si el paso está libre. Nunca retrocede recto.'],
  ['advisor', '1 paso en diagonal.'],
  ['elephant', 'Salta 2 en diagonal.'],
  ['camel', 'Salta en L larga (3 y 1).'],
  ['cannon', 'Como torre con alcance 4, pero no captura deslizándose: mata saltando 1 pieza por medio. También salta 1 pieza propia y cae en el hueco justo detrás.'],
];
