// Verificador de registros: node tools/check-registry.mjs
// Lo que crece (piezas, mecánicas, minijuegos, jefes, mutaciones, cartas, mesas, logros) se declara
// en un solo sitio y el resto lo lee de ahí. Esto avisa cuando algo quedó a medias en otro lado:
// una pieza sin dibujo o sin movimiento, un minijuego sin pantalla, un icono que no existe, un
// logro que nadie otorga… Sale con código 1 si encuentra algo.
import { readFileSync, readdirSync, statSync } from 'node:fs';

globalThis.document = { documentElement: { dataset: {} } };
const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const walk = (dir) => readdirSync(new URL(dir, root)).flatMap((f) => {
  const p = `${dir}/${f}`;
  return statSync(new URL(p, root)).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : [];
});

const { PIECES, PIECE_TYPES, MOVE_NAMES } = await import('../src/data/pieces.js');
const { MODIFIERS } = await import('../src/data/modifiers.js');
const { MUTATIONS, EXTRA_MOVES } = await import('../src/data/mutations.js');
const { BOSSES, BOSS_IDS } = await import('../src/data/bosses.js');
const { THEMES } = await import('../src/data/themes.js');
const { ACHIEVEMENTS } = await import('../src/game/achievements.js');
const { CARDS } = await import('../src/game/cards.js');
const { MINI_BOSSES, FINAL_BOSSES } = await import('../src/game/difficulty.js');
const { SCENARIOS } = await import('../src/data/scenarios.js');
const { RAW_BODIES } = await import('../src/view/piece-art.js');
const { PIXEL_PACKS, PIXEL_BASE } = await import('../src/data/pixel-packs.js');
const { reachPreview } = await import('../src/game/rules.js');

const errors = [];
const fail = (msg) => errors.push(msg);

// Iconos: las claves del objeto P de icons.js, más las piezas (Icon las dibuja como pieza).
const iconSrc = read('src/ui/icons.js');
const icons = new Set([...iconSrc.slice(iconSrc.indexOf('const P = {')).matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]));
const hasIcon = (name) => icons.has(name) || PIECE_TYPES.includes(name);

// Piezas: dibujo vectorial, set píxel, movimiento y datos.
for (const t of PIECE_TYPES) {
  if (!RAW_BODIES[t]) fail(`pieza ${t}: falta su dibujo en src/view/piece-art.js`);
  if (!PIXEL_PACKS[PIXEL_BASE].sprites[t]) fail(`pieza ${t}: falta en el tema píxel base (art/temas/${PIXEL_BASE} + tools/pixel-art.mjs)`);
  if (!reachPreview({ type: t }).base.length) fail(`pieza ${t}: src/game/rules.js no le da ningún movimiento`);
  for (const k of ['name', 'move', 'value', 'rule']) if (PIECES[t][k] == null) fail(`pieza ${t}: falta "${k}" en src/data/pieces.js`);
}

// Mutaciones: icono y, si prestan un movimiento, que tenga nombre y haga algo.
for (const [id, m] of Object.entries(MUTATIONS)) {
  if (!hasIcon(m.icon)) fail(`mutación ${id}: el icono "${m.icon}" no existe`);
  const ex = EXTRA_MOVES[id];
  if (!ex) continue;
  if (!MOVE_NAMES[ex[1]]) fail(`mutación ${id}: el patrón "${ex[1]}" no tiene nombre en MOVE_NAMES`);
  if (!reachPreview({ type: ex[0], extra: [ex[1]] }).extra.length) fail(`mutación ${id}: no añade ninguna casilla a ${ex[0]}`);
}

// Mecánicas y minijuegos: icono, peso de aparición, pantalla y ayuda.
const catalog = read('src/data/minigame-catalog.js');
const screens = new Set([...(catalog.match(/const SCREENS = \{([^}]*)\}/)?.[1] || '').matchAll(/(\w+):/g)].map((m) => m[1]));
const screenSrc = walk('src/ui/screens').map(read).join('\n');
for (const [id, m] of Object.entries(MODIFIERS)) {
  if (!hasIcon(m.icon)) fail(`mecánica ${id}: el icono "${m.icon}" no existe`);
  if (!m.mini) continue;
  if (!m.weights) fail(`minijuego ${id}: falta "weights" en src/data/modifiers.js (no saldría en el mapa)`);
  if (!screens.has(id)) fail(`minijuego ${id}: falta su pantalla en SCREENS (src/data/minigame-catalog.js)`);
  // Los de tablero (scenarios.js) llevan MiniTools en su pantalla común.
  if (!SCENARIOS[id] && !screenSrc.includes(`mini="${id}"`)) fail(`minijuego ${id}: su pantalla no tiene MiniTools (ayuda y nivel)`);
}
for (const id of screens) if (!MODIFIERS[id]?.mini) fail(`SCREENS.${id}: no hay minijuego con ese id en src/data/modifiers.js`);

// Jefes: dibujo y tramo en el que aparecen.
for (const id of BOSS_IDS) {
  if (!RAW_BODIES['boss-' + id]) fail(`jefe ${id}: falta su dibujo boss-${id} en src/view/piece-art.js`);
  if (!MINI_BOSSES.includes(id) && !FINAL_BOSSES.includes(id)) fail(`jefe ${id}: no está en MINI_BOSSES ni en FINAL_BOSSES (nunca aparece)`);
  if (!BOSSES[id].moves?.length) fail(`jefe ${id}: no tiene movimientos`);
}

// Cartas.
for (const [id, c] of Object.entries(CARDS)) if (!hasIcon(c.icon)) fail(`carta ${id}: el icono "${c.icon}" no existe`);

// Mesas: todas definen las mismas variables que la de serie.
const base = Object.keys(THEMES.walnut.vars);
for (const t of Object.values(THEMES)) {
  const missing = base.filter((k) => !(k in t.vars));
  if (missing.length) fail(`mesa ${t.id}: faltan variables ${missing.join(', ')}`);
}

// Logros: cada uno con icono, cada award('id') apunta a uno que existe y cada uno se otorga en algún sitio.
const code = walk('src').map(read).join('\n');
const awarded = new Set([...code.matchAll(/award\('(\w+)'\)/g)].map((m) => m[1]));
const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
for (const a of ACHIEVEMENTS) {
  if (!hasIcon(a.icon)) fail(`logro ${a.id}: el icono "${a.icon}" no existe`);
  if (!awarded.has(a.id)) fail(`logro ${a.id}: nadie lo otorga (falta award('${a.id}'))`);
}
for (const id of awarded) if (!ids.has(id)) fail(`award('${id}'): no hay logro con ese id en src/game/achievements.js`);

// Demos (src/ui/demos.js): toda pieza, mutación y jefe se enseña en acción en la partida y en la
// Galería, así que cada uno tiene que dar un tablerito con alcance (o, si no mueve distinto, su cinemática).
const { pieceDemo, mutationDemo, bossDemo } = await import('../src/ui/demos.js');
const demoOk = (d) => d.cinematic ? d.title && d.icon : d.title && d.sub && d.piece?.type && d.base?.length > 0;
for (const t of PIECE_TYPES) if (!demoOk(pieceDemo(t))) fail(`pieza ${t}: su demo sale sin título, regla o alcance`);
for (const id of Object.keys(MUTATIONS)) if (!demoOk(mutationDemo(id))) fail(`mutación ${id}: su demo sale vacía`);
for (const id of BOSS_IDS) if (!demoOk(bossDemo(id))) fail(`jefe ${id}: su demo sale sin alcance`);

if (errors.length) {
  console.log(errors.map((e) => '✗ ' + e).join('\n'));
  process.exit(1);
}
console.log(`registros ok: ${PIECE_TYPES.length} piezas, ${Object.keys(MODIFIERS).length} mecánicas, ${screens.size} minijuegos, ${BOSS_IDS.length} jefes, ${Object.keys(MUTATIONS).length} mutaciones, ${Object.keys(CARDS).length} cartas, ${Object.keys(THEMES).length} mesas, ${ACHIEVEMENTS.length} logros`);
