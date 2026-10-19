# Diálogos del personaje y cinemáticas

Propuesta para cuando lleguen los dibujos del personaje (`art/plantillas/personaje.svg`). Nada de
esto está en el juego todavía; lo que ya existe y se reutiliza va marcado.

## Qué se quiere

- Un personaje que acompaña la run con frases cortas, sin lore pesado: presenta, avisa, se ríe
  o se enfada según lo que pasa.
- Jefes con presentación propia, más allá de caer con peso: entra el jefe, el personaje reacciona,
  se ve cómo se mueve.
- Un apartado en la Galería para volver a ver las cinemáticas ya vistas.
- Todo se salta con un toque, como hoy.

## Piezas que ya existen (se reutilizan)

| Pieza | Dónde | Sirve para |
|---|---|---|
| Cinemática con barras y cuerpo de papel | `Moments.cinematic` en `src/ui/moments.js` | el marco de cada escena |
| Demo de movimiento en tablerito | `Moments.demo` | "así se mueve" del jefe o de una mutación |
| Saltar con un toque o tecla | `skippable` en `moments.js` | cualquier paso de la escena |
| Lecciones por piso | `LESSONS` en `src/game/generate.js` | primeras frases del personaje en el tutorial |
| Galería por grupos | `src/ui/screens/gallery.js` | grupo nuevo "Cinemáticas" |

## Formato de datos

Las escenas viven en `src/data/scenes.js` como datos, sin lógica:

```js
export const SCENES = {
  'jefe-titan': {
    name: 'Llega el Titán',
    when: { boss: 'titan', first: true },        // cuándo se dispara
    steps: [
      { who: 'guia', pose: 'sorpresa', text: '¿Oyes eso? El suelo tiembla.' },
      { anim: 'stomp', piece: 'boss-titan' },     // animación ya existente
      { demo: 'boss-titan' },                     // tablerito con su patrón
      { who: 'guia', pose: 'pensando', text: 'Ocupa cuatro casillas. Rodéalo, no lo enfrentes.' },
    ],
  },
};
```

- `who` y `pose` eligen el dibujo (`gesto-<pose>` de la hoja de la temporada activa).
- `text` es una frase de una o dos líneas; el globo escribe letra a letra y un toque la completa.
- `anim` y `demo` usan lo que ya hay en `Moments`.
- `when` puede ser: el primer encuentro con un jefe, piso N del tutorial, la primera mutación
  épica, perder la reina, ganar la run…

## Disparadores propuestos (primera tanda)

1. Tutorial: las cuatro lecciones pasan a ser frases del personaje.
2. Primer encuentro con cada jefe: presentación + "así se mueve".
3. Jefe derribado: reacción del personaje.
4. Primera mutación épica y primera run completa.

Cada escena se ve completa una sola vez; después queda en la Galería y en la partida se reduce
a lo de hoy (rótulo y caída).

## Lo que hace falta del dueño

- Nombre y carácter del personaje (¿guía sabio, bufón, rival amistoso?).
- La hoja `personaje.svg` con los seis gestos.
- Revisar las frases: las escribo yo como borrador y tú ajustas el tono.
