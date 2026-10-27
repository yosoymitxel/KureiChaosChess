# Kure'iChaosChess

**Ajedrez que muta en cada piso.** Un roguelike de mesa en el navegador: sube una torre de
partidas, gana piezas raras y mutaciones, y derriba a los colosos del final. Cada piso trae un
tablero distinto, con agujeros, hielo, portales o un suelo que se hunde.

**Jugar:** https://yosoymitxel.github.io/KureiChaosChess/

![Menú: el título y una mesa con el Titán frente a tus piezas](docs/img/menu-walnut.jpg)

## Qué trae

- **Runs de varios pisos** sobre un mapa de tablero: partidas, tiendas, descansos, élites y jefes.
- **11 piezas**: las del ajedrez y otras como la guardia, el camello o el cañón.
- **Mutaciones y cartas tácticas** que se acumulan durante la run.
- **7 jefes** que ocupan varias casillas, tienen vidas y aplastan lo que pisan.
- **15 mecánicas de piso**: lago helado, portales, niebla, plaga zombi, contagio, aquelarre, lluvia de meteoritos…
- **28 minijuegos** de otra naturaleza, con referencias a clásicos de NES: la bruja (a lo Pac-Man),
  brote (a lo Dr. Mario), damas a ciegas, ventisca, hockey de mesa, conecta 4…
- **Partida local a dos**, en el mismo dispositivo: ajedrez con tablero, tamaño, forma y mecánica a elegir, o minijuegos a dos
  (hockey, conecta 4, damas).
- **23 mesas**, entre ellas 17 temas en pixel art, que cambian todo el juego: piezas, letra, sonido y música.
- **Jardín zen** entre runs, tienda, galería y 33 logros.
- Hecho para **móvil y PC**: táctil o ratón, y teclado en los minijuegos.

| Partida | Mesa pixelada |
|---|---|
| ![Un piso: tablero 8×8 con agujeros, panel de jugadores y cartas en la mano](docs/img/partida.jpg) | ![El mismo piso con el tema pixelada](docs/img/partida-pixel.jpg) |
| **Minijuego: La bruja** | **Minijuego: Brote** |
| ![Laberinto con monedas y brujas](docs/img/mini-witch.jpg) | ![Piezas carmesí listas para el contagio en cadena](docs/img/mini-outbreak.jpg) |
| **Jardín zen** | **Hockey de mesa a dos** |
| ![Jardín con estanque de kois, macetas y farol](docs/img/jardin.jpg) | ![Hockey de mesa en pixel art](docs/img/mini-hockey.jpg) |

<p align="center"><img src="docs/img/movil.jpg" alt="Una partida en el móvil" width="300" /></p>

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
externa. Las librerías salen de `vendor/`. Los textos de la página, los ajustes y las imágenes están en [docs/ITCH.md](docs/ITCH.md).

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

- [Arquitectura](docs/ARCHITECTURE.md): flujo de una jugada, jefes de varias casillas, coreografía.
- [DESIGN.md](DESIGN.md): dirección visual y la razón de cada decisión.
- [PRODUCT.md](PRODUCT.md): qué es el juego y para quién.
- [Referencias](docs/REFERENCE-GAMES.md): los juegos que inspiran cada minijuego.
- [Mapa del código](docs/MAPA.md): índice de dónde está cada cosa.

## Créditos

- Música: Open Lo-Fi (btahir) y Ninja Adventure (Pixel-boy), CC0. Detalle en `assets/musica/CREDITOS.txt`.
- Sonidos: Kenney, OpenGameArt y Ninja Adventure, CC0. Detalle en `art/sonidos/LICENCIAS.txt`.
- Letras: Bricolage Grotesque y Jersey 10, SIL OFL.
- Librerías: Preact, htm, anime.js y Motion (MIT / Apache-2.0). Detalle en `vendor/LICENSES.md`.
