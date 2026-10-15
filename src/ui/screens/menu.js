import { html, useEffect, useRef } from '../lib.js';
import { Icon } from '../icons.js';
import { useEnter } from '../components.js';
import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';

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

export function MenuScreen({ hasRun, onNew, onContinue, onHowTo, onSettings }) {
  const ref = useRef(null);
  useEnter(ref);
  return html`<div class="screen menu" ref=${ref}>
    <${Diorama} />
    <div class="menu-col">
      <div class="logo" data-enter>
        <span class="eyebrow">Ajedrez mutante · roguelike de mesa</span>
        <h1>Zug<span>zwang</span></h1>
      </div>
      <nav class="menu-actions">
        <button class="btn primary" data-enter onClick=${hasRun ? onContinue : onNew}>${hasRun ? 'Continuar run' : 'Empezar run'}<${Icon} name="arrow" /></button>
        ${hasRun && html`<button class="btn" data-enter onClick=${() => confirm('¿Empezar de cero? Se pierde la run actual.') && onNew()}>Nueva run</button>`}
        <div class="menu-row" data-enter>
          <button class="btn ghost" onClick=${onHowTo}><${Icon} name="book" />Reglas</button>
          <button class="btn ghost" onClick=${onSettings}><${Icon} name="dice" />Ajustes</button>
        </div>
      </nav>
    </div>
    <div class="version">v2.0</div>
  </div>`;
}
