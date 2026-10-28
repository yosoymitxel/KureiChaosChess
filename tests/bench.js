// Banco de pruebas de la partida: monta GameScreen con lo que diga `?cfg=` (JSON) para probar a mano
// o desde tools/play.mjs. Todo es opcional:
//   theme, lang ('es'|'en'), settings {vfx, speed, moments…}, seats [{color, kind, name}],
//   node {modifier, isBoss, isMiniBoss, floor, floors, seed}, run {mutations, cards, bonuses},
//   board {rows, cols, holes: [[r, c]]} y pieces ['rook light 6 0', {type, color, row, col, …extra}]
//   (con piezas propias la partida arranca ya repartida, en esa posición exacta).
// `window.bench` queda con el estado del director (match, view, busy…) para leerlo o manipularlo.
const cfg = JSON.parse(new URLSearchParams(location.search).get('cfg') || '{}');
// El idioma se lee al cargar i18n: se fija antes de importar nada del juego.
if (cfg.lang) {
  const s = JSON.parse(localStorage.getItem('zugzwang.settings.v2') || '{}');
  localStorage.setItem('zugzwang.settings.v2', JSON.stringify({ ...s, lang: cfg.lang }));
}
const [{ html, render, useState }, { applyTheme }, { GameScreen }, { Match, freezeMatch }, { makePiece }, { key }, { DEFAULT_SETTINGS }, { STARTER_CARDS }, { startGamepad }, { t }] = await Promise.all([
  import('../src/ui/lib.js'), import('../src/data/themes.js'), import('../src/ui/screens/game.js'), import('../src/game/match.js'),
  import('../src/game/generate.js'), import('../src/game/rules.js'), import('../src/game/run.js'), import('../src/game/cards.js'),
  import('../src/ui/gamepad.js'), import('../src/i18n/index.js'),
]);
startGamepad();

const node = { id: 'bench', seed: 20261021, floor: 3, modifier: 'none', isBoss: false, isMiniBoss: false, ...cfg.node };
const run = { seed: node.seed, tutorial: false, map: { floors: cfg.node?.floors || 10 }, mutations: [], bonuses: {}, cards: [...STARTER_CARDS], completed: {}, ...cfg.run };
const seats = cfg.seats || [{ color: 'light', kind: 'human', name: t('seat.you', 'Tú') }, { color: 'dark', kind: 'bot', name: 'Bot' }];
const settings = { ...DEFAULT_SETTINGS, sound: false, music: false, moments: false, helpSeen: {}, ...cfg.settings, theme: cfg.theme || 'walnut' };
applyTheme(settings.theme);

let resume = null;
if (cfg.pieces) {
  const b = cfg.board || { rows: 8, cols: 8 };
  const board = { rows: b.rows, cols: b.cols, holes: new Set((b.holes || []).map(([r, c]) => key(r, c))), protectRows: 0 };
  const pieces = cfg.pieces.map((p) => {
    if (typeof p !== 'string') { const { type, color, row, col, ...extra } = p; return makePiece(type, color, row, col, extra); }
    const [type, color, row, col] = p.split(/\s+/);
    return makePiece(type, color, +row, +col);
  });
  resume = freezeMatch(new Match({ board, pieces, players: seats, modifier: node.modifier, mutations: run.mutations, bonuses: run.bonuses }), []);
}

const noop = () => {};
function Bench() {
  const [set, setSet] = useState(settings);
  const [r, setRun] = useState(run);
  return html`<${GameScreen} node=${node} run=${r} seats=${seats} settings=${set} setSettings=${setSet} resume=${resume}
    onExit=${noop} onMenu=${noop} onAbandon=${noop} onWin=${noop} onRestart=${() => location.reload()} onHowTo=${noop}
    onUseCard=${(i) => setRun((x) => ({ ...x, cards: x.cards.filter((_, j) => j !== i) }))}
    onDebug=${(d) => { window.bench = d; }} />`;
}
render(html`<${Bench} />`, document.getElementById('root'));
