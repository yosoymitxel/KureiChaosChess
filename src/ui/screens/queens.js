import { html, useState, useEffect } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { MiniBoard } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { DIFFS, newQueens, toggle, clashing } from '../../game/queens.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { playSfx } from '../sfx.js';
import { award } from '../../game/achievements.js';

export function QueensScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newQueens(diff || settings.miniDiff?.queens));
  const [time, setTime] = useState(() => s.seconds);
  const [, redraw] = useState(0);
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: new Set() }));
  const tap = (r, c) => {
    if (!toggle(s, r, c)) return playSfx('invalid');
    if (s.over === 'win' && time >= 60) award('queens_fast');
    redraw((n) => n + 1);
  };

  useEffect(() => {
    const id = setInterval(() => setTime((t) => {
      if (s.over) { clearInterval(id); return t; }
      if (t <= 1) { s.over = 'lose'; clearInterval(id); return 0; }
      if (t <= 11) playSfx('tick');
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []);

  const pieces = s.queens.map((q) => ({ id: key(q.r, q.c), type: 'queen', color: 'light', row: q.r, col: q.c }));
  const marks = new Map(clashing(s).map((q) => [key(q.r, q.c), 'cap danger']));
  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.queens.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${board} pieces=${pieces} marks=${marks} disabled=${!!s.over} label=${t('queens.board', 'Tablero de {n} reinas', { n: s.n })} onTap=${tap} />
        <div class="mini-side">
          ${!s.over && html`<div class="mini-stats" aria-live="polite">
            <span class="chip" aria-label=${t('queens.placed', 'Reinas colocadas: {n} de {total}', { n: s.queens.length, total: s.n })}><span class="dots">${Array.from({ length: s.n }, (_, i) => html`<i class=${i < s.queens.length ? '' : 'off'} />`)}</span></span>
            <span class=${'chip' + (time <= 30 ? ' danger' : '')} aria-label=${t('queens.time', 'Quedan {n} segundos', { n: time })}><b>${time}</b> s</span>
          </div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('queens.won', '{n} reinas conviviendo sin atacarse.', { n: s.n }) : t('queens.lost', 'Se acabó el tiempo con {n} de {total} reinas.', { n: s.queens.length, total: s.n })} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="queens" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('queens.help', 'Toca casillas para colocar reinas: ninguna puede compartir fila, columna ni diagonal, y las que chocan se marcan en rojo. Completa las {n} antes de que se acabe el tiempo.', { n: s.n })}<//>
        </div>
      </div>
    </div>
  </div>`;
}
