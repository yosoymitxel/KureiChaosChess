// Abre cada minijuego en el navegador (vía tools/play.mjs) y falla si alguno da error de página.
// `node tools/minis-smoke.mjs [--art pixel] [--pc] [id…]` → una línea si todos abren; la lista si no.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MODIFIERS } from '../src/data/modifiers.js';

const args = process.argv.slice(2);
const pick = args.filter((a) => MODIFIERS[a]?.mini);
const ids = pick.length ? pick : Object.values(MODIFIERS).filter((m) => m.mini).map((m) => m.id);
const pass = args.filter((a) => a.startsWith('--') || ['pixel', 'normal'].includes(a));
const dir = mkdtempSync(join(tmpdir(), 'minis-'));
const fails = [];
for (const id of ids) {
  const file = join(dir, id + '.json');
  writeFileSync(file, JSON.stringify({ mini: id, viewports: [pass.includes('--pc') ? 'pc' : 'mobile'], themes: [pass.includes('pixel') ? 'pixelada' : 'walnut'], steps: [{ wait: 1200 }, { expect: { noErrors: true } }] }));
  const r = spawnSync(process.execPath, ['tools/play.mjs', file, '--out', join(dir, id), ...pass.filter((a) => a === '--pc')], { encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0) fails.push(`${id}: ${(r.stdout + r.stderr).split('\n').filter((l) => /FALLA|Error/.test(l)).slice(0, 2).join(' / ') || 'falló'}`);
}
if (fails.length) { console.log('Minijuegos con errores:\n' + fails.join('\n')); process.exit(1); }
console.log(`Minijuegos OK: ${ids.length} abren sin errores`);
