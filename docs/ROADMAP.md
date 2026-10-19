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

## 3c. Estructura de run (referencia: docs/REFERENCE-GAMES.md)

- [ ] Selector de mecánicas al empezar la run: favoritas que salen mucho más (portal, niebla…) y una vetada.
- [ ] Hordas finales en los minijuegos tipo PvZ (Bolos, Última resistencia, Matamarcianos, Yo Zombi): oleada grande anunciada al final, sin cortes en seco.
- [ ] Logros de mitad y final de run.
- [ ] Modos de juego por grupos de mecánicas (Caos, Hielo y portales, Bombas, Zombi), al estilo de Chess Mayhem.
- [ ] Animación al nivel de Chess Mayhem en lo que ya existe (cartas, derrumbes, capturas).

## 4. Progreso y extras

- [ ] Desbloqueables al estilo Gambonanza: jefes, piezas y temas que se abren al avanzar.
- [ ] Personalización de tablero, piezas y colores.
- [ ] Logros.
- [ ] Galería por grupos y temporadas (Halloween, Navidad), con imágenes que se desbloquean.

## 5. Pedidos del 20/10 (por orden: menos esfuerzo y más impacto primero)

Rápidos:
- [x] Chips del lateral explicables: tocar "N en peligro" resalta cuáles; tocar una mutación dice qué hace.
- [x] Doble caída: el jefe (y "Tu turno") cae, vuelve y cae otra vez con impacto; en el diorama y en la partida.
- [x] Diorama: las piezas de extras se pueden tocar, no solo las etiquetas.
- [x] Yo Zombi: vidas por pieza visibles (peón 1, alfil y caballo 2, torre 3, como zombi normal, de cono y de cubo) y zombis en verde.
- [x] Organizar: carta distinta al resto y que se ejecute sola al empezar, sin quedarse en la mano sin explicación.
- [x] Logros: grupos como al principio (Jardín Zen, Tienda…) al estilo Steam, en rejilla simétrica.
- [x] Generador: torres sin peón delante (se cambian torre por torre en la jugada 1), cañón delante del rey en niveles avanzados, elefantes y camellos sin ninguna jugada posible.

Medios:
- [x] Confeti solo al ganar; explosiones, bombas, caídas y choques con efectos propios.
- [x] Bolos: animación de rodar con su base siguiendo a la pieza y cayendo en su casilla; más carriles y más largo (dificultad en alto y en largo); la ficha como pieza de damas, no un círculo soso.
- [x] Cartas: escalar el bloque entero con transform en mano, tienda y premio (no tocar fuentes); al elegir premio, la carta avanza y las otras se juntan detrás, sin scroll doble en móvil.
- [x] Zoom en móvil: ampliar de verdad y desplazar con dos dedos.
- [~] Rótulos de jefe y reina caída: entrar también de derecha a izquierda y de arriba abajo.
- [ ] Panel lateral con más información (y para el tutorial).

Grandes:
- [ ] Jardín Zen: rediseño completo.
- [ ] Simetría de los SVG revisada; partir de SVG existentes (Iconly y bancos ya citados) y ajustarlos en vez de dibujar de cero.
- [ ] Tema píxel rehecho con personajes de fantasía medieval (skill de pixel art del dueño), muy distintos entre sí.
- [ ] Mutación zombi para los dos bandos: la pieza tocada se vuelve verde y cambia de bando.
- [ ] Minijuegos nuevos: Damas (por tamaño de tablero), 2048 (tablero chico y grande) y uno de combate por turnos estilo Pokémon con ataques por pieza.
- [ ] Bomberman fiel: enemigos que solo vagan y otros que ponen bombas, tablero más ancho como el original.
- [ ] Ajedrez de siempre: enroque, captura al paso, niveles de ajedrez clásico con nivel por Elo.
- [ ] Tutorial: run corta de primera vez y acceso desde el diorama (cómo se mueve cada pieza, mecánicas).
- [ ] Tableros chicos al principio para enseñar mutaciones y piezas nuevas; ritmo de cada run.
- [ ] Animaciones: volver a mirar las librerías (anime.js, Motion) y referencias (componentry, skiper-ui, unlumen, smoothui) para subir el nivel.

## Pendiente del lado del dueño (cuando tenga la PC)

- [ ] Plantilla SVG para dibujar piezas, patrones de tablero y fondos: la prepara Claude en `art/`; el dueño dibuja y sube.
- [ ] Bocetos y dibujos para la Galería (terror, temporadas).
- [ ] Probar en su móvil y PC los cambios grandes y decir qué no le convence.
- [ ] GitHub Pages ya publica la rama; cambiar la rama de Pages si algún día se renombra a `main`.
