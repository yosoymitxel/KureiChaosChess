import { html, useEffect, useRef, useState } from '../lib.js';
import { Icon } from '../icons.js';
import { useEnter, ConfirmButton } from '../components.js';
import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';
import { canFullscreen, setFullscreen, useFullscreen } from '../fullscreen.js';

// Decorative diorama: a small board with a boss facing a few pieces, gently swaying.
// Five more pieces, labelled above, turn into the extras: Jardín Zen, Tienda, Galería, Logros and Tutorial.
function Diorama({ onZen, onShop, onGallery, onAchievements, onTutorial }) {
  const host = useRef(null), tags = useRef(null);
  const open = { 'x-zen': onZen, 'x-tienda': onShop, 'x-galeria': onGallery, 'x-logros': onAchievements, 'x-tutorial': onTutorial };
  useEffect(() => {
    const v = new BoardView(host.current, { camera: 'epic' });
    const board = { rows: 6, cols: 6, holes: new Set(['2,0', '3,5', '2,5']) };
    const pieces = [
      makePiece('king', 'dark', 0, 2, { boss: 'titan', h: 2, w: 2, hp: 3, maxHp: 3, name: 'Titán' }),
      makePiece('knight', 'light', 4, 1), makePiece('queen', 'light', 4, 3), makePiece('pawn', 'light', 3, 2),
      makePiece('rook', 'light', 5, 0), makePiece('pawn', 'dark', 2, 3),
    ];
    v.setBoard(board);
    v.setPieces(pieces);
    // Extras: five jade pieces wear the boss label and open a screen when tapped. Listed far to
    // near so the near one paints over the one behind; the host resolves the tap by data-pid.
    for (const [id, label, type, row, col] of [
      ['x-zen', 'Jardín Zen', 'pawn', 3, 0],
      ['x-tutorial', 'Tutorial', 'king', 4, 5],
      ['x-logros', 'Logros', 'rook', 5, 2],
      ['x-galeria', 'Galería', 'bishop', 2, 4],
      ['x-tienda', 'Tienda', 'knight', 5, 4],
    ]) {
      if (!open[id]) continue;
      const p = makePiece(type, 'wild', row, col, { id });
      const el = v.addPiece(p);
      el.classList.add('extra');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', label);
      const tag = document.createElement('button');
      tag.className = 'x-tag';
      tag.tabIndex = -1;
      tag.textContent = label;
      tag.dataset.pid = id;
      tags.current.appendChild(tag);
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        el.click();
      });
      pieces.push(p);
    }
    v.intro(pieces);
    // Las etiquetas viven fuera del 3D (si no, el plano del tablero las corta) y siguen a su pieza.
    let raf;
    const follow = () => {
      const box = tags.current.getBoundingClientRect();
      for (const tag of tags.current.children) {
        const fig = host.current.querySelector(`[data-pid="${tag.dataset.pid}"] .pc-fig`);
        if (!fig) continue;
        const r = fig.getBoundingClientRect();
        tag.style.translate = `${r.left + r.width / 2 - box.left}px ${r.top + r.height * 0.28 - box.top}px`;
      }
      raf = requestAnimationFrame(follow);
    };
    follow();
    return () => { cancelAnimationFrame(raf); tags.current?.replaceChildren(); v.destroy(); };
  }, []);
  const pick = (e) => {
    const fn = open[e.target.closest?.('[data-pid]')?.dataset.pid];
    if (fn) fn();
  };
  return html`<div class="diorama-wrap">
    <div class="diorama" ref=${host} role="group" aria-label="Extras" onClick=${pick}></div>
    <div class="x-tags" ref=${tags} aria-hidden="true" onClick=${pick}></div>
  </div>`;
}

export function MenuScreen({ hasRun, onNew, onTutorial, onContinue, onHowTo, onSettings, onMinis, onVersus, onZen, onShop, onGallery, onAchievements, settings, setSettings }) {
  const ref = useRef(null);
  useEnter(ref);
  const [askTutorial, setAskTutorial] = useState(false);
  const full = useFullscreen();
  const toggleFull = () => { setFullscreen(!full); setSettings((s) => ({ ...s, fullscreen: !full })); };
  // Starting from the menu is a tap, so it can enter fullscreen right away when the setting asks for it.
  const go = (fn) => () => { if (settings.fullscreen) setFullscreen(true); fn(); };
  return html`<div class="screen menu" ref=${ref}>
    <${Diorama} onZen=${onZen && go(onZen)} onShop=${onShop && go(onShop)} onGallery=${onGallery && go(onGallery)} onAchievements=${onAchievements && go(onAchievements)}
      onTutorial=${hasRun ? () => setAskTutorial(true) : go(onTutorial)} />
    <div class="menu-col">
      <div class="logo" data-enter>
        <h1 aria-label="Kure'i ChaosChess"><span class="logo-main" aria-hidden="true">Kure'<span class="logo-i">i<${Icon} name="crown" size=${40} /></span></span>
          <span class="logo-sub" aria-hidden="true"><span class="logo-chaos">${[...'Chaos'].map((ch, i) => html`<i style=${{ '--i': i }}>${ch}</i>`)}</span>Chess</span></h1>
        <p>Ajedrez que muta en cada piso. Sube la torre, gana piezas raras y derriba al coloso del final.</p>
      </div>
      <nav class="menu-actions">
        ${askTutorial && html`<div class="menu-ask" role="alert">
          <p>El tutorial es una run corta de cuatro pisos y reemplaza la run actual.</p>
          <div class="menu-row"><button class="btn primary" onClick=${go(onTutorial)}>Empezar tutorial</button><button class="btn ghost" onClick=${() => setAskTutorial(false)}>Cancelar</button></div>
        </div>`}
        ${!askTutorial && html`<button class="btn primary" data-enter onClick=${go(hasRun ? onContinue : onNew)}>${hasRun ? 'Continuar run' : 'Empezar run'}</button>`}
        ${hasRun && !askTutorial && html`<${ConfirmButton} class="btn" enter onConfirm=${onNew} confirmLabel="Se pierde la run actual. ¿Seguro?">Nueva run<//>`}
        ${onMinis && html`<button class="btn" data-enter onClick=${onMinis}><${Icon} name="connect4" />Minijuegos</button>`}
        ${!askTutorial && html`<button class="btn" data-enter onClick=${go(onVersus)}><${Icon} name="human" />Partida local</button>`}
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
