// Damas: marfil (tú) contra carmesí (bot) con fichas de damas de verdad. Toca una ficha y luego su destino;
// las capturas son obligatorias y la misma ficha sigue saltando mientras pueda.
import { html, useState, useEffect, useRef } from '../lib.js';
import { Topbar, MiniEnd, MiniTools } from '../components.js';
import { DIFFS, newCheckers, legal, play, botMove, pieceAt } from '../../game/checkers.js';
import { MiniBoard } from '../mini-board.js';
import { key } from '../../game/rules.js';
import { MODIFIERS } from '../../data/modifiers.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// `duo` (partida local): { names: [marfil, carmesí] }; se turnan en la misma pantalla.
export function CheckersScreen({ sub, onBack, onEnd, endLabel = 'Continuar', settings, setSettings, onRestart, diff, duo }) {
  const [s] = useState(() => newCheckers(diff || settings.miniDiff?.checkers));
  const [sel, setSel] = useState(null);
  const [, tick] = useState(0);
  const busy = useRef(false);
  const [board] = useState(() => ({ rows: s.n, cols: s.n, holes: new Set() }));
  const redraw = () => tick((n) => n + 1);

  const step = async (m) => {
    play(s, m);
    setSel(s.chain && (duo || s.turn === 'light') ? s.chain : null);
    redraw();
    await wait(m.cap ? 900 : 500);
  };

  // El bot juega su jugada entera, salto a salto, con una pausa entre cada uno.
  const botTurn = async () => {
    while (!s.over && s.turn === 'dark') {
      await wait(200);
      const m = botMove(s);
      if (!m) break;
      await step(m);
    }
  };

  const tap = async (r, c) => {
    if (busy.current || s.over || (!duo && s.turn !== 'light')) return;
    const p = pieceAt(s, r, c);
    const moves = legal(s);
    if (p && p.side === s.turn && !s.chain) return setSel(moves.some((m) => m.p === p) ? p : null);
    const m = sel && moves.find((x) => x.p === sel && x.to.r === r && x.to.c === c);
    if (!m) return;
    busy.current = true;
    await step(m);
    if (!duo && s.turn === 'dark') await botTurn();
    busy.current = false;
    redraw();
  };

  useEffect(() => { if (!duo && s.turn === 'dark') botTurn(); }, []);

  const moves = (duo || s.turn === 'light') && !s.over ? legal(s) : [];
  const movable = new Set(moves.map((m) => m.p));
  const targets = sel ? moves.filter((m) => m.p === sel) : [];
  const pieces = s.pieces.map((p) => ({ id: p.id, type: p.king ? 'queen' : 'pawn', disc: true, crown: p.king, color: p.side, row: p.r, col: p.c }));
  const marks = new Map(sel ? [[key(sel.r, sel.c), 'foot'], ...targets.map((m) => [key(m.to.r, m.to.c), m.cap ? 'cap' : 'mv'])] : [...movable].map((p) => [key(p.r, p.c), 'target']));
  const mustJump = moves.some((m) => m.cap);
  const left = { light: s.pieces.filter((p) => p.side === 'light').length, dark: s.pieces.filter((p) => p.side === 'dark').length };
  const name = (w) => duo?.names[w === 'light' ? 0 : 1];
  const status = duo ? `Turno de ${name(s.turn)}${s.chain ? ': sigue saltando' : moves.some((m) => m.cap) ? ': hay captura obligatoria' : ''}` : s.turn === 'dark' ? 'Piensa el bot…' : s.chain ? '¡Sigue saltando con la misma ficha!' : mustJump ? 'Hay captura: es obligatoria.' : 'Tu turno: toca una ficha y luego su destino.';

  return html`<div class="screen mini">
    <${Topbar} title=${MODIFIERS.checkers.name} sub=${sub} onBack=${onBack} />
    <div class="mini-body side-body">
      <div class="mini-main">
        <${MiniBoard} board=${board} pieces=${pieces} marks=${marks} disabled=${!!s.over} label="Tablero de damas" onTap=${tap} />
        <div class="mini-side">
          ${!s.over && html`<p class="mini-status" aria-live="polite">${status}</p>`}
          ${!s.over && html`<div class="mini-stats"><span class="chip">${duo ? duo.names[0] : 'Tuyas'} ${left.light}</span><span class="chip">${duo ? duo.names[1] : 'Rivales'} ${left.dark}</span></div>`}
          ${s.over && html`<${MiniEnd} win=${s.over === 'win'} note=${duo ? `Gana ${name(s.over === 'win' ? 'light' : 'dark')}: el otro se quedó sin jugadas.` : s.over === 'win' ? 'El rival se quedó sin jugadas.' : 'Te quedaste sin jugadas.'} label=${endLabel} onEnd=${() => onEnd(s.over === 'win')} />`}
          ${duo ? html`<p class="mini-help">Por turnos en la misma pantalla: ${duo.names[0]} marfil, ${duo.names[1]} carmesí. Captura obligatoria; la ficha que llega al fondo se corona.</p>` : html`<${MiniTools} mini="checkers" diffs=${DIFFS} fixed=${diff} settings=${settings} setSettings=${setSettings} onRestart=${onRestart}>Las fichas avanzan en diagonal por las casillas oscuras. Si puedes saltar una ficha rival que tienes al lado, es obligatorio, y si al caer puedes saltar otra, sigues. Al llegar a la última fila la ficha se corona y ya puede ir también hacia atrás. Gana quien deje al otro sin jugadas. Fácil 6×6, Normal 8×8 y Difícil 10×10.<//>`}
        </div>
      </div>
    </div>
  </div>`;
}
