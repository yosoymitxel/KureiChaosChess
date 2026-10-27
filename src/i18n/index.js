// Idiomas. El español vive en el código: en los registros de src/data y como texto por defecto de
// t('clave', 'texto'). Cada otro idioma es un archivo src/i18n/<id>.js con las mismas claves (ver
// en.js); lo que falta se ve en español. Solo se carga el idioma elegido, y cambiarlo recarga el
// juego, así los registros se traducen una vez al importarse. `node tools/i18n-check.mjs` audita.
export const LANGS = { es: 'Español', en: 'English' };

function saved() {
  try { return JSON.parse(localStorage.getItem('zugzwang.settings.v2'))?.lang; } catch { return null; }
}
export const LANG = LANGS[saved()] ? saved() : 'es';
const dict = LANG === 'es' ? {} : (await import(`./${LANG}.js`)).default;
if (typeof document !== 'undefined') document.documentElement.lang = LANG;

// Texto de la interfaz: `es` es el original; {nombre} se rellena con `vars`.
export function t(key, es, vars) {
  const s = dict.ui?.[key] ?? es;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
}

// Traduce en el sitio un registro ({ id: {...} }, [{ id, ... }] o { id: 'texto' }) con dict[kind].
export function localize(kind, reg) {
  const over = dict[kind];
  if (!over) return reg;
  const byId = Array.isArray(reg) ? Object.fromEntries(reg.map((x) => [x.id, x])) : reg;
  for (const [id, fields] of Object.entries(over)) {
    if (typeof fields === 'string') reg[id] = fields; // registro de textos sueltos ({ id: 'texto' })
    else if (byId[id]) Object.assign(byId[id], fields);
  }
  return reg;
}
