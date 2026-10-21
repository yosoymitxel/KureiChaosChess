#!/usr/bin/env node
// Regenera docs/MAPA.md: por archivo, sus símbolos de primer nivel con número de línea (JS) y
// las cabeceras de sección /* … */ (CSS), una línea por símbolo: `ruta:línea nombre` (+ = export). Sin dependencias. Uso: node tools/regen-mapa.mjs
// Pensado para grep (`grep -n "pixel" docs/MAPA.md`), no para leerlo entero cada sesión.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || '.';
const SKIP = /(pixel-packs|pixel-themes|pixel-icons|piece-bodies)\.js$/; // generados
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const JS = /^(export\s+)?(default\s+)?(async\s+)?(function\*?\s+(\w+)|class\s+(\w+)|(const|let)\s+(\w+)\s*=)/;
const out = ['# Mapa de símbolos (generado por tools/regen-mapa.mjs, no editar)', ''];
for (const dir of ['src', 'css']) {
  for (const f of walk(join(ROOT, dir)).sort()) {
    if (!/\.(js|css)$/.test(f) || SKIP.test(f)) continue;
    const lines = readFileSync(f, 'utf8').split('\n');
    const items = [];
    lines.forEach((l, i) => {
      if (f.endsWith('.js')) {
        const m = l.match(JS);
        if (m) items.push(`${i + 1} ${m[1] ? '+' : ''}${m[5] || m[6] || m[8]}`);
      } else {
        const m = l.match(/^\/\*[\s=-]*([^*]{3,}?)[\s=-]*(\*\/)?\s*$/);
        if (m) items.push(`${i + 1} /* ${m[1].slice(0, 60)}`);
      }
    });
    const rel = relative(ROOT, f);
    out.push(`## ${rel} (${lines.length}L)`, ...items.map((x) => `${rel}:${x}`));
  }
}
writeFileSync(join(ROOT, 'docs/MAPA.md'), out.join('\n') + '\n');
console.log(`docs/MAPA.md: ${out.length - 2} líneas, ${out.join('\n').length} caracteres`);
