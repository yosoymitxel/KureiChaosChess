---
name: gaming-references
description: Índice de skills, repos y webs que el dueño de Zugzwang eligió como referencia para diseño de juegos, animación, UI y arte. Úsala antes de diseñar una mecánica, un minijuego, una animación, un SVG o un tema visual, para decidir qué fuente consultar en vez de inventar de cero.
---

# Referencias para Zugzwang

Antes de crear algo nuevo, busca primero una referencia aquí y adáptala. Partir de algo que existe y ajustarlo da mejores resultados que dibujar o diseñar desde cero, sobre todo en SVG.

## Cómo usarla

1. Identifica el tipo de tarea (mecánica, minijuego, animación, UI, icono/SVG, pixel art, revisión de calidad).
2. Abre la sección correspondiente y consulta las fuentes en ese orden.
3. Anota en `docs/REFERENCE-GAMES.md` o `docs/REFERENCE-PVZ.md` lo que tomaste y de dónde.
4. Termina siempre con las skills de calidad (última sección).

## Diseño de juego y mecánicas

| Fuente | Para qué |
| --- | --- |
| `docs/REFERENCE-PVZ.md` | Minijuegos al estilo Plants vs. Zombies: oleadas, banderas, hordas finales, Jardín Zen, Bolos de nuez, Yo Zombi, Última resistencia. |
| https://gambonanza.fandom.com/wiki/Gambonanza_Wiki | Wiki de Gambonanza: piezas, jefes, objetos, desbloqueables. |
| `docs/REFERENCE-GAMES.md` | Gambonanza (selector de mecánicas, desbloqueables), Slay the Spire (mapa, rarezas, ritmo), Bomberman (enemigos que vagan y que ponen bombas, tablero ancho), Chess Mayhem (modos Bomba, Gravedad, Zombi, Cartas, Caos; nivel de animación a igualar). |
| https://github.com/gamedev-skills/awesome-gamedev-agent-skills | Catálogo de skills de desarrollo de juegos para agentes: diseño de niveles, balance, game feel. |
| https://github.com/Donchitos/Claude-Code-Game-Studios | Flujo de estudio de juegos con Claude Code: roles, revisión de diseño, pulido. |
| Juegos de NES | Fuente de minijuegos futuros (2048, combate por turnos estilo Pokémon, damas); investigar el original antes de implementar. |

## Animación y UI

| Fuente | Para qué |
| --- | --- |
| Skill `emil-design-eng` | Criterio de animación: duraciones, curvas, qué animar y qué no. |
| anime.js y Motion (ya en el proyecto, por CDN) | Explorar sus demos antes de escribir animaciones a mano: timelines, stagger, spring, path. |
| https://componentry.dev/ | Componentes animados para menús, cartas y paneles. |
| https://skiper-ui.com/ | Efectos y transiciones llamativos (selección de cartas, revelados). |
| https://ui.unlumen.com/ | Microinteracciones y botones. |
| https://smoothui.dev/ | Transiciones suaves y listas animadas. |

Toma la idea y la curva, no el código tal cual: el proyecto usa Preact + htm sin build, y React o Tailwind no entran.

## Iconos, SVG y arte

| Fuente | Para qué |
| --- | --- |
| https://iconly.pro/ | Base para iconos de interfaz: partir de uno y ajustarlo al trazo del juego. |
| Bancos de SVG citados en `docs/REFERENCE-GAMES.md` | Formas reutilizables para piezas y jefes. |
| https://github.com/crsolver/claude-pxl (skill `pxl-pixel-art`) | Tema píxel: DSL `.px.js` que genera PNG (espejo, contorno, variantes por paleta). Úsala para personajes de fantasía medieval, no piezas de ajedrez; cada uno con una silueta muy distinta. |
| `art/` | Plantillas SVG para que el dueño dibuje piezas, tableros y fondos. |

Reglas: comprueba la simetría de cada SVG (eje vertical) y reutiliza contornos que ya existen antes de trazar curvas nuevas.

## Buscar más skills

- Skill `find-skills` y https://skillshubmcp.com/skill/find-skills/: busca una skill antes de escribir una solución propia.
- `lean-ctx`: siempre que uses la shell, para gastar menos tokens (instalado en la PC del dueño).
- `graphify`: siempre que haya que relacionar archivos, para no investigar cada uno aislado (PC del dueño).

## Calidad (siempre al final)

Dos errores mortales a evitar: reinventar lo que ya existe y escribir código de mala calidad.

- `taste-skill` (https://github.com/leonxlnx/taste-skill): imprescindible para UI/UX, junto con antislop UI e impeccable.
- `antislop` (https://github.com/miqdadbadjuber/anti-slop): sin relleno, sin comentarios de más; editar archivos con la herramienta de edición, no con scripts.
- `ponytail` (https://github.com/dietrichgebert/ponytail): cambios mínimos y bien acotados.
- `impeccable`: el detector debe quedar en 0 (`impeccable detect css src index.html lab.html`).
- Skill `web-design-guidelines`: accesibilidad y pautas de interfaz.
