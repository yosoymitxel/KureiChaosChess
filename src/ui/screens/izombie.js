import { html, useState } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon, PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { MiniBoard, zombies } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { ROWS, COLS, COST, DIFFS, newZombie, buy, canBuy, advance, danger } from '../../game/izombie.js';

export function IZombieScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newZombie(diff || settings.miniDiff?.izombie));
  const [pick, setPick] = useState('pawn');
  const [, tick] = useState(0);
  const redraw = () => tick((n) => n + 1);
  const act = (fn) => fn() && redraw();

  const hot = s.over ? new Set() : danger(s);
  const marks = new Map([...hot].map((i) => [key(Math.floor(i / COLS), i % COLS), 'hot']));
  for (let c = 0; c < COLS; c++) if (canBuy(s, pick, c)) marks.set(key(0, c), 'target');
  const labels = new Map([...s.trophies].map((c) => [key(ROWS - 1, c), '★']));
  const attackers = s.pieces.filter((p) => p.color === 'dark');
  const step = !attackers.length ? 1 : s.moved ? 3 : 2;
  const STEPS = ['Compra', 'Avanza', 'Trofeos'];
  const HINTS = {
    1: 'Toca la fila de arriba para comprar una pieza. Evita las casillas rojas.',
    2: 'Pulsa Avanzar: cada pieza da su paso de ajedrez.',
    3: 'Lleva una pieza a cada trofeo de la última fila.',
  };

  return html`<div class="screen mini">
    <${Topbar} title="Yo, Zombi" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${s.board} pieces=${zombies(s.pieces)} marks=${marks} labels=${labels} strikes=${s.captures} disabled=${!!s.over} label="Tablero de Yo, Zombi"
          onTap=${(r, c) => r === 0 && act(() => buy(s, pick, c))} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="coin-chip" title="Monedas"><${Icon} name="coin" size=${16} /><b>${s.coins}</b></span>
            <span class="chip"><${PieceIcon} type="pawn" side="zombie" size=${15} />${attackers.length} en pie</span>
            <span class="chip" aria-label=${`Trofeos tomados: ${s.diff.trophies.length - s.trophies.size} de ${s.diff.trophies.length}`}><${Icon} name="trophy" size=${15} />${s.diff.trophies.length - s.trophies.size}/${s.diff.trophies.length}</span>
          </div>`}
          ${!s.over && html`<p class="mini-steps">${STEPS.map((t, i) => html`<span class=${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}>${i + 1} ${t}</span>`)}</p>`}
          ${!s.over && html`<p class="mini-step-hint">${HINTS[step]}</p>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Tomaste los ${s.diff.trophies.length} trofeos.` : `Te quedaste sin piezas y sin monedas con ${s.diff.trophies.length - s.trophies.size} de ${s.diff.trophies.length} trofeos.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="bm-actions" role="group" aria-label="Pieza a colocar">
              ${Object.entries(COST).map(([t, cost]) => html`<button class=${'btn sm buy' + (pick === t ? ' on' : ' ghost')} aria-pressed=${pick === t} aria-label=${`${PIECE_NAMES[t]}: ${cost} moneda${cost === 1 ? '' : 's'}`}
                disabled=${cost > s.coins} onClick=${() => setPick(t)}><${PieceIcon} type=${t} side="zombie" size=${22} /><span>${PIECE_NAMES[t]}</span><b class="buy-cost">${cost}</b></button>`)}
            </div>
            <button class="btn primary" onClick=${() => act(() => advance(s))}>Avanzar</button>`}
          <${MiniTools} mini="izombie" title="Yo, Zombi" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Como Yo, Zombi de Plants vs. Zombies: atacas tú. La defensa marfil no se mueve, pero tras cada avance captura lo que pare en sus casillas (teñidas de rojo). Compra piezas en la fila de arriba; al pulsar Avanzar cada una da su paso de ajedrez más profundo. Lleva una pieza a cada trofeo de la última fila: la que llega lo toma y sale del tablero. Capturar un peón marfil paga 2 monedas; otra pieza, 1. Pierdes si te quedas sin piezas y sin monedas para un peón.<//>
        </div>
      </div>
    </div>
  </div>`;
}
