import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon, PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { MiniBoard, zombies } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { ROWS, COLS, DIFFS, PRICES, newStand, place, canPlace, step, nextWave, building } from '../../game/laststand.js';
import { MODIFIERS } from '../../data/modifiers.js';

export function LastStandScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
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
    if (!s.horde || !host.current) return;
    const b = document.createElement('div');
    b.className = 'mini-banner';
    b.textContent = '¡Llega una gran horda!';
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
        <${MiniBoard} board=${s.board} pieces=${zombies(s.pieces)} marks=${marks} strikes=${s.captures} disabled=${!building(s)} label="Tablero de Última resistencia" hostRef=${host}
          onTap=${(r, c) => canPlace(s, pick, r, c) && act(() => place(s, pick, r, c))} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            ${building(s) && html`<span class="coin-chip" title="Presupuesto"><${Icon} name="coin" size=${16} /><b>${s.budget}</b></span>`}
            <span class="chip" aria-label=${`Oleadas superadas: ${s.wave} de ${s.diff.waves}`}><span class="dots">${Array.from({ length: s.diff.waves }, (_, i) => html`<i class=${(i < s.wave ? '' : 'off') + (i === s.diff.waves - 1 ? ' flag' : '')} />`)}</span></span>
          </div>`}
          ${!s.over && s.phase === 'setup' && html`<p class="mini-step-hint">Coloca tu defensa en las tres filas de abajo.</p>`}
          ${!s.over && s.phase === 'between' && html`<p class="mini-step-hint">Oleada ${s.wave} superada: +${s.diff.bonus} monedas. Refuerza la defensa antes de la siguiente.</p>`}
          ${!s.over && s.phase === 'fight' && html`<p class="mini-step-hint">${s.horde ? '¡La gran horda!' : `Oleada ${s.wave} de ${s.diff.waves}`}</p>`}
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Aguantaste las ${s.diff.waves} oleadas y la gran horda sin ceder la línea.` : `El carmesí se abrió paso en la oleada ${s.wave}.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : building(s) && html`<div class="bm-actions" role="group" aria-label="Pieza a colocar">
              ${Object.entries(PRICES).map(([t, cost]) => html`<button class=${'btn sm' + (pick === t ? ' on' : ' ghost')} aria-pressed=${pick === t} aria-label=${`${PIECE_NAMES[t]}: ${cost} moneda${cost === 1 ? '' : 's'}`}
                disabled=${cost > s.budget} title=${PIECE_NAMES[t]} onClick=${() => setPick(t)}><${PieceIcon} type=${t} side="light" size=${22} />${cost}</button>`)}
            </div>
            <button class="btn primary" disabled=${!s.pieces.length} onClick=${launch}>${s.phase === 'setup' ? 'Empezar el asalto' : last ? '¡Que venga la horda!' : 'Siguiente oleada'}</button>`}
          <${MiniTools} mini="laststand" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Compra piezas tocando las tres filas de abajo y empieza el asalto. El carmesí ataca en ${s.diff.waves} oleadas; la última es una gran horda. Entre oleadas cobras ${s.diff.bonus} monedas y puedes reforzar con lo que tengas: aguanta sin ceder la línea.<//>
        </div>
      </div>
    </div>
  </div>`;
}
