// Pantalla común de los minis por turnos de src/game/<id>.js (carrera, torre, festín, esquiva,
// escalada, alfil, dama). El juego expone DIFFS, create, tap, enemy?, pieces, marks, labels, status;
// tap/enemy devuelven { pre, post } con efectos del tablero, que aquí se reproducen en orden.
import { html, useState, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools, TurnClock } from '../components.js';
import { MiniBoard } from '../mini-board.js';
import { TIED_WEATHER } from '../../data/weather.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { playFx } from '../board-fx.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function TurnMini({ mini, G, help, sub, onBack, onEnd, endLabel, settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => G.create(diff || settings.miniDiff?.[mini]));
  const [board] = useState(() => s.board);
  const [, bump] = useState(0);
  const [busy, setBusy] = useState(false);
  const [turn, setTurn] = useState(0); // reinicia el reloj de los minis cronometrados (DIFFS.time)
  const view = useRef(null);
  const redraw = () => bump((n) => n + 1);

  const phase = async (ev) => {
    if (!ev) return;
    await playFx(view.current, ev.pre);
    redraw();
    await wait(view.current?.d(ev.ms ?? 520) ?? 0);
    await playFx(view.current, ev.post);
  };
  const tap = async (r, c) => {
    if (busy || s.over) return;
    const ev = G.tap(s, r, c);
    if (!ev) return redraw();
    setBusy(true);
    await phase(ev);
    if (!s.over && G.enemy) await phase(G.enemy(s));
    setBusy(false);
    setTurn((n) => n + 1);
  };
  // Se acabó el tiempo: el turno pasa sin mover y los enemigos avanzan.
  const timeout = async () => {
    if (busy || s.over || !G.enemy) return;
    setBusy(true);
    await playFx(view.current, [{ shake: 6 }]);
    await phase(G.enemy(s));
    setBusy(false);
    setTurn((n) => n + 1);
  };

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS[mini].name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} weather=${TIED_WEATHER[mini]} board=${board} pieces=${G.pieces(s)} marks=${G.marks(s)} labels=${G.labels?.(s)} disabled=${!!s.over || busy} label=${MODIFIERS[mini].name} onTap=${tap} onView=${(v) => { view.current = v; G.start && playFx(v, G.start(s)); }} />
        <div class="mini-side">
          ${!s.over && html`<${TurnClock} secs=${s.diff?.time} run=${turn} paused=${busy} onTimeout=${timeout} />`}
          ${!s.over && html`<p class="mini-status" aria-live="polite">${G.status(s)}</p>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.note} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini=${mini} diffs=${G.DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${help}<//>
        </div>
      </div>
    </div>
  </div>`;
}
