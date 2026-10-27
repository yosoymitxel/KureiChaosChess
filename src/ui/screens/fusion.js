// Fusión: 2048 con piezas. Las fichas son elementos con posición propia y transición CSS, así el
// deslizamiento se ve continuo y se puede encadenar sin esperar; la que nace brota y la fundida late.
import { html, useState, useEffect, useRef } from '../lib.js';
import { playSfx } from '../sfx.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { DIFFS, LADDER, newFusion, slide } from '../../game/fusion.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';

const KEYS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
const PAD = [['up', '↑', t('dir.up', 'Arriba')], ['left', '←', t('marcianos.left2', 'Izquierda')], ['right', '→', t('marcianos.right', 'Derecha')], ['down', '↓', t('dir.down', 'Abajo')]];

export function FusionScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newFusion(diff || settings.miniDiff?.fusion));
  const [, tick] = useState(0);
  const touch = useRef(null);
  const go = (dir) => {
    if (!slide(s, dir)) return playSfx('invalid');
    playSfx(s.tiles.some((t) => t.merged) ? 'pop' : 'whoosh');
    tick((n) => n + 1);
  };

  useEffect(() => {
    const onKey = (e) => { const d = KEYS[e.key.toLowerCase()]; if (d) { e.preventDefault(); go(d); } };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });
  // Deslizar el dedo sobre el tablero empuja hacia ese lado.
  const onDown = (e) => { touch.current = { x: e.clientX, y: e.clientY }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} };
  const onUp = (e) => {
    const t = touch.current; touch.current = null;
    if (!t) return;
    const dx = e.clientX - t.x, dy = e.clientY - t.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  };

  const goal = LADDER[s.diff.goal];
  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.fusion.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="fu" style=${{ '--n': s.n }} role="grid" aria-label=${t('fusion.board', 'Tablero de Fusión')} onPointerDown=${onDown} onPointerUp=${onUp} onPointerCancel=${onUp}>
            ${Array.from({ length: s.n * s.n }, (_, i) => html`<span key=${'c' + i} class="fu-cell"></span>`)}
            ${s.tiles.map((t) => html`<span key=${t.id} class=${'fu-tile lv' + t.lv + (t.born ? ' born' : '') + (t.merged ? ' merged' : '') + (t.gone ? ' gone' : '')}
              style=${{ translate: `calc(${t.c} * var(--step)) calc(${t.r} * var(--step))` }} aria-label=${PIECE_NAMES[LADDER[t.lv]]}>
              <${PieceIcon} type=${LADDER[t.lv]} side=${t.lv >= s.diff.goal ? 'dark' : 'light'} size=${48} />
            </span>`)}
          </div>
        </div>
        <div class="mini-side">
          ${!s.over && html`<div class="fu-goal">
            <span>${t('fusion.goal', 'Meta')}</span><${PieceIcon} type=${goal} side="dark" size=${30} /><b>${PIECE_NAMES[goal]}</b>
          </div>`}
          ${!s.over && html`<ol class="fu-ladder" aria-label=${t('fusion.ladder', 'Escalera de fusión')}>${LADDER.slice(0, s.diff.goal + 1).map((t, i) => html`<li class=${i <= s.best ? 'on' : ''}><${PieceIcon} type=${t} side=${i === s.diff.goal ? 'dark' : 'light'} size=${22} /></li>`)}</ol>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('fusion.won', 'Formaste {name} en {n} jugadas.', { name: PIECE_NAMES[goal].toLowerCase(), n: s.moves }) : t('fusion.lost', 'El tablero se llenó sin fusiones posibles.')} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-pad" role="group" aria-label=${t('fusion.push', 'Empujar')}>
              ${PAD.map(([d, g, label]) => html`<button class=${'btn sm pad-' + d} aria-label=${label} onClick=${() => go(d)}>${g}</button>`)}
            </div>`}
          <${MiniTools} mini="fusion" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('fusion.help', 'Desliza el dedo, usa las flechas o el mando: todas las piezas corren hacia ese lado. Dos piezas iguales que chocan se funden en la siguiente de la escalera, de peón a rey. Tras cada jugada entra un peón. Forma la pieza meta antes de que el tablero se llene.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
