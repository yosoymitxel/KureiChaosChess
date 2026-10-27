---
name: idiomas
description: Cómo traducir Kure'iChaosChess y añadir idiomas (src/i18n). Úsala al escribir cualquier texto que vea el jugador, al pasar una pantalla a t(), al traducir registros de src/data o al sumar un idioma nuevo. Adaptada de i18n-expert (daymade/claude-code-skills) al juego sin build.
---

# Idiomas

El español es el idioma fuente y vive en el código. Los demás idiomas son archivos
`src/i18n/<id>.js` con las mismas claves. Lo que falta en un idioma se ve en español, así que se
puede traducir por partes.

## Piezas

- `src/i18n/index.js`:
  - `LANGS` lista los idiomas.
  - `LANG` es el idioma elegido, sacado del ajuste `lang`.
  - `t(clave, 'texto en español', { vars })` traduce los textos de la interfaz.
  - `localize('tipo', registro)` traduce los registros.
- `src/i18n/en.js`:
  - `ui` es un mapa plano de claves.
  - Además lleva un bloque por registro (`pieces`, `modifiers`, `achievements`…) con los campos de texto por id.
- Ajustes → Idioma guarda `lang` y recarga. Los registros se traducen una vez, al importarse, así
  que los derivados (`PIECE_NAMES`, `MOVE_NAMES`…) salen ya traducidos.
- `node tools/i18n-check.mjs [--missing]` revisa:
  - La cobertura de cada idioma.
  - Las claves que faltan o sobran.
  - Los ids traducidos que ya no existen.
  - El texto de la interfaz que aún no pasa por `t()`.

## Flujo (auditar → arreglar → validar)

1. `node tools/i18n-check.mjs --missing`: mira qué archivos tienen más texto sin `t()`.
2. Pasa los textos de la pantalla a `t('zona.cosa', 'texto')`:
   - Las claves van por zona: `menu.*`, `settings.*`, `setup.*`, `pause.*`, `common.*`, `mini.*`,
     `<minijuego>.*`.
   - Una clave lleva siempre el mismo texto en español; el check falla si no.
   - Variables con `{nombre}`: `t('setup.floor', 'Piso {n}', { n })`. Nunca concatenes frases:
     el orden de las palabras cambia entre idiomas.
   - Las claves armadas en el momento (`t('diff.' + id, …)`) se dan por usadas a partir de su prefijo.
   - Atributos también: `aria-label`, `title`, `label`, `hint`, `confirmLabel`.
3. Contenido nuevo en un registro de `src/data` o `src/game`:
   - Si el registro aún no lo hace, envuélvelo en `localize('tipo', {...})`.
   - Súmalo a `REG` de `tools/i18n-check.mjs`.
   - Traduce `name`, `desc`, `rule`, `move` y `aim` en cada idioma.
4. Escribe la traducción en `src/i18n/en.js` (y en cada idioma que exista), en el mismo orden que
   el español.
5. Comprueba:
   - `node tools/i18n-check.mjs` sin `✗`.
   - `node tools/check-registry.mjs`.
   - Ver la pantalla en el navegador con el idioma puesto, a 360×800 y en PC: los textos en inglés
     suelen ser más cortos, los de alemán o francés, más largos.

## Reglas

- No se traducen:
  - El nombre del juego.
  - Los nombres propios de las mesas (Ñandutí, Miku, Vesper).
  - Las claves internas `zugzwang.*`.
- Variables de juego, no del idioma: un `name` que el código compara (por ejemplo, el asiento
  «Tú») se compara con `t('seat.you', 'Tú')`, nunca con el literal.
- Nada de texto montado con `+` alrededor de una variable traducida; usa `{vars}`.
- Los textos de ayuda de los minijuegos (`MiniTools`) siguen en cada pantalla: al traducir uno,
  pásalo a `t('<minijuego>.help', '…')`.
- Formatos de número y fecha con `Intl` cuando hagan falta.

## Añadir un idioma

1. Copia `src/i18n/en.js` a `src/i18n/<id>.js` y traduce los valores (las claves no se tocan).
2. Añade `<id>: 'Nombre nativo'` a `LANGS` en `src/i18n/index.js`.
3. `node tools/i18n-check.mjs` para ver la cobertura.
4. Revisa en el navegador las pantallas con textos largos: ajustes, preparar mesa, cartas y ayudas.
