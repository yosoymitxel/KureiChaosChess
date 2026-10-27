# Desarrollo

Guía técnica de Kure'iChaosChess. Lo que es el juego está en el [README](../README.md).

## Jugar en local

No hay build. Sirve la carpeta con cualquier servidor estático:

```sh
npx http-server -p 8123 -s -c-1 .
# o
python3 -m http.server 8123
```

y abre http://localhost:8123. Preact, htm, anime.js y Motion se cargan desde jsDelivr con un
import map, así que la primera vez hace falta conexión.

## Paquete para itch.io

```sh
node tools/build-itch.mjs
```

Deja `dist/kurei-chaos-chess-itch.zip`, listo para subir como juego HTML, sin ninguna dependencia
externa. Las librerías salen de `vendor/`. Los textos de la página, los ajustes y las imágenes están en [ITCH.md](ITCH.md).

## Cómo está hecho

HTML y JavaScript sin bundler: Preact + htm para la interfaz, anime.js para el tablero y Motion para
pantallas y cinemáticas. El tablero 3D es CSS: un plano inclinado con casillas con grosor y piezas
de cartón en pie.

| Carpeta | Qué hay |
|---|---|
| `src/data/` | Todo el contenido en registros: piezas, jefes, mutaciones, mecánicas y minijuegos, mesas |
| `src/game/` | Lógica pura: reglas, partida, run, logros y un archivo por minijuego |
| `src/ui/` | Pantallas, componentes, iconos, sonido y cinemáticas |
| `src/view/` | El tablero (`board-view.js`), el arte de las piezas y los efectos |
| `css/` | Estilos base, por pantalla y el modo píxel |
| `art/` → `assets/` | Fuentes de arte y sonido, y lo que el juego carga |
| `tools/` | Importadores de arte y sonido, comprobaciones y simulaciones |

### Agregar contenido

Cada familia vive en un solo registro y el resto del juego (mapa, ayudas, galería, tienda,
logros) lo lee de ahí:

| Qué | Dónde se declara | Qué más pide |
|---|---|---|
| Pieza | `src/data/pieces.js` | dibujo en `src/view/piece-art.js`, set píxel, movimiento en `src/game/rules.js` |
| Mecánica | `src/data/modifiers.js` (con `weights` por tramo) | su efecto en `src/game/match.js` |
| Minijuego | `src/data/modifiers.js` (`mini: true`) | lógica en `src/game/`, pantalla en `src/ui/screens/` y entrada en `src/data/minigame-catalog.js` |
| Mutación | `src/data/mutations.js` | si presta movimiento, en `EXTRA_MOVES` |
| Jefe | `src/data/bosses.js` | dibujo `boss-<id>` |
| Mesa | `src/data/themes.js`; las píxel salen de `art/temas/<id>/` con `tools/pixel-art.mjs` | nada más |
| Logro | `src/game/achievements.js` | un `award('<id>')` donde ocurre |

Antes de subir:

```sh
node tools/check-registry.mjs   # nada a medias: piezas sin dibujo, iconos que no existen…
node tools/art-check.mjs        # temas píxel, sonidos y figuras
node tools/simulate.mjs         # balance de partidas bot contra bot
```

Cada minijuego tiene además su `tools/<id>-selfcheck.mjs`, que comprueba que las tres dificultades se pueden pasar.

## Documentación

- [Arquitectura](ARCHITECTURE.md): flujo de una jugada, jefes de varias casillas, coreografía.
- [DESIGN.md](../DESIGN.md): dirección visual y la razón de cada decisión.
- [PRODUCT.md](../PRODUCT.md): qué es el juego y para quién.
- [Referencias](REFERENCE-GAMES.md): los juegos que inspiran cada minijuego.
- [Mapa del código](MAPA.md): índice de dónde está cada cosa.


## Licencias de terceros

- Música: `assets/musica/CREDITOS.txt`.
- Sonidos: `art/sonidos/LICENCIAS.txt`.
- Librerías y letra incluidas para itch.io: `vendor/LICENSES.md`.
