// Regresiones de lo que se rompió alguna vez: guardia, coronación, enroque con cartas, cartas lilas y
// cupos de mano, Coloso, vista previa de Escolta, ranuras y copias, y la maceta píxel estrecha.
// `node tools/regress-selfcheck.mjs` → una línea si todo va bien; la lista de fallos y código 1 si no.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

class MemoryStorage {
  values = new Map();
  get length() { return this.values.size; }
  key(i) { return [...this.values.keys()][i] ?? null; }
  getItem(k) { return this.values.get(String(k)) ?? null; }
  setItem(k, v) { this.values.set(String(k), String(v)); }
  removeItem(k) { this.values.delete(String(k)); }
  clear() { this.values.clear(); }
}
globalThis.localStorage = new MemoryStorage();

const { Match } = await import('../src/game/match.js');
const { makePiece } = await import('../src/game/generate.js');
const { legalMoves, key } = await import('../src/game/rules.js');
const { CARDS, playCard, cardTargets, previewMoves, handFull, HAND_LIMIT, LILAC_LIMIT } = await import('../src/game/cards.js');
const { addToHand } = await import('../src/game/shop.js');
const { exportSave, decodeSave, localSaveData, sameProgress, summarizeSave } = await import('../src/game/backup.js');
const { loadSlots, switchSlot, storeActive } = await import('../src/game/slots.js');

const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const board = (n = 8) => ({ rows: n, cols: n, holes: new Set(), terrain: new Map(), portals: new Map() });
const match = (pieces, b = board()) => new Match({ board: b, pieces, players: [{ color: 'light', kind: 'human' }, { color: 'dark', kind: 'bot' }] });
const cells = (p, pieces, b = board()) => new Set(legalMoves(p, pieces, b).map((m) => key(m.row, m.col)));

// Guardia: nunca la casilla de justo detrás; atrás en diagonal 1; delante en diagonal hasta 2.
{
  const g = makePiece('guard', 'light', 4, 4), k = makePiece('king', 'light', 7, 0), K = makePiece('king', 'dark', 0, 7);
  const c = cells(g, [g, k, K]);
  check(!c.has('5,4'), 'guardia: no puede ir justo atrás');
  check(c.has('5,3') && c.has('5,5'), 'guardia: atrás en diagonal 1');
  check(c.has('2,2') && c.has('2,6') && !c.has('6,2'), 'guardia: 2 en diagonal solo hacia delante');
}

// Coronación: peón en la última fila → reina siempre; guardia coronado gana atrás.
{
  const p = makePiece('pawn', 'light', 1, 0), k = makePiece('king', 'light', 7, 7), K = makePiece('king', 'dark', 0, 7);
  const m = match([p, k, K]);
  m.move(p, { row: 0, col: 0 });
  check(p.type === 'queen', 'coronación: el peón corona por defecto en la última fila');
  const g = makePiece('guard', 'light', 2, 4), g2 = makePiece('king', 'light', 7, 0), G = makePiece('king', 'dark', 0, 0);
  const m2 = match([g, g2, G]);
  check(cardTargets(m2, CARDS.ascend).includes(g), 'Ascenso: un guardia a 3 filas del final es objetivo');
  playCard(m2, 'ascend', { piece: g });
  check(g.promoted && cells(g, [g, g2, G]).has('3,4'), 'guardia coronado: puede ir justo atrás');
}

// Enroque: si una carta ya llevaba al rey a la casilla del enroque, gana el enroque.
{
  const k = makePiece('king', 'light', 7, 4, { royal: true, extraMoveTypes: ['knight', 'rook2'] }), r = makePiece('rook', 'light', 7, 7), K = makePiece('king', 'dark', 0, 4, { royal: true });
  const m = match([k, r, K]);
  const to = m.legal(k).filter((x) => x.row === 7 && x.col === 6);
  check(to.length === 1 && to[0].castle, 'enroque: una sola jugada a g1 y es el enroque');
}

// Cartas: lilas sin gastar la carta del turno; Coloso aguanta 2; Escolta no toca piezas al previsualizar.
{
  const rk = makePiece('rook', 'light', 7, 0), gd = makePiece('guard', 'light', 6, 0), k = makePiece('king', 'light', 7, 4, { royal: true }), K = makePiece('king', 'dark', 0, 4, { royal: true });
  const m = match([rk, gd, k, K]);
  previewMoves(m, CARDS.fuse, rk);
  check(m.pieces.includes(gd), 'Escolta: la vista previa no quita el guardia de verdad');
  check(!!playCard(m, 'disco', null) && !m.cardUsed, 'lila: no gasta la carta del turno');
  check(!!playCard(m, 'fuse', { piece: rk }) && !m.pieces.includes(gd) && rk.hp === 2, 'Escolta: une el guardia a la torre');
  const r2 = makePiece('rook', 'light', 3, 3), k2 = makePiece('king', 'light', 7, 4, { royal: true }), K2 = makePiece('king', 'dark', 0, 4, { royal: true });
  const m2 = match([r2, k2, K2]);
  check(!!playCard(m2, 'colossus', { piece: r2 }) && r2.hp === 2 && m2.cardUsed, 'Coloso: 2 golpes y gasta la carta');
}

// Cupos de mano: 5 normales + 3 lilas aparte.
{
  const normal = Array(HAND_LIMIT).fill('haste'), lil = Array(LILAC_LIMIT).fill('disco');
  check(handFull(normal, 'fortify') && !handFull(normal, 'disco'), 'mano: la lila no ocupa sitio de normal');
  check(handFull([...normal, ...lil], 'skies'), 'mano: máximo 3 lilas');
  const r = addToHand({ cards: [...normal, ...lil] }, ['fortify', 'skies']);
  check(r.cards.filter((c) => CARDS[c].lilac).length === LILAC_LIMIT && r.cards.filter((c) => !CARDS[c].lilac).length === HAND_LIMIT, 'mano: cada cupo expulsa la suya');
}

// Ranuras y copias: cambiar guarda la actual, la vacía empieza de cero, volver la recupera; comparar progresos.
{
  localStorage.clear();
  localStorage.setItem('zugzwang.run.v2', JSON.stringify({ currentFloor: 2, map: { floors: 9 }, mutations: ['fury'] }));
  localStorage.setItem('zugzwang.settings.v2', JSON.stringify({ theme: 'walnut' }));
  storeActive();
  check(switchSlot(1) && !localStorage.getItem('zugzwang.run.v2'), 'ranura vacía: sin run');
  check(localStorage.getItem('zugzwang.settings.v2'), 'ranuras: los ajustes no se tocan');
  check(switchSlot(0) && JSON.parse(localStorage.getItem('zugzwang.run.v2')).currentFloor === 2, 'ranura 1: vuelve la run');
  check(loadSlots().active === 0, 'ranuras: activa la 1');
  const code = await exportSave(), data = await decodeSave(code);
  check(data && sameProgress(localSaveData(), data), 'copia: decodificar da el mismo progreso');
  check(summarizeSave(data).floor === 3 && summarizeSave(data).mutations === 1, 'copia: resumen de la run');
  check(!sameProgress(localSaveData(), { ...data, 'zugzwang.run.v2': '{}' }), 'copia: detecta progreso distinto');
  check(sameProgress(localSaveData(), { ...data, 'zugzwang.settings.v2': '{"theme":"x"}' }), 'copia: los ajustes no cuentan como diferencia');
}

// Maceta píxel: estrecha (la regeneraron ancha una vez). Se mide la tinta del PNG.
{
  const png = readFileSync(new URL('../assets/zen/pot.png', import.meta.url));
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  let idat = [], o = 8;
  while (o < png.length) { const len = png.readUInt32BE(o), type = png.toString('ascii', o + 4, o + 8); if (type === 'IDAT') idat.push(png.subarray(o + 8, o + 8 + len)); o += 12 + len; }
  const raw = inflateSync(Buffer.concat(idat)), stride = w * 4 + 1;
  // Fila de la base (y = 18): solo se miran los alfas; con filtro 0 o sub basta contar bytes no nulos del canal alfa.
  let minX = w, maxX = -1;
  for (let y = 0; y < h; y++) {
    const f = raw[y * stride];
    if (f !== 0) continue;
    for (let x = 0; x < w; x++) if (raw[y * stride + 1 + x * 4 + 3]) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
  }
  check(maxX < 0 || maxX - minX + 1 <= 20, `maceta píxel: demasiado ancha (${maxX - minX + 1} px)`);
}

if (fails.length) { console.log('Regresiones:\n' + fails.join('\n')); process.exit(1); }
console.log('Regresiones OK: guardia, coronación, enroque, cartas, manos, ranuras, copias y maceta');
