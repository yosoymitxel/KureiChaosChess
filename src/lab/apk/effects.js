import { animate } from 'animejs';
// Efectos visuales del APK recreados de forma independiente.
// No importa ni llama a BoardView.Fx: solo lee centros de casilla y pinta su propio canvas.
const surfaces = new WeakMap();
const running = new WeakMap();
const bossOverlays = new WeakMap();
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
  const bossOverlay = bossOverlays.get(host);
  if (bossOverlay) bossOverlay.remove();
  bossOverlays.delete(host);
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


export function playAPKHotPotatoCrown(host, view, fromCell, toCell) {
  return animateCanvas(host, view, 900, (ctx, t, w, h, locate) => {
    const a = locate(fromCell), b = locate(toCell), progress = easeOut(t);
    const arc = (cellProgress) => Math.sin(cellProgress * Math.PI) * (view && view.sq ? view.sq * 1.35 : 52);
    const x = mix(a.x, b.x, progress);
    const y = mix(a.y, b.y, progress) - arc(progress);
    for (let i = 10; i >= 0; i--) {
      const q = clamp(progress - i * 0.065, 0, 1);
      square(ctx, mix(a.x, b.x, q), mix(a.y, b.y, q) - arc(q) + 8,
        3 + (i % 3), i % 2 ? '#fff2bd' : '#ffc83d', (1 - i / 12) * (1 - t * 0.35));
    }
    square(ctx, x, y + 3, 21, '#ffc83d', 1);
    square(ctx, x - 8, y - 3, 5, '#ffc83d', 1);
    square(ctx, x + 8, y - 3, 5, '#ffc83d', 1);
    square(ctx, x - 5, y - 9, 5, '#fff2bd', 1);
    square(ctx, x + 5, y - 9, 5, '#fff2bd', 1);
    square(ctx, x, y - 13, 5, '#ffc83d', 1);
    for (let i = 0; i < 20; i++) {
      const angle = i * 2.399963 + t * 2.4;
      const radius = (1 - t) * (view && view.sq ? view.sq * 0.75 : 32);
      square(ctx, b.x + Math.cos(angle) * radius, b.y + Math.sin(angle) * radius,
        3 + (i % 3), i % 2 ? '#fff2bd' : '#ffc83d', 1 - t);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKChaosRoulette(host, view, selected, subtitle, color = '#29e3ff') {
  return animateCanvas(host, view, 1320, (ctx, t, w, h) => {
    const progress = easeOut(t);
    const rouletteNames = ['EL MURO','EL AGUJERO','PIEZA GIGANTE','EL CAMBIAZO','CLASES DE EQUITACIÓN','EL PEÓN NEUTRAL','LLUVIA DE BOMBAS','PORTALES','PATO INSPECTOR','CONGELACIÓN','FUGA DE LAVA','ASCENSO EXPRÉS'];
    const turns = 20 * t - 11 * t * t;
    const current = t > .92 ? String(selected).toUpperCase() : rouletteNames[Math.floor(turns) % rouletteNames.length];
    const panelW = Math.min(w * 0.84, 390), panelH = Math.min(h * 0.34, 138);
    const x = (w - panelW) / 2, y = (h - panelH) / 2;
    ctx.globalAlpha = 0.96;
    ctx.fillStyle = '#171526';
    ctx.fillRect(x, y, panelW, panelH);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, panelW - 3, panelH - 3);
    for (let i = 0; i < 9; i++) {
      const bw = panelW / 9 * 0.5;
      const bx = x + ((i / 9) * panelW + t * panelW * 2.2) % panelW;
      ctx.globalAlpha = (1 - progress) * 0.35;
      ctx.fillStyle = i % 2 ? color : '#fff2bd';
      ctx.fillRect(bx, y + 8, bw, panelH - 16);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff2bd';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('RULETA DEL CAOS', w / 2, y + 24);
    ctx.fillStyle = color;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(current.slice(0, 30), w / 2, y + panelH * 0.53);
    ctx.fillStyle = '#f4ead9';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(String(subtitle).toUpperCase().slice(0, 68), w / 2, y + panelH - 18);
    ctx.globalAlpha = 1;
  });
}


export function playAPKEventStamp(host, view, cell, color = '#9b4dff') {
  return animateCanvas(host, view, 650, (ctx, t, w, h, locate) => {
    const p = locate(cell), size = view?.sq || 48, scale = t < 0.3 ? 1.7 - easeOut(t / 0.3) * 0.7 : 1;
    const alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
    const side = size * 0.42 * scale;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(-0.2);
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size / 32);
    ctx.strokeRect(-side, -side, side * 2, side * 2);
    ctx.fillStyle = color;
    ctx.fillRect(-side * 0.72, -size / 32, side * 1.44, size / 16);
    ctx.fillRect(-size / 32, -side * 0.72, size / 16, side * 1.44);
    ctx.restore();
    ctx.globalAlpha = 1;
    const radius = size * (0.35 + easeOut(t) * 0.55);
    ctx.strokeStyle = color;
    ctx.globalAlpha = (1 - t) * 0.8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

export function playAPKZoneWarning(host, view, cells, color = '#ff2d55') {
  return animateCanvas(host, view, 900, (ctx, t, w, h, locate) => {
    const size = view?.sq || 48;
    for (const cell of cells) {
      const p = locate(cell), x = p.x - size / 2, y = p.y - size / 2;
      const pulse = 0.24 + Math.sin(t * 16) * 0.07;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
      ctx.globalAlpha = t < 0.18 ? 0.9 * (1 - t / 0.18) : pulse * (1 - t * 0.35);
      ctx.fillStyle = t < 0.18 ? '#fff' : color;
      ctx.fillRect(x, y, size, size);
      ctx.globalAlpha = 0.34 * (1 - t * 0.25);
      ctx.fillStyle = '#090712';
      const stripe = size / 4, offset = (t * size * 1.2) % (stripe * 2);
      for (let i = -3; i < 6; i++) {
        const sx = x + i * stripe * 2 + offset - size;
        ctx.beginPath();
        ctx.moveTo(sx, y + size); ctx.lineTo(sx + stripe, y + size);
        ctx.lineTo(sx + stripe + size, y); ctx.lineTo(sx + size, y);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, size / 30);
      ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKWeakPointMarker(host, view, cell) {
  return animateCanvas(host, view, 1500, (ctx, t, w, h, locate) => {
    const p = locate(cell), size = view?.sq || 48, unit = Math.max(2, Math.round(size / 16));
    const radius = size * (0.34 + Math.sin(t * Math.PI * 4) * 0.035);
    ctx.globalAlpha = 0.2 + Math.sin(t * Math.PI * 4) * 0.04;
    ctx.fillStyle = '#ffc83d';
    ctx.fillRect(p.x - size * 0.43, p.y - size * 0.43, size * 0.86, size * 0.86);
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(t * Math.PI * 1.8);
    ctx.fillStyle = '#ffc83d';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(radius - unit * 2, -unit / 2, unit * 3, unit);
      ctx.fillRect(radius - unit * 2, -unit * 1.5, unit, unit * 3);
    }
    ctx.restore();
    square(ctx, p.x, p.y, unit * 2, '#ff2d55', 1);
    square(ctx, p.x, p.y, unit, '#fff', 1);
  });
}

export function playAPKWeakPointHit(host, view, cell, color = '#ffc83d') {
  return animateCanvas(host, view, 420, (ctx, t, w, h, locate) => {
    const p = locate(cell), size = view?.sq || 48, progress = easeOut(t);
    for (let i = 0; i < 24; i++) {
      const angle = i * 2.399963, distance = progress * size * (0.18 + (i % 5) * 0.17);
      square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance - progress * size * 0.18,
        3 + (i % 3) * 2, i % 4 === 0 ? '#fff' : i % 2 ? color : '#ff9f1c', 1 - t);
    }
    ctx.globalAlpha = 1 - t;
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, size / 18);
    ctx.beginPath(); ctx.arc(p.x, p.y, size * (0.2 + progress * 0.72), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    square(ctx, p.x, p.y, size * 0.34 * (1 - t * 0.55), '#fff2bd', 1 - t * 0.7);
  });
}

export function playAPKBullet(host, view, fromCell, toCell, color = '#ffc83d') {
  const size = view?.sq || 48;
  const distance = Math.max(Math.abs(toCell.row - fromCell.row), Math.abs(toCell.col - fromCell.col));
  const duration = Math.max(240, distance * 95);
  return animateCanvas(host, view, duration, (ctx, t, w, h, locate) => {
    const a = locate(fromCell), b = locate(toCell), p = easeOut(t);
    const x = mix(a.x, b.x, p), y = mix(a.y, b.y, p);
    const tail = clamp(p - 0.25, 0, 1);
    const tx = mix(a.x, b.x, tail), ty = mix(a.y, b.y, tail);
    ctx.strokeStyle = color; ctx.globalAlpha = 0.5 * (1 - t * 0.3);
    ctx.lineWidth = Math.max(3, size / 8);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
    ctx.globalAlpha = 1;
    square(ctx, x, y, size * 0.24, '#fff', 1);
    square(ctx, x, y, size * 0.12, color, 1);
    for (let i = 1; i <= 4; i++) {
      const q = clamp(p - i * 0.055, 0, 1), px = mix(a.x, b.x, q), py = mix(a.y, b.y, q);
      square(ctx, px, py, size * (0.12 - i * 0.014), color, (1 - i / 5) * (1 - t * 0.4));
    }
    ctx.globalAlpha = 1;
  });
}

export async function playAPKBossCut(host, view, bossPiece, {
  title = 'JEFE', subtitle = 'HA ENTRADO AL TABLERO', quote = '', color = '#ff2d55', phase = 'enter'
} = {}) {
  const previous = bossOverlays.get(host);
  if (previous) previous.remove();
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'absolute', inset: '0', zIndex: '35', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 'clamp(10px, 3vw, 28px)', boxSizing: 'border-box',
    pointerEvents: 'none', background: phase === 'attack' ? 'rgba(90,8,20,.28)' : 'rgba(5,4,14,.46)'
  });
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    width: 'min(540px, 94%)', minHeight: '150px', boxSizing: 'border-box',
    display: 'grid', gridTemplateColumns: 'minmax(88px, 132px) minmax(0,1fr)', alignItems: 'center',
    gap: 'clamp(10px, 3vw, 22px)', padding: 'clamp(14px, 3vw, 24px)',
    color: '#f4ead9', background: 'linear-gradient(135deg,#171126 0%,#080711 72%)',
    border: '2px solid ' + color, boxShadow: '0 12px 38px #000a, inset 0 0 0 1px ' + color + '55',
    fontFamily: 'inherit'
  });
  const portrait = document.createElement('div');
  Object.assign(portrait.style, {
    display: 'grid', placeItems: 'center', minWidth: '0', aspectRatio: '1', position: 'relative',
    background: 'radial-gradient(circle,' + color + '44 0%,transparent 72%)'
  });
  const sourceArt = bossPiece && view?.els.get(bossPiece)?.querySelector('.pc-art');
  if (sourceArt) {
    const clone = sourceArt.cloneNode(true);
    Object.assign(clone.style, { position: 'relative', inset: 'auto', width: '100%', height: '100%', display: 'grid', placeItems: 'center', transform: 'none', filter: 'drop-shadow(0 8px 10px #0009)' });
    const svg = clone.querySelector('svg');
    if (svg) Object.assign(svg.style, { width: '100%', height: '100%', maxWidth: '128px', maxHeight: '128px' });
    portrait.append(clone);
  } else {
    const fallback = document.createElement('div');
    fallback.textContent = 'X';
    Object.assign(fallback.style, { fontSize: 'clamp(56px,12vw,96px)', fontWeight: '1000', color });
    portrait.append(fallback);
  }
  const copy = document.createElement('div');
  const eyebrow = document.createElement('small'); eyebrow.textContent = 'BOSS CHESS 2.0';
  Object.assign(eyebrow.style, { display: 'block', color, fontSize: '10px', fontWeight: '900', letterSpacing: '.14em', marginBottom: '8px' });
  const heading = document.createElement('b'); heading.textContent = title;
  Object.assign(heading.style, { display: 'block', fontSize: 'clamp(18px,4vw,30px)', lineHeight: '1.05', letterSpacing: '.02em', textTransform: 'uppercase' });
  const detail = document.createElement('span'); detail.textContent = subtitle;
  Object.assign(detail.style, { display: 'block', color: '#c9c3e0', fontSize: 'clamp(10px,2vw,13px)', fontWeight: '800', marginTop: '8px', lineHeight: '1.35' });
  copy.append(eyebrow, heading, detail);
  if (quote) {
    const line = document.createElement('i'); line.textContent = '“' + quote + '”';
    Object.assign(line.style, { display: 'block', color: '#e4d4b5', fontSize: '11px', marginTop: '10px', lineHeight: '1.35' });
    copy.append(line);
  }
  panel.append(portrait, copy); overlay.append(panel); host.append(overlay); bossOverlays.set(host, overlay);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const duration = reduced ? 180 : phase === 'attack' ? 920 : phase === 'defeat' ? 1250 : 1650;
  const frames = phase === 'attack'
    ? [{ opacity: 0, transform: 'translateX(0) scale(.85)' }, { opacity: 1, transform: 'translateX(-7px) scale(1.03)', offset: .18 }, { opacity: 1, transform: 'translateX(7px) scale(1)', offset: .42 }, { opacity: 1, transform: 'translateX(-3px) scale(1)', offset: .65 }, { opacity: 1, transform: 'translateX(0) scale(1)' }]
    : phase === 'defeat'
      ? [{ opacity: 1, transform: 'translateY(0) rotate(0) scale(1)' }, { opacity: 1, transform: 'translateY(8px) rotate(1deg) scale(.98)', offset: .35 }, { opacity: 0, transform: 'translateY(46px) rotate(7deg) scale(.76)' }]
      : [{ opacity: 0, transform: 'translateY(24px) scale(.72)' }, { opacity: 1, transform: 'translateY(-4px) scale(1.035)', offset: .72 }, { opacity: 1, transform: 'translateY(0) scale(1)' }];
  const portraitFrames = phase === 'attack'
    ? [{ transform: 'translateX(0) scale(1)' }, { transform: 'translateX(-6px) scale(1.06)', offset: .25 }, { transform: 'translateX(6px) scale(1)', offset: .5 }, { transform: 'translateX(0) scale(1)' }]
    : phase === 'defeat'
      ? [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(34px) scale(.72)', opacity: .15 }]
      : [{ transform: 'translateY(16px) scale(.72)', opacity: .2 }, { transform: 'translateY(-5px) scale(1.08)', opacity: 1, offset: .72 }, { transform: 'translateY(0) scale(1)', opacity: 1 }];
  try {
    await Promise.all([
      panel.animate(frames, { duration, easing: phase === 'defeat' ? 'ease-in' : 'cubic-bezier(.18,.82,.22,1)', fill: 'forwards' }).finished,
      portrait.animate(portraitFrames, { duration, easing: phase === 'defeat' ? 'ease-in' : 'cubic-bezier(.18,.82,.22,1)', fill: 'forwards' }).finished
    ]);
  } catch {}
  if (phase === 'attack') {
    const flash = document.createElement('div');
    Object.assign(flash.style, { position: 'absolute', inset: '0', background: color, opacity: '.18' });
    overlay.prepend(flash);
    try { await flash.animate([{ opacity: .18 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }).finished; } catch {}
  }
  if (bossOverlays.get(host) === overlay) bossOverlays.delete(host);
  overlay.remove();
}

export function playAPKCaption(host, view, message = 'LA RULETA HA HABLADO', color = '#ffc83d') {
  return animateCanvas(host, view, 2500, (ctx, t, w, h) => {
    const progress = t < 0.16 ? easeOut(t / 0.16) : t > 0.84 ? 1 - easeOut((t - 0.84) / 0.16) : 1;
    const panelW = Math.min(w * 0.88, 620), panelH = Math.max(52, Math.min(76, h * 0.16));
    const x = (w - panelW) / 2, y = h - panelH - Math.max(14, h * 0.045) + (1 - progress) * 22;
    ctx.globalAlpha = progress;
    ctx.fillStyle = '#141020'; ctx.fillRect(x, y, panelW, panelH);
    ctx.fillStyle = color; ctx.fillRect(x, y, 5, panelH);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.strokeRect(x + .75, y + .75, panelW - 1.5, panelH - 1.5);
    ctx.fillStyle = '#fff2bd'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('NARRADOR', x + 16, y + 16);
    ctx.fillStyle = '#f4ead9'; ctx.font = 'bold 12px monospace';
    const maxChars = Math.max(12, Math.floor((panelW - 32) / 7.2));
    const text = String(message).slice(0, maxChars);
    ctx.fillText(text, x + 16, y + panelH * .66);
    ctx.globalAlpha = 1;
  });
}

export function playAPKTilePattern(host, view, cells, type) {
  return animateCanvas(host, view, 1800, (ctx, t, w, h, locate) => {
    const size = view?.sq || 48, unit = Math.max(2, Math.round(size / 16));
    cells.forEach((cell, index) => {
      const p = locate(cell), x = p.x - size / 2, y = p.y - size / 2;
      if (type === 'void') {
        ctx.fillStyle = '#030208'; ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#2a1a55'; ctx.lineWidth = unit; ctx.strokeRect(x + unit / 2, y + unit / 2, size - unit, size - unit);
        for (let i = 0; i < 7; i++) {
          const seed = i * 2.399963 + index;
          const px = x + ((Math.sin(seed * 3.1) + 1) * .5) * (size - unit * 2) + unit;
          const py = y + ((Math.cos(seed * 2.4 + t * 2) + 1) * .5) * (size - unit * 2) + unit;
          square(ctx, px, py, unit * (1 + (i % 2)), i % 2 ? '#9b4dff' : '#29e3ff', .5 + Math.sin(t * 5 + i) * .3);
        }
      } else if (type === 'lava' || type === 'hot') {
        ctx.fillStyle = type === 'hot' ? '#541800' : '#7a1a00'; ctx.fillRect(x, y, size, size);
        for (let i = 0; i < 5; i++) {
          const q = (t * (type === 'hot' ? 1.3 : .7) + i * .21 + index * .13) % 1;
          const px = x + ((i * 37 + index * 11) % Math.max(1, size - unit * 3));
          ctx.fillStyle = i % 2 ? '#ff6a00' : '#ffc83d'; ctx.globalAlpha = 1 - q * .3;
          ctx.fillRect(px, y + size - q * size, unit * 2, unit * 2);
        }
        ctx.globalAlpha = .3; ctx.fillStyle = '#ff6a00'; ctx.fillRect(x, y + Math.sin(t * 8 + index) * unit, size, unit * 2); ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff6a00'; ctx.lineWidth = unit; ctx.strokeRect(x + unit / 2, y + unit / 2, size - unit, size - unit);
      } else if (type === 'curse') {
        ctx.fillStyle = 'rgba(155,77,255,.25)'; ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#c28bff'; ctx.fillRect(p.x - unit, p.y - unit * 3, unit * 2, unit * 6); ctx.fillRect(p.x - unit * 3, p.y - unit, unit * 6, unit * 2);
      } else if (type === 'infect') {
        ctx.fillStyle = 'rgba(61,255,142,.22)'; ctx.fillRect(x, y, size, size);
        for (let i = 0; i < 4; i++) { const q = (t * .8 + i / 4) % 1; ctx.globalAlpha = 1 - q; square(ctx, x + size * (.16 + i * .22), y + size * (.8 - q * .6), unit * 2, '#3dff8e', 1); }
        ctx.globalAlpha = 1;
      } else if (type === 'wall') {
        ctx.fillStyle = '#3a3450'; ctx.fillRect(x, y, size, size); ctx.fillStyle = '#524a6e';
        for (let row = 0; row < 4; row++) { ctx.fillRect(x + (row % 2 ? size / 2 : 0), y + row * size / 4, size / 2 - unit, size / 4 - unit); }
        ctx.fillStyle = '#231e33'; ctx.fillRect(x, y + size - unit * 2, size, unit * 2);
      } else if (type === 'platform') {
        ctx.fillStyle = 'rgba(255,200,61,.22)'; ctx.fillRect(x, y, size, size); ctx.fillStyle = '#ffc83d';
        ctx.fillRect(x + unit, y + size - unit * 3, size - unit * 2, unit * 2);
        for (let px = 0; px < size; px += unit * 4) ctx.fillRect(x + px, y + size - unit, unit * 2, unit);
      } else if (type === 'portal') {
        const color = index % 2 ? '#ff2bd6' : '#29e3ff';
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t * Math.PI * 2 * (index % 2 ? -1 : 1));
        ctx.strokeStyle = color; ctx.lineWidth = unit * 1.5; ctx.strokeRect(-size * .3, -size * .3, size * .6, size * .6);
        ctx.rotate(Math.PI / 4); ctx.globalAlpha = .6; ctx.strokeRect(-size * .22, -size * .22, size * .44, size * .44); ctx.restore();
      } else if (type === 'trap') {
        ctx.fillStyle = '#5a5470';
        for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
          const px = x + size * (.2 + col * .3), py = y + size * (.25 + row * .28);
          ctx.fillRect(px - unit / 2, py - unit, unit, unit * 2); ctx.fillStyle = '#c9c3e0'; ctx.fillRect(px - unit / 2, py - unit * 2, unit, unit); ctx.fillStyle = '#5a5470';
        }
        ctx.fillStyle = 'rgba(255,45,85,.15)'; ctx.fillRect(x, y, size, size);
      }
    });
    ctx.globalAlpha = 1;
  });
}

export function playAPKDisco(host, view) {
  return animateCanvas(host, view, 1800, (ctx, t, w, h) => {
    const lights = ['#ff2bd6', '#29e3ff', '#ffc83d', '#3dff8e'];
    lights.forEach((color, i) => {
      const x = w * (.5 + .42 * Math.sin(t * Math.PI * 1.8 + i * 2));
      const y = h * (.5 + .42 * Math.cos(t * Math.PI * 2.2 + i));
      const radius = (view?.sq || 48) * (1.1 + Math.sin(t * Math.PI * 3 + i) * .25);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color + '66'); glow.addColorStop(1, color + '00');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = glow; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = 'source-over';
    });
    ctx.globalAlpha = 1;
  });
}

export function playAPKSpeedTimer(host, view) {
  return animateCanvas(host, view, 3000, (ctx, t, w, h) => {
    const progress = 1 - t, barH = 7;
    const color = progress > .5 ? '#3dff8e' : progress > .25 ? '#ffc83d' : '#ff2d55';
    ctx.fillStyle = '#080710'; ctx.fillRect(0, 0, w, barH + 4);
    ctx.fillStyle = color; ctx.fillRect(0, 0, w * progress, barH + 4);
    const n = Math.max(0, Math.ceil(progress * 3));
    ctx.globalAlpha = .22 + (1 - (progress * 3 % 1)) * .3;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = progress > .34 ? '#fff' : '#ff2d55';
    ctx.font = 'bold ' + Math.max(24, Math.min(80, (view?.sq || 48) * 1.5)) + 'px monospace';
    ctx.fillText(String(n), w / 2, h / 2);
    ctx.globalAlpha = 1;
  });
}

export function playAPKDeathStyle(host, view, cell, how = 'capture') {
  const size = view?.sq || 48;
  const duration = how === 'boss' ? 1250 : how === 'fall' ? 560 : 720;
  return animateCanvas(host, view, duration, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t);
    const palettes = {
      capture: ['#fff', '#ffc83d', '#ff2d55'],
      burn: ['#ff6a00', '#ffc83d', '#ff2d55', '#222'],
      explode: ['#ff6a00', '#ffc83d', '#ff2d55', '#222'],
      infect: ['#3dff8e', '#1f7a3a', '#a9d68e'],
      crush: ['#ff2d55', '#ffc83d', '#fff', '#8d86bd'],
      fade: ['#8d86bd', '#c28bff', '#555'],
      boss: ['#ff6a00', '#ffc83d', '#ff2d55', '#fff']
    };
    const colors = palettes[how] || palettes.capture;
    const count = how === 'boss' ? 64 : how === 'explode' ? 52 : how === 'capture' ? 34 : 28;
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963, speed = size * (how === 'boss' ? 1.25 : .72) * (.3 + (i % 7) * .13);
      const dist = progress * speed;
      const gravity = how === 'burn' || how === 'explode' || how === 'boss' ? t * t * size * .45 : how === 'infect' ? -t * size * .28 : t * t * size * .22;
      square(ctx, p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist + gravity,
        3 + (i % 4) * 2, colors[i % colors.length], 1 - t * (how === 'fade' ? .95 : .85));
    }
    if (how === 'capture' || how === 'crush') {
      for (let slash = 0; slash < 2; slash++) {
        const dx = size * (.35 + progress * .5), dy = size * (.22 + slash * .2);
        ctx.globalAlpha = 1 - t; ctx.strokeStyle = slash ? '#ffc83d' : '#fff'; ctx.lineWidth = Math.max(2, size * .07);
        ctx.beginPath(); ctx.moveTo(p.x - dx, p.y + (slash ? dy : -dy)); ctx.lineTo(p.x + dx, p.y + (slash ? -dy : dy)); ctx.stroke();
      }
    }
    if (how === 'explode' || how === 'boss') {
      const flash = Math.max(0, 1 - Math.abs(t - .12) / .12);
      ctx.globalAlpha = flash * (how === 'boss' ? .55 : .42); ctx.fillStyle = how === 'boss' ? '#ff2d55' : '#ff6a00';
      ctx.fillRect(p.x - size * (how === 'boss' ? 1 : .8), p.y - size * (how === 'boss' ? 1 : .8), size * (how === 'boss' ? 2 : 1.6), size * (how === 'boss' ? 2 : 1.6));
      ctx.globalAlpha = 1;
      const radius = size * (0.2 + progress * 1.1);
      ctx.strokeStyle = '#ffc83d'; ctx.lineWidth = Math.max(2, size * .06); ctx.globalAlpha = 1 - t;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKCriticalDamage(host, view, cell, amount = 3) {
  return animateCanvas(host, view, 780, (ctx, t, w, h, locate) => {
    const p = locate(cell), size = view?.sq || 48, progress = easeOut(t);
    const flash = Math.max(0, 1 - Math.abs(t - .12) / .2);
    ctx.globalAlpha = flash * .5; ctx.fillStyle = '#ffc83d'; ctx.fillRect(p.x - size * .45, p.y - size * .45, size * .9, size * .9);
    ctx.globalAlpha = 1 - t * .7; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + Math.max(12, size * .32) + 'px monospace'; ctx.lineWidth = 3; ctx.strokeStyle = '#171126';
    const label = 'CRÍTICO! -' + amount;
    const y = p.y - progress * size * .85;
    ctx.strokeText(label, p.x, y); ctx.fillStyle = '#ffc83d'; ctx.fillText(label, p.x, y);
    for (let i = 0; i < 14; i++) {
      const angle = i * 2.399963, d = progress * size * (.2 + (i % 4) * .18);
      square(ctx, p.x + Math.cos(angle) * d, p.y + Math.sin(angle) * d, 3 + (i % 2) * 2, i % 3 ? '#ffc83d' : '#fff', 1 - t);
    }
    ctx.globalAlpha = 1;
  });
}

export function playAPKFloatingText(host, view, cell, message = '¡JAQUE!', color = '#ffc83d') {
  return animateCanvas(host, view, 1250, (ctx, t, w, h, locate) => {
    const p = locate(cell), size = view?.sq || 48, k = easeOut(t);
    const alpha = t > .72 ? (1 - t) / .28 : 1;
    const y = p.y - k * size * .72;
    ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + Math.max(10, size * .23) + 'px monospace';
    ctx.lineWidth = 3; ctx.strokeStyle = '#090711'; ctx.strokeText(message, p.x + 2, y + 2);
    ctx.fillStyle = color; ctx.fillText(message, p.x, y);
    ctx.globalAlpha = 1;
  });
}


export function playAPKTransformVariant(host, view, cell, how = 'evolve') {
  const palettes = {
    zombify: ['#3dff8e', '#1f7a3a', '#a9d68e'],
    devolve: ['#8d86bd', '#555', '#c28bff'],
    evolve: ['#ffc83d', '#fff', '#9b4dff'],
    promote: ['#ffc83d', '#fff', '#9b4dff']
  };
  const colors = palettes[how] || palettes.evolve;
  const word = how === 'zombify' ? 'INFECTED!' : how === 'devolve' ? 'DEVOLVED' : how === 'promote' ? 'PROMOTED!' : 'EVOLVED!';
  return animateCanvas(host, view, 820, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t), maxR = (view?.sq || 54) * 1.25;
    for (let ring = 0; ring < 3; ring++) {
      const radius = 5 + progress * maxR + ring * 7, count = Math.max(8, Math.floor(radius * Math.PI * 2 / 7));
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        square(ctx, p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius, ring === 0 ? 6 : 4, colors[ring % colors.length], (1 - t) * (1 - ring * .19));
      }
    }
    for (let i = 0; i < 28; i++) {
      const angle = i * 2.399963, distance = progress * maxR * (.2 + (i % 5) * .15);
      square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance - progress * 14, 3 + (i % 3), colors[i % colors.length], 1 - t * .8);
    }
    ctx.globalAlpha = clamp((t - .18) * 2.5, 0, 1) * (1 - t * .2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.font = '900 13px monospace';
    ctx.lineWidth = 3; ctx.strokeStyle = '#171126'; ctx.strokeText(word, p.x, p.y - maxR * .12 - progress * 10);
    ctx.fillStyle = colors[0]; ctx.fillText(word, p.x, p.y - maxR * .12 - progress * 10); ctx.globalAlpha = 1;
  });
}

export function playAPKSpawnVariant(host, view, cell, how = 'summon') {
  const palettes = { summon: ['#9b4dff', '#29e3ff', '#fff'], revive: ['#ff9de2', '#fff', '#ffc83d'], zombie: ['#3dff8e', '#1f7a3a', '#6f9e5a'] };
  const colors = palettes[how] || palettes.summon;
  return animateCanvas(host, view, 620, (ctx, t, w, h, locate) => {
    const p = locate(cell), progress = easeOut(t), size = view?.sq || 48;
    for (let i = 0; i < 34; i++) {
      const angle = i * 2.399963, distance = progress * size * (.14 + (i % 7) * .12);
      square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance - (1 - progress) * size * .28, 3 + (i % 4), colors[i % colors.length], (1 - t) * .95);
    }
    ctx.strokeStyle = colors[0]; ctx.lineWidth = Math.max(2, size / 24); ctx.globalAlpha = 1 - t;
    ctx.beginPath(); ctx.arc(p.x, p.y, size * (.15 + progress * .58), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  });
}

export function playAPKColumnBeam(host, view, col, rowStart, rowEnd, color = '#29e3ff') {
  return animateCanvas(host, view, 560, (ctx, t, w, h, locate) => {
    const a = locate({row:rowStart,col}), b = locate({row:rowEnd,col}), size = view?.sq || 48;
    const top = Math.min(a.y, b.y) - size / 2, height = Math.abs(b.y - a.y) + size, width = size * (.6 * (1 - t) + .12);
    ctx.globalAlpha = 1 - t * .75; ctx.fillStyle = color; ctx.fillRect(a.x - width / 2, top, width, height);
    ctx.fillStyle = '#fff'; ctx.fillRect(a.x - width / 6, top, width / 3, height);
    for (let i = 0; i < 12; i++) square(ctx, a.x + Math.sin(t * 18 + i) * width * .4, top + ((t * 1.8 + i / 12) % 1) * height, 3 + (i % 3), i % 2 ? color : '#fff', 1 - t * .6);
    ctx.globalAlpha = 1;
  });
}

export function playAPKBanner(host, view, title, subtitle = '', color = '#ffc83d') {
  return animateCanvas(host, view, 1650, (ctx, t, w, h) => {
    const k = easeOut(t < .2 ? t / .2 : 1), fade = t > .82 ? (1 - t) / .18 : 1;
    const panelW = Math.min(w * .86, 540), panelH = Math.min(104, Math.max(68, h * .22));
    const x = (w - panelW) / 2, y = h * .5 - panelH / 2 + (1 - k) * 28;
    ctx.globalAlpha = fade * .94; ctx.fillStyle = '#151020'; ctx.fillRect(x, y, panelW, panelH);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, panelW - 3, panelH - 3);
    ctx.fillStyle = color; ctx.fillRect(x + 8, y + 8, 4, panelH - 16);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff2bd';
    ctx.font = 'bold ' + Math.max(12, Math.min(22, panelH * .25)) + 'px monospace';
    ctx.fillText(String(title).toUpperCase().slice(0, 34), w / 2, y + panelH * .4);
    ctx.fillStyle = '#f4ead9'; ctx.font = 'bold ' + Math.max(9, Math.min(13, panelH * .14)) + 'px monospace';
    ctx.fillText(String(subtitle).toUpperCase().slice(0, 68), w / 2, y + panelH * .72); ctx.globalAlpha = 1;
  });
}


export function playAPKTileSpark(host, view, cell) {
  return animateCanvas(host, view, 520, (ctx, t, w, h, locate) => {
    const p = locate(cell), size = view?.sq || 48, progress = easeOut(t);
    ctx.globalAlpha = 1 - t * .7; ctx.strokeStyle = '#9b4dff'; ctx.lineWidth = Math.max(2, size / 28);
    ctx.beginPath(); ctx.arc(p.x, p.y, size * (.12 + progress * .48), 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4, distance = progress * size * .48;
      square(ctx, p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance, 3 + (i % 3), i % 2 ? '#29e3ff' : '#9b4dff', 1 - t);
    }
    ctx.globalAlpha = 1;
  });
}
