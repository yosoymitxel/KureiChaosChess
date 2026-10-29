# Referencia del APK: Zombie Chess

## Comportamiento observado

Fuente: `assets/public/game-source.js` del APK extraído.

| Referencia del payload | Hallazgo |
|---|---|
| Líneas 1235–1236 | La horda caza a ambos ejércitos; tras cada ronda los zombis buscan la pieza viva más cercana. |
| Líneas 1458–1470, `zombiePhase` | Si el zombi está junto a una pieza, ataca. Prefiere una pieza que no sea rey; si no hay objetivo adyacente, avanza un paso hacia el objetivo vivo más cercano. |
| Líneas 1465–1466 | El ataque crea una instrucción de animación `attack` desde el zombi al objetivo y reproduce el sonido zombi. |
| Líneas 1467–1468 | El rey soporta una mordida, no dos. Las piezas grandes reciben dos puntos de daño en lugar de infectarse. |
| Líneas 1175–1176 | La infección cambia la pieza al bando zombi y emite una transformación más el texto `INFECTED!`. |
| Líneas 1757–1759 | La muerte por infección tiene una ráfaga de partículas verdes propia. |
| Líneas 1778–1788 | Aparición/transformación: paleta verde, ráfaga, anillo, destello y escala/flash de corta duración. |
| Líneas 6341–6347 | La demo muestra pasos arrastrados de 520 ms, una casilla infectada, embestida y conversión del peón. |

## Firma visual separada implementada

La reimplementación vive en `src/lab/apk/effects.js`. No copia ni importa el renderer del APK:

1. **Persecución:** pasos animados y estela verde hecha de bloques pixelados.
2. **Mordida:** una trayectoria segmentada conecta el zombi y su objetivo, y remata con un impacto de alto contraste.
3. **Transformación:** anillos cuadrados, fragmentos verdes que ascienden y rótulo `INFECTED!`.
4. **Reglas de esta muestra:** el zombi persigue a una pieza viva y la convierte tras morderla. No pretende ser la IA de turnos completa; es una escena reproducible para comparar.

## Diferencia respecto a la Plaga zombi actual

La escena `Kure'i: Plaga zombi (efecto actual)` continúa disponible en `lab.html`. El método actual `BoardView.infect()` usa 14 partículas de `BoardView.Fx`, una nube de veneno, reconstruye la pieza y la aplasta a escala 0,75 (véase `src/view/board-view.js`, cerca de las líneas 1015–1023).

La versión APK usa una secuencia diferente: persecución visible, ataque entre casillas y conversión con partículas rectangulares. No se cambia el motor principal ni el modificador zombi de Kure'i.
