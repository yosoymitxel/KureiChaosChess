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
| Paleta: tinta, papel, bermellón, latón | Dos núcleos (tinta y papel), un acento (bermellón) para la acción principal y el bando enemigo, y latón para selección, foco y la ficha de descanso (la hoguera). |
| Bermellón solo en el botón principal, el jefe y el bando carmesí | Un acento que marca "esto es lo importante ahora", no decoración. |
| Bricolage Grotesque | Grotesca con trazo de imprenta y ejes de óptica: suena a caja de juego, no a SaaS. Una sola familia con pesos 400 a 800; los números en tabular. |
| Sin monoespaciada | No hay código ni datos técnicos que mostrar; usarla sería un disfraz (impeccable). |
| Piezas Staunton con peana común | Todas las piezas, clásicas e inventadas, se apoyan en la misma peana. Cada cuerpo se mide y se escala a una altura de una escala fija que sigue la jerarquía (peón el más bajo, rey el más alto) con un ancho máximo; el grosor de trazo se compensa para que no cambie con la escala. El caballo se centra por su cuello, no por su caja. El penacho de la guardia puede sobresalir de la escala porque pesa poco visualmente. |
| Figura con el pie en el centro de la ficha | La ficha es la casilla que ocupa la pieza; la figura se apoya en su centro. |
| Iconos troquelados propios | Siluetas macizas con el detalle recortado en el color del fondo, como los pictogramas de un reglamento. Cada icono representa su concepto (hoguera = descanso, zurrón = bolsa, casilla agrietada = derrumbe). |
| Botones con canto inferior sólido | Es el grosor de la ficha de cartón, el mismo canto que muestran las casillas del tablero; se hunde al pulsar. Va acompañado de una sombra difusa real. |
| Paneles de papel con grano | Son las hojas del reglamento y la hoja de puntuación; el grano es fibra de papel, no textura de relleno. |
| Vetas de madera generadas con ruido SVG | Textura de la mesa; no se usan rayas con gradientes repetidos. |
| Cartas en las recompensas | Las recompensas son cartas del juego: la forma de carta es el contenido, no un contenedor. |
| Anatomía única de carta | Toda carta (recompensa o mano) tiene marco del color de su tipo (bermellón = táctica, latón = mutación, tinta = objeto), gema de rareza, cartela de título, ventana de ilustración, línea de tipo y caja de texto. La figura siempre es papel con contorno de tinta, sea pieza o icono, para que ninguna carta parezca de otra baraja. La tienda repite la gema entre el texto y el precio de cada carta, y Reglas la explica con una leyenda al pie. |
| Mano en franja propia bajo el tablero | Las cartas no tapan piezas; al apuntar, la carta elegida sube y el tablero marca objetivos en latón y la vista previa del resultado. |
| Apuntar una carta | Las piezas válidas llevan un aro discontinuo de latón y las demás se apagan. Al pasar por encima (o con el primer toque en móvil, porque no hay hover) la pieza se marca, sus casillas nuevas salen en azul (`--gain`, distinto del verde de "puedes mover ya") y una nota de papel dice qué cambia. En móvil, el segundo toque juega la carta. |
| Insignias y cuerda de escolta | La regla de captura de élite se lee en el tablero sin abrir el manual. |
| Salidas con gesto propio | Al mapa: las piezas despegan y el tablero se desmonta. Reiniciar: las piezas se recogen al centro. Rendirse: el rey se tumba (el gesto clásico de abandonar en ajedrez) y la mesa pierde el color. |
| Sombras | Una sola: `--lift` (desplazada y difusa) para lo que está encima de la mesa. Sin halos de color. |
| Radios | 6 / 12 / 20 px según tamaño: inputs y chips, botones, paneles. Las fichas de partida son redondas porque son fichas; la de minijuego es cuadrada porque es otro juego. |
| Cortina bermellón entre pantallas | El único momento autoral de transición; tapa la carga del tablero. |
| Banner de turno | Aparece solo cuando empieza tu turno y desaparece; marca un cambio de estado real. |
| Curvas `ease-out` exponenciales | Los objetos deceleran como objetos reales; sin rebotes elásticos. El *squash* al aterrizar es física del impacto, no adorno. |
| Anillo rojo bajo una pieza | Marca un estado real: esa pieza puede ser capturada. Sin pulso infinito. |
| Cinemáticas (piso, entrada del jefe, jefe derribado) | Marcan los tres cambios de capítulo de una partida. Franjas de tinta y un rótulo de papel sobre la mesa: es la tarjeta de presentación de la caja. Duran 1,7 s como mucho y se saltan con cualquier toque o tecla (la queja principal de Gambonanza son sus animaciones imposibles de saltar). |
| Rótulos de golpe (¡Jaque!, ¡Reina caída!, ¡Aplastados ×3!, ¡Golpe!, ¡Coronación!, ¡Derrumbe!) | Salen solo cuando cambia algo que el jugador tiene que notar, nunca bloquean y se encolan. El color dice a quién beneficia: latón si es tuyo, rojo si va contra ti. Cada uno anima su pieza (de la antigua galería): la reina capturada se vuelca y se rompe, el rey estalla, el peón gira y sale reina, el rey en jaque tiembla, el jefe pisa con polvo, la casilla se agrieta y cae. |
| Base líquida al mover | La ficha se funde en un charco con su mismo contorno de tinta y canto, que se estira por todas las casillas del recorrido (dobla la esquina de la L), se recoge tras la pieza y vuelve a ser ficha. Dice de un vistazo qué casillas cruza la jugada. Se omite con movimiento reducido. |
| Pausa de impacto al capturar | 70 ms de pausa (160 ms con rey o captura múltiple) para que el golpe tenga peso, como en Gambonanza. |
| Minijuegos con el vocabulario del tablero | Salto con charco, brote, golpe y derribo son la coreografía de la mesa (MOTION 3); el minijuego los reutiliza en vez de inventar copia propia. La derrota apaga el color de la mesa. |
| Troquel por tipo de nodo en el mapa | La forma y el color dicen qué es el nodo antes de leer el título: redonda de papel = partida de ajedrez (élite en tinta y latón, jefe bermellón y grande), cuadrada verde (`--side-wild`) = minijuego, latón = descanso, cuero (`--paper-3`) = bolsa, rombo latón con la corona del jefe = minijefe. La lista de Minijuegos repite la ficha cuadrada. |
| Un glifo por minijuego | Varios minijuegos enseñaban el icono de un evento de batalla (bomber el derrumbe, bolos la prisa, mate la coronación, marcianos la calavera) y dos cosas distintas parecían la misma; ahora cada uno tiene silueta propia (bomba, bolo, diana, invasor). |
| Un glifo por mutación | La Reina estratega (épica) enseñaba el mismo arte que la carta Ascenso y las dos parecían lo mismo; ahora lleva silueta propia con corona, ojo calado y peana, en el estilo troquelado del set. |
| Minijefes en un piso de un solo nodo | Es la antesala del jefe: no hay ruta que la esquive, y el minijefe enseña con dos oficiales la estrella que el jefe final reparte entre todos. |
| Jardín Zen: semillas, herramientas y terreno | Semillas de verdad: una por siembra, caen al ganar un nodo (una, frente a las monedas del botín) y se compran en la tienda a 12. Herramientas: regar acorta la espera a la mitad una sola vez por planta, cavar convierte la tierra virgen en tiesto y cortar cosecha la flor. El cantero de siempre (4×4) queda arriba a la izquierda y cada anillo nuevo cuesta el doble (30, 60, 120, 240) hasta 8×8; todo se pinta con los tokens de la mesa elegida en Configuración. En pantalla ancha el cantero va a la izquierda y el carril derecho ordena el trabajo en bloques con rótulo (semillas contadas, teclas de herramienta, barra de ampliar con precio y tienda secundaria); en móvil el cantero va primero. |
| Viñeta roja mientras dura el jaque | Estado real y continuo; no parpadea. |
| Centrado óptico | Los iconos se compensan con su desvío medido; las piezas se encuadran por su caja real cuando son icono; los textos grandes recortan el interlineado a la altura de mayúscula (`text-box`). Verificado midiendo el centro de cada icono, texto y figura contra su contenedor en todas las pantallas, en escritorio y móvil. |

## Lo que no se hace

Gradientes de marca, cristal, brillos, eyebrows sobre títulos, flechas decorativas en botones,
emojis, pulsos en bucle, `confirm()` del navegador, cifras inventadas.
