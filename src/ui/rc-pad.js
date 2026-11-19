import { html, useEffect, useRef } from './lib.js';
import { t } from '../i18n/index.js';
import { Icon } from './icons.js';

// Mando de teledirigido: joystick en pantalla (hacia dónde ir y cuánto) y teclado (flechas o WASD:
// acelerar, frenar y girar). Escribe en `input.current` lo que lee drive() de src/game/boats.js.
export function useRcKeys(input, on, onRelease) {
  useEffect(() => {
    if (!on) return;
    const held = new Set();
    const map = { arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd', arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r' };
    const key = (e) => {
      if (e.target.closest?.('input, select, textarea')) return;
      const k = e.key.toLowerCase();
      if (k === 'escape' && e.type === 'keydown') return onRelease?.();
      if (!map[k]) return;
      e.preventDefault();
      e.type === 'keydown' ? held.add(map[k]) : held.delete(map[k]);
      input.current = { throttle: (held.has('u') ? 1 : 0) - (held.has('d') ? 1 : 0), steer: (held.has('r') ? 1 : 0) - (held.has('l') ? 1 : 0) };
    };
    addEventListener('keydown', key); addEventListener('keyup', key);
    return () => { removeEventListener('keydown', key); removeEventListener('keyup', key); input.current = null; };
  }, [on]);
}

// Botón redondo de icono a los lados del joystick (pantalla completa, soltar, nitro…): todos del mismo tamaño.
export const RcButton = ({ icon, label, on, onPress, cls = '', style }) => html`<button class=${'zn-tool-ic rc-side ' + cls + (on ? ' on' : '')} style=${style}
  aria-label=${label} title=${label} aria-pressed=${on == null ? undefined : !!on} onPointerDown=${(e) => { e.preventDefault(); onPress(); }}><${Icon} name=${icon} size=${30} /></button>`;

// left / right: lo que va a cada lado del joystick (un RcButton), para que quede centrado.
export function RcPad({ input, left, right }) {
  const pad = useRef(null), knob = useRef(null);
  const set = (e) => {
    const r = pad.current.getBoundingClientRect(), R = r.width / 2;
    const dx = e.clientX - r.left - R, dy = e.clientY - r.top - R, d = Math.min(R, Math.hypot(dx, dy));
    const aim = Math.atan2(dy, dx);
    input.current = { aim, mag: d / R };
    knob.current.style.translate = `${Math.cos(aim) * d}px ${Math.sin(aim) * d}px`;
  };
  const down = (e) => { e.preventDefault(); pad.current.setPointerCapture?.(e.pointerId); set(e); };
  const up = () => { input.current = null; knob.current.style.translate = '0 0'; };
  return html`<div class="rc">
    ${left}
    <div class="rc-pad" ref=${pad} role="application" aria-label=${t('rc.aria', 'Mando: arrastra hacia donde quieres ir; con teclado, flechas o WASD')}
      onPointerDown=${down} onPointerMove=${(e) => e.buttons && set(e)} onPointerUp=${up} onPointerCancel=${up}><i ref=${knob}></i></div>
    ${right}
  </div>`;
}
