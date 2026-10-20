# Temas píxel

Cada carpeta de aquí es una mesa píxel del juego. Al elegirla en la tienda o en la pausa, **todo el
juego pasa a píxel**: piezas, jefes, casillas, fondo, marcos de paneles y botones, y la letra.

| Carpeta | Qué es |
|---|---|
| `pixelada/` | El tema base (fantasía medieval). Lo que otro tema no dibuje, se toma de aquí. |
| `halloween/`, `scifi/`, `piratas/` | Temas hechos con pxl. |
| `_plantilla/` | Tu punto de partida para dibujar un tema propio. El guion bajo hace que el juego la ignore. |

## Hacer un tema nuevo, paso a paso

1. **Copia** `_plantilla/` y ponle el nombre del tema, en minúsculas y sin espacios ni guion bajo
   delante: por ejemplo `navidad/`.
2. **Edita `tema.json`**: `nombre` (el que se ve en la tienda), `precio` (0 = viene con el juego,
   útil para probar), `descripcion` y los colores (ver abajo).
3. **Dibuja** encima de los PNG vacíos de `dibujos/`, sin cambiarles el nombre. Usa la app que
   quieras (Aseprite, LibreSprite, Piskel, Pixel Studio en el móvil…). Exporta PNG normal, sin
   escalar (1 píxel = 1 píxel).
   - En `calcos/` está la misma cosa dibujada en el tema base, en su sitio exacto del lienzo. Ábrela
     como capa de referencia debajo de tu dibujo (y no la exportes).
   - **No hace falta dibujarlo todo.** Lo que dejes vacío se ve con el dibujo de Pixelada. Puedes
     empezar por tres piezas y una casilla, probar, y seguir.
4. **Importa**: `node tools/pixel-art.mjs`. Lee los avisos: te dice si algo se sale del lienzo, si
   una pieza no usa los colores del bando, etc.
5. **Prueba**: abre el juego (`npm run serve`), ve a la tienda o a la pausa y elige tu tema.
6. Sube la carpeta a la rama (los PNG de `assets/pixel/` y los dos `src/data/pixel-*.js` que genera
   el importador también).

## Lienzos

| Carpeta en `dibujos/` | Archivos | Tamaño | Reglas |
|---|---|---|---|
| `piezas/` | `pawn` peón, `rook` torre, `knight` caballo, `bishop` alfil, `queen` reina, `king` rey, `guard` guardia, `advisor` consejero, `elephant` elefante, `camel` camello, `cannon` cañón | 36×36 | Los pies en la última fila de abajo y la pieza centrada: el juego pone la peana debajo. El lienzo es holgado: lo vacío se recorta solo. Lo normal es 20–34 de ancho y 27–34 de alto; el rey el más alto, el peón el más bajo. |
| `jefes/` | `boss-titan`, `boss-ram`, `boss-hydra`, `boss-golem`, `boss-rider` (alto y estrecho), `boss-wall` (ancho y bajo), `boss-devourer` | 48×44 | Igual que las piezas. El juego los estira a su tamaño en casillas (2×2, 3×3…). |
| `fondos/` | `tile-a` casilla clara, `tile-b` casilla oscura, y sus variantes `tile-a2`, `tile-a3`, `tile-b2`, `tile-b3` | 16×16 | Cada casilla entera. Las variantes (grieta, mancha…) salen salteadas por el tablero; si no las dibujas, se repite la lisa. |
| `fondos/` | `table` | 32×32 | El fondo de toda la pantalla, en mosaico: el borde derecho tiene que empalmar con el izquierdo y el de arriba con el de abajo. Oscuro y tranquilo, que el texto claro va encima. |
| `marcos/` | `panel` (paneles y ventanas), `boton` | 12×12 | Se cortan en nueve: las esquinas de 4×4 quedan tal cual y los 4 píxeles del medio de cada lado se estiran, así que esos tienen que ser iguales a lo largo. **El centro va transparente**: el relleno lo pone el color de cada caja. |

Si un archivo termina en `_d` o `_w` (por ejemplo `pawn_d.png`), se usa tal cual para ese bando en
vez de cambiarle los colores: por si un bando necesita un dibujo distinto.

## Colores

**Los bandos.** Las piezas y los jefes se dibujan una sola vez, en el bando claro. El importador
saca los otros dos cambiando colores: cada color de `bandos.claro` se cambia por el que está en la
misma posición en `bandos.oscuro` y en `bandos.salvaje`. Por eso:

- La ropa, la armadura pintada, todo lo que diga "de qué bando soy", va con los 5 colores de
  `bandos.claro` (de más claro a más oscuro). Están los primeros en `paleta.gpl`.
- Lo demás (piel, metal, ojos, fuego, contorno) usa cualquier otro color y queda igual en los tres
  bandos.
- Puedes cambiar los 5 colores de cada bando en `tema.json`; los tres tienen que tener la misma
  cantidad.
- Pon un contorno oscuro de 1 píxel alrededor de cada figura: separa la pieza de la casilla.

**La mesa y la interfaz** (en `tema.json`, cualquier color de CSS: `#2b2434`, `oklch(...)`):

| Clave | Para qué |
|---|---|
| `colores.table`, `table-2` | Fondo de la pantalla (debajo del mosaico) y su tono algo más claro. |
| `colores.tile-a`, `tile-b` | Color medio de tus casillas clara y oscura (se usa en el hielo, la niebla, la galería…). |
| `colores.tile-side` | El canto del tablero, el grosor que se ve en el borde. |
| `colores.side-light`, `side-dark`, `side-wild` | El color de cada bando en peanas, fichas y marcadores. Que se parezca al color de la ropa de ese bando. |
| `interfaz` (opcional) | Colores de los paneles y botones: `paper`, `paper-2`, `paper-3` (el papel, de claro a oscuro), `ink`, `ink-2` (el texto sobre el papel), `accent`, `accent-ink` (botón principal), `brass` (selección), `muted`. Si lo dejas vacío, se usan los de siempre. Cuida que el texto se lea. |

## Rehacer la plantilla

`node tools/pixel-template.mjs` vuelve a generar `_plantilla/` (si se agregan piezas o jefes al
juego, o si cambia el tema base). Borra lo que haya dentro: no dibujes en `_plantilla/` directamente,
cópiala primero.
