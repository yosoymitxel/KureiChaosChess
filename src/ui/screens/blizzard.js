// Ventisca: la torre resbala por el lago helado hasta un bloque o el borde (src/game/blizzard.js).
import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { DIFFS, DIRS, newBlizzard, slide, move } from '../../game/blizzard.js';
import { MiniBoard } from '../mini-board.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { playSfx } from '../sfx.js';
import { award } from '../../game/achievements.js';
import { t } from '../../i18n/index.js';

const KEYS = { arrowup: 0, w: 0, arrowright: 1, d: 1, arrowdown: 2, s: 2, arrowleft: 3, a: 3 };

export function BlizzardScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBlizzard(diff || settings.miniDiff?.blizzard));
  // Los agujeros son casillas de agua (no huecos del tablero): se leen como hielo roto y asoman entre la niebla.
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: new Set(), terrain: new Map([...Array(s.n * s.n).keys()].map((i) => { const id = `${Math.floor(i / s.n)},${i % s.n}`; return [id, s.holes.has(id) ? 'icehole' : 'ice']; })), portals: new Map() }));
  const [, tick] = useState(0);

  const go = (dir) => {
    const res = move(s, dir);
    if (!res) return playSfx('invalid');
    playSfx(res.sunk ? 'splash' : 'whoosh');
    if (s.over === 'win' && s.moves <= s.best) award('blizzard_best');
    tick((n) => n + 1);
  };
  // Deslizar el dedo sobre el lago empuja la torre hacia ese lado, como en Fusión.
  const touch = useRef(null);
  // Un toque en la fila o columna de la torre resbala hacia allí; si no, hacia el eje más cercano.
  const tap = (r, c) => {
    if (s.over) return;
    // Con el dedo abajo se espera a soltarlo: puede ser el inicio de un deslizamiento.
    if (touch.current) { touch.current.cell = [r, c]; return; }
    const dr = r - s.at[0], dc = c - s.at[1];
    if (!dr && !dc) return;
    go(Math.abs(dr) >= Math.abs(dc) ? (dr < 0 ? 0 : 2) : (dc > 0 ? 1 : 3));
  };
  // El soltar se escucha en la ventana: el dedo puede acabar fuera del tablero.
  const onDown = (e) => { touch.current = { x: e.clientX, y: e.clientY }; addEventListener('pointerup', onUp, { once: true }); };
  const onUp = (e) => {
    const t0 = touch.current; touch.current = null;
    if (!t0 || s.over) return;
    const dx = e.clientX - t0.x, dy = e.clientY - t0.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return t0.cell && tap(...t0.cell);
    go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0);
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
    if (res.path.length) marks.set(`${res.row},${res.col}`, (marks.get(`${res.row},${res.col}`) || '') + (res.sunk ? ' danger cap' : ' mv'));
  });
  const labels = new Map([...s.coins.filter((x) => !s.got.has(x)).map((x) => [x, 'icon:coin']), [s.exit.join(','), 'icon:flag']]);
  const left = s.limit - s.moves;

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.blizzard.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div style="display: contents" onPointerDownCapture=${onDown}>
        <${MiniBoard} board=${board} pieces=${pieces} marks=${[...marks]} labels=${labels} disabled=${!!s.over} label=${t('blizzard.board', 'Lago helado')} onTap=${tap} />
        </div>
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${s.got.size < s.coins.length ? t('blizzard.status', 'Recoge las monedas: la torre resbala hasta chocar.') : t('blizzard.allCoins', '¡Todas! Ahora a la bandera.')}</p>`}
          ${!s.over && html`<div class="mini-stats"><span class="chip">${t('witch.coins', 'Monedas {n}/{total}', { n: s.got.size, total: s.coins.length })}</span><span class="chip">${t('blizzard.moves', 'Jugadas {n}', { n: left })}</span></div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('blizzard.won', 'Fuera en {n} jugadas (el mejor camino era de {best}).', { n: s.moves, best: s.best }) : s.holes.has(s.at.join(',')) ? t('blizzard.sunk', 'La torre se hundió en un agujero del hielo.') : t('blizzard.outOfMoves', 'Se acabaron las jugadas.')} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="blizzard" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('blizzard.help', 'La torre resbala por el hielo en línea recta hasta chocar con un bloque o con el borde; si pasa por un agujero, se hunde. Desliza o toca hacia dónde quieres que vaya (o usa las flechas): las casillas marcadas son donde paras. Las monedas se recogen al pasar por encima y, con todas, sales por la bandera. La ventisca solo deja ver los bloques cerca de la torre. Las jugadas están contadas.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
