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
  rest: { id: 'rest', name: 'Descanso', desc: 'Un respiro. Elige un beneficio.', icon: 'rest', kind: 'rest' },
  bag: { id: 'bag', name: 'Bolsa', desc: 'Una bolsa con un objeto.', icon: 'bag', kind: 'bag' },
  // Minigames: an interlude with its own rules. Winning pays a mutation or a piece and unlocks it in the menu.
  connect4: { id: 'connect4', name: 'Conecta 4', desc: 'Minijuego: alinea cuatro fichas antes que el bot. Premio: mutación o pieza.', icon: 'connect4', mini: true },
  bomber: { id: 'bomber', name: 'Bomberman', desc: 'Minijuego: limpia el tablero de enemigos con bombas. Premio: mutación o pieza.', icon: 'bomb', mini: true },
  barrier: { id: 'barrier', name: 'Barrera', desc: 'Minijuego: cruza el tablero antes que el bot; pon vallas para cortarle el paso. Premio: mutación o pieza.', icon: 'fence', mini: true },
  izombie: { id: 'izombie', name: 'Yo, Zombi', desc: 'Minijuego al revés: compra piezas carmesí y cruza una defensa marfil. Premio: mutación o pieza.', icon: 'skull', mini: true },
  bowling: { id: 'bowling', name: 'Bolos de nuez', desc: 'Minijuego: lanza fichas rodando y derriba a las piezas que avanzan. Premio: mutación o pieza.', icon: 'bowl', mini: true },
  laststand: { id: 'laststand', name: 'Última resistencia', desc: 'Minijuego: coloca tu defensa con un presupuesto y aguanta tres oleadas. Premio: mutación o pieza.', icon: 'shield', mini: true },
  mates: { id: 'mates', name: 'Mate en 1 y 2', desc: 'Minijuego: resuelve un mate en 1 y uno en 2 con piezas mutantes. Premio: mutación o pieza.', icon: 'target', mini: true },
  knight: { id: 'knight', name: 'Ruta del caballo', desc: 'Minijuego: pisa todas las casillas marcadas con el caballo; lo pisado se cierra. Premio: mutación o pieza.', icon: 'map', mini: true },
  queens: { id: 'queens', name: 'Ocho reinas', desc: 'Minijuego: coloca ocho reinas sin que se ataquen, en dos minutos. Premio: mutación o pieza.', icon: 'queen', mini: true },
  marcianos: { id: 'marcianos', name: 'Matamarcianos', desc: 'Minijuego: oleadas retro; dispara y aguanta tres oleadas con tres vidas. Premio: mutación o pieza.', icon: 'invader', mini: true },
};

// El minijefe reutiliza el modificador del jefe final: aquí se anuncia como lo que es y el mapa lo dibuja como rombo, sin duplicar datos.
export const nodeModifier = (node) => {
  const mod = MODIFIERS[node.modifier];
  return node.isMiniBoss ? { ...mod, name: 'Mini-jefe', desc: 'Un coloso menor con dos oficiales de movimientos prestados. Recompensa: mutación.' } : mod;
};
