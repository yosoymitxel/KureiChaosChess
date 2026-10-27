import { html, useEffect, useRef, useState } from '../lib.js';
import { Icon } from '../icons.js';
import { useEnter, ConfirmButton } from '../components.js';
import { BoardView } from '../../view/board-view.js';
import { makePiece } from '../../game/generate.js';
import { canFullscreen, setFullscreen, useFullscreen } from '../fullscreen.js';
import { award } from '../../game/achievements.js';
import { playSfx } from '../sfx.js';
import { t } from '../../i18n/index.js';

// Decorative diorama: a small board with a boss facing a few pieces, gently swaying.
// Five more pieces, labelled above, turn into the extras: Jardín Zen, Tienda, Galería, Logros and Tutorial.
function Diorama({ onZen, onShop, onGallery, onAchievements, onTutorial }) {
  const host = useRef(null), tags = useRef(null), titan = useRef({ id: null, n: 0, t: 0 });
  const open = { 'x-zen': onZen, 'x-tienda': onShop, 'x-galeria': onGallery, 'x-logros': onAchievements, 'x-tutorial': onTutorial };
  useEffect(() => {
    const v = new BoardView(host.current, { camera: 'epic' });
    const board = { rows: 6, cols: 6, holes: new Set(['2,0', '3,5', '2,5']) };
    const pieces = [
      makePiece('king', 'dark', 0, 2, { boss: 'titan', h: 2, w: 2, hp: 3, maxHp: 3, name: 'Titán' }),
      makePiece('knight', 'light', 4, 1), makePiece('queen', 'light', 4, 3), makePiece('pawn', 'light', 3, 2),
      makePiece('rook', 'light', 5, 0), makePiece('pawn', 'dark', 2, 3),
    ];
    titan.current.id = pieces[0].id;
    v.setBoard(board);
    v.setPieces(pieces);
    // Extras: five jade pieces wear the boss label and open a screen when tapped. Listed far to
    // near so the near one paints over the one behind; the host resolves the tap by data-pid.
    for (const [id, label, type, row, col] of [
      ['x-zen', t('menu.zen', 'Jardín Zen'), 'pawn', 3, 0],
      ['x-tutorial', t('menu.tutorial', 'Tutorial'), 'king', 4, 5],
      ['x-logros', t('menu.achievements', 'Logros'), 'rook', 5, 2],
      ['x-galeria', t('menu.gallery', 'Galería'), 'bishop', 2, 4],
      ['x-tienda', t('menu.shop', 'Tienda'), 'knight', 5, 4],
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
  // Secreto: tres toques seguidos al Titán lo despiertan.
  const poke = (el) => {
    const st = titan.current, now = performance.now();
    st.n = now - st.t < 1200 ? st.n + 1 : 1;
    st.t = now;
    el.classList.remove('poked');
    void el.offsetWidth;
    el.classList.add('poked');
    playSfx(st.n >= 3 ? 'stomp' : 'hit');
    if (st.n >= 3) { st.n = 0; award('titan_poke'); }
  };
  const pick = (e) => {
    const pc = e.target.closest?.('[data-pid]');
    if (pc && pc.dataset.pid === titan.current.id) return poke(pc);
    const fn = open[pc?.dataset.pid];
    if (fn) fn();
  };
  return html`<div class="diorama-wrap">
    <div class="diorama" ref=${host} role="group" aria-label=${t('menu.extras', 'Extras')} onClick=${pick}></div>
    <div class="x-tags" ref=${tags} aria-hidden="true" onClick=${pick}></div>
  </div>`;
}

// La corona hace de punto de la ı. Se dibuja la letra con la fuente que pinta este dispositivo (su
// forma cambia con el tamaño y entre fuentes) y se busca el palo a media altura: su centro va a
// --cx y su remate a --top, donde se apoya el pie de la corona.
function fitCrown(el) {
  const cs = getComputedStyle(el);
  const g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const font = (px) => `${cs.fontWeight} ${px}px ${cs.fontFamily}`;
  // El lienzo no aplica font-size-adjust (la letra píxel lo usa): se escala a mano por la altura de la x.
  let fs = parseFloat(cs.fontSize);
  const adjust = parseFloat(cs.fontSizeAdjust);
  if (adjust) { g.font = font(fs); fs *= adjust / (g.measureText('x').actualBoundingBoxAscent / fs); }
  g.font = font(fs);
  const m = g.measureText('ı'), pad = Math.ceil(fs * 0.2);
  const w = Math.ceil(m.width + pad * 2), asc = Math.ceil(m.actualBoundingBoxAscent), h = asc + pad;
  Object.assign(g.canvas, { width: w, height: h });
  g.font = font(fs);
  g.fillText('ı', pad, asc + 1);
  const px = g.getImageData(0, 0, w, h).data, ink = (x, y) => px[(y * w + x) * 4 + 3] > 128;
  const mid = asc + 1 - Math.round(asc / 2);
  let l = 0;
  while (l < w && !ink(l, mid)) l++;
  let r = l;
  while (r < w && ink(r, mid)) r++;
  let top = 0;
  while (top < mid && !ink(Math.floor((l + r) / 2), top)) top++;
  const lh = parseFloat(cs.lineHeight);
  const baseline = (lh - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent;
  const icon = [...el.querySelectorAll('.icon')].find((i) => getComputedStyle(i).display !== 'none');
  const size = parseFloat(getComputedStyle(icon).width);
  // Pie de la corona dentro de su caja: fila 14 de 16 en píxel, y = 21.8 de 24 en vector.
  const foot = document.documentElement.dataset.art === 'pixel' ? 14 / 16 : 21.8 / 24;
  el.style.setProperty('--cx', `${(l + r) / 2 - pad}px`);
  el.style.setProperty('--top', `${baseline - (asc + 1 - top) + fs * 0.012 - size * foot}px`);
}

export function MenuScreen({ hasRun, onNew, onTutorial, onContinue, onHowTo, onSettings, onMinis, onVersus, onZen, onShop, onGallery, onAchievements, settings, setSettings }) {
  const ref = useRef(null);
  useEnter(ref);
  const crown = useRef(null);
  useEffect(() => {
    const fit = () => crown.current && fitCrown(crown.current);
    document.fonts.ready.then(fit);
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, [settings.theme]);
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
        <h1 aria-label="Kure'i ChaosChess"><span class="logo-main" aria-hidden="true">Kure'<span class="logo-i" ref=${crown}>ı<${Icon} name="crown" size=${40} /></span></span>
          <span class="logo-sub" aria-hidden="true"><span class="logo-chaos">${[...'Chaos'].map((ch, i) => html`<i style=${{ '--i': i }}>${ch}</i>`)}</span>Chess</span></h1>
        <p>${t('menu.tagline', 'Ajedrez que muta en cada piso. Sube la torre, gana piezas raras y derriba al coloso del final.')}</p>
      </div>
      <nav class="menu-actions">
        ${askTutorial && html`<div class="menu-ask" role="alert">
          <p>${t('menu.tutorialAsk', 'El tutorial es una run corta de cuatro pisos y reemplaza la run actual.')}</p>
          <div class="menu-row"><button class="btn primary" onClick=${go(onTutorial)}>${t('menu.tutorialStart', 'Empezar tutorial')}</button><button class="btn ghost" onClick=${() => setAskTutorial(false)}>${t('menu.cancel', 'Cancelar')}</button></div>
        </div>`}
        ${!askTutorial && html`<button class="btn primary" data-enter onClick=${go(hasRun ? onContinue : onNew)}><${Icon} name=${hasRun ? 'map' : 'swords'} />${hasRun ? t('menu.continue', 'Continuar run') : t('menu.start', 'Empezar run')}</button>`}
        ${hasRun && !askTutorial && html`<${ConfirmButton} class="btn" enter onConfirm=${onNew} confirmLabel=${t('menu.newRunConfirm', 'Se pierde la run actual. ¿Seguro?')}><${Icon} name="refresh" />${t('menu.newRun', 'Nueva run')}<//>`}
        ${onMinis && html`<button class="btn" data-enter onClick=${onMinis}><${Icon} name="connect4" />${t('menu.minis', 'Minijuegos')}</button>`}
        ${!askTutorial && html`<button class="btn" data-enter onClick=${go(onVersus)}><${Icon} name="human" />${t('menu.versus', 'Partida local')}</button>`}
        <div class="menu-row" data-enter>
          <button class="btn ghost" onClick=${onHowTo}><${Icon} name="book" />${t('menu.rules', 'Reglas')}</button>
          <button class="btn ghost" onClick=${onSettings}><${Icon} name="gear" />${t('menu.settings', 'Ajustes')}</button>
          ${canFullscreen && html`<button class="btn ghost icon-only" aria-pressed=${full} aria-label=${full ? t('menu.exitFullscreen', 'Salir de pantalla completa') : t('menu.fullscreen', 'Pantalla completa')}
            title=${full ? t('menu.exitFullscreen', 'Salir de pantalla completa') : t('menu.fullscreen', 'Pantalla completa')} onClick=${toggleFull}><${Icon} name=${full ? 'shrink' : 'expand'} /></button>`}
        </div>
      </nav>
    </div>
  </div>`;
}
