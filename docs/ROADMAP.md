# Hoja de ruta

Pedidos del dueño ordenados por bloque. Estado: `[ ]` pendiente, `[~]` a medias, `[x]` hecho.
Se actualiza al cerrar cada bloque. La revisión completa del 19/10 añade los bugs al bloque 0.

## 0. Bugs y parches (primero)

- [ ] Jefes: tocar cualquier casilla del jefe debe elegirlo como un solo objetivo (hoy hay toques fallidos que acaban costando el rey).
- [ ] Rótulos y banners: cola con prioridad (jaque > rey/reina caída > derrumbe > resto) y "Tu turno" siempre al final; nunca solapados.
- [ ] Mate en 1 y 2: hay problemas que no son mate; revalidar todos.
- [ ] Bomberman: la mecha no da tiempo a escapar; enemigos con algo de intención.
- [ ] Detector de impeccable: 2 fallos nuevos (brillos de color) y rayas con gradiente repetido.
- [ ] Animación del salto del caballo y la base líquida: comprobar que siguen.

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

## 3. Minijuegos

- [ ] Coherencia visual con el juego (tableros, piezas, fin de partida, ayuda, animaciones).
- [ ] Yo, Zombi: que se entienda (tutorial corto, vista previa del avance).
- [ ] Bomberman ampliado (cruceta en móvil, más mecánicas).
- [ ] Matamarcianos.
- [ ] Jardín Zen como modo tranquilo para conseguir mutaciones o puntos.
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
