# Zugzwang

Ajedrez mutante en formato roguelike de mesa. Tablero procedural con agujeros, piezas
extra (guardia, camello, cañón…), mutaciones que se acumulan durante la run y jefes que
ocupan varias casillas.

## Jugar en local

No hay paso de build. Sirve la carpeta con cualquier servidor estático:

```sh
npx http-server -c-1 .
# o
python3 -m http.server
```

- `index.html`: el juego.
- `lab.html`: laboratorio de animaciones (escenas aisladas: golpe al jefe, aplastamiento,
  salto, coronación, derrumbe, victoria).

Las dependencias (Preact, htm, anime.js, Motion) se cargan desde jsDelivr con un import map;
hace falta conexión la primera vez.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md): carpetas, flujo de una jugada, jefes multi-casilla,
  cómo funciona la coreografía.
- [Investigación de herramientas](docs/RESEARCH.md): qué se usa de cada librería pedida y por qué.
- `legacy/index.v1.4.html`: la versión monolítica anterior.

## Novedades v2

- Mesa en 3D con CSS: plano inclinado, casillas con grosor, piezas como *standees* de cartón,
  tres cámaras (cenital, mesa, épica).
- Jefes de 2×2 (Titán, Ariete, Hidra) con vidas: aplastan lo que pisan y los atacantes rebotan
  hasta el último golpe.
- Terreno inestable: las casillas se agrietan y caen al vacío.
- Mapa como tablero de juego con un peón que avanza; recompensas como cartas que se reparten
  y se giran.
- Límite de turnos sin capturas: las partidas bloqueadas se deciden por recuento de piezas
  (antes podían quedarse en bucle).
