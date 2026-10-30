# Auditoría de expansión de Chess Mayhem APK

Archivo fuente: `assets/public/game-source.js` dentro de `kureichess-apk-extracted-source.zip`.

## Puntos de entrada y registros contrastados

| Bloque del código | Línea aproximada | Uso |
|---|---:|---|
| `MODES` | 1228 | Modos iniciales |
| `DAILY_RULES` | 1333–1343 | Diez reglas diarias |
| `MINIGAMES` | 2417 | Minijuegos |
| `ARCADE` | 3970 | Seis juegos Arcade |
| `C2_EVENTS` | 6930–6968 | Doce eventos de Chaos 2.0 |
| `Chaos2.tick` | 6972–6991 | Bolsa sin repetición; aviso en el ply previo; ejecución en `st.ply + 2` |
| `Potato.tick` | 7083–7098 | Transferencia de corona y anuncio anticipado |
| `RandArmy.gen/place` | 7104–7125 | Presupuesto de 39 puntos, rey fijo y reparto de piezas |
| `HORDE_UP` | 7189–7214 | Veinticuatro mejoras con pesos y marcadores de repetición única |
| `MX_MODS` | 7315–7330 | Diez modificadores diarios + doce comprables |
| `RECIPES` | 7340–7347 | Seis recetas secretas |
| `MX_MODE_DEFS` | 7420–7462 | Boss 2.0, Horde, Random Army, Giant, Potato y nueve modos de fiesta |
| Registro separado `p4` | 8934–8945 | Ajedrez de cuatro jugadores |

## Definiciones de modalidad ausentes del catálogo inicial

`boss2`, `horde`, `randarmy`, `giant`, `potato`, `pqueen`, `ppawn`, `horse`, `speed`, `invis`, `drunk`, `chicken`, `bullet`, `anti` y `p4`.

## Modificadores

Diarios: `ktele`, `boom`, `php`, `enr`, `grav`, `fast`, `dk`, `abil`, `ev`, `zc`.

Comprables: `sudden`, `fog`, `randpromo`, `extrapawns`, `ice`, `hotfloor`, `royalswap`, `ducks`, `lowgrav`, `bighead`, `narrator`, `disco`.

## Recetas

- `moon`: lowgrav + boom + bighead.
- `iceage`: ice + fog + Frost.
- `duckapoc`: ducks + randpromo.
- `lava`: hotfloor + Volcano.
- `corporate`: narrator + fast + Office.
- `overdrive`: siete o más modificadores activos.

## Interpretación

No se deben contar todos los elementos como modos independientes. Chaos 2.0 amplía Chaos Chess; los modificadores alteran una partida; las recetas son combinaciones y recompensas; `p4` se registra fuera de `MX_MODE_DEFS`. La implementación de laboratorio mantiene esas categorías separadas.

Los prototipos recrean muestras comprobables, no el runtime completo del APK. Las limitaciones concretas se documentan en `docs/APK-MINIGAMES-MAP.md`.

## Jugabilidad del corte de laboratorio

Los modos de dos bandos y los Arcade tienen ahora un flujo interactivo: selección de piezas/casillas, movimientos legales o controles específicos del minijuego, respuesta de CPU donde corresponde, estado y condiciones explícitas de victoria/derrota. `src/lab/apk/turn-game.js` centraliza el turno local y consulta `src/game/rules.js`; no modifica `src/game/match.js` ni la partida normal.

- Jugables contra CPU: `chaos`, `battle`, `zombie`, `bomb`, `gravity`, `boss`, `arena`, `cards`, `micro`, `infinite`, `mayhem`, `boss2`, `randarmy`, `giant`, `potato`, `pqueen`, `ppawn`, `horse`, `speed`, `invis`, `drunk`, `chicken`, `bullet` y `anti`.
- Arcade con objetivos: `pdodge`, `parkour`, `blaster`, `rampage`, `panic` y `queen`.
- Supervivencia `horde`: borrador de tres piezas, cinco oleadas, CPU y selección de mejoras.
- Minijuegos `race`, `dodge` y `feast`: mantienen sus bucles propios y objetivos.
- `p4` sigue siendo una prueba de geometría y colocación de cuatro ejércitos; no se etiqueta como partida jugable porque todavía no tiene rotación de turnos ni condición de victoria de cuatro bandos.

La CPU es deliberadamente básica y prioriza capturas; el corte no implementa jaque/mate completo, el motor económico ni la IA original del APK. Modificadores y recetas continúan siendo muestras aisladas, no se anuncian como partidas.


## Auditoría de efectos visuales

Además de los registros de modalidades, se recorrieron `Anim.step`, `MxStep`, `MxDraw`, `Caption`, `Speed.draw` y `Renderer.drawTile`.

- `Anim.step`: move, attack, combat, die, dmg, text, explode, tile, spawn, transform, beam, banner, shake y sound.
- Variantes de movimiento: normal, teleport, slide, stomp, hurl, jump y phase.
- `MxStep`: mxRoulette, mxStamp, mxBossCut, mxZone, mxWeak, mxCrown, mxBullet, mxSay y mxHorde.
- `MxDraw`: marca de ruleta, punto débil, zona telegrafiada, corona, disco y cuenta atrás.
- Casillas especiales del renderer: void, lava, curse, infect, wall, plat, portal y trap.

La galería final del laboratorio contiene 60 escenas APK. `mxHorde` no se separa como VFX porque su handler abre el modal de cartas/oleadas; se prueba en el prototipo Horde Mode.


Ampliación final de la galería: escena independiente para `die:explode`, `spawn:zombie`, `transform:promote` y `tile`; el contador total de muestras APK en `lab.html` queda en 64. La presentación de Ruleta del Caos reproduce el ciclo de nombres con desaceleración y revela el evento elegido al final.
