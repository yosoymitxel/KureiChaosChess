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
| Rey Patata Caliente | Transferencia de corona por bando cada cinco rondas, anuncio previo, búsqueda de candidatos no amenazados y corona animada | No reemplaza el resolutor de jaque/mate del APK; la identidad de rey se demuestra visualmente |
| Chaos Chess 2.0 | Bolsa de 12 eventos sin repetición, anuncio previo, destino marcado y botón para resolver el evento | No ejecuta el calendario exacto de plies de la partida original |
| Boss Chess 2.0 | Cuatro perfiles de jefe, HP, puntos débiles y ataques anunciados por fila/columna/cruz/3×3 | Combate y daño simplificados; no incluye toda la IA ni los ataques específicos de cada jefe |
| Horde Mode | Borrador de tres piezas, oleadas, minijefe cada cinco y selección de 1 entre 3 de las 24 mejoras | El prototipo permite eliminar enemigos tocándolos y ofrece un atajo de escaparate; no importa el motor de combate ni el reroll económico original |
| Random Army | Sorteo ponderado con presupuesto exacto de 39 puntos, rey fijo y elección de mismo/diferente ejército | Disposición de laboratorio; no reemplaza el motor de jaque/mate |
| Giant Board | Tablero 12×12, dos filas de peones y representación de las cuatro piezas especiales | Arzobispo/canciller usan arte local de alfil/torre con insignia. El prototipo no sustituye sus movimientos legales |
| Party modes | Formación de los tres ejércitos uniformes y muestras interactivas de reloj, invisibilidad, desvío, gallinas, balas y captura obligatoria | Speed no ejecuta una jugada legal aleatoria automática; invisibilidad y antiajedrez son muestras de reglas, no partidas completas |
| Four Player Chess | Geometría exacta de tablero en cruz 14×14, cuatro ejércitos orientados hacia el centro y colores de bando | No se porta la rotación de turnos, el jaque ni la eliminación completa de cuatro jugadores |
| Modificadores | Una escena de demostración aislada por cada uno de los 22 modificadores | No se activan durante partidas, mapas ni tiendas de Kure’i |
| Recetas | Seis combinaciones y requisitos originales, con muestra visual | Frost, Volcano y Office se documentan como requisitos de tema/tablero; las recompensas de perfil no se importan |

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
- Banco de VFX individuales: `lab.html` y `src/lab.js`.
- Verificación estática: `tools/apk-vfx-check.mjs`.

`lab.html` sigue siendo una galería de efectos independientes. Los prototipos de reglas se abren desde el selector APK del banco de pruebas. Ninguna nueva modalidad, receta o modificador se registra en `src/game/match.js`, `src/game/rules.js`, recompensas, persistencia o economía.
