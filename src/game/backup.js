// Copia de seguridad: progreso local en un código de texto transportable entre navegadores/orígenes.
// KCC2 comprime el JSON con DEFLATE nativo; KCC1 se conserva para importar copias antiguas.
const PREFIX = 'zugzwang.';
const MAGIC_V1 = 'KCC1:';
const MAGIC_V2 = 'KCC2:';

function toBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function fromBase64(text) {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function saveData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(PREFIX)) data[k] = localStorage.getItem(k);
  }
  return JSON.stringify(data);
}

export async function exportSave() {
  const json = saveData();
  // En navegadores modernos la copia comprimida suele ser mucho más corta que el JSON en Base64.
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate'));
      const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
      return MAGIC_V2 + toBase64(bytes);
    } catch { /* Navegador sin soporte efectivo: mantener exportación compatible. */ }
  }
  return MAGIC_V1 + btoa(unescape(encodeURIComponent(json)));
}

// Devuelve cuántas claves restauró, o 0 si el código no es válido (no toca nada).
export async function importSave(code) {
  try {
    const text = String(code).trim();
    let json;
    if (text.startsWith(MAGIC_V2)) {
      if (typeof DecompressionStream === 'undefined') return 0;
      const bytes = fromBase64(text.slice(MAGIC_V2.length));
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
      json = await new Response(stream).text();
    } else if (text.startsWith(MAGIC_V1)) {
      json = decodeURIComponent(escape(atob(text.slice(MAGIC_V1.length))));
    } else {
      return 0;
    }
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return 0;
    const keys = Object.keys(data).filter((k) => k.startsWith(PREFIX) && typeof data[k] === 'string');
    if (!keys.length) return 0;
    for (const k of keys) localStorage.setItem(k, data[k]);
    return keys.length;
  } catch { return 0; }
}
