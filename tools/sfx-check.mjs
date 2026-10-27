// Comprobación del motor de sonido: `node tools/sfx-check.mjs`.
// Primero importa en Node puro (sin AudioContext, todo no-op), después monta un
// AudioContext de mentira para revisar lo que cada receta agenda de verdad.
import { SFX_NAMES, SFX_VOLUMES, MUSIC_TRACKS, setSfxEnabled, setMusicEnabled, setSfxVolume, setMusicScene, playSfx, startAmbient, stopAmbient, sfxState } from '../src/ui/sfx.js';

const NAMES = ['move', 'capture', 'select', 'invalid', 'step', 'land', 'hit', 'stomp', 'boom', 'bigboom', 'crunch', 'pop', 'whoosh', 'warp', 'laser', 'zombie', 'water', 'snip', 'dig', 'splash', 'leaf', 'promote', 'card', 'win', 'lose', 'coin', 'flower', 'tap', 'achievement', 'mini_win', 'mini_lose', 'shatter', 'alarm', 'tick'];
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
  createBiquadFilter() { return this.node('filter', { type: 'lowpass', frequency: param(350), Q: param(1) }); }
  createBufferSource() { return this.node('noise', { buffer: null, loop: false, playbackRate: param(1) }); }
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
  // Las tomas grabadas quedan pendientes hasta soltar `pending`; las recetas se miran en mesa píxel.
  const pending = [];
  globalThis.fetch = (url) => new Promise((res) => pending.push(() => res({ arrayBuffer: async () => url })));
  globalThis.document = { documentElement: { dataset: { art: 'pixel' } } };
  globalThis.window = { AudioContext: MockAudioContext };
  MockAudioContext.prototype.decodeAudioData = async (url) => ({ sample: url });
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
  // Mesa normal: mientras la toma baja no suena el sintetizado; al llegar suena la grabada.
  document.documentElement.dataset.art = '';
  from = mock.made.length;
  playSfx('coin');
  if (mock.made.length !== from) throw new Error('mesa normal: sonó el sintetizado mientras bajaba la toma');
  for (const go of pending.splice(0)) go();
  for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0));
  const took = mock.made.slice(from).find((n) => n.kind === 'noise' && n.buffer?.sample);
  if (!took || !took.buffer.sample.startsWith('assets/sfx/coin')) throw new Error('mesa normal: no sonó la toma grabada al llegar');
  from = mock.made.length;
  mock.currentTime = 1;
  playSfx('coin');
  if (!mock.made.slice(from).some((n) => n.kind === 'noise' && n.buffer?.sample)) throw new Error('mesa normal: con la toma lista no sonó la grabada');
  delete globalThis.document;
  setSfxVolume('fuerte');
  if (mock.made[0].gain.value !== SFX_VOLUMES.fuerte) throw new Error('el volumen global no llega al master');
  setSfxVolume('normal');

  // 3. Música: la pista de la escena, en bucle y a nivel de fondo; no se duplica, al cambiar de
  // escena entra la otra y la anterior se corta, y al parar no queda nada sonando.
  mock.decodeAudioData = async (url) => ({ url });
  const asked = [];
  globalThis.fetch = async (url) => { asked.push(url); return { arrayBuffer: async () => url }; };
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const playing = (nodes) => nodes.find((n) => n.kind === 'noise' && n.loop);
  if (MUSIC_TRACKS.join() !== 'normal,boss,mini,pixel,pixel-boss,pixel-mini,zen') throw new Error(`MUSIC_TRACKS inesperado: ${MUSIC_TRACKS}`);
  setMusicScene('normal');
  from = mock.made.length;
  startAmbient();
  if (!sfxState().ambient) throw new Error('la música no quedó encendida');
  await tick();
  const song = playing(mock.made.slice(from));
  if (asked.at(-1) !== 'assets/musica/normal.mp3' || song?.buffer?.url !== 'assets/musica/normal.mp3') throw new Error('música: no suena la pista de las mesas normales');
  if (song.starts.length !== 1) throw new Error('música: la pista no arrancó');
  if (!mock.made.slice(from).some((n) => n.kind === 'gain' && n.gain.value > 0 && n.gain.value <= 0.5)) throw new Error('música: nivel fuera de (0, 0.5]');
  from = mock.made.length;
  startAmbient();
  if (mock.made.length !== from) throw new Error('startAmbient duplicó la música');
  // Cada ambiente, en mesa normal y píxel, pide su pista.
  globalThis.document = { documentElement: { dataset: {} } };
  for (const [art, mood, want] of [['', 'boss', 'boss'], ['', 'mini', 'mini'], ['pixel', 'normal', 'pixel'], ['pixel', 'boss', 'pixel-boss'], ['pixel', 'mini', 'pixel-mini'], ['', 'normal', 'normal']]) {
    document.documentElement.dataset.art = art;
    const mark = mock.made.length;
    setMusicScene(mood);
    await tick();
    if (playing(mock.made.slice(mark))?.buffer?.url !== `assets/musica/${want}.mp3`) throw new Error(`música: ${art || 'normal'}/${mood} no suena ${want}.mp3`);
  }
  delete globalThis.document;
  const back = playing(mock.made.slice(from).reverse());
  from = mock.made.length;
  setMusicScene('zen');
  await tick();
  const zen = playing(mock.made.slice(from));
  if (song.stops.length !== 1 || back.stops.length !== 1) throw new Error('música: al cambiar de ambiente la anterior siguió sonando');
  if (zen?.buffer?.url !== 'assets/musica/zen.mp3') throw new Error('música: no entró la del jardín');
  stopAmbient();
  if (sfxState().ambient) throw new Error('stopAmbient no apagó la música');
  if (zen.stops.length !== 1 || zen.stops[0] <= zen.starts[0]) throw new Error('al parar quedó la música viva');
  stopAmbient();

  // 4. Apagado: sin efectos no suena ni crea nodos y la música sigue; sin música se corta.
  from = mock.made.length;
  startAmbient();
  await tick();
  const off = mock.made.length;
  setSfxEnabled(false);
  playSfx('coin');
  if (mock.made.length !== off) throw new Error('sonó algo con el sonido apagado');
  if (!sfxState().ambient) throw new Error('apagar los efectos cortó la música');
  setMusicEnabled(false);
  if (sfxState().ambient) throw new Error('la música siguió con la música apagada');
  for (const s of sources(mock.made.slice(from))) {
    if (s.stops.length !== 1) throw new Error('apagar la música la dejó viva');
  }
  startAmbient();
  if (sfxState().ambient) throw new Error('la música arrancó estando apagada');
  setMusicEnabled(true);
  stopAmbient();
  setSfxEnabled(true);

  console.log(`sfx-check OK: ${SFX_NAMES.length} recetas, ${LEVELS.length} niveles, ${mock.made.length} nodos agendados`);
  process.exitCode = 0;
} catch (err) {
  console.error('sfx-check falló: ' + (err?.message || err));
  process.exitCode = 1;
}
