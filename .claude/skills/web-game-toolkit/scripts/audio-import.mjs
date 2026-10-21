// Importador de audio: cada archivo de una carpeta se llama como el efecto que suena (move.ogg,
// hit-2.wav… varias tomas = sufijo -N). Con ffmpeg recorta el silencio inicial, iguala el volumen
// (loudnorm), lo pasa a mono MP3 y escribe un módulo con las tomas por efecto.
// Uso:  node audio-import.mjs <carpeta-origen> <carpeta-mp3> <salida.js> [prefijo-url]
//       prefijo-url: cómo pide el juego los MP3 (por defecto, la carpeta-mp3 tal cual)
// Música (bucles): no la pases por aquí; normalízala aparte en dos pasadas lineales
// (loudnorm I=-20 linear=true) para no comprimirla, y súenala con AudioBufferSource.loop.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';

const [SRC, OUT, MOD, PREFIX] = process.argv.slice(2);
if (!SRC || !OUT || !MOD) { console.error('uso: node audio-import.mjs <origen> <carpeta-mp3> <salida.js> [prefijo-url]'); process.exit(1); }
const AUDIO = /\.(wav|ogg|mp3|flac|m4a|aiff?)$/i, url = (PREFIX ?? OUT).replace(/\/?$/, '/');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const takes = {};
let bytes = 0;
for (const file of (existsSync(SRC) ? readdirSync(SRC) : []).filter((f) => AUDIO.test(f)).sort()) {
  const m = file.replace(AUDIO, '').toLowerCase().match(/^([a-z0-9_]+?)(?:-(\d+))?$/);
  if (!m) { console.warn(`  aviso: ${file}: nombre no válido (efecto o efecto-N)`); continue; }
  const name = m[1], out = `${name}-${(takes[name]?.length || 0) + 1}.mp3`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${SRC}/${file}`, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-17:TP=-1.5:LRA=11', '-ac', '1', '-ar', '44100', '-b:a', '96k', `${OUT}/${out}`]);
  (takes[name] ||= []).push(url + out);
  bytes += statSync(`${OUT}/${out}`).size;
}
writeFileSync(MOD, `// Generado por audio-import.mjs desde ${SRC}: no editar a mano.\nexport const SFX_SAMPLES = ${JSON.stringify(takes, null, 2)};\n`);
console.log(`audio: ${Object.values(takes).flat().length} tomas para ${Object.keys(takes).length} efectos, ${Math.round(bytes / 1024)} KB`);
