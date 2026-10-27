// Motor de sonido por WebAudio. Dos fuentes: muestras grabadas (assets/sfx/, importadas por
// tools/sfx-import.mjs desde art/sonidos/) y recetas sintetizadas como datos puros. Con una mesa
// normal suena la muestra si la hay; con una mesa píxel suena la receta, que ya es de maquinita.
// Lo que no tenga muestra, o no haya cargado todavía, suena sintetizado.
// Sin window.AudioContext (Node) todo es no-op silencioso.
import { SFX_SAMPLES } from '../data/sfx-samples.js';
export const SFX_VOLUMES = { suave: 0.45, normal: 0.7, fuerte: 1 };

// Capas: { osc, from, to, dur, gain, attack?, at? } o { noise: true, dur, gain, cutoff, at? }.
// at (segundos) retrasa la capa dentro del efecto. El ruido acepta filter ('lowpass', 'bandpass',
// 'highpass'), q y sweep (frecuencia de corte al final, para barridos de soplo o de agua).
// Cada vez que suena, el efecto entero se afina un poco al azar (JITTER) para que diez pasos
// seguidos no suenen a la misma grabación.
const JITTER = 0.07;
const RECIPES = {
  // Ficha de madera que apoya en el tablero: el chasquido del canto y el golpe sordo de la base.
  move: [
    { noise: true, dur: 0.03, gain: 0.3, cutoff: 2200, filter: 'bandpass', q: 3 },
    { osc: 'triangle', from: 420, to: 230, dur: 0.05, gain: 0.32 },
    { osc: 'sine', from: 150, to: 80, dur: 0.09, gain: 0.3 },
  ],
  // Captura: el mismo golpe, más fuerte, y la pieza que sale volando con un crujido.
  capture: [
    { noise: true, dur: 0.04, gain: 0.42, cutoff: 1800, filter: 'bandpass', q: 2 },
    { osc: 'square', from: 230, to: 70, dur: 0.14, gain: 0.26 },
    { osc: 'sine', from: 110, to: 45, dur: 0.22, gain: 0.34 },
    { noise: true, dur: 0.18, gain: 0.22, cutoff: 1400, sweep: 300, at: 0.03 },
  ],
  // Tomar una pieza: un toquecito seco hacia arriba.
  select: [
    { osc: 'triangle', from: 560, to: 760, dur: 0.045, gain: 0.2 },
    { noise: true, dur: 0.02, gain: 0.1, cutoff: 3200, filter: 'bandpass', q: 4 },
  ],
  // Jugada que no vale: dos pitidos graves y cortos.
  invalid: [
    { osc: 'square', from: 170, to: 160, dur: 0.06, gain: 0.12 },
    { osc: 'square', from: 150, to: 140, dur: 0.08, gain: 0.12, at: 0.08 },
  ],
  // Paso corto (minijuegos): la ficha camina a la casilla de al lado.
  step: [
    { noise: true, dur: 0.02, gain: 0.18, cutoff: 1800, filter: 'bandpass', q: 3 },
    { osc: 'triangle', from: 300, to: 210, dur: 0.035, gain: 0.2 },
  ],
  // Aterrizaje de un salto largo: más cuerpo que el paso.
  land: [
    { noise: true, dur: 0.035, gain: 0.26, cutoff: 1600, filter: 'bandpass', q: 2 },
    { osc: 'sine', from: 170, to: 70, dur: 0.12, gain: 0.34 },
  ],
  // Golpe que rebota (pieza con vidas, escudo, jefe): metal y un tump.
  hit: [
    { osc: 'square', from: 900, to: 760, dur: 0.07, gain: 0.12 },
    { osc: 'triangle', from: 1350, to: 1200, dur: 0.14, gain: 0.1 },
    { noise: true, dur: 0.05, gain: 0.26, cutoff: 3000, filter: 'highpass' },
    { osc: 'sine', from: 140, to: 60, dur: 0.16, gain: 0.32 },
  ],
  // Pisotón de un jefe (entrada, cada paso suyo).
  stomp: [
    { osc: 'sine', from: 95, to: 32, dur: 0.42, gain: 0.55 },
    { noise: true, dur: 0.3, gain: 0.32, cutoff: 700, sweep: 120 },
    { noise: true, dur: 0.06, gain: 0.2, cutoff: 2400, filter: 'bandpass', q: 1.5 },
  ],
  // Explosión pequeña (bombas de Bomberman, ficha explosiva de los bolos).
  boom: [
    { noise: true, dur: 0.45, gain: 0.5, cutoff: 1600, sweep: 140 },
    { osc: 'sine', from: 120, to: 38, dur: 0.38, gain: 0.45 },
    { osc: 'square', from: 70, to: 40, dur: 0.18, gain: 0.12 },
  ],
  // La gran explosión: estallido, y el retumbe que queda.
  bigboom: [
    { noise: true, dur: 0.7, gain: 0.6, cutoff: 2200, sweep: 90 },
    { osc: 'sine', from: 90, to: 28, dur: 0.75, gain: 0.55 },
    { noise: true, dur: 0.9, gain: 0.25, cutoff: 260, at: 0.12, attack: 0.08 },
  ],
  // Escombros y piezas rotas: tres crujidos encadenados.
  crunch: [
    { noise: true, dur: 0.07, gain: 0.3, cutoff: 1300, filter: 'bandpass', q: 1.5 },
    { noise: true, dur: 0.06, gain: 0.22, cutoff: 2200, filter: 'bandpass', q: 2, at: 0.05 },
    { noise: true, dur: 0.09, gain: 0.18, cutoff: 900, filter: 'bandpass', q: 1.5, at: 0.11 },
  ],
  // Algo que aparece (pieza nueva, ficha que nace).
  pop: [
    { osc: 'sine', from: 260, to: 820, dur: 0.07, gain: 0.24 },
    { noise: true, dur: 0.02, gain: 0.08, cutoff: 4000, filter: 'highpass' },
  ],
  // Soplo de aire: hielo que desliza, cartas que vuelan.
  whoosh: [
    { noise: true, dur: 0.3, gain: 0.26, cutoff: 500, sweep: 2600, filter: 'bandpass', q: 1.2, attack: 0.12 },
  ],
  // Portal: un barrido que sube y vuelve.
  warp: [
    { osc: 'sine', from: 300, to: 1400, dur: 0.22, gain: 0.16 },
    { osc: 'sine', from: 1400, to: 380, dur: 0.24, gain: 0.14, at: 0.2 },
    { noise: true, dur: 0.4, gain: 0.1, cutoff: 900, sweep: 3000, filter: 'bandpass', q: 3 },
  ],
  // Disparo de rayo (Matamarcianos): el piu de las maquinitas.
  laser: [
    { osc: 'square', from: 1800, to: 260, dur: 0.16, gain: 0.12 },
    { osc: 'sawtooth', from: 1200, to: 200, dur: 0.12, gain: 0.06 },
  ],
  // El zombi que se levanta: gruñido grave y ronco.
  zombie: [
    { osc: 'sawtooth', from: 95, to: 70, dur: 0.5, gain: 0.12, attack: 0.08 },
    { osc: 'sawtooth', from: 101, to: 74, dur: 0.5, gain: 0.1, attack: 0.08 },
    { noise: true, dur: 0.45, gain: 0.12, cutoff: 500, filter: 'bandpass', q: 2, attack: 0.1 },
  ],
  // Jardín: agua que cae de la regadera (chorro y gotas).
  water: [
    { noise: true, dur: 0.7, gain: 0.16, cutoff: 3200, sweep: 1800, filter: 'bandpass', q: 0.8, attack: 0.08 },
    { osc: 'sine', from: 700, to: 1100, dur: 0.05, gain: 0.12, at: 0.18 },
    { osc: 'sine', from: 620, to: 980, dur: 0.05, gain: 0.1, at: 0.34 },
    { osc: 'sine', from: 760, to: 1250, dur: 0.05, gain: 0.1, at: 0.5 },
  ],
  // Tijeras: dos cortes secos.
  snip: [
    { noise: true, dur: 0.025, gain: 0.3, cutoff: 5000, filter: 'highpass' },
    { osc: 'square', from: 2600, to: 1900, dur: 0.025, gain: 0.08 },
    { noise: true, dur: 0.03, gain: 0.34, cutoff: 4200, filter: 'highpass', at: 0.11 },
    { osc: 'square', from: 2300, to: 1600, dur: 0.03, gain: 0.08, at: 0.11 },
  ],
  // Pala en la tierra.
  dig: [
    { noise: true, dur: 0.16, gain: 0.3, cutoff: 900, filter: 'bandpass', q: 1, attack: 0.02 },
    { osc: 'sine', from: 140, to: 90, dur: 0.1, gain: 0.2 },
  ],
  // Chapoteo (koi, estanque).
  splash: [
    { noise: true, dur: 0.3, gain: 0.26, cutoff: 3000, sweep: 500 },
    { osc: 'sine', from: 400, to: 900, dur: 0.06, gain: 0.12, at: 0.04 },
  ],
  // Hoja barrida.
  leaf: [
    { noise: true, dur: 0.22, gain: 0.14, cutoff: 2500, sweep: 5000, filter: 'bandpass', q: 1.5, attack: 0.06 },
  ],
  promote: [
    { osc: 'sine', from: 330, to: 660, dur: 0.28, gain: 0.28 },
    { osc: 'triangle', from: 495, to: 990, dur: 0.24, gain: 0.16, at: 0.06 },
    { osc: 'sine', from: 990, to: 1320, dur: 0.3, gain: 0.12, at: 0.14 },
  ],
  card: [
    { noise: true, dur: 0.12, gain: 0.2, cutoff: 2800, attack: 0.03 },
    { osc: 'triangle', from: 420, to: 300, dur: 0.05, gain: 0.24, at: 0.09 },
  ],
  win: [
    { osc: 'sine', from: 523.25, to: 523.25, dur: 0.45, gain: 0.18 },
    { osc: 'sine', from: 659.25, to: 659.25, dur: 0.5, gain: 0.16, at: 0.1 },
    { osc: 'sine', from: 783.99, to: 783.99, dur: 0.6, gain: 0.16, at: 0.2 },
  ],
  lose: [
    { osc: 'triangle', from: 330, to: 165, dur: 0.45, gain: 0.26 },
    { osc: 'sine', from: 220, to: 110, dur: 0.55, gain: 0.18, at: 0.08 },
  ],
  coin: [
    { osc: 'square', from: 988, to: 988, dur: 0.06, gain: 0.14 },
    { osc: 'square', from: 1319, to: 1319, dur: 0.16, gain: 0.14, at: 0.06 },
  ],
  flower: [
    { osc: 'sine', from: 659, to: 988, dur: 0.3, gain: 0.16 },
    { osc: 'sine', from: 440, to: 660, dur: 0.36, gain: 0.11, at: 0.05 },
  ],
  tap: [
    { osc: 'triangle', from: 520, to: 360, dur: 0.04, gain: 0.28 },
  ],
  achievement: [
    { osc: 'sine', from: 523.25, to: 523.25, dur: 0.4, gain: 0.16 },
    { osc: 'sine', from: 659.25, to: 659.25, dur: 0.45, gain: 0.15, at: 0.09 },
    { osc: 'sine', from: 783.99, to: 783.99, dur: 0.5, gain: 0.15, at: 0.18 },
    { osc: 'sine', from: 1046.5, to: 1046.5, dur: 0.7, gain: 0.13, at: 0.27 },
  ],
  mini_win: [
    { osc: 'sine', from: 587.33, to: 587.33, dur: 0.22, gain: 0.2 },
    { osc: 'sine', from: 880, to: 880, dur: 0.3, gain: 0.16, at: 0.1 },
  ],
  mini_lose: [
    { osc: 'triangle', from: 294, to: 262, dur: 0.16, gain: 0.22 },
    { osc: 'triangle', from: 220, to: 165, dur: 0.3, gain: 0.18, at: 0.12 },
  ],
  shatter: [
    { noise: true, dur: 0.28, gain: 0.35, cutoff: 4200 },
    { noise: true, dur: 0.1, gain: 0.22, cutoff: 6500, at: 0.02 },
    { osc: 'triangle', from: 900, to: 260, dur: 0.14, gain: 0.16 },
  ],
  // Aviso de peligro (meteorito marcado, borde que va a caer, oleada que llega): campana grave.
  alarm: [
    { osc: 'square', from: 440, to: 430, dur: 0.12, gain: 0.12 },
    { osc: 'square', from: 330, to: 322, dur: 0.18, gain: 0.12, at: 0.14 },
    { osc: 'sine', from: 110, to: 104, dur: 0.4, gain: 0.2, at: 0.14 },
  ],
  // Reloj que se acaba: un tic seco por segundo en los últimos.
  tick: [
    { osc: 'square', from: 1800, to: 1700, dur: 0.018, gain: 0.08 },
    { noise: true, dur: 0.012, gain: 0.08, cutoff: 5000, filter: 'highpass' },
  ],
};

export const SFX_NAMES = Object.keys(RECIPES);

let enabled = true;
let level = 'normal';
let ctx = null;
let master = null;
let ambient = null;
let noiseBuf = null;

function ensureCtx() {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = SFX_VOLUMES[level];
    master.connect(ctx.destination);
    loadSamples(ctx);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noiseBuffer(c) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function playLayer(layer, t, tune = 1) {
  const start = t + (layer.at || 0);
  const attack = Math.min(layer.attack || 0.004, layer.dur / 2);
  const gate = ctx.createGain();
  gate.gain.setValueAtTime(0.0001, start);
  gate.gain.linearRampToValueAtTime(layer.gain, start + attack);
  gate.gain.exponentialRampToValueAtTime(0.0001, start + layer.dur);
  gate.connect(master);
  let src;
  if (layer.noise) {
    src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = layer.filter || 'lowpass';
    lp.frequency.setValueAtTime(layer.cutoff * tune, start);
    if (layer.sweep) lp.frequency.exponentialRampToValueAtTime(layer.sweep * tune, start + layer.dur);
    if (layer.q) lp.Q.value = layer.q;
    src.connect(lp).connect(gate);
  } else {
    src = ctx.createOscillator();
    src.type = layer.osc;
    src.frequency.setValueAtTime(layer.from * tune, start);
    src.frequency.exponentialRampToValueAtTime(layer.to * tune, start + layer.dur);
    src.connect(gate);
  }
  src.start(start);
  src.stop(start + layer.dur);
}

export function setSfxEnabled(on) {
  enabled = !!on;
}

export function setSfxVolume(l) {
  if (!SFX_VOLUMES[l]) return;
  level = l;
  if (master) master.gain.value = SFX_VOLUMES[l];
}

// pitch: afinación extra (1 = la de serie); el hockey la sube con la velocidad del golpe.
export function playSfx(name, pitch = 1) {
  if (!enabled) return;
  const layers = RECIPES[name];
  if (!layers) return;
  const c = ensureCtx();
  if (!c) return;
  // Un mismo sonido repetido en el mismo instante (diez fichas que caen juntas) suena una vez.
  const now = c.currentTime;
  if (now - (last[name] || -1) < 0.03) return;
  last[name] = now;
  const tune = (1 + (Math.random() * 2 - 1) * JITTER) * pitch;
  const pixel = typeof document !== 'undefined' && document.documentElement.dataset.art === 'pixel';
  const takes = !pixel && buffers[name];
  if (takes?.length) return playSample(takes[Math.floor(Math.random() * takes.length)], now, tune, SAMPLE_GAIN[name] ?? 0.7);
  for (const layer of layers) playLayer(layer, now, tune);
}
const last = {};

// Muestras: se cargan todas al crear el contexto (pesan poco) y cada efecto elige una toma al azar.
// El importador las deja a todas igual de fuertes; esto devuelve la jerarquía (un clic no suena
// como una explosión). Lo que no figura va a 0.7.
const SAMPLE_GAIN = {
  select: 0.35, tap: 0.4, step: 0.35, invalid: 0.4, leaf: 0.45, pop: 0.5, card: 0.55, coin: 0.55, snip: 0.6, dig: 0.6,
  move: 0.65, land: 0.7, water: 0.55, splash: 0.6, flower: 0.55, whoosh: 0.5, warp: 0.6, laser: 0.45, zombie: 0.6,
  capture: 0.85, hit: 0.8, crunch: 0.75, shatter: 0.85, boom: 0.85, stomp: 0.95, bigboom: 1,
  promote: 0.7, mini_win: 0.6, mini_lose: 0.6, achievement: 0.7, win: 0.75, lose: 0.75, tick: 0.35, alarm: 0.6,
};
const buffers = {};
function loadSamples(c) {
  for (const [name, urls] of Object.entries(SFX_SAMPLES)) {
    buffers[name] = [];
    for (const url of urls) {
      fetch(url).then((r) => r.arrayBuffer()).then((b) => c.decodeAudioData(b)).then((buf) => buffers[name].push(buf)).catch(() => {});
    }
  }
}
function playSample(buf, t, tune, gain) {
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buf;
  src.playbackRate.value = tune;
  g.gain.value = gain;
  src.connect(g).connect(master);
  src.start(t);
}

// Música de fondo: un bucle por ambiente (assets/musica/, créditos en CREDITOS.txt). Las mesas
// normales llevan lo-fi y las píxel chiptune, cada una con su tema de jefe y de minijuego; el jardín
// zen tiene el suyo. Se decodifica entera y suena con AudioBufferSource.loop, que empalma sin el
// hueco que deja <audio loop>; cada pista se baja la primera vez que hace falta. Al cambiar de
// ambiente, la que sale se apaga mientras entra la otra.
export const MUSIC_MOODS = ['normal', 'boss', 'mini'];
export const MUSIC_TRACKS = ['normal', 'boss', 'mini', 'pixel', 'pixel-boss', 'pixel-mini', 'zen'];
const MUSIC_GAIN = 0.32;
const tracks = {};
let scene = 'normal';
let musicOn = true;
const track = (name) => (tracks[name] ||= fetch(`assets/musica/${name}.mp3`)
  .then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b))
  .catch(() => { delete tracks[name]; return null; }));

// La pantalla dice el ambiente ('normal', 'boss', 'mini' o 'zen'); la mesa (píxel o no) se lee del documento.
export function setMusicScene(mood = 'normal') {
  const pixel = typeof document !== 'undefined' && document.documentElement.dataset.art === 'pixel';
  const m = mood === 'zen' || MUSIC_MOODS.includes(mood) ? mood : 'normal';
  scene = m === 'zen' ? 'zen' : pixel ? (m === 'normal' ? 'pixel' : 'pixel-' + m) : m;
  if (ambient && ambient.name !== scene) { stopAmbient(); startAmbient(); }
}

// Música y efectos se apagan por separado; el volumen es común.
export function setMusicEnabled(on) {
  musicOn = !!on;
  if (!musicOn) stopAmbient();
  else if (ctx) startAmbient();
}

export function startAmbient() {
  if (ambient || !musicOn) return;
  const c = ensureCtx();
  if (!c) return;
  const bus = c.createGain();
  bus.gain.value = 0.0001;
  bus.connect(master);
  const a = (ambient = { name: scene, bus, srcs: [] });
  track(a.name).then((buf) => {
    if (!buf || ambient !== a) return;
    const src = c.createBufferSource(), t = c.currentTime;
    src.buffer = buf;
    src.loop = true;
    src.connect(bus);
    src.start(t);
    a.srcs.push(src);
    bus.gain.setValueAtTime(0.0001, t);
    bus.gain.linearRampToValueAtTime(MUSIC_GAIN, t + 2.5);
  });
}

export function stopAmbient() {
  if (!ambient) return;
  const a = ambient;
  ambient = null;
  const t = ctx.currentTime;
  const fade = 1.2;
  a.bus.gain.cancelScheduledValues(t);
  a.bus.gain.setValueAtTime(a.bus.gain.value, t);
  a.bus.gain.linearRampToValueAtTime(0.0001, t + fade);
  for (const s of a.srcs) s.stop(t + fade);
}

export function sfxState() {
  return { enabled, music: musicOn, level, ambient: !!ambient, context: ctx ? ctx.state : null, samples: Object.values(buffers).flat().length };
}
