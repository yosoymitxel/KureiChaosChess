// Filtros de pantalla: una capa fija con backdrop-filter encima de todo (GPU, sin tocar el
// tablero ni los sprites). El juego es DOM/SVG, no canvas, así que los shaders WebGL no aplican.
// El CSS de cada uno vive en css/base.css bajo html[data-filter="<id>"].
export const FILTERS = [
  { id: 'off', name: 'Original', desc: 'Sin filtro' },
  { id: 'crt', name: 'CRT', desc: 'Líneas y viñeta de tubo, colores intactos' },
  { id: 'vhs', name: 'VHS', desc: 'Cinta gastada: color corrido y suave' },
  { id: 'green', name: 'Fósforo', desc: 'Monitor verde de terminal' },
  { id: 'amber', name: 'Ámbar', desc: 'Monitor ámbar' },
  { id: 'gray', name: 'Grises', desc: 'Blanco y negro' },
  { id: 'sepia', name: 'Sepia', desc: 'Foto antigua' },
  { id: 'cine', name: 'Cine', desc: 'Contraste y viñeta marcada' },
  { id: 'night', name: 'Noche', desc: 'Más oscuro y frío' },
  { id: 'pop', name: 'Vivo', desc: 'Colores saturados' },
];
