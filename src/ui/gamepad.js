// Mando: se traduce a las teclas que el juego ya entiende. La cruceta y el stick izquierdo son las
// flechas (en un segundo mando, WASD: la otra torre del hockey a dos), A es Enter y B Escape. Al
// soltar llega su keyup, así lo que se mantiene pulsado (la torre del hockey) se para. Una flecha que
// nadie usa (fuera del tablero o en su borde) mueve el foco al botón más cercano en esa dirección; A
// pulsa el botón con foco, y B, si nada la usa, vuelve atrás con el botón «Volver» de la pantalla.
//
// El resto de botones (X, Y, gatillos, Select, Start) son acciones: pulsan el elemento visible que
// lleve `data-pad="x"` (un grupo con `data-pad="l1 r1"` pasa a su opción anterior o siguiente sin
// mover el foco), o lo que la pantalla declare con usePad(). Mientras se juega con mando, cada
// elemento asignado lleva encima su botón y abajo queda la leyenda de la pantalla.
import { useEffect } from './lib.js';
import { t } from '../i18n/index.js';

const BUTTONS = { 0: 'Enter', 1: 'Escape', 2: 'x', 3: 'y', 4: 'l1', 5: 'r1', 6: 'l2', 7: 'r2', 8: 'select', 9: 'start', 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight' };
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
const SECOND = { ArrowUp: 'w', ArrowDown: 's', ArrowLeft: 'a', ArrowRight: 'd' };
const ACTIONS = ['x', 'y', 'l1', 'r1', 'l2', 'r2', 'select', 'start'];
const FIRST = 320, REPEAT = 120; // ms hasta que una flecha mantenida se repite, y cada cuánto
const FOCUSABLE = 'button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])';
const CLICKABLE = 'button, [href], [role="button"], [role="tab"], [role="option"]';

// Lo que pone cada mando en sus botones; Nintendo cambia de sitio A/B y X/Y.
const GLYPHS = {
  xbox: { dpad: '✛', Enter: 'A', Escape: 'B', x: 'X', y: 'Y', l1: 'LB', r1: 'RB', l2: 'LT', r2: 'RT', select: 'View', start: 'Menu' },
  ps: { dpad: '✛', Enter: '✕', Escape: '○', x: '□', y: '△', l1: 'L1', r1: 'R1', l2: 'L2', r2: 'R2', select: 'Create', start: 'Options' },
  nin: { dpad: '✛', Enter: 'B', Escape: 'A', x: 'Y', y: 'X', l1: 'L', r1: 'R', l2: 'ZL', r2: 'ZR', select: '−', start: '+' },
};
let glyphs = GLYPHS.xbox;
const styleOf = (id) => (/054c|playstation|dualsense|dualshock/i.test(id) ? 'ps' : /057e|nintendo|pro controller|joy-con/i.test(id) ? 'nin' : 'xbox');

const visible = (el) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
};
// Con un diálogo abierto, el foco no sale de él.
const scope = () => [...document.querySelectorAll('[role="dialog"], .overlay')].pop() || document;

function focus(el) {
  el.focus({ focusVisible: true });
  el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
}

// El más cercano en la dirección pedida, dentro de un cono de 45°: así bajar por los botones del
// menú no salta a las piezas del diorama, que quedan a un lado (se llega a ellas con la derecha).
function moveFocus(key) {
  const [dx, dy] = DIRS[key];
  const all = [...scope().querySelectorAll(FOCUSABLE)].filter(visible);
  const cur = document.activeElement;
  if (!cur || cur === document.body || !all.includes(cur)) {
    // Sin foco: primero el tablero (si hay partida), si no el botón principal.
    const first = all.find((el) => el.matches('[role="application"]')) || all.find((el) => el.matches('.btn.primary')) || all[0];
    return first && focus(first);
  }
  const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  let best = null, bestScore = Infinity;
  for (const el of all) {
    if (el === cur || cur.contains(el)) continue;
    const b = el.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2;
    const along = (bx - ax) * dx + (by - ay) * dy;
    const across = Math.abs((bx - ax) * dy) + Math.abs((by - ay) * dx);
    if (along <= 1 || across > along) continue;
    const score = along + across * 2;
    if (score < bestScore) { best = el; bestScore = score; }
  }
  if (best) focus(best);
}

// Lo que declaran las pantallas montadas; la última manda.
const declared = [];
export function usePad(map) {
  useEffect(() => {
    declared.push(map);
    return () => declared.splice(declared.indexOf(map), 1);
  });
}
const entryOf = (act) => {
  for (let i = declared.length - 1; i >= 0; i--) {
    const e = declared[i][act];
    if (e && (!e.when || e.when())) return e;
  }
};
const assigned = (act) => [...scope().querySelectorAll('[data-pad]')].find((el) => el.dataset.pad.split(' ').includes(act) && visible(el));
const isGroup = (el) => el.dataset.pad.includes(' ');

function act(name) {
  const el = assigned(name);
  if (el && isGroup(el)) {
    const items = [...el.querySelectorAll(FOCUSABLE)].filter(visible);
    if (!items.length) return;
    const on = items.findIndex((b) => b.matches('[aria-pressed="true"], [aria-selected="true"], .on'));
    const step = el.dataset.pad.split(' ')[0] === name ? -1 : 1; // el primero (L) retrocede
    const from = on < 0 ? (step > 0 ? -1 : 0) : on;
    items[(from + step + items.length) % items.length].click();
  } else if (el) {
    if (el.matches(CLICKABLE)) el.click();
    else focus(el);
  } else {
    const e = entryOf(name);
    if (e?.run) e.run();
    else if (name === 'start') press('Escape');
  }
}

const targets = new Map(); // tecla pulsada → dónde se mandó su keydown, para mandar ahí el keyup
function release(key) {
  targets.get(key)?.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  targets.delete(key);
}
function press(key) {
  if (ACTIONS.includes(key)) return act(key);
  const target = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body;
  const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  targets.set(key, target);
  target.dispatchEvent(ev);
  if (ev.defaultPrevented || !(key in DIRS || key === 'Enter' || key === 'Escape')) return;
  if (DIRS[key]) moveFocus(key);
  else if (key === 'Enter' && target === document.body) moveFocus('ArrowDown'); // sin foco (pantalla nueva), A lo pone
  else if (key === 'Enter' && target !== document.body && target.matches(CLICKABLE)) target.click();
  else if (key === 'Escape' && !document.querySelector('.overlay')) document.querySelector('[data-back]')?.click();
}

// El stick derecho desplaza lo que tenga barra: el panel donde está el foco o, si no, la página.
function scroll(dy) {
  let el = document.activeElement;
  while (el && el !== document.body && !(el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
  if (!el || el === document.body) el = [...scope().querySelectorAll('.screen, .panel, .overlay')].find((s) => s.scrollHeight > s.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(s).overflowY)) || document.scrollingElement;
  el.scrollBy(0, dy * 18);
}

// Encima de la interfaz: el botón de cada elemento asignado y la leyenda de la pantalla.
let layer = null, lastSig = '', nextPaint = 0;
const labelOf = (el) => el.dataset.padLabel || el.getAttribute('aria-label') || el.title || el.textContent.trim().slice(0, 24);
function paint() {
  const root = document.documentElement;
  if (root.dataset.input !== 'pad') return layer?.replaceChildren();
  if (!layer) { layer = document.createElement('div'); layer.className = 'pad-layer'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
  const seen = new Set(), badges = [], legend = [];
  for (const el of scope().querySelectorAll('[data-pad]')) {
    const acts = el.dataset.pad.split(' ').filter((a) => !seen.has(a));
    if (!acts.length || !visible(el)) continue;
    acts.forEach((a) => seen.add(a));
    // Un grupo lleva su botón sobre la última opción, no en el borde de su caja (la mano es ancha).
    const r = (isGroup(el) && [...el.querySelectorAll(FOCUSABLE)].filter(visible).pop() || el).getBoundingClientRect();
    badges.push({ x: Math.round(Math.min(r.right - 6, innerWidth - 24)), y: Math.round(Math.max(r.top - 6, 13)), text: acts.map((a) => glyphs[a]).join(' ') });
    legend.push({ keys: acts, label: labelOf(el) });
  }
  for (const map of [...declared].reverse()) for (const [a, e] of Object.entries(map)) {
    if (seen.has(a) || (e.when && !e.when())) continue;
    seen.add(a);
    legend.push({ keys: [a], label: e.label });
  }
  const back = document.querySelector('.overlay') || document.querySelector('[data-back]');
  if (!seen.has('Escape') && back) legend.push({ keys: ['Escape'], label: t('pad.back', 'Volver') });
  if (!seen.has('Enter')) legend.unshift({ keys: ['Enter'], label: t('pad.ok', 'Elegir') });
  const sig = JSON.stringify([badges, legend, glyphs.x]);
  if (sig === lastSig) return;
  lastSig = sig;
  const chip = (text) => Object.assign(document.createElement('kbd'), { className: 'pad-g', textContent: text });
  const bar = document.createElement('div');
  bar.className = 'pad-legend';
  for (const { keys, label } of legend) {
    const item = document.createElement('span');
    keys.forEach((k) => item.append(chip(glyphs[k])));
    item.append(label);
    bar.append(item);
  }
  layer.replaceChildren(bar, ...badges.map(({ x, y, text }) => {
    const b = chip(text);
    b.style.left = x + 'px'; b.style.top = y + 'px';
    return b;
  }));
}

const held = new Map(); // tecla → { next: momento de la próxima repetición }
function poll(now) {
  const pads = [...(navigator.getGamepads?.() || [])].filter(Boolean);
  const down = new Set();
  let ry = 0;
  pads.forEach((pad, n) => {
    const add = (key) => down.add(n && SECOND[key] ? SECOND[key] : key);
    for (const [i, key] of Object.entries(BUTTONS)) if (pad.buttons[i]?.pressed) add(key);
    const [x = 0, y = 0, , y2 = 0] = pad.axes;
    if (x < -0.5) add('ArrowLeft'); else if (x > 0.5) add('ArrowRight');
    if (y < -0.5) add('ArrowUp'); else if (y > 0.5) add('ArrowDown');
    if (!n && Math.abs(y2) > 0.25) ry = y2;
  });
  if (down.size || ry) {
    document.documentElement.dataset.input = 'pad';
    glyphs = GLYPHS[styleOf(pads[0]?.id || '')];
  }
  if (ry) scroll(ry);
  for (const key of held.keys()) if (!down.has(key)) { held.delete(key); release(key); }
  for (const key of down) {
    const h = held.get(key);
    if (!h) { held.set(key, { next: now + FIRST }); press(key); }
    else if ((DIRS[key] || Object.values(SECOND).includes(key)) && now >= h.next) { h.next = now + REPEAT; press(key); }
  }
  if (now >= nextPaint) { nextPaint = now + 250; paint(); }
  if (pads.length) requestAnimationFrame(poll);
  else { running = false; delete document.documentElement.dataset.input; paint(); }
}

let running = false;
export function startGamepad() {
  addEventListener('gamepadconnected', () => {
    if (!running) { running = true; requestAnimationFrame(poll); }
  });
  // Tocar la pantalla o usar el teclado de verdad devuelve la interfaz a su estado normal.
  const off = (e) => e.isTrusted && document.documentElement.dataset.input === 'pad' && (delete document.documentElement.dataset.input, paint());
  addEventListener('pointerdown', off, true);
  addEventListener('keydown', off, true);
}
