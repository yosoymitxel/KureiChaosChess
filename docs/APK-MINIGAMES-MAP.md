# Inventario e integración aislada de Chess Mayhem (APK)

Fuente primaria examinada: `assets/public/game-source.js` dentro de `kureichess-apk-extracted-source.zip`. El monolito no se copia al repositorio ni se importa en ejecución. Las recreaciones se mantienen aisladas del motor principal.

## Catálogo del laboratorio

Se preservan las 20 entradas iniciales y se indexan las 15 modalidades que faltaban:
- Variantes nuevas: Boss Chess 2.0, Horde Mode, Random Army, Giant Board y Rey Patata Caliente.
- Modos de fiesta: Todos son dama, Todos son peón, Caballo, Ajedrez relámpago, Ajedrez invisible, Ajedrez borracho, Ajedrez gallina, Ajedrez balacera y Ajedrez al revés.
- Registro separado: Ajedrez de 4 jugadores (p4).

También se registran 22 modificadores, 6 recetas, 12 eventos de Chaos 2.0 y las 24 cartas/mejoras de Horde Mode.

## Tabla de correspondencia y alcance

| Entrada | Implementación de laboratorio | Límite explícito |
|---|---|---|
| Rey Patata Caliente | Partida contra IA. Cada cinco turnos selecciona portadores seguros y transfiere el estado `royal`; la ficha coronada conserva su movimiento. | Es una versión de laboratorio con el motor común, no una copia exacta de todas las reglas internas del APK. |
| Chaos Chess 2.0 | Partida contra IA con movimientos prestados, derrumbe de bordes y aparición de huecos. | Los poderes concretos están reducidos a un conjunto pequeño y legible; no reproduce los 12 eventos completos de Chaos 2.0. |
| Boss Chess 2.0 | Partida contra jefe 2×2 con 18 HP, minions y ataques anunciados por fila/columna/cruz/3×3 que se resuelven tras un turno. | IA y patrones simplificados; el jefe usa movimiento de dama y el HP/capturas del motor común. |
| Horde Mode | Borrador de tres piezas y cinco oleadas con IA, minijefe final, elección de una mejora y derrota al perder el rey. | MVP de cinco oleadas; 24 cartas registradas, pero solo las mejoras compatibles con el motor común aplican efectos mecánicos completos. |
| Random Army | Sorteo ponderado de 39 puntos + rey, mismo ejército o dos sorteos; partida contra IA con movimientos legales y victoria/derrota | La IA usa el perfil oficial de Kure’i; no se importan compras ni progreso |
| Giant Board | Tablero 12×12 jugable contra IA, dos filas de peones y las cuatro piezas especiales con movimientos legales: arzobispo, canciller, camello y cañón | El arte de arzobispo/canciller reutiliza alfil/torre con insignia; jaque/mate usan el motor común |
| Party modes | Todos son dama, todos son peón, Caballo, Ajedrez relámpago, invisible, borracho, gallina, balacera y antiajedrez son partidas contra IA con sus reglas clave. | Los efectos se simplifican para el prototipo; no se importan compras, economía ni progreso. |
| Four Player Chess | Geometría exacta de tablero en cruz 14×14, cuatro ejércitos orientados hacia el centro y colores de bando | No se porta la rotación de turnos, el jaque ni la eliminación completa de cuatro jugadores |
| Modificadores | Una escena de muestra para cada uno de los 22 modificadores; los que afectan turnos o movimientos principales pueden activarse como regla en los prototipos conectados. | No se activan en partidas, mapas ni tiendas de Kure’i; las muestras aisladas no son partidas completas. |
| Recetas | Seis combinaciones y requisitos originales, con muestra visual de sus efectos. | Frost, Volcano y Office se documentan como requisitos de tema/tablero; las recompensas de perfil no se importan. |

## Inventario de eventos de Chaos 2.0

`wall`, `hole`, `giant`, `swap`, `hop`, `neutral`, `bombs`, `portals`, `duck`, `freeze`, `lava` y `promote`.

El prototipo presenta una ruleta, una previsualización y una acción manual de resolución. La secuencia visual es independiente de `BoardView.Fx`.

## Inventario de modificadores

Reglas diarias: `ktele`, `boom`, `php`, `enr`, `grav`, `fast`, `dk`, `abil`, `ev`, `zc`.

Modificadores de compra: `sudden`, `fog`, `randpromo`, `extrapawns`, `ice`, `hotfloor`, `royalswap`, `ducks`, `lowgrav`, `bighead`, `narrator`, `disco`.

## Recetas

- `moon`: lowgrav + boom + bighead.
- `iceage`: ice + fog + tema Frost.
- `duckapoc`: ducks + randpromo.
- `lava`: hotfloor + tablero Volcano.
- `corporate`: narrator + fast + tablero Office.
- `overdrive`: siete o más modificadores simultáneos.

## Fronteras técnicas

- Catálogo APK: `src/lab/apk/catalog.js`.
- Prototipos ampliados: `src/lab/apk/expansion.js`, invocados por `src/lab/apk/prototypes.js`.
- Renderer de efectos APK: `src/lab/apk/effects.js`.
- Selector: `lab-preview.html` y `src/lab-catalog.js`.
- Banco de VFX individuales: `lab.html` y `src/lab.js` (64 muestras independientes; inventario en `references/apk/effects-contract.md`).
- Verificación estática: `tools/apk-vfx-check.mjs`.

`lab.html` sigue siendo una galería de efectos independientes: marcas, zonas, puntos débiles, jefes, proyectiles, casillas, estilos de movimiento, desapariciones y feedback de combate; incluye también explosión de muerte, invocación zombi, coronación y destello de casilla. Los prototipos de reglas se abren desde el selector APK del banco de pruebas. Ninguna nueva modalidad, receta o modificador se registra en `src/game/match.js`, `src/game/rules.js`, recompensas, persistencia o economía.


## Estado de jugabilidad del laboratorio (MVP)

El controlador `src/lab/apk/playable-match.js` reutiliza `Match`, las reglas legales y `botChooseMove`; no duplica el motor de ajedrez:
- Selección de piezas, destinos legales, movimientos, capturas, HP, turnos y respuesta de IA.
- Fin de partida por objetivo, captura del rey o pérdida del rey propio.
- Partidas conectadas: Micro Chess, Random Army, Giant Board, Battle Chess, Boss Chess, Zombie Chess, Bomb Chess, Gravity Chess, Chaos Chess, Chaos Arena, Card Chess, Infinite Chess, Mayhem Mode, Rey Patata Caliente, Boss Chess 2.0 y Horde Mode.
- Fiesta jugable: Todos son dama, Todos son peón, Caballo, Ajedrez relámpago, invisible, borracho, gallina, balacera y antiajedrez.
- Giant Board usa movimientos legales reales para arzobispo (alfil + caballo), canciller (torre + caballo), camello y cañón.
- Horde Mode es un MVP de cinco oleadas, con minijefe al final, selección de mejoras y victoria/derrota. No se presenta como la campaña original completa de 30 oleadas.
- Cuatro jugadores sigue siendo una muestra de geometría, sin rotación de cuatro turnos ni eliminación de equipos.
- Los minijuegos Arcade y las entradas de modificadores/recetas siguen siendo escenas independientes; no deben confundirse con las partidas de ajedrez contra IA.

Pruebas:
- `tools/apk-match-selfcheck.mjs`: reglas legales, turno del bot, captura del rey, condiciones de victoria y movimientos especiales del tablero gigante.
- `tools/apk-playable-smoke.mjs`: Playwright en 360×800 táctil y 1366×768; verifica tablero, movimiento legal, respuesta de IA y estados visibles.
- Workflows: `.github/workflows/validate-mates.yml` y `.github/workflows/apk-playable-qa.yml`.

Nada de esto se registra en las partidas normales de Kure’i, sus recompensas, persistencia o economía.


## Controles y validación de Arcade

Los prototipos `pdodge`, `parkour`, `blaster`, `rampage`, `panic` y `queen` muestran destinos de movimiento directamente sobre el tablero: evasión del rey, saltos de caballo, diagonales de alfil, carriles de torre, desplazamientos del rey y líneas de dama. Las zonas peligrosas permanecen marcadas por separado. El smoke de Playwright recorre estos seis prototipos también en móvil táctil y escritorio, selecciona una pieza, comprueba destinos visibles y ejecuta un movimiento.
