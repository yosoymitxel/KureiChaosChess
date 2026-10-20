# Sonidos grabados

Las mesas normales suenan con estos archivos; las mesas píxel suenan con los sintetizados de
`src/ui/sfx.js` (de maquinita, a juego con el arte). Un efecto sin archivo suena sintetizado
también en las mesas normales.

## Cambiar o agregar un sonido

1. Deja el archivo aquí con el nombre del efecto: `move.ogg`, `capture.wav`, `coin.mp3`… Para
   varias tomas del mismo efecto, `move.ogg` y `move-2.ogg` (el juego elige una al azar).
2. Corre `node tools/sfx-import.mjs`: recorta el silencio del principio, iguala el volumen y los
   pasa a MP3 en `assets/sfx/`. El volumen relativo entre efectos (un clic más bajo que una
   explosión) está en `SAMPLE_GAIN` de `src/ui/sfx.js`.
3. Anota de dónde salió en `LICENCIAS.txt`.

Efectos: move, capture, select, invalid, step, land, hit, stomp, boom, bigboom, crunch, pop,
whoosh, warp, laser, zombie, water, snip, dig, splash, leaf, promote, card, win, lose, coin, flower,
tap, achievement, mini_win, mini_lose, shatter.

## De dónde salen

Todos los actuales son CC0 (sin atribución obligatoria): Kenney, Ninja Adventure y packs CC0 de
OpenGameArt. El detalle archivo por archivo está en `LICENCIAS.txt`.

Para buscar más, con licencia que permite uso comercial:

- Kenney, todo CC0: https://kenney.nl/assets?t=audio
- OpenGameArt filtrando CC0: https://opengameart.org/content/cc0-sound-effects
- Freesound con el filtro "Creative Commons 0" (pide cuenta): https://freesound.org
- Pixabay, sin atribución: https://pixabay.com/sound-effects/ (tijeras: /search/scissors/, pala: /search/shovel/)
- Sonniss GDC bundles, licencia propia libre de regalías: https://sonniss.com/gameaudiogdc

Para hacer sonidos retro propios: https://sfxr.me (jsfxr), bfxr.net, ChipTone (sfbgames.itch.io/chiptone).

Huecos a mejorar: `snip` es un corte de cuchillo y `dig` un golpe en barro; no había tijeras ni
pala CC0 en lo descargado.
