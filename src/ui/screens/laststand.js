import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon, PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { TIED_WEATHER } from '../../data/weather.js';
import { MiniBoard, zombies } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { ROWS, COLS, DIFFS, PRICES, newStand, place, canPlace, step, nextWave, building } from '../../game/laststand.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t, tp } from '../../i18n/index.js';
import { playSfx } from '../sfx.js';

export function LastStandScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newStand(diff || settings.miniDiff?.laststand));
  const [pick, setPick] = useState('pawn');
  const [, redraw] = useState(0);
  const host = useRef(null);
  const act = (fn) => { fn(); redraw((n) => n + 1); };

  useEffect(() => {
    if (s.phase !== 'fight' || s.over) return;
    const id = setInterval(() => { act(() => step(s)); if (s.over || s.phase !== 'fight') clearInterval(id); }, 900);
    return () => clearInterval(id);
  }, [s.phase, s.wave]);

  // Lanza la oleada; la última es la gran horda y se anuncia sobre el tablero, como el banderín de PvZ.
  const launch = () => {
    act(() => nextWave(s));
    playSfx('alarm');
    if (!s.horde || !host.current) return;
    const b = document.createElement('div');
    b.className = 'mini-banner';
    b.textContent = t('mini.hordeComes', '¡Llega una gran horda!');
    host.current.appendChild(b);
    motion(b, { scale: [1.4, 1], opacity: [0, 1] }, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
    motion(b, { opacity: [1, 0] }, { duration: 0.4, delay: 1.6, onComplete: () => b.remove() });
  };
  const last = s.wave === s.diff.waves - 1;

  const marks = new Map();
  for (let r = ROWS - 3; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (canPlace(s, pick, r, c)) marks.set(key(r, c), 'target');
  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.laststand.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} weather=${TIED_WEATHER.laststand} board=${s.board} pieces=${zombies(s.pieces)} marks=${marks} strikes=${s.captures} disabled=${!building(s)} label=${t('laststand.board', 'Tablero de Última resistencia')} hostRef=${host}
          onTap=${(r, c) => (canPlace(s, pick, r, c) ? act(() => place(s, pick, r, c)) : playSfx('invalid'))} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            ${building(s) && html`<span class="coin-chip" title=${t('laststand.budget', 'Presupuesto')}><${Icon} name="coin" size=${16} /><b>${s.budget}</b></span>`}
            <span class="chip" aria-label=${t('laststand.wavesDone', 'Oleadas superadas: {n} de {total}', { n: s.wave, total: s.diff.waves })}><span class="dots">${Array.from({ length: s.diff.waves }, (_, i) => html`<i class=${(i < s.wave ? '' : 'off') + (i === s.diff.waves - 1 ? ' flag' : '')} />`)}</span></span>
          </div>`}
          ${!s.over && s.phase === 'setup' && html`<p class="mini-step-hint">${t('laststand.setup', 'Coloca tu defensa en las tres filas de abajo.')}</p>`}
          ${!s.over && s.phase === 'between' && html`<p class="mini-step-hint">${t('laststand.between', 'Oleada {n} superada: +{bonus} monedas. Refuerza la defensa antes de la siguiente.', { n: s.wave, bonus: s.diff.bonus })}</p>`}
          ${!s.over && s.phase === 'fight' && html`<p class="mini-step-hint">${s.horde ? t('mini.horde', '¡La gran horda!') : t('mini.waveOf', 'Oleada {n} de {total}', { n: s.wave, total: s.diff.waves })}</p>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('laststand.won', 'Aguantaste las {n} oleadas y la gran horda sin ceder la línea.', { n: s.diff.waves }) : t('laststand.lost', 'El carmesí se abrió paso en la oleada {n}.', { n: s.wave })} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : building(s) && html`<div class="bm-actions" data-pad="l1 r1" role="group" aria-label=${t('mini.pieceToPlace', 'Pieza a colocar')}>
              ${Object.entries(PRICES).map(([ty, cost]) => html`<button class=${'btn sm' + (pick === ty ? ' on' : ' ghost')} aria-pressed=${pick === ty} aria-label=${`${PIECE_NAMES[ty]}: ` + tp('game.coins', cost, '{n} moneda', '{n} monedas')}
                disabled=${cost > s.budget} title=${PIECE_NAMES[ty]} onClick=${() => setPick(ty)}><${PieceIcon} type=${ty} side="light" size=${22} />${cost}</button>`)}
            </div>
            <button class="btn primary" data-pad="x" disabled=${!s.pieces.length} onClick=${launch}>${s.phase === 'setup' ? t('laststand.start', 'Empezar el asalto') : last ? t('laststand.bringHorde', '¡Que venga la horda!') : t('laststand.next', 'Siguiente oleada')}</button>`}
          <${MiniTools} mini="laststand" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('laststand.help', 'Compra piezas tocando las tres filas de abajo y empieza el asalto. El carmesí ataca en {waves} oleadas; la última es una gran horda. Entre oleadas cobras {bonus} monedas y puedes reforzar con lo que tengas: aguanta sin ceder la línea.', { waves: s.diff.waves, bonus: s.diff.bonus })}<//>
        </div>
      </div>
    </div>
  </div>`;
}
