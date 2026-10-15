# Zugzwang: dirección de diseño

Este archivo es la dirección que exige antislop (R-37) y el registro de razones de una línea
(R-31). Si un cambio no encaja aquí, se cambia este archivo primero.

## Design Read

> Juego de tablero roguelike para jugadores de ajedrez casuales, en lenguaje **caja de juego de
> mesa impresa** (cartón grueso, papel de reglamento, tinta, fichas de madera), dial
> **ENERGY 3 / RHYTHM 2 / MOTION 3**.

- **ENERGY 3**: es un juego. El título extruido como la tapa de una caja, el diorama 3D y el
  tablero son la cara del producto.
- **RHYTHM 2**: pantallas coherentes entre sí (papel sobre mesa) con rupturas claras: el menú
  es asimétrico, el mapa es una lámina vertical y las recompensas son una mano de cartas.
- **MOTION 3**: la coreografía del tablero es el producto (saltos, aplastamientos, derrumbes).
  Todo movimiento responde a una acción del juego; nada anima en bucle.

## Motivo de identidad

**La pieza impresa en cartón**: silueta con contorno de tinta sobre una ficha redonda con canto.
Se repite en las piezas del tablero, el peón del mapa, el emblema del dorso de las cartas, el
favicon y los iconos troquelados de la interfaz.

## Decisiones y su razón (R-31)

| Decisión | Razón |
|---|---|
| Mesa de madera oscura como fondo | La escena es una partida sobre una mesa; las piezas marfil y el papel necesitan un fondo oscuro para leerse (R-21: el tema oscuro sale de la escena, no de la moda). |
| Tres temas (Nogal, Tapete, Pizarra) | Son tres mesas distintas, no modo claro/oscuro; los tres pasan AA en todos los pares de texto (verificado). |
| Paleta: tinta, papel, bermellón, latón | Dos núcleos (tinta y papel), un acento (bermellón) para la acción principal y el bando enemigo, y latón solo para selección y foco. |
| Bermellón solo en el botón principal, el jefe y el bando carmesí | Un acento que marca "esto es lo importante ahora", no decoración. |
| Bricolage Grotesque | Grotesca con trazo de imprenta y ejes de óptica: suena a caja de juego, no a SaaS. Una sola familia con pesos 400 a 800; los números en tabular. |
| Sin monoespaciada | No hay código ni datos técnicos que mostrar; usarla sería un disfraz (impeccable). |
| Piezas Staunton con peana común | Las piezas inventadas comparten peana y collarín con las clásicas para leerse como una misma familia. |
| Figura con el pie en el centro de la ficha | La ficha es la casilla que ocupa la pieza; la figura se apoya en su centro. |
| Iconos troquelados propios | Siluetas macizas con el detalle recortado en el color del fondo, como los pictogramas de un reglamento. Cada icono representa su concepto (hoguera = descanso, zurrón = bolsa, casilla agrietada = derrumbe). |
| Botones con canto inferior sólido | Es el grosor de la ficha de cartón, el mismo canto que muestran las casillas del tablero; se hunde al pulsar. Va acompañado de una sombra difusa real. |
| Paneles de papel con grano | Son las hojas del reglamento y la hoja de puntuación; el grano es fibra de papel, no textura de relleno. |
| Vetas de madera generadas con ruido SVG | Textura de la mesa; no se usan rayas con gradientes repetidos. |
| Cartas en las recompensas | Las recompensas son cartas del juego: la forma de carta es el contenido, no un contenedor. |
| Sombras | Una sola: `--lift` (desplazada y difusa) para lo que está encima de la mesa. Sin halos de color. |
| Radios | 6 / 12 / 20 px según tamaño: inputs y chips, botones, paneles. Las fichas son redondas porque son fichas. |
| Cortina bermellón entre pantallas | El único momento autoral de transición; tapa la carga del tablero. |
| Banner de turno | Aparece solo cuando empieza tu turno y desaparece; marca un cambio de estado real. |
| Curvas `ease-out` exponenciales | Los objetos deceleran como objetos reales; sin rebotes elásticos. El *squash* al aterrizar es física del impacto, no adorno. |
| Anillo rojo bajo una pieza | Marca un estado real: esa pieza puede ser capturada. Sin pulso infinito. |
| Cinemáticas (piso, entrada del jefe, jefe derribado) | Marcan los tres cambios de capítulo de una partida. Franjas de tinta y un rótulo de papel sobre la mesa: es la tarjeta de presentación de la caja. Duran 1,7 s como mucho y se saltan con cualquier toque o tecla (la queja principal de Gambonanza son sus animaciones imposibles de saltar). |
| Rótulos de golpe (¡Jaque!, ¡Reina caída!, ¡Aplastados ×3!, ¡Golpe!, ¡Coronación!, ¡Derrumbe!) | Salen solo cuando cambia algo que el jugador tiene que notar, nunca bloquean y se encolan. El color dice a quién beneficia: latón si es tuyo, rojo si va contra ti. |
| Pausa de impacto al capturar | 70 ms de pausa (160 ms con rey o captura múltiple) para que el golpe tenga peso, como en Gambonanza. |
| Viñeta roja mientras dura el jaque | Estado real y continuo; no parpadea. |
| Centrado óptico | Los iconos se compensan con su desvío medido; las piezas se encuadran por su caja real cuando son icono; los textos grandes recortan el interlineado a la altura de mayúscula (`text-box`). Verificado midiendo el centro de cada icono, texto y figura contra su contenedor en todas las pantallas, en escritorio y móvil. |

## Lo que no se hace

Gradientes de marca, cristal, brillos, eyebrows sobre títulos, flechas decorativas en botones,
emojis, pulsos en bucle, `confirm()` del navegador, cifras inventadas.
