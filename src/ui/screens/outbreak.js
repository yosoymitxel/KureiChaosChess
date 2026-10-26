// Brote: dosis que contagian en cadena (src/game/outbreak.js). Un toque enseña hasta dónde llegaría
// la cadena; el segundo toque en la misma pieza gasta la dosis.
import { html, useState, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { DIFFS, newOutbreak, chain, dose } from '../../game/outbreak.js';
import { MiniBoard } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { MODIFIERS } from '../../data/modifiers.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function OutbreakScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newOutbreak(diff || settings.miniDiff?.outbreak));
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: new Set() }));
  const [sel, setSel] = useState(null);
  const [shown, setShown] = useState(() => new Set()); // contagiadas ya pintadas
  const [busy, setBusy] = useState(false);
  const view = useRef(null);

  const tap = async (r, c) => {
    if (busy || s.over) return;
    const p = s.pieces.find((x) => x.row === r && x.col === c && !x.sick);
    if (!p) return setSel(null);
    if (sel !== p) return setSel(p);
    setSel(null); setBusy(true);
    const waves = dose(s, p), seen = new Set(shown);
    for (const w of waves) {
      for (const x of w) seen.add(x.id);
      setShown(new Set(seen));
      await wait(30);
      const v = view.current, ids = new Set(w.map((x) => x.id));
      await v?.infect([...v.els.keys()].filter((q) => ids.has(q.id)));
      await wait(220);
    }
    setBusy(false);
  };

  const pieces = s.pieces.map((p) => ({ id: p.id, type: p.type, color: shown.has(p.id) ? 'light' : 'dark', infected: shown.has(p.id), row: p.row, col: p.col }));
  const marks = new Map();
  if (sel) for (const [i, w] of chain(s, sel).entries()) for (const x of w) marks.set(key(x.row, x.col), i ? 'gain' : 'foot');
  const left = s.pieces.filter((p) => !p.sick).length;

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.outbreak.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${board} pieces=${pieces} marks=${[...marks]} disabled=${!!s.over || busy} label="Tablero del brote" onTap=${tap} onView=${(v) => (view.current = v)} />
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${sel ? `Esta dosis contagiaría ${[...marks.keys()].length}. Toca otra vez para usarla.` : 'Toca una pieza carmesí para ver hasta dónde llega el contagio.'}</p>`}
          ${!s.over && html`<div class="mini-stats"><span class="chip">Dosis ${s.doses - s.used}</span><span class="chip">Sanas ${left}</span></div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? `Brote completo con ${s.used} dosis.` : `Quedaron ${left} piezas sanas.`} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="outbreak" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Tienes unas pocas dosis. La pieza que contagias contagia a su vez a todas las que ataca según cómo se mueve (la torre en línea recta, el caballo en L, el alfil en diagonal; el peón contagiado ataca en diagonal hacia arriba), y la cadena sigue. Un toque enseña hasta dónde llegaría; otro toque en la misma pieza gasta la dosis. Contagia a todas.<//>
        </div>
      </div>
    </div>
  </div>`;
}
