// Auditoría de idiomas (src/i18n): por cada idioma, qué claves de t() y qué campos de los registros
// faltan, qué sobra y cuánto texto de la interfaz sigue sin pasar por t(). Falla (código 1) si una
// clave se usa con dos textos en español distintos o si un idioma traduce algo que ya no existe.
// Uso: node tools/i18n-check.mjs [--missing]   (con --missing lista cada clave que falta)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const files = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? files(join(d, f)) : f.endsWith('.js') ? [join(d, f)] : []));
const src = files(join(root, 'src')).filter((f) => !f.includes('/i18n/') && !/lab(-catalog)?\.js$/.test(f));
const showMissing = process.argv.includes('--missing');
let errors = 0;

// Claves de la interfaz: t('clave', 'texto en español').
const used = new Map(), prefixes = new Set();
const call = /\bt\(\s*'([^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'/g;
for (const f of src) {
  for (const [, key, es] of readFileSync(f, 'utf8').matchAll(call)) {
    const prev = used.get(key);
    if (prev && prev.es !== es) { console.log(`✗ ${key}: dos textos distintos (${prev.file} y ${f.slice(root.length)})`); errors++; }
    used.set(key, { es, file: f.slice(root.length) });
  }
  for (const [, key, one, other] of readFileSync(f, 'utf8').matchAll(/\btp\(\s*'([^']+)'\s*,[^']*?'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'/g)) {
    used.set(key + '.one', { es: one, file: f.slice(root.length) });
    used.set(key + '.other', { es: other, file: f.slice(root.length) });
  }
  // Claves armadas en el momento: t('diff.' + id, …) da por usadas todas las 'diff.*'.
  for (const [, pre] of readFileSync(f, 'utf8').matchAll(/\bt\(\s*'([\w.]+\.)'\s*\+/g)) prefixes.add(pre);
}

// Registros traducibles: los que pasan por localize('tipo', …).
const kinds = new Map();
for (const f of src) for (const [, kind] of readFileSync(f, 'utf8').matchAll(/localize\('([^']+)'/g)) kinds.set(kind, f);
const REG = { pieces: ['data/pieces.js', 'PIECES'], bosses: ['data/bosses.js', 'BOSSES'], mutations: ['data/mutations.js', 'MUTATIONS'], cards: ['game/cards.js', 'CARDS'], difficulties: ['game/difficulty.js', 'DIFFICULTIES'], modifiers: ['data/modifiers.js', 'MODIFIERS'], achievements: ['game/achievements.js', 'ACHIEVEMENTS'], themes: ['data/themes.js', 'THEMES'], seeds: ['data/garden.js', 'SEEDS'], gardenItems: ['data/garden.js', 'GARDEN_ITEMS'], pickups: ['data/pickups.js', 'PICKUPS'], rivals: ['game/difficulty.js', 'RIVALS'], eliteRules: ['game/generate.js', 'ELITE_RULES'], duelMoves: ['game/duel.js', 'MOVES'] };
const TEXT = ['name', 'desc', 'rule', 'move', 'aim'];
const registry = {};
for (const kind of kinds.keys()) {
  if (['patterns', 'duelTypes', 'bomberFoes'].includes(kind)) continue; // textos sueltos { id: 'texto' }
  if (!REG[kind]) { console.log(`✗ localize('${kind}') sin entrada en REG de tools/i18n-check.mjs`); errors++; continue; }
  const reg = (await import(join(root, 'src', REG[kind][0])))[REG[kind][1]];
  const list = Array.isArray(reg) ? reg : Object.entries(reg).map(([id, v]) => ({ ...v, id: v.id || id }));
  registry[kind] = Object.fromEntries(list.map((x) => [x.id, TEXT.filter((k) => typeof x[k] === 'string')]));
}

for (const file of readdirSync(join(root, 'src/i18n')).filter((f) => f !== 'index.js')) {
  const lang = file.replace('.js', '');
  const dict = (await import(join(root, 'src/i18n', file))).default;
  const ui = dict.ui || {};
  const missingUi = [...used.keys()].filter((k) => !(k in ui));
  const unused = Object.keys(ui).filter((k) => !used.has(k) && ![...prefixes].some((p) => k.startsWith(p)));
  let total = used.size, done = used.size - missingUi.length;
  const missingData = [];
  for (const [kind, ids] of Object.entries(registry)) {
    for (const [id, fields] of Object.entries(ids)) {
      for (const field of fields) { total++; if (dict[kind]?.[id]?.[field] != null) done++; else missingData.push(`${kind}.${id}.${field}`); }
    }
    for (const id of Object.keys(dict[kind] || {})) if (!ids[id]) { console.log(`✗ ${lang}: ${kind}.${id} ya no existe`); errors++; }
  }
  console.log(`${lang}: ${Math.round((done / total) * 100)}% (${done}/${total}) · faltan ${missingUi.length} claves de interfaz y ${missingData.length} campos de datos · ${unused.length} claves sin usar`);
  if (showMissing) for (const k of [...missingUi, ...missingData]) console.log('  falta', k);
  if (unused.length) console.log('  sin usar:', unused.join(', '));
}

// Texto de interfaz aún escrito a mano en las plantillas (aproximado: cadenas con letras y
// espacios entre etiquetas o en atributos de texto).
let raw = 0;
const perFile = [];
for (const f of src.filter((f) => f.includes('/ui/'))) {
  const s = readFileSync(f, 'utf8');
  const n = (s.match(/>[^<>${}`]*[a-záéíóúñ]{3,} [^<>${}`]*</gi) || []).length + (s.match(/\b(?:title|label|aria-label|hint|sub|note|confirmLabel)="[^"]*[a-záéíóúñ]{3}/gi) || []).length;
  if (n) perFile.push([n, f.slice(root.length)]);
  raw += n;
}
console.log(`interfaz: ~${raw} textos aún sin t() en ${perFile.length} archivos`);
if (showMissing) for (const [n, f] of perFile.sort((a, b) => b[0] - a[0])) console.log(`  ${n}\t${f}`);
if (errors) process.exit(1);
