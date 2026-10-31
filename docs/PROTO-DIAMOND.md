# PROTO · Rombo Real

Prototipo exclusivo del banco de pruebas, abierto desde lab-preview.html. No pertenece al catálogo de minijuegos de la run y no altera partidas, progreso, economía ni desbloqueos.

## Reglas

- Tablero romboidal de 13×13, con 85 casillas jugables (radio Manhattan 6).
- Dos ejércitos de cuatro piezas: rey, torre, alfil y caballo.
- Rey marfil en el vértice izquierdo; rey carmesí en el derecho.
- Reutiliza sin modificar BoardView, makePiece, Match, rules.js, botChooseMove, RIVALS y los temas actuales.
- Gana quien captura el rey contrario. Los movimientos son los del juego principal; las esquinas recortadas se tratan como huecos y no pueden ocuparse ni atravesarse.

## Dificultad

- Fácil: RIVALS.aprendiz — permite errores y juega con menos cuidado.
- Normal: RIVALS.oficial — prioriza capturas y presión.
- Difícil: RIVALS.maestro — evita entregar piezas y protege mejor al rey.

## Validación

- tools/proto-diamond-selfcheck.mjs: geometría, simetría, posición inicial, movimientos legales, respuesta de IA, dificultad, victoria, derrota y partidas bot contra bot.
- tools/proto-diamond-playwright.mjs: selección, movimiento humano, respuesta de IA, cambio de dificultad y reinicio en 390×844 táctil y 1366×850 escritorio.
