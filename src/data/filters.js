// Filtros de pantalla: una capa fija con backdrop-filter encima de todo (GPU, sin tocar el
// tablero ni los sprites). El juego es DOM/SVG, no canvas, así que los shaders WebGL no aplican.
// El CSS de cada uno vive en css/base.css bajo html[data-filter="<id>"].
export const FILTERS = [
  { id: 'off', name: 'Original' },
  { id: 'crt', name: 'CRT' },
  { id: 'green', name: 'Fósforo' },
  { id: 'amber', name: 'Ámbar' },
  { id: 'gray', name: 'Grises' },
  { id: 'cine', name: 'Cine' },
];
