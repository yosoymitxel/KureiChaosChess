import { html, useEffect, useRef } from './lib.js';
import { t } from '../i18n/index.js';

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

export function RcPad({ input, onRelease, zoom, onZoom }) {
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
    ${onZoom && html`<button class=${'btn sm rc-zoom' + (zoom ? ' on' : '')} aria-pressed=${!!zoom} onClick=${onZoom}>${zoom ? t('rc.zoomOut', 'Ver todo') : t('rc.zoomIn', 'Acercar')}</button>`}
    <div class="rc-pad" ref=${pad} role="application" aria-label=${t('rc.aria', 'Mando: arrastra hacia donde quieres ir; con teclado, flechas o WASD')}
      onPointerDown=${down} onPointerMove=${(e) => e.buttons && set(e)} onPointerUp=${up} onPointerCancel=${up}><i ref=${knob}></i></div>
    ${onRelease && html`<button class="btn sm" onClick=${onRelease}>${t('rc.release', 'Soltar el mando')}</button>`}
  </div>`;
}
