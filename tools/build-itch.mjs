// Paquete para itch.io: copia lo que el juego carga (index.html, src, css, assets) a dist/itch/,
// cambia el import map y la fuente de Google por las copias de vendor/ (itch sirve el juego en un
// iframe y así no depende de ningún CDN) y lo comprime en dist/kurei-chaos-chess-itch.zip.
// Uso: node tools/build-itch.mjs
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'dist/itch');
const zip = join(root, 'dist/kurei-chaos-chess-itch.zip');
rmSync(join(root, 'dist'), { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// El laboratorio y las plantillas de arte no van en el juego publicado. Los PNG de las mesas píxel
// (más de mil) van incrustados en src/data/pixel-src.js: itch admite como mucho 1000 archivos.
const skip = new Set(['src/lab.js', 'src/lab-catalog.js', 'assets/plantilla-pieza.svg', 'assets/pixel']);
for (const dir of ['src', 'css', 'assets', 'vendor']) {
  cpSync(join(root, dir), join(out, dir), { recursive: true, filter: (p) => {
    const rel = p.slice(root.length).replace(/\\/g, '/').replace(/^\/+/, '');
    if (rel === 'assets/pixel' || rel.startsWith('assets/pixel/')) return false;
    return !skip.has(rel);
  } });
}

const pixel = join(root, 'assets/pixel'), data = {};
for (const pack of readdirSync(pixel)) {
  data[pack] = {};
  for (const f of readdirSync(join(pixel, pack))) data[pack][f.replace(/\.png$/, '')] = 'data:image/png;base64,' + readFileSync(join(pixel, pack, f)).toString('base64');
}
writeFileSync(join(out, 'src/data/pixel-src.js'), `// Generado por tools/build-itch.mjs: PNG de las mesas píxel incrustados.\nconst DATA = ${JSON.stringify(data)};\nexport const pixelSrc = (pack, name) => DATA[pack]?.[name] ?? \`assets/pixel/\${pack}/\${name}.png\`;\n`);

const VENDOR = {
  preact: './vendor/preact.module.js',
  'preact/hooks': './vendor/preact-hooks.module.js',
  htm: './vendor/htm.module.js',
  animejs: './vendor/anime.esm.min.js',
  motion: './vendor/motion.esm.js',
};
let page = readFileSync(join(root, 'index.html'), 'utf8');
const before = page;
page = page.replace(/<script type="importmap">[\s\S]*?<\/script>/, `<script type="importmap">\n  ${JSON.stringify({ imports: VENDOR })}\n  </script>`);
page = page.replace(/\s*<link rel="preconnect"[^>]*>/g, '');
page = page.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, `<style>@font-face { font-family: 'Bricolage Grotesque'; font-style: normal; font-weight: 400 800; font-display: swap; src: url(vendor/fonts/bricolage-grotesque-latin.woff2) format('woff2'); }</style>`);
page = page.replace(/\s*<!-- Dependencies come from the CDN[\s\S]*?-->/, '');
if (page === before || /cdn\.jsdelivr|googleapis/.test(page)) throw new Error('index.html cambió: revisa los reemplazos de build-itch');
writeFileSync(join(out, 'index.html'), page);

const count = (d) => readdirSync(d).reduce((n, f) => n + (statSync(join(d, f)).isDirectory() ? count(join(d, f)) : 1), 0);
if (count(out) > 1000) throw new Error('itch admite como mucho 1000 archivos');
execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path "${out}\\*" -DestinationPath "${zip}" -CompressionLevel Optimal -Force`]);
const mb = (statSync(zip).size / 1048576).toFixed(1);
console.log(`itch: ${count(out)} archivos, ${mb} MB → dist/kurei-chaos-chess-itch.zip`);
