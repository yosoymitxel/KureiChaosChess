# Inventario e integración aislada de Chess Mayhem (APK)

Fuente: el registro MODES y las estructuras MINIGAMES y ARCADE de la carga JavaScript extraída del APK. No se importa su monolito; los prototipos vuelven a implementar comportamientos usando el tablero, las piezas y los VFX de Kure'i Chaos Chess.

## Inventario

- **11 variantes de ajedrez**, aparte de Classic: Chaos Chess, Battle Chess, Zombie Chess, Bomb Chess, Gravity Chess, Boss Chess, Chaos Arena, Card Chess, Micro Chess, Infinite Chess y Mayhem Mode (en el registro del APK aparece como modo secreto ??? MODE).
- **3 minijuegos de tablero**: Pawn Race, Bomb Dodge y Knight's Feast. Estos tres tienen lógica jugable independiente en el laboratorio y quedan fijados en Normal.
- **6 juegos Arcade**: Pawn Dodge, Knight Parkour, Bishop Blaster, Rook Rampage, King Panic y Queen Mode. Son estudios interactivos de la mecánica principal; no portan el runtime arcade completo del APK.

El selector de lab-preview.html muestra 20 opciones con prefijo APK:. Classic no se duplica porque es el ajedrez tradicional.

## Solapamiento con Kure'i

La referencia de diseño del repo es docs/REFERENCE-GAMES.md; el registro real está en src/data/modifiers.js y src/data/minigame-catalog.js.

| Patrón del APK | Sistema del repo | Qué se estudia aislado |
|---|---|---|
| Pawn Race | No equivalente directo | Dado, carrera, casillas de efecto y bot corredor |
| Bomb Dodge | Bombas/derrumbes | Aviso previo, escape por ronda, cráteres y escudos |
| Knight's Feast | Caballo, FX y rejilla | Cronómetro, gemas, combos y riesgos |
| Zombie Chess | Plaga zombi y Contagio | Muestra aislada de persecución, estela verde por bloques, mordida y transformación pixelada; la IA completa de ronda sigue fuera del motor principal |
| Bomb Chess | Bomberman / Campo minado | Explosión 3×3 ligada a una bomba marcada |
| Gravity Chess | Hielo y derrumbe | Deslizamiento global y dirección de gravedad |
| Boss Chess | Jefes multicasilla con HP | Vida, golpes y feedback; no todas las fases de IA del APK |
| Chaos Arena | Modificadores existentes | Director de eventos aleatorios por turnos |
| Card Chess | Cartas tácticas | Cartas de efecto fuera del sistema de cartas principal |
| Micro Chess | Tamaños de tablero | Formato compacto; no sustituye las reglas legales |
| Infinite Chess | Última resistencia / Yo, Zombi | Generación de oleadas y supervivencia sin rey rival |
| Mayhem Mode | Modificadores | Combinación aleatoria de reglas |
| 6 Arcade | Piezas y VFX | Estudios de interacción, movimiento, amenaza, oleadas y puntuación |

## Diferencias visuales: Kure'i frente al APK

El laboratorio separa la escena actual `Kure'i: Plaga zombi (efecto actual)` de `APK · Caza zombi (persecución y mordida)`. La primera conserva `BoardView.infect()`; la segunda usa `src/lab/apk/effects.js`, con canvas y secuencia independientes. El mismo criterio aplica a la estela de movimiento y al impacto por bloques.

La carpeta `references/apk/` conserva el mapa de evidencia y las diferencias observadas en el payload, sin importar el monolito extraído.

## Límites

- Código nuevo del laboratorio en src/lab/apk/; página independiente en tests/apk-lab.html.
- El selector fuerza Normal y deshabilita el control de dificultad al escoger APK:.
- Nada se registra en el motor de partidas, las recompensas ni el catálogo principal de minijuegos.
- Las tres entradas de family: mini son prototipos jugables. Los modos de ajedrez y los seis Arcade son demostraciones de mecánicas, no copias completas de todos sus sistemas.
- Se reutilizan BoardView, Fx, makePiece, las piezas SVG/píxel y las utilidades de movimiento; no se modifica src/game/match.js, src/game/rules.js ni los minijuegos ya existentes.
- Para integrar más adelante, comparar reglas y efectos antes de mover cualquier módulo a la arquitectura principal.
