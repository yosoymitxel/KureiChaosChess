// Copia de seguridad: todo lo guardado (claves zugzwang.*) en un código de texto que se copia o se
// descarga, y se restaura pegándolo. En itch.io el juego vive en un iframe de otro dominio y algunos
// navegadores (Brave, Safari) o una subida nueva pueden vaciar su almacenamiento.
const PREFIX = 'zugzwang.';
const MAGIC = 'KCC1:';

export function exportSave() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(PREFIX)) data[k] = localStorage.getItem(k);
  }
  return MAGIC + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

// Devuelve cuántas claves restauró, o 0 si el código no es válido (no toca nada).
export function importSave(code) {
  try {
    const text = code.trim();
    if (!text.startsWith(MAGIC)) return 0;
    const data = JSON.parse(decodeURIComponent(escape(atob(text.slice(MAGIC.length)))));
    const keys = Object.keys(data).filter((k) => k.startsWith(PREFIX) && typeof data[k] === 'string');
    if (!keys.length) return 0;
    for (const k of keys) localStorage.setItem(k, data[k]);
    return keys.length;
  } catch { return 0; }
}
