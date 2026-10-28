// Lightweight particle layer drawn on a 2D canvas on top of the 3D board.
// Runs its rAF loop only while particles exist. Las explosiones y los escombros suenan solos:
// así cada minijuego que los usa tiene su golpe sin tener que acordarse.
import { playSfx } from '../ui/sfx.js';
import sfShield from '../../vendor/sprite-fusion/shield.js';
import sfFire from '../../vendor/sprite-fusion/fire.js';
import { WEATHER_FX } from './weather-fx.js';

const WEATHER_RATE = { rain: 70 }; // los demás climas, en weather-fx.js
const SF_PX = 2; // cada píxel de los efectos de Sprite Fusion ocupa 2 px de pantalla // partículas por segundo cada 360 px de ancho

export class Fx {
  constructor(host) {
    this.host = host;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fx-layer';
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.parts = [];
    this.sf = []; // efectos de Sprite Fusion en curso
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
    if (!this.vfx || matchMedia('(prefers-reduced-motion: reduce)').matches) kind = null;
    this.weather = kind ? { kind, acc: 0, W: WEATHER_FX[kind], n: {} } : null;
    if (kind) this.kick();
  }
  // Arranca ya lleno, en cuanto la capa tiene tamaño: cada partícula nace a mitad de su recorrido.
  prewarm(kind) {
    const n = WEATHER_RATE[kind] * (this.w / 360) * { rain: this.h / 690 }[kind];
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
  // Escudo (Shield de Sprite Fusion): semiesfera de celdas hexagonales que se arma de abajo arriba,
  // recibe el golpe con chispas y una onda, y se deshace en estrellas. (x, y) es la base; `r` el radio.
  // Su cúpula es una semiesfera; `tall` la estira en vertical desde la base hasta cubrir la figura.
  shield(x, y, r, { broken = false, tall = r } = {}) {
    if (!this.vfx) return;
    const hold = broken ? 0.75 : 1;
    const fx = sfShield({ x, y, radius: Math.max(10, Math.round(r / SF_PX)), hold, hits: [{ t: 0.45, lon: 0.5, lat: 0.6 }], seed: (Math.random() * 1e9) | 0 });
    this.sf.push(Object.assign(fx, { sy: Math.max(1, tall / r), by: y }));
    this.kick();
  }
  // Fuego (Fire de Sprite Fusion): llamas que lamen la caja de la pieza (x, y, w, h) unos instantes.
  fire(x, y, w, h, secs = 1.4) {
    if (!this.vfx) return;
    this.sf.push(sfFire({ box: [x, y, w, h], duration: secs, size: Math.max(0.6, w / 40), seed: (Math.random() * 1e9) | 0 }));
    this.kick();
  }
  // Veneno: nube verde que se abre y burbujas que suben y revientan.
  poison(x, y, w) {
    if (!this.vfx) return;
    this.burst(x, y, { count: 6, color: ['rgba(120,200,80,.35)', 'rgba(90,160,60,.3)'], speed: [10, 40], life: [0.8, 1.3], size: [w * 0.25, w * 0.4], gravity: -20, shape: 'smoke' });
    this.burst(x, y, { count: 10, color: ['#b6f37a', '#7fd14a'], speed: [10, 30], life: [0.6, 1.1], size: [2, 3.5], gravity: -90, spread: 1.2, angle: -Math.PI / 2, shape: 'mote' });
  }

  // Vuelca los efectos de Sprite Fusion: cada uno pinta su buffer de color y de luz a SF_PX px por
  // píxel; el color se pega encima y la luz se suma ('lighter'), como en su motor.
  drawSf(dt) {
    const w = Math.ceil(this.w / SF_PX), h = Math.ceil(this.h / SF_PX);
    const list = this.sf;
    if (!list.length) return;
    let f = this.sfFrame;
    if (!f || f.w !== w || f.h !== h) {
      const canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
      f = this.sfFrame = { w, h, ox: 0, oy: 0, color: new Uint32Array(w * h), light: new Uint32Array(w * h), canvas, img: new ImageData(w, h) };
    }
    for (const fx of list) fx.update(dt);
    // Los que van a escala 1 comparten pasada; los estirados (escudo alto) van cada uno en la suya.
    const flat = list.filter((fx) => !(fx.sy > 1));
    if (flat.length) this.blitSf(f, flat, 1, 0);
    for (const fx of list) if (fx.sy > 1) this.blitSf(f, [fx], fx.sy, fx.by);
    this.sf = this.sf.filter((fx) => !fx.done());
  }
  blitSf(f, list, sy, by) {
    const { w, h } = f;
    f.color.fill(0); f.light.fill(0);
    for (const fx of list) { fx.draw(f, 'back'); fx.draw(f, 'front'); }
    const { ctx } = this, c2 = f.canvas.getContext('2d'), px = new Uint32Array(f.img.data.buffer);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1;
    if (sy !== 1) { ctx.translate(0, by); ctx.scale(1, sy); ctx.translate(0, -by); }
    px.set(f.color); c2.putImageData(f.img, 0, 0);
    ctx.drawImage(f.canvas, 0, 0, w * SF_PX, h * SF_PX);
    // La capa es transparente: sumar luz ahí la oscurecería. Cada píxel de luz pasa a su color a
    // tope con alfa = su brillo, que es lo mismo premultiplicado.
    for (let i = 0; i < px.length; i++) {
      const v = f.light[i];
      if (!v) { px[i] = 0; continue; }
      const r = v & 255, g = (v >>> 8) & 255, b = (v >>> 16) & 255, m = Math.max(r, g, b);
      px[i] = m ? ((m << 24) | (((b * 255) / m) << 16) | (((g * 255) / m) << 8) | ((r * 255) / m)) >>> 0 : 0;
    }
    c2.putImageData(f.img, 0, 0);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7;
    ctx.drawImage(f.canvas, 0, 0, w * SF_PX, h * SF_PX);
    ctx.restore();
  }

  kick() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.loop(t)); } }
  loop(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const { ctx } = this, pixel = document.documentElement.dataset.art === 'pixel';
    ctx.clearRect(0, 0, this.w, this.h);
    const T = now / 1000, W = this.weather?.W;
    if (W && this.h > 40) {
      // Cada tipo mantiene sus partículas vivas; al empezar nacen repartidas por toda la capa.
      for (const [wk, target] of Object.entries(W.count(this.w, this.h))) {
        for (let n = this.weather.n[wk] || 0; n < target; n++) this.parts.push({ g: 0, drag: 1, rot: 0, life: Infinity, max: 1, ...W.spawn(wk, this.w, this.h, !this.weather.warm), wk, W, owner: this.weather });
        this.weather.n[wk] = Math.max(this.weather.n[wk] || 0, Math.ceil(target));
      }
      this.weather.warm = true;
      if (W.under) { ctx.save(); W.under(ctx, T, pixel, this.w, this.h); ctx.restore(); }
    } else if (this.weather && !this.weather.warm && this.h > 40) { this.weather.warm = true; this.prewarm(this.weather.kind); }
    if (this.weather && !W) {
      const rate = WEATHER_RATE[this.weather.kind] * (this.w / 360);
      for (this.weather.acc += rate * dt; this.weather.acc >= 1; this.weather.acc--) this.spawn(this.weather.kind);
    }
    this.drawSf(dt);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.life -= dt;
      if (p.life <= 0) { this.parts.splice(i, 1); p.end?.(p); if (p.wk) p.owner.n[p.wk]--; continue; }
      if (p.wait > 0) { p.wait -= dt; continue; }
      if (p.W) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (!p.W.tick(p, dt, T, this.w, this.h)) { this.parts.splice(i, 1); p.owner.n[p.wk]--; continue; }
        ctx.save(); ctx.globalAlpha = 1; p.W.draw(ctx, p, T, pixel, this.w); ctx.restore();
        continue;
      }
      const k = Math.pow(p.drag, dt * 60);
      p.vx *= k; p.vy = p.vy * k + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += (p.vr || 0) * dt;
      const t = Math.min(1, p.life / p.max);
      ctx.globalAlpha = Math.min(1, t * 1.6) * (p.alpha ?? 1) * (p.flicker ? 0.6 + 0.4 * Math.sin(now / 90 + p.size * 9) : 1);
      if (p.shape === 'beam') { this.ray(p, pixel); continue; }
            if (pixel) { this.block(p, t); continue; }
      if (p.shape === 'mote') {
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
    this.raf = this.parts.length || this.weather || this.sf.length ? requestAnimationFrame((t) => this.loop(t)) : 0;
    if (!this.raf) ctx.clearRect(0, 0, this.w, this.h);
  }
}
