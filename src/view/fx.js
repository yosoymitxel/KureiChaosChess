// Lightweight particle layer drawn on a 2D canvas on top of the 3D board.
// Runs its rAF loop only while particles exist.
export class Fx {
  constructor(host) {
    this.host = host;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fx-layer';
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.parts = [];
    this.raf = 0;
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
  ring(x, y, { color = '#fff', radius = 60, life = 0.45, width = 3 } = {}) {
    this.parts.push({ x, y, vx: 0, vy: 0, life, max: life, g: 0, drag: 1, size: radius, color, shape: 'ring', width });
    this.kick();
  }
  dust(x, y, scale = 1) {
    this.burst(x, y, { count: Math.round(10 * scale), color: ['rgba(240,230,210,.7)', 'rgba(200,190,170,.5)'], speed: [30 * scale, 110 * scale], life: [0.35, 0.7], size: [3, 7 * scale], spread: Math.PI, angle: Math.PI / 2 + Math.PI, gravity: -20, drag: 0.85 });
  }
  confetti(colors) {
    for (let i = 0; i < 4; i++)
      this.burst(this.w * (0.2 + i * 0.2), -10, { count: 30, color: colors, speed: [60, 240], life: [1.4, 2.4], size: [4, 8], gravity: 260, shape: 'rect', spread: Math.PI * 0.8, angle: Math.PI / 2, drag: 0.97 });
  }

  kick() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.loop(t)); } }
  loop(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.life -= dt;
      if (p.life <= 0) { this.parts.splice(i, 1); continue; }
      const k = Math.pow(p.drag, dt * 60);
      p.vx *= k; p.vy = p.vy * k + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += (p.vr || 0) * dt;
      const t = p.life / p.max;
      ctx.globalAlpha = Math.min(1, t * 1.6);
      if (p.shape === 'ring') {
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
    this.raf = this.parts.length ? requestAnimationFrame((t) => this.loop(t)) : 0;
    if (!this.raf) ctx.clearRect(0, 0, this.w, this.h);
  }
}
