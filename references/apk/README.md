# Referencias aisladas del APK

Esta carpeta contiene observaciones verificables del payload web extraído de Chess Mayhem y el contrato visual para compararlo con Kure'i Chaos Chess.

## Fuente examinada
- Archivo extraído localmente: `assets/public/game-source.js` dentro de `kureichess-apk-extracted-source.zip`.
- El payload (aprox. 1,97 MB) no se copia al repositorio: es un monolito de referencia, no una dependencia del juego.
- La descompilación nativa DEX no forma parte de estas observaciones; la evidencia corresponde al JavaScript web del APK.

## Archivos
- [Zombie Chess](./zombie-chess.md): reglas, secuencia visual y contraste con el efecto zombi existente.
- [Contrato de efectos](./effects-contract.md): qué significa mantener una implementación APK realmente independiente.

Cada nueva referencia debe guardar tres cosas: comportamiento observado en el APK, comportamiento actual de Kure'i y diferencia concreta reproducible en el laboratorio. No basta con duplicar el nombre de una función existente.
