// Damas a ciegas: pones tus damas donde quieras y eliges hacia dónde dispara cada una; las rivales
// salen al azar al pulsar Fuego y todas disparan a la vez (src/game/blind.js).
import { html, useState, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { DIFFS, newBlind, place, fire, ray } from '../../game/blind.js';
import { MiniBoard } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { playSfx } from '../sfx.js';
import { t } from '../../i18n/index.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const asPiece = (q) => ({ id: q.id, type: 'queen', color: q.foe ? 'dark' : 'light', row: q.row, col: q.col });

export function BlindScreen({ sub, onBack, onEnd, endLabel = t('common.continue', 'Continuar'), settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newBlind(diff || settings.miniDiff?.blind));
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: new Set() }));
  const [sel, setSel] = useState(null);
  const [shown, setShown] = useState(null); // rivales a la vista durante la descarga
  const [hidden, setHidden] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const view = useRef(null);

  const tap = (r, c) => {
    if (busy || s.over) return;
    if (shown) { setHidden(new Set(shown.map((f) => f.id))); setShown(null); }
    setSel(place(s, r, c, sel));
    playSfx('select');
    tick((n) => n + 1);
  };

  const shoot = async () => {
    setBusy(true); setSel(null);
    const res = fire(s);
    setHidden(new Set((shown || []).map((f) => f.id)));
    setShown(res.foes);
    playSfx('land');
    await wait(900);
    const v = view.current, at = (q) => v.centerOf({ row: q.row, col: q.col });
    for (const shot of res.shots) {
      const a = at(shot.from), b = at(shot.to);
      v.fx.beam(a.x, a.y - v.sq * 0.35, b.x, b.y - v.sq * 0.3, { color: css(shot.from.foe ? '--danger' : '--brass') });
    }
    playSfx('laser');
    await wait(450);
    const dead = new Set(res.dead.map((q) => q.id));
    setShown(res.foes.filter((f) => !dead.has(f.id)));
    if (dead.size) playSfx('crunch');
    tick((n) => n + 1);
    await wait(900);
    setBusy(false);
  };

  const pieces = [...s.mine, ...(shown || [])].map(asPiece);
  const all = [...s.mine, ...(shown || [])];
  const marks = new Map();
  if (!busy) for (const q of s.mine) for (const [r, c] of ray(s, q, s.mine)) marks.set(key(r, c), q === sel ? 'mv hot' : 'mv');
  if (sel) marks.set(key(sel.row, sel.col), 'foot');
  if (shown && !busy) for (const f of shown) for (const [r, c] of ray(s, f, all)) if (!marks.has(key(r, c))) marks.set(key(r, c), 'cap');
  const ready = s.mine.length === (s.volley ? s.mine.length : s.diff.mine);
  const status = s.over ? '' : !ready ? t('blind.place', 'Pon tus damas: toca casillas libres ({n} de {total}).', { n: s.mine.length, total: s.diff.mine })
    : t('blind.aim', 'Toca una dama para girar su disparo; toca otra casilla para moverla. Luego, ¡Fuego!');

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.blind.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${board} pieces=${pieces} marks=${marks} hidden=${hidden} disabled=${!!s.over || busy} label=${t('blind.board', 'Tablero de damas a ciegas')} onTap=${tap} onView=${(v) => (view.current = v)} />
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${!s.over && html`<div class="mini-stats">
            <span class="chip">${t('blind.mine', 'Tus damas {n}', { n: s.mine.length })}</span>
            <span class="chip">${t('blind.foes', 'Rivales {n}', { n: s.foes })}</span>
            <span class="chip">${t('blind.volley', 'Descarga {n}/{total}', { n: Math.min(s.volley + 1, s.diff.volleys), total: s.diff.volleys })}</span>
          </div>`}
          ${!s.over && html`<div class="bm-controls"><button class="btn primary" disabled=${!ready || busy} onClick=${shoot}><${Icon} name="target" size=${16} />${t('blind.fire', '¡Fuego!')}</button></div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? (s.foes ? t('blind.wonLeft', 'Te quedan {n} contra {foes}.', { n: s.mine.length, foes: s.foes }) : t('blind.wonAll', 'No queda ninguna rival.')) : s.mine.length ? t('blind.lostLeft', 'Quedan {foes} rivales contra tus {n}.', { foes: s.foes, n: s.mine.length }) : t('blind.lostAll', 'Cayeron todas tus damas.')} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="blind" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${t('blind.help', 'Pon tus damas en cualquier casilla y elige hacia dónde dispara cada una (toca una dama para girarla; la línea marcada es su disparo). Las rivales no se ven: al pulsar Fuego aparecen al azar y todas disparan a la vez. Cada disparo para en la primera pieza que cruza: si es rival la derriba, si es tuya se queda ahí. Después de cada descarga las rivales vuelven a esconderse y puedes recolocar las tuyas. Gana quien deje al otro sin damas; si se acaban las descargas, quien tenga más.')}<//>
        </div>
      </div>
    </div>
  </div>`;
}
