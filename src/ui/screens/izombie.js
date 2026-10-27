import { html, useState } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon, PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { MiniBoard, zombies } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { ROWS, COLS, COST, DIFFS, newZombie, buy, canBuy, advance, danger } from '../../game/izombie.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t, tp } from '../../i18n/index.js';
import { playSfx } from '../sfx.js';

export function IZombieScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newZombie(diff || settings.miniDiff?.izombie));
  const [pick, setPick] = useState('pawn');
  const [, tick] = useState(0);
  const redraw = () => tick((n) => n + 1);
  const act = (fn) => fn() && redraw();

  const hot = s.over ? new Set() : danger(s);
  const marks = new Map([...hot].map((i) => [key(Math.floor(i / COLS), i % COLS), 'hot']));
  for (let c = 0; c < COLS; c++) if (canBuy(s, pick, c)) marks.set(key(0, c), 'target');
  const labels = new Map([...s.trophies].map((c) => [key(ROWS - 1, c), 'icon:trophy']));
  const attackers = s.pieces.filter((p) => p.color === 'dark');
  const step = !attackers.length ? 1 : s.moved ? 3 : 2;
  const STEPS = [t('izombie.step1', 'Compra'), t('izombie.step2', 'Avanza'), t('izombie.step3', 'Trofeos')];
  const HINTS = {
    1: t('izombie.hint1', 'Toca la fila de arriba para comprar una pieza. Evita las casillas rojas.'),
    2: t('izombie.hint2', 'Pulsa Avanzar: cada pieza da su paso de ajedrez.'),
    3: t('izombie.hint3', 'Lleva una pieza a cada trofeo de la última fila.'),
  };

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.izombie.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${s.board} pieces=${zombies(s.pieces)} marks=${marks} labels=${labels} strikes=${s.captures} disabled=${!!s.over} label=${t('izombie.board', 'Tablero de Yo, Zombi')}
          onTap=${(r, c) => r === 0 && (canBuy(s, pick, c) ? act(() => buy(s, pick, c)) : playSfx('invalid'))} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="coin-chip" title=${t('izombie.coins', 'Monedas')}><${Icon} name="coin" size=${16} /><b>${s.coins}</b></span>
            <span class="chip"><${PieceIcon} type="pawn" side="zombie" size=${15} />${t('izombie.standing', '{n} en pie', { n: attackers.length })}</span>
            <span class="chip" aria-label=${t('izombie.trophies', 'Trofeos tomados: {n} de {total}', { n: s.diff.trophies.length - s.trophies.size, total: s.diff.trophies.length })}><${Icon} name="trophy" size=${15} />${s.diff.trophies.length - s.trophies.size}/${s.diff.trophies.length}</span>
          </div>`}
          ${!s.over && html`<p class="mini-steps">${STEPS.map((t, i) => html`<span class=${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}>${i + 1} ${t}</span>`)}</p>`}
          ${!s.over && html`<p class="mini-step-hint">${HINTS[step]}</p>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('izombie.won', 'Tomaste los {n} trofeos.', { n: s.diff.trophies.length }) : t('izombie.lost', 'Te quedaste sin piezas y sin monedas con {n} de {total} trofeos.', { n: s.diff.trophies.length - s.trophies.size, total: s.diff.trophies.length })} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-actions" role="group" aria-label=${t('mini.pieceToPlace', 'Pieza a colocar')}>
              ${Object.entries(COST).map(([ty, cost]) => html`<button class=${'btn sm buy' + (pick === ty ? ' on' : ' ghost')} aria-pressed=${pick === ty} aria-label=${`${PIECE_NAMES[ty]}: ` + tp('game.coins', cost, '{n} moneda', '{n} monedas')}
                disabled=${cost > s.coins} onClick=${() => setPick(ty)}><${PieceIcon} type=${ty} side="zombie" size=${22} /><span>${PIECE_NAMES[ty]}</span><b class="buy-cost">${cost}</b></button>`)}
            </div>
            <button class="btn primary" onClick=${() => act(() => advance(s))}>${t('izombie.advance', 'Avanzar')}</button>`}
          <${MiniTools} mini="izombie" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('izombie.help', 'Como Yo, Zombi de Plants vs. Zombies: atacas tú. La defensa marfil no se mueve, pero tras cada avance captura lo que pare en sus casillas (teñidas de rojo). Compra piezas en la fila de arriba; al pulsar Avanzar cada una da su paso de ajedrez más profundo. Lleva una pieza a cada trofeo de la última fila: la que llega lo toma y sale del tablero. Capturar un peón marfil paga 2 monedas; otra pieza, 1. Pierdes si te quedas sin piezas y sin monedas para un peón.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
