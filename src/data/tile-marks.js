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
  gem: { icon: 'gem', color: 'oklch(0.62 0.13 200)', role: 'collect' },
  goldgem: { icon: 'gem', color: 'var(--brass)', role: 'collect' },
  star: { icon: 'shield', color: 'oklch(0.7 0.14 85)', role: 'collect' },
  rush: { icon: 'rush', color: 'oklch(0.66 0.16 55)', role: 'collect' },
  ice: { icon: 'ice', color: 'oklch(0.7 0.09 230)', role: 'collect' },
  portal: { icon: 'portal', color: 'oklch(0.55 0.16 300)', role: 'collect' },
  bomb: { icon: 'bomb', color: 'var(--danger)', role: 'collect' },
  spike: { icon: 'skull', color: 'var(--danger)', role: 'collect' },
};
