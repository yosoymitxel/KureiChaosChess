// Carrera de barquitos y koi (solo desde el Jardín de Agua): se elige corredor y dificultad, y se
// maneja con el mismo mando del jardín. El agua es el estanque de siempre (src/view/pond.js).
import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd } from '../components.js';
import { Icon } from '../icons.js';
import { Pond } from '../../view/pond.js';
import { raceDecor } from '../../view/water-art.js';
import { Thumb } from '../water-thumb.js';
import { RcPad, RcButton, useRcKeys } from '../rc-pad.js';
import { playSfx } from '../sfx.js';
import { t } from '../../i18n/index.js';
import { BOATS, RACE_PRIZE, GARDENS } from '../../data/garden.js';
import { W, H, LAPS, DIFFS, TRACKS, NITRO, newRace, step, standing, nitro } from '../../game/boatrace.js';
import { loadWater } from '../../game/water.js';
import { addCoins } from '../../game/shop.js';


export function BoatRaceScreen({ onBack, mode = 'boats', shake = true }) {
  const [pick, setPick] = useState(null); // { kind, diff } al empezar
  const [diff, setDiff] = useState('normal');
  const koi = mode === 'koi', own = [...new Set(loadWater().boats)];
  const title = koi ? t('water.koiRace', 'Carrera de koi') : t('water.race', 'Carrera de barquitos');
  if (!pick) return html`<div class="screen mini zen-screen">
    <${Topbar} title=${title} sub=${GARDENS.agua.name} onBack=${onBack} />
    <div class="mini-body zen-body"><div class="panel br-pick">
      <p>${koi ? t('boatrace.koiHelp', 'Dos vueltas a un canal que cambia cada carrera, contra tres koi. Pasa las boyas en orden, esquiva las rocas y cuidado con las algas. Maneja con el mando o con las flechas.') : t('boatrace.help', 'Dos vueltas a un canal que cambia cada carrera, pasando por las boyas en orden, contra los otros tres barcos. Las rocas cortan el paso y las algas frenan. Maneja con el mando o con las flechas.')}</p>
      <h3>${t('boatrace.diff', 'Dificultad')}</h3>
      <div class="garden-switch">${Object.entries(DIFFS).map(([k, d]) => html`<button class=${'btn sm' + (diff === k ? ' on' : ' ghost')} onClick=${() => setDiff(k)}>${d.name} · +${RACE_PRIZE[k]}</button>`)}</div>
      ${koi ? html`<button class="btn primary" onClick=${() => setPick({ kind: 'koi', diff })}>${t('boatrace.start', 'Salir')}</button>` : !own.length ? html`<p>${t('boatrace.noBoat', 'Compra un barquito en la tienda del jardín para correr.')}</p>` : html`<h3>${t('boatrace.racer', 'Corredor')}</h3>
      <div class="zn-tools">${own.map((k) => html`<button class="zn-tool" title=${BOATS[k].desc} onClick=${() => setPick({ kind: k, diff })}><span class="zn-tool-ic wt-thumb"><${Thumb} boat=${k} /></span><span>${BOATS[k].name}</span></button>`)}</div>`}
    </div></div>
  </div>`;
  return html`<${Race} key=${pick.kind + pick.diff + (pick.n || 0)} ...${pick} title=${title} shake=${shake} onBack=${onBack} again=${() => setPick(null)} />`;
}

function Race({ kind, diff, title, onBack, again, shake }) {
  const [s] = useState(() => newRace(kind, diff));
  const [hud, setHud] = useState({ lap: 0, place: 4, count: 3, cd: 2, boost: 0 });
  const [over, setOver] = useState(null);
  const [zoom, setZoom] = useState(false);
  const zoomRef = useRef(false);
  zoomRef.current = zoom;
  const cvRef = useRef(null), rc = useRef(null);
  useRcKeys(rc, !over, null);
  // Nitro: espacio o el botón, con su cuenta atrás mientras se recarga.
  useEffect(() => {
    const key = (e) => { if (e.code === 'Space' || e.key === 'Shift') { e.preventDefault(); nitro(s); } };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, []);

  useEffect(() => {
    const fish = s.racers.filter((r) => r.fish);
    const tr = s.track, pond = new Pond(cvRef.current, { size: [W, H], inside: tr.inside, count: fish.length, len: 7, speed: 3, duckweed: 0 });
    pond.boats = s.racers.filter((r) => !r.fish);
    pond.school.fish.forEach((f, i) => { const r = fish[i]; f.ctl = true; f.pts = f.pts.map((_, k) => [r.x + k * f.seg, r.y]); f.kind = [3, 0, 4, 5][i]; }); // el tuyo, dorado
    pond.marks = tr.gates.map((b) => ({ x: b.x, y: b.y }));
    pond.decor = raceDecor(W, H, tr);
    pond.shakeOn = shake;
    let raf, last = performance.now(), acc = 0;
    const pixel = () => document.documentElement.dataset.art === 'pixel';
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (acc += dt; acc >= 1 / 120; acc -= 1 / 120) {
        const inp = rc.current, rot = pond.view?.rot || 0;
        step(s, 1 / 120, inp?.aim != null ? { ...inp, aim: inp.aim - rot } : inp);
        for (const e of s.events) {
          if (e.kind === 'count') playSfx('tap');
          else if (e.kind === 'go') playSfx('pop');
          else if (e.kind === 'lap') { playSfx('coin'); pond.ripple(e.x ?? s.racers[0].x, e.y ?? s.racers[0].y, 1.2); }
          // Golpes: cuanto más fuerte, más grave, más onda y más sacudida (solo los del jugador sacuden).
          else if (e.kind === 'bump') { const f = Math.min(1, e.power / 15); playSfx('hit', 1.1 - 0.4 * f); pond.ripple(e.x, e.y, 0.5 + 0.7 * f); if (e.me) pond.kick(0.4 + 1.2 * f); }
          else if (e.kind === 'shore') { const f = Math.min(1, e.power / 15); playSfx(f > 0.4 ? 'hit' : 'tap', 0.9 - 0.3 * f); pond.ripple(e.x, e.y, 0.4 + 0.7 * f); pond.kick(0.3 + 1.2 * f); }
          else if (e.kind === 'nitro') { if (!e.who) { playSfx('splash', 1.4); pond.kick(0.5); } pond.ripple(e.x, e.y, 1.6); }
          else if (e.kind === 'finish' && e.who === 0) playSfx('splash');
        }
      }
      fish.forEach((r, i) => { const f = pond.school.fish[i]; f.x = r.x; f.y = r.y; f.v = Math.hypot(r.vx, r.vy); f.h = r.h; f.boost = r.boost; f.sel = r === s.racers[0]; });
      const me = s.racers[0];
      pond.marks.forEach((m, i) => (m.on = i === me.next % tr.gates.length));
      me.sel = true;
      pond.follow(me, zoomRef.current, dt);
      if (!document.hidden) { pond.step(dt, now / 1000); pond.draw(now / 1000, pixel()); }
      setHud({ lap: Math.min(LAPS, me.lap + 1), place: s.over ? s.place : standing(s), count: Math.ceil(-s.t), cd: me.cd, boost: me.boost });
      if (s.over) { setOver(s.over); if (s.over === 'win') addCoins(RACE_PRIZE[diff]); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return html`<div class=${'screen mini zen-screen' + (zoom && !over ? ' wt-full' : '')}>
    <${Topbar} title=${title} sub=${BOATS[kind].name + ' · ' + DIFFS[diff].name} onBack=${onBack} />
    <div class="mini-body zen-body">
      <div class="mini-stats br-hud" aria-live="polite">
        <span class="chip">${TRACKS[s.track.type].name}</span>
        <span class="chip">${t('boatrace.lap', 'Vuelta {n}/{of}', { n: hud.lap, of: LAPS })}</span>
        <span class="chip">${t('boatrace.place', 'Puesto {n}º', { n: hud.place })}</span>
        <${RcButton} icon=${zoom ? 'shrink' : 'expand'} on=${zoom} cls="br-zoom" label=${zoom ? t('rc.zoomOut', 'Ver todo') : t('rc.zoomIn', 'Acercar')} onPress=${() => setZoom((z) => !z)} />
      </div>
      <div class="br-track">
        <canvas class="wt-cv" ref=${cvRef}></canvas>
        ${hud.count > 0 && html`<b class="br-count">${hud.count}</b>`}
      </div>
      ${!over && html`<div class="br-pad"><${RcPad} input=${rc} right=${html`<${RcButton} icon="meteor" label=${t('boatrace.nitro', 'Nitro')} onPress=${() => nitro(s)}
        cls=${'br-nitro' + (hud.boost ? ' boosting' : '') + (hud.cd > 0 ? ' zn-cool' : '')} style=${hud.cd > 0 ? { '--zn-rest': (hud.cd / NITRO.cooldown).toFixed(4) } : null} />`} /></div>`}
    </div>
    ${over && html`<${MiniEnd} win=${over === 'win'} note=${over === 'win' ? t('boatrace.won', 'Primero en la meta: +{n} monedas.', { n: RACE_PRIZE[diff] }) : t('boatrace.lost', 'Llegaste {n}º.', { n: s.place })}
      label=${t('boatrace.again', 'Otra carrera')} onEnd=${again} />`}
  </div>`;
}
