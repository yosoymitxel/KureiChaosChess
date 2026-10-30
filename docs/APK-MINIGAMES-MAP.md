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
| Rey Patata Caliente | Partida local contra CPU; la corona se transfiere por bando cada cinco rondas, con aviso previo y selección de candidato no amenazado | Captura del portador rival como condición de victoria; no reemplaza el resolutor de jaque/mate del APK |
| Chaos Chess 2.0 | Partida local contra CPU, bolsa de 12 eventos sin repetición, anuncio y resolución automática tras el siguiente movimiento | Calendario y efectos simplificados respecto del APK original |
| Boss Chess 2.0 | Partida local contra CPU; cuatro perfiles de jefe, HP, puntos débiles que reciben daño al pisarlos y ataques telegrafiados por fila/columna/cruz/3×3 | Combate y daño simplificados; no incluye toda la IA ni los ataques específicos de cada jefe |
| Horde Mode | Partida de supervivencia con rey + tres piezas elegidas, movimientos legales, CPU básica, cinco oleadas, jefes con HP y elección de una mejora entre oleadas | Corte demostrativo de cinco oleadas; no importa las 30 oleadas ni la economía/reroll completos del APK |
| Random Army | Sorteo ponderado con presupuesto exacto de 39 puntos, rey fijo, elección de mismo/diferente ejército y partida local contra CPU | La victoria se define capturando el rey; no reemplaza el resolutor de jaque/mate del APK |
| Giant Board | Tablero 12×12 jugable contra CPU; arzobispo (alfil + caballo), canciller (torre + caballo), camello y cañón usan los tipos de movimiento registrados en las reglas locales | No importa el resolutor de jaque/mate ni todas las particularidades del APK |
| Party modes | Todos son dama/peón/caballo, relámpago, invisible, borracho, gallina, balacera y antiajedrez: partidas locales contra CPU con movimientos y finales; los efectos particulares se aplican durante la partida | Reloj vencido causa derrota en el corte de laboratorio; no hay promociones, jaque/mate ni todos los detalles de cada modo original |
| Four Player Chess | Geometría exacta de tablero en cruz 14×14, cuatro ejércitos orientados hacia el centro y colores de bando | No se porta la rotación de turnos, el jaque ni la eliminación completa de cuatro jugadores |
| Modificadores | Una escena de demostración aislada por cada uno de los 22 modificadores | No se activan durante partidas, mapas ni tiendas de Kure’i |
| Recetas | Seis combinaciones y requisitos originales, con muestra visual | Frost, Volcano y Office se documentan como requisitos de tema/tablero; las recompensas de perfil no se importan |

## Inventario de eventos de Chaos 2.0

`wall`, `hole`, `giant`, `swap`, `hop`, `neutral`, `bombs`, `portals`, `duck`, `freeze`, `lava` y `promote`.

La ruleta se integra en una partida local: se anuncia un evento y se resuelve tras el siguiente movimiento. La secuencia y los efectos son simplificados respecto del APK y siguen independientes de `BoardView.Fx`.

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
- Turnos y movimientos de los prototipos: `src/lab/apk/turn-game.js`.
- Prueba Playwright de interacción: `tools/apk-gameplay-check.mjs`.

`lab.html` sigue siendo una galería de efectos independientes: marcas, zonas, puntos débiles, jefes, proyectiles, casillas, estilos de movimiento, desapariciones y feedback de combate; incluye también explosión de muerte, invocación zombi, coronación y destello de casilla. Los prototipos de reglas se abren desde el selector APK del banco de pruebas. Ninguna nueva modalidad, receta o modificador se registra en `src/game/match.js`, `src/game/rules.js`, recompensas, persistencia o economía.
