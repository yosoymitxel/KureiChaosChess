# <Nombre del juego>

Juego web en HTML/JS sin build (<librerías por importmap>). Responde en <idioma>.

## Mapa
- `src/data/`: todo lo que crece (piezas, enemigos, niveles, logros, temas). Se añade aquí y el resto lo lee.
- `src/game/`: lógica pura, testeable en Node.
- `src/ui/screens/`: una pantalla por archivo. `src/ui/app.js`: navegación y mapa de pantallas.
- `css/`: `base.css`, `screens.css` (por sección), `pixel.css` (modo `[data-art="pixel"]`).
- `art/`: fuentes de arte y sonido. `assets/`: lo que generan los importadores (no editar a mano).
- `tools/`: importadores y comprobaciones.

## Comandos
- Servidor: `npx http-server -p 8123 -s -c-1 .`
- Comprobaciones (una línea si va bien): `node tools/check-registry.mjs`, `node tools/art-check.mjs`, `node tools/<x>-selfcheck.mjs`
- Arte: `node tools/<importador>.mjs` tras tocar `art/`.

## Reglas
- Cambios mínimos; lo nuevo con su autocomprobación.
- No editar archivos generados (llevan "Generado por …").
- Probar en navegador a 360×800 táctil y en PC, tema normal y píxel, antes de dar algo por hecho.
- Commits en <rama>; mensajes en <idioma>.
