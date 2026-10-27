import { localize } from '../i18n/index.js';
export const MODIFIERS = localize('modifiers', {
  none: { id: 'none', name: 'Terreno llano', desc: 'Sin modificadores.', icon: 'plain' },
  // `weights`: cuánto sale en cada tramo de la torre (temprano, medio, tardío). Sin `weights` no sale
  // sola en el mapa (llano, jefe). Agregar una mecánica o un minijuego es agregar su entrada aquí.
  promote: { id: 'promote', name: 'Coronación', desc: 'Los peones que llegan al final se vuelven reinas.', icon: 'crown', weights: [3, 2, 1] },
  chaos: { id: 'chaos', name: 'Terreno inestable', desc: 'Cada 3 turnos se desploman casillas del borde.', icon: 'collapse', weights: [0, 1, 2] },
  rush: { id: 'rush', name: 'Prisa', desc: 'Cada jugador mueve dos veces por turno.', icon: 'rush', weights: [1, 2, 2] },
  fog: { id: 'fog', name: 'Niebla densa', desc: 'El tablero se oscurece lejos de tus piezas.', icon: 'fog', weights: [0, 1, 2] },
  ice: { id: 'ice', name: 'Lago helado', desc: 'Al acabar sobre hielo, la pieza resbala una casilla más.', icon: 'ice', weights: [2, 2, 1] },
  portal: { id: 'portal', name: 'Portales', desc: 'Una pieza que acaba en un portal sale por su gemelo, al otro lado.', icon: 'portal', weights: [0, 2, 2] },
  meteor: { id: 'meteor', name: 'Lluvia de meteoritos', desc: 'Cada pocos turnos se marca una cruz de casillas: al turno siguiente cae un meteorito, las hunde y se lleva lo que haya encima.', icon: 'meteor', weights: [0, 1, 1.5] },
  contagion: { id: 'contagion', name: 'Contagio', desc: 'Cada captura contagia de 2 a 3 piezas menores pegadas a la víctima: pasan al bando que capturó. Se juega con cuatro líneas de defensa.', icon: 'drop', weights: [0, 1, 1.5] },
  zombie: { id: 'zombie', name: 'Plaga zombi', desc: 'Las piezas menores (peón, caballo, alfil, guardia, consejero, elefante) no se quedan muertas: la capturada se levanta como zombi del bando que la derribó.', icon: 'skull', weights: [0, 1.5, 2] },
  coven: { id: 'coven', name: 'Aquelarre', desc: 'Cada rival esconde una bruja dormida (ojo verde). Si alguna de tus piezas puede tocarla, despierta (ojo rojo) y caza como casi una reina.', icon: 'target', weights: [0, 1, 1.5] },
  elite: { id: 'elite', name: 'Élite', desc: 'Sus piezas clave siguen reglas de élite, marcadas en violeta. Recompensa: mutación.', icon: 'swords', weights: [0, 2, 3] },
  boss: { id: 'boss', name: 'El jefe', desc: 'Un coloso de varias casillas guarda el último piso.', icon: 'boss' },
  rest: { id: 'rest', name: 'Descanso', desc: 'Un respiro. Elige un beneficio.', icon: 'rest', kind: 'rest', weights: [3, 3, 2] },
  bag: { id: 'bag', name: 'Bolsa', desc: 'Una bolsa con un objeto.', icon: 'bag', kind: 'bag', weights: [3, 2, 2] },
  // `duo`: se juega a dos en Partida local; `opt` es la opción que se elige antes (choices: [valor, rótulo]).
  // Minigames: an interlude with its own rules. Winning pays a mutation or a piece and unlocks it in the menu.
  // Each one also needs its screen in src/data/minigame-catalog.js; tools/check-registry.mjs checks it.
  bodyguard: { id: 'bodyguard', name: 'El guardaespaldas', desc: 'Minijuego: protege al rey marfil de una escuadra de caballos y peones durante varios turnos. Premio: mutación o pieza.', icon: 'guard', mini: true, weights: [0, 0.5, 1] },
  escape: { id: 'escape', name: 'Escape del tablero', desc: 'Minijuego: lleva el caballo a la salida antes de que el guardia cierre el paso. Premio: mutación o pieza.', icon: 'flag', mini: true, weights: [0.7, 1, 1] },
  caceria: { id: 'caceria', name: 'La cacería', desc: 'Minijuego: alcanza al peón fugitivo antes de que escape. Premio: mutación o pieza.', icon: 'hunt', mini: true, weights: [0.7, 1, 1] },
  giantHunt: { id: 'giantHunt', name: 'Caza de gigantes', desc: 'Minijuego: derriba al coloso con golpes de reina antes de agotar las jugadas. Premio: mutación o pieza.', icon: 'boss', mini: true, weights: [0, 0.7, 1] },
  minefield: { id: 'minefield', name: 'Campo minado', desc: 'Minijuego: cruza el campo con el caballo sin pisar minas. Premio: mutación o pieza.', icon: 'bomb', mini: true, weights: [0.7, 1, 1] },
  contraband: { id: 'contraband', name: 'Contrabando dimensional', desc: 'Minijuego: usa portales para llevar el caballo a la salida antes de agotar las jugadas. Premio: mutación o pieza.', icon: 'portal', mini: true, weights: [0, 0.7, 1] },
  laboratory: { id: 'laboratory', name: 'El laboratorio', desc: 'Minijuego: con una mutación de prueba, recoge muestras y cruza un tablero que se hunde. Premio: mutación o pieza.', icon: 'flask', mini: true, weights: [0, 0.7, 1] },
  collapsingFloor: { id: 'collapsingFloor', name: 'El suelo se acaba', desc: 'Minijuego: cruza con el caballo mientras las casillas se hunden tras cada salto. Premio: mutación o pieza.', icon: 'collapse', mini: true, weights: [0.7, 1, 1] },
  kingImpostor: { id: 'kingImpostor', name: 'El rey impostor', desc: 'Minijuego: entre varios reyes carmesí, captura al verdadero; los disfrazados se delatan al moverse. Premio: mutación o pieza.', icon: 'target', mini: true, weights: [0, 0.7, 1] },
  connect4: { id: 'connect4', name: 'Conecta 4', desc: 'Minijuego: alinea cuatro fichas antes que el bot. Premio: mutación o pieza.', icon: 'connect4', mini: true, duo: { desc: 'Por turnos: cada uno suelta su ficha.' }, weights: [0.7, 1, 1] },
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
  checkers: { id: 'checkers', name: 'Damas', desc: 'Minijuego: damas de siempre contra el bot; la captura es obligatoria y los saltos se encadenan. Premio: mutación o pieza.', icon: 'checkers', mini: true, duo: { desc: 'Por turnos, con captura obligatoria.', opt: 'diff', label: 'Tablero', choices: [['facil', '6×6'], ['normal', '8×8'], ['dificil', '10×10']] }, weights: [0.7, 1, 1] },
  marcianos: { id: 'marcianos', name: 'Matamarcianos', desc: 'Minijuego: oleadas retro; dispara y aguanta tres oleadas con tres vidas. Premio: mutación o pieza.', icon: 'invader', mini: true, weights: [0, 1, 1] },
  blizzard: { id: 'blizzard', name: 'Ventisca', desc: 'Minijuego: la torre resbala por un lago helado entre la ventisca; recoge las monedas y sal por la bandera sin hundirte. Premio: mutación o pieza.', icon: 'ice', mini: true, weights: [0, 1, 1] },
  outbreak: { id: 'outbreak', name: 'Brote', desc: 'Minijuego: con pocas dosis, contagia en cadena a todas las piezas: cada contagiada contagia a las que ataca. Premio: mutación o pieza.', icon: 'drop', mini: true, weights: [0, 1, 1.5] },
  clock: { id: 'clock', name: 'Contrarreloj', desc: 'Minijuego: llega a la casilla del reloj antes de que se agote, junta monedas y esquiva a las piezas que van apareciendo. Premio: mutación o pieza.', icon: 'rush', mini: true, weights: [0.5, 1, 1] },
  blind: { id: 'blind', name: 'Damas a ciegas', desc: 'Minijuego: coloca tus damas y elige hacia dónde dispara cada una; las rivales salen al azar y todas disparan a la vez. Premio: mutación o pieza.', icon: 'target', mini: true, weights: [0, 1, 1] },
  witch: { id: 'witch', name: 'La bruja', desc: 'Minijuego: laberinto a lo Pac-Man; recoge todas las monedas con tu rey mientras las brujas te persiguen, y usa las pócimas para asustarlas. Premio: mutación o pieza.', icon: 'target', mini: true, weights: [0, 1, 1] },
  hockey: { id: 'hockey', name: 'Hockey de mesa', desc: 'Minijuego: arrastra tu torre y mete el disco en la portería del bot; gana quien llegue a cinco goles. Premio: mutación o pieza.', icon: 'hockey', mini: true, duo: { desc: 'A la vez: cada uno mueve la torre de su mitad.', opt: 'goals', label: 'Goles para ganar', choices: [[3, '3'], [5, '5'], [7, '7']] }, weights: [0.7, 1, 1] },
});

// El minijefe reutiliza el modificador del jefe final: aquí se anuncia como lo que es y el mapa lo dibuja como rombo, sin duplicar datos.
export const nodeModifier = (node) => {
  const mod = MODIFIERS[node.modifier];
  return node.isMiniBoss ? { ...mod, name: 'Mini-jefe', desc: 'Un coloso menor con dos oficiales de movimientos prestados. Recompensa: mutación.' } : mod;
};
