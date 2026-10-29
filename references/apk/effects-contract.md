# Contrato de aislamiento de animaciones APK

## Fronteras de código
- Efectos APK: `src/lab/apk/effects.js`.
- Galería comparativa: `lab.html` y `src/lab.js`.
- Prototipos de modalidades: `tests/apk-lab.html` y `src/lab/apk/prototypes.js`.
- Evidencia de referencia: `references/apk/`.

## Permitido
- Reutilizar `BoardView` para dibujar el tablero y las piezas, los temas registrados y el centro real de cada casilla.
- Usar `anime.js` para mover una pieza del laboratorio sin invocar la coreografía genérica del juego.
- Poner una capa canvas independiente encima del tablero para dibujar el VFX de referencia.

## Prohibido para el efecto distintivo APK
- Delegar en `view.fx.infect`, `view.fx.explosion`, `view.fx.burst`, `view.infect` o la bandera `res.dash = true`.
- Renombrar una animación que ya existe y presentarla como nueva.
- Mezclar el VFX de comparación con las partidas normales o registrarlo como recompensa.

## Identidades visuales
- **Estela APK:** bloques verdes con ajuste a cuadrícula de píxeles.
- **Impacto APK:** anillos y escombros cuadrados en naranja, oro y rojo.
- **Zombi APK:** persecución, mordida, fragmentos verdes pixelados y texto `INFECTED!`.
- **Bomba APK:** área 3×3 en bloques cuadrados y escombros; no delega la explosión en `BoardView.Fx`.
- **Gravedad/meteoritos APK:** movimiento sin polvo genérico, aviso circular, caída pixelada e impacto por celdas.
- **Duelo/jefe/cartas APK:** impactos rectangulares, teleport cian/violeta y aparición propia.

El tablero, las piezas y el tema pueden ser compartidos con Kure'i; el patrón de animación, la secuencia y sus parámetros no.

## Revisión de aislamiento

El laboratorio de prototipos `src/lab/apk/prototypes.js` no llama a `BoardView.Fx` ni a `BoardView.infect/kill/hurt/rise/meteor`: las partículas y transiciones visibles pertenecen a `src/lab/apk/effects.js`. La vista de tablero y sus piezas se comparten para que la prueba se ejecute en el entorno real, pero su capa de efectos y sus curvas de movimiento son independientes.

La escena comparativa del `lab.html` activa la etiqueta `APK REFERENCE · RENDER SEPARADO` y una paleta verde/por bloques. Al seleccionar escenas de Kure'i, esa marca desaparece y se muestra el VFX original.

## Entrada inicial de tablero

Las referencias APK tampoco usan `BoardView.intro()`: el módulo `effects.js` organiza las losas y hace caer las piezas sin polvo genérico, sin squash ni sonido de paso del juego original. Termina con una ráfaga de pequeños bloques ligada a las piezas. En el comparador de `lab.html`, `BoardView` se instancia con `vfx:false` para las escenas APK.
