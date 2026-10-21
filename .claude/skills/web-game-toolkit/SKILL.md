---
name: web-game-toolkit
description: Taller para hacer juegos web (HTML/JS sin build) con Claude Code, sacado de Zugzwang. Úsala al empezar o ampliar un juego web: temas pixel art dibujables a mano (PNG o claude-pxl), iconos en dos sets (vector y píxel) medidos e igualados, sonido grabado + sintetizado, música en bucle, registro central de contenido con comprobaciones, demos de movimiento, minijuegos con física, pruebas con Playwright en móvil y PC, y cómo gastar pocos tokens en todo eso.
---

# Taller de juegos web

Lo que funcionó en Zugzwang (roguelike de ajedrez, Preact + htm por importmap, sin build), en
recetas para repetir en otro juego. Los scripts de `scripts/` son genéricos; el código de
Zugzwang (`tools/`, `src/`) es la implementación de referencia cuando haga falta ver una entera.

## Principios (lo que más tiempo ahorró)

1. **Un solo sitio para cada cosa que crece.** Piezas, jefes, mutaciones, minijuegos, logros, mesas
   y temas se declaran en `src/data/*.js`; pantallas, galería y demos los leen de ahí. Añadir una
   pieza es tocar un archivo. Ejemplo: `src/ui/demos.js` arma la demo de cualquier pieza, mutación o
   jefe desde sus datos, y la partida y la galería la piden ahí.
2. **Cada registro con su comprobación en Node.** `tools/check-registry.mjs` avisa de lo que quedó a
   medias (pieza sin dibujo, logro que nadie otorga, minijuego sin pantalla, demo vacía). Una línea
   de salida si va bien; código 1 y la lista si no. Lo mismo para arte (`art-check`), sonido
   (`sfx-check`) y cada minijuego con lógica (`*-selfcheck`: reglas + partidas bot contra bot).
3. **El arte se edita en su fuente y un importador lo pasa al juego.** Nunca a mano en el código
   generado (cabecera "Generado por …: no editar a mano"). Así el dueño dibuja en su app y corre un comando.
4. **Dos versiones visuales conmutadas por CSS, no por JS.** El juego pinta las dos (vector y píxel)
   y `[data-art="pixel"]` muestra una: cambiar de tema no obliga a repintar nada.
5. **Probar en el navegador de verdad, en móvil y en PC, ratón y dedo**, antes de dar algo por hecho.

## Recetas

### Temas pixel art dibujables (PNG o código)
- Cada tema es una carpeta `art/temas/<id>/` con `tema.json` (nombre, precio, paleta de bandos) y
  dibujos en `dibujos/*.png` o en un `.px.js` de **claude-pxl** (pixel art como código; ver abajo).
- El importador (`tools/pixel-art.mjs` en Zugzwang) recorta lo vacío, **centra por masa** (peso
  visual, no por caja), recolorea la rampa del bando claro a los otros bandos y escribe
  `assets/pixel/<id>/*.png` + un módulo de datos. `tools/pixel-template.mjs` genera la plantilla
  para el dueño: lienzos vacíos del tamaño exacto, calcos del tema base al 33 % y paleta `.gpl`/`.png`.
- CSS del modo píxel: fuente bitmap legible (Jersey 10 iba bien; Pixelify confundía Z/2 y C/O),
  `image-rendering: pixelated`, marcos 9-slice con `border-image`, `border-radius: 0` en todo.
  **Sin filtros SVG para "pixelar" vectores**: se comen los trazos finos y ensucian. Dibuja la versión píxel.
- `url()` dentro de variables CSS se resuelve desde la hoja de estilos: usa `../assets/...`.

### Iconos en dos sets, medidos
- Vector 24×24 (silueta `currentColor` + recortes) y píxel 16×16 dibujado en `.px.js`.
- `scripts/png-icons.mjs <carpeta-png> <salida.js>` pasa los PNG a trazados SVG (tramos de tinta).
- `scripts/icon-metrics.mjs <carpeta>` mide caja, tinta, centro y asimetría. **Iguala con números**:
  tinta 0.22–0.36 (vector) / 0.30–0.48 (píxel), lado mayor ≈ 0.80, centro ±0.03, simetría exacta en
  lo simétrico (en píxel, ancho par para centrar exacto en 16). Mira además una hoja a 40 y 16 px.

### Sonido y música
- Dos variantes por tema: grabado (CC0) en las mesas normales, sintetizado (Web Audio) en las píxel.
- `scripts/audio-import.mjs <origen> <mp3> <salida.js>`: nombre de archivo = efecto (`hit-2.ogg`),
  ffmpeg recorta silencio y normaliza. En el juego, `SAMPLE_GAIN` por efecto devuelve la jerarquía
  (un clic no suena como una explosión) y una variación de tono pequeña evita la repetición.
- Música: bucles CC0 (Open Lo-Fi, Ninja Adventure, Kenney) normalizados linealmente y sonando con
  `AudioBufferSource.loop` (sin el hueco de `<audio loop>`), elegida por pantalla y tema, con fundido
  cruzado. Créditos y licencias junto a los archivos. Arranca con el primer gesto del usuario.

### Demos, galería y logros
- Demo de movimiento = tablerito con el alcance (de siempre en gris, lo nuevo en azul) y la pieza
  saltando a la casilla más lejana. Un módulo la arma desde los datos (`reachPreview` + `demos.js`).
- Galería y Logros comparten la función de agrupado; tocar un logro en la galería abre su ficha.

### Minijuegos
- Lógica pura en `src/game/<id>.js` (testeable en Node), pantalla en `src/ui/screens/<id>.js`,
  registro en el mapa de pantallas y en los datos. Juegos por turnos: bot + self-check con 30 partidas.
- Tiempo real (hockey, bolos): subpasos fijos (1/240 s) con dt recortado, solo `transform` por
  fotograma, pointer events con `setPointerCapture` y `touch-action: none`.
- Táctil: arrastrar debe funcionar igual que el ratón (vista previa bajo el dedo, se suelta y se
  aplica). `onPointerEnter` no existe en el dedo; mide la casilla con `elementFromPoint`.
- Animaciones con Motion: escriben `transform` en línea y **recuerdan el último fotograma**. Centra
  con `translate` (propiedad aparte) y vuelve a cero antes de reanimar el mismo elemento.

### Pruebas en navegador
- `scripts/browser.mjs`: `open()`, `touchDrag()` (toques reales por CDP) y `strip()` (varias
  capturas en una tira reducida). Servidor: `npx http-server -p 8123 -s -c-1 .`
- Recorre lo cambiado a 360×800 (dpr 2.5, táctil) y a 1366×768/1920×912, con tema normal y píxel.
  Mide en vez de suponer: `getBoundingClientRect`, `getComputedStyle(...).transform`, conteo de nodos.
- Rendimiento: `@property` con `inherits:false` para variables animadas, pausar animaciones de fondo
  mientras se reparte, opacidades con valor inicial explícito, nada de `drop-shadow` por pieza en píxel.

## Herramientas externas

| Herramienta | Para qué | Dónde |
|---|---|---|
| claude-pxl | Pixel art como código (`.px.js` → PNG, `ascii` para revisar) | github.com/crsolver/claude-pxl |
| impeccable | Detector de patrones de UI flojos; dejarlo en 0 | github.com/pbakaus/impeccable |
| ponytail | Cambios mínimos con su autocomprobación | github.com/DietrichGebert/ponytail |
| anti-slop, taste-skill | Revisión de calidad de texto y gusto visual | github.com/miqdadbadjuber/anti-slop, github.com/leonxlnx/taste-skill |
| Playwright + Chromium | Pruebas reales | preinstalado en el entorno de Claude Code en la nube |
| ffmpeg | Importar audio | sistema |

## Gastar pocos tokens

- **CLAUDE.md corto en la raíz** con mapa del proyecto, comandos y reglas (plantilla en
  `templates/CLAUDE.md`): cada sesión nueva empieza sabiendo dónde está todo en vez de explorar.
- **Comprobaciones que dicen una línea** si todo va bien y solo los fallos si no.
- **Capturas recortadas o en tira** (`strip`) y a la escala justa: una imagen cuesta lo que cientos
  de líneas de texto. Mide con el DOM antes de mirar una captura.
- **Leer por trozos**: `grep -n` y `sed -n a,bp` en archivos grandes; no releer lo que se acaba de editar.
- **Subagentes para trabajo grande y separable** (dibujar un set de sprites, buscar música, un
  minijuego nuevo) con un encargo cerrado y un informe final breve; el contexto principal solo ve el informe.
- Evitar dos agentes editando el mismo archivo: el que va segundo usa solo ediciones puntuales.
