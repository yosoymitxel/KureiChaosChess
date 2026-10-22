import { html, useState, useEffect, useLayoutEffect, useRef, motion } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { Icon } from '../icons.js';
import { MiniGrid } from './mini-grid.js';
import { hopPiece, captureHop, fallPiece, reduced } from '../hop.js';
import { playSfx } from '../sfx.js';
import { Fx } from '../../view/fx.js';
import { pieceSVG } from '../../view/piece-art.js';
import { SIZE, DIFFS, newGiantHunt, legal, move, threatCells, chargePath, enraged } from '../../game/giant-hunt.js';

const MOVE_NAMES = { king: 'un paso', rook: 'en línea', rook2: '1 o 2 en línea', advisor: 'en diagonal', knight: 'en L' };
const pcAt = (grid, { row, col }) => grid?.children[row * SIZE + col]?.querySelector('.bm-pc');

// El jefe no cabe en una casilla: va en su propia capa, del tamaño real de su huella.
function GiantBody({ g, bodyRef, dead }) {
  return html`<div class=${'giant-body side-dark' + (dead ? ' dead' : '')} ref=${bodyRef} aria-hidden="true"
    style=${{ '--r': g.row, '--c': g.col, '--w': g.w, '--h': g.h }}>
    <span class="giant-base"></span>
    <span class="giant-art" dangerouslySetInnerHTML=${{ __html: pieceSVG(g.type) }}></span>
    <span class="pc-hp">${Array.from({ length: g.max }, (_, i) => html`<b class=${i < g.hp ? 'on' : ''} />`)}</span>
  </div>`;
}

export function GiantHuntScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newGiantHunt(diff || settings.miniDiff?.giantHunt));
  const [, redraw] = useState(0);
  const gridRef = useRef(null);
  const bodyRef = useRef(null);
  const fxRef = useRef(null);
  const seen = useRef(null);
  const lastGiant = useRef(null);
  const targets = legal(s);
  const giant = s.pieces.find((p) => p.id === 'giant');
  lastGiant.current = giant ? { ...giant, max: s.hp } : lastGiant.current && { ...lastGiant.current, hp: 0 };
  const boss = s.boss;

  useEffect(() => {
    fxRef.current = new Fx(gridRef.current);
    return () => fxRef.current.destroy();
  }, []);

  const events = s.events;
  useLayoutEffect(() => {
    if (!events.length || seen.current === events) return;
    seen.current = events;
    const grid = gridRef.current, body = bodyRef.current, fx = fxRef.current;
    if (!grid || reduced()) return;
    const cw = grid.querySelector('.bm-cell').offsetWidth;
    const shake = (a) => settings.shake !== false && motion(grid, { x: [0, -a, a * 0.8, -a * 0.5, a * 0.3, 0], y: [0, a * 0.4, -a * 0.6, a * 0.3, 0] }, { duration: 0.36, ease: 'easeOut' });
    const thud = (big) => {
      if (!body || !fx) return;
      const p = fx.pointOf(body, 0.85);
      playSfx('stomp');
      fx.dust(p.x, p.y, big ? 2.4 : 1.6);
      fx.ring(p.x, p.y, { radius: cw * (big ? 2.2 : 1.5), width: 4 });
      shake(big ? 12 : 6);
      motion(body, { scaleY: [0.82, 1.06, 1], scaleX: [1.12, 0.97, 1] }, { duration: 0.32, ease: [0.16, 1, 0.3, 1] });
    };
    // Paso o embestida del jefe: su capa parte de donde estaba y cae con todo su peso. Con dos
    // pasos (furia) los desplazamientos se miden contra la casilla final, donde ya está pintado.
    const steps = events.filter((ev) => ev.type.startsWith('boss-'));
    const end = steps.length && steps[steps.length - 1].to;
    const off = (p) => [(p.col - end.col) * cw, (p.row - end.row) * cw];
    if (body && end && steps[0].type !== 'boss-stagger') body.style.transform = `translate(${off(steps[0].from).join('px, ')}px)`;
    let delay = events[0].type === 'hunter-hit' ? 700 : 420;
    for (const ev of steps) {
      if (!body) break;
      if (ev.type === 'boss-stagger') { setTimeout(() => motion(body, { rotate: [0, -4, 4, -2, 0] }, { duration: 0.4 }), delay); continue; }
      const [fx0, fy0] = off(ev.from), [fx1, fy1] = off(ev.to);
      const charge = ev.type === 'boss-charge', dur = charge ? 0.32 : 0.46;
      const lift = charge ? cw * 0.15 : cw * 0.6;
      setTimeout(() => motion(body, { x: [fx0, (fx0 + fx1) / 2, fx1], y: [fy0, (fy0 + fy1) / 2 - lift, fy1] }, { duration: dur, ease: charge ? 'easeIn' : 'easeInOut' }), delay);
      setTimeout(() => {
        thud(charge);
        if (ev.hit) { const h = events[0]; fallPiece(grid, { ...(h.type === 'hunter-hit' ? h.from : h.to), type: 'queen', side: 'light', cols: SIZE }); }
      }, delay + dur * 1000);
      delay += dur * 1000 + 260;
    }
    for (const ev of events) {
      if (ev.type === 'hunter-move') hopPiece(grid, pcAt(grid, ev.to), { from: ev.from, to: ev.to, side: 'light', cols: SIZE, rows: SIZE });
      else if (ev.type === 'hunter-hit') {
        const el = pcAt(grid, ev.bounce ? ev.from : ev.to);
        const onHit = () => {
          playSfx('capture');
          if (!body || !fx) return;
          const p = fx.pointOf(body, 0.55);
          fx.burst(p.x, p.y, { count: 22, color: ['#fff6d8', '#ffb347', '#ffffff'], speed: [90, 260], life: [0.25, 0.6], size: [2, 5] });
          body.classList.remove('struck');
          void body.offsetWidth;
          body.classList.add('struck');
          shake(5);
          if (!ev.bounce) {
            fx.bigBoom(p.x, p.y, { scale: ev.hp <= 0 ? 1.4 : 1 });
            fx.debris(p.x, p.y, '#3a2a22', 1.6);
          }
        };
        if (ev.bounce) captureHop(grid, el, { from: ev.from, to: ev.to, side: 'light', cols: SIZE, rows: SIZE, onHit });
        else { hopPiece(grid, el, { from: ev.from, to: ev.to, side: 'light', cols: SIZE, rows: SIZE }); setTimeout(onHit, 380); }
      }
    }
  });

  const tap = (r, c) => {
    if (s.over || !targets.some((m) => m.row === r && m.col === c)) return;
    if (move(s, r, c)) redraw((n) => n + 1);
  };
  const hunter = s.pieces.find((p) => p.id === 'hunter');
  const threat = threatCells(s);
  // Al marcar un golpe se ve por dónde embestiría el jefe en respuesta.
  const charge = new Set();
  if (hunter && giant && !s.over) {
    for (const p of chargePath(s, hunter)) for (let i = 0; i < giant.h; i++) for (let j = 0; j < giant.w; j++) charge.add((p.row + i) + ',' + (p.col + j));
  }
  const cell = (r, c) => {
    const p = s.pieces.find((x) => x.row === r && x.col === c && x.id !== 'giant');
    const k = r + ',' + c;
    const valid = targets.some((m) => m.row === r && m.col === c);
    const hitTarget = valid && targets.some((m) => m.row === r && m.col === c && m.hits.some((x) => x.id === 'giant'));
    return {
      cls: [valid && 'mv', hitTarget && 'giant-target', threat.has(k) && !hitTarget && 'danger', charge.has(k) && 'giant-lane', s.board.holes.has(k) && 'hole rubble'].filter(Boolean).join(' '),
      piece: p && { type: p.type, side: p.color },
    };
  };
  const g = lastGiant.current;
  return html`<div class=${'screen mini giant-hunt' + (enraged(s) ? ' enraged' : '')}><${Topbar} title="Caza de gigantes" sub=${sub} onBack=${onBack}/><div class="mini-body">
    <div class="mini-stats" aria-live="polite">
      <span class="chip"><${Icon} name="boss" size=${12}/> ${boss.name}: ${giant?.hp ?? 0}/${s.hp}</span>
      <span class="chip">Turnos: ${s.turns}</span>
      ${enraged(s) && html`<span class="chip danger">¡Furia! Da dos pasos</span>`}
    </div>
    <${MiniGrid} rows=${SIZE} cols=${SIZE} cell=${cell} disabled=${!!s.over} label="Caza de gigantes" gridRef=${gridRef} boardClass="bm-slab" onTap=${tap}>
      ${g && html`<${GiantBody} g=${g} bodyRef=${bodyRef} dead=${!giant} />`}
    <//>
    <p class="giant-hint">${giant ? `${boss.name} ocupa ${giant.h}×${giant.w} y se mueve ${boss.moves.map((m) => MOVE_NAMES[m] || m).join(' o ')}. Rojo: donde te aplasta. Rayado: por dónde embiste si le pegas desde ahí.` : 'El jefe cayó.'}</p>
    <${MiniTools} mini="giantHunt" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Cada partida sortea jefe, escombros y posiciones. Golpea con la reina entrando en su cuerpo: le quitas una vida y rebotas, pero el jefe embiste en línea hacia ti; los escombros frenan la embestida. Si no le pegas, da un paso para aplastarte, y en Normal y Difícil, a media vida, entra en furia y da dos. Derríbalo antes de agotar los turnos.<//>
    ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? boss.name + ' cayó en ' + s.round + ' turnos.' : s.turns <= 0 && hunter ? 'Se agotaron los turnos: el gigante sigue en pie.' : 'El gigante te alcanzó y te aplastó.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')}/>`}
  </div></div>`;
}
