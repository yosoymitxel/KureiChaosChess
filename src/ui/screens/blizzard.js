// Ventisca: la torre resbala por el lago helado hasta un bloque o el borde (src/game/blizzard.js).
import { html, useState, useEffect } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { DIFFS, DIRS, newBlizzard, slide, move } from '../../game/blizzard.js';
import { MiniBoard } from '../mini-board.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { playSfx } from '../sfx.js';

const KEYS = { arrowup: 0, w: 0, arrowright: 1, d: 1, arrowdown: 2, s: 2, arrowleft: 3, a: 3 };

export function BlizzardScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBlizzard(diff || settings.miniDiff?.blizzard));
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: s.holes, terrain: new Map([...Array(s.n * s.n).keys()].map((i) => [`${Math.floor(i / s.n)},${i % s.n}`, 'ice'])), portals: new Map() }));
  const [, tick] = useState(0);

  const go = (dir) => {
    const res = move(s, dir);
    if (!res) return playSfx('invalid');
    playSfx(res.sunk ? 'splash' : 'whoosh');
    tick((n) => n + 1);
  };
  // Un toque en la fila o columna de la torre resbala hacia allí; si no, hacia el eje más cercano.
  const tap = (r, c) => {
    if (s.over) return;
    const dr = r - s.at[0], dc = c - s.at[1];
    if (!dr && !dc) return;
    go(Math.abs(dr) >= Math.abs(dc) ? (dr < 0 ? 0 : 2) : (dc > 0 ? 1 : 3));
  };
  useEffect(() => {
    const onKey = (e) => { const d = KEYS[e.key.toLowerCase()]; if (d != null && !e.target.closest?.('.overlay')) { e.preventDefault(); go(d); } };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const pieces = s.over === 'lose' && s.holes.has(s.at.join(',')) ? [] : [{ id: 'me', type: 'rook', color: 'light', row: s.at[0], col: s.at[1] }];
  const marks = new Map();
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) {
    const id = `${r},${c}`;
    if (!s.seen.has(id)) marks.set(id, 'veil');
    else if (s.blocks.has(id)) marks.set(id, 'block');
  }
  if (!s.over) DIRS.forEach((_, dir) => {
    const res = slide(s, s.at[0], s.at[1], dir);
    if (res.path.length) marks.set(`${res.row},${res.col}`, (marks.get(`${res.row},${res.col}`) || '') + (res.sunk ? ' cap' : ' mv'));
  });
  const labels = new Map([...s.coins.filter((x) => !s.got.has(x)).map((x) => [x, 'icon:coin']), [s.exit.join(','), 'icon:flag']]);
  const left = s.limit - s.moves;

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.blizzard.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${board} pieces=${pieces} marks=${[...marks]} labels=${labels} disabled=${!!s.over} label="Lago helado" onTap=${tap} />
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${s.got.size < s.coins.length ? 'Recoge las monedas: la torre resbala hasta chocar.' : '¡Todas! Ahora a la bandera.'}</p>`}
          ${!s.over && html`<div class="mini-stats"><span class="chip">Monedas ${s.got.size}/${s.coins.length}</span><span class="chip">Jugadas ${left}</span></div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Fuera en ${s.moves} jugadas (el mejor camino era de ${s.best}).` : s.holes.has(s.at.join(',')) ? 'La torre se hundió en un agujero del hielo.' : 'Se acabaron las jugadas.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="blizzard" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>La torre resbala por el hielo en línea recta hasta chocar con un bloque o con el borde; si pasa por un agujero, se hunde. Toca hacia dónde quieres que vaya (o usa las flechas): las casillas marcadas son donde paras. Las monedas se recogen al pasar por encima y, con todas, sales por la bandera. La ventisca solo deja ver los bloques cerca de la torre. Las jugadas están contadas.<//>
        </div>
      </div>
    </div>
  </div>`;
}
