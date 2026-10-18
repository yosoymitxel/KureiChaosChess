// Comprobación del motor de sonido: `node tools/sfx-check.mjs`.
// Primero importa en Node puro (sin AudioContext, todo no-op), después monta un
// AudioContext de mentira para revisar lo que cada receta agenda de verdad.
import { SFX_NAMES, SFX_VOLUMES, setSfxEnabled, setSfxVolume, playSfx, startAmbient, stopAmbient, sfxState } from '../src/ui/sfx.js';

const NAMES = ['move', 'capture', 'promote', 'card', 'win', 'lose', 'coin', 'flower', 'tap', 'achievement', 'mini_win', 'mini_lose', 'shatter'];
const LEVELS = ['suave', 'normal', 'fuerte'];
const WAVES = ['sine', 'triangle', 'square', 'sawtooth'];

const sources = (nodes) => nodes.filter((n) => n.kind === 'osc' || n.kind === 'noise');
const snapshot = () => JSON.stringify(sfxState());

function param(v) {
  const p = { value: v, times: [] };
  const set = (x, t) => {
    p.value = x;
    p.times.push([x, t]);
    return p;
  };
  p.setValueAtTime = set;
  p.linearRampToValueAtTime = set;
  p.exponentialRampToValueAtTime = set;
  p.cancelScheduledValues = () => p;
  return p;
}

class MockAudioContext {
  constructor() {
    MockAudioContext.last = this;
    this.state = 'suspended';
    this.currentTime = 0;
    this.sampleRate = 48000;
    this.made = [];
    this.destination = { connect: (d) => d };
  }
  resume() { this.state = 'running'; }
  createBuffer(ch, len, rate) { return { length: len, sampleRate: rate, getChannelData: () => new Float32Array(len) }; }
  createGain() { return this.node('gain', { gain: param(1) }); }
  createOscillator() { return this.node('osc', { type: 'sine', frequency: param(440) }); }
  createBiquadFilter() { return this.node('filter', { type: 'lowpass', frequency: param(350) }); }
  createBufferSource() { return this.node('noise', { buffer: null, loop: false }); }
  node(kind, extra) {
    const n = {
      kind,
      starts: [],
      stops: [],
      connect: (d) => d,
      disconnect: () => {},
      start(t) { this.starts.push(t || 0); },
      stop(t) { this.stops.push(t || 0); },
      ...extra,
    };
    this.made.push(n);
    return n;
  }
}

// Una capa = una envolvente propia + una fuente con stop agendado.
function checkBatch(made, label) {
  const srcs = sources(made);
  const gains = made.filter((n) => n.kind === 'gain');
  if (!srcs.length) throw new Error(`${label}: no agendó ninguna capa`);
  if (gains.length !== srcs.length) throw new Error(`${label}: capas sin envolvente propia`);
  for (const g of gains) {
    const peak = Math.max(g.gain.value, ...g.gain.times.map(([v]) => v));
    if (!Number.isFinite(peak) || peak <= 0 || peak > 1) throw new Error(`${label}: gain fuera de (0, 1]`);
  }
  for (const s of srcs) {
    if (s.starts.length !== 1 || s.stops.length !== 1) throw new Error(`${label}: fuente sin stop agendado`);
    const dur = s.stops[0] - s.starts[0];
    if (!Number.isFinite(dur) || dur <= 0 || dur > 1) throw new Error(`${label}: duración fuera de rango`);
    if (s.kind === 'osc') {
      if (!WAVES.includes(s.type)) throw new Error(`${label}: onda desconocida (${s.type})`);
      const freqs = s.frequency.times.map(([v]) => v);
      if (!freqs.length || freqs.some((v) => !Number.isFinite(v) || v <= 0)) throw new Error(`${label}: frecuencia inválida`);
    } else if (!made.some((n) => n.kind === 'filter' && Number.isFinite(n.frequency.value) && n.frequency.value > 0)) {
      throw new Error(`${label}: ruido sin filtro`);
    }
  }
}

try {
  // 1. Node puro: importar y sonar no rompe ni cambia nada.
  if (typeof window !== 'undefined') throw new Error('Node no debería tener window');
  const before = snapshot();
  playSfx('move');
  playSfx('nada');
  playSfx();
  startAmbient();
  stopAmbient();
  setSfxVolume('xxx');
  if (snapshot() !== before) throw new Error('sin AudioContext algo cambió el estado');
  if (sfxState().context !== null) throw new Error('se creó AudioContext sin gesto');

  const unique = new Set(SFX_NAMES);
  if (unique.size !== SFX_NAMES.length) throw new Error('SFX_NAMES tiene duplicados');
  if (SFX_NAMES.length !== NAMES.length || NAMES.some((n) => !unique.has(n))) throw new Error(`SFX_NAMES no coincide con las recetas: ${SFX_NAMES.join(', ')}`);
  if (LEVELS.some((l) => !(SFX_VOLUMES[l] > 0 && SFX_VOLUMES[l] <= 1))) throw new Error('SFX_VOLUMES fuera de (0, 1]');
  if (!(SFX_VOLUMES.suave < SFX_VOLUMES.normal && SFX_VOLUMES.normal < SFX_VOLUMES.fuerte)) throw new Error('SFX_VOLUMES no es ascendente');
  setSfxVolume('suave');
  if (sfxState().level !== 'suave') throw new Error('setSfxVolume con un nivel válido no se aplicó');
  setSfxVolume('normal');

  // 2. Con AudioContext de mentira: creación perezosa, reanudación y capas.
  globalThis.window = { AudioContext: MockAudioContext };
  playSfx('move');
  const mock = MockAudioContext.last;
  if (!mock) throw new Error('playSfx no creó el AudioContext');
  if (sfxState().context !== 'running') throw new Error('el contexto quedó suspendido');
  let from = mock.made.length;
  playSfx('nada');
  if (mock.made.length !== from) throw new Error("playSfx('nada') agendó nodos");
  for (const name of SFX_NAMES) {
    from = mock.made.length;
    playSfx(name);
    checkBatch(mock.made.slice(from), name);
  }
  setSfxVolume('fuerte');
  if (mock.made[0].gain.value !== SFX_VOLUMES.fuerte) throw new Error('el volumen global no llega al master');
  setSfxVolume('normal');

  // 3. Ambiente: dos drones, ruido filtrado y LFO; no se duplica y se corta entero.
  from = mock.made.length;
  startAmbient();
  const amb = mock.made.slice(from);
  if (!sfxState().ambient) throw new Error('el ambiente no quedó encendido');
  if (amb.filter((n) => n.kind === 'osc' && n.frequency.value <= 200).length < 2) throw new Error('ambiente: faltan los dos osciladores graves');
  if (!amb.some((n) => n.kind === 'osc' && n.frequency.value < 1)) throw new Error('ambiente: falta el LFO lento');
  if (!amb.some((n) => n.kind === 'noise')) throw new Error('ambiente: falta el lecho de ruido');
  if (!amb.some((n) => n.kind === 'filter' && Number.isFinite(n.frequency.value) && n.frequency.value > 0)) throw new Error('ambiente: falta el pasabajos');
  if (!amb.some((n) => n.kind === 'gain' && n.gain.value <= 0.1)) throw new Error('ambiente: sin nivel base bajo');
  for (const s of sources(amb)) {
    if (s.starts.length !== 1) throw new Error('ambiente: fuente sin start');
  }
  from = mock.made.length;
  startAmbient();
  if (mock.made.length !== from) throw new Error('startAmbient duplicó el ambiente');
  stopAmbient();
  if (sfxState().ambient) throw new Error('stopAmbient no apagó el ambiente');
  for (const s of sources(amb)) {
    if (s.stops.length !== 1 || s.stops[0] <= s.starts[0]) throw new Error('al parar quedaron fuentes vivas');
  }
  stopAmbient();

  // 4. Apagado: nada suena ni crea nodos, y el ambiente en curso se corta.
  from = mock.made.length;
  startAmbient();
  const off = mock.made.length;
  setSfxEnabled(false);
  playSfx('coin');
  if (mock.made.length !== off) throw new Error('sonó algo con el sonido apagado');
  if (sfxState().ambient) throw new Error('el ambiente siguió con el sonido apagado');
  for (const s of sources(mock.made.slice(from))) {
    if (s.stops.length !== 1) throw new Error('apagar el sonido dejó el ambiente vivo');
  }
  setSfxEnabled(true);

  console.log(`sfx-check OK: ${SFX_NAMES.length} recetas, ${LEVELS.length} niveles, ${mock.made.length} nodos agendados`);
  process.exitCode = 0;
} catch (err) {
  console.error('sfx-check falló: ' + (err?.message || err));
  process.exitCode = 1;
}
