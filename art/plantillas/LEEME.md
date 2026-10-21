# Plantillas de dibujo

> **Para editar las piezas y jefes vectoriales que usa el juego, usa `art/vector/`** (un `.svg` por
> figura, se importa con `node tools/vector-art.mjs`; ver `art/vector/LEEME.md`). Las hojas de esta
> carpeta quedan para bocetar encima (tablero, personaje) y como referencia.

Hojas para dibujar el arte del juego encima de lo que ya hay. Se regeneran con
`node tools/art-template.mjs` (si cambian las piezas o los jefes, se vuelve a correr).

| Hoja | Qué es |
|---|---|
| `piezas.svg` | Un marco por pieza (11). |
| `jefes.svg` | Un marco por jefe (7). El juego estira el dibujo a su tamaño en casillas (2×2, 3×2…). |
| `tablero.svg` | Casilla clara, casilla oscura, canto del bloque y fondo de mesa en mosaico. |
| `personaje.svg` | Seis gestos del personaje (neutral, habla, alegre, enfado, sorpresa, pensando). Una copia de la hoja por temporada. |

## Reglas de cada marco (piezas y jefes)

- El marco es el lienzo real de la pieza: 45 × 41 unidades, ampliado ×8 para dibujar cómodo.
- **Línea naranja de abajo**: el suelo. La peana apoya ahí.
- **Franja gris**: la peana común. Si tu pieza trae su propia base, que ocupe esa franja.
- **Línea naranja vertical**: el centro. La pieza debe quedar centrada en ella.
- **Línea azul de arriba**: el techo. No pasarse, o la cabeza se corta en el tablero.
- **Calco gris**: la pieza actual, bloqueada. Dibuja en el grupo `dibujo-<pieza>` y deja el calco como está.

## Colores

Usa solo los tres de la paleta de arriba a la derecha:

| Color | Uso | En el juego pasa a ser |
|---|---|---|
| `#f3ead8` | cuerpo | el color del bando (marfil, carmesí, jade…) |
| `#8a7a66` | detalle | el tono oscuro del bando |
| `#2a2233` | contorno | la tinta del tema |

Así una sola pieza sirve para los tres bandos y para todas las mesas. Si una pieza necesita un
color fijo que no cambie con el bando (por ejemplo, latón en una corona), avisa y se agrega un
cuarto color a la paleta.

## Píxel

Los temas píxel viven aparte, en `art/temas/` (cada carpeta, un tema), con su propia plantilla de
PNG en `art/temas/_plantilla/`: ver `art/temas/LEEME.md`. Estas plantillas son para el set vectorial.

## Cómo entregar

1. Guarda la hoja con tus dibujos en `art/entregas/` (por ejemplo `art/entregas/piezas-v1.svg`).
2. Súbela a la rama y avisa: el importador lee cada grupo `dibujo-<id>`, cambia los tres colores
   por las variables del tema y la pieza entra al juego con su id.
3. Tableros y fondo: dibuja dentro de cada rectángulo; el fondo debe empalmar en mosaico.
4. Personaje: un archivo por temporada (`personaje-base.svg`, `personaje-halloween.svg`…),
   con los mismos ids `gesto-<nombre>`.
