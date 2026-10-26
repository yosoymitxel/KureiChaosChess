// 3D tabletop renderer built from DOM + CSS transforms.
// The board is a tilted plane (rotateX); tiles live on it, pieces are cardboard
// "standees" counter-rotated to face the camera. anime.js drives all choreography.
import { animate, stagger } from 'animejs';
import { pieceSVG, headTop, artOf } from './piece-art.js';
import { Fx } from './fx.js';
import { liquid } from './liquid.js';
import { playSfx } from '../ui/sfx.js';
import { key, cellsOf, sizeOf, portalAt } from '../game/rules.js';

export const CAMERAS = { flat: 0, tilt: 40, epic: 56 };
const JUMPERS = new Set(['knight', 'camel', 'elephant']);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function collapseTiles(tiles, { depth, duration, delay }) {
  if (!tiles.length) return Promise.resolve();
  return animate(tiles, {
    z: -depth,
    rotateX: () => (Math.random() - 0.5) * 70,
    rotateY: () => (Math.random() - 0.5) * 50,
    opacity: [1, 0],
    duration,
    ease: 'inQuad',
    delay: stagger(delay),
  });
}
const BADGES = {
  lock: '<svg viewBox="0 0 24 24"><path d="M7 10V7.5a5 5 0 0 1 10 0V10h-2.6V7.5a2.4 2.4 0 0 0-4.8 0V10z"/><rect x="4.5" y="10" width="15" height="11.5" rx="2.5"/></svg>',
  last: '<svg viewBox="0 0 24 24"><path d="M5 2.5h2.6v19H5z"/><path d="M7.6 3.5h11.9l-2.6 4 2.6 4H7.6z"/></svg>',
  lent: '<svg viewBox="0 0 24 24"><path d="M12 1.8l2.6 7 7.4.4-5.7 4.7 1.9 7.2L12 17l-6.2 4.1 1.9-7.2L2 9.2l7.4-.4z"/></svg>',
  mut: '<svg viewBox="0 0 24 24"><path d="M9 2.5h6v2h-1v4.6l5.7 9.4c1 1.7-.2 3.5-2 3.5H6.3c-1.8 0-3-1.8-2-3.5L10 9.1V4.5H9z"/></svg>',
};

export class BoardView {
  // `framed`: el marco de losa de los minijuegos alrededor del mismo tablero.
  constructor(host, { camera = 'tilt', shake = true, speed = 1, framed = false, onTap, onDrop, canDrag, onImpact, onHover, onZoom } = {}) {
    Object.assign(this, { host, onTap, onDrop, canDrag, onImpact, onHover, onZoom, shakeOn: shake, speed });
    this.tilt = CAMERAS[camera] ?? 40;
    this.zoom = 1; this.pan = { x: 0, y: 0 };
    host.classList.add('table');
    host.innerHTML = `<div class="stage"><div class="board${framed ? ' framed' : ''}"><div class="tiles"></div><svg class="goo" preserveAspectRatio="none" aria-hidden="true"></svg><div class="pieces"></div></div></div>`;
    this.stage = host.querySelector('.stage');
    this.boardEl = host.querySelector('.board');
    this.tilesEl = host.querySelector('.tiles');
    this.gooEl = host.querySelector('.goo');
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
    this.onHover?.({ ...cell });
  }

  destroy() { this.ro.disconnect(); this.fx.destroy(); this.unbind?.(); this.host.innerHTML = ''; }
  d(ms) { return reduced() ? Math.min(ms, 120) : ms / this.speed; }

  setCamera(camera) { this.tilt = CAMERAS[camera] ?? 40; this.layout(); }

  // Pellizco: --zoom escala la escena y --px/--py la desplazan. `at` es el punto de la pantalla que
  // se queda quieto (el centro del pellizco); el desplazamiento nunca deja ver más allá del tablero.
  setZoom(z, at) {
    const z0 = this.zoom, z1 = Math.max(1, Math.min(3, z));
    const r = this.host.getBoundingClientRect(), c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const p = this.pan || { x: 0, y: 0 };
    const m = at || c;
    this.zoom = z1;
    this.setPan({ x: m.x - c.x - (z1 * (m.x - c.x - p.x)) / z0, y: m.y - c.y - (z1 * (m.y - c.y - p.y)) / z0 });
    this.host.style.setProperty('--zoom', z1.toFixed(3));
    this.onZoom?.(z1);
  }
  // El tablero no se va de la vista: su centro solo puede alejarse del centro lo que sobresale ampliado.
  setPan({ x, y }) {
    const r = this.host.getBoundingClientRect(), b = this.boardEl.getBoundingClientRect();
    const a = this.applied || { z: 1, x: 0, y: 0 }, z = this.zoom;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const ox = ((b.left + b.right) / 2 - cx - a.x) / a.z, oy = ((b.top + b.bottom) / 2 - cy - a.y) / a.z;
    const lx = Math.max(0, (z * (b.width / a.z) - r.width) / 2) + 24, ly = Math.max(0, (z * (b.height / a.z) - r.height) / 2) + 24;
    const clamp = (v, o, l) => (z <= 1.001 ? 0 : Math.max(-z * o - l, Math.min(-z * o + l, v)));
    this.pan = { x: clamp(x, ox, lx), y: clamp(y, oy, ly) };
    this.applied = { z, ...this.pan };
    this.host.style.setProperty('--px', this.pan.x.toFixed(1) + 'px');
    this.host.style.setProperty('--py', this.pan.y.toFixed(1) + 'px');
  }

  resetZoom() { this.zoom = 1; this.setPan({ x: 0, y: 0 }); this.host.style.setProperty('--zoom', 1); this.onZoom?.(1); }

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
    this.tilesEl.parentElement.classList.toggle('covered', !!board.mines);
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
      const terrain = board.terrain?.get(key(r, c));
      if (terrain) t.classList.add(terrain);
      // Portal pairs share a colour so the player can tell which tile leads where.
      if (terrain === 'portal') t.classList.add(portalAt(board, r, c)?.pair || '');
      t.innerHTML = '<i class="mark"></i>';
      frag.appendChild(t);
      this.tiles.set(key(r, c), t);
    }
    this.tilesEl.appendChild(frag);
    this.gooEl.setAttribute('viewBox', `0 0 ${cols} ${rows}`); // one unit = one tile
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
    el.className = `pc side-${p.color}${p.boss ? ' boss' : ''}${p.zombie ? ' zombie' : ''}${p.disc ? ' disc' : ''}${p.crown ? ' crown' : ''}`;
    el.dataset.pid = p.id;
    el.style.setProperty('--h', h); el.style.setProperty('--w', w);
    el.style.setProperty('--s', h * w > 1 ? Math.max(h, w) * 0.85 : 1); // multi-cell figures read bigger than one tile
    el.style.setProperty('--head', headTop(artOf(p)).toFixed(3));
    el.style.setProperty('--bd', `-${(Math.random() * 3.4).toFixed(2)}s`); // cada pieza respira a su ritmo
    el.innerHTML = `<div class="pc-shadow"></div><div class="pc-base"><i></i><i></i><i></i></div>
      <div class="pc-stand"><div class="pc-fig"><div class="pc-art">${pieceSVG(artOf(p))}</div>${p.boss || p.maxHp > 1 ? this.hpHTML(p) : ''}<span class="pc-badge"></span></div></div>`;
    this.piecesEl.appendChild(el);
    this.els.set(p, el);
    const st = { r: p.row, c: p.col, z: 0 };
    this.state.set(p, st);
    this.apply(p);
    return el;
  }

  hpHTML(p) {
    return `<div class="pc-hp">${p.name ? `<span>${p.name}</span>` : ''}${Array.from({ length: p.maxHp }, (_, i) => `<b class="${i < p.hp ? 'on' : ''}"></b>`).join('')}</div>`;
  }

  // Rebuild a piece's element after a card changed its size, type or HP.
  remake(p) {
    const st = this.state.get(p);
    this.els.get(p)?.remove();
    this.addPiece(p);
    if (st) Object.assign(this.state.get(p), { z: st.z });
    return this.els.get(p);
  }

  // Protected pieces wear a badge (lock = escorted, flag = falls last, star = borrowed moves, flask = mutation);
  // escorts are tied to their ward with a rope, so the rule is readable without the rules.
  setGuards(pieces, isImmune) {
    this.piecesEl.querySelectorAll('.tether').forEach((t) => t.remove());
    for (const [p, el] of this.els) {
      const on = isImmune(p);
      const mut = !on && !!p.extraMoveTypes?.length;
      // Flask = the player's run mutation; star = moves lent by a card or a boss.
      const kind = on ? (p.trait === 'last' ? 'last' : 'lock') : mut ? (p.mutationExtras?.length ? 'mut' : 'lent') : '';
      el.classList.toggle('guarded', on);
      el.classList.toggle('mutated', mut);
      const badge = el.querySelector('.pc-badge');
      if (badge && badge.dataset.kind !== kind) { badge.dataset.kind = kind; badge.innerHTML = kind ? BADGES[kind] : ''; }
      const escort = on && p.escort && pieces.find((o) => o.id === p.escort);
      if (escort) this.tether(escort, p);
    }
  }

  tether(a, b) {
    const ca = { x: a.col + (a.w || 1) / 2, y: a.row + (a.h || 1) / 2 }, cb = { x: b.col + 0.5, y: b.row + 0.5 };
    const len = Math.hypot(cb.x - ca.x, cb.y - ca.y);
    const t = document.createElement('i');
    t.className = 'tether';
    t.style.setProperty('--x', ca.x); t.style.setProperty('--y', ca.y);
    t.style.setProperty('--len', len); t.style.setProperty('--ang', Math.atan2(cb.y - ca.y, cb.x - ca.x) + 'rad');
    this.piecesEl.prepend(t);
  }

  apply(p) {
    const el = this.els.get(p), st = this.state.get(p);
    if (!el) return;
    el.style.setProperty('--r', st.r);
    el.style.setProperty('--c', st.c);
    const z = st.z.toFixed(2);
    el.style.setProperty('--z', z);
    // La sombra se achica con la altura; --z no se hereda (board.css), así que va aparte.
    (el.shadowEl ||= el.querySelector('.pc-shadow'))?.style.setProperty('--z', z);
  }

  // Rótulos sobre casillas (las pistas de Campo minado): key -> texto.
  setLabels(labels = new Map()) {
    for (const [k, t] of this.tiles) {
      const text = labels.get(k), mark = t.querySelector('.mark');
      if (text == null) { delete t.dataset.n; mark.textContent = ''; }
      else if (t.dataset.n !== String(text)) { t.dataset.n = text; mark.textContent = text === 0 ? '·' : text; }
    }
  }

  setArt(p) {
    const art = this.els.get(p)?.querySelector('.pc-art');
    if (art) art.innerHTML = pieceSVG(artOf(p));
  }
  // Cambio de mesa a mitad de partida (pausa): las piezas pasan al arte de la nueva mesa.
  restyle() {
    for (const p of this.els.keys()) this.setArt(p);
  }


  clearMarks() {
    for (const t of this.tiles.values()) t.classList.remove('mv', 'cap', 'danger', 'target', 'gain', 'foot', 'hot');
    for (const el of this.els.values()) el.classList.remove('eligible');
    this.host.classList.remove('aiming');
  }
  // Card targeting: outline valid tiles, ring the pieces the card can be played on and fade the rest.
  showTargets(cells, pieces = []) {
    this.clearMarks();
    for (const k of cells) this.tiles.get(k)?.classList.add('target');
    for (const p of pieces) this.els.get(p)?.classList.add('eligible');
    this.host.classList.add('aiming');
  }
  // Organizar: anillo discontinuo en las piezas con las que se puede intercambiar casilla.
  showSwaps(piece, pieces) {
    this.clearMarks();
    for (const p of pieces) {
      this.tiles.get(key(p.row, p.col))?.classList.add('target');
      this.els.get(p)?.classList.add('eligible');
    }
    this.select(piece);
  }
  // Preview of a card on one target: moves it keeps stay as normal dots, moves it gains are
  // drawn in their own colour, and the tiles the piece (or the tile card) will take are tinted.
  showPreview(targets, pieces, { cells = [], before = new Set(), footprint = [] }) {
    this.showTargets(targets, pieces);
    for (const k of cells) this.tiles.get(k)?.classList.add(before.has(k) ? 'mv' : 'gain');
    for (const k of footprint) this.tiles.get(k)?.classList.add('foot');
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
    if (piece && piece !== this.selected) playSfx('select');
    this.selected = piece;
    for (const [p, el] of this.els) el.classList.toggle('sel', p === piece);
  }
  setThreats(set) {
    for (const [p, el] of this.els) el.classList.toggle('threat', set.has(p));
  }
  pulseThreats() {
    for (const el of this.els.values()) {
      if (!el.classList.contains('threat')) continue;
      el.classList.remove('pulse');
      void el.offsetWidth;
      el.classList.add('pulse');
    }
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
      el.classList.toggle('fogged', !!t && +t.style.getPropertyValue('--fog') > 0.3);
    }
  }
  // An enemy deep in the fog reads as "something is there", never as which piece it is.
  fogged(p) { return !!this.els.get(p)?.classList.contains('fogged'); }


  cellFromEl(el) {
    const pe = el?.closest?.('[data-pid]');
    if (pe) {
      const p = [...this.els].find(([, e]) => e === pe)?.[0];
      return p ? { row: p.row, col: p.col, piece: p } : null;
    }
    const t = el?.closest?.('.tile');
    return t ? { row: +t.dataset.r, col: +t.dataset.c } : null;
  }

  // On a tilted board a standing figure covers the tile in front of it, so a tap on a figure
  // over a marked tile (move, capture or card target) means that tile. A multi-cell figure (boss)
  // is the exception: it is one target, and the game resolves which move hits it.
  hitAt(x, y) {
    const stack = document.elementsFromPoint(x, y).filter((el) => this.host.contains(el));
    const first = this.cellFromEl(stack[0]);
    if (first?.piece && sizeOf(first.piece).some((n) => n > 1)) return first;
    const tile = stack.find((el) => el.classList.contains('tile'));
    if (tile?.matches('.mv, .cap, .target')) return { row: +tile.dataset.r, col: +tile.dataset.c };
    return first;
  }

  bindPointer() {
    let drag = null, over = '';
    const touches = new Map(), pinch = { d: 0, zoom: 1, mid: null };
    let pinching = false, pending = null; // pending: toque en casilla con zoom, que espera a saber si es desplazamiento
    const spread = () => { const [a, b] = [...touches.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    const mid = () => { const [a, b] = [...touches.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    const down = (e) => {
      if (e.button > 0) return;
      if (e.pointerType !== 'mouse') {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (touches.size === 2) {
          // El segundo dedo arranca el pellizco: se descarta el arrastre y no hay toque.
          Object.assign(pinch, { d: spread(), zoom: this.zoom, mid: mid() });
          pinching = true; pending = null;
          if (drag) { drag.ghost?.remove(); this.els.get(drag.piece)?.classList.remove('dragging'); drag = null; }
          return;
        }
        if (pinching) return;
      }
      const hit = this.hitAt(e.clientX, e.clientY);
      const zoomed = e.pointerType !== 'mouse' && this.zoom > 1.01;
      if (!hit) { if (zoomed) pending = { hit: null, id: e.pointerId, x: e.clientX, y: e.clientY, pan: { ...this.pan }, moved: false }; return; }
      hit.touch = e.pointerType !== 'mouse';
      if (hit.piece && this.canDrag?.(hit.piece)) drag = { piece: hit.piece, x: e.clientX, y: e.clientY, id: e.pointerId, ghost: null };
      else if (zoomed) { pending = { hit, id: e.pointerId, x: e.clientX, y: e.clientY, pan: { ...this.pan }, moved: false }; return; }
      this.onTap?.(hit);
    };
    const move = (e) => {
      if (pinching && e.pointerType !== 'mouse' && touches.has(e.pointerId)) {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (touches.size >= 2) {
          // Ampliar desde el centro del pellizco y arrastrar con los dos dedos a la vez.
          const m = mid();
          this.setZoom(pinch.zoom * (spread() / (pinch.d || 1)), m);
          this.setPan({ x: this.pan.x + m.x - pinch.mid.x, y: this.pan.y + m.y - pinch.mid.y });
          pinch.mid = m; pinch.zoom = this.zoom; pinch.d = spread();
          return;
        }
      }
      if (pending && e.pointerId === pending.id) {
        const dx = e.clientX - pending.x, dy = e.clientY - pending.y;
        if (pending.moved || Math.hypot(dx, dy) > 10) { pending.moved = true; this.setPan({ x: pending.pan.x + dx, y: pending.pan.y + dy }); }
        return;
      }
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        const src = this.els.get(drag.piece);
        drag.ghost = document.createElement('div');
        drag.ghost.className = `drag-ghost side-${drag.piece.color}`;
        drag.ghost.style.setProperty('--sq', this.sq + 'px');
        drag.ghost.innerHTML = pieceSVG(artOf(drag.piece));
        document.body.appendChild(drag.ghost);
        src.classList.add('dragging');
      }
      if (drag.ghost) drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const up = (e) => {
      if (e.pointerType !== 'mouse') {
        touches.delete(e.pointerId);
        if (touches.size < 2) pinching = false;
      }
      if (pending && e.pointerId === pending.id) {
        const p = pending; pending = null;
        if (p.hit && !p.moved && e.type === 'pointerup') this.onTap?.(p.hit);
        return;
      }
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.ghost) return;
      d.ghost.remove();
      this.els.get(d.piece)?.classList.remove('dragging');
      this.onDrop?.(d.piece, this.hitAt(e.clientX, e.clientY));
    };
    this.host.addEventListener('pointerdown', down);
    this.host.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return; // touch previews come from taps (see the game screen)
      const hit = this.hitAt(e.clientX, e.clientY);
      const k = hit ? key(hit.row, hit.col) : '';
      if (k !== over) { over = k; this.onHover?.(hit); }
    });
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
    this.host.classList.add('dealing');
    try { await this.deal(pieces); } finally { this.host.classList.remove('dealing'); }
  }
  async deal(pieces) {
    const tiles = [...this.tiles.values()];
    const { rows, cols } = this.board;
    tiles.forEach((t) => {
      const d = Math.hypot(+t.dataset.r - (rows - 1) / 2, +t.dataset.c - (cols - 1) / 2);
      t.style.setProperty('--d', d);
    });
    // Las piezas se ocultan ya: si no, se ven quietas mientras sube el tablero y luego "vuelven" a caer.
    for (const p of pieces) this.els.get(p).style.opacity = 0;
    animate(tiles, {
      opacity: [0, 1], z: [-120, 0], duration: this.d(520), ease: 'outExpo',
      delay: (el) => this.d(+el.style.getPropertyValue('--d') * 45),
      // outExpo no acaba exacto: una losa a -0.1 px queda hundida y con opacidad 0.999 aplana el 3D
      // (toda opacidad < 1 lo hace), así que su canto desaparece. Al terminar se limpian las dos.
      onComplete: () => tiles.forEach((t) => { t.style.removeProperty('transform'); t.style.removeProperty('opacity'); }),
    });
    await wait(this.d(260));
    // El jefe no baja con el resto: espera fuera de cuadro y cae una sola vez, con su impacto.
    const boss = pieces.find((p) => p.boss);
    const order = pieces.filter((p) => p !== boss).sort((a, b) => (a.color === 'light' ? b.row - a.row : a.row - b.row));
    // Dónde cae el polvo, medido todo de una vez: medir en cada aterrizaje obligaba al navegador
    // a recalcular la página a mitad de la animación (el reparto se trababa en teléfonos).
    const dustAt = new Map(order.filter((p, i) => i % 3 === 0).map((p) => [p, this.centerOf(p)]));
    order.forEach((p, i) => {
      const st = this.state.get(p), el = this.els.get(p);
      st.z = this.sq * 4; this.apply(p); el.style.opacity = 0;
      animate(el, { opacity: [0, 1], duration: this.d(120), delay: this.d(i * 22) });
      animate(st, {
        z: 0, duration: this.d(420), delay: this.d(i * 22), ease: 'inQuad',
        onUpdate: () => this.apply(p),
        onComplete: () => { this.squash(p, 0.7); playSfx('step'); const c = dustAt.get(p); if (c) this.fx.dust(c.x, c.y, 0.6); },
      });
    });
    await wait(this.d(order.length * 22 + 480));
    if (boss) await this.bossEntrance(boss);
  }

  async bossEntrance(boss) {
    const st = this.state.get(boss);
    st.z = this.sq * 6; this.apply(boss);
    this.els.get(boss).style.opacity = 1;
    await animate(st, { z: 0, duration: this.d(520), ease: 'inCubic', onUpdate: () => this.apply(boss) });
    const c = this.centerOf(boss);
    playSfx('stomp');
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

  // Organizar: dos piezas propias cambian de casilla con un arco corto y aterrizan con aplomo.
  async swapPieces(a, b) {
    const sa = this.state.get(a), sb = this.state.get(b);
    const [ra, ca, rb, cb] = [a.row, a.col, b.row, b.col];
    a.row = rb; a.col = cb;
    b.row = ra; b.col = ca;
    const dur = this.d(400);
    await Promise.all([
      animate(sa, { r: rb, c: cb, z: [0, this.sq * 0.8, 0], duration: dur, ease: 'inOutSine', onUpdate: () => this.apply(a) }),
      animate(sb, { r: ra, c: ca, z: [0, this.sq * 0.8, 0], duration: dur, ease: 'inOutSine', onUpdate: () => this.apply(b) }),
    ]);
    playSfx('land');
    this.squash(a);
    this.squash(b);
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
      playSfx('hit');
      this.onImpact?.(res);
      await this.hitStop(victims, 90);
      await animate(st, { r: from.row, c: from.col, z: [0, arc * 0.3, 0], duration: dur * 0.7, ease: 'outQuad', onUpdate: () => this.apply(piece) });
      this.squash(piece);
      for (const v of victims) if (v.killed) await this.kill(v.piece, from, to);
      return;
    }

    // Anticipación: la figura se agacha un instante antes de despegar y se estira al salir.
    const fig = this.els.get(piece)?.querySelector('.pc-fig');
    if (fig && !reduced()) {
      await animate(fig, { scaleY: 0.86, scaleX: 1.08, duration: this.d(80), ease: 'outQuad' });
      animate(fig, { scaleY: [0.86, 1.06, 1], scaleX: [1.08, 0.96, 1], duration: this.d(260), ease: 'outQuad' });
    }
    if (!reduced()) this.liquid(piece, from, to, dur);
    await animate(st, {
      r: to.row, c: to.col, z: [0, arc, 0], duration: dur,
      ease: 'inOutSine', onUpdate: () => this.apply(piece),
    });
    const c = this.centerOf(piece);
    // El sonido va al aterrizar, no al decidir la jugada: así se oye cuando se ve el golpe.
    playSfx(piece.boss ? 'stomp' : victims.length ? 'capture' : 'move');
    this.squash(piece, piece.boss ? 0.6 : 0.78);
    this.fx.dust(c.x, c.y, piece.boss ? 2 : 0.8);
    if (piece.boss) { this.shake(14, 450); this.fx.ring(c.x, c.y, { radius: this.sq * 2.4, width: 5 }); }
    this.onImpact?.(res);
    if (victims.length) await this.hitStop(victims, victims.some((v) => v.piece.royal) || victims.length > 1 ? 160 : 70);
    await Promise.all(victims.map((v) => this.kill(v.piece, from, to)));
    if (res.zombie) await this.rise(res.zombie);
    if (res.slide) await this.slide(piece, res.slide);
    if (res.portal) await this.warp(piece, res.portal);
    if (res.unmasked) {
      this.fx.burst(c.x, c.y - this.sq * 0.4, { count: 18, color: [css('--side-' + piece.color), '#fff'], speed: [60, 200], life: [0.3, 0.7] });
      playSfx('pop');
      this.setArt(piece);
      this.squash(piece, 0.7);
    }
    if (res.sunk) this.collapse([res.sunk]);
    if (res.mine) {
      this.fx.explosion(c.x, c.y, this.sq / 50);
      this.shake(18, 520);
      await Promise.all([this.kill(piece, from, to), this.collapse([[res.mine.row, res.mine.col]])]);
    }
    // Enroque: la torre salta por encima del rey a su lado, en arco corto.
    if (res.castle) {
      const st2 = this.state.get(res.castle.rook);
      await animate(st2, { r: res.castle.to.row, c: res.castle.to.col, z: [0, this.sq * 0.9, 0], duration: this.d(380), ease: 'inOutSine', onUpdate: () => this.apply(res.castle.rook) });
      playSfx('move');
      this.squash(res.castle.rook, 0.8);
    }
    if (promoted) await this.promote(piece);
  }

  // Liquid base: the token melts away where it stands (flattens, splashes two drops) and
  // wells up again where the piece lands. Nothing crosses the board, so an L or a 2×2 boss
  // never drags a puddle round corners. Runs alongside the flight; the base is back on landing.
  liquid(p, from, to, dur) {
    const el = this.els.get(p), base = el?.querySelector('.pc-base');
    if (!base) return;
    const [h, w] = sizeOf(p);
    const k = el.classList.contains('boss') ? 0.36 : 0.27; // matches the .pc-base inset
    const rx = k * w, ry = k * h;
    base.style.opacity = 0;
    liquid(this.gooEl, {
      side: p.color, rx, ry, px: 1 / this.sq, area: [this.board.cols, this.board.rows], dur,
      from: [from.col + w / 2, from.row + h / 2], to: [to.col + w / 2, to.row + h / 2],
    }).then(() => {
      base.style.opacity = '';
      animate(base, { scaleX: [1.16, 0.95, 1], scaleY: [0.86, 1.04, 1], duration: this.d(320), ease: 'outQuad' });
    });
  }

  // Ice: the piece keeps going one tile, skating low with frost spraying behind it.
  async slide(p, to) {
    const st = this.state.get(p);
    const c0 = this.centerOf(p, Math.round(st.r), Math.round(st.c));
    this.fx.burst(c0.x, c0.y, { count: 16, color: ['#e8f4ff', '#bfdcf2', '#fff'], speed: [40, 160], size: [2, 4], life: [0.3, 0.6] });
    playSfx('whoosh');
    await animate(st, { r: to.row, c: to.col, duration: this.d(260), ease: 'outQuad', onUpdate: () => this.apply(p) });
    this.squash(p, 0.85);
  }

  // Portal: sucked into one ring, popped out of its twin.
  async warp(p, { from, to }) {
    const fig = this.els.get(p)?.querySelector('.pc-fig'), st = this.state.get(p);
    const a = this.centerOf(p, from.row, from.col);
    this.fx.ring(a.x, a.y, { radius: this.sq * 0.9, color: css('--brass'), width: 4 });
    playSfx('warp');
    await animate(fig, { scale: [1, 0], rotate: [0, 180], duration: this.d(260), ease: 'inQuad' });
    Object.assign(st, { r: to.row, c: to.col }); this.apply(p);
    const b = this.centerOf(p, to.row, to.col);
    this.fx.ring(b.x, b.y, { radius: this.sq * 0.9, color: css('--brass'), width: 4 });
    this.fx.burst(b.x, b.y, { count: 20, color: [css('--brass'), '#fff'], speed: [60, 200] });
    await animate(fig, { scale: [0, 1], rotate: [180, 360], duration: this.d(320), ease: 'outExpo' });
  }

  // A newly placed piece falls onto the board from above.
  async dropIn(p) {
    this.addPiece(p);
    const st = this.state.get(p), el = this.els.get(p);
    st.z = this.sq * 4; this.apply(p); el.style.opacity = 0;
    animate(el, { opacity: [0, 1], duration: this.d(120) });
    await animate(st, { z: 0, duration: this.d(420), ease: 'inQuad', onUpdate: () => this.apply(p) });
    playSfx('land');
    const c = this.centerOf(p); this.fx.dust(c.x, c.y, 0.9); this.squash(p, 0.7);
  }

  // Visual side of a played card (game/cards.js result).
  async applyCard(res) {
    const id = res.card.id, p = res.piece;
    if (p) {
      const c = this.centerOf(p);
      this.fx.ring(c.x, c.y, { radius: this.sq * 1.2, color: css('--accent'), width: 5 });
    }
    if (id === 'colossus') {
      const el = this.remake(p), fig = el.querySelector('.pc-fig'), c = this.centerOf(p);
      this.shake(12, 450);
      this.fx.dust(c.x, c.y, 1.8);
      this.fx.ring(c.x, c.y, { radius: this.sq * 2.2, color: css('--side-' + p.color), width: 6, life: 0.5 });
      await animate(fig, { scaleY: [0.3, 1.12, 1], scaleX: [1.3, 0.94, 1], duration: this.d(560), ease: 'outExpo' });
    } else if (id === 'ascend') {
      await this.promote(p);
    } else if (id === 'mount' || id === 'fortify') {
      if (id === 'fortify') this.remake(p);
      const c = this.centerOf(p);
      this.fx.sparkle(c.x, c.y - this.sq * 0.6, css('--brass'), 12);
      this.floatText(c.x, c.y - this.sq * 1.1, id === 'mount' ? '+ salto en L' : '+1 escudo');
      await animate(this.els.get(p).querySelector('.pc-fig'), { y: [0, -this.sq * 0.4, 0], duration: this.d(420), ease: 'outQuad' });
    } else if (id === 'quake') {
      await this.collapse([[res.cell.row, res.cell.col]]);
    } else if (id === 'reinforce') {
      await this.dropIn(res.spawned);
    }
  }

  // Leaving the board, each exit with its own gesture:
  //  exit   -> pieces lift off and the tiles drop away in a wave (back to the map)
  //  reset  -> pieces are swept into the centre, ready to be dealt again
  //  resign -> the loser's pieces lie down and the table fades to grey
  async outro(kind, color = 'light') {
    const pieces = [...this.els.keys()];
    if (kind === 'reset') {
      pieces.forEach((p, i) => {
        const st = this.state.get(p);
        animate(st, { r: (this.board.rows - 1) / 2, c: (this.board.cols - 1) / 2, z: [0, this.sq, 0], duration: this.d(480), delay: this.d(i * 10), ease: 'inOutQuad', onUpdate: () => this.apply(p) });
        animate(this.els.get(p), { opacity: [1, 0], duration: this.d(200), delay: this.d(i * 10 + 360) });
      });
      return wait(this.d(pieces.length * 10 + 620));
    }
    if (kind === 'resign') {
      pieces.filter((p) => p.color === color).forEach((p, i) => {
        animate(this.els.get(p).querySelector('.pc-fig'), { rotate: (i % 2 ? 1 : -1) * 88, duration: this.d(700), delay: this.d(i * 40), ease: 'inOutSine' });
      });
      this.host.classList.add('lost');
      return wait(this.d(pieces.length * 20 + 900));
    }
    pieces.forEach((p, i) => {
      const st = this.state.get(p);
      animate(st, { z: this.sq * 6, duration: this.d(520), delay: this.d(i * 14), ease: 'inExpo', onUpdate: () => this.apply(p) });
      animate(this.els.get(p), { opacity: [1, 0], duration: this.d(240), delay: this.d(i * 14 + 300) });
    });
    await wait(this.d(260));
    const tiles = [...this.tiles.values()].sort((a, b) => +b.dataset.r - +a.dataset.r);
    animate(tiles, { z: -this.sq * 4, opacity: [1, 0], duration: this.d(520), ease: 'inQuad', delay: stagger(this.d(6)) });
    return wait(this.d(tiles.length * 6 + 560));
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
    this.fx.burst(c.x, c.y - this.sq * 0.5, { count: 14, color: ['#fff', '#ffe2a8'], speed: [200, 420], size: [1.5, 3], life: [0.15, 0.3], shape: 'spark', drag: 0.85 });
    this.fx.debris(c.x, c.y - this.sq * 0.3, css('--side-' + p.color), 0.6);
    el.classList.add('hit');
    setTimeout(() => el.classList.remove('hit'), this.d(260));
    const hp = el.querySelector('.pc-hp');
    if (hp) hp.outerHTML = this.hpHTML(p);
    this.floatText(c.x, c.y - this.sq * 1.2, '−1');
  }

  // Etiqueta de casilla: aparece al momento junto a la casilla (sin pasar por la cola de rótulos)
  // y se va sola; `twin` ilumina otra casilla relacionada (el portal gemelo).
  tileTip(r, c, title, text, twin) {
    this.tip?.remove();
    clearTimeout(this.tipTimer);
    this.host.querySelectorAll('.tile.twin').forEach((t) => t.classList.remove('twin'));
    const t = this.tiles.get(key(r, c));
    if (!t) return;
    const p = this.fx.pointOf(t);
    const n = document.createElement('div');
    n.className = 'tile-tip' + (p.y < 120 ? ' below' : '');
    n.innerHTML = `<b></b><span></span>`;
    n.querySelector('b').textContent = title;
    n.querySelector('span').textContent = text;
    n.style.left = Math.max(110, Math.min(this.host.clientWidth - 110, p.x)) + 'px';
    n.style.top = p.y + 'px';
    this.host.appendChild(n);
    this.tip = n;
    if (twin) this.tiles.get(twin)?.classList.add('twin');
    this.tipTimer = setTimeout(() => this.hideTip(), 3200);
  }
  hideTip() {
    this.tip?.remove(); this.tip = null;
    this.host.querySelectorAll('.tile.twin').forEach((t) => t.classList.remove('twin'));
  }

  floatText(x, y, text) {
    const n = document.createElement('div');
    n.className = 'float-text';
    n.textContent = text;
    n.style.left = x + 'px'; n.style.top = y + 'px';
    this.host.appendChild(n);
    animate(n, { y: [0, -50], opacity: [1, 0], scale: [1.4, 1], duration: this.d(900), ease: 'outCubic', onComplete: () => n.remove() });
  }

  // Plaga zombi: el peón sale de la tierra en verde, sacudiéndose, con esporas alrededor.
  async rise(p) {
    const el = this.addPiece(p), st = this.state.get(p);
    const c = this.centerOf(p);
    st.z = -this.sq * 0.9; this.apply(p);
    el.style.opacity = 0;
    this.fx.burst(c.x, c.y, { count: 18, color: [css('--side-zombie'), 'oklch(0.82 0.12 128)'], speed: [40, 140], life: [0.5, 0.9], size: [3, 6], gravity: -90, drag: 0.9 });
    this.fx.dust(c.x, c.y, 1.2);
    playSfx('zombie');
    animate(el, { opacity: [0, 1], duration: this.d(160) });
    await animate(st, { z: 0, duration: this.d(420), ease: 'outBack', onUpdate: () => this.apply(p) });
    const fig = el.querySelector('.pc-fig');
    if (fig) await animate(fig, { rotate: [0, -8, 7, -4, 0], duration: this.d(360), ease: 'inOutSine' });
  }

  async kill(p, from, to) {
    const el = this.els.get(p), st = this.state.get(p);
    if (!el) return;
    const c = this.centerOf(p);
    const royal = p.royal;
    if (royal) { this.fx.bigBoom(c.x, c.y - this.sq * 0.4, { radius: this.sq * 4, color: css('--side-' + p.color) }); this.shake(26, 800); }
    else this.fx.debris(c.x, c.y - this.sq * 0.4, css('--side-' + p.color));
    const dir = Math.sign(to.col - from.col) || (Math.random() < 0.5 ? -1 : 1);
    const stand = el.querySelector('.pc-fig');
    // Destello blanco del golpe antes de salir despedida: el impacto se lee aunque dure poco.
    el.classList.add('hit');
    setTimeout(() => el.classList.remove('hit'), this.d(110));
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
    playSfx('promote');
    await animate(stand, { rotateY: 360, duration: this.d(380), ease: 'inQuad' });
    this.setArt(p);
    this.fx.sparkle(c.x, c.y - this.sq * 0.6, '#ffcf6b', 16);
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
    await collapseTiles(tiles, { depth: this.sq * 6, duration: this.d(900), delay: this.d(90) });
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
