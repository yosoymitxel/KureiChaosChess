---
name: logros
description: Cómo diseñar y añadir logros en Kure'iChaosChess (src/game/achievements.js). Úsala antes de proponer, añadir o revisar un logro, para que cada uno tenga sentido dentro del juego y no sea relleno.
---

# Logros

Un logro tiene sentido si reconoce algo que el jugador hizo dentro del juego y que vale la pena
recordar: aprender una regla, dominar una situación difícil, descubrir algo escondido o
recorrer un tramo largo del juego.

## Tipos (cada grupo de la pantalla Logros mezcla varios)

- **Aprender:** la primera vez que se usa una regla o una mecánica: enroque, captura al paso,
  coronar, primera flor. Fáciles y tempranos; enseñan lo que el juego trae.
- **Dominar:** ganar en condiciones exigentes: sin bajas, en pocas rondas, en Difícil, sin
  mutaciones. Dicen exactamente qué hay que lograr.
- **Recorrer:** progreso a medio y largo plazo: pisos, runs completas, partidas ganadas,
  colecciones (piezas, mutaciones, jefes). Cantidades que se alcanzan jugando normal, sin farmear.
- **Descubrir (secretos):** algo que el juego esconde y se encuentra explorando: tocar al Titán
  del menú, dar de comer a los koi, una jugada rara. Su texto no se ve hasta conseguirlo (`secret: true`).

## Reglas

1. Se consigue jugando, nunca por algo ajeno al juego: no premiar la hora del día, conectar
   hardware, cambiar ajustes, abandonar ni perder a propósito de forma repetida.
2. Nada de pura suerte: el jugador tiene que poder buscarlo.
3. Nada que se pueda perder para siempre: todo logro sigue al alcance en una run nueva.
4. Criterio claro y comprobable: la descripción dice exactamente qué hacer (salvo los secretos,
   que lo dicen al desbloquearse).
5. Cantidades que no obliguen a farmear: 10, 25 o 50 de algo que ya se hace jugando.
6. Cada uno se otorga en el sitio donde ocurre la acción (`award('<id>')`) y en ningún otro.
7. Variedad de modos: partida, travesía, minijuegos, jardín y largo plazo. Ningún minijuego
   debería tener más de dos.
8. Nombre corto y con carácter; descripción en una frase, en segunda persona.

## Añadir uno

1. Entrada en `ACHIEVEMENTS` (`src/game/achievements.js`): `id`, `group` (de `ACHIEVEMENT_GROUPS`),
   `name`, `desc`, `icon` (de `src/ui/icons.js`) y `secret: true` si es secreto.
2. `award('<id>')` donde pasa. Contadores entre runs: `bump(stat)`. Colecciones sin repetidos:
   `collect(stat, id)`.
3. Traducción en `src/i18n/en.js` → `achievements` (skill `idiomas`).
4. Comprobar:
   - `node tools/check-registry.mjs`: falla si algún logro no se otorga en ningún sitio.
   - `node tools/i18n-check.mjs`.
   - Provocarlo una vez en el navegador.
