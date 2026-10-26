# Referencia: qué hacen de verdad los juegos que tomamos de modelo

Complementa `REFERENCE-PVZ.md`. Fuentes al final; lo que no viene de una fuente es conocimiento
del juego y se marca *de memoria*.

## Gambonanza (Blukulélé, 2026)

Roguelike de ajedrez al estilo Balatro.

- **Gambitos**: hasta 5 equipados a la vez, como los comodines de Balatro; cambian las reglas lo
  justo para que cada partida se sienta distinta. Hay más de 150.
- **Losetas**: convierten una casilla del tablero en un tipo con efecto; cuestan gambitos y piezas.
- **Plantilla**: juntas piezas durante la run, esperan junto al tablero y entran cuando las llamas.
  Perder una pieza es para siempre.
- **Estructura**: 5 etapas de 5 niveles, cada una con su jefe. Se empieza en un 5×5 con 3 piezas y
  el tablero crece.
- **Preparación**: antes de cada combate ves la formación rival y colocas tus piezas a mano.
- **Lo que critican**: tiendas que dependen demasiado de la suerte, formaciones rivales que se
  repiten, partidas que se sienten iguales, animaciones que no se pueden saltar.

**Para Zugzwang**: los "gambitos" son nuestras mutaciones y modificadores; falta poder elegirlos.
Selector de mecánicas al empezar la run (ver abajo), colocación manual (la carta Organizar), y
evitar formaciones repetidas.

## Slay the Spire *de memoria*

- Mapa por actos (3 + final) con caminos que se cruzan: combate, élite (más duro, da reliquia),
  descanso (curar o mejorar carta), tienda, evento "?", tesoro, jefe al final de cada acto.
- Tras cada combate: elegir 1 de 3 cartas o ninguna; oro; a veces poción.
- Reliquias: efectos permanentes de toda la run. Las de jefe son las más fuertes y con coste.
- Intención del enemigo visible: sabes qué hará en su turno.
- Ascensiones: 20 niveles de dificultad que se desbloquean ganando y suman reglas en contra.
- Desbloqueos por personaje: cartas y reliquias nuevas al ganar experiencia de run, aunque pierdas.

**Para Zugzwang**: actos con jefe, élites que pagan mutación, eventos "?" que faltan, intención del
bot, y una escalera de dificultad desbloqueable (Ascensión) en vez de solo fácil/normal/difícil.

## Bomberman (clásico) *de memoria*

- Movimiento libre y en tiempo real por un laberinto de bloques fijos y cajas rompibles.
- Bomba con mecha de unos 3 s; explota en cruz; la llama se corta en bloques y rompe la primera caja.
- Objetos en las cajas: más bombas, más alcance (llama), velocidad, patada a la bomba, atravesar
  cajas, detonador a voluntad.
- Enemigos con patrones propios (globos lentos al azar, otros que persiguen, otros que atraviesan
  paredes) y una puerta de salida bajo una caja que se abre al limpiar el nivel.
- Reacciones en cadena: una llama enciende otras bombas.
- Animación constante: el personaje camina, la bomba palpita, la llama se extiende por segmentos,
  las cajas se deshacen, los enemigos mueren con una animación.

**Para Zugzwang**: el nuestro es por turnos; mantenerlo pero con más objetos (patada, velocidad),
enemigos con patrón propio por tipo de pieza, puerta de salida y animación en cada acción.

## Chess Mayhem (Bites Studio, tráiler)

No hay ficha pública; esto es lo que muestra el tráiler según lo describe el dueño.

- Pixel art con mucha animación: aquí nos gana de lejos.
- 11 modos: Bomb Chess (las piezas explotan), Gravity Chess (las piezas caen), Zombie Chess (los
  peones caídos vuelven como zombis), Card Chess (cartas de poder), Micro e Infinite Chess (tamaños
  extremos), Chaos Chess (lluvia de meteoritos sobre casillas).
- 22 ejércitos con estética propia.
- Modo RPG "Chessverse" con combate por turnos (Atacar, Magia, Huir) y jefes como "La Cabra".

Capturas del tráiler (20/10), lo que se ve en cada modo:

- **Bomb Chess** ("Todo explota"): bombas negras redondas con mecha encendida ocupan casillas; al
  estallar dejan una nube circular tramada (dither) de 3×3 casillas y escombros naranjas que salen
  disparados; las piezas cercanas salen volando del tablero.
- **Gravity Chess** ("La gravedad también juega"): tablero violeta espacial, flechas verdes a los
  lados indican la dirección; todas las piezas caen hasta apilarse en el borde.
- **Zombie Chess** ("Los peones no se quedan muertos"): tablero verde; el peón capturado vuelve
  como zombi verde del bando contrario, con partículas verdes al levantarse. Los zombis son piezas
  verdes, no un tinte: el color dice el bando.
- **Chaos Chess** ("Llueven meteoritos"): un círculo blanco marca la zona antes del impacto; tras
  caer quedan llamas en casillas; las piezas golpeadas salen despedidas fuera del tablero.
- Común a todos: piezas píxel con personaje (mago, rey con corona, caballero), cada modo con su
  color de tablero y un rótulo grande en píxel arriba, y una frase corta abajo.

**Para Zugzwang**: lo que ya tenemos en común (cartas, derrumbes, tableros raros) hay que
**animarlo** al mismo nivel. Modos que encajan con lo existente: bomba (al capturar explota en
cruz), gravedad (el tablero se inclina), zombi (el peón capturado vuelve una vez), meteoritos
(evolución del derrumbe con aviso previo). Ejércitos con estética propia encajan con la
personalización y la galería.

## Propuestas que salen de aquí

1. **Selector de mecánicas al empezar la run** (Gambonanza): elegir qué modificadores salen más
   (portal, niebla, hielo, derrumbe…), hasta 3 favoritos con peso alto, y uno vetado.
2. **Hordas finales** en los minijuegos tipo PvZ: el último tramo trae una oleada grande anunciada
   ("¡Llega una gran horda!") con su banderín; la partida no termina de golpe al llegar al número.
3. **Logros de mitad y final de run**, no solo de inicio (piso 5, élite sin perder piezas, jefe sin
   cartas, run completa, todas las mutaciones de un tipo…).
4. **Modos de juego** por grupos de mecánicas (Caos, Hielo y portales, Bombas, Zombi) como
   variantes de run.

## Fuentes

- [Gambonanza Wiki](https://gambonanza.fandom.com/wiki/Gambonanza_Wiki): piezas, jefes, objetos y desbloqueables, para inspirarse.
- [Pocket Gamer: Gambonanza review](https://www.pocketgamer.com/gambonanza/review/)
- [Destructoid: Gambonanza review](https://www.destructoid.com/reviews/gambonanza-review/)
- [Boiling Steam: Gambonanza review](https://boilingsteam.com/gambonanza-review/)
- [Checkpoint Gaming: Gambonanza review](https://checkpointgaming.net/reviews/2026/05/gambonanza-review-checkmate/)
- Tráiler de Chess Mayhem: https://www.youtube.com/watch?v=ZoL8NLeReZQ (descrito por el dueño)


## Minijuegos nuevos de persecución y escolta

### La cacería

El movimiento del cazador reutiliza `src/game/rules.js` (`legalMoves`) y las siluetas de `src/view/piece-art.js`; el tablero y los estados visuales reutilizan `MiniGrid` y la animación `hopPiece`. El peón fugitivo juega con las reglas de `rules.js` (baja, dobla desde su fila, come en diagonal y corona); cada partida sale de un solucionador que garantiza la caza y fija un par de saltos según dificultad.

### Escape del tablero

La huida reutiliza `src/game/rules.js` para los saltos del caballo y `MiniGrid`/`hopPiece` para tablero y animación; solo añade la condición de salida y el avance del guardia.

### El guardaespaldas

Reutiliza los movimientos legales de `src/game/rules.js`, las piezas existentes y `MiniGrid`/`hopPiece`; cada partida sortea escolta, escuadra rival y casillas caídas; el rival mueve una pieza por turno buscando el mate (cuenta las respuestas que salvan al rey) y en Difícil entra un refuerzo.


### Caza de gigantes

Reutiliza `rules.js` para movimientos y golpes contra una pieza de huella 2×2; el coloso comparte la lógica de piezas grandes y puntos de vida de `bosses.js`. El jefe se pinta en una capa propia del tamaño de su huella. Jefe y escombros salen al azar; cada golpe provoca una embestida en línea hacia la reina y a media vida entra en furia (dos pasos).

### Campo minado

Reutiliza el caballo, sus saltos legales y `MiniGrid`. El mapa de minas se mantiene como estado del minijuego; no crea una segunda lógica de movimiento. Cada partida traza una ruta segura al azar; la dificultad sube minas y baja lo que se destapa al aterrizar. La sonda mira una casilla sin gastar jugada.

### Contrabando dimensional

Reutiliza los saltos del caballo y la representación de portales `board.portals` que ya consume `Match.terrainAfterMove`; la regla específica es alcanzar la salida dentro del límite.

### El laboratorio

Reutiliza `applyMutations` y el movimiento legal de `rules.js`; el tablero usa los mismos huecos que el resto del juego. El reto nuevo es escapar antes de que el suelo consumido cierre la ruta.

### El suelo se acaba

Reutiliza el caballo y `legalMoves`; cada casilla abandonada se agrega al conjunto de huecos, siguiendo la idea del derrumbe ya existente.

### El rey impostor

Deducción sobre `rules.js`: la pista es una casilla que el impostor amenaza (destinos legales; el peón, sus diagonales). Las rondas se generan para que la primera pista apunte a varios y todas juntas a uno solo.

### El laboratorio

Reutiliza `applyMutations` y el movimiento legal de `rules.js`; el tablero usa los mismos huecos que el resto del juego. El reto es escapar antes de que el suelo consumido cierre la ruta.

### El suelo se acaba

Reutiliza el caballo y `legalMoves`; cada casilla abandonada se agrega al conjunto de huecos, siguiendo la idea del derrumbe ya existente.

### El rey impostor

Deducción sobre `rules.js`: la pista es una casilla que el impostor amenaza (destinos legales; el peón, sus diagonales). Las rondas se generan para que la primera pista apunte a varios y todas juntas a uno solo.

## NES llevados al tablero (minijuegos distintos de su mecánica)
- **Pac-Man** (Namco) → *La bruja*: laberinto, monedas, brujas que persiguen paso a paso, pócimas que las asustan (`src/game/witch.js`).
- **Dr. Mario** (Nintendo) → *Brote*: limpiar todo con pocas dosis; el contagio sigue el ataque de cada pieza (`src/game/outbreak.js`).
- **Kickle Cubicle** (Irem) y las cuevas de hielo → *Ventisca*: resbalar hasta chocar, niebla, monedas y salida (`src/game/blizzard.js`).
- **Battleship** (versiones NES) → *Damas a ciegas*: colocar y apuntar a ciegas, descarga simultánea (`src/game/blind.js`).
