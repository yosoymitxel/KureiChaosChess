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
  // Minigames: an interlude with its own rules. Winning pays a mutation or a piece and unlocks it in the menu.
  connect4: { id: 'connect4', name: 'Conecta 4', desc: 'Minijuego: alinea cuatro fichas antes que el bot. Premio: mutación o pieza.', icon: 'connect4', mini: true },
  bomber: { id: 'bomber', name: 'Bomberman', desc: 'Minijuego: limpia el tablero de enemigos con bombas. Premio: mutación o pieza.', icon: 'collapse', mini: true },
  barrier: { id: 'barrier', name: 'Barrera', desc: 'Minijuego: cruza el tablero antes que el bot; pon vallas para cortarle el paso. Premio: mutación o pieza.', icon: 'lock', mini: true },
  izombie: { id: 'izombie', name: 'Yo, Zombi', desc: 'Minijuego al revés: compra piezas carmesí y cruza una defensa marfil. Premio: mutación o pieza.', icon: 'skull', mini: true },
};
