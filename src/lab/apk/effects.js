import { animate } from 'animejs';
// Efectos visuales del APK recreados de forma independiente.
// No importa ni llama a BoardView.Fx: solo lee centros de casilla y pinta su propio canvas.
const surfaces = new WeakMap();
const running = new WeakMap();
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const mix = (a, b, t) => a + (b - a) * t;

function surfaceFor(host) {
  let canvas = surfaces.get(host);
  if (!canvas || !host.contains(canvas)) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    canvas = document.createElement('canvas');
    canvas.className = 'apk-fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: '20', pointerEvents: 'none' });
    host.append(canvas);
    surfaces.set(host, canvas);
  }
  return canvas;
}

function cancel(host) {
  const job = running.get(host);
  if (job) job.finish();
}

export function clearAPKEffects(host) {
  if (!host) return;
  cancel(host);
  const canvas = surfaces.get(host);
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function pointOf(host, view, cell) {
  const tile = view && view.tiles && view.tiles.get(cell.row + ',' + cell.col);
  const hostRect = host.getBoundingClientRect();
  if (!tile) return { x: hostRect.width / 2, y: hostRect.height / 2 };
  const rect = tile.getBoundingClientRect();
  return { x: rect.left + rect.width / 2 - hostRect.left, y: rect.top + rect.height / 2 - hostRect.top };
}

function animateCanvas(host, view, duration, draw) {
  cancel(host);
  const canvas = surfaceFor(host);
  const rect = host.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return new Promise((resolve) => {
    let start = 0;
    let settled = false;
    const job = {
      raf: 0,
      finish: () => {
        if (settled) return;
        settled = true;
        cancelAnimationFrame(job.raf);
        ctx.clearRect(0, 0, width, height);
        if (running.get(host) === job) running.delete(host);
        resolve();
      }
    };
    running.set(host, job);
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const actualDuration = reduced ? Math.min(120, duration) : duration;
    const locate = (cell) => pointOf(host, view, cell);
    const frame = (now) => {
      if (settled || running.get(host) !== job) return;
      if (!start) start = now;
      const t = clamp((now - start) / actualDuration, 0, 1);
      ctx.clearRect(0, 0, width, height);
      draw(ctx, t, width, height, locate);
      if (t < 1) job.raf = requestAnimationFrame(frame);
      else job.finish();
    };
    job.raf = requestAnimationFrame(frame);
  });
}

function square(ctx, x, y, size, color, alpha = 1) {
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.fillStyle = color;
  const snap = (v) => Math.round(v / 4) * 4;
  const s = Math.max(3, Math.round(size / 4) * 4);
  ctx.fillRect(snap(x - s / 2), snap(y - s / 2), s, s);
  ctx.globalAlpha = 1;
}

export async function playAPKDeal(view, pieces, effectHost = view && view.host) {
  if (!view || !view.host || !view.board) return;
  const boardHost = view.host;
  boardHost.classList.add('dealing');
  try {
    const tiles = [...view.tiles.values()];
    const { rows, cols } = view.board;
    const distance = (tile) => Math.hypot(+tile.dataset.r - (rows - 1) / 2, +tile.dataset.c - (cols - 1) / 2);
    const tilesIntro = animate(tiles, {
      opacity: [0, 1],
      z: [-view.sq * 2.4, 0],
      duration: view.d(360),
      ease: 'outExpo',
      delay: (tile) => view.d(distance(tile) * 22),
      onComplete: () => tiles.forEach((tile) => {
        tile.style.removeProperty('transform');
        tile.style.removeProperty('opacity');
      })
    });
    await tilesIntro;

    const order = pieces.filter((piece) => view.state.has(piece) && view.els.has(piece))
      .slice()
      .sort((a, b) => a.color === 'light' ? b.row - a.row : a.row - b.row);
    const jobs = [];
    order.forEach((piece, index) => {
      const state = view.state.get(piece), element = view.els.get(piece);
      state.z = view.sq * 2.65;
      view.apply(piece);
      element.style.opacity = '0';
      const delay = view.d(index * 16);
      jobs.push(animate(element, {
        opacity: [0, 1], duration: view.d(120), delay,
        onComplete: () => element.style.removeProperty('opacity')
      }));
      jobs.push(animate(state, {
        z: 0, duration: view.d(320), delay, ease: 'outCubic',
        onUpdate: () => view.apply(piece)
      }));
    });
    await Promise.all(jobs);
  } finally {
    boardHost.classList.remove('dealing');
  }
  if (pieces.length && effectHost) await playAPKSpawnBurst(effectHost, view, pieces);
}

export function playAPKSpawnBurst(host, view, pieces) {
  return animateCanvas(host, view, 380, (ctx, t, w, h, locate) => {
    const progress = easeOut(t);
    for (let index = 0; index < pieces.length; index++) {
      const piece = pieces[index], p = locate({ row: piece.row, col: piece.col });
      const main = piece.zombie ? '#3dff8e' : piece.color === 'light' ? '#efffa5' : '#ff9f1c';
      for (let chip = 0; chip < 3; chip++) {
        const angle = index * 0.61 + chip * 2.399963;
        const distance = progress * (8 + (index % 4) * 4 + chip * 3);
        square(ctx, p.x + Math.cos(angle) * distance,
          p.y + Math.sin(angle) * distance - (1 - progress) * 4,
          3 + ((index + chip) % 2) * 2, chip === 1 ? '#ffffff' : main, (1 - t) * 0.95);
      }
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKPixelTrail(host, view, fromCell, toCell) {
  return animateCanvas(host, view, 680, (ctx, t, w, h, locate) => {
    const a = locate(fromCell), b = locate(toCell), front = easeOut(t);
    for (let i = 10; i >= 0; i--) {
      const p = clamp(front - i * 0.075, 0, 1);
      const x = mix(a.x, b.x, p), y = mix(a.y, b.y, p);
      const alpha = (1 - i / 12) * (1 - t * 0.4);
      square(ctx, x, y, 7 + (i % 3) * 2, i % 3 === 0 ? '#efffa5' : '#3dff8e', alpha);
      square(ctx, x - 5, y + 4, 4, '#1f7a3a', alpha * 0.85);
      if (i % 2 === 0) square(ctx, x + 6, y - 4, 4, '#a9d68e', alpha * 0.75);
    }
    square(ctx, b.x, b.y, 9 + Math.sin(t * Math.PI) * 4, '#ffffff', 1 - t * 0.45);
    ctx.globalAlpha = 1;
  });
}

export function playAPKShockwave(host, view, cell) {
  return animateCanvas(host, view, 760, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t);
    for (let ring = 0; ring < 3; ring++) {
      const radius = 8 + progress * (view && view.sq ? view.sq * 1.8 : 90) + ring * 9;
      const alpha = (1 - t) * (1 - ring * 0.22);
      const steps = Math.max(12, Math.floor(radius / 3));
      for (let i = 0; i < steps; i++) {
        const angle = i / steps * Math.PI * 2;
        square(ctx, p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius, ring === 0 ? 7 : 4,
          ring === 1 ? '#ffcf6b' : '#ff6a00', alpha);
      }
    }
    for (let i = 0; i < 26; i++) {
      const angle = i * 2.399963, travel = progress * (18 + (i % 7) * 7);
      square(ctx, p.x + Math.cos(angle) * travel, p.y + Math.sin(angle) * travel + t * t * 16,
        3 + (i % 3) * 2, i % 4 === 0 ? '#fff2bd' : '#ff2d55', (1 - t) * 0.95);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKBombBlast(host, view, center, cells) {
  const targetCells = cells && cells.length ? cells : [center];
  return animateCanvas(host, view, 680, (ctx, t, w, h, locate) => {
    const p = locate(center), progress = easeOut(t);
    for (const cell of targetCells) {
      const q = locate(cell), tileSize = (view && view.sq ? view.sq : 48) * (0.18 + Math.max(0, 1 - t * 0.75) * 0.72);
      ctx.globalAlpha = (1 - t * 0.7) * 0.82;
      ctx.fillStyle = (Math.abs(cell.row - center.row) + Math.abs(cell.col - center.col)) % 2 ? '#ff2d55' : '#ff6a00';
      ctx.fillRect(q.x - tileSize / 2, q.y - tileSize / 2, tileSize, tileSize);
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 42; i++) {
      const angle = i * 2.399963, distance = progress * (10 + (i % 9) * 6);
      square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance + t * t * 20,
        4 + (i % 4) * 2, i % 5 === 0 ? '#fff2bd' : i % 2 ? '#ff2d55' : '#ff9f1c', (1 - t) * 0.95);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKMeteorImpact(host, view, cells) {
  return animateCanvas(host, view, 940, (ctx, t, w, h, locate) => {
    const progress = easeOut(t);
    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index], p = locate(cell), size = view && view.sq ? view.sq : 48;
      if (t < 0.48) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 36 + index), radius = size * (0.18 + pulse * 0.1);
        ctx.globalAlpha = 0.85; ctx.strokeStyle = '#fff5dc'; ctx.lineWidth = 3; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        const meteorY = p.y - size * (3.2 - progress * 2.9);
        for (let k = 0; k < 5; k++) square(ctx, p.x + (k % 2) * 3, meteorY - k * 8, 5 + (4-k), k < 2 ? '#fff2bd' : '#ff6a00', 0.92 - k * 0.12);
      } else {
        const local = clamp((t - 0.48) / 0.52, 0, 1), radius = size * (0.25 + local * 1.2);
        for (let i = 0; i < 26; i++) {
          const angle = i * 2.399963 + index * 0.7, distance = radius * (0.18 + (i % 5) * 0.15);
          square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance + local * local * 12, 3 + (i % 3) * 2,
            i % 4 === 0 ? '#fff2bd' : i % 2 ? '#ff6a00' : '#ff2d55', 1 - local * 0.82);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKDamage(host, view, cell, tone = 'red') {
  const palette = tone === 'gold' ? ['#fff2bd', '#ffcf6b', '#f58c24'] : ['#fff2bd', '#ff2d55', '#ff6a00'];
  return animateCanvas(host, view, 520, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t), max = (view && view.sq ? view.sq : 48) * 0.68;
    const flash = Math.max(0, 1 - Math.abs(t - 0.2) / 0.2);
    if (flash > 0) { ctx.globalAlpha = flash * 0.6; ctx.fillStyle = palette[0]; ctx.fillRect(p.x - max * 0.55, p.y - max * 0.55, max * 1.1, max * 1.1); ctx.globalAlpha = 1; }
    for (let i = 0; i < 22; i++) {
      const angle = i * 2.399963, distance = progress * max * (0.35 + (i % 5) * 0.16);
      square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance, 3 + (i % 3) * 2, palette[i % palette.length], 1 - t);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKTeleport(host, view, fromCell, toCell) {
  return animateCanvas(host, view, 640, (ctx, t, w, h, locate) => {
    const a = locate(fromCell), b = locate(toCell), pulse = easeOut(t);
    for (let i = 0; i < 16; i++) {
      const tail = clamp(pulse - i * 0.045, 0, 1), drift = Math.sin(t * 12 + i * 0.7) * 9;
      square(ctx, mix(a.x, b.x, tail) + drift, mix(a.y, b.y, tail) - drift * 0.65, i % 3 === 0 ? 7 : 4,
        i % 2 ? '#29e3ff' : '#c58bff', (1 - i / 19) * (1 - t * 0.3));
    }
    for (let i = 0; i < 18; i++) {
      const angle = i * 2.399963 + t * 4, radius = (1 - t) * (view && view.sq ? view.sq * 0.8 : 38);
      square(ctx, b.x + Math.cos(angle) * radius, b.y + Math.sin(angle) * radius, 4 + (i % 2) * 3, i % 2 ? '#29e3ff' : '#ffffff', 1 - t);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKFall(host, view, cell) {
  return animateCanvas(host, view, 560, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t), size = view && view.sq ? view.sq : 48;
    for (let i = 0; i < 30; i++) {
      const angle = i * 2.399963, distance = progress * size * (0.15 + (i % 6) * 0.13);
      square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance + t * t * size * 0.55,
        4 + (i % 3) * 2, i % 4 ? '#7f56d9' : '#bca8ff', 1 - t * 0.9);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKParticleBurst(host, view, cell, colors = ['#3dff8e', '#efffa5'], count = 24) {
  return animateCanvas(host, view, 520, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t);
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963, speed = 12 + (i % 7) * 5;
      const spread = progress * speed;
      const x = p.x + Math.cos(angle) * spread;
      const y = p.y + Math.sin(angle) * spread + t * t * 8;
      square(ctx, x, y, 3 + (i % 3) * 2, colors[i % colors.length], 1 - t);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKBombField(host, view, cells) {
  return animateCanvas(host, view, 600, (ctx, t, w, h, locate) => {
    const progress = easeOut(t);
    for (let index = 0; index < cells.length; index++) {
      const p = locate(cells[index]), pulse = 1 - t;
      ctx.globalAlpha = Math.max(0, pulse * (0.55 + 0.45 * Math.sin(t * 15 + index)));
      ctx.fillStyle = index % 2 ? '#ff2d55' : '#ff6a00';
      const size = (view && view.sq ? view.sq : 44) * (0.2 + 0.75 * progress);
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      ctx.globalAlpha = 1;
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4 + index * 0.31;
        const distance = progress * ((view && view.sq ? view.sq : 44) * 0.9);
        square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance + t * t * 8,
          3 + i % 3 * 2, i % 2 ? '#fff2bd' : '#ff9f1c', 1 - t);
      }
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKShield(host, view, cell, broken = false) {
  return animateCanvas(host, view, broken ? 360 : 620, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t), size = view && view.sq ? view.sq : 48;
    for (let ring = 0; ring < 3; ring++) {
      const radius = size * (0.2 + progress * 0.7) + ring * 5;
      const count = 12 + ring * 4;
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        square(ctx, p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius,
          broken ? 5 : 4, broken ? (i % 2 ? '#ff2d55' : '#ffcf6b') : (i % 2 ? '#d3f9ff' : '#29e3ff'),
          (1 - t) * (1 - ring * 0.18));
      }
    }
    if (!broken && t < 0.75) {
      ctx.globalAlpha = 0.45 * (1 - t);
      ctx.strokeStyle = '#d3f9ff';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, size * (0.3 + progress * 0.45), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKBeam(host, view, fromCell, toCell, color = '#b06bff') {
  return animateCanvas(host, view, 460, (ctx, t, w, h, locate) => {
    const a = locate(fromCell), b = locate(toCell), progress = easeOut(t);
    const endX = mix(a.x, b.x, progress), endY = mix(a.y, b.y, progress);
    const segments = 16;
    for (let i = 0; i < segments; i++) {
      const p = i / segments;
      if (p > progress) break;
      const x = mix(a.x, endX, p), y = mix(a.y, endY, p);
      square(ctx, x, y, i % 4 === 0 ? 7 : 4, i % 3 === 0 ? '#ffffff' : color, 1 - t * 0.25);
    }
    for (let i = 0; i < 12; i++) {
      const angle = i * 2.399963, distance = progress * 16;
      square(ctx, endX + Math.cos(angle) * distance, endY + Math.sin(angle) * distance,
        3 + i % 3 * 2, color, 1 - t);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKVictory(host, view, colors = ['#ffc83d', '#ffffff', '#3dff8e']) {
  return animateCanvas(host, view, 840, (ctx, t, w, h, locate) => {
    const progress = easeOut(t), origins = [{x:w*0.12,y:h*0.1},{x:w*0.88,y:h*0.1},{x:w*0.12,y:h*0.3},{x:w*0.88,y:h*0.3}];
    for (let i = 0; i < 96; i++) {
      const origin = origins[i % origins.length], angle = (i * 2.399963) % (Math.PI * 2);
      const distance = progress * (20 + (i % 13) * 5);
      const x = origin.x + Math.cos(angle) * distance + Math.sin(t * 7 + i) * 4;
      const y = origin.y + Math.sin(angle) * distance + t * t * (45 + i % 10 * 4);
      square(ctx, x, y, 3 + i % 4 * 2, colors[i % colors.length], 1 - t * 0.82);
    }
    ctx.globalAlpha = 1;
  });
}

export async function playAPKScreenShake(host, duration = 260, strength = 8) {
  if (!host || !host.animate) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) duration = Math.min(100, duration);
  const dx = strength;
  const animation = host.animate([
    { transform: 'translate3d(0,0,0)' },
    { transform: `translate3d(${-dx}px,1px,0)` },
    { transform: `translate3d(${dx}px,-1px,0)` },
    { transform: `translate3d(${-dx * 0.55}px,0,0)` },
    { transform: 'translate3d(0,0,0)' }
  ], { duration, easing: 'steps(2, end)' });
  try { await animation.finished; } catch (_) {}
}

export function playAPKZombieAttack(host, view, fromCell, targetCell) {
  return animateCanvas(host, view, 420, (ctx, t, w, h, locate) => {
    const a = locate(fromCell), b = locate(targetCell), hit = easeOut(t), count = 10;
    for (let i = 0; i < count; i++) {
      const p = clamp(hit - i * 0.065, 0, 1);
      square(ctx, mix(a.x, b.x, p), mix(a.y, b.y, p), i % 3 === 0 ? 8 : 5,
        i % 2 ? '#1f7a3a' : '#3dff8e', (1 - i / (count + 2)) * (1 - t * 0.15));
    }
    const flash = 1 - Math.abs(t - 0.76) / 0.24;
    if (flash > 0) for (let i = 0; i < 14; i++) {
      const angle = i * 2.399963;
      square(ctx, b.x + Math.cos(angle) * (8 + t * 12), b.y + Math.sin(angle) * (8 + t * 12),
        5, i % 2 ? '#ff2d55' : '#a9d68e', flash);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKTransform(host, view, cell) {
  return animateCanvas(host, view, 820, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t), maxR = (view && view.sq ? view.sq : 54) * 1.25;
    for (let ring = 0; ring < 3; ring++) {
      const r = 5 + progress * maxR + ring * 7;
      const count = Math.max(8, Math.floor(r * Math.PI * 2 / 7));
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        square(ctx, p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, ring === 0 ? 6 : 4,
          ring === 1 ? '#1f7a3a' : '#3dff8e', (1 - t) * (1 - ring * 0.19));
      }
    }
    for (let i = 0; i < 24; i++) {
      const col = i % 6, row = Math.floor(i / 6);
      square(ctx, p.x + (col - 2.5) * 8 + Math.sin(t * 8 + i) * 2,
        p.y + 12 - progress * (18 + row * 8), 4 + (i % 2) * 2,
        i % 3 === 0 ? '#a9d68e' : '#3dff8e', 1 - t * 0.72);
    }
    if (t < 0.92) {
      ctx.save();
      ctx.globalAlpha = clamp((t - 0.2) * 2, 0, 1) * (1 - t * 0.18);
      ctx.font = '900 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#173921';
      ctx.fillStyle = '#3dff8e';
      ctx.strokeText('INFECTED!', p.x, p.y - maxR * 0.12 - progress * 10);
      ctx.fillText('INFECTED!', p.x, p.y - maxR * 0.12 - progress * 10);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
}
