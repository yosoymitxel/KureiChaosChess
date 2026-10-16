import { html, useEffect, useRef } from '../lib.js';
import { Icon } from '../icons.js';
import { useEnter, ConfirmButton } from '../components.js';
import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';
import { canFullscreen, setFullscreen, useFullscreen } from '../fullscreen.js';

// Decorative diorama: a small board with a boss facing a few pieces, gently swaying.
function Diorama() {
  const host = useRef(null);
  useEffect(() => {
    const v = new BoardView(host.current, { camera: 'epic' });
    const board = { rows: 6, cols: 6, holes: new Set(['2,0', '3,5', '2,5']) };
    const pieces = [
      makePiece('king', 'dark', 0, 2, { boss: 'titan', h: 2, w: 2, hp: 3, maxHp: 3, name: 'Titán' }),
      makePiece('knight', 'light', 4, 1), makePiece('queen', 'light', 5, 3), makePiece('pawn', 'light', 3, 2),
      makePiece('rook', 'light', 5, 0), makePiece('bishop', 'light', 4, 4), makePiece('pawn', 'dark', 2, 3),
    ];
    v.setBoard(board);
    v.setPieces(pieces);
    v.intro(pieces);
    return () => v.destroy();
  }, []);
  return html`<div class="diorama" ref=${host} aria-hidden="true"></div>`;
}

export function MenuScreen({ hasRun, onNew, onContinue, onHowTo, onSettings, onMinis, onZen, onGallery, onAchievements, settings, setSettings }) {
  const ref = useRef(null);
  useEnter(ref);
  const full = useFullscreen();
  const toggleFull = () => { setFullscreen(!full); setSettings((s) => ({ ...s, fullscreen: !full })); };
  // Starting from the menu is a tap, so it can enter fullscreen right away when the setting asks for it.
  const go = (fn) => () => { if (settings.fullscreen) setFullscreen(true); fn(); };
  return html`<div class="screen menu" ref=${ref}>
    <${Diorama} />
    <div class="menu-col">
      <div class="logo" data-enter>
        <h1>Zug<span>zwang</span></h1>
        <p>Ajedrez que muta en cada piso. Sube la torre, gana piezas raras y derriba al coloso del final.</p>
      </div>
      <nav class="menu-actions">
        <button class="btn primary" data-enter onClick=${go(hasRun ? onContinue : onNew)}>${hasRun ? 'Continuar run' : 'Empezar run'}</button>
        ${hasRun && html`<${ConfirmButton} class="btn" onConfirm=${onNew} confirmLabel="Se pierde la run actual. ¿Seguro?">Nueva run<//>`}
        ${onMinis && html`<button class="btn" data-enter onClick=${onMinis}><${Icon} name="connect4" />Minijuegos</button>`}
        ${onZen && html`<button class="btn" data-enter onClick=${onZen}><${Icon} name="rest" />Jardín Zen</button>`}
        ${onGallery && html`<button class="btn" data-enter onClick=${onGallery}><${Icon} name="map" />Galería</button>`}
        ${onAchievements && html`<button class="btn" data-enter onClick=${onAchievements}><${Icon} name="trophy" />Logros</button>`}
        <div class="menu-row" data-enter>
          <button class="btn ghost" onClick=${onHowTo}><${Icon} name="book" />Reglas</button>
          <button class="btn ghost" onClick=${onSettings}><${Icon} name="gear" />Ajustes</button>
          ${canFullscreen && html`<button class="btn ghost icon-only" aria-pressed=${full} aria-label=${full ? 'Salir de pantalla completa' : 'Pantalla completa'}
            title=${full ? 'Salir de pantalla completa' : 'Pantalla completa'} onClick=${toggleFull}><${Icon} name=${full ? 'shrink' : 'expand'} /></button>`}
        </div>
      </nav>
    </div>
  </div>`;
}
