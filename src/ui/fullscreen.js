// Fullscreen on demand. Browsers only allow entering it from a tap or click, so every
// control calls setFullscreen() straight from its handler. iPhone Safari has no API: canFullscreen is false.
import { useState, useEffect } from './lib.js';

export const canFullscreen = !!document.documentElement.requestFullscreen;
const isFull = () => !!document.fullscreenElement;

export function setFullscreen(on) {
  if (!canFullscreen || on === isFull()) return;
  (on ? document.documentElement.requestFullscreen() : document.exitFullscreen()).catch(() => {});
}

// Live state: the player can also leave fullscreen with Escape or the system back gesture.
export function useFullscreen() {
  const [full, setFull] = useState(isFull());
  useEffect(() => {
    const sync = () => setFull(isFull());
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  return full;
}
