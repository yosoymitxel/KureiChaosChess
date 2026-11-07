// Regresiones de lo que se rompió alguna vez: guardia, coronación, enroque con cartas, cartas lilas y
// cupos de mano, Coloso, vista previa de Escolta, ranuras y copias, y la maceta píxel estrecha.
// `node tools/regress-selfcheck.mjs` → una línea si todo va bien; la lista de fallos y código 1 si no.
import { readFileSync } from 'node:fs';
import { decodePNG } from './png.mjs';

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
const { exportSave, decodeSave, localSaveData, sameProgress, summarizeSave, importSave } = await import('../src/game/backup.js');
const { loadSlots, switchSlot} = await import('../src/game/slots.js');

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
  localStorage.setItem('kurei.cloud.synced', '2026-01-01T00:00:00Z');
  check(switchSlot(1) && !localStorage.getItem('zugzwang.run.v2'), 'ranura vacía: sin run');
  check(localStorage.getItem('zugzwang.settings.v2'), 'ranuras: los ajustes no se tocan');
  check(!localStorage.getItem('kurei.cloud.synced'), 'ranuras: cambiar olvida la sincronía (la nube no sube sola otro progreso)');
  check(switchSlot(0) && JSON.parse(localStorage.getItem('zugzwang.run.v2')).currentFloor === 2, 'ranura 1: vuelve la run');
  check(loadSlots().active === 0, 'ranuras: activa la 1');
  const code = await exportSave(), data = await decodeSave(code);
  check(data && sameProgress(localSaveData(), data), 'copia: decodificar da el mismo progreso');
  check(summarizeSave(data).floor === 3 && summarizeSave(data).mutations === 1, 'copia: resumen de la run');
  check(!sameProgress(localSaveData(), { ...data, 'zugzwang.run.v2': '{}' }), 'copia: detecta progreso distinto');
  check(sameProgress(localSaveData(), { ...data, 'zugzwang.settings.v2': '{"theme":"x"}' }), 'copia: los ajustes no cuentan como diferencia');
  // Restaurar sustituye el progreso entero (sin mezclar) y deja los ajustes del aparato.
  localStorage.removeItem('zugzwang.run.v2');
  localStorage.setItem('zugzwang.shop.v1', JSON.stringify({ coins: 7 }));
  const noRun = await exportSave();
  localStorage.setItem('zugzwang.run.v2', JSON.stringify({ currentFloor: 4, map: { floors: 9 }, mutations: [] }));
  localStorage.setItem('zugzwang.settings.v2', JSON.stringify({ theme: 'pixelada' }));
  check(await importSave(noRun) && !localStorage.getItem('zugzwang.run.v2'), 'copia: restaurar quita la run que no trae');
  check(JSON.parse(localStorage.getItem('zugzwang.settings.v2')).theme === 'pixelada', 'copia: restaurar no cambia los ajustes del aparato');
}

// Maceta píxel: estrecha (la regeneraron ancha una vez). Se mide la tinta del PNG.
{
  const { w, h, px } = decodePNG(readFileSync(new URL('../assets/zen/pot.png', import.meta.url)));
  let minX = w, maxX = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3]) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
  check(maxX < 0 || maxX - minX + 1 <= 20, `maceta píxel: demasiado ancha (${maxX - minX + 1} px)`);
}

// Clima del jardín: se mantiene hasta que pasa el tiempo o las partidas, y casi siempre sale despejado.
{
  const { zenSky, zenSkyMatch, SKY_SPAN } = await import('../src/game/zen.js');
  localStorage.clear();
  const a = zenSky(0, () => 0.95);
  check(a === 'snow' && zenSky(1000, () => 0) === 'snow', 'clima zen: se mantiene');
  for (let i = 0; i < SKY_SPAN.matches; i++) zenSkyMatch();
  check(zenSky(2000, () => 0) === null, 'clima zen: cambia al agotar partidas');
  check(zenSky(SKY_SPAN.ms + 3000, () => 0.85) === 'fireflies', 'clima zen: cambia al pasar el tiempo');
}

// Poderes de jefe: la regeneración se cancela si lo golpean; el escudero no pasa de dos.
{
  const { bossPower } = await import('../src/game/boss-powers.js');
  const { makePiece } = await import('../src/game/generate.js');
  const board = { rows: 8, cols: 8, holes: new Set(), terrain: new Map(), portals: new Map() };
  const hydra = makePiece('boss-hydra', 'dark', 0, 3, { boss: 'hydra', h: 2, w: 2, hp: 2, maxHp: 4, royal: true });
  const m = { board, pieces: [hydra, makePiece('king', 'light', 7, 4, { royal: true })], eliminated: {}, bossTurns: 3 };
  bossPower(m, 'dark'); hydra.hp = 1; bossPower(m, 'dark');
  check(hydra.hp === 1, 'jefe: regeneración cancelada al golpearlo');
  m.bossTurns = 3; bossPower(m, 'dark'); bossPower(m, 'dark');
  check(hydra.hp === 2, 'jefe: regenera si no lo golpean');
  const rider = makePiece('boss-rider', 'dark', 0, 3, { boss: 'rider', h: 2, w: 1, hp: 2, maxHp: 2, royal: true });
  const r = { board, pieces: [rider], eliminated: {} };
  for (let i = 0; i < 40; i++) bossPower(r, 'dark');
  check(r.pieces.filter((p) => p.escortOf).length === 2, 'jefe: escudero tope dos');
}

// Jardín: la maceta se agrieta tras POT_LIFE flores y el mazo la arregla; mover pide descalzar con la pala;
// los arbustos brotan solos hasta su tope.
{
  const { blankZen, zenDig, zenMove, zenFix, zenSow, potCracked, zenBushes } = await import('../src/game/zen.js');
  const { POT_LIFE, BUSH_MS, BUSH_MAX } = await import('../src/data/garden.js');
  let z = { ...blankZen(), items: { shovel: true, glove: true }, seeds: { ...blankZen().seeds, romero: 3 } };
  z = { ...z, wear: { r0c0: POT_LIFE } };
  check(potCracked(z, 'r0c0') && zenSow(z, 'r0c0', 'romero') === z, 'jardín: en maceta agrietada no se siembra');
  check(!potCracked(zenFix(z, 'r0c0'), 'r0c0'), 'jardín: el mazo arregla la maceta');
  z = { ...z, dug: { r5c5: true } };
  check(zenMove(z, 'r0c0', 'r5c5', 0) === z, 'jardín: sin pala no se mueve');
  const moved = zenMove(zenDig(z, 'r0c0', 0), 'r0c0', 'r5c5', 0);
  check(moved.pots.r5c5 === null && moved.wear.r5c5 === POT_LIFE && !moved.loose.r0c0, 'jardín: se mueve con su desgaste');
  const grown = zenBushes({ ...blankZen(), size: 8, bushT: 0 }, BUSH_MS * 10, () => 0.5);
  check(Object.values(grown.tiles).filter((t) => t === 'bush').length === BUSH_MAX, 'jardín: brotan arbustos hasta el tope');
}

if (fails.length) { console.log('Regresiones:\n' + fails.join('\n')); process.exit(1); }
console.log('Regresiones OK: guardia, coronación, enroque, cartas, manos, ranuras, copias, maceta y clima del jardín');
