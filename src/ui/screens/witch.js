// La bruja: laberinto a lo Pac-Man (src/game/witch.js). Un toque en una casilla vecina mueve al rey.
import { html, useState, useEffect } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { DIFFS, newWitch, step, kingMoves } from '../../game/witch.js';
import { MiniBoard } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { playSfx } from '../sfx.js';
import { award } from '../../game/achievements.js';
import { t } from '../../i18n/index.js';

const KEYS = { arrowup: [-1, 0], w: [-1, 0], arrowdown: [1, 0], s: [1, 0], arrowleft: [0, -1], a: [0, -1], arrowright: [0, 1], d: [0, 1] };
const SFX = { coin: 'coin', potion: 'flower', eat: 'crunch', caught: 'hit' };

export function WitchScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newWitch(diff || settings.miniDiff?.witch));
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: s.walls }));
  const [, tick] = useState(0);

  const go = (r, c) => {
    const ev = step(s, r, c);
    if (!ev) return;
    const loud = ev.find((e) => e.kind !== 'coin') || ev[0];
    if (loud) playSfx(SFX[loud.kind]);
    if (ev.some((e) => e.kind === 'eat')) award('witch_eat');
    tick((n) => n + 1);
  };
  const tap = (r, c) => {
    if (s.over) return;
    const dr = Math.sign(r - s.king.row), dc = Math.sign(c - s.king.col);
    if (dr || dc) go(s.king.row + dr, s.king.col + dc);
  };
  useEffect(() => {
    const onKey = (e) => { const d = KEYS[e.key.toLowerCase()]; if (d && !e.target.closest?.('.overlay')) { e.preventDefault(); go(s.king.row + d[0], s.king.col + d[1]); } };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const pieces = [
    ...(s.over === 'lose' ? [] : [{ id: 'king', type: 'king', color: 'light', row: s.king.row, col: s.king.col }]),
    ...s.witches.filter((w) => w.out <= 0).map((w) => ({ id: w.id, type: 'queen', color: s.scared ? 'wild' : 'dark', row: w.row, col: w.col })),
  ];
  const marks = s.over ? [] : kingMoves(s).map(([r, c]) => [key(r, c), 'mv']);
  const labels = new Map([...[...s.coins].map((x) => [x, 'icon:coin']), ...[...s.potions].map((x) => [x, 'icon:flask'])]);
  const status = s.scared ? t('witch.scared', '¡Están asustadas! Atrápalas: {n} turnos.', { n: s.scared }) : t('witch.status', 'Recoge todas las monedas; las pócimas asustan a las brujas.');

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.witch.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${board} pieces=${pieces} marks=${marks} labels=${labels} disabled=${!!s.over} label=${t('witch.board', 'Laberinto de la bruja')} onTap=${tap} />
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${!s.over && html`<div class="mini-stats"><span class="chip">${t('witch.coins', 'Monedas {n}/{total}', { n: s.diff.coins - s.coins.size, total: s.diff.coins })}</span><span class="chip">${t('witch.witches', 'Brujas {n}', { n: s.witches.length })}</span></div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('witch.won', 'Todas las monedas en {n} turnos.', { n: s.turn }) : t('witch.lost', 'Una bruja atrapó a tu rey.')} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="witch" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('witch.help', 'Tu rey da un paso por turno (toca una casilla vecina o usa las flechas) y recoge las monedas que pisa. Las brujas avanzan un paso recto por turno y te cazan si te alcanzan. Las pócimas las asustan unos turnos: huyen, cambian de color y puedes atraparlas (vuelven a su casa al rato). Recoge todas las monedas.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
