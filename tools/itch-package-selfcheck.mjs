import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const packageRoot = join(root, 'dist/itch');
const archive = join(root, 'dist/kurei-chaos-chess-itch.zip');
const read = (path) => readFileSync(join(packageRoot, path), 'utf8');

assert.ok(existsSync(archive) && statSync(archive).size > 0, 'itch.io ZIP must exist and be non-empty');
execFileSync('unzip', ['-tq', archive], { stdio: 'pipe' });

const html = read('index.html');
const match = html.match(/<script\s+type="importmap">\s*([\s\S]*?)\s*<\/script>/);
assert.ok(match, 'Packaged index.html must contain an import map');
const imports = JSON.parse(match[1]).imports;
const expected = {
  preact: './vendor/preact.module.js',
  'preact/hooks': './vendor/preact-hooks.module.js',
  htm: './vendor/htm.module.js',
  animejs: './vendor/anime.esm.min.js',
  motion: './vendor/motion.esm.js'
};
assert.deepEqual(imports, expected, 'itch.io package must use the reviewed local import map');

for (const [name, path] of Object.entries(imports)) {
  const resolved = new URL(path, 'https://kcc-itch.invalid/');
  assert.equal(resolved.origin, 'https://kcc-itch.invalid', name + ' must not load from a remote origin');
  const file = join(packageRoot, decodeURIComponent(resolved.pathname.replace(/^\/+/, '')));
  assert.ok(existsSync(file), 'Missing packaged dependency: ' + path);
}

for (const path of [
  'src/main.js',
  'src/game/backup.js',
  'vendor/preact.module.js',
  'vendor/preact-hooks.module.js',
  'vendor/htm.module.js',
  'vendor/anime.esm.min.js',
  'vendor/motion.esm.js',
  'vendor/fonts/bricolage-grotesque-latin.woff2',
  'assets/favicon.svg'
]) assert.ok(existsSync(join(packageRoot, path)), 'Missing itch.io runtime file: ' + path);

assert.ok(html.includes('src="src/main.js"'), 'Game entry point must remain a native module');
console.log('itch.io package checks passed: ZIP integrity, static entry point and local dependencies.');
