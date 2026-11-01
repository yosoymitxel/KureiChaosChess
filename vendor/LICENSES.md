# Dependencias y licencias

Las bibliotecas principales del juego se copian localmente para el paquete de itch.io. El SDK opcional de Supabase no se empaqueta: se carga desde un CDN con versión fijada y solo se necesita para cuentas y sincronización.

| Archivo | Paquete | Licencia |
|---|---|---|
| `preact.module.js`, `preact-hooks.module.js` | preact 10.29.8 | MIT |
| `htm.module.js` | htm 3.1.1 | Apache-2.0 |
| `anime.esm.min.js` | animejs 4.5.0 | MIT |
| `motion.esm.js` | motion 12.43.0 (empaquetado con esbuild en un solo archivo) | MIT |
| CDN fijado en el import map | `@supabase/supabase-js` 2.118.0 | MIT |
| `fonts/bricolage-grotesque-latin.woff2` | Bricolage Grotesque (Google Fonts, subconjunto latino) | SIL OFL 1.1 |
| `sprite-fusion/*.js` (shield, fire) | Sprite Fusion Pixel Art VFX (Hugo Duprez), `.ts` pasados a JS con esbuild | MIT |
