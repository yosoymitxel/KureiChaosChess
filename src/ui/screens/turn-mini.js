// Pantalla común de los minis por turnos de src/game/<id>.js (carrera, torre, festín, esquiva,
// escalada, alfil, dama). El juego expone DIFFS, create, tap, enemy?, pieces, marks, labels, status;
// tap/enemy devuelven { pre, post } con efectos del tablero, que aquí se reproducen en orden.
import { html, useState, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { MiniBoard } from '../mini-board.js';
import { TIED_WEATHER } from '../../data/weather.js';
import { MODIFIERS } from '../../data/modifiers.js';
import { key } from '../../game/rules.js';
import { playSfx } from '../sfx.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Un efecto por objeto: { doom | blast | sink | fire: casillas } · { beam: [desde, hasta], color } ·
// { float: [r, c, texto] } · { ring | sparkle | shield: [r, c] } · { hurt | power: id(s) } · { shake } · { sfx } · { wait }.
export async function playFx(v, list = []) {
  for (const e of list) {
    if (!v) return;
    const pt = (r, c) => { const t = v.tiles.get(key(r, c)); return t ? v.fx.pointOf(t) : null; };
    const byId = (id) => [...v.els.keys()].find((p) => p.id === id);
    if (e.sfx) playSfx(e.sfx);
    if (e.doom) v.setDoom(e.doom, false);
    if (e.blast) await v.blast(e.blast);
    if (e.sink) await v.collapse(e.sink);
    if (e.fire) for (const [r, c] of e.fire) { const p = pt(r, c); if (p) v.fx.fire(p.x - v.sq * 0.4, p.y - v.sq * 0.9, v.sq * 0.8, v.sq, 1.2); }
    if (e.beam) { const a = pt(...e.beam[0]), b = pt(...e.beam[1]); if (a && b) { playSfx('laser'); v.fx.beam(a.x, a.y - v.sq * 0.3, b.x, b.y - v.sq * 0.3, { color: e.color || '#c58bff' }); } }
    if (e.float) { const p = pt(e.float[0], e.float[1]); if (p) v.floatText(p.x, p.y - v.sq * 0.7, e.float[2]); }
    if (e.ring) { const p = pt(...e.ring); if (p) { v.fx.ring(p.x, p.y, { radius: v.sq * (e.size || 1.4), width: 4, color: e.color || '#fff' }); v.fx.dust(p.x, p.y, 1); } }
    if (e.sparkle) { const p = pt(...e.sparkle); if (p) v.fx.sparkle(p.x, p.y - v.sq * 0.3, e.color || '#ffcf6b', 12); }
    if (e.shield) { const p = pt(...e.shield); if (p) v.fx.shield(p.x, p.y - v.sq * 0.4, v.sq * 0.6, { broken: !!e.broken }); }
    if (e.hurt) { const p = byId(e.hurt); if (p) v.hurt(p); }
    if (e.power) v.powerUp([].concat(e.power).map(byId).filter(Boolean), e.color || '#ffcf6b');
    if (e.shake) v.shake(e.shake, 360);
    if (e.wait) await wait(v.d(e.wait));
  }
}

export function TurnMini({ mini, G, help, sub, onBack, onEnd, endLabel, settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => G.create(diff || settings.miniDiff?.[mini]));
  const [board] = useState(() => s.board);
  const [, bump] = useState(0);
  const [busy, setBusy] = useState(false);
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
  };

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS[mini].name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} weather=${TIED_WEATHER[mini]} board=${board} pieces=${G.pieces(s)} marks=${G.marks(s)} labels=${G.labels?.(s)} disabled=${!!s.over || busy} label=${MODIFIERS[mini].name} onTap=${tap} onView=${(v) => { view.current = v; G.start && playFx(v, G.start(s)); }} />
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${G.status(s)}</p>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.note} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini=${mini} diffs=${G.DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>${help}<//>
        </div>
      </div>
    </div>
  </div>`;
}
