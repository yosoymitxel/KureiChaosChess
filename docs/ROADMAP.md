# Hoja de ruta

Pedidos del dueño ordenados por bloque. Estado: `[ ]` pendiente, `[~]` a medias, `[x]` hecho.
Se actualiza al cerrar cada bloque. La revisión completa del 19/10 añade los bugs al bloque 0.

## 0. Bugs y parches (primero)

- [x] Jefes: tocar el jefe lo elige como un solo objetivo y se juega la jugada que lo golpea (19/10).
- [x] Ninguna partida normal o de élite empieza con una pieza colgando (antes 117 de 300). Con jefe sigue pasando en 1 de cada 5: el jefe alcanza la primera fila de entrada; falta colocarlo más atrás.
- [x] Rareza de cartas: canto doble de tinta (rara) o latón (épica), gema más grande (19/10).
- [ ] Rótulos y banners: cola con prioridad (jaque > rey/reina caída > derrumbe > resto), el bot espera a que terminen y "Tu turno" siempre al final.
- [x] Mate en 1 y 2: solo mates reales, 15+15 problemas verificados (19/10).
- [~] Bomberman: alcance con tope y enemigos que esquivan (19/10).
- [x] Detector de impeccable en 0 (19/10).
- [ ] Salto del caballo: el efecto líquido corre antes del salto y lo tapa; quitarlo para los saltadores.
- [ ] Cañón: hoy tiene alcance 4; debe moverse como torre. Guardia: el doble paso en diagonal no debe poder ir hacia atrás.
- [ ] Carta "Organizar": el cupo cuenta piezas y no intercambios (un tablero 9×9 da uno solo); título ilegible.
- [ ] Zoom: hace falta desplazar con dos dedos y ampliar desde el punto del pellizco.
- [ ] Info de terreno al pasar o mantener pulsado, sin cola.
- [ ] Menú: con una mesa de pago no comprada, el diorama se pinta a píxel antes de volver a la de serie.

## 1. Claridad de la partida

- [ ] Info al tocar terreno (hielo, portal…) y piezas con reglas especiales.
- [ ] Variantes de élite (escolta, reina última, jefe) explicadas antes de empezar, con color propio, y que aparezcan de a poco en la run.
- [ ] Cartas: rareza (gema y marco) y tipo (táctica, mutación, objeto) distinguibles de un vistazo.
- [ ] Zoom y desplazamiento con dos dedos en móvil para tableros grandes.

## 2. Reglas y contenido de la partida

- [ ] Cañón: se mueve como torre y puede saltar una pieza; si es propia cae una más allá, si es rival la captura tras la pantalla.
- [ ] Pieza tipo consejero (paso de rey sin retroceder): dos en diagonal hacia delante y uno a los lados.
- [ ] Formaciones variadas: de 2 a 4 filas, pirámide, pirámide invertida (esquinas fuertes), dos líneas simples; siempre con capa de protección delante del rey.
- [ ] Carta "Organizar": 2/4/6/8 intercambios antes de empezar y botón "Comenzar".
- [ ] Bolos: piezas grandes con más vida según tipo.
- [ ] Ritmo del mapa al estilo PvZ: niveles normales, minijuego y mini-jefe (variantes de élite), en orden aleatorio pero sensato.

## 3. Minijuegos (referencia: docs/REFERENCE-PVZ.md)

- [ ] Coherencia visual con el juego (tableros, piezas, fin de partida, ayuda, animaciones).
- [ ] Móvil primero: los minijuegos muy verticales necesitan contenido o paneles a los lados en pantallas anchas, y menús propios en vez del carril genérico.
- [ ] Mecánicas fieles al original y animadas: Bolos (cinta, línea roja, rebotes por carril, ficha explosiva, cadenas), Yo Zombi (trofeos por columna, monedas al capturar, avance animado), Última resistencia (asalto por banderas con pausa para reforzar), Mate en 2, Matamarcianos.
- [ ] Bomberman y Jardín Zen: hoy casi sin animación (explosión, pasos, crecer, mecerse, monedas que saltan).
- [ ] Dificultades de los minijuegos revisadas jugando, no solo con bots.
- [x] Mate en 1 y 2: solo mates reales (19/10).
- [~] Bomberman: alcance con tope y enemigos que esquivan (19/10); falta cruceta, animación y más mecánicas.
- [ ] Matamarcianos.
- [ ] Jardín Zen como modo tranquilo para conseguir mutaciones o puntos, al estilo del original.

## 3b. Audio, economía y generadores

- [ ] Audio: los sonidos sintetizados actuales son pobres; rehacer con criterio (impacto, captura, interfaz, ambiente opcional y silencioso por defecto).
- [~] Economía: semilla/flor y monedas por minijuego arregladas (19/10); revisar precios de cartas, mesas y ganancias por nodo de punta a punta.
- [ ] Niveles de dificultad de la run, generador de niveles y generador de piezas (formaciones) revisados juntos.
- [ ] Visual de las piezas: revisar las nuevas (píxel) y la coherencia de la familia.
- [ ] Ideas futuras: más retro (PvZ, Slay the Spire, Gambonanza).

## 4. Progreso y extras

- [ ] Desbloqueables al estilo Gambonanza: jefes, piezas y temas que se abren al avanzar.
- [ ] Personalización de tablero, piezas y colores.
- [ ] Logros.
- [ ] Galería por grupos y temporadas (Halloween, Navidad), con imágenes que se desbloquean.

## Pendiente del lado del dueño (cuando tenga la PC)

- [ ] Plantilla SVG para dibujar piezas, patrones de tablero y fondos: la prepara Claude en `art/`; el dueño dibuja y sube.
- [ ] Bocetos y dibujos para la Galería (terror, temporadas).
- [ ] Probar en su móvil y PC los cambios grandes y decir qué no le convence.
- [ ] GitHub Pages ya publica la rama; cambiar la rama de Pages si algún día se renombra a `main`.
