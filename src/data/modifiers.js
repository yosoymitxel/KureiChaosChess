export const MODIFIERS = {
  none: { id: 'none', name: 'Terreno llano', desc: 'Sin modificadores.', icon: 'plain' },
  promote: { id: 'promote', name: 'Coronación', desc: 'Los peones que llegan al final se vuelven reinas.', icon: 'crown' },
  chaos: { id: 'chaos', name: 'Terreno inestable', desc: 'Cada 3 turnos se desploman casillas del borde.', icon: 'collapse' },
  rush: { id: 'rush', name: 'Prisa', desc: 'Cada jugador mueve dos veces por turno.', icon: 'rush' },
  fog: { id: 'fog', name: 'Niebla densa', desc: 'El tablero se oscurece lejos de tus piezas.', icon: 'fog' },
  ice: { id: 'ice', name: 'Lago helado', desc: 'Al acabar sobre hielo, la pieza resbala una casilla más.', icon: 'ice' },
  portal: { id: 'portal', name: 'Portales', desc: 'Una pieza que acaba en un portal sale por su gemelo, al otro lado.', icon: 'portal' },
  elite: { id: 'elite', name: 'Élite', desc: 'Su reina solo cae la última; sus torres solo tras su escolta. Recompensa: mutación.', icon: 'swords' },
  boss: { id: 'boss', name: 'El jefe', desc: 'Un coloso de varias casillas guarda el último piso.', icon: 'boss' },
  rest: { id: 'rest', name: 'Descanso', desc: 'Un respiro. Elige un beneficio.', icon: 'rest' },
  bag: { id: 'bag', name: 'Bolsa', desc: 'Una bolsa con un objeto.', icon: 'bag' },
};
