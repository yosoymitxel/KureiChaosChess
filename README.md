# Zugzwang

Ajedrez mutante en formato roguelike de mesa. Tablero procedural con agujeros, piezas
extra (guardia, camello, cañón…), mutaciones que se acumulan durante la run y jefes que
ocupan varias casillas.

**Jugar:** https://yosoymitxel.github.io/Zug/ · [laboratorio de animaciones](https://yosoymitxel.github.io/Zug/lab.html)

## Jugar en local

No hay paso de build. Sirve la carpeta con cualquier servidor estático:

```sh
npx http-server -c-1 .
# o
python3 -m http.server
```

- `index.html`: el juego.
- `lab.html`: laboratorio de animaciones (escenas aisladas: golpe al jefe, aplastamiento,
  salto, coronación, derrumbe, victoria).

Las dependencias (Preact, htm, anime.js, Motion) se cargan desde jsDelivr con un import map;
hace falta conexión la primera vez.

## Documentación

- [DESIGN.md](DESIGN.md): dirección visual, diales y la razón de cada decisión.
- [PRODUCT.md](PRODUCT.md): qué es el juego, para quién y en qué escena se usa.
- [Arquitectura](docs/ARCHITECTURE.md): carpetas, flujo de una jugada, jefes multi-casilla,
  cómo funciona la coreografía.
- [Investigación de herramientas](docs/RESEARCH.md): qué se usa de cada librería pedida y por qué.
- `legacy/index.v1.4.html`: la versión monolítica anterior.

## Agregar contenido

Cada familia vive en un solo registro y el resto del juego (mapa, ayudas, galería, tienda,
logros) lo lee de ahí:

| Qué | Dónde se declara | Qué más pide |
|---|---|---|
| Pieza | `src/data/pieces.js` (nombre, movimiento, valor, regla) | dibujo en `src/view/piece-art.js`, set píxel, movimiento en `src/game/rules.js` |
| Mecánica | `src/data/modifiers.js` (con `weights` por tramo) | su efecto en `src/game/match.js` |
| Minijuego | `src/data/modifiers.js` (`mini: true` y `weights`) | pantalla en `MINI_SCREENS` (`src/ui/app.js`) con `MiniTools` |
| Mutación | `src/data/mutations.js` | si presta movimiento, en `EXTRA_MOVES` |
| Jefe | `src/data/bosses.js` | dibujo `boss-<id>` y estar en `MINI_BOSSES` o `FINAL_BOSSES` |
| Mesa | `src/data/themes.js` (con `price` si se compra) | nada: tienda, pausa, ajustes y galería la leen solas |
| Logro | `src/game/achievements.js` | un `award('<id>')` donde ocurre |

`node tools/check-registry.mjs` revisa que nada quede a medias (pieza sin dibujo, minijuego sin
pantalla, icono inexistente, logro que nadie otorga…). Correrlo junto con `node tools/simulate.mjs`
antes de subir.

## Novedades v2

- Mesa en 3D con CSS: plano inclinado, casillas con grosor, piezas como *standees* de cartón,
  tres cámaras (cenital, mesa, épica).
- Jefes de 2×2 (Titán, Ariete, Hidra) con vidas: aplastan lo que pisan y los atacantes rebotan
  hasta el último golpe.
- Terreno inestable: las casillas se agrietan y caen al vacío.
- Mapa como tablero de juego con un peón que avanza; recompensas como cartas que se reparten
  y se giran.
- Límite de turnos sin capturas: las partidas bloqueadas se deciden por recuento de piezas
  (antes podían quedarse en bucle).

## Novedades v2.2

- Cartas tácticas en la mano (una por turno): Coloso, Ascenso, Montura, Fortificar, Terremoto,
  Refuerzo, Paso doble. Al apuntar, el tablero enseña cómo quedará la pieza.
- Jefes de 3×3, 2×1 y 1×2, y el Devorador, que roba el movimiento de lo que aplasta.
- Nodos de élite: la reina enemiga solo cae la última y sus torres solo tras su escolta.
- Tableros nuevos (anillo, río con puentes, damero) y terreno: hielo y portales.
- Salidas animadas: al mapa, reinicio y rendición tienen cada una su gesto.
- Base líquida: al mover, la ficha se derrite sobre el recorrido y se vuelve a cuajar en destino.
