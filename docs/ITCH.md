# Publicar en itch.io

## 1. Construir el paquete

```sh
node tools/build-itch.mjs
```

Sale `dist/kurei-chaos-chess-itch.zip` (unos 4 MB y 172 archivos). Lleva `index.html` en la raíz y
carga todo desde dentro del zip:

- **Librerías:** se cargan desde `vendor/`, sin jsDelivr.
- **Letra:** sale de `vendor/fonts/`, sin Google Fonts.
- **Mesas píxel:** sus PNG van incrustados en `src/data/pixel-src.js`. Así el zip queda por debajo del límite de 1000 archivos de itch.
- **Fuera del zip:** el laboratorio y las plantillas de arte.

`dist/` no se sube al repo.

## 2. Crear el proyecto (itch.io → Upload new project)

| Campo | Valor |
|---|---|
| Title | Kure'i Chaos Chess (con espacios: el buscador de itch solo mira el título, y así casa con "chaos chess") |
| Project URL | `kurei-chaos-chess` |
| Short description | Free chess roguelike in your browser: every floor breaks the rules and the bosses fill the board. |
| Classification | Games |
| Kind of project | HTML |
| Release status | Released |
| Pricing | $0 or donate |
| Uploads | **uno solo**, el canal `web` que sube `publicar.ps1` (butler), marcado *This file will be played in the browser*. Borra el zip subido a mano: dos archivos hacen que aparezca **Descargar ahora**, que no lleva a nada útil. |

### Opciones del embed

| Opción | Valor |
|---|---|
| Embed options | Embed in page (no "Click to launch in fullscreen": en PC se juega sin salir de la página y la descripción queda a la vista) |
| Viewport dimensions | 1280 × 720 |
| Mobile friendly | Sí, orientación **Portrait** (el juego está pensado también para 360×800) |
| Automatically start on page load | No: con un clic para empezar, el navegador deja sonar el audio |
| Fullscreen button | Sí |
| Enable scrollbars | No |
| SharedArrayBuffer support | No hace falta |

El juego guarda la partida en `localStorage`; en itch funciona igual dentro del iframe.

## 3. Página

### Imágenes

- **Cover image:** `docs/itch/cover.png` (1260×1000, proporción 630:500).
- **Screenshots**, en este orden:
  1. `docs/img/menu-walnut.jpg`
  2. `docs/img/partida.jpg`
  3. `docs/img/partida-pixel.jpg`
  4. `docs/img/mini-witch.jpg`
  5. `docs/img/mini-outbreak.jpg`
  6. `docs/img/mini-hockey.jpg`
  7. `docs/img/jardin.jpg`
  8. `docs/img/movil.jpg`
- **Trailer:** pendiente (vídeo promocional).
- **GIF** (4,5 s, el Titán cae y se reparten las piezas): `docs/itch/menu-walnut.gif` y `docs/itch/menu-pixelada.gif`.
  Van dentro de la descripción, uno bajo el primer párrafo y el otro antes de "And more"; el devlog lleva el de pixelada.
  Se regeneran grabando el menú con Playwright y pasándolo por ffmpeg (paleta de 128 colores, 15 fps, 720 px).

Para regenerar las capturas, abre el juego en 1280×720 y repite las mismas pantallas: menú, primer piso de una run,
la mesa pixelada, la bruja, brote, hockey y el jardín.

**Promo images** (Metadatos → Promo images), ya hechas con el propio juego:

| Campo | Archivo |
|---|---|
| Social media image | `docs/itch/social-1200x630.png` (o `social-1200x630-pixel.png`) |
| Favicon | `docs/itch/favicon-512.png` |
| Wide cover (21:9) | `docs/itch/wide-cover-21x9.png` (2520×1080) |
| Logo | `docs/itch/logo.png` (PNG transparente, se lee sobre blanco y sobre negro) |

### Metadatos

| Campo | Valor |
|---|---|
| Genre | Strategy |
| Tags (10) | chess, roguelike, roguelite, turn-based-strategy, board-game, boss-battle, pixel-art, minigames, procedural-generation, singleplayer. Fuera `casual` (no describe nada) y `turn-based` (ya va en turn-based-strategy, que tiene su propia página de Browse). |
| AI generation disclosure | **Yes**: código escrito con Claude y la música de Open Lo-Fi generada con Suno. Itch pide marcarlo aunque esté editado a mano. |
| Languages | English, Spanish; Castilian, Spanish; Latin America |
| Inputs | Keyboard, Mouse, Touchscreen, **Gamepad (any)** (el juego tiene mando básico) |
| Accessibility | Interactive tutorial (la run tutorial de 4 pisos) |
| Average session | About a half-hour (una run) |
| Multiplayer | Local multiplayer (mismo dispositivo) |
| Player count | 1–2 |
| External links | el repositorio de GitHub, si sigue público |

### Tema de la página (Edit theme)

Ahora mismo la página usa el tema por defecto de itch (gris claro, rojo de itch, Lato): no se parece al juego.
Con los colores del propio juego, una base, una tinta y un acento:

| Campo | Valor | Qué es en el juego |
|---|---|---|
| BG | `#24180f` | la mesa de nogal |
| BG 2 | `#f6eedc` | el papel de los paneles |
| Text | `#1d140d` | la tinta |
| Link | `#c12d00` | el rojo de la cinta del logo |
| Button (More options) | fondo `#c12d00`, texto `#f6eedc` | el botón Empezar run |
| Banner | `docs/itch/logo.png` | el logo encima de todo, sin repetir el título en texto |
| Embed BG | `docs/itch/embed-bg-1280x720.png` (1920×1080, mismo 16:9 que el embed) | el menú con el Titán, detrás del botón Run game |
| Background | sin imagen: color plano | |
| Screenshots | a la derecha (Right column), para que la descripción no quede debajo de ocho capturas |

En la descripción, una imagen entre secciones (el jefe, la mesa pixelada, un minijuego) y nada de líneas
decorativas (`———`) ni títulos en mayúsculas: la sección se nombra con un encabezado normal.

### Descripción (copiar tal cual)

El primer párrafo es lo que leen Google y los buscadores con IA: dice qué es, que es gratis y dónde se
juega. Los `##` son encabezados (en el editor de itch: Heading 2). Entre secciones, una captura.

```
Kure'i Chaos Chess is a free chess roguelike you play in the browser. Climb a tower of chess matches where every floor breaks a rule, and face colossal bosses that take up several squares at the top.

## Every floor bends the rules
Frozen lakes where pieces slide, portals, thick fog, a zombie plague, meteor showers, a board that collapses under you. Eleven floor rules that mix as you climb, on boards of different sizes and shapes.

## Your army mutates
Eleven pieces: the classic six plus the guard, the camel, the cannon and more. Win floors to earn mutations (a knight that also moves like a bishop, a king that walks two squares) and tactical cards you play once per turn.

## Seven bosses
The Titan, the Hydra, the Golem and four more: colossi with several lives that take up several squares and crush whatever they step on.

## 28 minigames between floors
Short games inspired by NES classics, played with chess pieces: a witch maze in the style of Pac-Man, a chain outbreak in the style of Dr. Mario, blind queens, a blizzard, connect four, air hockey.

## And more
Local two-player mode on the same device. 26 tables (17 in pixel art) that change pieces, font, sound and music. A zen garden between runs, a shop, a gallery and 68 achievements.

## Questions
Is it free? Yes, and it runs in the browser: nothing to install.
Does it work on a phone? Yes, it is built for touch screens from 360 px wide.
Can two people play? Yes, on the same device.
How long is a run? About half an hour; the tutorial run takes four floors.
Languages? English and Spanish (Settings → Language).
Controls? Touch, mouse, keyboard or a gamepad.
```

```
Kure'i Chaos Chess es un roguelike de ajedrez gratis que se juega en el navegador. Subes una torre de partidas de ajedrez donde cada piso rompe una regla, y arriba esperan colosos que ocupan varias casillas.

## Cada piso cambia las reglas
Lagos helados donde las piezas resbalan, portales, niebla densa, plaga zombi, lluvia de meteoritos, un suelo que se derrumba. Once reglas de piso que se mezclan mientras subes, en tableros de tamaños y formas distintas.

## Tu ejército muta
Once piezas: las seis del ajedrez y la guardia, el camello, el cañón y más. Cada piso ganado da mutaciones (un caballo que también se mueve como alfil, un rey que anda dos casillas) y cartas tácticas que juegas una por turno.

## Siete jefes
El Titán, la Hidra, el Gólem y cuatro más: colosos con varias vidas que ocupan varias casillas y aplastan lo que pisan.

## 28 minijuegos entre pisos
Juegos cortos inspirados en clásicos de NES, con piezas de ajedrez: la bruja (al estilo Pac-Man), brote (al estilo Dr. Mario), damas a ciegas, ventisca, conecta 4, hockey de mesa.

## Y además
Partida local a dos en el mismo dispositivo. 26 mesas (17 en pixel art) que cambian piezas, letra, sonido y música. Un jardín zen entre runs, tienda, galería y 68 logros.

## Preguntas
¿Es gratis? Sí, y se juega en el navegador: no hay que instalar nada.
¿Funciona en el móvil? Sí, está pensado para pantallas táctiles desde 360 px de ancho.
¿Se puede jugar a dos? Sí, en el mismo dispositivo.
¿Cuánto dura una run? Una media hora; la run de tutorial son cuatro pisos.
¿Idiomas? Español e inglés (Ajustes → Idioma).
¿Controles? Toque, ratón, teclado o mando.
```

### Devlog de lanzamiento (Devlog → New post, tipo *Release*)

Va por correo a quien te sigue y aparece en la portada de devlogs: publícalo el mismo día que pasas la
página a Public. Adjunta la captura de la mesa pixelada como imagen del post.

```
Título: Kure'i Chaos Chess is out: chess that mutates every floor

Kure'i Chaos Chess is now public and free to play in the browser.

It started as a question: what if every game of chess broke one rule, and you had to climb a tower of them? The answer became a roguelike with frozen lakes, portals, zombie plagues and a Titan that takes up four squares.

What's in this first release
- 11 pieces, 11 floor rules, 7 bosses and 28 NES-inspired minigames
- 26 tables, 17 in pixel art
- English and Spanish, touch, mouse, keyboard and gamepad
- A zen garden where the coins you earn on the board grow flowers

Recently added
- Leave a match and come back to it later, or restart the floor with the hand you had
- Coins, leaves and the odd butterfly to collect on the board
- Tap a side in the panel to see every square it can reach next move

What's next
Bug fixes from your comments first, then a trailer and more bosses.

If you play, tell me in the comments which floor rule beat you.
```

```
Título: Kure'i Chaos Chess ya está aquí: ajedrez que muta en cada piso

Kure'i Chaos Chess ya es público y se juega gratis en el navegador.

Empezó con una pregunta: ¿y si cada partida de ajedrez rompiera una regla y tuvieras que subir una torre de ellas? La respuesta fue un roguelike con lagos helados, portales, plagas zombi y un Titán que ocupa cuatro casillas.

Qué trae esta primera versión
- 11 piezas, 11 reglas de piso, 7 jefes y 28 minijuegos inspirados en NES
- 26 mesas, 17 en pixel art
- Español e inglés; toque, ratón, teclado y mando
- Un jardín zen donde las monedas que ganas en el tablero se vuelven flores

Lo último
- Sal de una partida y retómala después, o reinicia el piso con la mano que tenías
- Monedas, hojas y alguna mariposa que recoger en el tablero
- Toca un bando en el panel y ves todas las casillas a las que llega

Lo que viene
Primero los errores que comentéis, después un tráiler y más jefes.

Si juegas, cuéntame en los comentarios qué regla de piso te ganó.
```

Comunidad: activa **Comentarios** (el devlog pide que comenten y la actividad cuenta para Browse).

## 4. Posicionamiento (SEO, GEO, AEO)

Cómo funciona itch ([guía oficial](https://itch.io/docs/creators/getting-indexed)):

- **El buscador de itch solo busca por título.** El texto y las tags no son consultas: por eso el título
  único (Kure'iChaosChess) ya ayuda. Las tags sirven para las páginas de Browse (`/games/tag-chess`…).
- **Indexado:** pública, con portada, jugable en el navegador. Primera venta → revisión manual de días.
- **Browse sube por actividad real:** visitas, clics en la portada (CTR), colecciones y seguidores en las
  primeras horas. Avisar a conocidos el día de salida; no salir durante un Ludum Dare.
- **Tags:** 10 como máximo, de lo general a lo concreto (género, tema, mecánica). Mal etiquetar puede
  desindexar.
- **Metadatos completos** (idiomas, entradas, jugadores, accesibilidad): cada campo es otra página de Browse.
- **Devlogs** en cada actualización grande: van por correo a seguidores y cuentan para el ranking.

Google (SEO) lee la página de itch, no el `index.html` del zip (va en un iframe). Ahí cuentan el título,
la Short description (sale como meta description: frase con "chess roguelike" y "browser") y el primer
párrafo de la descripción.

IA (GEO/AEO: ChatGPT, Perplexity, AI Overviews) cita lo que encuentra en texto plano y en sitios que ya
cita: Reddit (r/WebGames, r/chess, r/roguelikes), Wikipedia, YouTube. Ayuda:

- Una frase-respuesta al principio: "Kure'iChaosChess es un roguelike de ajedrez gratis para el navegador…".
- Datos concretos y contables (11 piezas, 7 jefes, 28 minijuegos), ya en la descripción.
- Un bloque de preguntas cortas al final de la descripción de itch (¿Es gratis? ¿Va en el móvil?…).
- El mismo nombre exacto en todas partes (itch, GitHub, Reddit, vídeos).

Web propia (GitHub Pages): `index.html` lleva canonical, Open Graph con imagen, Twitter card, JSON-LD
`VideoGame` y un `<noscript>` con texto legible para buscadores; `sitemap.xml` y `llms.txt` en la raíz.
La página de itch (https://yosoymitxel.itch.io/kurei-chaos-chess) ya está en `sameAs` del JSON-LD y en
`llms.txt`; al pasarla a Public, enlazarla también desde el README.
Dar de alta `sitemap.xml` en Google Search Console (un sitio de proyecto en `github.io` no controla
`robots.txt`, que solo vale en la raíz del dominio).

Skills de referencia (auditorías con Claude Code, no instaladas): [claude-seo](https://github.com/AgriciDaniel/claude-seo),
[geo-seo-claude](https://github.com/zubair-trabzada/geo-seo-claude),
[SEO-GEO-AEO-Skill](https://github.com/SNLabat/SEO-GEO-AEO-Skill). Sirven para webs con muchas páginas;
para un juego de una sola página basta con esta lista.

### Cuándo publicar

Martes a jueves, a las 14:00 UTC (11:00 en Paraguay, 9:00 en Nueva York): pilla la mañana de EE. UU. y
la tarde de Europa, y deja todo el día para la primera ola de visitas. Evitar las fechas en que acaban
jams grandes (muchas entregas a la vez): en noviembre de 2026, la Unity Game Jam (≈ 12–14 nov) y la
Game Off (cierra el 1 dic), y la semana de Acción de Gracias (26–30 nov).

## 5. Antes de publicar

- [ ] `node tools/check-registry.mjs` y `node tools/art-check.mjs` en verde.
- [ ] `node tools/build-itch.mjs` sin errores.
- [ ] Subir el zip como borrador (Draft) y probarlo en la página de itch: en PC, en el móvil y en pantalla completa.
- [ ] Probar una mesa píxel (Ajustes → mesa Pixelada): se ven las piezas y los marcos.
- [ ] Con sonido: se oye al primer toque.
- [ ] Pasar a Public.
