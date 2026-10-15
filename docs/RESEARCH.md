# Investigación: herramientas para el rediseño

Fecha: octubre 2026. Objetivo: rehacer Zugzwang con foco visual y de animación, sin perder la
posibilidad de servirlo como estático (CDN, sin build).

## Resumen

Casi todo lo que se pidió cae en dos grupos distintos:

1. **Skills de agente en GitHub** (ponytail, antislop, impeccable, taste-skill): no son código que
   se importe. Son reglas, checklists y, en el caso de impeccable, un detector ejecutable. Se
   clonaron los cuatro repos, se leyeron sus `SKILL.md` y se aplicaron (detalle abajo). La
   dirección resultante está en `DESIGN.md` y `PRODUCT.md`.
2. **Registros de componentes React + Tailwind + shadcn** (Magic UI, Kokonut UI, Unlumen UI,
   Bklit UI): se instalan como código fuente con la CLI de shadcn y **necesitan build** (Tailwind,
   TypeScript, React 19). No se pueden cargar tal cual desde un CDN. En esta versión se portaron
   los *patrones* que interesaban a CSS/JS plano; si algún día se migra a Vite, se pueden
   instalar directamente.

Las dos librerías de animación (anime.js y Motion) sí se usan, cargadas por CDN.

## Tabla de decisión

| Herramienta | Qué es | ¿Se usa? | Cómo |
|---|---|---|---|
| **anime.js v4** | Motor de animación JS (objetos, DOM, CSS vars, timelines, stagger). | **Sí**, motor del tablero | Toda la coreografía de `src/view/board-view.js`: saltos en arco, aplastamientos, derrumbes, caídas, coronación. Anima objetos `{r,c,z}` y vuelca a CSS vars. |
| **Motion (motion.dev)** | Antes Framer Motion. Tiene API vanilla `animate()`. | **Sí**, UI | Cortina entre pantallas, reparto de cartas, banner de turno, peón del mapa, entrada de pantallas. |
| **[Ponytail](https://github.com/DietrichGebert/ponytail)** | Skill de Claude Code: el cambio más pequeño que resuelve la tarea entera. | **Aplicado** | Sin bundler, 5 dependencias, nada de abstracciones "para luego". En la v2.1: borrados antes que añadidos (glare de cartas, etiquetas duplicadas, fuente mono, rótulo de versión), cada cambio verificado con su prueba. |
| **[antislop](https://github.com/miqdadbadjuber/anti-slop)** (miqdadbadjuber) | Reglas R-01 a R-38 + Delivery Gate obligatorio; skills `antislop-ui` y `antislop-code`. | **Aplicado** | `DESIGN.md` con Design Read y diales; teclado completo en el tablero (R-32); sin brillos, iconos genéricos, flechas decorativas, mayúsculas espaciadas ni bucles; contraste AA medido; comentarios sin separadores decorativos; informe PASS/FAIL en cada entrega. |
| **[Impeccable](https://github.com/pbakaus/impeccable)** (pbakaus) | Skill de diseño + detector de anti-patrones (`impeccable detect`). | **Aplicado + detector** | `PRODUCT.md`, *craft floor* (sin eyebrows, sin rebotes, sin monoespaciada de disfraz, superficies del navegador tematizadas). El detector pasa de 1 fallo y 4 avisos a 0. |
| **[taste-skill](https://github.com/Leonxlnx/taste-skill)** (Leonxlnx) | Skills anti-slop; `redesign-skill` para auditar proyectos existentes. | **Aplicado** | Auditoría de `redesign-skill`: títulos en minúscula de frase, sin `confirm()` del navegador, favicon y meta, iconos propios en lugar de un set genérico, foco visible. |
| **Magic UI** | Componentes animados React+Tailwind+Motion. | Patrón portado | Carta que se inclina hacia el puntero (`Card` en `components.js`). |
| **Kokonut UI** | Igual: React 19 + Tailwind v4 + shadcn + Motion. | Patrón portado | Botones que se hunden al pulsar como una ficha. |
| **Unlumen UI** (nombrado como "ulumenui") | Registro de componentes React+Tailwind+Motion (dock, highlight, text reveal). | Patrón portado | Entrada escalonada de los nodos disponibles del mapa. |
| **Bklit UI** | Librería de **gráficas** React (shadcn registry). | No por ahora | Útil más adelante para una pantalla de estadísticas de la run (historial de pisos, piezas perdidas). Requiere build. |
| **Manus (manus.im)** | Agente autónomo de propósito general, no una librería. | No | Podría usarse para generar arte (sprites, fondos) fuera del repo. |

## Referencias de juego

| Juego | Qué se toma | Dónde |
|---|---|---|
| **Gambonanza** (roguelike de ajedrez) | Las reseñas destacan que capturar "tiene peso" → pausa de impacto y rótulos de captura. Su crítica más repetida en Steam son las animaciones que no se pueden saltar (15 s por jefe) → todas nuestras cinemáticas se saltan con un toque y duran 1,7 s como mucho. | `BoardView.hitStop`, `src/ui/moments.js` |
| **Slay the Spire** | La estructura de niveles: un mapa de rutas con nodos de distinto tipo (combate, élite, descanso, bolsa, jefe). Las cartas jugables desde una mano durante el combate, con recompensa de 1 entre 3 tras cada victoria; las mutaciones permanentes hacen de "reliquias" y salen de élites y descansos. Banners cortos de cambio de estado. Su sistema de *intents* (el enemigo anuncia su jugada) sigue propuesto: exige que el bot se comprometa con un plan. | Mapa, `src/game/cards.js`, mano en `game.js`, `CardPick` |
| **Gambonanza** (mecánicas) | Reglas que cambian qué se puede capturar. Para diferenciarnos no copiamos sus reglas de turno: nuestras piezas de élite tienen condiciones de captura (la reina solo cae la última; las torres solo tras su escolta), visibles en el tablero con insignias y cuerdas. | `rules.js → immune`, `generate.js → protectElites` |

Fuentes: [reseña en Movies Games and Tech](https://moviesgamesandtech.com/2026/05/10/review-gambonanza/), [reseñas negativas en Steam](https://steamcommunity.com/app/3509230/negativereviews/?browsefilter=toprated), [wiki de Intent de Slay the Spire](https://slay-the-spire.fandom.com/wiki/Intent).

## Recursos de arte recomendados (siguiente paso)

- **Kenney "Boardgame Pack"** (CC0): fichas, dados, cartas, tableros. Ideal para sustituir las
  bases de las piezas y añadir dados/cartas físicas.
- **game-icons.net** (CC BY 3.0): miles de iconos de juego en SVG, encajan con los iconos de
  mutaciones y modificadores.
- Las siluetas actuales son SVG propios (derivados de las piezas originales), coloreados por
  CSS custom properties, así que un tema nuevo no requiere regenerar imágenes.

## Por qué DOM + CSS 3D y no WebGL/Three.js

- Un tablero de 12×12 con ~50 piezas son < 400 nodos con `transform-style: preserve-3d`: el
  navegador lo compone en GPU sin problemas.
- Clicks, hover, accesibilidad y `elementFromPoint` funcionan sobre elementos en 3D sin
  raycasting.
- Las piezas son *standees* de cartón (como en muchos juegos de mesa): un plano vertical
  contrarrotado frente a la cámara. Se ve 3D sin modelos.
- Si algún día hace falta iluminación real o cámara libre, `BoardView` es la única pieza a
  sustituir (por ejemplo con Three.js o Threlte): la lógica (`src/game`) no toca el DOM.

## Fuentes

- Impeccable: https://impeccable.style · https://github.com/pbakaus/impeccable · https://emelia.io/hub/impeccable-ai-design-skill
- taste-skill: https://github.com/Leonxlnx/taste-skill · https://www.ui-skills.com/skills/leonxlnx/taste-skill
- Ponytail: https://skillselion.com/skills/dietrichgebert/ponytail · https://www.claudepluginhub.com/plugins/dietrichgebert-ponytail
- Kokonut UI: https://github.com/kokonut-labs/kokonutui · https://www.mintlify.com/kokonut-labs/kokonutui
- Unlumen UI: https://21st.dev/@unlumen/library/unlumen-ui
- Bklit UI: https://gittrend.io/repo/bklit/bklit-ui · https://www.skills.sh/bklit/bklit-ui/bklit-ship
- anime.js v4: https://animejs.com · Motion: https://motion.dev
