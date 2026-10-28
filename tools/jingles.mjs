// Jingles de fin de partida, compuestos aquí y renderizados a assets/musica/jingles/*.mp3 (ffmpeg).
// Dos timbres: 'normal' (marimba con algo de sala) para las mesas de siempre y 'pixel' (pulso y
// triángulo, sin sala) para las píxel. Cuatro piezas: ganar o perder un piso, ganar o perder la run.
// Uso: node tools/jingles.mjs
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const RATE = 44100, OUT = new URL('../assets/musica/jingles/', import.meta.url).pathname;
const hz = (n) => 440 * 2 ** ((n - 69) / 12); // número MIDI → Hz

// [nota MIDI, inicio en pulsos, duración en pulsos, volumen]; `bpm` da el pulso.
const SONGS = {
  win: { bpm: 150, notes: [[72, 0, 0.5, 1], [76, 0.5, 0.5, 1], [79, 1, 0.5, 1], [84, 1.5, 2.5, 1], [60, 1.5, 2.5, 0.6], [64, 1.5, 2.5, 0.5], [67, 1.5, 2.5, 0.5]] },
  lose: { bpm: 110, notes: [[67, 0, 0.75, 1], [66, 0.75, 0.75, 1], [65, 1.5, 0.75, 1], [64, 2.25, 2.5, 1], [48, 2.25, 2.5, 0.6], [55, 2.25, 2.5, 0.4]] },
  'run-win': { bpm: 132, notes: [
    [67, 0, 0.5, 1], [72, 0.5, 0.5, 1], [76, 1, 0.5, 1], [79, 1.5, 1, 1], [76, 2.5, 0.5, 0.9], [79, 3, 3, 1],
    [84, 4, 3, 0.8], [48, 0, 1.5, 0.6], [55, 1.5, 1.5, 0.6], [48, 3, 4, 0.7], [64, 3, 4, 0.45], [67, 3, 4, 0.45],
  ] },
  'run-lose': { bpm: 84, notes: [
    [69, 0, 1, 1], [65, 1, 1, 1], [64, 2, 1, 1], [62, 3, 3, 1], [45, 0, 2, 0.6], [41, 2, 4, 0.6], [57, 3, 3, 0.4], [53, 3, 3, 0.35],
  ] },
};

// Marimba: fundamental y dos parciales que se apagan antes; ataque corto y caída exponencial.
const marimba = (f, t, d) => {
  const env = Math.min(1, t / 0.006) * Math.exp(-t * (2.2 / Math.max(0.35, d)));
  return env * (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.exp(-t * 9) * Math.sin(2 * Math.PI * f * 3.9 * t) + 0.15 * Math.sin(2 * Math.PI * f * 2 * t));
};
// Chip: pulso al 25 % arriba y triángulo en los graves; envolvente en escalones, como un NES.
const chip = (f, t, d) => {
  const step = Math.floor(t * 30) / 30, env = t > d ? 0 : Math.max(0, 1 - step / (d * 1.4));
  const ph = (f * t) % 1;
  return env * (f < 200 ? (4 * Math.abs(ph - 0.5) - 1) * 0.9 : ph < 0.25 ? 0.6 : -0.2);
};

function render({ bpm, notes }, voice, room) {
  const beat = 60 / bpm, end = Math.max(...notes.map(([, s, l]) => (s + l) * beat)) + (room ? 1.2 : 0.3);
  const buf = new Float32Array(Math.ceil(end * RATE));
  for (const [n, s, l, v] of notes) {
    const f = hz(n), t0 = Math.floor(s * beat * RATE), d = l * beat, len = Math.ceil((d + (room ? 0.9 : 0.05)) * RATE);
    for (let i = 0; i < len && t0 + i < buf.length; i++) buf[t0 + i] += 0.22 * v * voice(f, i / RATE, d);
  }
  if (room) for (const [ms, g] of [[89, 0.28], [137, 0.2], [211, 0.13]]) { // tres ecos cortos: sala pequeña
    const k = Math.floor((ms / 1000) * RATE);
    for (let i = buf.length - 1; i >= k; i--) buf[i] += buf[i - k] * g;
  }
  const peak = buf.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1;
  return buf.map((x) => (x / peak) * 0.89);
}

function wav(samples) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((x, i) => b.writeInt16LE(Math.round(x * 32767), 44 + i * 2));
  return b;
}

mkdirSync(OUT, { recursive: true });
for (const [name, song] of Object.entries(SONGS)) for (const [art, voice, room] of [['', marimba, true], ['pixel-', chip, false]]) {
  const tmp = `${OUT}${art}${name}.wav`;
  writeFileSync(tmp, wav(render(song, voice, room)));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-b:a', '128k', `${OUT}${art}${name}.mp3`]);
  rmSync(tmp);
}
console.log('jingles ok: ' + Object.keys(SONGS).length * 2);
