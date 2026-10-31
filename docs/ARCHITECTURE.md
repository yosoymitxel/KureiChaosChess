# Arquitectura

Sin bundler: `index.html` carga módulos ES nativos y un *import map* resuelve las dependencias
desde `vendor/`. Las librerías y la fuente se sirven desde el mismo origen; para desarrollar basta un servidor estático.

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
    shop.js           monedero del jardín: cartas compradas y mesas a la venta
    zen.js            jardín: macetas, semillas, herramientas y terreno
  view/               render, sin reglas
    board-view.js     tablero 3D (DOM + CSS transforms) + coreografía con anime.js
    piece-art.js      siluetas SVG coloreadas por CSS vars
    fx.js             partículas en canvas 2D superpuesto
  ui/                 Preact + htm
    app.js            enrutado de pantallas y progreso de la run
    components.js     topbar, cartas con tilt, banner de turno, toggle
    screens/          menú, mapa, preparación/ajustes, partida, tienda, overlays
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

Jefes disponibles (`src/data/bosses.js`): Titán 2×2, Ariete 2×2, Hidra 2×2, Gólem 3×3, Jinete 2×1,
Muralla 1×2 y Devorador 2×2. Cuanto más grande, más simple su movimiento. El Devorador tiene
`absorb`: cada pieza que aplasta le enseña su patrón de movimiento (hasta 4), y se anuncia
con el rótulo "¡Aprende!".

## Piezas protegidas (élite)

`rules.js → immune(p, pieces)` decide si una pieza puede ser golpeada ahora:

- `trait: 'last'`: solo cae cuando es la última pieza no real de su bando.
- `escort: <id>`: no cae mientras viva la pieza que la escolta.

`landing()` trata a las piezas inmunes como casillas bloqueadas, así que ni el jugador ni el bot
pueden atacarlas. En el tablero llevan una insignia (candado o estandarte) y una cuerda une
escolta y protegida; el inspector lo explica en una línea.

## Terreno

`board.terrain` (Map `"r,c" → 'ice' | 'portal'`) y `board.portals` (pares). Se resuelve en
`Match.terrainAfterMove` después de aterrizar: el hielo hace resbalar una casilla más en la
misma dirección y el portal teletransporta al gemelo si está libre. Solo afecta a piezas 1×1.

## Cartas tácticas

`src/game/cards.js` define cada carta con `target` (`piece`, `tile` o `none`), `can()` (a qué
se puede aplicar, para que no haya usos rotos) y `apply()`. `previewMoves()` aplica la carta a
una copia para enseñar al jugador el resultado antes de jugarla. Reglas: una carta por turno,
no gasta movimiento, se consume. La mano vive en `run.cards` (máximo 5); las compradas en la
tienda forman el tramo final (`run.shopCount`) y llevan marca de moneda.

Ritmo de recompensas (Slay the Spire): victoria normal → elegir 1 de 3 cartas; élite →
mutación; descanso → mutación u objeto; bolsa → objeto o mazo de dos cartas.

## Coreografía (anime.js)

`BoardView` guarda por pieza un objeto `{ r, c, z }` y lo anima. Cada fotograma vuelca esos
números a `--r`, `--c`, `--z`, y el CSS los traduce a `translate3d`. Ventajas: un solo sistema
para posición, altura del salto y sombra (la sombra lee `--z` para encogerse y aclararse).

- Arco del salto: `z: [0, arco, 0]` con keyframes. Los saltadores (caballo, camello, elefante)
  arquean más; los jefes caen con temblor de cámara y onda expansiva.
- *Squash & stretch* al aterrizar sobre `.pc-fig` (el contenedor animable; la inclinación
  frente a cámara vive en `.pc-stand` para no pisarse con los transforms de anime).
- Base líquida (`BoardView.liquid`): un `<svg class="goo">` en el plano del tablero, con una
  unidad por casilla. Cabeza, cola y cuello (polilínea por el recorrido) pasan por un filtro
  *goo* (desenfoque + umbral de alfa) y dos erosiones que redibujan contorno y canto de la ficha.
  La cabeza llega al destino, la pieza despega y la cola la sigue al mismo ritmo.
- Velocidad global y `prefers-reduced-motion` pasan por `BoardView.d(ms)`.

## Laboratorio

`lab.html?scene=Golpe%20al%20jefe` monta una escena mínima con `BoardView` + `Match` y la
reproduce. Para iterar una animación: editar `board-view.js`, recargar el laboratorio.
