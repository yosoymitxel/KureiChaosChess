import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootUrl = new URL('../', import.meta.url);
const rootPath = fileURLToPath(rootUrl);
const read = (relativePath) => readFileSync(new URL(relativePath, rootUrl), 'utf8');
const origin = 'https://kcc-local-check.invalid';

function assertLocalResource(reference, basePath, label) {
  const resolved = new URL(reference, new URL(basePath, origin));
  assert.equal(resolved.origin, origin, label + ' must be served from the game origin');
  const pathname = decodeURIComponent(resolved.pathname).replace(/^\/+/, '');
  assert.ok(existsSync(join(rootPath, pathname)), label + ' is missing: ' + reference);
}

function attribute(tag, name) {
  const doubleQuoted = tag.match(new RegExp('\\b' + name + '\\s*=\\s*"([^"]*)"', 'i'));
  if (doubleQuoted) return doubleQuoted[1];
  return tag.match(new RegExp("\\b" + name + "\\s*=\\s*'([^']*)'", 'i'))?.[1] ?? null;
}

const html = read('index.html');
const importMapMatch = html.match(/<script\s+type="importmap">\s*([\s\S]*?)\s*<\/script>/);
assert.ok(importMapMatch, 'index.html must contain a valid import map');

const importMap = JSON.parse(importMapMatch[1]);
const expected = {
  preact: './vendor/preact.module.js',
  'preact/hooks': './vendor/preact-hooks.module.js',
  htm: './vendor/htm.module.js',
  animejs: './vendor/anime.esm.min.js',
  motion: './vendor/motion.esm.js',
  '@supabase/supabase-js': 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm'
};

assert.deepEqual(importMap.imports, expected, 'Runtime dependencies must use reviewed local vendor files');
for (const [name, path] of Object.entries(importMap.imports)) {
  if (name === '@supabase/supabase-js') {
    assert.equal(path, 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm', 'Supabase SDK must use the reviewed, pinned CDN resource');
    continue;
  }
  assertLocalResource(path, '/', name);
}

for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
  const rel = attribute(tag[0], 'rel') || '';
  if (rel.toLowerCase().split(/\s+/).includes('stylesheet')) {
    const href = attribute(tag[0], 'href');
    assert.ok(href, 'Stylesheet link must have an href');
    assertLocalResource(href, '/', 'Stylesheet');
  }
}

for (const tag of html.matchAll(/<script\b[^>]*>/gi)) {
  const src = attribute(tag[0], 'src');
  if (src) assertLocalResource(src, '/', 'Script');
}

for (const style of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
  for (const url of style[1].matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    if (url[2].startsWith('data:')) continue;
    assertLocalResource(url[2], '/', 'Inline CSS asset');
  }
}

for (const cssPath of ['css/tokens.css', 'css/base.css', 'css/board.css', 'css/screens.css', 'css/pixel.css']) {
  const css = read(cssPath);
  for (const url of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    if (url[2].startsWith('data:')) continue;
    assertLocalResource(url[2], cssPath, 'CSS asset');
  }
}

assertLocalResource('vendor/fonts/bricolage-grotesque-latin.woff2', '/', 'Local Bricolage font');

const sbom = JSON.parse(read('security/kurei-chaos-chess.cdx.json'));
assert.equal(sbom.bomFormat, 'CycloneDX');
assert.equal(sbom.specVersion, '1.6');
const expectedPackages = new Set([
  'pkg:npm/preact@10.29.8',
  'pkg:npm/htm@3.1.1',
  'pkg:npm/animejs@4.5.0',
  'pkg:npm/motion@12.43.0',
  'pkg:npm/%40supabase/supabase-js@2.118.0'
]);
const actualPackages = new Set((sbom.components || []).map((component) => component.purl));
assert.deepEqual(actualPackages, expectedPackages, 'SBOM direct package inventory differs from reviewed runtime dependencies');

const codeqlConfig = read('.github/codeql/codeql-config.yml');
assert.ok(codeqlConfig.includes('paths-ignore:') && codeqlConfig.includes("- '**/*.px.js'"), 'CodeQL must ignore only the pixel-art DSL files');
assert.ok(codeqlConfig.includes('not JavaScript source'), 'CodeQL exclusion must document why the pixel DSL is ignored');

const licenses = read('vendor/LICENSES.md');
for (const version of ['preact 10.29.8', 'htm 3.1.1', 'animejs 4.5.0', 'motion 12.43.0', '`@supabase/supabase-js` 2.118.0']) {
  assert.ok(licenses.includes(version), 'Vendor license inventory is missing ' + version);
}

console.log('Security static checks passed: local runtime assets, pinned Supabase CDN SDK, vendor licenses, font and direct-dependency SBOM.');
