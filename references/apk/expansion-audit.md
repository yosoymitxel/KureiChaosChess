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
