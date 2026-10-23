// Damas: marfil (tú) contra carmesí (bot) con fichas de damas de verdad. Toca una ficha y luego su destino;
// las capturas son obligatorias y la misma ficha sigue saltando mientras pueda.
import { html, useState, useEffect, useRef, motion } from '../lib.js';
import { playSfx } from '../sfx.js';
import { Topbar, MiniResult, MiniTools } from '../components.js';
import { DIFFS, newCheckers, legal, play, botMove, pieceAt } from '../../game/checkers.js';
import { reduced } from '../hop.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function CheckersScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff }) {
  const [s] = useState(() => newCheckers(diff || settings.miniDiff?.checkers));
  const [sel, setSel] = useState(null);
  const [, tick] = useState(0);
  const busy = useRef(false);
  const gridRef = useRef(null);
  const redraw = () => tick((n) => n + 1);

  // Tras repintar, la ficha salta en arco de su casilla a la nueva; la capturada se hunde y se apaga.
  const animateLast = async () => {
    const m = s.last, grid = gridRef.current;
    if (!m || !grid || reduced()) return;
    const cells = grid.children, at = (r, c) => cells[r * s.n + c];
    const tok = at(m.to.r, m.to.c)?.querySelector('.ck-tok');
    const cw = at(0, 0).offsetWidth;
    if (m.cap) {
      const g = document.createElement('i');
      g.className = 'ck-tok ghost ' + (m.cap.side === 'light' ? 'tk-light' : 'tk-dark') + (m.cap.king ? ' king' : '');
      at(m.cap.r, m.cap.c).appendChild(g);
      motion(g, { scale: [1, 1.15, 0.6], opacity: [1, 1, 0], y: [0, -6, 8] }, { duration: 0.42, delay: 0.16, ease: 'easeIn', onComplete: () => g.remove() });
    }
    if (tok) {
      const dx = (m.from.c - m.to.c) * cw, dy = (m.from.r - m.to.r) * cw;
      await motion(tok, { x: [dx, dx / 2, 0], y: [dy, dy / 2 - cw * 0.5, 0] }, { duration: m.cap ? 0.34 : 0.26, ease: 'easeInOut' });
      motion(tok, { scaleY: [0.8, 1.06, 1], scaleX: [1.12, 0.96, 1] }, { duration: 0.24, ease: [0.16, 1, 0.3, 1] });
      if (m.crowned) motion(tok, { rotateY: [0, 360] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
    }
  };

  const step = async (m) => {
    play(s, m);
    setSel(s.chain && s.turn === 'light' ? s.chain : null);
    redraw();
    await wait(0);
    await animateLast();
    playSfx(m.cap ? 'capture' : 'move');
  };

  // El bot juega su jugada entera, salto a salto, con una pausa entre cada uno.
  const botTurn = async () => {
    while (!s.over && s.turn === 'dark') {
      await wait(360);
      const m = botMove(s);
      if (!m) break;
      await step(m);
    }
  };

  const tap = async (r, c) => {
    if (busy.current || s.over || s.turn !== 'light') return;
    const p = pieceAt(s, r, c);
    const moves = legal(s);
    if (p && p.side === 'light' && !s.chain) return setSel(moves.some((m) => m.p === p) ? p : null);
    const m = sel && moves.find((x) => x.p === sel && x.to.r === r && x.to.c === c);
    if (!m) return;
    busy.current = true;
    await step(m);
    if (s.turn === 'dark') await botTurn();
    busy.current = false;
    redraw();
  };

  useEffect(() => { if (s.turn === 'dark') botTurn(); }, []);

  const moves = s.turn === 'light' && !s.over ? legal(s) : [];
  const movable = new Set(moves.map((m) => m.p));
  const targets = sel ? moves.filter((m) => m.p === sel) : [];
  const mustJump = moves.some((m) => m.cap);
  const left = { light: s.pieces.filter((p) => p.side === 'light').length, dark: s.pieces.filter((p) => p.side === 'dark').length };
  const status = s.turn === 'dark' ? 'Piensa el bot…' : s.chain ? '¡Sigue saltando con la misma ficha!' : mustJump ? 'Hay captura: es obligatoria.' : 'Tu turno: toca una ficha y luego su destino.';

  return html`<div class="screen mini">
    <${Topbar} title="Damas" sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <div class="mini-stage">
          <div class="bm bm-slab ck" ref=${gridRef} style=${{ '--cols': s.n, '--rows': s.n }} role="grid" aria-label="Tablero de damas">
            ${Array.from({ length: s.n * s.n }, (_, i) => {
              const r = Math.floor(i / s.n), c = i % s.n, p = pieceAt(s, r, c);
              const tgt = targets.find((m) => m.to.r === r && m.to.c === c);
              const cls = 'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (sel === p && p ? ' sel' : '') + (tgt ? ' mv' + (tgt.cap ? ' jump' : '') : '') + (p && movable.has(p) && !sel ? ' can' : '');
              return html`<button class=${cls} disabled=${!!s.over} aria-label=${`Fila ${r + 1}, columna ${c + 1}` + (p ? `, ficha ${p.side === 'light' ? 'tuya' : 'rival'}${p.king ? ' coronada' : ''}` : '')} onClick=${() => tap(r, c)}>
                ${p && html`<i class=${'ck-tok ' + (p.side === 'light' ? 'tk-light' : 'tk-dark') + (p.king ? ' king' : '')}></i>`}
              </button>`;
            })}
          </div>
        </div>
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${!s.over && html`<div class="mini-stats"><span class="chip">Tuyas ${left.light}</span><span class="chip">Rivales ${left.dark}</span></div>`}
          ${s.over && html`<${MiniResult} win=${s.over === 'win'} note=${s.over === 'win' ? 'El rival se quedó sin jugadas.' : 'Te quedaste sin jugadas.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          <${MiniTools} mini="checkers" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Las fichas avanzan en diagonal por las casillas oscuras. Si puedes saltar una ficha rival que tienes al lado, es obligatorio, y si al caer puedes saltar otra, sigues. Al llegar a la última fila la ficha se corona y ya puede ir también hacia atrás. Gana quien deje al otro sin jugadas. Fácil 6×6, Normal 8×8 y Difícil 10×10.<//>
        </div>
      </div>
    </div>
  </div>`;
}
