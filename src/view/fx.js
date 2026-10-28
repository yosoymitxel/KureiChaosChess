// Lightweight particle layer drawn on a 2D canvas on top of the 3D board.
// Runs its rAF loop only while particles exist. Las explosiones y los escombros suenan solos:
// así cada minijuego que los usa tiene su golpe sin tener que acordarse.
import { playSfx } from '../ui/sfx.js';

const WEATHER_RATE = { rain: 70, snow: 26, fog: 0.5, embers: 14 }; // partículas por segundo cada 360 px de ancho

export class Fx {
  constructor(host) {
    this.host = host;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fx-layer';
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.parts = [];
    this.raf = 0;
    this.vfx = false; // efectos extra (Sprite Fusion): Ajustes › Efectos extra, apagado por defecto
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
  }
  resize() {
    const r = this.host.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  destroy() { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.canvas.remove(); }

  // Center of an element in this layer's coordinates.
  pointOf(el, yBias = 0.5) {
    const a = el.getBoundingClientRect(), b = this.host.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height * yBias };
  }

  burst(x, y, { count = 20, color = '#fff', speed = [60, 260], life = [0.4, 0.9], size = [2, 5], gravity = 0, shape = 'dot', spread = Math.PI * 2, angle = 0, drag = 0.9 } = {}) {
    const colors = [].concat(color);
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const sp = speed[0] + Math.random() * (speed[1] - speed[0]);
      const lf = life[0] + Math.random() * (life[1] - life[0]);
      this.parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: lf, max: lf, g: gravity, drag,
        size: size[0] + Math.random() * (size[1] - size[0]), color: colors[i % colors.length], shape,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 14,
      });
    }
    this.kick();
  }
  // Disparo: un rayo que sale de (x, y) y llega a (x1, y1) en `grow` s, con un fogonazo al salir y
  // chispas donde pega; luego se apaga. Para los cañones de Matamarcianos y las damas a ciegas.
  beam(x, y, x1, y1, { color = '#ffcf6b', width = 5, life = 0.45, grow = 0.12 } = {}) {
    this.parts.push({ x, y, x1, y1, vx: 0, vy: 0, life, max: life, grow, g: 0, drag: 1, size: width, color, shape: 'beam' });
    this.burst(x, y, { count: 8, color: [color, '#fff'], speed: [40, 140], life: [0.15, 0.3], size: [1.5, 3], shape: 'spark' });
    setTimeout(() => this.burst(x1, y1, { count: 12, color: [color, '#fff'], speed: [60, 200], life: [0.2, 0.45], size: [1.5, 3.5], shape: 'spark' }), grow * 1000);
    this.kick();
  }
  ring(x, y, { color = '#fff', radius = 60, life = 0.45, width = 3 } = {}) {
    this.parts.push({ x, y, vx: 0, vy: 0, life, max: life, g: 0, drag: 1, size: radius, color, shape: 'ring', width });
    this.kick();
  }
  dust(x, y, scale = 1) {
    this.burst(x, y, { count: Math.round(10 * scale), color: ['rgba(240,230,210,.7)', 'rgba(200,190,170,.5)'], speed: [30 * scale, 110 * scale], life: [0.35, 0.7], size: [3, 7 * scale], spread: Math.PI, angle: Math.PI / 2 + Math.PI, gravity: -20, drag: 0.85 });
  }
  // Explosión: destello, onda, chispas que dejan estela, brasas que caen y humo que sube y se abre.
  explosion(x, y, scale = 1, sound = true) {
    if (sound) playSfx('boom');
    this.parts.push({ x, y, vx: 0, vy: 0, life: 0.18, max: 0.18, g: 0, drag: 1, size: 34 * scale, color: '#fff6d8', shape: 'flash' });
    this.parts.push({ x, y, vx: 0, vy: 0, life: 0.3, max: 0.3, g: 0, drag: 1, size: 52 * scale, color: '#ffb347', shape: 'flash' });
    this.ring(x, y, { color: '#ffe2a8', radius: 90 * scale, life: 0.4, width: 5 });
    this.burst(x, y, { count: Math.round(18 * scale), color: ['#fff2c2', '#ffcf6b', '#ff8a3d'], speed: [220 * scale, 520 * scale], life: [0.25, 0.5], size: [1.5, 3], shape: 'spark', drag: 0.86 });
    this.burst(x, y, { count: Math.round(14 * scale), color: ['#ff8a3d', '#e2552b', '#ffcf6b'], speed: [80, 260 * scale], life: [0.6, 1.1], size: [2, 4], gravity: 420, shape: 'chunk' });
    this.smoke(x, y, scale);
    // Con efectos extra: tierra arrancada y una segunda onda baja, como el Explosion de Sprite Fusion.
    if (this.vfx) {
      this.burst(x, y, { count: Math.round(12 * scale), color: ['#6b4a2e', '#4a3220', '#8a6a48'], speed: [120, 320 * scale], life: [0.6, 1], size: [3, 6], gravity: 800, shape: 'chunk', spread: Math.PI * 0.9, angle: -Math.PI / 2 });
      this.ring(x, y, { color: '#c9a77a', radius: 130 * scale, life: 0.6, width: 3 });
    }
  }
  // La caída del rey: estallido grande, onda ancha y escombros. Las bombas de los minijuegos la usan
  // a su escala (`scale` 1 = una casilla de unos 40 px) para que todo estalle igual en el juego.
  bigBoom(x, y, { scale = 1, radius = 160 * scale, color = '#2a201a' } = {}) {
    playSfx('bigboom');
    this.explosion(x, y, 1.6 * scale, false);
    this.ring(x, y, { radius, width: 8, life: 0.7 });
    this.debris(x, y, color, 1.4 * scale, false);
  }
  smoke(x, y, scale = 1) {
    this.burst(x, y, { count: Math.round(9 * scale), color: ['rgba(70,60,55,.55)', 'rgba(110,100,92,.45)', 'rgba(150,140,130,.35)'], speed: [20, 90 * scale], life: [0.7, 1.3], size: [10 * scale, 22 * scale], gravity: -60, drag: 0.9, shape: 'smoke' });
  }
  // Escombros de una pieza capturada: solo su color y tinta, con peso; nada de confeti.
  debris(x, y, color, scale = 1, sound = true) {
    if (sound) playSfx('crunch');
    this.burst(x, y, { count: Math.round(16 * scale), color: [color, color, '#2a201a'], speed: [90, 300 * scale], life: [0.5, 0.9], size: [3, 6 * scale], gravity: 700, shape: 'chunk', spread: Math.PI * 1.2, angle: -Math.PI / 2, drag: 0.94 });
    this.dust(x, y + 6, 0.8 * scale);
  }
  // Destello de mejora (coronar, curar, carta): estrellas que giran y suben un poco.
  sparkle(x, y, color = '#ffcf6b', count = 10) {
    this.burst(x, y, { count, color: [color, '#fff'], speed: [70, 240], life: [0.6, 1.1], size: [6, 12], gravity: -40, shape: 'star', drag: 0.9 });
  }
  confetti(colors) {
    for (let i = 0; i < 4; i++)
      this.burst(this.w * (0.2 + i * 0.2), -10, { count: 30, color: colors, speed: [60, 240], life: [1.4, 2.4], size: [4, 8], gravity: 260, shape: 'rect', spread: Math.PI * 0.8, angle: Math.PI / 2, drag: 0.97 });
  }

  // Mesas píxel: cada partícula es un bloque en la rejilla del arte (G px por píxel de sprite),
  // sin giros ni bordes suaves; la transparencia va en tres escalones.
  block(p, t) {
    const { ctx } = this, G = 3, snap = (v) => Math.round(v / G) * G;
    const sq = (x, y, n = 1) => ctx.fillRect(snap(x - (n * G) / 2), snap(y - (n * G) / 2), n * G, n * G);
    const disc = (x, y, r) => { for (let dy = -r; dy <= r; dy += G) { const w = snap(Math.sqrt(Math.max(0, r * r - dy * dy))); ctx.fillRect(snap(x) - w, snap(y + dy), 2 * w || G, G); } };
    const a = (v) => Math.ceil(Math.min(1, v) * 3) / 3;
    ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
    switch (p.shape) {
      case 'mote': return sq(p.x, p.y, Math.max(1, Math.round(p.size / G)));
      case 'fogbank': {
        // Bancos de niebla a franjas (una fila sí, otra no), más anchos que altos.
        for (let dy = -p.size * 0.5; dy <= p.size * 0.5; dy += G * 2) { const w = snap(p.size * 1.8 * Math.sqrt(1 - (2 * dy / p.size) ** 2)); ctx.fillRect(snap(p.x) - w, snap(p.y + dy), 2 * w, G); }
        return;
      }
      case 'flash': ctx.globalAlpha = a(t); return disc(p.x, p.y, p.size * (1.2 - t * 0.6));
      case 'smoke': ctx.globalAlpha = a(t * 0.9); return disc(p.x, p.y, p.size * (1.6 - t * 0.8));
      case 'ring': {
        const rx = p.size * (1 - t * 0.8), ry = rx * 0.55, n = Math.max(8, Math.round((rx * 2) / G));
        ctx.globalAlpha = a(t);
        for (let k = 0; k < n; k++) { const ang = (k / n) * 6.283; sq(p.x + Math.cos(ang) * rx, p.y + Math.sin(ang) * ry, Math.max(1, Math.round((p.width * t) / G))); }
        return;
      }
      case 'spark': for (let k = 0; k < 3; k++) sq(p.x - p.vx * 0.017 * k, p.y - p.vy * 0.017 * k); return;
      case 'star': { const n = Math.max(1, Math.round((p.size * (0.4 + t * 0.6)) / (G * 1.5))); sq(p.x, p.y, n); sq(p.x - n * G, p.y); sq(p.x + n * G, p.y); sq(p.x, p.y - n * G); sq(p.x, p.y + n * G); return; }
      case 'rect': return ctx.fillRect(snap(p.x), snap(p.y), snap(p.size) || G, snap(p.size * 0.5) || G);
      case 'chunk': return sq(p.x, p.y, Math.max(1, Math.round((p.size * t + 1) / G)));
      default: return sq(p.x, p.y, Math.max(1, Math.round((p.size * t * 2) / G)));
    }
  }

  ray(p, pixel) {
    const { ctx } = this, age = p.max - p.life, k = Math.min(1, age / p.grow), t = p.life / (p.max - p.grow);
    const x1 = p.x + (p.x1 - p.x) * k, y1 = p.y + (p.y1 - p.y) * k, w = p.size * Math.min(1, t);
    ctx.globalAlpha = Math.min(1, t * 1.5);
    if (pixel) {
      const G = 3, n = Math.max(1, Math.round(Math.hypot(x1 - p.x, y1 - p.y) / G)), s = Math.max(G, Math.round(w / G) * G);
      ctx.fillStyle = p.color;
      for (let i = 0; i <= n; i++) ctx.fillRect(Math.round((p.x + ((x1 - p.x) * i) / n - s / 2) / G) * G, Math.round((p.y + ((y1 - p.y) * i) / n - s / 2) / G) * G, s, s);
      return;
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = p.color; ctx.lineWidth = w * 2.2; ctx.globalAlpha *= 0.35;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.globalAlpha = Math.min(1, t * 1.5); ctx.strokeStyle = p.color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = w * 0.4;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x1, y1); ctx.stroke();
  }

  // Clima continuo sobre el tablero (recetas de Sprite Fusion Pixel Art VFX, MIT): lluvia, nieve,
  // niebla y brasas. Se emite en cada cuadro mientras `weather` esté puesto; null lo apaga.
  setWeather(kind) {
    this.weather = !this.vfx || matchMedia('(prefers-reduced-motion: reduce)').matches ? null : kind ? { kind, acc: 0 } : null;
    if (this.weather) this.kick();
  }
  // Arranca ya lleno, en cuanto la capa tiene tamaño: cada partícula nace a mitad de su recorrido.
  prewarm(kind) {
    if (kind === 'fog') { for (let i = 0; i < 5; i++) this.spawn('fog', Math.random()); return; }
    const n = WEATHER_RATE[kind] * (this.w / 360) * { rain: this.h / 690, snow: this.h / 44, embers: 3 }[kind];
    for (let i = 0; i < n; i++) {
      this.spawn(kind);
      const p = this.parts[this.parts.length - 1], a = Math.random() * p.life;
      p.x += p.vx * a; p.y += p.vy * a; p.life -= a;
    }
  }
  spawn(kind, at = 0) {
    const { w, h } = this, rnd = (a, b) => a + Math.random() * (b - a);
    const add = (o) => this.parts.push({ g: 0, drag: 1, rot: 0, max: o.life, ...o });
    if (kind === 'rain') {
      const vy = rnd(620, 760), land = rnd(h * 0.15, h), life = (land + 20) / vy;
      add({ x: rnd(0, w + h * 0.2), y: -20, vx: -vy * 0.18, vy, life, size: 1.4, color: '#c8d8ff', shape: 'spark', alpha: 0.45,
        end: (p) => this.burst(p.x, p.y, { count: 2, color: '#c8d8ff', speed: [20, 50], life: [0.15, 0.25], size: [1, 2], angle: -Math.PI / 2, spread: 2, gravity: 300 }) });
    } else if (kind === 'snow') {
      const vy = rnd(28, 60);
      add({ x: rnd(-20, w + 20), y: -6, vx: rnd(-14, 22), vy, life: (h + 12) / vy, size: rnd(1.4, 3), color: '#fff', shape: 'mote', alpha: 0.85 });
    } else if (kind === 'fog') {
      const vx = rnd(10, 22), life = (w + 200) / vx;
      add({ x: -100 + at * (w + 200), y: rnd(h * 0.2, h * 0.75), vx, vy: 0, life: life * (1 - at) + 0.5, size: rnd(55, 95), color: '#e4eaf0', shape: 'fogbank', alpha: 0.3 });
    } else if (kind === 'embers') {
      const life = rnd(2, 4);
      add({ x: rnd(0, w), y: h + 6, vx: rnd(-18, 18), vy: rnd(-90, -40), life, size: rnd(1.4, 2.6), color: ['#ffb347', '#ff6a2b', '#ffd27a'][Math.floor(Math.random() * 3)], shape: 'mote', alpha: 1, flicker: true });
    }
  }

  // Power-up: chispas que trepan por el contorno de la pieza y un anillo que late en la base.
  aura(x, y, h, color = '#ffcf6b') {
    if (!this.vfx) return;
    this.ring(x, y, { color, radius: h * 0.7, life: 0.6, width: 3 });
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * 6.283, life = 0.5 + Math.random() * 0.6;
      this.parts.push({ x: x + Math.cos(a) * h * 0.32, y: y + Math.sin(a) * h * 0.12 - Math.random() * h * 0.5, vx: 0, vy: -h * (0.9 + Math.random()), g: 0, drag: 0.97, life, max: life, size: 1.5 + Math.random() * 1.5, color: [color, '#fff'][i % 2], shape: 'mote', rot: 0, flicker: true });
    }
    this.kick();
  }
  // Escudo: cúpula de celdas hexagonales que se enciende al recibir el golpe; `broken` la hace añicos.
  shield(x, y, r, { color = '#8fd3ff', broken = false } = {}) {
    if (!this.vfx) return;
    this.parts.push({ x, y, vx: 0, vy: 0, g: 0, drag: 1, life: 0.45, max: 0.45, size: r, color, shape: 'dome', rot: 0 });
    if (broken) this.burst(x, y - r * 0.5, { count: 18, color: [color, '#fff'], speed: [80, 240], life: [0.4, 0.8], size: [2, 4], gravity: 500, shape: 'chunk' });
    this.kick();
  }
  // Fuego: llamas que lamen la pieza unos instantes (para lo que queda junto al meteorito).
  fire(x, y, w, secs = 1.4) {
    if (!this.vfx) return;
    for (let i = 0; i < Math.round(secs * 40); i++) {
      const life = 0.35 + Math.random() * 0.4, delay = Math.random() * secs;
      this.parts.push({ x: x + (Math.random() - 0.5) * w, y, vx: (Math.random() - 0.5) * 20, vy: -60 - Math.random() * 80, g: -60, drag: 0.95, life: life + delay, max: life, wait: delay, size: 2 + Math.random() * 3, color: ['#fff2c2', '#ffcf6b', '#ff8a3d', '#e2552b'][i % 4], shape: 'mote', rot: 0, flicker: true });
    }
    this.kick();
  }
  // Veneno: nube verde que se abre y burbujas que suben y revientan.
  poison(x, y, w) {
    if (!this.vfx) return;
    this.burst(x, y, { count: 6, color: ['rgba(120,200,80,.35)', 'rgba(90,160,60,.3)'], speed: [10, 40], life: [0.8, 1.3], size: [w * 0.25, w * 0.4], gravity: -20, shape: 'smoke' });
    this.burst(x, y, { count: 10, color: ['#b6f37a', '#7fd14a'], speed: [10, 30], life: [0.6, 1.1], size: [2, 3.5], gravity: -90, spread: 1.2, angle: -Math.PI / 2, shape: 'mote' });
  }

  dome(p, t, pixel) {
    const { ctx } = this, r = p.size * (1.05 - t * 0.05), G = 3;
    ctx.globalAlpha = t * 0.9; ctx.strokeStyle = ctx.fillStyle = p.color; ctx.lineWidth = 2;
    const hex = (cx, cy, s) => {
      if (pixel) { for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; ctx.fillRect(Math.round((cx + Math.cos(a) * s) / G) * G, Math.round((cy + Math.sin(a) * s) / G) * G, G, G); } return; }
      ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; ctx.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } ctx.closePath(); ctx.stroke();
    };
    const s = r * 0.2;
    for (let row = 0; row < 4; row++) for (let k = -3; k <= 3; k++) {
      const cx = p.x + k * s * 1.55 + (row % 2) * s * 0.78, cy = p.y - row * s * 1.35;
      if (Math.hypot((cx - p.x) / r, (cy - p.y) / (r * 1.1)) < 0.95) hex(cx, cy - r * 0.15, s * 0.8);
    }
    ctx.globalAlpha = t * 0.25; ctx.beginPath(); ctx.ellipse(p.x, p.y - r * 0.15, r, r * 1.1, 0, Math.PI, 0); ctx.fill();
  }

  kick() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.loop(t)); } }
  loop(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const { ctx } = this, pixel = document.documentElement.dataset.art === 'pixel';
    ctx.clearRect(0, 0, this.w, this.h);
    if (this.weather && !this.weather.warm && this.h > 40) { this.weather.warm = true; this.prewarm(this.weather.kind); }
    if (this.weather) {
      const rate = WEATHER_RATE[this.weather.kind] * (this.w / 360);
      for (this.weather.acc += rate * dt; this.weather.acc >= 1; this.weather.acc--) this.spawn(this.weather.kind);
    }
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.life -= dt;
      if (p.life <= 0) { this.parts.splice(i, 1); p.end?.(p); continue; }
      if (p.wait > 0) { p.wait -= dt; continue; }
      const k = Math.pow(p.drag, dt * 60);
      p.vx *= k; p.vy = p.vy * k + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += (p.vr || 0) * dt;
      const t = Math.min(1, p.life / p.max);
      ctx.globalAlpha = Math.min(1, t * 1.6) * (p.alpha ?? 1) * (p.flicker ? 0.6 + 0.4 * Math.sin(now / 90 + p.size * 9) : 1);
      if (p.shape === 'fogbank') ctx.globalAlpha = p.alpha * Math.max(0, Math.min(1, t * 4, (1 - t) * 4, (this.h - p.y) / p.size - 0.2));
      if (p.shape === 'beam') { this.ray(p, pixel); continue; }
      if (p.shape === 'dome') { this.dome(p, t, pixel); continue; }
      if (pixel) { this.block(p, t); continue; }
      if (p.shape === 'fogbank') {
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gr.addColorStop(0, p.color); gr.addColorStop(1, 'transparent');
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1.8, 1); ctx.translate(-p.x, -p.y);
        ctx.fillStyle = gr; ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2); ctx.restore();
      } else if (p.shape === 'mote') {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
      } else if (p.shape === 'flash') {
        ctx.globalAlpha = t; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.2 - t * 0.6), 0, 6.283); ctx.fill();
      } else if (p.shape === 'smoke') {
        ctx.globalAlpha = t * 0.9; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.6 - t * 0.8), 0, 6.283); ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); ctx.stroke();
      } else if (p.shape === 'star') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
        const r = p.size * (0.4 + t * 0.6);
        ctx.beginPath();
        for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, rr = k % 2 ? r * 0.3 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill(); ctx.restore();
      } else if (p.shape === 'ring') {
        ctx.strokeStyle = p.color; ctx.lineWidth = p.width * t;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * (1 - t * 0.8), p.size * (1 - t * 0.8) * 0.55, 0, 0, 6.283); ctx.stroke();
      } else if (p.shape === 'rect' || p.shape === 'chunk') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
        const s = p.shape === 'rect' ? [p.size, p.size * 0.5] : [p.size * t + 1, p.size * t + 1];
        ctx.fillRect(-s[0] / 2, -s[1] / 2, s[0], s[1]); ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.3, p.size * t), 0, 6.283); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    this.raf = this.parts.length || this.weather ? requestAnimationFrame((t) => this.loop(t)) : 0;
    if (!this.raf) ctx.clearRect(0, 0, this.w, this.h);
  }
}
