# Kure'iChaosChess

Roguelike de ajedrez web: HTML/JS sin build, Preact + htm + anime.js + Motion por importmap
(`index.html`). Responde en español. El juego se llama Kure'iChaosChess (antes Zugzwang; las claves
internas `zugzwang.*` se quedan para no borrar partidas guardadas). Rama principal: `main`.
Lanzamiento cercano: cambios acotados.

## Mapa
- `src/data/`: lo que crece. `pieces.js`, `bosses.js`, `mutations.js`, `modifiers.js` (mecánicas y
  minijuegos), `themes.js` (mesas), `pixel-packs.js`/`pixel-themes.js` (generados).
- `src/game/`: lógica pura (`rules.js`, `match.js`, `run.js`, `achievements.js`, un archivo por minijuego).
- `src/ui/`: `app.js` (pantallas; los minijuegos en `src/data/minigame-catalog.js`), `screens/*.js`, `components.js`, `icons.js` (vector)
  + `pixel-icons.js` (generado), `demos.js` (demos de pieza/mutación/jefe), `sfx.js` (efectos y música),
  `moments.js` (cinemáticas y demos), `zen-art.js`.
- `src/view/`: tablero (`board-view.js`), `piece-art.js`, `piece-bodies.js` (generado), `fx.js`.
- `css/`: `base.css`, `screens.css` (una sección por pantalla/minijuego), `pixel.css` (`[data-art="pixel"]`).
- `art/` fuentes → `assets/` generados: `art/temas/<id>/` (temas píxel), `art/vector/` (SVG de piezas),
  `art/iconos/iconos.px.js`, `art/zen/zen.px.js`, `art/sonidos/`. Música en `assets/musica/`.
- `docs/`: arquitectura, roadmap, referencias.

## Comandos
- Servidor: `npx http-server -p 8123 -s -c-1 .`
- Comprobar: `node tools/check-registry.mjs` · `node tools/art-check.mjs` · `node tools/sfx-check.mjs` ·
  `node tools/simulate.mjs` · `node tools/scenarios-selfcheck.mjs` · `node tools/blind-selfcheck.mjs` · `node tools/barrier-check.mjs` · `node tools/hockey-selfcheck.mjs`
- Importar: `tools/pixel-art.mjs` (temas), `tools/vector-art.mjs` (piezas SVG), `tools/pixel-icons.mjs`
  (iconos, tras `pxl build art/iconos/iconos.px.js`), `tools/zen-pixel.mjs`, `tools/sfx-import.mjs`.
- Calidad: detector impeccable a 0 (`impeccable detect css src index.html lab.html`).

## Reglas
- Respuestas al dueño ultracortas (estilo caveman). Ahorrar tokens: leer por trozos, pocas capturas.
- Comentarios en código solo si explican algo no obvio.
- "¿Dónde está X?": `grep -n X docs/MAPA.md` (índice ruta:línea; regenerar con `node tools/regen-mapa.mjs`).
- Buscar/listar en el repo con el subagente `explorador` (Haiku). Archivos > 40 KB: `grep -n` y leer tramos.
- Capturas a densidad 1 salvo que haga falta detalle; `/compact` al cerrar cada pieza larga.
- Editar con la herramienta Edit, no con scripts. No tocar archivos "Generado por …".
- Todo vive centralizado en `src/data/` y según tema píxel o no; lo nuevo se registra ahí y pasa `check-registry`.
- Sonido: grabado en mesas normales, sintetizado en mesas píxel. Iconos y jardín: dos versiones, CSS elige.
- Skills: antislop, ponytail (mínimo + autocomprobación), impeccable, taste; `gaming-references` antes de diseñar;
  `web-game-toolkit` para arte, iconos, audio y pruebas.
- Probar en navegador a 360×800 táctil y en PC, mesa normal y `pixelada`, antes de dar algo por hecho.
- Rama de trabajo indicada en la sesión; push frecuente. Sin PR salvo que se pida.

## Minijuegos
1. Nombre e icono solo en `src/data/modifiers.js`; el resto los lee de ahí.
2. Mecánicas del tablero principal (`rules.js`, `match.js`, bot por perfiles); solo los juegos de otra
   naturaleza (hockey, bolos, conecta 4…) traen las suyas.
3. Variedad: posición, piezas y, si encaja, tamaño de tablero al azar en cada partida.
4. Ponytail y antislop: reutilizar antes que escribir; nada nuevo sin necesidad real.
5. Un solo tablero: `BoardView` (los de ajedrez se declaran en `src/data/scenarios.js`).
6. Animaciones según el tipo (explosión, derrumbe, portal…), las del tablero; no todos llevan liquid.
7. Tres dificultades con aleatoriedad, y cada mesa validada como pasable (selfcheck).
8. Estilos: usar los existentes; crear CSS solo si no hay nada que encaje.
