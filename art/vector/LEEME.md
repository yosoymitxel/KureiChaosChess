# Piezas vectoriales (la mesa por defecto)

Cada pieza y cada jefe del juego está en su propio `.svg`, listo para abrir en Inkscape,
Illustrator, Affinity, Figma o cualquier editor. El juego dibuja con estos archivos: si los
editas y los importas, la pieza cambia en todas las mesas no píxel (Nogal, Tapete, Pizarra…).

| Carpeta | Archivos |
|---|---|
| `piezas/` | `pawn` peón, `rook` torre, `knight` caballo, `bishop` alfil, `queen` reina, `king` rey, `guard` guardia, `advisor` consejero, `elephant` elefante, `camel` camello, `cannon` cañón |
| `jefes/` | `boss-titan`, `boss-ram`, `boss-hydra`, `boss-golem`, `boss-rider`, `boss-wall`, `boss-devourer` |

## Cómo editar

1. Abre el `.svg` y dibuja **dentro del grupo `pieza`** (en Inkscape es la capa/grupo con ese id;
   en Illustrator o Figma, el grupo llamado `pieza`). No cambies su nombre.
2. El grupo `guia` es solo un marco de referencia: no entra al juego.
3. Usa estos cuatro colores, que el juego cambia por los de cada bando y cada mesa:

   | Color | Uso | En el juego |
   |---|---|---|
   | `#f3ead8` | cuerpo | el color del bando (marfil, carmesí, jade…) |
   | `#8a7a66` | detalle | el tono oscuro del bando |
   | `#2a2233` | contorno | la tinta de la mesa |
   | `#d9a441` | ojos y luces de los jefes | el latón de la mesa |

   Cualquier otro color queda fijo en todos los bandos.
4. El contorno va como trazo (`stroke`) de grosor 1.6, como el resto del set. Los trazos gruesos sin
   relleno (cuellos, patas, lanzas) cuentan como parte del cuerpo al medir.
5. **No hace falta encuadrar ni medir**: el juego mide el dibujo, lo escala a la altura que le toca
   (el rey más alto, el peón más bajo) y lo pone sobre la peana. La peana la dibuja el juego.
6. Guarda como SVG normal (en Inkscape, "SVG simple" o "Inkscape SVG": los dos sirven).

## Llevarlo al juego

```
node tools/vector-art.mjs
```

Lee los 18 archivos y escribe `src/view/piece-bodies.js`. Limpia lo que añaden los editores (ids,
metadatos, comentarios). Abre el juego con una mesa normal para ver el cambio.

Si quieres volver a empezar una pieza desde la versión del juego, borra su `.svg` y corre
`node tools/vector-art.mjs --exportar` (solo crea los que faltan; `--forzar` los rehace todos y
pisa lo que hayas editado).

## Si algo no se ve bien

- La pieza salió muy chica o muy grande: revisa que no haya formas sueltas lejos del dibujo
  (un punto perdido agranda la caja que mide el juego).
- Los colores no cambian con el bando: el editor guardó otro tono (por ejemplo `#f3ead9`). Usa los
  cuatro de arriba exactos.
- Si la pieza tiene que quedar centrada sobre otra parte que no es el medio (el caballo apoya en el
  cuello), eso se ajusta en `LADDER` de `src/view/piece-art.js`: avísalo y se cambia.
