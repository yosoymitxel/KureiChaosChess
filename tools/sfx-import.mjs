// Importador de sonidos grabados: cada archivo de art/sonidos/ se llama como el efecto que
// reemplaza (move.ogg, capture.wav…) y, si hay varias tomas, move-1.ogg, move-2.ogg… (el juego
// elige una al azar cada vez). Con ffmpeg los recorta (silencio del principio), los iguala de
// volumen, los pasa a mono y a MP3 (lo abren todos los navegadores) en assets/sfx/, y escribe
// src/data/sfx-samples.js. Un efecto sin archivo sigue sonando sintetizado.
// Uso:  node tools/sfx-import.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SFX_NAMES } from '../src/ui/sfx.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const SRC = root + 'art/sonidos/', OUT = root + 'assets/sfx/';
const AUDIO = /\.(wav|ogg|mp3|flac|m4a|aiff?)$/i;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const takes = {};
let bytes = 0;
for (const file of (existsSync(SRC) ? readdirSync(SRC) : []).filter((f) => AUDIO.test(f)).sort()) {
  const m = file.replace(AUDIO, '').toLowerCase().match(/^([a-z_]+?)(?:-(\d+))?$/);
  if (!m || !SFX_NAMES.includes(m[1])) { console.warn(`  aviso: ${file}: el juego no tiene un efecto con ese nombre (${SFX_NAMES.join(', ')})`); continue; }
  const name = m[1], out = `${name}-${(takes[name]?.length || 0) + 1}.mp3`;
  // Silencio inicial fuera (el golpe tiene que sonar al instante) y volumen parejo entre efectos.
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', SRC + file, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-17:TP=-1.5:LRA=11', '-ac', '1', '-ar', '44100', '-b:a', '96k', OUT + out]);
  (takes[name] ||= []).push('assets/sfx/' + out);
  bytes += statSync(OUT + out).size;
}

writeFileSync(root + 'src/data/sfx-samples.js', `// Generado por tools/sfx-import.mjs desde art/sonidos/: no editar a mano.
// Por efecto, las tomas grabadas (assets/sfx/). Un efecto sin tomas suena sintetizado.
export const SFX_SAMPLES = ${JSON.stringify(takes, null, 2)};
`);
const n = Object.values(takes).flat().length;
console.log(`sonidos: ${n} tomas para ${Object.keys(takes).length} efectos, ${Math.round(bytes / 1024)} KB`);
const missing = SFX_NAMES.filter((s) => !takes[s]);
if (missing.length) console.log(`  sintetizados: ${missing.join(', ')}`);
