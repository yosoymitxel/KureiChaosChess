// Marcas de casilla de los minijuegos de tablero: lo que se recoge al pisarlo o la meta a la que se
// llega. Los minijuegos las piden por clave (`labels`: casilla -> 'icon:<clave>'); BoardView las pinta
// con su icono (vector o píxel según la mesa), su color y su tamaño. Agregar una es agregar su entrada
// aquí (icono de src/ui/icons.js); tools/check-registry.mjs comprueba que toda marca usada exista.
// `size`: lado del icono en casillas (el punto de jugada mide 0.28). `role`: 'collect' se recoge
// al pisarla; 'goal' es el sitio al que llegar.
export const MARK_SIZE = 0.62;
export const TILE_MARKS = {
  coin: { icon: 'coin', color: 'var(--brass)', role: 'collect' },
  flask: { icon: 'flask', color: 'oklch(0.5 0.15 160)', role: 'collect' },
  trophy: { icon: 'trophy', color: 'var(--brass)', role: 'goal' },
  target: { icon: 'target', color: 'var(--accent)', role: 'goal' },
  flag: { icon: 'flag', color: 'var(--ink)', role: 'goal' },
};
