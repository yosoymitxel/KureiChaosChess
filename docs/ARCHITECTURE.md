# Arquitectura

Sin bundler: `index.html` carga módulos ES nativos y un *import map* resuelve las dependencias
desde jsDelivr. Para desarrollar basta un servidor estático.

```
index.html            import map + fuentes + hojas de estilo
lab.html              laboratorio de animaciones (escenas aisladas)
css/
  tokens.css          diseño: color OKLCH, tipografía, radios, grano
  base.css            reset, botones, paneles, cartas, overlays
  board.css           mesa 3D: plano inclinado, casillas con grosor, standees
  screens.css         menú, mapa, preparación, recompensas, HUD, laboratorio
src/
  core/               utilidades puras (PRNG con semilla, emisor)
  data/               contenido: piezas, jefes, modificadores, mutaciones, temas
  game/               reglas y estado, sin DOM
    rules.js          movimiento con soporte multi-casilla
    generate.js       mapa de la run, forma del tablero, ejércitos, jefes
    match.js          turnos, capturas, vidas, derrumbes, fin de partida, bot
    run.js            guardado (localStorage) y progreso de la run
  view/               render, sin reglas
    board-view.js     tablero 3D (DOM + CSS transforms) + coreografía con anime.js
    piece-art.js      siluetas SVG coloreadas por CSS vars
    fx.js             partículas en canvas 2D superpuesto
  ui/                 Preact + htm
    app.js            enrutado de pantallas y progreso de la run
    components.js     topbar, cartas con tilt, banner de turno, toggle
    screens/          menú, mapa, preparación/ajustes, partida, overlays
legacy/index.v1.4.html  el monolito original, como referencia
```

## Flujo de una jugada

```
pointer → BoardView.onTap/onDrop → GameScreen (director)
        → Match.move(piece, anchor)        // muta estado, devuelve "result"
        → await BoardView.playMove(result) // anima ese result
        → Match.afterMove()                // turno, derrumbe, fin
        → await BoardView.collapse(cells)  // si toca
        → siguiente turno (bot: botChooseMove)
```

`Match` nunca espera a la vista y `BoardView` nunca decide reglas. Por eso la lógica se puede
probar en Node simulando partidas bot contra bot.

## Piezas de varias casillas (jefes)

- Cada pieza tiene un ancla (`row`, `col` = esquina superior izquierda) y un tamaño `h × w`
  (1×1 por defecto). Los jefes se definen en `src/data/bosses.js` con `size`, `hp` y `moves`.
- Un movimiento desplaza el ancla. La huella de destino debe estar dentro del tablero, sin
  agujeros ni aliados. Los enemigos dentro de la huella son golpeados (aplastados).
- Las piezas que se deslizan (torre, alfil…) necesitan que **toda la huella** quede libre en
  cada paso intermedio.
- Cada golpe resta 1 vida. Si la víctima sobrevive, el atacante rebota a su casilla. El último
  golpe la elimina y el atacante ocupa su sitio.
- `royal: true` marca la pieza cuya caída elimina al bando (reyes y jefes).
- Para el jugador, al tocar cualquier casilla de la huella se elige el ancla legal más cercana
  (`anchorForCell`), así que mover un 2×2 es tan directo como mover un peón.

Añadir un jefe nuevo = una entrada en `BOSSES`. Por ejemplo, un 1×3 que se mueve como alfil:
`{ id: 'serpent', name: 'Sierpe', size: [1, 3], hp: 2, moves: ['bishop'], art: 'bishop', desc: '…' }`.

## Coreografía (anime.js)

`BoardView` guarda por pieza un objeto `{ r, c, z }` y lo anima. Cada fotograma vuelca esos
números a `--r`, `--c`, `--z`, y el CSS los traduce a `translate3d`. Ventajas: un solo sistema
para posición, altura del salto y sombra (la sombra lee `--z` para encogerse y aclararse).

- Arco del salto: `z: [0, arco, 0]` con keyframes. Los saltadores (caballo, camello, elefante)
  arquean más; los jefes caen con temblor de cámara y onda expansiva.
- *Squash & stretch* al aterrizar sobre `.pc-fig` (el contenedor animable; la inclinación
  frente a cámara vive en `.pc-stand` para no pisarse con los transforms de anime).
- Velocidad global y `prefers-reduced-motion` pasan por `BoardView.d(ms)`.

## Laboratorio

`lab.html?scene=Golpe%20al%20jefe` monta una escena mínima con `BoardView` + `Match` y la
reproduce. Para iterar una animación: editar `board-view.js`, recargar el laboratorio.
