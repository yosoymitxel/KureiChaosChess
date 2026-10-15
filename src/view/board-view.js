// 3D tabletop renderer built from DOM + CSS transforms.
// The board is a tilted plane (rotateX); tiles live on it, pieces are cardboard
// "standees" counter-rotated to face the camera. anime.js drives all choreography.
import { animate, stagger } from 'animejs';
import { pieceSVG } from './piece-art.js';
import { Fx } from './fx.js';
import { key, cellsOf, sizeOf } from '../game/rules.js';

export const CAMERAS = { flat: 0, tilt: 40, epic: 56 };
const JUMPERS = new Set(['knight', 'camel', 'elephant']);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export class BoardView {
  constructor(host, { camera = 'tilt', shake = true, speed = 1, onTap, onDrop, canDrag, onImpact } = {}) {
    Object.assign(this, { host, onTap, onDrop, canDrag, onImpact, shakeOn: shake, speed });
    this.tilt = CAMERAS[camera] ?? 40;
    host.classList.add('table');
    host.innerHTML = `<div class="stage"><div class="board"><div class="tiles"></div><div class="pieces"></div></div></div>`;
    this.stage = host.querySelector('.stage');
    this.boardEl = host.querySelector('.board');
    this.tilesEl = host.querySelector('.tiles');
    this.piecesEl = host.querySelector('.pieces');
    this.fx = new Fx(host);
    this.tiles = new Map();
    this.els = new Map(); // piece -> element
    this.state = new Map(); // piece -> {r,c,z}
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(host);
    this.bindPointer();
    if (onTap) this.bindKeys();
  }

  // Keyboard play: arrows move a cursor over the tiles, Enter or Space acts like a tap.
  bindKeys() {
    const h = this.host;
    h.tabIndex = 0;
    h.setAttribute('role', 'application');
    h.setAttribute('aria-label', 'Tablero. Flechas para moverte, Enter para elegir o mover.');
    const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    // Only keyboard focus shows the cursor; a mouse click focuses the board too but must not draw it.
    h.addEventListener('focus', () => h.matches(':focus-visible') && this.moveCursor(this.cursor || { row: this.board.rows - 1, col: Math.floor(this.board.cols / 2) }));
    h.addEventListener('blur', () => this.tiles.get(key(this.cursor?.row, this.cursor?.col))?.classList.remove('cursor'));
    h.addEventListener('keydown', (e) => {
      if (DIRS[e.key] && !this.cursor) {
        e.preventDefault();
        this.moveCursor({ row: this.board.rows - 1, col: Math.floor(this.board.cols / 2) });
      } else if (DIRS[e.key]) {
        e.preventDefault();
        let { row, col } = this.cursor;
        const [dr, dc] = DIRS[e.key];
        // Skip over holes to the next real tile in that direction.
        do { row += dr; col += dc; } while (row >= 0 && col >= 0 && row < this.board.rows && col < this.board.cols && !this.tiles.has(key(row, col)));
        if (this.tiles.has(key(row, col))) this.moveCursor({ row, col });
      } else if ((e.key === 'Enter' || e.key === ' ') && this.cursor) {
        e.preventDefault();
        this.onTap({ ...this.cursor });
      }
    });
  }

  moveCursor(cell) {
    if (this.cursor) this.tiles.get(key(this.cursor.row, this.cursor.col))?.classList.remove('cursor');
    this.cursor = cell;
    this.tiles.get(key(cell.row, cell.col))?.classList.add('cursor');
  }

  destroy() { this.ro.disconnect(); this.fx.destroy(); this.unbind?.(); this.host.innerHTML = ''; }
  d(ms) { return reduced() ? Math.min(ms, 120) : ms / this.speed; }

  setCamera(camera) { this.tilt = CAMERAS[camera] ?? 40; this.layout(); }

  layout() {
    if (!this.board) return;
    const { width: W, height: H } = this.host.getBoundingClientRect();
    if (W < 10 || H < 10) return;
    const { rows, cols } = this.board;
    const cos = Math.cos((this.tilt * Math.PI) / 180);
    const sin = Math.sin((this.tilt * Math.PI) / 180);
    // Near rows grow with perspective, so leave more room than the projected height.
    const sq = Math.floor(Math.min((W * 0.86) / (cols * (1 + sin * 0.25)), (H * 0.8) / (rows * cos * (1 + sin * 0.3) + sin * 1.2 + 0.3)));
    this.sq = Math.max(16, sq);
    const s = this.host.style;
    s.setProperty('--sq', this.sq + 'px');
    s.setProperty('--tilt', this.tilt + 'deg');
    s.setProperty('--rows', rows);
    s.setProperty('--cols', cols);
  }


  setBoard(board) {
    this.board = board;
    this.tilesEl.innerHTML = '';
    this.tiles.clear();
    const { rows, cols, holes } = board;
    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (holes.has(key(r, c))) continue;
      const t = document.createElement('div');
      t.className = 'tile ' + ((r + c) % 2 ? 'b' : 'a');
      t.dataset.r = r; t.dataset.c = c;
      t.style.setProperty('--r', r); t.style.setProperty('--c', c);
      t.style.setProperty('--grain', ((r * 7 + c * 13) % 5) / 5);
      t.innerHTML = '<i class="mark"></i>';
      frag.appendChild(t);
      this.tiles.set(key(r, c), t);
    }
    this.tilesEl.appendChild(frag);
    this.refreshEdges();
    this.layout();
  }

  // Tiles whose south neighbour is missing show their thickness.
  refreshEdges() {
    const { rows, holes } = this.board;
    for (const [k, t] of this.tiles) {
      const [r, c] = k.split(',').map(Number);
      t.classList.toggle('edge', r === rows - 1 || holes.has(key(r + 1, c)));
    }
  }

  setPieces(pieces) {
    this.piecesEl.innerHTML = '';
    this.els.clear(); this.state.clear();
    for (const p of pieces) this.addPiece(p);
  }

  addPiece(p) {
    const el = document.createElement('div');
    const [h, w] = sizeOf(p);
    el.className = `pc side-${p.color}${p.boss ? ' boss' : ''}`;
    el.dataset.pid = p.id;
    el.style.setProperty('--h', h); el.style.setProperty('--w', w);
    el.innerHTML = `<div class="pc-shadow"></div><div class="pc-base"><i></i><i></i><i></i></div>
      <div class="pc-stand"><div class="pc-fig"><div class="pc-art">${pieceSVG(p.type)}</div>${p.boss ? this.hpHTML(p) : ''}</div></div>`;
    this.piecesEl.appendChild(el);
    this.els.set(p, el);
    const st = { r: p.row, c: p.col, z: 0 };
    this.state.set(p, st);
    this.apply(p);
    return el;
  }

  hpHTML(p) {
    return `<div class="pc-hp"><span>${p.name}</span>${Array.from({ length: p.maxHp }, (_, i) => `<b class="${i < p.hp ? 'on' : ''}"></b>`).join('')}</div>`;
  }

  apply(p) {
    const el = this.els.get(p), st = this.state.get(p);
    if (!el) return;
    el.style.setProperty('--r', st.r);
    el.style.setProperty('--c', st.c);
    el.style.setProperty('--z', st.z.toFixed(2));
  }

  setArt(p) {
    const art = this.els.get(p)?.querySelector('.pc-art');
    if (art) art.innerHTML = pieceSVG(p.type);
  }


  clearMarks() {
    for (const t of this.tiles.values()) t.classList.remove('mv', 'cap', 'danger');
  }
  // cells: Set of "r,c"; captures: Set of "r,c" with an enemy
  showMoves(cells, captures, danger = false) {
    this.clearMarks();
    for (const k of cells) {
      const t = this.tiles.get(k);
      if (!t) continue;
      t.classList.add(captures.has(k) ? 'cap' : 'mv');
      if (danger) t.classList.add('danger');
    }
  }
  select(piece) {
    for (const [p, el] of this.els) el.classList.toggle('sel', p === piece);
  }
  setThreats(set) {
    for (const [p, el] of this.els) el.classList.toggle('threat', set.has(p));
  }
  setTurn(color) { this.host.dataset.turn = color; }
  // Fog: darken tiles far from the viewer's pieces.
  setFog(pieces, color) {
    const mine = pieces.filter((p) => p.color === color);
    for (const [k, t] of this.tiles) {
      if (!mine.length) { t.style.setProperty('--fog', 0); continue; }
      const [r, c] = k.split(',').map(Number);
      let d = 99;
      for (const p of mine) for (const [pr, pc] of cellsOf(p)) d = Math.min(d, Math.max(Math.abs(pr - r), Math.abs(pc - c)));
      t.style.setProperty('--fog', Math.min(0.78, Math.max(0, (d - 1) / 5) * 0.78).toFixed(2));
    }
    for (const [p, el] of this.els) {
      if (p.color === color) { el.style.opacity = ''; continue; }
      const t = this.tiles.get(key(p.row, p.col));
      el.style.opacity = t && +t.style.getPropertyValue('--fog') > 0.6 ? 0.25 : '';
    }
  }


  cellFromEl(el) {
    const pe = el?.closest?.('[data-pid]');
    if (pe) {
      const p = [...this.els].find(([, e]) => e === pe)?.[0];
      return p ? { row: p.row, col: p.col, piece: p } : null;
    }
    const t = el?.closest?.('.tile');
    return t ? { row: +t.dataset.r, col: +t.dataset.c } : null;
  }

  bindPointer() {
    let drag = null;
    const down = (e) => {
      if (e.button > 0) return;
      const hit = this.cellFromEl(e.target);
      if (!hit) return;
      if (hit.piece && this.canDrag?.(hit.piece)) drag = { piece: hit.piece, x: e.clientX, y: e.clientY, id: e.pointerId, ghost: null };
      this.onTap?.(hit);
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        const src = this.els.get(drag.piece);
        drag.ghost = document.createElement('div');
        drag.ghost.className = `drag-ghost side-${drag.piece.color}`;
        drag.ghost.style.setProperty('--sq', this.sq + 'px');
        drag.ghost.innerHTML = pieceSVG(drag.piece.type);
        document.body.appendChild(drag.ghost);
        src.classList.add('dragging');
      }
      if (drag.ghost) drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.ghost) return;
      d.ghost.remove();
      this.els.get(d.piece)?.classList.remove('dragging');
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const hit = this.cellFromEl(under);
      this.onDrop?.(d.piece, hit);
    };
    this.host.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    this.unbind = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
    };
  }


  centerOf(p, r = p.row, c = p.col) {
    // Average the tile centres of the footprint (tiles under pieces always exist).
    let x = 0, y = 0, n = 0;
    for (const [rr, cc] of cellsOf(p, r, c)) {
      const t = this.tiles.get(key(rr, cc));
      if (!t) continue;
      const pt = this.fx.pointOf(t); x += pt.x; y += pt.y; n++;
    }
    return n ? { x: x / n, y: y / n } : { x: this.fx.w / 2, y: this.fx.h / 2 };
  }

  shake(amount = 8, ms = 380) {
    if (!this.shakeOn || reduced()) return;
    animate(this.stage, {
      x: [0, -amount, amount * 0.8, -amount * 0.5, amount * 0.3, 0],
      y: [0, amount * 0.4, -amount * 0.6, amount * 0.3, 0],
      duration: ms, ease: 'outQuad',
    });
  }

  async intro(pieces) {
    const tiles = [...this.tiles.values()];
    const { rows, cols } = this.board;
    tiles.forEach((t) => {
      const d = Math.hypot(+t.dataset.r - (rows - 1) / 2, +t.dataset.c - (cols - 1) / 2);
      t.style.setProperty('--d', d);
    });
    animate(tiles, {
      opacity: [0, 1], z: [-120, 0], duration: this.d(520), ease: 'outExpo',
      delay: (el) => this.d(+el.style.getPropertyValue('--d') * 45),
    });
    await wait(this.d(260));
    const order = pieces.slice().sort((a, b) => (a.color === 'light' ? b.row - a.row : a.row - b.row));
    order.forEach((p, i) => {
      const st = this.state.get(p), el = this.els.get(p);
      st.z = this.sq * 4; this.apply(p); el.style.opacity = 0;
      animate(el, { opacity: 1, duration: this.d(120), delay: this.d(i * 22) });
      animate(st, {
        z: 0, duration: this.d(420), delay: this.d(i * 22), ease: 'inQuad',
        onUpdate: () => this.apply(p),
        onComplete: () => { this.squash(p, 0.7); if (i % 3 === 0) { const c = this.centerOf(p); this.fx.dust(c.x, c.y, 0.6); } },
      });
    });
    await wait(this.d(order.length * 22 + 480));
    if (pieces.some((p) => p.boss)) await this.bossEntrance(pieces.find((p) => p.boss));
  }

  async bossEntrance(boss) {
    const st = this.state.get(boss);
    st.z = this.sq * 6; this.apply(boss);
    await animate(st, { z: 0, duration: this.d(520), ease: 'inCubic', onUpdate: () => this.apply(boss) });
    const c = this.centerOf(boss);
    this.shake(16, 600);
    this.fx.ring(c.x, c.y, { radius: this.sq * 3.5, color: css('--side-dark') || '#e44', width: 6, life: 0.6 });
    this.fx.dust(c.x, c.y, 2.2);
    this.squash(boss, 0.6);
  }

  squash(p, amt = 0.8) {
    const stand = this.els.get(p)?.querySelector('.pc-fig');
    if (!stand) return;
    animate(stand, { scaleY: [amt, 1.08, 1], scaleX: [1 + (1 - amt) * 0.6, 0.96, 1], duration: this.d(380), ease: 'outQuad' });
  }

  // Animate a match result produced by Match.move().
  async playMove(res) {
    const { piece, from, to, victims, bounced, promoted } = res;
    const st = this.state.get(piece);
    const dist = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));
    const jumper = JUMPERS.has(piece.type) || (piece.extraMoveTypes || []).some((t) => JUMPERS.has(t)) && dist > 1;
    const dur = this.d(Math.min(620, 240 + dist * 70) * (piece.boss ? 1.3 : 1));
    const arc = (piece.boss ? 1.4 : jumper ? 1.3 : 0.35 + dist * 0.06) * this.sq;
    this.select(null);

    if (bounced) {
      // Lunge halfway, smack the target, return.
      const mid = { r: (from.row + to.row) / 2, c: (from.col + to.col) / 2 };
      await animate(st, { r: mid.r, c: mid.c, z: [0, arc * 0.6, 0], duration: dur * 0.6, ease: 'inQuad', onUpdate: () => this.apply(piece) });
      for (const v of victims) this.hurt(v.piece);
      this.onImpact?.(res);
      await this.hitStop(victims, 90);
      await animate(st, { r: from.row, c: from.col, z: [0, arc * 0.3, 0], duration: dur * 0.7, ease: 'outQuad', onUpdate: () => this.apply(piece) });
      this.squash(piece);
      for (const v of victims) if (v.killed) await this.kill(v.piece, from, to);
      return;
    }

    await animate(st, {
      r: to.row, c: to.col, z: [0, arc, 0], duration: dur,
      ease: 'inOutSine', onUpdate: () => this.apply(piece),
    });
    const c = this.centerOf(piece);
    this.squash(piece, piece.boss ? 0.6 : 0.78);
    this.fx.dust(c.x, c.y, piece.boss ? 2 : 0.8);
    if (piece.boss) { this.shake(14, 450); this.fx.ring(c.x, c.y, { radius: this.sq * 2.4, width: 5 }); }
    this.onImpact?.(res);
    if (victims.length) await this.hitStop(victims, victims.some((v) => v.piece.royal) || victims.length > 1 ? 160 : 70);
    await Promise.all(victims.map((v) => this.kill(v.piece, from, to)));
    if (promoted) await this.promote(piece);
  }

  // Freeze-frame on impact so a capture lands with weight; big hits also punch the camera in.
  async hitStop(victims, ms) {
    const els = victims.map((v) => this.els.get(v.piece)).filter(Boolean);
    els.forEach((el) => el.classList.add('hit'));
    if (ms > 100 && this.shakeOn && !reduced()) animate(this.stage, { scale: [1, 1.05, 1], duration: this.d(ms + 260), ease: 'outExpo' });
    await wait(this.d(ms));
    els.forEach((el) => el.classList.remove('hit'));
  }

  hurt(p) {
    const el = this.els.get(p);
    if (!el) return;
    const c = this.centerOf(p);
    this.shake(10, 300);
    this.fx.burst(c.x, c.y - this.sq * 0.5, { count: 26, color: ['#fff', css('--side-dark')], speed: [90, 320], size: [2, 5] });
    el.classList.add('hit');
    setTimeout(() => el.classList.remove('hit'), this.d(260));
    const hp = el.querySelector('.pc-hp');
    if (hp) hp.outerHTML = this.hpHTML(p);
    this.floatText(c.x, c.y - this.sq * 1.2, '−1');
  }

  floatText(x, y, text) {
    const n = document.createElement('div');
    n.className = 'float-text';
    n.textContent = text;
    n.style.left = x + 'px'; n.style.top = y + 'px';
    this.host.appendChild(n);
    animate(n, { y: [0, -50], opacity: [1, 0], scale: [1.4, 1], duration: this.d(900), ease: 'outCubic', onComplete: () => n.remove() });
  }

  async kill(p, from, to) {
    const el = this.els.get(p), st = this.state.get(p);
    if (!el) return;
    const c = this.centerOf(p);
    const royal = p.royal;
    this.fx.burst(c.x, c.y - this.sq * 0.4, { count: royal ? 70 : 24, color: [css('--side-' + p.color), '#fff', '#ffcf6b'], speed: [80, royal ? 480 : 300], size: [2, royal ? 7 : 5], gravity: 300, shape: 'chunk' });
    if (royal) { this.shake(26, 800); this.fx.ring(c.x, c.y, { radius: this.sq * 4, width: 8, life: 0.8 }); }
    const dir = Math.sign(to.col - from.col) || (Math.random() < 0.5 ? -1 : 1);
    const stand = el.querySelector('.pc-fig');
    animate(stand, { rotate: dir * 95, x: dir * this.sq * 0.4, duration: this.d(380), ease: 'inQuad' });
    await animate(st, {
      c: st.c + dir * 0.6, z: [0, this.sq * 0.8, -this.sq * 0.2], duration: this.d(420), ease: 'outQuad',
      onUpdate: () => this.apply(p),
    });
    await animate(el, { opacity: 0, duration: this.d(180) });
    el.remove();
    this.els.delete(p); this.state.delete(p);
  }

  async promote(p) {
    const el = this.els.get(p), stand = el.querySelector('.pc-fig');
    const c = this.centerOf(p);
    await animate(stand, { rotateY: 360, duration: this.d(380), ease: 'inQuad' });
    this.setArt(p);
    this.fx.burst(c.x, c.y - this.sq * 0.5, { count: 40, color: ['#ffcf6b', '#fff', css('--side-' + p.color)], speed: [80, 300], gravity: 120 });
    await animate(stand, { rotateY: 720, scale: [1.3, 1], duration: this.d(420), ease: 'outExpo' });
    stand.style.transform = 'none';
  }

  async collapse(cells) {
    const tiles = cells.map(([r, c]) => this.tiles.get(key(r, c))).filter(Boolean);
    tiles.forEach((t) => t.classList.add('cracking'));
    await wait(this.d(420));
    this.shake(12, 500);
    for (const t of tiles) {
      const c = this.fx.pointOf(t);
      this.fx.burst(c.x, c.y, { count: 22, color: [css('--tile-side'), css('--tile-b'), '#000'], speed: [40, 180], gravity: 500, shape: 'chunk', size: [3, 8], life: [0.6, 1.1] });
    }
    await animate(tiles, {
      z: -this.sq * 6, rotateX: () => (Math.random() - 0.5) * 70, rotateY: () => (Math.random() - 0.5) * 50,
      opacity: [1, 0], duration: this.d(900), ease: 'inQuad', delay: stagger(this.d(90)),
    });
    for (const t of tiles) { this.tiles.delete(key(+t.dataset.r, +t.dataset.c)); t.remove(); }
    this.refreshEdges();
  }

  async victory(winnerColor) {
    const losers = [...this.els.keys()].filter((p) => p.color !== winnerColor);
    this.fx.confetti([css('--side-light'), css('--accent'), '#ffcf6b', css('--side-wild')]);
    losers.forEach((p, i) => {
      const st = this.state.get(p), el = this.els.get(p);
      animate(st, { z: this.sq * 5, duration: this.d(900), delay: this.d(i * 40), ease: 'inExpo', onUpdate: () => this.apply(p) });
      animate(el, { opacity: 0, duration: this.d(500), delay: this.d(i * 40 + 400) });
    });
    await wait(this.d(Math.min(1600, losers.length * 40 + 1000)));
  }

  async defeat(loserColor) {
    const mine = [...this.els.keys()].filter((p) => p.color === loserColor);
    this.shake(18, 700);
    mine.forEach((p, i) => {
      const stand = this.els.get(p).querySelector('.pc-fig');
      animate(stand, { rotate: (i % 2 ? 1 : -1) * 90, duration: this.d(500), delay: this.d(i * 35), ease: 'inQuad' });
    });
    this.host.classList.add('lost');
    await wait(this.d(mine.length * 35 + 700));
  }
}
