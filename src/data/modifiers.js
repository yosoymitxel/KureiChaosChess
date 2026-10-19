export const MODIFIERS = {
  none: { id: 'none', name: 'Terreno llano', desc: 'Sin modificadores.', icon: 'plain' },
  // `weights`: cuánto sale en cada tramo de la torre (temprano, medio, tardío). Sin `weights` no sale
  // sola en el mapa (llano, jefe). Agregar una mecánica o un minijuego es agregar su entrada aquí.
  promote: { id: 'promote', name: 'Coronación', desc: 'Los peones que llegan al final se vuelven reinas.', icon: 'crown', weights: [3, 2, 1] },
  chaos: { id: 'chaos', name: 'Terreno inestable', desc: 'Cada 3 turnos se desploman casillas del borde.', icon: 'collapse', weights: [0, 1, 2] },
  rush: { id: 'rush', name: 'Prisa', desc: 'Cada jugador mueve dos veces por turno.', icon: 'rush', weights: [1, 2, 2] },
  fog: { id: 'fog', name: 'Niebla densa', desc: 'El tablero se oscurece lejos de tus piezas.', icon: 'fog', weights: [0, 1, 2] },
  ice: { id: 'ice', name: 'Lago helado', desc: 'Al acabar sobre hielo, la pieza resbala una casilla más.', icon: 'ice', weights: [2, 2, 1] },
  portal: { id: 'portal', name: 'Portales', desc: 'Una pieza que acaba en un portal sale por su gemelo, al otro lado.', icon: 'portal', weights: [0, 2, 2] },
  zombie: { id: 'zombie', name: 'Plaga zombi', desc: 'Los peones no se quedan muertos: el capturado se levanta como zombi del bando que lo derribó.', icon: 'skull', weights: [0, 1.5, 2] },
  elite: { id: 'elite', name: 'Élite', desc: 'Sus piezas clave siguen reglas de élite, marcadas en violeta. Recompensa: mutación.', icon: 'swords', weights: [0, 2, 3] },
  boss: { id: 'boss', name: 'El jefe', desc: 'Un coloso de varias casillas guarda el último piso.', icon: 'boss' },
  rest: { id: 'rest', name: 'Descanso', desc: 'Un respiro. Elige un beneficio.', icon: 'rest', kind: 'rest', weights: [3, 3, 2] },
  bag: { id: 'bag', name: 'Bolsa', desc: 'Una bolsa con un objeto.', icon: 'bag', kind: 'bag', weights: [3, 2, 2] },
  // Minigames: an interlude with its own rules. Winning pays a mutation or a piece and unlocks it in the menu.
  // Each one also needs its screen in MINI_SCREENS (src/ui/app.js); tools/check-registry.mjs checks it.
  connect4: { id: 'connect4', name: 'Conecta 4', desc: 'Minijuego: alinea cuatro fichas antes que el bot. Premio: mutación o pieza.', icon: 'connect4', mini: true, weights: [0.7, 1, 1] },
  bomber: { id: 'bomber', name: 'Bomberman', desc: 'Minijuego: limpia el tablero de enemigos con bombas. Premio: mutación o pieza.', icon: 'bomb', mini: true, weights: [0, 1, 1] },
  barrier: { id: 'barrier', name: 'Barrera', desc: 'Minijuego: cruza el tablero antes que el bot; pon vallas para cortarle el paso. Premio: mutación o pieza.', icon: 'fence', mini: true, weights: [0, 0.5, 1.5] },
  izombie: { id: 'izombie', name: 'Yo, Zombi', desc: 'Minijuego al revés: compra piezas carmesí y cruza una defensa marfil. Premio: mutación o pieza.', icon: 'skull', mini: true, weights: [0, 0.5, 1.5] },
  bowling: { id: 'bowling', name: 'Bolos de nuez', desc: 'Minijuego: lanza fichas rodando y derriba a las piezas que avanzan. Premio: mutación o pieza.', icon: 'bowl', mini: true, weights: [0.7, 1, 1] },
  laststand: { id: 'laststand', name: 'Última resistencia', desc: 'Minijuego: coloca tu defensa con un presupuesto y aguanta tres oleadas. Premio: mutación o pieza.', icon: 'shield', mini: true, weights: [0, 0.5, 1.5] },
  mates: { id: 'mates', name: 'Mate en 1 y 2', desc: 'Minijuego: resuelve un mate en 1 y uno en 2 con piezas mutantes. Premio: mutación o pieza.', icon: 'target', mini: true, weights: [0, 1, 1] },
  knight: { id: 'knight', name: 'Ruta del caballo', desc: 'Minijuego: pisa todas las casillas marcadas con el caballo; lo pisado se cierra. Premio: mutación o pieza.', icon: 'map', mini: true, weights: [0.7, 1, 1] },
  queens: { id: 'queens', name: 'Ocho reinas', desc: 'Minijuego: coloca ocho reinas sin que se ataquen, en dos minutos. Premio: mutación o pieza.', icon: 'queen', mini: true, weights: [0, 1, 1] },
  duel: { id: 'duel', name: 'Duelo', desc: 'Minijuego: combate por turnos con tres piezas por bando; cada tipo de movimiento vence a otro. Premio: mutación o pieza.', icon: 'swords', mini: true, weights: [0, 1, 1.2] },
  fusion: { id: 'fusion', name: 'Fusión', desc: 'Minijuego: el 2048 con piezas; junta dos iguales para subir de peón a la pieza meta. Premio: mutación o pieza.', icon: 'swap', mini: true, weights: [0.7, 1, 1] },
  checkers: { id: 'checkers', name: 'Damas', desc: 'Minijuego: damas de siempre contra el bot; la captura es obligatoria y los saltos se encadenan. Premio: mutación o pieza.', icon: 'checkers', mini: true, weights: [0.7, 1, 1] },
  marcianos: { id: 'marcianos', name: 'Matamarcianos', desc: 'Minijuego: oleadas retro; dispara y aguanta tres oleadas con tres vidas. Premio: mutación o pieza.', icon: 'invader', mini: true, weights: [0, 1, 1] },
};

// El minijefe reutiliza el modificador del jefe final: aquí se anuncia como lo que es y el mapa lo dibuja como rombo, sin duplicar datos.
export const nodeModifier = (node) => {
  const mod = MODIFIERS[node.modifier];
  return node.isMiniBoss ? { ...mod, name: 'Mini-jefe', desc: 'Un coloso menor con dos oficiales de movimientos prestados. Recompensa: mutación.' } : mod;
};
