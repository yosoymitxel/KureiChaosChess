// Motor de sonido por WebAudio: recetas como datos puros, sin archivos de audio.
// Sin window.AudioContext (Node) todo es no-op silencioso.
export const SFX_VOLUMES = { suave: 0.45, normal: 0.7, fuerte: 1 };

// Capas: { osc, from, to, dur, gain, attack?, at? } o { noise: true, dur, gain, cutoff, at? }.
// at (segundos) retrasa la capa dentro del efecto.
const RECIPES = {
  move: [
    { osc: 'triangle', from: 300, to: 150, dur: 0.06, gain: 0.45 },
    { noise: true, dur: 0.025, gain: 0.1, cutoff: 1500 },
  ],
  capture: [
    { noise: true, dur: 0.08, gain: 0.4, cutoff: 1200 },
    { osc: 'square', from: 200, to: 85, dur: 0.12, gain: 0.32 },
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

function playLayer(layer, t) {
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
    lp.type = 'lowpass';
    lp.frequency.value = layer.cutoff;
    src.connect(lp).connect(gate);
  } else {
    src = ctx.createOscillator();
    src.type = layer.osc;
    src.frequency.setValueAtTime(layer.from, start);
    src.frequency.exponentialRampToValueAtTime(layer.to, start + layer.dur);
    src.connect(gate);
  }
  src.start(start);
  src.stop(start + layer.dur);
}

export function setSfxEnabled(on) {
  enabled = !!on;
  if (!enabled) stopAmbient();
}

export function setSfxVolume(l) {
  if (!SFX_VOLUMES[l]) return;
  level = l;
  if (master) master.gain.value = SFX_VOLUMES[l];
}

export function playSfx(name) {
  if (!enabled) return;
  const layers = RECIPES[name];
  if (!layers) return;
  const c = ensureCtx();
  if (!c) return;
  for (const layer of layers) playLayer(layer, c.currentTime);
}

export function startAmbient() {
  if (ambient || !enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const t = c.currentTime;
  const bus = c.createGain();
  bus.gain.setValueAtTime(0.0001, t);
  bus.gain.linearRampToValueAtTime(1, t + 2.5);
  const trem = c.createGain();
  trem.gain.value = 0.05;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 260;
  lp.connect(trem).connect(bus).connect(master);
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer(c);
  noise.loop = true;
  const bed = c.createGain();
  bed.gain.value = 0.12;
  noise.connect(bed).connect(lp);
  const srcs = [noise];
  for (const hz of [110, 165]) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;
    osc.connect(lp);
    srcs.push(osc);
  }
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const depth = c.createGain();
  depth.gain.value = 0.012;
  lfo.connect(depth).connect(trem.gain);
  srcs.push(lfo);
  for (const s of srcs) s.start(t);
  ambient = { bus, srcs };
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
  return { enabled, level, ambient: !!ambient, context: ctx ? ctx.state : null };
}
