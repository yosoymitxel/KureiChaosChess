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
| Title | Kure'iChaosChess |
| Project URL | `kurei-chaos-chess` |
| Short description | Ajedrez que muta en cada piso: un roguelike de mesa con jefes gigantes y 28 minijuegos. |
| Classification | Games |
| Kind of project | HTML |
| Release status | Released (o In development si sale como demo) |
| Pricing | No payments o Donate (gratis con donación opcional) |
| Uploads | el zip, marcado **This file will be played in the browser** |

### Opciones del embed

| Opción | Valor |
|---|---|
| Embed options | Embed in page |
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

Para regenerar las capturas, abre el juego en 1280×720 y repite las mismas pantallas: menú, primer piso de una run,
la mesa pixelada, la bruja, brote, hockey y el jardín.

### Metadatos

| Campo | Valor |
|---|---|
| Genre | Strategy |
| Tags | chess, roguelike, roguelite, board-game, turn-based, pixel-art, minigames, local-multiplayer, singleplayer, casual |
| AI generation disclosure | Sí: la música de Open Lo-Fi está generada con Suno. Revisa también el código y el arte antes de marcarlo. |
| Languages | Spanish, English |
| Inputs | Mouse, Touchscreen, Keyboard |
| Average session | A few minutes |
| Multiplayer | Local multiplayer (mismo dispositivo) |
| Player count | 1–2 |

### Descripción (copiar tal cual)

```
Ajedrez que muta en cada piso.

Kure'iChaosChess es un roguelike de mesa: subes una torre de partidas de ajedrez donde cada piso cambia las reglas. Tableros con agujeros, lago helado, portales, niebla, plaga zombi, lluvia de meteoritos… y al final, colosos que ocupan varias casillas y aplastan lo que pisan.

QUÉ TRAE
• 11 piezas: las del ajedrez y otras como la guardia, el camello o el cañón.
• Mutaciones y cartas tácticas que se acumulan durante la run.
• 7 jefes de varias casillas, con vidas.
• 15 mecánicas de piso que se combinan.
• 28 minijuegos inspirados en clásicos de NES: la bruja (Pac-Man), brote (Dr. Mario), damas a ciegas, ventisca, hockey de mesa, conecta 4…
• Partida local a dos en el mismo dispositivo.
• 23 mesas, 17 en pixel art, que cambian todo el juego: piezas, letra, sonido y música.
• Un jardín zen entre runs, tienda, galería y 41 logros.

Se juega en el navegador, en móvil o en PC, con toque, ratón o teclado.

Idiomas: español e inglés (Ajustes → Idioma). Se juega también con mando.
```

```
Chess that mutates every floor.

Kure'iChaosChess is a tabletop roguelike: climb a tower of chess matches where every floor bends the rules. Boards with holes, frozen lakes, portals, fog, zombie plague, meteor showers… and at the top, colossal bosses that take up several squares and crush whatever they step on.

• 11 pieces, mutations and tactical cards
• 7 multi-square bosses
• 15 floor mechanics and 28 NES-inspired minigames
• Local two-player mode
• 23 tables, 17 of them in pixel art

Plays in the browser on mobile or desktop, with touch, mouse, keyboard or a controller. Languages: English and Spanish (Settings → Language).
```

## 4. Antes de publicar

- [ ] `node tools/check-registry.mjs` y `node tools/art-check.mjs` en verde.
- [ ] `node tools/build-itch.mjs` sin errores.
- [ ] Subir el zip como borrador (Draft) y probarlo en la página de itch: en PC, en el móvil y en pantalla completa.
- [ ] Probar una mesa píxel (Ajustes → mesa Pixelada): se ven las piezas y los marcos.
- [ ] Con sonido: se oye al primer toque.
- [ ] Pasar a Public.
