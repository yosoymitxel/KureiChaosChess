// Mando, en su forma más simple: se traduce a las teclas que el juego ya entiende. La cruceta y el
// stick izquierdo son las flechas (en un segundo mando, WASD: la otra torre del hockey a dos), A es
// Enter y B o Start son Escape. Al soltar llega su keyup, así lo que se mantiene pulsado (la torre
// del hockey) se para. Una flecha que nadie usa (fuera del tablero o en su borde) mueve el foco al
// botón más cercano en esa dirección; A pulsa el botón con foco, y B, si nada la usa, vuelve atrás
// con el botón «Volver» de la pantalla.
const BUTTONS = { 0: 'Enter', 1: 'Escape', 9: 'Escape', 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight' };
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
const SECOND = { ArrowUp: 'w', ArrowDown: 's', ArrowLeft: 'a', ArrowRight: 'd' };
const FIRST = 320, REPEAT = 120; // ms hasta que una flecha mantenida se repite, y cada cuánto
const FOCUSABLE = 'button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])';

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

const targets = new Map(); // tecla pulsada → dónde se mandó su keydown, para mandar ahí el keyup
function release(key) {
  targets.get(key)?.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  targets.delete(key);
}
function press(key) {
  const target = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body;
  const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  targets.set(key, target);
  target.dispatchEvent(ev);
  if (ev.defaultPrevented || !(key in DIRS || key === 'Enter' || key === 'Escape')) return;
  if (DIRS[key]) moveFocus(key);
  else if (key === 'Enter' && target !== document.body && target.matches('button, [href], [role="button"], [role="tab"], [role="option"]')) target.click();
  else if (key === 'Escape' && !document.querySelector('.overlay')) document.querySelector('[data-back]')?.click();
}

const held = new Map(); // tecla → { next: momento de la próxima repetición }
function poll(now) {
  const pads = [...(navigator.getGamepads?.() || [])].filter(Boolean);
  const down = new Set();
  pads.forEach((pad, n) => {
    const add = (key) => down.add(n && SECOND[key] ? SECOND[key] : key);
    for (const [i, key] of Object.entries(BUTTONS)) if (pad.buttons[i]?.pressed) add(key);
    const [x = 0, y = 0] = pad.axes;
    if (x < -0.5) add('ArrowLeft'); else if (x > 0.5) add('ArrowRight');
    if (y < -0.5) add('ArrowUp'); else if (y > 0.5) add('ArrowDown');
  });
  for (const key of held.keys()) if (!down.has(key)) { held.delete(key); release(key); }
  for (const key of down) {
    const h = held.get(key);
    if (!h) { held.set(key, { next: now + FIRST }); press(key); }
    else if ((DIRS[key] || Object.values(SECOND).includes(key)) && now >= h.next) { h.next = now + REPEAT; press(key); }
  }
  if (pads.length) requestAnimationFrame(poll);
  else running = false;
}

let running = false;
export function startGamepad() {
  addEventListener('gamepadconnected', () => {
    if (!running) { running = true; requestAnimationFrame(poll); }
  });
}
