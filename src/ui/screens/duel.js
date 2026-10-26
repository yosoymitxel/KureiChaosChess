// Duelo: arena de combate por turnos. Tu pieza abajo a la izquierda, la rival arriba a la derecha,
// cada una con su barra de vida; los ataques embisten, el golpe destella y el daño salta en número.
import { html, useState, useRef, motion } from '../lib.js';
import { playSfx } from '../sfx.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { PieceIcon } from '../icons.js';
import { PIECE_NAMES } from '../../data/pieces.js';
import { DIFFS, MOVES, FIGHTERS, TYPE_NAME, newDuel, turn, active, effect } from '../../game/duel.js';
import { reduced } from '../hop.js';
import { MODIFIERS } from '../../data/modifiers.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = [0.16, 1, 0.3, 1];

function Plate({ u, team, foe }) {
  return html`<div class=${'du-plate' + (foe ? ' foe' : '')}>
    <div class="du-name"><b>${PIECE_NAMES[u.type]}</b><span class=${'du-type t-' + FIGHTERS[u.type].type}>${TYPE_NAME[FIGHTERS[u.type].type]}</span></div>
    <div class="du-hp" role="meter" aria-label=${`Vida ${u.hp} de ${u.max}`} aria-valuenow=${u.hp} aria-valuemin="0" aria-valuemax=${u.max}>
      <i class=${u.hp / u.max < 0.3 ? 'low' : u.hp / u.max < 0.6 ? 'mid' : ''} style=${{ width: (100 * u.hp) / u.max + '%' }}></i>
    </div>
    <div class="du-row"><span class="du-num">${u.hp}/${u.max}</span>${u.guard && html`<span class="du-tag">Guardia</span>`}${u.boost && html`<span class="du-tag">Cargado</span>`}
      <span class="du-bench">${team.map((t) => html`<i class=${t.hp > 0 ? '' : 'out'}></i>`)}</span></div>
  </div>`;
}

export function DuelScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newDuel(diff || settings.miniDiff?.duel));
  const [, tick] = useState(0);
  const [line, setLine] = useState('¿Qué hará tu pieza?');
  const busy = useRef(false);
  const arena = useRef(null);
  const redraw = () => tick((n) => n + 1);

  const fig = (side) => arena.current?.querySelector(side === 'light' ? '.du-me .du-fig' : '.du-foe .du-fig');
  const float = (side, text, cls) => {
    const host = arena.current?.querySelector(side === 'light' ? '.du-me' : '.du-foe');
    if (!host) return;
    const t = document.createElement('span');
    t.className = 'du-float ' + cls;
    t.textContent = text;
    host.appendChild(t);
    motion(t, { y: [0, -46], opacity: [1, 1, 0], scale: [0.9, 1.15, 1] }, { duration: 0.8, ease: 'easeOut', onComplete: () => t.remove() });
  };

  // Cuenta y anima cada evento del turno en orden: embestida, destello, número y frase.
  const show = async (ev) => {
    const still = reduced();
    if (ev.swap) {
      setLine(`¡Entra ${PIECE_NAMES[ev.to].toLowerCase()}!`);
      redraw(); await wait(30);
      playSfx('pop');
      const f = fig(ev.swap);
      if (f && !still) await motion(f, { y: [-60, 0], scale: [0.8, 1], opacity: [0, 1] }, { duration: 0.42, ease: OUT });
      return;
    }
    const m = MOVES[ev.move], who = ev.by === 'light' ? 'Tu pieza' : 'El rival';
    const a = fig(ev.by), d = fig(ev.by === 'light' ? 'dark' : 'light');
    const dir = ev.by === 'light' ? 1 : -1;
    setLine(`${who} usa ${m.name}.`);
    playSfx(m.power ? 'whoosh' : 'select');
    if (m.power && a && !still) await motion(a, { x: [0, 26 * dir, 0], y: [0, -18 * dir, 0] }, { duration: 0.32, ease: 'easeInOut' });
    else if (a && !still) await motion(a, { scale: [1, 1.12, 1] }, { duration: 0.3, ease: OUT });
    redraw();
    const target = ev.by === 'light' ? 'dark' : 'light';
    if (ev.miss) { playSfx('invalid'); float(target, 'Falla', 'miss'); setLine(`${who} usa ${m.name}… y falla.`); await wait(500); return; }
    if (ev.heal) { playSfx('flower'); float(ev.by, '+' + ev.heal, 'heal'); await wait(450); return; }
    if (!m.power) { playSfx(m.guard ? 'hit' : 'promote'); float(ev.by, m.guard ? 'Guardia' : 'Cargado', 'buff'); await wait(450); return; }
    playSfx(ev.eff > 1 ? 'capture' : ev.guarded ? 'hit' : 'land');
    if (d && !still) { d.classList.add('flash'); motion(d, { x: [0, 10 * dir, -6 * dir, 0] }, { duration: 0.3 }); setTimeout(() => d.classList.remove('flash'), 140); }
    float(target, '−' + ev.dmg, ev.eff > 1 ? 'crit' : 'dmg');
    if (ev.recoil) float(ev.by, '−' + ev.recoil, 'dmg');
    setLine(ev.eff > 1 ? '¡Es muy eficaz!' : ev.eff < 1 ? 'No es muy eficaz…' : ev.guarded ? 'La guardia amortigua el golpe.' : `${who} acierta.`);
    await wait(520);
    if (ev.ko) playSfx('crunch');
    if (ev.ko && d && !still) await motion(d, { y: [0, 30], rotate: [0, 20 * dir], opacity: [1, 0] }, { duration: 0.45, ease: 'easeIn' });
  };

  const use = async (id) => {
    if (busy.current || s.over) return;
    busy.current = true;
    for (const ev of turn(s, id)) await show(ev);
    if (!s.over) setLine('¿Qué hará tu pieza?');
    busy.current = false;
    redraw();
  };

  const me = active(s.mine) || s.mine[s.mine.length - 1], foe = active(s.foes) || s.foes[s.foes.length - 1];
  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.duel.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="du" ref=${arena}>
            <div class="du-foe"><${Plate} u=${foe} team=${s.foes} foe /><div class="du-fig" key=${'f' + foe.type + s.foes.indexOf(foe)}><span class="du-pad"></span><${PieceIcon} type=${foe.type} side="dark" size=${120} /></div></div>
            <div class="du-me"><div class="du-fig" key=${'m' + me.type + s.mine.indexOf(me)}><span class="du-pad"></span><${PieceIcon} type=${me.type} side="light" size=${130} /></div><${Plate} u=${me} team=${s.mine} /></div>
            <p class="du-line" aria-live="polite">${line}</p>
          </div>
        </div>
        <div class="mini-side">
          ${s.over ? html`<${MiniEnd} win=${s.over === 'win'} note=${s.over === 'win' ? 'Las tres piezas rivales cayeron.' : 'Cayó tu última pieza.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`
            : html`<div class="du-moves" role="group" aria-label="Ataques">
              ${FIGHTERS[me.type].moves.map((id) => {
                const m = MOVES[id], e = m.power ? effect(m, foe) : 1;
                const used = m.heal && !me.heals;
                return html`<button class=${'du-move t-' + m.type} disabled=${used} onClick=${() => use(id)}>
                  <b>${m.name}</b>
                  <small>${m.power ? `Poder ${m.power} · ${Math.round(m.acc * 100)} %${e > 1 ? ' · eficaz' : e < 1 ? ' · poco eficaz' : ''}` : m.desc}${m.heal ? ` (${me.heals} usos)` : ''}${m.pierce || m.recoil ? ' · ' + m.desc : ''}</small>
                </button>`;
              })}
            </div>`}
          <${MiniTools} mini="duel" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Tres piezas por bando; elige un ataque y el rival responde. El tipo sale de cómo se mueve la pieza: Línea gana a Salto, Salto a Diagonal y Diagonal a Línea (golpe y medio); al revés, el golpe se queda en dos tercios. Guardia parte la próxima herida, Cargado sube el próximo golpe, y las curas valen dos veces por pieza.<//>
        </div>
      </div>
    </div>
  </div>`;
}
