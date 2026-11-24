// Antídoto (src/game/outbreak.js): vacunas con forma de pieza que curan en cadena. Un toque en una casilla
// vacía enseña a quién cura de entrada la vacuna de turno; el segundo toque en la misma casilla la pone.
import { html, useState, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { DIFFS, newOutbreak, preview, vaccinate, undo, giveUp, next, occupied } from '../../game/outbreak.js';
import { TIED_WEATHER } from '../../data/weather.js';
import { MiniBoard } from '../mini-board.js';
import { key, legalMoves } from '../../game/rules.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { t } from '../../i18n/index.js';
import { playSfx } from '../sfx.js';
import { award } from '../../game/achievements.js';
import { reduced } from '../hop.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function OutbreakScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newOutbreak(diff || settings.miniDiff?.outbreak));
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: new Set() }));
  const [sel, setSelState] = useState(null); // casilla elegida para la vacuna de turno
  // También en una ref: dos toques rápidos llegan antes del repintado y el segundo no ponía la vacuna.
  const selRef = useRef(null);
  const setSel = (p) => { selRef.current = p; setSelState(p); };
  const [cured, setCured] = useState(() => new Set()); // curadas ya pintadas (la cadena se pinta por oleadas)
  const [hidden, setHidden] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [, redraw] = useState(0);
  const view = useRef(null);

  // La cadena se ve oleada a oleada: cada curada destella, rebota y suena un poco más aguda que la anterior.
  const heal = async (waves) => {
    const seen = new Set(cured), v = view.current;
    for (const [i, w] of waves.entries()) {
      for (const x of w) seen.add(x.id);
      setCured(new Set(seen));
      await wait(30);
      playSfx('flower', Math.min(1.8, 1 + i * 0.15));
      const ids = new Set(w.map((x) => x.id));
      for (const p of [...(v?.els.keys() || [])].filter((q) => ids.has(q.id))) {
        v.squash(p, 0.75);
        if (!reduced()) { const c = v.centerOf(p); v.fx.sparkle(c.x, c.y - v.sq * 0.3, css('--side-light')); }
      }
      if (i && w.length && v) { const c = v.centerOf(w[0]); v.floatText(c.x, c.y - v.sq * 0.9, '×' + (i + 1)); }
      await wait(240);
    }
  };

  const tap = async (r, c) => {
    if (busy || s.over || s.stuck) return;
    if (occupied(s, r, c)) { playSfx('invalid'); return setSel(null); }
    const at = selRef.current;
    if (!at || at.r !== r || at.c !== c) { playSfx('select'); return setSel({ r, c }); }
    setSel(null); setBusy(true);
    const waves = vaccinate(s, r, c);
    setCured((x) => new Set([...x, s.pieces[s.pieces.length - 1].id]));
    await wait(view.current?.d(480) ?? 0); // la vacuna cae en su casilla
    if (waves.length) await heal(waves);
    else playSfx('invalid');
    setBusy(false);
    if (s.over === 'win' && s.diff === DIFFS.dificil && !s.undone) award('outbreak_one');
  };

  const back = () => {
    if (busy) return;
    const u = undo(s);
    if (!u) return playSfx('invalid');
    setSel(null);
    setHidden(new Set([u.dose.id]));
    const relapse = new Set([u.dose.id, ...u.cured.map((p) => p.id)]);
    setCured((x) => new Set([...x].filter((id) => !relapse.has(id))));
    playSfx('zombie');
  };
  const quit = () => { giveUp(s); redraw((n) => n + 1); };

  const pieces = s.pieces.map((p) => ({ id: p.id, type: p.type, color: cured.has(p.id) ? 'light' : 'dark', zombie: !cured.has(p.id), row: p.row, col: p.col }));
  const marks = new Map();
  let first = 0;
  if (sel && !busy) {
    const type = next(s), probe = { id: '?', type, color: 'light', row: sel.r, col: sel.c };
    // La forma de la vacuna: a dónde llega desde ahí (el peón, solo donde cura).
    if (type !== 'pawn') for (const m of legalMoves(probe, [...s.pieces.map((p) => ({ ...p, color: p.sick ? 'dark' : 'light' })), probe], board)) if (!m.hits.length) marks.set(key(m.row, m.col), 'mv');
    const w = preview(s, sel.r, sel.c)[0] || [];
    first = w.length;
    for (const x of w) marks.set(key(x.row, x.col), 'cap');
    marks.set(key(sel.r, sel.c), 'foot');
  }
  const left = s.pieces.filter((p) => p.sick).length, queue = s.queue.slice(s.used);
  const status = s.stuck ? t('outbreak.stuck', 'Sin vacunas y quedan {n} infectadas: deshaz la última o ríndete.', { n: left })
    : sel ? (first ? t('outbreak.preview', 'Desde aquí cura de entrada a {n}; desde ellas, la cadena sigue. Toca otra vez para ponerla.', { n: first }) : t('outbreak.previewNone', 'Desde aquí no cura a nadie de su forma. Toca otra vez si aun así la quieres ahí.'))
      : t('outbreak.status', 'Toca una casilla vacía para ver a quién cura la vacuna de {piece}.', { piece: PIECE_NAMES[next(s)]?.toLowerCase() });

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.outbreak.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} weather=${TIED_WEATHER.outbreak} board=${board} pieces=${pieces} marks=${[...marks]} hidden=${hidden} disabled=${!!s.over || busy} label=${t('outbreak.board', 'Tablero del antídoto')} onTap=${tap} onView=${(v) => (view.current = v)} />
        <div class="mini-side">
          ${!s.over && html`<div class="fu-goal"><span>${t('outbreak.queue', 'Vacunas')}</span>
            <ol class="fu-ladder" aria-label=${t('outbreak.queueAria', 'Cola de vacunas: primero la de turno')}>${queue.map((type, i) => html`<li class=${i ? '' : 'on'} title=${PIECE_NAMES[type]}><${PieceIcon} type=${type} side="light" size=${i ? 26 : 34} /></li>`)}</ol></div>`}
          ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${!s.over && html`<div class="mini-stats"><span class="chip">${t('outbreak.sick', 'Infectadas {n}', { n: left })}</span></div>`}
          ${!s.over && html`<div class="bm-actions">
            <button class="btn sm ghost" data-pad="y" disabled=${busy || !s.history.length || !s.undos} onClick=${back}>${t('outbreak.undo', 'Deshacer ({n})', { n: s.undos })}</button>
            ${s.stuck && html`<button class="btn sm" data-pad="x" onClick=${quit}>${t('outbreak.giveUp', 'Rendirse')}</button>`}
          </div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? t('outbreak.won', 'Curaste a todas con {n} vacunas.', { n: s.used }) : t('outbreak.lost', 'Quedaron {n} piezas infectadas.', { n: left })} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="outbreak" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('outbreak.help', 'Como en Dr. Mario, pero con piezas: las piezas zombis del tablero están infectadas y tienes una cola de vacunas, cada una con forma de pieza. Toca una casilla vacía para ver a quién curaría la vacuna de turno y vuelve a tocarla para ponerla. La vacuna solo cura a las infectadas de su misma forma que ataca desde ahí (la torre en línea recta, el caballo en L, el alfil en diagonal, el peón en diagonal hacia delante). Cada curada cura a su vez a todas las que ataca, sea cual sea su forma, y la cadena sigue. Vacunas y curadas se quedan en el tablero y tapan líneas. Cura a todas antes de que se acabe la cola; puedes deshacer la última vacuna unas pocas veces.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
